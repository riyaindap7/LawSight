
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { Button } from "../../components/ui/button"
import { AppSidebar } from "../../components/app-sidebar"
import { SidebarProvider, useSidebar } from "../../components/ui/sidebar"
import CombinedComplaintPage from "../../components/voiceFIRSubmissionForm" // Updated import
import { LanguageSelector } from "../../components/language-selector"
// import { useComplaintContext } from "../../components/ComplaintContext";


// SidebarToggle component remains the same
function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar()

  if (state === "expanded") {
    return null
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleSidebar} className="fixed left-4 top-4 z-40 md:flex">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-panel-left"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="9" x2="9" y1="3" y2="21" />
      </svg>
    </Button>
  )
}

export default function Home() {
  const router = useRouter()
  const [complaint, setComplaint] = useState("")
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("English")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleNewComplaint = () => {
    // This will be passed to CombinedComplaintPage
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-full">
        <AppSidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          chatHistory={[]}
          onSelectChat={() => {}}
          currentLanguage={currentLanguage}
          onNewComplaint={handleNewComplaint}
        />
        <SidebarToggle />

        <main className="flex-1 flex flex-col h-screen pl-4 pr-4 md:pl-8 md:pr-8">
          <div className="p-4 border-b w-full border-gray-300">
            <h1 className="text-2xl font-bold">LawSight</h1>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="absolute top-4 right-4 rounded-full md:right-8"
          >
            <Languages className="h-5 w-5" />
          </Button>

          <div className="w-full overflow-hidden md:p-[0px] pb-32">
            <div className="w-full mx-auto">
              <CombinedComplaintPage
                handleNewComplaint={handleNewComplaint}
                currentLanguage={currentLanguage}
              />
            </div>
          </div>

          {showLanguageSelector && (
            <LanguageSelector
              currentLanguage={currentLanguage}
              setCurrentLanguage={setCurrentLanguage}
              onClose={() => setShowLanguageSelector(false)}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}