import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@/components/ui/dialog";
import {useAuthStore} from "@/services/stores/useAuthStore.ts";
import {useTeamStore} from "@/services/stores/useTeamStore.ts";
import { useCreateTeamRequest } from "@/services/react-query/teamsRequests";
import {useJoinTeam} from "@/services/react-query/teams";

export default function SearchTeamForm() {
    const [teamName, setTeamName] = useState("");
    const {mutate: createTeamRequest, isPending: isRequestPending} = useCreateTeamRequest();
    const {mutate: joinTeam, isPending: isJoinPending} = useJoinTeam();
    const {user} = useAuthStore();
    const {teams, requestedTeamIds, addRequestedTeamId} = useTeamStore();
    const [pendingTeamId, setPendingTeamId] = useState<string | null>(null);
    const filteredTeams = useMemo(() => {
        if (!teamName.trim()) return [];

        return teams.filter(team =>
            team.name?.toLowerCase().includes(teamName.toLowerCase()) &&
            !team.users?.includes(user?.id ?? "")
        );
    }, [teamName, teams, user?.id]);


    return (
        <form className="w-full text-white space-y-5">
            <div>
                <h2 className="text-xl font-semibold mb-2">Search for a Team</h2>
                <p className="text-gray-400">
                    Start typing to see available teams.
                </p>
            </div>

            <div className="space-y-3.5">
                <Label htmlFor="name">Team Name</Label>
                <Input
                    id="name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Search teams..."
                    className="bg-neutral-900 border-gray-700 text-white"
                />
            </div>

            {/* Filtered Teams by name */}
            <div className="space-y-2 max-h-60 overflow-y-auto bg-neutral-800 p-3 rounded-md border border-gray-700">

                {teamName.trim() !== "" && filteredTeams.length === 0 && (
                    <p className="text-gray-400 text-center">No teams found.</p>
                )}

                {filteredTeams.map(team => {
                    const isThisPending = pendingTeamId === team.id;
                    const isAlreadyRequested = !!team.id && requestedTeamIds.includes(team.id);

                    return (
                        <div key={team.id} className="flex items-center justify-between p-2 border-b border-gray-700">
                            <span>{team.name}</span>

                            <Button
                                type="button"
                                disabled={isThisPending || isAlreadyRequested}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                onClick={() => {
                                    if (!team.id || !user?.id) return;

                                    const id = team.id;
                                    setPendingTeamId(id);

                                    if (team.ispublic) {
                                        joinTeam(
                                            { teamId: id, userId: user.id },
                                            {
                                                onSuccess: () => {
                                                    addRequestedTeamId(id);
                                                    setPendingTeamId(null);
                                                },
                                                onError: () => setPendingTeamId(null),
                                            }
                                        );
                                    } else {
                                        createTeamRequest(
                                            { teamId: id, userId: user.id },
                                            {
                                                onSuccess: () => {
                                                    addRequestedTeamId(id);
                                                    setPendingTeamId(null);
                                                },
                                                onError: () => setPendingTeamId(null),
                                            }
                                        );
                                    }
                                }}
                            >
                                {isAlreadyRequested
                                    ? (team.ispublic ? "Joined" : "Requested")
                                    : isThisPending
                                        ? (team.ispublic ? "Joining..." : "Sending Request...")
                                        : (team.ispublic ? "Join" : "Request Join")}
                            </Button>
                        </div>
                    );
                })}
            </div>


            <div className="flex justify-between gap-3 pt-4 w-full">
                <DialogClose asChild>
                    <Button
                        variant="secondary"
                        className="flex-1 h-10 bg-neutral-700 hover:bg-neutral-600 text-white font-medium"
                    >
                        Close
                    </Button>
                </DialogClose>
            </div>
        </form>
    );
}
