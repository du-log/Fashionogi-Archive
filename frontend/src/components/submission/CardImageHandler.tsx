import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { UploadCloud, X, ArrowLeftRight } from "lucide-react";
import getCroppedImg, { calculateDefaultCrop } from "../../utilities/CropUtility";
import type { UploadImageItem, cropDimen } from "./SubmissionUpload";

interface CardImageHandlerProps {
    images: UploadImageItem[],
    setImages: React.Dispatch<React.SetStateAction<UploadImageItem[]>>,
    onPreview: (url: string) => void
}

export default function CardImageHandler( {images, setImages, onPreview} : CardImageHandlerProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [crop, setCrop] = useState( {x: 0, y: 0} );
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<cropDimen | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const remainingSlots = 2 - images.length;
        if (remainingSlots <= 0) return;

        const filesToProcess = acceptedFiles.slice(0, remainingSlots);
        const newItems: UploadImageItem[] = [];

        try {
            for (let i = 0; i < filesToProcess.length; i++) {
                const file = filesToProcess[i];
                const rawUrl = URL.createObjectURL(file);
                const defaultPixels = (await calculateDefaultCrop(rawUrl, 9 / 16)) as cropDimen;
                const autoCroppedBlob = (await getCroppedImg({
                    imageSrc: rawUrl,
                    pixelCrop: defaultPixels,
                    targetSize: { width: 540, height: 960 }
                })) as Blob;
                const previewUrl = URL.createObjectURL(autoCroppedBlob);

                newItems.push({
                    id: Date.now() + i,
                    file,
                    rawUrl,
                    crop: { x: 0, y: 0 },
                    zoom: 1,
                    croppedAreaPixels: defaultPixels,
                    croppedBlob: autoCroppedBlob,
                    previewUrl
                });
            }
            setImages(prev => [...prev, ...newItems]);
        } catch (err) {
            console.error("Card image processing failed", err);
        }
    }, [images.length, setImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        maxFiles: 2 - images.length,
        disabled: images.length >= 2
    });

    const openCropper = (index: number) => {
        const target = images[index];
        setCrop(target.crop);
        setZoom(target.zoom);
        setCroppedAreaPixels(target.croppedAreaPixels);
        setEditingIndex(index);
    };

    const onCropComplete = useCallback((_: cropDimen, croppedPixels: cropDimen) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirmCrop = async () => {
        if (editingIndex === null || !croppedAreaPixels) return;
        try {
            const currentImg = images[editingIndex];
            const croppedBlob = (await getCroppedImg({
                imageSrc: currentImg.rawUrl,
                pixelCrop: croppedAreaPixels,
                targetSize: { width: 540, height: 960 }
            })) as Blob;

            URL.revokeObjectURL(currentImg.previewUrl);
            const newPrevUrl = URL.createObjectURL(croppedBlob);

            setImages(prev => {
                const updated = [...prev];
                updated[editingIndex] = {
                    ...currentImg,
                    crop,
                    zoom,
                    croppedAreaPixels,
                    croppedBlob,
                    previewUrl: newPrevUrl
                };
                return updated;
            });
            setEditingIndex(null);
        } catch (err) {
            console.error("Failed to crop card image", err);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const target = prev[index];
            URL.revokeObjectURL(target.rawUrl);
            URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const swapImages = () => {
        if (images.length < 2) return;
        setImages(prev => [prev[1], prev[0]]);
    };

    return (
        <div className="flex flex-col gap-2 text-mabi-text">
            <div className="flex items-center justify-between">
                <h2 className="text-xl">Card Cover Images</h2>
                <span className="text-xs text-mabi-text-muted">{images.length} / 2 selected</span>
            </div>
            <p className="text-xs text-mabi-text-muted">
                At least 1 required. The 1st image is the main cover; the 2nd displays when hovering over the card.
            </p>

            {images.length < 2 && (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                ${isDragActive ? "border-mabi-gold bg-mabi-surface-muted" : "border-mabi-border hover:border-mabi-border-heavy hover:bg-mabi-surface"}`}>
                    <input {...getInputProps()} />
                    <UploadCloud size={28} className="mb-1" />
                    <p className="text-sm">
                        {isDragActive ? "Drop card image(s) here..." : "Drag & drop or click to select Card Images"}
                    </p>
                </div>
            )}

            {images.length > 0 && (
                <div className="flex items-center gap-4 py-2 place-self-center">
                    {images.map((img, index) => (
                        <div key={img.id} className="relative group aspect-[9/16] w-28 rounded-lg overflow-hidden outline outline-mabi-border-heavy">
                            <img src={img.previewUrl} alt={`Card ${index + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 text-xs bg-mabi-surface-muted px-1.5 py-0.5 rounded">
                                {index === 0 ? "1st" : "2nd"}
                            </span>
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-600 text-white rounded p-0.5 cursor-pointer z-10"
                                title="Remove image">
                                <X size={14} />
                            </button>
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5 justify-center items-center p-2">
                                <button type="button" onClick={() => openCropper(index)} className="btn btn-xs w-full flex items-center gap-1">
                                    Crop
                                </button>
                                <button type="button" onClick={() => onPreview(img.previewUrl)} className="btn btn-xs w-full flex items-center gap-1">
                                    Preview
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {images.length === 2 && (
                        <button type="button" onClick={swapImages} className="btn btn-sm w-fit place-self-center flex items-center gap-1.5 bg-mabi-surface-muted border border-mabi-border"
                        title="Swap 1st and 2nd card images">
                            <ArrowLeftRight size={16} /> Swap Order
                        </button>
                    )}

            {editingIndex !== null && images[editingIndex] && (
                <dialog className="modal modal-open backdrop-blur-sm">
                    <div className="modal-box max-w-2xl bg-mabi-surface flex flex-col gap-4">
                        <h3 className="font-bold text-lg">
                            Adjust Card Image ({editingIndex === 0 ? "1st / Primary" : "2nd / Hover"})
                        </h3>
                        <div className="relative h-[55vh] w-full bg-[#000] rounded-lg overflow-hidden">
                            <Cropper
                                image={images[editingIndex].rawUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={9 / 16}
                                zoomSpeed={0.1}
                                restrictPosition={true}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-mabi-text-muted">Zoom: {zoom.toFixed(2)}x</span>
                            <input className="w-full" type="range" value={zoom} min={1} max={3} step={0.05} onChange={(e) => setZoom(Number(e.target.value))} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingIndex(null)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm">Cancel</button>
                            <button type="button" onClick={handleConfirmCrop} className="px-4 py-2 bg-[#DAA700] hover:bg-yellow-500 text-black rounded font-bold text-sm">Confirm Crop</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}