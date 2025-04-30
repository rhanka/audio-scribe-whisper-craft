
import { Volume } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TTSVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
export type TTSModel = "tts-1" | "tts-1-hd";

interface TextToSpeechSettingsProps {
  selectedVoice: TTSVoice;
  setSelectedVoice: (voice: TTSVoice) => void;
  selectedModel: TTSModel;
  setSelectedModel: (model: TTSModel) => void;
  isLoading: boolean;
}

export function TextToSpeechSettings({
  selectedVoice,
  setSelectedVoice,
  selectedModel,
  setSelectedModel,
  isLoading
}: TextToSpeechSettingsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Paramètres de synthèse vocale</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume size={16} /> Voix
            </Label>
            <RadioGroup 
              value={selectedVoice} 
              onValueChange={(value) => setSelectedVoice(value as TTSVoice)}
              className="flex flex-col space-y-1"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alloy" id="voice-alloy" />
                <Label htmlFor="voice-alloy">Alloy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="echo" id="voice-echo" />
                <Label htmlFor="voice-echo">Echo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fable" id="voice-fable" />
                <Label htmlFor="voice-fable">Fable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="onyx" id="voice-onyx" />
                <Label htmlFor="voice-onyx">Onyx</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nova" id="voice-nova" />
                <Label htmlFor="voice-nova">Nova</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shimmer" id="voice-shimmer" />
                <Label htmlFor="voice-shimmer">Shimmer</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume size={16} /> Modèle
            </Label>
            <RadioGroup 
              value={selectedModel} 
              onValueChange={(value) => setSelectedModel(value as TTSModel)}
              className="flex flex-col space-y-1"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tts-1" id="model-tts-1" />
                <Label htmlFor="model-tts-1">Standard (tts-1)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tts-1-hd" id="model-tts-1-hd" />
                <Label htmlFor="model-tts-1-hd">Haute Définition (tts-1-hd)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
