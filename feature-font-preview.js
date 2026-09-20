'use strict';

(function() {
	var overlay, list, filterInput, sampleInput, loaded = false;
	var fonts = [];

	function create(tag, className, text) {
		var el = document.createElement(tag);
		if (className) el.className = className;
		if (text != null) el.textContent = text;
		return el;
	}

	function fontList() {
		return new Promise(function(resolve) {
			if (!chrome.fontSettings || !chrome.fontSettings.getFontList) {
				resolve([{ fontId: 'Sans-serif' }, { fontId: 'Serif' }, { fontId: 'Monospace' }]);
				return;
			}
			chrome.fontSettings.getFontList(function(result) {
				if (chrome.runtime && chrome.runtime.lastError) {
					resolve([{ fontId: 'Sans-serif' }, { fontId: 'Serif' }, { fontId: 'Monospace' }]);
					return;
				}
				resolve(result || []);
			});
		});
	}

	function render() {
		if (!list) return;
		while (list.firstChild) list.removeChild(list.firstChild);
		var query = String(filterInput.value || '').toLocaleLowerCase();
		var sample = sampleInput.value || 'Humble New Tab Page — Aa Bb Cc 123';
		var current = typeof window.getConfig === 'function' ? String(window.getConfig('font')) : '';

		var shown = 0;
		for (var i = 0; i < fonts.length; i++) {
			var name = fonts[i].fontId || fonts[i].displayName || '';
			if (!name || (query && name.toLocaleLowerCase().indexOf(query) < 0)) continue;
			shown++;

			(function(fontName) {
				var row = create('button', 'font-preview-row');
				row.type = 'button';
				if (fontName === current) row.classList.add('selected');

				var nameEl = create('span', 'font-preview-name', fontName);
				var sampleEl = create('span', 'font-preview-sample', sample);
				sampleEl.style.fontFamily = '"' + fontName.replace(/"/g, '') + '", sans-serif';

				row.appendChild(nameEl);
				row.appendChild(sampleEl);
				row.onclick = function() {
					if (typeof window.setConfig === 'function') {
						window.setConfig('font', fontName);
						if (typeof window.showConfig === 'function') window.showConfig('font');
					}
					close();
				};
				list.appendChild(row);
			})(name);
		}
		var count = document.getElementById('font_preview_count');
		if (count) count.textContent = shown + ' font' + (shown === 1 ? '' : 's');
	}

	function loadFonts() {
		if (loaded) return Promise.resolve(fonts);
		return fontList().then(function(result) {
			var seen = Object.create(null);
			var normalized = [{ fontId: 'Sans-serif' }, { fontId: 'Serif' }, { fontId: 'Monospace' }].concat(result || []);
			fonts = normalized.filter(function(item) {
				var name = item && item.fontId;
				if (!name || seen[name]) return false;
				seen[name] = true;
				return true;
			}).sort(function(a, b) {
				return a.fontId.localeCompare(b.fontId);
			});
			loaded = true;
			return fonts;
		});
	}

	function open() {
		if (!overlay) install();
		overlay.hidden = false;
		filterInput.value = '';
		loadFonts().then(function() {
			render();
			filterInput.focus();
		});
	}

	function close() {
		if (overlay) overlay.hidden = true;
	}

	function install() {
		if (overlay) return;

		overlay = create('div');
		overlay.id = 'font_preview_overlay';
		overlay.hidden = true;
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		overlay.setAttribute('aria-label', 'Font preview');

		var dialog = create('div', 'font-preview-dialog');
		var header = create('div', 'font-preview-header');
		var heading = create('h2', null, 'Font preview');
		var closeButton = create('button', 'font-preview-close', '×');
		closeButton.type = 'button';
		closeButton.title = 'Close';
		closeButton.onclick = close;
		header.appendChild(heading);
		header.appendChild(closeButton);

		var controls = create('div', 'font-preview-controls');
		filterInput = document.createElement('input');
		filterInput.type = 'search';
		filterInput.placeholder = 'Filter fonts…';
		filterInput.autocomplete = 'off';
		filterInput.oninput = render;

		sampleInput = document.createElement('input');
		sampleInput.type = 'text';
		sampleInput.value = 'Humble New Tab Page — Aa Bb Cc 123';
		sampleInput.setAttribute('aria-label', 'Preview text');
		sampleInput.oninput = render;

		var count = create('span', 'font-preview-count');
		count.id = 'font_preview_count';
		controls.appendChild(filterInput);
		controls.appendChild(sampleInput);
		controls.appendChild(count);

		list = create('div', 'font-preview-list');
		dialog.appendChild(header);
		dialog.appendChild(controls);
		dialog.appendChild(list);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);

		overlay.onmousedown = function(event) {
			if (event.target === overlay) close();
		};
		dialog.onmousedown = function(event) { event.stopPropagation(); };
		dialog.onkeydown = function(event) {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
			}
		};

		var button = document.getElementById('font_preview_button');
		if (button && !button.dataset.bound) {
			button.dataset.bound = '1';
			button.onclick = function() { open(); return false; };
		}
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
	else install();

	function refresh() {
		if (overlay && !overlay.hidden) render();
	}

	window.HumbleFontPreview = {
		open: open,
		close: close,
		refresh: refresh,
		reload: function() { loaded = false; fonts = []; return loadFonts(); }
	};
})();
