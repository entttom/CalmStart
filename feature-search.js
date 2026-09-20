'use strict';

(function() {
	var MAX_RESULTS = 60;
	var index = [];
	var selectedIndex = -1;
	var rebuildTimer = null;
	var initialized = false;

	function normalize(value) {
		return String(value || '').toLocaleLowerCase();
	}

	function folderPath(parts) {
		return parts.filter(function(part) { return !!part; }).join(' › ');
	}

	function addNode(node, path) {
		if (!node) return;
		var title = node.title || '';
		if (node.url) {
			index.push({
				id: String(node.id || ''),
				title: title || node.url,
				url: node.url,
				path: folderPath(path),
				searchTitle: normalize(title || node.url),
				searchUrl: normalize(node.url),
				searchPath: normalize(folderPath(path))
			});
		}
		if (!node.children) return;
		var nextPath = path;
		if (!node.url && title) nextPath = path.concat([title]);
		for (var i = 0; i < node.children.length; i++)
			addNode(node.children[i], nextPath);
	}

	function buildIndex() {
		if (!chrome.bookmarks || !chrome.bookmarks.getTree) return Promise.resolve();
		return new Promise(function(resolve) {
			chrome.bookmarks.getTree(function(tree) {
				if (chrome.runtime && chrome.runtime.lastError) {
					console.warn('Humble bookmark search index failed:', chrome.runtime.lastError.message);
					resolve();
					return;
				}
				index = [];
				var roots = tree || [];
				for (var i = 0; i < roots.length; i++) addNode(roots[i], []);
				updateSearch();
				resolve();
			});
		});
	}

	function scheduleRebuild() {
		if (rebuildTimer) clearTimeout(rebuildTimer);
		rebuildTimer = setTimeout(function() {
			rebuildTimer = null;
			buildIndex();
		}, 150);
	}

	function termScore(item, term) {
		if (item.searchTitle === term) return 0;
		if (item.searchTitle.indexOf(term) === 0) return 1;
		if (item.searchTitle.indexOf(term) >= 0) return 4;
		if (item.searchUrl.indexOf(term) === 0) return 6;
		if (item.searchUrl.indexOf(term) >= 0) return 8;
		if (item.searchPath.indexOf(term) >= 0) return 12;
		return -1;
	}

	function search(query) {
		var terms = normalize(query).trim().split(/\s+/).filter(Boolean);
		if (!terms.length) return [];
		var matches = [];
		for (var i = 0; i < index.length; i++) {
			var item = index[i];
			var score = 0;
			var matched = true;
			for (var t = 0; t < terms.length; t++) {
				var part = termScore(item, terms[t]);
				if (part < 0) {
					matched = false;
					break;
				}
				score += part;
			}
			if (matched) matches.push({ item: item, score: score });
		}
		matches.sort(function(a, b) {
			if (a.score !== b.score) return a.score - b.score;
			return a.item.title.localeCompare(b.item.title);
		});
		return matches.slice(0, MAX_RESULTS).map(function(match) { return match.item; });
	}

	function getOpenMode(event) {
		if (event && (event.metaKey || event.ctrlKey || event.button === 1)) return 2;
		var stored = localStorage.getItem('options.newtab');
		var mode = Number(stored);
		return mode === 1 || mode === 2 ? mode : 0;
	}

	function openResult(item, event) {
		var mode = getOpenMode(event);
		if (mode === 1) chrome.tabs.create({ url: item.url, active: true });
		else if (mode === 2) chrome.tabs.create({ url: item.url, active: false });
		else chrome.tabs.update({ url: item.url });
		closeSearch();
	}

	function createElement(tag, className, text) {
		var element = document.createElement(tag);
		if (className) element.className = className;
		if (text != null) element.textContent = text;
		return element;
	}

	function renderResults(items, query) {
		var list = document.getElementById('bookmark_search_results');
		var status = document.getElementById('bookmark_search_status');
		while (list.firstChild) list.removeChild(list.firstChild);
		selectedIndex = items.length ? 0 : -1;

		if (!query.trim()) {
			status.textContent = index.length + ' bookmarks indexed';
			list.appendChild(createElement('li', 'bookmark-search-empty', 'Type to search bookmark titles, URLs, and folder paths.'));
			return;
		}

		status.textContent = items.length + (items.length === MAX_RESULTS ? '+' : '') + ' result' + (items.length === 1 ? '' : 's');
		if (!items.length) {
			list.appendChild(createElement('li', 'bookmark-search-empty', 'No matching bookmarks'));
			return;
		}

		for (var i = 0; i < items.length; i++) {
			(function(item, indexInResults) {
				var li = createElement('li', 'bookmark-search-result');
				li.dataset.index = String(indexInResults);
				if (indexInResults === 0) li.classList.add('selected');

				var link = createElement('a', 'bookmark-search-link');
				link.href = item.url;
				link.tabIndex = -1;

				var icon = document.createElement('img');
				icon.className = 'bookmark-search-icon';
				icon.alt = '';
				icon.src = '/_favicon/?pageUrl=' + encodeURIComponent(item.url) + '&size=32';

				var content = createElement('span', 'bookmark-search-content');
				var title = createElement('span', 'bookmark-search-title', item.title);
				var path = createElement('span', 'bookmark-search-path', item.path || 'Bookmarks');
				var url = createElement('span', 'bookmark-search-url', item.url);
				content.appendChild(title);
				content.appendChild(path);
				content.appendChild(url);

				link.appendChild(icon);
				link.appendChild(content);
				li.appendChild(link);
				list.appendChild(li);

				link.onclick = function(event) {
					event.preventDefault();
					openResult(item, event);
					return false;
				};
				link.onauxclick = function(event) {
					if (event.button === 1) {
						event.preventDefault();
						openResult(item, event);
						return false;
					}
				};
				li.onmousemove = function() {
					selectResult(indexInResults);
				};
			})(items[i], i);
		}
	}

	function currentResults() {
		var input = document.getElementById('bookmark_search_input');
		return input ? search(input.value) : [];
	}

	function updateSearch() {
		var input = document.getElementById('bookmark_search_input');
		if (!input) return;
		renderResults(search(input.value), input.value);
	}

	function selectResult(indexToSelect) {
		var rows = document.querySelectorAll('#bookmark_search_results .bookmark-search-result');
		if (!rows.length) {
			selectedIndex = -1;
			return;
		}
		if (indexToSelect < 0) indexToSelect = rows.length - 1;
		if (indexToSelect >= rows.length) indexToSelect = 0;
		for (var i = 0; i < rows.length; i++)
			rows[i].classList.toggle('selected', i === indexToSelect);
		selectedIndex = indexToSelect;
		rows[indexToSelect].scrollIntoView({ block: 'nearest' });
	}

	function openSelected(event) {
		var items = currentResults();
		if (selectedIndex < 0 || selectedIndex >= items.length) return;
		openResult(items[selectedIndex], event);
	}

	function openSearch() {
		var overlay = document.getElementById('bookmark_search_overlay');
		var input = document.getElementById('bookmark_search_input');
		if (!overlay || !input) return;
		overlay.hidden = false;
		document.body.classList.add('bookmark-search-open');
		input.value = '';
		updateSearch();
		setTimeout(function() {
			input.focus();
			input.select();
		}, 0);
	}

	function closeSearch() {
		var overlay = document.getElementById('bookmark_search_overlay');
		if (!overlay || overlay.hidden) return;
		overlay.hidden = true;
		document.body.classList.remove('bookmark-search-open');
		var button = document.getElementById('bookmark_search_button');
		if (button) button.focus();
	}

	function installUI() {
		if (initialized) return;
		initialized = true;

		var button = createElement('a');
		button.id = 'bookmark_search_button';
		button.title = 'Search bookmarks (Ctrl/⌘+K)';
		button.tabIndex = 0;
		button.setAttribute('aria-label', 'Search bookmarks');
		document.body.appendChild(button);

		var overlay = createElement('div');
		overlay.id = 'bookmark_search_overlay';
		overlay.hidden = true;
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		overlay.setAttribute('aria-label', 'Search bookmarks');

		var panel = createElement('div', 'bookmark-search-panel');
		var inputWrap = createElement('div', 'bookmark-search-input-wrap');
		var input = document.createElement('input');
		input.id = 'bookmark_search_input';
		input.type = 'search';
		input.placeholder = 'Search bookmarks…';
		input.autocomplete = 'off';
		input.spellcheck = false;
		input.setAttribute('aria-label', 'Search bookmark titles, URLs, and folders');
		inputWrap.appendChild(input);

		var statusRow = createElement('div', 'bookmark-search-meta');
		var status = createElement('span');
		status.id = 'bookmark_search_status';
		var hints = createElement('span', 'bookmark-search-hints', '↑↓ navigate · Enter open · Esc close');
		statusRow.appendChild(status);
		statusRow.appendChild(hints);

		var results = createElement('ul');
		results.id = 'bookmark_search_results';

		panel.appendChild(inputWrap);
		panel.appendChild(statusRow);
		panel.appendChild(results);
		overlay.appendChild(panel);
		document.body.appendChild(overlay);

		button.onclick = function() {
			openSearch();
			return false;
		};
		button.onkeydown = function(event) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openSearch();
			}
		};
		overlay.onmousedown = function(event) {
			if (event.target === overlay) closeSearch();
		};
		panel.onmousedown = function(event) {
			event.stopPropagation();
		};
		input.oninput = updateSearch;
		input.onkeydown = function(event) {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				selectResult(selectedIndex + 1);
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				selectResult(selectedIndex - 1);
			} else if (event.key === 'Enter') {
				event.preventDefault();
				openSelected(event);
			} else if (event.key === 'Escape') {
				event.preventDefault();
				closeSearch();
			}
		};

		document.addEventListener('keydown', function(event) {
			var target = event.target;
			var typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
			if ((event.ctrlKey || event.metaKey) && !event.altKey && normalize(event.key) === 'k') {
				event.preventDefault();
				if (overlay.hidden) openSearch();
				else closeSearch();
				return;
			}
			if (!overlay.hidden && event.key === 'Escape') {
				event.preventDefault();
				closeSearch();
				return;
			}
			if (!typing && overlay.hidden && event.key === '/') {
				event.preventDefault();
				openSearch();
			}
		});

		if (chrome.bookmarks) {
			if (chrome.bookmarks.onCreated) chrome.bookmarks.onCreated.addListener(scheduleRebuild);
			if (chrome.bookmarks.onChanged) chrome.bookmarks.onChanged.addListener(scheduleRebuild);
			if (chrome.bookmarks.onMoved) chrome.bookmarks.onMoved.addListener(scheduleRebuild);
			if (chrome.bookmarks.onRemoved) chrome.bookmarks.onRemoved.addListener(scheduleRebuild);
			if (chrome.bookmarks.onImportEnded) chrome.bookmarks.onImportEnded.addListener(scheduleRebuild);
		}

		buildIndex();
	}

	var ready = window.HumbleStorage && window.HumbleStorage.ready;
	if (ready && typeof ready.then === 'function') ready.then(installUI);
	else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installUI);
	else installUI();

	window.HumbleBookmarkSearch = {
		rebuild: buildIndex,
		open: openSearch,
		close: closeSearch,
		search: search
	};
})();
