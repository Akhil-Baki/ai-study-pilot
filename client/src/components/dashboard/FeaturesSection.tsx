import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, LayoutGrid, FileText, Clock, MessageCircle } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Syllabus Uploader",
      description: "Upload course syllabi to automatically generate study plans",
      icon: <FileUp className="h-6 w-6 text-primary-600" />,
      color: "bg-primary-100",
      href: "/syllabus-uploader"
    },
    {
      title: "Study Planner",
      description: "AI-generated study schedules based on your availability",
      icon: <LayoutGrid className="h-6 w-6 text-secondary-500" />,
      color: "bg-secondary-100",
      href: "/study-planner"
    },
    {
      title: "AI Summarizer",
      description: "Convert lengthy study materials into concise summaries",
      icon: <FileText className="h-6 w-6 text-yellow-600" />,
      color: "bg-yellow-100",
      href: "/ai-summarizer"
    },
    {
      title: "AI Tutor",
      description: "Get answers to questions from your course materials",
      icon: <MessageCircle className="h-6 w-6 text-accent-500" />,
      color: "bg-accent-100",
      href: "/ai-tutor"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>AI Study Tools</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-center mb-4">
                <div className={`p-2 ${feature.color} rounded-full`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-md font-medium text-gray-900 text-center mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                {feature.description}
              </p>
              <Link href={feature.href}>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  {feature.title === "Syllabus Uploader"
                    ? "Upload Syllabus"
                    : feature.title === "Study Planner"
                    ? "Plan My Studies"
                    : feature.title === "AI Summarizer"
                    ? "Summarize Content"
                    : "Chat With Tutor"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
