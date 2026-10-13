import { useState, useRef, useEffect, useContext } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

function UserCollapse() {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    const auth = useContext(AuthContext);
    const isAuth = auth?.isAuth ?? false;
    const logout = auth?.logout ?? (async () => {});
    const user = auth?.user ?? null;
    const isLoading = auth?.isLoading ?? false;

    const logOutHandle = () => {
        logout();
    }

    useEffect(() => {
        const outsideClickHandle = (event: MouseEvent) => {
            if (!menuRef.current) return;
            const target = event.target;
            if (target instanceof Node && !menuRef.current.contains(target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', outsideClickHandle);
        return () => document.removeEventListener('mousedown', outsideClickHandle);
    }, []);

    if(isLoading) return(<></>);

    return (
        <div className="relative">
            {!isAuth && !user && (
                <div className={`flex gap-1 py-1`}>
                    <button className="cursor-pointer bg-[#00bb0090] hover:bg-[#008000] border-2 border-[#ffffff] rounded-sm px-4 py-2 hover:text-[#ffd700] font-bold text-md" onClick={() => navigate('/login')}>Log In</button>
                    <button className="cursor-pointer bg-[#bb00bb90] hover:bg-[#800080] border-2 border-[#ffffff] rounded-sm px-4 py-2 hover:text-[#ffd700] font-bold text-md" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            )}
            {isAuth && user && (
                <div className={`relative`} ref={menuRef}>
                    <div className={"flex items-center justify-between gap-3 w-45"}>
                        <h2 className="text-lg hover:cursor-default truncate max-w-40">{user?.username}</h2>
                        <div className={`flex flex-col justify-center items-center rounded-md cursor-pointer w-12 h-12 outline-2 outline-mabi-border-heavy hover:outline-mabi-gold`} onClick={() => setOpen(!isOpen)}>
                            {user?.avatar_id ? <img src={user.avatar_id} /> : <User size={50} />}
                        </div>
                    </div>
                    {isOpen && (
                        <ul id="Collapse" className="absolute flex flex-col items-start bg-mabi-surface-muted sm:text-md xl:text-lg outline-1 outline-mabi-border top-15 place-self-center w-55">
                            <li className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green" onClick={() => {navigate(`/profile/${user?.username}`); setOpen(false)}}>View Profile</p></li>
                            <li className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green" onClick={() => {navigate('/account/dashboard'); setOpen(false)}}>Dashboard</p></li>
                            <li className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green" onClick={() => {navigate('/account/settings'); setOpen(false)}}>Settings</p></li>
                            {user?.is_admin && (
                                <li className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green" onClick={() => navigate('/admin')}>Admin Dashboard</p></li>
                            )}
                            <li className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green" onClick={logOutHandle}>Log Out</p></li>
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}

export default UserCollapse;