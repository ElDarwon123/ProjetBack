import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ObjectId, Types } from 'mongoose';
import { EstadoRevision } from 'src/enums/estado.revision.enum';

export class CreateRevisionDto {
  @IsMongoId()
  usuario: Types.ObjectId;
  @IsMongoId()
  seccion: Types.ObjectId;
  @IsEnum(EstadoRevision)
  estado: EstadoRevision;
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  titulo: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  sugerencia: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  descripcion: string;
  @IsMongoId()
  @IsNotEmpty()
  proyecto: ObjectId;
}
