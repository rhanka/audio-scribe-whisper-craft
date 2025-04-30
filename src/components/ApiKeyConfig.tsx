
import { useState, useEffect } from "react";
import { Key, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ApiKeyConfigProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isLoading: boolean;
}

export function ApiKeyConfig({ apiKey, setApiKey, isLoading }: ApiKeyConfigProps) {
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
        <CardTitle>Configuration de l'API OpenAI</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
