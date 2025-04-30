
import { RefreshCw } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type WhisperModel = "whisper-1" | "gpt-4o-mini-transcribe" | "gpt-4o-transcribe";

interface TranscriptionSettingsProps {
  selectedModel: WhisperModel;
  setSelectedModel: (model: WhisperModel) => void;
  isLoading: boolean;
}

export function TranscriptionSettings({
  selectedModel,
  setSelectedModel,
  isLoading
}: TranscriptionSettingsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Paramètres de transcription</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
