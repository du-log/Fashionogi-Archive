import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MISC_URL } from "../../utilities/MiscUtility";

type Tag = {
    id: number,
    name: string,
    is_active: boolean
}

interface ComboBoxProps {
    tag: string,
    setTag: (value: string) => void
}

function TagsComboBox ( {tag, setTag} :  ComboBoxProps) {
    const [results, setResults] = useState([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const skipSearch = useRef<boolean>(false);
    const location = useLocation();
    const menuRef = useRef<HTMLUListElement | null>(null);

    useEffect(() => {
        if (skipSearch.current) {
            skipSearch.current = false;
            return;
        }

        const timerDebounce = setTimeout(async () => {
            if (tag.length >= 0) {
                try {
                    const res = await fetch(`${MISC_URL}/tags?q=${tag}`);
                    const data = await res.json();
                    setResults(data);
                    const urlParam = new URLSearchParams(location.search);
                    const tagFromUrl = urlParam.get("tag")
                    if(tag.length > 0 && tag !== tagFromUrl) {
                        setOpen(true);
                    } else {
                        setOpen(false);
                    }
                } catch (err) {
                    console.error("Search failed", err);
                }
            }
        }, 200);
        return () => clearTimeout(timerDebounce);
    }, [tag, location.search])

    useEffect(() => {
        const outsideClickHandle = (event: MouseEvent) => {
            if (!menuRef.current) return;
            const target = event.target;
            if (target instanceof Node && !menuRef.current.contains(target)) {
                skipSearch.current = true;
                setTag('');
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', outsideClickHandle);
        return () => document.removeEventListener('mousedown', outsideClickHandle);
    }, [setTag]);

    return (
        <div className="relative w-40 text-mabi-text">
            <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" 
            className="w-full p-1 outline-1 outline-mabi-border rounded bg-mabi-surface" />

            {isOpen && results.length > 0 && (
                <ul className="absolute z-10 w-full outline-1 outline-mabi-border mt-1 max-h-60 overflow-y-auto" ref={menuRef}>
                    {results.map((item: Tag) => (
                        <li key={item.id} 
                        onClick={() => {
                            skipSearch.current = true;
                            setTag(item.name);
                            setOpen(false);
                        }}
                        className="cursor-pointer bg-mabi-surface hover:bg-mabi-green p-2">
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default TagsComboBox;