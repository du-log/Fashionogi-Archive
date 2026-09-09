import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

type userInfo = {
    id: number,
    username: string
}

function UserProfile() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const [userInfo, setUserInfo] = useState<userInfo | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch('');
            const data = await res.json();
            setUserInfo(data);
            setLoading(false);
        }
        fetchProfile();
    }, [])

    return (
        <div className="flex flex-col w-full min-h-[70vh]">
            {userInfo && !isLoading && (
                <div className="flex flex-col w-full px-[20%]">
                    {user && user.username === userInfo.username && (
                        <button className="btn btn-soft btn-primary">Edit Profile</button>
                    )}
                    <h1>Hello, world!</h1>
                </div>
            )}
            {!userInfo && !isLoading && (
                <div className="flex flex-col gap-5 items-center justify-center w-full h-[70vh]">
                    <h1 className="text-xl">User profile not found or unavailable.</h1>
                    <Link to='/'><p className="outline p-2 rounded-xl">Return to Home</p></Link>
                </div>
            )}
        </div>
    )
}

export default UserProfile;