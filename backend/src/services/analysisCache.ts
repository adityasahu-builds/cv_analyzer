import crypto from 'crypto';
import { ResumeAnalysisReport } from '../types/resume';
import { SCORING_VERSION } from './deterministicScorer';

export interface CachedAnalysisEntry {
  cacheKey: string;
  resumeHash: string;
  jobDescriptionHash: string;
  scoringVersion: string;
  provider: string;
  model: string;
  report: ResumeAnalysisReport;
  createdAt: string;
}

class AnalysisCache {
  private cache = new Map<string, CachedAnalysisEntry>();
  private readonly maxEntries = 200;

  /**
   * Generates a stable analysis identity key for caching.
   */
  generateCacheKey(
    resumeHash: string,
    jobDescriptionHash: string = 'no_jd',
    provider: string = 'gemini',
    model: string = 'gemini-3.6-flash'
  ): string {
    const rawString = `${resumeHash}_${jobDescriptionHash}_${SCORING_VERSION}_${provider.toLowerCase()}_${model.toLowerCase()}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Gets a cached analysis if exact match exists.
   */
  get(cacheKey: string): CachedAnalysisEntry | undefined {
    const entry = this.cache.get(cacheKey);
    if (entry) {
      console.log(`[AnalysisCache] HIT for key ${cacheKey.substring(0, 10)}... (ResumeHash: ${entry.resumeHash.substring(0, 10)}...)`);
    } else {
      console.log(`[AnalysisCache] MISS for key ${cacheKey.substring(0, 10)}...`);
    }
    return entry;
  }

  /**
   * Stores an analysis report in cache.
   */
  set(
    cacheKey: string,
    resumeHash: string,
    jobDescriptionHash: string,
    provider: string,
    model: string,
    report: ResumeAnalysisReport
  ): void {
    // Evict oldest if max size reached
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const entry: CachedAnalysisEntry = {
      cacheKey,
      resumeHash,
      jobDescriptionHash,
      scoringVersion: SCORING_VERSION,
      provider,
      model,
      report,
      createdAt: new Date().toISOString(),
    };

    this.cache.set(cacheKey, entry);
    console.log(`[AnalysisCache] STORED entry for key ${cacheKey.substring(0, 10)}... (Total cached: ${this.cache.size})`);
  }

  /**
   * Clears the cache (useful for testing).
   */
  clear(): void {
    this.cache.clear();
    console.log('[AnalysisCache] Cache cleared.');
  }

  /**
   * Returns current cache size.
   */
  size(): number {
    return this.cache.size;
  }
}

export const analysisCache = new AnalysisCache();
