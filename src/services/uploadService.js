import { supabase, isSupabaseConfigured } from '../supabase';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';

export const DEFAULT_SHOP_LOGO =
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80';

export const DEFAULT_SHOP_BANNER =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80';

// Active bucket cache to avoid repeated checks
let cachedActiveBucket = null;

/**
 * List of candidate bucket names to check in order:
 * 1. Configured via .env (VITE_SUPABASE_STORAGE_BUCKET)
 * 2. 'product-images' (default recommended)
 * 3. 'img' (user's preferred/custom bucket)
 * 4. 'images'
 */
function getCandidateBuckets() {
  const envBucket = import.meta.env?.VITE_SUPABASE_STORAGE_BUCKET?.trim();
  const list = [envBucket, 'product-images', 'img', 'images', 'shop-images'].filter(Boolean);
  // Remove duplicates
  return [...new Set(list)];
}

/**
 * Converts a browser File/Blob to a base64 data URL
 * Ensures uploads NEVER crash or block shop/product creation
 * even if the Supabase Storage bucket hasn't been created yet.
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a single image file to Supabase Storage.
 * Supports multiple bucket names ('product-images', 'img', 'images')
 * and falls back gracefully to Data URL if no bucket is configured yet.
 *
 * @param {File|Blob} file The file to upload
 * @param {string} folder Destination folder (e.g., 'products', 'logos')
 * @returns {Promise<string>} Public URL or Data URL of image
 */
export async function uploadImageToSupabase(file, folder = 'products') {
  if (!file) throw new Error('No file provided for upload.');

  // If already a URL string or data URL, return directly
  if (typeof file === 'string') return file;

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using inline Data URL.');
    return await fileToBase64(file);
  }

  // Derive file extension
  let ext = 'jpg';
  if (file.name && file.name.includes('.')) {
    ext = file.name.split('.').pop().toLowerCase();
  } else if (file.type) {
    const subtype = file.type.split('/')[1];
    if (subtype) ext = subtype.replace('jpeg', 'jpg');
  }

  const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `${folder}/${cleanName}`;

  const candidateBuckets = cachedActiveBucket
    ? [cachedActiveBucket, ...getCandidateBuckets().filter(b => b !== cachedActiveBucket)]
    : getCandidateBuckets();

  let lastError = null;

  // Try candidate buckets
  for (const bucketName of candidateBuckets) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (!error && data) {
        cachedActiveBucket = bucketName;
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      }

      if (error) {
        lastError = error;
        // If error is "Bucket not found", continue to next candidate
        if (error.message?.toLowerCase().includes('bucket not found')) {
          continue;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  // If all Supabase buckets failed or are not created yet:
  // Convert to base64 Data URL so the user's action NEVER fails!
  console.warn(
    `Supabase Storage bucket not available (${lastError?.message || 'Bucket not found'}). Falling back to base64 Data URL.`
  );

  try {
    const dataUrl = await fileToBase64(file);
    return dataUrl;
  } catch (convErr) {
    console.error('Base64 conversion error:', convErr);
    return DEFAULT_PRODUCT_IMAGE;
  }
}

/**
 * Upload multiple files to Supabase Storage with graceful fallback.
 * @param {FileList|File[]} filesList
 * @param {Function} onProgress Optional progress callback (current, total)
 * @param {string} folder Destination folder
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function uploadMultipleImagesToSupabase(filesList, onProgress = null, folder = 'products') {
  const files = Array.from(filesList).filter(f => f.type && f.type.startsWith('image/'));
  if (files.length === 0) return [];

  const results = [];
  for (let i = 0; i < files.length; i++) {
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
    const imgUrl = await uploadImageToSupabase(files[i], folder);
    if (imgUrl) {
      results.push(imgUrl);
    }
  }

  return results;
}
