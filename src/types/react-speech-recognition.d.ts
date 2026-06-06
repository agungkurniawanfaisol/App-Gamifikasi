declare module "react-speech-recognition" {
  export type SpeechRecognitionOptions = {
    continuous?: boolean;
    language?: string;
    interimResults?: boolean;
  };

  export function useSpeechRecognition(): {
    transcript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
  };

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
  };

  export default SpeechRecognition;
}
