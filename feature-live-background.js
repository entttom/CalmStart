'use strict';

(function() {
	var DB_NAME = 'HumbleNewTabPage';
	var DB_VERSION = 1;
	var STORE_NAME = 'fileHandles';
	var HANDLE_KEY = 'liveBackground';
	var handle = null;
	var objectUrl = null;
	var lastModified = 0;
	var pollTimer = null;

	function openDb() {
		return new Promise(function(resolve, reject) {
			var request = indexedDB.open(DB_NAME, DB_VERSION);
			request.onupgradeneeded = function() {
				var db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME))
					db.createObjectStore(STORE_NAME);
			};
			request.onsuccess = function() { resolve(request.result); };
			request.onerror = function() { reject(request.error); };
		});
	}

	function dbGet(key) {
		return openDb().then(function(db) {
			return new Promise(function(resolve, reject) {
				var tx = db.transaction(STORE_NAME, 'readonly');
				var request = tx.objectStore(STORE_NAME).get(key);
				request.onsuccess = function() { resolve(request.result || null); };
				request.onerror = function() { reject(request.error); };
			});
		});
	}

	function dbSet(key, value) {
		return openDb().then(function(db) {
			return new Promise(function(resolve, reject) {
				var tx = db.transaction(STORE_NAME, 'readwrite');
				tx.objectStore(STORE_NAME).put(value, key);
				tx.oncomplete = function() { resolve(true); };
				tx.onerror = function() { reject(tx.error); };
			});
		});
	}

	function dbDelete(key) {
		return openDb().then(function(db) {
			return new Promise(function(resolve, reject) {
				var tx = db.transaction(STORE_NAME, 'readwrite');
				tx.objectStore(STORE_NAME).delete(key);
				tx.oncomplete = function() { resolve(true); };
				tx.onerror = function() { reject(tx.error); };
			});
		});
	}

	function setStatus(text, error) {
		var status = document.getElementById('live_background_status');
		if (!status) return;
		status.textContent = text;
		status.classList.toggle('error', !!error);
	}

	function permissionState(fileHandle) {
		if (!fileHandle || !fileHandle.queryPermission) return Promise.resolve('granted');
		return fileHandle.queryPermission({ mode: 'read' }).catch(function() { return 'prompt'; });
	}

	function applyFile(file) {
		if (!file) return;
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = URL.createObjectURL(file);
		lastModified = Number(file.lastModified) || Date.now();
		document.body.style.backgroundImage = 'url("' + objectUrl + '")';
		document.body.dataset.liveBackground = '1';
		setStatus('Live: ' + file.name);
	}

	function readCurrentFile() {
		if (!handle) return Promise.resolve(false);
		return permissionState(handle).then(function(permission) {
			if (permission !== 'granted') {
				setStatus('Permission required — use Reconnect', true);
				return false;
			}
			return handle.getFile().then(function(file) {
				applyFile(file);
				return true;
			});
		}).catch(function(error) {
			console.warn('Could not refresh live background:', error);
			setStatus('Could not read selected file', true);
			return false;
		});
	}

	function poll() {
		if (!handle) return;
		permissionState(handle).then(function(permission) {
			if (permission !== 'granted') return;
			return handle.getFile().then(function(file) {
				if (Number(file.lastModified) !== lastModified)
					applyFile(file);
			});
		}).catch(function() {});
	}

	function startPolling() {
		if (pollTimer) clearInterval(pollTimer);
		pollTimer = setInterval(poll, 15000);
	}

	function chooseFile() {
		if (!('showOpenFilePicker' in window)) {
			setStatus('Live local files are not supported by this browser.', true);
			return Promise.resolve(false);
		}
		return window.showOpenFilePicker({
			id: 'humble-live-background',
			startIn: 'pictures',
			multiple: false,
			types: [{
				description: 'Images',
				accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'] }
			}]
		}).then(function(handles) {
			if (!handles || !handles[0]) return false;
			handle = handles[0];
			return dbSet(HANDLE_KEY, handle).then(function() {
				updateButtons();
				startPolling();
				return readCurrentFile();
			});
		}).catch(function(error) {
			if (error && error.name !== 'AbortError') {
				console.warn('Live background selection failed:', error);
				setStatus('Could not select file', true);
			}
			return false;
		});
	}

	function reconnect() {
		if (!handle) return chooseFile();
		if (!handle.requestPermission) return readCurrentFile();
		return handle.requestPermission({ mode: 'read' }).then(function(permission) {
			if (permission === 'granted') return readCurrentFile();
			setStatus('Permission not granted', true);
			return false;
		}).catch(function() {
			return chooseFile();
		});
	}

	function clear() {
		handle = null;
		lastModified = 0;
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl);
			objectUrl = null;
		}
		document.body.style.removeProperty('background-image');
		delete document.body.dataset.liveBackground;
		setStatus('No live file selected');
		updateButtons();
		return dbDelete(HANDLE_KEY).then(function() {
			if (typeof window.onChange === 'function') {
				window.onChange('background_image');
				window.onChange('background_image_file');
			}
			return true;
		});
	}

	function updateButtons() {
		var choose = document.getElementById('choose_live_background');
		var reconnectButton = document.getElementById('reconnect_live_background');
		var clearButton = document.getElementById('clear_live_background');
		if (choose) choose.textContent = handle ? 'Choose another file…' : 'Choose live file…';
		if (reconnectButton) reconnectButton.hidden = !handle;
		if (clearButton) clearButton.disabled = !handle;
	}

	function bindControls() {
		var choose = document.getElementById('choose_live_background');
		var reconnectButton = document.getElementById('reconnect_live_background');
		var clearButton = document.getElementById('clear_live_background');

		if (choose && !choose.dataset.bound) {
			choose.dataset.bound = '1';
			choose.onclick = function() { chooseFile(); return false; };
		}
		if (reconnectButton && !reconnectButton.dataset.bound) {
			reconnectButton.dataset.bound = '1';
			reconnectButton.onclick = function() { reconnect(); return false; };
		}
		if (clearButton && !clearButton.dataset.bound) {
			clearButton.dataset.bound = '1';
			clearButton.onclick = function() { clear(); return false; };
		}
		updateButtons();
	}

	function initialize() {
		bindControls();
		if (!('showOpenFilePicker' in window)) {
			setStatus('Live local files are not supported by this browser.');
			var choose = document.getElementById('choose_live_background');
			if (choose) choose.disabled = true;
			return;
		}
		dbGet(HANDLE_KEY).then(function(savedHandle) {
			handle = savedHandle;
			updateButtons();
			if (!handle) {
				setStatus('No live file selected');
				return;
			}
			readCurrentFile();
			startPolling();
		}).catch(function(error) {
			console.warn('Could not restore live background handle:', error);
			setStatus('Could not restore saved file', true);
		});
	}

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', initialize);
	else
		initialize();

	window.HumbleLiveBackground = {
		choose: chooseFile,
		reconnect: reconnect,
		clear: clear,
		refresh: readCurrentFile,
		isActive: function() { return !!handle; }
	};
})();
