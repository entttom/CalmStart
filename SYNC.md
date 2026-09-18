# Browser Sync (development fork)

The `feature/sync-storage` branch adds browser-native synchronization for Humble New Tab Page without introducing an external backend.

## What is synchronized

- Layout / column ordering
- Appearance and behavior options
- Visibility settings for bookmark roots and special folders

The browser's extension sync storage is used (`chrome.storage.sync`, or the browser equivalent).

## What stays local

- Open/closed folder state
- Local background-image file data
- Device identifier
- Layout recovery backups
- Sync diagnostics

Local-only data is stored in `chrome.storage.local`.

## Portable bookmark references

Bookmark IDs are profile-local, so raw IDs are not synchronized. A layout entry instead stores a portable folder reference containing the root position, folder path, duplicate-name occurrence and a content fingerprint. On another profile the reference is resolved back to that profile's local bookmark ID. The fingerprint provides a fallback for common rename/restructure cases.

## Conflict handling

Each browser installation has a local device ID and writes its own layout candidate under a separate sync key. Layout candidates carry an update timestamp, revision, device ID and content hash. The newest candidate is applied. This avoids two devices overwriting the only copy of the other device's layout.

Before a different remote layout is applied, the current portable layout is saved locally. Up to 10 layout backups are retained. `Options -> Advanced -> Development / Sync -> Restore previous layout` republishes the latest backup as a new layout revision.

Settings are synchronized independently per option using versioned envelopes. This prevents an unrelated appearance change from replacing the entire layout/settings object.

## Migration

On first start after upgrading from the original Humble storage format:

1. Existing `localStorage` values are read.
2. Local-only values move to `chrome.storage.local`.
3. Syncable settings seed `chrome.storage.sync` unless a synchronized value already exists.
4. The existing column layout is converted from local bookmark IDs to portable references.
5. The old synchronous `localStorage` API remains as a compatibility facade for `newtab.js`.

The page loads `newtab.js` only after storage migration/hydration has completed.

## Testing with two Chrome profiles

Load the repository as an unpacked extension in two Chrome profiles signed into the same Chrome account with sync enabled. Use the `feature/sync-storage` branch.

Recommended checks:

- Existing layout survives the first upgrade.
- Fresh second profile receives settings and layout.
- Folder references resolve when bookmark IDs differ between profiles.
- Moving folders/columns on profile A reaches profile B and vice versa.
- Concurrent layout edits create a recovery backup instead of silently losing the previous local layout.
- `Restore previous layout` republishes the backup.
- Open/closed folder state does not follow another device.
- A locally selected background-image file does not sync.
- Import/export from this branch includes a portable layout payload.

Sync diagnostics are visible under `Options -> Advanced -> Development / Sync`.


## Sync diagnostics

The Advanced tab contains a `Sync diagnostics` section intended for testing and support. It shows:

- Current sync health (`OK`, `Pending`, `Offline`, or `Error`)
- Browser sync availability, device ID, layout revision and layout hash
- Last sync activity, last successful upload and last remote update/device
- Pending local changes, number of remote layout candidates and sync storage usage
- Unresolved portable bookmark references
- Backup/conflict counts and the last storage error
- An in-memory event log containing the last 50 events for the current tab

The controls provide:

- **Sync now** - flushes a pending layout write and refreshes sync diagnostics.
- **Reload remote state** - rereads synchronized settings/layout and applies the current winner.
- **Restore previous layout** - republishes the latest local recovery backup.
- **Copy diagnostics** - copies a support-friendly text report including recent events.

Successful sync operations are intentionally not spammed to the browser console. The console remains useful for storage/runtime warnings and initialization failures.
