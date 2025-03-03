"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { Camera, CameraOff, Loader2, Mic, StopCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { processAnswer } from "../action";
import { useToast } from "@/hooks/use-toast";
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof webkitSpeechRecognition;
  }
}

interface Question {
  question: string;
  answer: string;
}

interface InterviewData {
  mockId: string;
}

interface AnswerRecord {
  mockIdRef: string;
  question: string;
  activeQuestionIndex: string;
  userAns: string;
  userId: string;
}

interface RecordAnswerSectionProps {
  mockInterviewQuestion: Question[];
  activeQuestionIndex: number;
  interviewData: InterviewData;
  onAnswerSave?: (answer: AnswerRecord) => void;
  mockIdRef: string;
}

const RecordAnswerSection: React.FC<RecordAnswerSectionProps> = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onAnswerSave,
  mockIdRef,
}) => {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const { userId } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        const recognition = recognitionRef.current;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }
          if (finalTranscript.trim()) {
            setUserAnswer((prev) => (prev + " " + finalTranscript).trim());
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const errorMessage = event.error || "Unknown error";
          console.error("Speech recognition error:", errorMessage, event);
          toast({
            description: "Speech recognition error",
            variant: "destructive",
          });
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        return () => {
          recognition.stop();
        };
      }
    }
  }, []);

  const EnableWebcam = async () => {
    try {
      // react-webcam automatically accesses the webcam; no need for navigator.mediaDevices.getUserMedia
      setWebcamEnabled(true);
      toast({ description: "Webcam enabled" });
    } catch (error) {
      toast({ description: "Failed to enable webcam", variant: "destructive" });
      console.error("Webcam error:", error);
    }
  };

  const DisableWebcam = () => {
    // Ensure the webcamRef is set and the webcam is active
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.srcObject
    ) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop all tracks (video and audio)
    }
    setWebcamEnabled(false);
  };

  const StartStopRecording = () => {
    if (!recognitionRef.current) {
      toast({
        description: "Speech recognition not available",
        variant: "destructive",
      });
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      toast({ description: "Recording stopped" });
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast({ description: "Recording started" });
    }
  };

  const UpdateUserAnswer = async () => {
    if (!userAnswer.trim()) {
      toast({
        description: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    try {
      if (!userId) {
        toast({ description: "User ID not found", variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ description: "Saving your answer... Wait a moment" });

      const answerRecord: AnswerRecord = {
        mockIdRef: mockIdRef,
        question: mockInterviewQuestion[activeQuestionIndex].question,
        activeQuestionIndex: activeQuestionIndex.toString(),
        userAns: userAnswer,
        userId: userId,
      };

      if (answerRecord) {
        await processAnswer(
          userAnswer,
          mockInterviewQuestion,
          activeQuestionIndex,
          interviewData.mockId,
          userId,
        );
      } else {
        toast({
          description: "Failed to process answer",
          variant: "destructive",
        });
        throw new Error("Failed to process answer");
      }
      await onAnswerSave?.(answerRecord);
      setUserAnswer("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        description: "Failed to save answer" + errorMessage,
        variant: "destructive",
      });
      console.error("Answer save error:", error);
    } finally {
      toast({ description: "Answer recorded successfully" });

      setLoading(false);
    }
    
  };

  return (
    <div className="p-6 md:p-12">
      <div className="mx-auto max-w-4xl">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <Loader2 className="mb-4 h-16 w-16 animate-spin text-purple-400" />
            <p className="text-xl font-semibold text-purple-200">
              Saving your answer...
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-primary-foreground">
          {/* Webcam Section */}
          <div className="relative p-6">
            {webcamEnabled ? (
              <Webcam
                ref={webcamRef}
                className="h-[300px] w-full rounded-xl object-cover shadow-inner"
                mirrored
              />
            ) : (
              <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700">
                <CameraOff className="h-20 w-20 text-gray-500" />
              </div>
            )}
            <Button
              variant="outline"
              className={`absolute bottom-10 right-10 rounded-full px-4 py-2 transition-all duration-300 ${
                webcamEnabled && "bg-red-500 text-white hover:bg-red-600"
              }`}
              onClick={webcamEnabled ? DisableWebcam : EnableWebcam}
            >
              {webcamEnabled ? (
                <>
                  <CameraOff className="mr-2 h-5 w-5" /> Disable Webcam
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-5 w-5" /> Enable Webcam
                </>
              )}
            </Button>
          </div>

          {/* Recording Controls */}
          <div className="px-6">
            <Button
              disabled={loading}
              className={`w-full rounded-xl py-3 text-lg font-semibold transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
              onClick={StartStopRecording}
            >
              {isRecording ? (
                <>
                  <StopCircle className="mr-2 h-5 w-5 animate-pulse" /> Stop
                  Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" /> Start Recording
                </>
              )}
            </Button>
          </div>

          {/* Answer Section */}
          <div className="p-6">
            <textarea
              className="h-20 w-full resize-none rounded-xl bg-gray-100 p-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:focus:ring-purple-400"
              placeholder="Your answer will appear here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
            <Button
              className="mt-4 w-full rounded-xl bg-purple-500 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-600"
              onClick={UpdateUserAnswer}
              disabled={loading || !userAnswer.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Answer"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordAnswerSection;
