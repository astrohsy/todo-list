import { NestFactory, FastifyAdapter } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.enableCors();

  const rootPath = join(__dirname, '..', '..', 'app', 'build');

  app.useStaticAssets({
    root: rootPath,
    prefix: '/public/',
  });

  await app.listen(8000);
}
bootstrap();
