import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateChapterPaymentConfig } from './config/chapter-payment.config';

async function bootstrap() {
  const logger = new Logger('HTTP');

  // Validate chapter payment configuration at startup (production guard)
  const paymentConfigCheck = validateChapterPaymentConfig();
  if (paymentConfigCheck.warning) {
    logger.warn(paymentConfigCheck.warning);
  }
  if (!paymentConfigCheck.isValid && paymentConfigCheck.error) {
    logger.error(paymentConfigCheck.error);
    throw new Error(paymentConfigCheck.error);
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Request logging middleware (method, url, statusCode, duration) - never logs payload/secrets
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    });
    next();
  });

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`IEI Backend listening on all interfaces at port ${port}`);
}
void bootstrap();
