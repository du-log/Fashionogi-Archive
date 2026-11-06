import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserIcon } from "lucide-react";
import { R2_PUBLIC_URL, USERS_URL } from "../../utilities/MiscUtility";
import type { userProfile, followData } from "./UserProfile";
import { Link } from "react-router-dom";
import type { GalleryItem } from "../gallery/Gallery";
import GalleryCard from "../gallery/GalleryCard";

export default function NewDashboard() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading= auth?.isLoading ?? true;
    const [isLoading, setLoading] = useState<boolean>(true);

    const [userData, setUserData] = useState<userProfile | null | undefined>();
    const [followData, setFollowData] = useState<followData>();
    const [activeTab, setActiveTab] = useState<string>('styles');

    const [styles, setStyles] = useState<GalleryItem[]>([]);
    const [favoritesTotal, setFavoritesTotal] = useState<number>(0);
    const [favoriteStyles, setFavoriteStyles] = useState<GalleryItem[]>([]);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        const fetchData = async () => {
            setLoading(true);
            const res = await fetch(`${USERS_URL}/profiles/${user?.username}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
            const dataRes = await fetch(`${USERS_URL}/profiles/${user?.username}/data`, {
                credentials: 'include'
            });
            if (dataRes.ok) {
                const addiData = await dataRes.json();
                setFollowData(addiData);
            }
            const styleRes = await fetch(`${USERS_URL}/dashboard/queue`, {
                    credentials: 'include'
                })
                if (styleRes.ok) {
                    const styleData = await styleRes.json();
                    setStyles(styleData.styles);
                    setFavoritesTotal(Number(styleData.total_favorites) || 0);
                }
            const favoritesRes = await fetch(`${USERS_URL}/dashboard/favorites`, {
                    credentials: 'include'
                })
                if (favoritesRes.ok) {
                    const favoritesData = await favoritesRes.json();
                    setFavoriteStyles(favoritesData);
                }
            if(res.ok && dataRes.ok && styleRes.ok && favoritesRes.ok) setTimeout(() => setLoading(false), 100);
        }
        if (user) fetchData();
    }, [user]);

    return (
        <div>
            {userLoading || isLoading && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner loading-xl"></span>
                </div>
            )}
            <div className={`flex flex-col items-center w-full min-h-[73.5vh] sm:px-[5%] xl:px-[20%] pt-10 text-mabi-text transition-opacity duration-200 ease-in-out ${userLoading || isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex gap-5 w-full xl:w-[80%] outline outline-mabi-border p-5 bg-mabi-surface justify-between">
                    <div className="flex gap-10 flex-1">
                        <div className="outline outline-mabi-border-heavy rounded-xl h-fit">
                            {userData?.avatar_id ? <img className="w-36 rounded-xl" src={`${R2_PUBLIC_URL}/avatars/${userData.avatar_id}.webp`} /> :  <UserIcon size={119} />}
                        </div>
                        <div className="flex flex-col w-full gap-5">
                            <div className="flex gap-5 items-center w-full">
                                <h1 className="text-4xl">{user?.username}</h1>
                                <p className="text-2xl py-1 px-2 outline outline-mabi-border-heavy w-fit cursor-default">Member</p>
                            </div>
                            <div className="flex gap-5 items-center w-full">
                                <button className="btn btn-success">Edit Profile</button>
                                <button className="btn btn-primary">Change Title</button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 items-center">
                        <div className="flex flex-col gap-5 items-end">
                            <p className="px-2 py-1 outline-1 outline-mabi-border-heavy w-fit cursor-default bg-mabi-surface-muted">Submitted: {styles.length} {styles.length === 1 ? 'Style' : 'Styles'}</p>
                            <p className="px-2 py-1 outline-1 outline-mabi-border-heavy w-fit cursor-default bg-mabi-surface-muted">Style Favorites: {favoritesTotal}</p>
                        </div>
                        <div className="flex flex-col gap-5 items-end">
                            <p className="px-2 py-1 outline-1 outline-mabi-border-heavy w-fit cursor-default bg-mabi-surface-muted">Followers: {followData?.followers_count}</p>
                            <p className="px-2 py-1 outline-1 outline-mabi-border-heavy w-fit cursor-default bg-mabi-surface-muted">Following: {followData?.following_count}</p>
                        </div>
                    </div>
                </div>
                <div className="flex w-full xl:w-[80%] outline-1 outline-mabi-border-heavy bg-mabi-surface-muted justify-between">
                    <div className="flex gap-2 items-center p-2">
                        <button className={` p-2 rounded-lg ${activeTab === 'styles' ? 'bg-mabi-green' : 'hover:text-mabi-gold hover:bg-mabi-border cursor-pointer'}`} onClick={activeTab !== 'styles' ? () => setActiveTab('styles') : () => ({})}>
                            My Styles [{styles.length}]
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'favorites' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={activeTab !== 'favorites' ? () => setActiveTab('favorites') : () => ({})}>
                            Favorites []
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'collections' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={activeTab !== 'collections' ? () => setActiveTab('collections') : () => ({})}>
                            My Collections
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'followers' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={activeTab !== 'followers' ? () => setActiveTab('followers') : () => ({})}>
                            Followers
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'following' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={activeTab !== 'following' ? () => setActiveTab('following') : () => ({})}>
                            Following
                        </button>
                    </div>
                    <div className="flex items-center p-1">
                        {activeTab === 'styles' && (
                            <Link to={'/upload'}><p className={"p-2 rounded-lg bg-mabi-border hover:bg-mabi-gold"}>Submit a Style</p></Link>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center min-h-[50vh] w-full bg-mabi-surface mt-1">
                    {activeTab === 'styles' && (
                        <div className="grid grid-cols-3 xl:grid-cols-5 place-items-center w-full">
                            {styles.map((style) => (
                                <div key={style.id} className="relative">
                                    <GalleryCard item={style} />
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'favorites' && (
                        <div className="grid grid-cols-3 xl:grid-cols-5 place-items-center w-full">
                            {favoriteStyles.map((style) => (
                                <div key={style.id} className="relative">
                                    <GalleryCard item={style} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}