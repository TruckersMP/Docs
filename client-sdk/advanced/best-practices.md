---
sidebar_position: 4
title: Best Practices
description: The habits that keep plugins fast, stable, and future-proof.
pagination_next: null
---

# Best Practices

A checklist distilled from how the SDK is designed to be used. Every item
links back to the guide that explains it.

## Startup and shutdown

- **Create one session in `truckersmp_init`, destroy it in
  `truckersmp_shutdown`.** Treat a `nullptr` from `Session::Create` as fatal and
  return `false` from init.
- **Attach intent modules right after the session.** Destruction order does not
  matter: if the session dies first, it disconnects its modules, and a module
  that outlives it reads as unavailable.
- **Leave the client the way you found it.** Unlock game input, release mouse
  references, and free your resources on shutdown; the user may toggle plugins
  without restarting the game.

## Reading state

- **Check availability every time, cheaply.** `std::optional` fallthrough is
  the pattern; an empty answer means "skip", never "crash". See
  [Data and Handles](../concepts/data-and-handles.md).
- **Poll getters for state, subscribe to events for transitions.** See
  [Architecture](../concepts/architecture.md).
- **Do not store handles.** When you obtain one from an event or a getter, copy
  over the data that you need, or poll the handle again. See
  [Data and Handles](../concepts/data-and-handles.md).

## Events

- **Return fast from every callback**; the game thread is waiting. Move slow
  work to your own threads and pass data through queues. See
  [Threading](../concepts/threading.md).
- **Treat `Player().OnUpdate` as a data tap.** Store values, return, act
  later; do not call the SDK from inside it. See
  [Player](../modules/player.md).
- **Copy payload data out; never store payload objects.** They are views
  valid only during the callback.
- **Keep exceptions inside your handlers.** Catch and log; never let one
  escape into the client.

## Input and UI

- **Pair `IncreaseMouseRef` with `DecreaseMouseRef` exactly.** Use an RAII
  guard. See [Input](../modules/input.md).
- **Block clicks only over your own UI**, and unlock game input the moment
  your interface closes.
- **Draw in the frame events only**, and restore any device state you
  change. See [Render](../modules/render.md).
- **Ration notifications.** They share space with the client's own messages.
  See [User Interface](../modules/user-interface.md).

## Compatibility

- **Rebuild against a current SDK at least once a year.** SDK versions are
  supported for about one year; a plugin built against an older SDK may be
  refused. See [Versioning](../concepts/versioning.md).
- **Log through `Core().LogMessage`** so your diagnostics land where users
  already look.
- **Keep intent packages out of public repositories.** The package is the
  access. See [Intents](intents.md).

## Distribution

- **Ship one x64 DLL** with no unusual runtime requirements; statically link
  your dependencies where practical, so users do not chase redistributables.
- **Version your plugin visibly** in `desc->m_version`; it shows up in the
  client's plugin list and in logs users send you.
- **Test the unhappy paths**: main menu, loading screens, disconnects, ... you
  name it. A well-behaved plugin does nothing, quietly, in all of them.
