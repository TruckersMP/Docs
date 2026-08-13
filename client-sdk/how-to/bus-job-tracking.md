---
sidebar_position: 1
title: Tracking Bus Jobs
description: Follow a bus job through its states, from start to payout.
---

# Tracking Bus Jobs

This guide follows a bus job through its life: started, progressing through its
stops, and finally finished or canceled. That is the view a virtual company
website or logbook wants, and every state change here is a natural point to
synchronize with your own server. It uses the [bus module](../advanced/bus.md),
which ships as a public [intent package](../advanced/intents.md); attach it
once at startup:

```cpp
static std::unique_ptr< TruckersMP::BusModule > g_bus;

// Inside truckersmp_init, after Session::Create succeeded:
g_bus = TruckersMP::BusModule::Attach( *g_session );
```

## The job record

The tracker should keep one record for the active job. The route is captured
once at job start; after that, only the job's state moves. The schedule and
the planned distance are the exception: right after job start the game may
still be calculating them, so both read 0, and the tracker records them only
when the navigation data is ready.

```cpp
struct StopRecord
{
    bool m_completed = false;
    std::string m_name;                         // display name of the bus stop
    std::string m_identifier;                   // unit identifier of the city
    TruckersMP::Uint32 m_scheduledTime = 0;     // how many economy minutes it takes to drive to the stop
    TruckersMP::Uint32 m_completedTime = 0;     // economy time of when the stop was completed
    TruckersMP::Float m_plannedDistance = 0.f;  // planned distance to reach the stop (in km)
    TruckersMP::Float m_drivenDistance = 0.f;   // the distance the player has actually driven (in km)
};

struct JobRecord
{
    bool m_active = false;
    TruckersMP::Uint32 m_startTime = 0;         // economy time of job start
    TruckersMP::Int64 m_estimatedPayout = 0;    // known at job start
    std::vector< StopRecord > m_route;          // stops, in driving order
};

static JobRecord g_job;

void StartRecord( const TruckersMP::BusJob &job )
{
    // Reset the state, so any stale data is overridden.
    g_job = JobRecord{};

    if( !job.IsValid() )
    {
        return;
    }

    g_job.m_active = true;
    g_job.m_startTime = job.GetStartTime().value_or( 0 );

    for( const TruckersMP::BusStop &stop : job.GetStops().value_or( {} ) )
    {
        StopRecord &stopEntry = g_job.m_route.emplace_back();
        stopEntry.m_name = stop.GetName().value_or( "" );
        stopEntry.m_identifier = stop.GetCityIdentifier().value_or( "" );
    }
}
```

## The states, one event each

Five events carry the whole lifecycle; the
[bus module reference](../advanced/bus.md#event-order) documents the full order.

```cpp
// Get the economy time from the SCS telemetry SDK (using SCS_TELEMETRY_CHANNEL_game_time).
static TruckersMP::Uint32 g_economyTime = 0;

void AttachBusTracker()
{
    StartRecord( g_bus->GetJob().value_or( {} ) );

    g_bus->OnJobStarted.Register( []( TruckersMP::BusJobStartedEvent &e )
    {
        StartRecord( e.GetJob() );

        // Collect other data that is available only when the job is started.
        g_job.m_estimatedPayout = e.GetEstimatedPayout();

        SyncJobStarted( g_job );
    } );

    g_bus->OnJobDataReady.Register( []( TruckersMP::BusJobDataReadyEvent &e )
    {
        // The stops arrive in driving order, matching the route captured at start.
        const std::vector< TruckersMP::BusStop > stops = e.GetStops();

        for( size_t i = 0; i < stops.size() && i < g_job.m_route.size(); ++i )
        {
            g_job.m_route[ i ].m_scheduledTime = stops[ i ].GetScheduledTime().value_or( 0 );
            g_job.m_route[ i ].m_plannedDistance = stops[ i ].GetPlannedDistance().value_or( 0.f );
        }

        SyncJobPlan( g_job );
    } );

    g_bus->OnStopCompleted.Register( []( TruckersMP::BusStopCompletedEvent &e )
    {
        const std::string identifier = e.GetStop().GetCityIdentifier().value_or( "" );

        // A route may visit one city twice; complete the first open entry.
        for( StopRecord &stop : g_job.m_route )
        {
            if( stop.m_completed || stop.m_identifier != identifier )
            {
                continue;
            }

            stop.m_completed = true;
            stop.m_drivenDistance = e.GetDrivenDistance();
            stop.m_completedTime = g_economyTime;

            break;
        }

        SyncCompletedStop( g_job );
    } );

    g_bus->OnJobFinished.Register( []( TruckersMP::BusJobFinishedEvent &e )
    {
        g_job.m_active = false;
        SyncJobFinished( g_job, e.GetPayout() );
    } );

    g_bus->OnJobCanceled.Register( []( TruckersMP::BusJobCanceledEvent &e )
    {
        g_job.m_active = false;
        SyncJobCanceled( g_job, e.GetReason() );
    } );
}
```

Call `AttachBusTracker()` right after the module attaches, guarded by a null
check on `g_bus`; without the module, the tracker simply stays empty.

:::warning
Plugins may be reloaded by the user. Ensure that you handle this accordingly.
:::

## Where the economy time comes from

`g_economyTime` is not SDK data: telemetry stays with the game on purpose
(see [Architecture](../concepts/architecture.md)). The same DLL can also act as
an SCS telemetry plugin by exporting `scs_telemetry_init` next to
`truckersmp_init`; the process loads it once, so both sides share globals.
Register for the common channel `SCS_TELEMETRY_CHANNEL_game_time` and mirror it.

The channel carries the absolute in-game time as a `u32`, in minutes since the
game began: the same unit `GetStartTime()` and `GetScheduledTime()` use. It
updates once per economy minute. Telemetry callbacks and SDK callbacks both run
on the game thread, so the plain global needs no locking.

## Syncing with your server

The `Sync*` functions above are yours. Two rules from elsewhere in the docs
meet here:

- Callbacks run on the game thread, so they must not perform network I/O.
  Have each `Sync*` function put a message on a queue and let your worker
  thread deliver it; see [Threading](../concepts/threading.md).
- The cancelation reason is worth sending along. It tells your backend whether
  the route died by player choice or by circumstance; the
  [bus module reference](../advanced/bus.md) describes each.

With that in place, your server hears about every job the moment it starts
(route and estimated payout included), the plan once the navigation data is
ready, each completed stop, and the final payout or the reason there was none.
