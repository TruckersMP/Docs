---
sidebar_position: 2
title: Getting Started
description: From an empty folder to a working TruckersMP plugin.
---

# Getting Started

This guide takes you from nothing to a plugin that loads, logs a message, and
greets you when you connect to a server.

## Prerequisites

- **Windows x64.** The SDK targets Windows x64 only; other platforms are not
  supported.
- **A C++17 (or newer) compiler.** The examples use Visual Studio 2026 (MSVC)
  and CMake, but any toolchain that produces a Windows x64 DLL works.
- **The TruckersMP client**, installed and able to launch Euro Truck Simulator 2
  or American Truck Simulator.
- **The SDK.** It lives on GitHub:
  [TruckersMP/GameClientSDK](https://github.com/TruckersMP/GameClientSDK). The
  SDK is header-only; everything you compile against is in the `include/`
  folder.

## Project setup

Create a folder with two files, `CMakeLists.txt` and `Plugin.cxx`, and put the
SDK next to them:

```powershell
git clone https://github.com/TruckersMP/GameClientSDK.git
```

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.21)
project(hello_plugin CXX)

add_library(hello_plugin SHARED Plugin.cxx)

target_compile_features(hello_plugin PRIVATE cxx_std_17)

# Point this at the include/ folder of the SDK repository.
target_include_directories(hello_plugin PRIVATE "${CMAKE_SOURCE_DIR}/GameClientSDK/include")
```

## The plugin skeleton

Every plugin exports exactly two functions: `truckersmp_init` and
`truckersmp_shutdown`. No other exported symbols are needed; everything else
flows through function pointers the client hands you.

```cpp title="Plugin.cxx"
#include <TruckersMP/TruckersMP.hxx>

#include <memory>

static std::unique_ptr< TruckersMP::Session > g_session;

TMP_EXPORT bool TMP_API truckersmp_init( const TruckersMP_Host *host, TruckersMP_PluginDesc *desc )
{
    // Identify yourself. The client shows this in its plugin list and logs.
    TruckersMP::PluginInfo info;
    info.m_name = "Hello Plugin";
    info.m_author = "Your Name";
    info.m_version = "1.0.0";
    info.m_description = "My first TruckersMP plugin.";
    TruckersMP::FillPluginDesc( desc, info );

    // Establish the SDK connection. This declares the SDK version your plugin
    // was built against and acquires every available module.
    g_session = TruckersMP::Session::Create( host );
    if( g_session == nullptr )
    {
        // The client refused the session (for example, the plugin was built
        // against a newer SDK than the client supports). Returning false
        // refuses the load; the client unloads the DLL without calling
        // truckersmp_shutdown.
        return false;
    }

    g_session->Core().LogMessage( TruckersMP::LogLevel::Info, "Hello from my first plugin!" );

    g_session->Network().OnConnected.Register( []
    {
        g_session->UserInterface().ShowNotification(
            TruckersMP::NotificationType::Success, "Connected. Happy trucking!" );
    } );

    return true;
}

TMP_EXPORT void TMP_API truckersmp_shutdown( void )
{
    // Destroying the session unregisters every listener.
    g_session.reset();
}
```

Build it:

```powershell
cmake -B build -A x64
cmake --build build --config Release
```

## Installing the plugin

TruckersMP plugins live in the same place as
[SCS telemetry SDK](https://modding.scssoft.com/wiki/Documentation/Engine/SDK/Telemetry)
plugins. Copy the built DLL into the game's plugin folder:

```text
<game folder>/bin/win_x64/plugins/hello_plugin.dll
```

Create the `plugins` folder if it does not exist. A TruckersMP plugin may also
implement the SCS telemetry interface in the same DLL and combine both data
sources, but it does not have to.

## Initialization and reloading

The game loads the DLL at startup, but your plugin does not initialize right
away. When plugins are present, the game shows a disclaimer; `truckersmp_init`
runs once the user confirms it.

Plugins can also be reloaded and reinitialized at any time through in-game
developer commands. Expect `truckersmp_init` and `truckersmp_shutdown` to run
more than once in a single game session, possibly mid-game with a server
connection already up. Two habits make reloads a non-issue:

- Keep all your state reachable from `truckersmp_init` and release all of it
  in `truckersmp_shutdown`; the skeleton's single `g_session` is the pattern.
- Initialize from getters instead of waiting for events, so a mid-session start
  sees the current world. See [Architecture](concepts/architecture.md).

## Verifying it works

1. Launch the game through the TruckersMP launcher.
2. Confirm the telemetry SDK disclaimer in game.
3. Open the client log. Your "Hello from my first plugin!" line appears there,
   attributed to your plugin.
4. Connect to any server. A success notification appears on screen.

## What just happened

Three things in `truckersmp_init` deserve a closer look:

- **`PluginInfo` identifies your plugin.** Name, author, version, and
  description are plain text shown to the user; `FillPluginDesc` copies them
  into the descriptor the client keeps. They carry no protocol meaning.
- **`Session::Create` is the handshake.** It declares the SDK version your
  plugin was compiled against, checks compatibility, and resolves every module
  table. It returns `nullptr` when the client cannot serve your plugin; treat
  that as fatal and return `false`.
- **Events registered stay registered** until you unregister them or the
  session is destroyed. The lambda above runs every time the client connects
  to a server.

## Next steps

- [Architecture](concepts/architecture.md) explains what a session is and why
  modules can be individually unavailable.
- [Events](concepts/events.md) covers the event system in depth.
- [Best practices](advanced/best-practices.md) lists the habits that keep
  plugins fast and future-proof.
