type cropDimen = {
    x: number,
    y: number,
    width: number,
    height: number
}

export default async function getCroppedImg( {imageSrc, pixelCrop, targetSize} : {imageSrc: string, pixelCrop: cropDimen, targetSize?:{width: number, height: number}} ) {
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

    canvas.width = targetSize ? targetSize.width : pixelCrop.width;
    canvas.height = targetSize ? targetSize.height : pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, canvas.width, canvas.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Could not make blob from canvas'));
                return;
            }
            const file = new File([blob], 'cropped_img.webp', {type: 'image/webp'});
            resolve(file);
        }, 'image/webp', 0.85);
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