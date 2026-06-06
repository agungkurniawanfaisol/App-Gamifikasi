"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { submitContentAnswer } from "@/actions/student/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { labels } from "@/lib/labels";
import { notifySubmitRewards } from "@/lib/proficiency-toast";
import type { SubmitAnswerHandler } from "@/lib/submit-answer";
import { scoreSpeechMatch } from "@/lib/speech-score";
import { SPEECH_PASS_THRESHOLD } from "@/lib/content-item";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "sonner";

export function SpeakingStepClient({
  contentItemId,
  questionText,
  expectedSpeech,
  subQuestionIndex = 0,
  onAnswered,
  submitAnswer,
}: {
  contentItemId: number;
  questionText: string;
  expectedSpeech: string;
  subQuestionIndex?: number;
  onAnswered: (correct: boolean) => void;
  submitAnswer?: SubmitAnswerHandler;
}) {
  const router = useRouter();
  const [typedAnswer, setTypedAnswer] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedText, setSubmittedText] = useState("");
  const submittedRef = useRef(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const phraseToMatch = expectedSpeech.trim() || "your answer";

  async function finish(transcriptText: string) {
    if (submittedRef.current || !transcriptText.trim()) return;
    submittedRef.current = true;

    const speechResult = scoreSpeechMatch(expectedSpeech, transcriptText);
    setScore(speechResult.percent);
    setSubmittedText(transcriptText);
    const passed = speechResult.percent >= SPEECH_PASS_THRESHOLD;
    setSubmitting(true);

    try {
      const answerResult = submitAnswer
        ? await submitAnswer(transcriptText, speechResult.percent)
        : await submitContentAnswer(
            contentItemId,
            transcriptText,
            speechResult.percent,
            subQuestionIndex
          );
      if (!submitAnswer) {
        notifySubmitRewards(answerResult, () => router.refresh());
      }
      onAnswered(passed);
    } catch (error) {
      submittedRef.current = false;
      setScore(null);
      setSubmittedText("");
      toast.error(
        error instanceof Error ? error.message : labels.student.answerSaveFailed
      );
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!listening && transcript.trim() && !submittedRef.current) {
      void finish(transcript.trim());
    }
  }, [listening, transcript]);

  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  function startListening() {
    if (submitting || score !== null) return;
    submittedRef.current = false;
    resetTranscript();
    setScore(null);
    setSubmittedText("");
    SpeechRecognition.startListening({
      continuous: false,
      language: "en-US",
    });
  }

  function stopListening() {
    SpeechRecognition.stopListening();
  }

  async function submitTyped() {
    const text = typedAnswer.trim();
    if (!text) return;
    resetTranscript();
    await finish(text);
  }

  function renderScore() {
    if (score === null) return null;

    return (
      <div
        className={cn(
          "animate-scale-in flex items-center gap-3 rounded-xl border p-4",
          score >= SPEECH_PASS_THRESHOLD
            ? "border-success/30 bg-success/5"
            : "border-destructive/30 bg-destructive/5"
        )}
      >
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold",
            score >= SPEECH_PASS_THRESHOLD
              ? "bg-success/20 text-success"
              : "bg-destructive/20 text-destructive"
          )}
        >
          {score}%
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-semibold",
              score >= SPEECH_PASS_THRESHOLD
                ? "text-success"
                : "text-destructive"
            )}
          >
            {score >= SPEECH_PASS_THRESHOLD
              ? labels.student.speechPass
              : labels.student.speechRetry}
          </p>
          <p className="text-xs text-muted-foreground">
            {labels.student.speechScore(score)}
          </p>
        </div>
      </div>
    );
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg font-medium leading-relaxed">{questionText}</p>
        <p className="text-sm text-muted-foreground">
          {labels.student.speechNotSupported}
        </p>

        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.student.speechTypeFallback}
          </p>
          <p className="text-base font-medium text-primary">
            <Volume2 className="mr-2 inline size-4" />
            &ldquo;{phraseToMatch}&rdquo;
          </p>
        </div>

        <Input
          value={typedAnswer}
          onChange={(e) => setTypedAnswer(e.target.value)}
          placeholder={labels.student.speechTypePlaceholder}
          disabled={submitting || score !== null}
        />

        <Button
          type="button"
          onClick={submitTyped}
          disabled={!typedAnswer.trim() || submitting || score !== null}
        >
          {labels.student.speechSubmitTyped}
        </Button>

        {submittedText && (
          <div className="animate-slide-up rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">You typed:</p>
            <p className="text-sm font-medium italic">
              &ldquo;{submittedText}&rdquo;
            </p>
          </div>
        )}

        {renderScore()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium leading-relaxed">{questionText}</p>

      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {labels.student.speechSayPhrase}
        </p>
        <p className="text-base font-medium text-primary">
          <Volume2 className="mr-2 inline size-4" />
          &ldquo;{phraseToMatch}&rdquo;
        </p>
      </div>

      <div className="flex justify-center py-4">
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          disabled={submitting || score !== null}
          className={cn(
            "flex size-20 items-center justify-center rounded-full transition-all duration-300",
            listening
              ? "animate-pulse-soft bg-destructive shadow-lg shadow-destructive/30"
              : "bg-primary shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-xl hover:shadow-primary/40",
            score !== null && "pointer-events-none opacity-50"
          )}
        >
          {listening ? (
            <MicOff className="size-8 text-destructive-foreground" />
          ) : (
            <Mic className="size-8 text-primary-foreground" />
          )}
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {listening
          ? labels.student.speechListening
          : labels.student.speechTapMic}
      </p>

      {(transcript || submittedText) && (
        <div className="animate-slide-up rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">
            {labels.student.speechYouSaid}
          </p>
          <p className="text-sm font-medium italic">
            &ldquo;{submittedText || transcript}&rdquo;
          </p>
        </div>
      )}

      {renderScore()}
    </div>
  );
}
