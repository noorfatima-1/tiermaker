import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { TiersService } from './tiers.service';
import { CreateTierDto } from './dto/create-tier.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('playgrounds/:playgroundId/tiers')
export class TiersController {
  constructor(private tiersService: TiersService) {}

  @Get()
  async findByPlayground(@Param('playgroundId') playgroundId: string) {
    return this.tiersService.findByPlayground(playgroundId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Param('playgroundId') playgroundId: string,
    @Body() dto: CreateTierDto,
  ) {
    return this.tiersService.create(playgroundId, dto);
  }

  @Post('batch')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async createMany(
    @Param('playgroundId') playgroundId: string,
    @Body() body: { tiers: CreateTierDto[] },
  ) {
    return this.tiersService.createMany(playgroundId, body.tiers);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: Partial<CreateTierDto>) {
    return this.tiersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.tiersService.delete(id);
  }

  @Post('reorder')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async reorder(
    @Param('playgroundId') playgroundId: string,
    @Body() body: { tierIds: string[] },
  ) {
    return this.tiersService.reorder(playgroundId, body.tierIds);
  }
}
