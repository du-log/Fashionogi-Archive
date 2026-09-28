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

    return (
        <div className="relative w-40">
            <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" 
            className="w-full p-1 outline rounded bg-[#ffffff50] text-[#fff]" />

            {isOpen && results.length > 0 && (
                <ul className="absolute z-10 w-full outline mt-1 max-h-60 overflow-y-auto">
                    {results.map((item: Tag) => (
                        <li key={item.id} 
                        onClick={() => {
                            skipSearch.current = true;
                            setTag(item.name);
                            setOpen(false);
                        }}
                        className="cursor-pointer bg-[#666] hover:bg-[#777] p-2">
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default TagsComboBox;