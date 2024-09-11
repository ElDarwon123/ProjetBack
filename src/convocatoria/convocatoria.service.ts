import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';
import { UpdateConvocatoriaDto } from './dto/update-convocatoria.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Convocatoria } from './schemas/convocatoria.entity';
import { Model, Types } from 'mongoose';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';
import { notiStateEnum } from 'src/enums/estado-noti.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConvocatoriaService {
  constructor(
    @InjectModel(Convocatoria.name)
    private readonly convocatoriaModel: Model<Convocatoria>,
    private readonly firebaseService: FirebaseService,
    private readonly notisService: NotificacionesService,
    private readonly configService: ConfigService,
  ) { }

  async create(
    createConvocatoriaDto: CreateConvocatoriaDto,
    file: Express.Multer.File[]
  ): Promise<Convocatoria> {


    try {
      const newCon = new this.convocatoriaModel(createConvocatoriaDto);
      
      const uploadFIles = await Promise.all(
        file.map(async (file) => {
          const fileBuffer = file.buffer;
          const fileDestination = `convocatoria/${newCon._id}/${file.originalname}`;
          const fileMymeType = file.mimetype;
          if (!fileBuffer && !fileDestination && !fileMymeType) {
            throw new BadRequestException('Invalid file upload');
          }
          await this.firebaseService.uploadFile(
            fileBuffer,
            fileDestination,
            fileMymeType,);

          const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${this.configService.get<string>('FIREBASE_URL')}/o/${encodeURIComponent(fileDestination)}?alt=media`;
          return fileUrl
        })
      );

      createConvocatoriaDto.files = uploadFIles

      await newCon.save();

      //  Notification body
      const title = 'Nueva convocatoria!';
      const body = 'Se ha creado una nueva convocatoria, ¡Revísala ahora!';
      this.notisService.createNotiAnnouncement({
        title,
        body,
        convocatoria: newCon.id,
        estado: notiStateEnum.NonViwed
      });
      return newCon;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Convocatoria[]> {
    try {
      const convs = await this.convocatoriaModel.find();
      return convs;
    } catch (error) {
      throw new NotFoundException('Announcement not found');
    }
  }

  async findOne(id: Types.ObjectId) {
    try {
      const conv = await this.convocatoriaModel.findById(id);
      return conv;
    } catch (error) {
      throw new NotFoundException('Announcement not found');
    }
  }

  async update(
    id: Types.ObjectId,
    updateConvocatoriaDto: UpdateConvocatoriaDto,
  ) {
    try {
      const conv = await this.convocatoriaModel.findByIdAndUpdate(
        id,
        updateConvocatoriaDto,
        { new: true },
      );
      return conv;
    } catch (error) {
      throw new BadRequestException('Invalid id or body');
    }
  }

  async remove(id: Types.ObjectId) {
    try {
      const delConv = await this.convocatoriaModel.findByIdAndDelete(id);
      return delConv;
    } catch (error) {
      throw new NotFoundException('Announcement not found');
    }
  }
}
