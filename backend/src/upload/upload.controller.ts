import { Controller, Post, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Controller('upload')
export class UploadController {
    @Post('images')
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: './public/images',
            filename: (req, file, cb) => {
                const name = uuid() + extname(file.originalname);
                cb(null, name);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
                return cb(new Error('Only image files allowed'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }))
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        return files.map(f => ({
            url: `/images/${f.filename}`,
            originalName: f.originalname,
            size: f.size,
        }));
    }
}
