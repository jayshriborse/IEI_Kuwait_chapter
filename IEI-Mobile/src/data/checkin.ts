import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import { getApiBaseUrl } from '@/utils/api';
import { getAuthToken, CANONICAL_MEMBERS, getVerifiedMember } from './member-session';

export interface CheckInRecord {
  id: string;
  memberId: string;
  name: string;
  seats: string;
  checkInTime: string;
  scannedAt: string;
  eventId: string;
  isAlreadyCheckedIn?: boolean;
  syncStatus: 'synced' | 'pending_sync' | 'syncing';
  isOfflineRecorded?: boolean;
  noRsvp?: boolean;
  duesOverdue?: boolean;
  manual?: boolean;
  volunteerMemberId?: string;
}

export interface CheckInProcessResult {
  success: boolean;
  data?: CheckInRecord;
  error?: string;
  isOffline?: boolean;
  syncStatus?: 'synced' | 'pending_sync';
  noRsvp?: boolean;
  duesOverdue?: boolean;
}

export interface OfflineRsvpItem {
  memberCode: string;
  name: string;
  seats: number;
  duesOverdue?: boolean;
}

export interface OfflinePackData {
  eventId: string;
  publicKey: string;
  downloadedAt: string;
  rsvps: Record<string, OfflineRsvpItem>;
}

const STORAGE_KEY = '@iei_door_checkins_v2';
const PUBLIC_KEY_STORAGE_KEY = '@iei_card_public_key';
const OFFLINE_PACK_STORAGE_PREFIX = '@iei_offline_pack_';
const SECURE_STORE_KEY = 'iei_offline_pack_key_v1';
const OFFLINE_PACK_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours auto-expiry

async function getOrCreatePackSecret(): Promise<string> {
  try {
    let key = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    if (!key) {
      const rand = nacl.randomBytes(32);
      key = Array.from(rand).map((b) => b.toString(16).padStart(2, '0')).join('');
      await SecureStore.setItemAsync(SECURE_STORE_KEY, key);
    }
    return key;
  } catch {
    return 'iei_secure_offline_pack_fallback_key_2026';
  }
}

function encryptPackPayload(dataStr: string, keyHex: string): string {
  const dataBytes = stringToUint8Array(dataStr);
  const keyBytes = stringToUint8Array(keyHex);
  const out = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    out[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  let binary = '';
  for (let i = 0; i < out.length; i++) {
    binary += String.fromCharCode(out[i]);
  }
  return btoa(binary);
}

function decryptPackPayload(cipherB64: string, keyHex: string): string {
  const binary = atob(cipherB64);
  const cipherBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    cipherBytes[i] = binary.charCodeAt(i);
  }
  const keyBytes = stringToUint8Array(keyHex);
  const out = new Uint8Array(cipherBytes.length);
  for (let i = 0; i < cipherBytes.length; i++) {
    out[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  let res = '';
  for (let i = 0; i < out.length; i++) {
    res += String.fromCharCode(out[i]);
  }
  return res;
}

export async function deleteOfflinePack(eventId: string): Promise<void> {
  delete cachedOfflinePacks[eventId];
  try {
    await AsyncStorage.removeItem(`${OFFLINE_PACK_STORAGE_PREFIX}${eventId}`);
  } catch {}
  notifyListeners();
}

// In-memory state synchronized with AsyncStorage
let localRecords: CheckInRecord[] = [];
let cachedOfflinePacks: Record<string, OfflinePackData> = {};
let cachedPublicKey: string | null = null;

let isInitialized = false;
let isOnline = true;
let isSimulatedOffline = false;
let isSyncing = false;

// Listeners for UI state reactivity
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.warn('Listener error in checkin store:', err);
    }
  });
}

export function subscribeCheckInState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Base64 / Base64URL string to Uint8Array helper
 */
function base64ToUint8Array(base64: string): Uint8Array {
  let b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function stringToUint8Array(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/**
 * Verifies an Ed25519 signed card token locally using tweetnacl
 */
export function verifyCardTokenLocally(
  token: string,
  publicKeyBase64: string,
): { isValid: boolean; memberCode?: string; error?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Token is required' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { isValid: false, error: 'Invalid token structure' };
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const message = `${headerB64}.${payloadB64}`;

  try {
    const messageBytes = stringToUint8Array(message);
    const signatureBytes = base64ToUint8Array(sigB64);
    const publicKeyBytes = base64ToUint8Array(publicKeyBase64);

    const isVerified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );

    if (!isVerified) {
      return { isValid: false, error: 'Invalid or tampered card token signature' };
    }

    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    const CLOCK_SKEW_ALLOWANCE_SECONDS = 300; // 5 minutes clock-skew allowance
    if (payload.expiry && now > payload.expiry + CLOCK_SKEW_ALLOWANCE_SECONDS) {
      return {
        isValid: false,
        error: 'Card token has expired',
        memberCode: payload.memberCode,
      };
    }

    return {
      isValid: true,
      memberCode: String(payload.memberCode).trim().toUpperCase(),
    };
  } catch (err: any) {
    return { isValid: false, error: `Token verification error: ${err.message}` };
  }
}

/**
 * Downloads offline check-in pack for an event.
 * Caches RSVP list and server Ed25519 public key inside encrypted storage.
 * Automatically deletes after 24 hours for privacy.
 */
export async function downloadOfflinePack(eventId: string): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  if (!eventId) {
    return { success: false, count: 0, error: 'Event ID is required' };
  }

  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/events/${eventId}/offline-pack`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        count: 0,
        error: err.message || 'Failed to download offline pack',
      };
    }

    const data = await res.json();
    const rsvpMap: Record<string, OfflineRsvpItem> = {};
    if (Array.isArray(data.rsvps)) {
      data.rsvps.forEach((item: any) => {
        if (item.memberCode) {
          const code = String(item.memberCode).trim().toUpperCase();
          rsvpMap[code] = {
            memberCode: code,
            name: item.name || `Member ${code}`,
            seats: item.seats || 1,
            duesOverdue: Boolean(item.duesOverdue),
          };
        }
      });
    }

    const packData: OfflinePackData = {
      eventId,
      publicKey: data.publicKey || '',
      downloadedAt: new Date().toISOString(),
      rsvps: rsvpMap,
    };

    cachedOfflinePacks[eventId] = packData;
    if (data.publicKey) {
      cachedPublicKey = data.publicKey;
      await AsyncStorage.setItem(PUBLIC_KEY_STORAGE_KEY, data.publicKey);
    }

    // Encrypt offline pack before persisting to local storage for attendee privacy
    const secretKey = await getOrCreatePackSecret();
    const encryptedCipher = encryptPackPayload(JSON.stringify(packData), secretKey);
    const envelope = {
      encrypted: true,
      cipher: encryptedCipher,
      downloadedAt: packData.downloadedAt,
      expiresAt: Date.now() + OFFLINE_PACK_MAX_AGE_MS,
    };

    await AsyncStorage.setItem(
      `${OFFLINE_PACK_STORAGE_PREFIX}${eventId}`,
      JSON.stringify(envelope),
    );

    notifyListeners();
    return { success: true, count: Object.keys(rsvpMap).length };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: err.message || 'Network error while downloading offline pack',
    };
  }
}

export function getOfflinePackInfo(eventId: string): OfflinePackData | null {
  const pack = cachedOfflinePacks[eventId];
  if (!pack) return null;
  const dlTime = pack.downloadedAt ? new Date(pack.downloadedAt).getTime() : 0;
  if (Date.now() - dlTime > OFFLINE_PACK_MAX_AGE_MS) {
    deleteOfflinePack(eventId);
    return null;
  }
  return pack;
}

/**
 * Initializes local storage, cached packs, and public key.
 */
export async function initCheckInStore(eventId?: string): Promise<void> {
  if (isInitialized) return;
  try {
    const [rawRecords, rawPubKey] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(PUBLIC_KEY_STORAGE_KEY),
    ]);

    if (rawRecords) {
      const parsed = JSON.parse(rawRecords);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localRecords = parsed;
      }
    }

    if (rawPubKey) {
      cachedPublicKey = rawPubKey;
    }

    // Load cached pack for event if provided, verifying 24-hour expiration
    if (eventId) {
      const rawPack = await AsyncStorage.getItem(`${OFFLINE_PACK_STORAGE_PREFIX}${eventId}`);
      if (rawPack) {
        try {
          const envelope = JSON.parse(rawPack);
          const dlTime = envelope.downloadedAt ? new Date(envelope.downloadedAt).getTime() : 0;
          const isExpired =
            Date.now() - dlTime > OFFLINE_PACK_MAX_AGE_MS ||
            (envelope.expiresAt && Date.now() > envelope.expiresAt);

          if (isExpired) {
            console.log(`[Offline Pack] Expired (>24h). Automatically purged for privacy.`);
            await deleteOfflinePack(eventId);
          } else if (envelope.encrypted && envelope.cipher) {
            const secretKey = await getOrCreatePackSecret();
            const decryptedJson = decryptPackPayload(envelope.cipher, secretKey);
            cachedOfflinePacks[eventId] = JSON.parse(decryptedJson);
          } else {
            cachedOfflinePacks[eventId] = envelope;
          }
        } catch {
          await deleteOfflinePack(eventId);
        }
      }
    }
  } catch (e) {
    console.warn('Could not read from AsyncStorage:', e);
  } finally {
    isInitialized = true;
    notifyListeners();
  }

  // Attempt initial sync in background if online
  if (eventId) {
    checkBackendHealth(eventId).then((online) => {
      if (online) {
        syncPendingCheckins(eventId);
      }
    });
  }
}

/**
 * Checks connectivity to the backend API.
 */
export async function checkBackendHealth(eventId: string): Promise<boolean> {
  if (isSimulatedOffline) {
    isOnline = false;
    notifyListeners();
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${getApiBaseUrl()}/events/card-token/public-key`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    isOnline = res.ok;
    notifyListeners();
    return res.ok;
  } catch {
    isOnline = false;
    notifyListeners();
    return false;
  }
}

/**
 * Process check-in for a member.
 * Works in both ONLINE and OFFLINE modes seamlessly!
 *
 * ONLINE: Sends scanned token/ID to backend -> backend verifies Ed25519 signature -> returns seat count from RSVP + warning flags.
 * OFFLINE: Verifies Ed25519 signature locally using cached public key -> looks up member in cached RSVP list -> assigns seats from RSVP.
 * If member has no RSVP or dues overdue: does NOT block check-in; returns warning flags for amber banner.
 */
export async function processMemberCheckin(
  rawPayload: string,
  eventId: string,
  options?: { isManual?: boolean; volunteerMemberId?: string },
): Promise<CheckInProcessResult> {
  if (!eventId) {
    return { success: false, error: 'Event ID is required for check-in' };
  }

  if (!isInitialized) {
    await initCheckInStore(eventId);
  }

  const rawTrimmed = (rawPayload || '').trim();
  if (!rawTrimmed) {
    return { success: false, error: 'Invalid QR code or Member ID' };
  }

  const verified = getVerifiedMember();
  const isTokenFormat = rawTrimmed.split('.').length === 3;
  const isManual = Boolean(options?.isManual || !isTokenFormat);
  const volunteerMemberId = options?.volunteerMemberId || verified?.memberCode;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  const scanIsoTime = now.toISOString();

  // 1. ATTEMPT ONLINE CHECK-IN (if not simulated offline)
  let backendResult: any = null;
  let shouldFallbackToOffline = isSimulatedOffline;

  if (!isSimulatedOffline) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/events/checkin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          memberCode: rawTrimmed,
          eventId,
          scannedAt: scanIsoTime,
          deviceOffline: false,
          manual: isManual,
          volunteerMemberId,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        backendResult = await response.json();
        isOnline = true;
      } else {
        const errorData = await response.json().catch(() => null);

        // If backend explicitly rejected invalid or tampered token, reject without falling back
        if (response.status === 400) {
          return {
            success: false,
            error: errorData?.message || 'Invalid or tampered card token',
          };
        }

        // If permission forbidden (staff role missing)
        if (response.status === 403) {
          return {
            success: false,
            error: errorData?.message || 'Access denied: staff role required',
          };
        }

        if (response.status === 404) {
          return {
            success: false,
            error: errorData?.message || 'Member record not found',
          };
        }

        shouldFallbackToOffline = true;
      }
    } catch {
      shouldFallbackToOffline = true;
    }
  }

  // CASE 1: ONLINE SUCCESS
  if (backendResult && backendResult.success) {
    const data = backendResult.data || {};
    const memberCode = data.memberCode || rawTrimmed;

    const existingLocal = localRecords.find(
      (r) => r.memberId === memberCode && r.eventId === eventId,
    );
    const isDuplicate = Boolean(existingLocal) || Boolean(backendResult.isAlreadyCheckedIn);

    const record: CheckInRecord = {
      id: data.id || `scan-${Date.now()}-${memberCode}`,
      memberId: memberCode,
      name: data.name || `Member ${memberCode}`,
      seats: data.seats || '1 seat',
      checkInTime: data.checkInTime || timeStr,
      scannedAt: data.scannedAt || scanIsoTime,
      eventId,
      isAlreadyCheckedIn: isDuplicate,
      syncStatus: 'synced',
      isOfflineRecorded: false,
      noRsvp: Boolean(backendResult.noRsvp ?? data.noRsvp),
      duesOverdue: Boolean(backendResult.duesOverdue ?? data.duesOverdue),
      manual: Boolean(data.manual ?? isManual),
      volunteerMemberId: data.volunteerMemberId || volunteerMemberId,
    };

    if (!existingLocal) {
      localRecords.unshift(record);
    } else {
      existingLocal.syncStatus = 'synced';
      existingLocal.isAlreadyCheckedIn = true;
      existingLocal.noRsvp = record.noRsvp;
      existingLocal.duesOverdue = record.duesOverdue;
      existingLocal.manual = record.manual;
      existingLocal.volunteerMemberId = record.volunteerMemberId;
    }

    await saveToStorage();
    notifyListeners();

    // Background sync of previous pending scans
    syncPendingCheckins(eventId).catch(() => {});

    return {
      success: true,
      data: record,
      isOffline: false,
      syncStatus: 'synced',
      noRsvp: record.noRsvp,
      duesOverdue: record.duesOverdue,
    };
  }

  // CASE 2: OFFLINE VERIFICATION & RECORDING
  isOnline = false;

  let resolvedMemberCode = '';

  if (isTokenFormat) {
    // Verify signature using cached public key
    const pubKey = cachedPublicKey || cachedOfflinePacks[eventId]?.publicKey;
    if (!pubKey) {
      return {
        success: false,
        error: 'Offline verification requires the offline pack. Please download the list for offline first.',
      };
    }

    const verification = verifyCardTokenLocally(rawTrimmed, pubKey);
    if (!verification.isValid || !verification.memberCode) {
      return {
        success: false,
        error: verification.error || 'Invalid or tampered card token',
      };
    }
    resolvedMemberCode = verification.memberCode;
  } else {
    // Manual Member ID fallback
    resolvedMemberCode = rawTrimmed.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!resolvedMemberCode) {
      return {
        success: false,
        error: 'Invalid member ID format',
      };
    }
  }

  // Check cached RSVP pack
  const pack = cachedOfflinePacks[eventId];
  const cachedRsvp = pack?.rsvps?.[resolvedMemberCode];

  let memberName = `Member ${resolvedMemberCode}`;
  let seatsCount = 1;
  let noRsvp = false;
  let duesOverdue = false;

  if (cachedRsvp) {
    memberName = cachedRsvp.name;
    seatsCount = cachedRsvp.seats || 1;
    noRsvp = false;
    duesOverdue = Boolean(cachedRsvp.duesOverdue);
  } else {
    // Scanned member has no RSVP
    noRsvp = true;
    seatsCount = 1;
    const canonical = CANONICAL_MEMBERS.find(
      (m) => m.memberCode.toUpperCase() === resolvedMemberCode,
    );
    if (canonical) {
      memberName = canonical.fullName;
      duesOverdue = canonical.duesStatus !== 'Active';
    }
  }

  const existingLocal = localRecords.find(
    (r) => r.memberId === resolvedMemberCode && r.eventId === eventId,
  );
  const isDuplicate = Boolean(existingLocal);

  const offlineRecord: CheckInRecord = {
    id: `offline-${Date.now()}-${resolvedMemberCode}`,
    memberId: resolvedMemberCode,
    name: memberName,
    seats: `${seatsCount} seat${seatsCount > 1 ? 's' : ''}`,
    checkInTime: timeStr,
    scannedAt: scanIsoTime,
    eventId,
    isAlreadyCheckedIn: isDuplicate,
    syncStatus: 'pending_sync',
    isOfflineRecorded: true,
    noRsvp,
    duesOverdue,
    manual: isManual,
    volunteerMemberId,
  };

  if (!existingLocal) {
    localRecords.unshift(offlineRecord);
  } else {
    existingLocal.isAlreadyCheckedIn = true;
    offlineRecord.isAlreadyCheckedIn = true;
    existingLocal.manual = offlineRecord.manual;
    existingLocal.volunteerMemberId = offlineRecord.volunteerMemberId;
  }

  await saveToStorage();
  notifyListeners();

  return {
    success: true,
    data: offlineRecord,
    isOffline: true,
    syncStatus: 'pending_sync',
    noRsvp,
    duesOverdue,
  };
}

/**
 * Synchronizes all pending offline scans to the backend.
 */
export async function syncPendingCheckins(eventId: string): Promise<{
  syncedCount: number;
  duplicateCount: number;
  success: boolean;
}> {
  if (!eventId) {
    return { syncedCount: 0, duplicateCount: 0, success: false };
  }

  if (isSyncing || isSimulatedOffline) {
    return { syncedCount: 0, duplicateCount: 0, success: false };
  }

  const pendingScans = localRecords.filter(
    (r) => r.syncStatus === 'pending_sync' && r.eventId === eventId,
  );

  if (pendingScans.length === 0) {
    return { syncedCount: 0, duplicateCount: 0, success: true };
  }

  isSyncing = true;
  notifyListeners();

  try {
    const payload = {
      eventId,
      scans: pendingScans.map((s) => ({
        memberCode: s.memberId,
        scannedAt: s.scannedAt,
        clientScanId: s.id,
        deviceOffline: true,
        manual: Boolean(s.manual),
        volunteerMemberId: s.volunteerMemberId,
      })),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/events/checkin/batch-sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      isOnline = true;

      // Mark pending records as synced
      pendingScans.forEach((scan) => {
        scan.syncStatus = 'synced';
      });

      await saveToStorage();
      notifyListeners();

      return {
        syncedCount: data.syncedCount || 0,
        duplicateCount: data.duplicateCount || 0,
        success: true,
      };
    } else {
      isOnline = false;
      return { syncedCount: 0, duplicateCount: 0, success: false };
    }
  } catch {
    isOnline = false;
    return { syncedCount: 0, duplicateCount: 0, success: false };
  } finally {
    isSyncing = false;
    notifyListeners();
  }
}

/**
 * Returns check-in statistics for the event.
 */
export function getCheckInStats(eventId?: string): {
  checkedInTotal: number;
  totalCapacity: number;
  pendingSyncCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  isSimulatedOffline: boolean;
} {
  const records = eventId ? localRecords.filter((r) => r.eventId === eventId) : localRecords;

  const uniqueCheckedInCount = new Set(records.map((r) => r.memberId)).size;
  const pendingCount = records.filter((r) => r.syncStatus === 'pending_sync').length;

  return {
    checkedInTotal: uniqueCheckedInCount,
    totalCapacity: 104,
    pendingSyncCount: pendingCount,
    isOnline,
    isSyncing,
    isSimulatedOffline,
  };
}

export function getCheckedInCount(eventId?: string): number {
  return getCheckInStats(eventId).checkedInTotal;
}

export function getPendingCount(eventId?: string): number {
  return getCheckInStats(eventId).pendingSyncCount;
}

export function getAllCheckInRecords(): CheckInRecord[] {
  return [...localRecords];
}

export function toggleSimulatedOffline(eventId?: string): boolean {
  isSimulatedOffline = !isSimulatedOffline;
  if (!isSimulatedOffline) {
    if (eventId) {
      checkBackendHealth(eventId).then((online) => {
        if (online) {
          syncPendingCheckins(eventId);
        }
      });
    }
  } else {
    isOnline = false;
  }
  notifyListeners();
  return isSimulatedOffline;
}

async function saveToStorage(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localRecords));
  } catch (e) {
    console.warn('Failed saving check-ins to AsyncStorage:', e);
  }
}
