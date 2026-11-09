import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../contexts/AuthContext";
import { SUBS_URL } from "../../utilities/MiscUtility";

export default function DashboardDropdown( {styleId, styleStatus, activeTab, activeUser, fetchFavorites, fetchQueue} : {styleId: number, styleStatus?: string, activeTab: string, activeUser: User | null, fetchFavorites: () => void, fetchQueue: () => void} ) {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [delConfOpen, setDelConfOpen] = useState<boolean>(false);
    const [unliConfOpen, setUnliConfOpen] = useState<boolean>(false);
    const [reliConfOpen, setReliConfOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const toggleFavorite = async () => {
        if (!activeUser) return;
        try {
            const res = await fetch(`${SUBS_URL}/id/${styleId}/favorite`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                fetchFavorites();
            }
        } catch (err) {
            console.error('Failed to toggle', err);
        }
    }

    const deleteSubmission = async (id: number) => {
        const res = await fetch(`${SUBS_URL}/delete/${id}`, {
            method: 'PATCH',
            credentials: 'include'
        })
        if (res.ok) {
            fetchQueue();
            setDelConfOpen(false);
        }
    }
    
    const unlistSubmission = async (id: number) => {
        const res = await fetch(`${SUBS_URL}/unlist/${id}`, {
            method: 'PATCH',
            credentials: 'include'
        })
        if (res.ok) fetchQueue();
    }
    
    const relistSubmission = async (id: number) => {
        const res = await fetch(`${SUBS_URL}/relist/${id}`, {
            method: 'PATCH',
            credentials: 'include'
        })
        if (res.ok) fetchQueue();
    }

    useEffect(() => {
            const outsideClickHandle = (event: MouseEvent) => {
                if (!menuRef.current) return;
                const target = event.target;
                if (target instanceof Node && !menuRef.current.contains(target)) {
                    setMenuOpen(false);
                }
            }
            document.addEventListener('mousedown', outsideClickHandle);
            return () => document.removeEventListener('mousedown', outsideClickHandle);
        }, []);

    return (
        <div className="relative z-200 text-mabi-text" ref={menuRef}>
            <div className="cursor-pointer transition-color duration-50 hover:text-mabi-orange rounded-lg p-1 bg-mabi-surface outline-1 outline-mabi-border-heavy" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></div>
            <div className="absolute top-6 w-40 bg-mabi-surface-muted">
                {activeTab === 'styles' && menuOpen && (
                    <ul className="flex flex-col outline-1 outline-mabi-border">
                        <Link to={`/fashion/edit/${styleId}`} className="p-2 hover:bg-mabi-surface"><p>Edit</p></Link>
                        {styleStatus !== 'unlisted' && styleStatus !== 'pending' && (<p className="p-2 hover:bg-mabi-surface cursor-pointer" onClick={() => {setUnliConfOpen(true); setMenuOpen(false)}}>Unlist</p>)}
                        {styleStatus === 'unlisted' && (<p className="p-2 hover:bg-mabi-surface cursor-pointer" onClick={() => {setReliConfOpen(true); setMenuOpen(false)}}>Relist</p>)}
                        <p className="p-2 hover:bg-mabi-surface cursor-pointer" onClick={() => {setDelConfOpen(true); setMenuOpen(false)}}>Delete</p>
                    </ul>
                )}
                {activeTab === 'favorites' && menuOpen && (
                    <ul className="flex flex-col outline-1 outline-mabi-border">
                        <p className="cursor-pointer p-2 hover:bg-mabi-surface" onClick={toggleFavorite}>Unfavorite Style</p>
                    </ul>
                )}
            </div>
            {unliConfOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-body p-5 w-fit bg-mabi-surface-muted border-1 border-mabi-border">
                        <div className="flex flex-col gap-2 items-center justify-center w-fit">
                            <p>This will private the style.</p>
                            <p>Only users with the link to this submission will be able to view it.</p>
                            <div className="flex gap-2">
                                <button className="btn btn-warning btn-sm" onClick={() => unlistSubmission(styleId)}>Unlist</button>
                                <button className="btn btn-error btn-sm" onClick={() => setUnliConfOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}
            {reliConfOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-body p-5 w-fit bg-mabi-surface-muted border-1 border-mabi-border">
                        <div className="flex flex-col gap-2 items-center justify-center w-fit">
                            <p>This will relist the style.</p>
                            <p>It will be set to pending, but once reapproved will be publicly available again.</p>
                            <div className="flex gap-2">
                                <button className="btn btn-success btn-sm" onClick={() => relistSubmission(styleId)}>Relist</button>
                                <button className="btn btn-error btn-sm" onClick={() => setReliConfOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}
            {delConfOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-body p-5 w-fit bg-mabi-surface-muted border-1 border-mabi-border">
                        <div className="flex flex-col gap-2 items-center justify-center w-fit">
                            <p>This will delete the style.</p>
                            <p>Are you sure? This action cannot be reverted.</p>
                            <div className="flex gap-2">
                                <button className="btn btn-neutral btn-sm" onClick={() => deleteSubmission(styleId)}>Delete</button>
                                <button className="btn btn-error btn-sm" onClick={() => setDelConfOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    )
}