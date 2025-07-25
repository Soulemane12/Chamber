"use client";

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  maxFiles?: number;
  allowedFileTypes?: string[];
  className?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileUpload,
  maxFiles = 5,
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  className,
  label = 'Upload Files',
  description = 'Upload JotForms or other supporting documents'
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return allowedFileTypes.includes(fileExtension);
      });

      const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFileUpload(updatedFiles);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = newFiles.filter(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return allowedFileTypes.includes(fileExtension);
      });

      const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFileUpload(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onFileUpload(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{label}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept={allowedFileTypes.join(',')}
        />
        
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Accepted file types: {allowedFileTypes.join(', ')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Maximum {maxFiles} files
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 