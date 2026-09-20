'use strict';

(function() {
	var timer = null;
	var currentIndex = -1;

	function readUrls() {
		var raw = localStorage.getItem('options.background_rotation_urls') || '';
		return raw.split(/?
/).map(function(value) { return value.trim(); }).filter(Boolean);
	}

	function intervalMinutes() {
		return Number(localStorage.getItem('options.background_rotation_interval') || 0);
	}

	function cacheBust(url) {
		if (!url) return url;
		var separator = url.indexOf('?') >= 0 ? '&' : '?';
		return url + separator + 'hntp=' + Date.now();
	}

	function pickNext(urls, randomize) {
		if (!urls.length) return null;
		if (randomize) {
			if (urls.length === 1) return urls[0];
			var next;
			do { next = Math.floor(Math.random() * urls.length); } while (next === currentIndex);
			currentIndex = next;
			return urls[next];
		}
		currentIndex = (currentIndex + 1) % urls.length;
		return urls[currentIndex];
	}

	function applyNext() {
		if (window.HumbleLiveBackground && HumbleLiveBackground.isActive && HumbleLiveBackground.isActive())
			return false;

		var urls = readUrls();
		if (!urls.length) return false;

		var randomize = localStorage.getItem('options.background_rotation_random') !== '0';
		var selected = pickNext(urls, randomize);
		if (!selected) return false;

		var refreshRemote = localStorage.getItem('options.background_rotation_bust') === '1';
		document.body.style.backgroundImage = 'url("' + (refreshRemote ? cacheBust(selected) : selected) + '")';
		document.body.dataset.rotatingBackground = '1';
		return true;
	}

	function stopTimer() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	function configureTimer() {
		stopTimer();
		var minutes = intervalMinutes();
		if (minutes > 0)
			timer = setInterval(applyNext, Math.max(1, minutes) * 60 * 1000);
	}

	function refresh() {
		configureTimer();
		return applyNext();
	}

	function start() {
		refresh();
	}

	window.addEventListener('load', function() {
		setTimeout(start, 0);
	});

	window.HumbleBackgroundRotation = {
		refresh: refresh,
		applyNext: applyNext,
		readUrls: readUrls
	};
})();
