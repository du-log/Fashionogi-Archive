import { useState, useCallback, useContext } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { User, UploadCloud, X, Check, Loader2 } from "lucide-react";
import getCroppedImg from "../../utilities/CropUtility";
import type { cropDimen } from "../submission/SubmissionUpload";
import { USERS_URL } from "../../utilities/MiscUtility";
import { AuthContext } from "../../contexts/AuthContext";

export default function AvatarSettings( {currentAvatarId} : {currentAvatarId?: string} ) {
    const auth = useContext(AuthContext);
    const checkSession = auth?.checkSession ?? (() => {});

    const [rawImage, setRawImage] = useState<string | null>(null);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<cropDimen | null>(null);

    const displayAvatar = previewUrl || (currentAvatarId ? currentAvatarId : null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setRawImage(reader.result as string);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const onCropComplete = useCallback((_: cropDimen, croppedPixels: cropDimen) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirmCrop = async () => {
        if (!rawImage || !croppedAreaPixels) return;
        try {
            const file = await getCroppedImg({
                imageSrc: rawImage,
                pixelCrop: croppedAreaPixels,
                targetSize: { width: 256, height: 256 }
            }) as File;
            
            setCroppedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setRawImage(null);
        } catch (e) {
            console.error("Cropping failed", e);
        }
    };

    const handleCancel = () => {
        setRawImage(null);
        setCroppedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleUpload = async () => {
        if (!croppedFile) return;
        setIsUploading(true);
        
        const formData = new FormData();
        formData.append("file", croppedFile);

        try {
            const res = await fetch(`${USERS_URL}/me/avatar`, {
                method: "POST",
                body: formData,
                credentials: 'include'
            });

            if (res.ok) {
                setCroppedFile(null);
                checkSession();
            }
        } catch (error) {
            console.error("Upload error", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-6 items-center text-mabi-text">
            <div className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 overflow-hidden bg-mabi-surface flex items-center justify-center outline outline-2 outline-mabi-border">
                    {displayAvatar ? (
                        <img src={displayAvatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} />
                    )}
                </div>
            </div>

            <div className="flex-grow w-full">
                {!rawImage && !croppedFile && (
                    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-mabi-gold bg-mabi-surface-muted bg-opacity-10" : "border-mabi-border hover:border-mabi-border-heavy hover:bg-mabi-surface hover:bg-opacity-5"}`}>
                        <input {...getInputProps()} />
                        <UploadCloud size={32} className="mb-2" />
                        <p className="text-sm">
                            {isDragActive ? "Drop image here..." : "Drag & drop an image, or click to select"}
                        </p>
                    </div>
                )}

                {rawImage && (
                    <div className="flex flex-col gap-3">
                        <div className="relative w-full h-64 bg-[#000] rounded-lg overflow-hidden">
                            <Cropper
                                image={rawImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={handleCancel} className="px-4 py-2 bg-[#600000] hover:bg-[#800000] text-[#FFF] rounded font-bold text-sm">Cancel</button>
                            <button onClick={handleConfirmCrop} className="px-4 py-2 bg-mabi-gold hover:bg-mabi-orange text-[#000] rounded font-bold text-sm">Confirm Crop</button>
                        </div>
                    </div>
                )}

                {croppedFile && !rawImage && (
                    <div className="flex flex-col gap-3">
                        <p className="text-mabi-text-muted text-sm font-semibold">Avatar ready to upload!</p>
                        <div className="flex gap-2">
                            <button onClick={handleUpload} disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#006000] hover:bg-[#007000] text-[#FFF] rounded font-bold text-sm disabled:opacity-50 cursor-pointer disabled:cursor-normal">
                                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                {isUploading ? "Uploading..." : "Save Avatar"}
                            </button>
                            <button onClick={handleCancel} disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#606060] hover:bg-[#707070] text-[#FFF] rounded font-bold text-sm disabled:opacity-50 cursor-pointer disabled:cursor-normal">
                                <X size={16} /> Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}