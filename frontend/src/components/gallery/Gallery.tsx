import { useCallback, useEffect, useState } from "react";
import GalleryCard from "./GalleryCard";
import { useSearchParams } from "react-router-dom";
import TagsComboBox from "./TagsComboBox";

export type GalleryItem = {
    id: number,
    title: string,
    author: string,
    images: string[],
    favorites: number
}

const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
        
    if (current <= 3) {
        return [1, 2, 3, 4, '...', total];
    }
        
    if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total];
    }
        
    return [1, '...', current - 1, current, current + 1, '...', total];
};

function Gallery() {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [resultsLoading, setResultsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [gender, setGender] = useState<string>("");
    const [race, setRace] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [title, setTitle] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [tag, setTag] = useState<string>('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [totalItems, setTotalItems] = useState<number>(0);

    const pageNumbers = getPageNumbers(currentPage, totalPages);

    const fetchGallery = useCallback((queryParams = '') => {
        setLoading(true);
        setResultsLoading(true);
        setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/submissions${queryParams}`);
                const data = await res.json();
                if(data) setResultsLoading(false);
                setGallery(data.items as GalleryItem[]);
                setCurrentPage(Number(data.current_page));
                setTotalPages(Number(data.total_pages));
                setTotalItems(Number(data.total_items));
                setTimeout(() => setLoading(false), 200);
            } catch (err) {
                console.error("Failed to fetch gallery:", err);
            }
        }, 500);
    }, [])

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
        fetchGallery(`?${params.toString()}`);
    }

    const applyFiltersHandler = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (title) params.append('title', title);
        if (username) params.append("username", username);
        if (tag) params.append("tag", tag);
        if (gender) params.append("gender", gender);
        if (race) params.append("race", race);
        if (sortBy && sortBy !== 'newest') params.append("sortBy", sortBy);

        params.set('page', '1');

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
        document.documentElement.scrollTop = 0;

        const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

        const timeoutId = window.setTimeout(() => {
            setTitle(searchParams.get('title') || '');
            setUsername(searchParams.get('username') || '');
            setTag(searchParams.get('tag') || '');
            setGender(searchParams.get('gender') || '');
            setRace(searchParams.get('race') || '');
            setSortBy(searchParams.get('sortBy') || 'newest');

            fetchGallery(queryString);
            setPageLoading(false);
        }, 100);

        return () => window.clearTimeout(timeoutId);
    }, [fetchGallery, searchParams]);

    return (
        <div className={`flex flex-col items-center w-full min-h-[100vh] px-[20%] transition-opacity duration-200 ease-in-out ${pageLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <form method="GET" onSubmit={applyFiltersHandler} className="flex flex-col w-fit px-5 py-3 rounded-xl outline-3">
                <div className="flex gap-5 py-5 w-fit sm:text-md xl:text-lg items-center justify-center">
                    <h1 className="font-bold">Search By:</h1>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="p-1 bg-[#ffffff50] w-30 text-[#fff] outline outline-[#fff] rounded" placeholder="Title" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="p-1 bg-[#ffffff50] w-30 text-[#fff] outline outline-[#fff] rounded" placeholder="Username" />
                    <TagsComboBox tag={tag} setTag={setTag} />
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
                <>
                <div className={`grid md:grid-cols-3 xl:grid-cols-5 xl:max-w-[80%] pt-30 gap-5 place-items-center w-full
                transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    {gallery.map((item) => (
                        <GalleryCard key={item.id} item={item} />
                    ))}
                </div>
                <div className="flex justify-center items-center gap-3 py-10">
                    <button className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : ''}`} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                    {pageNumbers.map((num, index) => (
                        num === '...' ? (
                            <span key={`ellipsis-${index}`}>...</span>
                        ) : (
                            <button key={`page-${num}`} className={`btn btn-sm ${currentPage === num ? 'btn-active btn-primary cursor-default' : ''}`} onClick={() => { if (currentPage !== num) handlePageChange(num as number) }}>{num}</button>
                        )
                    ))}
                    <button className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : ''}`} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <p className="text-sm">Total Items: {totalItems}</p>
                </div>
                </>
            )}
            {!isLoading && gallery.length < 1 && !resultsLoading && (
                <div className="absolute flex flex-col items-center justify-center h-[60vh] z-[-10]">
                    <h1 className="text-lg">No styles found. Try a new search.</h1>
                </div>
            )}
        </div>
    )
}

export default Gallery;