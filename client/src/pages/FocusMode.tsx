import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, FocusSession } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import useFocus from "@/hooks/useFocus";

import Timer from "@/components/focus/Timer";
import TaskDisplay from "@/components/focus/TaskDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Pause, Settings, Clock, Volume2 } from "lucide-react";

export default function FocusMode() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [duration, setDuration] = useState(25); // Default 25 minutes for Pomodoro
  const [backgroundSounds, setBackgroundSounds] = useState(false);
  const [selectedSound, setSelectedSound] = useState("none");
  const [minimalistMode, setMinimalistMode] = useState(false);
  
  // Get focus state from custom hook
  const { 
    isActive, 
    isPaused, 
    timeRemaining, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer, 
    currentSession 
  } = useFocus(duration);

  // Fetch tasks for task selection
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Fetch focus sessions for history
  const { data: focusSessions, isLoading: isLoadingFocusSessions } = useQuery({
    queryKey: ["/api/focus-sessions"],
  });

  // Create focus session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { duration: number; taskId?: number }) => {
      return apiRequest("POST", "/api/focus-sessions", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast.toast({
        title: "Focus Session Started",
        description: `${duration} minute focus session started.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      return data;
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Error Starting Session",
        description: error.message || "Failed to start focus session.",
      });
    },
  });

  // End focus session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/focus-sessions/${id}/end`, {});
    },
    onSuccess: async () => {
      toast.toast({
        title: "Focus Session Ended",
        description: "Your focus session has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Error Ending Session",
        description: error.message || "Failed to end focus session.",
      });
    },
  });

  // Start a focus session
  const handleStartFocus = async () => {
    try {
      const data = await createSessionMutation.mutateAsync({
        duration,
        taskId: selectedTaskId || undefined,
      });
      startTimer(data.id);
    } catch (error) {
      console.error("Error starting focus session:", error);
    }
  };

  // End a focus session
  const handleEndFocus = async () => {
    if (currentSession) {
      try {
        await endSessionMutation.mutateAsync(currentSession);
        resetTimer();
      } catch (error) {
        console.error("Error ending focus session:", error);
      }
    }
  };

  // Find the selected task
  const selectedTask = tasks?.find((task: Task) => task.id === selectedTaskId);

  return (
    <main className={`flex-1 overflow-y-auto ${minimalistMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} transition-colors duration-500`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`mb-6 ${minimalistMode ? 'opacity-0 h-0 overflow-hidden' : ''}`}>
          <h1 className="text-2xl font-bold text-gray-900">Focus Mode</h1>
          <p className="mt-2 text-gray-600">
            Eliminate distractions and concentrate on your studies with focused study sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 ${minimalistMode ? 'lg:col-span-3 mx-auto' : ''}`}>
            <Card className={minimalistMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className={minimalistMode ? 'text-white' : ''}>
                <div className="flex items-center justify-between">
                  <CardTitle>Focus Session</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setMinimalistMode(!minimalistMode)}
                    className={minimalistMode ? 'text-white hover:text-gray-300 hover:bg-gray-700' : ''}
                  >
                    {minimalistMode ? 'Exit Minimalist Mode' : 'Minimalist Mode'}
                  </Button>
                </div>
                {!minimalistMode && (
                  <CardDescription>
                    Stay focused on one task at a time for better productivity
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Timer 
                  timeRemaining={timeRemaining} 
                  isActive={isActive} 
                  isPaused={isPaused}
                  minimalistMode={minimalistMode}
                />

                <div className="space-y-4 w-full max-w-md mt-8">
                  {isActive ? (
                    <div className="space-y-4">
                      {isPaused ? (
                        <Button 
                          className="w-full" 
                          onClick={resumeTimer}
                          variant={minimalistMode ? "outline" : "default"}
                        >
                          <Play className="mr-2 h-5 w-5" />
                          Resume Session
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={pauseTimer}
                          variant={minimalistMode ? "outline" : "default"}
                        >
                          <Pause className="mr-2 h-5 w-5" />
                          Pause Session
                        </Button>
                      )}
                      <Button 
                        className="w-full" 
                        variant="destructive"
                        onClick={handleEndFocus}
                      >
                        End Session
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!minimalistMode && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="task-select">Select Task (Optional)</Label>
                            <Select
                              value={selectedTaskId?.toString() || "none"}
                              onValueChange={(value) => setSelectedTaskId(value && value !== "none" ? parseInt(value) : null)}
                            >
                              <SelectTrigger id="task-select">
                                <SelectValue placeholder="Select a task to focus on" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No specific task</SelectItem>
                                {isLoadingTasks ? (
                                  <SelectItem value="loading" disabled>
                                    Loading tasks...
                                  </SelectItem>
                                ) : tasks?.filter((task: Task) => !task.completed).length > 0 ? (
                                  tasks
                                    .filter((task: Task) => !task.completed)
                                    .map((task: Task) => (
                                      <SelectItem key={task.id} value={task.id.toString()}>
                                        {task.title}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    No incomplete tasks
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="duration-slider">Duration: {duration} minutes</Label>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setDuration(25)}
                                  className={duration === 25 ? "bg-primary-100" : ""}
                                >
                                  25
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setDuration(45)}
                                  className={duration === 45 ? "bg-primary-100" : ""}
                                >
                                  45
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setDuration(60)}
                                  className={duration === 60 ? "bg-primary-100" : ""}
                                >
                                  60
                                </Button>
                              </div>
                            </div>
                            <Slider
                              id="duration-slider"
                              min={5}
                              max={120}
                              step={5}
                              value={[duration]}
                              onValueChange={(values) => setDuration(values[0])}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="ambient-sounds"
                              checked={backgroundSounds}
                              onCheckedChange={setBackgroundSounds}
                            />
                            <Label htmlFor="ambient-sounds">Enable ambient sounds</Label>
                          </div>

                          {backgroundSounds && (
                            <div className="space-y-2">
                              <Label htmlFor="sound-select">Sound Type</Label>
                              <Select
                                value={selectedSound}
                                onValueChange={setSelectedSound}
                              >
                                <SelectTrigger id="sound-select">
                                  <SelectValue placeholder="Select sound type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="white-noise">White Noise</SelectItem>
                                  <SelectItem value="nature">Nature Sounds</SelectItem>
                                  <SelectItem value="rain">Rain</SelectItem>
                                  <SelectItem value="cafe">Cafe Ambience</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      )}

                      <Button 
                        className="w-full" 
                        onClick={handleStartFocus}
                        disabled={createSessionMutation.isPending}
                        variant={minimalistMode ? "outline" : "default"}
                      >
                        <Play className="mr-2 h-5 w-5" />
                        {createSessionMutation.isPending ? "Starting..." : "Start Focus Session"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              {isActive && selectedTask && (
                <CardFooter>
                  <TaskDisplay task={selectedTask} minimalistMode={minimalistMode} />
                </CardFooter>
              )}
            </Card>
          </div>

          {!minimalistMode && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Focus Sessions</CardTitle>
                  <CardDescription>
                    Your study activity history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFocusSessions ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : focusSessions?.length > 0 ? (
                    <div className="space-y-3">
                      {focusSessions.slice(0, 5).map((session: FocusSession) => (
                        <div key={session.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-primary-500" />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {session.duration} minute session
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.startTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              session.endTime ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {session.endTime ? "Completed" : "In Progress"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No focus sessions yet</p>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="w-full border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-900">Total Focus Time</p>
                      <p className="text-lg font-bold text-primary-600">
                        {focusSessions?.reduce((total: number, session: FocusSession) => {
                          if (session.endTime) {
                            // Calculate actual time spent for completed sessions
                            const start = new Date(session.startTime).getTime();
                            const end = new Date(session.endTime).getTime();
                            return total + (end - start) / (1000 * 60); // Convert to minutes
                          } else {
                            // Use the planned duration for in-progress sessions
                            return total + session.duration;
                          }
                        }, 0).toFixed(0) || 0} min
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
