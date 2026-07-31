import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly useCloudinary: boolean;
  private readonly uploadDir: string;

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('cloudinary.cloudName');
    const apiKey = this.config.get<string>('cloudinary.apiKey');
    const apiSecret = this.config.get<string>('cloudinary.apiSecret');
    this.useCloudinary = !!(cloudName && apiKey && apiSecret);
    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
    this.uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; mime: string; name: string }> {
    if (this.useCloudinary) {
      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'naijajobber' },
            (err, res) => {
              if (err || !res)
                reject(err || new Error('Cloudinary upload failed'));
              else resolve(res as { secure_url: string });
            },
          );
          stream.end(file.buffer);
        },
      );
      return {
        url: result.secure_url,
        mime: file.mimetype,
        name: file.originalname,
      };
    }

    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fs = await import('fs/promises');
    await fs.writeFile(join(this.uploadDir, filename), file.buffer);
    const base =
      this.config.get<string>('apiPublicUrl') ||
      `http://localhost:${this.config.get('port') || 3001}`;
    this.logger.log(`Saved local upload ${filename}`);
    return {
      url: `${base}/uploads/${filename}`,
      mime: file.mimetype,
      name: file.originalname,
    };
  }
}
