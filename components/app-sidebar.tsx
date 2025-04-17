

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Search, FileText, Plus, User, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chatHistory: ChatHistoryItem[];
  onSelectChat: (chatId: string) => void;
  onNewComplaint: () => void;
  currentLanguage: string;
}

export function AppSidebar({ isOpen, onToggle, chatHistory, onSelectChat, onNewComplaint }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredHistory = chatHistory.filter((chat) => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="relative h-screen">
      <AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ width: "80px", opacity: 1 }}
      animate={{ width: "260px", opacity: 1 }}
      exit={{ width: "80px", opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-black text-white shadow-lg z-20 flex flex-col"
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-400" />
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-gray-300"
          >
            LawSight
          </motion.span>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </Button>
      </div>

      <div className="p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button className="w-full mb-4 bg-gray-800 hover:bg-gray-700 text-white" onClick={onNewComplaint}>
            <Plus className="mr-2 h-4 w-4" /> New Complaint
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search cases..."
              className="pl-8 bg-gray-900 border-none text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )}
</AnimatePresence>


      {!isOpen && (
        <motion.div
          initial={{ width: "80px" }}
          animate={{ width: "80px" }}
          className="h-full bg-gray-900 flex flex-col items-center justify-center cursor-pointer border-r border-gray-700"
          onClick={onToggle}
        >
          <ChevronRight className="h-6 w-6 text-gray-400" />
        </motion.div>
      )}
    </div>
  )
}