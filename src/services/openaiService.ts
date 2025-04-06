
import { WhisperModel } from "@/components/TranscriptionSettings";

interface TranscriptionResponse {
  text: string;
}

export async function transcribeAudio(
  file: File,
  apiKey: string,
  model: WhisperModel
): Promise<string> {
  if (!apiKey) {
    throw new Error("Clé API OpenAI manquante");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", model);
  formData.append("response_format", "json");
  formData.append("language", "fr");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API (${response.status}): ${errorText}`);
    }

    const data = await response.json() as TranscriptionResponse;
    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Échec de la transcription: ${error.message}`);
    }
    throw new Error("Une erreur inconnue s'est produite lors de la transcription");
  }
}
