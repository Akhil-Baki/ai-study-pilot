import { useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatInterface({ messages, isLoading }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Format AI message content
  const formatAIMessage = (content: string) => {
    // Check if content contains code blocks
    if (content.includes("```")) {
      const parts = content.split(/(```[\s\S]*?```)/g);
      return (
        <>
          {parts.map((part, idx) => {
            if (part.startsWith("```") && part.endsWith("```")) {
              // Extract code and language
              const match = part.match(/```(\w*)\n([\s\S]*?)```/);
              if (match) {
                const [, language, code] = match;
                return (
                  <div key={idx} className="my-2 bg-gray-800 rounded-md overflow-hidden">
                    {language && (
                      <div className="px-4 py-1 bg-gray-700 text-gray-200 text-xs">
                        {language}
                      </div>
                    )}
                    <pre className="p-4 text-gray-200 overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                  </div>
                );
              }
            }
            
            // Check for bullet points
            if (part.includes("\n- ") || part.includes("\n* ")) {
              const lines = part.split("\n");
              return (
                <div key={idx} className="my-2">
                  {lines.map((line, lineIdx) => {
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                      return (
                        <div key={lineIdx} className="flex items-start mb-1">
                          <span className="mr-2">•</span>
                          <span>{line.substring(2)}</span>
                        </div>
                      );
                    }
                    return <p key={lineIdx} className="mb-2">{line}</p>;
                  })}
                </div>
              );
            }
            
            return <p key={idx} className="mb-2">{part}</p>;
          })}
        </>
      );
    }
    
    // Handle bullet points for messages without code blocks
    if (content.includes("\n- ") || content.includes("\n* ")) {
      const lines = content.split("\n");
      return (
        <>
          {lines.map((line, idx) => {
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <div key={idx} className="flex items-start mb-1">
                  <span className="mr-2">•</span>
                  <span>{line.substring(2)}</span>
                </div>
              );
            }
            return <p key={idx} className="mb-2">{line}</p>;
          })}
        </>
      );
    }
    
    // Simple paragraph rendering
    return content.split("\n\n").map((paragraph, idx) => (
      <p key={idx} className="mb-2">{paragraph}</p>
    ));
  };

  return (
    <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
      <div className="space-y-4">
        {/* Initial greeting message if no messages */}
        {!isLoading && messages.length === 0 && (
          <div className="flex items-end">
            <div className="bg-accent-100 rounded-lg rounded-bl-none p-3 max-w-[85%]">
              <p className="text-sm text-gray-800">Hello! I'm your AI tutor. How can I help with your studies today?</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs ml-2">
              AI
            </div>
          </div>
        )}
        
        {/* Loading skeleton */}
        {isLoading && messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex items-end">
              <Skeleton className="h-20 w-64 rounded-lg rounded-bl-none" />
              <Skeleton className="w-6 h-6 rounded-full ml-2" />
            </div>
          </div>
        )}
        
        {/* Message history */}
        {messages.map((message, idx) => (
          <div 
            key={idx} 
            className={`flex items-end ${message.isUserMessage ? 'justify-end' : ''}`}
          >
            {message.isUserMessage ? (
              <div className="bg-gray-100 rounded-lg rounded-br-none p-3 max-w-[85%]">
                <p className="text-sm text-gray-800">{message.content}</p>
              </div>
            ) : (
              <>
                <div className="bg-accent-100 rounded-lg rounded-bl-none p-3 max-w-[85%]">
                  <div className="text-sm text-gray-800">
                    {formatAIMessage(message.content)}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs ml-2">
                  AI
                </div>
              </>
            )}
          </div>
        ))}
        
        {/* Message thinking indicator */}
        {isLoading && messages.length > 0 && (
          <div className="flex items-end">
            <div className="bg-accent-100 rounded-lg rounded-bl-none p-3">
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
    </ScrollArea>
  );
}
