import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useParams } from "react-router-dom";

type userProfile = {
    id?: number,
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
    const [userData, setUserData] = useState<userProfile | null | undefined>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

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
            const res = await fetch('http://localhost:8000/api/users/profiles/me/update', {
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
            const res = await fetch(`http://localhost:8000/api/users/profiles/${username}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
            setTimeout(() => setLoading(false), 200);
        }
        if (username) fetchProfile();
    }, [username])

    return (
        <div className="flex flex-col w-full min-h-[70vh]">
            {userData && (
                <div className={`flex flex-col w-full sm:px-[5%] xl:px-[20%] py-10 transition-opacity duration-200 ease-in-out ${!isLoading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex flex-col w-full outline rounded-xl p-5">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl">{username}</h1>
                            {user && user.username === username && (
                                <button className="btn btn-soft btn-primary top-1 right-1" onClick={setModalData}>Edit Profile</button>
                            )}
                        </div>
                        <p className="text-wrap">{userData.bio ? userData.bio : 'No bio.'}</p>
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
                            <div className="relative w-full">
                                <textarea className="outline w-full p-1 resize-none" value={bio || ''} onChange={(e) => setBio(e.target.value)} rows={8} maxLength={200} />
                                <p className="absolute top-1 right-1">{bio && 200 - bio.length}</p>
                            </div>
                            <div className="flex flex-col">
                                <h1>Server/Region</h1>
                                <input className="p-1 w-50" value={server || ''} onChange={(e) => setServer(e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <h1>IGN</h1>
                                <input className="p-1 w-50" value={ign || ''} onChange={(e) => setIgn(e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <h1>Discord</h1>
                                <input className="p-1 w-50" value={discord || ''} onChange={(e) => setDiscord(e.target.value)} />
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