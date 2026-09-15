import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const navigate = useNavigate();

    const [tab, setTab] = useState<string>('');

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate])
    
    return (
        <div className="flex">
            <div className="flex flex-col justify-evenly p-3 outline rounded text-lg w-fit">
                <p>All</p>
                <p>Pending</p>
                <p>Favorites</p>
            </div>
            <div className="flex flex-col">
                
            </div>
        </div>
    )
}

export default UserDashboard;