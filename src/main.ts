import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NotFoundExceptionFilter } from './filter/not-found.filter';
import { readFileSync } from 'fs';
import * as session from 'express-session'; // Import session directly from 'express-session'
import * as connectPgSimple from 'connect-pg-simple';


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
  const pgSession = connectPgSimple(session);

  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.use(
    session({
      store: new pgSession({
        conString: configService.get('DATABASE_URL'),
        tableName: 'Sessions',
      }),
      secret: configService.get('SECRET_SESSION'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    }),
  );
  await app.listen(port, hostname, () => {
    console.log(`Application running on https://${hostname}:${port}`);
  });
}
bootstrap();
