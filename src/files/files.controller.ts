import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { ApiTags } from '@nestjs/swagger';
import { MulterFilee } from './global';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

@ApiTags('Archivo')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('File type not allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: MulterFilee) {
    if (!file) {
      throw new BadRequestException('File is not received');
    }
    return this.filesService.create(file);
  }

  @Get()
  async getAllFiles() {
    return this.filesService.findAll();
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return this.filesService.delete(id);
  }
}
