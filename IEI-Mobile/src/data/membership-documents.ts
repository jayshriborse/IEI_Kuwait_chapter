import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '@/utils/api';
import { getAuthToken } from './member-session';

const DRAFT_APP_ID_KEY = '@iei_draft_app_id_v1';
const DRAFT_APP_TOKEN_KEY = '@iei_draft_app_token_v1';

export type RequiredDocumentType =
  | 'DEGREE_CERTIFICATE'
  | 'PASSPORT_COPY'
  | 'CIVIL_ID'
  | 'PHOTOGRAPH';

export interface UploadedDocumentRecord {
  id: string;
  documentType: RequiredDocumentType;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface DraftApplicationSession {
  applicationId: string;
  applicationNumber: string;
  applicantToken: string;
  documents: UploadedDocumentRecord[];
}

/**
 * Initializes or restores an active draft application from backend & local storage
 */
export async function initOrGetDraftApplication(params?: {
  fullName?: string;
  mobile?: string;
  email?: string;
}): Promise<DraftApplicationSession | null> {
  try {
    const [storedId, storedToken] = await Promise.all([
      AsyncStorage.getItem(DRAFT_APP_ID_KEY),
      AsyncStorage.getItem(DRAFT_APP_TOKEN_KEY),
    ]);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (storedToken) {
      headers['x-applicant-token'] = storedToken;
    }

    const res = await fetch(`${getApiBaseUrl()}/membership/applications/draft`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        applicationId: storedId || undefined,
        applicantToken: storedToken || undefined,
        fullName: params?.fullName,
        mobile: params?.mobile,
        email: params?.email,
      }),
    });

    if (!res.ok) {
      // If previous draft was invalid/expired, create fresh draft
      const freshRes = await fetch(`${getApiBaseUrl()}/membership/applications/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!freshRes.ok) return null;
      const freshData = await freshRes.json();
      await Promise.all([
        AsyncStorage.setItem(DRAFT_APP_ID_KEY, freshData.applicationId),
        AsyncStorage.setItem(DRAFT_APP_TOKEN_KEY, freshData.applicantToken),
      ]);
      return {
        applicationId: freshData.applicationId,
        applicationNumber: freshData.applicationNumber,
        applicantToken: freshData.applicantToken,
        documents: freshData.documents || [],
      };
    }

    const data = await res.json();
    await Promise.all([
      AsyncStorage.setItem(DRAFT_APP_ID_KEY, data.applicationId),
      AsyncStorage.setItem(DRAFT_APP_TOKEN_KEY, data.applicantToken),
    ]);

    return {
      applicationId: data.applicationId,
      applicationNumber: data.applicationNumber,
      applicantToken: data.applicantToken,
      documents: data.documents || [],
    };
  } catch (err) {
    console.warn('Could not init draft application:', err);
    return null;
  }
}

/**
 * Fetches the uploaded documents for an application from the backend
 */
export async function fetchApplicationDocuments(
  applicationId: string,
  applicantToken?: string,
): Promise<UploadedDocumentRecord[]> {
  try {
    const headers: Record<string, string> = {};
    if (applicantToken) {
      headers['x-applicant-token'] = applicantToken;
    }
    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(
      `${getApiBaseUrl()}/membership/applications/${applicationId}/documents`,
      { headers },
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.documents || [];
  } catch (err) {
    console.warn('Error fetching application documents:', err);
    return [];
  }
}

/**
 * Uploads a document to the backend using multipart/form-data
 */
export async function uploadApplicationDocument(params: {
  applicationId: string;
  applicantToken?: string;
  documentType: RequiredDocumentType;
  fileUri: string;
  fileName: string;
  mimeType?: string;
}): Promise<{
  success: boolean;
  document?: UploadedDocumentRecord;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('documentType', params.documentType);
    if (params.applicantToken) {
      formData.append('applicantToken', params.applicantToken);
    }

    let detectedMime = params.mimeType;
    if (!detectedMime) {
      const ext = params.fileName.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') detectedMime = 'application/pdf';
      else if (ext === 'jpg' || ext === 'jpeg') detectedMime = 'image/jpeg';
      else if (ext === 'png') detectedMime = 'image/png';
      else detectedMime = 'application/octet-stream';
    }

    formData.append('file', {
      uri: params.fileUri,
      name: params.fileName,
      type: detectedMime,
    } as any);

    const headers: Record<string, string> = {};
    if (params.applicantToken) {
      headers['x-applicant-token'] = params.applicantToken;
    }
    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(
      `${getApiBaseUrl()}/membership/applications/${params.applicationId}/documents`,
      {
        method: 'POST',
        headers,
        body: formData,
      },
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: Array.isArray(data.message) ? data.message.join(', ') : (data.message || `Upload failed (${res.status})`),
      };
    }

    return {
      success: true,
      document: data.document,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while uploading document',
    };
  }
}

/**
 * Removes an uploaded document from the backend
 */
export async function deleteApplicationDocument(params: {
  applicationId: string;
  applicantToken?: string;
  documentType: RequiredDocumentType;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (params.applicantToken) {
      headers['x-applicant-token'] = params.applicantToken;
    }
    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(
      `${getApiBaseUrl()}/membership/applications/${params.applicationId}/documents/${params.documentType}`,
      {
        method: 'DELETE',
        headers,
      },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || 'Failed to remove document' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error while removing document' };
  }
}

/**
 * Submits the final application with backend validation that all 4 documents exist
 */
export async function submitApplicationWithDocuments(
  payload: {
    applicationId: string;
    applicantToken?: string;
    discipline: string;
    employer: string;
    designation: string;
    experienceYears?: number;
    qualification: string;
    applicantName: string;
    applicantMobile: string;
    applicantEmail: string;
    referredBy?: string;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (payload.applicantToken) {
      headers['x-applicant-token'] = payload.applicantToken;
    }
    const authToken = getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/membership/application`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: Array.isArray(data.message) ? data.message.join(', ') : (data.message || `Submission failed (${res.status})`),
      };
    }

    // Clean up draft keys upon completed submission
    await Promise.all([
      AsyncStorage.removeItem(DRAFT_APP_ID_KEY).catch(() => {}),
      AsyncStorage.removeItem(DRAFT_APP_TOKEN_KEY).catch(() => {}),
    ]);

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error while submitting application' };
  }
}
