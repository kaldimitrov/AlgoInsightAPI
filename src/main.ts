import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './logger/winston.config';
import configuration from './config/configuration';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SocketStateAdapter } from './shared/socket-state/socket-state.adapter';
import { SocketStateService } from './shared/socket-state/socket-state.service';
import { RedisPropagatorService } from './shared/redis-propagator/redis-propagator.service';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonOptions),
  });
  app.useWebSocketAdapter(
    new SocketStateAdapter(app, app.get(SocketStateService), app.get(RedisPropagatorService), app.get(AuthService)),
  );

  const config = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.setGlobalPrefix('api');

  await app.listen(configuration().port);
}
bootstrap();
