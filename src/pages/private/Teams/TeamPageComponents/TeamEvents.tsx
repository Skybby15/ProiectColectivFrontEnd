import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MockEventData } from "./EventPageComponents/EventType";
import EventCard from "./EventPageComponents/EventCard";

const MOCK_EVENTS: MockEventData[] = [
  {
    accepedCount: 5,
    declinedCount: 2,
    description: "Team building event at the park.",
    duration: 120,
    id: "event-1",
    initatorId: "user-1",
    name: "Team Building",
    pendingCount: 3,
    startsAt: "2025-12-15T10:00:00Z",
    teamId: "team-1"
  },

  {
    accepedCount: 8,
    declinedCount: 1,
    description: "Monthly project kickoff meeting.",
    duration: 60,
    id: "event-2",
    initatorId: "user-2",
    name: "Project Kickoff",
    pendingCount: 1,
    startsAt: "2024-07-20T09:00:00Z",
    teamId: "team-1"
  }
];

export default function TeamEvents({teamId} : {teamId : string}) {
  const isPending = false;
  const isError = false;
  const events = []; // Replace with actual data fetching logic
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Team Events</h2>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/teams/${teamId}/events/create`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Button variant="outline" onClick={() => {}} disabled={isPending}>Refresh</Button>
        </div>
      </div>
      {isPending && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      )}
      {isError && (
        <div className="text-red-500 text-sm">Failed to load events: error.message</div>
      )}
      {!isPending && !isError && events.length === 0 && (
        <div className="text-muted-foreground">
          No events found for this team.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_EVENTS.map((event) => (
          <EventCard data={event} onAttend={() => {}} onReject={() => {}} />
        ))}
      </div>
    </div>
  );
}