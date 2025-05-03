import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Dashboard from "@/pages/Dashboard";
import SyllabusUploader from "@/pages/SyllabusUploader";
import StudyPlanner from "@/pages/StudyPlanner";
import AISummarizer from "@/pages/AISummarizer";
import FocusMode from "@/pages/FocusMode";
import AITutor from "@/pages/AITutor";
import TaskManager from "@/pages/TaskManager";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {children}
      </div>
    </div>
  );
}

function ProtectedPageLayout({ component: Component }: { component: () => React.JSX.Element }) {
  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute 
        path="/" 
        component={() => <ProtectedPageLayout component={Dashboard} />} 
      />
      <ProtectedRoute 
        path="/syllabus-uploader" 
        component={() => <ProtectedPageLayout component={SyllabusUploader} />} 
      />
      <ProtectedRoute 
        path="/study-planner" 
        component={() => <ProtectedPageLayout component={StudyPlanner} />} 
      />
      <ProtectedRoute 
        path="/ai-summarizer" 
        component={() => <ProtectedPageLayout component={AISummarizer} />} 
      />
      <ProtectedRoute 
        path="/focus-mode" 
        component={() => <ProtectedPageLayout component={FocusMode} />} 
      />
      <ProtectedRoute 
        path="/ai-tutor" 
        component={() => <ProtectedPageLayout component={AITutor} />} 
      />
      <ProtectedRoute 
        path="/task-manager" 
        component={() => <ProtectedPageLayout component={TaskManager} />} 
      />
      <ProtectedRoute 
        path="/settings" 
        component={() => <ProtectedPageLayout component={Settings} />} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
