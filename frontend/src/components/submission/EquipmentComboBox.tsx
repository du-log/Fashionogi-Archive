import { useEffect, useRef, useState } from "react";
import type { SlotKey } from "./SubmissionUpload";

type Equipment = {
    id: number,
    name: string
}

interface ComboBoxProps {
    slot: SlotKey,
    value: string,
    onSelect: (slot: SlotKey, part: string, value: string) => void
}

function EquipmentComboBox ( {slot, value, onSelect} : ComboBoxProps ) {
    const [results, setResults] = useState([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const skipSearch = useRef<boolean>(false);

    useEffect(() => {
        if (skipSearch.current) {
            skipSearch.current = false;
            return;
        }

        const timerDebounce = setTimeout(async () => {
            if (value.length >= 3) {
                try {
                const res = await fetch(`http://localhost:8000/api/equipment?q=${value}&slot=${slot}`);
                const data = await res.json();
                setResults(data);
                setOpen(true);
                } catch (err) {
                    console.error("Search failed", err);
                }
            } else {
                setOpen(false);
            }
        }, 300);
        return () => clearTimeout(timerDebounce);
    }, [value, slot])

    return (
        <div className="relative w-full">
            <input type="text" value={value} onChange={(e) => onSelect(slot, 'name', e.target.value)} placeholder="Item name..." 
            className="w-full p-1 outline rounded bg-[#ffffff50] text-[#ffffff]" />

            {isOpen && results.length > 0 && (
                <ul className="absolute z-10 w-full outline mt-1 max-h-60 overflow-y-auto">
                    {results.map((item: Equipment) => (
                        <li key={item.id} 
                        onClick={() => {
                            skipSearch.current = true;
                            onSelect(slot, 'name', item.name);
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

export default EquipmentComboBox;