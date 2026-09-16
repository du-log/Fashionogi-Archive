import { UserIcon } from "lucide-react"
import { useNavigate } from "react-router-dom";

function UserNameplate( {username} : {username: string} ) {
    const navigate = useNavigate();

    return (
        <div className="flex gap-4 min-w-50 p-4 outline-2 outline-[#fa531690] rounded-xl">
            <div className="flex flex-col gap justify-start">
                <h1 className="cursor-pointer text-lg hover:text-[#00ab80]" onClick={() => navigate(`/profile/${username}`)}>{username}</h1>
                <p>Server</p>
            </div>
            <div className="p-1 outline outline-[#fa531690] rounded-xl items-center justify-center">
                <UserIcon size={80} />
            </div>
        </div>
    )
}

export default UserNameplate;