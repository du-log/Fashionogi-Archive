import { useContext, useState } from "react";
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
        const res = await fetch(`${NOTIF_URL}/`, {
            credentials: 'include'
        })
        if (res.ok) {
            const data = await res.json();
            setNotifs(data);
            setLoading(false);
            setOpen(true);
        }
    }

    return (
        <div className="relative flex justify-center items-center text-mabi-text">
            {user && (
                <div className="relative p-2 bg-mabi-surface hover:bg-mabi-surface-muted rounded-lg cursor-pointer" onClick={() => !listOpen ? fetchNotifs : setOpen(false)}>
                    <BellIcon size={20} />
                    {user.notif_amt > 0 && !listOpen && (
                        <div className="absolute top-1 right-1 rounded-full w-2 h-2 bg-mabi-gold"></div>
                    )}
                </div>
            )}
            {user && listOpen && (
                <>
                    {isLoading && (
                        <div className="absolute bottom-0 flex flex-col w-50 h-50 justify-center items-center bg-mabi-surface-muted text-mabi-text-muted">
                            <p>Loading...</p>
                        </div>
                    )}
                    {!isLoading && (
                            <div className="absolute flex flex-col bottom-0 w-50 h-50 bg-mabi-surface-muted text-mabi-text-muted">
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
                    {!isLoading && !notifs && (
                        <div className="absolute bottom-0 flex flex-col w-50 h-50 justify-center items-center bg-mabi-surface-muted text-mabi-text-muted">
                            <p>No unread notifications.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}