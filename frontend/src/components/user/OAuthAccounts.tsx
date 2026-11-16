import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { AUTH_URL } from "../../utilities/MiscUtility";

export default function OAuthAccounts() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const checkSession = auth?.checkSession ?? (() => {});

    const handleOAuthLink = async (provider: "discord" | "google") => {
        try {
            const res = await fetch(`${AUTH_URL}/${provider}/link`, {
                method: 'GET',
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json();
                window.location.href = data.url;
            } else {
                alert("Your session expired or changed. Please log out and log back in first.");
            }
        } catch (err) {
            console.error(err);
            alert(`Could not start ${provider} linking.`);
        }
    };

    const handleOAuthUnlink = async (provider: 'discord' | 'google') => {
        try {
            const res = await fetch(`${AUTH_URL}/${provider}/unlink`, {
                method: 'POST',
                credentials: 'include'
            })
            if (res.ok) {
                checkSession();
            } else {
                alert(`Could not unlink from ${provider} account.`);
            }
        } catch (err) {
            console.error(err);
            alert(`Could not initiate unlinking from ${provider}.`);
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full text-mabi-text">
            <div className="flex flex-col">
                <h1 className="text-xl">Connected Accounts</h1>
                <p className="text-mabi-text-muted text-sm">Linking a verified Discord or Google account automatically verifies your account and let you log in with just one click.</p>
            </div>
            <div className="flex flex-col gap-5 bg-mabi-surface p-2 outline-1 outline-mabi-border">
                {user?.auth_status.discord_linked ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 rounded-lg p-2 w-fit outline-1 bg-[#5865F2] text-[#E0E3FF] outline-[#E0E3FF]">
                            {user.auth_status.discord_avatar && (<img src={user.auth_status.discord_avatar} className="w-12 h-12 rounded-full" />)}
                            {user.auth_status.discord_username && (<p>{user.auth_status.discord_username}</p>)}
                        </div>
                        <button className="rounded p-2 font-bold text-xs bg-[#5865F2] text-[#E0E3FF] cursor-pointer hover:bg-[#E0E3FF] hover:text-[#000] outline-1 outline-mabi-border-heavy hover:outline-mabi-border w-fit"
                        onClick={() => handleOAuthUnlink('discord')}>Unlink</button>
                    </div>
                ) : (
                    <div>
                        <p>Have a Discord account?</p>
                        <button className="rounded p-2 font-bold text-xs bg-[#E0E3FF] text-[#000] cursor-pointer hover:bg-[#5865F2] hover:text-[#E0E3FF] outline-1 outline-mabi-border-heavy hover:outline-mabi-border w-fit"
                        onClick={() => handleOAuthLink('discord')}>Link to Discord</button>
                    </div>
                )}
                {user?.auth_status.google_linked ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 rounded-lg p-2 w-fit outline-1 bg-[#FFF] text-[#F00] outline-[#F00]">
                            {user.auth_status.google_avatar && (<img src={user.auth_status.google_avatar} className="w-12 h-12 rounded-full" />)}
                            {user.auth_status.google_name && (<p>{user.auth_status.google_name}</p>)}
                            {user.auth_status.google_email && (<p className="text-sm">({user.auth_status.google_email})</p>)}
                        </div>
                        <button className="rounded p-2 font-bold text-xs bg-[#FFF] text-[#F00] cursor-pointer hover:bg-[#DDD] outline-1 outline-mabi-border-heavy hover:outline-mabi-border w-fit"
                        onClick={() => handleOAuthUnlink('google')}>Unlink</button>
                    </div>
                ) : (
                    <div>
                        <p>Have a Google account?</p>
                        <button className="rounded p-2 font-bold text-xs bg-[#FFF] text-[#F00] cursor-pointer hover:bg-[#DDD] outline-1 outline-mabi-border-heavy hover:outline-mabi-border w-fit"
                        onClick={() => handleOAuthLink('google')}>Link to Google</button>
                    </div>
                )}
            </div>
        </div>
    )
}