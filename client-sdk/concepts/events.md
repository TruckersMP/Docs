---
sidebar_position: 2
title: Events
description: Registering callbacks, reading payloads, and writing veto fields.
---

# Events

Modules expose their events as public members named `On<Something>`:

```cpp
g_session->Player().OnStreamIn.Register( []( TruckersMP::PlayerStreamInEvent &e )
{
    const std::string name = e.GetPlayer().GetUsername().value_or( "unknown" );
    g_session->Core().LogMessage( TruckersMP::LogLevel::Info, "Player joined range: " + name );
} );
```

## Registering and unregistering

`Register` accepts any callable and returns an ID you can use to remove that one
handler later:

```cpp
const TruckersMP::Int32 id = g_session->Input().OnKey.Register( OnKeyPressed );
// ...
g_session->Input().OnKey.Unregister( id );
```

`UnregisterAll()` clears every handler you registered on that event. Destroying
the session detaches everything at once, so plugins that keep their handlers for
their whole lifetime never need to unregister manually.

:::info
You may register and unregister from inside a callback; the dispatch loop works
on a snapshot, so changes take effect from the next dispatch.
:::

## Payload objects

Events with data pass a payload object by reference. Payloads are thin views
over client memory and follow two rules:

1. **They are valid only during the callback.** Copy the values you need; never
   store the payload object or a reference to it.
2. **Accessors are cheap.** `GetPlayer()`, `GetDown()`, and friends read
   directly from the delivered data.

```cpp
g_session->Vehicle().OnSpawned.Register( []( TruckersMP::VehicleSpawnedEvent &e )
{
    // Fine: copy plain data out of the payload.
    std::optional< TruckersMP::Placement > placement = e.GetVehicle().GetPlacement();

    // Wrong: keeping the payload (or the reference) for later use.
    // s_lastEvent = &e;
} );
```

Some events carry no data at all; they use the same API without a payload
parameter:

```cpp
g_session->Render().OnPostRender.Register( []
{
    DrawMyOverlay();
} );
```

## Writable payload fields

A few payloads let you talk back to the client by writing a field before your
callback returns. The mouse button event is one of thse: set `Block` to stop the
click from reaching the game.

```cpp
g_session->Input().OnMouseButton.Register( []( TruckersMP::InputMouseButtonEvent &e )
{
    if( MyOverlayWantsMouse() )
    {
        e.SetBlock( true );
    }
} );
```

Writes take effect when the dispatch finishes. Like everything else on the
payload, the setter is only valid during the callback.

## Delivery guarantees

- **Callbacks run on the game thread.** Never block in one; see
  [Threading](threading.md).
- **High-frequency events exist.** `Player().OnUpdate` fires at network rate.
  Read the data, store it, return.
- **Exceptions must not escape your callback.** The SDK contains guard rails,
  but an exception that leaves your handler is a bug in your plugin. Catch your
  own exceptions and log them.
