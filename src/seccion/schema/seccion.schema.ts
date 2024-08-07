import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Proyecto } from '../../proyecto/schema/proyecto.shema';
import * as mongoose from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty,  } from '@nestjs/swagger';

export class TipoSeccion {
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  contenido: string;
}
@Schema()
export class Seccion extends Document {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' })
  proyecto: Proyecto;

  @ApiProperty()
  @Prop({ required: true })
  tipoSeccion: TipoSeccion[];

  @ApiProperty()
  @Prop({ default: Date.now })
  fechaCreacion: Date;
}

export const seccionSchema = SchemaFactory.createForClass(Seccion);
