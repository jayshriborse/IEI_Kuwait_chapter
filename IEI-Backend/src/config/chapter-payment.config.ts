export interface ChapterPaymentInstructions {
  bank: {
    beneficiary: string;
    iban: string;
    bankName: string;
  };
  cashOffice: {
    address: string;
    daysAndHours: string;
    summary: string;
  };
}

/**
 * Returns chapter bank and cash office details.
 * Seed values default to current chapter placeholders if not set in environment.
 */
export function getChapterPaymentInstructions(): ChapterPaymentInstructions {
  const beneficiary = process.env.CHAPTER_BANK_BENEFICIARY || 'IEI Kuwait Chapter';
  const iban = process.env.CHAPTER_BANK_IBAN || '[KW00 0000 0000 0000]';
  const bankName = process.env.CHAPTER_BANK_NAME || 'National Bank of Kuwait';
  const address = process.env.CASH_OFFICE_ADDRESS || 'KSE, Soor St';
  const daysAndHours = process.env.CASH_OFFICE_HOURS || 'Sun–Thu 17:30–20:30';
  const summary = process.env.CASH_OFFICE_SUMMARY || `${address} · ${daysAndHours}`;

  return {
    bank: {
      beneficiary,
      iban,
      bankName,
    },
    cashOffice: {
      address,
      daysAndHours,
      summary,
    },
  };
}

/**
 * Validates the chapter payment configuration.
 * - If IBAN still contains placeholder "KW00 0000":
 *   - Logs a clear warning at startup.
 *   - Fails production release checklist / blocks production startup if NODE_ENV === 'production'.
 *   - Does NOT block development when NODE_ENV !== 'production'.
 */
export function validateChapterPaymentConfig(): {
  isValid: boolean;
  warning?: string;
  error?: string;
} {
  const instructions = getChapterPaymentInstructions();
  const isPlaceholderIban = instructions.bank.iban.includes('KW00 0000');

  if (isPlaceholderIban) {
    const warning =
      '⚠️  [CONFIG WARNING] Chapter Bank IBAN is configured with placeholder "KW00 0000". Replace CHAPTER_BANK_IBAN with official chapter account details before production launch.';
    if (process.env.NODE_ENV === 'production') {
      return {
        isValid: false,
        warning,
        error:
          'PRODUCTION CHECKLIST FAILED: Placeholder IBAN "KW00 0000" detected in production environment. A valid Chapter Bank IBAN is required.',
      };
    }
    return {
      isValid: true,
      warning,
    };
  }

  return { isValid: true };
}
