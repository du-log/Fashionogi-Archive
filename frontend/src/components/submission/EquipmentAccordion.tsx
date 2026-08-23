import { useState } from "react";
import type { EquipmentItem } from "./SubmissionUpload";
import type { SlotKey } from "./SubmissionUpload";
import EquipmentComboBox from "./EquipmentComboBox";

interface EquipmentAccordionProp {
    title: string,
    slotKey: SlotKey,
    data: EquipmentItem,
    onChange: (slot: SlotKey, part: keyof EquipmentItem | string, value: string | boolean) => void
}

function EquipmentAccordion({title, slotKey, data, onChange} : EquipmentAccordionProp) {
    const [isOpen, setOpen] = useState<boolean>(false);

    const dyeInputRender = (partLabel: string, partKey: keyof EquipmentItem) => {
        const value = (data[partKey] as string) || "";
        return (
            <div className="flex items-center gap-3 w-full">
                <label htmlFor="hex" className="text-sm">{partLabel}</label>
                <input id="hex" type="text" maxLength={7} placeholder="Ex: #FFFFFF" value={value} onChange={(e) => onChange(slotKey, partKey, e.target.value)} disabled={!data.dyeable}
                className="w-full p-1 bg-[#ffffff30] rounded-sm text-sm text-[#ffffff] uppercase disabled:opacity-50" />
                <div className="w-4 h-4 rounded-full outline outline-[#ffffff] flex-shrink-0 transition-colors"
                style={{backgroundColor: value.length === 7 ? value : 'transparent'}} />
            </div>
        )
    }

    return (
        <div className="relative w-full border rounded-lg bg-[#00300030]">
            <button onClick={() => setOpen(!isOpen)} className={`p-2 w-full flex justify-between items-center font-bold text-lg text-left cursor-pointer bg-[#00500030] rounded-t-lg ${isOpen ? "" : "rounded-b-lg"}`}>
                {title}
                <span>{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
                <div className="flex flex-col gap-3 mt-2 p-2">
                    <EquipmentComboBox slot={slotKey} value={data.name} onSelect={onChange} />
                    <div className="flex items-center gap-3 w-fit">
                        <label htmlFor="check" className="text-md">Is Dyeable</label>
                        <input id="check" type="checkbox" checked={data.dyeable} className="w-4 h-4 cursor-pointer"
                        onChange={(e) => onChange(slotKey, 'dyeable', e.target.checked)} />
                    </div>
                    {data.dyeable && (
                        <div className="flex flex-col gap-3">
                            <h5 className="text-xs text-[#51515190]">Fill only relevant parts:</h5>
                            <div className="flex gap-3">
                                {dyeInputRender("Part A", "partA")}
                                {dyeInputRender("Part B", "partB")}
                                {dyeInputRender("Part C", "partC")}
                            </div>
                            <div className="flex w-full gap-3">
                                {dyeInputRender("Part D", "partD")}
                                {dyeInputRender("Part E", "partE")}
                                {dyeInputRender("Part F", "partF")}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default EquipmentAccordion;