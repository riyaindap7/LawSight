// "use client";

// import { createContext, useContext, useState } from "react";

// interface ComplaintContextType {
//   complaintSummary: {
//     title: string;
//     date: string;
//     description: string;
    
//   complaint: string; // Add this line
//   ipcSections: string[];
//   // other properties

//   } | null;
//   ipcSections: { section: string; description: string }[];
//   setComplaintSummary: (summary: { title: string; date: string; description: string; complaint: string; ipcSections: string[] }) => void;
//   setIpcSections: (sections: { section: string; description: string }[]) => void;
// }

// const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

// export const ComplaintProvider = ({ children }: { children: React.ReactNode }) => {
//   const [complaintSummary, setComplaintSummary] = useState<ComplaintContextType["complaintSummary"]>(null);
//   const [ipcSections, setIpcSections] = useState<ComplaintContextType["ipcSections"]>([]);

//   return (
//     <ComplaintContext.Provider value={{ complaintSummary, ipcSections, setComplaintSummary, setIpcSections }}>
//       {children}
//     </ComplaintContext.Provider>
//   );
// };

// export const useComplaintContext = () => {
//   const context = useContext(ComplaintContext);
//   if (!context) throw new Error("useComplaintContext must be used within a ComplaintProvider");
//   return context;
// };
