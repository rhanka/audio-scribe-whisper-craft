
import { useState, useRef } from "react";
import { ApiKeyConfig } from "@/components/ApiKeyConfig";
import { TextToSpeechSettings, TTSVoice, TTSModel } from "@/components/TextToSpeechSettings";
import { generateSpeech } from "@/services/openAIService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Headphones, Volume } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const TextToSpeech = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>("alloy");
  const [selectedModel, setSelectedModel] = useState<TTSModel>("tts-1");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleGenerateSpeech = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Texte manquant",
        description: "Veuillez entrer du texte à convertir en audio",
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
    
    setIsGenerating(true);
    setProgress(0);
    setProgressMessage("Préparation...");
    
    // Libérer l'URL précédente si elle existe
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    try {
      const audioBlob = await generateSpeech(
        inputText, 
        apiKey, 
        selectedVoice, 
        selectedModel,
        (progress, message) => {
          setProgress(progress);
          setProgressMessage(message);
        }
      );
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      toast({
        title: "Génération réussie!",
        description: "L'audio a été généré avec succès",
      });
      
      // Lecture automatique de l'audio
      if (audioRef.current) {
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Synthèse Vocale</h1>
          <p className="text-muted-foreground">
            Convertissez du texte en audio avec l'API OpenAI
          </p>
        </header>
        
        <div className="space-y-6">
          <ApiKeyConfig 
            apiKey={apiKey}
            setApiKey={setApiKey}
            isLoading={isGenerating}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Texte à convertir</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Entrez votre texte ici..."
                className="min-h-32"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isGenerating}
              />
            </CardContent>
          </Card>
          
          <TextToSpeechSettings
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            isLoading={isGenerating}
          />
          
          <Button 
            className="w-full py-6 text-lg font-medium"
            onClick={handleGenerateSpeech}
            disabled={isGenerating || !apiKey || !inputText.trim()}
          >
            {isGenerating ? (
              <>
                <Volume className="mr-2 h-5 w-5 animate-pulse" />
                Génération en cours...
              </>
            ) : (
              <>
                <Volume className="mr-2 h-5 w-5" />
                Générer l'audio
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-sm text-center text-muted-foreground">{progressMessage}</p>
            </div>
          )}
          
          {audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Audio généré</CardTitle>
              </CardHeader>
              <CardContent>
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  controls 
                  className="w-full"
                />
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = audioUrl;
                      a.download = `audio-${new Date().toISOString()}.mp3`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Télécharger l'audio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            AudioScribe utilise l'API Text-to-Speech d'OpenAI.
            <br />
            Votre clé API est stockée uniquement dans votre navigateur.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TextToSpeech;
