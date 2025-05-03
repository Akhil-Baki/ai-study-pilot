import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/types";
import { useToast } from "./use-toast";

/**
 * Custom hook for managing AI tutor chat functionality
 * @returns Functions and state for managing chat
 */
export function useChat() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat"],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      referenceContent,
    }: {
      content: string;
      referenceContent?: string;
    }) => {
      const response = await apiRequest("POST", "/api/chat", {
        content,
        referenceContent,
      });
      return response.json();
    },
    onMutate: () => {
      setIsSending(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setIsSending(false);
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Message Failed",
        description: (error as Error).message || "Failed to send message",
      });
      setIsSending(false);
    },
  });

  // Send a message to the AI tutor
  const sendMessage = async (
    content: string,
    referenceContent?: string
  ): Promise<void> => {
    if (!content.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({ content, referenceContent });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    isSending,
  };
}

export default useChat;
