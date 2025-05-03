import { useToast } from "@/hooks/use-toast";

/**
 * Extracts text content from a PDF file
 * @param file PDF file to extract text from
 * @returns Promise with the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== "application/pdf") {
      reject(new Error("Invalid or missing PDF file"));
      return;
    }

    const fileReader = new FileReader();
    
    fileReader.onload = async (event) => {
      try {
        // In a production app, we'd use pdf.js to extract text here
        // Since we're using the server for PDF parsing, we'll just 
        // return a placeholder indicating the file was read successfully
        const arrayBuffer = event.target?.result as ArrayBuffer;
        
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        resolve(`PDF content read successfully (${file.name}, ${formatBytes(file.size)})`);
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    fileReader.readAsArrayBuffer(file);
  });
}

/**
 * Upload a PDF file to the server for processing
 * @param file PDF file to upload
 * @param endpoint API endpoint to upload to
 * @returns Promise with the server response
 */
export async function uploadPDF(file: File, endpoint: string): Promise<any> {
  if (!file || file.type !== "application/pdf") {
    throw new Error("Invalid or missing PDF file");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
}

/**
 * Format bytes into a human-readable format
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Custom hook for handling PDF operations with toast notifications
 */
export function usePDF() {
  const toast = useToast();

  const extractText = async (file: File): Promise<string | null> => {
    try {
      return await extractTextFromPDF(file);
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "PDF Extraction Failed",
        description: (error as Error).message || "Failed to extract text from PDF",
      });
      return null;
    }
  };

  const uploadPDFWithToast = async (file: File, endpoint: string): Promise<any | null> => {
    try {
      return await uploadPDF(file, endpoint);
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "PDF Upload Failed",
        description: (error as Error).message || "Failed to upload PDF",
      });
      return null;
    }
  };

  return {
    extractText,
    uploadPDF: uploadPDFWithToast,
  };
}

export default usePDF;
