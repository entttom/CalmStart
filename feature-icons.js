'use strict';

(function(S) {
	var STORAGE_KEY = 'options.custom_folder_icons';
	var OVERRIDES_KEY = 'options.favicon_overrides';
	var CACHE_ENABLED_KEY = 'options.cache_favicons';
	var CACHE_KEY = S.PREFIX + 'faviconCache';
	var CACHE_LIMIT = 200;
	var CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
	var faviconCache = Object.create(null);
	var cacheLoaded = false;
	var pendingCache = Object.create(null);

	function readMappings() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			var value = raw ? JSON.parse(raw) : [];
			return Array.isArray(value) ? value : [];
		} catch (error) {
			console.warn('Could not read custom folder icons:', error);
			return [];
		}
	}

	function writeMappings(mappings) {
		if (!mappings.length) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
	}

	function resolvedId(entry) {
		if (!entry || !entry.ref || !S.resolvePortableRef) return null;
		return S.resolvePortableRef(entry.ref);
	}

	function mappingFor(node) {
		if (!node || node.url || !/^\d+$/.test(String(node.id || ''))) return null;
		var mappings = readMappings();
		for (var i = 0; i < mappings.length; i++) {
			if (String(resolvedId(mappings[i]) || '') === String(node.id))
				return mappings[i];
		}
		return null;
	}

	function customIconElement(node) {
		var mapping = mappingFor(node);
		if (!mapping || !mapping.icon) return null;
		var icon = document.createElement('div');
		icon.className = 'icon custom-folder-icon';
		icon.textContent = mapping.icon;
		icon.title = 'Custom folder icon';
		return icon;
	}

	function setFolderIcon(node) {
		if (!node || !S.makePortableRef) return;
		var ref = S.makePortableRef(String(node.id));
		if (!ref) return;

		var existing = mappingFor(node);
		var value = window.prompt('Folder icon (emoji or short text). Leave empty to reset:', existing ? existing.icon : '📁');
		if (value == null) return;
		value = value.trim().slice(0, 4);

		var mappings = readMappings().filter(function(entry) {
			return String(resolvedId(entry) || '') !== String(node.id);
		});
		if (value) mappings.push({ ref: ref, icon: value });
		writeMappings(mappings);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function resetFolderIcon(node) {
		var mappings = readMappings().filter(function(entry) {
			return String(resolvedId(entry) || '') !== String(node.id);
		});
		writeMappings(mappings);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function folderMenuItems(node) {
		if (!node || node.url || !/^\d+$/.test(String(node.id || ''))) return [];
		var items = [
			{ label: 'Set folder icon…', action: function() { setFolderIcon(node); } }
		];
		if (mappingFor(node))
			items.push({ label: 'Reset folder icon', action: function() { resetFolderIcon(node); } });
		return items;
	}

	function parseOverrides(raw) {
		raw = raw == null || raw === '' ? '{}' : String(raw);
		var value;
		try { value = JSON.parse(raw); }
		catch (error) { return { ok: false, error: 'Invalid JSON: ' + error.message }; }

		if (!value || Array.isArray(value) || typeof value !== 'object')
			return { ok: false, error: 'Favicon overrides must be a JSON object.' };

		var clean = {};
		var keys = Object.keys(value);
		for (var i = 0; i < keys.length; i++) {
			var domain = String(keys[i] || '').trim().toLowerCase();
			var icon = value[keys[i]];
			if (!domain || typeof icon !== 'string' || !icon.trim())
				return { ok: false, error: 'Each entry needs a non-empty domain and icon string.' };
			domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
			if (!/^[a-z0-9.-]+$/i.test(domain))
				return { ok: false, error: 'Invalid domain: ' + keys[i] };
			clean[domain] = icon.trim();
		}
		return { ok: true, value: clean };
	}

	function overrides() {
		var parsed = parseOverrides(localStorage.getItem(OVERRIDES_KEY));
		return parsed.ok ? parsed.value : {};
	}

	function overrideForUrl(url) {
		if (!url) return null;
		var hostname;
		try { hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, ''); }
		catch (error) { return null; }
		var map = overrides();
		var keys = Object.keys(map);
		for (var i = 0; i < keys.length; i++) {
			var domain = keys[i];
			if (hostname === domain || hostname.endsWith('.' + domain))
				return map[domain];
		}
		return null;
	}

	function cacheEnabled() {
		var raw = localStorage.getItem(CACHE_ENABLED_KEY);
		return raw == null ? true : Number(raw) !== 0;
	}

	function cacheKey(url, size) {
		var host;
		try { host = new URL(url).hostname.toLowerCase(); }
		catch (error) { host = String(url || ''); }
		return host + '|' + String(size || 32);
	}

	function pruneCache() {
		var now = Date.now();
		var keys = Object.keys(faviconCache);
		keys.forEach(function(key) {
			var entry = faviconCache[key];
			if (!entry || !entry.data || now - Number(entry.savedAt || 0) > CACHE_MAX_AGE)
				delete faviconCache[key];
		});
		keys = Object.keys(faviconCache);
		if (keys.length <= CACHE_LIMIT) return;
		keys.sort(function(a, b) {
			return Number(faviconCache[a].usedAt || 0) - Number(faviconCache[b].usedAt || 0);
		});
		while (keys.length > CACHE_LIMIT) delete faviconCache[keys.shift()];
	}

	function persistCache() {
		if (!S.localArea) return;
		pruneCache();
		var values = {};
		values[CACHE_KEY] = faviconCache;
		S.storageSet(S.localArea, values);
	}

	function loadCache() {
		if (cacheLoaded || !S.localArea) return Promise.resolve();
		return S.storageGet(S.localArea, CACHE_KEY).then(function(data) {
			faviconCache = Object.assign(Object.create(null), data[CACHE_KEY] || {});
			pruneCache();
			cacheLoaded = true;
		});
	}

	function blobToDataUrl(blob) {
		return new Promise(function(resolve, reject) {
			var reader = new FileReader();
			reader.onload = function() { resolve(reader.result); };
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}

	function scheduleCache(url, size) {
		if (!cacheEnabled() || !url || !cacheLoaded) return;
		var key = cacheKey(url, size);
		if (faviconCache[key] || pendingCache[key]) return;
		pendingCache[key] = true;

		var source = '/_favicon/?pageUrl=' + encodeURIComponent(url) + '&size=' + size;
		fetch(source).then(function(response) {
			if (!response.ok) throw new Error('HTTP ' + response.status);
			return response.blob();
		}).then(function(blob) {
			if (!blob || !blob.size) throw new Error('empty favicon');
			return blobToDataUrl(blob);
		}).then(function(dataUrl) {
			faviconCache[key] = {
				data: dataUrl,
				savedAt: Date.now(),
				usedAt: Date.now()
			};
			persistCache();
		}).catch(function() {
			// The browser favicon endpoint may not be fetchable on every Chromium
			// derivative. Rendering still works via the direct browser URL.
		}).then(function() {
			delete pendingCache[key];
		});
	}

	function webIconUrl(url, size) {
		var override = overrideForUrl(url);
		if (override) return override;

		var key = cacheKey(url, size);
		var cached = faviconCache[key];
		if (cacheEnabled() && cached && cached.data) {
			cached.usedAt = Date.now();
			return cached.data;
		}

		scheduleCache(url, size);
		return '/_favicon/?pageUrl=' + encodeURIComponent(url) + '&size=' + size;
	}

	function clearFaviconCache() {
		faviconCache = Object.create(null);
		if (!S.localArea) return Promise.resolve(false);
		var values = {};
		values[CACHE_KEY] = {};
		return S.storageSet(S.localArea, values);
	}

	loadCache();

	window.HumbleIconSettings = {
		customIconElement: customIconElement,
		setFolderIcon: setFolderIcon,
		resetFolderIcon: resetFolderIcon,
		folderMenuItems: folderMenuItems,
		readMappings: readMappings,
		parseOverrides: parseOverrides,
		overrideForUrl: overrideForUrl,
		webIconUrl: webIconUrl,
		clearFaviconCache: clearFaviconCache,
		loadCache: loadCache
	};
})(HumbleSync);
