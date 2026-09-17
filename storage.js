'use strict';

// Central storage facade for Humble New Tab Page.
//
// Phase 2 keeps localStorage as the physical backend, but routes all legacy
// getItem/setItem/removeItem calls through this facade. This lets us verify
// the abstraction without changing the extension's behavior or data format.
var HumbleStorage = (function() {
	var legacyStorage = window.localStorage;
	var storagePrototype = Object.getPrototypeOf(legacyStorage);
	var originalGetItem = storagePrototype.getItem;
	var originalSetItem = storagePrototype.setItem;
	var originalRemoveItem = storagePrototype.removeItem;
	var originalKey = storagePrototype.key;
	var adapterInstalled = false;

	function getItem(key) {
		return originalGetItem.call(legacyStorage, key);
	}

	function setItem(key, value) {
		originalSetItem.call(legacyStorage, key, value);
	}

	function removeItem(key) {
		originalRemoveItem.call(legacyStorage, key);
	}

	function hasItem(key) {
		return getItem(key) !== null;
	}

	function keys() {
		var result = [];
		for (var i = 0; i < legacyStorage.length; i++)
			result.push(originalKey.call(legacyStorage, i));
		return result;
	}

	function debugInfo() {
		return {
			backend: adapterInstalled ? 'HumbleStorage -> localStorage (legacy)' : 'localStorage (legacy)',
			syncEnabled: false,
			schemaVersion: 1,
			adapterInstalled: adapterInstalled
		};
	}

	function updateDevelopmentInfo() {
		var info = debugInfo();
		var backend = document.getElementById('dev_storage_backend');
		var sync = document.getElementById('dev_sync_status');
		if (backend)
			backend.value = info.backend;
		if (sync)
			sync.value = info.syncEnabled ? 'Enabled' : 'Not enabled yet';
	}

	function installLegacyAdapter(api) {
		if (adapterInstalled)
			return;

		// Keep the old synchronous Storage API intact for newtab.js while routing
		// its reads/writes through HumbleStorage. Other Storage instances such as
		// sessionStorage continue to use the browser's native implementation.
		storagePrototype.getItem = function(key) {
			return this === legacyStorage ? api.getItem(key) : originalGetItem.call(this, key);
		};
		storagePrototype.setItem = function(key, value) {
			return this === legacyStorage ? api.setItem(key, value) : originalSetItem.call(this, key, value);
		};
		storagePrototype.removeItem = function(key) {
			return this === legacyStorage ? api.removeItem(key) : originalRemoveItem.call(this, key);
		};
		adapterInstalled = true;
		updateDevelopmentInfo();
	}

	var api = Object.freeze({
		getItem: getItem,
		setItem: setItem,
		removeItem: removeItem,
		hasItem: hasItem,
		keys: keys,
		debugInfo: debugInfo
	});

	installLegacyAdapter(api);

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', updateDevelopmentInfo);
	else
		updateDevelopmentInfo();

	return api;
})();
