import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { validationPipeOptions } from './common/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  const config = new DocumentBuilder()
    .setTitle('Confi')
    .setDescription('A comfy conference booking tool')
    .setVersion('1.0')
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
