# RC222 cooperative storage contract

`assets/rc222/storage.js` installs `window.__HAPIL_COOP_STORAGE_RC222__`.
It never modifies browser `Storage` objects or their prototypes.

The native `MONGSE_storageGet`, `MONGSE_storageSet`, and `MONGSE_writeSave`
entry points opt into scoped storage while a cooperative session is active.
This includes legacy save migration reads, auto saves, numbered slots, backups,
mirrors, settings, ending flags, passives, shards and campaign progress saved
through `Fi`. Direct progression stores must use `area(name)` at their call sites:

- `hapil.samongUnlocked.rc91` and `hapilEndingCleared` in the Samong module.
- `hapil.pattern-codex.v1` in the pattern codex.
- `hapil.pattern-records.v1` in the native pattern room.

Runtime capture and restoration also preserve records held in memory, local
settings, the selected hero, party references, passives, shards, the world,
and the global ending flag. Storage redirection cannot restore private module
variables by itself; the runtime bridge owns those references.

## Public methods

| Method | Contract |
| --- | --- |
| `configure(bridge)` | Set synchronous runtime callbacks while inactive. |
| `enter(role, session)` | Capture local state, then isolate reads and writes. Role is `host` or `guest`; session is a string or an object containing `sessionId`, `id`, `roomId` or `code`. Repeating the same entry is harmless. |
| `leave()` | Restore the captured local state once. On a failed restore, isolation stays active so a later retry is safe. |
| `save(slot='auto')` | Host captures and validates a full authoritative checkpoint. |
| `load(slot='auto')` | Host validates before applying through the runtime transition path. Captures rollback state; a failed apply restores it. Does not invoke reward or gameplay actions. |
| `export(slot='auto')` | Return a validated checkpoint JSON string, or `null`. |
| `import(json, slot='auto')` | Validate and store a checkpoint in the current host session. Loading is an explicit second action. |
| `list()` | Current host session checkpoint summaries: `{slot, savedAt, zone}`. |
| `status()` | `{active, role, session, keyPrefix, restoring, blockedWrites, lastError}`. |
| `read(key)`, `write(key,value)` | Native local/session/memory fallback contract under a scoped key. |
| `area(name)` | `getItem`, `setItem`, `removeItem` facade for a direct local or session storage caller. |
| `nativeSave(slot,payload)` | Native host save plus full checkpoint; guest calls fail without writing. |

Mutation methods return `{ok, reason?}` with persistence details when applicable.
Slot names contain 1–64 letters, digits, underscores or hyphens. Checkpoint files
are capped at 16 MiB with recursion and entry limits. Malformed files, dangerous
object keys, invalid number tags and invalid snapshots are rejected before writes.

## Isolation and durability

Native values use
`hapil.coop.rc222.<encoded-session>.native.<encoded-original-key>`.
Checkpoints use
`hapil.coop.rc222.<encoded-session>.checkpoint.<slot>`.
There is no fallback from a cooperative key to a single player key or another
session. A host can export a checkpoint and import it into a new room.

On first host entry, missing scoped values for the three entitlement flags
(`hapil.samongUnlocked.rc91`, `hapilEndingCleared`,
`hapilCampaignCompleteV31301`) and `mongse_settings_v1` are seeded from a copy
of local values. Existing cooperative values take precedence. No single player
save slot is copied. Guests receive no entitlement seed.

Guests receive no persisted host or solo values through the scoped store and
cannot write, remove, save, import, export or load checkpoints. They display the
host world through runtime snapshots. Leaving a session restores local runtime
state without replacing any single player storage values.

Writes verify local storage, then session storage; memory is a final fallback.
`persistent` means verified local storage. `reloadSafe` means verified local or
session storage. Memory success alone does not claim reload durability.

Checkpoint JSON preserves positive and negative infinity with explicit number
tags. Native snapshot Set/Map tags remain intact. The separate local rollback
copy also preserves native Sets, Maps, undefined fields and shared references.

## Runtime bridge

Supply `captureLocal`, `restoreLocal`, `captureCheckpoint`, `applyCheckpoint`,
and `validateCheckpoint`. Validation must return boolean `true` for accepted
snapshots. The checkpoint apply callback must be synchronous; the host already
has a world. It must use the authoritative full snapshot transition path, clear
pending inputs, resequence snapshots and avoid replaying reward callbacks.
The transport publishes the resulting full transition to peers.

## Verification

Run from the repository root:

```sh
node tests/rc222-storage-unit.cjs
```

The suite executes the actual native storage helper functions from the bundle,
plus local/session/memory failure fixtures. It covers host and guest isolation,
settings and progression keys, separate rooms, import/export, repeated loads,
failed load rollback, local restoration, repeated leave, failed restore retry,
malformed files, unsafe keys, infinity values and native collection restoration.
It also executes the actual Samong unlock functions and pattern codex
reload/save/restore functions to verify direct progression store isolation.
Browser persistence and peer synchronization require the broader runtime and
browser integration checks.
