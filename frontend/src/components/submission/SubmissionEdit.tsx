import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import TagsComboBox from "./TagsComboBox";
import type { EquipmentItem, SlotKey } from "./SubmissionUpload";
import EquipmentAccordion from "./EquipmentAccordion";
import { SUBS_URL } from "../../utilities/MiscUtility";

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

export default function SubmissionEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [gender, setGender] = useState<string>('all');
    const [race, setRace] = useState<string>('all');

    const [tags, setTags] = useState<string[]>([]);

    const [isLoading, setLoading] = useState<boolean>(true);
    const [rulesAgree, setRulesAgree] = useState<boolean>(false);
    const [inReview, setInReview] = useState<boolean>(false);

    const [r, setR] = useState<number>(0);
    const [g, setG] = useState<number>(0);
    const [b, setB] = useState<number>(0);
    const [hex, setHex] = useState<string>('');

    const defaultItem = (slot: string): EquipmentItem => ({
        slot,
        name: '',
        dyeable: true,
        partA: '',
        partB: '',
        partC: '',
        partD: '',
        partE: '',
        partF: ''
    })

    const [equipment, setEquipment] = useState<Record<SlotKey, EquipmentItem>>({
        headgear: defaultItem('headgear'),
        body: defaultItem('body'),
        gloves: defaultItem('gloves'),
        shoes: defaultItem('shoes'),
        back: defaultItem('back'),
        tail: defaultItem('tail'),
        face: defaultItem('face'),
        //mainhand: defaultItem('mainhand'),
        //offhand: defaultItem('offhand'),
        accessory1: defaultItem('accessory'),
        accessory2: defaultItem('accessory')
    })

    const [previewEquip, setPreviewEquip] = useState<EquipmentItem[]>([]);

    const equipmentChangeHandler = (slot: SlotKey, part: keyof EquipmentItem | string, value: string | boolean) => {
        setEquipment(prev => ({
            ...prev,
            [slot]: { ...prev[slot], [part]: value}
        }))
        setPreviewEquip(equipmentSanitize(equipment));
    }
    
    const equipmentSanitize = (rawEquipment: Record<SlotKey, EquipmentItem>) => {
        const cleanPayload: EquipmentItem[] = [];
        Object.values(rawEquipment).forEach(item => {
            if (item.name.trim() === '') return;
            if (!item.dyeable) {
                cleanPayload.push({ 
                    ...item,
                    partA: null,
                    partB: null,
                    partC: null,
                    partD: null,
                    partE: null,
                    partF: null 
                });
                return;
            }
            cleanPayload.push({
                ...item,
                partA: item.partA?.trim() || null,
                partB: item.partB?.trim() || null,
                partC: item.partC?.trim() || null,
                partD: item.partD?.trim() || null,
                partE: item.partE?.trim() || null,
                partF: item.partF?.trim() || null,
            })
        })
        return cleanPayload;
    }

    const tagHandlerV2 = (value: string) => {
        const newTag = value.trim();
        if (newTag && tags.length < 5 && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
    }

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    }

    const equipmentSections: { title: string, key: SlotKey }[] = [
        { title: "Headgear", key: "headgear" },
        { title: "Clothing / Armor", key: "body" },
        { title: "Gloves", key: "gloves" },
        { title: "Shoes", key: "shoes" },
        { title: "Robe / Wings / Cape", key: "back" },
        { title: "Tail", key: "tail" },
        {title: "Face", key: "face"},
        //{ title: "Mainhand", key: "mainhand" },
        //{ title: "Offhand", key: "offhand" },
        { title: "Accessory 1", key: "accessory1" },
        { title: "Accessory 2", key: "accessory2" },
    ];

    const handleUpdate = async () => {
        if (!title || !description || !equipment || !tags) return alert('One or more fields are missing or empty.');
        try {
            const formData = new FormData();
        
            formData.append('title', title);
            formData.append('description', description);
            formData.append('gender', gender);
            formData.append('race', race);
            formData.append('tags', JSON.stringify(tags));
        
            const cleanEquipment = equipmentSanitize(equipment);
            if (cleanEquipment.length === 0) {
                return alert('Please include at least one item in the equipment data.');
            }
            formData.append('equipment', JSON.stringify(cleanEquipment));
        
            const res = await fetch(`${SUBS_URL}/update/${id}`, {
                method: 'patch',
                body: formData,
                credentials: 'include'
            });
            if(res.ok) {
                alert('Update successful!');
                setTitle('');
                navigate(`/fashion/id/${id}`);
            } else {
                alert('Update failed. Please try again later.');
            }
        } catch (err) {
            console.error('Update Failed', err);
            alert('Update failed. Server may be down.');
        }
    }

    useEffect(() => {
        const getSubmission = async () => {
            const res = await fetch(`${SUBS_URL}/edit/${id}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title);
                setDescription(data.description);
                setGender(data.gender);
                setRace(data.race);
                setTags(data.tags);
                setEquipment(data.equipment);

                setTimeout(() => setLoading(false), 50);
            }
        }
        getSubmission();
    }, [id])

    return (
        <div className={`flex flex-col gap-3 w-full min-h-[86vh] sm:px-[15%] xl:px-[20%] pt-5 text-mabi-text transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <h2 className="text-3xl">Edit Style</h2>
            <div className="relative flex w-full">
                <input className="p-3 border-1 w-full text-md rounded bg-mabi-surface-muted"
                type="text"
                placeholder="Style Name... (Required)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                />
                <p className="absolute bottom-0 right-1 text-xs">{100 - title.length < 100 ? 100 - title.length : ""}</p>
            </div>
            <div className="relative flex w-full">
                <textarea className="p-3 outline w-full bg-mabi-surface-muted text-md rounded resize-none" placeholder="Description... (Required)" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} required/>
                <p className="absolute bottom-0 right-1 text-xs">{200 - description.length < 200 ? 200 - description.length : ""}</p>
            </div>
            <div className="flex w-fit gap-3 items-center text-md">
                <label htmlFor="gender" className="text-xl">Gender:</label>
                <select id="gender" className="bg-mabi-surface-muted px-1" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="all">All</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                </select>
            </div>
            <div className="flex w-fit gap-3 items-center text-md">
                <label htmlFor="race" className="text-xl">Race:</label>
                <select id="race" className="bg-mabi-surface-muted px-1" value={race} onChange={(e) => setRace(e.target.value)}>
                    <option value="all">All</option>
                    <option value="human">Human</option>
                    <option value="elf">Elf</option>
                    <option value="giant">Giant</option>
                </select>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h1 className="text-xl">Tags</h1>
                <p className="text-sm text-mabi-text-muted">At least one tag required, max 5 tags.</p>
                <TagsComboBox tags={tags} onSelect={tagHandlerV2} />
                <p className="text-sm text-mabi-text-muted">Search filters based on text entered and relative string matching. Hit space to show all tags.</p>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-2 bg-mabi-green text-sm px-3 py-1 rounded-full">
                            {tag}
                            <button onClick={() => removeTag(index)} type="button"
                            className="cursor-pointer text-white hover:text-[#ff0000] font-bold mb-1 text-lg outline-none">
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            </div>
            <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-2">
                <div className="relative flex flex-col gap-2">
                    <h2 className="text-xl">Equipment Data</h2>
                    <h5 className="text-sm text-mabi-text-muted">At least one piece of equipment must be included.</h5>
                    <h5 className="text-sm text-mabi-text-muted">Only include equipment relevant to the style.</h5>
                    <div className="flex flex-col max-h-[40vh] overflow-y-scroll gap-2 p-2 outline outline-mabi-border-heavy rounded-lg" style={{scrollbarWidth: "thin"}}>
                        {equipmentSections.map((section) => (
                            <EquipmentAccordion 
                            key={section.key}
                            title={section.title}
                            slotKey={section.key}
                            data={equipment[section.key]}
                            onChange={equipmentChangeHandler}/>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 p-2 w-fit outline outline-mabi-border-heavy bg-mabi-surface-muted rounded-lg">
                        <h2 className="text-xl">RGB to Hex Converter</h2>
                        <div className="flex gap-2">
                            <input type="number" className="bg-[#fff] text-[#000] px-1" value={r} min={0} max={255} onChange={(e) => setR(Number(e.target.value))} />
                            <input type="number" className="bg-[#fff] text-[#000] px-1" value={g} min={0} max={255} onChange={(e) => setG(Number(e.target.value))} />
                            <input type="number" className="bg-[#fff] text-[#000] px-1" value={b} min={0} max={255} onChange={(e) => setB(Number(e.target.value))} />
                        </div>
                        <input type="text" className="bg-[#fff] text-[#000] px-1 w-fit" maxLength={7} value={hex} placeholder="Hex Code..." disabled />
                        <div className="flex gap-2 justify-center">
                            <button className="btn btn-success" onClick={() => setHex(rgbToHex(r, g, b))}>Convert</button>
                            <button className="btn btn-warning" onClick={() => {
                                navigator.clipboard.writeText(hex);
                                alert('Copied to clipboard!');
                            }}>Copy</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-3">
                <button onClick={() => setInReview(true)} className={`btn btn-warning p-3 ${tags.length === 0 || previewEquip.length === 0 || title.length === 0 || description.length === 0 ? "btn-disabled" : ""}`}>Review Changes</button>
                <button onClick={() => history.back()} className="btn btn-error p-3">Cancel and Return</button>
            </div>
            {inReview && (
                <dialog className="modal modal-open">
                    <div className="modal-box flex flex-col justify-center max-w-4xl min-h-[60vh] gap-5 px-10 py-20 bg-mabi-surface-muted">
                        <h1 className="text-center text-4xl">Review Style</h1>
                        <p className="py-5 text-lg">Title: {title}</p>
                        <div className="flex flex-col">
                            <p>Description:</p>
                            <div className=""><Markdown remarkPlugins={[remarkGfm, remarkBreaks,remarkRehype]}>{description}</Markdown></div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <h2 className="text-md">Tags: </h2> 
                            {tags.map((tag) => (
                                <p key={tag} className="text-md py-1 px-2 rounded bg-mabi-green w-fit h-fit">{tag}</p>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3 w-[80%] py-2">
                            <h2 className="text-lg font-bold">Equipment</h2>
                            <div className="flex flex-wrap gap-3">
                                {Object.values(equipment).map((item) => (
                                    item.name && (
                                        <div key={item.name} className="flex flex-col gap-2 py-2 px-4 rounded outline outline-mabi-border bg-mabi-green">
                                            <h5 className="text-xs text-mabi-text-muted">{item.slot}</h5>
                                            <h4 className="text-md">{item.name}</h4>
                                            {!item.dyeable && (
                                                <h5 className="text-sm outline outline-mabi-border outline-offset-1 rounded w-fit">Not Dyeable</h5>
                                            )}
                                            {item.dyeable && (
                                                <>
                                                    <div className="flex gap-2 text-sm">
                                                        {item.partA && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 rounded items-center">
                                                                <p>A: {item.partA.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partA}} />
                                                            </div>
                                                        )}
                                                        {item.partB && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 rounded items-center">
                                                                <p>B: {item.partB.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partB}} />
                                                            </div>
                                                        )}
                                                        {item.partC && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 rounded items-center">
                                                                <p>C: {item.partC.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partC}} />
                                                                </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 text-sm">
                                                        {item.partD && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 rounded items-center">
                                                                <p>D: {item.partD.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partD}} />
                                                            </div>
                                                        )}
                                                        {item.partE && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 rounded items-center">
                                                                <p>E: {item.partE.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partE}} />
                                                            </div>
                                                        )}
                                                        {item.partF && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 rounded items-center">
                                                                <p>F: {item.partF.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partF}} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <label>I confirm that changes made to this style adhere to the guidelines under <a href="/guidelines" target="_blank" className="hover:text-[#a5f500]">Rules and Guidelines</a>.</label>
                            <input type="checkbox" checked={rulesAgree} onChange={(e) => setRulesAgree(e.target.checked)} />
                        </div>
                        <p className="font-bold">Note: Updating the style will set its status back to Pending.</p>
                        <div className="modal-action justify-center">
                            <button className={`btn btn-success ${!rulesAgree ? 'btn-disabled' : ''}`} onClick={handleUpdate}>Update Style</button>
                            <button className="btn btn-warning" onClick={() => setInReview(false)}>Edit Style</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    )
}