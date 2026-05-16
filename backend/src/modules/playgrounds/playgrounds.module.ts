import { Module } from '@nestjs/common';
import { PlaygroundsService } from './playgrounds.service';
import { PlaygroundsController } from './playgrounds.controller';

@Module({
  controllers: [PlaygroundsController],
  providers: [PlaygroundsService],
  exports: [PlaygroundsService],
})
export class PlaygroundsModule {}
