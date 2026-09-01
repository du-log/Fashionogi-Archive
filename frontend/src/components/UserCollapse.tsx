import { useState, useRef, useEffect, useContext } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function UserCollapse() {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    const auth = useContext(AuthContext);
    const isAuth = auth?.isAuth ?? false;
    const logout = auth?.logout ?? (async () => {});
    const user = auth?.user ?? null;
    const [isLoading, setLoading] = useState<boolean>(true);

    const logOutHandle = () => {
        setLoading(true);
        logout();
        setOpen(false);
        setTimeout(() => setLoading(false), 500);
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

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    })


    return (
        <div className={`transition-opacity duration-200 ease-in-out ${!isLoading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {!isAuth && (
                <div className="flex gap-3">
                    <button className="cursor-pointer bg-[#00bb0090] hover:bg-[#008000] border-2 border-[#ffffff] rounded-sm px-4 py-2 text-[#ffffff] hover:text-[#ffd700] font-bold text-md" onClick={() => navigate('/login')}>Sign In</button>
                    <button className="cursor-pointer bg-[#bb00bb90] hover:bg-[#800080] border-2 border-[#ffffff] rounded-sm px-4 py-2 text-[#ffffff] hover:text-[#ffd700] font-bold text-md" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            )}
            {isAuth && (
                <div className="relative pr-[1rem]" ref={menuRef}>
                    <div className="flex items-center justify-end gap-3">
                        <h2 className="text-lg hover:cursor-default">{user?.username}</h2>
                        <div className={`flex flex-col bg-[#ffffff90] justify-center items-center rounded-4xl hover:cursor-pointer w-8 h-8 outline-2`} onClick={() => setOpen(!isOpen)}>
                            <User size={50} />
                        </div>
                    </div>
                    {isOpen && (
                        <ul className="absolute flex flex-col items-start gap-2 bg-[#505050] p-3 mt-4 sm:text-md xl:text-lg border-1 border-[#daa700] right-0">
                            <li><p className="cursor-pointer" onClick={logOutHandle}>Sign Out</p></li>
                            <li><p className="cursor-pointer">Settings</p></li>
                        </ul>
                    )}
                </div>
            )}  
        </div>
    )
}

export default UserCollapse;