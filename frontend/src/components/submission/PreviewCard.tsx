import { useState, useEffect } from "react";

interface UploadImageItem {
    id: number,
    file: File,
    rawUrl: string,
    crop: { x: number, y: number },
    zoom: number,
    croppedAreaPixels: cropDimen | null,
    croppedBlob: Blob | null,
    previewUrl: string
}

type cropDimen = {
    x: number,
    y: number,
    width: number,
    height: number
}

function PreviewCard({images, styleName, username} : {images: UploadImageItem[], styleName: string, username: string | undefined}) {
    const [isHovered, setHovered] = useState<boolean>(false);
    const [currentIndex, setIndex] = useState<number>(0);
    const hasImages = images.length > 0;
    const displayUrl = hasImages ? images[currentIndex].previewUrl : "";

    useEffect(() => {
        let interval: number | undefined;
        let timer: number | undefined;
        if (isHovered && hasImages && images.length > 1) {
            interval = window.setInterval(() => {
                setIndex((prev) => (prev === 1 ? 0 : 1));
            }, 1000);
        } else {
            if (currentIndex !== 0) timer = window.setInterval(() => setIndex(0), 0);
        }

        return () => {
                if (interval !== undefined) window.clearInterval(interval);
                if (timer !== undefined) window.clearInterval(timer);
            }
    }, [isHovered, hasImages, images.length, currentIndex])

    return (
        <div className="group relative w-fit h-fit max-w-[225px] outline-2 outline-[#758277] outline-offset-2 rounded-lg transition-transform duration-[0.2s] hover:scale-105"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
            <img src={hasImages ? displayUrl : ''}
            className={`aspect-[9/16] object-cover rounded-lg 
            ${hasImages ? "w-full h-full" : "w-[225px] h-[400px]"}
            ${isHovered ? "transition-opacity duration-200 ease-in-out" : ""}`} alt={"Preview"}></img>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#00000099] to-transparent rounded-b-lg pb-2 px-4 pt-2 transition-[0.5s] group-hover:bg-[#00000090]">
                <h3 className="font-bold text-md text-transparent truncate transition-[0.5s] group-hover:text-[#faa920]">{hasImages ? styleName : "Select image(s) first"}</h3>
                <h5 className="text-sm text-transparent transition-[0.5s] group-hover:text-[#fefefe]">{hasImages ? username : "Actual dimensions may vary"}</h5>
            </div>
        </div>
    )
}

export default PreviewCard;