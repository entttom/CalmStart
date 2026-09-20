# Community feature roadmap

This branch builds on the browser-sync work and groups long-standing user requests from the upstream issue tracker into coherent feature areas.

## Implemented

### Browser-native sync
- Upstream issue #3
- Settings and layout synchronization using browser extension storage
- Portable bookmark-folder references
- Conflict recovery and diagnostics

### Bookmark search
- Upstream issues #23 and #130
- Search by bookmark title, URL and folder path
- Keyboard shortcut: Ctrl/Cmd+K (and / when not typing)
- Keyboard navigation with Arrow Up/Down, Enter and Escape
- Live index refresh when bookmarks change

### Direct bookmark management
- Upstream issues #22, #54 and #56
- Edit bookmark title and URL
- Move bookmark to another folder
- Delete bookmark
- Create bookmark directly inside a folder
- Create subfolder directly inside a folder
- Rename folder directly from Humble

### Multiple layouts and curated views
- Upstream issues #40, #82, #85 and #105
- Named layouts with independent synchronized column arrangements
- Active layout selection remains device-specific
- Duplicate folder placements use portable placement references and synchronize across devices
- Curated layout mode allows selected/root folders to remain intentionally omitted

### Custom links / speed-dial style area
- Upstream issue #58
- Custom links live outside the browser bookmark tree
- Custom links synchronize with other settings
- Optional permanently-open Custom Links section
- This also covers the core speed-dial use case from #120, although arbitrary real bookmark folders cannot yet be individually pinned open

### Per-column presentation
- Upstream issues #18, #57 and #112
- Individual percentage width per column
- Optional column title
- Optional column background
- Settings are stored per named layout and synchronized

Issue #133 is partially covered by per-column backgrounds; explicit separator rows are still open.

### Icon and favicon controls
- Upstream issues #98, #109, #111 and #121
- Show/hide icons
- 16/20/24/32 px display sizes
- Higher-resolution favicon requests
- Portable custom folder icons (emoji/short text)

Issues #95 and #104 remain partial/open: arbitrary per-domain image overrides and a dedicated favicon cache are not implemented.

### Appearance
- Upstream issues #38 and #103
- Dark mode can be Off, Follow system, or Always
- Dark mode also styles options/dialog surfaces

### Sorting and keyboard navigation
- Upstream issues #15, #90 and #102
- Optional alphabetical item sorting
- Optional reverse order for Recent bookmarks
- Arrow Up/Down navigation within a column
- Arrow Left/Right navigation between columns
- Enter activation remains supported

### Folder middle-click
- Upstream issue #75
- Middle-clicking a folder opens all links in that folder

## Still open

### Performance
- #49 Large Firefox bookmark collections
- #125 Slow URL lookup
- #127 Slow initial load

Planned direction: benchmark tree traversal/rendering first, then avoid repeated full-tree work and cache derived indexes where safe.

### Appearance and background
- #76 Optional clock is implemented
- #124 Dashboard/widget additions remain intentionally optional/future work
- #135 Automatically refreshing an externally changed local background file needs a different file-access design

### Remaining navigation/content items
- #101 Remove items from recent lists where browser APIs permit it
- #126 Optional web-search engine panel is implemented inside the bookmark search palette (DuckDuckGo/Google/Bing)
- #133 Explicit separator rows
- #95 Arbitrary custom favicon/domain overrides
- #104 Dedicated favicon cache

## Design principle

Humble should remain fast, local-first and bookmark-centric. New capabilities should be optional and should not turn the default new-tab page into a heavy dashboard.
