
import { cn } from "@/lib/utils";

type StatusType = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "open" 
  | "solved" 
  | "maintenance" 
  | "online";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusClasses = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "solved":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-indigo-100 text-indigo-800";
      case "online":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getStatusClasses(),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
