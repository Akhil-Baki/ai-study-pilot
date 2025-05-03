import { Summary } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Clipboard, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SummaryViewProps {
  summary: Summary;
  onBack: () => void;
}

export default function SummaryView({ summary, onBack }: SummaryViewProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Format summary content based on type (bullet points or paragraphs)
  const formatSummaryContent = (content: string) => {
    if (content.includes("•") || content.includes("-")) {
      // Likely bullet points
      return (
        <ul className="list-disc pl-5 space-y-2">
          {content.split(/\n+/).filter(Boolean).map((item, idx) => {
            // Remove bullet symbols if they exist
            const cleanItem = item.replace(/^[-•*]\s+/, "");
            return cleanItem.trim() ? <li key={idx}>{cleanItem}</li> : null;
          })}
        </ul>
      );
    } else {
      // Paragraphs
      return (
        <div className="space-y-4">
          {content.split(/\n\n+/).filter(Boolean).map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      );
    }
  };

  // Copy summary to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary.summary);
    toast.toast({
      title: "Copied to clipboard",
      description: "The summary has been copied to your clipboard.",
    });
  };

  // Delete summary mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/summaries/${id}`, undefined);
    },
    onSuccess: () => {
      toast.toast({
        title: "Summary deleted",
        description: "The summary has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      onBack();
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Delete failed",
        description: (error as Error).message || "Failed to delete summary. Please try again.",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this summary?")) {
      deleteMutation.mutate(summary.id);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Summaries
        </Button>
        <CardTitle>{summary.title}</CardTitle>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-500">
            Created on {format(new Date(summary.createdAt), "PPP")}
          </span>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleCopyToClipboard}>
              <Clipboard className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          {formatSummaryContent(summary.summary)}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full">
          <h3 className="text-sm font-medium mb-2">Original Length vs. Summary</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (summary.summary.length / summary.originalContent.length) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {Math.round((summary.summary.length / summary.originalContent.length) * 100)}% of original
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
