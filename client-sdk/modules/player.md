---
sidebar_position: 3
title: Player
description: The local player, remote players, and streaming events.
---

# Player Module

`Session::Player()` gives you the local player and, through events, every remote
player your client knows about.

## Getting players

```cpp
std::optional< Player > GetLocalPlayer() const;
std::optional< Player > GetPlayerByID( Int32 id ) const;
std::optional< std::vector< Player > > GetAllPlayers() const;
```

- `GetLocalPlayer()` returns the local player. Absent while the client is not
  connected to a server.
- `GetPlayerByID()` resolves an entity ID back to a player. Absent while no such
  player is streamed in.
- `GetAllPlayers()` returns every player currently streamed in to the client.
  Treat it as a one-time snapshot, for example, to seed your state right after
  your plugin loads. Do not poll it every frame; membership changes arrive
  through the streaming events below, and single players resolve through
  `GetPlayerByID()`.

## The Player handle

A `TruckersMP::Player` handle answers questions about one player. It stays
meaningful while that player is streamed in for your client; afterwards every
getter returns empty. See [Data and Handles](../concepts/data-and-handles.md)
for the general rules.

### Identity

| Getter | Returns | Notes |
| --- | --- | --- |
| `GetPlayerID()` | `Int32` | Session-scoped entity ID. |
| `GetAccountID()` | `Uint64` | TruckersMP account ID. Stable across sessions. |
| `GetSteamID()` | `Uint64` | Steam account ID. Stable across sessions. |
| `GetUsername()` | `std::string` | UTF-8 display name. |

### Presentation

| Getter | Returns | Notes |
| --- | --- | --- |
| `GetTagText()` | `std::string` | The tag shown in front of the name. |
| `GetTagColor()` | `Color` | The tag's color. |
| `IsPatron()` | `Bool` | Has a Patreon tier that qualifies for in-game rewards. |
| `IsGameModerator()` | `Bool` | Game moderator. |
| `IsTeamMember()` | `Bool` | TruckersMP team member. |
| `IsManager()` | `Bool` | Part of TruckersMP management. |

### State

| Getter | Returns | Notes |
| --- | --- | --- |
| `GetNetworkLatency()` | `Uint16` | Milliseconds between this player and the game server. |
| `GetVehicle()` | `Vehicle` | The vehicle the player is driving. |
| `GetTrailer()` | `Trailer` | The trailer the player is towing. |
| `GetDistanceFromLocalPlayer()` | `Float` | Distance between this player's vehicle and the local player's vehicle, in meters. |
| `GetDistanceToCamera()` | `Float` | Distance between this player's vehicle and the client's active camera, in meters. |
| `CanCollideWith( player )` | `Bool` | Whether the collisions between the given player's and local player's vehicles are enabled |
| `CanStreamFromCamera()` | `Bool` | Whether this player's camera may drive streaming. |
| `StreamsFromCamera()` | `Bool` | Whether it currently does. |

Camera streaming is a special right: normally the world streams in around a
player's vehicle, so a free camera flying away sees an empty world. A player
with this right may anchors streaming to the camera itself.

## Events

### OnStreamIn

A player entered the client's streaming range. This fires after the client has
received a full update for them; the player is visible in the world and every
getter works.

```cpp
g_session->Player().OnStreamIn.Register( []( TruckersMP::PlayerStreamInEvent &e )
{
    if( const std::optional< TruckersMP::Int32 > id = e.GetPlayer().GetPlayerID() )
    {
        AddToMyRadar( *id, player.GetUsername().value_or( "unknown" ) );
    }
} );
```

### OnStreamOut

The player left the client's streaming range. The plugin stops receiving updates
for them and their handle goes stale. Use the event to clean up any states.

### OnUpdate

The client received a network update for a player. **This event fires at
network rate**, many times per second across all streamed-in players. Treat
the handler as a data tap:

- Read the values you need and store them in your own structures.
- Return immediately.
- Do not call back into the SDK from this handler, and keep logic out of it.
  Act on the collected data in your own update path.

```cpp
static std::map< TruckersMP::Int32, Clock > g_lastSeen;

g_session->Player().OnUpdate.Register( []( TruckersMP::PlayerUpdateEvent &e )
{
    if( const std::optional< TruckersMP::Int32 > id = e.GetPlayer().GetPlayerID() )
    {
        g_lastSeen[ *id ] = Clock::now(); // bookkeeping only
    }
} );
```
