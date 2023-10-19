import { Request } from 'express';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class WsCookieAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const request: Request = client.request;
    if (!request.isAuthenticated())
      throw new WsException('You are not logged in to join this game');
    return true;
  }
}
