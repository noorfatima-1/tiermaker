import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { PlaygroundsService } from './playgrounds.service';
import { CreatePlaygroundDto } from './dto/create-playground.dto';
import { UpdatePlaygroundDto } from './dto/update-playground.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('playgrounds')
export class PlaygroundsController {
  constructor(private playgroundsService: PlaygroundsService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 12,
    @Query('search') search?: string,
  ) {
    return this.playgroundsService.findAll(page, limit, search);
  }

  @Get('trending')
  async getTrending(@Query('limit') limit = 6) {
    return this.playgroundsService.getTrending(limit);
  }

  @Get('invite/:code')
  async findByInviteCode(@Param('code') code: string) {
    return this.playgroundsService.findByInviteCode(code);
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminPlaygrounds(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.playgroundsService.getAdminPlaygrounds(page, limit);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.playgroundsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreatePlaygroundDto) {
    return this.playgroundsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdatePlaygroundDto) {
    return this.playgroundsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.playgroundsService.delete(id);
  }

  @Patch(':id/toggle-lock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async toggleLock(@Param('id') id: string) {
    return this.playgroundsService.toggleLock(id);
  }

  @Post(':id/reset-votes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async resetVotes(@Param('id') id: string) {
    return this.playgroundsService.resetVotes(id);
  }
}
