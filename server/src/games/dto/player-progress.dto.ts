import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class PlayerProgressDto {
  @IsUUID(4)
  gameId: string;

  @IsInt()
  @Min(1)
  @Max(100)
  progress: number;

  @IsInt()
  @Min(0)
  wpm: number;
}
