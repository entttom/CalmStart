'use strict';

(function() {
	var overlay, dialog, heading, titleRow, titleInput, urlRow, urlInput, folderRow, folderSelect, saveButton, deleteButton, cancelButton;
	var state = null;

	function isBookmarkNode(node) {
		return !!(node && node.url && /^\d+$/.test(String(node.id || '')));
	}

	function isFolderNode(node) {
		return !!(node && !node.url && /^\d+$/.test(String(node.id || '')));
	}

	function chromeError(prefix) {
		if (chrome.runtime && chrome.runtime.lastError) {
			console.warn(prefix + ':', chrome.runtime.lastError.message);
			return chrome.runtime.lastError.message;
		}
		return null;
	}

	function refreshView() {
		if (window.HumbleBookmarkSearch && window.HumbleBookmarkSearch.rebuild)
			window.HumbleBookmarkSearch.rebuild();
		if (typeof window.renderColumns === 'function')
			window.renderColumns();
	}

	function setVisible(row, visible) {
		row.hidden = !visible;
	}

	function clearFolderOptions() {
		while (folderSelect.firstChild) folderSelect.removeChild(folderSelect.firstChild);
	}

	function appendFolderOption(node, depth, selectedId) {
		if (!node || node.url) return;
		if (node.id && node.title) {
			var option = document.createElement('option');
			option.value = String(node.id);
			option.textContent = new Array(depth + 1).join('  ') + node.title;
			if (String(node.id) === String(selectedId || '')) option.selected = true;
			folderSelect.appendChild(option);
		}
		var children = node.children || [];
		for (var i = 0; i < children.length; i++)
			if (!children[i].url) appendFolderOption(children[i], depth + (node.title ? 1 : 0), selectedId);
	}

	function populateFolders(selectedId) {
		clearFolderOptions();
		chrome.bookmarks.getTree(function(tree) {
			if (chromeError('Could not load bookmark folders')) return;
			for (var i = 0; i < (tree || []).length; i++)
				appendFolderOption(tree[i], 0, selectedId);
		});
	}

	function show(mode, node) {
		state = { mode: mode, node: node };
		deleteButton.hidden = true;
		titleInput.value = '';
		urlInput.value = '';
		folderSelect.disabled = false;

		if (mode === 'edit-bookmark') {
			heading.textContent = 'Edit bookmark';
			titleInput.value = node.title || '';
			urlInput.value = node.url || '';
			setVisible(titleRow, true);
			setVisible(urlRow, true);
			setVisible(folderRow, false);
			deleteButton.hidden = false;
			deleteButton.textContent = 'Delete bookmark';
			saveButton.textContent = 'Save';
		} else if (mode === 'move-bookmark') {
			heading.textContent = 'Move bookmark';
			setVisible(titleRow, false);
			setVisible(urlRow, false);
			setVisible(folderRow, true);
			populateFolders(node.parentId);
			saveButton.textContent = 'Move';
		} else if (mode === 'new-bookmark') {
			heading.textContent = 'New bookmark';
			setVisible(titleRow, true);
			setVisible(urlRow, true);
			setVisible(folderRow, false);
			saveButton.textContent = 'Create';
		} else if (mode === 'new-folder') {
			heading.textContent = 'New folder';
			setVisible(titleRow, true);
			setVisible(urlRow, false);
			setVisible(folderRow, false);
			saveButton.textContent = 'Create';
		} else if (mode === 'rename-folder') {
			heading.textContent = 'Rename folder';
			titleInput.value = node.title || '';
			setVisible(titleRow, true);
			setVisible(urlRow, false);
			setVisible(folderRow, false);
			saveButton.textContent = 'Save';
		}

		overlay.hidden = false;
		setTimeout(function() {
			if (!titleRow.hidden) {
				titleInput.focus();
				titleInput.select();
			} else if (!urlRow.hidden) urlInput.focus();
			else folderSelect.focus();
		}, 0);
	}

	function close() {
		if (!overlay || overlay.hidden) return;
		overlay.hidden = true;
		state = null;
	}

	function normalizeUrl(value) {
		value = String(value || '').trim();
		if (!value) return '';
		if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
		return 'https://' + value;
	}

	function save() {
		if (!state) return;
		var mode = state.mode;
		var node = state.node;
		var title = titleInput.value.trim();
		var url = normalizeUrl(urlInput.value);

		if ((mode === 'edit-bookmark' || mode === 'new-bookmark') && !url) {
			urlInput.focus();
			return;
		}
		if ((mode === 'new-folder' || mode === 'rename-folder') && !title) {
			titleInput.focus();
			return;
		}

		saveButton.disabled = true;

		if (mode === 'edit-bookmark') {
			chrome.bookmarks.update(String(node.id), { title: title, url: url }, finish);
		} else if (mode === 'move-bookmark') {
			chrome.bookmarks.move(String(node.id), { parentId: folderSelect.value }, finish);
		} else if (mode === 'new-bookmark') {
			chrome.bookmarks.create({ parentId: String(node.id), title: title || url, url: url }, finish);
		} else if (mode === 'new-folder') {
			chrome.bookmarks.create({ parentId: String(node.id), title: title }, finish);
		} else if (mode === 'rename-folder') {
			chrome.bookmarks.update(String(node.id), { title: title }, finish);
		}

		function finish() {
			saveButton.disabled = false;
			if (chromeError('Bookmark operation failed')) return;
			close();
			refreshView();
		}
	}

	function deleteBookmark() {
		if (!state || state.mode !== 'edit-bookmark') return;
		var node = state.node;
		var label = node.title || node.url || 'this bookmark';
		if (!window.confirm('Delete "' + label + '" from bookmarks?')) return;
		deleteButton.disabled = true;
		chrome.bookmarks.remove(String(node.id), function() {
			deleteButton.disabled = false;
			if (chromeError('Could not delete bookmark')) return;
			close();
			refreshView();
		});
	}

	function createLabel(text, input) {
		var label = document.createElement('label');
		label.className = 'bookmark-editor-row';
		var span = document.createElement('span');
		span.textContent = text;
		label.appendChild(span);
		label.appendChild(input);
		return label;
	}

	function installUI() {
		if (overlay) return;
		overlay = document.createElement('div');
		overlay.id = 'bookmark_editor_overlay';
		overlay.hidden = true;
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');

		dialog = document.createElement('div');
		dialog.className = 'bookmark-editor-dialog';

		heading = document.createElement('h2');
		heading.className = 'bookmark-editor-heading';

		titleInput = document.createElement('input');
		titleInput.type = 'text';
		titleInput.autocomplete = 'off';
		titleRow = createLabel('Title', titleInput);

		urlInput = document.createElement('input');
		urlInput.type = 'url';
		urlInput.autocomplete = 'off';
		urlRow = createLabel('URL', urlInput);

		folderSelect = document.createElement('select');
		folderRow = createLabel('Folder', folderSelect);

		var actions = document.createElement('div');
		actions.className = 'bookmark-editor-actions';

		deleteButton = document.createElement('button');
		deleteButton.type = 'button';
		deleteButton.className = 'bookmark-editor-delete';
		deleteButton.textContent = 'Delete';

		cancelButton = document.createElement('button');
		cancelButton.type = 'button';
		cancelButton.textContent = 'Cancel';

		saveButton = document.createElement('button');
		saveButton.type = 'button';
		saveButton.textContent = 'Save';

		actions.appendChild(deleteButton);
		actions.appendChild(cancelButton);
		actions.appendChild(saveButton);

		dialog.appendChild(heading);
		dialog.appendChild(titleRow);
		dialog.appendChild(urlRow);
		dialog.appendChild(folderRow);
		dialog.appendChild(actions);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);

		overlay.onmousedown = function(event) {
			if (event.target === overlay) close();
		};
		dialog.onmousedown = function(event) { event.stopPropagation(); };
		cancelButton.onclick = close;
		saveButton.onclick = save;
		deleteButton.onclick = deleteBookmark;

		dialog.onkeydown = function(event) {
			if (event.key === 'Escape') {
				event.preventDefault();
				close();
			} else if (event.key === 'Enter' && event.target !== folderSelect) {
				event.preventDefault();
				save();
			}
		};
	}

	function attachBookmark(node, anchor) {
		if (!isBookmarkNode(node) || !anchor) return;
		anchor.oncontextmenu = function(event) {
			var items = [
				{ label: 'Edit bookmark…', action: function() { show('edit-bookmark', node); } },
				{ label: 'Move bookmark…', action: function() { show('move-bookmark', node); } },
				null,
				{ label: 'Delete bookmark…', action: function() {
					show('edit-bookmark', node);
					deleteBookmark();
				} }
			];
			renderMenu(items, event.pageX, event.pageY);
			return false;
		};
	}

	function folderMenuItems(node) {
		if (!isFolderNode(node)) return [];
		return [
			null,
			{ label: 'New bookmark…', action: function() { show('new-bookmark', node); } },
			{ label: 'New folder…', action: function() { show('new-folder', node); } },
			{ label: 'Rename folder…', action: function() { show('rename-folder', node); } }
		];
	}

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', installUI);
	else
		installUI();

	window.HumbleBookmarkEditor = {
		isEditableBookmark: isBookmarkNode,
		attachBookmark: attachBookmark,
		folderMenuItems: folderMenuItems,
		close: close
	};
})();
