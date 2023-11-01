import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import * as passport from 'passport';
import { SessionAdapter } from './config/session-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  const redisClient = createClient({ url: configService.get('REDIS_URL') });
  await redisClient.connect();

  const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: configService.get('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: configService.get('NODE_ENV') === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  });

  app.use(sessionMiddleware);

  app.useWebSocketAdapter(
    new SessionAdapter(configService, sessionMiddleware, app),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(5000);
}
bootstrap();
