import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download } from "lucide-react";
import { AddFileDialog } from "./FilePageComponents/AddFileDialog";
import { useInView } from "react-intersection-observer";
import { useTeamStore } from "@/services/stores/useTeamStore";
import { useGetTeamFiles, useGetFile } from "@/services/react-query/teams";
import { Spinner } from "@/components/ui/spinner";

export function TeamFiles({ teamId }: { teamId: string }) {
    console.log(teamId)
    const { teamFiles,openTeam, getTeamMemberWithId } = useTeamStore();
    const { mutateAsync: getTeamFiles } = useGetTeamFiles();
    const { mutate: getFile } = useGetFile();

    const PAGE_SIZE = 20; // Number of files to load per batch
    const [files, setFiles] = useState(teamFiles);
    const [page, setPage] = useState(1);
    const { ref, inView } = useInView();
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

    useEffect(() => {
        if(teamFiles.length == 0)
        {
            setIsLoading(true);
            getTeamFiles({
                teamId: openTeam?.id!,
                page: page,
                limit: PAGE_SIZE
            }).then(() => {
                setIsLoading(false);
            });
        }
    },[])

    useEffect(() => {
        if (inView) {
            getTeamFiles({
                teamId: openTeam?.id!,
                page: page + 1,
                limit: PAGE_SIZE
            });
            setPage(p => p + 1);
        }
    }, [inView]);

    useEffect(() => {
        setFiles(teamFiles.slice(0, PAGE_SIZE));
    }, [teamFiles]);

    function formatFileSize(size: number) {
        if (size < 1024) return `${size} bytes`
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }

    function formatDate(value: number) {
        const date = new Date(value * 1000);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    const handleDownloadFile = (fileId: string) => {
        setDownloadingFileId(fileId);

        getFile(
            { teamId: openTeam?.id!, fileId },
            {
            onSettled: () => setDownloadingFileId(null),
            }
        );
    };

    return (
        <div className="flex-1 pl-6 pt-6 pr-6 overflow-auto">
        <div className="flex h-fit items-center justify-between mb-10">
            <h2 className="text-2xl font-semibold">Team Files</h2>
            <AddFileDialog />
        </div>

        <div className="h-18/20 w-full grid grid-cols-1 xl:grid-cols-3 gap-x-10 gap-y-0">
            {isLoading &&
                <div>Loading files...</div>
            }
            {!isLoading && files.map((file) => (
            <Card key={file.id} className="h-fit w-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between w-full">
                <h3 className="text-lg font-semibold">{file.name}</h3>
                <Button className="h-12 w-12"
                    disabled={downloadingFileId !== null}
                    variant={"ghost"}
                    onClick={() => handleDownloadFile(file.id!)}    
                >
                    {
                        downloadingFileId !== file.id && <Download className="h-6! w-6!" />
                    }
                    {
                        downloadingFileId === file.id && <Spinner className="h-5! w-5!"/>
                    }
                </Button>
                </CardHeader>
                <CardContent className="flex flex-row justify-between">
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500">{formatFileSize(file.size!)}</p>
                    <p className="text-sm text-gray-500">Uploaded by: {getTeamMemberWithId(file.ownerId!)?.username}</p>
                    <p className="text-sm text-gray-500">Upload date: {formatDate(file.createdAt!)}</p>
                    
                </div>
                </CardContent>
            </Card>
            ))}

            {/* This div triggers loading next page */}
            <div ref={ref} className="h-6 w-full" />
        </div>
        </div>
    );
}
