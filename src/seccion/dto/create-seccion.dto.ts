import { IsArray, IsMongoId, IsNotEmpty, IsObject, IsString } from 'class-validator';
import mongoose, { ObjectId } from 'mongoose';
import { TipoSeccion } from '../schema/seccion.schema';

export class CreateSeccionDto {
  @IsMongoId()
  @IsNotEmpty()
  proyecto: ObjectId;
  @IsArray()
  @IsNotEmpty()
  tipoSeccion: TipoSeccion[];
}
