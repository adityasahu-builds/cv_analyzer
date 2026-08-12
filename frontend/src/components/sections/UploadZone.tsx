'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
      setError('Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-8 md:p-10 mx-auto max-w-2xl">
        {selectedFile ? (
          /* Selected File State */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-[10px]">
              <div className="w-10 h-10 rounded-[8px] bg-[#059669]/10 border border-[#059669]/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#059669]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A1A1A] truncate">{selectedFile.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{formatFileSize(selectedFile.size)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#059669] bg-[#059669]/10 border border-[#059669]/30 rounded-[8px] px-2.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validated
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                disabled={isAnalyzing}
                className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] rounded-[8px] hover:bg-[#E5E7EB]/50 transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              isLoading={isAnalyzing}
              className="w-full justify-center text-base"
            >
              Analyze Resume
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          /* Dropzone */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-[12px] p-10 text-center cursor-pointer transition-all duration-150',
              dragActive
                ? 'border-[#059669] bg-[#059669]/10'
                : 'border-[#E5E7EB] hover:border-[#059669] hover:bg-[#F7F8FA]'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-[10px] flex items-center justify-center transition-colors',
                dragActive ? 'bg-[#059669]/20 text-[#059669]' : 'bg-[#F7F8FA] border border-[#E5E7EB] text-[#6B7280]'
              )}>
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  Drag and drop your resume, or{' '}
                  <span className="text-[#059669] hover:text-[#047857] underline underline-offset-2">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-[#6B7280] mt-1">PDF or DOCX, up to 10MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-[10px] px-3.5 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#6B7280]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
          <span>Your resume is analyzed privately in-memory and never stored</span>
        </div>
      </div>
    </div>
  );
};
