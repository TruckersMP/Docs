---
sidebar_position: 5
title: Input
description: Keyboard and mouse events, click blocking, and input locks.
---

# Input Module

`Session::Input()` is the toolbox for plugins with their own UI: it delivers raw
input events, lets you block clicks from reaching the game, shows the mouse
cursor, and locks game input while your interface is open.

## Input events

| Event | Payload | Fires when |
| --- | --- | --- |
| `OnKey` | key code, OS flags, down/up | A key is pressed or released. |
| `OnChar` | UTF-32 codepoint | Text is typed. Use this for text fields, not `OnKey`. |
| `OnMouseMove` | x, y (client-relative) | The mouse moves. |
| `OnMouseWheel` | signed notch delta | The wheel scrolls. |
| `OnMouseButton` | button, down/up, block flag | A mouse button changes state. |

```cpp
g_session->Input().OnKey.Register( []( TruckersMP::InputKeyEvent &e )
{
    if( e.GetDown() && e.GetKey() == VK_F9 )
    {
        ToggleMyOverlay();
    }
} );
```

`OnMouseButton` is the one payload you can write to: set `Block` and the
click never reaches the game.

```cpp
g_session->Input().OnMouseButton.Register( []( TruckersMP::InputMouseButtonEvent &e )
{
    if( g_overlayOpen && IsOverMyWindow() )
    {
        HandleClick( e.GetButton(), e.GetDown() );
        e.SetBlock( true );
    }
} );
```

## The mouse cursor

The cursor is reference-counted across every consumer in the client:

```cpp
std::optional< Bool > IsMouseVisible() const;
Result IncreaseMouseRef();
Result DecreaseMouseRef();
```

`IncreaseMouseRef` asks for the cursor; `DecreaseMouseRef` gives that request
back.

:::warning[Pair every increase with exactly one decrease]
An unmatched increase keeps the cursor on screen for the rest of the session.
:::

A small RAII guard makes this hard to get wrong:


```cpp
struct MouseCursorScope
{
    MouseCursorScope() { g_session->Input().IncreaseMouseRef(); }
    ~MouseCursorScope() { g_session->Input().DecreaseMouseRef(); }
};
```

## Game input locks

While your UI is open you usually want the game to stop reacting to input:

```cpp
std::optional< Bool > IsGameMouseLocked() const;
Result SetGameMouseLocked( Bool locked );

std::optional< Bool > IsGameKeyboardLocked() const;
Result SetGameKeyboardLocked( Bool locked );
```

Locking the game mouse or keyboard stops game reactions; your plugin keeps
receiving the input events either way. Unlock both when your UI closes, and also
on `truckersmp_shutdown` paths that might leave your UI open.

## A typical overlay flow

1. User presses your hotkey (`OnKey`).
2. Open your window, `IncreaseMouseRef()`, `SetGameMouseLocked( true )`,
   `SetGameKeyboardLocked( true )`.
3. Route `OnMouseMove`, `OnMouseButton` (with `SetBlock( true )` over your
   window), and `OnChar` into your UI.
4. On close, reverse step 2 exactly once.
