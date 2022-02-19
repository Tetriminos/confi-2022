import { Controller, Post, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/AdminLoginDto';

@ApiTags('admin')
@Controller('admin')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Admin login. Returns a JWT under the field `access_token`',
  })
  @ApiOkResponse({ description: 'Successful login.' })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password.' })
  async login(@Body() adminLogin: AdminLoginDto) {
    return this.authService.login(adminLogin);
  }
}
