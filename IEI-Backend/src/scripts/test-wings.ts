import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, NotificationType } from '../generated/prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const API_BASE = 'http://localhost:3000';

async function devLogin(memberCode: string, mobile: string) {
  const res = await fetch(`${API_BASE}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberCode, mobile }),
  });
  if (!res.ok) {
    throw new Error(`devLogin failed for ${memberCode} with status ${res.status}`);
  }
  const data = await res.json();
  return data.accessToken;
}

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING WING SPACES VERIFICATION TESTS AGAINST LIVE BACKEND');
  console.log('================================================================\n');

  // Obtain tokens for demo accounts
  const normalToken = await devLogin('IEI0005', '99840191');
  const ladiesConvenorToken = await devLogin('IEI0022', '99223344');
  const scienceConvenorToken = await devLogin('IEI0010', '00000010');

  // Test 1: Normal member posts (Expected 403)
  console.log('TEST 1: Normal member posts to Ladies Wing feed');
  const res1 = await fetch(`${API_BASE}/wings/ladies-wing/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${normalToken}`,
    },
    body: JSON.stringify({
      title: 'Unauthorized Post Attempt',
      body: 'I am a normal member trying to post to Ladies Wing.',
    }),
  });
  console.log(`  -> HTTP Status: ${res1.status} (${res1.status === 403 ? 'PASS' : 'FAIL'})`);
  const json1 = await res1.json();
  console.log(`  -> Response: ${JSON.stringify(json1)}\n`);

  // Test 2: Guest reads feed (Expected 403)
  console.log('TEST 2: Guest reads Ladies Wing feed (no token)');
  const res2 = await fetch(`${API_BASE}/wings/ladies-wing/posts`, {
    method: 'GET',
    headers: {},
  });
  console.log(`  -> HTTP Status: ${res2.status} (${res2.status === 403 ? 'PASS' : 'FAIL'})`);
  const json2 = await res2.json();
  console.log(`  -> Response: ${JSON.stringify(json2)}\n`);

  // Test 3: Ladies Wing convenor posts to Ladies Wing (Expected 201)
  console.log('TEST 3: Ladies Wing convenor posts to Ladies Wing feed');
  const uniqueTitle = `Annual Family Floral Design - ${Date.now()}`;
  const res3 = await fetch(`${API_BASE}/wings/ladies-wing/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ladiesConvenorToken}`,
    },
    body: JSON.stringify({
      title: uniqueTitle,
      body: 'Floral arrangement and decoration masterclass for families and youth.',
      eventDate: '2026-11-25T16:00:00.000Z',
    }),
  });
  console.log(`  -> HTTP Status: ${res3.status} (${res3.status === 201 ? 'PASS' : 'FAIL'})`);
  const post3 = await res3.json();
  console.log(`  -> Created Post ID: ${post3.id}`);
  console.log(`  -> Title: "${post3.title}"\n`);

  // Test 4: The same convenor posts to Science Club (Expected 403)
  console.log('TEST 4: Ladies Wing convenor posts to Science Club feed (Cross-wing post)');
  const res4 = await fetch(`${API_BASE}/wings/science-club/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ladiesConvenorToken}`,
    },
    body: JSON.stringify({
      title: 'Cross-wing post attempt',
      body: 'Ladies Wing convenor attempting to publish in Science Club.',
    }),
  });
  console.log(`  -> HTTP Status: ${res4.status} (${res4.status === 403 ? 'PASS' : 'FAIL'})`);
  const json4 = await res4.json();
  console.log(`  -> Response: ${JSON.stringify(json4)}\n`);

  // Test 5: Convenor edits another convenor's post (Expected 403)
  console.log("TEST 5: Science Club convenor edits Ladies Wing convenor's post");
  const res5 = await fetch(`${API_BASE}/wings/posts/${post3.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${scienceConvenorToken}`,
    },
    body: JSON.stringify({
      title: 'Hacked Title Attempt',
      body: 'Tampered content by another convenor.',
    }),
  });
  console.log(`  -> HTTP Status: ${res5.status} (${res5.status === 403 ? 'PASS' : 'FAIL'})`);
  const json5 = await res5.json();
  console.log(`  -> Response: ${JSON.stringify(json5)}\n`);

  // Test 6: Verify post published a notification to linked members
  console.log('TEST 6: Post publishes WING_POST notification to linked members');
  const notifications = await prisma.notification.findMany({
    where: {
      type: NotificationType.WING_POST,
      body: uniqueTitle,
    },
    include: {
      member: {
        select: {
          memberCode: true,
          fullName: true,
        },
      },
    },
  });
  console.log(`  -> Found ${notifications.length} notification(s) matching title "${uniqueTitle}"`);
  for (const n of notifications) {
    console.log(`     * Recipient: ${n.member.memberCode} (${n.member.fullName}) | Title: "${n.title}" | Body: "${n.body}"`);
  }
  const notifPass = notifications.length > 0;
  console.log(`  -> Notification Test: ${notifPass ? 'PASS' : 'FAIL'}\n`);

  console.log('================================================================');
  console.log('ALL TESTS COMPLETED');
  console.log('================================================================');
}

runTests()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
