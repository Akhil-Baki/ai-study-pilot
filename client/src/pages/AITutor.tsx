import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import useChat from "@/hooks/useChat";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import FileUpload from "@/components/shared/FileUpload";
import ChatInterface from "@/components/tutor/ChatInterface";
import { Send, Upload, FileText, MessagesSquare, Link } from "lucide-react";

export default function AITutor() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [referenceMode, setReferenceMode] = useState(false);
  const [referenceContent, setReferenceContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Chat messages state from custom hook
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    isSending 
  } = useChat();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await sendMessage(message, referenceMode ? referenceContent : undefined);
      setMessage("");
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
  };

  // Handle file upload for reference
  const handleFileUpload = async (file: File) => {
    try {
      setUploadedFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setReferenceContent(e.target.result as string);
          toast.toast({
            title: "Reference Added",
            description: `${file.name} has been added as a reference.`,
          });
        }
      };
      
      if (file.type === "application/pdf") {
        // For PDFs, we'd need a proper PDF parsing library
        // This is a simplified approach
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to process reference file.",
      });
    }
  };

  // Handle keypress for message send
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Tutor</h1>
          <p className="mt-2 text-gray-600">
            Get help with your studies through our AI-powered tutor assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Chat with AI Tutor</CardTitle>
                    <CardDescription>
                      Ask questions about your studies and get instant help
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reference-mode"
                      checked={referenceMode}
                      onCheckedChange={setReferenceMode}
                    />
                    <Label htmlFor="reference-mode" className="flex items-center">
                      <Link className="h-4 w-4 mr-1" />
                      Reference Mode
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full overflow-hidden flex flex-col">
                <ChatInterface 
                  messages={messages} 
                  isLoading={isLoading} 
                />
                
                <div className="mt-auto pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask a question..."
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!message.trim() || isSending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Tip: Ask specific questions for better answers</span>
                    {referenceMode && (
                      <span className="text-primary-600">
                        Reference Mode Active
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-12rem)]">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">
                  <MessagesSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="reference" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Reference
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-full overflow-hidden mt-0">
                <Card className="border-t-0 rounded-tl-none rounded-tr-none h-full">
                  <CardHeader>
                    <CardTitle>Chat Features</CardTitle>
                    <CardDescription>
                      How the AI tutor can help with your studies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                      <h3 className="text-primary-700 text-sm font-medium mb-2">Answers to Questions</h3>
                      <p className="text-sm text-gray-600">
                        Ask questions about any academic subject and receive instant, detailed explanations.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-100">
                      <h3 className="text-secondary-700 text-sm font-medium mb-2">Exam Preparation</h3>
                      <p className="text-sm text-gray-600">
                        Get help preparing for tests with practice questions, concept explanations, and study tips.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <h3 className="text-yellow-700 text-sm font-medium mb-2">Learning Assistance</h3>
                      <p className="text-sm text-gray-600">
                        Receive step-by-step guidance through difficult problems or concepts you're struggling with.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-accent-50 rounded-lg border border-accent-100">
                      <h3 className="text-accent-700 text-sm font-medium mb-2">Reference Mode</h3>
                      <p className="text-sm text-gray-600">
                        Enable Reference Mode and upload materials for more context-aware and specific answers.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reference" className="h-full overflow-hidden mt-0">
                <Card className="border-t-0 rounded-tl-none rounded-tr-none h-full">
                  <CardHeader>
                    <CardTitle>Reference Materials</CardTitle>
                    <CardDescription>
                      Upload study materials for the AI to reference
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      accept=".pdf,.txt,.doc,.docx"
                      isLoading={false}
                      title="Drag & drop reference material"
                      description="or click to browse"
                    />
                    
                    {uploadedFile && (
                      <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-100">
                        <p className="font-medium">Reference Added:</p>
                        <p className="truncate">{uploadedFile.name}</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Or Paste Text</h3>
                      <Textarea
                        placeholder="Paste text content to reference..."
                        className="min-h-[150px]"
                        value={referenceContent}
                        onChange={(e) => setReferenceContent(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-gray-500">
                        {referenceMode ? "Reference mode is active" : "Reference mode is not active"}
                      </p>
                      <Button
                        size="sm"
                        variant={referenceMode ? "default" : "outline"}
                        onClick={() => setReferenceMode(!referenceMode)}
                        disabled={!referenceContent && !uploadedFile}
                      >
                        {referenceMode ? "Disable Reference Mode" : "Enable Reference Mode"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
