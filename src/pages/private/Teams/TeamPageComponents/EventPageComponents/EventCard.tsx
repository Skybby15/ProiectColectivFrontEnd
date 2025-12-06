import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, XCircle, Clock, Watch, Check, X } from "lucide-react";
import type { MockEventData } from "./EventType";

export default function EventCard({ data, onAttend, onReject }: { data: MockEventData, onAttend?: () => void, onReject?: () => void }) {
  const totalInvited = data.accepedCount + data.declinedCount + data.pendingCount;
  const acceptedPercent = (data.accepedCount / totalInvited) * 100;
  const declinedPercent = (data.declinedCount / totalInvited) * 100;
  const pendingPercent = (data.pendingCount / totalInvited) * 100;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' 
                 : day === 2 || day === 22 ? 'nd'
                 : day === 3 || day === 23 ? 'rd' 
                 : 'th';
    return `${month} ${day}${suffix}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Calculate hours until event
  const hoursUntil = Math.floor((new Date(data.startsAt).getTime() - Date.now()) / (1000 * 60 * 60));

  return (
    <Card className="p-6 border-2 border-solid max-h-128">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">
          # {data.name}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {data.description}
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{formatDate(data.startsAt)} @ {formatTime(data.startsAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Watch className="h-4 w-4 text-amber-600"/>
          <span>Duration : {data.duration} ceva</span>
        </div>
      </div>

      <div className="border-t-2 border-solid" />

      <div className="space-y-3">
        <div className="font-semibold">
          Total Invited: {totalInvited}
        </div>

        <div className="flex h-4 w-full overflow-hidden rounded-full border">
          <div 
            className="bg-green-800 transition-all"
            style={{ width: `${acceptedPercent}%` }}
          />
          <div 
            className="bg-neutral -900 transition-all"
            style={{ width: `${pendingPercent}%` }}
          />
          <div 
            className="bg-red-800 transition-all"
            style={{ width: `${declinedPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-3 border-2">
          <div className="flex items-center justify-center gap-2 p-3 border-r-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="font-semibold">{data.accepedCount}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 border-r-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="font-semibold">{data.pendingCount}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="font-semibold">{data.declinedCount}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        {hoursUntil > 0 ? (
          <div className="text-sm italic text-muted-foreground">
            *Event starts in {hoursUntil} hours.
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-px">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-r-none bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-green-300"
            onClick={onAttend}
          >
            <Check className="h-4 w-4" />
            Attend
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-l-none bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border-red-300"
            onClick={onReject}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>
    </Card>
  );
}