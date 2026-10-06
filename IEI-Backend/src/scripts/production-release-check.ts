import 'dotenv/config';
import { getChapterPaymentInstructions } from '../config/chapter-payment.config';

function runReleaseChecklist() {
  console.log('========================================');
  console.log('  IEI PRODUCTION RELEASE CHECKLIST');
  console.log('========================================\n');

  let failed = false;
  const paymentInstructions = getChapterPaymentInstructions();

  // 1. Chapter Bank IBAN Check
  console.log('[1/3] Checking Chapter Bank IBAN...');
  if (paymentInstructions.bank.iban.includes('KW00 0000')) {
    console.error(
      '  ❌ FAILED: IBAN contains placeholder "KW00 0000". Production release requires a verified Kuwaiti bank IBAN.',
    );
    failed = true;
  } else {
    console.log(`  ✓ PASSED: Valid IBAN configured (${paymentInstructions.bank.iban})`);
  }

  // 2. Beneficiary Check
  console.log('\n[2/3] Checking Beneficiary Name...');
  if (!paymentInstructions.bank.beneficiary || paymentInstructions.bank.beneficiary.trim() === '') {
    console.error('  ❌ FAILED: Beneficiary name is missing.');
    failed = true;
  } else {
    console.log(`  ✓ PASSED: Beneficiary is "${paymentInstructions.bank.beneficiary}"`);
  }

  // 3. Cash Office Details Check
  console.log('\n[3/3] Checking Cash Office Details...');
  if (!paymentInstructions.cashOffice.address || !paymentInstructions.cashOffice.daysAndHours) {
    console.error('  ❌ FAILED: Cash office details are incomplete.');
    failed = true;
  } else {
    console.log(`  ✓ PASSED: Cash office "${paymentInstructions.cashOffice.summary}"`);
  }

  console.log('\n----------------------------------------');
  if (failed) {
    console.error('❌ PRODUCTION RELEASE CHECKLIST FAILED. Resolve the issues above before releasing.');
    process.exit(1);
  } else {
    console.log('✅ ALL PRODUCTION CHECKS PASSED. Ready for release.');
    process.exit(0);
  }
}

runReleaseChecklist();
