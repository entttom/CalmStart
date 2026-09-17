'use strict';

// Central storage facade for Humble New Tab Page.
//
// Phase 1 intentionally keeps the existing localStorage backend so the
// extension behaves exactly as before while storage access is prepared for
// migration to chrome.storage.local / chrome.storage.sync.
var HumbleStorage = (function() {
	var legacyStorage = window.localStorage;

	function getItem(key) {
		return legacyStorage.getItem(key);
	}

	function setItem(key, value) {
		legacyStorage.setItem(key, value);
	}

	function removeItem(key) {
		legacyStorage.removeItem(key);
	}

	function hasItem(key) {
		return getItem(key) !== null;
	}

	function keys() {
		var result = [];
		for (var i = 0; i < legacyStorage.length; i++)
			result.push(legacyStorage.key(i));
		return result;
	}

	function debugInfo() {
		return {
			backend: 'localStorage (legacy)',
			syncEnabled: false,
			schemaVersion: 1
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

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', updateDevelopmentInfo);
	else
		updateDevelopmentInfo();

	return Object.freeze({
		getItem: getItem,
		setItem: setItem,
		removeItem: removeItem,
		hasItem: hasItem,
		keys: keys,
		debugInfo: debugInfo
	});
})();
