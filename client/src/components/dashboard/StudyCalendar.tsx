import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Task, StudySession } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Month names for display
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Day of week abbreviations
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Fetch tasks for calendar
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Fetch study plans and sessions for calendar
  const { data: studyPlans } = useQuery({
    queryKey: ["/api/study-plans"],
  });

  // Get all study sessions from all plans
  const studySessions = studyPlans?.flatMap(plan => plan.sessions || []) || [];
  
  // Get events for the given date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get tasks due on this date
    const tasksDue = tasks?.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    }) || [];
    
    // Get study sessions scheduled for this date
    const sessionsScheduled = studySessions.filter(session => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
    
    return {
      tasksDue,
      sessionsScheduled
    };
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Generate calendar grid
  const generateCalendarGrid = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week (0-6) for first day of month
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate total days in grid (max 6 rows of 7 days)
    const daysInGrid = Math.ceil((firstDayOfWeek + lastDayOfMonth.getDate()) / 7) * 7;
    
    // Create grid cells
    const calendarGrid = [];
    let dayCounter = 1;
    
    for (let i = 0; i < daysInGrid; i++) {
      // Calculate current date for this cell
      const currentDate = i >= firstDayOfWeek && dayCounter <= lastDayOfMonth.getDate()
        ? new Date(year, month, dayCounter++)
        : null;
      
      // Get events for this date
      const events = currentDate ? getEventsForDate(currentDate) : null;
      
      // Add cell to grid
      calendarGrid.push({ date: currentDate, events });
      
      // Stop if we've gone past the last day of the month and filled a complete week
      if (dayCounter > lastDayOfMonth.getDate() && (i + 1) % 7 === 0) {
        break;
      }
    }
    
    return calendarGrid;
  };
  
  // Generate calendar grid
  const calendarGrid = generateCalendarGrid();
  
  // Render event pill
  const renderEventPill = (event: any, type: string) => {
    if (type === 'task') {
      return (
        <div key={`task-${event.id}`} className={`text-xs ${
          event.priority === 'urgent' ? 'bg-red-100 text-red-800' :
          event.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          event.category === 'study' ? 'bg-primary-100 text-primary-800' :
          event.category === 'assignment' ? 'bg-secondary-100 text-secondary-800' :
          'bg-yellow-100 text-yellow-800'
        } rounded px-1 py-0.5 truncate mb-1`}>
          {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
        </div>
      );
    } else {
      return (
        <div key={`session-${event.id}`} className="text-xs bg-accent-100 text-accent-800 rounded px-1 py-0.5 truncate mb-1">
          {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Study Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Plan your study sessions and track deadlines
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded">
          {/* Days of Week */}
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="bg-gray-100 py-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar Dates */}
          {calendarGrid.map((cell, i) => (
            <div
              key={i}
              className={`${
                cell.date ? 'bg-white' : 'bg-gray-50'
              } ${
                cell.date && isToday(cell.date) ? 'bg-primary-50 relative ring-2 ring-primary-500' : ''
              } min-h-[100px] p-1`}
            >
              {cell.date ? (
                <>
                  <div className={`text-sm ${
                    isToday(cell.date) ? 'text-primary-800 font-semibold' : 'text-gray-900'
                  }`}>
                    {cell.date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {cell.events?.tasksDue.map(task => renderEventPill(task, 'task'))}
                    {cell.events?.sessionsScheduled.map(session => renderEventPill(session, 'session'))}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm">
                  {new Date(
                    currentMonth.getFullYear(),
                    i < 7 ? currentMonth.getMonth() - 1 : currentMonth.getMonth() + 1,
                    i < 7
                      ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate() - (6 - i)
                      : i - (new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() + new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() - 1)
                  ).getDate()}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
