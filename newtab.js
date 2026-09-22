'use strict';

var i18nText = function(key, substitutions) {
	if (window.CalmStartI18n && window.CalmStartI18n.t)
		return window.CalmStartI18n.t(key, substitutions);
	return key;
};

var FAVORITES_STORAGE_KEY = 'calmstart.favorites';
var RECENT_LINKS_STORAGE_KEY = 'calmstart.recentLinks';
var FOLDER_APPEARANCE_STORAGE_KEY = 'calmstart.folderAppearance';
var PROFILES_STORAGE_KEY = 'calmstart.profiles';
var ACTIVE_PROFILE_STORAGE_KEY = 'calmstart.activeProfile';

function readJsonState(key, fallback) {
	try {
		var value = localStorage.getItem(key);
		return value ? JSON.parse(value) : fallback;
	} catch (error) {
		return fallback;
	}
}

function writeJsonState(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function favoriteItems() {
	var items = readJsonState(FAVORITES_STORAGE_KEY, []);
	return Array.isArray(items) ? items.filter(function(item) { return item && item.url; }) : [];
}

function isFavorite(node) {
	return !!node && !!node.url && favoriteItems().some(function(item) { return item.url === node.url; });
}

function toggleFavorite(node) {
	if (!node || !node.url) return;
	var items = favoriteItems();
	var index = items.findIndex(function(item) { return item.url === node.url; });
	if (index >= 0) items.splice(index, 1);
	else items.unshift({ url: node.url, title: node.title || node.url });
	writeJsonState(FAVORITES_STORAGE_KEY, items.slice(0, 50));
	loadColumns();
}

function recentLinkItems() {
	var items = readJsonState(RECENT_LINKS_STORAGE_KEY, []);
	return Array.isArray(items) ? items.filter(function(item) { return item && item.url; }) : [];
}

function recordRecentlyOpened(node) {
	if (!getConfig('show_opened') && !getConfig('sync_recent_links')) return;
	if (!node || !node.url || /^chrome:\/\/newtab\/?$/.test(node.url)) return;
	var now = Date.now();
	var items = recentLinkItems().filter(function(item) { return item.url !== node.url; });
	items.unshift({ url: node.url, title: node.title || node.url, openedAt: now });
	writeJsonState(RECENT_LINKS_STORAGE_KEY, items.slice(0, 100));
}

function folderAppearance() {
	var value = readJsonState(FOLDER_APPEARANCE_STORAGE_KEY, {});
	return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function applyFolderAppearance(node, anchor, icon) {
	if (!node || !node.children || !getConfig('enable_folder_appearance')) return;
	var appearance = folderAppearance()[node.id];
	if (!appearance) return;
	if (/^#[0-9a-f]{6}$/i.test(appearance.color || '')) {
		anchor.classList.add('custom-folder-color');
		anchor.style.setProperty('--cs-folder-color', appearance.color);
	}
	if (appearance.icon) {
		icon.classList.add('custom-folder-icon');
		icon.textContent = String(appearance.icon).slice(0, 12);
		icon.removeAttribute('src');
		icon.style.backgroundImage = 'none';
	}
}

function setFolderIcon(node) {
	var appearances = folderAppearance();
	var current = appearances[node.id] || {};
	var icon = window.prompt(i18nText('Folder icon (emoji or short text)'), current.icon || '');
	if (icon === null) return;
	appearances[node.id] = { icon: icon.trim().slice(0, 12), color: current.color || '' };
	writeJsonState(FOLDER_APPEARANCE_STORAGE_KEY, appearances);
	loadColumns();
}

function setFolderColor(node, anchor) {
	var picker = document.createElement('input');
	picker.type = 'color';
	picker.value = (folderAppearance()[node.id] || {}).color || '#277d83';
	picker.style.position = 'fixed';
	picker.style.left = '-1000px';
	document.body.appendChild(picker);
	picker.onchange = function() {
		var appearances = folderAppearance();
		var current = appearances[node.id] || {};
		appearances[node.id] = { icon: current.icon || '', color: picker.value };
		writeJsonState(FOLDER_APPEARANCE_STORAGE_KEY, appearances);
		document.body.removeChild(picker);
		loadColumns();
	};
	picker.onblur = function() {
		setTimeout(function() { if (picker.parentNode) picker.parentNode.removeChild(picker); }, 50);
	};
	picker.click();
}

function clearFolderAppearance(node) {
	var appearances = folderAppearance();
	delete appearances[node.id];
	writeJsonState(FOLDER_APPEARANCE_STORAGE_KEY, appearances);
	loadColumns();
}

function addLinkHandlers(node, anchor) {
	if (!node || !node.url) return;
	anchor.addEventListener('click', function(event) {
		if (!event.defaultPrevented) recordRecentlyOpened(node);
	});
	anchor.addEventListener('auxclick', function(event) {
		if (event.button === 1 && !event.defaultPrevented) recordRecentlyOpened(node);
	});
	anchor.oncontextmenu = function(event) {
		renderMenu([{
			label: i18nText(isFavorite(node) ? 'Remove from favorites' : 'Add to favorites'),
			action: function() { toggleFavorite(node); }
		}], event.pageX, event.pageY);
		return false;
	};
}

// render a single bookmark node
function render(node, target) {
	if (node.description == 'separator') return;

	var li = document.createElement('li');
	var a = document.createElement('a');

	var url = node.url;
	if (url)
		a.href = url;
	else
		a.tabIndex = 0;

	var text = node.title || node.name || '';
	if (!text && node.title === null) text = node.url || '';
	a.innerText = text;

	if (node.tooltip) a.title = node.tooltip;
	setClass(a, node);

	var icon = getIcon(node);
	a.insertBefore(icon, a.firstChild);
	applyFolderAppearance(node, a, icon);

	if (node.action) {
		a.onclick = function(event) {
			return node.action(event);
		};
	} else if (url) {
		var newtab = getConfig('newtab');
		if (newtab == 1) {
			// new foreground tab
			a.target = '_blank';
		} else if (newtab == 2) {
			// new background tab
			a.onclick = function(e) {
				openLink(node, newtab);
				return false;
			};
		}
		// fix opening chrome:// and file:/// urls
		var urlStart = url.substring(0, 6);
		if (urlStart === 'chrome' || urlStart === 'file:/'){
			a.onclick = function(e) {
				openLink(node, newtab || (e.ctrlKey ? 2 : 0));
				return false;
			};
			a.onauxclick = function(e) {
				if (e.button == 1) {
					openLink(node, 2);
					return false;
				}
			}
		}
	} else if (!node.children)
		a.style.pointerEvents = 'none';

	if (url)
		addLinkHandlers(node, a);

	li.appendChild(a);

	// folder
	if (node.children) {
		// render children
		if (a.open || getConfig('remember_open') && localStorage.getItem('open.' + node.id)) {
			setClass(a, node, true);
			a.open = true;
			getChildrenFunction(node)(function(result) {
				renderAll(result, li);
			});
		}

		// click handlers
		addFolderHandlers(node, a);
		enableDragFolder(node, a);

	} else if (node.id == 'apps')
		enableDragFolder(node, a);

	target.appendChild(li);
	return li;
}

// render an array of bookmark nodes
function renderAll(nodes, target, toplevel) {
	var ul = document.createElement('ul');
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		// skip extensions and duplicated child folders
		if (toplevel || !coords[node.id])
			render(node, ul);
	}
	if (ul.childNodes.length === 0)
		render({ id: 'empty', title: i18nText('< Empty >') }, ul);
	if (toplevel)
		target.appendChild(ul);
	else {
		// wrap child ul for animation
		var wrap = document.createElement('div');
		wrap.appendChild(ul);
		target.appendChild(wrap);
	}
	updateTooltips();
	return ul;
}

// render column with given index
function renderColumn(index, target) {
	var ids = columns[index];
	if (ids.length == 1 && !getConfig('show_root'))
		getChildrenFunction({id: ids[0]})(function(result) {
			renderAll(result, target);
			addColumnHandlers(index, target);
		});
	else if (ids.length > 0) {
		var i = 0;
		var nodes = [];
		// get all nodes for column
		var callback = function(result) {
			for (var j = 0; j < result.length; j++)
				nodes.push(result[j]);
			i++;
			if (i < ids.length)
				getSubTree(ids[i], callback);
			else {
				// render node list
				renderAll(nodes, target, true);
				addColumnHandlers(index, target);
			}
		};
		getSubTree(ids[i], callback);
	}
}

// render all columns to main div
function renderColumns() {
	// clear main div
	var target = document.getElementById('main');
	while (target.hasChildNodes())
		target.removeChild(target.lastChild);

	// render columns
	for (var i = 0; i < columns.length; i++) {
		var column = document.createElement('div');
		column.className = 'column';
		column.style.width = (1 / columns.length) * 100 + '%';

		// enable drag and drop
		enableDragColumn(i, column);

		target.appendChild(column);
		renderColumn(i, column);
	}

	enableDragDrop();
	setTimeout(applyPreferredProfileOnce, 0);
}

// enables click and context menu for given folder
function addFolderHandlers(node, a) {
	// click handler
	a.onclick = function() {
		toggle(node, a, getChildrenFunction(node));
		return false;
	};

	// context menu handler
	var items = getMenuItems(node);

	// column layout items
	if (!getConfig('lock')) {
		items.push(null);// spacer
		items.push({
			label: i18nText('Create new column'),
			action: function() {
				addColumn([node.id]);
			}
		});

		if (coords[node.id]) {
			var pos = coords[node.id];
			if (pos.y > 0)
				items.push({
					label: i18nText('Move folder up'),
					action: function() {
						addRow(node.id, pos.x, pos.y - 1);
					}
				});
			if (pos.y < columns[pos.x].length - 1)
				items.push({
					label: i18nText('Move folder down'),
					action: function() {
						addRow(node.id, pos.x, pos.y + 2);
					}
				});
			if (pos.x > 0)
				items.push({
					label: i18nText('Move folder left'),
					action: function() {
						addRow(node.id, pos.x - 1);
					}
				});
			if (pos.x < columns.length - 1)
				items.push({
					label: i18nText('Move folder right'),
					action: function() {
						addRow(node.id, pos.x + 1);
					}
				});
			if (root.indexOf(node.id) < 0)
				items.push({
					label: i18nText('Remove folder'),
					action: function() {
						removeRow(pos.x, pos.y);
					}
				});
		}
	}

	a.oncontextmenu = function(event) {
		renderMenu(items, event.pageX, event.pageY);
		return false;
	};
}

// enables context menu for given column
function addColumnHandlers(index, ul) {
	var items = [];
	var ids = columns[index];

	// single folder items
	if (ids.length == 1)
		items = getMenuItems({id: ids[0]});

	// column layout items
	if (!getConfig('lock') && columns.length > 1) {
		items.push(null);// spacer
		if (index > 0)
			items.push({
				label: i18nText('Move column left'),
				action: function() {
					addColumn(ids, index - 1);
				}
			});
		if (index < columns.length - 1)
			items.push({
				label: i18nText('Move column right'),
				action: function() {
					addColumn(ids, index + 2);
				}
			});
		items.push({
			label: i18nText('Remove column'),
			action: function() {
				removeColumn(index);
			}
		});
		if (ids.length == 1) {
			if (index > 0)
				items.push({
					label: i18nText('Move folder left'),
					action: function() {
						addRow(ids[0], index - 1);
					}
				});
			if (index < columns.length - 1)
				items.push({
					label: i18nText('Move folder right'),
					action: function() {
						addRow(ids[0], index + 1);
					}
				});
		}
	}

	if (items.length > 0)
		ul.oncontextmenu = function(event) {
			if (event.target.tagName == 'A' || event.target.parentNode.tagName == 'A')
				return true;
			renderMenu(items, event.pageX, event.pageY);
			return false;
		};
}

// gets context menu items for given node
function getMenuItems(node) {
	var items = [];
	if (Number(node.id) && getConfig('enable_folder_appearance')) {
		items.push({
			label: i18nText('Set folder icon…'),
			action: function() { setFolderIcon(node); }
		});
		items.push({
			label: i18nText('Choose folder color'),
			action: function() { setFolderColor(node); }
		});
		if (folderAppearance()[node.id]) {
			items.push({
				label: i18nText('Reset folder appearance'),
				action: function() { clearFolderAppearance(node); }
			});
		}
		items.push(null);
	}
		items.push({
			label: i18nText('Open all links in folder'),
			action: function() {
				openLinks(node);
			}
		});
	if (node.id == 'closed')
		items.push({
			label: i18nText('Clear browsing data'),
			action: function() {
				openLink({ url: 'chrome://settings/clearBrowserData' }, 1);
			}
		});
	if (node.id == 'devices')
		items.push({
			label: i18nText('History'),
			action: function() {
				openLink({ url: 'chrome://history' }, 1);
			}
		});
	if (Number(node.id))
		items.push({
			label: i18nText('Edit bookmarks'),
			action: function() {
				openLink({ url: 'chrome://bookmarks/?id=' + node.id }, 1);
			}
		});
	return items;
}

// wraps click handler for menu items
function onMenuClick(item) {
	return function() {
		item.action();
		return false;
	};
}

// renders a popup menu at given coordinates
function renderMenu(items, x, y) {
	var ul = document.createElement('ul');
	ul.className = 'menu';
	for (var i = 0; i < items.length; i++) {
		var li = document.createElement('li');
		if (items[i]) {
			var a = document.createElement('a');
			a.innerText = items[i].label;
			a.tabIndex = 0;
			a.onclick = onMenuClick(items[i]);

			li.appendChild(a);
		} else if (i > 0 && i < items.length - 1)
			li.appendChild(document.createElement('hr'));
		else
			continue;

		ul.appendChild(li);
	}
	document.body.appendChild(ul);
	ul.style.left = Math.max(Math.min(x, window.innerWidth + window.scrollX - ul.clientWidth), 0) + 'px';
	ul.style.top = Math.max(Math.min(y, window.innerHeight + window.scrollY - ul.clientHeight), 0) + 'px';
	ul.onmousedown = function(event) {
		event.stopPropagation();
		return true;
	};

	setTimeout(function() {
		document.onclick = function() {
			closeMenu(ul);
			return true;
		};
		document.onmousedown = function() {
			closeMenu(ul);
			return true;
		};
		document.oncontextmenu = function() {
			closeMenu(ul);
			return true;
		};
		document.onkeydown = function(event) {
			if (event.keyCode == 27)
				closeMenu(ul);
			return true;
		};
	}, 20);
	return ul;
}

// removes the given popup menu
function closeMenu(ul) {
	document.body.removeChild(ul);
	document.onclick = null;
	document.onmousedown = null;
	document.oncontextmenu = null;
	document.onkeydown = null;
}

var dragIds;

// enable drag and drop of column
function enableDragColumn(id, column) {
	if (getConfig('lock'))
		return;

	column.draggable = true;

	column.ondragstart = function(event) {
		dragIds = columns[id];
		event.dataTransfer.effectAllowed = 'move';
		this.classList.add('dragstart');
	};
	column.ondragend = function(event) {
		dragIds = null;
		this.classList.remove('dragstart');
		clearDropTarget();
	};
}

var dropTarget;

// enable drag and drop of folder
function enableDragFolder(node, a) {
	if (getConfig('lock'))
		return;

	a.draggable = true;
	a.ondragstart = function(event) {
		dragIds = [node.id];
		event.stopPropagation();
		event.dataTransfer.effectAllowed = 'move copy';
		this.classList.add('dragstart');
	};
	a.ondragend = function(event) {
		dragIds = null;
		this.classList.remove('dragstart');
		clearDropTarget();
	};
}

// init drag and drop handlers
function enableDragDrop() {
	var main = document.getElementById('main');

	if (getConfig('lock')) {
		main.ondragover = null;
		main.ondragleave = null;
		main.ondrop = null;
		return;
	}

	main.ondragover = function(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		// highlight drop target
		var target = getDropTarget(event);
		if (target) {
			clearDropTarget();
			dropTarget = target;
			var bordercss = 'solid 2px ' + getConfig('font_color');
			if (target.tagName == 'LI' || target.tagName == 'UL') {
				if (isAbove(event.pageY, target)) {
					target.style.borderBottom = bordercss;
					target.style.margin = '0 0 -2px 0';
				} else {
					target.style.borderTop = bordercss;
					target.style.margin = '-2px 0 0 0';
				}
			} else if (target.className == 'column') {
				if (event.pageX - target.offsetLeft > target.clientWidth / 2) {
					target.style.borderRight = bordercss;
					target.style.margin = '0';
				} else {
					target.style.borderLeft = bordercss;
					target.style.margin = '0 2px 0 -2px';
				}
			}
		}
		return false;
	};

	main.ondragleave = function(event) {
		clearDropTarget();
	};

	main.ondrop = function(event) {
		event.stopPropagation();

		var target = getDropTarget(event);
		if (!target)
			return false;

		// calculate drop coordinates
		var x = getDropX(target, event);
		var y = getDropY(target, event);

		if (dragIds.length == 1 && y != null)
			addRow(dragIds[0], x, y);
		else {
			if (event.pageX - target.offsetLeft > target.clientWidth / 2)
				x++;
			addColumn(dragIds, x);
		}

		return false;
	};
}

// gets proper drop target element
function getDropTarget(event) {
	if (!dragIds)
		return null;
	var target = event.target;
	if (target && (target.tagName == 'A' || target.parentNode.tagName == 'A') && dragIds.length == 1) {
		// get parent folder until toplevel
		while (target &&
			target.parentNode.parentNode &&
			target.parentNode.parentNode.className != 'column') {
			// target should be LI
			target = target.parentNode;
		}
		// if single-folder column, get the UL
		if (target && target.tagName == 'LI' &&
			columns[getDropX(target, event)].length == 1)
			target = target.parentNode;
		// target should be LI or UL by here...
	} else
		while (target && target.className != 'column')
			target = target.parentNode;// target column

	return target;
}

// gets x coordinate of drop target
function getDropX(target, event) {
	var x = null;
	while (target && target.className != 'column')
		target = target.parentNode;
	if (target) {
		x = 0;
		for (; target.previousSibling; x++)
			target = target.previousSibling;
	}
	return x;
}

// gets y coordinate of drop target
function getDropY(target, event) {
	var y = null;
	if (target.tagName == 'LI') {
		y = 0;
		if (isAbove(event.pageY, target))
			y++;
		for (; target.previousSibling; y++)
			target = target.previousSibling;
	} else if (target.tagName == 'UL') {
		y = 0;
		if (isAbove(event.pageY, target))
			y++;
	}
	return y;
}

// returns true if y position is above target element midpoint
function isAbove(pageY, target) {
	return pageY - window.scrollY - target.getBoundingClientRect().top > target.clientHeight / 2;
}

// clears droptarget styles
function clearDropTarget() {
	if (dropTarget) {
		dropTarget.style.border = null;
		dropTarget.style.margin = null;
	}
	dropTarget = null;
}

var tooltipTimeout = null;
// adds tootlips to truncated text
function updateTooltips() {
	if (tooltipTimeout) clearTimeout(tooltipTimeout);

	tooltipTimeout = setTimeout(function() {
		tooltipTimeout = null;
		var elements = document.querySelectorAll('#main li a');
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			if (element.clientWidth + 1 < element.scrollWidth) {
				element.title = element.title || element.textContent;
			} else if (element.title === element.textContent) {
				element.title = '';
			}
		}
	}, 100);
}

// gets function that returns children of node
function getChildrenFunction(node) {
	switch(node.id) {
		case 'favorites':
			return function(callback) {
				callback(favoriteItems().slice(0, getConfig('number_favorites')));
			};
		case 'opened':
			return function(callback) {
				callback(recentLinkItems().slice(0, getConfig('number_opened')));
			};
		case 'top':
			return function(callback) {
				if (chrome.topSites)
					chrome.topSites.get(function(result) {
						callback(result.slice(0, getConfig('number_top')));
					});
				else
					callback([]);
			};
		case 'recent':
			return function(callback) {
				chrome.bookmarks.getRecent(getConfig('number_recent'), function(result) {
					callback(result);
				});
			};
		case 'closed':
			return function(callback) {
				getClosed(function(result) {
					callback(result);
				});
			};
		case 'devices':
			return function(callback) {
				getDevices(function(result) {
					callback(result);
				});
			};
		default:
			if (node.children)
				return function(callback) {
					callback(node.children);
				};
			else
				return function(callback) {
					chrome.bookmarks.getSubTree(node.id, function(result) {
						if (result)
							callback(result[0].children);
						else {
							// remove missing bookmark locations
							if (coords[node.id])
								removeRow(coords[node.id].x, coords[node.id].y);
						}
					});
				};
	}
}

// gets the subtree for given id
function getSubTree(id, callback) {
	switch(id) {
		case 'favorites':
			callback([{ title: i18nText('Favorites'), id: 'favorites', children: true }]);
			break;
		case 'opened':
			callback([{ title: i18nText('Recently opened'), id: 'opened', children: true }]);
			break;
		case 'top':
			callback([{ title: i18nText('Most visited'), id: 'top', children: true}]);
			break;
		case 'apps':
			callback([{ title: i18nText('Apps'), id: 'apps', url: 'chrome://apps' }]);
			break;
		case 'recent':
			callback([{ title: i18nText('Recent bookmarks'), id: 'recent', children: true }]);
			break;
		case 'closed':
			callback([{ title: i18nText('Recently closed'), id: 'closed', children: true }]);
			break;
		case 'devices':
			callback([{ title: i18nText('Other devices'), id: 'devices', children: true }]);
			break;
		default:
			chrome.bookmarks.getSubTree(id, function(result) {
				if (result)
					callback(result);
				else {
					// remove missing bookmark locations
					if (coords[id])
						removeRow(coords[id].x, coords[id].y);
				}
			});
	}
}

// sets css classes for node
function setClass(target, node, isopen) {
	if (node.className)
		target.classList.add(node.className);
	if (node.children)
		target.classList.add('folder');
	if (isopen)
		target.classList.add('open');
	else
		target.classList.remove('open');

	switch(node.id) {
		case 'favorites':
		case 'opened':
		case 'top':
		case 'apps':
		case 'recent':
		case 'closed':
		case 'devices':
		case 'empty':
			target.classList.add(node.id);
	}
}

// gets best icon for a node
function getIcon(node) {
	var url = null,
		url2x = null;
	if (node.icons) {
		var size;
		for (var i in node.icons) {
			var iconInfo = node.icons[i];
			if (iconInfo.url && (!size || (iconInfo.size < size && iconInfo.size > 15))) {
				url = iconInfo.url;
				if (iconInfo.size > 31) url2x = iconInfo.url;
				size = iconInfo.size;
			}
		}
	} else if (node.icon) {
		url = node.icon;
	} else if (node.url) {
		url = `/_favicon/?pageUrl=${encodeURIComponent(node.url)}&size=16`;
		url2x = `/_favicon/?pageUrl=${encodeURIComponent(node.url)}&size=32`;
	}

	var icon = document.createElement(url ? 'img' : 'div');
	icon.className = 'icon';
	icon.src = url;
	if (url2x) icon.srcset = url2x + ' 2x';
	icon.alt = ' ';
	return icon;
}

// toggle folder open state
function toggle(node, a) {
	var isopen = a.open;
	setClass(a, node, !isopen);
	a.open = !isopen;
	if (isopen) {
		// close folder
		localStorage.removeItem('open.' + node.id);
		if (a.nextSibling){
			// auto-close child folders
			if (getConfig('auto_close')) {
				var children = (a.nextSibling.tagName == 'DIV' ? a.nextSibling.firstChild : a.nextSibling).children;
				for (var i=0; i<children.length; i++) {
					var child = children[i].firstChild;
					if (child.open)
						child.onclick();
				}
			}
			// close folder
			animate(node, a, isopen);
		}
	} else {
		// open folder
		localStorage.setItem('open.' + node.id, true);
		// auto-close sibling folders
		if (getConfig('auto_close')) {
			var siblings = a.parentNode.parentNode.children;
			for (var i=0; i<siblings.length; i++) {
				var sibling = siblings[i].firstChild;
				if (sibling != a && sibling.open)
					sibling.onclick();
			}
		}
		// open folder
		if (a.nextSibling)
			animate(node, a, isopen);
		else
			getChildrenFunction(node)(function(result) {
				if (!a.nextSibling && a.open) {
					renderAll(result, a.parentNode);
					animate(node, a, isopen);
				}
			});
	}
}

// smoothly open or close folder
function animate(node, a, isopen) {
	// TODO: fix nested animations
	// wrapper needed for inner height value
	var wrap = a.nextSibling;
	if (a.animationHandle) {
		// clear last animation
		clearTimeout(a.animationHandle);
		a.animationHandle = null;
	} else {
		// start animation
		wrap.style.height = isopen ? wrap.firstChild.clientHeight + 'px' : 0;
		wrap.style.opacity = isopen ? 1 : 0;
	}
	// requestAnimationFrame twice to ensure at least one frame has passed
	requestAnimationFrame(function() {
		requestAnimationFrame(function() {
			if (wrap) {
				wrap.className = 'wrap';
				wrap.style.height = isopen ? 0 : wrap.firstChild.clientHeight + 'px';
				wrap.style.opacity = isopen ? 0 : 1;
				wrap.style.pointerEvents = isopen ? 'none' : null;
			}
		});
	});

	var duration = scale(getConfig('slide'), .2, 1) * 1000;
	a.animationHandle = setTimeout(function() {
		a.animationHandle = null;
		if (isopen)
			a.parentNode.removeChild(wrap);
		else {
			wrap.className = null;
			wrap.removeAttribute('style');
		}
		wrap = null;
	}, duration);
}

// opens immediate children of given node in new tabs
function openLinks(node) {
	chrome.tabs.getCurrent(function(tab) {
		getChildrenFunction(node)(function(result) {
			for (var i = 0; i < result.length; i++)
				openLink(result[i], 2);
		});
	});
}

// opens given node
function openLink(node, newtab) {
	var url = node.url;
	if (url) {
		recordRecentlyOpened(node);
		chrome.tabs.getCurrent(function(tab) {
			if (newtab)
				chrome.tabs.create({url: url, active: (newtab == 1), openerTabId: tab.id});
			else
				chrome.tabs.update(tab.id, {url: url});
		});
	}
}

var columns; // columns[x][y] = id
var root; // root[] = id
var coords; // coords[id] = {x:x, y:y}
var special = ['favorites', 'opened', 'apps', 'top', 'recent', 'closed', 'devices'];
var profileCaptureTimer = null;
var profileSwitchInProgress = false;
var profileStartupApplied = false;

function profilesEnabled() {
	return !!getConfig('enable_profiles');
}

function profileState() {
	var state = readJsonState(PROFILES_STORAGE_KEY, { v: 1, profiles: [] });
	if (!state || !Array.isArray(state.profiles)) state = { v: 1, profiles: [] };
	return state;
}

function currentPortableColumns() {
	if (window.HumbleSync && HumbleSync.currentPortableLayout)
		return HumbleSync.currentPortableLayout().columns;
	return [];
}

function activeProfileId() {
	return localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY) || '';
}

function findProfile(state, id) {
	return (state.profiles || []).filter(function(profile) { return profile.id === id; })[0] || null;
}

function newProfileId() {
	return 'profile-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function saveProfileState(state) {
	state.v = 1;
	writeJsonState(PROFILES_STORAGE_KEY, state);
}

function ensureProfiles() {
	if (!profilesEnabled()) return false;
	var state = profileState();
	if (!state.profiles.length) {
		state.profiles.push({ id: newProfileId(), name: i18nText('Default'), columns: currentPortableColumns(), updatedAt: Date.now() });
		saveProfileState(state);
	}
	if (!findProfile(state, activeProfileId()))
		localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, state.profiles[0].id);
	refreshProfileControls();
	return true;
}

function applyPreferredProfileOnce() {
	if (profileStartupApplied || !profilesEnabled() || !ensureProfiles()) return;
	var profile = findProfile(profileState(), activeProfileId());
	if (!profile || !window.HumbleSync || !HumbleSync.setResolvedColumns) return;
	profileStartupApplied = true;
	var wanted = HumbleSync.resolvePortableLayout(profile.columns || []);
	var wantedHash = HumbleSync.layoutHash(profile.columns || []);
	var currentHash = HumbleSync.currentPortableLayout().hash;
	if (currentHash === wantedHash) return;
	profileSwitchInProgress = true;
	HumbleSync.setResolvedColumns(wanted);
	loadColumns();
	setTimeout(function() { profileSwitchInProgress = false; }, 0);
}

function switchProfile(id) {
	if (!profilesEnabled()) return;
	var profile = findProfile(profileState(), id);
	if (!profile || !window.HumbleSync || !HumbleSync.setResolvedColumns) return;
	profileSwitchInProgress = true;
	localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, profile.id);
	HumbleSync.setResolvedColumns(HumbleSync.resolvePortableLayout(profile.columns || []));
	loadColumns();
	setTimeout(function() { profileSwitchInProgress = false; }, 0);
	refreshProfileControls();
}

function scheduleProfileCapture() {
	if (!profilesEnabled() || profileSwitchInProgress) return;
	if (profileCaptureTimer) clearTimeout(profileCaptureTimer);
	profileCaptureTimer = setTimeout(function() {
		profileCaptureTimer = null;
		var state = profileState();
		var profile = findProfile(state, activeProfileId());
		if (!profile) return;
		profile.columns = currentPortableColumns();
		profile.updatedAt = Date.now();
		saveProfileState(state);
		refreshProfileControls();
	}, 400);
}

function createProfile() {
	if (!profilesEnabled()) return;
	var field = document.getElementById('profiles_new_name');
	var name = (field && field.value || '').trim() || i18nText('New profile');
	var state = profileState();
	var profile = { id: newProfileId(), name: name.slice(0, 60), columns: currentPortableColumns(), updatedAt: Date.now() };
	state.profiles.push(profile);
	saveProfileState(state);
	if (field) field.value = '';
	switchProfile(profile.id);
}

function renameCurrentProfile() {
	var field = document.getElementById('profiles_new_name');
	var name = (field && field.value || '').trim();
	if (!name) return;
	var state = profileState();
	var profile = findProfile(state, activeProfileId());
	if (!profile) return;
	profile.name = name.slice(0, 60);
	profile.updatedAt = Date.now();
	saveProfileState(state);
	if (field) field.value = '';
	refreshProfileControls();
}

function deleteCurrentProfile() {
	var state = profileState();
	if (state.profiles.length <= 1) {
		alert(i18nText('At least one profile is required.'));
		return;
	}
	var current = activeProfileId();
	state.profiles = state.profiles.filter(function(profile) { return profile.id !== current; });
	saveProfileState(state);
	switchProfile(state.profiles[0].id);
}

function refreshProfileControls() {
	var controls = document.getElementById('profile_controls');
	if (controls) controls.hidden = !profilesEnabled();
	var select = document.getElementById('profiles_select');
	if (!select) return;
	var state = profileState();
	var selected = activeProfileId();
	select.innerHTML = '';
	state.profiles.forEach(function(profile) {
		var option = document.createElement('option');
		option.value = profile.id;
		option.textContent = profile.name || i18nText('Untitled profile');
		option.selected = profile.id === selected;
		select.appendChild(option);
	});
}

function initProfileControls() {
	var select = document.getElementById('profiles_select');
	if (!select || select.dataset.bound) return;
	select.dataset.bound = '1';
	select.onchange = function() { switchProfile(select.value); };
	document.getElementById('profiles_create').onclick = function() { createProfile(); return false; };
	document.getElementById('profiles_rename').onclick = function() { renameCurrentProfile(); return false; };
	document.getElementById('profiles_delete').onclick = function() { deleteCurrentProfile(); return false; };
	ensureProfiles();
	refreshProfileControls();
}

// ensure root folders are included
function verifyColumns() {
	// default layout
	if (columns.length === 0) {
		columns.push([]);
		columns.push(special.filter(function(a) {
			return getConfig('show_' + a) != false;
		}));
	}

	// find missing root items
	var missing = root.slice(0);
	for (var x = 0; x < columns.length; x++) {
		for (var y = 0; y < columns[x].length; y++) {
			var i = missing.indexOf(columns[x][y]);
			if (i > -1)
				missing.splice(i, 1);
		}
	}

	// add missing root items
	var column = columns[0];
	for (var i = 0; i < missing.length; i++) {
		if (getConfig('show_' + missing[i]) != false)
			column.push(missing[i]);
	}

	// populate coordinate map
	coords = {};
	for (var x = 0; x < columns.length; x++) {
		for (var y = 0; y < columns[x].length; y++) {
			coords[columns[x][y]] = { x: x, y: y};
		}
		if (columns[x].length === 0) {
			columns.splice(x, 1);
			x--;
		}
	}
}

// load columns from storage or default
function loadColumns() {
	columns = [];
	for (var x = 0; ; x++) {
		var row = [];
		for (var y = 0; ; y++) {
			var id = localStorage.getItem('column.' + x + '.' + y);
			if (id) row.push(id); else break;
		}
		if (row.length > 0) columns.push(row); else break;
	}

	if (root) {
		verifyColumns();
		renderColumns();
	} else {
		chrome.bookmarks.getTree(function(result) {
			// init root nodes
			var nodes = result[0].children;
			root = special.slice(0);

			for (var i = 0; i < nodes.length; i++)
				root.push(nodes[i].id);

			verifyColumns();
			renderColumns();
		});
	}
}

// saves current column configuration to storage
function saveColumns() {
	// clear previous config
	for (var x = 0; ; x++) {
		for (var y = 0; ; y++) {
			var id = localStorage.getItem('column.' + x + '.' + y);
			if (id)
				localStorage.removeItem('column.' + x + '.' + y);
			else
				break;
		}
		if (y === 0)
			break;
	}
	verifyColumns();
	// save new config
	for (var x = 0; x < columns.length; x++) {
		for (var y = 0; y < columns[x].length; y++) {
			localStorage.setItem('column.' + x +'.' + y, columns[x][y]);
		}
	}
	// refresh
	loadColumns();
	scheduleProfileCapture();
}

// creates and saves a new column
function addColumn(ids, index) {
	var column = ids.slice(0);
	// remove previous locations
	for (var x = 0; x < columns.length; x++) {
		for (var y = 0; y < columns[x].length; y++ ) {
			if (ids.indexOf(columns[x][y]) > -1) {
				columns[x].splice(y, 1);
				y--;
			}
		}
	}
	// insert new id
	if (index == null)
		index = columns.length;
	columns.splice(Math.min(index, columns.length), 0, column);

	// save
	saveColumns();
}

// removes given column
function removeColumn(index) {
	columns.splice(index, 1);
	saveColumns();
}

// creates and saves a new row
function addRow(id, xpos, ypos) {
	if (ypos == null)
		ypos = columns[xpos].length;

	// remove previous locations
	for (var x = 0; x < columns.length; x++) {
		var i = columns[x].indexOf(id);
		if (i > -1) {
			columns[x].splice(i, 1);
			if (x == xpos && ypos > i)
				ypos--;
		}
		if (columns[x].length === 0) {
			columns.splice(x, 1);
			x--;
			if (xpos > x)
				xpos--;
		}
	}
	// insert new id
	columns[xpos].splice(Math.min(ypos, columns[xpos].length), 0, id);

	// save
	saveColumns();
}

// removes given row
function removeRow(xpos, ypos) {
	columns[xpos].splice(ypos, 1);
	saveColumns();
}

// get recently closed tabs
function getClosed(callback) {
	var maxResults = getConfig('number_closed');
	chrome.sessions.getRecentlyClosed({ maxResults: maxResults }, function(sessions) {
		var nodes = [];
		for (var i = 0; i < sessions.length && i < maxResults; i++) {
			(function(session) {
				if (session.window && session.window.tabs.length == 1)
					session.tab = session.window.tabs[0];

				nodes.push({
					title: session.tab ? session.tab.title : session.window.tabs.length + ' Tabs',
					url: session.tab ? session.tab.url : null,
					className: session.window ? 'window' : null,
					action: function() {
						chrome.sessions.restore(session.window ? session.window.sessionId : session.tab.sessionId, function(session) {
							refreshClosed();
						});
						return false;
					}
				});
			})(sessions[i]);
		}
		callback(nodes);
	});
}

function getDevices(callback) {
	chrome.sessions.getDevices({ maxResults: getConfig('number_closed') }, function(devices) {
		var nodes = [];
		for (var i = 0; i < devices.length; i++) {
			(function(device) {
				var children = [];
				for (var j = 0; j < device.sessions.length; j++) {
					var session = device.sessions[j];
					var tabs = session.window ? session.window.tabs : [session.tab];
					for (var k = 0; k < tabs.length; k++) {
						children.push({
							title: tabs[k].title,
							url: tabs[k].url
						});
					}
				}
				nodes.push({
					id: 'device.' + device.deviceName,
					title: device.deviceName,
					children: children
				});
			})(devices[i]);
		}
		callback(nodes);
	});
}

// refresh recently closed tab lists
function refreshClosed() {
	var targets = [];
	var folders = document.getElementsByClassName('closed');
	for (var i = 0; i < folders.length; i++) {
		var a = folders[i];
		if (a.nextSibling) {
			a.parentNode.removeChild(a.nextSibling);
			targets.push(a.parentNode);
		}
	}
	if (folders.length === 0 && coords['closed']) {
		var target = document.getElementsByClassName('column')[coords['closed'].x];
		target.removeChild(target.firstChild);
		targets.push(target);
	}

	getChildrenFunction({id: 'closed'})(function(result) {
		for (var i = 0; i < targets.length; i++)
			renderAll(result, targets[i]);
	});
}

// options : default values
var config = {
	font: 'Sans-serif',
	font_size: 16,
	font_weight: 400,
	theme: 'Default',
	font_color: '#555555',
	background_color: '#ffffff',
	highlight_color: '#e4f4ff',
	highlight_font_color: '#000000',
	shadow_color: '#57b0ff',
	background_image_file: '',
	background_image: '',
	background_align: 'left top',
	background_repeat: 'repeat',
	background_size: 'auto',
	shadow_blur: 1,
	highlight_round: 1,
	fade: 1,
	spacing: 1,
	width: 1,
	h_pos: 1,
	v_margin: 1,
	slide: 1,
	hide_options: 0,
	lock: 0,
	show_top: 1,
	show_apps: 1,
	show_favorites: 0,
	show_opened: 0,
	show_recent: 1,
	show_closed: 1,
	show_devices: 1,
	show_root: 0,
	newtab: 0,
	remember_open: 1,
	sync_open_folders: 0,
	sync_favorites: 0,
	sync_recent_links: 0,
	enable_folder_appearance: 0,
	sync_folder_appearance: 0,
	enable_profiles: 0,
	sync_profiles: 0,
	auto_close: 0,
	auto_scale: 1,
	css: '',
	number_top: 10,
	number_favorites: 12,
	number_opened: 10,
	number_closed: 10,
	number_recent: 10,
	search_scope: 'bookmarks_web',
	search_bookmark_source: 'startpage',
	search_display: 'dropdown',
	search_autofocus: 0,
	search_engine: 'google',
	search_custom_pattern: 'https://www.google.com/search?q=%s'
};

// color theme values
var themes = {
	Default: {},
	Classic: {
		font_color: '#000000',
		background_color: '#ffffff',
		highlight_color: '#3399ff',
		highlight_font_color: '#ffffff',
		shadow_color: '#97cbff'
	},
	Dusk: {
		font_color: '#c8b9be',
		background_color: '#56546b',
		highlight_color: '#494d5a',
		highlight_font_color: '#ffd275',
		shadow_color: '#000000'
	},
	Elegant: {
		font_color: '#888888',
		background_color: '#f6f6f6',
		highlight_color: '#ffffff',
		highlight_font_color: '#000000',
		shadow_color: '#aaaaaa'
	},
	Frosty: {
		font_color: '#3e5e82',
		background_color: '#e4eef3',
		highlight_color: '#0080c0',
		highlight_font_color: '#ffffff',
		shadow_color: '#8080ff'
	},
	Hacker: {
		font_color: '#00ff00',
		background_color: '#000000',
		highlight_color: '#00ff00',
		highlight_font_color: '#000000',
		shadow_color: '#ff0000'
	},
	Melon: {
		font_color: '#594526',
		background_color: '#f8ffe1',
		highlight_color: '#ff8000',
		highlight_font_color: '#ffff80',
		shadow_color: '#ff80c0'
	},
	Midnight: {
		font_color: '#bfdfff',
		background_color: '#101827',
		highlight_color: '#000000',
		highlight_font_color: '#80ecff',
		shadow_color: '#0080ff'
	},
	Slate: {
		font_color: '#555555',
		background_color: '#b7babf',
		highlight_color: '#aaaaaa',
		highlight_font_color: '#000000',
		shadow_color: '#2a2a2a'
	},
	Trees: {
		font_color: '#cdd088',
		background_color: '#566157',
		highlight_color: '#4d674b',
		highlight_font_color: '#ffff80',
		shadow_color: '#183010'
	},
	Valentine: {
		font_color: '#895fc2',
		background_color: '#eae1ff',
		highlight_color: '#ffb7f0',
		highlight_font_color: '#f00000',
		shadow_color: '#ffffff'
	},
	Warm: {
		font_color: '#824100',
		background_color: '#ffeedd',
		highlight_color: '#fffae8',
		highlight_font_color: '#800000',
		shadow_color: '#d98764'
	}
};
var theme = {};

// get config value or default
function getConfig(key) {
	var value = localStorage.getItem('options.' + key);
	if (value != null)
		return typeof config[key] === 'number' ? Number(value) : value;
	else
		return (theme.hasOwnProperty(key) ? theme[key] : config[key]);
}

// set config value
function setConfig(key, value) {
	if (value != null)
		localStorage.setItem('options.' + key, typeof config[key] === 'number' ? Number(value) : value);
	else {
		localStorage.removeItem('options.' + key);
		value = (theme.hasOwnProperty(key) ? theme[key] : config[key]);
	}
	// special case settings
	if (key == 'lock' || key == 'newtab' || key == 'show_root' || key == 'enable_folder_appearance' || key == 'enable_profiles' || key.substring(0,6) == 'number')
		loadColumns();
	if (key == 'enable_profiles' && value) {
		if (!getConfig('sync_profiles')) setConfig('sync_profiles', 1);
		setTimeout(function() { ensureProfiles(); }, 0);
	}
	else if (key == 'theme') {
		theme = themes[value];
		for (var i in config) {
			if (i != key) {
				onChange(i);
				showConfig(i);
			}
		}
	} else if (key.substring(0,4) == 'show') {
		var id = key.substring(5);
		if (!value) {
			if (coords[id])
				removeRow(coords[id].x, coords[id].y);
			saveColumns();
		} else {
			saveColumns();
		}
	}
	onChange(key, value);
	if (key === 'enable_profiles' || key === 'sync_profiles') refreshProfileControls();
	if (key.indexOf('search_') === 0)
		window.dispatchEvent(new CustomEvent('calmstart-search-settings-changed'));
	return value;
}

// map config keys to styles
var styles = {};

function getStyle(key, value) {
	switch(key) {
		case 'font':
			return '#main a { font-family: "' + value + '"; }';
		case 'font_size':
			return '#main a { font-size: ' + (value / 10) + 'em; }';
		case 'font_weight':
			return '#main a { font-weight: ' + value + '; }';
		case 'font_color':
			return '#main a { color: ' + value + '; }';
		case 'background_color':
			return 'body { background-color: ' + value + '; }';
		case 'background_image':
			return 'body { background-image: url(' + value + '); }';
		case 'background_image_file':
			return 'body { background-image: url(' + value + '); }';
		case 'background_align':
			return 'body { background-position: ' + value + '; }';
		case 'background_repeat':
			return 'body { background-repeat: ' + value + '; }';
		case 'background_size':
			return 'body { background-size: ' + value + '; }';
		case 'highlight_font_color':
			return '#main a:hover { color: ' + value + '; }';
		case 'highlight_color':
			return '#main a:hover { background-color: ' + value + '; }';
		case 'shadow_color':
			return '#main a:hover { box-shadow: 0 0 ' + scale(getConfig('shadow_blur'), 7, 100) + 'px ' + value + '; }';
		case 'shadow_blur':
			return '#main a:hover { box-shadow: 0 0 ' + scale(value, 7, 100) + 'px ' + getConfig('shadow_color') + '; }';
		case 'highlight_round':
			return '#main a { border-radius: ' + scale(value, .2, 1.5) + 'em; }';
		case 'fade':
			return '#main a { transition-duration: ' + scale(value, .2, 1) + 's; }';
		case 'slide':
			return '.wrap { transition-duration: ' + scale(value, .2, 1) + 's; }';
		case 'spacing':
			return '#main a { line-height: ' + scale(value, 2, 5.6, .8) + '; ' +
							'padding-left: ' + scale(value, .8, 2, .4) + 'em; ' +
							'padding-right: ' + scale(value, .8, 2, .4) + 'em; }';
		case 'width':
			return '#main { width: ' + (getConfig('auto_scale') ?
				scale(value, 80, 100, 20) + '%' :
				scale(value, 1000, 3000, 400) + 'px') + '; }';
		case 'h_pos':
			var margin = 100 - scale(getConfig('width'), 80, 100, 20);
			return '#main { left: ' + scale(value, 0, margin/2, -margin/2) + '%; }';
		case 'v_margin':
			return '#main { margin-top: ' + (getConfig('auto_scale') ?
				scale(value, 5, 20) + '%' :
				scale(value, 80, 600) + 'px') + '; }';
		case 'hide_options':
			return '#options_button { opacity: 0; }';
		case 'css':
			return value;
		case 'auto_scale':
			return value ? null : '#main { margin-top: 80px; width: 1000px; }';
		default:
			return null;
	}
}

// scales input value from [0,1,2] to [min,mid,max]
function scale(value, mid, max, min) {
	min = min || 0;
	return value > 1 ?
		mid + (value - 1) * (max - mid) :
		min + value * (mid - min);
}

// gets rgb representation of hex color
function hexToRgb(hex) {
	hex = /[a-f\d]{6}/i.exec(hex);
	var bigint = parseInt(hex, 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;
	return r + "," + g + "," + b;
}

// apply config value change
function onChange(key, value) {
	if (value == null)
		value = getConfig(key);

	if (value != config[key]) {
		var css = getStyle(key, value);
		if (css) {
			var style;
			if (styles.hasOwnProperty(key))
				style = styles[key];
			else {
				style = document.createElement('style');
				styles[key] = style;
			}
			document.head.appendChild(style);

			// add style rules
			style.innerText = css;
		}
	} else if (styles.hasOwnProperty(key)) {
		// remove rules
		styles[key].parentNode.removeChild(styles[key]);
		delete styles[key];
	}
	// refresh dependent values
	if (key == 'width')
		onChange('h_pos');
	else if (key == 'shadow_blur')
		onChange('shadow_color');
	else if (key == 'auto_scale') {
		onChange('width');
		onChange('v_margin');
	}

	// update options panel
	if (!settingsInitialized)
		return;

	// show/hide default button
	var input = document.getElementById('options_' + key);
	if (input) {
		var isDefault = value == (theme.hasOwnProperty(key) ? theme[key] : config[key]);
		// Some controls do not have a reset button.
		if (input.reset)
			input.reset.style.visibility = (isDefault ? 'hidden' : null);
		if (input.swatch)
			input.swatch.value = value;
	}
}

// loads config settings
function loadSettings() {
	// load theme
	theme = themes[getConfig('theme')] || {};
	// load settings
	for (var key in config)
		if (key === 'background_image_file')
			setTimeout(function() { onChange('background_image_file'); }, 0);
		else
			onChange(key);
}

// apply config values to input controls
function showConfig(key) {
	var input = document.getElementById('options_' + key);
	if (!input || input.type === 'file')
		return;

	input[input.type === 'checkbox' ? 'checked' : 'value'] = getConfig(key);
}

// initialize config settings
function initConfig(key) {
	var input = document.getElementById('options_' + key);
	if (!input)
		return;

	if (input.type == 'color') {
		input.type = 'text';
		input.className = 'color';
		var swatch = document.createElement('input');
		swatch.type = 'color';
		swatch.value = input.value;
		swatch.oninput = function(event) {
			input.value = this.value;
			return input.onchange(event);
		};
		input.swatch = swatch;
		input.parentNode.appendChild(swatch);
	}
	input.onchange = function(event) {
		if (input.type == 'file') {
			// load file
			if (event.target.files.length == 1) {
				var file = event.target.files[0];
				if (file.size > 2097152) {
					input.value = null;
					alert('Image must be less than 2 MB.');
					return false;
				}
				var reader = new FileReader();
				reader.onload = function(f) {
					if (f.target.result)
						setConfig(key, f.target.result);
				};
				reader.readAsDataURL(file);
			}
		} else
			setConfig(key, input.type == 'checkbox' ? Number(input.checked) : input.value);
	};

	// Toggles are reset directly by switching them; no extra reset control.
	if (input.type === 'checkbox' || input.type === 'radio') {
		showConfig(key);
		return;
	}

	var reset = document.createElement('a');
	reset.className = 'revert';
	reset.title = i18nText('Reset to default');
	reset.tabIndex = 0;
	reset.onclick = function() {
		setConfig(key, null);
		showConfig(key);
		return false;
	};

	input.reset = reset;
	input.parentNode.appendChild(reset);
	showConfig(key);
}

var settingsInitialized = false;

// initialize options panel
function initSettings() {
	settingsInitialized = true;

	// options close button
	document.getElementById('options_close_button').onclick = function() {
		showOptions(false);
		return false;
	};

	// options submenu navigation
	var options = document.getElementById('options');
	var nav = document.getElementById('options_nav');
	var index = 0;
	for (var i=0; i<nav.children.length; i++) {
		var a = nav.children[i].firstChild;
		a.onclick = function(e) {
			// clear current style
			nav.children[index].firstChild.classList.remove('current');
			options.getElementsByClassName('section')[index].classList.remove('current');
			// apply new current style
			index = Array.prototype.indexOf.call(nav.children, this.parentNode);
			nav.children[index].firstChild.classList.add('current');
			options.getElementsByClassName('section')[index].classList.add('current');
			// show custom css on advanced tab
			if (index === nav.children.length-1) {
				var allcss = document.getElementById('all_css');
				allcss.value = '';
				for (var key in config) {
					var css = (getStyle(key, getConfig(key)));
					if (css && css.length < 1000 && key != 'css')
						allcss.value += css + '\n';
				}
			}
			// import/export
			if (index === nav.children.length-2) {
				var exports = document.getElementById('options_export');
				var imports = document.getElementById('options_import');
				var replacer = function(key, value) {
					if (key == 'options.background_image_file' || key == 'weather.cache') {
						return undefined;
					}
					return value;
				};
				exports.value = JSON.stringify(localStorage, replacer);
				imports.value = '';
				imports.placeholder = i18nText('Paste exported settings here');
				imports.onchange = function() {
					try {
						var imported = JSON.parse(imports.value);
						for(var key in imported) {
							localStorage.setItem(key, imported[key]);
						}
						imports.value = '';
						imports.placeholder = i18nText('Import successful!');
						exports.value = JSON.stringify(localStorage, replacer);
						loadSettings();
						loadColumns();
					} catch (e) {
						imports.value = '';
						imports.placeholder = i18nText('Import error! Please check if your settings are valid JSON.');
					}
				};
			}
			return false;
		};
	}

	// add options to hide bookmark folders
	chrome.bookmarks.getTree(function(result) {
		var placeholder = document.getElementById('options_show_bookmarks');
		var nodes = result[0].children;
		for (var i = 0; i < nodes.length; i++) {
			var key = 'show_' + nodes[i].id;
			config[key] = 1;

			var span = document.createElement('span');
			span.innerText = nodes[i].title;

			var input = document.createElement('input');
			input.type = 'checkbox';
			input.id = 'options_' + key;

			var label = document.createElement('label');
			label.appendChild(span);
			label.appendChild(input);
			placeholder.appendChild(label);
		}

		// replace text input with system font list
		if (chrome.fontSettings) {
			var input = document.getElementById('options_font');
			var select = document.createElement('select');
			input.parentNode.replaceChild(select, input);
			select.id = input.id;
		}

		// show settings
		for (var key in config)
			initConfig(key);
		initProfileControls();

		loadSettings();

		// load themes
		var select = document.getElementById('options_theme');
		if (select.childNodes.length === 0) {
			for (var i in themes) {
				var option = document.createElement('option');
				option.innerText = i;
				if (i == getConfig('theme'))
					option.selected = 'selected';
				select.appendChild(option);
			}
		}

		// load font list
		if (chrome.fontSettings) {
			chrome.fontSettings.getFontList(function(fonts) {
				var select = document.getElementById('options_font');
				if (select.childNodes.length > 0)
					return;

				fonts.unshift({ fontId: 'Sans-serif' });
				for (var i = 0; i < fonts.length; i++) {
					var font = fonts[i].fontId;
					var option = document.createElement('option');
					option.innerText = font;
					if (font == getConfig('font'))
						option.selected = 'selected';
					select.appendChild(option);
				}
			});
		}
	});
}

// show options panel
function showOptions(show) {
	document.getElementById('options').style.display = show ? 'block' : 'none';
	if (show) {
		if (!settingsInitialized)
			initSettings();
		for (var key in config)
			showConfig(key);
		if (window.HumbleSync && HumbleSync.updateDevelopmentInfo)
			HumbleSync.updateDevelopmentInfo();
	}
}

// initialize page
loadSettings();
loadColumns();

// keyboard shortcuts
document.addEventListener('keydown', function(event) {
	var target = event.target;
	var editable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
	var focusSearch = (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) ||
		((event.metaKey || event.ctrlKey) && event.key && event.key.toLowerCase() === 'k');
	if (!focusSearch || editable) return;
	var search = document.getElementById('calm_search');
	if (!search) return;
	event.preventDefault();
	search.focus({ preventScroll: true });
});
document.addEventListener('keypress', function(event) {
	if (event.keyCode == 13 && event.target && event.target.onclick && event.target.tagName == 'A') {
		event.target.dispatchEvent(new MouseEvent('click'));
		event.preventDefault();
	}
});
document.addEventListener('mousedown', function(event) {
	document.body.classList.add('hide-focus');
});
document.addEventListener('keydown', function(event) {
	document.body.classList.remove('hide-focus');
});

window.onresize = function(event) {
	updateTooltips();
};

// load options panel
document.getElementById('options_button').onclick = function() {
	showOptions(true);
	return false;
};
if (location.search === '?options')
	showOptions(true);

// refresh recently closed
if (chrome.sessions)
	chrome.sessions.onChanged.addListener(refreshClosed);


// CalmStart configurable bookmark + web search
(function initCalmStartSearch() {
	var input = document.getElementById('calm_search');
	var results = document.getElementById('search_results');
	var pageResults = document.getElementById('search_page_results');
	var main = document.getElementById('main');
	var provider = document.getElementById('search_provider');
	if (!input || !results || !pageResults || !main || !chrome.bookmarks) return;

	var matches = [];
	var activeIndex = -1;
	var debounce = null;
	var searchSerial = 0;
	var engines = {
		google: { name: 'Google', pattern: 'https://www.google.com/search?q=%s' },
		duckduckgo: { name: 'DuckDuckGo', pattern: 'https://duckduckgo.com/?q=%s' },
		bing: { name: 'Bing', pattern: 'https://www.bing.com/search?q=%s' }
	};

	function normalize(value) { return (value || '').toLocaleLowerCase(); }
	function webEnabled() { return getConfig('search_scope') !== 'bookmarks'; }
	function pageMode() { return getConfig('search_display') === 'page'; }

	function engineInfo() {
		var key = getConfig('search_engine');
		if (key === 'custom') return { name: 'Custom', pattern: getConfig('search_custom_pattern') || '' };
		return engines[key] || engines.google;
	}

	function validCustomPattern(pattern) {
		return /^https?:\/\//i.test(pattern || '') && pattern.indexOf('%s') !== -1;
	}

	function updateSearchChrome() {
		var web = webEnabled();
		var info = engineInfo();
		provider.textContent = web ? info.name : i18nText('Bookmarks');
		input.placeholder = web ? i18nText('Search bookmarks or the web') : i18nText('Search bookmarks');
		input.setAttribute('aria-label', input.placeholder);

		var bookmarkSourceRow = document.getElementById('search_bookmark_source_row');
		if (bookmarkSourceRow) bookmarkSourceRow.hidden = pageMode();

		var engineFieldset = document.getElementById('search_engine_settings');
		if (engineFieldset) engineFieldset.classList.toggle('settings-disabled', !web);
		var customRow = document.getElementById('search_custom_pattern_row');
		if (customRow) customRow.hidden = getConfig('search_engine') !== 'custom' || !web;
	}

	function restorePage() {
		pageResults.hidden = true;
		pageResults.innerHTML = '';
		main.hidden = false;
		var filtered = main.querySelectorAll('.calm-search-hidden');
		for (var i = 0; i < filtered.length; i++)
			filtered[i].classList.remove('calm-search-hidden');
	}

	function hideDropdown() {
		results.hidden = true;
		results.innerHTML = '';
		matches = [];
		activeIndex = -1;
	}

	function clearSearchResults() {
		hideDropdown();
		restorePage();
	}

	function webSearch(query) {
		if (!webEnabled() || !query) return;
		var info = engineInfo();
		var pattern = info.pattern;
		if (getConfig('search_engine') === 'custom' && !validCustomPattern(pattern)) {
			var custom = document.getElementById('options_search_custom_pattern');
			if (custom) {
				custom.setCustomValidity(i18nText('Enter an http(s) URL containing %s.'));
				custom.reportValidity();
			}
			return;
		}
		var url = pattern.replace(/%s/g, encodeURIComponent(query));
		chrome.tabs.getCurrent(function(tab) {
			if (tab && tab.id != null) chrome.tabs.update(tab.id, {url: url});
			else window.location.href = url;
		});
	}

	function scoreBookmark(node, query) {
		var title = normalize(node.title), url = normalize(node.url), q = normalize(query);
		if (title === q) return 0;
		if (title.indexOf(q) === 0) return 1;
		if (title.indexOf(q) > -1) return 2;
		if (url.indexOf(q) > -1) return 3;
		return 99;
	}

	function sortedMatches(found, query) {
		var filtered = (found || []).filter(function(node) { return !!node.url; });
		filtered.sort(function(a, b) {
			var diff = scoreBookmark(a, query) - scoreBookmark(b, query);
			return diff || (a.title || '').localeCompare(b.title || '');
		});
		return filtered;
	}

	function setActive(index) {
		var rows = results.querySelectorAll('.search-result');
		if (!rows.length) return;
		activeIndex = Math.max(0, Math.min(index, rows.length - 1));
		for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('active', i === activeIndex);
		if (rows[activeIndex]) rows[activeIndex].scrollIntoView({block: 'nearest'});
	}

	function openMatch(index) {
		var node = matches[index];
		if (!node || !node.url) return;
		openLink(node, getConfig('newtab'));
		clearSearchResults();
	}

	function resultRow(node, index) {
		var row = document.createElement('button');
		row.type = 'button';
		row.className = 'search-result';
		var icon = getIcon(node);
		icon.classList.add('search-result-icon');
		row.appendChild(icon);
		var copy = document.createElement('span');
		copy.className = 'search-result-copy';
		var title = document.createElement('span');
		title.className = 'search-result-title';
		title.textContent = node.title || node.url;
		copy.appendChild(title);
		var url = document.createElement('span');
		url.className = 'search-result-url';
		try { url.textContent = new URL(node.url).hostname.replace(/^www\./, ''); }
		catch (e) { url.textContent = node.url; }
		copy.appendChild(url);
		row.appendChild(copy);
		row.addEventListener('click', function() { openMatch(index); });
		return row;
	}

	function renderDropdown(nodes, query) {
		restorePage();
		results.innerHTML = '';
		matches = nodes.slice(0, 7);
		activeIndex = -1;
		for (var i = 0; i < matches.length; i++) results.appendChild(resultRow(matches[i], i));

		if (webEnabled()) {
			var web = document.createElement('button');
			web.type = 'button';
			web.className = 'search-result search-web-result';
			var webIcon = document.createElement('span');
			webIcon.className = 'search-web-icon';
			web.appendChild(webIcon);
			var webText = document.createElement('span');
			webText.className = 'search-result-copy';
			var webTitle = document.createElement('span');
			webTitle.className = 'search-result-title';
			webTitle.textContent = i18nText('Search {engine} for “{query}”', {engine: engineInfo().name, query: query});
			webText.appendChild(webTitle);
			var webHint = document.createElement('span');
			webHint.className = 'search-result-url';
			webHint.textContent = i18nText('Web search');
			webText.appendChild(webHint);
			web.appendChild(webText);
			web.addEventListener('click', function() { webSearch(query); });
			results.appendChild(web);
		}
		results.hidden = results.children.length === 0;
	}

	// Filter the already rendered CalmStart columns in place. This deliberately
	// preserves column widths, folder positions and the normal start-page design.
	function renderPage(nodes) {
		hideDropdown();
		matches = nodes;
		pageResults.hidden = true;
		pageResults.innerHTML = '';
		main.hidden = false;

		var allowed = Object.create(null);
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].url)
				allowed[nodes[i].url] = true;
		}

		var columnsOnPage = main.getElementsByClassName('column');
		for (var c = 0; c < columnsOnPage.length; c++) {
			var links = columnsOnPage[c].getElementsByTagName('a');
			for (var l = 0; l < links.length; l++) {
				var link = links[l];
				var li = link.parentNode && link.parentNode.tagName === 'LI' ? link.parentNode : null;
				if (!li) continue;
				var href = link.getAttribute('href');
				if (href && href !== '#' && !link.classList.contains('folder')) {
					li.classList.toggle('calm-search-hidden', !allowed[link.href] && !allowed[href]);
				}
			}
		}

		// Keep folder/table structure visible, but hide a folder row only when it
		// has a rendered child list and none of those children contains a match.
		var folders = main.querySelectorAll('a.folder');
		for (var f = folders.length - 1; f >= 0; f--) {
			var folderLi = folders[f].parentNode;
			if (!folderLi || folderLi.tagName !== 'LI') continue;
			var childWrap = folders[f].nextSibling;
			if (!childWrap) continue;
			var visibleLink = childWrap.querySelector('li:not(.calm-search-hidden) a[href]');
			folderLi.classList.toggle('calm-search-hidden', !visibleLink);
		}
	}

	function visibleBookmarkRootIds() {
		var ids = [];
		if (!columns) return ids;
		for (var x = 0; x < columns.length; x++) {
			for (var y = 0; y < columns[x].length; y++) {
				var id = columns[x][y];
				if (special.indexOf(id) === -1 && ids.indexOf(id) === -1)
					ids.push(id);
			}
		}
		return ids;
	}

	function collectBookmarkLinks(node, output, seen) {
		if (!node) return;
		if (node.url) {
			if (!seen[node.id]) {
				seen[node.id] = true;
				output.push(node);
			}
			return;
		}
		var children = node.children || [];
		for (var i = 0; i < children.length; i++)
			collectBookmarkLinks(children[i], output, seen);
	}

	// Search only the bookmark folders that are actually part of the
	// current CalmStart layout. Hidden/unplaced bookmark trees are excluded.
	function searchStartPageBookmarks(query, callback) {
		var ids = visibleBookmarkRootIds();
		if (!ids.length) { callback([]); return; }
		var pending = ids.length, all = [], seen = Object.create(null);
		ids.forEach(function(id) {
			chrome.bookmarks.getSubTree(id, function(found) {
				if (found && found[0]) collectBookmarkLinks(found[0], all, seen);
				if (--pending === 0) {
					var q = normalize(query);
					callback(all.filter(function(node) {
						return normalize(node.title).indexOf(q) !== -1 || normalize(node.url).indexOf(q) !== -1;
					}));
				}
			});
		});
	}

	function searchBookmarks(query, callback) {
		// The page filter always works on the visible CalmStart layout. The
		// broader bookmark-source choice is available only for the dropdown.
		if (!pageMode() && getConfig('search_bookmark_source') === 'all')
			chrome.bookmarks.search(query, callback);
		else
			searchStartPageBookmarks(query, callback);
	}

	function runSearch() {
		var query = input.value.trim();
		var serial = ++searchSerial;
		if (!query) { clearSearchResults(); return; }
		searchBookmarks(query, function(found) {
			if (serial !== searchSerial || input.value.trim() !== query) return;
			var nodes = sortedMatches(found, query);
			if (pageMode()) renderPage(nodes);
			else renderDropdown(nodes, query);
		});
	}

	input.addEventListener('input', function() {
		clearTimeout(debounce);
		debounce = setTimeout(runSearch, 80);
	});
	input.addEventListener('keydown', function(event) {
		var rows = results.querySelectorAll('.search-result');
		if (!pageMode() && event.key === 'ArrowDown' && rows.length) {
			event.preventDefault(); setActive(activeIndex + 1);
		} else if (!pageMode() && event.key === 'ArrowUp' && rows.length) {
			event.preventDefault(); setActive(activeIndex <= 0 ? rows.length - 1 : activeIndex - 1);
		} else if (event.key === 'Escape') {
			clearSearchResults(); input.value = ''; input.blur();
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (!pageMode() && !results.hidden && activeIndex >= 0) {
				if (activeIndex < matches.length) openMatch(activeIndex);
				else webSearch(input.value.trim());
			} else if (webEnabled()) webSearch(input.value.trim());
			else if (matches.length) openMatch(0);
		}
	});
	input.addEventListener('focus', function() { if (input.value.trim()) runSearch(); });
	document.addEventListener('mousedown', function(event) {
		var area = document.getElementById('search_area');
		if (!pageMode() && area && !area.contains(event.target)) hideDropdown();
	});
	window.addEventListener('calmstart-search-settings-changed', function() {
		updateSearchChrome();
		if (input.value.trim()) runSearch(); else clearSearchResults();
	});
	updateSearchChrome();
	if (getConfig('search_autofocus'))
		requestAnimationFrame(function() { input.focus({preventScroll: true}); });
})();
