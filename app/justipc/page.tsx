

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, ChevronLeft, Mic } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

// Async function to fetch IPC Sections from the backend
async function fetchIPCSections(caseText: string) {
  try {
    if (!caseText || caseText.trim() === "") {
      throw new Error("caseText is required and cannot be empty.");
    }

    console.log("Request Payload for IPC Sections:", { text: caseText });

    const response = await fetch("http://localhost:8000/predict/ipc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: caseText }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("API Error Details for IPC Sections:", errorDetails);
      throw new Error("Failed to fetch IPC sections");
    }

    const data = await response.json();
    console.log("API Response for IPC Sections:", data);

    return Array.isArray(data.sections) ? data.sections : [];
  } catch (error) {
    console.error("Error fetching IPC sections:", error);
    return [];
  }
}


// Async function to fetch Similar Cases from the backend
async function fetchSimilarCases(caseText: string, topK = 5) {
  try {
    if (!caseText || caseText.trim() === "") {
      throw new Error("caseText is required and cannot be empty.");
    }

    console.log("Request Payload for Similar Cases:", { query_text: caseText, top_k: topK });

    const response = await fetch("http://localhost:8000/predict/similar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query_text: caseText,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("API Error Details for Similar Cases:", errorDetails);
      throw new Error("Failed to fetch similar cases");
    }

    const data = await response.json();
    console.log("API Response for Similar Cases:", data);

    return data.similar_cases || [];
  } catch (error) {
    console.error("Error fetching similar cases:", error);
    return [];
  }
}

export default function ComplaintPage() {
  const [complaint, setComplaint] = useState("");
  const [ipcSections, setIpcSections] = useState<any[]>([]);
  const [similarCases, setSimilarCases] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSubmit = async () => {
    if (complaint.trim() !== "") {
      // Fetch IPC Sections
      const sections = await fetchIPCSections(complaint);

      // Fetch Similar Cases
      const cases = await fetchSimilarCases(complaint);

      // Update state
      setIpcSections(sections);
      setSimilarCases(cases);
      setSubmitted(true);
    }
  };

  const handleNewComplaint = () => {
    setComplaint(""); // Clear complaint input
    setIpcSections([]); // Clear IPC sections
    setSimilarCases([]); // Clear similar cases
    setSubmitted(false); // Reset submission state
  };


return (
  <div className="h-screen flex">
    <AppSidebar
      isOpen={isSidebarOpen}
      onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      chatHistory={[]}
      onSelectChat={() => {}}
      onNewComplaint={handleNewComplaint}
      currentLanguage="English"
    />
    <main className="flex-1 flex flex-col h-screen overflow-hidden pl-4 pr-4 md:pl-8 md:pr-8 relative">
      <div className="p-4 border-b w-full border-gray-300">
        <h1 className="text-2xl font-bold">LawSight</h1>
      </div>
      <div className="flex-1 bg-black text-white p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* New Complaint Section - Always visible */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-gray-700 rounded-xl p-6 ${submitted ? 'md:col-span-1' : 'md:col-span-2'}`}
          >
            <div className="flex items-center justify-between border-b border-gray-500 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-300" />
                <span className="font-semibold text-gray-200">New Complaint</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ChevronLeft className="h-5 w-5 text-gray-300" />
              </Button>
            </div>
            <Textarea
              placeholder="Enter complaint details..."
              className="w-full bg-gray-800 border border-gray-600 text-white h-32"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <div className="flex justify-end w-full gap-2 mt-4">
              <Button
                variant="outline"
                size="icon"
                className="bg-gray-600 hover:bg-gray-500 text-white"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={handleSubmit}
              >
                Submit Complaint
              </Button>
            </div>
          </motion.div>

          {/* Similar Cases Section - Only visible after submission */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700 rounded-xl p-6 flex flex-col overflow-auto"
            >
              <h3 className="text-lg font-semibold text-gray-200 mb-2 border-b border-gray-500 pb-4">Similar Cases</h3>
              <div className="flex-1 bg-gray-800 rounded-lg p-4 text-gray-300 overflow-y-auto max-h-96">
                {Array.isArray(similarCases) && similarCases.length > 0 ? (
                  similarCases.map((caseItem, index) => (
                    <div key={caseItem?.case_id || index} className="mb-4 last:mb-0">
                      <strong>Case ID:</strong> {caseItem?.case_id} <br />
                      <strong>Similarity:</strong> {(caseItem?.similarity * 100).toFixed(2)}% <br />
                      <strong>Case Text:</strong> {caseItem?.case_text}
                      {index < similarCases.length - 1 && <hr className="my-3 border-gray-600" />}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center">
                    No similar cases found
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* IPC Sections - Only visible after submission */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700 rounded-xl p-6 md:col-span-2"
            >
              <h3 className="text-lg font-semibold text-gray-200 mb-2 border-b border-gray-500 pb-4">Applicable IPC Sections</h3>
              <div className="bg-gray-800 rounded-lg p-4 text-gray-300">
                {Array.isArray(ipcSections) && ipcSections.length > 0 ? (
                  ipcSections.map((section, index) => (
                    <div key={section?.section || index} className="mb-3 last:mb-0">
                      <strong>{section?.section} - {section?.title}</strong>: {section?.description} 
                      {section?.probability ? ` (Probability: ${section.probability.toFixed(2)})` : ""}
                      {index < ipcSections.length - 1 && <hr className="my-2 border-gray-600" />}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No applicable sections found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  </div>
);
}