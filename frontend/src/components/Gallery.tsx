import { useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";

export type GalleryItem = {
    id: number,
    title: string,
    author: string,
    images: string[]
}

function Gallery() {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    // const [currentPage, setCurrentPage] = useState<number>(1);
    // const [totalPages, setTotalPages] = useState<number>(1);
    const [gender, setGender] = useState<string>("All");

    useEffect(() => {
        const fetchGallery = async () => {
            setLoading(true);
            try {
            const res = await fetch('http://localhost:8000/submission/gallery');
            const data = await res.json();
            setGallery(data as GalleryItem[]);
            } catch (err) {
                console.error("Failed to fetch gallery:", err);
            }
            setLoading(false);
        }
        fetchGallery();
    }, []);

    return (
        <div className="flex flex-col items-center w-full min-h-[80vh] px-[20%]">
            <form method="GET" className="flex flex-col items-center w-full 2xl:w-[70%] px-4 py-3 rounded-xl outline-3">
                <div className="grid grid-cols-4 gap-[10px] py-[10px] w-full">
                    <div className="flex flex-col items-center gap-2 md:text-sm lg:text-md xl:text-lg">
                        <div className="flex gap-3 items-center">
                            <label htmlFor="gender">Gender</label>
                            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} 
                            className="text-[#000000] bg-[#ffffff] border-1 border-[#000000] px-1">
                                <option value="A">All</option>
                                <option value="F">Female</option>
                                <option value="M">Male</option>
                                <option value="U">Unisex</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center w-full pt-3 border-t-1 gap-3">
                    <button className="btn btn-success btn-soft">Apply Filters</button>
                    <button className="btn btn-error btn-soft">Reset Filters</button>
                </div>
            </form>
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-[40vh] w-full">
                    <span className="text-[#ffffff90]">Loading...</span>
                    <span className="loading loading-ring loading-xl" />
                </div>
            )}
            <div className={`grid md:grid-cols-3 xl:grid-cols-5 2xl:max-w-[80%] gap-5 pt-30 place-items-center w-full
            transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                {gallery.map((item) => (
                    <GalleryCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    )
}

export default Gallery;