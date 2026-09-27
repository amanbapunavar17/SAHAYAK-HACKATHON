import {
  ImageProcessingResponse,
  ComparisonResult,
  MultiMatchResponse,
  ProcessedItem,
  CandidatePayload
} from './api-contracts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class VisionApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Process an image with YOLOv8, OpenCLIP, Hashes, and ORB
   */
  async processImage(file: File | Blob, compact: boolean = false): Promise<ImageProcessingResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseUrl}/api/v1/vision/process?compact=${compact}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Vision processing failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Directly compare two images with multi-signal visual AI
   */
  async compareImages(fileA: File | Blob, fileB: File | Blob): Promise<ComparisonResult> {
    const formData = new FormData();
    formData.append('image_a', fileA);
    formData.append('image_b', fileB);

    const url = `${this.baseUrl}/api/v1/vision/compare`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Image comparison failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Rank candidate items against query item features
   */
  async matchCandidates(queryItem: ProcessedItem, candidates: CandidatePayload[]): Promise<MultiMatchResponse> {
    const url = `${this.baseUrl}/api/v1/vision/match`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_item: queryItem,
        candidates: candidates,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Visual candidate matching failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get loaded AI models and detection thresholds
   */
  async getModelMetadata(): Promise<any> {
    const url = `${this.baseUrl}/api/v1/vision/models`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch model metadata: ${response.status}`);
    }
    return response.json();
  }
}

export const visionApi = new VisionApiClient();
