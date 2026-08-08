import multer from 'multer';

const allowedMimes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const multerConfig: multer.Options = {
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 4 * 1024 * 1024, // 4 MB
  },

  fileFilter: (
    _req,
    file,
    cb,
  ) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Formato de arquivo inválido. Use apenas JPG, JPEG ou PNG.',
        ),
      );
    }
  },
};