---
sidebar_position: 3
title: Data and Handles
description: Optionals, entity handles, strings, and lists.
---

# Data and Handles

## Getters return optionals

Every getter in the C++ SDK returns `std::optional`. An empty optional means the
value cannot be answered right now: you are not in a world, the module is
unavailable, or the handle you asked through is no longer alive. There is no
error code to inspect; emptiness is the whole answer.

Give each read a default with `value_or` and the "not right now" cases take care
of themselves:

```cpp
const TruckersMP::Player player = g_session->Player().GetLocalPlayer().value_or( {} );
const std::string name = player.GetUsername().value_or( "unknown" );
```

An invalid handle answers every getter with an empty optional, so chains like
this need no checks along the way.

`value_or` fits wherever a default is harmless: text you display, a value you
log, or an empty list. When there is no harmless default, for example, when the
value becomes a key in your own data, check the optional instead of working with
defaults.

## Entity handles

Players, vehicles, and trailers cross the SDK boundary as small handle objects
(e.g., `TruckersMP::Player`, `TruckersMP::Vehicle`). A handle is an opaque
reference, not the entity itself:

- Copying a handle is trivial; it is a 64-bit value plus a session pointer.
- `IsValid()` tells you whether the handle refers to anything at all.
- Every getter on a stale handle simply returns an empty optional. Nothing
  crashes; the entity is just gone.

A handle stays meaningful as long as its entity exists for your client: a player
handle while that player is streamed in, a vehicle or trailer handle while it is
present in the game world.

**Do not store handles.** Obtain them fresh every time, from events or from the
getters of modules and other handles (for example, `GetLocalPlayer()`,
`player.GetVehicle()`), use them, and let them go. If you track entities across
frames, key your own data on a stable ID (`player.GetPlayerID()`) instead of
keeping the handle.

```cpp
// Good: track by ID, resolve handles per event.
std::unordered_set< int32_t > g_seen;

g_session->Player().OnStreamIn.Register( []( TruckersMP::PlayerStreamInEvent &e )
{
    if( const std::optional< TruckersMP::Int32 > id = e.GetPlayer().GetPlayerID() )
    {
        g_seen.insert( *id );
    }
} );
```

## Strings

Strings are UTF-8. The wrapper copies every string the client hands you into a
`std::string` you own, and frees the client allocation for you. There is nothing
to manage.

Strings you pass in (`LogMessage`, `ShowNotification`) are `std::string_view`:
the client copies what it needs during the call, so any source works, including
temporaries.

## Lists

List getters return owned vectors, copied out of client memory in one step:

```cpp
for( const TruckersMP::PackageInfo &pkg : g_session->Gameplay().GetMountedPackages().value_or( {} ) )
{
    Log( pkg.name );
}
```

The vector and its elements are yours; keep them as long as you like.

## Value types

Simple types, such as position, rotation, and color, cross as plain structs:
`Float3`, `Double3`, `Quaternion`, `Placement`, etc. They are ordinary value
types; copy and store them freely.
