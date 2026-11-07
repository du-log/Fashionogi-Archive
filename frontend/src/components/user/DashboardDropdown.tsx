import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../../contexts/AuthContext";
import { SUBS_URL } from "../../utilities/MiscUtility";

export default function DashboardDropdown( {styleId, activeTab, activeUser, fetchFavorites} : {styleId: number, activeTab: string, activeUser: User | null, fetchFavorites: () => void} ) {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
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
                        <Link to={`/fashion/edit/${styleId}`} className="p-2 hover:bg-mabi-surface"><p>Edit Style</p></Link>
                    </ul>
                )}
                {activeTab === 'favorites' && menuOpen && (
                    <ul className="flex flex-col outline-1 outline-mabi-border">
                        <p className="cursor-pointer p-2 hover:bg-mabi-surface" onClick={toggleFavorite}>Unfavorite Style</p>
                    </ul>
                )}
            </div>
        </div>
    )
}