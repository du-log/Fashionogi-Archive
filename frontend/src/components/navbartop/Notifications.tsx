import { useContext, useEffect, useRef, useState } from "react";
import { NOTIF_URL } from "../../utilities/MiscUtility";
import { BellIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

export interface notifMsg {
    message: string,
    type: string,
    date: string,
    sub_id?: number,
    detail?: string,
}

export default function Notifications() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const checkSession = auth?.checkSession ?? (() => {});
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [notifs, setNotifs] = useState<notifMsg[]>([]);
    const [pendingAmt, setAmt] = useState<number>(0);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [listOpen, setOpen] = useState<boolean>(false);

    const readAllHandler = async () => {
        setLoading(true);
        const res = await fetch(`${NOTIF_URL}/read-all`, {
            method: 'PATCH',
            credentials: 'include'
        })
        if (res.ok) {
            checkSession();
            setNotifs([]);
            setLoading(false);
        }
    }

    const fetchNotifs = async () => {
        setLoading(true);
        setOpen(true);
        fetchPendingAmt();
        const res = await fetch(`${NOTIF_URL}`, {
            credentials: 'include'
        })
        if (res.ok) {
            const data = await res.json();
            setNotifs(data);
            setLoading(false);
        }
    }
    
    const fetchPendingAmt = async () => {
        if (!user?.is_admin) return;
        const res = await fetch(`${NOTIF_URL}/admin`, {
            credentials: 'include'
        })
        if (res.ok) {
            const data = await res.json();
            setAmt(data);
        }
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
        <div className="relative flex justify-center items-center text-mabi-text z-100 text-sm" ref={menuRef}>
            {user && (
                <div className="relative p-2 bg-mabi-surface hover:bg-mabi-surface-muted rounded-lg cursor-pointer" onClick={() => !listOpen ? fetchNotifs() : setOpen(false)}>
                    <BellIcon size={20} />
                    {user.notif_amt > 0 && !listOpen && (
                        <div className="absolute top-0.5 right-0.5 rounded-full w-2.5 h-2.5 bg-mabi-gold"></div>
                    )}
                </div>
            )}
            {user && listOpen && (
                <div className="absolute top-10 left-0 z-10 w-65 h-fit outline-2 outline-[#000]/50 bg-mabi-surface-muted text-mabi-text-muted">
                    {isLoading && (
                        <div className="p-2 w-full min-h-20 flex flex-col justify-center items-center">
                            <p>Loading...</p>
                        </div>
                    )}
                    {!isLoading && notifs.length > 0 && (
                        <div className="w-full max-h-50 flex flex-col overflow-y-auto">
                            {notifs.map((notif) => (
                                <>
                                    {notif.type === 'submission_approved' && (
                                        <Link key={notif.type} to={`/fashion/id/${notif.sub_id}`} className="p-1 hover:bg-mabi-surface hover:text-mabi-text" onClick={() => setOpen(false)}>{notif.message}</Link>
                                    )}
                                    {notif.type !== 'submission_approved' && (
                                        <p key={notif.type} className="p-1 hover:bg-mabi-surface hover:text-mabi-text">{notif.message}</p>
                                    )}
                                </>
                            ))}
                            <button className="btn btn-neutral btn-sm place-self-center my-2" onClick={readAllHandler}>Mark All as Read</button>
                        </div>
                    )}
                    {!isLoading && notifs.length === 0 && (
                        <div className="p-2 w-full min-h-20 flex flex-col justify-center items-center text-center">
                            <p>No unread notifications.</p>
                        </div>
                    )}
                    {user.is_admin && (
                        <div className="w-full flex flex-col justify-center items-center text-center border-t-1">
                            <Link to={'/admin'} className="hover:bg-mabi-surface hover:text-mabi-text p-1">There are currently {pendingAmt} pending submissions.</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}