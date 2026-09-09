import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function UserDashboard() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    return (
        <div>

        </div>
    )
}

export default UserDashboard;