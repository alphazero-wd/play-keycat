import { Request } from 'express';
import { Socket } from 'socket.io';
import { UserResponse } from '../../auth/types';

export type SocketUser = Socket & { request: Request & { user: UserResponse } };
