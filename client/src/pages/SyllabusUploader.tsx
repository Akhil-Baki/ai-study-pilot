import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Syllabus, SyllabusParsedContent } from "@/types";

import FileUpload from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Upload, AlertCircle } from "lucide-react";

export default function SyllabusUploader() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  
  // Fetch previously uploaded syllabi
  const { data: syllabi, isLoading } = useQuery({
    queryKey: ["/api/syllabi"],
  });

  // Upload syllabus mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/syllabi/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.toast({
        title: "Success",
        description: "Syllabus uploaded and parsed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/syllabi"] });
      setActiveTab("library");
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload syllabus. Please try again.",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleViewSyllabus = (syllabus: Syllabus) => {
    setSelectedSyllabus(syllabus);
  };

  const renderParsedContent = (parsedContent: SyllabusParsedContent) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Course Information</h3>
          <p className="text-sm text-gray-600">Course: {parsedContent.courseName}</p>
          <p className="text-sm text-gray-600">Instructor: {parsedContent.instructor}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800">Exam Dates</h3>
          {parsedContent.examDates && parsedContent.examDates.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {parsedContent.examDates.map((exam, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {exam.name}: <span className="font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No exam dates found</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800">Topics</h3>
          {parsedContent.topics && parsedContent.topics.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {parsedContent.topics.map((topic, index) => (
                <li key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{topic.name}</span>: {topic.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No topics found</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Syllabus Uploader</h1>
          <p className="mt-2 text-gray-600">
            Upload your course syllabus to automatically extract important information and create study plans.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Upload New
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Syllabus</CardTitle>
                <CardDescription>
                  Upload a PDF of your syllabus to extract course details, exam dates, and topics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileUpload={handleFileUpload} 
                  accept=".pdf" 
                  isLoading={uploadMutation.isPending}
                  title="Drag & drop your syllabus PDF here"
                  description="or click to browse (only PDF files are supported)"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tip</AlertTitle>
                  <AlertDescription>
                    For best results, ensure your syllabus includes course schedule, exam dates, and major topics.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="h-40">
                    <CardContent className="p-6 flex items-center justify-center">
                      <div className="animate-pulse flex space-x-4 w-full">
                        <div className="flex-1 space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : syllabi?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {syllabi.map((syllabus: Syllabus) => (
                  <Card key={syllabus.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle>{syllabus.title}</CardTitle>
                      <CardDescription>{syllabus.courseName || "No course name"}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Uploaded {new Date(syllabus.createdAt).toLocaleDateString()}
                      </span>
                      <Button variant="outline" onClick={() => handleViewSyllabus(syllabus)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No syllabi found</p>
                  <p className="text-gray-500 mb-4">Upload your first syllabus to get started</p>
                  <Button onClick={() => setActiveTab("upload")}>Upload Now</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {selectedSyllabus && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{selectedSyllabus.title}</CardTitle>
              <CardDescription>
                Course: {selectedSyllabus.courseName || "Not specified"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSyllabus.parsedContent ? (
                renderParsedContent(selectedSyllabus.parsedContent)
              ) : (
                <p className="text-gray-500">No parsed content available</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedSyllabus(null)}>
                Close
              </Button>
              <Button onClick={() => window.location.href = "/study-planner"}>
                Create Study Plan
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
