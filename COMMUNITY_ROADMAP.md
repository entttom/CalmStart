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
- Keyboard shortcut: Ctrl/Cmd+K
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

### Folder middle-click
- Upstream issue #75
- Middle-clicking a folder opens all links in that folder

## Next

### Multiple layouts and curated views
- #40 Allow duplicate folders
- #82 Use selected folders only
- #85 Multiple pages
- #105 Multiple layouts
- #120 Always-open / speed-dial style folder

Planned direction: named layouts with independent columns, synchronized through the existing portable layout storage.

### Per-column presentation
- #18 Individual column widths
- #57 Column styling
- #112 Optional column/folder title
- #133 Column backgrounds and separators

Planned direction: column metadata stored alongside portable layout references.

### Favicons and folder icons
- #95 Custom favicon overrides
- #98 Larger favicons
- #104 Local favicon cache
- #109 Disable icons
- #111 High quality favicons
- #121 Custom folder icons

Planned direction: one unified icon configuration rather than separate special cases.

### Performance
- #49 Large Firefox bookmark collections
- #125 Slow URL lookup
- #127 Slow initial load

Planned direction: measure tree traversal/rendering, avoid repeated full-tree work and cache derived indexes where safe.

### Appearance and background
- #38 Night mode
- #76 Clock / changing wallpaper
- #103 Dark mode
- #124 Optional dashboard-style additions
- #135 Refresh local background image

Planned direction: keep all additions optional so the default page stays minimal.

### Navigation and quality-of-life
- #15 Sort direction
- #58 Custom links
- #90 Sort by name
- #101 Remove items from recent lists where browser APIs permit it
- #102 Keyboard navigation
- #126 Optional web-search panel

## Design principle

Humble should remain fast, local-first and bookmark-centric. New capabilities should be optional and should not turn the default new-tab page into a heavy dashboard.
