import { Controller, Get, Param, Header, Optional } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @Header('Content-Type', 'application/json; charset=utf-8')
  async getProfile(@Param('username') username: string) {
    // Authentication is optional; following is returned as false by default for now
    return this.profilesService.getProfileByUsername(username);
  }
}


