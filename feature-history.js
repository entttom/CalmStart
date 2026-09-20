'use strict';

(function() {
	function requestPermission() {
		if (!chrome.permissions || !chrome.permissions.request) return Promise.resolve(false);
		return new Promise(function(resolve) {
			chrome.permissions.request({ permissions: ['history'] }, function(granted) {
				if (chrome.runtime && chrome.runtime.lastError) {
					console.warn('History permission request failed:', chrome.runtime.lastError.message);
					resolve(false);
					return;
				}
				resolve(!!granted);
			});
		});
	}

	function containsPermission() {
		if (!chrome.permissions || !chrome.permissions.contains) return Promise.resolve(false);
		return new Promise(function(resolve) {
			chrome.permissions.contains({ permissions: ['history'] }, function(granted) {
				resolve(!!granted);
			});
		});
	}

	function getNodes(maxResults, callback) {
		containsPermission().then(function(granted) {
			if (!granted || !chrome.history || !chrome.history.search) {
				callback([]);
				return;
			}
			chrome.history.search({
				text: '',
				startTime: 0,
				maxResults: Math.max(1, Math.min(Number(maxResults) || 50, 200))
			}, function(items) {
				if (chrome.runtime && chrome.runtime.lastError) {
					console.warn('Could not read history:', chrome.runtime.lastError.message);
					callback([]);
					return;
				}
				callback((items || []).map(function(item) {
					return {
						id: 'history:' + item.id,
						title: item.title || item.url,
						url: item.url,
						tooltip: item.url
					};
				}));
			});
		});
	}

	window.HumbleHistory = {
		requestPermission: requestPermission,
		containsPermission: containsPermission,
		getNodes: getNodes
	};
})();
