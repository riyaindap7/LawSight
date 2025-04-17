"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface UserToggleProps {
  userType: string;
  setUserType: (value: string) => void;
}

export default function UserToggle({ userType, setUserType }: UserToggleProps) {
  return (
    <ToggleGroup type="single" value={userType} onValueChange={setUserType} className="w-full flex mb-6">
      <ToggleGroupItem value="police" className="flex-1">Police</ToggleGroupItem>
      <ToggleGroupItem value="admin" className="flex-1">Admin</ToggleGroupItem>
    </ToggleGroup>
  );
}
