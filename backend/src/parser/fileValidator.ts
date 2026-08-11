export interface ValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export function validateResumeFile(buffer: Buffer, fileName: string): ValidationResult {
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      errorCode: 'EMPTY_FILE',
      errorMessage: 'The uploaded file is empty.',
    };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 10 MB.`,
    };
  }

  const lowerName = fileName.toLowerCase();
  const isPdfExtension = lowerName.endsWith('.pdf');
  const isDocxExtension = lowerName.endsWith('.docx') || lowerName.endsWith('.doc');

  if (!isPdfExtension && !isDocxExtension) {
    return {
      isValid: false,
      errorCode: 'INVALID_FILE_TYPE',
      errorMessage: 'Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.',
    };
  }

  if (isPdfExtension) {
    const signature = buffer.slice(0, 5).toString('ascii');
    if (!signature.startsWith('%PDF-')) {
      return {
        isValid: false,
        errorCode: 'CORRUPTED_PDF',
        errorMessage: 'The uploaded file extension is .pdf, but header signatures do not match a valid PDF document.',
      };
    }
  }

  if (isDocxExtension && lowerName.endsWith('.docx')) {
    const signature = buffer.slice(0, 4).toString('hex');
    if (signature !== '504b0304') {
      return {
        isValid: false,
        errorCode: 'CORRUPTED_DOCX',
        errorMessage: 'The uploaded file extension is .docx, but zip container signatures do not match a valid Word document.',
      };
    }
  }

  return { isValid: true };
}
