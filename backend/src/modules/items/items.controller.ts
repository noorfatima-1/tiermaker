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
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('playgrounds/:playgroundId/items')
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Get()
  async findByPlayground(@Param('playgroundId') playgroundId: string) {
    return this.itemsService.findByPlayground(playgroundId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.itemsService.getItemWithAggregation(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @Param('playgroundId') playgroundId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemsService.create(playgroundId, dto);
  }

  @Post('batch')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async createMany(
    @Param('playgroundId') playgroundId: string,
    @Body() body: { items: CreateItemDto[] },
  ) {
    return this.itemsService.createMany(playgroundId, body.items);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: Partial<CreateItemDto>) {
    return this.itemsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.itemsService.delete(id);
  }
}
