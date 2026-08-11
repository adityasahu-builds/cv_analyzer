import { Router, Request, Response } from 'express';
import { ParsedResumeSchema, AnalyzeApiResponse } from '../types/resume';
import { aiOrchestrator, AIOrchestrationError } from '../ai/aiOrchestrator';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const correlationId = (req.headers['x-correlation-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    const body = req.body;
    const parseResult = ParsedResumeSchema.safeParse(body);

    if (!parseResult.success) {
      console.warn(`[API /api/analyze] [${correlationId}] Zod validation error:`, parseResult.error.format());
      return res.status(400).json({
        success: false,
        error: 'Invalid parsed resume payload structure provided.',
        category: 'SCHEMA_VALIDATION_ERROR',
        correlationId,
        durationMs: Date.now() - startTime,
      });
    }

    const data = parseResult.data;
    const rawTextLength = data.rawText ? data.rawText.trim().length : 0;
    const hasPdfBase64 = Boolean(data.pdfBase64 && data.pdfBase64.length > 0);

    console.log(`[API /api/analyze] [${correlationId}] Analyzing resume: rawTextLength=${rawTextLength}, hasPdfBase64=${hasPdfBase64}, isVisual=${Boolean(data.isVisualResume)}`);

    const result = await aiOrchestrator.analyzeResume(data, correlationId);
    const durationMs = Date.now() - startTime;

    console.log(`[API /api/analyze] [${correlationId}] Succeeded in ${durationMs}ms: Provider=${result.provider}, FallbackUsed=${result.fallbackUsed}, OverallScore=${result.report.overallScore}`);

    const response: AnalyzeApiResponse = {
      success: true,
      data: {
        atsReport: result.report,
        aiStatus: {
          aiAvailable: true,
          fallbackUsed: result.fallbackUsed,
          provider: result.provider,
        },
      },
      correlationId,
      durationMs,
    };

    return res.status(200).json(response);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    let errorMessage = error instanceof Error ? error.message : 'Unknown analysis error';
    let category = 'AI_ANALYSIS_ERROR';

    if (error instanceof AIOrchestrationError) {
      category = 'ORCHESTRATION_FAILURE';
      console.error(`[API /api/analyze] [${correlationId}] Orchestration failed after ${durationMs}ms:`, {
        primaryProvider: error.primaryProvider,
        primaryError: error.primaryError,
        fallbackProvider: error.fallbackProvider,
        fallbackError: error.fallbackError,
      });
    } else {
      console.error(`[API /api/analyze] [${correlationId}] Exception after ${durationMs}ms:`, errorMessage);
    }

    return res.status(502).json({
      success: false,
      error: `AI analysis failed: ${errorMessage}`,
      category,
      correlationId,
      durationMs,
    });
  }
});

export default router;
