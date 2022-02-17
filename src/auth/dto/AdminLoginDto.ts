import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}
