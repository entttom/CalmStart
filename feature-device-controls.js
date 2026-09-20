'use strict';

(function() {
	var STORAGE_KEY = 'devices.hidden';

	function readHidden() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			var value = raw ? JSON.parse(raw) : [];
			return Array.isArray(value) ? value : [];
		} catch (error) {
			return [];
		}
	}

	function writeHidden(value) {
		value = Array.from(new Set(value || []));
		if (!value.length) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
	}

	function isHidden(name) {
		return readHidden().indexOf(String(name || '')) >= 0;
	}

	function hide(name) {
		name = String(name || '');
		if (!name) return;
		var hidden = readHidden();
		if (hidden.indexOf(name) < 0) hidden.push(name);
		writeHidden(hidden);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function restoreAll() {
		writeHidden([]);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function menuItems(node) {
		if (!node || !node.deviceName) return [];
		return [
			{
				label: 'Hide device',
				action: function() { hide(node.deviceName); }
			},
			{
				label: 'Restore hidden devices',
				action: restoreAll
			}
		];
	}

	window.HumbleDeviceControls = {
		readHidden: readHidden,
		isHidden: isHidden,
		hide: hide,
		restoreAll: restoreAll,
		menuItems: menuItems
	};
})();
