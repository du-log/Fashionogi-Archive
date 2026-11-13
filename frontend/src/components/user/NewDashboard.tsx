import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserIcon, UserMinus } from "lucide-react";
import { R2_PUBLIC_URL, USERS_URL } from "../../utilities/MiscUtility";
import type { userProfile, followData, NameplateUser } from "./UserProfile";
import { Link, useNavigate } from "react-router-dom";
import type { GalleryItem } from "../gallery/Gallery";
import GalleryCard from "../gallery/GalleryCard";
import DashboardDropdown from "./DashboardDropdown";
import UserNameplate from "./UserNameplate";
import TitleBadge from "./TitleBadge";
import type { TitleProps } from "./TitleModalBody";
import TitleModalBody from "./TitleModalBody";

export default function NewDashboard() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading = auth?.isLoading ?? true;
    const checkSession = auth?.checkSession ?? (() => {});
    const [isLoading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const [userData, setUserData] = useState<userProfile | null | undefined>();
    const [followData, setFollowData] = useState<followData>();
    const [activeTab, setActiveTab] = useState<string>('styles');

    const [styles, setStyles] = useState<GalleryItem[]>([]);
    const [favoritesTotal, setFavoritesTotal] = useState<number>(0);
    const [favoriteStyles, setFavoriteStyles] = useState<GalleryItem[]>([]);

    const [followersData, setFollowersData] = useState<NameplateUser[]>([]);
    const [followingData, setFollowingData] = useState<NameplateUser[]>([]);

    const [titleModalOpen, setTitleModalOpen] = useState<boolean>(false);
    const [titles, setTitles] = useState<TitleProps | null>(null);

    const fetchUserData = async () => {
        const res = await fetch(`${USERS_URL}/profiles/${user?.username}`);
        if (res.ok) {
            const data = await res.json();
            setUserData(data);
        }
    }

    const fetchFavorites = async () => {
        const res = await fetch(`${USERS_URL}/dashboard/favorites`, {
            credentials: 'include'
        })
        if (res.ok) {
            const data = await res.json();
            setFavoriteStyles(data);
        }
    }

    const fetchFollowing = async () => {
        const res = await fetch(`${USERS_URL}/profiles/${user?.username}/connections`);
        if (res.ok) {
            const data = await res.json();
            setFollowingData(data.following);
        }
        const dataRes = await fetch(`${USERS_URL}/profiles/${user?.username}/data`, {
            credentials: 'include'
        });
        if (dataRes.ok) {
            const addiData = await dataRes.json();
            setFollowData(addiData);
        }
    }

    const toggleFollow = async (id: number) => {
        try {
            const res = await fetch(`${USERS_URL}/${id}/follow`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                fetchFollowing();
            }
        } catch (err) {
            console.error('Follow toggle failed', err);
        }
    }

    const fetchQueue = async () => {
        const res = await fetch(`${USERS_URL}/dashboard/queue`, {
            credentials: 'include'
        })
        if (res.ok) {
            const data = await res.json();
            setStyles(data.styles);
            setFavoritesTotal(Number(data.total_favorites) || 0);
        }
    }

    const fetchTitles = async () => {
        const res = await fetch(`${USERS_URL}/me/titles`, {
            credentials: 'include'
        })
        if (res.ok) {
            const data = await res.json()
            setTitles(data);
            setTitleModalOpen(true);
        }
    }

    const titleChangeHandler = async (title_id?: number) => {
        try {
            const res = await fetch(`${USERS_URL}/me/title`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title_id: title_id ?? null}),
                credentials: 'include'
            })
            if (res.ok) {
                fetchUserData();
                checkSession();
                alert('Title changed!');
                setTitleModalOpen(false);
            }
        } catch (e) {
            console.error('Could not update title', e);
            alert('Could not update your title. Possibly some API error.');
        }
    }

    useEffect(() => {
        if (!user && !userLoading) navigate('/login');
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
            const fetchFollowRes = await fetch(`${USERS_URL}/profiles/${user?.username}/connections`);
            if (fetchFollowRes.ok) {
                const fetchedFollowData = await fetchFollowRes.json();
                setFollowersData(fetchedFollowData.followers);
                setFollowingData(fetchedFollowData.following);
            }
            if(res.ok && dataRes.ok && styleRes.ok && favoritesRes.ok && fetchFollowRes.ok) setTimeout(() => setLoading(false), 100);
        }
        if (user) fetchData();
    }, [user, userLoading, navigate]);

    return (
        <div>
            {userLoading || isLoading && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner loading-xl"></span>
                </div>
            )}
            <div className={`flex flex-col items-center w-full min-h-[73.5vh] sm:px-[5%] xl:px-[20%] py-20 text-mabi-text transition-opacity duration-200 ease-in-out ${userLoading || isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex gap-5 w-full xl:w-[80%] outline outline-mabi-border p-5 bg-mabi-surface justify-between">
                    <div className="flex gap-10 flex-1">
                        <div className="outline outline-mabi-border-heavy h-fit">
                            {userData?.avatar_id ? <img className="w-36" src={`${R2_PUBLIC_URL}/avatars/${userData.avatar_id}.webp`} /> :  <UserIcon size={119} />}
                        </div>
                        <div className="flex flex-col w-full gap-5">
                            <div className="flex gap-5 items-center w-full">
                                <h1 className="text-4xl">{user?.username}</h1>
                                <div className="bg-[#000]/20 w-fit"><TitleBadge name={userData?.active_title?.name} category={userData?.active_title?.stat_type} /></div>
                            </div>
                            <div className="flex gap-5 items-center w-full">
                                <button className="btn btn-success" disabled>Edit Profile</button>
                                <button className="btn btn-primary" onClick={fetchTitles}>Change Title</button>
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
                        <button className={` p-2 rounded-lg ${activeTab === 'styles' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={() => setActiveTab('styles')}>
                            My Styles [{styles.length}]
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'favorites' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={() => setActiveTab('favorites')}>
                            Favorites [{favoriteStyles.length}]
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'collections' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={() => setActiveTab('collections')}>
                            My Collections
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'followers' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={() => setActiveTab('followers')}>
                            Followers
                        </button>
                        <button className={` p-2 rounded-lg ${activeTab === 'following' ? 'bg-mabi-green' : 'hover:text-mabi-text-muted hover:bg-mabi-border cursor-pointer'}`} onClick={() => setActiveTab('following')}>
                            Following
                        </button>
                    </div>
                    <div className="flex items-center p-2">
                        {activeTab === 'styles' && (
                            <Link to={'/upload'}><p className={"p-2 rounded-lg bg-mabi-border hover:bg-mabi-gold"}>Submit a Style</p></Link>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center min-h-[50vh] w-full xl:w-[80%] bg-gradient-to-t from-mabi-surface-muted to-transparent mt-1 rounded-b-lg">
                    {activeTab === 'styles' && (
                        <>
                            {styles.length > 0 && (
                                <div className="grid grid-cols-5 gap-5 p-10 place-items-center w-full">
                                    {styles.map((style) => (
                                        <div key={style.id} className="relative">
                                            <GalleryCard item={style} />
                                            <div className="absolute top-1 right-1 z-100">
                                                <DashboardDropdown styleId={style.id} styleStatus={style.status} activeTab={activeTab} activeUser={user} fetchFavorites={fetchFavorites} fetchQueue={fetchQueue} />
                                            </div>
                                            <div className="absolute top-1 left-1 z-100">
                                                {style.status === 'pending' && (<p className="text-sm px-2 py-1 rounded-lg bg-[#55aa00] text-[#ffffff]">Pending</p>)}
                                                {style.status === 'unlisted' && (<p className="text-sm px-2 py-1 rounded-lg bg-[#aa5500] text-[#ffffff]">Unlisted</p>)}
                                                {style.status === 'flagged' && (<p className="text-sm px-2 py-1 rounded-lg bg-[#770000] text-[#ffffff]">Flagged</p>)}
                                                {style.status === 'rejected' && (<p className="text-sm px-2 py-1 rounded-lg bg-[#111111] text-[#ffffff]">Rejected</p>)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {styles.length === 0 && (
                                <div className="flex flex-col gap-2 justify-center items-center min-h-[20vh]">
                                    <p className="text-lg">You haven't submitted any styles yet!</p>
                                    <p>Check back after you've made your first submission.</p>
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === 'favorites' && (
                        <>
                            {favoriteStyles.length > 0 && (
                                <div className="grid grid-cols-5 place-items-center w-full">
                                    {favoriteStyles.map((style) => (
                                        <div key={style.id} className="relative">
                                            <GalleryCard item={style} />
                                            <div className="absolute top-1 right-1 z-100">
                                                <DashboardDropdown styleId={style.id} activeTab={activeTab} activeUser={user} fetchFavorites={fetchFavorites} fetchQueue={fetchQueue} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {favoriteStyles.length === 0 && (
                                <div className="flex flex-col gap-2 justify-center items-center min-h-[20vh]">
                                    <p className="text-lg">You haven't favorited any styles yet!</p>
                                    <p>Check back after you've found something you like.</p>
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === 'collections' && (
                        <>
                            <div className="flex flex-col gap-2 justify-center items-center min-h-[20vh]">
                                <p className="text-lg">Collections haven't been implemented yet... :(</p>
                                <p>It's on the radar, though. Don't worry.</p>
                            </div>
                        </>
                    )}
                    {activeTab === 'followers' && (
                        <>
                            {followersData.length > 0 && (
                                <div className="grid grid-cols-3 xl:grid-cols-5 gap-5 p-10 place-items-center max-h-[50vh] w-full overflow-y-auto">
                                    {followersData.map((user) => (
                                        <UserNameplate key={user.username} username={user.username} intialData={user} />
                                    ))}
                                </div>
                            )}
                            {followersData.length === 0 && (
                                <div className="flex flex-col gap-2 justify-center items-center min-h-[20vh]">
                                    <p className="text-lg">You don't have any followers yet...</p>
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === 'following' && (
                        <>
                            {followingData.length > 0 && (
                                <div className="grid grid-cols-3 xl:grid-cols-5 gap-5 p-10 place-items-center max-h-[50vh] w-full overflow-y-auto">
                                    {followingData.map((user) => (
                                        <div className="group relative">
                                            <UserNameplate key={user.username} username={user.username} intialData={user} />
                                            <button className="absolute top-1 left-1 btn w-fit h-fit p-1 z-100 opacity-0 group-hover:opacity-100 group-hover:btn-error" onClick={() => toggleFollow(user.id)}>
                                                <UserMinus size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {
                                followingData.length === 0 && (
                                    <div className="flex flex-col justify-center items-center min-h-[20vh]">
                                        <p>You're not following anyone yet!</p>
                                    </div>
                                )
                            }
                        </>
                    )}
                </div>
            </div>
            {titles && titleModalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-body w-fit">
                        <TitleModalBody equipped_title_id={titles.equipped_title_id} equipped_title={titles.equipped_title} stats={titles.stats} titles={titles.titles}
                        setTitleModalOpen={setTitleModalOpen} titleChangeHandler={titleChangeHandler} />
                    </div>
                </dialog>
            )}
        </div>
    )
}