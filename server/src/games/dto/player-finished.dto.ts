import { Transform } from 'class-transformer';

export class PlayerFinishedDto {
  @Transform(() => Number)
  acc: number;
  @Transform(() => Number)
  wpm: number;
  @Transform(() => Number)
  timeTaken: number;
  @Transform(() => Number)
  catPoints: number;
}
