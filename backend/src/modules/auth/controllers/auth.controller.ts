import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../../common/interfaces/api-response.interface';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  logout(
    @CurrentUser() user: JwtPayload,
    @Body() body: RefreshTokenDto,
  ) {
    return this.authService.logout(user.sub, body.refreshToken);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Start Google OAuth (mock redirect when no keys)' })
  googleOAuth(@Query('email') email?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      return {
        authorizeUrl: null,
        mode: 'mock',
        hint: 'Call GET /auth/google/callback?email=you@example.com for local mock login',
        mockEmail: email || null,
      };
    }
    const callback =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3001/api/v1/auth/google/callback';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callback,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return {
      authorizeUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      mode: 'live',
    };
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback (or local mock)' })
  googleCallback(
    @Query('code') code?: string,
    @Query('email') email?: string,
  ) {
    return this.authService.loginWithGoogle({
      code,
      mockEmail: email,
    });
  }

  @Public()
  @Get('github')
  @ApiOperation({ summary: 'GitHub OAuth (stub)' })
  githubOAuth() {
    return {
      success: true,
      data: null,
      message: 'GitHub OAuth is coming soon',
      meta: { statusCode: 501 },
    };
  }

  @Public()
  @Get('linkedin')
  @ApiOperation({ summary: 'LinkedIn OAuth (stub)' })
  linkedinOAuth() {
    return {
      success: true,
      data: null,
      message: 'LinkedIn OAuth is coming soon',
      meta: { statusCode: 501 },
    };
  }
}
