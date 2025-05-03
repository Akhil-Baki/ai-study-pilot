import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Custom hook for managing focus sessions
 * @param initialDuration - Initial duration in minutes
 * @returns Focus session state and control functions
 */
export default function useFocus(initialDuration: number = 25) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60); // Convert to seconds
  const [currentSession, setCurrentSession] = useState<number | null>(null);
  
  // Create focus session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { duration: number; taskId?: number }) => {
      const response = await apiRequest("POST", "/api/focus-sessions", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      return data;
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Error Starting Session",
        description: (error as Error).message || "Failed to start focus session.",
      });
    },
  });

  // End focus session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/focus-sessions/${id}/end`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Error Ending Session",
        description: (error as Error).message || "Failed to end focus session.",
      });
    },
  });

  // Timer effect - handles countdown when timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      // Timer finished
      if (currentSession) {
        endSessionMutation.mutate(currentSession);
        toast.toast({
          title: "Focus Session Completed",
          description: "Great job! Your focus session is complete.",
        });
        setIsActive(false);
        setIsPaused(false);
        setCurrentSession(null);
        setTimeRemaining(initialDuration * 60); // Reset timer
      }
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, isPaused, timeRemaining, currentSession, initialDuration, endSessionMutation, toast]);

  // Start a new focus session
  const startTimer = async (sessionId: number) => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentSession(sessionId);
    setTimeRemaining(initialDuration * 60); // Reset to full time
  };

  // Pause the current focus session
  const pauseTimer = () => {
    if (isActive && !isPaused) {
      setIsPaused(true);
    }
  };

  // Resume a paused focus session
  const resumeTimer = () => {
    if (isActive && isPaused) {
      setIsPaused(false);
    }
  };

  // Reset and end the current focus session
  const resetTimer = async () => {
    if (currentSession) {
      try {
        await endSessionMutation.mutateAsync(currentSession);
      } catch (error) {
        console.error("Error ending focus session:", error);
      }
    }
    
    setIsActive(false);
    setIsPaused(false);
    setCurrentSession(null);
    setTimeRemaining(initialDuration * 60);
  };

  return {
    isActive,
    isPaused,
    timeRemaining,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    currentSession,
    createSession: createSessionMutation.mutateAsync,
    endSession: endSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
  };
}
