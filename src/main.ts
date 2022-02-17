import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Confi')
    .setDescription('A comfi conference booking tool')
    .setVersion('1.0')
    .addTag('conferences')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Confi API Docs',
  };
  SwaggerModule.setup('api', app, document, customOptions);

  const PORT = app.get(ConfigService).get('port');
  await app.listen(PORT);
}
bootstrap().then((r) => r);
