'use strict';

(function() {
	var STORAGE_KEY = 'options.language';
	var observer = null;

	var de = {
		'Options': 'Optionen',
		'Close': 'Schließen',
		'Settings': 'Einstellungen',
		'Appearance': 'Darstellung',
		'Import/Export': 'Import/Export',
		'Advanced': 'Erweitert',
		'Open links in': 'Links öffnen in',
		'Current tab': 'Aktuellem Tab',
		'New tab': 'Neuem Tab',
		'New tab (background)': 'Neuem Tab (Hintergrund)',
		'Lock columns': 'Spalten sperren',
		'Remember open folders': 'Geöffnete Ordner merken',
		'Auto-close folders': 'Ordner automatisch schließen',
		'Show top-level folders': 'Oberste Ordner anzeigen',
		'Hide options button': 'Optionsbutton ausblenden',
		'Content': 'Inhalte',
		'Apps': 'Apps',
		'Most visited': 'Meistbesucht',
		'Number of items': 'Anzahl Einträge',
		'Recent bookmarks': 'Letzte Lesezeichen',
		'Reverse order': 'Reihenfolge umkehren',
		'Sort items alphabetically': 'Einträge alphabetisch sortieren',
		'Recently closed': 'Kürzlich geschlossen',
		'Other devices': 'Andere Geräte',
		'Custom links': 'Eigene Links',
		'History': 'Verlauf',
		'Keep open': 'Offen halten',
		'Clock': 'Uhr',
		'24-hour time': '24-Stunden-Format',
		'Web search': 'Websuche',
		'Off': 'Aus',
		'Font': 'Schrift',
		'Size': 'Größe',
		'Weight': 'Stärke',
		'Thin': 'Dünn',
		'Extra Light': 'Extra leicht',
		'Light': 'Leicht',
		'Regular': 'Normal',
		'Medium': 'Mittel',
		'Semi Bold': 'Halbfett',
		'Bold': 'Fett',
		'Extra Bold': 'Extra fett',
		'Heavy': 'Sehr fett',
		'Preview fonts…': 'Schriften ansehen…',
		'Icons': 'Icons',
		'Show icons': 'Icons anzeigen',
		'High quality': 'Hohe Qualität',
		'Cache favicons locally': 'Favicons lokal zwischenspeichern',
		'Domain icon overrides (JSON)': 'Domain-Icon-Ersetzungen (JSON)',
		'Clear favicon cache': 'Favicon-Cache leeren',
		'Colors': 'Farben',
		'Font color': 'Schriftfarbe',
		'Background': 'Hintergrund',
		'Highlight': 'Hervorhebung',
		'Highlight font': 'Hervorhebung Schrift',
		'Shadow': 'Schatten',
		'Dark mode': 'Dunkelmodus',
		'Follow system': 'System folgen',
		'Always': 'Immer',
		'Layout': 'Layout',
		'Text alignment': 'Textausrichtung',
		'Left': 'Links',
		'Center': 'Zentriert',
		'Right': 'Rechts',
		'Center single column': 'Einzelne Spalte zentrieren',
		'Curated layout': 'Kuratiertes Layout',
		'Generated CSS': 'Generiertes CSS',
		'Custom CSS': 'Eigenes CSS',
		'Background image': 'Hintergrundbild',
		'URL': 'URL',
		'Local file': 'Lokale Datei',
		'Choose live file…': 'Live-Datei auswählen…',
		'Choose another file…': 'Andere Datei auswählen…',
		'Reconnect': 'Neu verbinden',
		'Clear': 'Leeren',
		'No live file selected': 'Keine Live-Datei ausgewählt',
		'Position': 'Position',
		'Tiling': 'Kachelung',
		'Tile': 'Kacheln',
		'Horizontal': 'Horizontal',
		'Vertical': 'Vertikal',
		'None': 'Keine',
		'Export Settings': 'Einstellungen exportieren',
		'Import Settings': 'Einstellungen importieren',
		'Reset / recovery': 'Zurücksetzen / Wiederherstellung',
		'Reset current layout': 'Aktuelles Layout zurücksetzen',
		'Reset settings': 'Einstellungen zurücksetzen',
		'Sync diagnostics': 'Sync-Diagnose',
		'Version': 'Version',
		'Storage backend': 'Speicher-Backend',
		'Browser sync': 'Browser-Sync',
		'Sync status': 'Sync-Status',
		'Device ID': 'Geräte-ID',
		'Layout revision': 'Layout-Revision',
		'Layout hash': 'Layout-Hash',
		'Bookmark index source': 'Quelle des Lesezeichenindex',
		'Bookmark folders indexed': 'Indizierte Lesezeichenordner',
		'Bookmark index time': 'Zeit für Lesezeichenindex',
		'Storage init time': 'Speicher-Initialisierung',
		'Last sync activity': 'Letzte Sync-Aktivität',
		'Last successful upload': 'Letzter erfolgreicher Upload',
		'Last remote update': 'Letzte Remote-Aktualisierung',
		'Last remote device': 'Letztes Remote-Gerät',
		'Pending local changes': 'Ausstehende lokale Änderungen',
		'Remote layouts': 'Remote-Layouts',
		'Sync storage usage': 'Sync-Speichernutzung',
		'Unresolved bookmarks': 'Nicht aufgelöste Lesezeichen',
		'Layout backups': 'Layout-Backups',
		'Detected conflicts': 'Erkannte Konflikte',
		'Last error': 'Letzter Fehler',
		'Sync now': 'Jetzt synchronisieren',
		'Reload remote state': 'Remote-Stand neu laden',
		'Restore previous layout': 'Vorheriges Layout wiederherstellen',
		'Copy diagnostics': 'Diagnose kopieren',
		'Recent events (current tab)': 'Letzte Ereignisse (aktueller Tab)',
		'Language': 'Sprache',
		'System language': 'Systemsprache',
		'English': 'Englisch',
		'German': 'Deutsch',

		'Search bookmarks…': 'Lesezeichen suchen…',
		'Type to search bookmark titles, URLs, and folder paths.': 'Nach Titel, URL und Ordnerpfad suchen.',
		'No matching bookmarks': 'Keine passenden Lesezeichen',
		'Loading bookmarks…': 'Lesezeichen werden geladen…',
		'Building search index…': 'Suchindex wird erstellt…',
		'Search bookmarks': 'Lesezeichen suchen',
		'Edit bookmark…': 'Lesezeichen bearbeiten…',
		'Move bookmark…': 'Lesezeichen verschieben…',
		'Delete bookmark…': 'Lesezeichen löschen…',
		'New bookmark…': 'Neues Lesezeichen…',
		'New folder…': 'Neuer Ordner…',
		'Rename folder…': 'Ordner umbenennen…',
		'Open all links in folder': 'Alle Links im Ordner öffnen',
		'Create new column': 'Neue Spalte erstellen',
		'Duplicate folder in new column': 'Ordner in neuer Spalte duplizieren',
		'Move folder up': 'Ordner nach oben verschieben',
		'Move folder down': 'Ordner nach unten verschieben',
		'Move folder left': 'Ordner nach links verschieben',
		'Move folder right': 'Ordner nach rechts verschieben',
		'Remove folder': 'Ordner entfernen',
		'Move column left': 'Spalte nach links verschieben',
		'Move column right': 'Spalte nach rechts verschieben',
		'Remove column': 'Spalte entfernen',
		'Column settings…': 'Spalteneinstellungen…',
		'Edit bookmarks': 'Lesezeichen verwalten',
		'Add custom link…': 'Eigenen Link hinzufügen…',
		'Clear custom links…': 'Eigene Links leeren…',
		'Edit custom link…': 'Eigenen Link bearbeiten…',
		'Delete custom link…': 'Eigenen Link löschen…',
		'Set shortcut…': 'Tastenkürzel festlegen…',
		'Remove shortcut': 'Tastenkürzel entfernen',
		'Set folder icon…': 'Ordner-Icon festlegen…',
		'Reset folder icon': 'Ordner-Icon zurücksetzen',
		'Hide from Recently closed': 'Aus „Kürzlich geschlossen“ ausblenden',
		'Restore hidden items': 'Ausgeblendete Einträge wiederherstellen',
		'Clear browsing data': 'Browserdaten löschen',
		'Font preview': 'Schriftvorschau',
		'Filter fonts…': 'Schriften filtern…',
		'Column settings': 'Spalteneinstellungen',
		'Title': 'Titel',
		'Width (%)': 'Breite (%)',
		'Leave empty for automatic width.': 'Leer lassen für automatische Breite.',
		'Cancel': 'Abbrechen',
		'Save': 'Speichern',
		'Delete': 'Löschen',
		'Create': 'Erstellen',
		'Move': 'Verschieben',
		'Edit bookmark': 'Lesezeichen bearbeiten',
		'Move bookmark': 'Lesezeichen verschieben',
		'New bookmark': 'Neues Lesezeichen',
		'New folder': 'Neuer Ordner',
		'Rename folder': 'Ordner umbenennen',
		'Folder': 'Ordner',
		'Active layout': 'Aktives Layout',
		'Create layout': 'Layout erstellen',
		'Rename layout': 'Layout umbenennen',
		'Delete layout': 'Layout löschen',
		'Undo last layout change': 'Letzte Layoutänderung rückgängig machen',
		'Show background only': 'Nur Hintergrund anzeigen',
		'Show Humble content': 'Humble-Inhalte anzeigen'
	};

	var dictionaries = { de: de };

	function preferredLanguage() {
		var saved = localStorage.getItem(STORAGE_KEY) || 'system';
		if (saved === 'en' || saved === 'de') return saved;
		var language = String(navigator.language || 'en').toLowerCase();
		return language.indexOf('de') === 0 ? 'de' : 'en';
	}

	function t(text) {
		var language = preferredLanguage();
		if (language === 'en') return text;
		var dict = dictionaries[language] || {};
		return Object.prototype.hasOwnProperty.call(dict, text) ? dict[text] : text;
	}

	function translateAttribute(element, name) {
		if (!element || !element.getAttribute) return;
		var value = element.getAttribute(name);
		if (!value) return;
		var translated = t(value);
		if (translated !== value) element.setAttribute(name, translated);
	}

	function translateNode(root) {
		if (!root) return;
		var elements = [];
		if (root.nodeType === 1) elements.push(root);
		if (root.querySelectorAll)
			elements = elements.concat(Array.prototype.slice.call(root.querySelectorAll('*')));

		for (var i = 0; i < elements.length; i++) {
			var el = elements[i];
			translateAttribute(el, 'title');
			translateAttribute(el, 'placeholder');
			translateAttribute(el, 'aria-label');

			for (var n = 0; n < el.childNodes.length; n++) {
				var node = el.childNodes[n];
				if (node.nodeType !== 3) continue;
				var raw = node.nodeValue;
				var trimmed = raw.trim();
				if (!trimmed) continue;
				var translated = t(trimmed);
				if (translated === trimmed) continue;
				node.nodeValue = raw.replace(trimmed, translated);
			}
		}
	}

	function translateDocument() {
		document.documentElement.lang = preferredLanguage();
		translateNode(document.body);
	}

	function setLanguage(value) {
		value = value === 'de' || value === 'en' ? value : 'system';
		if (value === 'system') localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, value);
		window.location.reload();
	}

	function bindSelector() {
		var select = document.getElementById('language_select');
		if (!select || select.dataset.bound) return;
		select.dataset.bound = '1';
		var stored = localStorage.getItem(STORAGE_KEY) || 'system';
		select.value = stored;
		select.onchange = function() { setLanguage(select.value); };
	}

	function startObserver() {
		if (observer || !window.MutationObserver) return;
		observer = new MutationObserver(function(mutations) {
			for (var i = 0; i < mutations.length; i++) {
				for (var j = 0; j < mutations[i].addedNodes.length; j++)
					translateNode(mutations[i].addedNodes[j]);
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	function initialize() {
		bindSelector();
		translateDocument();
		startObserver();
	}

	var ready = window.HumbleStorage && window.HumbleStorage.ready;
	if (ready && typeof ready.then === 'function') ready.then(initialize);
	else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
	else initialize();

	window.HumbleI18n = {
		t: t,
		language: preferredLanguage,
		setLanguage: setLanguage,
		register: function(language, dictionary) {
			dictionaries[language] = Object.assign(dictionaries[language] || {}, dictionary || {});
		},
		translate: translateNode
	};
})();
