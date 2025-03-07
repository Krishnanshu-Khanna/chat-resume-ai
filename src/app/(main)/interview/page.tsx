"use client"

import usePremiumModal from "@/hooks/usePremiumModal";
import { canInterviewScheduler } from "@/lib/permissions";
import { useAuth } from "@clerk/nextjs";
import { Award, Bot, ChartNoAxesCombined, ClipboardCheck, Plus, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { fetchUserInterviews, getUserDetails } from "./action";


export default function Page() {
  const { userId } = useAuth();

  const [userDetails, setUserDetails] = useState<{
    email: string | null;
    firstName: string | null;
  }>({
    email: null,
    firstName: null,
  });

  useEffect(() => {
    async function fetchUserDetails() {
      if (!userId) return;
      try {
        const details = await getUserDetails();
        setUserDetails(details);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      }
    }

    fetchUserDetails();
  }, [userId]);

  return <InterviewPage userDetails={userDetails} />;
}

interface Interview {
  rating: string | null;
}

const calculateImprovementRate = (interviews: Interview[]) => {
  if (interviews.length <= 1) return 0;

  const scores = interviews
    .map((interview) => parseInt(interview.rating || "0"))
    .sort((a, b) => a - b);

  const improvement =
    ((scores[scores.length - 1] - scores[0]) / scores[0]) * 100;
  return Math.round(improvement);
};

const InterviewPage = ({
  userDetails,
}: {
  userDetails: { email: string | null; firstName: string | null };
}) => {
  const { userId } = useAuth();
  const [isNewInterviewModalOpen, setIsNewInterviewModalOpen] = useState(false);
  
  const [statsCards, setStatsCards] = useState([
    {
      icon: (
        <ClipboardCheck
          size={32}
          // style={{ stroke: "url(#gradientId)" }} // Apply gradient to stroke
          color="white" 
        />
      ),
      label: "Total Mock Interviews",
      value: "0",
    },
    {
      icon: (
        <Award
          size={32}
          // style={{ stroke: "url(#gradientId)" }} // Apply gradient
          color="white"
        />
      ),
      label: "Top Score",
      value: "N/A",
    },
    {
      icon: (
        <ChartNoAxesCombined
          size={32}
          // style={{ stroke: "url(#gradientId)" }} // Apply gradient
          color="white"
        />
      ),
      label: "Improvement Rate",
      value: "0%",
    },
  ]);
  const premiumModal = usePremiumModal();
  const subscriptionLevel=useSubscriptionLevel();
  useEffect(() => {
    if (!userId) {
      toast.error("User not found");
      return;
    }

    (async () => {
      try {
        const { userInterviews, userRatings } = await fetchUserInterviews();

        const totalInterviews = userInterviews.length;
        const bestScore =
          userRatings.length > 0
            ? Math.max(...userRatings.map((r) => parseInt(r.rating || "0")))
            : 0;
        const improvementRate = calculateImprovementRate(userRatings);

        setStatsCards([
          {
            icon: (
              <ClipboardCheck
                size={32}
                color="white" // Apply gradient to stroke
              />
            ),
            label: "Total Mock Interviews",
            value: totalInterviews.toString(),
          },
          {
            icon: (
              <Award
                size={32}
                // style={{ stroke: "url(#gradientId)" }} // Apply gradient
                color="white"
              />
            ),
            label: "Top Score",
            value: bestScore ? `${bestScore}/10` : "N/A",
          },
          {
            icon: (
              <ChartNoAxesCombined
                size={32}
                // style={{ stroke: "url(#gradientId)" }} // Apply gradient
                color="white"
              />
            ),
            label: "Improvement Rate",
            value: `${improvementRate}%`,
          },
        ]);



        if (totalInterviews > 0) {
          toast.success(`Loaded ${totalInterviews} interview(s)`);
        }
      } catch (error) {
        console.error("❌ Error fetching interviews:", error);
        toast.error("Failed to fetch interviews");
      }
    })();
  }, [userId]);

 return (
   <div className="container mx-auto max-w-6xl px-6 py-12">
     {/* 🔹 Header Section */}
     {/* <svg width="0" height="0">
       <defs>
         <linearGradient id="gradientId" x1="0" x2="1" y1="0" y2="1">
           <stop offset="0%" stopColor="#ec4899" /> 
           <stop offset="100%" stopColor="#8b5cf6" /> 
         </linearGradient>
       </defs>
     </svg> */}

     <div className="flex flex-col items-center text-center">
       <Bot size={72} className="text-indigo-500 drop-shadow-lg" />

       <h2 className="text-black-500 mt-3 text-4xl font-extrabold tracking-wide dark:text-gray-100">
         Welcome, {userDetails.firstName || "Interviewer"} 👋
       </h2>
       <p className="mt-2 text-lg text-gray-900 dark:text-gray-300">
         {userDetails.email ? (
           <>
             You are logged in as{" "}
             <strong className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
               {userDetails.email}
             </strong>
           </>
         ) : (
           "Please sign in to view your interviews."
         )}
       </p>
     </div>

     {/* 🔹 Stats Cards Section */}
     <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
       {statsCards.map((card, index) => (
         <div
           key={index}
           className="relative flex items-center gap-6 rounded-xl border border-white/20 from-[#1E1E2E] to-[#2A2A3A] p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-gradient-to-br"
         >
           {/* Icon on the Left */}
           <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
             {card.icon}
           </div>

           {/* Text on the Right */}
           <div>
             <p className="text-sm font-medium text-gray-400">{card.label}</p>
             <p className="mt-1 text-4xl font-extrabold">{card.value}</p>
           </div>
         </div>
       ))}
     </div>

     {/* ⚡ Create AI Mock Interview Section */}

     {canInterviewScheduler(subscriptionLevel) ? (
       <div className="mt-14 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 shadow-2xl">
         <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
           <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
             <Zap size={32} className="text-yellow-400" />
             Create AI Mock Interview
           </h2>
           <button
             onClick={() => setIsNewInterviewModalOpen(true)} // Ensure the state is set to true
             className="flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl"
           >
             <Plus size={24} className="mr-2" />
             New Interview
           </button>
         </div>

         {/* Add New Interview Component */}
         <AddNewInterview
           isOpen={isNewInterviewModalOpen}
           onClose={() => setIsNewInterviewModalOpen(false)}
         />
       </div>
     ) : (
       <div className="mt-14 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 shadow-2xl">
         <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
           <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
             <Zap size={32} className="text-yellow-400" />
             Create AI Mock Interview
           </h2>
           <button
             onClick={() => premiumModal.setOpen(true)}
             className="flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl"
           >
             <Plus size={24} className="mr-2" />
             New Interview
           </button>
         </div>
       </div>
     )}

     {/* 🔹 Interview History Section */}
     <div className="mt-12">
       <h2 className="text-2xl font-semibold ">Interview History</h2>
       <div className="mt-6">
         <InterviewList />
       </div>
     </div>
   </div>
 );
};