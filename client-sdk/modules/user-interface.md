---
sidebar_position: 9
title: User Interface
description: Showing notifications to the player.
---

# User Interface Module

`Session::UserInterface()` lets your plugin speak to the player through the
client's own UI.

## Notifications

```cpp
Result ShowNotification( NotificationType type, std::string_view message );
```

Shows a toast-style notification that disappears after a few seconds. The
message is UTF-8 and may be at most **200 characters**; longer messages are
rejected with `Result::InvalidParameter`.

Types select the visual style: `Normal`, `Warning`, `Error`, and `Success`.

```cpp
g_session->UserInterface().ShowNotification(
    TruckersMP::NotificationType::Success, "Route exported to clipboard" );
```

## When to use which channel

| Channel | Audience | Use for |
| --- | --- | --- |
| `ShowNotification` | The player, in game | Short, timely facts: "job saved", "hotkey enabled". |
| `Core().LogMessage` | You, and users reporting problems | Diagnostics and errors; see [Core](core.md). |
| Your own overlay | The player, continuously | Anything persistent or interactive; see [Render](render.md). |

Notifications share screen space with the client's own messages, so be sparing:
a plugin that toasts every minor event trains players to ignore all
notifications, including the client's.
