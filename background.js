'use strict';

(function() {
	var DIRTY_KEY = 'hntp.bookmarkIndexDirty';

	function markDirty() {
		var values = {};
		values[DIRTY_KEY] = true;
		chrome.storage.local.set(values);
	}

	if (chrome.runtime && chrome.runtime.onInstalled)
		chrome.runtime.onInstalled.addListener(markDirty);

	if (chrome.bookmarks) {
		['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered', 'onImportBegan', 'onImportEnded'].forEach(function(name) {
			var event = chrome.bookmarks[name];
			if (event && event.addListener) event.addListener(markDirty);
		});
	}
})();
