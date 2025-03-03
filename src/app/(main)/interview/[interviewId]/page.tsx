"use client";
  import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { getQuestions } from "./action";
import { mockInterviewSchema } from "@/lib/validation";

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex items-center justify-between">
    <span className="font-medium text-gray-600 dark:text-gray-400">
      {label}:
    </span>
    <span className="text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

function Interview() {
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  interface InterviewData {
    jobPosition: string;
    jobDesc: string;
    jobExperience: string;
  }

  const { interviewId } = useParams() as { interviewId: string };
  console.log(interviewId);
const webcamRef = useRef<Webcam>(null);


  const [interviewData, setInterviewData] = useState<InterviewData | null>(null); // Fix: Initialize as `null` instead of parsing an empty object

  const getInterviewDetails = async () => {
    try {
      if (!interviewId) {
        throw new Error("Invalid interview ID.");
      }

      const fetchedData = await getQuestions(interviewId);

      if (fetchedData) {
        const parsedData = mockInterviewSchema.parse(fetchedData);
        setInterviewData(parsedData);
      } else {
        toast.error("No interview details found");
      }
    } catch (error) {
      toast.error("Error fetching interview details");
      console.error("Interview details fetch error:", error);
    }
  };

  useEffect(() => {
    getInterviewDetails();
  }, []);

  const handleWebcamToggle = async () => {
    if (!webCamEnabled) {
      try {
        // Start the webcam
        setWebCamEnabled(true);
        toast.success("Webcam and microphone enabled");
      } catch (error) {
        toast.error("Failed to access webcam or microphone");
        console.error("Webcam access error:", error);
      }
    } else {
      // Stop the webcam stream
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.srcObject
      ) {
        const stream = webcamRef.current.video.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop()); // Stop all tracks (video and audio)
      }
      setWebCamEnabled(false);
      toast.success("Webcam and microphone disabled");
    }
  };


  if (!interviewData) {
    return <div>Loading interview details...</div>;
  }

 return (
  <div className="min-h-screen">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold my-4">
          Prepare for Your AI Interview
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Get ready to showcase your skills and experience
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Job Info & Instructions */}
        <div className="space-y-8">
          {/* Job Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-4">
              Position Details
            </h2>
            <div className="space-y-3">
              <InfoItem label="Role" value={interviewData.jobPosition} />
              <InfoItem label="Tech Stack" value={interviewData.jobDesc} />
              <InfoItem label="Experience" value={`${interviewData.jobExperience} years`} />
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-700">
            <h2 className="flex items-center text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-4">
              <Lightbulb className="w-6 h-6 mr-2" />
              Interview Guidelines
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Enable your webcam and microphone</li>
              <li>You&apos;ll be asked 5 technical questions</li>
              <li>Speak clearly and concisely</li>
              <li>You&apos;ll receive a detailed performance report</li>
            </ul>
            <p className="mt-4 text-sm text-purple-600 dark:text-purple-400 font-medium">
              Note: Your video is never recorded or stored.
            </p>
          </div>
        </div>

        {/* Right Column: Webcam & Start Button */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {webCamEnabled ? (
            <div className="relative w-full aspect-video max-w-2xl">
              <Webcam
                ref={webcamRef}
                className="rounded-2xl shadow-2xl w-full h-full object-cover"
                mirrored
              />
              <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Webcam Active
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video max-w-2xl bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <WebcamIcon className="w-1/3 h-1/3 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          
          <Button
            onClick={handleWebcamToggle}
            className={`w-full max-w-md py-3 text-lg font-semibold rounded-xl transition-all ${
              webCamEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : ''
            }`}
          >
            {webCamEnabled ? 'Disable Webcam' : 'Enable Webcam & Mic'}
          </Button>

          <Link href={`/interview/${interviewId}/start`} className="w-full max-w-md">
            <Button className="w-full py-4 text-xl font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg transition-all">
              Start Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

}


export default Interview;
