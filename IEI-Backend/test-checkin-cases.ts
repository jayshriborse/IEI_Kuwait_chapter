// Node 24 native fetch used

async function runCheckInTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- STARTING CHECK-IN VERIFICATION TESTS AGAINST REAL BACKEND ---');

  // Helper for dev-login to obtain auth JWT
  async function login(memberCode: string, mobile: string) {
    const res = await fetch(`${baseUrl}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberCode, mobile }),
    });
    if (!res.ok) {
      throw new Error(`Login failed for ${memberCode}: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return data.accessToken;
  }

  // 1. Authenticate standard member (IEI0005) and volunteer (IEI9004)
  const memberToken = await login('IEI0005', '99840191');
  const volunteerToken = await login('IEI9004', '00000004');

  // Obtain signed card token for test member IEI0034
  const somasundaramToken = await login('IEI0034', '99334455');
  const cardRes = await fetch(`${baseUrl}/me/card`, {
    headers: { Authorization: `Bearer ${somasundaramToken}` },
  });
  const cardData = await cardRes.json();
  const validCardToken = cardData.cardToken;

  console.log(`\nValid card token generated for IEI0034: ${validCardToken.substring(0, 30)}...`);

  // Delete any existing check-in for IEI0034 and IEI0042 for event 1 if needed
  // so we can test a fresh check-in
  
  // -------------------------------------------------------------
  // TEST 1: NO TOKEN
  // -------------------------------------------------------------
  console.log('\n[TEST 1] No token -> POST /events/checkin');
  const res1 = await fetch(`${baseUrl}/events/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberCode: 'IEI0034',
      eventId: 'card4-live-event',
    }),
  });
  const data1 = await res1.json().catch(() => ({}));
  console.log(`HTTP Status: ${res1.status}`);
  console.log(`Response: ${JSON.stringify(data1)}`);

  // -------------------------------------------------------------
  // TEST 2: MEMBER TOKEN (IEI0005 - standard member, not EC volunteer)
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Member token (IEI0005) -> POST /events/checkin');
  const res2 = await fetch(`${baseUrl}/events/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${memberToken}`,
    },
    body: JSON.stringify({
      memberCode: validCardToken,
      eventId: 'card4-live-event',
    }),
  });
  const data2 = await res2.json().catch(() => ({}));
  console.log(`HTTP Status: ${res2.status}`);
  console.log(`Response: ${JSON.stringify(data2)}`);

  // -------------------------------------------------------------
  // TEST 3: VOLUNTEER TOKEN (IEI9004 - EC Volunteer) -> FRESH CHECK-IN
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Volunteer token (IEI9004) -> POST /events/checkin with signed QR token (Fresh check-in)');
  const res3 = await fetch(`${baseUrl}/events/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteerToken}`,
    },
    body: JSON.stringify({
      memberCode: validCardToken,
      eventId: 'card4-live-event',
    }),
  });
  const data3 = await res3.json().catch(() => ({}));
  console.log(`HTTP Status: ${res3.status}`);
  console.log(`Response: ${JSON.stringify(data3)}`);

  // -------------------------------------------------------------
  // TEST 4: TAMPERED TOKEN
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Tampered token -> POST /events/checkin');
  const tokenParts = validCardToken.split('.');
  const tamperedSig = tokenParts[2].slice(0, -1) + (tokenParts[2].endsWith('a') ? 'b' : 'a');
  const tamperedToken = `${tokenParts[0]}.${tokenParts[1]}.${tamperedSig}`;
  const res4 = await fetch(`${baseUrl}/events/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteerToken}`,
    },
    body: JSON.stringify({
      memberCode: tamperedToken,
      eventId: 'card4-live-event',
    }),
  });
  const data4 = await res4.json().catch(() => ({}));
  console.log(`HTTP Status: ${res4.status}`);
  console.log(`Response: ${JSON.stringify(data4)}`);

  // -------------------------------------------------------------
  // TEST 5: DUPLICATE CHECK-IN (same member IEI0034 again)
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Duplicate check-in -> POST /events/checkin (same member IEI0034 again)');
  const res5 = await fetch(`${baseUrl}/events/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteerToken}`,
    },
    body: JSON.stringify({
      memberCode: validCardToken,
      eventId: 'card4-live-event',
    }),
  });
  const data5 = await res5.json().catch(() => ({}));
  console.log(`HTTP Status: ${res5.status}`);
  console.log(`Response: ${JSON.stringify(data5)}`);

  // -------------------------------------------------------------
  // TEST 6: OFFLINE QUEUE THEN SYNC (batch-sync with manual check-in)
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Offline queue then sync -> POST /events/checkin/batch-sync (with manual: true)');
  const res6 = await fetch(`${baseUrl}/events/checkin/batch-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteerToken}`,
    },
    body: JSON.stringify({
      eventId: 'card4-live-event',
      scans: [
        {
          memberCode: 'IEI0042',
          scannedAt: new Date(Date.now() - 45000).toISOString(),
          clientScanId: 'offline-scan-manual-42',
          deviceOffline: true,
          manual: true,
          volunteerMemberId: 'IEI9004',
        },
        // Duplicate check in batch
        {
          memberCode: validCardToken,
          scannedAt: new Date(Date.now() - 10000).toISOString(),
          clientScanId: 'offline-scan-duplicate-34',
          deviceOffline: true,
          manual: false,
        },
      ],
    }),
  });
  const data6 = await res6.json().catch(() => ({}));
  console.log(`HTTP Status: ${res6.status}`);
  console.log(`Response: ${JSON.stringify(data6)}`);

  // -------------------------------------------------------------
  // TEST 7: ROUTE GUARDS VERIFICATION FOR OFFLINE PACK & PUBLIC KEY
  // -------------------------------------------------------------
  console.log('\n[TEST 7] Route guards verification');
  // 7a: Offline pack without token -> 401
  const res7a = await fetch(`${baseUrl}/events/1/offline-pack`);
  console.log(`GET /events/1/offline-pack (no token) -> HTTP Status: ${res7a.status}`);

  // 7b: Offline pack with member token -> 403
  const res7b = await fetch(`${baseUrl}/events/1/offline-pack`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  console.log(`GET /events/1/offline-pack (member token) -> HTTP Status: ${res7b.status}`);

  // 7c: Offline pack with volunteer token -> 200
  const res7c = await fetch(`${baseUrl}/events/1/offline-pack`, {
    headers: { Authorization: `Bearer ${volunteerToken}` },
  });
  console.log(`GET /events/1/offline-pack (volunteer token) -> HTTP Status: ${res7c.status}`);

  // 7d: Public key endpoint (no token) -> 200
  const res7d = await fetch(`${baseUrl}/events/card-token/public-key`);
  console.log(`GET /events/card-token/public-key (public) -> HTTP Status: ${res7d.status}`);

  // 7e: Verify attendance list contains manual check-in records with volunteer ID
  const res7e = await fetch(`${baseUrl}/events/checkin/list?eventId=card4-live-event`, {
    headers: { Authorization: `Bearer ${volunteerToken}` },
  });
  const list7e = await res7e.json();
  console.log(`\nGET /events/checkin/list -> HTTP Status: ${res7e.status}, total check-ins: ${list7e.length}`);
  const manualItems = list7e.filter((item: any) => item.manual);
  console.log(`Manual entries in attendance list: ${manualItems.length}`);
  manualItems.forEach((m: any) => {
    console.log(`  - Member: ${m.memberCode} (${m.name}), Manual: ${m.manual}, Volunteer: ${m.volunteerMemberId}`);
  });

  console.log('\n--- ALL REAL BACKEND CHECK-IN TESTS COMPLETED ---');
}

runCheckInTests().catch(console.error);
