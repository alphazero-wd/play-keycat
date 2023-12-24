import { Request } from 'express';
import { Socket } from 'socket.io';
import { User } from '@prisma/client';

export type SocketUser = Socket & { request: Request & { user: User } };
