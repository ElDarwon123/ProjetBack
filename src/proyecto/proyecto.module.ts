// import { Module } from '@nestjs/common';

// @Module({})
// export class ProyectoModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto, ProyectoSchema } from './schema/proyecto.shema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Proyecto.name, schema: ProyectoSchema }])],
  providers: [ProyectoService],
  controllers: [ProyectoController],
})
export class ProyectoModule {}