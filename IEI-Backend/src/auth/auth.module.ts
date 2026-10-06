import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MemberLinkService } from './member-link.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MemberLinkService, JwtAuthGuard],
  exports: [AuthService, MemberLinkService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
