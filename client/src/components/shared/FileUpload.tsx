import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export default function FileUpload({
  onFileUpload,
  accept = ".pdf,.txt,.doc,.docx",
  isLoading = false,
  title = "Drag & drop your file here",
  description = "or click to browse"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check if file type is accepted
    if (accept !== "*") {
      const acceptedTypes = accept.split(",");
      const fileType = file.type;
      const fileExtension = `.${file.name.split(".").pop()}`;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith(".")) {
          // Check for file extension
          return fileExtension.toLowerCase() === type.toLowerCase();
        } else {
          // Check for MIME type
          return fileType.match(new RegExp(type.replace("*", ".*")));
        }
      });
      
      if (!isAccepted) {
        alert(`File type not accepted. Please upload a file with one of these extensions: ${accept}`);
        return;
      }
    }
    
    onFileUpload(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-500"
      } transition-colors duration-200 cursor-pointer`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileInputChange}
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center py-4">
        <UploadCloud className={`h-12 w-12 mb-4 ${
          isDragging ? "text-primary-500" : "text-gray-400"
        }`} />
        
        <p className="text-lg font-medium mb-1">{title}</p>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 mr-2" />
            <span>Uploading...</span>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm">
            Select File
          </Button>
        )}
      </div>
    </div>
  );
}
