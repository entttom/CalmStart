# Chrome Web Store listing

This document contains the recommended Chrome Web Store metadata for CalmStart 1.0.0.

## Product details

**Name:** CalmStart

**Summary:** A calm, customizable new tab page with bookmarks, flexible columns, and browser sync.

**Category:** Productivity

**Language:** English

### Detailed description

CalmStart turns your new tab page into a clean, customizable home for your bookmarks.

Arrange bookmark folders in flexible columns, drag and drop your layout, and tailor fonts, colors, spacing and backgrounds to create a start page that stays out of your way. CalmStart can also show your most visited pages, recent bookmarks, recently closed tabs and tabs from other devices.

Your layout and supported settings can follow you between browser profiles using the browser's built-in extension sync. CalmStart does not use a developer-operated sync server.

Key features:

- Flexible, column-based bookmark layout
- Drag-and-drop organization
- Browser-native sync for layout and settings
- Custom fonts, colors, spacing and backgrounds
- Most visited and recent bookmarks
- Recently closed tabs and other devices
- Local layout recovery backups
- No advertising or developer-operated analytics

CalmStart is based on the open-source Humble New Tab Page project and is distributed under the MIT License.

## Privacy practices

### Single purpose

CalmStart replaces the browser's new tab page with a customizable bookmark dashboard and synchronizes the user's chosen layout and settings through browser-provided extension storage.

### Permission justifications

**bookmarks** — Required to read the user's bookmark folders and bookmarks so they can be displayed and arranged on the CalmStart new tab page.

**favicon** — Required to display the browser-provided favicon for bookmark and page entries.

**topSites** — Required only for the optional “Most visited” section shown on the new tab page.

**tabs** — Required to open links in the user's selected foreground/background tab mode and to support browser-tab related new-tab features.

**fontSettings** — Required to enumerate available browser fonts for CalmStart's font customization option.

**sessions** — Required for the optional “Recently closed” and “Other devices” sections.

**storage** — Required to save CalmStart settings and layout locally and to synchronize supported settings/layout through the browser's built-in extension sync storage.

**Optional file access** — Used only when the user chooses to open a bookmarked local file URL. It is not used for general filesystem access.

### Remote code

No. CalmStart does not execute remotely hosted code.

### Data handling notes

CalmStart reads bookmark data and, when enabled by its features, browser-provided most-visited/session information to render the new tab page. Supported settings and portable layout metadata are stored in browser extension storage. Portable layout metadata may contain bookmark folder titles and structural references and can be synchronized by the user's browser account provider.

CalmStart does not send this data to developer-operated servers and does not use it for advertising.

## Graphic assets

Chrome Web Store assets to prepare:

- Store icon: 128 × 128 PNG
- Screenshots: 1280 × 800 PNG/JPEG, 1–5 images
- Small promo tile: 440 × 280 PNG/JPEG
- Marquee promo tile: 1400 × 560 PNG/JPEG (optional)

Current screenshots (`media/shot.1.png`–`shot.5.png`, 1280 × 800):

1. Main CalmStart page with a representative multi-column bookmark layout.
2. Folder context menu ("Create new column" / "Open all links in folder") showing column organization.
3. Appearance settings showing theme, font, spacing and background controls.
4. Synchronization settings and sync diagnostics demonstrating browser-native sync.
5. Start-page profiles, showing the profile tab bar for switching between saved layouts.

Store screenshots should show the actual current extension UI rather than mockups. These were captured by loading the real `newtab.html`/settings UI in a browser with mocked `chrome.*` APIs and representative demo bookmarks (not the developer's real bookmarks or any user data).
