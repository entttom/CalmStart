'use strict';

(function() {
	var STORAGE_KEY = 'recent.dismissedSessions';
	var MAX_DISMISSED = 100;

	function readDismissed() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			var value = raw ? JSON.parse(raw) : [];
			return Array.isArray(value) ? value : [];
		} catch (error) {
			return [];
		}
	}

	function writeDismissed(items) {
		items = items.slice(-MAX_DISMISSED);
		if (!items.length) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	}

	function sessionKey(session) {
		if (!session) return null;
		if (session.window && session.window.sessionId) return 'window:' + session.window.sessionId;
		if (session.tab && session.tab.sessionId) return 'tab:' + session.tab.sessionId;
		var tab = session.tab || (session.window && session.window.tabs && session.window.tabs[0]);
		var seed = [
			tab && tab.url || '',
			tab && tab.title || '',
			session.lastModified || ''
		].join('|');
		return seed ? 'fallback:' + seed : null;
	}

	function isDismissed(key) {
		if (!key) return false;
		return readDismissed().indexOf(key) >= 0;
	}

	function dismiss(key) {
		if (!key) return;
		var items = readDismissed();
		if (items.indexOf(key) < 0) items.push(key);
		writeDismissed(items);
		if (typeof window.refreshClosed === 'function') window.refreshClosed();
	}

	function clearDismissed() {
		writeDismissed([]);
		if (typeof window.refreshClosed === 'function') window.refreshClosed();
	}

	function attach(node, anchor) {
		if (!node || !node.dismissRecentKey || !anchor) return;
		anchor.oncontextmenu = function(event) {
			renderMenu([
				{
					label: 'Hide from Recently closed',
					action: function() { dismiss(node.dismissRecentKey); }
				},
				{
					label: 'Restore hidden items',
					action: clearDismissed
				}
			], event.pageX, event.pageY);
			return false;
		};
	}

	window.HumbleRecentControls = {
		sessionKey: sessionKey,
		isDismissed: isDismissed,
		dismiss: dismiss,
		clearDismissed: clearDismissed,
		attach: attach
	};
})();
