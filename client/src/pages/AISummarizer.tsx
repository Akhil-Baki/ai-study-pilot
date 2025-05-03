import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Summary, SummaryFormValues } from "@/types";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FileUpload from "@/components/shared/FileUpload";
import SummaryView from "@/components/summarizer/SummaryView";
import { FileText, Edit, History } from "lucide-react";

// Form schema for creating a summary
const summarySchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  format: z.enum(["bullet_points", "paragraphs"]),
});

export default function AISummarizer() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Fetch summaries
  const { data: summaries, isLoading } = useQuery({
    queryKey: ["/api/summaries"],
  });

  // Setup form
  const form = useForm<SummaryFormValues>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      title: "",
      content: "",
      format: "bullet_points",
    },
  });

  // Create summary mutation
  const createMutation = useMutation({
    mutationFn: async (data: SummaryFormValues) => {
      const formData = new FormData();
      
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      } else if (data.content) {
        formData.append("content", data.content);
      } else {
        throw new Error("Either file or content must be provided");
      }
      
      if (data.title) {
        formData.append("title", data.title);
      }
      
      formData.append("format", data.format);
      
      const response = await fetch("/api/summarize", {
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
    onSuccess: (data) => {
      toast.toast({
        title: "Success",
        description: "Your content has been summarized!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      setActiveTab("history");
      setUploadedFile(null);
      form.reset();
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: error.message || "Failed to summarize content. Please try again.",
      });
    },
  });

  const onSubmit = (data: SummaryFormValues) => {
    createMutation.mutate(data);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    form.setValue("title", file.name.replace(/\.[^/.]+$/, "")); // Set title to filename without extension
  };

  const handleViewSummary = (summary: Summary) => {
    setSelectedSummary(summary);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Summarizer</h1>
          <p className="mt-2 text-gray-600">
            Upload notes, articles, or textbook PDFs to generate concise summaries.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Create Summary
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              Summary History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Summary</CardTitle>
                <CardDescription>
                  Upload a file or paste text to generate a concise summary.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="My Summary" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your summary a name for easier reference later.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content Source</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="text-sm font-medium mb-2">Upload File</h3>
                          <FileUpload
                            onFileUpload={handleFileUpload}
                            accept=".pdf,.txt,.doc,.docx"
                            isLoading={false}
                            title="Drag & drop your file here"
                            description="or click to browse (PDF, TXT, DOC, DOCX)"
                          />
                          {uploadedFile && (
                            <div className="mt-2 p-2 bg-primary-50 text-primary-700 rounded-md text-sm">
                              File uploaded: {uploadedFile.name}
                            </div>
                          )}
                        </div>

                        <div className="border rounded-lg p-4">
                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Or Paste Text</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Paste your content here..."
                                    className="min-h-[150px]"
                                    {...field}
                                    disabled={!!uploadedFile}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Summary Format</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="bullet_points" />
                                </FormControl>
                                <FormLabel className="font-normal">Bullet Points</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="paragraphs" />
                                </FormControl>
                                <FormLabel className="font-normal">Paragraphs</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createMutation.isPending || (!uploadedFile && !form.watch("content"))}
                    >
                      {createMutation.isPending ? "Summarizing..." : "Generate Summary"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : summaries?.length > 0 ? (
              <div className="space-y-6">
                {selectedSummary ? (
                  <SummaryView
                    summary={selectedSummary}
                    onBack={() => setSelectedSummary(null)}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summaries.map((summary: Summary) => (
                      <Card key={summary.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardHeader>
                          <CardTitle className="truncate">{summary.title}</CardTitle>
                          <CardDescription>
                            Created on {new Date(summary.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 line-clamp-3">{summary.summary.substring(0, 150)}...</p>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={() => handleViewSummary(summary)}>View Summary</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No summaries found</p>
                  <p className="text-gray-500 mb-4">Create your first summary to get started</p>
                  <Button onClick={() => setActiveTab("create")}>Create Now</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
