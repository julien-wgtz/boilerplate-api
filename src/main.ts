import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NotFoundExceptionFilter } from './filter/not-found.filter';
import { readFileSync } from 'fs';
import * as bodyParser from 'body-parser';
import session from 'express-session'; // Import session directly from 'express-session'
import connectPgSimple from 'connect-pg-simple';
import { join } from 'path';
import cors from 'cors';
async function bootstrap() {
  let app;

  if (process.env.NODE_ENV === 'development') {
    const httpsOptions = {
      key: readFileSync('config/certs/key.pem'), // chemin vers ta clé privée
      cert: readFileSync('config/certs/cert.pem'), // chemin vers ton certificat public
    };

    app = await NestFactory.create(AppModule, {
      httpsOptions,
    });
  } else {
    app = await NestFactory.create(AppModule);
  }

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') as number;
  const hostname = configService.get('HOSTNAME') as string;
  const pgSession = connectPgSimple(session);
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.use(
    cors({
      origin: 'https://localhost:3000', // Autorise uniquement localhost:3000
      credentials: true, // Autorise les cookies
    }),
  );
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
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
        maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie lasts for 30 days
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
