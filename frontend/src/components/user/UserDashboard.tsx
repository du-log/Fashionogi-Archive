import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import type { GalleryItem } from "../gallery/Gallery";
import GalleryCard from "../gallery/GalleryCard";

type QueueItem = {
    id: number,
    title: string,
    status: string,
    created_at: string
}

function UserDashboard() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading = auth?.isLoading ?? true;
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [tab, setTab] = useState<string>('submissions');
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [favorites, setFavorites] = useState<GalleryItem[]>([]);

    const formattedDate= (created_at: string): string => {
        return new Date(created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    }

    const getStatusBadge = (status: string) => {
        switch(status.toLowerCase()) {
            case 'pending': return 'badge-warning text-[#000]';
            case 'rejected': return 'badge-error text-[#fff]';
            case 'approved': return 'badge-success text-[#000]';
            default: return 'badge-neutral';
        }
    }

    useEffect(() => {
        if (!user && !userLoading) navigate('/login');
        const fetchQueue = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/users/dashboard/queue', {
                credentials: 'include'
                })
                if (res.ok) {
                    const data = await res.json();
                    setQueue(data);
                }
            } catch (err) {
                console.error('Failed to fetch queue', err);
            }
        }
        const fetchFavorites = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/users/dashboard/favorites', {
                    credentials: 'include'
                })
                if (res.ok) {
                    const data = await res.json();
                    setFavorites(data);
                }
            } catch (err) {
                console.error('Failed to fetch favorites', err);
            }
        }
        fetchQueue();
        fetchFavorites();
        document.documentElement.scrollTop = 0;
        setTimeout(() =>setLoading(false), 50);
    }, [user, userLoading, navigate])
    
    return (
        <div className={`flex flex-col gap-2 w-full min-h-[70vh] transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <h1 className="text-2xl text-center">Welcome back, {user?.username}.</h1>
            <div className="flex justify-center gap-5 px-3 outline outline-[#ffffff90] text-lg">
                <p className={`cursor-pointer p-3 ${tab === 'submissions' ? 'bg-[#a5a5a590]' : 'hover:bg-[#555]'}`} onClick={() => setTab('submissions')}>My Submissions</p>
                <p className={`cursor-pointer p-3 ${tab === 'favorites' ? 'bg-[#a5a5a590]' : 'hover:bg-[#555]'}`} onClick={() => setTab('favorites')}>Favorites</p>
            </div>
            {tab === 'submissions' && (
                <div className="flex flex-col gap-2 px-[20%] py-10 max-h-[50vh]">
                    {queue.map((sub) => (
                        <div className="grid grid-cols-3 p-2 place-items-center w-full outline rounded text-lg">
                            <Link to={`/fashion/id/${sub.id}`}><p>{sub.title}</p></Link>
                            <p className={`badge ${getStatusBadge(sub.status)}`}>{sub.status.toUpperCase()}</p>
                            <p>{formattedDate(sub.created_at)}</p>
                        </div>
                    ))}
                    {queue.length === 0 && (
                        <div className="text-center justify-center text-xl">You have not submitted any outfits yet.</div>
                    )}
                </div>
            )}
            {tab === 'favorites' && (
                <div className="grid sm:grid-cols-3 xl:grid-cols-5 gap-5 py-10 px-[20%] max-h-[50vh] place-items-center">
                    {favorites.map((item) => (
                        <GalleryCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserDashboard;