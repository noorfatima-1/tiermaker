import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    const stats = await this.usersService.getStats(user.id);
    const { password, ...userData } = user;
    return { ...userData, ...stats };
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: { displayName?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.getAllUsers(page, limit);
  }
}
