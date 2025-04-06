
import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TranscriptionResultProps {
  transcription: string | null;
  isLoading: boolean;
  fileName: string | null;
}

export function TranscriptionResult({ 
  transcription, 
  isLoading, 
  fileName 
}: TranscriptionResultProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!transcription) return;
    
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    toast({
      title: "Copié!",
      description: "Transcription copiée dans le presse-papier",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (!transcription || !fileName) return;
    
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    
    // Remove extension from fileName and add .txt
    const baseName = fileName.split(".").slice(0, -1).join(".");
    element.download = `${baseName || "transcription"}.txt`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Téléchargé!",
      description: "Transcription téléchargée en format texte",
    });
  };

  if (!isLoading && !transcription) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Résultat de la transcription</CardTitle>
        {transcription && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              {copied ? (
                <Check size={16} className="mr-2" />
              ) : (
                <Copy size={16} className="mr-2" />
              )}
              Copier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8"
            >
              <Download size={16} className="mr-2" />
              Télécharger
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
            <TabsTrigger value="raw">Texte brut</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="min-h-[200px]">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[92%]" />
              </div>
            ) : (
              <div className="transcription-text rounded-md p-4 bg-muted/50">
                {transcription}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="raw" className="min-h-[200px]">
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <pre className="whitespace-pre-wrap overflow-auto p-4 bg-muted/50 rounded-md text-sm font-mono">
                {transcription}
              </pre>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
