import { useState } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { format, isToday, isTomorrow } from "date-fns";
import { FileText, Edit, CheckSquare, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface UpcomingTasksProps {
  tasks: Task[];
}

export default function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  // Filter and sort tasks that are not completed, with closest due date first
  const upcomingTasks = tasks
    ?.filter(task => !task.completed)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }) || [];

  // Get task icon based on category
  const getTaskIcon = (category: string) => {
    switch (category) {
      case "study":
        return <FileText className="h-5 w-5 text-primary-500" />;
      case "assignment":
        return <Edit className="h-5 w-5 text-secondary-500" />;
      case "personal":
        return <CheckSquare className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-accent-500" />;
    }
  };

  // Format due date for display
  const formatDueDate = (dueDate: Date | undefined) => {
    if (!dueDate) return "No due date";
    
    if (isToday(new Date(dueDate))) {
      return `Today, ${format(new Date(dueDate), "h:mm a")}`;
    } else if (isTomorrow(new Date(dueDate))) {
      return `Tomorrow, ${format(new Date(dueDate), "h:mm a")}`;
    } else {
      return format(new Date(dueDate), "EEE, MMM d, h:mm a");
    }
  };

  // Get priority label and color
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5">Urgent</span>;
      case "high":
        return <span className="text-xs bg-orange-100 text-orange-800 rounded-full px-2 py-0.5">High Priority</span>;
      case "medium":
        return <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">Medium Priority</span>;
      case "regular":
        return <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5">Regular</span>;
      case "low":
        return <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Low Priority</span>;
      default:
        return <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5">Regular</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Study Plan</h2>
          <Link href="/task-manager">
            <Button variant="outline" size="sm" className="text-gray-700 bg-white">
              View All
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        {upcomingTasks.length > 0 ? (
          <div className="space-y-6">
            {upcomingTasks.slice(0, 4).map((task) => (
              <div 
                key={task.id} 
                className="flex items-start space-x-4"
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getTaskIcon(task.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-medium text-gray-800">{task.title}</h3>
                    <span className="text-xs text-gray-500">{formatDueDate(task.dueDate)}</span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {expandedTask === task.id 
                        ? task.description 
                        : task.description.length > 100 
                          ? `${task.description.substring(0, 100)}...` 
                          : task.description}
                    </p>
                  )}
                  <div className="flex items-center">
                    <span className="text-xs bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 mr-2">
                      {task.category}
                    </span>
                    {getPriorityLabel(task.priority)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming tasks</h3>
            <p className="text-gray-500 mb-4">You've completed all your tasks, or you haven't created any yet.</p>
            <Link href="/task-manager">
              <Button>Add New Task</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
