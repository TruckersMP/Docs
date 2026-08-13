---
sidebar_position: 4
title: Vehicles and Trailers
description: Physical state and lifecycle of vehicles and trailers.
---

# Vehicles and Trailers

`Session::Vehicle()` and `Session::Trailer()` cover the physical entities in
the world. They share one design: spawn and despawn events on the module,
physics getters on the handle.

## Getting handles

Vehicle and trailer handles come from three places:

- A player: `player.GetVehicle()` and `player.GetTrailer()`.
- A vehicle: `vehicle.GetTrailer()` returns the attached trailer.
- The spawn events below.

```cpp
const TruckersMP::Player player = g_session->Player().GetLocalPlayer().value_or( {} );
const TruckersMP::Vehicle vehicle = player.GetVehicle().value_or( {} );

// An invalid handle answers every getter with an empty optional,
// so the chain needs no checks; the defaults fall through.
const TruckersMP::Placement placement = vehicle.GetPlacement().value_or( {} );
const TruckersMP::Float3 speed = vehicle.GetLinearVelocity().value_or( {} );
```

## The Vehicle handle

| Getter | Returns | Notes |
| --- | --- | --- |
| `GetPlacement()` | `Placement` | Position (`Double3`) and rotation (`Quaternion`) in world space. |
| `GetLinearVelocity()` | `Float3` | Meters per second, world space. |
| `GetAngularVelocity()` | `Float3` | Radians per second, world space. |
| `GetTrailer()` | `Trailer` | The attached trailer, if any. |

## The Trailer handle

| Getter | Returns | Notes |
| --- | --- | --- |
| `Exists()` | `Bool` | Whether the trailer is currently present in the world. |
| `GetPlacement()` | `Placement` | Position and rotation in world space. |
| `GetLinearVelocity()` | `Float3` | Meters per second, world space. |
| `GetAngularVelocity()` | `Float3` | Radians per second, world space. |

Handles stay meaningful while the entity is present in the game world; after
despawn, every getter returns empty.

:::warning
The trailer handle is always present, even if the player is not towing any. Use
the `Exists()` getter to check if the trailer actually exists.
:::

## Events

Both modules raise the same pair of lifecycle events, each carrying the
owning player and the entity:

```cpp
g_session->Vehicle().OnSpawned.Register( []( TruckersMP::VehicleSpawnedEvent &e )
{
    TruckersMP::Player owner = e.GetPlayer();
    TruckersMP::Vehicle vehicle = e.GetVehicle();
    // Track it, tag it, measure it.
} );

g_session->Vehicle().OnDespawned.Register( []( TruckersMP::VehicleDespawnedEvent &e )
{
    // Clean up anything keyed on this vehicle.
} );
```

`Trailer()` offers `OnSpawned` and `OnDespawned` with the same shape, carrying
the player and the trailer.
