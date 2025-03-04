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
     <div className="mx-auto max-w-6xl">
       {/* Header */}
       <header className="mb-12 text-center">
         <h1 className="my-4 text-4xl font-bold md:text-5xl">
           Prepare for Your AI Interview
         </h1>
         <p className="text-lg text-gray-600 dark:text-gray-400">
           Get ready to showcase your skills and experience
         </p>
       </header>

       <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
         {/* Left Column: Job Info & Instructions */}
         <div className="space-y-8">
           {/* Job Info Card */}
           <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
             <h2 className="mb-4 text-2xl font-semibold text-purple-700 dark:text-purple-400">
               Position Details
             </h2>
             <div className="space-y-3">
               <InfoItem label="Role" value={interviewData.jobPosition} />
               <InfoItem label="Tech Stack" value={interviewData.jobDesc} />
               <InfoItem
                 label="Experience"
                 value={`${interviewData.jobExperience} years`}
               />
             </div>
           </div>

           {/* Instructions Card */}
           <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-6 shadow-lg dark:border-purple-700 dark:bg-purple-900/30">
             <h2 className="mb-4 flex items-center text-2xl font-semibold text-purple-700 dark:text-purple-400">
               <Lightbulb className="mr-2 h-6 w-6" />
               Interview Guidelines
             </h2>
             <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
               <li>Enable your webcam and microphone</li>
               <li>You&apos;ll be asked 5 technical questions</li>
               <li>Speak clearly and concisely</li>
               <li>You&apos;ll receive a detailed performance report</li>
             </ul>
             <p className="mt-4 text-sm font-medium text-purple-600 dark:text-purple-400">
               Note: Your video is never recorded or stored.
             </p>
           </div>
         </div>

         {/* Right Column: Webcam & Start Button */}
         <div className="flex flex-col items-center justify-center space-y-6">
           {webCamEnabled ? (
             <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl">
               <Webcam
                 ref={webcamRef}
                 className="h-full w-full object-cover"
                 mirrored
               />
               <div className="absolute right-4 top-4 rounded-full bg-purple-500 px-3 py-1 text-sm font-medium text-white">
                 Webcam Active
               </div>
             </div>
           ) : (
             <div className="flex aspect-video w-full max-w-2xl items-center justify-center rounded-2xl bg-gray-200 shadow-2xl dark:bg-gray-700">
               <WebcamIcon className="h-1/3 w-1/3 text-gray-400 dark:text-gray-500" />
             </div>
           )}

           <Button
             onClick={handleWebcamToggle}
             className={`w-full max-w-md rounded-xl py-3 text-lg font-semibold transition-all ${
               webCamEnabled ? "bg-red-500 text-white hover:bg-red-600" : ""
             }`}
           >
             {webCamEnabled ? "Disable Webcam" : "Enable Webcam & Mic"}
           </Button>

           <Link
             href={`/interview/${interviewId}/start`}
             className="w-full max-w-md"
           >
             <Button className="w-full rounded-xl bg-purple-600 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-purple-700">
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
