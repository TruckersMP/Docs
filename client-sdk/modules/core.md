---
sidebar_position: 1
title: Core
description: Logging and client identity.
---

# Core Module

`Session::Core()` covers logging and basic client information. It is the one
module that is always present: `Session::Create` fails outright if the core
table cannot be acquired, so if you have a session, you have Core.

## Logging

```cpp
Result LogMessage( LogLevel level, std::string_view text );
```

Writes a line to the client log, attributed to your plugin. Levels are `Info`,
`Warning`, and `Error`.

```cpp
g_session->Core().LogMessage( TruckersMP::LogLevel::Info, "Loading player data..." );
```

Write to the client log for anything about your plugin's behavior. The lines
land in the log that TruckersMP developers and the support team read, so when a
user reports a problem, your plugin's context is right there next to the
client's own records. If your plugin also uses the SCS telemetry SDK, that SDK's
logging remains a fine choice for messages about the game itself.

## Client information

```cpp
std::optional< std::string > GameID() const;
std::optional< std::string > ClientVersion() const;
```

- `GameID()` identifies which game is running, as its Steam application ID:
  Euro Truck Simulator 2 or American Truck Simulator.
- `ClientVersion()` returns the release tag of the TruckersMP client, useful
  in diagnostics you collect.

```cpp
static bool g_isETS2 = g_session->Core().GameID().value_or( "" ) == "227300";
```

:::warning
Internal or experimental builds of the game client may return the branch name
instead of the classic version tag.
:::
