"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LanguageSelectorProps {
  currentLanguage: string
  setCurrentLanguage: (language: string) => void
  onClose: () => void
}

export function LanguageSelector({ currentLanguage, setCurrentLanguage, onClose }: LanguageSelectorProps) {
  const languages = [
    { code: "English", name: "English" },
    { code: "Hindi", name: "हिन्दी (Hindi)" },
    { code: "Spanish", name: "Español (Spanish)" },
    { code: "French", name: "Français (French)" },
    { code: "German", name: "Deutsch (German)" },
    { code: "Chinese", name: "中文 (Chinese)" },
    { code: "Japanese", name: "日本語 (Japanese)" },
    { code: "Arabic", name: "العربية (Arabic)" },
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Select Language</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Select
            value={currentLanguage}
            onValueChange={(value) => {
              setCurrentLanguage(value)
              onClose()
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}

