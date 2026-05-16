const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const cookieParser = require('cookie-parser');

let cachedApp;
const expressApp = express();

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const { AppModule } = require('../dist/app.module');
  const { HttpExceptionFilter } = require('../dist/modules/common/filters/http-exception.filter');
  const { TransformInterceptor } = require('../dist/modules/common/interceptors/transform.interceptor');

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix('api');

  await app.init();
  cachedApp = app;
  return app;
}

module.exports = async function handler(req, res) {
  await bootstrap();
  expressApp(req, res);
};
