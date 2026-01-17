import { useNavigate, useParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TeamSidebar } from "./TeamPageComponents/Sidebar/TeamSidebar";
import { TeamSidebarTrigger } from "./TeamPageComponents/Sidebar/TeamSidebarTrigger";
import { TeamDashboard } from "./TeamPageComponents/TeamDashboard";
import { useGetTeamMembers, useOpenTeam } from "@/services/react-query/teams";
import { useEffect, useState } from "react";
import { TeamChatRoom } from "./TeamPageComponents/TeamChatRoom";
import { Card } from "@/components/ui/card";
import TeamQuizzes from "./TeamPageComponents/TeamQuizzes";
import { TeamFiles } from "./TeamPageComponents/TeamFiles";
import { TeamVoiceRoom } from "./TeamPageComponents/TeamVoiceRoom";
import TeamEvents from "./TeamPageComponents/TeamEvents";

export type Screen =
    "Dashboard" |
    "ChatRoom"  |
    "VoiceRoom" |
    "Files"     |
    "Events"    |
    "Calendar"  |
    "Quizzes"


export default function TeamPage() {
    const { teamId } = useParams<{teamId: string}>(); 
    const { mutate : openTeam} = useOpenTeam();
    const { mutate : getMembers} = useGetTeamMembers();
    const navigate = useNavigate();

    const [openScreen , setOpenScreen] = useState<Screen>("Dashboard");
    const [roomId, setRoomId] = useState<number>(-1);

    const changeOpenScreen = (screenToOpen: Screen, roomId?: number) => {
        if(roomId !== undefined)
            setRoomId(roomId)

        setOpenScreen(screenToOpen)
    }


    useEffect(()=>{
        if( !teamId )
        {
            navigate("/home")
            return
        }

        openTeam({teamId})
        getMembers({teamId})
    },[])

    return(
        <SidebarProvider>
            <TeamSidebar 
                openScreenFn={changeOpenScreen}
            />
                <div className="flex flex-col w-fit flex-1">
                    <TeamSidebarTrigger />
                    <div className="flex w-full h-16 items-center">
                        <Card className="w-full rounded-r-full bg-background mx-2">

                        </Card>
                    </div>
                    <div className="flex w-full h-full mb-1.5">
                        {openScreen == "Dashboard" && 
                            <TeamDashboard teamId={teamId!}/>
                        }
                        {openScreen == "ChatRoom" &&
                            <TeamChatRoom roomId={roomId}/>
                        }
                        {openScreen == "Quizzes" &&
                            <TeamQuizzes teamId={teamId!}/>
                        }
                        {openScreen == "Files" &&
                            <TeamFiles teamId={teamId!}/>
                        }
                        {openScreen == "VoiceRoom" &&
                            <TeamVoiceRoom />
                        }
                        {openScreen == "Events" &&
                            <TeamEvents teamId={teamId!}/>
                        }
                    </div>
                </div>
        </SidebarProvider>
    )
}

