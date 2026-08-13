---
sidebar_position: 6
title: Render
description: Frame events, renderer identification, and overlay drawing.
---

# Render Module

`Session::Render()` is the foundation for overlays: it tells you which
renderer the client uses, hands you the device, and marks the frame
boundaries.

## Renderer information

```cpp
std::optional< RendererID > GetRendererID() const;
std::optional< Uint64 > GetDeviceHandle() const;
```

`GetRendererID()` returns `OpenGL` or `DirectX11`. `GetDeviceHandle()`
returns the backend device as an address; cast it per renderer:

- **DirectX 11:** the value is an `ID3D11Device *`.
- **OpenGL:** there is no device object; the value is 0.

```cpp
if( g_session->Render().GetRendererID() == TruckersMP::RendererID::DirectX11 )
{
    if( auto d3d = reinterpret_cast< ID3D11Device * >( g_session->Render().GetDeviceHandle().value_or( 0 ) ) )
    {
        InitMyOverlay( d3d );
    }
}
```

## Frame events

```cpp
Event<> OnPreRender;
Event<> OnPostRender;
```

The two events bracket the TruckersMP GUI within the frame:

- `OnPreRender` fires before the TruckersMP GUI renders. Drawing here puts your
  output under the client's own UI.
- `OnPostRender` fires after the TruckersMP GUI has rendered. Drawing here
  puts your output on top of everything, which is what most overlays want.

```cpp
g_session->Render().OnPostRender.Register( []
{
    if( g_overlayOpen )
    {
        DrawMyOverlay();
    }
} );
```

## Working with the device

Two rules keep overlay code safe:

- **Draw only inside the frame events.** The device is in a known state
  there; touching it at other times races the game's or client's own rendering.
- **Restore the state you change.** A plugin that renders anything is
  expected to put the device back the way it found it before returning; the
  client does not re-assert its full pipeline state around your callback.

Popular immediate-mode UI libraries (such as Dear ImGui with the D3D11
backend) fit this model directly: initialize them with the device from
`GetDeviceHandle()`, feed them from the [Input module](input.md), and render
them in `OnPostRender`.
