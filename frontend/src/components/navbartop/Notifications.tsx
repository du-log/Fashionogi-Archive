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
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [notifs, setNotifs] = useState<notifMsg[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [listOpen, setOpen] = useState<boolean>(false);

    const readAllHandler = async () => {
        setLoading(true);
        const res = await fetch(`${NOTIF_URL}/read-all`, {
            method: 'PATCH',
            credentials: 'include'
        })
        if (res.ok) {
            setNotifs([]);
            setLoading(false);
        }
    }

    const fetchNotifs = async () => {
        setLoading(true);
        setOpen(true);
        const res = await fetch(`${NOTIF_URL}`, {
            credentials: 'include'
        })
        if (res.ok) {
            const data = await res.json();
            setNotifs(data);
            setLoading(false);
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
        <div className="relative flex justify-center items-center text-mabi-text z-100" ref={menuRef}>
            {user && (
                <div className="relative p-2 bg-mabi-surface hover:bg-mabi-surface-muted rounded-lg cursor-pointer" onClick={() => !listOpen ? fetchNotifs() : setOpen(false)}>
                    <BellIcon size={20} />
                    {user.notif_amt > 0 && !listOpen && (
                        <div className="absolute top-1 right-1 rounded-full w-2 h-2 bg-mabi-gold"></div>
                    )}
                </div>
            )}
            {user && listOpen && (
                <div className="absolute top-10 left-0 z-10 w-50 h-65 outline-1 outline-mabi-border">
                    {isLoading && (
                        <div className="p-2 w-full h-full flex flex-col justify-center items-center bg-mabi-surface-muted text-mabi-text-muted">
                            <p>Loading...</p>
                        </div>
                    )}
                    {!isLoading && notifs.length > 0 && (
                            <div className="p-2 w-full h-full flex flex-col bg-mabi-surface-muted text-mabi-text-muted">
                            {notifs.map((notif) => (
                                <div>
                                    {notif.type === 'submission_approved' && (
                                        <Link to={`/fashion/id/${notif.sub_id}`}>{notif.message}</Link>
                                    )}
                                </div>
                            ))}
                            <button className="btn btn-neutral btn-sm place-self-center" onClick={() => readAllHandler}>Set All Read</button>
                        </div>
                    )}
                    {!isLoading && notifs.length === 0 && (
                        <div className="p-2 w-full h-full flex flex-col justify-center items-center text-center bg-mabi-surface-muted text-mabi-text-muted">
                            <p>No unread notifications.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}