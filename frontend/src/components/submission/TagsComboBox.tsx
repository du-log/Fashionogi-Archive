import { useEffect, useRef, useState } from "react";

type Tag = {
    id: number,
    name: string
}

interface ComboBoxProps {
    tags: string[],
    onSelect: (value: string) => void
}

function TagsComboBox ( {tags, onSelect} :  ComboBoxProps) {
    const [results, setResults] = useState([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const skipSearch = useRef<boolean>(false);
    const [value, setValue] = useState<string>('');

    useEffect(() => {
        if (skipSearch.current) {
            skipSearch.current = false;
            return;
        }

        const timerDebounce = setTimeout(async () => {
            if (value.length >= 0) {
                try {
                const res = await fetch(`http://localhost:8000/api/misc/tags?q=${value}`);
                const data = await res.json();
                setResults(data);
                if(value.length > 0) {
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
    }, [value, tags, isOpen])

    return (
        <div className="relative w-full">
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search..." 
            className="w-full p-1 outline rounded bg-[#ffffff50] text-[#ffffff]" />

            {isOpen && results.length > 0 && (
                <ul className="absolute z-10 w-full outline mt-1 max-h-60 overflow-y-auto">
                    {results.map((item: Tag) => (
                        <li key={item.id} 
                        onClick={() => {
                            skipSearch.current = true;
                            onSelect(item.name);
                            setOpen(false);
                            setValue('');
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