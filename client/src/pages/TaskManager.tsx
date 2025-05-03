import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import { PlusCircle, ListChecks, ClipboardList, User } from "lucide-react";

export default function TaskManager() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "study" | "assignment" | "personal">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const { 
    tasks, 
    isLoading, 
    createTask,
    updateTask,
    deleteTask,
    markTaskComplete
  } = useTasks();

  const handleCreateTask = async (taskData: Omit<Task, "id" | "userId" | "createdAt" | "completed">) => {
    try {
      await createTask({
        ...taskData,
        completed: false
      });
      
      toast.toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      setIsCreating(false);
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Failed to create task",
        description: (error as Error).message || "An unexpected error occurred",
      });
    }
  };

  const handleUpdateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      await updateTask(id, taskData);
      
      toast.toast({
        title: "Success",
        description: "Task updated successfully",
      });
      
      setEditingTask(null);
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Failed to update task",
        description: (error as Error).message || "An unexpected error occurred",
      });
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      
      toast.toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: (error as Error).message || "An unexpected error occurred",
      });
    }
  };

  const handleCompleteTask = async (id: number, completed: boolean) => {
    try {
      await markTaskComplete(id, completed);
      
      toast.toast({
        title: completed ? "Task completed" : "Task marked incomplete",
        description: "Task status updated successfully",
      });
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Failed to update task status",
        description: (error as Error).message || "An unexpected error occurred",
      });
    }
  };

  const filteredTasks = tasks?.filter(task => {
    if (activeTab === "all") return true;
    return task.category === activeTab;
  });

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <p className="mt-2 text-gray-600">
              Organize and manage your study tasks, assignments, and personal to-dos.
            </p>
          </div>
          <Button onClick={() => {
            setIsCreating(true);
            setEditingTask(null);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>
                  View and manage your tasks by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all" className="flex items-center">
                      <ListChecks className="mr-2 h-4 w-4" />
                      All Tasks
                    </TabsTrigger>
                    <TabsTrigger value="study" className="flex items-center">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Study
                    </TabsTrigger>
                    <TabsTrigger value="assignment" className="flex items-center">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Assignments
                    </TabsTrigger>
                    <TabsTrigger value="personal" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Personal
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : filteredTasks && filteredTasks.length > 0 ? (
                      <TaskList
                        tasks={filteredTasks}
                        onEdit={setEditingTask}
                        onDelete={handleDeleteTask}
                        onComplete={handleCompleteTask}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No tasks found in this category</p>
                        <Button onClick={() => setIsCreating(true)} variant="outline">
                          Create a new task
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{editingTask ? "Edit Task" : isCreating ? "New Task" : "Task Details"}</CardTitle>
                <CardDescription>
                  {editingTask ? "Update task details" : isCreating ? "Create a new task" : "Select a task to view or edit details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingTask ? (
                  <TaskForm
                    initialValues={editingTask}
                    onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
                    onCancel={() => setEditingTask(null)}
                  />
                ) : isCreating ? (
                  <TaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setIsCreating(false)}
                  />
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">Select a task to view details or create a new task</p>
                    <Button onClick={() => setIsCreating(true)}>
                      Create New Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
