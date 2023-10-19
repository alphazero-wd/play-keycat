import express from 'express';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import * as passport from 'passport';

export class SessionAdapter extends IoAdapter {
  session: express.RequestHandler;

  constructor(session: express.RequestHandler, app: INestApplication) {
    super(app);
    this.session = session;
  }

  create(port: number, options?: any) {
    const server: Server = super.create(port, {
      ...options,
      cors: {
        origin: 'http://localhost:3000',
        credentials: true,
      },
    });

    const wrap = (middleware) => (socket, next) =>
      middleware(socket.request, {}, next);

    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));
    return server;
  }
}
