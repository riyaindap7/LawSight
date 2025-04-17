// "use client";

// import { useState } from "react";
// import { Mic, Send, FileText } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useComplaintContext } from "@/components/ComplaintContext";
// import { useRouter } from "next/navigation";

// interface ComplaintFormProps {
//   complaint: string;
//   setComplaint: (value: string) => void;
//   isListening: boolean;
//   toggleVoiceInput: () => void;
//   handleSubmit: (ipcSections: string[]) => void;
//   currentLanguage: string;
// }

// export function ComplaintForm({
//   complaint,
//   setComplaint,
//   isListening,
//   toggleVoiceInput,
//   handleSubmit,
//   currentLanguage,
// }: ComplaintFormProps) {
//   const [ipcSections, setIpcSections] = useState<string[]>([]);
//   const [complaintSummary, setComplaintSummary] = useState<string | null>(null);

//   const classifyComplaint = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ case_text: complaint }),
//       });

//       if (!response.ok) throw new Error("Failed to classify IPC sections");

//       const data = await response.json();
//       setIpcSections(data.sections || []);
//       return data.sections || [];
//     } catch (error) {
//       console.error("IPC Classification Error:", error);
//       return [];
//     }
//   };

//   const handleFormSubmit = async () => {
//     const classifiedSections = await classifyComplaint();
//     handleSubmit(classifiedSections);

//     // Store complaint text in localStorage
//     localStorage.setItem("complaintText", complaint);

//     // ✅ Store complaint summary
//     setComplaintSummary(complaint);
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Main Content (Form) */}
//       <div className="flex-1 overflow-auto p-6">
//         <div className="space-y-4">
//           <Card className="border shadow-sm bg-white text-black">
//             <CardContent className="p-4 flex-1 flex flex-col overflow-y-auto">
//               <p className="text-sm text-gray-600 mb-4">
//                 Please provide details about your complaint. Be as specific as possible about what happened, when, where, and who was involved.
//               </p>

//               <div className="relative flex-1">
//                 <Textarea
//                   value={complaint}
//                   onChange={(e) => setComplaint(e.target.value)}
//                   placeholder="Describe your complaint in detail..."
//                   className="min-h-[150px] h-full max-h-[500px] resize-none pr-20 pb-10 bg-white text-black border-gray-300 overflow-y-auto"
//                 />

//                 <div className="absolute bottom-3 right-3 flex gap-2">
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     type="button"
//                     onClick={toggleVoiceInput}
//                     className={`border-gray-400 text-gray-600 ${isListening ? "bg-red-500 text-white" : ""}`}
//                   >
//                     <Mic className="h-4 w-4" />
//                   </Button>

//                   <Button
//                     onClick={handleFormSubmit}
//                     disabled={!complaint.trim()}
//                     className="px-4 bg-gray-200 hover:bg-gray-300 text-black"
//                   >
//                     <Send className="h-4 w-4 mr-2" />
//                     Submit
//                   </Button>
//                 </div>

//                 {isListening && (
//                   <div className="absolute bottom-14 right-3 bg-gray-200 border border-gray-400 rounded-md px-3 py-1 text-sm text-gray-600 animate-pulse">
//                     Listening...
//                   </div>
//                 )}
//               </div>

//               {/* Display IPC Sections if classified */}
//               {ipcSections.length > 0 && (
//                 <div className="mt-4 p-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-100">
//                   <strong>Classified IPC Sections:</strong> {ipcSections.join(", ")}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* ✅ Complaint Summary Card */}
//           {complaintSummary && (
//             <Card className="border shadow-sm bg-white text-black">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-base flex items-center">
//                   <FileText className="mr-2 h-4 w-4" />
//                   Original Complaint
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 <h3 className="font-medium text-sm">User Complaint</h3>
//                 <p className="text-xs text-muted-foreground mb-2">{new Date().toLocaleDateString()}</p>
//                 <p className="text-sm">{complaintSummary}</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
