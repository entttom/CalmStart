'use strict';

(function() {
	var STORAGE_KEY = 'options.link_hotkeys';

	function readMappings() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			var value = raw ? JSON.parse(raw) : {};
			return value && !Array.isArray(value) && typeof value === 'object' ? value : {};
		} catch (error) {
			console.warn('Could not read link hotkeys:', error);
			return {};
		}
	}

	function writeMappings(value) {
		var keys = Object.keys(value || {});
		if (!keys.length) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		renderManager();
	}

	function normalizeInput(value) {
		value = String(value || '').trim().toUpperCase();
		if (/^[A-Z]$/.test(value)) return { code: 'Key' + value, label: value };
		if (/^[0-9]$/.test(value)) return { code: 'Digit' + value, label: value };
		return null;
	}

	function mappingForUrl(url) {
		if (!url) return null;
		var mappings = readMappings();
		var codes = Object.keys(mappings);
		for (var i = 0; i < codes.length; i++) {
			var item = mappings[codes[i]];
			if (item && item.url === url)
				return { code: codes[i], item: item };
		}
		return null;
	}

	function removeForUrl(url) {
		var mappings = readMappings();
		var codes = Object.keys(mappings);
		var changed = false;
		for (var i = 0; i < codes.length; i++) {
			if (mappings[codes[i]] && mappings[codes[i]].url === url) {
				delete mappings[codes[i]];
				changed = true;
			}
		}
		if (changed) writeMappings(mappings);
		return changed;
	}

	function setShortcut(node) {
		if (!node || !node.url) return;
		var existing = mappingForUrl(node.url);
		var initial = existing ? existing.item.label : '';
		var value = window.prompt('Shortcut key for this link (A-Z or 0-9). It will open with Alt/⌥ + key:', initial);
		if (value == null) return;

		value = value.trim();
		if (!value) {
			removeForUrl(node.url);
			if (typeof window.renderColumns === 'function') window.renderColumns();
			return;
		}

		var parsed = normalizeInput(value);
		if (!parsed) {
			window.alert('Please enter one letter A-Z or one digit 0-9.');
			return;
		}

		var mappings = readMappings();
		var conflict = mappings[parsed.code];
		if (conflict && conflict.url !== node.url) {
			if (!window.confirm('Alt/⌥+' + parsed.label + ' is already assigned to "' + (conflict.title || conflict.url) + '". Replace it?'))
				return;
		}

		removeForUrl(node.url);
		mappings = readMappings();
		mappings[parsed.code] = {
			url: node.url,
			title: node.title || node.name || node.url,
			label: parsed.label
		};
		writeMappings(mappings);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function removeShortcut(node) {
		if (!node || !node.url) return;
		if (removeForUrl(node.url) && typeof window.renderColumns === 'function')
			window.renderColumns();
	}

	function menuItems(node) {
		if (!node || !node.url) return [];
		var existing = mappingForUrl(node.url);
		var items = [{
			label: existing ? 'Change shortcut… (Alt/⌥+' + existing.item.label + ')' : 'Set shortcut…',
			action: function() { setShortcut(node); }
		}];
		if (existing)
			items.push({
				label: 'Remove shortcut',
				action: function() { removeShortcut(node); }
			});
		return items;
	}

	function decorate(node, anchor) {
		if (!node || !node.url || !anchor) return;
		var existing = mappingForUrl(node.url);
		if (!existing) return;
		var suffix = 'Alt/⌥+' + existing.item.label;
		var title = anchor.title || node.tooltip || node.url || '';
		if (title.indexOf(suffix) < 0)
			anchor.title = title ? title + ' — ' + suffix : suffix;
		anchor.dataset.hotkey = existing.item.label;
		var hint = document.createElement('span');
		hint.className = 'hotkey-hint';
		hint.textContent = '⌥' + existing.item.label;
		anchor.appendChild(hint);
	}

	function attachOnly(node, anchor) {
		if (!node || !node.url || !anchor) return;
		decorate(node, anchor);
		if (anchor.oncontextmenu) return;
		anchor.oncontextmenu = function(event) {
			renderMenu(menuItems(node), event.pageX, event.pageY);
			return false;
		};
	}

	function openMapping(item) {
		if (!item || !item.url) return;
		var raw = localStorage.getItem('options.newtab');
		var mode = Number(raw);
		if (mode === 1) chrome.tabs.create({ url: item.url, active: true });
		else if (mode === 2) chrome.tabs.create({ url: item.url, active: false });
		else chrome.tabs.update({ url: item.url });
	}

	function clearAll() {
		writeMappings({});
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function renderManager() {
		var list = document.getElementById('hotkey_list');
		if (!list) return;
		while (list.firstChild) list.removeChild(list.firstChild);

		var mappings = readMappings();
		var codes = Object.keys(mappings).sort();
		if (!codes.length) {
			var empty = document.createElement('div');
			empty.className = 'hotkey-empty';
			empty.textContent = 'No link shortcuts configured.';
			list.appendChild(empty);
		} else {
			for (var i = 0; i < codes.length; i++) {
				(function(code) {
					var item = mappings[code];
					var row = document.createElement('div');
					row.className = 'hotkey-row';

					var key = document.createElement('kbd');
					key.textContent = 'Alt/⌥+' + (item.label || code.replace(/^Key|^Digit/, ''));

					var target = document.createElement('span');
					target.className = 'hotkey-target';
					target.textContent = item.title || item.url;
					target.title = item.url;

					var remove = document.createElement('button');
					remove.type = 'button';
					remove.textContent = 'Remove';
					remove.onclick = function() {
						var next = readMappings();
						delete next[code];
						writeMappings(next);
						if (typeof window.renderColumns === 'function') window.renderColumns();
					};

					row.appendChild(key);
					row.appendChild(target);
					row.appendChild(remove);
					list.appendChild(row);
				})(codes[i]);
			}
		}

		var clear = document.getElementById('clear_link_hotkeys');
		if (clear) clear.disabled = !codes.length;
	}

	function installManager() {
		var clear = document.getElementById('clear_link_hotkeys');
		if (clear && !clear.dataset.bound) {
			clear.dataset.bound = '1';
			clear.onclick = function() { clearAll(); return false; };
		}
		renderManager();
	}

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', installManager);
	else
		installManager();

	document.addEventListener('keydown', function(event) {
		if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		var target = event.target;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable))
			return;

		var mappings = readMappings();
		var item = mappings[event.code];
		if (!item) return;
		event.preventDefault();
		event.stopPropagation();
		openMapping(item);
	});

	window.HumbleHotkeys = {
		readMappings: readMappings,
		mappingForUrl: mappingForUrl,
		menuItems: menuItems,
		decorate: decorate,
		attachOnly: attachOnly,
		setShortcut: setShortcut,
		removeShortcut: removeShortcut,
		clearAll: clearAll,
		renderManager: renderManager
	};
})();
