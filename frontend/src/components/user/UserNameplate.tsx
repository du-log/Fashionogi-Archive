import { UserIcon } from "lucide-react"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { userProfile } from "./UserProfile";
import { USERS_URL } from "../../utilities/MiscUtility";

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
        <div className="flex justify-between gap-4 min-w-50 p-4 outline-2 outline-[#fa531690] rounded-xl bg-[#2A2F2C]">
            <div className="flex flex-col gap justify-start">
                <h1 className="cursor-pointer text-lg hover:text-[#00ab80]" onClick={() => navigate(`/profile/${username}`)}>{username}</h1>
                <p>{userData?.server ? userData.server : ''}</p>
            </div>
            <div className="p-1 outline outline-[#fa531690] rounded-xl items-center justify-center">
                <UserIcon size={80} />
            </div>
        </div>
    )
}

export default UserNameplate;