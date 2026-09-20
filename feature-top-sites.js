'use strict';

(function() {
	var ORDER_KEY = 'options.top_order';
	var HIDDEN_KEY = 'options.top_hidden';
	var lastVisible = [];

	function readArray(key) {
		try {
			var raw = localStorage.getItem(key);
			var value = raw ? JSON.parse(raw) : [];
			return Array.isArray(value) ? value : [];
		} catch (error) {
			return [];
		}
	}

	function writeArray(key, value) {
		value = Array.from(new Set((value || []).filter(Boolean)));
		if (!value.length) localStorage.removeItem(key);
		else localStorage.setItem(key, JSON.stringify(value));
	}

	function refresh() {
		if (typeof window.renderColumns === 'function') window.renderColumns();
	}

	function prepare(items) {
		var order = readArray(ORDER_KEY);
		var hidden = readArray(HIDDEN_KEY);
		var orderIndex = Object.create(null);
		for (var i = 0; i < order.length; i++) orderIndex[order[i]] = i;

		var source = (items || []).filter(function(item) {
			return item && item.url && hidden.indexOf(item.url) < 0;
		}).map(function(item, originalIndex) {
			return {
				id: 'top:' + item.url,
				title: item.title || item.url,
				url: item.url,
				topSite: true,
				originalIndex: originalIndex
			};
		});

		source.sort(function(a, b) {
			var ai = Object.prototype.hasOwnProperty.call(orderIndex, a.url) ? orderIndex[a.url] : Number.MAX_SAFE_INTEGER;
			var bi = Object.prototype.hasOwnProperty.call(orderIndex, b.url) ? orderIndex[b.url] : Number.MAX_SAFE_INTEGER;
			if (ai !== bi) return ai - bi;
			return a.originalIndex - b.originalIndex;
		});

		lastVisible = source.slice(0);
		return source;
	}

	function persistVisibleOrder(items) {
		writeArray(ORDER_KEY, (items || []).map(function(item) { return item.url; }));
		refresh();
	}

	function move(node, delta) {
		var items = lastVisible.slice(0);
		var index = items.findIndex(function(item) { return item.url === node.url; });
		if (index < 0) return;
		var target = Math.max(0, Math.min(items.length - 1, index + delta));
		if (target === index) return;
		var item = items.splice(index, 1)[0];
		items.splice(target, 0, item);
		persistVisibleOrder(items);
	}

	function moveTop(node) {
		var items = lastVisible.slice(0);
		var index = items.findIndex(function(item) { return item.url === node.url; });
		if (index <= 0) return;
		var item = items.splice(index, 1)[0];
		items.unshift(item);
		persistVisibleOrder(items);
	}

	function hide(node) {
		if (!node || !node.url) return;
		var hidden = readArray(HIDDEN_KEY);
		if (hidden.indexOf(node.url) < 0) hidden.push(node.url);
		writeArray(HIDDEN_KEY, hidden);
		refresh();
	}

	function reset() {
		localStorage.removeItem(ORDER_KEY);
		localStorage.removeItem(HIDDEN_KEY);
		refresh();
	}

	function menuItems(node) {
		if (!node || !node.topSite) return [];
		var items = [
			{ label: 'Move to top', action: function() { moveTop(node); } },
			{ label: 'Move up', action: function() { move(node, -1); } },
			{ label: 'Move down', action: function() { move(node, 1); } },
			null,
			{ label: 'Hide from Most visited', action: function() { hide(node); } },
			{ label: 'Reset Most visited order', action: reset }
		];
		return items;
	}

	function attach(node, anchor) {
		if (!node || !node.topSite || !anchor) return;
		anchor.oncontextmenu = function(event) {
			var items = menuItems(node);
			if (window.HumbleHotkeys) {
				items.push(null);
				items = items.concat(HumbleHotkeys.menuItems(node));
			}
			renderMenu(items, event.pageX, event.pageY);
			return false;
		};
	}

	window.HumbleTopSites = {
		prepare: prepare,
		menuItems: menuItems,
		attach: attach,
		reset: reset
	};
})();
