import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from '../utilities/CropUtility';
import PreviewCard from "./PreviewCard";
import { calculateDefaultCrop } from "../utilities/CropUtility";

type cropDimen = {
    x: number,
    y: number,
    width: number,
    height: number
}

function Upload() {
    const [caption, setCaption] = useState<string>('');
    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<cropDimen | unknown | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = URL.createObjectURL(file);
            setImgSrc(imageDataUrl);

            try {
                const defaultPx = await calculateDefaultCrop(imageDataUrl, 9/16) as cropDimen;
                setCroppedAreaPixels(defaultPx);
                const autoCroppedFile = await getCroppedImg({imageSrc: imageDataUrl, pixelCrop: defaultPx}) as Blob;
                setPreviewUrl(URL.createObjectURL(autoCroppedFile));
            } catch (err) {
                console.error('Could not auto-crop', err);
            }
        }
    }

    const onCropComplete = useCallback((_:cropDimen, croppedAreaPixels: cropDimen) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        try {
            if (!croppedAreaPixels) return;
            const pixelCrop = croppedAreaPixels as cropDimen;
            const file = await getCroppedImg( {imageSrc: imgSrc, pixelCrop} ) as Blob;
            setPreviewUrl(URL.createObjectURL(file));
        } catch (err) {
            console.error('Failed to crop image', err);
        }
    }
    
    const handleUpload = async () => {
        if (!imgSrc || !caption) return;

        try {
            const pixelCrop = croppedAreaPixels as cropDimen;
            const croppedFile = await getCroppedImg( {imageSrc: imgSrc, pixelCrop} ) as Blob;
            const formData = new FormData();
            formData.append('caption', caption);
            formData.append('file', croppedFile);

            const res = await fetch('http://localhost:8000/upload', {
                method: 'post',
                body: formData,
            });
            if(res.ok) {
                alert('Upload successful!');
                setImgSrc('');
                setCaption('');
                navigate('/gallery');
            }
        } catch (err) {
            console.error('Crop or Upload Failed', err);
        }
    }

    const resetParams = async () => {
        setImgSrc('');
        setPreviewUrl('');
        setCroppedAreaPixels(null);
        setCaption('');
        setZoom(1);
        setCrop({x: 1, y: 1});
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full px-[15%]">
            <h2 className="text-2xl">Submit a Style</h2>
            <input type="file" accept="image/*" onChange={onFileChange} ref={fileInputRef} className="bg-[#666666] cursor-pointer p-3 rounded-lg w-fit" />
            <input className="p-2 border-1 w-full text-md"
            type="text"
            placeholder="Title..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={100}
            />
            <div className="CropAndModal flex flex-col gap-3">
                {imgSrc && (
                    <div className="flex flex-col gap-3">

                    <button className="btn w-fit" onClick={() => {
                        const dlg = document.getElementById('crop_modal') as HTMLDialogElement | null;
                        if (dlg) dlg.showModal();
                    }}>Adjust Crop</button>

                    <dialog id='crop_modal' className="modal">
                        <div className="modal-box max-w-full">
                            <div className="h-[60vh] w-full">
                                <Cropper image={imgSrc}
                                crop={crop} zoom={zoom}
                                aspect={9 / 16}
                                zoomSpeed={0.1}
                                restrictPosition={true}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom} />
                            </div>
                        </div>
                        <div className="zoom-slider">
                            <span>Zoom:</span>
                            <input className="w-full"
                            type="range"
                            value={zoom}
                            min={1} max={3} step={0.01}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            />
                        </div>
                        <form method="dialog">
                                <button className="btn btn-lg" onClick={handleCrop}>Apply</button>
                            </form>
                    </dialog>
                    </div>
                )}
            </div>
            <div className="py-5">
                {previewUrl && (
                    <div className="flex flex-col gap-3">
                        <h3>Gallery Card Preview</h3>
                        <PreviewCard imgSrc={previewUrl} caption={caption} />
                    </div>
                )}
                {!previewUrl && (
                    <div className="flex flex-col gap-5">
                        <h3 className="text-md">Gallery Card Preview</h3>
                        <PreviewCard imgSrc={""} caption={""} />
                    </div>
                )}
            </div>
            <div className="flex justify-center gap-3">
                <button onClick={handleUpload} className="btn p-3">Submit</button>
                <button onClick={resetParams} className="btn p-3">Reset</button>
            </div>
        </div>
    )
}

export default Upload;