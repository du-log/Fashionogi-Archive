import { useNavigate } from "react-router-dom";
import type { GalleryItem } from "./Gallery";
import { useState, useEffect } from "react";

function GalleryCard( {item} : {item: GalleryItem} ) {
    const navigate = useNavigate();
    const [isHovered, setHovered] = useState<boolean>(false);
    const [currentIndex, setIndex] = useState<number>(0);

    const hasImages = item.images && item.images.length > 0;

    const displayUrl = hasImages ? `http://localhost:8000${item.images[currentIndex]}` : "";

    useEffect(() => {
            let timer: number | undefined;
            if (isHovered && hasImages && item.images.length > 1) {
                timer = window.setInterval(() => {
                    setIndex((prev) => (prev === 1 ? 0 : 1));
                }, 1000);
            } else {
                setIndex(0);
            }
    
            return () => {
                if (timer !== undefined) window.clearInterval(timer);
            }
        }, [isHovered, hasImages, item.images.length, currentIndex])

    return (
        <div className="group relative cursor-pointer w-full h-full outline-3 outline-[#ffffff99] outline-offset-2 rounded-lg transition-transform duration-[0.2s] hover:scale-105"
        onClick={() => navigate(`/submission/${item.id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
            <img src={hasImages ? displayUrl : ""}
            className="aspect-[9/16] w-full h-full object-cover rounded-lg" alt={item.title} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#00000099] to-transparent rounded-b-lg pb-2 px-4 pt-2 transition-[0.5s] group-hover:bg-[#10101090]">
                <h3 className="font-bold text-lg text-transparent truncate transition-[0.5s] group-hover:text-[#daa520]">{item.title}</h3>
                <h5 className="text-sm text-transparent transition-[0.5s] group-hover:text-[#fefefe99]">{item.author}</h5>
            </div>
        </div>
    )
}

export default GalleryCard;