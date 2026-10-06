import http from 'http';

function makeRequest(options: http.RequestOptions, postData?: string): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode || 0, data: JSON.parse(body) });
        } catch {
          resolve({ statusCode: res.statusCode || 0, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== IEI PRODUCTION AUTHORIZATION MATRIX TEST SUITE ===\n');

  // Test 1: Public Events Listing
  console.log('Test 1: Public GET /events (Guest access)');
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/events',
    method: 'GET',
  });
  const eventList = Array.isArray(res1.data) ? res1.data : (res1.data?.events || []);
  console.log(`Status: ${res1.statusCode} | Events count: ${eventList.length}`);
  if (res1.statusCode === 200 && eventList.length > 0) {
    console.log('PASS: Public events accessible to Guests\n');
  } else {
    console.log('FAIL: Could not retrieve public events\n');
  }

  // Test 2: Guest RSVP to Open Event (59th Engineers' Day, ID 1)
  console.log("Test 2: Guest POST /events/1/rsvp (Open Event RSVP)");
  const guestMobile = `965${Math.floor(10000000 + Math.random() * 90000000)}`;
  const guestRsvpPayload = JSON.stringify({
    seats: 2,
    familyCount: '+1',
    guestName: 'Eng. Guest Attendee',
    guestMobile,
    guestEmail: 'guest.attendee@example.com',
  });
  const res2 = await makeRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/events/1/rsvp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(guestRsvpPayload),
      },
    },
    guestRsvpPayload
  );
  console.log(`Status: ${res2.statusCode} | Response:`, res2.data);
  if (res2.statusCode === 200 || res2.statusCode === 201) {
    console.log('PASS: Guest successfully RSVPed to Open event\n');
  } else {
    console.log('FAIL: Guest RSVP failed\n');
  }

  // Test 3: Guest RSVP to Restricted Member Event (Event ID 2: AI Facility Management, Members only)
  console.log("Test 3: Guest POST /events/2/rsvp to restricted Member Event");
  const res3 = await makeRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/events/2/rsvp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(guestRsvpPayload),
      },
    },
    guestRsvpPayload
  );
  console.log(`Status: ${res3.statusCode} | Response:`, res3.data);
  if (res3.statusCode === 403) {
    console.log('PASS: Backend rejected unauthenticated RSVP to member-restricted event (403 Forbidden)\n');
  } else {
    console.log('FAIL: Backend should return 403 Forbidden for restricted event\n');
  }

  // Test 4: Direct API Attack - Guest accessing protected Member Profile without token
  console.log("Test 4: Direct API Attack: GET /me/profile without auth token");
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/me/profile',
    method: 'GET',
  });
  console.log(`Status: ${res4.statusCode} | Response:`, res4.data);
  if (res4.statusCode === 401) {
    console.log('PASS: Backend rejected request without token (401 Unauthorized)\n');
  } else {
    console.log('FAIL: Backend should return 401 Unauthorized\n');
  }

  // Test 5: Direct API Attack - Guest accessing protected Member Card without token
  console.log("Test 5: Direct API Attack: GET /me/card without auth token");
  const res5 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/me/card',
    method: 'GET',
  });
  console.log(`Status: ${res5.statusCode} | Response:`, res5.data);
  if (res5.statusCode === 401) {
    console.log('PASS: Backend rejected request without token (401 Unauthorized)\n');
  } else {
    console.log('FAIL: Backend should return 401 Unauthorized\n');
  }

  // Test 6: Direct API Attack - Guest accessing protected Member Subscription without token
  console.log("Test 6: Direct API Attack: GET /me/subscription without auth token");
  const res6 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/me/subscription',
    method: 'GET',
  });
  console.log(`Status: ${res6.statusCode} | Response:`, res6.data);
  if (res6.statusCode === 401) {
    console.log('PASS: Backend rejected request without token (401 Unauthorized)\n');
  } else {
    console.log('FAIL: Backend should return 401 Unauthorized\n');
  }

  // Test 7: Public Membership Information
  console.log("Test 7: Public GET /membership/information");
  const res7 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/membership/information',
    method: 'GET',
  });
  console.log(`Status: ${res7.statusCode} | Annual Dues KD: ${res7.data.annualDuesKd} | Grades:`, res7.data.grades?.length);
  if (res7.statusCode === 200 && res7.data.annualDuesKd === 20) {
    console.log('PASS: Public membership information accessible\n');
  } else {
    console.log('FAIL: Membership information retrieval failed\n');
  }

  // Test 8: Public Membership Application submission
  console.log("Test 8: Public POST /membership/application (Guest starts application)");
  const appPayload = JSON.stringify({
    applicantName: 'Eng. Vijay Kumar',
    applicantMobile: '96598711223',
    applicantEmail: 'vijay.kumar@example.com',
    discipline: 'Mechanical Engineering',
    employer: 'KNPC Mina Al-Ahmadi',
    designation: 'Senior Rotating Equipment Engineer',
    experienceYears: 12,
    qualification: 'B.Tech Mechanical, 2014',
    referredBy: 'Eng. Karthikeyan Manickam',
  });
  const res8 = await makeRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/membership/application',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(appPayload),
      },
    },
    appPayload
  );
  console.log(`Status: ${res8.statusCode} | Response:`, res8.data);
  if (res8.statusCode === 200 || res8.statusCode === 201) {
    console.log('PASS: Guest successfully submitted Membership Application\n');
  } else {
    console.log('FAIL: Membership Application submission failed\n');
  }

  console.log('=== ALL 8 AUTHORIZATION & ACCESS TESTS COMPLETED ===');
}

runTests().catch(console.error);
