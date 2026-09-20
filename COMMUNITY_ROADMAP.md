# Community feature roadmap

This branch builds on the browser-sync work and groups long-standing user requests from the upstream issue tracker into coherent feature areas.

## Implemented

### Browser-native sync
- #3 Options synchronization
- Settings and layout synchronization using browser extension storage
- Portable bookmark-folder references
- Conflict recovery and diagnostics

### Search and navigation
- #23, #126, #130 bookmark/web search
- Search by bookmark title, URL and folder path
- Ctrl/Cmd+K and / shortcuts
- Optional DuckDuckGo, Google or Bing web-search result
- #102 keyboard navigation with Arrow keys and Enter

### Direct bookmark management
- #22, #54, #56
- Edit title/URL, move, delete, create bookmark, create/rename folder
- #75 middle-click folder to open all links

### Multiple layouts and curated views
- #40 duplicate folders
- #82 curated/single-folder layouts
- #85, #105 named multiple layouts
- Independent synchronized column arrangements
- Active layout remains device-specific
- Portable duplicate placement references
- Undo stack / recovery for local layout changes (#69)

### Custom links and speed dial
- #58 synchronized custom links outside the bookmark tree
- #120 permanently-open Custom Links section

### Per-column and layout presentation
- #18 individual column widths
- #57 per-column styling/background
- #112 optional column title
- #133 per-column backgrounds and bookmark separator rendering
- #37 text alignment
- #99 center single column

### Icons and favicons
- #95 validated domain -> icon JSON overrides
- #98 configurable 16/20/24/32 px icons
- #104 bounded local favicon cache
- #109 hide icons
- #111 higher-resolution favicon requests
- #121 portable custom folder icons
- Large favicon overrides remain local-only to avoid sync quota problems

### Appearance and background
- #38, #103 dark mode: Off / Follow system / Always
- #44 one-click background-only view
- #76 optional clock
- #17, #135 live local background file using File System Access + IndexedDB
  - file handle is remembered locally
  - current file is reread on new tabs
  - open tabs poll for file changes

### Recent items
- #15 reverse Recent bookmarks
- #90 alphabetical sorting
- #101 Recent bookmarks can be deleted via direct bookmark editing
- #101 individual Recently closed entries can be hidden locally and restored
- #29, #55 Recently closed single tabs respect "Current tab"
- #108 single-tab windows restore as tabs instead of unnecessarily reopening a window

### Optional history
- #66 History section
- browsing-history permission is optional and requested only when the user enables History
- up to 200 recent history items

### Reset and recovery
- #69 Undo last layout change
- #81 Reset current layout / Reset settings
- Sync diagnostics include layout recovery

### Performance
- #49, #125, #127
- Persistent flat bookmark-folder index in chrome.storage.local
- MV3 background worker invalidates the index when bookmarks change
- New tabs reuse the cached index instead of traversing the full bookmark tree
- Root folders reuse the cached index instead of calling getTree() again
- Bookmark search builds its full URL index lazily only when search is opened
- Diagnostics show index source, folder count, index time and storage initialization time

## Partially covered / deferred

### Tabliss-style dashboard
- #124 is partially covered by optional clock, backgrounds, layouts and custom links
- No built-in Unsplash client or large widget framework has been added; the default page stays intentionally lightweight

### Browser/platform-specific issues
- #42 full UI translations are not yet implemented
- #46 Firefox containers
- #67/#74 legacy Firefox crashes
- #91 Vivaldi omnibox focus
- #100 Microsoft Edge Store publishing
- #110 Opera favicon behavior is mitigated by override/cache controls but needs browser-specific testing
- #122 Firefox internal URL handling
- #129 Chrome incognito behavior
- #132 Firefox Home-page context

### Browser API limitations / external data
- #14 old Google Products integration is obsolete
- #25 Pinboard requires an external service/account
- #43/#65 retired Yahoo Weather integration
- #52 Most Visited count is constrained by browser APIs
- #77 stale Other Devices are controlled by browser session sync
- #94 Most Visited ordering is browser-provided
- #97 tab-position restoration depends on browser/session implementation

### Remaining nice-to-have items
- #32 font preview browser
- #73 broader appearance inheritance for every settings control (dark mode is implemented)
- #78 user-defined per-link hotkeys
- #88 optional icon contrast/backplates
- #124 additional widgets
- #26 donation / in-app purchase is intentionally outside the feature branch

## Design principle

Humble should remain fast, local-first and bookmark-centric. New capabilities should be optional and should not turn the default new-tab page into a heavy dashboard.
