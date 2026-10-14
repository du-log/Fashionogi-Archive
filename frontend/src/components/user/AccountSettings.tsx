import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { USERS_URL } from "../../utilities/MiscUtility";
import PwChangeForm from "./PwChangeForm";
import AvatarSettings from "./AvatarSettings";

function AccountSettings() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading = auth?.isLoading ?? true;
    const logout = auth?.logout ?? (async () => {});
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isChecking, setChecking] = useState<boolean>(false);
    
    const navigate = useNavigate();
    const [currentTab, setTab] = useState<string>('personal');
    const [username, setUsername] = useState<string>('');
    const [isAvailable, setAvailable] = useState<boolean>(false);
    const [availMsg, setAvailMsg] = useState<string>('');

    const [nameFlag, setNameFlag] = useState<boolean>(false);

    const [bio, setBio] = useState<string | null | undefined>('');
    const [server, setServer] = useState<string | null | undefined>('');
    //const [guild, setGuild] = useState<string | null | undefined>('');
    const [ign, setIgn] = useState<string | null | undefined>('');
    //const [race, setRace] = useState<string | null | undefined>('');
    //const [gender, setGender] = useState<string | null | undefined>('');
    const [discord, setDiscord] = useState<string | null | undefined>('');
    //const [twitter, setTwitter] = useState<string | null | undefined>('');
    //const [twitch, setTwitch] = useState<string | null | undefined>('');
    //const [youtube, setYoutube] = useState<string | null | undefined>('');

    const handleNameCheck = async (username: string) => {
        setAvailable(false);
        setChecking(true);
        if (username.length > 15) {
            setAvailMsg('Username is over 15 characters.');
            return;
        }
        if (/\s/.test(username)) {
            setAvailMsg('Username cannot contain spaces.');
            return;
        }
        const res = await fetch(`${USERS_URL}/username/check/${username}`);
        const data = await res.json();

        setAvailable(data.success);
        setAvailMsg(data.message);

        if(data.success === true) setNameFlag(true);
        setChecking(false);
    }

    const handleNameReset = async () => {
        setUsername('');
        setAvailMsg('');
        setAvailable(false);
    }

    const handleNameChange = async (username: string) => {
        const res = await fetch(`${USERS_URL}/username/update/${username}`, {
            method: 'PATCH',
            credentials: 'include'
        })
        if (res.ok) {
            alert('Sucessfully changed username. \nReturning back to login.');
            logout();
        }
    }

    const handleProfileUpdate = async () => {
        const payload = {
            bio: bio,
            server: server,
            in_game_name: ign,
            discord_username: discord
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
                setBio(newData?.bio);
                setServer(newData?.server);
                //setGuild(userData?.guild);
                setIgn(newData?.in_game_name);
                //setRace(userData?.main_race);
                //setGender(userData?.main_gender);
                setDiscord(newData?.discord_username);
                //setTwitter(userData?.twitter_link);
                //setTwitch(userData?.twitch_link);
                //setYoutube(userData?.youtube_link);
                alert('Profile successfully updated.');
            } else {
                console.error('Profile update failed.');
            }
        } catch (err) {
            console.error('Error: ', err);
        }
    }

    useEffect(() => {
        if (!user && !userLoading) navigate('/login');
        document.documentElement.scrollTop = 0;
        const fetchProfile = async () => {
            setLoading(true);
            const res = await fetch(`${USERS_URL}/profiles/${user?.username}`);
            if (res.ok) {
                const data = await res.json();
                setBio(data?.bio);
                setServer(data?.server);
                //setGuild(userData?.guild);
                setIgn(data?.in_game_name);
                //setRace(userData?.main_race);
                //setGender(userData?.main_gender);
                setDiscord(data?.discord_username);
                //setTwitter(userData?.twitter_link);
                //setTwitch(userData?.twitch_link);
                //setYoutube(userData?.youtube_link);
            }
            if(res.ok) setTimeout(() => setLoading(false), 100);
        }
        fetchProfile();
    }, [user, userLoading, navigate])

    return (
        <>
            {userLoading || isLoading && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner loading-xl"></span>
                </div>
            )}
            <div className={`flex gap-10 w-full h-[73.5vh] sm:px-[5%] xl:px-[20%] pt-10 text-mabi-text transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <div className="flex flex-1 flex-col gap-3 outline rounded-xl text-lg p-5 h-fit bg-mabi-surface">
                    <p className={`p-2 outline rounded-lg cursor-pointer ${currentTab === 'personal' ? 'bg-mabi-green' : 'hover:bg-mabi-green'}`} onClick={() => setTab('personal')}>Account Settings</p>
                    <p className={`p-2 outline rounded-lg cursor-pointer ${currentTab === 'notif' ? 'bg-mabi-green' : 'hover:bg-mabi-green'}`} onClick={() => setTab('notif')}>Notifications</p>
                    <p className={`p-2 outline rounded-lg cursor-pointer ${currentTab === 'security' ? 'bg-mabi-green' : 'hover:bg-mabi-green'}`} onClick={() => setTab('security')}>Security</p>
                </div>
                <div className="flex flex-3 flex-col w-full min-h-[50vh] px-10 py-5 outline rounded-xl overflow-y-auto bg-mabi-surface-muted">
                    {currentTab === 'personal' && (
                        <div className="flex flex-col gap-5 p-2">
                            <h1 className="text-2xl border-b border-mabi-border-heavy pb-2">Account Settings</h1>
                            <div className="flex flex-col gap-2 py-2 w-full">
                                <h1 className="text-xl">Avatar</h1>
                                <AvatarSettings currentAvatarId={user?.avatar_id} />
                            </div>
                            <div className="flex flex-col gap-2 py-2 w-full">
                                <h1 className="text-xl">Change Username</h1>
                                <div className="flex gap-5 items-center">
                                    <input type="text" className="bg-mabi-surface p-1" maxLength={15} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={user?.username} />
                                    <button className={`btn btn-warning w-fit ${username.length < 3 || username === user?.username ? 'btn-disabled' : ''} ${isChecking && 'btn-disabled'}`} onClick={() => handleNameCheck(username)}>{isChecking ? 'Checking...' : 'Check'}</button>
                                </div>
                                <p className={`text-sm ${isAvailable && availMsg.length > 0 ? 'text-[#00aa00]' : 'text-[#aa0000]'}`}>{availMsg}</p>
                                {nameFlag && (
                                    <>
                                        <div className="flex flex-col gap-2 py-5">
                                            <p className="text-wrap">Changing your username will affect these things:</p>
                                            <ul className="list-disc pl-5">
                                                <li><p>The URL to access your profile.</p></li>
                                                <li><p>The username featured on your submissions.</p></li>
                                                {user?.is_admin && (<li><p>Any admin-related actions that display your username.</p></li>)}
                                            </ul>
                                            <p>Are you sure? After confirming, you will need to sign in again.</p>
                                        </div>
                                        <div className="modal-action justify-center pb-5">
                                            <button className="btn btn-success" onClick={() => handleNameChange(username)}>Change</button>
                                            <button className="btn btn-error" onClick={() => {setNameFlag(false); handleNameReset()}}>Cancel</button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-xl">Edit Profile</h1>
                                <div className="flex flex-col gap-2 p-5 outline-1 outline-mabi-border-heavy rounded-xl">
                                    <h1 className="text-md text-mabi-text-muted">Bio</h1>
                                    <div className="relative w-full">
                                        <textarea className="bg-mabi-surface outline-1 outline-mabi-border w-full p-1 resize-none" value={bio || ''} onChange={(e) => setBio(e.target.value)} rows={8} maxLength={200} />
                                        <p className="absolute bottom-1 right-1">{bio && 200 - bio.length}</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-md text-mabi-text-muted">Region/Server</h1>
                                        <input className="bg-mabi-surface outline-1 outline-mabi-border p-1 w-50" maxLength={20} value={server || ''} onChange={(e) => setServer(e.target.value)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-md text-mabi-text-muted">IGN:</h1>
                                        <input className="bg-mabi-surface outline-1 outline-mabi-border p-1 w-50" maxLength={30} value={ign || ''} onChange={(e) => setIgn(e.target.value)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-md text-mabi-text-muted">Discord Username</h1>
                                        <input className="bg-mabi-surface outline-1 outline-mabi-border p-1 w-50" maxLength={50} value={discord || ''} onChange={(e) => setDiscord(e.target.value)} />
                                    </div>
                                    <div className="flex w-full justify-center">
                                        <button className="btn btn-success w-fit" onClick={handleProfileUpdate}>Update</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentTab === 'notif' && (
                        <div className="flex flex-col gap-5 p-2">
                            <h1 className="text-2xl border-b border-mabi-border-heavy pb-2">Notifications</h1>
                            <p>Not currently implemented.</p>
                        </div>
                    )}
                    {currentTab === 'security' && (
                        <div className="flex flex-col gap-5 p-2">
                            <h1 className="text-2xl border-b border-mabi-border-heavy pb-2">Security</h1>
                            <div className="flex flex-col gap-2 py-2 w-full">
                                <h1 className="text-xl">Change Password</h1>
                                <PwChangeForm />
                            </div>
                            <div className="flex flex-col gap-2 py-2 w-full">
                                <h1 className="text-xl">Deactivate Account (Not Implemented)</h1>
                                <p>If you wish to have your account deactivated, please click the button below.</p>
                                <button className="btn btn-error btn-disabled w-fit">Request Account Deactivation</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default AccountSettings;