import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class GameTimersService {
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

  startCountdown(
    io: Server,
    gameId: string,
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

  stopCountdown(gameId: string) {
    const interval = this.gameTimers.get(`game:${gameId}`);
    if (!interval) return;
    clearInterval(interval);
    this.gameTimers.delete(`game:${gameId}`);
  }
}
