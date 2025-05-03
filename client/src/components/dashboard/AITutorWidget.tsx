import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function AITutorWidget() {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, isSending } = useChat();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    try {
      await sendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Card className="h-[440px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>AI Tutor</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-end">
                <div className="bg-accent-100 rounded-lg rounded-bl-none p-3 max-w-[85%]">
                  <p className="text-sm text-gray-800">Hello! How can I help with your studies today?</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs ml-2">
                  AI
                </div>
              </div>
            ) : (
              messages.slice(0, 4).map((msg, idx) => (
                <div key={idx} className={`flex items-end ${msg.isUserMessage ? 'justify-end' : ''}`}>
                  {msg.isUserMessage ? (
                    <div className="bg-gray-100 rounded-lg rounded-br-none p-3 max-w-[85%]">
                      <p className="text-sm text-gray-800">{msg.content}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-accent-100 rounded-lg rounded-bl-none p-3 max-w-[85%]">
                        <p className="text-sm text-gray-800">{
                          msg.content.length > 200 
                            ? `${msg.content.substring(0, 200)}...` 
                            : msg.content
                        }</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs ml-2">
                        AI
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
            
            {isSending && (
              <div className="flex items-end">
                <div className="bg-accent-100 rounded-lg rounded-bl-none p-3 max-w-[85%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs ml-2">
                  AI
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 bg-white overflow-hidden flex-1">
              <Input 
                type="text" 
                placeholder="Ask a question..." 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-none"
                disabled={!message.trim() || isSending}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Tip: Upload study materials to improve answers</span>
            <Link href="/ai-tutor">
              <span className="flex items-center cursor-pointer text-primary-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Full Tutor
              </span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
