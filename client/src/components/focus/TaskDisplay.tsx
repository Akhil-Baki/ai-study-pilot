import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Clock, Calendar, Flag } from "lucide-react";
import { format } from "date-fns";

interface TaskDisplayProps {
  task: Task;
  minimalistMode?: boolean;
}

export default function TaskDisplay({ task, minimalistMode = false }: TaskDisplayProps) {
  // Format due date display
  const formatDueDate = (date: Date | undefined) => {
    if (!date) return "No due date";
    return format(new Date(date), "PPP p");
  };
  
  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgent";
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      case "regular":
        return "Regular";
      case "low":
        return "Low Priority";
      default:
        return "Regular";
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    if (minimalistMode) {
      return { bg: "bg-gray-700", text: "text-gray-200" };
    }
    
    switch (priority) {
      case "urgent":
        return { bg: "bg-red-100", text: "text-red-800" };
      case "high":
        return { bg: "bg-orange-100", text: "text-orange-800" };
      case "medium":
        return { bg: "bg-yellow-100", text: "text-yellow-800" };
      case "regular":
        return { bg: "bg-gray-100", text: "text-gray-800" };
      case "low":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };
  
  const priorityColors = getPriorityColor(task.priority);

  return (
    <div className={cn(
      "w-full p-4 rounded-lg",
      minimalistMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50"
    )}>
      <h3 className={cn(
        "text-base font-medium mb-2",
        minimalistMode ? "text-white" : "text-gray-900"
      )}>
        Current Focus Task
      </h3>
      
      <div className="space-y-2">
        <div className={cn(
          "text-sm font-medium",
          minimalistMode ? "text-gray-200" : "text-gray-800"
        )}>
          {task.title}
        </div>
        
        {task.description && (
          <p className={cn(
            "text-xs",
            minimalistMode ? "text-gray-400" : "text-gray-600"
          )}>
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          {task.dueDate && (
            <div className={cn(
              "flex items-center text-xs px-2 py-1 rounded-full",
              minimalistMode ? "bg-gray-700 text-gray-300" : "bg-primary-100 text-primary-800"
            )}>
              <Calendar className="w-3 h-3 mr-1" />
              {formatDueDate(task.dueDate)}
            </div>
          )}
          
          <div className={cn(
            "flex items-center text-xs px-2 py-1 rounded-full",
            priorityColors.bg, 
            priorityColors.text
          )}>
            <Flag className="w-3 h-3 mr-1" />
            {getPriorityLabel(task.priority)}
          </div>
          
          <div className={cn(
            "flex items-center text-xs px-2 py-1 rounded-full",
            minimalistMode ? "bg-gray-700 text-gray-300" : "bg-blue-100 text-blue-800"
          )}>
            {task.category}
          </div>
        </div>
      </div>
    </div>
  );
}
