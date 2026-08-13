---
sidebar_position: 5
title: Result Codes
description: Every result code the SDK can return.
---

# Result Codes

Actions (calls that do something, rather than read something) return
`TruckersMP::Result`. Getters never return a result; they signal "no answer" by
returning an empty optional instead, as described in
[Data and Handles](data-and-handles.md).

| Code | Meaning |
| --- | --- |
| `Ok` | The operation succeeded. |
| `InternalError` | The client failed internally; check the client log. |
| `InvalidParameter` | A parameter was missing or malformed, for example a string over its length limit. |
| `WrongThread` | Called off the main thread; see [Threading](threading.md). |
| `NotSupported` | The declared SDK version is newer than the client, or the member was retired; see [Versioning](versioning.md). |
| `NotAuthorized` | The plugin does not hold the required intent; see [Intents](../advanced/intents.md). |
| `UnknownEvent` | The event ID is not known to this client. |
| `ServiceUnavailable` | No world or service can answer right now, for example in the main menu. |
| `ChatCommandAlreadyRegistered` | A chat command with this name already exists. Chat commands belong to the gated chat module. |
| `ChatCommandNotRegistered` | No chat command with this name exists. |
