---
sidebar_position: 8
title: Gameplay
description: Mounted packages and no-collision zones.
---

# Gameplay Module

`Session::Gameplay()` collects world and content facts that do not belong to
a single entity.

## Mounted packages

```cpp
std::optional< std::vector< PackageInfo > > GetMountedPackages() const;
```

Returns every TruckersMP content package currently mounted in the game, ordered
by mount time with the most recent last. Each `PackageInfo` carries the package
file name (for example, `accessory_pack.mp`).

```cpp
for( const TruckersMP::PackageInfo &pkg : g_session->Gameplay().GetMountedPackages().value_or( {} ) )
{
    g_session->Core().LogMessage( TruckersMP::LogLevel::Info, "Mounted: " + pkg.name );
}
```

Use it to detect which TruckersMP content is active. The list contains only
TruckersMP packages, not the base game's own content.

## No-collision zones

```cpp
Event< GameplayNoCollisionZoneEvent & > OnNoCollisionZone;
```

Fires when the local player enters or leaves a no-collision zone (garages,
service areas, companies, and other protected places). The payload's
`GetEntered()` returns true on entry, false on exit.

```cpp
g_session->Gameplay().OnNoCollisionZone.Register( []( TruckersMP::GameplayNoCollisionZoneEvent &e )
{
    const char *message = e.GetEntered() ? "Entered a no-collision zone." : "Left a no-collision zone.";
    g_session->UserInterface().ShowNotification( TruckersMP::NotificationType::Success, message );
} );
```
