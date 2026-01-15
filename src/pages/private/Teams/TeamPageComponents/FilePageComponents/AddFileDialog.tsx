import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { FolderPlus} from "lucide-react"
import { useState } from "react"
import type { ChangeEvent, DragEvent } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAddTeamFile } from "@/services/react-query/teams"
import { useTeamStore } from "@/services/stores/useTeamStore"
import { useAuthStore } from "@/services/stores/useAuthStore"


const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

const ALLOWED_TYPES = [
  // Images
  "image/png",
  "image/jpeg",

  // Text / data
  "text/plain",
  "application/json",
  "text/csv",
  "text/markdown",

  // PDF
  "application/pdf",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
]

export function AddFileDialog() {
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { mutateAsync: addTeamFile } = useAddTeamFile();
  const { openTeam } = useTeamStore();
  const { user } = useAuthStore();

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)

    function arrayBufferToBase64(buffer: ArrayBuffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000; // 32 KB chunks
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      return btoa(binary);
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);

      await addTeamFile({
        teamId: openTeam?.id!,
        request: {
          content: base64,
          contextId: openTeam?.id!,
          contextType: "team",
          extension: file.name.split(".").pop() || "",
          name: file.name,
          ownerId: user?.id!,
          size: file.size,
          type: file.type,
        },
      })

      toast.success("File uploaded successfully")
      setFile(null)
    } catch (error) {
      toast.error("Failed to upload file: \n " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setLoading(false)
    }
  }

  const isTypeAllowed = (file: File) => {
    // 1. Known safe MIME types
    if (file.type && ALLOWED_TYPES.includes(file.type)) {
      return true
    }

    // 2. Plain text (even if browser didn't detect extension)
    if (file.type === "text/plain" || file.type === "") {
      return true
    }

    return false;
  }

  const handleDropFile = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
    if (!file)
      toast.error("No file detected in drop event!\n Perhaps try again?")



    if (!isTypeAllowed(file)) {
      toast.error("Unsupported file type")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large")
      return
    }

    setFile(file)
  }
  
  const handleCancel = () => {
    setFile(null)
  }

  const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  function formatFileSize(size: number) {
    if (size < 1024) return `${size} bytes`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline"
          disabled={loading}
        >
          {loading ? 
            <Spinner/> 
            : 
            <>
              Upload file
              <FolderPlus/>  
            </>
          }
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upload a new file</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a file from your device to upload to the team files.
            <br />
            Only one file can be uploaded at a time
            <br />
            Maximum file size: 20 MB
          </AlertDialogDescription>
        </AlertDialogHeader>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDropFile}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
              "cursor-pointer",
              "hover:border-primary hover:bg-primary/10",
              isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/30"
            )}
            onClick={() => document.getElementById("hidden-file-input")?.click()}
          >
            <input
              id="hidden-file-input"
              type="file"
              className="hidden"
              accept=".png,.jpg,.jpeg,.txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.json,.csv,.md"
              onChange={handleChooseFile}
            />

            <p className="text-sm text-muted-foreground">
              Drag & drop your file here  
              <br />
              <span className="text-primary font-medium">or click to browse</span>
            </p>
          </div>
          {file &&
            <div>
              <p>Chosen file: {file.name}</p>
              <p
                className={cn(
                  "text-sm",
                  file?.size > MAX_FILE_SIZE ? "text-red-500 font-medium" : "text-muted-foreground"
                )}
              >
                Size: {formatFileSize(file.size)}
              </p>
              {file?.size > MAX_FILE_SIZE && (
                <p className="text-xs text-red-500">
                  File exceeds 20 MB limit
                </p>
              )}
            </div>
          }
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!file || file?.size > MAX_FILE_SIZE}
            onClick={handleUpload}
          >
            Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
