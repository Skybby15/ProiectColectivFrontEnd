// components/MySidebar.tsx
import { CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Collapsible } from "@radix-ui/react-collapsible";
import { BookOpenText ,AudioLines, CalendarClock, CalendarDays, ChevronDown, ChevronUp, FolderClosed, LayoutDashboard, MessageSquareText, UsersRound, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/home.png"
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTeamStore } from "@/services/stores/useTeamStore";
import type { Screen } from "../../TeamPage";

// Interface for TeamSidebar props
export interface TeamSidebarProps {
  openScreenFn: (screen: Screen, roomId?: number) => void;
}

export function TeamSidebar({ openScreenFn }: TeamSidebarProps) {
  const [chatsAreOpen, setChatsAreOpen] = useState(false);
  const [voicesAreOpen, setVoicesAreOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const { openTeam, clearOpenTeam } = useTeamStore()

  const chatRooms = [
    { title: "General"},
  ]

  const voiceRooms = [
    { title: "General", peopleOn:10},
  ]

  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home");
    clearOpenTeam();
  }

  return (
    <Sidebar variant="floating">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem
              className="cursor-pointer"
            >
              <DropdownMenu onOpenChange={(open) => setTopMenuOpen(open)} >
                <DropdownMenuTrigger asChild>
                  <div className="flex border-b rounded-lg w-full justify-center items-center font-light">
                    <p className="m-2 select-none font-medium my-3">
                      {openTeam?.name}
                    </p>
                    { topMenuOpen &&
                      <X size={20}/>
                    }
                    { !topMenuOpen &&
                      <ChevronDown size={20}/>
                    }
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex justify-center">
                  <DropdownMenuItem>
                    <Button
                      variant={"ghost"}
                    >
                      Leave team
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel className="font-bold text-sm h-10 hover:text-primary hover:bg-accent cursor-pointer"
                onClick={() => openScreenFn("Dashboard")}
              >
                  <div className="flex items-center gap-8 text-xl">
                    <LayoutDashboard/>
                    Dashboard
                  </div>
                </SidebarGroupLabel>     
            </SidebarGroupContent>
          </SidebarGroup>
          <Collapsible
            open={chatsAreOpen}
            onOpenChange={setChatsAreOpen}
          >
            <SidebarGroup>
              <CollapsibleTrigger>
                <SidebarGroupLabel className="font-bold text-sm justify-between hover:text-primary cursor-pointer">
                  <div className="flex items-center gap-4.5">
                    <MessageSquareText size={22}/>
                    Chat Rooms
                  </div>
                  { chatsAreOpen && 
                    <ChevronUp/>
                  }
                  {
                    !chatsAreOpen &&
                    <ChevronDown/>
                  }
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
              <SidebarGroupContent>
                  <SidebarMenuSub className="gap-y-2">
                  {chatRooms.map((item) => (    // Momentan orice chat room duce la general 
                      <SidebarMenuItem className="cursor-pointer" 
                        key={item.title}
                        onClick={() => openScreenFn("ChatRoom",0)}
                      >
                      <SidebarMenuButton asChild>
                        <div>
                          {item.title}
                        </div>
                      </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
                  </SidebarMenuSub>
              </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <Collapsible
            open={voicesAreOpen}
            onOpenChange={setVoicesAreOpen}
          >
            <SidebarGroup>
              <CollapsibleTrigger>
                <SidebarGroupLabel className="font-bold text-sm justify-between hover:text-primary cursor-pointer">
                  <div className="flex items-center gap-4">
                    <AudioLines/>
                    Voice Rooms
                  </div>
                  { voicesAreOpen && 
                    <ChevronUp/>
                  }
                  {
                    !voicesAreOpen &&
                    <ChevronDown/>
                  }
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
              <SidebarGroupContent>
                  <SidebarMenuSub className="gap-y-3">
                  {voiceRooms.map((item) => (
                      <SidebarMenuItem className="cursor-pointer" key={item.title}>
                        <SidebarMenuButton asChild>
                          <div className="justify-between">
                            <p className="line-clamp-1">{item.title}</p>
                            <div className="flex items-center gap-1">
                              {item.peopleOn}
                              <UsersRound size={20}/>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
                  </SidebarMenuSub>
              </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel className="font-bold text-sm h-10 hover:text-primary hover:bg-accent cursor-pointer"
                onClick={() => openScreenFn("Files")}
              >
                  <div className="flex items-center gap-10">
                    <FolderClosed/>
                    Team Files
                  </div>
                </SidebarGroupLabel>     
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel className="font-bold text-sm h-10 hover:text-primary hover:bg-accent cursor-pointer">
                  <div className="flex items-center gap-10">
                    <CalendarClock/>
                    Events
                  </div>
                </SidebarGroupLabel>     
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel className="font-bold text-sm h-10 hover:text-primary hover:bg-accent cursor-pointer">
                  <div className="flex items-center gap-10">
                    <CalendarDays/>
                    Calendar
                  </div>
                </SidebarGroupLabel>     
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel 
                onClick={() => openScreenFn("Quizzes")}
                className="font-bold text-sm h-10 hover:text-primary hover:bg-accent cursor-pointer"
              >
                  <div className="flex items-center gap-10">
                    <BookOpenText/>
                    Quizzes
                  </div>
                </SidebarGroupLabel>     
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t rounded-t-4xl rounded-b-lg hover:bg-accent cursor-pointer overflow-hidden"
          onClick={handleGoHome}
        >
          <div className=" flex items-center justify-center gap-x-2 pr-5">
            <img src={logo} alt="StudyFlow logo" className="h-7 w-auto" />
            <p>Home</p>
          </div>
        </SidebarFooter>
    </Sidebar>
  );
}
