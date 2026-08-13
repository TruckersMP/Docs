---
sidebar_position: 1
title: Intents
description: How gated modules work and how to get access.
---

# Intents

Most of the SDK is open to every plugin. Some modules go further and are gated
behind an **intent**: a named grant that gives the plugin access to this module.

## How an intent works

An intent-gated module ships as its own small add-on package: one C header and
one C++ wrapper that layer on top of the public SDK. Holding the package is
holding the access; the package embeds the unlock for its intent, and the
module's `Attach` call presents it to the client for you.

```cpp
#include <TruckersMP/Bus.hxx>

std::unique_ptr< TruckersMP::BusModule > g_bus;

// After Session::Create succeeded:
if( g_bus = TruckersMP::BusModule::Attach( *g_session ); g_bus == nullptr )
{
    // The client did not grant the intent; run without bus features.
}
```

`Attach` returns `nullptr` when the client refuses the intent or is too old to
know the module. As everywhere in the SDK, treat that as "feature absent", not
as an error.

Without the intent, the module's APIs answer `NotAuthorized` and its events
never reach you. There is nothing to probe for and nothing to work around; the
gate applies per plugin.

## Available intents

### Bus (public)

The bus gameplay module: jobs, stops, passengers, and their events. The bus
intent is public: anyone can download the bus add-on package alongside the SDK
and attach it. It exists as a separate module so that only plugins interested
in the bus gameplay mechanics include it in their build.

Read the full guide: [Bus Module](bus.md).

### Chat (on request)

The chat intent lets a plugin observe and extend the in-game chat, including
registering chat commands. The chat system is a powerful communication tool, and
it also carries what players say to each other. As such, we want to monitor its
usage and ensure it is being used correctly, with good intentions, while
respecting players' privacy. Access to it is granted on a per-project basis.

If your project needs chat integration, contact the TruckersMP team (the
[feedback section](https://truckersmp.com/feedback/)) with a short description
of your plugin and what the intentions for this intent are.

## Practical notes

- **Keep your intent packages private** (unless it is a public intent). The
  package is the access; do not commit it to a public repository or bundle it
  into another project's download.
- **Attach once, at startup**, right after `Session::Create`, and keep the
  module alive next to your session. Destruction order is free: if the session
  dies first, it disconnects the module, whose getters and actions then read as
  unavailable.
