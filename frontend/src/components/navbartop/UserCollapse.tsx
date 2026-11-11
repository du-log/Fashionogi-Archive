import { useState, useRef, useEffect, useContext } from "react";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import TitleBadge from "../user/TitleBadge";

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

    if(isLoading) return(
    <>
        <div className={`flex justify-center items-center gap-2 px-2 py-3 bg-mabi-surface-muted text-mabi-text-muted rounded-lg min-w-50 h-fit min-h-16`}>
            <p>Loading...</p>
        </div>
    </>);

    return (
        <div className="relative text-mabi-text">
            {!isAuth && !user && (
                <div className={`flex gap-2 px-2 py-3 bg-mabi-surface-muted rounded-lg min-w-50 h-fit min-h-16`}>
                    <button className="cursor-pointer bg-[#00bb0090] hover:bg-[#008000] border-2 border-[#ffffff] rounded-sm px-4 py-2 hover:text-[#ffd700] font-bold text-md" onClick={() => navigate('/login')}>Log In</button>
                    <button className="cursor-pointer bg-[#bb00bb90] hover:bg-[#800080] border-2 border-[#ffffff] rounded-sm px-4 py-2 hover:text-[#ffd700] font-bold text-md" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            )}
            {isAuth && user && (
                <div className={`relative`} ref={menuRef}>
                    <div className={"group flex items-center justify-between bg-mabi-surface rounded-lg min-w-50 h-fit min-h-16 px-3 py-2 cursor-pointer hover:bg-mabi-surface-muted"} onClick={() => setOpen(!isOpen)}>
                        <div className="flex flex-col">
                            <h2 className="text-lg truncate max-w-40">{user?.username}</h2>
                            <TitleBadge name={user.title_name} category={user.title_type} size="sm" />
                        </div>
                        <div className={`flex flex-col justify-center items-center cursor-pointer w-12 h-12 outline-2 outline-mabi-border-heavy group-hover:outline-mabi-gold`}>
                            {user?.avatar_id ? <img src={user.avatar_id} /> : <User size={50} />}
                        </div>
                    </div>
                    {isOpen && (
                        <ul id="Collapse" className="absolute flex flex-col items-start bg-mabi-surface-muted sm:text-md xl:text-lg outline-1 outline-mabi-border top-19 place-self-center w-55">
                            <Link to={`/profile/${user?.username}`} className="w-full"><p className="p-2 hover:bg-mabi-green" onClick={() => setOpen(false)}>Public Profile</p></Link>
                            <Link to={`/account/dashboard`} className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green" onClick={() => setOpen(false)}>Dashboard</p></Link>
                            <Link to={`/account/settings`} className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green" onClick={() => setOpen(false)}>Settings</p></Link>
                            {user?.is_admin && (
                                <Link to={`/admin`} className="w-full"><p className="cursor-pointer p-2 hover:bg-mabi-green">Admin Dashboard</p></Link>
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