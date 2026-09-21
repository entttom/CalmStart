# CalmStart

A calm, customizable new tab page built around your bookmarks.

CalmStart keeps the lightweight, column-based experience of Humble New Tab Page and adds browser-native synchronization for settings and layout.

## Features

- Clean, lightweight new tab page
- Bookmark folders arranged in flexible columns
- Drag-and-drop layout
- Search selected bookmark folders or all bookmarks, with optional web search
- Choose between filtering the existing layout and a separate full results page
- Custom fonts, colors, spacing and backgrounds
- Most visited, recent bookmarks, recently closed tabs and other devices
- Browser-native sync for settings and layout
- Portable bookmark-folder references across browser profiles
- Local recovery backups for layout conflicts
- No external sync server

## Search behavior

CalmStart offers two result displays:

- **Dropdown** searches the selected bookmark source and shows matching bookmarks below the search field.
- **Full page** offers two behaviors: **Filter current layout** preserves the existing columns and folder positions, while **Show matching bookmarks** renders a separate grouped result page from the selected bookmark source.

## Sync

CalmStart uses the browser's built-in extension storage. Syncable settings and portable layout metadata are stored in `chrome.storage.sync`; device-specific state stays in `chrome.storage.local`.

See [SYNC.md](SYNC.md) for implementation details, migration behavior and diagnostics.

## Privacy

CalmStart does not send user data to developer-operated servers and does not sell or share user data for advertising. See [privacy.md](privacy.md).

## Credits

CalmStart is based on [Humble New Tab Page](https://github.com/ibillingsley/HumbleNewTabPage) by Ian Billingsley.

The original project and this derivative are distributed under the MIT License. See [LICENSE_MIT.txt](LICENSE_MIT.txt).

## Version

### 1.0.0

- Rebranded as CalmStart
- Added browser-native synchronization for settings and layout
- Added portable bookmark-folder references
- Added migration from the original local storage format
- Added layout recovery backups and sync diagnostics
