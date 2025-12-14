"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/teamComponents/NavBar";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  MessageCircle,
  MoreHorizontal,
  UserPlus,
  Phone,
  Search,
} from "lucide-react";

import {
  useGetPendingRequests,
  useRespondFriendRequest,
  useSearchUsers,
  useSendFriendRequest,
} from "@/services/react-query/friend";
import type { EnrichedPending } from "@/services/react-query/friend";
import type { DtoUserResponse } from "@/api";
import { api as generatedApi } from "@/services/react-query/api";
import { sendDirectMessageWithRetry } from '@/services/react-query/messages';
import { useFriendStore } from "@/services/stores/useFriendStore";
import { useAuthStore } from "@/services/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { getJoinableRooms } from "@/services/react-query/voice";
import { useVoiceStore } from '@/services/stores/useVoiceStore';

type Friend = {
  id: string;
  name: string;
  email?: string;
  mutualFriends?: number;
};

function mapUserToFriend(u: any): Friend {
  return {
    id: u.id || u.username || String(Math.random()),
    name:
      `${u.firstname || ""} ${u.lastname || ""}`.trim() ||
      u.username ||
      "Unknown",
    email: u.email,
    mutualFriends: 0,
  };
}

export default function Friends() {
  const friendsStore = useFriendStore();
  const auth = useAuthStore();
  const navigate = useNavigate();

  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const [friendsLoading, setFriendsLoading] = useState(false);
  const [apiFriends, setApiFriends] = useState<Friend[]>([]);

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DtoUserResponse[]>([]);
  const searchRef = useRef<number | null>(null);

  const getPending = useGetPendingRequests();
  const respond = useRespondFriendRequest();
  const searchUsers = useSearchUsers();
  const sendRequest = useSendFriendRequest();

  // load friends + mutual counts from API
  const loadFriends = useCallback(async () => {
    if (!auth.user?.id) return;
    const userId = auth.user.id;
    let mounted = true;

    setFriendsLoading(true);
    try {
      const resp = await generatedApi.usersIdFriendsGet(userId);
      const users: DtoUserResponse[] = (resp && (resp as any).data) || [];
      const mapped = users.map((u: any) => mapUserToFriend(u));

      const withMutuals = await Promise.all(
        mapped.map(async (f) => {
          try {
            const r = await generatedApi.usersIdMutualOtherIdGet(
              userId,
              f.id as string
            );
            const mutualList = (r && (r as any).data) || [];
            return {
              ...f,
              mutualFriends: Array.isArray(mutualList)
                ? mutualList.length
                : 0,
            } as Friend;
          } catch (e) {
            console.error("failed mutual fetch for", f.id, e);
            return { ...f, mutualFriends: 0 } as Friend;
          }
        })
      );

      if (mounted) setApiFriends(withMutuals);
    } catch (err) {
      console.error("failed to load friends", err);
    } finally {
      if (mounted) setFriendsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [auth.user?.id]);

  // load pending requests
  useEffect(() => {
  if (!auth.user?.id) return;
  const userId = auth.user.id;

  setPendingLoading(true);
  getPending.mutate(
    { userId },
    {
      onSuccess: (data) => {
        setPendingRequests((data as EnrichedPending[]) || []);
        setPendingLoading(false);
      },
      onError: (err: any) => {
        console.error("getPending error", err);
        setPendingLoading(false);
      },
    }
  );
}, [auth.user?.id]); // nu adăuga getPending aici


  // load friends on mount / user change
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Poll for incoming private calls (rooms the user can join of type 'private')
  const voice = useVoiceStore();
  const [incomingInvite, setIncomingInvite] = useState<{ roomId: string; callerId: string; callerName: string } | null>(null);
  const ignoredRoomsRef = useRef<Record<string, number>>({});
  const declinedRoomsRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (!auth.user?.id) return;
    // don't poll while user is already in a call
    if (voice.selectedRoomId || voice.ws) return;
    let mounted = true;
    let poll: any = null;
    const check = async () => {
      try {
        const rooms = await getJoinableRooms(String(auth.user!.id));
        if (!mounted || !rooms) return;
        const incoming = rooms.find((r: any) => r.type === 'private' && r.createdBy !== String(auth.user!.id));
        if (incoming) {
          const idStr = String(incoming.id);
          // if we have locally marked this room as declined, skip showing it
          if (declinedRoomsRef.current[idStr]) return;
          // resolve caller name from server when possible
          let callerName = incoming.createdBy || 'Unknown';
          try {
            const uresp = await generatedApi.usersIdGet(String(incoming.createdBy));
            const udata = (uresp && (uresp as any).data) || null;
            if (udata) {
              const raw = udata.username || udata.name || `${udata.firstname || ''} ${udata.lastname || ''}`.trim() || udata;
              try {
                if (raw && typeof raw === 'string') callerName = raw;
                else if (raw && typeof raw === 'object') callerName = raw.username || raw.name || `${raw.firstname || ''} ${raw.lastname || ''}`.trim() || String(incoming.createdBy);
                else callerName = String(raw);
              } catch {
                callerName = String(incoming.createdBy);
              }
            }
          } catch (e) {
            // ignore
          }
          // set incoming invite state (UI will show accept/decline)
          // ignore if user recently declined this room
          const expires = ignoredRoomsRef.current[idStr];
          if (expires && Date.now() < expires) return;
          // avoid re-setting the same incoming invite if already visible
          if (!incomingInvite || incomingInvite.roomId !== idStr) {
            setIncomingInvite({ roomId: idStr, callerId: String(incoming.createdBy), callerName });
          }
          return;
        }

        // If no joinable room found, we could fallback to checking direct messages
        // for explicit invites. That API currently requires strict query params
        // and calling it without them returns 400 from the server, which causes
        // noisy errors on page load. For now we skip that fallback to avoid the
        // 400s; invitations should be delivered via the voice joinable API or
        // via the real-time messages WebSocket.
      } catch (e) {
        // ignore polling errors
      }
    };
    poll = window.setInterval(check, 3000);
    // check immediately
    check();
    return () => { mounted = false; if (poll) clearInterval(poll); };
  }, [auth.user?.id, navigate, voice.selectedRoomId, voice.ws]);

  async function handleRespond(fromId: string, toId: string, accept: boolean) {
    try {
      await respond.mutateAsync({ fromUserId: fromId, toUserId: toId, accept });
      // refresh pending list
      const currentUserId = auth.user?.id;
      if (!currentUserId) return;
      getPending.mutate(
  { userId: currentUserId },
  {
    onSuccess: (data) => {
      setPendingRequests((data as EnrichedPending[]) || []);
      loadFriends().catch((e) =>
        console.error("reload friends after accept failed", e)
      );
    },
    onError: (err: any) => {
      console.error("refresh pending error", err);
    },
  }
);

    } catch (err) {
      console.error("respond friend request error", err);
    }
  }

  const friendsFromStore = friendsStore.friends.map(mapUserToFriend);
  const friends = apiFriends.length > 0 ? apiFriends : friendsFromStore;

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      <Navbar />
      {/* Incoming private call UI */}
      {incomingInvite && (
        <div className="fixed right-6 top-20 z-50">
          <div className="border border-neutral-800 rounded-lg bg-neutral-800/95 p-4 shadow-lg">
            <div className="mb-2 text-sm text-gray-200">{incomingInvite.callerName} is calling you</div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-600 text-white" onClick={async () => {
                // notify caller that we accepted, then join the private call page
                try {
                  try {
                    await sendDirectMessageWithRetry(String(incomingInvite.callerId), String(auth.user!.id), `call_accepted:${incomingInvite.roomId}`);
                  } catch (e) {
                    console.warn('Failed to send call_accepted message after retries', e);
                  }
                } catch (e) {}
                // pass caller id so PrivateCallPage can notify the peer when needed
                navigate(`/private-call/${incomingInvite.roomId}?caller=${encodeURIComponent(String(incomingInvite.callerId))}`);
                setIncomingInvite(null);
              }}>Accept</Button>
              <Button size="sm" variant="ghost" onClick={async () => {
                try {
                  // Try sending direct message (retry helper)
                  try {
                    const res = await sendDirectMessageWithRetry(String(incomingInvite.callerId), String(auth.user!.id), `call_declined:${incomingInvite.roomId}`);
                    console.log('sendDirectMessageWithRetry call_declined result', res);
                  } catch (e) {
                    console.warn('Failed to send decline message after retries', e);
                  }

                  // (Direct API POST fallback removed — we already use sendDirectMessageWithRetry above)

                  // As a fast fallback, if we have a voice WS connection, send a short room-level signal
                  // so the caller (if connected to the voice room) receives immediate notification.
                  try {
                    const voice = useVoiceStore.getState();
                    const ws = voice.ws;
                    if (ws && ws.readyState === WebSocket.OPEN) {
                      try {
                        // send both a call-ended (existing handler) and a call_declined typed message
                        ws.send(JSON.stringify({ type: 'call-ended', roomId: incomingInvite.roomId }));
                        ws.send(JSON.stringify({ type: 'call_declined', roomId: incomingInvite.roomId, from: String(auth.user!.id), to: String(incomingInvite.callerId) }));
                        console.log('Sent call-ended and call_declined via voice WS as fallback');
                      } catch (e) { console.warn('voice ws send fallback failed', e); }
                    }
                  } catch (e) { /* ignore */ }

                  // prevent showing this invite again for a short period and mark as declined locally
                  const rid = String(incomingInvite.roomId);
                  ignoredRoomsRef.current[rid] = Date.now() + 30_000;
                  declinedRoomsRef.current[rid] = true;
                } catch (e) { console.warn('decline handler error', e); }
                setIncomingInvite(null);
              }}>Decline</Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Friends
            </h1>
            <p className="text-sm text-gray-400">
              Connect with classmates and study together
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gray-100 text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200">
                <UserPlus className="h-4 w-4" />
                Add Friend
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl border border-neutral-700 bg-neutral-900 text-gray-100">
              <DialogHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    Add Friend
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-gray-400">
                    Search for students by name or email to add them as
                    friends.
                  </DialogDescription>
                </div>
                <DialogClose asChild></DialogClose>
              </DialogHeader>
              <div className="mt-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearchQuery(v);
                      if (searchRef.current)
                        window.clearTimeout(searchRef.current);
                      searchRef.current = window.setTimeout(() => {
                        if (!v.trim()) {
                          setSearchResults([]);
                          return;
                        }
                        // aici e deja compatibil cu useSearchUsers (mutate({ query }))
                        searchUsers.mutate(
                          { query: v },
                          {
                            onSuccess: (res) =>
                              setSearchResults(res || []),
                          }
                        );
                      }, 350);
                    }}
                    className="h-10 rounded-xl border border-neutral-800 bg-neutral-800/80 pl-9 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="mt-3 max-h-80 overflow-y-auto">
                {searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Search className="mb-4 h-10 w-10 text-gray-300" />
                    <p className="text-sm text-gray-400">
                      Start typing to search for friends
                    </p>
                  </div>
                )}

                {searchResults.map((u) => (
                  <Card
                    key={u.id}
                    className="mb-2 border border-neutral-800 bg-neutral-800/90"
                  >
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">
                          {(u.firstname || "") +
                            " " +
                            (u.lastname || "")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {u.email}
                        </div>
                      </div>

                      <div>
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!auth.user?.id) {
                              alert(
                                "You must be logged in to send a friend request"
                              );
                              return;
                            }
                            if (!u.id) {
                              alert("Selected user has no id");
                              return;
                            }
                            if (u.id === auth.user.id) {
                              alert(
                                "You cannot send a friend request to yourself"
                              );
                              return;
                            }

                            try {
                              await sendRequest.mutateAsync({
                                fromUserId: auth.user.id,
                                toUserId: u.id,
                              });
                              alert("Friend request sent");
                            } catch (e: any) {
                              const msg =
                                e?.response?.data?.message ||
                                e?.message ||
                                "Failed to send request";
                              alert(`Error: ${msg}`);
                            }
                          }}
                        >
                          Send Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full max-w-xl grid-cols-3 rounded-xl bg-neutral-800">
            <TabsTrigger
              value="all"
              className="gap-1 rounded-xl text-gray-300 data-[state=active]:bg-neutral-700 data-[state=active]:text-white"
            >
              All Friends
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-[20px] justify-center border border-neutral-700 bg-neutral-900 px-1 text-[11px] font-medium text-gray-100"
              >
                {friends.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="pending"
              className="gap-1 rounded-xl text-gray-300 data-[state=active]:bg-neutral-700 data-[state=active]:text-white"
            >
              Pending
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-[20px] justify-center border border-neutral-700 bg-neutral-900 px-1 text-[11px] font-medium text-gray-100"
              >
                {pendingRequests.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="suggestions"
              className="rounded-xl text-gray-300 data-[state=active]:bg-neutral-700 data-[state=active]:text-white"
            >
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {friendsLoading && (
              <div className="text-sm text-gray-400">
                Loading friends…
              </div>
            )}
            {!friendsLoading && friends.length === 0 && (
              <div className="text-sm text-gray-400">
                No friends found.
              </div>
            )}
            {!friendsLoading &&
                        friends.map((friend) => (
                          <FriendRow key={friend.id} friend={friend} onCall={async () => {
                            try {
                              if (!auth.user?.id) {
                                alert('You must be logged in to call');
                                return;
                              }
                              const resp = await generatedApi.voicePrivateCallPost(String(auth.user.id), friend.id)
                                .then(r => r.data);
                              if (resp && resp.id) {
                                // try to send invite message but don't let a transient 500 block the call
                                try {
                                  await sendDirectMessageWithRetry(String(friend.id), String(auth.user.id), `call_invite:${resp.id}`);
                                } catch (e) {
                                  // Log and continue: the message hub may be down; navigate to the call page anyway.
                                  console.warn('Failed to send invite message; proceeding to call page', e);
                                }

                                navigate(`/private-call/${resp.id}?callee=${encodeURIComponent(String(friend.id))}`);
                              } else {
                                alert('Failed to start call');
                              }
                            } catch (e: any) {
                              const msg = e?.response?.data?.message || e?.message || 'Call failed';
                              alert(`Error: ${msg}`);
                            }
                          }} />
                        ))}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingLoading && (
              <div className="text-sm text-gray-400">
                Loading pending requests…
              </div>
            )}

            {!pendingLoading && pendingRequests.length === 0 && (
              <div className="text-sm text-gray-400">
                No pending requests right now.
              </div>
            )}

            {!pendingLoading &&
              pendingRequests.map((r) => {
                const req = (r && (r.request ? r.request : r)) || {};
                const user = r && r.user ? r.user : undefined;
                const fromId = req.fromUserId || "";
                const toId = req.toUserId || "";
                const created = req.createdAt || req.createdAtUTC || "";
                const key = `${fromId}:${toId}`;

                return (
                  <Card
                    key={key}
                    className="border border-neutral-800 bg-neutral-800/90 shadow-sm"
                  >
                    <CardContent className="flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <div className="font-medium leading-none text-white">
                          {user?.username ||
                            (user
                              ? `${user.firstname || ""} ${
                                  user.lastname || ""
                                }`.trim()
                              : fromId)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Requested at:{" "}
                          {created
                            ? new Date(created).toLocaleString()
                            : "Unknown"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user?.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            handleRespond(fromId, toId, true)
                          }
                          size="sm"
                          className="bg-green-600 text-white"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() =>
                            handleRespond(fromId, toId, false)
                          }
                          variant="ghost"
                          size="sm"
                          className="text-red-400"
                        >
                          Deny
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>

          <TabsContent
            value="suggestions"
            className="mt-6 text-sm text-gray-400"
          >
            No suggestions at the moment.
          </TabsContent>
        </Tabs>
      </main>
      
    </div>
  );
}

function FriendRow({ friend, onCall }: { friend: Friend; onCall: () => void }) {
  return (
    <Card className="border border-neutral-800 bg-neutral-800/90 shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-neutral-700 bg-neutral-900">
            <AvatarFallback className="text-gray-100">
              {friend.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <div className="font-medium leading-none text-white">
              {friend.name}
            </div>
            <div className="text-xs text-gray-400">{friend.email}</div>
            <div className="text-[11px] text-gray-500">
              {friend.mutualFriends} mutual friends
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-neutral-700 bg-neutral-900 text-gray-100 hover:bg-neutral-800"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Message</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-neutral-700 bg-neutral-900 text-gray-100 hover:bg-neutral-800"
            onClick={onCall}
          >
            <Phone className="h-4 w-4" />
            <span>Call</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-gray-300 hover:bg-neutral-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 border-neutral-800 bg-neutral-900 text-gray-100"
            >
              <DropdownMenuItem className="hover:bg-neutral-800">
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-neutral-800">
                Mute
              </DropdownMenuItem>
              <Separator className="my-1 bg-neutral-800" />
              <DropdownMenuItem className="text-red-400 hover:bg-neutral-800">
                Remove friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}