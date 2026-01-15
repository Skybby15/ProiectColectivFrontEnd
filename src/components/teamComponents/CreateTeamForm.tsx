import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { DialogClose } from "@/components/ui/dialog"
import {useAddTeam} from "@/services/react-query/teams.ts";
import { ModelTopicOfInterest } from "@/api";
import {useAuthStore} from "@/services/stores/useAuthStore.ts";




export default function CreateTeamForm() {
    const [teamName, setTeamName] = useState("")
    const [subject, setSubject] = useState("")
    const [teamDescription, setDescription] = useState("")
    const [isPublic, setIsPublic] = useState(true);
    const {user} = useAuthStore();
    const { mutate: addTeam, isPending } = useAddTeam();



    return (
        <form className="w-full text-white space-y-5">
            <div>
                <h2 className="text-xl font-semibold mb-2">Create New Study Team</h2>
                <p className="text-gray-400">
                    Start a new study group and invite your classmates to join
                </p>
            </div>

            {/* Team Name */}
            <div className={"space-y-3.5"}>
                <Label htmlFor="name">Team Name</Label>
                <Input
                    id="name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="bg-neutral-900 border-gray-700 text-white"
                />
            </div>

            {/* Subject */}
            <div className="space-y-3.5">
                <Label htmlFor="subject">Subject</Label>

                <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as ModelTopicOfInterest)}
                    className="bg-neutral-900 border-gray-700 text-white rounded p-2 w-full"
                >
                    <option value="">Select subject...</option>

                    {Object.values(ModelTopicOfInterest).map((topic) => (
                        <option key={topic} value={topic}>
                            {topic}
                        </option>
                    ))}
                </select>
            </div>


            {/* Description */}
            <div className="space-y-3.5">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    value={teamDescription}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your team goals..."
                    className="bg-neutral-900 border-gray-700 text-white h-20 py-2"
                />
            </div>

            {/* Publicity */}
            <div className="flex items-center gap-3">
                <input
                    id="isPublic"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 accent-green-600"
                />
                <Label htmlFor="isPublic" className="text-sm text-gray-300">
                    Public team (anyone can join directly)
                </Label>
            </div>


            {/* Buttons */}
            <div className="flex justify-between gap-3 pt-4 w-full">
                <DialogClose asChild>
                    <Button variant="secondary" className="flex-1 h-10 bg-neutral-700 hover:bg-neutral-600 text-white font-medium">
                        Cancel
                    </Button>
                </DialogClose>
                <Button
                    disabled={isPending}
                    type = "button" variant = "secondary" className="flex-1 h-10 bg-neutral-700 hover:bg-neutral-600 text-white font-medium"
                        onClick={() => {
                            addTeam({
                                name: teamName,
                                ispublic: isPublic,
                                description: teamDescription,
                                teamtopic: subject as ModelTopicOfInterest,
                                userid: user?.id
                            });
                        }}>
                    Create Team
                </Button>
            </div>

        </form>
    )
}
