import { useEffect, useState } from "react";
import GalleryCard from "./gallery/GalleryCard";
import type { GalleryItem } from "./gallery/Gallery";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { NEWS_URL, SUBS_URL } from "../utilities/MiscUtility";
import type { Article } from "./news/NewsPage";
import NewsPanel from "./news/NewsPanel";

function Home() {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [latestStyles, setLatestStyles] = useState<GalleryItem[]>([]);
    const [topStyles, setTopStyles] = useState<GalleryItem[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [latestArticles, setLatestArticles] = useState<Article[]>([]);

    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const res = await fetch(`${SUBS_URL}/latest`);
            const data = await res.json();
            setLatestStyles(data);

            const res2 = await fetch(`${SUBS_URL}/top`);
            const data2 = await res2.json();
            setTopStyles(data2);

            const res3 = await fetch(`${SUBS_URL}/amount`)
            const data3 = await res3.json();
            setTotal(Number(data3.total_submissions))

            const res4 = await fetch(`${NEWS_URL}/latest`)
            const data4 = await res4.json();
            setLatestArticles(data4);

            if (res.ok && res2.ok && res3.ok && res4.ok) {
                setTimeout(() => setLoading(false), 300);
            }
        }
        document.documentElement.scrollTop = 0;
        fetchData();
    }, [])

    return (
        <div className={`flex flex-col gap-20 w-full min-h-[86vh] px-[10%] xl:px-[20%] transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="flex flex-col w-full gap-10">
                <div className="flex flex-col gap-5 py-10 border-b border-b-[#ffffff90]">
                    <h1 className="text-7xl text-[#ffd700] leading-tight">Discover your Erinn Style</h1>
                    <p className="text-lg text-[#E4E7E5] max-w-md">The ultimate lookbook for Mabinogi fashion. Discover new dye combinations, share your finest outfits, and inspire the community.</p>
                </div>
            </div>
            <div className="relative flex flex-col gap-5 w-full xl:px-[10%]">
                <h1 className="text-xl text-[#E4E7E5] font-bold">News and Announcements</h1>
                <div className="grid max-rows-5 gap-3 w-full place-items-start p-3 outline-2 outline-[#758277] rounded-lg bg-[#3E4540]">
                    {latestArticles?.map((item) => (
                        <NewsPanel key={item.id} article={item} />
                    ))}
                </div>
                <Link className="w-fit place-self-end" to='/news'><p className="cursor-pointer px-2 py-1 outline rounded-xl text-[#E4E7E5] hover:text-[#B59E6D] bg-[#003000]">See All Articles</p></Link>
            </div>
            <h1 className="text-center text-xl text-[#FFD700]">There are currently {total} styles featured in the lookbook!</h1>
            <div className="flex flex-col w-full xl:px-[10%]">
                <h1 className="text-xl text-[#E4E7E5] font-bold">Latest Styles</h1>
                <div className="grid grid-cols-5 gap-5 w-full place-items-center py-10">
                    {latestStyles.map((item => (
                        <GalleryCard key={item.id} item={item} />
                    )))}
                </div>
            </div>
            <div className="flex flex-col w-full xl:px-[10%]">
                <h1 className="text-xl text-[#E4E7E5] font-bold">Most Favorited Styles</h1>
                <div className="grid grid-cols-5 gap-5 w-full place-items-center py-10">
                    {topStyles.map((item => (
                        <GalleryCard key={item.id} item={item} />
                    )))}
                </div>
            </div>
            <div className="flex flex-col gap-5 w-full xl:px-[20%]">
                <h1 className="font-bold text-2xl text-[#E4E7E5] text-center">Explore the Styles</h1>
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