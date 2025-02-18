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
   <div className="flex flex-col gap-10 p-10 md:p-20">
     {/* Title */}
     <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
       Let&apos;s Get Started
     </h2>

     <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
       {/* Job Info Section */}
       <div className="flex flex-col gap-6">
         <div className="rounded-xl border border-gray-300 bg-white/70 p-6 shadow-lg backdrop-blur-lg dark:border-gray-700 dark:bg-gray-800/70">
           <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
             <strong> Job Role / Position: </strong>
             {interviewData.jobPosition}
           </h2>
           <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
             <strong> Tech Stack: </strong>
             {interviewData.jobDesc}
           </h2>
           <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
             <strong> Experience: </strong>
             {interviewData.jobExperience} years
           </h2>
         </div>

         {/* Information Box */}
         <div className="flex flex-col gap-4 rounded-xl border border-yellow-400 bg-yellow-100 p-6 shadow-md dark:border-yellow-600 dark:bg-yellow-900/20">
           <h2 className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
             <Lightbulb className="h-6 w-6" />
             <span className="font-semibold">Information</span>
           </h2>
           <p className="text-sm text-yellow-700 dark:text-yellow-300">
             Enable your <strong>Webcam & Microphone</strong> to start the AI
             Mock Interview. You will be asked <strong>5 questions</strong>, and
             receive a <strong>detailed report</strong> based on your responses.
           </p>
           <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
             <strong>Important:</strong> We never record your video. You can
             disable the webcam anytime.
           </p>
         </div>
       </div>

       {/* Webcam Section */}
       <div className="flex flex-col items-center justify-center gap-6">
         {webCamEnabled ? (
           <>
             <div className="relative w-full max-w-lg">
               <Webcam
                 ref={webcamRef}
                 className="h-[300px] w-full rounded-xl object-cover shadow-2xl ring-4 ring-purple-500/50 lg:h-[350px]"
                 mirrored
               />

               <div className="absolute right-4 top-4 rounded-full bg-white bg-opacity-70 p-3 shadow-md">
                 <p className="text-sm font-semibold text-purple-600">Webcam</p>
               </div>
             </div>
             <Button
               className="mt-4 rounded-lg bg-indigo-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition-all hover:bg-indigo-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
               onClick={handleWebcamToggle}
             >
               Disable Webcam
             </Button>
           </>
         ) : (
           <>
             <WebcamIcon className="my-6 h-64 w-full rounded-xl border border-gray-300 bg-gray-100 p-12 shadow-inner dark:border-gray-700 dark:bg-gray-800" />
             <Button
               className="w-full rounded-lg bg-indigo-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-indigo-600 hover:shadow-lg"
               onClick={handleWebcamToggle}
             >
               Enable Webcam & Mic
             </Button>
           </>
         )}
       </div>
     </div>

     {/* Start Interview Button */}
     <div className="flex justify-end">
       <Link href={`/interview/${interviewId}/start`}>
         <Button className="rounded-md bg-black px-8 py-4 text-lg font-semibold text-white shadow-md transition-transform hover:shadow-lg dark:bg-gray-300">
           Start Interview
         </Button>
       </Link>
     </div>
   </div>
 );
}

export default Interview;
