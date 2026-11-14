import { useEffect, useState } from "react";
import { MISC_URL } from "../utilities/MiscUtility";
import type { NameplateUser } from "./user/UserProfile";
import UserNameplate from "./user/UserNameplate";

export default function UsersList() {
    const [usersList, setUsersList] = useState<NameplateUser[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`${MISC_URL}/users/all`);
            if (res.ok) {
                const data = await res.json();
                setUsersList(data);
            }
            if (res.ok) setTimeout(() => setLoading(false), 50);
        }
        document.documentElement.scrollTop = 0;
        fetchUsers();
    }, [])

    return (
        <>  
            <title>Users List | Fashionogi Archive</title>
            {isLoading && (
                <div className="w-full h-[69.1vh] flex flex-col justify-center items-center">
                    <span>Loading...</span>
                    <span className="loading loading-ring loading-xl" />
                </div>
            )}
            <div className={`flex flex-col gap-10 w-full min-h-[69.1vh] px-5 xl:px-[20%] py-10 transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <p className="text-center text-2xl">Users List ({usersList.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full max-h-[59vh] p-5 place-items-center overflow-y-auto scrollbar-thin bg-mabi-surface/50 outline-1 outline-mabi-border-heavy">
                    {usersList.map((user) => (
                        <div className="w-75">
                            <UserNameplate key={user.id} username={user.username} intialData={user} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}