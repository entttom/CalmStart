'use strict';

/*
 * CalmStart UI localization. The browser UI language is used automatically;
 * English remains the fallback for untranslated operating-system language codes.
 */
(function() {
	var dictionaries = {
		de: {
			'Settings': 'Einstellungen', 'Appearance': 'Darstellung', 'Search': 'Suche', 'Import/Export': 'Import/Export', 'Advanced': 'Erweitert',
			'Options': 'Optionen', 'Close': 'Schließen', 'Open links in': 'Links öffnen in', 'Current tab': 'Aktuellem Tab', 'New tab': 'Neuem Tab',
			'New tab (background)': 'Neuem Tab (im Hintergrund)', 'Search scope': 'Suchbereich', 'Bookmarks + web': 'Lesezeichen + Web',
			'Bookmarks only': 'Nur Lesezeichen', 'Bookmark source': 'Lesezeichenquelle', 'Start page folders only': 'Nur Startseiten-Ordner',
			'All bookmarks': 'Alle Lesezeichen', 'Results display': 'Ergebnisanzeige', 'Dropdown below search': 'Dropdown unter der Suche',
			'Filter page': 'Seite filtern', 'Web search': 'Websuche', 'Search engine': 'Suchmaschine', 'Custom': 'Benutzerdefiniert',
			'Custom search URL': 'Eigene Such-URL', 'Behavior': 'Verhalten', 'Dropdown': 'Dropdown', 'Search bookmarks or the web': 'Lesezeichen oder Web durchsuchen',
			'Search bookmarks': 'Lesezeichen durchsuchen', 'Bookmarks': 'Lesezeichen', 'Web search': 'Websuche',
			'Use': 'Verwende', 'where the encoded search term should be inserted.': 'an der Stelle, an der der kodierte Suchbegriff eingefügt werden soll.',
			'Sync now': 'Jetzt synchronisieren', 'Reload remote state': 'Remote-Status neu laden', 'Restore previous layout': 'Vorheriges Layout wiederherstellen',
			'Copy diagnostics': 'Diagnose kopieren', 'Reset to default': 'Auf Standard zurücksetzen', 'Paste exported settings here': 'Exportierte Einstellungen hier einfügen',
			'Import successful!': 'Import erfolgreich!', 'Import error! Please check if your settings are valid JSON.': 'Importfehler! Bitte prüfe, ob deine Einstellungen gültiges JSON sind.',
			'Enter an http(s) URL containing %s.': 'Gib eine http(s)-URL mit %s ein.', '< Empty >': '< Leer >',
			'Create new column': 'Neue Spalte erstellen', 'Move folder up': 'Ordner nach oben verschieben', 'Move folder down': 'Ordner nach unten verschieben',
			'Move folder left': 'Ordner nach links verschieben', 'Move folder right': 'Ordner nach rechts verschieben', 'Remove folder': 'Ordner entfernen',
			'Move column left': 'Spalte nach links verschieben', 'Move column right': 'Spalte nach rechts verschieben', 'Remove column': 'Spalte entfernen',
			'Open all links in folder': 'Alle Links im Ordner öffnen', 'Clear browsing data': 'Browserdaten löschen', 'History': 'Verlauf', 'Edit bookmarks': 'Lesezeichen bearbeiten',
			'Search {engine} for “{query}”': 'Mit {engine} nach „{query}“ suchen'
		},
		fr: {
			'Settings': 'Paramètres', 'Appearance': 'Apparence', 'Search': 'Recherche', 'Import/Export': 'Importer/Exporter', 'Advanced': 'Avancé',
			'Options': 'Options', 'Close': 'Fermer', 'Open links in': 'Ouvrir les liens dans', 'Current tab': 'L’onglet actuel', 'New tab': 'Un nouvel onglet',
			'New tab (background)': 'Un nouvel onglet (arrière-plan)', 'Search scope': 'Portée de recherche', 'Bookmarks + web': 'Favoris + Web',
			'Bookmarks only': 'Favoris uniquement', 'Bookmark source': 'Source des favoris', 'Start page folders only': 'Dossiers de la page d’accueil uniquement',
			'All bookmarks': 'Tous les favoris', 'Results display': 'Affichage des résultats', 'Dropdown below search': 'Liste déroulante sous la recherche',
			'Filter page': 'Filtrer la page', 'Web search': 'Recherche Web', 'Search engine': 'Moteur de recherche', 'Custom': 'Personnalisé',
			'Custom search URL': 'URL de recherche personnalisée', 'Behavior': 'Comportement', 'Dropdown': 'Liste déroulante',
			'Search bookmarks or the web': 'Rechercher dans les favoris ou sur le Web', 'Search bookmarks': 'Rechercher dans les favoris', 'Bookmarks': 'Favoris',
			'Sync now': 'Synchroniser maintenant', 'Reload remote state': 'Recharger l’état distant', 'Restore previous layout': 'Restaurer la disposition précédente',
			'Copy diagnostics': 'Copier le diagnostic', 'Reset to default': 'Rétablir les valeurs par défaut', '< Empty >': '< Vide >',
			'Search {engine} for “{query}”': 'Rechercher « {query} » avec {engine}'
		},
		es: {
			'Settings': 'Configuración', 'Appearance': 'Apariencia', 'Search': 'Buscar', 'Import/Export': 'Importar/Exportar', 'Advanced': 'Avanzado',
			'Options': 'Opciones', 'Close': 'Cerrar', 'Open links in': 'Abrir enlaces en', 'Current tab': 'Pestaña actual', 'New tab': 'Pestaña nueva',
			'New tab (background)': 'Pestaña nueva (en segundo plano)', 'Search scope': 'Ámbito de búsqueda', 'Bookmarks + web': 'Marcadores + web',
			'Bookmarks only': 'Solo marcadores', 'Bookmark source': 'Origen de marcadores', 'Start page folders only': 'Solo carpetas de la página de inicio',
			'All bookmarks': 'Todos los marcadores', 'Results display': 'Visualización de resultados', 'Dropdown below search': 'Lista desplegable bajo la búsqueda',
			'Filter page': 'Filtrar página', 'Web search': 'Búsqueda web', 'Search engine': 'Motor de búsqueda', 'Custom': 'Personalizado',
			'Custom search URL': 'URL de búsqueda personalizada', 'Behavior': 'Comportamiento', 'Dropdown': 'Lista desplegable',
			'Search bookmarks or the web': 'Buscar marcadores o en la web', 'Search bookmarks': 'Buscar marcadores', 'Bookmarks': 'Marcadores',
			'Sync now': 'Sincronizar ahora', 'Reload remote state': 'Recargar estado remoto', 'Restore previous layout': 'Restaurar diseño anterior',
			'Copy diagnostics': 'Copiar diagnóstico', 'Reset to default': 'Restablecer valores predeterminados', '< Empty >': '< Vacío >',
			'Search {engine} for “{query}”': 'Buscar “{query}” con {engine}'
		},
		it: {
			'Settings': 'Impostazioni', 'Appearance': 'Aspetto', 'Search': 'Cerca', 'Import/Export': 'Importa/Esporta', 'Advanced': 'Avanzate',
			'Options': 'Opzioni', 'Close': 'Chiudi', 'Open links in': 'Apri link in', 'Current tab': 'Scheda corrente', 'New tab': 'Nuova scheda',
			'New tab (background)': 'Nuova scheda (in background)', 'Search scope': 'Ambito di ricerca', 'Bookmarks + web': 'Segnalibri + web',
			'Bookmarks only': 'Solo segnalibri', 'Bookmark source': 'Origine segnalibri', 'Start page folders only': 'Solo cartelle della pagina iniziale',
			'All bookmarks': 'Tutti i segnalibri', 'Results display': 'Visualizzazione risultati', 'Dropdown below search': 'Menu a discesa sotto la ricerca',
			'Filter page': 'Filtra pagina', 'Web search': 'Ricerca web', 'Search engine': 'Motore di ricerca', 'Custom': 'Personalizzato',
			'Custom search URL': 'URL di ricerca personalizzato', 'Behavior': 'Comportamento', 'Dropdown': 'Menu a discesa',
			'Search bookmarks or the web': 'Cerca nei segnalibri o sul web', 'Search bookmarks': 'Cerca nei segnalibri', 'Bookmarks': 'Segnalibri',
			'Sync now': 'Sincronizza ora', 'Reload remote state': 'Ricarica stato remoto', 'Restore previous layout': 'Ripristina layout precedente',
			'Copy diagnostics': 'Copia diagnostica', 'Reset to default': 'Ripristina predefiniti', '< Empty >': '< Vuoto >',
			'Search {engine} for “{query}”': 'Cerca “{query}” con {engine}'
		},
		pt_BR: {
			'Settings': 'Configurações', 'Appearance': 'Aparência', 'Search': 'Pesquisar', 'Import/Export': 'Importar/Exportar', 'Advanced': 'Avançado',
			'Options': 'Opções', 'Close': 'Fechar', 'Open links in': 'Abrir links em', 'Current tab': 'Aba atual', 'New tab': 'Nova aba',
			'New tab (background)': 'Nova aba (em segundo plano)', 'Search scope': 'Escopo da pesquisa', 'Bookmarks + web': 'Favoritos + web',
			'Bookmarks only': 'Apenas favoritos', 'Bookmark source': 'Origem dos favoritos', 'Start page folders only': 'Apenas pastas da página inicial',
			'All bookmarks': 'Todos os favoritos', 'Results display': 'Exibição dos resultados', 'Dropdown below search': 'Lista abaixo da pesquisa',
			'Filter page': 'Filtrar página', 'Web search': 'Pesquisa na web', 'Search engine': 'Mecanismo de busca', 'Custom': 'Personalizado',
			'Custom search URL': 'URL de busca personalizada', 'Behavior': 'Comportamento', 'Dropdown': 'Lista suspensa',
			'Search bookmarks or the web': 'Pesquisar favoritos ou na web', 'Search bookmarks': 'Pesquisar favoritos', 'Bookmarks': 'Favoritos',
			'Sync now': 'Sincronizar agora', 'Reload remote state': 'Recarregar estado remoto', 'Restore previous layout': 'Restaurar layout anterior',
			'Copy diagnostics': 'Copiar diagnóstico', 'Reset to default': 'Restaurar padrão', '< Empty >': '< Vazio >',
			'Search {engine} for “{query}”': 'Pesquisar “{query}” no {engine}'
		},
		nl: {
			'Settings': 'Instellingen', 'Appearance': 'Vormgeving', 'Search': 'Zoeken', 'Import/Export': 'Importeren/Exporteren', 'Advanced': 'Geavanceerd',
			'Options': 'Opties', 'Close': 'Sluiten', 'Open links in': 'Links openen in', 'Current tab': 'Huidig tabblad', 'New tab': 'Nieuw tabblad',
			'New tab (background)': 'Nieuw tabblad (achtergrond)', 'Search scope': 'Zoekbereik', 'Bookmarks + web': 'Bladwijzers + web',
			'Bookmarks only': 'Alleen bladwijzers', 'Bookmark source': 'Bron van bladwijzers', 'Start page folders only': 'Alleen startpaginamappen',
			'All bookmarks': 'Alle bladwijzers', 'Results display': 'Resultaatweergave', 'Dropdown below search': 'Keuzelijst onder zoeken',
			'Filter page': 'Pagina filteren', 'Web search': 'Web zoeken', 'Search engine': 'Zoekmachine', 'Custom': 'Aangepast',
			'Custom search URL': 'Aangepaste zoek-URL', 'Behavior': 'Gedrag', 'Dropdown': 'Keuzelijst',
			'Search bookmarks or the web': 'Bladwijzers of het web doorzoeken', 'Search bookmarks': 'Bladwijzers doorzoeken', 'Bookmarks': 'Bladwijzers',
			'Sync now': 'Nu synchroniseren', 'Reload remote state': 'Externe status opnieuw laden', 'Restore previous layout': 'Vorige indeling herstellen',
			'Copy diagnostics': 'Diagnostiek kopiëren', 'Reset to default': 'Standaard herstellen', '< Empty >': '< Leeg >',
			'Search {engine} for “{query}”': 'Zoek met {engine} naar “{query}”'
		},
		pl: {
			'Settings': 'Ustawienia', 'Appearance': 'Wygląd', 'Search': 'Szukaj', 'Import/Export': 'Import/Eksport', 'Advanced': 'Zaawansowane',
			'Options': 'Opcje', 'Close': 'Zamknij', 'Open links in': 'Otwieraj linki w', 'Current tab': 'Bieżącej karcie', 'New tab': 'Nowej karcie',
			'New tab (background)': 'Nowej karcie w tle', 'Search scope': 'Zakres wyszukiwania', 'Bookmarks + web': 'Zakładki + internet',
			'Bookmarks only': 'Tylko zakładki', 'Bookmark source': 'Źródło zakładek', 'Start page folders only': 'Tylko foldery strony startowej',
			'All bookmarks': 'Wszystkie zakładki', 'Results display': 'Wyświetlanie wyników', 'Dropdown below search': 'Lista rozwijana pod wyszukiwaniem',
			'Filter page': 'Filtruj stronę', 'Web search': 'Wyszukiwanie w sieci', 'Search engine': 'Wyszukiwarka', 'Custom': 'Niestandardowe',
			'Custom search URL': 'Własny adres URL wyszukiwania', 'Behavior': 'Zachowanie', 'Dropdown': 'Lista rozwijana',
			'Search bookmarks or the web': 'Przeszukuj zakładki lub internet', 'Search bookmarks': 'Przeszukuj zakładki', 'Bookmarks': 'Zakładki',
			'Sync now': 'Synchronizuj teraz', 'Reload remote state': 'Odśwież stan zdalny', 'Restore previous layout': 'Przywróć poprzedni układ',
			'Copy diagnostics': 'Kopiuj diagnostykę', 'Reset to default': 'Przywróć domyślne', '< Empty >': '< Puste >',
			'Search {engine} for “{query}”': 'Szukaj „{query}” w {engine}'
		},
		tr: {
			'Settings': 'Ayarlar', 'Appearance': 'Görünüm', 'Search': 'Ara', 'Import/Export': 'İçe/Dışa Aktar', 'Advanced': 'Gelişmiş',
			'Options': 'Seçenekler', 'Close': 'Kapat', 'Open links in': 'Bağlantıları şurada aç', 'Current tab': 'Geçerli sekme', 'New tab': 'Yeni sekme',
			'New tab (background)': 'Yeni sekme (arka planda)', 'Search scope': 'Arama kapsamı', 'Bookmarks + web': 'Yer imleri + web',
			'Bookmarks only': 'Yalnızca yer imleri', 'Bookmark source': 'Yer imi kaynağı', 'Start page folders only': 'Yalnızca başlangıç sayfası klasörleri',
			'All bookmarks': 'Tüm yer imleri', 'Results display': 'Sonuç görünümü', 'Dropdown below search': 'Aramanın altında açılır liste',
			'Filter page': 'Sayfayı filtrele', 'Web search': 'Web araması', 'Search engine': 'Arama motoru', 'Custom': 'Özel',
			'Custom search URL': 'Özel arama URL’si', 'Behavior': 'Davranış', 'Dropdown': 'Açılır liste',
			'Search bookmarks or the web': 'Yer imlerinde veya web’de ara', 'Search bookmarks': 'Yer imlerinde ara', 'Bookmarks': 'Yer imleri',
			'Sync now': 'Şimdi eşitle', 'Reload remote state': 'Uzak durumu yeniden yükle', 'Restore previous layout': 'Önceki düzeni geri yükle',
			'Copy diagnostics': 'Tanılamayı kopyala', 'Reset to default': 'Varsayılana sıfırla', '< Empty >': '< Boş >',
			'Search {engine} for “{query}”': '{engine} ile “{query}” ara'
		},
		ja: {
			'Settings': '設定', 'Appearance': '外観', 'Search': '検索', 'Import/Export': 'インポート／エクスポート', 'Advanced': '詳細',
			'Options': 'オプション', 'Close': '閉じる', 'Open links in': 'リンクを開く場所', 'Current tab': '現在のタブ', 'New tab': '新しいタブ',
			'New tab (background)': '新しいタブ（バックグラウンド）', 'Search scope': '検索範囲', 'Bookmarks + web': 'ブックマークとウェブ',
			'Bookmarks only': 'ブックマークのみ', 'Bookmark source': 'ブックマークの対象', 'Start page folders only': 'スタートページのフォルダーのみ',
			'All bookmarks': 'すべてのブックマーク', 'Results display': '結果の表示', 'Dropdown below search': '検索欄の下にドロップダウン',
			'Filter page': 'ページを絞り込む', 'Web search': 'ウェブ検索', 'Search engine': '検索エンジン', 'Custom': 'カスタム',
			'Custom search URL': 'カスタム検索URL', 'Behavior': '動作', 'Dropdown': 'ドロップダウン',
			'Search bookmarks or the web': 'ブックマークまたはウェブを検索', 'Search bookmarks': 'ブックマークを検索', 'Bookmarks': 'ブックマーク',
			'Sync now': '今すぐ同期', 'Reload remote state': 'リモート状態を再読み込み', 'Restore previous layout': '以前のレイアウトを復元',
			'Copy diagnostics': '診断情報をコピー', 'Reset to default': '既定値に戻す', '< Empty >': '< 空 >',
			'Search {engine} for “{query}”': '{engine} で「{query}」を検索'
		},
		ko: {
			'Settings': '설정', 'Appearance': '모양', 'Search': '검색', 'Import/Export': '가져오기/내보내기', 'Advanced': '고급',
			'Options': '옵션', 'Close': '닫기', 'Open links in': '링크 열기', 'Current tab': '현재 탭', 'New tab': '새 탭',
			'New tab (background)': '새 탭(백그라운드)', 'Search scope': '검색 범위', 'Bookmarks + web': '북마크 + 웹',
			'Bookmarks only': '북마크만', 'Bookmark source': '북마크 소스', 'Start page folders only': '시작 페이지 폴더만',
			'All bookmarks': '모든 북마크', 'Results display': '결과 표시', 'Dropdown below search': '검색 아래 드롭다운',
			'Filter page': '페이지 필터링', 'Web search': '웹 검색', 'Search engine': '검색 엔진', 'Custom': '사용자 지정',
			'Custom search URL': '사용자 지정 검색 URL', 'Behavior': '동작', 'Dropdown': '드롭다운',
			'Search bookmarks or the web': '북마크 또는 웹 검색', 'Search bookmarks': '북마크 검색', 'Bookmarks': '북마크',
			'Sync now': '지금 동기화', 'Reload remote state': '원격 상태 새로고침', 'Restore previous layout': '이전 레이아웃 복원',
			'Copy diagnostics': '진단 복사', 'Reset to default': '기본값으로 재설정', '< Empty >': '< 비어 있음 >',
			'Search {engine} for “{query}”': '{engine}에서 “{query}” 검색'
		},
		zh_CN: {
			'Settings': '设置', 'Appearance': '外观', 'Search': '搜索', 'Import/Export': '导入/导出', 'Advanced': '高级',
			'Options': '选项', 'Close': '关闭', 'Open links in': '在此处打开链接', 'Current tab': '当前标签页', 'New tab': '新标签页',
			'New tab (background)': '新标签页（后台）', 'Search scope': '搜索范围', 'Bookmarks + web': '书签和网络',
			'Bookmarks only': '仅书签', 'Bookmark source': '书签来源', 'Start page folders only': '仅起始页文件夹',
			'All bookmarks': '所有书签', 'Results display': '结果显示', 'Dropdown below search': '搜索框下拉列表',
			'Filter page': '筛选页面', 'Web search': '网页搜索', 'Search engine': '搜索引擎', 'Custom': '自定义',
			'Custom search URL': '自定义搜索网址', 'Behavior': '行为', 'Dropdown': '下拉列表',
			'Search bookmarks or the web': '搜索书签或网络', 'Search bookmarks': '搜索书签', 'Bookmarks': '书签',
			'Sync now': '立即同步', 'Reload remote state': '重新加载远程状态', 'Restore previous layout': '恢复上一个布局',
			'Copy diagnostics': '复制诊断信息', 'Reset to default': '恢复默认设置', '< Empty >': '< 空 >',
			'Search {engine} for “{query}”': '使用 {engine} 搜索“{query}”'
		},
		zh_TW: {
			'Settings': '設定', 'Appearance': '外觀', 'Search': '搜尋', 'Import/Export': '匯入/匯出', 'Advanced': '進階',
			'Options': '選項', 'Close': '關閉', 'Open links in': '開啟連結位置', 'Current tab': '目前分頁', 'New tab': '新分頁',
			'New tab (background)': '新分頁（背景）', 'Search scope': '搜尋範圍', 'Bookmarks + web': '書籤和網路',
			'Bookmarks only': '僅書籤', 'Bookmark source': '書籤來源', 'Start page folders only': '僅起始頁資料夾',
			'All bookmarks': '所有書籤', 'Results display': '結果顯示', 'Dropdown below search': '搜尋下方的下拉式選單',
			'Filter page': '篩選頁面', 'Web search': '網頁搜尋', 'Search engine': '搜尋引擎', 'Custom': '自訂',
			'Custom search URL': '自訂搜尋網址', 'Behavior': '行為', 'Dropdown': '下拉式選單',
			'Search bookmarks or the web': '搜尋書籤或網路', 'Search bookmarks': '搜尋書籤', 'Bookmarks': '書籤',
			'Sync now': '立即同步', 'Reload remote state': '重新載入遠端狀態', 'Restore previous layout': '還原先前版面配置',
			'Copy diagnostics': '複製診斷資訊', 'Reset to default': '還原預設值', '< Empty >': '< 空白 >',
			'Search {engine} for “{query}”': '使用 {engine} 搜尋「{query}」'
		}
	};
	var english = {};
	var aliases = { 'pt': 'pt_BR', 'pt_PT': 'pt_BR', 'zh': 'zh_CN', 'zh_Hans': 'zh_CN', 'zh_Hant': 'zh_TW' };
	function locale() {
		var raw = (chrome.i18n && chrome.i18n.getUILanguage ? chrome.i18n.getUILanguage() : navigator.language || 'en').replace('-', '_');
		if (dictionaries[raw]) return raw;
		if (aliases[raw]) return aliases[raw];
		var base = raw.split('_')[0];
		return dictionaries[base] ? base : 'en';
	}
	var active = locale();
	function t(key, substitutions) {
		var value = (dictionaries[active] || english)[key] || key;
		if (substitutions) Object.keys(substitutions).forEach(function(name) {
			value = value.replace(new RegExp('\\{' + name + '\\}', 'g'), substitutions[name]);
		});
		return value;
	}
	function translateTextNode(node) {
		var original = node.nodeValue;
		var trimmed = original.trim();
		if (!trimmed || !Object.prototype.hasOwnProperty.call(dictionaries[active] || {}, trimmed)) return;
		var leading = original.match(/^\s*/)[0], trailing = original.match(/\s*$/)[0];
		node.nodeValue = leading + t(trimmed) + trailing;
	}
	function apply() {
		if (active === 'en') return;
		var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		var nodes = [], node;
		while ((node = walker.nextNode())) nodes.push(node);
		nodes.forEach(translateTextNode);
		document.querySelectorAll('[title], [placeholder], [aria-label]').forEach(function(element) {
			['title', 'placeholder', 'aria-label'].forEach(function(attribute) {
				var value = element.getAttribute(attribute);
				if (value && Object.prototype.hasOwnProperty.call(dictionaries[active] || {}, value))
					element.setAttribute(attribute, t(value));
			});
		});
	}
	window.CalmStartI18n = { t: t, locale: active, apply: apply, supported: ['en','de','fr','es','it','pt_BR','nl','pl','tr','ja','ko','zh_CN','zh_TW'] };
	apply();
})();
