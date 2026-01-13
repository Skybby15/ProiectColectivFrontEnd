import {useEffect} from "react";
import Navbar from "@/components/teamComponents/NavBar"
import {TeamCard} from "@/components/teamComponents/TeamCard"
import { Button } from "@/components/ui/button"
import {Dialog, DialogTrigger, DialogContent} from "@/components/ui/dialog"
import CreateTeamForm from "@/components/teamComponents/CreateTeamForm";
import {useAuthStore} from "@/services/stores/useAuthStore.ts";
import SearchTeamForm from "@/components/teamComponents/SearchTeamForm.tsx";
import {Plus, Search} from "lucide-react";
import {useTeamStore} from "@/services/stores/useTeamStore.ts";
import {useGetTeams} from "@/services/react-query/teams.ts";

export default function StudyTeams() {
    const {user} = useAuthStore();
    const {teams} = useTeamStore();
    const {mutate: getTeams, isPending} = useGetTeams();

    useEffect(() => {
        getTeams();
    }, []);

    if (isPending) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
                <p>Loading teams...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <Navbar />

            <div className="max-w-6xl mx-auto mt-10 px-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-semibold">StudyTeams</h1>
                        <p className="text-gray-400">
                            Collaborate with classmates and achieve your goals together
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-gray-100 text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200 flex items-center gap-2">
                                    <Search /> Search Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <SearchTeamForm />
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-gray-100 text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200">
                                    <Plus/> Create Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <CreateTeamForm />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* GRID CU ECHIPE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams
                        .filter(team => team.users?.includes(user?.id ?? ""))
                        .map(team => (
                            <TeamCard key={team.id} team={team} />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
