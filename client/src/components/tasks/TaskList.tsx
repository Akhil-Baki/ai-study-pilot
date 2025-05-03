import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { CheckSquare, Square, Edit, Trash2, MoreVertical, AlertTriangle, Clock } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number, completed: boolean) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onComplete }: TaskListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "regular":
        return "text-gray-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "study":
        return <BookOpen className="h-4 w-4 text-primary-500" />;
      case "assignment":
        return <ClipboardList className="h-4 w-4 text-secondary-500" />;
      case "personal":
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <CheckSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDueDate = (date: Date | undefined) => {
    if (!date) return "No due date";
    return format(new Date(date), "PPP");
  };

  const isPastDue = (date: Date | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  // Sort tasks: incomplete first (sorted by due date), then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by due date if both have due dates
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Tasks with due dates come before those without
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Finally sort by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => (
        <div 
          key={task.id} 
          className={`p-4 border rounded-lg ${
            task.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
          } hover:shadow-sm transition-shadow`}
        >
          <div className="flex items-start">
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5"
              onClick={() => onComplete(task.id, !task.completed)}
            >
              {task.completed ? (
                <CheckSquare className="h-5 w-5 text-green-500" />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            
            <div className="ml-2 flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className={`text-base font-medium ${
                  task.completed ? "text-gray-500 line-through" : "text-gray-900"
                }`}>
                  {task.title}
                </h3>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onComplete(task.id, !task.completed)}>
                      {task.completed ? (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          Mark as Incomplete
                        </>
                      ) : (
                        <>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {task.description && (
                <p className={`text-sm mt-1 ${
                  task.completed ? "text-gray-400" : "text-gray-600"
                }`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  {getCategoryIcon(task.category)}
                  <span className="ml-1">{task.category}</span>
                </div>
                
                {task.dueDate && (
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    task.completed
                      ? "bg-gray-100 text-gray-500"
                      : isPastDue(task.dueDate) && !task.completed
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {isPastDue(task.dueDate) && !task.completed ? (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    ) : (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {formatDueDate(task.dueDate)}
                  </div>
                )}
                
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 ${getPriorityColor(task.priority)}`}>
                  <Flag className="mr-1 h-3 w-3" />
                  {task.priority}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-8">
          <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No tasks found</p>
        </div>
      )}
    </div>
  );
}

// Import these icons to avoid errors
import { BookOpen, ClipboardList, User, Flag } from "lucide-react";
