import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";
import { 
  LayoutDashboard, 
  FileUp, 
  Calendar, 
  FileText, 
  Clock, 
  MessageCircle, 
  ListTodo, 
  Settings, 
  LucideIcon,
  Menu,
  X,
  LogOut,
  Lightbulb
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, children, active, onClick }: NavItemProps) => {
  return (
    <Link href={href}>
      <a 
        className={cn(
          "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100", 
          active && "text-primary-600 bg-primary-50"
        )}
        onClick={onClick}
      >
        <Icon className="h-5 w-5 mr-3" />
        {children}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarClasses = cn(
    "bg-white shadow-lg md:w-64 flex-shrink-0 border-r border-gray-200",
    "transition-all duration-300 ease-in-out z-40",
    isMobile && "fixed inset-y-0 left-0 w-64",
    isMobile && !isOpen && "-translate-x-full"
  );

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-accent-500 rounded-md p-2">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Study Planner</h1>
              </div>
              
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto"
                  onClick={toggleSidebar}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          <nav className="py-4 flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">Main</div>
            <NavItem href="/" icon={LayoutDashboard} active={location === "/"} onClick={closeSidebar}>
              Dashboard
            </NavItem>
            <NavItem href="/syllabus-uploader" icon={FileUp} active={location === "/syllabus-uploader"} onClick={closeSidebar}>
              Syllabus Uploader
            </NavItem>
            <NavItem href="/study-planner" icon={Calendar} active={location === "/study-planner"} onClick={closeSidebar}>
              Study Planner
            </NavItem>
            <NavItem href="/ai-summarizer" icon={FileText} active={location === "/ai-summarizer"} onClick={closeSidebar}>
              AI Summarizer
            </NavItem>
            <NavItem href="/focus-mode" icon={Clock} active={location === "/focus-mode"} onClick={closeSidebar}>
              Focus Mode
            </NavItem>
            <NavItem href="/ai-tutor" icon={MessageCircle} active={location === "/ai-tutor"} onClick={closeSidebar}>
              AI Tutor
            </NavItem>
            <NavItem href="/task-manager" icon={ListTodo} active={location === "/task-manager"} onClick={closeSidebar}>
              Task Manager
            </NavItem>

            <div className="px-4 py-2 mt-4 text-xs text-gray-400 uppercase tracking-wider">Account</div>
            <NavItem href="/settings" icon={Settings} active={location === "/settings"} onClick={closeSidebar}>
              Settings
            </NavItem>
            <a href="#" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100">
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </a>
          </nav>
        </div>
      </div>
      
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
