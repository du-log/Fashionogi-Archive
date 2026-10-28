import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserIcon } from "lucide-react";
import type { GalleryItem } from "../gallery/Gallery";
import GalleryCard from "../gallery/GalleryCard";
import { R2_PUBLIC_URL, USERS_URL } from "../../utilities/MiscUtility";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export type userProfile = {
    id?: number,
    joined?: string,
    avatar_id?: string,
    bio?: string,
    server?: string,
    guild?: string,
    in_game_name?: string,
    main_race?: string,
    main_gender?: string,
    discord_username?: string,
    twitter_link?: string,
    twitch_link?: string,
    youtube_link?: string
}

type followData = {
    followers_count: number,
    following_count: number,
    is_following: boolean
}

function UserProfile() {
    const { username } = useParams();
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    const [userData, setUserData] = useState<userProfile | null | undefined>(null);
    const [isLoading, setLoading] = useState<boolean>(true);

    const [topStyles, setTopStyles] = useState<GalleryItem[]>([]);
    const [latestStyles, setLatestStyles] = useState<GalleryItem[]>([]);
    const [total, setTotal] = useState<number>(0);

    const [followData, setFollowData] = useState<followData>();

    const formattedDate: string = userData ? new Date(userData.joined ?? new Date().toString()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "";

    const fetchData = async () => {
            const dataRes = await fetch(`${USERS_URL}/profiles/${username}/data`, {
                credentials: 'include'
            });
            if (dataRes.ok) {
                const addiData = await dataRes.json();
                setFollowData(addiData);
            }
        }

    const toggleFollow = async () => {
        try {
            const res = await fetch(`${USERS_URL}/${userData?.id}/follow`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error('Follow toggle failed', err);
        }
    }

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        const fetchProfile = async () => {
            setLoading(true);
            const res = await fetch(`${USERS_URL}/profiles/${username}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
            const imgRes = await fetch(`${USERS_URL}/profiles/${username}/styles`);
            if (imgRes.ok) {
                const galleryData = await imgRes.json();
                setTopStyles(galleryData.top);
                setLatestStyles(galleryData.latest);
                setTotal(Number(galleryData.total));
            }
            const dataRes = await fetch(`${USERS_URL}/profiles/${username}/data`, {
                credentials: 'include'
            });
            if (dataRes.ok) {
                const addiData = await dataRes.json();
                setFollowData(addiData);
            }
            if(res.ok && imgRes.ok && dataRes.ok) setTimeout(() => setLoading(false), 100);
        }
        if (username) fetchProfile();
    }, [username])

    return (
        <div className="flex flex-col w-full min-h-[86vh] text-mabi-text">
            {isLoading && (
                <div className={`flex flex-col items-center justify-center min-h-[90vh] w-full transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <span>Loading...</span>
                    <span className="loading loading-ring loading-xl" />
                </div>
            )}
            {userData && !isLoading && (
                <div className={`flex flex-col items-center gap-10 w-full sm:px-[5%] xl:px-[20%] py-20 transition-opacity duration-200 ease-in-out ${!isLoading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex flex-col gap-5 w-full xl:w-[80%] outline outline-mabi-border px-5 py-10 bg-mabi-surface">
                        <div className="flex gap-10 w-full">
                            <div className="outline outline-mabi-border-heavy rounded-xl h-fit">
                                {userData.avatar_id ? <img className="w-36 rounded-xl" src={`${R2_PUBLIC_URL}/avatars/${userData.avatar_id}.webp`} /> :  <UserIcon size={119} />}
                            </div>
                            <div className="flex flex-col w-full gap-10">
                                <div className="flex gap-5 items-center w-full">
                                    <h1 className="text-4xl">{username}</h1>
                                    <p className="text-2xl py-1 px-2 outline outline-mabi-border-heavy w-fit cursor-default">Member</p>
                                    {user && user.username !== username && (
                                        <button className={`btn btn-soft ${followData?.is_following ? 'btn-warning' : 'btn-primary'}`} onClick={toggleFollow}>{followData?.is_following ? 'Unfollow' : 'Follow'}</button>
                                    )}
                                </div>
                                {followData?.is_following && <p className="text-2xl py-1 px-2 outline outline-mabi-orange bg-mabi-surface-muted text-mabi-gold w-fit cursor-default">Following</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-5">
                            <div className="flex flex-col gap-1 p-2 outline outline-mabi-border-heavy bg-mabi-surface-muted">
                                <p>Styles Created:</p>
                                <p>{total} {total === 1 ? 'Style' : 'Styles'}</p>
                            </div>
                            <div className="flex flex-col gap-1 p-2 outline outline-mabi-border-heavy bg-mabi-surface-muted">
                                <p>Style Favorites:</p>
                                <p>0</p>
                            </div>
                            <div className="flex flex-col gap-1 p-2 outline outline-mabi-border-heavy bg-mabi-surface-muted">
                                <p>Followers:</p>
                                <p>{followData?.followers_count}</p>
                            </div>
                            <div className="flex flex-col gap-1 p-2 outline outline-mabi-border-heavy bg-mabi-surface-muted">
                                <p>Following:</p>
                                <p>{followData?.following_count}</p>
                            </div>
                            <div className="flex flex-col gap-1 p-2 outline outline-mabi-border-heavy bg-mabi-surface-muted">
                                <p>Joined:</p>
                                <p>{formattedDate}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 w-full gap-5 pt-10 border-t border-mabi-border">
                            <div className="flex flex-col gap-1 col-span-2 w-full">
                                <h1>Bio</h1>
                                <div className="text-md text-wrap outline outline-mabi-border-heavy bg-mabi-surface-muted p-2 max-h-40 overflow-y-auto"><Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{userData.bio ? userData.bio : 'No bio.'}</Markdown></div>
                            </div>
                            <div className="flex flex-col col-span-1 gap-1">
                                <h1>User Info</h1>
                                <div className="flex flex-col gap-2 outline outline-mabi-border-heavy bg-mabi-surface-muted p-4 max-h-40 overflow-y-auto">
                                    <div className="flex gap-2">
                                        <h1 className="text">Region/Server:</h1>
                                        <p className="text-wrap">{userData.server ? userData.server : 'Not stated.'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <h1 className="text">IGN:</h1>
                                        <p className="text-wrap">{userData.in_game_name ? userData.in_game_name : 'Not stated.'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <h1 className="text">Discord Username:</h1>
                                        <p className="text-wrap">{userData.discord_username ? userData.discord_username : 'Not stated.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-15 w-full xl:w-[80%] py-10">
                        <div className="flex flex-col gap-5 p-1">
                            <h1 className="text-xl xl:text-2xl pb-2 border-b border-mabi-border">Collections</h1>
                            <div className="flex flex-col gap-4 outline outline-mabi-border-heavy rounded p-4 bg-mabi-surface-muted">
                                Not yet implemented.
                            </div>
                        </div>
                        <div className="flex flex-col gap-5 p-1">
                            <h1 className="text-xl xl:text-2xl pb-2 border-b border-mabi-border">Most Popular Styles</h1>
                            <div className="grid grid-cols-3 gap-5 place-items-center py-5">
                                {topStyles.map((style) => (
                                    <GalleryCard key={style.id} item={style} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full xl:w-[80%]">
                        <h1 className="text-xl xl:text-2xl border-b border-mabi-border pb-2">Latest Styles</h1>
                        <div className="w-full grid grid-cols-5 gap-5 place-items-center py-5">
                            {latestStyles.map((style) => (
                                <GalleryCard key={style.id} item={style} />
                            ))}
                        </div>
                        {latestStyles.length === 10 && (
                            <p className="py-1 px-2 outline outline-[#ffffff90] rounded w-fit cursor-pointer" onClick={() => navigate(`/gallery?username=${username}`)}>See more by {username}</p>
                        )}
                    </div>
                </div>
            )}
            {!userData && !isLoading && (
                <div className="flex flex-col gap-5 items-center justify-center w-full h-[70vh]">
                    <h1 className="text-xl">User not found or profile is unavailable.</h1>
                    <Link to='/'><p className="outline p-2 rounded-xl">Return to Home</p></Link>
                </div>
            )}
        </div>
    )
}

export default UserProfile;