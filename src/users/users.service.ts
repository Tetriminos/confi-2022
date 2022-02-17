import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type User = any;

@Injectable()
export class UsersService {
  constructor(private configService: ConfigService) {}

  private readonly users = [
    {
      username: this.configService.get('adminUsername'),
      password: this.configService.get('adminPassword'),
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
