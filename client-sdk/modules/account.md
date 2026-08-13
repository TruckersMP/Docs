---
sidebar_position: 2
title: Account
description: The local player's TruckersMP account.
---

# Account Module

`Session::Account()` answers questions about the account the local player is
logged in with. Plugins initialize after the login screen, so the data is
generally available for the whole session. It goes away only when the user logs
out, for instance, by going back to the title screen to switch servers; the
getters then return empty until the next login.

Unlike the [Player module](player.md), the account getters need no server
connection: they describe the account, not an in-world entity.

## Getters

| Getter | Returns | Notes |
| --- | --- | --- |
| `GetAccountID()` | `Uint64` | TruckersMP account ID. Stable across sessions. |
| `GetCompanyID()` | `Uint64` | ID of the virtual company the player is a part of. |
| `IsPatron()` | `Bool` | Has a Patreon tier that qualifies for in-game rewards. |
| `IsGameModerator()` | `Bool` | Game moderator. |
| `IsTeamMember()` | `Bool` | TruckersMP team member. |

```cpp
if( const std::optional< TruckersMP::Uint64 > id = g_session->Account().GetAccountID() )
{
    LoadMySettingsFor( *id );
}
```

Match `GetAccountID()` against the [Web API](/web-api/) (`GET /player/{id}`) to
fetch the public profile, and `GetCompanyID()` against the virtual company
endpoints.
