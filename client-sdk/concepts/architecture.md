---
sidebar_position: 1
title: Architecture
description: Sessions, modules, and how the SDK stays stable across client updates.
---

# Architecture

## One session, many modules

Everything starts with `TruckersMP::Session`. You create it once, inside
`truckersmp_init`, and destroy it in `truckersmp_shutdown`:

```cpp
g_session = TruckersMP::Session::Create( host );
```

The session owns one accessor per module:

| Accessor | Module | What it covers |
| --- | --- | --- |
| `Core()` | [Core](../modules/core.md) | Plugin and client core |
| `Account()` | [Account](../modules/account.md) | The local player's account |
| `Player()` | [Player](../modules/player.md) | Local and remote players |
| `Vehicle()` | [Vehicles](../modules/vehicles-and-trailers.md) | Vehicle state and lifecycle |
| `Trailer()` | [Trailers](../modules/vehicles-and-trailers.md) | Trailer state and lifecycle |
| `Input()` | [Input](../modules/input.md) | Keyboard, mouse, input locks and events |
| `Render()` | [Render](../modules/render.md) | Renderer info, frame events |
| `Network()` | [Network](../modules/network.md) | Connection state, ping, server |
| `Gameplay()` | [Gameplay](../modules/gameplay.md) | Mounted packages, zones |
| `UserInterface()` | [User Interface](../modules/user-interface.md) | Notifications |

Modules are cheap references into the session; call the accessor whenever you
need one. Intent-gated modules (such as the [bus module](../advanced/bus.md))
live in their own add-on packages and attach to the session separately.

## Availability is part of the model

Every module has an `IsAvailable()` check, every getter returns `std::optional`,
and every action returns a [`Result`](results.md). A module can be absent
because the client is older than your SDK, because you lack an intent, or
because the client retired an API. A getter can be empty because you are not in
a game world yet, or because a handle went stale.

**Absence is a normal answer, not an error.** Give every read a sensible default
and your plugin survives every client update without special cases.

```cpp
// Not connected? GetLastPing() answers empty and the widget shows 0.
DrawPingWidget( g_session->Network().GetLastPing().value_or( 0 ) );
```

## State via getters, transitions via events

The SDK follows one contract idiom throughout:

- **Getters answer "what is true right now."** They work at any time, including
  right after your plugin loads mid-session.
- **Events tell you "something just changed."** They fire at the moment of the
  change and never replay.

If you need current state, poll a getter; do not reconstruct state from events
you may have missed. If you need to react to a change, register for the event;
do not poll a getter every frame looking for differences.

## Under the hood

The C++ wrapper is a set of headers that compile into your plugin. It talks to
the client through a C layer, which is the stable contract between the two:

- The client hands out its functions as tables, fetched by ID at runtime. Your
  DLL exports two entry points and nothing else; there is no import library.
- A shipped table mostly grows. An existing function never moves and never
  changes shape, unless communicated otherwise (keep an eye on the
  [change log](../changelog.md)). This is why a plugin binary keeps working on
  newer clients.
- The wrapper turns those tables into the sessions, modules, getters, and events
  described on this site.

You never use the C layer yourself; it exists for binary compatibility between
plugin and client. The wrapper (C++ today) is the surface you program against.

## TruckersMP functionality only

The SDK covers TruckersMP: multiplayer players and vehicles, the client's input
and rendering hooks, its UI, and its gameplay systems. It does not duplicate
game data. Anything the
[SCS telemetry SDK](https://modding.scssoft.com/wiki/Documentation/Engine/SDK/Telemetry)
already provides, such as the base game's job and economy data, will never
become part of this SDK.

The two SDKs are designed to co-exist in one plugin: read game data from SCS
telemetry, read multiplayer data from TruckersMP, and combine them.

## Lifetime rules at a glance

- **Session**: create in `truckersmp_init`, destroy in `truckersmp_shutdown`.
  One per plugin.
- **Module references**: borrowed from the session; do not outlive it.
- **Attached intent modules**: owned by you. If the session is destroyed first,
  it disconnects them; a disconnected module reads as unavailable.
- **Handles** (players, vehicles, trailers): opaque references, valid while the
  entity exists. Do not store them; obtain them from events or getters each
  time. See [Data and handles](data-and-handles.md).
- **Event payloads**: valid only during the callback that delivers them. Copy
  what you need; never store the payload object.
