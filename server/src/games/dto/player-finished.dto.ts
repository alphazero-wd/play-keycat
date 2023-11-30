import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class PlayerFinishedDto {
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 1 })
  @Min(0)
  @Max(100)
  acc: number;

  @IsInt()
  @Min(0)
  leftPlayersCount: number;

  @IsInt()
  @Min(0)
  wpm: number;

  @IsInt()
  @Min(1)
  @Max(5)
  position: number;

  @Min(1)
  gameId: number;
}
