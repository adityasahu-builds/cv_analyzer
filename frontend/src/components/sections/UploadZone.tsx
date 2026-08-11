'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface UploadZoneProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onAnalyze, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setError('Please upload a valid PDF or DOCX resume file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <Card className="p-6 md:p-10 border border-white/10 bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="text-center max-w-xl mx-auto mb-8">
        <Badge variant="cyan" className="mb-3">
          <Zap className="w-3 h-3 mr-1.5" /> Instant AI Parsing
        </Badge>
        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Upload Your Resume
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          Drop your PDF or DOCX resume to extract instant ATS scoring, keyword match analysis, and recommendations.
        </p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 relative group',
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-white/15 hover:border-cyan-500/50 hover:bg-white/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10 animate-in zoom-in-95 duration-200">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">{selectedFile.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Analysis
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="cyan" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Validated Format
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">
                Drag & Drop your resume here, or <span className="text-cyan-400 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF & DOCX formats up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Privacy Guaranteed: Files are processed securely in memory</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedFile && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setSelectedFile(null)}
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Reset
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleStartAnalysis}
            disabled={!selectedFile || isAnalyzing}
            isLoading={isAnalyzing}
            className="w-full sm:w-auto px-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume IQ'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
