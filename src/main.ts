import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NotFoundExceptionFilter } from './filter/not-found.filter';
import { readFileSync } from 'fs';
import { NestFactoryStatic } from '@nestjs/core/nest-factory';

async function bootstrap() {
  let app;

  if (process.env.NODE_ENV === 'development') {
    const httpsOptions = {
      key: readFileSync('config/certs/server.key'),  // chemin vers ta clé privée
      cert: readFileSync('config/certs/server.cert'),  // chemin vers ton certificat public
    };
    
    app = await NestFactory.create(AppModule, {
      httpsOptions,
    });

    app.enableCors(); // Enable CORS for development environment
  } else {
    app = await NestFactory.create(AppModule);
  }

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') as number; 
  const hostname = configService.get('HOSTNAME') as string;

  app.useGlobalFilters(new NotFoundExceptionFilter());

  await app.listen(port, hostname, () => {
    console.log(`Application running on https://${hostname}:${port}`);
  });
}
bootstrap();
