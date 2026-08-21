import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { image } = req.body; // Expecting base64 data string

    if (!image) {
      res.status(400).json({ success: false, message: 'No image data provided' });
      return;
    }

    if (!image.startsWith('data:image/')) {
      res.status(400).json({ success: false, message: 'Invalid image format. Must be base64 image data.' });
      return;
    }

    // Define upload folder
    const uploadDir = path.join(__dirname, '../../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Extract file extension and base64 body content
    const matches = image.match(/^data:image\/([A-Za-z\-+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ success: false, message: 'Invalid base64 image format' });
      return;
    }

    const extension = matches[1];
    const base64Data = matches[2];
    const filename = `image_${Date.now()}_${Math.round(Math.random() * 1e4)}.${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Save image file
    fs.writeFileSync(filepath, base64Data, { encoding: 'base64' });

    // Build static URL link
    const port = process.env.PORT || '5001';
    const imageUrl = `http://localhost:${port}/uploads/${filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url: imageUrl },
    });
  } catch (error) {
    next(error);
  }
}
