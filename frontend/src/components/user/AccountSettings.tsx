import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL, USERS_URL } from "../../utilities/MiscUtility";
import PwChangeForm from "./PwChangeForm";
import AvatarSettings from "./AvatarSettings";
import { AccountSecuritySection } from "./AccountSettingsSecuritySection";
import type { userProfile } from "./UserProfile";

function AccountSettings() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading = auth?.isLoading ?? true;
    const checkSession = auth?.checkSession ?? (() => {});
    const logout = auth?.logout ?? (async () => {});
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isChecking, setChecking] = useState<boolean>(false);
    
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [isAvailable, setAvailable] = useState<boolean>(false);
    const [availMsg, setAvailMsg] = useState<string>('');

    const [nameFlag, setNameFlag] = useState<boolean>(false);

    const [currentProfile, setProfile] = useState<userProfile>();
    const [bio, setBio] = useState<string | null | undefined>('');
    const [server, setServer] = useState<string | null | undefined>('');
    const [ign, setIgn] = useState<string | null | undefined>('');

    const handleNameCheck = async (username: string) => {
        setAvailable(false);
        setChecking(true);
        if (username.length <= 2) {
            setAvailMsg('Username must be at least 3 characters.');
            return;
        }
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
            in_game_name: ign
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
                setProfile(newData);
                setBio(newData?.bio);
                setServer(newData?.server);
                setIgn(newData?.in_game_name);
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
                setProfile(data);
                setBio(data?.bio);
                setServer(data?.server);
                setIgn(data?.in_game_name);
            }
            if(res.ok) setTimeout(() => setLoading(false), 100);
        }
        fetchProfile();
    }, [user, userLoading, navigate])

    return (
        <>
            <title>Settings | Fashionogi Archive</title>
            {userLoading || isLoading && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner loading-xl"></span>
                </div>
            )}
            <div className={`flex gap-10 w-full min-h-[69.1vh] sm:px-[5%] xl:px-[20%] py-20 text-mabi-text transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <div className="flex flex-3 flex-col w-full gap-10 outline bg-mabi-surface-muted pb-10">
                    <h1 className="text-2xl border-b-1 border-mabi-border-heavy p-3 bg-mabi-surface">Account Settings</h1>
                    <div className="flex flex-col gap-5 px-10">
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
                            <div className="flex flex-col gap-2">
                                <h1 className="text-md text-mabi-text-muted">Bio</h1>
                                <div className="relative w-full">
                                    <textarea className="bg-mabi-surface outline-1 outline-mabi-border w-full p-1 resize-none" value={bio || ''} onChange={(e) => setBio(e.target.value)} rows={8} maxLength={200} />
                                    <p className="absolute bottom-1 right-0 text-xs text-mabi-text-muted">{bio && 200 - bio.length}</p>
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-md text-mabi-text-muted">Region/Server</h1>
                                    <div className="relative w-fit">
                                        <input className="bg-mabi-surface outline-1 outline-mabi-border p-1 w-50" maxLength={20} value={server || ''} onChange={(e) => setServer(e.target.value)} />
                                        <p className="absolute text-xs text-mabi-text-muted leading-none bottom-0 right-0">{(20 - Number(server?.length))}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-md text-mabi-text-muted">IGN:</h1>
                                    <div className="relative w-fit">
                                        <input className="bg-mabi-surface outline-1 outline-mabi-border p-1 w-50" maxLength={30} value={ign || ''} onChange={(e) => setIgn(e.target.value)} />
                                        <p className="absolute text-xs text-mabi-text-muted leading-none bottom-0 right-0">{(30 - Number(ign?.length))}</p>
                                    </div>
                                </div>
                                <div className="flex w-full justify-center">
                                    <button className="btn btn-success w-fit" onClick={handleProfileUpdate} disabled={currentProfile?.bio === bio && currentProfile?.in_game_name === ign && currentProfile?.server === server}>Update</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-2xl border-y-1 border-mabi-border-heavy p-3 bg-mabi-surface">Security</h1>
                    <div className="flex flex-col gap-5 px-10">
                        <div className="flex flex-col gap-2 py-2 w-full">
                            <h1 className="text-xl">Change Password</h1>
                            <PwChangeForm />
                        </div>
                        <AccountSecuritySection AUTH_URL={`${BASE_URL}/api/auth`} authStatus={user?.auth_status} onRefreshUser={checkSession} />
                        <div className="flex flex-col gap-2 py-2 w-full">
                            <h1 className="text-xl">Deactivate Account (Not Implemented)</h1>
                            <p>If you wish to have your account deactivated, please click the button below.</p>
                            <button className="btn btn-error btn-disabled w-fit">Request Account Deactivation</button>
                        </div>
                    </div>
                    <h1 className="text-2xl border-y-1 border-mabi-border-heavy p-3 bg-mabi-surface">Notifications</h1>
                    <div className="flex flex-col gap-5 px-10">
                        <p>Not currently implemented.</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AccountSettings;