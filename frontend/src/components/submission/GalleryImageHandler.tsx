import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, ArrowLeft, ArrowRight, Eye } from "lucide-react";
import getCroppedImg from "../../utilities/CropUtility";
import type { UploadImageItem, cropDimen } from "./SubmissionUpload";

interface GalleryImageHandlerProps {
    images: UploadImageItem[],
    setImages: React.Dispatch<React.SetStateAction<UploadImageItem[]>>,
    disabled?: boolean,
    onPreview: (url: string) => void
}

const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = url;
    });
};

export default function GalleryImageHandler( {images, setImages, disabled = false, onPreview} : GalleryImageHandlerProps) {
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (disabled) return;
        const remainingSlots = 3 - images.length;
        if (remainingSlots <= 0) return;

        const filesToProcess = acceptedFiles.slice(0, remainingSlots);
        const newItems: UploadImageItem[] = [];

        try {
            for (let i = 0; i < filesToProcess.length; i++) {
                const file = filesToProcess[i];
                const rawUrl = URL.createObjectURL(file);
                const { width, height } = await getImageDimensions(rawUrl);

                // Cap max dimension at 1920px while preserving original aspect ratio
                const scale = Math.min(1, 1920 / Math.max(width, height));
                const targetWidth = Math.round(width * scale);
                const targetHeight = Math.round(height * scale);
                const fullPixels: cropDimen = { x: 0, y: 0, width, height };

                const webpBlob = (await getCroppedImg({
                    imageSrc: rawUrl,
                    pixelCrop: fullPixels,
                    targetSize: { width: targetWidth, height: targetHeight }
                })) as Blob;
                const previewUrl = URL.createObjectURL(webpBlob);

                newItems.push({
                    id: Date.now() + 100 + i,
                    file,
                    rawUrl,
                    crop: { x: 0, y: 0 },
                    zoom: 1,
                    croppedAreaPixels: fullPixels,
                    croppedBlob: webpBlob,
                    previewUrl
                });
            }
            setImages(prev => [...prev, ...newItems]);
        } catch (err) {
            console.error("Gallery image processing failed", err);
        }
    }, [disabled, images.length, setImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        maxFiles: 3 - images.length,
        disabled: disabled || images.length >= 3
    });

    const removeImage = (index: number) => {
        setImages(prev => {
            const target = prev[index];
            URL.revokeObjectURL(target.rawUrl);
            URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const moveImage = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= images.length) return;
        setImages(prev => {
            const updated = [...prev];
            const [moved] = updated.splice(index, 1);
            updated.splice(targetIndex, 0, moved);
            return updated;
        });
    };

    return (
        <div className="flex flex-col gap-2 pt-2 border-t border-mabi-border text-mabi-text">
            <div className="flex items-center justify-between">
                <h2 className="text-xl">Additional Gallery Images</h2>
                <span className="text-xs text-mabi-text-muted">{images.length} / 3 selected</span>
            </div>
            <p className="text-xs text-mabi-text-muted">
                Optional (requires 2 card images first). Preserves original aspect ratio on the submission page.
            </p>

            {images.length < 3 && (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center transition-colors
                ${disabled ? "opacity-50 cursor-not-allowed border-mabi-border" : 
                isDragActive ? "border-mabi-gold bg-mabi-surface-muted cursor-pointer" : "border-mabi-border hover:border-mabi-border-heavy hover:bg-white/5 cursor-pointer"}`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={28} className="mb-1" />
                    <p className="text-sm">
                        {disabled ? "Select 2 Card Cover Images above to unlock additional gallery slots" : 
                        isDragActive ? "Drop gallery image(s) here..." : "Drag & drop or click to select Gallery Images"}
                    </p>
                </div>
            )}

            {images.length > 0 && (
                <div className="flex gap-3 flex-wrap py-2 place-self-center">
                    {images.map((img, index) => (
                        <div key={img.id} className="relative group w-32 h-24 bg-mabi-surface-muted/50 rounded-lg overflow-hidden outline outline-mabi-border-heavy">
                            <img src={img.previewUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-contain" />
                            <span className="absolute top-1 left-1 text-xs bg-mabi-surface-muted px-1.5 py-0.5 rounded">
                                #{index + 3}
                            </span>
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-[#CC0000] hover:bg-[#FF0000] text-white rounded p-0.5 cursor-pointer z-10"
                            title="Remove image">
                                <X size={14} />
                            </button>
                            <div className="absolute inset-0 bg-mabi-surface-muted/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5 justify-center items-center p-2">
                                {images.length > 1 && (
                                    <div className="flex gap-1 w-full justify-center">
                                        <button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} className="btn btn-xs flex-1" title="Move earlier">
                                            <ArrowLeft size={12} />
                                        </button>
                                        <button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} className="btn btn-xs flex-1" title="Move later">
                                            <ArrowRight size={12} />
                                        </button>
                                    </div>
                                )}
                                <button type="button" onClick={() => onPreview(img.previewUrl)} className="btn btn-xs w-full flex items-center gap-1">
                                    <Eye size={12} /> Preview
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}