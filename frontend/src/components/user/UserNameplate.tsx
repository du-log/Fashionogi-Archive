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
        <div className="flex justify-between gap-4 min-w-50 p-4 outline-2 outline-mabi-gold bg-mabi-surface-muted">
            <div className="flex flex-col gap justify-start">
                <h1 className="cursor-pointer text-lg hover:text-mabi-green" onClick={() => navigate(`/profile/${username}`)}>{username}</h1>
                <p>{userData?.server ? userData.server : ''}</p>
            </div>
            <div className="outline-1 outline-mabi-border-heavy rounded-xl items-center justify-center h-fit">
                {userData?.avatar_id ? <img className="w-20 rounded-xl" src={`${R2_PUBLIC_URL}/avatars/${userData.avatar_id}.webp`} /> : <UserIcon size={80} />}
            </div>
        </div>
    )
}

export default UserNameplate;