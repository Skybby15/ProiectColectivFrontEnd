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

export function AddFileDialog({uploadFileToTeam} : {uploadFileToTeam?: (file: File) => Promise<void>}) {
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false)

  const handleUpload = () => {
    if (!file) return
    
    if (uploadFileToTeam) {
      uploadFileToTeam(file) //TODO: bind to backend
    }

    setLoading(true)
    setTimeout(()=>{
      setLoading(false)    
      toast.success("File uploaded successfully")
    }, 2000) // TODO remove 
    setFile(null)
  }

  const handleDropFile = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) 
      setFile(file)
    else
      toast.error("No file detected in drop event!\n Perhaps try again?")

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
              <p>Chosen file: {file?.name}</p>
              <p>Size: {formatFileSize(file?.size)} </p>
            </div>
          }
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!file}
            onClick={handleUpload}
          >
            Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
