import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DtoEventDTO, DtoUpdateEventStatusRequest } from "@/api";
import EventCard from "./EventPageComponents/EventCard";
import { useEffect, useState } from "react";
import { useGetEvents, useUpdateEventStatus } from "@/services/react-query/events";
import { useAuthStore } from "@/services/stores/useAuthStore";

export default function TeamEvents({teamId} : {teamId : string}) {
  const navigate = useNavigate();
  const [ events, setEvents ] = useState<DtoEventDTO[]>([])

  const { mutate: getEvents, data, isPending, isError, error } = useGetEvents(teamId)
  const { mutateAsync: updateStatus, data: updatedEventStatusData } = useUpdateEventStatus();
  const { user: loggedUser } = useAuthStore();
  const userId = loggedUser?.id;

  const handleAttendance = (status: string, id: string) => {
    updateStatus({ id: id as string, request: { userId, status } as DtoUpdateEventStatusRequest });
  }

  const loadData = () => {
    getEvents();
  }

  useEffect(() => {
    loadData();
  }, [teamId]);

  useEffect(() => {
    if(data) {
      setEvents(data);
    }
  }, [data]);

  useEffect(() => {
    if(updatedEventStatusData) {
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEventStatusData.id ? updatedEventStatusData : event
        )
      );
    }
  }, [updatedEventStatusData]);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Team Events</h2>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/teams/${teamId}/events/create`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Button variant="outline" onClick={loadData} disabled={isPending}>Refresh</Button>
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
        <div className="text-red-500 text-sm">Failed to load events: {error.message}</div>
      )}
      {!isPending && !isError && events.length === 0 && (
        <div className="text-muted-foreground">
          No events found for this team.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard 
            key={event.id}
            data={event} 
            onAttend={() => { handleAttendance("accepted", event.id!) }} 
            onReject={() => { handleAttendance("declined", event.id!) }} 
          />
        ))}
      </div>
    </div>
  );
}