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
                    if(userResults.length > 0 || subResults.length > 0) {
                        setOpen(true);
                    }
                } catch (err) {
                    console.error("Search failed", err);
                }
            } else {
                setOpen(false);
            }
        }, 200);
        return () => clearTimeout(timerDebounce);
    }, [query, userResults, subResults, location.search])

    return (
        <div className="relative w-40">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." 
            className="w-full p-1 outline rounded bg-[#ffffff50] text-[#fff]" />

            {isOpen && (
                <ul className="absolute z-10 w-full outline mt-1 max-h-60 overflow-y-auto bg-[#666]">
                    {userResults.length > 0 && (
                        <>
                            <p>Users</p>
                            {userResults.map((item) => (
                                <li key={item.id} 
                                onClick={() => {
                                    skipSearch.current = true;
                                    setOpen(false);
                                    navigate(`/profile/${item.username}`)
                                    setQuery('');
                                }}
                                className="cursor-pointer hover:bg-[#777] p-2">
                                    {item.username}
                                </li>
                            ))}
                        </>
                    )}
                    {subResults.length > 0 && (
                        <>
                            <p className="px-2 py-1">Submissions</p>
                            {subResults.map((item) => (
                                <li key={item.id} 
                                onClick={() => {
                                    skipSearch.current = true;
                                    setOpen(false);
                                    navigate(`/fashion/id/${item.id}`)
                                    setQuery('');
                                }}
                                className="cursor-pointer hover:bg-[#777] p-2">
                                    {item.title} by {item.author}
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            )}
        </div>
    )
}