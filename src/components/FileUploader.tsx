
import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileVideo, FileAudio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  fileType: "audio" | "video";
}

export function FileUploader({ onFileSelect, isLoading, fileType }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = fileType === "audio" ? "audio/mpeg,audio/mp3" : "video/mp4";
  const FileIcon = fileType === "audio" ? FileAudio : FileVideo;
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isCorrectType = fileType === "audio" 
        ? file.type === "audio/mpeg" || file.type === "audio/mp3" 
        : file.type === "video/mp4";
      
      if (isCorrectType) {
        processFile(file);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            className={cn(
              "file-drop-area flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6",
              isDragging ? "border-primary bg-primary/5" : "border-muted"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileIcon size={48} className="text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Déposez votre fichier {fileType === "audio" ? "audio" : "vidéo"} ici
            </h3>
            <p className="text-muted-foreground mb-4">
              Format supporté: {fileType === "audio" ? "MP3" : "MP4"}
            </p>
            <Button 
              onClick={handleBrowseClick} 
              className="mt-2"
              disabled={isLoading}
            >
              Parcourir les fichiers
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={acceptedTypes}
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted rounded-md">
            <div className="flex items-center">
              <FileIcon className="text-primary mr-4" size={24} />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isLoading && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRemoveFile}
              >
                <X size={18} />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
