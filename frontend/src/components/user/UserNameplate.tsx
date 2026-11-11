import { UserIcon } from "lucide-react"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { NameplateUser, userProfile } from "./UserProfile";
import { R2_PUBLIC_URL, USERS_URL } from "../../utilities/MiscUtility";
import TitleBadge from "./TitleBadge";

interface nameplateProps {
    username: string,
    intialData?: NameplateUser,
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

function UserNameplate( {username, intialData, setOpen} : nameplateProps ) {
    const [userData, setUserData] = useState<userProfile>();

    useEffect(() => {
        const fetchDetail = async () => {
            if (intialData) {
                setUserData(intialData);
                return;
            }
            const res = await fetch(`${USERS_URL}/profiles/${username}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
        }
        fetchDetail();
    }, [username, intialData])

    return (
        <Link to={`/profile/${username}`} onClick={() => {if (setOpen) setOpen(false)}}>
            <div className="group flex gap-4 w-full p-4 rounded-lg outline-2 outline-mabi-gold bg-mabi-surface-muted hover:bg-mabi-surface text-mabi-text cursor-pointer">
                <div className="outline-1 outline-mabi-border-heavy items-center justify-center h-20 w-20 shrink-0">
                    {userData?.avatar_id ? <img className="w-full h-full object-cover" src={`${R2_PUBLIC_URL}/avatars/${userData.avatar_id}.webp`} /> : <UserIcon size={80} />}
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
                    <h1 className="font-bold text-lg leading-tight truncate">{username}</h1>
                    <TitleBadge name={userData?.active_title?.name} category={userData?.active_title?.stat_type} size="sm" />
                    <p className="text-xs text-mabi-text-muted truncate">{[userData?.server, userData?.in_game_name].filter(Boolean).join(" | ")}</p>
                </div>
            </div>
        </Link>
    )
}

export default UserNameplate;