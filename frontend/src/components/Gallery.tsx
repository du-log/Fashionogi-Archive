import { useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";
import { useSearchParams } from "react-router-dom";

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
    const [gender, setGender] = useState<string>("");
    const [race, setRace] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [title, setTitle] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [tag, setTag] = useState<string>('');
    const [, setSearchParams] = useSearchParams();

    const fetchGallery = async (queryParams = '') => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/submission/gallery${queryParams}`);
            const data = await res.json();
            setGallery(data as GalleryItem[]);
        } catch (err) {
            console.error("Failed to fetch gallery:", err);
        }
        setTimeout(() => setLoading(false), 500);
    }

    const applyFiltersHandler = (e: React.SubmitEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (title) params.append('title', title);
        if (username) params.append("username", username);
        if (tag) params.append("tag", tag);
        if (gender) params.append("gender", gender);
        if (race) params.append("race", race);
        if (sortBy && sortBy !== 'newest') params.append("sortBy", sortBy);

        setSearchParams(params);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        fetchGallery(queryString);
    }

    const resetFiltersHandler = () => {
        setTitle('');
        setUsername('');
        setTag('');
        setGender('');
        setRace('');
        setSortBy('newest');
        setSearchParams({});

        fetchGallery('');
    }



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
        }
        fetchGallery();
        setTimeout(() => setLoading(false), 500);
    }, []);

    return (
        <div className="flex flex-col items-center w-full min-h-[80vh] px-[20%]">
            <form method="GET" onSubmit={applyFiltersHandler} className="flex flex-col w-fit px-5 py-3 rounded-xl outline-3">
                <div className="flex gap-5 py-5 w-fit sm:text-md xl:text-lg items-center justify-center">
                    <h1 className="font-bold">Search By:</h1>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="p-1 bg-[#ffffff90] w-30 text-[#000]" placeholder="Title" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="p-1 bg-[#ffffff90] w-30 text-[#000]" placeholder="Username" />
                    <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} className="p-1 bg-[#ffffff90] w-30 text-[#000]" placeholder="Tag" />
                </div>
                <div className="flex gap-5 py-5 w-fit sm:text-md xl:text-lg items-center justify-center">
                    <h1 className="font-bold">Filter By:</h1>
                    <div className="flex gap-2 items-center">
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} 
                        className="text-[#000] bg-[#ffffff90] p-1">
                            <option value="">All</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                        </select>
                    </div>
                    <div className="flex gap-2 items-center">
                        <label htmlFor="race">Race</label>
                        <select id="race" value={race} onChange={(e) => setRace(e.target.value)} 
                        className="text-[#000] bg-[#ffffff90] p-1">
                            <option value="">All</option>
                            <option value="elf">Elf</option>
                            <option value="human">Human</option>
                            <option value="giant">Giant</option>
                        </select>
                    </div>
                    <div className="flex gap-2 items-center">
                        <label htmlFor="sort">Sort By</label>
                        <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} 
                        className="text-[#000] bg-[#ffffff90] p-1">
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="favorites">Favorites</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-center w-full pt-3 border-t-1 gap-3">
                    <button type="submit" className="btn btn-success btn-soft">Apply Filters</button>
                    <button type="button" onClick={resetFiltersHandler} className="btn btn-error btn-soft">Reset Filters</button>
                </div>
            </form>
            {isLoading && (
                <div className="absolute flex flex-col items-center justify-center h-[60vh] w-full z-[-10]">
                    <span className="text-[#ffffff90]">Loading...</span>
                    <span className="loading loading-ring loading-xl" />
                </div>
            )}
            {gallery.length >= 1 && (
                <div className={`grid md:grid-cols-3 xl:grid-cols-5 2xl:max-w-[80%] gap-5 pt-30 place-items-center w-full
                transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    {gallery.map((item) => (
                        <GalleryCard key={item.id} item={item} />
                    ))}
                </div>
            )}
            {!isLoading && gallery.length === 0 && (
                <div className="absolute flex flex-col items-center justify-center h-[60vh] z-[-10]">
                    <h1 className="text-lg">No styles found. Try a new search.</h1>
                </div>
            )}
        </div>
    )
}

export default Gallery;