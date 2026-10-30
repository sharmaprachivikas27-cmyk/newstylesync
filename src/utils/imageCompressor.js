/**
 * Client-side Image Compression & Optimization Utility
 * Converts local files (JPEG, PNG, WEBP, etc.) into optimized base64 Data URLs.
 * Keeps file sizes lightweight (~60KB - 160KB) for instant rendering and Supabase storage.
 */

export async function compressImageFile(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    outputType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target.result;

      // If SVG, return as-is
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl); // Fallback to raw dataUrl if canvas context unavailable
          return;
        }

        // Fill background with white for transparent PNGs converted to JPEG
        if (outputType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL(outputType, quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas toDataURL fallback:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = (err) => {
        console.warn('Failed to load image for compression, using raw data URL:', err);
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Validates whether a string is a renderable image URL or Data URL
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}
