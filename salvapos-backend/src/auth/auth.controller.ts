import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  //   @Post('forgot-password')
  //   forgotPassword(@Body()) {
  //     return this.authService.forgotPassword();
  //   }

  //   @Post('reset-password')
  //   resetPassword(@Body()) {
  //     return this.authService.resetPassword();
  //   }

  //   @Post('change-password')
  //   changePassword(@Body()) {
  //     return this.authService.changePassword();
  //   }
}
