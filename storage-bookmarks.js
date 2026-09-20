'use strict';

(function(S) {
	S.BOOKMARK_INDEX_KEY = S.PREFIX + 'bookmarkIndexV1';
	S.BOOKMARK_INDEX_DIRTY_KEY = S.PREFIX + 'bookmarkIndexDirty';

	S.folderFingerprint = function(node) {
		if (!node || !node.children) return null;
		var tokens = [];
		for (var i = 0; i < node.children.length; i++) {
			var child = node.children[i];
			if (child.url) tokens.push('U|' + child.url + '|' + (child.title || ''));
			else tokens.push('F|' + (child.title || ''));
		}
		tokens.sort();
		return S.hashString(tokens.join('\n'));
	};

	S.getBookmarkTree = function() {
		return new Promise(function(resolve) {
			try {
				chrome.bookmarks.getTree(function(result) {
					if (chrome.runtime && chrome.runtime.lastError) {
						console.warn('Could not read bookmarks:', chrome.runtime.lastError.message);
						resolve([]);
						return;
					}
					resolve(result || []);
				});
			} catch (error) {
				console.warn('Could not read bookmarks:', error);
				resolve([]);
			}
		});
	};

	S.bookmarkPathKey = function(rootIndex, path) {
		var compact = (path || []).map(function(segment) {
			return [segment.title || '', Number(segment.occurrence) || 0];
		});
		return String(rootIndex) + '|' + JSON.stringify(compact);
	};

	S.buildBookmarkIndex = function(tree) {
		var index = {
			root: tree && tree[0] ? tree[0] : null,
			roots: [],
			byId: Object.create(null),
			byPathKey: Object.create(null),
			folderEntries: [],
			rootIdToIndex: Object.create(null),
			rootIndexToId: Object.create(null),
			builtAt: S.now(),
			source: 'live'
		};
		if (!index.root) return index;
		index.roots = index.root.children || [];

		function walk(node, rootIndex, path) {
			if (!node || node.url) return;
			var entry = {
				node: node,
				id: String(node.id),
				title: node.title || '',
				childCount: (node.children || []).length,
				rootIndex: rootIndex,
				path: path.slice(0),
				fingerprint: S.folderFingerprint(node)
			};
			index.byId[entry.id] = entry;
			index.byPathKey[S.bookmarkPathKey(rootIndex, path)] = entry.id;
			index.folderEntries.push(entry);

			var children = node.children || [];
			var titleCounts = Object.create(null);
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child.url) continue;
				var title = child.title || '';
				var occurrence = titleCounts[title] || 0;
				titleCounts[title] = occurrence + 1;
				walk(child, rootIndex, path.concat([{ title: title, occurrence: occurrence }]));
			}
		}

		for (var i = 0; i < index.roots.length; i++) {
			var root = index.roots[i];
			index.rootIdToIndex[String(root.id)] = i;
			index.rootIndexToId[String(i)] = String(root.id);
			walk(root, i, []);
		}
		return index;
	};

	S.serializeBookmarkIndex = function(index) {
		if (!index) return null;
		return {
			v: 1,
			builtAt: index.builtAt || S.now(),
			roots: (index.roots || []).map(function(root) {
				return { id: String(root.id), title: root.title || '' };
			}),
			entries: (index.folderEntries || []).map(function(entry) {
				return {
					id: String(entry.id || (entry.node && entry.node.id) || ''),
					title: entry.title != null ? entry.title : ((entry.node && entry.node.title) || ''),
					childCount: Number(entry.childCount != null ? entry.childCount : ((entry.node && entry.node.children || []).length)) || 0,
					rootIndex: Number(entry.rootIndex) || 0,
					path: S.clone(entry.path || []),
					fingerprint: entry.fingerprint || null
				};
			})
		};
	};

	S.hydrateBookmarkIndex = function(serialized) {
		if (!serialized || serialized.v !== 1 || !Array.isArray(serialized.roots) || !Array.isArray(serialized.entries))
			return null;

		var index = {
			root: null,
			roots: serialized.roots.map(function(root) {
				return { id: String(root.id), title: root.title || '' };
			}),
			byId: Object.create(null),
			byPathKey: Object.create(null),
			folderEntries: [],
			rootIdToIndex: Object.create(null),
			rootIndexToId: Object.create(null),
			builtAt: Number(serialized.builtAt) || 0,
			source: 'cache'
		};

		for (var r = 0; r < index.roots.length; r++) {
			index.rootIdToIndex[String(index.roots[r].id)] = r;
			index.rootIndexToId[String(r)] = String(index.roots[r].id);
		}

		for (var i = 0; i < serialized.entries.length; i++) {
			var raw = serialized.entries[i] || {};
			if (!raw.id) continue;
			var entry = {
				node: { id: String(raw.id), title: raw.title || '' },
				id: String(raw.id),
				title: raw.title || '',
				childCount: Number(raw.childCount) || 0,
				rootIndex: Number(raw.rootIndex) || 0,
				path: S.clone(raw.path || []),
				fingerprint: raw.fingerprint || null
			};
			index.byId[entry.id] = entry;
			index.byPathKey[S.bookmarkPathKey(entry.rootIndex, entry.path)] = entry.id;
			index.folderEntries.push(entry);
		}
		return index;
	};

	S.persistBookmarkIndex = function(index) {
		if (!S.localArea || !index) return Promise.resolve(false);
		var values = {};
		values[S.BOOKMARK_INDEX_KEY] = S.serializeBookmarkIndex(index);
		values[S.BOOKMARK_INDEX_DIRTY_KEY] = false;
		return S.storageSet(S.localArea, values);
	};

	S.refreshBookmarkIndex = function() {
		if (S.bookmarkIndexRefreshPromise) return S.bookmarkIndexRefreshPromise;
		S.bookmarkIndexRefreshPromise = S.getBookmarkTree().then(function(tree) {
			var index = S.buildBookmarkIndex(tree || []);
			if (index.folderEntries.length || index.roots.length) {
				S.bookmarkIndex = index;
				return S.persistBookmarkIndex(index).then(function() { return index; });
			}
			return index;
		}).then(function(index) {
			S.bookmarkIndexRefreshPromise = null;
			return index;
		}, function(error) {
			S.bookmarkIndexRefreshPromise = null;
			throw error;
		});
		return S.bookmarkIndexRefreshPromise;
	};

	S.ensureBookmarkIndex = function(localData) {
		localData = localData || {};
		var dirty = !!localData[S.BOOKMARK_INDEX_DIRTY_KEY];
		var cached = !dirty ? S.hydrateBookmarkIndex(localData[S.BOOKMARK_INDEX_KEY]) : null;
		if (cached) {
			S.bookmarkIndex = cached;
			return Promise.resolve(cached);
		}
		return S.refreshBookmarkIndex();
	};

	S.scheduleBookmarkIndexRefresh = function() {
		if (S.bookmarkIndexRefreshTimer) clearTimeout(S.bookmarkIndexRefreshTimer);
		S.bookmarkIndexRefreshTimer = setTimeout(function() {
			S.bookmarkIndexRefreshTimer = null;
			S.refreshBookmarkIndex();
		}, 250);
	};

	S.installBookmarkIndexListeners = function() {
		if (S.bookmarkIndexListenersInstalled || !chrome.bookmarks) return;
		S.bookmarkIndexListenersInstalled = true;
		['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered', 'onImportEnded'].forEach(function(name) {
			var event = chrome.bookmarks[name];
			if (event && event.addListener) event.addListener(S.scheduleBookmarkIndexRefresh);
		});
	};

	S.PLACEMENT_PREFIX = 'dup:';
	S.parsePlacementId = function(id) {
		id = String(id || '');
		if (id.indexOf(S.PLACEMENT_PREFIX) !== 0) return null;
		var rest = id.substring(S.PLACEMENT_PREFIX.length);
		var split = rest.indexOf(':');
		if (split < 1) return null;
		return { token: rest.substring(0, split), id: rest.substring(split + 1) };
	};
	S.makePlacementId = function(id, token) {
		token = token || S.hashString(String(S.now()) + Math.random());
		return S.PLACEMENT_PREFIX + token + ':' + String(id);
	};

	S.makePortableRef = function(id) {
		id = String(id);
		var placement = S.parsePlacementId(id);
		if (placement) {
			var target = S.makePortableRef(placement.id);
			return target ? { kind: 'placement', placement: placement.token, target: target } : null;
		}
		if (S.SPECIAL_IDS.indexOf(id) >= 0) return { kind: 'special', id: id };
		var entry = S.bookmarkIndex && S.bookmarkIndex.byId[id];
		if (!entry) return null;
		var root = S.bookmarkIndex.roots[entry.rootIndex];
		return {
			kind: 'bookmark',
			rootIndex: entry.rootIndex,
			rootTitle: root ? (root.title || '') : '',
			path: S.clone(entry.path),
			title: entry.title || (entry.node && entry.node.title) || '',
			childCount: Number(entry.childCount) || 0,
			fingerprint: entry.fingerprint
		};
	};

	S.resolvePortableRef = function(ref) {
		if (!ref) return null;
		if (ref.kind === 'placement') {
			var targetId = S.resolvePortableRef(ref.target);
			return targetId ? S.makePlacementId(targetId, ref.placement) : null;
		}
		if (ref.kind === 'special' && S.SPECIAL_IDS.indexOf(ref.id) >= 0) return ref.id;
		if (ref.kind !== 'bookmark' || !S.bookmarkIndex) return null;

		var rootIndex = Number(ref.rootIndex) || 0;
		var root = S.bookmarkIndex.roots[rootIndex];
		if ((!root || (ref.rootTitle && (root.title || '') !== ref.rootTitle)) && ref.rootTitle) {
			for (var r = 0; r < S.bookmarkIndex.roots.length; r++) {
				if ((S.bookmarkIndex.roots[r].title || '') === ref.rootTitle) {
					root = S.bookmarkIndex.roots[r];
					rootIndex = r;
					break;
				}
			}
		}

		var direct = S.bookmarkIndex.byPathKey[S.bookmarkPathKey(rootIndex, ref.path || [])];
		if (direct) return String(direct);

		// Fallback for renamed/restructured non-empty folders: compare a stable
		// fingerprint of immediate contents, then prefer the old title/root. Empty
		// folders deliberately skip this fallback so they cannot resolve to an
		// unrelated empty folder after a rename.
		var candidates = [];
		if (ref.fingerprint && Number(ref.childCount) > 0) {
			for (var i = 0; i < S.bookmarkIndex.folderEntries.length; i++) {
				var entry = S.bookmarkIndex.folderEntries[i];
				if (entry.fingerprint === ref.fingerprint)
					candidates.push(entry);
			}
		}
		if (candidates.length > 1 && ref.title) {
			var titled = candidates.filter(function(entry) {
				return (entry.title || (entry.node && entry.node.title) || '') === ref.title;
			});
			if (titled.length) candidates = titled;
		}
		if (candidates.length > 1) {
			var sameRoot = candidates.filter(function(entry) {
				return entry.rootIndex === Number(ref.rootIndex);
			});
			if (sameRoot.length) candidates = sameRoot;
		}
		return candidates.length ? String(candidates[0].id || (candidates[0].node && candidates[0].node.id)) : null;
	};

	S.columnsFromValues = function(values) {
		var result = [];
		for (var x = 0; ; x++) {
			var row = [];
			for (var y = 0; ; y++) {
				var value = values['column.' + x + '.' + y];
				if (value != null && value !== '') row.push(String(value));
				else break;
			}
			if (row.length) result.push(row);
			else break;
		}
		return result;
	};

	S.portableLayoutFromColumns = function(columns) {
		var portable = [];
		for (var x = 0; x < columns.length; x++) {
			var row = [];
			for (var y = 0; y < columns[x].length; y++) {
				var ref = S.makePortableRef(columns[x][y]);
				if (ref) row.push(ref);
			}
			if (row.length) portable.push(row);
		}
		return portable;
	};

	S.resolvePortableLayout = function(columns) {
		var resolved = [];
		columns = columns || [];
		for (var x = 0; x < columns.length; x++) {
			var row = [];
			for (var y = 0; y < columns[x].length; y++) {
				var id = S.resolvePortableRef(columns[x][y]);
				if (id) row.push(id);
			}
			if (row.length) resolved.push(row);
		}
		return resolved;
	};

	S.layoutHash = function(columns) {
		return S.hashString(JSON.stringify(columns || []));
	};
})(HumbleSync);
