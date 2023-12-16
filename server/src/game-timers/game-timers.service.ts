import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class GameTimersService {
  constructor() {}

  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

  startCountdown(
    io: Server,
    gameId: number,
    countdown: number,
    callback: CallableFunction,
  ) {
    const interval = setInterval(() => {
      io.sockets.to(`game:${gameId}`).emit('countdown', countdown);
      if (countdown === 0) {
        this.stopCountdown(gameId);
        callback();
      } else {
        countdown--;
      }
    }, 1000);
    this.gameTimers.set(`game:${gameId}`, interval);
  }

  stopCountdown(gameId: number) {
    clearInterval(this.gameTimers.get(`game:${gameId}`));
    this.gameTimers.delete(`game:${gameId}`);
  }
}
