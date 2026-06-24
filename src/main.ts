import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createCorsOriginValidator } from './common/cors.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Закриває з'єднання (зокрема Prisma) при зупинці процесу на Render.
  app.enableShutdownHooks();

  app.setGlobalPrefix('api');
  // Безпекові HTTP-заголовки. Для JSON-API безпечно: CORP не блокує
  // CORS-запити, а CSP для не-HTML відповідей не має ефекту.
  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: createCorsOriginValidator(),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
