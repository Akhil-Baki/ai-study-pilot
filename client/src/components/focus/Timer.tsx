import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  timeRemaining: number; // in seconds
  isActive: boolean;
  isPaused: boolean;
  minimalistMode?: boolean;
}

export default function Timer({ timeRemaining, isActive, isPaused, minimalistMode = false }: TimerProps) {
  const [minutes, setMinutes] = useState(Math.floor(timeRemaining / 60));
  const [seconds, setSeconds] = useState(timeRemaining % 60);
  
  // Update minutes and seconds when timeRemaining changes
  useEffect(() => {
    setMinutes(Math.floor(timeRemaining / 60));
    setSeconds(timeRemaining % 60);
  }, [timeRemaining]);
  
  // Format time display
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return (
    <div 
      className={cn(
        "relative w-40 h-40 flex items-center justify-center rounded-full",
        minimalistMode ? "bg-gray-800 border-2 border-gray-700" : "bg-gray-100",
        isActive && !isPaused && "timer-pulse"
      )}
      style={{
        boxShadow: minimalistMode 
          ? "0 0 20px rgba(60, 60, 60, 0.3)" 
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        .timer-pulse {
          animation: pulse 2s infinite;
        }
      `}} />
      
      {/* Timer Circle */}
      {isActive && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke={minimalistMode ? "#374151" : "#f3f4f6"} 
            strokeWidth="8" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke={minimalistMode ? "#60a5fa" : "#3b82f6"} 
            strokeWidth="8" 
            strokeDasharray="283" 
            strokeDashoffset={283 - (283 * (timeRemaining / (minutes * 60 + seconds)))}
            transform="rotate(-90 50 50)" 
            strokeLinecap="round"
            className={isPaused ? "opacity-50" : ""}
          />
        </svg>
      )}
      
      {/* Time Display */}
      <span className={cn(
        "text-4xl font-mono", 
        minimalistMode 
          ? isPaused ? "text-gray-400" : "text-white" 
          : isPaused ? "text-gray-400" : "text-gray-700"
      )}>
        {formattedMinutes}:{formattedSeconds}
      </span>
      
      {/* Status Indicator */}
      {isActive && (
        <div className={cn(
          "absolute -bottom-2 px-2 py-0.5 rounded-full text-xs font-medium",
          minimalistMode 
            ? isPaused ? "bg-gray-700 text-gray-300" : "bg-blue-600 text-white"
            : isPaused ? "bg-gray-200 text-gray-600" : "bg-primary-100 text-primary-800"
        )}>
          {isPaused ? "Paused" : "Active"}
        </div>
      )}
    </div>
  );
}
