import { UserIcon } from "lucide-react"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { userProfile } from "./UserProfile";
import { R2_PUBLIC_URL, USERS_URL } from "../../utilities/MiscUtility";

function UserNameplate( {username} : {username: string} ) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<userProfile>();

    useEffect(() => {
        const fetchDetail = async () => {
            const res = await fetch(`${USERS_URL}/profiles/${username}`);
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
        }
        fetchDetail();
    }, [username])

    return (
        <div className="flex gap-4 min-w-50 p-4 outline-2 outline-mabi-gold bg-mabi-surface-muted hover:bg-mabi-surface">
            <div className="outline-1 outline-mabi-border-heavy items-center justify-center h-fit w-fit">
                {userData?.avatar_id ? <img className="w-20" src={`${R2_PUBLIC_URL}/avatars/${userData.avatar_id}.webp`} /> : <UserIcon size={80} />}
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex gap-5 items-center">
                    <h1 className="cursor-pointer font-bold text-xl hover:text-mabi-gold" onClick={() => navigate(`/profile/${username}`)}>{username}</h1>
                    <p className="text-md py-1 px-2 outline outline-mabi-border-heavy w-fit cursor-default">Member</p>
                </div>
                <p className="text-sm text-mabi-text-muted">{userData?.server ? userData.server : ''}</p>
            </div>
        </div>
    )
}

export default UserNameplate;