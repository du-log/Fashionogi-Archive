type cropDimen = {
    x: number,
    y: number,
    width: number,
    height: number
}

export default async function getCroppedImg( {imageSrc, pixelCrop} : {imageSrc: string, pixelCrop: cropDimen} ) {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
        image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not resolve canvas 2D context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Could not make blob from canvas'));
                return;
            }
            const file = new File([blob], 'cropped_img.webp', {type: 'image/webp'});
            resolve(file);
        }, 'image/webp', 1);
    });
}

export const calculateDefaultCrop = ( imageSrc: string, aspect = 9 / 16 ) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let cropWidth, cropHeight;
            
            if (img.width / img.height > aspect) {
                // Image is wider than our ratio (letterbox sides)
                cropHeight = img.height;
                cropWidth = img.height * aspect;
            } else {
                // Image is taller than our ratio (letterbox top/bottom)
                cropWidth = img.width;
                cropHeight = img.width / aspect;
            }
            
            resolve({
                x: (img.width - cropWidth) / 2,
                y: (img.height - cropHeight) / 2,
                width: cropWidth,
                height: cropHeight
            });
        };
        img.src = imageSrc;
    });
}