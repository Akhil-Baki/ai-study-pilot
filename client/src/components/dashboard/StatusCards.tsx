import { DashboardStats } from "@/types";
import { Book, Clock, CheckSquare, AlertTriangle } from "lucide-react";

interface StatusCardsProps {
  stats: DashboardStats;
}

export default function StatusCards({ stats }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-primary-100 rounded-md p-3">
            <Book className="h-6 w-6 text-primary-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-gray-500 text-sm font-medium">Courses</h2>
            <p className="text-gray-900 text-2xl font-semibold">{stats.courseCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-yellow-100 rounded-md p-3">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-gray-500 text-sm font-medium">Study Hours</h2>
            <p className="text-gray-900 text-2xl font-semibold">{stats.studyHours}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-green-100 rounded-md p-3">
            <CheckSquare className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-gray-500 text-sm font-medium">Completed Tasks</h2>
            <p className="text-gray-900 text-2xl font-semibold">{stats.completedTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-red-100 rounded-md p-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-gray-500 text-sm font-medium">Upcoming Deadlines</h2>
            <p className="text-gray-900 text-2xl font-semibold">{stats.upcomingDeadlines}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
