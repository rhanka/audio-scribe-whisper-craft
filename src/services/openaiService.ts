
import { WhisperModel } from "@/components/TranscriptionSettings";

interface TranscriptionResponse {
  text: string;
}

// Taille maximale en octets pour l'API OpenAI (25 MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (un peu moins que la limite de 26214400)

/**
 * Fractionne un blob audio en morceaux plus petits
 */
async function splitAudioFile(file: File): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error("Échec de la lecture du fichier");
        }
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(event.target.result as ArrayBuffer);
        
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // Calculer la durée maximale pour rester sous la limite de taille
        // En estimant grossièrement 16 bits par échantillon * sampleRate * nombre de canaux
        const bytesPerSecond = 2 * sampleRate * numberOfChannels;
        const maxDuration = MAX_FILE_SIZE / bytesPerSecond;
        
        // Si le fichier est déjà assez petit, pas besoin de le fractionner
        if (duration <= maxDuration) {
          resolve([file]);
          return;
        }
        
        const chunks: Blob[] = [];
        const numChunks = Math.ceil(duration / maxDuration);
        
        for (let i = 0; i < numChunks; i++) {
          const startTime = i * maxDuration;
          const endTime = Math.min((i + 1) * maxDuration, duration);
          const chunkDuration = endTime - startTime;
          
          // Créer un nouveau buffer pour le morceau
          const chunkBuffer = audioContext.createBuffer(
            numberOfChannels,
            Math.ceil(chunkDuration * sampleRate),
            sampleRate
          );
          
          // Copier les données audio dans le nouveau buffer
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            const chunkChannelData = chunkBuffer.getChannelData(channel);
            
            const startIndex = Math.floor(startTime * sampleRate);
            const endIndex = Math.floor(endTime * sampleRate);
            
            for (let j = 0; j < (endIndex - startIndex); j++) {
              chunkChannelData[j] = channelData[startIndex + j];
            }
          }
          
          // Convertir le buffer en blob
          const offlineContext = new OfflineAudioContext(
            numberOfChannels,
            chunkBuffer.length,
            sampleRate
          );
          
          const source = offlineContext.createBufferSource();
          source.buffer = chunkBuffer;
          source.connect(offlineContext.destination);
          source.start(0);
          
          const renderedBuffer = await offlineContext.startRendering();
          
          // Convertir le buffer rendu en WAV
          const wavBlob = await audioBufferToWav(renderedBuffer);
          chunks.push(wavBlob);
        }
        
        resolve(chunks);
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error("Échec de la lecture du fichier audio"));
    };
    
    fileReader.readAsArrayBuffer(file);
  });
}

/**
 * Convertit un AudioBuffer en fichier WAV (Blob)
 */
function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  return new Promise((resolve) => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numberOfChannels * 2;
    const dataView = new DataView(new ArrayBuffer(44 + length));
    
    // Écrire l'en-tête WAV
    writeString(dataView, 0, 'RIFF');
    dataView.setUint32(4, 36 + length, true);
    writeString(dataView, 8, 'WAVE');
    writeString(dataView, 12, 'fmt ');
    dataView.setUint32(16, 16, true);
    dataView.setUint16(20, 1, true); // PCM format
    dataView.setUint16(22, numberOfChannels, true);
    dataView.setUint32(24, sampleRate, true);
    dataView.setUint32(28, sampleRate * numberOfChannels * 2, true); // Débit d'octets
    dataView.setUint16(32, numberOfChannels * 2, true); // Bloc d'alignement
    dataView.setUint16(34, 16, true); // Bits par échantillon
    writeString(dataView, 36, 'data');
    dataView.setUint32(40, length, true);
    
    // Écrire les données audio
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        const sample16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        dataView.setInt16(offset, sample16, true);
        offset += 2;
      }
    }
    
    const wavBlob = new Blob([dataView], { type: 'audio/wav' });
    resolve(wavBlob);
  });
}

/**
 * Écrire une chaîne de caractères dans un DataView
 */
function writeString(dataView: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    dataView.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Transcrit un fichier audio à l'aide de l'API OpenAI Whisper
 */
export async function transcribeAudio(
  file: File,
  apiKey: string,
  model: WhisperModel,
  onProgress?: (progress: number, message: string) => void
): Promise<string> {
  if (!apiKey) {
    throw new Error("Clé API OpenAI manquante");
  }

  try {
    // Vérifier si le fichier dépasse la taille maximale
    if (file.size > MAX_FILE_SIZE) {
      onProgress?.(0, `Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(2)} MB). Découpage en cours...`);
      
      // Fractionner le fichier en morceaux plus petits
      const chunks = await splitAudioFile(file);
      onProgress?.(10, `Fichier découpé en ${chunks.length} parties. Début de la transcription...`);
      
      // Transcrire chaque morceau et combiner les résultats
      let completeTranscription = "";
      
      for (let i = 0; i < chunks.length; i++) {
        onProgress?.(
          10 + Math.floor((i / chunks.length) * 80),
          `Transcription de la partie ${i + 1}/${chunks.length}...`
        );
        
        const formData = new FormData();
        formData.append("file", chunks[i], `chunk-${i + 1}.wav`);
        formData.append("model", model);
        formData.append("response_format", "json");
        formData.append("language", "fr");
        
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
        completeTranscription += (completeTranscription ? " " : "") + data.text;
      }
      
      onProgress?.(100, "Transcription terminée !");
      return completeTranscription;
    } else {
      // Traitement normal pour les fichiers sous la limite de taille
      onProgress?.(0, "Préparation de la transcription...");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", model);
      formData.append("response_format", "json");
      formData.append("language", "fr");
      
      onProgress?.(20, "Envoi du fichier à l'API OpenAI...");
      
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
      
      onProgress?.(90, "Traitement de la réponse...");
      
      const data = await response.json() as TranscriptionResponse;
      
      onProgress?.(100, "Transcription terminée !");
      return data.text;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Échec de la transcription: ${error.message}`);
    }
    throw new Error("Une erreur inconnue s'est produite lors de la transcription");
  }
}
