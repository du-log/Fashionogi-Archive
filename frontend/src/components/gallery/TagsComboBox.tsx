import { useEffect, useRef, useState } from "react";

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

    useEffect(() => {
        if (skipSearch.current) {
            skipSearch.current = false;
            return;
        }

        const timerDebounce = setTimeout(async () => {
            if (tag.length >= 0) {
                try {
                const res = await fetch(`http://localhost:8000/api/misc/tags?q=${tag}`);
                const data = await res.json();
                setResults(data);
                if(tag.length > 0) {
                    setOpen(true);
                } else {
                    setOpen(false);
                }
                } catch (err) {
                    console.error("Search failed", err);
                }
            }
        }, 0);
        return () => clearTimeout(timerDebounce);
    }, [tag, isOpen])

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