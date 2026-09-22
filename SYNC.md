# CalmStart Browser Sync

CalmStart synchronizes its layout and settings through the browser's built-in extension sync storage without requiring an external service.

## What is synchronized

- Layout and column ordering
- Appearance and behavior options
- Visibility settings for bookmark roots and special folders
- Start-page profile definitions, when profiles are enabled

The implementation uses `chrome.storage.sync` for synchronized state.

## What stays local

- Open/closed folder state, unless **Sync open folders between browsers** is enabled
- Favorites, recently opened links and folder appearance, unless their respective sync switches are enabled
- The preferred start-page profile for this browser installation
- Local background-image file data
- Device identifier
- Layout recovery backups
- Sync diagnostics metadata

Local-only data is stored in `chrome.storage.local`.

## Optional open-folder sync

When enabled in Settings, CalmStart synchronizes the folders that are currently open. The state is off by default and uses the same portable folder references as the layout, so it can be resolved in another browser profile without synchronizing the full bookmark database.

## Optional personal lists and folder appearance

Favorites, recently opened links and custom folder appearance are stored locally by default. Each feature has its own sync switch. Enabling one transfers only the selected feature through browser sync; it does not enable the others.

Favorites and recently opened links contain the selected URL and title. Folder appearance uses portable folder references plus the selected icon and color, so it can be resolved against the bookmark tree on another browser profile.

## Start-page profiles

Profiles store a name and a complete portable column layout. When profiles are enabled, profile definitions are synchronized by default and can be turned off with **Sync profiles between browsers**. The preferred profile is deliberately local to each browser installation, allowing a work computer and a home computer to open different profiles while sharing the same profile set.

## Portable bookmark references

Bookmark IDs are profile-local and are therefore not suitable as synchronized layout identifiers. Layout entries use portable folder references containing the bookmark root position, folder path, duplicate-name occurrence, child count and a content fingerprint.

On another profile the portable reference is resolved to that profile's local bookmark ID. For non-empty renamed or restructured folders, the content fingerprint provides a safe fallback. Empty folders deliberately skip fingerprint fallback to avoid resolving to an unrelated empty folder.

Special folders such as Most visited, Apps, Recent bookmarks, Recently closed and Other devices retain stable symbolic IDs.

## Conflict handling

Each browser installation has a local device ID and writes its own layout candidate under a separate sync key. Layout candidates contain a revision, timestamp, device ID, content hash and portable columns. The newest candidate is applied.

Before a different remote layout is applied, the current layout is saved locally. Up to 10 recovery backups are retained. Settings are synchronized independently per option using versioned envelopes, so an unrelated settings change does not replace the whole settings object.

## Migration

On first start after upgrading from the original storage format:

1. Existing `localStorage` values are read.
2. Local-only values move to `chrome.storage.local`.
3. Syncable settings seed `chrome.storage.sync` unless synchronized values already exist.
4. Existing column layout is converted from local bookmark IDs to portable references.
5. The synchronous `localStorage` API remains as a compatibility facade for the existing `newtab.js`.

The page loads `newtab.js` only after storage migration and hydration have completed.

## Sync diagnostics

The Advanced tab contains a `Sync diagnostics` section for testing and support. It shows sync health, device ID, layout revision/hash, recent upload and remote-update timestamps, pending changes, sync storage usage, unresolved bookmark references, conflict/backup counts, the latest storage error and an in-memory event log.

Controls are provided to:

- **Sync now** - flush pending layout and optional-feature writes, then refresh diagnostics.
- **Reload remote state** - reread synchronized settings, layout and enabled optional features.
- **Restore previous layout** - republish the latest local recovery backup.
- **Copy diagnostics** - copy a support-friendly report including recent events.
