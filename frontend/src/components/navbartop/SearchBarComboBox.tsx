import { useState, useEffect, useRef } from "react";
import { MISC_URL } from "../../utilities/MiscUtility";
import { useLocation, useNavigate } from "react-router-dom";

type User = {
    'id': number,
    'username': string
}

type Submission = {
    'id': number,
    'title': string,
    'author': string
}

export default function SearchBarComboBox() {
    const [userResults, setUserResults] = useState<User[]>([]);
    const [subResults, setSubResults] = useState<Submission[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const skipSearch = useRef<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [query, setQuery] = useState<string>('');

    useEffect(() => {
        if (skipSearch.current) {
            skipSearch.current = false;
            return;
        }

        const timerDebounce = setTimeout(async () => {
            if (query.length > 2) {
                try {
                    const res = await fetch(`${MISC_URL}/search?q=${query}`);
                    const data = await res.json();
                    setUserResults(data.users);
                    setSubResults(data.submissions);
                } catch (err) {
                    console.error("Search failed", err);
                }
                if(userResults.length > 0 || subResults.length > 0) {
                    setOpen(true);
                } else {
                    setOpen(false);
                }
            } else {
                setOpen(false);
                setUserResults([]);
                setSubResults([]);
            }
        }, 200);
        return () => clearTimeout(timerDebounce);
    }, [query, userResults, subResults, location.search])

    useEffect(() => {
        const outsideClickHandle = (event: MouseEvent) => {
            if (!menuRef.current) return;
            const target = event.target;
            if (target instanceof Node && !menuRef.current.contains(target)) {
                skipSearch.current = true;
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', outsideClickHandle);
        return () => document.removeEventListener('mousedown', outsideClickHandle);
    }, []);

    return (
        <div className="relative w-40 text-mabi-text" ref={menuRef}>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." 
            className="w-full p-1 outline-1 outline-mabi-border-heavy bg-mabi-surface-muted" />

            {isOpen && (
                <ul className="absolute z-10 w-full outline-1 outline-mabi-border mt-1 max-h-60 overflow-y-auto bg-mabi-surface">
                    {userResults.length > 0 && (
                        <>
                            <p className="px-2 py-1 bg-mabi-surface-muted">Users</p>
                            {userResults.map((item) => (
                                <li key={item.id} 
                                onClick={() => {
                                    setOpen(false);
                                    navigate(`/profile/${item.username}`)
                                    setQuery('');
                                }}
                                className="cursor-pointer hover:bg-mabi-green p-2">
                                    {item.username}
                                </li>
                            ))}
                        </>
                    )}
                    {subResults.length > 0 && (
                        <>
                            <p className="px-2 py-1 bg-mabi-surface-muted">Submissions</p>
                            {subResults.map((item) => (
                                <li key={item.id} 
                                onClick={() => {
                                    setOpen(false);
                                    navigate(`/fashion/id/${item.id}`)
                                    setQuery('');
                                }}
                                className="flex flex-col cursor-pointer hover:bg-mabi-green p-2">
                                    <p>{item.title}</p>
                                    <p className="text-sm">by {item.author}</p>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            )}
        </div>
    )
}