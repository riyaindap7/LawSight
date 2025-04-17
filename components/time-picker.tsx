"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TimePickerProps {
  onChange?: (time: string) => void
}

export function TimePickerDemo({ onChange }: TimePickerProps) {
  const [hours, setHours] = React.useState<number>(12)
  const [minutes, setMinutes] = React.useState<number>(0)
  const [period, setPeriod] = React.useState<"AM" | "PM">("PM")

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= 12) {
      setHours(value)
      updateTime(value, minutes, period)
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= 59) {
      setMinutes(value)
      updateTime(hours, value, period)
    }
  }

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod)
    updateTime(hours, minutes, newPeriod)
  }

  const updateTime = (h: number, m: number, p: "AM" | "PM") => {
    const formattedHours = h.toString().padStart(2, "0")
    const formattedMinutes = m.toString().padStart(2, "0")
    const timeString = `${formattedHours}:${formattedMinutes} ${p}`
    onChange?.(timeString)
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input id="hours" className="w-16 text-center" value={hours} onChange={handleHoursChange} min={1} max={12} />
      </div>
      <div className="text-center text-2xl">:</div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          id="minutes"
          className="w-16 text-center"
          value={minutes}
          onChange={handleMinutesChange}
          min={0}
          max={59}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">AM/PM</Label>
        <div className="flex">
          <Button
            type="button"
            size="sm"
            variant={period === "AM" ? "default" : "outline"}
            className={cn("rounded-r-none", period === "AM" ? "text-primary-foreground" : "")}
            onClick={() => handlePeriodChange("AM")}
          >
            AM
          </Button>
          <Button
            type="button"
            size="sm"
            variant={period === "PM" ? "default" : "outline"}
            className={cn("rounded-l-none", period === "PM" ? "text-primary-foreground" : "")}
            onClick={() => handlePeriodChange("PM")}
          >
            PM
          </Button>
        </div>
      </div>
    </div>
  )
}

