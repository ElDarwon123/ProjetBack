import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, ObjectId } from 'mongoose';
import { EstadoRevision } from 'src/enums/estado.revision.enum';
import { Seccion } from 'src/seccion/schema/seccion.schema';
import { Usuario } from 'src/usuario/schema/usuario.schema';

@Schema()
export class Revision extends Document {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' })
  usuario: Usuario;
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' })
  seccion: Seccion[];
  @ApiProperty()
  @Prop({
    required: true,
    enum: EstadoRevision,
  })
  estado: EstadoRevision;
  @ApiProperty()
  @Prop({ type: String, required: true })
  titulo: string;
  @ApiProperty()
  @Prop({ type: String, required: true })
  sugerencia: String;
  @ApiProperty()
  @Prop({ type: String, required: true })
  descripcion: String;
  @ApiProperty()
  @Prop({ default: Date.now })
  fechaRevision: Date;
  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proyecto',
    required: true,
  })
  proyecto: ObjectId;
}

export const revisionSchema = SchemaFactory.createForClass(Revision);
