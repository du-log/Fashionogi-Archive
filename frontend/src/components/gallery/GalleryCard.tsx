import { useNavigate } from "react-router-dom";
import type { GalleryItem } from "./Gallery";
import { useState, useEffect } from "react";
import { HeartIcon } from "lucide-react";
import { formatFavorites } from "../../utilities/MiscUtility";

function GalleryCard( {item} : {item: GalleryItem} ) {
    const navigate = useNavigate();
    const [isHovered, setHovered] = useState<boolean>(false);
    const [currentIndex, setIndex] = useState<number>(0);

    const hasImages = item.images && item.images.length > 0;

    const displayUrl = hasImages ? `http://localhost:8000${item.images[currentIndex]}` : "";

    useEffect(() => {
            let interval: number | undefined;
            let timer: number | undefined;
            if (isHovered && hasImages && item.images.length > 1) {
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
        }, [isHovered, hasImages, item.images.length, currentIndex])

    return (
        <div className="group relative cursor-pointer w-full h-full outline-3 outline-[#ffffff99] outline-offset-2 rounded-lg transition-transform duration-[0.2s] hover:scale-105"
        onClick={() => navigate(`/fashion/id/${item.id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
            <img src={hasImages ? displayUrl : ""}
            className="aspect-[9/16] w-full h-full object-cover rounded-lg" alt={item.title} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#00000099] to-transparent rounded-b-lg pb-2 px-4 pt-2 transition-[0.5s] group-hover:bg-[#00000090]">
                <h3 className="font-bold sm:text-sm xl:text-lg text-transparent truncate transition-[0.5s] group-hover:text-[#faa920]">{item.title}</h3>
                <div className="flex justify-between items-center">
                    <h5 className="sm:text-xs xl:text-sm text-transparent transition-[0.5s] group-hover:text-[#fefefe]">{item.author}</h5>
                    <div className="relative flex items-center justify-center gap-1 sm:text-xs xl:text-sm text-transparent transition-[0.5s] group-hover:text-[#fefefe]">
                        {item.favorites !== undefined && (
                            <>
                                <p>{formatFavorites(item.favorites)}</p>
                                <HeartIcon size={20} />
                            </>
                        )}
                        {item.favorites === undefined && (
                            <>
                                <p>{formatFavorites(275000)}</p>
                                <HeartIcon size={20} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GalleryCard;