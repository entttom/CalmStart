'use strict';

(function() {
	var element = null;
	var timer = null;

	function configValue(key, fallback) {
		if (typeof window.getConfig === 'function') return window.getConfig(key);
		var raw = localStorage.getItem('options.' + key);
		return raw == null ? fallback : Number(raw);
	}

	function ensureElement() {
		if (element) return element;
		element = document.createElement('div');
		element.id = 'humble_clock';
		element.hidden = true;
		element.setAttribute('aria-label', 'Current time');
		document.body.appendChild(element);
		return element;
	}

	function refresh() {
		var el = ensureElement();
		var visible = !!configValue('show_clock', 0);
		el.hidden = !visible;
		if (!visible) return;

		var use24 = !!configValue('clock_24h', 1);
		var now = new Date();
		el.textContent = now.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: !use24
		});
		el.title = now.toLocaleDateString();
	}

	function start() {
		ensureElement();
		refresh();
		if (timer) clearInterval(timer);
		timer = setInterval(refresh, 30000);
	}

	var ready = window.HumbleStorage && window.HumbleStorage.ready;
	if (ready && typeof ready.then === 'function') ready.then(start);
	else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();

	window.HumbleClock = {
		refresh: refresh,
		start: start
	};
})();
