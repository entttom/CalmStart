'use strict';

(function(S) {
	var META_KEY = 'hntp.namedLayouts';
	var PROFILE_LAYOUT_PREFIX = 'hntp.layoutProfile.';
	var DEFAULT_ID = 'default';
	var metaEnvelope = null;
	var layouts = [{ id: DEFAULT_ID, name: 'Default', curated: false }];
	var uiInstalled = false;
	var initializationPromise = null;

	S.activeLayoutId = function() {
		return (S.meta && S.meta.activeLayoutId) || DEFAULT_ID;
	};

	function clone(value) {
		return S.clone ? S.clone(value) : JSON.parse(JSON.stringify(value));
	}

	function sanitizeLayouts(value) {
		var source = value && Array.isArray(value.layouts) ? value.layouts : [];
		var seen = {};
		var result = [];
		for (var i = 0; i < source.length; i++) {
			var item = source[i] || {};
			var id = String(item.id || '').trim();
			var name = String(item.name || '').trim();
			if (!id || !name || seen[id]) continue;
			seen[id] = true;
			result.push({ id: id, name: name, curated: !!item.curated });
		}
		if (!result.length) result.push({ id: DEFAULT_ID, name: 'Default', curated: false });
		return result;
	}

	function layoutExists(id) {
		for (var i = 0; i < layouts.length; i++)
			if (layouts[i].id === id) return true;
		return false;
	}

	function layoutName(id) {
		for (var i = 0; i < layouts.length; i++)
			if (layouts[i].id === id) return layouts[i].name;
		return id;
	}

	function nextMetaEnvelope(nextLayouts) {
		return {
			v: 1,
			revision: (metaEnvelope && Number(metaEnvelope.revision) || 0) + 1,
			updatedAt: S.now(),
			updatedBy: S.meta.deviceId,
			layouts: clone(nextLayouts)
		};
	}

	function persistMeta(nextLayouts) {
		layouts = sanitizeLayouts({ layouts: nextLayouts });
		metaEnvelope = nextMetaEnvelope(layouts);
		renderSwitcher();
		if (!S.syncArea) return Promise.resolve(false);
		var values = {};
		values[META_KEY] = metaEnvelope;
		return S.storageSet(S.syncArea, values);
	}

	function profileKey(layoutId, deviceId) {
		return PROFILE_LAYOUT_PREFIX + layoutId + '.' + deviceId;
	}

	function candidateLayoutId(key, candidate) {
		if (candidate && candidate.layoutId) return String(candidate.layoutId);
		if (key.indexOf(PROFILE_LAYOUT_PREFIX) === 0) {
			var rest = key.substring(PROFILE_LAYOUT_PREFIX.length);
			var dot = rest.indexOf('.');
			return dot < 0 ? rest : rest.substring(0, dot);
		}
		return DEFAULT_ID;
	}

	function candidatesFor(syncData, layoutId) {
		layoutId = layoutId || S.activeLayoutId();
		var result = [];
		Object.keys(syncData || {}).forEach(function(key) {
			var candidate = syncData[key];
			if (!candidate || !candidate.columns) return;
			if (key.indexOf(PROFILE_LAYOUT_PREFIX) === 0) {
				if (candidateLayoutId(key, candidate) === layoutId) result.push(candidate);
				return;
			}
			// Legacy single-layout candidates become the Default layout.
			if (layoutId === DEFAULT_ID && key.indexOf(S.LAYOUT_PREFIX) === 0)
				result.push(candidate);
		});
		return result;
	}

	S.layoutCandidates = function(syncData) {
		return candidatesFor(syncData, S.activeLayoutId());
	};

	S.chooseLayoutWinner = function(syncData) {
		var candidates = S.layoutCandidates(syncData);
		var winner = null;
		for (var i = 0; i < candidates.length; i++)
			if (!winner || S.compareVersioned(candidates[i], winner) > 0) winner = candidates[i];
		return winner;
	};

	function maxRevision(syncData, layoutId) {
		var candidates = candidatesFor(syncData, layoutId);
		var max = 0;
		for (var i = 0; i < candidates.length; i++)
			max = Math.max(max, Number(candidates[i].revision) || 0);
		return max;
	}

	S.maxLayoutRevision = function(syncData) {
		return maxRevision(syncData, S.activeLayoutId());
	};

	function makeCandidate(layoutId, portable, syncData) {
		return {
			v: S.SCHEMA_VERSION,
			layoutId: layoutId,
			revision: maxRevision(syncData, layoutId) + 1,
			updatedAt: S.now(),
			updatedBy: S.meta.deviceId,
			hash: portable.hash || S.layoutHash(portable.columns),
			columns: clone(portable.columns)
		};
	}

	function writeLayout(layoutId, portable) {
		if (!S.syncArea || !portable || !portable.columns || !portable.columns.length)
			return Promise.resolve(false);
		return S.storageGet(S.syncArea, null).then(function(syncData) {
			var candidate = makeCandidate(layoutId, portable, syncData);
			var values = {};
			values[profileKey(layoutId, S.meta.deviceId)] = candidate;
			return S.storageSet(S.syncArea, values).then(function(ok) {
				if (ok && layoutId === S.activeLayoutId()) {
					S.syncAvailable = true;
					S.meta.lastAppliedLayout = clone(candidate);
					S.meta.lastSyncAt = S.now();
					S.persistLocalSoon();
					S.updateDevelopmentInfo();
				}
				return ok ? candidate : false;
			});
		});
	}

	S.saveLayoutCandidate = function() {
		S.layoutSaveTimer = null;
		if (!S.syncArea || !S.layoutDirty || S.initializing) return Promise.resolve();
		S.layoutDirty = false;
		var current = S.currentPortableLayout();
		if (!current.columns.length) return Promise.resolve();
		return writeLayout(S.activeLayoutId(), current).then(function(candidate) {
			if (!candidate) S.syncAvailable = false;
			S.updateDevelopmentInfo();
		});
	};

	var originalApplyLayoutWinner = S.applyLayoutWinner;
	S.applyLayoutWinner = function(winner, reload, reason) {
		if (winner && winner.layoutId && winner.layoutId !== S.activeLayoutId()) return false;
		return originalApplyLayoutWinner(winner, reload, reason);
	};

	S.importPortableLayout = function(value) {
		try {
			var imported = JSON.parse(value);
			if (!imported || !Array.isArray(imported.columns)) return false;
			S.setResolvedColumns(S.resolvePortableLayout(imported.columns));
			S.layoutDirty = false;
			writeLayout(S.activeLayoutId(), {
				columns: clone(imported.columns),
				hash: S.layoutHash(imported.columns)
			});
			return true;
		} catch (error) {
			console.warn('Could not import portable Humble layout:', error);
			return false;
		}
	};

	S.restoreLastLayoutBackup = function() {
		var backups = S.meta.layoutBackups || [];
		if (!backups.length) return Promise.resolve(false);
		var backup = backups[backups.length - 1];
		S.setResolvedColumns(S.resolvePortableLayout(backup.columns));
		S.layoutDirty = false;
		if (!S.syncArea) {
			S.scheduleReload();
			return Promise.resolve(true);
		}
		return writeLayout(S.activeLayoutId(), {
			columns: clone(backup.columns),
			hash: backup.hash || S.layoutHash(backup.columns)
		}).then(function(candidate) {
			if (!candidate) return false;
			S.scheduleReload();
			return true;
		});
	};

	function flushActiveLayout() {
		if (S.layoutSaveTimer) {
			clearTimeout(S.layoutSaveTimer);
			S.layoutSaveTimer = null;
		}
		if (S.layoutDirty) return S.saveLayoutCandidate();
		var current = S.currentPortableLayout();
		if (!current.columns.length) return Promise.resolve();
		return writeLayout(S.activeLayoutId(), current);
	}

	function switchLayout(layoutId) {
		layoutId = String(layoutId || '');
		if (!layoutExists(layoutId) || layoutId === S.activeLayoutId()) return Promise.resolve(false);
		return flushActiveLayout().then(function() {
			S.meta.activeLayoutId = layoutId;
			S.meta.lastAppliedLayout = null;
			S.persistLocalSoon();
			window.location.reload();
			return true;
		});
	}

	function uniqueId() {
		if (window.crypto && typeof window.crypto.randomUUID === 'function')
			return 'layout-' + window.crypto.randomUUID();
		return 'layout-' + S.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
	}

	function createLayout() {
		var name = window.prompt('Name for the new layout:', 'New layout');
		if (name == null) return;
		name = name.trim();
		if (!name) return;
		var id = uniqueId();
		var current = S.currentPortableLayout();
		var next = layouts.concat([{ id: id, name: name, curated: false }]);
		Promise.all([
			persistMeta(next),
			writeLayout(id, current)
		]).then(function() {
			return switchLayout(id);
		});
	}

	function renameLayout() {
		var id = S.activeLayoutId();
		var oldName = layoutName(id);
		var name = window.prompt('Rename layout:', oldName);
		if (name == null) return;
		name = name.trim();
		if (!name || name === oldName) return;
		var next = layouts.map(function(item) {
			return item.id === id ? { id: item.id, name: name, curated: !!item.curated } : item;
		});
		persistMeta(next);
	}

	function deleteLayout() {
		if (layouts.length <= 1) {
			window.alert('At least one layout must remain.');
			return;
		}
		var id = S.activeLayoutId();
		if (!window.confirm('Delete layout "' + layoutName(id) + '"? Bookmarks themselves are not deleted.')) return;
		var next = layouts.filter(function(item) { return item.id !== id; });
		var target = next[0].id;
		persistMeta(next).then(function() {
			S.meta.activeLayoutId = target;
			S.meta.lastAppliedLayout = null;
			S.persistLocalSoon();
			window.location.reload();
		});
	}

	function currentLayoutRecord() {
		var id = S.activeLayoutId();
		for (var i = 0; i < layouts.length; i++)
			if (layouts[i].id === id) return layouts[i];
		return null;
	}

	function isCurated() {
		var item = currentLayoutRecord();
		return !!(item && item.curated);
	}

	function setCurated(value) {
		var id = S.activeLayoutId();
		var next = layouts.map(function(item) {
			return item.id === id ? { id: item.id, name: item.name, curated: !!value } : item;
		});
		return persistMeta(next).then(function() {
			var checkbox = document.getElementById('layout_curated');
			if (checkbox) checkbox.checked = !!value;
			if (!value && typeof window.loadColumns === 'function') window.loadColumns();
		});
	}

	function renderSwitcher() {
		if (!uiInstalled) return;
		var select = document.getElementById('layout_switcher_select');
		if (!select) return;
		while (select.firstChild) select.removeChild(select.firstChild);
		var active = S.activeLayoutId();
		for (var i = 0; i < layouts.length; i++) {
			var option = document.createElement('option');
			option.value = layouts[i].id;
			option.textContent = layouts[i].name;
			if (layouts[i].id === active) option.selected = true;
			select.appendChild(option);
		}
		var del = document.getElementById('layout_delete_button');
		if (del) del.disabled = layouts.length <= 1;
		var curated = document.getElementById('layout_curated');
		if (curated) curated.checked = isCurated();
	}

	function installUI() {
		if (uiInstalled) return;
		uiInstalled = true;

		var bar = document.createElement('div');
		bar.id = 'layout_switcher';

		var select = document.createElement('select');
		select.id = 'layout_switcher_select';
		select.title = 'Active layout';
		select.setAttribute('aria-label', 'Active layout');

		var add = document.createElement('button');
		add.id = 'layout_add_button';
		add.type = 'button';
		add.title = 'Create layout';
		add.setAttribute('aria-label', 'Create layout');
		add.textContent = '+';

		var rename = document.createElement('button');
		rename.id = 'layout_rename_button';
		rename.type = 'button';
		rename.title = 'Rename layout';
		rename.setAttribute('aria-label', 'Rename layout');
		rename.textContent = '✎';

		var undo = document.createElement('button');
		undo.id = 'layout_undo_button';
		undo.type = 'button';
		undo.title = 'Undo last layout change';
		undo.setAttribute('aria-label', 'Undo last layout change');
		undo.textContent = '↶';

		var del = document.createElement('button');
		del.id = 'layout_delete_button';
		del.type = 'button';
		del.title = 'Delete layout';
		del.setAttribute('aria-label', 'Delete layout');
		del.textContent = '−';

		bar.appendChild(select);
		bar.appendChild(add);
		bar.appendChild(rename);
		bar.appendChild(undo);
		bar.appendChild(del);
		document.body.appendChild(bar);

		var curated = document.getElementById('layout_curated');
		if (curated && !curated.dataset.bound) {
			curated.dataset.bound = '1';
			curated.onchange = function() { setCurated(curated.checked); };
		}

		select.onchange = function() {
			select.disabled = true;
			switchLayout(select.value);
		};
		add.onclick = createLayout;
		rename.onclick = renameLayout;
		undo.onclick = function() {
			if (window.HumbleUIControls) HumbleUIControls.undoLayout();
		};
		del.onclick = deleteLayout;
		renderSwitcher();
	}

	function applyRemoteMeta(incoming) {
		if (!incoming || !incoming.layouts) return;
		if (metaEnvelope && S.compareVersioned(incoming, metaEnvelope) < 0) return;
		metaEnvelope = clone(incoming);
		layouts = sanitizeLayouts(incoming);
		if (!layoutExists(S.activeLayoutId())) {
			S.meta.activeLayoutId = layouts[0].id;
			S.meta.lastAppliedLayout = null;
			S.persistLocalSoon();
			window.location.reload();
			return;
		}
		renderSwitcher();
	}

	function initialize() {
		if (initializationPromise) return initializationPromise;
		if (!S.meta.activeLayoutId) S.meta.activeLayoutId = DEFAULT_ID;
		if (!S.syncArea) {
			installUI();
			initializationPromise = Promise.resolve();
			return initializationPromise;
		}
		initializationPromise = S.storageGet(S.syncArea, META_KEY).then(function(data) {
			var incoming = data && data[META_KEY];
			if (incoming && incoming.layouts) {
				metaEnvelope = clone(incoming);
				layouts = sanitizeLayouts(incoming);
			} else {
				metaEnvelope = nextMetaEnvelope(layouts);
				var values = {};
				values[META_KEY] = metaEnvelope;
				S.storageSet(S.syncArea, values);
			}
			if (!layoutExists(S.activeLayoutId())) {
				S.meta.activeLayoutId = layouts[0].id;
				S.meta.lastAppliedLayout = null;
				S.persistLocalSoon();
			}
			installUI();
		});
		return initializationPromise;
	}

	if (chrome.storage && chrome.storage.onChanged) {
		chrome.storage.onChanged.addListener(function(changes, areaName) {
			if (areaName !== 'sync') return;
			if (changes[META_KEY] && changes[META_KEY].newValue)
				applyRemoteMeta(changes[META_KEY].newValue);
			var changedProfile = false;
			Object.keys(changes || {}).forEach(function(key) {
				if (key.indexOf(PROFILE_LAYOUT_PREFIX) !== 0) return;
				var incoming = changes[key] && changes[key].newValue;
				if (!incoming || incoming.updatedBy !== S.meta.deviceId)
					changedProfile = true;
			});
			if (changedProfile) S.scheduleRemoteLayoutRefresh();
		});
	}

	S.namedLayouts = {
		key: META_KEY,
		prefix: PROFILE_LAYOUT_PREFIX,
		list: function() { return clone(layouts); },
		activeId: S.activeLayoutId,
		switchTo: switchLayout,
		create: createLayout,
		renameActive: renameLayout,
		deleteActive: deleteLayout,
		initialize: initialize,
		writeLayout: writeLayout,
		isCurated: isCurated,
		setCurated: setCurated
	};

	window.HumbleNamedLayouts = S.namedLayouts;
})(HumbleSync);
