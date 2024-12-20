import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class MediaHandlerService {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION, // Région S3
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Charger le nom du bucket depuis l'environnement
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async compressMedia(fileBuffer: Buffer, quality: number, width: number) {
    const compressedBuffer = await sharp(fileBuffer)
      .resize({ width: width })
      .jpeg({ quality: quality })
      .toBuffer();

    return compressedBuffer;
  }
  async compressPngMedia(fileBuffer: Buffer, quality: number, width: number) {
    const compressedBuffer = await sharp(fileBuffer)
      .resize({ width: width })
      .png({ quality: quality })
      .toBuffer();

    return compressedBuffer;
  }
  async compressMediaByType(
    fileBuffer: Buffer,
    quality: number,
    width: number,
    type: string,
  ) {
    let compressedBuffer: Buffer;
    switch (type) {
      case 'image/jpeg':
        compressedBuffer = await this.compressMedia(fileBuffer, quality, width);
        break;
      case 'image/png':
        compressedBuffer = await this.compressPngMedia(
          fileBuffer,
          quality,
          width,
        );
        break;
      default:
        throw new Error('Unsupported media type');
    }

    return compressedBuffer;
  }
  async uploadMedia(
    fileBuffer: Buffer,
    fileName: string,
    path: string,
    type: string,
  ) {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: `${path}/${fileName}`,
      Body: fileBuffer,
      ContentType: type,
    };

    try {
      // Exécuter la commande d'upload
      const command = new PutObjectCommand(uploadParams);
      const res = await this.s3.send(command);

      // Retourner l'URL de l'objet uploadé
      const fileUrl = `${process.env.AWS_CDN_URL}/${path}/${fileName}`;
      await this.invalidateCloudFrontCache(
        process.env.CLOUDFRONT_DISTRIBUTION_ID,
        [`/${path}/${fileName}`],
      );
      return fileUrl;
    } catch (error) {
      console.error('Erreur lors de l’upload sur S3 :', error);
      throw new Error('Erreur lors de l’upload du fichier.');
    }
  }

  async invalidateCloudFrontCache(distributionId: string, paths: string[]) {
    const cloudFront = new CloudFrontClient({ region: process.env.AWS_REGION });
    const invalidationParams = {
      DistributionId: distributionId, // ID de votre distribution CloudFront
      InvalidationBatch: {
        CallerReference: `${Date.now()}`, // Identifiant unique
        Paths: {
          Quantity: paths.length,
          Items: paths, // Liste des chemins à invalider
        },
      },
    };

    try {
      const command = new CreateInvalidationCommand(invalidationParams);
      const response = await cloudFront.send(command);
    } catch (error) {
      console.error('Erreur lors de l’invalidation :', error);
      throw new Error('Impossible d’invalider le cache de CloudFront');
    }
  }
}
