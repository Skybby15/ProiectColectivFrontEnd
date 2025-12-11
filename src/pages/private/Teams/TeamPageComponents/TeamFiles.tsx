import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download } from "lucide-react";
import { AddFileDialog } from "./FilePageComponents/AddFileDialog";


export function TeamFiles({teamId} : {teamId : string}) {

    const files = 
    [


        {id: 1, name: "ProjectPlan.pdf", size: "2 MB", uploadedBy: "Alice", uploadDate: "2024-01-15"},
        {id: 2, name: "DesignMockup.png", size: "1.5 MB", uploadedBy: "Bob", uploadDate: "2024-01-16"},
        {id: 3, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 4, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 5, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 6, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 7, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 8, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 9, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 10, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 11, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 12, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 13, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 14, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 15, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 16, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 17, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 18, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 19, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 20, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
        {id: 21, name: "MeetingNotes.docx", size: "500 KB", uploadedBy: "Charlie", uploadDate: "2024-01-17"},
    

    ]


    return (
    <div className=" flex-1 pl-6 pt-6 pr-6 overflow-hidden">
        <div className="flex h-fit items-center justify-between ">
            <h2 className="text-2xl font-semibold">Team Files</h2>
            <AddFileDialog/>
        </div>
        <div className=" h-18/20 w-full grid grid-cols-1 lg:grid-cols-3 gap-y-0 space-y-0">
            {files.map((file) => (
                <div key={file.id} className="border-32 border-transparent">
                    <Card
                        className="h-fit w-full min-w-fit flex flex-col justify-between shrink-0"
                    >
                        <CardHeader className="flex flex-row items-center w-full shrink-0 ">
                            <h3 className="text-lg font-semibold shrink-0">{file.name}</h3>
                        </CardHeader>
                        <CardContent className="flex flex-row justify-between">
                            <div className="flex flex-col">
                                <p className="text-sm text-gray-500 w-max">{file.size}</p>
                                <p className="text-sm text-gray-500">Uploaded by: {file.uploadedBy}</p>
                                <p className="text-sm text-gray-500">Upload date: {file.uploadDate}</p>
                            </div>
                        <Button variant={"ghost"} className="h-12 w-12">
                                <Download className="h-8! w-8! shrink-0"/>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    </div>
    );


}
