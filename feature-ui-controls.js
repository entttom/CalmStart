'use strict';

(function() {
	var BACKGROUND_ONLY_KEY = 'ui.backgroundOnly';

	function backgroundOnlyEnabled() {
		return localStorage.getItem(BACKGROUND_ONLY_KEY) === '1';
	}

	function applyBackgroundOnly(value) {
		document.body.classList.toggle('background-only', !!value);
		var button = document.getElementById('background_only_button');
		if (button) {
			button.classList.toggle('active', !!value);
			button.title = value ? 'Show Humble content' : 'Show background only';
			button.setAttribute('aria-label', button.title);
		}
	}

	function toggleBackgroundOnly() {
		var next = !backgroundOnlyEnabled();
		if (next) localStorage.setItem(BACKGROUND_ONLY_KEY, '1');
		else localStorage.removeItem(BACKGROUND_ONLY_KEY);
		applyBackgroundOnly(next);
	}

	function resetSettings() {
		if (!window.confirm('Reset Humble settings to defaults? Layouts and bookmarks will be kept.')) return;
		var keys = [];
		if (window.config) keys = Object.keys(window.config).map(function(key) { return 'options.' + key; });
		// Feature settings that are not part of the legacy config object.
		['options.custom_folder_icons'].forEach(function(key) {
			if (keys.indexOf(key) < 0) keys.push(key);
		});
		for (var i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
		window.location.reload();
	}

	function resetCurrentLayout() {
		if (!window.confirm('Reset the current layout to the default column arrangement? Bookmarks will not be changed.')) return;
		if (typeof window.columns === 'undefined' || typeof window.saveColumns !== 'function') return;
		window.columns = [];
		window.saveColumns();
	}

	function undoLayout() {
		if (!window.HumbleSync || !HumbleSync.restoreLastLayoutBackup) return;
		HumbleSync.restoreLastLayoutBackup().then(function(ok) {
			if (!ok) window.alert('No previous layout is available.');
		});
	}

	function installBackgroundButton() {
		if (document.getElementById('background_only_button')) return;
		var button = document.createElement('button');
		button.id = 'background_only_button';
		button.type = 'button';
		button.textContent = '◉';
		button.onclick = toggleBackgroundOnly;
		document.body.appendChild(button);
		applyBackgroundOnly(backgroundOnlyEnabled());
	}

	function bindControls() {
		installBackgroundButton();
		var resetSettingsButton = document.getElementById('reset_all_settings');
		var resetLayoutButton = document.getElementById('reset_current_layout');
		if (resetSettingsButton && !resetSettingsButton.dataset.bound) {
			resetSettingsButton.dataset.bound = '1';
			resetSettingsButton.onclick = function() { resetSettings(); return false; };
		}
		if (resetLayoutButton && !resetLayoutButton.dataset.bound) {
			resetLayoutButton.dataset.bound = '1';
			resetLayoutButton.onclick = function() { resetCurrentLayout(); return false; };
		}
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindControls);
	else bindControls();

	window.HumbleUIControls = {
		toggleBackgroundOnly: toggleBackgroundOnly,
		resetSettings: resetSettings,
		resetCurrentLayout: resetCurrentLayout,
		undoLayout: undoLayout
	};
})();
