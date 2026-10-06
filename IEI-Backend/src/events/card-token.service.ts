import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface CardTokenPayload {
  memberCode: string;
  issuedAt: number;
  expiry: number;
}

export interface CardTokenVerificationResult {
  isValid: boolean;
  memberCode?: string;
  error?: string;
  payload?: CardTokenPayload;
}

@Injectable()
export class CardTokenService {
  private readonly logger = new Logger(CardTokenService.name);
  private privateKey: crypto.KeyObject;
  private publicKey: crypto.KeyObject;
  private rawPublicKeyBase64: string;

  constructor() {
    this.initKeys();
  }

  private initKeys() {
    const rawEnvKey = process.env.CARD_SIGNING_PRIVATE_KEY?.trim();

    if (!rawEnvKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'FATAL: CARD_SIGNING_PRIVATE_KEY environment variable is missing in production. Refusing to generate a temporary key or start without the canonical signing key.',
        );
      }
      this.logger.warn(
        'CARD_SIGNING_PRIVATE_KEY is not defined in environment. Using ephemeral key (development only).',
      );
      const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
      this.privateKey = privateKey;
      this.publicKey = publicKey;
      const spkiDer = this.publicKey.export({ format: 'der', type: 'spki' });
      this.rawPublicKeyBase64 = spkiDer.subarray(-32).toString('base64');
      return;
    }

    try {
      if (rawEnvKey.includes('-----BEGIN')) {
        this.privateKey = crypto.createPrivateKey({
          key: rawEnvKey,
          format: 'pem',
        });
      } else {
        const derBuffer = Buffer.from(rawEnvKey, 'base64');
        this.privateKey = crypto.createPrivateKey({
          key: derBuffer,
          format: 'der',
          type: 'pkcs8',
        });
      }

      this.publicKey = crypto.createPublicKey(this.privateKey);

      // Raw 32-byte Ed25519 public key (the last 32 bytes of the SPKI DER encoding)
      const spkiDer = this.publicKey.export({ format: 'der', type: 'spki' });
      const raw32 = spkiDer.subarray(-32);
      this.rawPublicKeyBase64 = raw32.toString('base64');

      this.logger.log('CardTokenService successfully loaded canonical Ed25519 key from environment');
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `FATAL: Failed to parse CARD_SIGNING_PRIVATE_KEY environment variable in production: ${err.message}`,
        );
      }
      this.logger.error('Failed to parse CARD_SIGNING_PRIVATE_KEY from environment', err);
      throw err;
    }
  }

  public getPublicKeyBase64(): string {
    return this.rawPublicKeyBase64;
  }

  public generateCardToken(memberCode: string): string {
    const cleanCode = memberCode.trim().toUpperCase();
    const now = Math.floor(Date.now() / 1000);
    // 30 days validity (2,592,000 seconds) - cards issued well beforehand remain valid at the door
    const TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
    const expiry = now + TOKEN_LIFETIME_SECONDS;

    const header = {
      alg: 'EdDSA',
      typ: 'JWT',
    };

    const payload: CardTokenPayload = {
      memberCode: cleanCode,
      issuedAt: now,
      expiry,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const message = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto.sign(null, Buffer.from(message), this.privateKey);
    const encodedSignature = signature.toString('base64url');

    return `${message}.${encodedSignature}`;
  }

  public verifyCardToken(token: string): CardTokenVerificationResult {
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Token must be a non-empty string' };
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Invalid token structure: expected JWT with 3 parts' };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;

    try {
      const signature = Buffer.from(encodedSignature, 'base64url');
      const isVerified = crypto.verify(
        null,
        Buffer.from(message),
        this.publicKey,
        signature,
      );

      if (!isVerified) {
        return { isValid: false, error: 'Invalid or tampered card token signature' };
      }

      const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload: CardTokenPayload = JSON.parse(payloadJson);

      const now = Math.floor(Date.now() / 1000);
      const CLOCK_SKEW_ALLOWANCE_SECONDS = 300; // 5 minutes clock-skew allowance
      if (payload.expiry && now > payload.expiry + CLOCK_SKEW_ALLOWANCE_SECONDS) {
        return { isValid: false, error: 'Card token has expired', memberCode: payload.memberCode, payload };
      }

      return {
        isValid: true,
        memberCode: payload.memberCode,
        payload,
      };
    } catch (err: any) {
      return { isValid: false, error: `Token verification error: ${err.message}` };
    }
  }
}
