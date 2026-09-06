import { useEffect, useState } from "react";
import GalleryCard from "./gallery/GalleryCard";
import type { GalleryItem } from "./gallery/Gallery";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function Home() {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [latestStyles, setLatestStyles] = useState<GalleryItem[]>([]);
    const [topStyles, setTopStyles] = useState<GalleryItem[]>([]);
    const [total, setTotal] = useState<number>(0);

    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const res = await fetch('http://localhost:8000/api/submissions/latest');
            const data = await res.json();
            setLatestStyles(data);

            const res3 = await fetch('http://localhost:8000/api/submissions/top');
            const data3 = await res3.json();
            setTopStyles(data3);

            const res2 = await fetch('http://localhost:8000/api/submissions/amount')
            const data2 = await res2.json();
            setTotal(Number(data2.total_submissions))
        }
        document.documentElement.scrollTop = 0;
        fetchData();
        setTimeout(() => setLoading(false), 300);
    }, [])

    return (
        <div className={`flex flex-col gap-20 w-full min-h-[100vh] px-[10%] xl:px-[20%] transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="flex flex-col w-full gap-10">
                <div className="flex flex-col gap-5 py-10 border-b border-b-[#ffffff90]">
                    <h1 className="text-7xl text-[#ffd700] leading-tight">Discover your Erinn Style</h1>
                    <p className="text-lg text-[#d1d1d1] max-w-md">The ultimate lookbook for Mabinogi fashion. Discover new dye combinations, share your finest outfits, and inspire the community.</p>
                </div>
                <h1 className="text-center text-xl text-[#ffd700]">There are currently {total} styles featured in the lookbook!</h1>
            </div>
            <div className="flex flex-col w-full xl:px-[10%]">
                <h1 className="text-xl text-[#d1d1d1] font-bold">Latest</h1>
                <div className="grid grid-cols-5 gap-5 w-full place-items-center py-10">
                    {latestStyles.map((item => (
                        <GalleryCard key={item.id} item={item} />
                    )))}
                </div>
            </div>
            <div className="flex flex-col w-full xl:px-[10%]">
                <h1 className="text-xl text-[#d1d1d1] font-bold">Most Favorited</h1>
                <div className="grid grid-cols-5 gap-5 w-full place-items-center py-10">
                    {topStyles.map((item => (
                        <GalleryCard key={item.id} item={item} />
                    )))}
                </div>
            </div>
            <div className="flex flex-col gap-5 w-full xl:px-[20%]">
                <h1 className="font-bold text-2xl text-center">Explore the Styles</h1>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/gallery?tag=casual')} className="btn h-fit py-2 px-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border border-[#ffffff90] text-xl font-bold text-[#ffffff90] hover:text-[#fff] hover:border-[#aaff00]">Casual</button>
                    <button onClick={() => navigate('/gallery?tag=formal')} className="btn h-fit py-2 px-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border border-[#ffffff90] text-xl font-bold text-[#ffffff90] hover:text-[#fff] hover:border-[#aaff00]">Formal</button>
                    <button onClick={() => navigate('/gallery?tag=combat')} className="btn h-fit py-2 px-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border border-[#ffffff90] text-xl font-bold text-[#ffffff90] hover:text-[#fff] hover:border-[#aaff00]">Combat</button>
                    <button onClick={() => navigate('/gallery?tag=techwear')} className="btn h-fit py-2 px-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border border-[#ffffff90] text-xl font-bold text-[#ffffff90] hover:text-[#fff] hover:border-[#aaff00]">Techwear</button>
                    <button onClick={() => navigate('/gallery?tag=cosplay')} className="btn h-fit py-2 px-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border border-[#ffffff90] text-xl font-bold text-[#ffffff90] hover:text-[#fff] hover:border-[#aaff00]">Cosplay</button>
                </div>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/gallery')} className="h-fit py-2 px-4 btn btn-outline btn-xl hover:btn-accent">Browse the Gallery</button>
                    <button onClick={() => {if (user) {navigate('/upload')} else {navigate('/login')}}} className="h-fit py-2 px-4 btn btn-outline btn-xl text-[#fff] hover:btn-success hover:text-[#aaff00]">Submit a Style</button>
                </div>
            </div>
        </div>
    )
}

export default Home;