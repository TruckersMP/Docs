---
sidebar_position: 6
title: Versioning
description: How the SDK stays compatible and what a version bump means for you.
---

# Versioning

## One number

The SDK has a single version, `TRUCKERSMP_SDK_VERSION`, baked into the headers
you compile against. It is packed as `0xAABBBBCC` (major.minor.patch).

## The handshake

`Session::Create` declares your compiled-against version to the client before
anything else happens. There are three outcomes:

- **Your SDK version is supported:** everything you compiled against exists, in
  full. The session comes up and every table you know about is complete.
- **Your SDK is newer than the client:** the client refuses the declaration, and
  `Session::Create` returns `nullptr`. Return `false` from `truckersmp_init` and
  the plugin simply stays unloaded. The client keeps itself up to date, so in
  practice this window is short.
- **Your SDK is older than the minimum the client still supports:** the client
  refuses in the same way. See the support window below.

This is why you never null-check individual functions inside a module: if a
module table is served at all, every member your headers declare is present.

## The support window

SDK versions are supported for about **one year**. Within that window, a plugin
binary runs unchanged on current clients; past it, the client may refuse the
plugin until it is rebuilt against a current SDK.

The window exists so the client does not have to carry every past version
forever: functionality that was retired long ago can be dropped once no
supported SDK version still contains it. We generally aim to keep backward
compatibility as much as possible; however, should such changes be needed, they
will be documented.

Support always covers one line of releases. There is only one game client, so
a fix ships in the newest SDK; an older major version never receives its own
follow-up releases.

## What upgrading the SDK means

The SDK surface mostly grows. When you drop in newer headers:

- Existing code keeps compiling and keeps meaning the same thing.
- New modules, methods, and events become visible.
- Your plugin now requires a client at least as new as those headers.

Major releases may drop existing events, functions, or even modules.

## Retired functionality

Occasionally a member outlives its usefulness. The SDK retires it in stages:

1. **Deprecated:** the member still works; the headers mark it and your compiler
   warns. Migrate when convenient.
2. **Retired:** the member remains callable forever (the layout never changes)
   but answers like a missing service: actions return `NotSupported`, getters
   return empty.
