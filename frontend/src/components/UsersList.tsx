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
                setTimeout(() => setLoading(false), 50);
            }
        }
        fetchUsers();
    }, [])

    if (isLoading) {
        return (
            <div className="w-full h-[50vh] flex flex-col justify-center items-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className={`flex flex-col w-full min-h-[70vh] xl:px-[20%] transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full min-h-[50vh] place-items-center">
                {usersList.map((user) => (
                    <UserNameplate key={user.id} username={user.username} intialData={user} />
                ))}
            </div>
        </div>
    )
}