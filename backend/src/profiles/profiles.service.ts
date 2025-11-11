import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly usersService: UsersService) {}

  async getProfileByUsername(username: string, currentUserId?: number) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('Profile not found');
    }
    // following is false by default; adjust when "follows" feature exists
    const following = false;
    return {
      profile: {
        username: user.username,
        bio: user.bio ?? null,
        image: user.image ?? null,
        following,
      },
    };
  }
}


