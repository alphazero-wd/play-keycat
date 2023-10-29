import { Transform } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class PlayerFinishedDto {
  @Transform(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 1 })
  @Min(0)
  @Max(100)
  acc: number;

  @Transform(() => Number)
  @IsInt()
  @Min(0)
  wpm: number;

  @Transform(() => Number)
  @IsInt()
  @Min(0)
  timeTaken: number;

  @Transform(() => Number)
  @IsInt()
  catPoints: number;

  @Transform(() => Number)
  @Min(1)
  gameId: number;
}
