import sharp from "sharp";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

function isBase64Image(str: string | null | undefined): boolean {
  return !!str && str.startsWith('data:image/');
}

function isImageKitUrl(str: string | null | undefined): boolean {
  return !!str && (str.includes('imagekit.io') || str.includes('ik.imagekit.io'));
}

async function uploadToImageKit(imageData: string, fileName: string, folder: string = '/products'): Promise<string | null> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  
  if (!privateKey) {
    console.log('ImageKit not configured, storing as base64');
    return null;
  }

  try {
    let base64Data: string;
    
    if (imageData.startsWith('data:image/')) {
      const base64Part = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Part, 'base64');
      
      const compressed = await sharp(buffer)
        .resize(1200, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: 82,
          effort: 4
        })
        .toBuffer();
      
      base64Data = `data:image/webp;base64,${compressed.toString('base64')}`;
    } else if (imageData.startsWith('http')) {
      const response = await fetch(imageData);
      if (!response.ok) return null;
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const compressed = await sharp(buffer)
        .resize(1200, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: 82,
          effort: 4
        })
        .toBuffer();
      
      base64Data = `data:image/webp;base64,${compressed.toString('base64')}`;
    } else {
      return null;
    }

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('fileName', fileName);
    formData.append('folder', folder);

    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('ImageKit upload failed:', await response.text());
      return null;
    }

    const result = await response.json() as { url: string };
    console.log(`Image uploaded to ImageKit: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    return null;
  }
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
  let processedImage = image;
  
  if (!isImageKitUrl(image)) {
    const fileName = `product-main-${Date.now()}.webp`;
    const imageKitUrl = await uploadToImageKit(image, fileName);
    if (imageKitUrl) {
      processedImage = imageKitUrl;
    } else {
      processedImage = await compressBase64Image(image);
    }
  }
  
  let processedAdditional: string[] | null = null;
  if (additionalImages && additionalImages.length > 0) {
    processedAdditional = await Promise.all(
      additionalImages.map(async (img, index) => {
        if (isImageKitUrl(img)) {
          return img;
        }
        const fileName = `product-additional-${index + 1}-${Date.now()}.webp`;
        const imageKitUrl = await uploadToImageKit(img, fileName);
        if (imageKitUrl) {
          return imageKitUrl;
        }
        return compressBase64Image(img);
      })
    );
  }
  
  return {
    image: processedImage,
    additionalImages: processedAdditional
  };
}

export async function compressOfferImages(images: string[]): Promise<string[]> {
  if (!images || images.length === 0) {
    return [];
  }
  
  const processedImages = await Promise.all(
    images.map(async (img, index) => {
      if (isImageKitUrl(img)) {
        return img;
      }
      const fileName = `offer-${index + 1}-${Date.now()}.webp`;
      const imageKitUrl = await uploadToImageKit(img, fileName, '/offers');
      if (imageKitUrl) {
        return imageKitUrl;
      }
      return compressBase64Image(img);
    })
  );
  
  return processedImages;
}
