"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TranslationResult() {
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const checkTranslationStatus = async () => {
      try {
        const response = await fetch('/api/translation-status');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'completed') {
            setResult(data.result);
          } else if (data.status === 'processing') {
            setTimeout(checkTranslationStatus, 5000); // Check again after 5 seconds
          }
        }
      } catch (error) {
        console.error('Error checking translation status:', error);
      }
    };

    checkTranslationStatus();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download-translation');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'translated_script.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading translation:', error);
    }
  };

  if (!result) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Translation Result</h2>
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>
      <Button onClick={handleDownload}>Download Translated Document</Button>
    </div>
  );
}