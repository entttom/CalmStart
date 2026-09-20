'use strict';

(function() {
	var overlay, dialog, titleInput, widthInput, backgroundInput, saveButton, resetButton, cancelButton;
	var editingIndex = null;

	function activeLayoutId() {
		return window.HumbleNamedLayouts && HumbleNamedLayouts.activeId ? HumbleNamedLayouts.activeId() : 'default';
	}

	function storageKey() {
		return 'options.layout_columns.' + activeLayoutId();
	}

	function readConfig() {
		try {
			var raw = localStorage.getItem(storageKey());
			var parsed = raw ? JSON.parse(raw) : {};
			return parsed && typeof parsed === 'object' ? parsed : {};
		} catch (error) {
			console.warn('Could not read column settings:', error);
			return {};
		}
	}

	function writeConfig(config) {
		if (!config || !Object.keys(config).length) localStorage.removeItem(storageKey());
		else localStorage.setItem(storageKey(), JSON.stringify(config));
	}

	function getColumn(index) {
		var config = readConfig();
		return config[String(index)] || {};
	}

	function cleanEntry(entry) {
		var result = {};
		var title = String(entry.title || '').trim();
		var background = String(entry.background || '').trim();
		var width = Number(entry.width);
		if (title) result.title = title;
		if (background && background.toLowerCase() !== 'transparent') result.background = background;
		if (isFinite(width) && width >= 8 && width <= 92) result.width = width;
		return result;
	}

	function normalizedWidths(count) {
		var config = readConfig();
		var result = [];
		var customTotal = 0;
		var automatic = [];
		for (var i = 0; i < count; i++) {
			var entry = config[String(i)] || {};
			var width = Number(entry.width);
			if (isFinite(width) && width >= 8 && width <= 92) {
				result[i] = width;
				customTotal += width;
			} else {
				result[i] = null;
				automatic.push(i);
			}
		}

		if (customTotal >= 100 && customTotal > 0) {
			var scale = 96 / customTotal;
			for (var x = 0; x < result.length; x++)
				if (result[x] != null) result[x] *= scale;
			customTotal = 96;
		}

		var remaining = Math.max(4, 100 - customTotal);
		var autoWidth = automatic.length ? remaining / automatic.length : 0;
		for (var y = 0; y < automatic.length; y++) result[automatic[y]] = autoWidth;
		return result;
	}

	function applyAll(columns) {
		var widths = normalizedWidths(columns.length);
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			var entry = getColumn(i);
			column.style.width = widths[i] + '%';
			column.style.backgroundColor = entry.background || '';
			column.classList.toggle('custom-column-background', !!entry.background);

			var oldTitle = column.querySelector(':scope > .column-title');
			if (oldTitle) oldTitle.remove();
			if (entry.title) {
				var title = document.createElement('div');
				title.className = 'column-title';
				title.textContent = entry.title;
				title.title = entry.title;
				column.insertBefore(title, column.firstChild);
			}
		}
	}

	function show(index) {
		editingIndex = index;
		var entry = getColumn(index);
		titleInput.value = entry.title || '';
		widthInput.value = entry.width || '';
		backgroundInput.value = entry.background || '';
		overlay.hidden = false;
		setTimeout(function() {
			titleInput.focus();
			titleInput.select();
		}, 0);
	}

	function close() {
		if (!overlay || overlay.hidden) return;
		overlay.hidden = true;
		editingIndex = null;
	}

	function save() {
		if (editingIndex == null) return;
		var config = readConfig();
		var entry = cleanEntry({
			title: titleInput.value,
			width: widthInput.value,
			background: backgroundInput.value
		});
		if (Object.keys(entry).length) config[String(editingIndex)] = entry;
		else delete config[String(editingIndex)];
		writeConfig(config);
		close();
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function reset() {
		if (editingIndex == null) return;
		var config = readConfig();
		delete config[String(editingIndex)];
		writeConfig(config);
		close();
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function inputRow(labelText, input) {
		var label = document.createElement('label');
		label.className = 'column-settings-row';
		var span = document.createElement('span');
		span.textContent = labelText;
		label.appendChild(span);
		label.appendChild(input);
		return label;
	}

	function installUI() {
		if (overlay) return;
		overlay = document.createElement('div');
		overlay.id = 'column_settings_overlay';
		overlay.hidden = true;
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		overlay.setAttribute('aria-label', 'Column settings');

		dialog = document.createElement('div');
		dialog.className = 'column-settings-dialog';

		var heading = document.createElement('h2');
		heading.className = 'column-settings-heading';
		heading.textContent = 'Column settings';

		titleInput = document.createElement('input');
		titleInput.type = 'text';
		titleInput.placeholder = 'Optional';

		widthInput = document.createElement('input');
		widthInput.type = 'number';
		widthInput.min = '8';
		widthInput.max = '92';
		widthInput.step = '1';
		widthInput.placeholder = 'Automatic';

		backgroundInput = document.createElement('input');
		backgroundInput.type = 'text';
		backgroundInput.placeholder = 'transparent or #RRGGBB';

		var widthRow = inputRow('Width (%)', widthInput);
		var widthHelp = document.createElement('small');
		widthHelp.className = 'column-settings-help';
		widthHelp.textContent = 'Leave empty for automatic width.';
		widthRow.appendChild(widthHelp);

		var actions = document.createElement('div');
		actions.className = 'column-settings-actions';

		resetButton = document.createElement('button');
		resetButton.type = 'button';
		resetButton.textContent = 'Reset';

		cancelButton = document.createElement('button');
		cancelButton.type = 'button';
		cancelButton.textContent = 'Cancel';

		saveButton = document.createElement('button');
		saveButton.type = 'button';
		saveButton.textContent = 'Save';

		actions.appendChild(resetButton);
		actions.appendChild(cancelButton);
		actions.appendChild(saveButton);

		dialog.appendChild(heading);
		dialog.appendChild(inputRow('Title', titleInput));
		dialog.appendChild(widthRow);
		dialog.appendChild(inputRow('Background', backgroundInput));
		dialog.appendChild(actions);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);

		overlay.onmousedown = function(event) {
			if (event.target === overlay) close();
		};
		dialog.onmousedown = function(event) { event.stopPropagation(); };
		resetButton.onclick = reset;
		cancelButton.onclick = close;
		saveButton.onclick = save;
		dialog.onkeydown = function(event) {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
			} else if (event.key === 'Enter') {
				event.preventDefault();
				save();
			}
		};
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installUI);
	else installUI();

	window.HumbleColumnSettings = {
		show: show,
		applyAll: applyAll,
		get: getColumn,
		read: readConfig
	};
})();
