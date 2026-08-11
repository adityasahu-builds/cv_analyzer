import { Router, Request, Response } from 'express';
import multer from 'multer';
import { validateResumeFile } from '../parser/fileValidator';
import { parseResumeBuffer } from '../parser/resumeParser';
import { ParseApiResponse } from '../types/resume';

const router = Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  const startTime = Date.now();
  const file = req.file;

  if (!file) {
    console.warn('[API /api/parse] Missing uploaded file.');
    const errorResponse: ParseApiResponse = {
      success: false,
      error: {
        code: 'MISSING_FILE',
        message: 'No file uploaded. Please select a PDF or DOCX resume document.',
      },
    };
    return res.status(400).json(errorResponse);
  }

  const fileName = file.originalname;
  const mimeType = file.mimetype;
  const buffer = file.buffer;

  // Validate File (Type, Size, Empty, Signature)
  const validation = validateResumeFile(buffer, fileName);
  if (!validation.isValid) {
    console.warn(`[API /api/parse] Validation failed for '${fileName}':`, validation.errorMessage);
    const statusCode = validation.errorCode === 'INVALID_FILE_TYPE' ? 415 : 400;
    const errorResponse: ParseApiResponse = {
      success: false,
      error: {
        code: validation.errorCode || 'INVALID_FILE',
        message: validation.errorMessage || 'File validation failed.',
      },
    };
    return res.status(statusCode).json(errorResponse);
  }

  try {
    const parsedData = await parseResumeBuffer(buffer, fileName);
    const durationMs = Date.now() - startTime;
    const characterCount = parsedData.rawText ? parsedData.rawText.length : 0;
    const wordCount = parsedData.rawText ? parsedData.rawText.split(/\s+/).filter(Boolean).length : 0;
    const hasPdfBase64 = Boolean(parsedData.pdfBase64 && parsedData.pdfBase64.length > 0);

    console.log(`[API /api/parse] Extracted file '${fileName}': sizeBytes=${buffer.length}, rawTextLength=${characterCount}, words=${wordCount}, hasPdfBase64=${hasPdfBase64}, isVisual=${Boolean(parsedData.isVisualResume)}, durationMs=${durationMs}`);

    // Validation boundary: Allow PDF documents with pdfBase64 OR text >= 20 chars
    if (characterCount < 20 && !hasPdfBase64) {
      console.warn(`[API /api/parse] Document text length (${characterCount}) is too short and no visual PDF available.`);
      return res.status(422).json({
        success: false,
        error: "Couldn't read text from this resume. Please upload a valid text or visual PDF or DOCX file.",
      });
    }

    const responseData: ParseApiResponse = {
      success: true,
      data: parsedData,
      meta: {
        fileName,
        fileSizeBytes: buffer.length,
        mimeType: mimeType || 'application/octet-stream',
        parsedAt: new Date().toISOString(),
        characterCount,
        wordCount,
        durationMs,
      },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[API /api/parse] Exception after ${durationMs}ms:`, errorMessage);

    return res.status(422).json({
      success: false,
      error: `Couldn't read this resume file: ${errorMessage}`,
    });
  }
});

export default router;
