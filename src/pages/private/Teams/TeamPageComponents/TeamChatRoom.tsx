import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Send } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/services/stores/useAuthStore"
import { useTeamStore } from "@/services/stores/useTeamStore"
import { useGetTeamMessages, useSendTeamMessage } from "@/services/react-query/teams"
import type { DtoTeamMessageRequest } from "@/api"
import { useMessageSocket } from "@/services/websockets/messagesWS"
import { Spinner } from "@/components/ui/spinner"
import { useGetAllTeamRequests, useAcceptTeamRequest, useRejectTeamRequest } from "@/services/react-query/teamsRequests";
import {useUsersStore} from "@/services/stores/useUsersStore.tsx";

export function TeamChatRoom({ roomId }: { roomId: number }) {
  const [loading, setLoading] = useState(true);

  const [inputValue, setInputValue] = useState("")
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { user, token } = useAuthStore();
  const { openTeam, teamMessages, teamRequests} = useTeamStore();
  const { usersById, fetchUserById } = useUsersStore();

  const { mutateAsync : getTeamMessagesAsync } = useGetTeamMessages();
  const { mutateAsync : sendTeamMessagesAsync} = useSendTeamMessage();
  const { mutateAsync: getAllTeamRequestsAsync } = useGetAllTeamRequests();
  const { mutate: acceptReq } = useAcceptTeamRequest();
  const { mutate: rejectReq } = useRejectTeamRequest();

  useMessageSocket(token!,true);

  useEffect(() => {
    getTeamMessagesAsync({ teamId: openTeam?.id! })
        .then(() => getAllTeamRequestsAsync())
        .then(() => {
          setLoading(false);
          setNewMessagesCount(0);
        });
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: DtoTeamMessageRequest = {
      senderId: user?.id,
      teamId: openTeam?.id,
      textContent: inputValue
    }

    sendTeamMessagesAsync(newMessage)
    setInputValue("")

  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollDown = () => {
    if (messagesEndRef.current)
    {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" })
      setIsAtBottom(true)
    }
  }

  const handlePressOnNewMessages = () => {
    scrollDown()
    setNewMessagesCount(0)
  }

  useEffect(()=>{
    const lastMessage = teamMessages.at(teamMessages.length - 1)

    if ((messagesEndRef.current && lastMessage?.sender?.id == user?.id) || isAtBottom ) {
      scrollDown()
    }else
    {
      setNewMessagesCount((prev) => prev + 1)
    }

  },[teamMessages])

  useEffect(()=>{
    if(loading == false)
      scrollDown()
  },[loading])

  useEffect(() => {
    if (loading || !scrollAreaRef.current) return

    let viewport: HTMLElement | null = null
    let cleanup: (() => void) | null = null

    // Find the viewport element created by ScrollArea
    const findViewport = () => {
      return scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
    }

    // Use a small delay to ensure the viewport is rendered
    const timeoutId = setTimeout(() => {
      viewport = findViewport()
      if (!viewport) return

      const handleScroll = () => {
        if (!viewport) return
        const atBottom =
          Math.abs(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight) < 1
        setIsAtBottom(atBottom)
      }

      viewport.addEventListener('scroll', handleScroll, { passive: true })
      
      cleanup = () => {
        if (viewport) {
          viewport.removeEventListener('scroll', handleScroll)
        }
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (cleanup) {
        cleanup()
      }
    }
  }, [loading, teamMessages.length])

  useEffect(() => {
    if(isAtBottom)
    {
      setNewMessagesCount(0)
    }
  },[isAtBottom])

  const visibleRequests = teamRequests?.filter(r => r.teamId === openTeam?.id) ?? [];
  const hasContent = teamMessages.length > 0 || visibleRequests.length > 0;

  useEffect(() => {
    visibleRequests.forEach((req) => {
      if (!req.userId) return;
      if (usersById[req.userId]) return;

      fetchUserById(req.userId);
    });
  }, [visibleRequests, usersById, fetchUserById]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="flex flex-col w-full h-full mx-2 rounded-r-3xl rounded-l-none overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Room {roomId}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          {/* Messages Area */}
          {loading == true &&
          <div className="flex p-4 h-184 justify-center items-center gap-x-2">
            <Spinner />
            <p>Loading your messages</p>
          </div>
          }
          {loading == false && (
              <ScrollArea
                  ref={scrollAreaRef}
                  className="relative p-4 h-184"
              >
                <div className="space-y-4">
                  {/* messages */}
                  {teamMessages.map((message, index) => (
                      <div key={index} className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {message.sender?.username?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-sm">{message.sender?.username}</span>
                            <span className="text-xs text-muted-foreground">{message.sentAt}</span>
                          </div>
                          <p className="text-sm text-foreground min-w-0 word wrap-anywhere overflow-wrap anywhere">
                            {message.textContent}
                          </p>
                        </div>
                      </div>
                  ))}

                  {/* team requests messages */}
                  {visibleRequests.map((req) => (
                      <div key={req.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">Join request</p>
                            <p className="text-sm text-muted-foreground">
                              User <span className="font-medium">{usersById[req.userId!]?.username ?? req.userId}</span> wants to join this team
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => acceptReq({ id: req.id! })}
                            >
                              Accept
                            </Button>

                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectReq({ id: req.id! })}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                  ))}

                  {!hasContent && (
                      <div className="flex justify-center items-center gap-x-2 py-4">
                        <p className="text-primary opacity-30">
                          No messages here , be the first to light up the team !
                        </p>
                      </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {newMessagesCount != 0 && !isAtBottom && (
                    <Button
                        variant={"outline"}
                        onClick={handlePressOnNewMessages}
                        className="absolute bottom-5 right-5"
                    >
                      {newMessagesCount} new message
                      <ChevronDown />
                    </Button>
                )}
              </ScrollArea>
          )}


          {/* Input Area */}
          <div className="border-t p-4 bg-background flex gap-2 justify-self-end">
            <Input
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              variant="default"
              disabled={loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
