// services/imageCompressionService.ts

interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0 to 1
}

export const compressImage = (file: File, options: CompressionOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }

    const img = document.createElement('img');
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const { maxWidth, maxHeight, quality } = options;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context.'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Resolve with the compressed Base64 string
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

export const imageFileToDataUrl = (file: File, compressOptions?: CompressionOptions): Promise<string> => {
    if (file.type === 'image/svg+xml') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target?.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    } else if (file.type.startsWith('image/')) {
        // Use existing compression for other image types
        return compressImage(file, compressOptions || { maxWidth: 400, maxHeight: 400, quality: 0.8 });
    } else {
        return Promise.reject(new Error('File is not a supported image type (SVG, PNG, JPG, etc.).'));
    }
};