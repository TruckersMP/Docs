---
sidebar_position: 7
title: Network
description: Connection state, latency, and server identity.
---

# Network Module

`Session::Network()` reports the client's connection to a TruckersMP game
server.

## Getters

```cpp
std::optional< Bool > IsConnected() const;
std::optional< Uint16 > GetLastPing() const;
std::optional< Uint64 > GetGameServerID() const;
```

- `IsConnected()` is true while the client has an established server connection.
- `GetLastPing()` is the most recent measured ping to the game server, in
  milliseconds.
- `GetGameServerID()` identifies which server the client is connected to. Match
  it against the server list from the [Web API](/web-api/) (`GET /servers`) to
  show a server name.

## Events

```cpp
Event<> OnConnected;
Event<> OnDisconnected;
```

`OnConnected` fires when the connection to a server is established;
`OnDisconnected` fires when the client leaves.

```cpp
g_online = g_session->Network().IsConnected().value_or( false );

g_session->Network().OnConnected.Register( [] { g_online = true; } );
g_session->Network().OnDisconnected.Register( [] { g_online = false; } );
```
