import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserIcon } from "lucide-react";
import type { GalleryItem } from "../gallery/Gallery";
import GalleryCard from "../gallery/GalleryCard";
import { USERS_URL } from "../../utilities/MiscUtility";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export type userProfile = {
    id?: number,
    joined?: string,
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

function UserProfile() {
    const { username } = useParams();
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    const [userData, setUserData] = useState<userProfile | null | undefined>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const [topStyles, setTopStyles] = useState<GalleryItem[]>([]);
    const [latestStyles, setLatestStyles] = useState<GalleryItem[]>([]);
    const [total, setTotal] = useState<number>(0);

    const [bio, setBio] = useState<string | null | undefined>('');
    const [server, setServer] = useState<string | null | undefined>('');
    const [guild, setGuild] = useState<string | null | undefined>('');
    const [ign, setIgn] = useState<string | null | undefined>('');
    const [race, setRace] = useState<string | null | undefined>('');
    const [gender, setGender] = useState<string | null | undefined>('');
    const [discord, setDiscord] = useState<string | null | undefined>('');
    const [twitter, setTwitter] = useState<string | null | undefined>('');
    const [twitch, setTwitch] = useState<string | null | undefined>('');
    const [youtube, setYoutube] = useState<string | null | undefined>('');

    const formattedDate: string = userData ? new Date(userData.joined ?? new Date().toString()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "";

    const setModalData = async () => {
        setBio(userData?.bio);
        setServer(userData?.server);
        setGuild(userData?.guild);
        setIgn(userData?.in_game_name);
        setRace(userData?.main_race);
        setGender(userData?.main_gender);
        setDiscord(userData?.discord_username);
        setTwitter(userData?.twitter_link);
        setTwitch(userData?.twitch_link);
        setYoutube(userData?.youtube_link);
        setModalOpen(true);
    }

    const handleProfileUpdate = async () => {
        const payload = {
            bio: bio,
            server: server,
            guild: guild,
            in_game_name: ign,
            main_race: race,
            main_gender: gender,
            discord_username: discord,
            twitter_link: twitter,
            twitch_link: twitch,
            youtube_link: youtube
        }

        try {
            const res = await fetch(`${USERS_URL}/profiles/me/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                const newData = await res.json();
                setUserData(newData);
                setModalOpen(false);
            } else {
                console.error('Profile update failed.');
            }
        } catch (err) {
            console.error('Error: ', err);
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
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
            document.documentElement.scrollTop = 0;
            setTimeout(() => setLoading(false), 200);
        }
        if (username) fetchProfile();
    }, [username])

    return (
        <div className="flex flex-col w-full min-h-[86vh] text-[#E4E7E5]">
            {userData && (
                <div className={`flex flex-col items-center gap-10 w-full sm:px-[5%] xl:px-[20%] py-20 transition-opacity duration-200 ease-in-out ${!isLoading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex flex-col gap-5 w-full xl:w-[80%] outline outline-[#758277] rounded-xl px-5 py-10 bg-[#3E4540]">
                        <div className="flex gap-10 w-full">
                            <div className="outline outline-[#758277] rounded-xl p-5 w-fit h-fit">
                                <UserIcon size={80} />
                            </div>
                            <div className="flex flex-col w-full gap-10">
                                <div className="flex gap-5 justify-between items-center w-full">
                                    <h1 className="text-4xl">{username}</h1>
                                    {user && user.username === username && (
                                        <button className="btn btn-soft btn-primary top-1 right-1" onClick={setModalData}>Edit Profile</button>
                                    )}
                                </div>
                                <p className="text-2xl py-1 px-2 rounded-lg outline outline-[#758277] w-fit cursor-default">Member</p>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <div className="flex flex-col gap-1 p-2 outline outline-[#758277] rounded">
                                <p>Styles Created:</p>
                                <p>{total} {total === 1 ? 'Style' : 'Styles'}</p>
                            </div>
                            <div className="flex flex-col gap-1 p-2 outline outline-[#758277] rounded">
                                <p>Joined:</p>
                                <p>{formattedDate}</p>
                            </div>
                        </div>
                        <div className="gap-2 pt-10 border-t">
                            <div className="text-md text-wrap outline outline-[#ffffff90] rounded-lg p-2 max-h-40 overflow-y-auto"><Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{userData.bio ? userData.bio : 'No bio.'}</Markdown></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-15 w-full xl:w-[80%] py-10">
                        <div className="flex flex-col gap-5 p-1">
                            <h1 className="text-xl xl:text-2xl pb-2 border-b">User Info</h1>
                            <div className="flex flex-col gap-4 outline outline-[#758277] rounded p-4 bg-[#3E4540]">
                                <div className="flex gap-2">
                                    <h1 className="text">Server/Region:</h1>
                                    <p className="text-wrap">{userData.server ? userData.server : 'Not stated.'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <h1 className="text">IGN:</h1>
                                    <p className="text-wrap">{userData.in_game_name ? userData.in_game_name : 'Not stated.'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <h1 className="text">Discord:</h1>
                                    <p className="text-wrap">{userData.discord_username ? userData.discord_username : 'Not stated.'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5 p-1">
                            <h1 className="text-xl xl:text-2xl pb-2 border-b">Most Popular Styles</h1>
                            <div className="grid grid-cols-3 gap-5 place-items-center py-5">
                                {topStyles.map((style) => (
                                    <GalleryCard key={style.id} item={style} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full xl:w-[80%]">
                        <h1 className="text-xl xl:text-2xl border-b pb-2">Latest Styles</h1>
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
            {modalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box w-5/6 h-5/6 max-w-5xl">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-center">Edit Profile</h1>
                            <h1 className="text-xl">Bio</h1>
                            <p className="text-sm">This uses Markdown conventions for formatting.</p>
                            <div className="relative w-full">
                                <textarea className="outline w-full p-1 resize-none" value={bio || ''} onChange={(e) => setBio(e.target.value)} rows={8} maxLength={200} />
                                <p className="absolute top-1 right-1">{bio && 200 - bio.length}</p>
                            </div>
                            <div className="flex flex-col">
                                <h1>Server/Region</h1>
                                <input className="outline p-1 w-50" value={server || ''} onChange={(e) => setServer(e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <h1>IGN</h1>
                                <input className="outline p-1 w-50" value={ign || ''} onChange={(e) => setIgn(e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <h1>Discord</h1>
                                <input className="outline p-1 w-50" value={discord || ''} onChange={(e) => setDiscord(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-action justify-center">
                            <button className="btn btn-success" onClick={handleProfileUpdate}>Update</button>
                            <button className="btn btn-error" onClick={() => setModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    )
}

export default UserProfile;