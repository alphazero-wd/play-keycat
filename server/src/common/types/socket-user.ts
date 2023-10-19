import { User } from '@prisma/client';
import { Request } from 'express';
import { Socket } from 'socket.io';

export type SocketUser = Socket & { request: Request & { user: User } };
