
import { useState, useEffect } from "react";
import { Save, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export type WhisperModel = "whisper-1" | "gpt-4o-mini-transcribe" | "gpt-4o-transcribe";

interface TranscriptionSettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: WhisperModel;
  setSelectedModel: (model: WhisperModel) => void;
  isLoading: boolean;
}

export function TranscriptionSettings({
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  isLoading
}: TranscriptionSettingsProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedApiKey = localStorage.getItem("openai-api-key");
    if (savedApiKey) {
      setTempApiKey(savedApiKey);
      setApiKey(savedApiKey);
    }
  }, [setApiKey]);

  const handleSaveApiKey = () => {
    if (tempApiKey.trim() === "") {
      toast({
        title: "Erreur",
        description: "La clé API ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("openai-api-key", tempApiKey);
    setApiKey(tempApiKey);
    setIsEditing(false);
    
    toast({
      title: "Clé API sauvegardée",
      description: "Votre clé API a été enregistrée dans le stockage local",
    });
  };

  const handleReveal = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Paramètres de transcription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key size={16} /> Clé API OpenAI
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={isEditing ? "text" : "password"}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                variant="outline" 
                onClick={handleReveal}
                disabled={isLoading}
              >
                {isEditing ? "Masquer" : "Révéler"}
              </Button>
              <Button 
                onClick={handleSaveApiKey}
                disabled={isLoading}
              >
                <Save size={16} className="mr-2" /> Sauvegarder
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RefreshCw size={16} /> Modèle Whisper
            </Label>
            <RadioGroup 
              value={selectedModel} 
              onValueChange={(value) => setSelectedModel(value as WhisperModel)}
              className="flex flex-col space-y-1"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whisper-1" id="whisper-standard" />
                <Label htmlFor="whisper-standard">
                  Standard (whisper-1)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gpt-4o-mini-transcribe" id="gpt-4o-mini" />
                <Label htmlFor="gpt-4o-mini">
                  Mini (gpt-4o-mini-transcribe)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gpt-4o-transcribe" id="gpt-4o" />
                <Label htmlFor="gpt-4o">
                  Standard (gpt-4o-transcribe)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
