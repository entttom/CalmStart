'use strict';

(function() {
	var FORECAST_ORIGIN = 'https://api.open-meteo.com/*';
	var GEOCODE_ORIGIN = 'https://geocoding-api.open-meteo.com/*';
	var CACHE_KEY = 'weather.cache';
	var CACHE_MAX_AGE = 30 * 60 * 1000;
	var timer = null;
	var element = null;

	function getSetting(key, fallback) {
		var raw = localStorage.getItem('options.' + key);
		return raw == null ? fallback : raw;
	}

	function enabled() {
		return Number(getSetting('weather_enabled', 0)) !== 0;
	}

	function locationText() {
		return String(getSetting('weather_location', '') || '').trim();
	}

	function units() {
		return getSetting('weather_units', 'celsius') === 'fahrenheit' ? 'fahrenheit' : 'celsius';
	}

	function requestPermission() {
		if (!chrome.permissions || !chrome.permissions.request) return Promise.resolve(false);
		return new Promise(function(resolve) {
			chrome.permissions.request({ origins: [FORECAST_ORIGIN, GEOCODE_ORIGIN] }, function(granted) {
				if (chrome.runtime && chrome.runtime.lastError) {
					console.warn('Weather permission request failed:', chrome.runtime.lastError.message);
					resolve(false);
					return;
				}
				resolve(!!granted);
			});
		});
	}

	function hasPermission() {
		if (!chrome.permissions || !chrome.permissions.contains) return Promise.resolve(false);
		return new Promise(function(resolve) {
			chrome.permissions.contains({ origins: [FORECAST_ORIGIN, GEOCODE_ORIGIN] }, function(granted) {
				resolve(!!granted);
			});
		});
	}

	function weatherLabel(code) {
		code = Number(code);
		if (code === 0) return ['☀️', 'Clear'];
		if (code === 1) return ['🌤️', 'Mainly clear'];
		if (code === 2) return ['⛅', 'Partly cloudy'];
		if (code === 3) return ['☁️', 'Overcast'];
		if (code === 45 || code === 48) return ['🌫️', 'Fog'];
		if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return ['🌦️', 'Drizzle'];
		if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) return ['🌧️', 'Rain'];
		if (code === 71 || code === 73 || code === 75 || code === 77) return ['🌨️', 'Snow'];
		if (code === 80 || code === 81 || code === 82) return ['🌦️', 'Rain showers'];
		if (code === 85 || code === 86) return ['🌨️', 'Snow showers'];
		if (code === 95 || code === 96 || code === 99) return ['⛈️', 'Thunderstorm'];
		return ['🌡️', 'Weather'];
	}

	function readCache() {
		try {
			var raw = localStorage.getItem(CACHE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (error) {
			return null;
		}
	}

	function writeCache(value) {
		localStorage.setItem(CACHE_KEY, JSON.stringify(value));
	}

	function ensureElement() {
		if (element) return element;
		element = document.createElement('button');
		element.id = 'humble_weather';
		element.type = 'button';
		element.hidden = true;
		element.title = 'Refresh weather';
		element.onclick = function() {
			refresh(true);
			return false;
		};
		document.body.appendChild(element);
		return element;
	}

	function render(data) {
		var el = ensureElement();
		if (!data || !data.current) {
			el.hidden = true;
			return;
		}
		var info = weatherLabel(data.current.weather_code);
		var suffix = units() === 'fahrenheit' ? '°F' : '°C';
		el.textContent = info[0] + ' ' + Math.round(Number(data.current.temperature_2m)) + suffix + ' · ' + (data.locationName || locationText());
		var condition = window.HumbleI18n && HumbleI18n.t ? HumbleI18n.t('Condition: ' + info[1]) : info[1];
		var refreshLabel = window.HumbleI18n && HumbleI18n.t ? HumbleI18n.t('Refresh weather') : 'Refresh weather';
		el.title = condition + ' · ' + (data.locationName || locationText()) + ' · ' + refreshLabel;
		el.hidden = false;
	}

	function geocode(name) {
		var lang = (window.HumbleI18n && HumbleI18n.language ? HumbleI18n.language() : navigator.language || 'en').slice(0,2).toLowerCase();
		var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name) + '&count=1&language=' + encodeURIComponent(lang) + '&format=json';
		return fetch(url).then(function(response) {
			if (!response.ok) throw new Error('Geocoding HTTP ' + response.status);
			return response.json();
		}).then(function(json) {
			var item = json && json.results && json.results[0];
			if (!item) throw new Error('Location not found');
			return {
				latitude: item.latitude,
				longitude: item.longitude,
				name: [item.name, item.admin1, item.country].filter(Boolean).join(', ')
			};
		});
	}

	function forecast(location) {
		var unitParam = units() === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
		var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(location.latitude) +
			'&longitude=' + encodeURIComponent(location.longitude) +
			'&current=temperature_2m,weather_code&timezone=auto' + unitParam;
		return fetch(url).then(function(response) {
			if (!response.ok) throw new Error('Forecast HTTP ' + response.status);
			return response.json();
		}).then(function(json) {
			return {
				at: Date.now(),
				query: locationText(),
				units: units(),
				locationName: location.name,
				current: json.current || null
			};
		});
	}

	function refresh(force) {
		var el = ensureElement();
		if (!enabled()) {
			el.hidden = true;
			return Promise.resolve(false);
		}
		var query = locationText();
		if (!query) {
			el.textContent = 'Weather: set a location';
			el.hidden = false;
			return Promise.resolve(false);
		}

		var cached = readCache();
		if (!force && cached && cached.query === query && cached.units === units() && Date.now() - Number(cached.at || 0) < CACHE_MAX_AGE) {
			render(cached);
			return Promise.resolve(true);
		}

		el.textContent = 'Weather…';
		el.hidden = false;
		return hasPermission().then(function(granted) {
			if (!granted) throw new Error('Permission required');
			return geocode(query);
		}).then(forecast).then(function(data) {
			writeCache(data);
			render(data);
			return true;
		}).catch(function(error) {
			console.warn('Weather refresh failed:', error);
			if (cached && cached.current) render(cached);
			else {
				el.textContent = 'Weather unavailable';
				el.hidden = false;
			}
			return false;
		});
	}

	function restart() {
		if (timer) clearInterval(timer);
		timer = null;
		refresh(false);
		if (enabled())
			timer = setInterval(function() { refresh(false); }, 10 * 60 * 1000);
	}

	function enableFromUserGesture() {
		return requestPermission().then(function(granted) {
			if (!granted) return false;
			restart();
			return true;
		});
	}

	var ready = window.HumbleStorage && window.HumbleStorage.ready;
	if (ready && typeof ready.then === 'function') ready.then(restart);
	else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restart);
	else restart();

	window.HumbleWeather = {
		requestPermission: requestPermission,
		enableFromUserGesture: enableFromUserGesture,
		refresh: refresh,
		restart: restart,
		hasPermission: hasPermission
	};
})();
