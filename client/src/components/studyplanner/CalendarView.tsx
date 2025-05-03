import { useState, useEffect } from "react";
import { StudyPlan, StudySession } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  studyPlan: StudyPlan;
}

export default function CalendarView({ studyPlan }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  // Initialize calendar days for current month
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add days to fill the calendar grid (padding for start and end of month)
    const firstDayOfWeek = monthStart.getDay();
    const lastDayOfWeek = monthEnd.getDay();
    
    // Add days from previous month
    const prevMonthDays = firstDayOfWeek > 0
      ? eachDayOfInterval({
          start: new Date(monthStart.getFullYear(), monthStart.getMonth(), -firstDayOfWeek + 1),
          end: new Date(monthStart.getFullYear(), monthStart.getMonth(), 0)
        })
      : [];
    
    // Add days from next month
    const nextMonthDays = lastDayOfWeek < 6
      ? eachDayOfInterval({
          start: new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 1),
          end: new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 6 - lastDayOfWeek)
        })
      : [];
    
    setCalendarDays([...prevMonthDays, ...daysInMonth, ...nextMonthDays]);
  }, [currentMonth]);
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Get sessions for a specific day
  const getSessionsForDay = (day: Date): StudySession[] => {
    if (!studyPlan.sessions) return [];
    
    return studyPlan.sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return isSameDay(sessionDate, day);
    });
  };
  
  // Check if date is in current month
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentMonth.getMonth();
  };
  
  // Check if date is today
  const isToday = (day: Date) => {
    const today = new Date();
    return isSameDay(day, today);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
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
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, i) => {
          const sessions = getSessionsForDay(day);
          const hasSession = sessions.length > 0;
          
          return (
            <div
              key={i}
              className={`
                p-1 min-h-[80px] text-sm border rounded
                ${!isCurrentMonth(day) ? "bg-gray-50 text-gray-400" : "bg-white"}
                ${isToday(day) ? "border-primary-500 border-2" : "border-gray-200"}
              `}
            >
              <div className={`text-right px-1 ${
                isToday(day) ? "font-bold text-primary-700" : "text-gray-700"
              }`}>
                {format(day, "d")}
              </div>
              
              <div className="mt-1 space-y-1">
                {hasSession && sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      px-1 py-0.5 text-xs rounded truncate
                      ${session.completed
                        ? "bg-green-100 text-green-800"
                        : "bg-primary-100 text-primary-800"}
                    `}
                    title={session.title}
                  >
                    {session.title.length > 15
                      ? `${session.title.substring(0, 15)}...`
                      : session.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
