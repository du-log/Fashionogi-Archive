import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";

function UserCollapse() {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isAuth, setAuth] = useState<boolean>(false);

    const logOutHandle = () => {
        setAuth(false);
        setOpen(false);
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


    return (
        <div>
            {!isAuth && (
                <div className="flex gap-3">
                    <button className="cursor-pointer bg-[#00bb0090] hover:bg-[#008000] border-2 border-[#ffffff] rounded-sm px-4 py-2 text-[#ffffff] hover:text-[#ffd700] font-bold text-md" onClick={() => setAuth(true)}>Sign In</button>
                    <button className="cursor-pointer bg-[#bb00bb90] hover:bg-[#800080] border-2 border-[#ffffff] rounded-sm px-4 py-2 text-[#ffffff] hover:text-[#ffd700] font-bold text-md">Sign Up</button>
                </div>
            )}
            {isAuth && (
                <div className="relative pr-[1rem]" ref={menuRef}>
                    <div className="flex items-center justify-end gap-3">
                        <h2 className="text-lg hover:cursor-default">Username</h2>
                        <div className={`flex flex-col bg-[#ffffff90] justify-center items-center rounded-4xl hover:cursor-pointer w-8 h-8 outline-2`} onClick={() => setOpen(!isOpen)}>
                            <User size={50} />
                        </div>
                    </div>
                    {isOpen && (
                        <ul className="absolute flex flex-col items-start gap-2 bg-[#505050] p-3 mt-4 sm:text-md xl:text-lg border-1 border-[#daa700] right-0">
                            <li><p onClick={logOutHandle}>Sign Out</p></li>
                            <li><p>Settings</p></li>
                        </ul>
                    )}
                </div>
            )}  
        </div>
    )
}

export default UserCollapse;