import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import StatusCards from "@/components/dashboard/StatusCards";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import FocusModeWidget from "@/components/dashboard/FocusModeWidget";
import StudyCalendar from "@/components/dashboard/StudyCalendar";
import AITutorWidget from "@/components/dashboard/AITutorWidget";
import FeaturesSection from "@/components/dashboard/FeaturesSection";
import { Task } from "@/types";

export default function Dashboard() {
  // Fetch tasks for upcoming tasks section
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Derive dashboard stats
  const courseCount = 4; // In a real application, this would come from a backend query
  const studyHours = 18.5; // This would be calculated based on actual focus session records
  const completedTasks = tasks?.filter((task: Task) => task.completed).length || 0;
  const upcomingDeadlines = tasks?.filter((task: Task) => !task.completed && task.dueDate).length || 0;

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {isLoadingTasks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <StatusCards
            stats={{
              courseCount,
              studyHours,
              completedTasks,
              upcomingDeadlines
            }}
          />
        )}

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Tasks */}
          <div className="lg:col-span-2">
            {isLoadingTasks ? (
              <Skeleton className="h-[500px] w-full" />
            ) : (
              <UpcomingTasks tasks={tasks} />
            )}
          </div>

          {/* Focus Mode Widget */}
          <div className="lg:col-span-1">
            <FocusModeWidget tasks={tasks} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <StudyCalendar />
          </div>

          {/* AI Tutor Widget */}
          <div className="lg:col-span-1">
            <AITutorWidget />
          </div>
        </div>

        {/* Features Quick Access Section */}
        <div className="mt-8">
          <FeaturesSection />
        </div>
      </div>
    </main>
  );
}
