import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from '../../utilities/CropUtility';
import PreviewCard from "./PreviewCard";
import { calculateDefaultCrop } from "../../utilities/CropUtility";
import EquipmentAccordion from "./EquipmentAccordion";
import { AuthContext } from "../../contexts/AuthContext";
import TagsComboBox from "./TagsComboBox";
import { SUBS_URL } from "../../utilities/MiscUtility";

interface UploadImageItem {
    id: number,
    file: File,
    rawUrl: string,
    crop: { x: number, y: number },
    zoom: number,
    croppedAreaPixels: cropDimen | null,
    croppedBlob: Blob | null,
    previewUrl: string
}

export interface EquipmentItem {
    slot: string,
    name: string,
    dyeable: boolean,
    partA: string | null,
    partB: string | null,
    partC: string | null,
    partD: string | null,
    partE: string | null,
    partF: string | null
}

export type SlotKey = 'headgear' | 'body' | 'gloves' | 'shoes' | 'back' | 'tail' | 'face' | 'accessory1' | 'accessory2';

type cropDimen = {
    x: number,
    y: number,
    width: number,
    height: number
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function SubmissionUpload() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading = auth?.isLoading ?? true;

    const [isLoading, setLoading] = useState<boolean>(true);

    const [inflateImg, setInflateImg] = useState<string | null>(null);

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [gender, setGender] = useState<string>('all');
    const [race, setRace] = useState<string>('all');

    const [tags, setTags] = useState<string[]>([]);

    const [images, setImages] = useState<UploadImageItem[]>([]);
    const [activeCropIndex, setActiveCropIndex] = useState<number>(0);

    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<cropDimen | unknown | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

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

    const equipmentChangeHandler = (slot: SlotKey, part: keyof EquipmentItem | string, value: string | boolean) => {
        setEquipment(prev => ({
            ...prev,
            [slot]: { ...prev[slot], [part]: value}
        }))
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

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files.length > 0 && e.target.files.length <= 5) {
            const imgArr: UploadImageItem[] = new Array(e.target.files.length);
            try {
                for (let index = 0; index < e.target.files.length; index++) {
                    const file = e.target.files[index];
                    const imageDataUrl = URL.createObjectURL(file);
                    const defaultPixels = await calculateDefaultCrop(imageDataUrl, 9/16) as cropDimen;
                    const autoCroppedFile = await getCroppedImg( {imageSrc: imageDataUrl, pixelCrop: defaultPixels} ) as Blob;
                    const previewUrl = URL.createObjectURL(autoCroppedFile);
                    const image: UploadImageItem = {
                        id: index,
                        file: file,
                        rawUrl: imageDataUrl,
                        crop: {x: 0, y: 0},
                        zoom: 1,
                        croppedAreaPixels: defaultPixels,
                        croppedBlob: autoCroppedFile,
                        previewUrl: previewUrl
                    };
                    imgArr[index] = image;
                }
            } catch (err) {
                console.error("Process failed", err);
            }
            setImages(imgArr);
        } else if (e.target.files && e.target.files.length > 5) {
            alert("Please only select up to 5 images");
        }
    }

    const onCropComplete = useCallback((_:cropDimen, croppedAreaPixels: cropDimen) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        try {
            if (!croppedAreaPixels) return;

            const currentImg = images[activeCropIndex];
            const pixelCrop = croppedAreaPixels as cropDimen;
            const croppedFile = await getCroppedImg( {imageSrc: currentImg.rawUrl, pixelCrop: pixelCrop} ) as Blob;
            const newPrevUrl = URL.createObjectURL(croppedFile);

            setImages(prev => {
                const newArr = [...prev];
                newArr[activeCropIndex] = {
                    ...currentImg,
                    crop: crop,
                    zoom: zoom,
                    croppedAreaPixels: pixelCrop,
                    croppedBlob: croppedFile,
                    previewUrl: newPrevUrl
                };
                return newArr;
            });
        } catch (err) {
            console.error('Failed to crop image', err);
        }
    }

    const handleThumbnailClick = async (newIndex: number) => {
        if (newIndex === activeCropIndex) return;

        const currentImg = images[activeCropIndex];
        if (croppedAreaPixels) {
            const pixelCrop = croppedAreaPixels as cropDimen;
            const croppedFile = await getCroppedImg({imageSrc: currentImg.rawUrl, pixelCrop: pixelCrop }) as Blob;
            const newPrevUrl = URL.createObjectURL(croppedFile);

            setImages(prev => {
                const newArr = [...prev];
                newArr[activeCropIndex] = {
                    ...currentImg,
                    crop: crop,
                    zoom: zoom,
                    croppedAreaPixels: pixelCrop,
                    croppedBlob: croppedFile,
                    previewUrl: newPrevUrl
                };
                return newArr;
            });
        }

        const nextImg = images[newIndex];
        setCrop(nextImg.crop);
        setZoom(nextImg.zoom);
        setCroppedAreaPixels(nextImg.croppedAreaPixels);
        setActiveCropIndex(newIndex);
    }

    const handleDisplayOrder = (currentIndex: number, targetIndex: number) => {
        if (currentIndex === targetIndex) return;

        setImages(prev => {
            const newArr = [...prev];
            const [movedItem] = newArr.splice(currentIndex, 1);
            newArr.splice(targetIndex, 0, movedItem);
            return newArr;
        });
    }
    
    const handleUpload = async () => {
        if (images.length < 1 || !title || !description || !equipment || !tags) return alert('One or more fields are missing or empty.');

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

            images.forEach((img, index) => {
                if (img.croppedBlob) {
                    formData.append('files', img.croppedBlob, `image_${index}.webp`);
                }
            });

            const res = await fetch(`${SUBS_URL}`, {
                method: 'post',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if(res.ok) {
                alert('Upload successful!');
                setTitle('');
                navigate(`/fashion/id/${data.submission_id}`);
            } else {
                alert(data.detail || 'You have reached the limit for uploads within 24 hours. Please try again later.');
            }
        } catch (err) {
            console.error('Upload Failed', err);
            alert('Upload failed. Server may be down.');
        }
    }

    const resetParams = async () => {
        setImages([]);
        setCroppedAreaPixels(null);
        setTitle('');
        setDescription('');
        setZoom(1);
        setCrop({x: 1, y: 1});

        setTags([]);

        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setEquipment({
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
        });
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

    useEffect(() => {
        if (!user && !userLoading) navigate('/');

        document.documentElement.scrollTop = 0;
        setTimeout(() => {setLoading(false)}, 50);
    }, [user, userLoading, navigate])

    return (
        <div className={`flex flex-col gap-3 w-full min-h-[86vh] sm:px-[15%] xl:px-[20%] pt-5 transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <h2 className="text-3xl">Submit a Style</h2>
            <div className="relative flex w-full">
                <input className="p-3 border-1 w-full text-md rounded"
                type="text"
                placeholder="Style Name... (Required)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                />
                <p className="absolute bottom-0 right-1 text-[#ffffff90] text-xs">{100 - title.length < 100 ? 100 - title.length : ""}</p>
            </div>
            <div className="relative flex w-full">
                <textarea className="p-3 outline w-full text-md rounded resize-none" placeholder="Description... (Required)" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} required/>
                <p className="absolute bottom-0 right-1 text-[#ffffff90] text-xs">{200 - description.length < 200 ? 200 - description.length : ""}</p>
            </div>
            <div className="flex w-fit gap-3 items-center text-md">
                <label htmlFor="gender" className="text-xl">Gender:</label>
                <select id="gender" className="bg-[#ffffff] text-[#000000] px-1" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="all">All</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                </select>
            </div>
            <div className="flex w-fit gap-3 items-center text-md">
                <label htmlFor="race" className="text-xl">Race:</label>
                <select id="race" className="bg-[#ffffff] text-[#000000] px-1" value={race} onChange={(e) => setRace(e.target.value)}>
                    <option value="all">All</option>
                    <option value="human">Human</option>
                    <option value="elf">Elf</option>
                    <option value="giant">Giant</option>
                </select>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <h1 className="text-xl">Tags</h1>
                <p className="text-sm text-[#990000]">At least one tag required.</p>
                <TagsComboBox tags={tags} onSelect={tagHandlerV2} />
                <p className="text-sm text-[#ffffff90]">Search filters based on text entered. Hit space to show all tags.</p>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-2 bg-[#008000] text-white text-sm px-3 py-1 rounded-full">
                            {tag}
                            <button onClick={() => removeTag(index)} type="button"
                            className="cursor-pointer text-white hover:text-[#ff0000] font-bold mb-1 text-lg outline-none">
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {inflateImg && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <img src={`${inflateImg}`} className="aspect-[9/16] place-self-center" />
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setInflateImg(null)}></button>
                    </form>
                </dialog>  
            )}

            {images[activeCropIndex] && (
                <dialog id='crop_modal' className="modal backdrop-blur-sm py-2">
                    <div className="modal-box max-w-full">
                        <div className="h-[60vh] w-full">
                            <Cropper image={images[activeCropIndex].rawUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={9 / 16}
                            zoomSpeed={0.1}
                            restrictPosition={true}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom} />
                        </div>
                    </div>
                    <div className="zoom-slider z-10">
                        <span>Zoom: {zoom.toPrecision(3)}</span>
                        <input className="w-full"
                        type="range"
                        value={zoom}
                        min={1} max={3} step={0.05}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        />
                    </div>
                    <div className="Thumbnails flex justify-center w-full gap-4">
                        {images.map((image, index) => (
                            <img key={index} src={image.previewUrl}
                            className={`aspect-[9/16] w-[7%] ${activeCropIndex === index ? "outline-2 outline-[#ffff00]" : ""}`}
                            onClick={() => handleThumbnailClick(index)} />
                        ))}
                    </div>
                    <form method="dialog">
                        <button className="btn btn-success btn-lg" onClick={handleCrop}>Apply All</button>
                    </form>
                </dialog>
            )}
            <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-2">
                <div className="image-card-section flex flex-col gap-2">
                    <h2 className="text-xl">Images</h2>
                    <input type="file" accept="image/*" multiple max={5} onChange={onFileChange} ref={fileInputRef} className="bg-[#666666] cursor-pointer p-3 rounded-lg w-fit" />
                    <h5 className="text-sm text-[#ffffff90]">Please select at most 5 images.</h5>
                    <div className="CropAndModal flex flex-col gap-3">
                        {images[activeCropIndex] && (
                            <div className="flex flex-col gap-3">
                            <button className="btn w-fit" onClick={() => {
                                const dlg = document.getElementById('crop_modal') as HTMLDialogElement | null;
                                if (dlg) dlg.showModal();
                            }}>Adjust Crop</button>
                            </div>
                        )}
                    </div>
                    <div className="py-5">
                        {images.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <h3>Gallery Card Preview</h3>
                                <PreviewCard images={images} styleName={title} username={user?.username} />
                            </div>
                        )}
                        {images.length < 1 && (
                            <div className="flex flex-col gap-3">
                                <h3 className="text-md">Gallery Card Preview</h3>
                                <PreviewCard images={[]} styleName={title} username={user?.username} />
                            </div>
                        )}
                    </div>
                    <div className="py-2 flex gap-3 flex-wrap">
                        {images.map((image, index) => (
                            <div key={image.id} className="relative group aspect-[9/16] w-24 rounded-lg overflow-hidden outline">
                                <img src={image.previewUrl} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                {index === 0 && <span className="absolute top-1 left-1 text-xs bg-[#00000090] rounded p-1">1st</span>}
                                {index === 1 && <span className="absolute top-1 left-1 text-xs bg-[#00000090] rounded p-1">2nd</span>}
                                <div className="absolute inset-0 bg-[#00000070] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 justify-center items-center">
                                    {index !== 0 && (
                                        <button onClick={() => handleDisplayOrder(index, 0)} className="btn btn-xs text-10 w-3/4">Make 1st</button>
                                    )}
                                    {index !== 1 && images.length > 1 && (
                                        <button onClick={() => handleDisplayOrder(index, 1)} className="btn btn-xs text-10 w-3/4">Make 2nd</button>
                                    )}
                                    <button onClick={() => setInflateImg(image.previewUrl)} className="btn btn-xs text-10 w-3/4">Preview</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative flex flex-col gap-2">
                    <h2 className="text-xl">Equipment Data</h2>
                    <div className="flex flex-col max-h-[40vh] overflow-y-scroll gap-2 p-2 outline outline-[#ffffff50] rounded-lg" style={{scrollbarWidth: "thin"}}>
                        {equipmentSections.map((section) => (
                            <EquipmentAccordion 
                            key={section.key}
                            title={section.title}
                            slotKey={section.key}
                            data={equipment[section.key]}
                            onChange={equipmentChangeHandler}/>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 p-2 w-fit outline outline-[#ffffff90] rounded-lg">
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
                <button onClick={handleUpload} className={`btn btn-soft btn-success p-3 ${images.length === 0 ? "btn-disabled" : ""}`}>Submit</button>
                <button onClick={() => {resetParams(); document.documentElement.scrollTop = 0}} className="btn btn-soft btn-error p-3">Reset</button>
            </div>
        </div>
    )
}

export default SubmissionUpload;