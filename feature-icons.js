'use strict';

(function(S) {
	var STORAGE_KEY = 'options.custom_folder_icons';

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

	window.HumbleIconSettings = {
		customIconElement: customIconElement,
		setFolderIcon: setFolderIcon,
		resetFolderIcon: resetFolderIcon,
		folderMenuItems: folderMenuItems,
		readMappings: readMappings
	};
})(HumbleSync);
