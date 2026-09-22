'use strict';

(function(S) {
	S.addLayoutBackup = function(layout, reason) {
		if (!layout || !layout.columns) return;
		S.meta.layoutBackups = S.meta.layoutBackups || [];
		var hash = layout.hash || S.layoutHash(layout.columns);
		var latest = S.meta.layoutBackups.length ? S.meta.layoutBackups[S.meta.layoutBackups.length - 1] : null;
		if (latest && latest.hash === hash) return;
		S.meta.layoutBackups.push({
			savedAt: S.now(),
			reason: reason || 'sync',
			hash: hash,
			columns: S.clone(layout.columns)
		});
		while (S.meta.layoutBackups.length > S.MAX_LAYOUT_BACKUPS)
			S.meta.layoutBackups.shift();
		S.persistLocalSoon();
		S.updateDevelopmentInfo();
	};

	S.currentPortableLayout = function() {
		var columns = S.columnsFromValues(S.cache);
		var portable = S.portableLayoutFromColumns(columns);
		return { columns: portable, hash: S.layoutHash(portable) };
	};

	S.layoutCandidates = function(syncData) {
		var result = [];
		Object.keys(syncData || {}).forEach(function(key) {
			if (key.indexOf(S.LAYOUT_PREFIX) === 0) {
				var candidate = syncData[key];
				if (candidate && candidate.columns) result.push(candidate);
			}
		});
		return result;
	};
	S.chooseLayoutWinner = function(syncData) {
		var candidates = S.layoutCandidates(syncData), winner = null;
		for (var i = 0; i < candidates.length; i++)
			if (!winner || S.compareVersioned(candidates[i], winner) > 0) winner = candidates[i];
		return winner;
	};
	S.maxLayoutRevision = function(syncData) {
		var candidates = S.layoutCandidates(syncData), max = 0;
		for (var i = 0; i < candidates.length; i++)
			max = Math.max(max, Number(candidates[i].revision) || 0);
		return max;
	};

	S.scheduleReload = function() {
		if (S.reloadTimer) return;
		S.reloadTimer = setTimeout(function tryReload() {
			if (typeof window.dragIds !== 'undefined' && window.dragIds) {
				S.reloadTimer = setTimeout(tryReload, 250);
				return;
			}
			window.location.reload();
		}, 350);
	};

	S.applyOptionEnvelope = function(syncKey, envelope, reload) {
		var localKey = S.localOptionKeyForSyncKey(syncKey);
		if (!localKey) return false;
		var shadow = S.meta.optionShadow[syncKey];
		if (shadow && S.compareVersioned(envelope, shadow) < 0) return false;
		S.meta.optionShadow[syncKey] = S.clone(envelope);
		if (envelope.deleted) S.mirrorRemove(localKey);
		else S.mirrorSet(localKey, envelope.value);
		S.meta.lastSyncAt = S.now();
		S.persistLocalSoon();
		S.updateDevelopmentInfo();
		if (reload) S.scheduleReload();
		return true;
	};

	S.writeSyncOption = function(localKey, value, deleted) {
		var syncKey = S.syncKeyForLocalOption(localKey);
		if (!syncKey || !S.syncArea) return;
		var previous = S.meta.optionShadow[syncKey];
		var envelope = S.makeEnvelope(value, deleted, previous);
		S.meta.optionShadow[syncKey] = S.clone(envelope);
		S.meta.lastSyncAt = S.now();
		var values = {};
		values[syncKey] = envelope;
		S.storageSet(S.syncArea, values).then(function(ok) {
			S.syncAvailable = !!ok;
			S.updateDevelopmentInfo();
		});
		S.persistLocalSoon();
	};

	S.openFolderSyncEnabled = function() {
		return String(S.cache['options.sync_open_folders'] || '') === '1';
	};
	S.openFolderRefsFromCache = function() {
		var refs = [], seen = Object.create(null);
		Object.keys(S.cache).forEach(function(key) {
			if (!S.isOpenFolderKey(key) || !S.cache[key]) return;
			var id = key.substring('open.'.length);
			var ref = S.makePortableRef(id);
			if (!ref) return;
			var fingerprint = JSON.stringify(ref);
			if (!seen[fingerprint]) { seen[fingerprint] = true; refs.push(ref); }
		});
		return refs;
	};
	S.applyOpenFoldersEnvelope = function(envelope, reload) {
		if (!envelope || envelope.deleted || !Array.isArray(envelope.value)) return false;
		S.meta.openFoldersShadow = S.clone(envelope);
		Object.keys(S.cache).forEach(function(key) {
			if (!S.isOpenFolderKey(key)) return;
			S.mirrorRemove(key);
			delete S.localValues[key];
		});
		envelope.value.forEach(function(ref) {
			var id = S.resolvePortableRef(ref);
			if (!id) return;
			var key = 'open.' + id;
			S.mirrorSet(key, true);
			S.localValues[key] = 'true';
		});
		S.meta.lastSyncAt = S.now();
		S.persistLocalSoon();
		S.updateDevelopmentInfo();
		if (reload) S.scheduleReload();
		return true;
	};
	S.writeOpenFoldersState = function() {
		S.openFolderSaveTimer = null;
		if (!S.openFolderSyncEnabled() || !S.syncArea || S.initializing) return;
		var envelope = S.makeEnvelope(S.openFolderRefsFromCache(), false, S.meta.openFoldersShadow);
		S.meta.openFoldersShadow = S.clone(envelope);
		var values = {};
		values[S.OPEN_FOLDERS_KEY] = envelope;
		S.storageSet(S.syncArea, values).then(function(ok) {
			S.syncAvailable = !!ok;
			if (ok) S.meta.lastSyncAt = S.now();
			S.persistLocalSoon();
			S.updateDevelopmentInfo();
		});
	};
	S.scheduleOpenFoldersSave = function() {
		if (S.openFolderSaveTimer) clearTimeout(S.openFolderSaveTimer);
		S.openFolderSaveTimer = setTimeout(S.writeOpenFoldersState, 350);
	};
	S.enableOpenFolderSync = function() {
		if (!S.openFolderSyncEnabled()) return;
		S.scheduleOpenFoldersSave();
	};

	S.customStateSyncEnabled = function(descriptor) {
		return !!descriptor && String(S.cache[descriptor.optionKey] || '') === '1';
	};
	S.customStateDescriptors = function() {
		return [
			S.customStateDescriptor(S.FAVORITES_LOCAL_KEY),
			S.customStateDescriptor(S.RECENT_LINKS_LOCAL_KEY),
			S.customStateDescriptor(S.FOLDER_APPEARANCE_LOCAL_KEY),
			S.customStateDescriptor(S.PROFILES_LOCAL_KEY)
		];
	};
	S.parseCustomState = function(descriptor) {
		try { return JSON.parse(S.cache[descriptor.localKey] || ''); }
		catch (error) { return null; }
	};
	S.folderAppearanceForSync = function() {
		var local = S.parseCustomState(S.customStateDescriptor(S.FOLDER_APPEARANCE_LOCAL_KEY)) || {};
		var entries = [];
		Object.keys(local).forEach(function(id) {
			var appearance = local[id];
			var ref = S.makePortableRef(id);
			if (!ref || !appearance || typeof appearance !== 'object') return;
			entries.push({ ref: ref, icon: String(appearance.icon || '').slice(0, 12), color: String(appearance.color || '') });
		});
		return entries;
	};
	S.folderAppearanceFromSync = function(value) {
		var local = {};
		(value || []).forEach(function(entry) {
			var id = entry && S.resolvePortableRef(entry.ref);
			if (!id) return;
			local[id] = { icon: String(entry.icon || '').slice(0, 12), color: String(entry.color || '') };
		});
		return local;
	};
	S.customStateValueForSync = function(descriptor) {
		if (descriptor.name === 'folderAppearance') return S.folderAppearanceForSync();
		return S.parseCustomState(descriptor);
	};
	S.customStateValueFromSync = function(descriptor, value) {
		if (descriptor.name === 'folderAppearance') return S.folderAppearanceFromSync(value);
		return value;
	};
	S.applyCustomStateEnvelope = function(descriptor, envelope, reload) {
		if (!descriptor || !envelope) return false;
		var shadow = S.meta.stateShadows[descriptor.syncKey];
		if (shadow && S.compareVersioned(envelope, shadow) < 0) return false;
		S.meta.stateShadows[descriptor.syncKey] = S.clone(envelope);
		if (envelope.deleted) {
			S.mirrorRemove(descriptor.localKey);
			delete S.localValues[descriptor.localKey];
		} else {
			var localValue = S.customStateValueFromSync(descriptor, envelope.value);
			var fallback = descriptor.name === 'folderAppearance' || descriptor.name === 'profiles' ? {} : [];
			S.mirrorSet(descriptor.localKey, JSON.stringify(localValue == null ? fallback : localValue));
			S.localValues[descriptor.localKey] = S.cache[descriptor.localKey];
		}
		S.meta.lastSyncAt = S.now();
		S.persistLocalSoon();
		S.updateDevelopmentInfo();
		if (reload) S.scheduleReload();
		return true;
	};
	S.writeCustomState = function(descriptor, deleted) {
		if (!descriptor || !S.customStateSyncEnabled(descriptor) || !S.syncArea || S.initializing) return Promise.resolve(false);
		var previous = S.meta.stateShadows[descriptor.syncKey];
		var envelope = S.makeEnvelope(S.customStateValueForSync(descriptor), !!deleted, previous);
		S.meta.stateShadows[descriptor.syncKey] = S.clone(envelope);
		var values = {};
		values[descriptor.syncKey] = envelope;
		return S.storageSet(S.syncArea, values).then(function(ok) {
			S.syncAvailable = !!ok;
			if (ok) S.meta.lastSyncAt = S.now();
			S.persistLocalSoon();
			S.updateDevelopmentInfo();
			return ok;
		});
	};
	S.scheduleCustomStateSave = function(descriptor, deleted) {
		S.customStateSaveTimers = S.customStateSaveTimers || {};
		var pending = S.customStateSaveTimers[descriptor.name];
		if (pending) clearTimeout(pending.timer);
		S.customStateSaveTimers[descriptor.name] = {
			descriptor: descriptor,
			deleted: !!deleted,
			timer: setTimeout(function() {
				delete S.customStateSaveTimers[descriptor.name];
				S.writeCustomState(descriptor, deleted);
			}, 350)
		};
	};
	S.flushCustomStateSaves = function() {
		var pending = S.customStateSaveTimers || {};
		var work = Promise.resolve();
		Object.keys(pending).forEach(function(name) {
			var item = pending[name];
			clearTimeout(item.timer);
			delete pending[name];
			work = work.then(function() { return S.writeCustomState(item.descriptor, item.deleted); });
		});
		return work;
	};
	S.enableCustomStateSync = function(descriptor) {
		if (!descriptor || !S.customStateSyncEnabled(descriptor) || !S.syncArea) return Promise.resolve(false);
		return S.storageGet(S.syncArea, [descriptor.syncKey]).then(function(data) {
			var remote = data[descriptor.syncKey];
			var shadow = S.meta.stateShadows[descriptor.syncKey];
			if (remote && (!shadow || S.compareVersioned(remote, shadow) >= 0)) {
				S.applyCustomStateEnvelope(descriptor, remote, false);
				return true;
			}
			S.scheduleCustomStateSave(descriptor);
			return true;
		});
	};
	S.enableCustomStateSyncByOption = function(optionKey) {
		var descriptors = S.customStateDescriptors();
		for (var i = 0; i < descriptors.length; i++)
			if (descriptors[i].optionKey === optionKey) return S.enableCustomStateSync(descriptors[i]);
		return Promise.resolve(false);
	};
	S.applyInitialCustomStates = function(syncData) {
		S.customStateDescriptors().forEach(function(descriptor) {
			if (!S.customStateSyncEnabled(descriptor)) return;
			S.applyCustomStateEnvelope(descriptor, syncData[descriptor.syncKey], false);
		});
	};

	S.saveLayoutCandidate = function() {
		S.layoutSaveTimer = null;
		if (!S.syncArea || !S.layoutDirty || S.initializing) return Promise.resolve();
		S.layoutDirty = false;
		var current = S.currentPortableLayout();
		if (!current.columns.length) return Promise.resolve();
		return S.storageGet(S.syncArea, null).then(function(syncData) {
			var candidate = {
				v: S.SCHEMA_VERSION,
				revision: S.maxLayoutRevision(syncData) + 1,
				updatedAt: S.now(),
				updatedBy: S.meta.deviceId,
				hash: current.hash,
				columns: current.columns
			};
			var values = {};
			values[S.LAYOUT_PREFIX + S.meta.deviceId] = candidate;
			return S.storageSet(S.syncArea, values).then(function(ok) {
				if (ok) {
					S.syncAvailable = true;
					S.meta.lastAppliedLayout = S.clone(candidate);
					S.meta.lastSyncAt = S.now();
					S.persistLocalSoon();
				} else S.syncAvailable = false;
				S.updateDevelopmentInfo();
			});
		});
	};
	S.scheduleLayoutSave = function() {
		S.layoutDirty = true;
		if (S.layoutSaveTimer) clearTimeout(S.layoutSaveTimer);
		S.layoutSaveTimer = setTimeout(S.saveLayoutCandidate, S.LAYOUT_SAVE_DELAY);
	};

	S.applyLayoutWinner = function(winner, reload, reason) {
		if (!winner || !winner.columns) return false;
		var current = S.currentPortableLayout();
		var winnerHash = winner.hash || S.layoutHash(winner.columns);
		if (current.hash === winnerHash) {
			S.meta.lastAppliedLayout = S.clone(winner);
			S.meta.lastSyncAt = S.now();
			S.persistLocalSoon();
			S.updateDevelopmentInfo();
			return false;
		}
		if (current.columns.length) S.addLayoutBackup(current, reason || 'remote layout');
		if (S.meta.lastAppliedLayout && S.meta.lastAppliedLayout.updatedBy === S.meta.deviceId &&
			winner.updatedBy !== S.meta.deviceId &&
			Math.abs((Number(winner.updatedAt) || 0) - (Number(S.meta.lastAppliedLayout.updatedAt) || 0)) < 120000)
			S.meta.conflictCount = (Number(S.meta.conflictCount) || 0) + 1;
		S.setResolvedColumns(S.resolvePortableLayout(winner.columns));
		S.meta.lastAppliedLayout = S.clone(winner);
		S.meta.lastSyncAt = S.now();
		S.persistLocalSoon();
		S.updateDevelopmentInfo();
		if (reload) S.scheduleReload();
		return true;
	};

	S.refreshRemoteLayout = function() {
		S.remoteRefreshTimer = null;
		if (!S.syncArea) return;
		if (S.layoutDirty || S.layoutSaveTimer) {
			S.remoteRefreshTimer = setTimeout(S.refreshRemoteLayout, S.LAYOUT_SAVE_DELAY + 100);
			return;
		}
		S.storageGet(S.syncArea, null).then(function(syncData) {
			var winner = S.chooseLayoutWinner(syncData);
			if (!winner) return;
			var currentApplied = S.meta.lastAppliedLayout;
			if (!currentApplied || S.compareVersioned(winner, currentApplied) > 0 || winner.hash !== currentApplied.hash)
				S.applyLayoutWinner(winner, S.initialized, 'remote layout');
		});
	};
	S.scheduleRemoteLayoutRefresh = function() {
		if (S.remoteRefreshTimer) clearTimeout(S.remoteRefreshTimer);
		S.remoteRefreshTimer = setTimeout(S.refreshRemoteLayout, S.REMOTE_REFRESH_DELAY);
	};

	S.importPortableLayout = function(value) {
		try {
			var imported = JSON.parse(value);
			if (!imported || !Array.isArray(imported.columns)) return false;
			S.setResolvedColumns(S.resolvePortableLayout(imported.columns));
			S.layoutDirty = false;
			if (S.syncArea) {
				S.storageGet(S.syncArea, null).then(function(syncData) {
					var candidate = {
						v: S.SCHEMA_VERSION,
						revision: S.maxLayoutRevision(syncData) + 1,
						updatedAt: S.now(),
						updatedBy: S.meta.deviceId,
						hash: S.layoutHash(imported.columns),
						columns: S.clone(imported.columns)
					};
					var values = {};
					values[S.LAYOUT_PREFIX + S.meta.deviceId] = candidate;
					S.storageSet(S.syncArea, values).then(function(ok) {
						if (ok) {
							S.syncAvailable = true;
							S.meta.lastAppliedLayout = S.clone(candidate);
							S.meta.lastSyncAt = S.now();
							S.persistLocalSoon();
							S.updateDevelopmentInfo();
						}
					});
				});
			}
			return true;
		} catch (error) {
			console.warn('Could not import portable Humble layout:', error);
			return false;
		}
	};

	S.listenForRemoteChanges = function() {
		if (!chrome.storage || !chrome.storage.onChanged) return;
		chrome.storage.onChanged.addListener(function(changes, areaName) {
			if (areaName !== 'sync') return;
			Object.keys(changes).forEach(function(syncKey) {
				var change = changes[syncKey];
				var customState = S.customStateDescriptorForSyncKey(syncKey);
				if (customState) {
					var incomingState = change.newValue;
					if (incomingState && incomingState.updatedBy !== S.meta.deviceId && S.customStateSyncEnabled(customState))
						S.applyCustomStateEnvelope(customState, incomingState, true);
					return;
				}
				if (syncKey === S.OPEN_FOLDERS_KEY) {
					var incomingFolders = change.newValue;
					if (incomingFolders && incomingFolders.updatedBy !== S.meta.deviceId && S.openFolderSyncEnabled())
						S.applyOpenFoldersEnvelope(incomingFolders, true);
					return;
				}
				if (syncKey.indexOf(S.LAYOUT_PREFIX) === 0) {
					var incomingLayout = change.newValue;
					if (!incomingLayout || incomingLayout.updatedBy !== S.meta.deviceId)
						S.scheduleRemoteLayoutRefresh();
					return;
				}
				if (syncKey.indexOf(S.OPTION_PREFIX) === 0 || syncKey.indexOf(S.ROOT_VISIBILITY_PREFIX) === 0) {
					var incoming = change.newValue;
					if (!incoming) {
						var localKey = S.localOptionKeyForSyncKey(syncKey);
						if (localKey) {
							delete S.meta.optionShadow[syncKey];
							S.mirrorRemove(localKey);
							S.persistLocalSoon();
							S.scheduleReload();
						}
						return;
					}
					if (incoming.updatedBy === S.meta.deviceId) return;
					var shadow = S.meta.optionShadow[syncKey];
					if (shadow && S.compareVersioned(incoming, shadow) < 0) {
						var repair = {};
						repair[syncKey] = shadow;
						S.storageSet(S.syncArea, repair);
						return;
					}
					S.applyOptionEnvelope(syncKey, incoming, true);
				}
			});
		});
	};

	S.restoreLastLayoutBackup = function() {
		var backups = S.meta.layoutBackups || [];
		if (!backups.length) return Promise.resolve(false);
		var backup = backups[backups.length - 1];
		S.setResolvedColumns(S.resolvePortableLayout(backup.columns));
		S.layoutDirty = false;
		if (!S.syncArea) { S.scheduleReload(); return Promise.resolve(true); }
		return S.storageGet(S.syncArea, null).then(function(syncData) {
			var candidate = {
				v: S.SCHEMA_VERSION,
				revision: S.maxLayoutRevision(syncData) + 1,
				updatedAt: S.now(),
				updatedBy: S.meta.deviceId,
				hash: backup.hash || S.layoutHash(backup.columns),
				columns: S.clone(backup.columns)
			};
			var values = {};
			values[S.LAYOUT_PREFIX + S.meta.deviceId] = candidate;
			return S.storageSet(S.syncArea, values).then(function(ok) {
				if (!ok) return false;
				S.syncAvailable = true;
				S.meta.lastAppliedLayout = S.clone(candidate);
				S.meta.lastSyncAt = S.now();
				S.persistLocalSoon();
				S.updateDevelopmentInfo();
				S.scheduleReload();
				return true;
			});
		});
	};
})(HumbleSync);
