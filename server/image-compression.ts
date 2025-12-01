import sharp from "sharp";

function isBase64Image(str: string | null | undefined): boolean {
  return !!str && str.startsWith('data:image/');
}

export async function compressBase64Image(base64: string, maxWidth: number = 1200): Promise<string> {
  if (!isBase64Image(base64)) {
    return base64;
  }

  try {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const compressed = await sharp(buffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ 
        quality: 82,
        effort: 4
      })
      .toBuffer();
    
    return `data:image/webp;base64,${compressed.toString('base64')}`;
  } catch (error) {
    console.error('Image compression failed:', error);
    return base64;
  }
}

export async function compressProductImages(
  image: string,
  additionalImages?: string[] | null
): Promise<{ image: string; additionalImages: string[] | null }> {
  const compressedImage = await compressBase64Image(image);
  
  let compressedAdditional: string[] | null = null;
  if (additionalImages && additionalImages.length > 0) {
    compressedAdditional = await Promise.all(
      additionalImages.map(img => compressBase64Image(img))
    );
  }
  
  return {
    image: compressedImage,
    additionalImages: compressedAdditional
  };
}
