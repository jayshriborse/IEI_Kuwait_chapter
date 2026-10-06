import 'dotenv/config';

interface TestResult {
  endpoint: string;
  method: string;
  description: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
}

const BASE_URL = 'http://localhost:3000';

async function login(memberCode: string, mobile: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/dev-login`, {
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

async function runTest(
  description: string,
  method: string,
  path: string,
  token: string | null,
  body: any | null,
  expectedStatus: number,
): Promise<TestResult> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const actualStatus = res.status;
  const passed = actualStatus === expectedStatus;

  return {
    endpoint: `${method} ${path}`,
    method,
    description,
    expectedStatus,
    actualStatus,
    passed,
  };
}

async function main() {
  console.log('====================================================');
  console.log('IEI KUWAIT BACKEND SECURITY AUDIT TEST SUITE');
  console.log('Testing against REAL backend: ' + BASE_URL);
  console.log('====================================================\n');

  // 1. Authenticate personas
  console.log('Authenticating personas...');
  const normalMemberToken = await login('IEI0005', '99840191');
  const treasurerToken = await login('IEI9001', '00000001');
  const chairmanToken = await login('IEI9002', '00000002');
  const secretaryToken = await login('IEI9003', '00000003');
  const volunteerToken = await login('IEI9004', '00000004');
  console.log('All persona tokens issued successfully.\n');

  const results: TestResult[] = [];

  // ================= 1. MEMBERS LIST (/admin/members) =================
  // No token -> 401
  results.push(
    await runTest('Members list: No token', 'GET', '/admin/members', null, null, 401),
  );
  // Normal member -> 403
  results.push(
    await runTest('Members list: Normal member (IEI0005)', 'GET', '/admin/members', normalMemberToken, null, 403),
  );
  // EC Volunteer -> 403 (Volunteer only has check-in)
  results.push(
    await runTest('Members list: Wrong EC role (Volunteer IEI9004)', 'GET', '/admin/members', volunteerToken, null, 403),
  );
  // Correct role (Secretary IEI9003) -> 200
  results.push(
    await runTest('Members list: Correct role (Secretary IEI9003)', 'GET', '/admin/members', secretaryToken, null, 200),
  );
  // Correct role (Chairman IEI9002) -> 200
  results.push(
    await runTest('Members list: Correct role (Chairman IEI9002)', 'GET', '/admin/members', chairmanToken, null, 200),
  );

  // ================= 2. EXPORT MEMBERS (/admin/members/export) =================
  // No token -> 401
  results.push(
    await runTest('Export members: No token', 'POST', '/admin/members/export', null, null, 401),
  );
  // Normal member -> 403
  results.push(
    await runTest('Export members: Normal member (IEI0005)', 'POST', '/admin/members/export', normalMemberToken, null, 403),
  );
  // EC Volunteer -> 403
  results.push(
    await runTest('Export members: Wrong EC role (Volunteer IEI9004)', 'POST', '/admin/members/export', volunteerToken, null, 403),
  );
  // Correct role (Chairman IEI9002) -> 200
  results.push(
    await runTest('Export members: Correct role (Chairman IEI9002)', 'POST', '/admin/members/export', chairmanToken, null, 200),
  );

  // ================= 3. RECEIPT CONFIRM (/ec/receipts/:id/confirm) =================
  // No token -> 401
  results.push(
    await runTest('Receipt confirm: No token', 'POST', '/ec/receipts/dummy-id/confirm', null, { receiptNo: 'R101', bookNo: 'B1' }, 401),
  );
  // Normal member -> 403
  results.push(
    await runTest('Receipt confirm: Normal member (IEI0005)', 'POST', '/ec/receipts/dummy-id/confirm', normalMemberToken, { receiptNo: 'R101', bookNo: 'B1' }, 403),
  );
  // Wrong EC role: Chairman -> 403 (Only Treasurer can confirm receipts!)
  results.push(
    await runTest('Receipt confirm: Wrong EC role (Chairman IEI9002)', 'POST', '/ec/receipts/dummy-id/confirm', chairmanToken, { receiptNo: 'R101', bookNo: 'B1' }, 403),
  );
  // Wrong EC role: General Secretary -> 403
  results.push(
    await runTest('Receipt confirm: Wrong EC role (Secretary IEI9003)', 'POST', '/ec/receipts/dummy-id/confirm', secretaryToken, { receiptNo: 'R101', bookNo: 'B1' }, 403),
  );

  // ================= 4. DOOR CHECK-IN LIST (/events/checkin/list) =================
  // No token -> 401
  results.push(
    await runTest('Door check-in list: No token', 'GET', '/events/checkin/list?eventId=1', null, null, 401),
  );
  // Normal member -> 403
  results.push(
    await runTest('Door check-in list: Normal member (IEI0005)', 'GET', '/events/checkin/list?eventId=1', normalMemberToken, null, 403),
  );
  // Correct role (Volunteer IEI9004) -> 200
  results.push(
    await runTest('Door check-in list: Correct role (Volunteer IEI9004)', 'GET', '/events/checkin/list?eventId=1', volunteerToken, null, 200),
  );
  // Correct role (Treasurer IEI9001) -> 200
  results.push(
    await runTest('Door check-in list: Correct role (Treasurer IEI9001)', 'GET', '/events/checkin/list?eventId=1', treasurerToken, null, 200),
  );

  // ================= 5. APPLICATION APPROVE (/admin/applications/:id/approve) =================
  // No token -> 401
  results.push(
    await runTest('Approve application: No token', 'POST', '/admin/applications/dummy/approve', null, null, 401),
  );
  // Normal member -> 403
  results.push(
    await runTest('Approve application: Normal member (IEI0005)', 'POST', '/admin/applications/dummy/approve', normalMemberToken, null, 403),
  );
  // Wrong EC role: Treasurer -> 403
  results.push(
    await runTest('Approve application: Wrong EC role (Treasurer IEI9001)', 'POST', '/admin/applications/dummy/approve', treasurerToken, null, 403),
  );
  // Wrong EC role: General Secretary -> 403 (Secretary cannot approve; only recommend!)
  results.push(
    await runTest('Approve application: Wrong EC role (Secretary IEI9003)', 'POST', '/admin/applications/dummy/approve', secretaryToken, null, 403),
  );

  // Print results table
  console.log('| Endpoint & Test Description | Expected | Actual | Result |');
  console.log('| :--- | :---: | :---: | :---: |');
  let passCount = 0;
  for (const r of results) {
    if (r.passed) passCount++;
    const icon = r.passed ? 'PASS' : 'FAIL';
    console.log(`| ${r.description} | ${r.expectedStatus} | ${r.actualStatus} | ${icon} |`);
  }

  console.log(`\nTOTAL: ${passCount}/${results.length} PASSED.`);
  if (passCount !== results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
