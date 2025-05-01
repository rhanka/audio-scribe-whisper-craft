
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Merge } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AudioVideoMerge = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleMerge = () => {
    if (!videoFile || !audioFile) {
      toast({
        title: "Fichiers manquants",
        description: "Veuillez sélectionner à la fois une vidéo et un fichier audio.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Here we would normally process the files
    // For demonstration purposes, we'll simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Fusion terminée",
        description: "Votre vidéo avec le nouvel audio est prête à être téléchargée.",
      });
      // In a real implementation, we would provide a download link here
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Fusion Audio-Vidéo</h1>
        <p className="text-muted-foreground mb-8">
          Fusionnez un fichier vidéo (MP4) avec un fichier audio (MP3) pour remplacer la piste audio d'origine.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Vidéo (MP4)</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onFileSelect={setVideoFile} 
                isLoading={isProcessing}
                fileType="video"
              />
            </CardContent>
            <CardFooter>
              {videoFile && (
                <p className="text-sm text-muted-foreground">
                  {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audio (MP3)</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onFileSelect={setAudioFile} 
                isLoading={isProcessing}
                fileType="audio"
              />
            </CardContent>
            <CardFooter>
              {audioFile && (
                <p className="text-sm text-muted-foreground">
                  {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleMerge} 
            disabled={!videoFile || !audioFile || isProcessing}
            className="px-8"
            size="lg"
          >
            <Merge className="mr-2" />
            Fusionner
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioVideoMerge;
