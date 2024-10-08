import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Access-Control-Allow-Headers, Authorization, Content-Type, Accept',
  });
  const conf = new DocumentBuilder()
    .setTitle('ProjectWizzard')
    .setDescription("it's a formative project")
    .setVersion('1.5.7')
    .build();
  const doc = SwaggerModule.createDocument(app, conf);
  SwaggerModule.setup('api', app, doc);
  // configuración para env
  app.useGlobalPipes(new ValidationPipe());
  const config = app.get(ConfigService);
  const PORT = config.get<number>('PORT') || process.env.PORT;
  const uri = config.get<string>('URI');
  await app.listen(PORT);
  console.log(`http://localhost:${PORT}`);
  
  
}
bootstrap();
