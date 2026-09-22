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
			'Custom search URL': 'Eigene Such-URL', 'Behavior': 'Verhalten', 'Focus search on new tab': 'Suchfeld in neuem Tab fokussieren', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Setzt den Cursor beim Öffnen eines neuen CalmStart-Tabs in das Suchfeld, damit du sofort tippen kannst.', 'Dropdown': 'Dropdown', 'Search bookmarks or the web': 'Lesezeichen oder Web durchsuchen',
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
			'Custom search URL': 'URL de recherche personnalisée', 'Behavior': 'Comportement', 'Focus search on new tab': 'Placer le curseur dans la recherche à l’ouverture d’un nouvel onglet', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Place le curseur dans le champ de recherche à l’ouverture d’un nouvel onglet CalmStart.', 'Dropdown': 'Liste déroulante',
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
			'Custom search URL': 'URL de búsqueda personalizada', 'Behavior': 'Comportamiento', 'Focus search on new tab': 'Enfocar la búsqueda en una pestaña nueva', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Coloca el cursor en el campo de búsqueda al abrir una nueva pestaña de CalmStart.', 'Dropdown': 'Lista desplegable',
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
			'Custom search URL': 'URL di ricerca personalizzato', 'Behavior': 'Comportamento', 'Focus search on new tab': 'Metti a fuoco la ricerca in una nuova scheda', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Posiziona il cursore nel campo di ricerca quando si apre una nuova scheda CalmStart.', 'Dropdown': 'Menu a discesa',
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
			'Custom search URL': 'URL de busca personalizada', 'Behavior': 'Comportamento', 'Focus search on new tab': 'Focar a busca em uma nova aba', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Coloca o cursor no campo de busca quando uma nova aba do CalmStart é aberta.', 'Dropdown': 'Lista suspensa',
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
			'Custom search URL': 'Aangepaste zoek-URL', 'Behavior': 'Gedrag', 'Focus search on new tab': 'Zoekveld focussen in een nieuw tabblad', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Plaatst de cursor in het zoekveld wanneer een nieuw CalmStart-tabblad wordt geopend.', 'Dropdown': 'Keuzelijst',
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
			'Custom search URL': 'Własny adres URL wyszukiwania', 'Behavior': 'Zachowanie', 'Focus search on new tab': 'Ustaw fokus wyszukiwania w nowej karcie', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Umieszcza kursor w polu wyszukiwania po otwarciu nowej karty CalmStart.', 'Dropdown': 'Lista rozwijana',
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
			'Custom search URL': 'Özel arama URL’si', 'Behavior': 'Davranış', 'Focus search on new tab': 'Yeni sekmede aramaya odaklan', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': 'Yeni bir CalmStart sekmesi açıldığında imleci arama alanına yerleştirir.', 'Dropdown': 'Açılır liste',
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
			'Custom search URL': 'カスタム検索URL', 'Behavior': '動作', 'Focus search on new tab': '新しいタブで検索欄にフォーカス', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': '新しい CalmStart タブを開いたときに検索欄へカーソルを移動します。', 'Dropdown': 'ドロップダウン',
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
			'Custom search URL': '사용자 지정 검색 URL', 'Behavior': '동작', 'Focus search on new tab': '새 탭에서 검색창에 포커스', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': '새 CalmStart 탭을 열면 검색창에 커서를 둡니다.', 'Dropdown': '드롭다운',
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
			'Custom search URL': '自定义搜索网址', 'Behavior': '行为', 'Focus search on new tab': '在新标签页中聚焦搜索框', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': '打开新的 CalmStart 标签页时，将光标放在搜索框中。', 'Dropdown': '下拉列表',
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
			'Custom search URL': '自訂搜尋網址', 'Behavior': '行為', 'Focus search on new tab': '在新分頁中聚焦搜尋欄', 'Places the cursor in the search field when a new CalmStart tab opens, so you can start typing immediately.': '開啟新的 CalmStart 分頁時，將游標置於搜尋欄中。', 'Dropdown': '下拉式選單',
			'Search bookmarks or the web': '搜尋書籤或網路', 'Search bookmarks': '搜尋書籤', 'Bookmarks': '書籤',
			'Sync now': '立即同步', 'Reload remote state': '重新載入遠端狀態', 'Restore previous layout': '還原先前版面配置',
			'Copy diagnostics': '複製診斷資訊', 'Reset to default': '還原預設值', '< Empty >': '< 空白 >',
			'Search {engine} for “{query}”': '使用 {engine} 搜尋「{query}」'
		}
	};
	var featureTranslations = {
		de: {
			'Favorites': 'Favoriten', 'Recently opened': 'Zuletzt geöffnet', 'Number of items': 'Anzahl der Einträge', 'Right-click any link on the start page to add or remove it from Favorites.': 'Klicke einen Link auf der Startseite mit der rechten Maustaste an, um ihn zu den Favoriten hinzuzufügen oder daraus zu entfernen.',
			'Add to favorites': 'Zu Favoriten hinzufügen', 'Remove from favorites': 'Aus Favoriten entfernen',
			'Sync favorites between browsers': 'Favoriten zwischen Browsern synchronisieren', 'Sync recently opened links between browsers': 'Zuletzt geöffnete Links zwischen Browsern synchronisieren',
			'Custom folder icons and colors': 'Eigene Ordner-Icons und -Farben', 'Sync folder appearance between browsers': 'Ordnerdarstellung zwischen Browsern synchronisieren',
			'Start-page profiles': 'Startseiten-Profile', 'Enable profiles': 'Profile aktivieren', 'Sync profiles between browsers': 'Profile zwischen Browsern synchronisieren',
			'Preferred profile on this computer': 'Bevorzugtes Profil auf diesem Computer', 'Profile name': 'Profilname', 'Save current layout as new profile': 'Aktuelles Layout als neues Profil speichern',
			'Rename': 'Umbenennen', 'Delete': 'Löschen', 'Synchronization': 'Synchronisierung', 'Status': 'Status', 'Last activity': 'Letzte Aktivität',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'Optionale Listen werden nur synchronisiert, wenn ihre jeweilige Option aktiv ist. Das bevorzugte Profil bleibt auf diesem Computer.',
			'Default': 'Standard', 'New profile': 'Neues Profil', 'Untitled profile': 'Unbenanntes Profil', 'At least one profile is required.': 'Mindestens ein Profil muss bestehen bleiben.',
			'Folder icon (emoji or short text)': 'Ordner-Icon (Emoji oder kurzer Text)', 'Set folder icon…': 'Ordner-Icon festlegen…', 'Choose folder color': 'Ordnerfarbe wählen', 'Reset folder appearance': 'Ordnerdarstellung zurücksetzen'
		},
		fr: {
			'Favorites': 'Favoris', 'Recently opened': 'Récemment ouverts', 'Number of items': 'Nombre d’éléments', 'Right-click any link on the start page to add or remove it from Favorites.': 'Faites un clic droit sur un lien de la page d’accueil pour l’ajouter aux favoris ou le retirer.',
			'Add to favorites': 'Ajouter aux favoris', 'Remove from favorites': 'Retirer des favoris',
			'Sync favorites between browsers': 'Synchroniser les favoris entre navigateurs', 'Sync recently opened links between browsers': 'Synchroniser les liens récemment ouverts entre navigateurs',
			'Custom folder icons and colors': 'Icônes et couleurs de dossiers personnalisées', 'Sync folder appearance between browsers': 'Synchroniser l’apparence des dossiers entre navigateurs',
			'Start-page profiles': 'Profils de page d’accueil', 'Enable profiles': 'Activer les profils', 'Sync profiles between browsers': 'Synchroniser les profils entre navigateurs',
			'Preferred profile on this computer': 'Profil préféré sur cet ordinateur', 'Profile name': 'Nom du profil', 'Save current layout as new profile': 'Enregistrer la disposition actuelle comme nouveau profil',
			'Rename': 'Renommer', 'Delete': 'Supprimer', 'Synchronization': 'Synchronisation', 'Status': 'État', 'Last activity': 'Dernière activité',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'Les listes facultatives ne sont synchronisées que lorsque leur option est activée. Le profil préféré reste sur cet ordinateur.',
			'Default': 'Par défaut', 'New profile': 'Nouveau profil', 'Untitled profile': 'Profil sans nom', 'At least one profile is required.': 'Au moins un profil est nécessaire.',
			'Folder icon (emoji or short text)': 'Icône de dossier (emoji ou texte court)', 'Set folder icon…': 'Définir l’icône du dossier…', 'Choose folder color': 'Choisir la couleur du dossier', 'Reset folder appearance': 'Réinitialiser l’apparence du dossier'
		},
		es: {
			'Favorites': 'Favoritos', 'Recently opened': 'Abiertos recientemente', 'Number of items': 'Número de elementos', 'Right-click any link on the start page to add or remove it from Favorites.': 'Haz clic derecho en un enlace de la página de inicio para añadirlo o quitarlo de Favoritos.',
			'Add to favorites': 'Añadir a favoritos', 'Remove from favorites': 'Quitar de favoritos',
			'Sync favorites between browsers': 'Sincronizar favoritos entre navegadores', 'Sync recently opened links between browsers': 'Sincronizar enlaces abiertos recientemente entre navegadores',
			'Custom folder icons and colors': 'Iconos y colores de carpetas personalizados', 'Sync folder appearance between browsers': 'Sincronizar la apariencia de las carpetas entre navegadores',
			'Start-page profiles': 'Perfiles de página de inicio', 'Enable profiles': 'Activar perfiles', 'Sync profiles between browsers': 'Sincronizar perfiles entre navegadores',
			'Preferred profile on this computer': 'Perfil preferido en este ordenador', 'Profile name': 'Nombre del perfil', 'Save current layout as new profile': 'Guardar diseño actual como perfil nuevo',
			'Rename': 'Cambiar nombre', 'Delete': 'Eliminar', 'Synchronization': 'Sincronización', 'Status': 'Estado', 'Last activity': 'Última actividad',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'Las listas opcionales solo se sincronizan cuando su interruptor está activado. El perfil preferido permanece en este ordenador.',
			'Default': 'Predeterminado', 'New profile': 'Perfil nuevo', 'Untitled profile': 'Perfil sin nombre', 'At least one profile is required.': 'Se requiere al menos un perfil.',
			'Folder icon (emoji or short text)': 'Icono de carpeta (emoji o texto breve)', 'Set folder icon…': 'Establecer icono de carpeta…', 'Choose folder color': 'Elegir color de carpeta', 'Reset folder appearance': 'Restablecer apariencia de carpeta'
		},
		it: {
			'Favorites': 'Preferiti', 'Recently opened': 'Aperti di recente', 'Number of items': 'Numero di elementi', 'Right-click any link on the start page to add or remove it from Favorites.': 'Fai clic con il pulsante destro su un link nella pagina iniziale per aggiungerlo o rimuoverlo dai Preferiti.',
			'Add to favorites': 'Aggiungi ai preferiti', 'Remove from favorites': 'Rimuovi dai preferiti',
			'Sync favorites between browsers': 'Sincronizza i preferiti tra browser', 'Sync recently opened links between browsers': 'Sincronizza i link aperti di recente tra browser',
			'Custom folder icons and colors': 'Icone e colori delle cartelle personalizzati', 'Sync folder appearance between browsers': 'Sincronizza l’aspetto delle cartelle tra browser',
			'Start-page profiles': 'Profili della pagina iniziale', 'Enable profiles': 'Abilita profili', 'Sync profiles between browsers': 'Sincronizza profili tra browser',
			'Preferred profile on this computer': 'Profilo preferito su questo computer', 'Profile name': 'Nome profilo', 'Save current layout as new profile': 'Salva il layout corrente come nuovo profilo',
			'Rename': 'Rinomina', 'Delete': 'Elimina', 'Synchronization': 'Sincronizzazione', 'Status': 'Stato', 'Last activity': 'Ultima attività',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'Gli elenchi opzionali sono sincronizzati solo quando il rispettivo interruttore è attivo. Il profilo preferito resta su questo computer.',
			'Default': 'Predefinito', 'New profile': 'Nuovo profilo', 'Untitled profile': 'Profilo senza nome', 'At least one profile is required.': 'È necessario almeno un profilo.',
			'Folder icon (emoji or short text)': 'Icona cartella (emoji o testo breve)', 'Set folder icon…': 'Imposta icona cartella…', 'Choose folder color': 'Scegli colore cartella', 'Reset folder appearance': 'Reimposta aspetto cartella'
		},
		pt_BR: {
			'Favorites': 'Favoritos', 'Recently opened': 'Abertos recentemente', 'Number of items': 'Número de itens', 'Right-click any link on the start page to add or remove it from Favorites.': 'Clique com o botão direito em um link da página inicial para adicioná-lo ou removê-lo dos Favoritos.',
			'Add to favorites': 'Adicionar aos favoritos', 'Remove from favorites': 'Remover dos favoritos',
			'Sync favorites between browsers': 'Sincronizar favoritos entre navegadores', 'Sync recently opened links between browsers': 'Sincronizar links abertos recentemente entre navegadores',
			'Custom folder icons and colors': 'Ícones e cores de pastas personalizados', 'Sync folder appearance between browsers': 'Sincronizar aparência das pastas entre navegadores',
			'Start-page profiles': 'Perfis da página inicial', 'Enable profiles': 'Ativar perfis', 'Sync profiles between browsers': 'Sincronizar perfis entre navegadores',
			'Preferred profile on this computer': 'Perfil preferido neste computador', 'Profile name': 'Nome do perfil', 'Save current layout as new profile': 'Salvar layout atual como novo perfil',
			'Rename': 'Renomear', 'Delete': 'Excluir', 'Synchronization': 'Sincronização', 'Status': 'Status', 'Last activity': 'Última atividade',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'Listas opcionais só são sincronizadas quando sua opção está ativada. O perfil preferido permanece neste computador.',
			'Default': 'Padrão', 'New profile': 'Novo perfil', 'Untitled profile': 'Perfil sem nome', 'At least one profile is required.': 'É necessário pelo menos um perfil.',
			'Folder icon (emoji or short text)': 'Ícone de pasta (emoji ou texto curto)', 'Set folder icon…': 'Definir ícone de pasta…', 'Choose folder color': 'Escolher cor da pasta', 'Reset folder appearance': 'Redefinir aparência da pasta'
		},
		nl: {
			'Favorites': 'Favorieten', 'Recently opened': 'Onlangs geopend', 'Number of items': 'Aantal items', 'Right-click any link on the start page to add or remove it from Favorites.': 'Klik met de rechtermuisknop op een link op de startpagina om deze toe te voegen aan of te verwijderen uit Favorieten.',
			'Add to favorites': 'Toevoegen aan favorieten', 'Remove from favorites': 'Verwijderen uit favorieten',
			'Sync favorites between browsers': 'Favorieten tussen browsers synchroniseren', 'Sync recently opened links between browsers': 'Onlangs geopende links tussen browsers synchroniseren',
			'Custom folder icons and colors': 'Aangepaste mapiconen en kleuren', 'Sync folder appearance between browsers': 'Mapweergave tussen browsers synchroniseren',
			'Start-page profiles': 'Startpaginaprofielen', 'Enable profiles': 'Profielen inschakelen', 'Sync profiles between browsers': 'Profielen tussen browsers synchroniseren',
			'Preferred profile on this computer': 'Voorkeursprofiel op deze computer', 'Profile name': 'Profielnaam', 'Save current layout as new profile': 'Huidige indeling opslaan als nieuw profiel',
			'Rename': 'Hernoemen', 'Delete': 'Verwijderen', 'Synchronization': 'Synchronisatie', 'Status': 'Status', 'Last activity': 'Laatste activiteit',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'Optionele lijsten worden alleen gesynchroniseerd als hun eigen schakelaar aan staat. Het voorkeursprofiel blijft op deze computer.',
			'Default': 'Standaard', 'New profile': 'Nieuw profiel', 'Untitled profile': 'Naamloos profiel', 'At least one profile is required.': 'Er is minstens één profiel nodig.',
			'Folder icon (emoji or short text)': 'Mappictogram (emoji of korte tekst)', 'Set folder icon…': 'Mappictogram instellen…', 'Choose folder color': 'Mapkleur kiezen', 'Reset folder appearance': 'Mapweergave herstellen'
		},
		pl: {
			'Favorites': 'Ulubione', 'Recently opened': 'Ostatnio otwarte', 'Number of items': 'Liczba elementów', 'Right-click any link on the start page to add or remove it from Favorites.': 'Kliknij prawym przyciskiem link na stronie startowej, aby dodać go do ulubionych lub usunąć.',
			'Add to favorites': 'Dodaj do ulubionych', 'Remove from favorites': 'Usuń z ulubionych',
			'Sync favorites between browsers': 'Synchronizuj ulubione między przeglądarkami', 'Sync recently opened links between browsers': 'Synchronizuj ostatnio otwarte linki między przeglądarkami',
			'Custom folder icons and colors': 'Własne ikony i kolory folderów', 'Sync folder appearance between browsers': 'Synchronizuj wygląd folderów między przeglądarkami',
			'Start-page profiles': 'Profile strony startowej', 'Enable profiles': 'Włącz profile', 'Sync profiles between browsers': 'Synchronizuj profile między przeglądarkami',
			'Preferred profile on this computer': 'Preferowany profil na tym komputerze', 'Profile name': 'Nazwa profilu', 'Save current layout as new profile': 'Zapisz bieżący układ jako nowy profil',
			'Rename': 'Zmień nazwę', 'Delete': 'Usuń', 'Synchronization': 'Synchronizacja', 'Status': 'Stan', 'Last activity': 'Ostatnia aktywność',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'Opcjonalne listy są synchronizowane tylko po włączeniu własnego przełącznika. Preferowany profil pozostaje na tym komputerze.',
			'Default': 'Domyślny', 'New profile': 'Nowy profil', 'Untitled profile': 'Profil bez nazwy', 'At least one profile is required.': 'Wymagany jest co najmniej jeden profil.',
			'Folder icon (emoji or short text)': 'Ikona folderu (emoji lub krótki tekst)', 'Set folder icon…': 'Ustaw ikonę folderu…', 'Choose folder color': 'Wybierz kolor folderu', 'Reset folder appearance': 'Resetuj wygląd folderu'
		},
		tr: {
			'Favorites': 'Favoriler', 'Recently opened': 'Son açılanlar', 'Number of items': 'Öğe sayısı', 'Right-click any link on the start page to add or remove it from Favorites.': 'Başlangıç sayfasındaki bir bağlantıyı favorilere eklemek veya kaldırmak için sağ tıklayın.',
			'Add to favorites': 'Favorilere ekle', 'Remove from favorites': 'Favorilerden kaldır',
			'Sync favorites between browsers': 'Favorileri tarayıcılar arasında eşitle', 'Sync recently opened links between browsers': 'Son açılan bağlantıları tarayıcılar arasında eşitle',
			'Custom folder icons and colors': 'Özel klasör simgeleri ve renkleri', 'Sync folder appearance between browsers': 'Klasör görünümünü tarayıcılar arasında eşitle',
			'Start-page profiles': 'Başlangıç sayfası profilleri', 'Enable profiles': 'Profilleri etkinleştir', 'Sync profiles between browsers': 'Profilleri tarayıcılar arasında eşitle',
			'Preferred profile on this computer': 'Bu bilgisayardaki tercih edilen profil', 'Profile name': 'Profil adı', 'Save current layout as new profile': 'Geçerli düzeni yeni profil olarak kaydet',
			'Rename': 'Yeniden adlandır', 'Delete': 'Sil', 'Synchronization': 'Eşitleme', 'Status': 'Durum', 'Last activity': 'Son etkinlik',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'İsteğe bağlı listeler yalnızca kendi anahtarları açıksa eşitlenir. Tercih edilen profil bu bilgisayarda kalır.',
			'Default': 'Varsayılan', 'New profile': 'Yeni profil', 'Untitled profile': 'Adsız profil', 'At least one profile is required.': 'En az bir profil gereklidir.',
			'Folder icon (emoji or short text)': 'Klasör simgesi (emoji veya kısa metin)', 'Set folder icon…': 'Klasör simgesini ayarla…', 'Choose folder color': 'Klasör rengini seç', 'Reset folder appearance': 'Klasör görünümünü sıfırla'
		},
		ja: {
			'Favorites': 'お気に入り', 'Recently opened': '最近開いた項目', 'Number of items': '項目数', 'Right-click any link on the start page to add or remove it from Favorites.': 'スタートページのリンクを右クリックして、お気に入りに追加または削除できます。',
			'Add to favorites': 'お気に入りに追加', 'Remove from favorites': 'お気に入りから削除',
			'Sync favorites between browsers': 'お気に入りをブラウザー間で同期', 'Sync recently opened links between browsers': '最近開いたリンクをブラウザー間で同期',
			'Custom folder icons and colors': 'カスタムフォルダーアイコンと色', 'Sync folder appearance between browsers': 'フォルダーの外観をブラウザー間で同期',
			'Start-page profiles': 'スタートページプロファイル', 'Enable profiles': 'プロファイルを有効にする', 'Sync profiles between browsers': 'プロファイルをブラウザー間で同期',
			'Preferred profile on this computer': 'このコンピューターの優先プロファイル', 'Profile name': 'プロファイル名', 'Save current layout as new profile': '現在のレイアウトを新しいプロファイルとして保存',
			'Rename': '名前を変更', 'Delete': '削除', 'Synchronization': '同期', 'Status': '状態', 'Last activity': '最終アクティビティ',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': 'オプションのリストは各スイッチがオンの場合のみ同期されます。優先プロファイルはこのコンピューターに残ります。',
			'Default': '標準', 'New profile': '新しいプロファイル', 'Untitled profile': '名称未設定のプロファイル', 'At least one profile is required.': '少なくとも1つのプロファイルが必要です。',
			'Folder icon (emoji or short text)': 'フォルダーアイコン（絵文字または短いテキスト）', 'Set folder icon…': 'フォルダーアイコンを設定…', 'Choose folder color': 'フォルダーの色を選択', 'Reset folder appearance': 'フォルダーの外観をリセット'
		},
		ko: {
			'Favorites': '즐겨찾기', 'Recently opened': '최근에 연 항목', 'Number of items': '항목 수', 'Right-click any link on the start page to add or remove it from Favorites.': '시작 페이지의 링크를 마우스 오른쪽 버튼으로 클릭하여 즐겨찾기에 추가하거나 제거하세요.',
			'Add to favorites': '즐겨찾기에 추가', 'Remove from favorites': '즐겨찾기에서 제거',
			'Sync favorites between browsers': '브라우저 간 즐겨찾기 동기화', 'Sync recently opened links between browsers': '브라우저 간 최근에 연 링크 동기화',
			'Custom folder icons and colors': '사용자 지정 폴더 아이콘 및 색상', 'Sync folder appearance between browsers': '브라우저 간 폴더 모양 동기화',
			'Start-page profiles': '시작 페이지 프로필', 'Enable profiles': '프로필 사용', 'Sync profiles between browsers': '브라우저 간 프로필 동기화',
			'Preferred profile on this computer': '이 컴퓨터의 기본 프로필', 'Profile name': '프로필 이름', 'Save current layout as new profile': '현재 레이아웃을 새 프로필로 저장',
			'Rename': '이름 바꾸기', 'Delete': '삭제', 'Synchronization': '동기화', 'Status': '상태', 'Last activity': '마지막 활동',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': '선택 목록은 각 스위치가 켜진 경우에만 동기화됩니다. 기본 프로필은 이 컴퓨터에 유지됩니다.',
			'Default': '기본값', 'New profile': '새 프로필', 'Untitled profile': '이름 없는 프로필', 'At least one profile is required.': '프로필이 하나 이상 필요합니다.',
			'Folder icon (emoji or short text)': '폴더 아이콘(이모지 또는 짧은 텍스트)', 'Set folder icon…': '폴더 아이콘 설정…', 'Choose folder color': '폴더 색상 선택', 'Reset folder appearance': '폴더 모양 재설정'
		},
		zh_CN: {
			'Favorites': '收藏夹', 'Recently opened': '最近打开', 'Number of items': '项目数量', 'Right-click any link on the start page to add or remove it from Favorites.': '右键单击起始页上的任意链接，可将其添加到收藏夹或移除。',
			'Add to favorites': '添加到收藏夹', 'Remove from favorites': '从收藏夹移除',
			'Sync favorites between browsers': '在浏览器之间同步收藏夹', 'Sync recently opened links between browsers': '在浏览器之间同步最近打开的链接',
			'Custom folder icons and colors': '自定义文件夹图标和颜色', 'Sync folder appearance between browsers': '在浏览器之间同步文件夹外观',
			'Start-page profiles': '起始页配置文件', 'Enable profiles': '启用配置文件', 'Sync profiles between browsers': '在浏览器之间同步配置文件',
			'Preferred profile on this computer': '此电脑上的首选配置文件', 'Profile name': '配置文件名称', 'Save current layout as new profile': '将当前布局保存为新配置文件',
			'Rename': '重命名', 'Delete': '删除', 'Synchronization': '同步', 'Status': '状态', 'Last activity': '上次活动',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': '可选列表仅在各自开关开启时同步。首选配置文件保留在此电脑上。',
			'Default': '默认', 'New profile': '新配置文件', 'Untitled profile': '未命名配置文件', 'At least one profile is required.': '至少需要一个配置文件。',
			'Folder icon (emoji or short text)': '文件夹图标（表情或短文本）', 'Set folder icon…': '设置文件夹图标…', 'Choose folder color': '选择文件夹颜色', 'Reset folder appearance': '重置文件夹外观'
		},
		zh_TW: {
			'Favorites': '我的最愛', 'Recently opened': '最近開啟', 'Number of items': '項目數量', 'Right-click any link on the start page to add or remove it from Favorites.': '在起始頁上的任何連結按右鍵，即可加入或移除我的最愛。',
			'Add to favorites': '加入我的最愛', 'Remove from favorites': '從我的最愛移除',
			'Sync favorites between browsers': '在瀏覽器之間同步我的最愛', 'Sync recently opened links between browsers': '在瀏覽器之間同步最近開啟的連結',
			'Custom folder icons and colors': '自訂資料夾圖示和顏色', 'Sync folder appearance between browsers': '在瀏覽器之間同步資料夾外觀',
			'Start-page profiles': '起始頁設定檔', 'Enable profiles': '啟用設定檔', 'Sync profiles between browsers': '在瀏覽器之間同步設定檔',
			'Preferred profile on this computer': '此電腦上的偏好設定檔', 'Profile name': '設定檔名稱', 'Save current layout as new profile': '將目前版面配置另存為新設定檔',
			'Rename': '重新命名', 'Delete': '刪除', 'Synchronization': '同步', 'Status': '狀態', 'Last activity': '最後活動',
			'Optional lists are synchronized only when their individual switch is on. The preferred profile stays on this computer.': '選用清單只有在各自開關啟用時才會同步。偏好設定檔會保留在此電腦上。',
			'Default': '預設', 'New profile': '新增設定檔', 'Untitled profile': '未命名設定檔', 'At least one profile is required.': '至少需要一個設定檔。',
			'Folder icon (emoji or short text)': '資料夾圖示（表情符號或短文字）', 'Set folder icon…': '設定資料夾圖示…', 'Choose folder color': '選擇資料夾顏色', 'Reset folder appearance': '重設資料夾外觀'
		}
	};
	Object.keys(featureTranslations).forEach(function(language) {
		Object.assign(dictionaries[language], featureTranslations[language]);
	});
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
