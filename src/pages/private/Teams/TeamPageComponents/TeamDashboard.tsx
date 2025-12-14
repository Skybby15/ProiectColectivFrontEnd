import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamStore } from "@/services/stores/useTeamStore";
import { useEffect, useState } from "react";
import { api } from "@/services/react-query/api";
import { getActiveRooms } from "@/services/react-query/voice";
import { useGetTeamMessages } from "@/services/react-query/teams";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, FileText, BookOpen, FolderClosed } from "lucide-react";
import type { DtoFileUploadResponse, DtoMessageDTO } from "@/api";
import { useGetTeamQuizzes } from "@/services/react-query/quiz";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TeamDashboard({teamId} : {teamId : string}) {
    const { openTeam, teamMessages } = useTeamStore();
    const [activeSessions, setActiveSessions] = useState(0);
    const [filesCount, setFilesCount] = useState(0);
    const [recentFiles, setRecentFiles] = useState<DtoFileUploadResponse[]>([]);
    const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
    const [hasLoadedFiles, setHasLoadedFiles] = useState(false);
    const { mutateAsync: getTeamMessagesAsync } = useGetTeamMessages();
    const { mutate: getTeamQuizzes, data: quizzes } = useGetTeamQuizzes(teamId);

    useEffect(() => {
        // Get active voice rooms count
        if (teamId) {
            getActiveRooms(teamId)
                .then((rooms) => setActiveSessions(rooms.length))
                .catch(() => setActiveSessions(0));
            
            // Get files count and recent files only once, and only if we haven't loaded them yet
            // This prevents unnecessary API calls if there are no files
            if (!hasLoadedFiles) {
                api.teamsIdFilesGet(teamId, 1, 5)
                    .then((res) => {
                        setFilesCount(res.data.totalCount || 0);
                        setRecentFiles(res.data.files?.slice(0, 5) || []);
                        setHasLoadedFiles(true);
                    })
                    .catch(() => {
                        setFilesCount(0);
                        setRecentFiles([]);
                        setHasLoadedFiles(true);
                    });
            }

            // Get team messages only once, and only if we haven't loaded them yet
            // This prevents unnecessary API calls if there are no messages
            if (openTeam?.id && !hasLoadedMessages) {
                getTeamMessagesAsync({ teamId: openTeam.id })
                    .then(() => {
                        setHasLoadedMessages(true);
                        // If there are no messages, we can consider it as "loaded" 
                        // and won't show the section
                    })
                    .catch(() => {
                        setHasLoadedMessages(true);
                    });
            }

            // Get quizzes
            getTeamQuizzes();
        }
    }, [teamId, openTeam?.id, getTeamQuizzes, getTeamMessagesAsync, hasLoadedMessages, hasLoadedFiles]);

    const totalMembers = openTeam?.users?.length || 0;
    const recentMessages = teamMessages.slice(-5).reverse();
    const quizzesCount = quizzes?.length || 0;

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return "Just now";
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="w-full h-full p-8 overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Team ID: {teamId}</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="bg-background">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Total Members</p>
                                <p className="text-3xl font-bold text-primary">{totalMembers}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary/50" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-background">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Active Sessions</p>
                                <p className="text-3xl font-bold text-primary">{activeSessions}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-primary/50" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-background">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Files Shared</p>
                                <p className="text-3xl font-bold text-primary">{filesCount}</p>
                            </div>
                            <FolderClosed className="h-8 w-8 text-primary/50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-background">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Quizzes</p>
                                <p className="text-3xl font-bold text-primary">{quizzesCount}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-primary/50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            {(() => {
                const hasMessages = teamMessages.length > 0 && teamMessages.some(msg => msg.teamId === openTeam?.id || msg.teamId === teamId);
                const hasFiles = recentFiles.length > 0;
                const visibleSections = 1 + (hasMessages ? 1 : 0) + (hasFiles ? 1 : 0);
                const gridCols = visibleSections === 1 ? 'grid-cols-1' : visibleSections === 2 ? 'grid-cols-2' : 'grid-cols-3';
                return (
            <div className={`grid gap-6 ${gridCols}`}>
                {/* Team Info & Members */}
                <div className="space-y-6">
                    {/* Team Information */}
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>Team Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                                    <p className="font-semibold">{openTeam?.name || "N/A"}</p>
                                </div>
                                {openTeam?.description && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm">{openTeam.description}</p>
                                    </div>
                                )}
                                {openTeam?.teamtopic && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Topic</p>
                                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                                            {openTeam.teamtopic}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {totalMembers > 0 ? (
                                <ScrollArea className="h-48">
                                    <div className="space-y-3">
                                        {openTeam?.users?.slice(0, 10).map((userId, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {getInitials(userId)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {userId || `Member ${index + 1}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalMembers > 10 && (
                                            <p className="text-xs text-muted-foreground text-center pt-2">
                                                +{totalMembers - 10} more members
                                            </p>
                                        )}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <p className="text-sm text-muted-foreground">No members yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Messages - Only show if there are messages for this team */}
                {teamMessages.length > 0 && teamMessages.some(msg => msg.teamId === openTeam?.id || msg.teamId === teamId) && (
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>Recent Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {recentMessages.map((message: DtoMessageDTO, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(message.sender?.firstname || message.sender?.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">
                                                    {message.sender?.firstname || message.sender?.username || "Unknown"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTime(message.sentAt ? Date.parse(message.sentAt) : undefined)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground ml-8 line-clamp-2">
                                                {message.textContent}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Files - Only show if there are files */}
                {recentFiles.length > 0 && (
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>Recent Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    {recentFiles.map((file) => (
                                        <div key={file.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                                            <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {file.name}
                                                    {file.extension && `.${file.extension}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatTime(file.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
            </div>
                );
            })()}
        </div>
    );
}
