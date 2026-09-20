'use strict';

(function() {
	var STORAGE_KEY = 'options.custom_links';

	function readLinks() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			var links = raw ? JSON.parse(raw) : [];
			return Array.isArray(links) ? links : [];
		} catch (error) {
			console.warn('Could not read custom links:', error);
			return [];
		}
	}

	function writeLinks(links) {
		if (!links.length) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
	}

	function makeId() {
		if (window.crypto && typeof window.crypto.randomUUID === 'function')
			return window.crypto.randomUUID();
		return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
	}

	function normalizeUrl(value) {
		value = String(value || '').trim();
		if (!value) return '';
		if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
		return 'https://' + value;
	}

	function nodes() {
		return readLinks().map(function(link) {
			return {
				id: 'custom-link:' + link.id,
				title: link.title || link.url,
				url: link.url,
				customLinkId: link.id
			};
		});
	}

	function addLink() {
		var url = window.prompt('URL for the custom link:', 'https://');
		if (url == null) return;
		url = normalizeUrl(url);
		if (!url) return;
		var title = window.prompt('Title:', url);
		if (title == null) return;
		title = title.trim() || url;
		var links = readLinks();
		links.push({ id: makeId(), title: title, url: url });
		writeLinks(links);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function findLink(id) {
		var links = readLinks();
		for (var i = 0; i < links.length; i++)
			if (links[i].id === id) return { links: links, index: i, link: links[i] };
		return null;
	}

	function editLink(id) {
		var found = findLink(id);
		if (!found) return;
		var url = window.prompt('URL:', found.link.url);
		if (url == null) return;
		url = normalizeUrl(url);
		if (!url) return;
		var title = window.prompt('Title:', found.link.title || url);
		if (title == null) return;
		found.links[found.index] = {
			id: found.link.id,
			title: title.trim() || url,
			url: url
		};
		writeLinks(found.links);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function deleteLink(id) {
		var found = findLink(id);
		if (!found) return;
		if (!window.confirm('Delete custom link "' + (found.link.title || found.link.url) + '"?')) return;
		found.links.splice(found.index, 1);
		writeLinks(found.links);
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function attachLink(node, anchor) {
		if (!node || !node.customLinkId || !anchor) return;
		anchor.oncontextmenu = function(event) {
			renderMenu([
				{ label: 'Edit custom link…', action: function() { editLink(node.customLinkId); } },
				{ label: 'Delete custom link…', action: function() { deleteLink(node.customLinkId); } }
			], event.pageX, event.pageY);
			return false;
		};
	}

	function folderMenuItems() {
		var items = [
			{ label: 'Add custom link…', action: addLink }
		];
		if (readLinks().length)
			items.push({
				label: 'Clear custom links…',
				action: function() {
					if (!window.confirm('Delete all custom links?')) return;
					writeLinks([]);
					if (typeof window.renderColumns === 'function') window.renderColumns();
				}
			});
		return items;
	}

	window.HumbleCustomLinks = {
		nodes: nodes,
		add: addLink,
		edit: editLink,
		remove: deleteLink,
		attachLink: attachLink,
		folderMenuItems: folderMenuItems,
		read: readLinks
	};
})();
