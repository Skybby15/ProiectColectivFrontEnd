import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download } from "lucide-react";
import { AddFileDialog } from "./FilePageComponents/AddFileDialog";
import { useInView } from "react-intersection-observer";
import { useTeamStore } from "@/services/stores/useTeamStore";
import { useGetTeamFiles } from "@/services/react-query/teams";

export function TeamFiles({ teamId }: { teamId: string }) {
    const { teamFiles,openTeam } = useTeamStore();
    const { mutateAsync: getTeamFiles } = useGetTeamFiles();

    const PAGE_SIZE = 20; // Number of files to load per batch
    const [files, setFiles] = useState(teamFiles.slice(0, PAGE_SIZE));
    const [page, setPage] = useState(1);
    const { ref, inView } = useInView();

    useEffect(() => {
        if(teamFiles.length == 0)
            getTeamFiles({
                teamId: openTeam?.id!,
                page: page,
                limit: PAGE_SIZE
            });
    },[])

    useEffect(() => {
        if (inView) {
        const nextPage = page + 1;
        const nextFiles = teamFiles.slice(0, nextPage * PAGE_SIZE);
        if (nextFiles.length > files.length) {
            setFiles(nextFiles);
            setPage(nextPage);
        }
        }
    }, [inView]);

    return (
        <div className="flex-1 pl-6 pt-6 pr-6 overflow-auto">
        <div className="flex h-fit items-center justify-between mb-10">
            <h2 className="text-2xl font-semibold">Team Files</h2>
            <AddFileDialog />
        </div>

        <div className="h-18/20 w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            {files.map((file) => (
            <Card key={file.id} className="h-fit w-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center w-full">
                <h3 className="text-lg font-semibold">{file.name}</h3>
                </CardHeader>
                <CardContent className="flex flex-row justify-between">
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500">{file.size}</p>
                    <p className="text-sm text-gray-500">Uploaded by: {file.ownerId}</p>
                    <p className="text-sm text-gray-500">Upload date: {file.createdAt}</p>
                </div>
                <Button variant={"ghost"} className="h-12 w-12">
                    <Download className="h-8 w-8" />
                </Button>
                </CardContent>
            </Card>
            ))}

            {/* This div triggers loading next page */}
            <div ref={ref} className="h-6 w-full" />
        </div>
        </div>
    );
}
