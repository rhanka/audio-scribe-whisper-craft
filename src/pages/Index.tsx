
import { useState } from "react";
import { AudioUploader } from "@/components/AudioUploader";
import { TranscriptionSettings, WhisperModel } from "@/components/TranscriptionSettings";
import { TranscriptionResult } from "@/components/TranscriptionResult";
import { transcribeAudio } from "@/services/openaiService";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<WhisperModel>("whisper-1");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setTranscription(null);
  };
  
  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez sélectionner un fichier audio à transcrire",
        variant: "destructive",
      });
      return;
    }
    
    if (!apiKey) {
      toast({
        title: "Clé API manquante",
        description: "Veuillez entrer votre clé API OpenAI dans les paramètres",
        variant: "destructive",
      });
      return;
    }
    
    setIsTranscribing(true);
    
    try {
      const result = await transcribeAudio(selectedFile, apiKey, selectedModel);
      setTranscription(result);
      toast({
        title: "Transcription réussie!",
        description: `${selectedFile.name} a été transcrit avec succès`,
      });
    } catch (error) {
      console.error("Error transcribing:", error);
      toast({
        title: "Erreur de transcription",
        description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">AudioScribe</h1>
          <p className="text-muted-foreground">
            Transcrivez vos fichiers audio en texte avec l'API Whisper d'OpenAI
          </p>
        </header>
        
        <div className="space-y-6">
          <AudioUploader 
            onFileSelect={handleFileSelect} 
            isLoading={isTranscribing}
          />
          
          <TranscriptionSettings 
            apiKey={apiKey}
            setApiKey={setApiKey}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            isLoading={isTranscribing}
          />
          
          {selectedFile && (
            <Button 
              className="w-full py-6 text-lg font-medium"
              onClick={handleTranscribe}
              disabled={isTranscribing || !apiKey}
            >
              <Headphones className="mr-2 h-5 w-5" />
              {isTranscribing ? "Transcription en cours..." : "Transcrire l'audio"}
            </Button>
          )}
          
          <TranscriptionResult 
            transcription={transcription} 
            isLoading={isTranscribing}
            fileName={selectedFile?.name || null}
          />
        </div>
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            AudioScribe utilise l'API Whisper d'OpenAI pour la transcription audio.
            <br />
            Votre clé API est stockée uniquement dans votre navigateur.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
