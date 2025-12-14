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
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import logo from "@/assets/home.png"
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTeamStore } from "@/services/stores/useTeamStore";
import type { Screen } from "../../TeamPage";
import { useVoiceStore } from "@/services/stores/useVoiceStore";
import { getActiveRooms, createVoiceRoom } from "@/services/react-query/voice";
import { useAuthStore } from "@/services/stores/useAuthStore";

// Interface for TeamSidebar props
export interface TeamSidebarProps {
  openScreenFn: (screen: Screen, roomId?: number) => void;
}

export function TeamSidebar({ openScreenFn }: TeamSidebarProps) {
  const [chatsAreOpen, setChatsAreOpen] = useState(false);
  const [voicesAreOpen, setVoicesAreOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const { openTeam } = useTeamStore()
  const { rooms, setRooms, selectRoom } = useVoiceStore();
  const { users, selectedRoomId } = useVoiceStore();

  const chatRooms = [
    { title: "General"},
  ]

  // Load voice rooms only when the Voice Rooms collapsible is opened, and team changes
  useEffect(() => {
    if (!voicesAreOpen) return;
    if (!openTeam?.id) { setRooms([]); return; }
    let cancelled = false;
    getActiveRooms(String(openTeam.id))
        .then((data) => { if (!cancelled) setRooms(data); })
        .catch(() => { if (!cancelled) setRooms([]); });
    return () => { cancelled = true; };
  }, [voicesAreOpen, openTeam?.id]);

  const { user } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!openTeam?.id) return alert("No team selected");
    if (!user?.id) return alert("You must be logged in to create a room");
    setIsCreating(true);
    try {
      const created = await createVoiceRoom(String(openTeam.id), String(user.id), roomName || undefined);
      // refresh list and immediately select + open the room so the creator joins
      const data = await getActiveRooms(String(openTeam.id));
      setRooms(data);
      setRoomName("");
      if (created && created.id) {
        selectRoom(String(created.id));
        openScreenFn("VoiceRoom");
      }
      setDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      // If room already exists (backend returns 409), refresh list and open it instead
      const status = err?.response?.status;
      if (status === 409) {
        try {
          const data = await getActiveRooms(String(openTeam.id));
          setRooms(data);
          if (data && data.length > 0) {
            // prefer room with same id as team if present
            const prefer = data.find((r) => r.id === String(openTeam.id)) || data[0];
            selectRoom(String(prefer.id));
            openScreenFn("VoiceRoom");
            setRoomName("");
            setDialogOpen(false);
            return;
          }
        } catch (e) {
          console.error("Failed to refresh rooms after 409", e);
        }
      }
      // generic fallback
      alert(err?.response?.data?.error || err?.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const navigate = useNavigate();

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
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Button
                        variant={"ghost"}
                    >
                      Team setting 1
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button
                        variant={"ghost"}
                    >
                      Team setting 2
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
                  <div className="px-3 py-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">Create Room</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Voice Room</DialogTitle>
                          <DialogDescription>Give a name to the voice room (optional).</DialogDescription>
                        </DialogHeader>
                        <div className="pt-2">
                          <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" />
                        </div>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleCreateRoom} disabled={isCreating}>{isCreating ? "Creating..." : "Create"}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <SidebarMenuSub className="gap-y-3">
                    {rooms.map((room) => (
                        <SidebarMenuItem
                            className="cursor-pointer"
                            key={room.id}
                            onClick={() => {
                              selectRoom(String(room.id));
                              openScreenFn("VoiceRoom");
                            }}
                        >
                          <SidebarMenuButton asChild>
                            <div className="justify-between">
                              <p className="line-clamp-1">{room.name}</p>
                              <div className="flex items-center gap-1">
                                {String(room.id) === String(selectedRoomId) ? (users ? users.length : room.userCount) : room.userCount}
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
              <SidebarGroupLabel className="font-bold text-sm h-10 hover:text-primary hover:bg-accent cursor-pointer">
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
        <SidebarFooter className="border rounded-t-4xl hover:bg-accent cursor-pointer"
                       onClick={() => navigate("/home")}
        >
          <div className=" flex items-center justify-center gap-x-2 pr-5">
            <img src={logo} alt="StudyFlow logo" className="h-7 w-auto" />
            <p>Home</p>
          </div>
        </SidebarFooter>
      </Sidebar>
  );
}