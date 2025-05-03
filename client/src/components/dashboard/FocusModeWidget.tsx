import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock } from "lucide-react";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface FocusModeWidgetProps {
  tasks: Task[];
}

export default function FocusModeWidget({ tasks }: FocusModeWidgetProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [focusSessionId, setFocusSessionId] = useState<number | null>(null);
  
  // Find first upcoming task
  const currentTask = tasks?.find(task => !task.completed);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Create focus session mutation
  const startFocusMutation = useMutation({
    mutationFn: async (data: { duration: number; taskId?: number }) => {
      const response = await apiRequest("POST", "/api/focus-sessions", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast.toast({
        title: "Focus Session Started",
        description: "Your focus session has begun. Stay focused!",
      });
      setFocusSessionId(data.id);
      setIsActive(true);
      setIsPaused(false);
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
    onError: () => {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start focus session. Please try again.",
      });
    }
  });

  // End focus session mutation
  const endFocusMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/focus-sessions/${id}/end`, {});
    },
    onSuccess: () => {
      toast.toast({
        title: "Focus Session Ended",
        description: "Your focus session has been saved.",
      });
      setIsActive(false);
      setIsPaused(false);
      setFocusSessionId(null);
      setTimeLeft(25 * 60);
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
    onError: () => {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end focus session. Please try again.",
      });
    }
  });

  // Update timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer reached zero
      if (focusSessionId) {
        endFocusMutation.mutate(focusSessionId);
      }
      
      if (interval) {
        clearInterval(interval);
      }
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, isPaused, timeLeft, focusSessionId, endFocusMutation]);

  // Start focus session
  const handleStartFocus = () => {
    const duration = 25; // 25 minutes by default
    startFocusMutation.mutate({
      duration,
      taskId: currentTask?.id
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Focus Mode</CardTitle>
          <Badge variant="outline" className="bg-secondary-100 text-secondary-800 hover:bg-secondary-100">
            Ready
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100">
            <span className="text-4xl font-mono text-gray-700">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          {isActive ? (
            <Link href="/focus-mode">
              <Button className="w-full" variant="secondary">
                <Clock className="mr-2 h-5 w-5" />
                Go to Focus Mode
              </Button>
            </Link>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleStartFocus}
              disabled={startFocusMutation.isPending}
            >
              <Play className="mr-2 h-5 w-5" />
              {startFocusMutation.isPending ? "Starting..." : "Start Focus Session"}
            </Button>
          )}
          
          <Link href="/focus-mode">
            <Button className="w-full" variant="outline">
              <Clock className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </Link>
        </div>
        
        {currentTask && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Task</h3>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {currentTask.category === "study" ? (
                  <FileText className="h-5 w-5 text-primary-500" />
                ) : currentTask.category === "assignment" ? (
                  <Edit className="h-5 w-5 text-secondary-500" />
                ) : (
                  <CheckSquare className="h-5 w-5 text-accent-500" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{currentTask.title}</p>
                <p className="text-xs text-gray-500">
                  {currentTask.description && currentTask.description.length > 30
                    ? `${currentTask.description.substring(0, 30)}...`
                    : currentTask.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Import these icons to avoid errors
import { FileText, Edit, CheckSquare } from "lucide-react";
