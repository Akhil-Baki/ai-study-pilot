import { useState } from "react";
import { Bell, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Study session reminder", message: "Machine Learning Fundamentals in 30 minutes" },
    { id: 2, title: "Task due tomorrow", message: "Complete Assignment: Data Structures" },
    { id: 3, title: "New study plan available", message: "AI generated a new study plan based on your syllabus" }
  ]);

  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/syllabus-uploader":
        return "Syllabus Uploader";
      case "/study-planner":
        return "Study Planner";
      case "/ai-summarizer":
        return "AI Summarizer";
      case "/focus-mode":
        return "Focus Mode";
      case "/ai-tutor":
        return "AI Tutor";
      case "/task-manager":
        return "Task Manager";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6 text-gray-500" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} className="p-3 cursor-default">
                    <div className="flex justify-between w-full">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 text-xs ml-2"
                      >
                        Mark as read
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="py-4 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-800 font-medium text-sm">
                      {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">{user?.username || 'User'}</div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.username || 'User'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>My Courses</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()} 
                disabled={logoutMutation.isPending}
                className="flex items-center"
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  'Log out'
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
