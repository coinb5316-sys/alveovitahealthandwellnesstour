// backend/config/multer.js
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let resourceType = 'auto';
    if (file.mimetype && file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.mimetype && file.mimetype.startsWith('audio/')) {
      resourceType = 'raw';
    } else if (file.mimetype && file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    }

    return {
      folder: 'tourvibe/experiences',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mp3', 'wav', 'mpeg'],
      resource_type: resourceType,
      // For large videos, use eager_async
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ],
      eager_async: true,
      eager: resourceType === 'video' ? [
        { quality: 'auto', fetch_format: 'auto', format: 'mp4' }
      ] : undefined
    };
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'audio/mp3',
      'audio/wav',
      'audio/mpeg',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Please upload an image, video, or audio file.`), false);
    }
  },
});

export default upload;