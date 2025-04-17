"use client"

import { Button } from "@/components/ui/button"

function SidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className="fixed left-4 top-4 z-40 md:flex"
      >
        {isOpen ? (
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
        ) : (
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
            className="lucide lucide-panel-right"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="15" x2="15" y1="3" y2="21" />
          </svg>
        )}
      </Button>
    )
  }
  
