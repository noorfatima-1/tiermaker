import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VotesService } from './votes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('votes')
@UseGuards(AuthGuard('jwt'))
export class VotesController {
  constructor(private votesService: VotesService) {}

  @Post()
  async castVote(
    @CurrentUser() user: any,
    @Body() body: { itemId: string; tierId: string },
  ) {
    return this.votesService.castVote(user.id, body.itemId, body.tierId);
  }

  @Get('playground/:playgroundId')
  async getPlaygroundAggregates(@Param('playgroundId') playgroundId: string) {
    return this.votesService.getPlaygroundAggregates(playgroundId);
  }

  @Get('user/:playgroundId')
  async getUserVotes(
    @CurrentUser() user: any,
    @Param('playgroundId') playgroundId: string,
  ) {
    return this.votesService.getUserVotes(user.id, playgroundId);
  }

  @Delete(':itemId')
  async removeVote(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.votesService.removeVote(user.id, itemId);
  }
}
