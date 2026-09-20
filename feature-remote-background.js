'use strict';

(function() {
	var timer = null;
	var lastRefreshAt = 0;
	var lastBaseUrl = '';

	function configuredUrl() {
		return localStorage.getItem('options.background_image') || '';
	}

	function refreshMinutes() {
		var raw = Number(localStorage.getItem('options.background_refresh_minutes') || 0);
		return isFinite(raw) && raw > 0 ? Math.max(1, raw) : 0;
	}

	function cacheBusted(url) {
		try {
			var parsed = new URL(url);
			if (parsed.protocol === 'data:' || parsed.protocol === 'blob:' || parsed.protocol === 'file:') return url;
			parsed.searchParams.set('_hntp_refresh', String(Date.now()));
			return parsed.toString();
		} catch (error) {
			var separator = url.indexOf('?') >= 0 ? '&' : '?';
			return url + separator + '_hntp_refresh=' + Date.now();
		}
	}

	function apply(force) {
		if (document.body.dataset.liveBackground === '1') return false;
		var url = configuredUrl().trim();
		var minutes = refreshMinutes();
		if (!url || !minutes) return false;

		var now = Date.now();
		if (!force && url === lastBaseUrl && now - lastRefreshAt < minutes * 60000) return false;

		lastBaseUrl = url;
		lastRefreshAt = now;
		document.body.style.backgroundImage = 'url("' + cacheBusted(url).replace(/"/g, '\"') + '")';
		return true;
	}

	function tick() {
		apply(false);
	}

	function restart() {
		if (timer) clearInterval(timer);
		timer = null;
		lastRefreshAt = 0;
		lastBaseUrl = '';
		var minutes = refreshMinutes();
		if (minutes > 0) {
			apply(true);
			timer = setInterval(tick, Math.min(minutes * 60000, 60000));
		}
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restart);
	else restart();

	window.HumbleRemoteBackground = {
		refresh: function() { return apply(true); },
		restart: restart,
		isEnabled: function() { return refreshMinutes() > 0 && !!configuredUrl(); }
	};
})();
