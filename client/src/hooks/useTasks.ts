import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@/types";
import { useToast } from "./use-toast";

/**
 * Custom hook for managing tasks
 * @returns Functions and state for task management
 */
export function useTasks() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch all tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, "id" | "userId" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Failed to create task",
        description: (error as Error).message || "An error occurred",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Failed to update task",
        description: (error as Error).message || "An error occurred",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: (error as Error).message || "An error occurred",
      });
    },
  });

  // Function to create a new task
  const createTask = async (
    taskData: Omit<Task, "id" | "userId" | "createdAt">
  ): Promise<Task> => {
    return await createTaskMutation.mutateAsync(taskData);
  };

  // Function to update a task
  const updateTask = async (
    id: number,
    data: Partial<Task>
  ): Promise<Task> => {
    return await updateTaskMutation.mutateAsync({ id, data });
  };

  // Function to mark a task as complete or incomplete
  const markTaskComplete = async (
    id: number,
    completed: boolean
  ): Promise<Task> => {
    return await updateTaskMutation.mutateAsync({
      id,
      data: { completed },
    });
  };

  // Function to delete a task
  const deleteTask = async (id: number): Promise<void> => {
    await deleteTaskMutation.mutateAsync(id);
  };

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    markTaskComplete,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}

export default useTasks;
