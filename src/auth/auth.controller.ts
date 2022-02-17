import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/AdminLoginDto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('admin/login')
  async login(@Body() adminLogin: AdminLoginDto) {
    return this.authService.login(adminLogin);
  }
}
