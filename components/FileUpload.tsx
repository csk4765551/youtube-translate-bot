'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      if (uploadedFile.size <= 10 * 1024 * 1024) {
        // 10MB limit
        setFile(uploadedFile);
      } else {
        toast({
          title: 'File too large',
          description: 'The maximum file size is 10MB.',
          variant: 'destructive',
        });
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      localStorage.setItem('translatedFilePath', data.filePath);

      toast({
        title: 'Translation completed',
        description:
          'Your file has been translated. You can now view the result.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while translating the file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <p>File selected: {file.name}</p>
        ) : isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag and drop a Word file here, or click to select a file</p>
        )}
      </div>
      {file && (
        <Button onClick={handleUpload} disabled={isUploading} className="mt-4">
          {isUploading ? 'Translating...' : 'Upload and Translate'}
        </Button>
      )}
    </div>
  );
}
