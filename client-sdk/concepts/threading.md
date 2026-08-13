---
sidebar_position: 4
title: Threading
description: The main-thread rule and how to structure background work.
---

# Threading

## Concept

Every SDK call is main-thread only unless its documentation says otherwise. The
client enforces this at the boundary: an action called from the wrong thread
returns `Result::WrongThread`, and a getter called from the wrong thread reads
as absent. Nothing corrupts, but nothing works either.

"Main thread" means the game's own thread, the one your callbacks run on. In
practice: **make SDK calls from inside SDK callbacks**, and you can never get
this wrong.

Every event callback is delivered on the game thread, in the middle of the
client's frame. Two consequences:

- **You may call the SDK freely from callbacks.** This is the intended pattern.
- **You must return quickly.** The game is waiting on you. File I/O, network
  requests, or locks held by other threads will stutter or hang the game.

## Working with your own threads

Plugins that talk to the network or disk should own a worker thread and pass
data across with a queue:

```cpp
// Game thread (SDK callback): produce.
g_session->Player().OnStreamIn.Register( []( TruckersMP::PlayerStreamInEvent &e )
{
    g_queue.Push( e.GetPlayer().GetUsername().value_or( "unknown" ) );  // your own thread-safe queue
} );

// Worker thread: consume. No SDK calls here.
void WorkerLoop()
{
    std::string name;
    while( g_running )
    {
        while( g_queue.Pop( name ) )
        {
            UploadToMyService( name );
        }
    }
}
```

The rule of thumb: **data crosses threads, SDK calls do not.** Copy what you
need out of the SDK on the game thread, and do slow work elsewhere.

For results that need to come back into the game (say, showing a notification
when your upload finishes), queue them in the other direction and drain that
queue from a frame event that you find suitable.
