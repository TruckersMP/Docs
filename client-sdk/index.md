---
sidebar_position: 1
title: Overview
description: What the TruckersMP Client SDK is and what you can build with it.
slug: /
---

# TruckersMP Client SDK

The TruckersMP Client SDK lets you write native plugins that run inside the
TruckersMP client for Euro Truck Simulator 2 and American Truck Simulator. A
plugin is a Windows x64 DLL that the client loads at startup. From there it can
react to game events, read live world state, draw overlays, and extend gameplay
systems.

The SDK ships as a set of C and C++ headers from the
[TruckersMP/GameClientSDK](https://github.com/TruckersMP/GameClientSDK)
repository on GitHub. There is nothing to link against: every connection between
your plugin and the client happens at runtime through function tables.

## What you can build

- **A bus job tracker.** The [bus module](advanced/bus.md) reports the active
  job, its stops, and passenger counts for bus jobs managed by the TruckersMP
  client. A plugin can show a route board with the next stop and its distance,
  or keep a history of finished routes and payouts.
  [Tracking Bus Jobs](how-to/bus-job-tracking.md) builds one step by step.
- **An in-game overlay.** Combine three modules: [Render](modules/render.md) for
  the device and frame events, [Input](modules/input.md) for keyboard and mouse
  (including blocking clicks and showing the cursor), and
  [User Interface](modules/user-interface.md) for notifications. A settings
  window drawn with Dear ImGui on top of the game is exactly this trio.
- **A player radar.** The [Player](modules/player.md) module lists every player
  around the local player with their distance from them, and the
  [Vehicle](modules/vehicles-and-trailers.md) module gives their positions:
  everything a minimap needs.

## The shape of the SDK

The SDK has two layers:

- **The C++ wrapper** (`TruckersMP.hxx`) is the product. It gives you a
  `Session` object with typed modules (`Core()`, `Player()`, and so on),
  `std::optional` getters, and type-safe events. If you write C++, this is the
  only layer you touch.
- **The C headers** (`TruckersMP.h`, `TruckersMP_Base.h`) are the interop layer
  underneath, there for binary compatibility between your plugin and the client.
  You do not program against them; the wrapper compiles into your plugin and
  speaks that layer for you. C++ is the supported wrapper today.

Some modules are open to everyone. Others are gated behind an **intent**: a
per-project grant that ships as a small add-on package. The bus module is the
first public intent; read [Intents](advanced/intents.md) for how that works.

One boundary is fixed: the SDK covers **TruckersMP functionality only**. Game
data that the
[SCS telemetry SDK](https://modding.scssoft.com/wiki/Documentation/Engine/SDK/Telemetry)
already provides, such as the base game's job economy, will never be part of
this SDK. The two SDKs are designed to co-exist in one plugin; use each for what
it covers.

## Where to go next

1. [Getting Started](getting-started.md) walks you from an empty folder to a
   plugin that logs a message and shows a notification.
2. [Core Concepts](concepts/architecture.md) explains sessions, modules, events,
   handles, and the rules that keep plugins compatible across updates.
3. The [Modules](modules/core.md) section documents every public module.
4. [How to](how-to/bus-job-tracking.md) articles walk through complete tasks,
   such as tracking bus jobs end to end.
5. [Advanced](advanced/intents.md) covers intent-gated modules, the bus gameplay
   module, and recommended patterns.
6. The [Change Log](changelog.md) lists every SDK release.

Looking for the HTTP API instead? The [Web API reference](/web-api/) documents
`api.truckersmp.com`, which serves player profiles, bans, servers, and other
stuff over HTTPS. It is independent of the Client SDK.
