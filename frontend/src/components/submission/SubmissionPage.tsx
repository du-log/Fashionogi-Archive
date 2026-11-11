import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import UserNameplate from "../user/UserNameplate";
import { SUBS_URL } from "../../utilities/MiscUtility";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type EquipmentDetail = {
    name: string,
    slot: string,
    dyeable: boolean,
    partA: string,
    partB: string,
    partC: string,
    partD: string,
    partE: string,
    partF: string
}

type SubmissionDetail = {
    id: number,
    title: string,
    description: string,
    author: string,
    gender: string,
    race: string,
    created_at: string,
    status: string,
    tags: string[],
    images: string[],
    equipment: EquipmentDetail[],
    favorites_count: number,
    is_favorited: boolean,
}

function SubmissionPage() {
    const { id } = useParams();
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isVisible, setVisible] = useState<boolean>(false);
    const [inflateImg, setInflateImg] = useState<string | null>(null);
    const [activeImg, setActiveImg] = useState<string | undefined>(submission?.images[0]);

    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    const formattedDate: string = submission ? new Date(submission.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "";

    const refetchSubmission = async () => {
        try {
            const res = await fetch(`${SUBS_URL}/id/${id}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setSubmission(data);
            } else {
                console.error("Submission not found.");
            }
        } catch (err) {
            console.error("Failed to fetch submission", err);
        }
    }

    const toggleFavorite = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${SUBS_URL}/id/${id}/favorite`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                refetchSubmission();
            }
        } catch (err) {
            console.error('Failed to toggle', err);
        }
    }

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        const fetchSubmission = async () => {
            setLoading(true);
            setVisible(false);
            try {
                const res = await fetch(`${SUBS_URL}/id/${id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setSubmission(data);
                } else {
                    console.error("Submission not found.");
                }
            } catch (err) {
                console.error("Failed to fetch submission", err);
            } finally {
                setLoading(false);
                setTimeout(() => setVisible(true), 100);
            }
        }
        if (id) fetchSubmission();
    }, [id]);

    return (
        <div className="text-mabi-text">
            {!isVisible && (
                <div className={`flex flex-col items-center justify-center min-h-[90vh] w-full transition-opacity duration-200 ease-in-out ${!isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <span>Loading...</span>
                    <span className="loading loading-ring loading-xl" />
                </div>
            )}
            {submission && (
                <div className={`flex flex-col items-start w-full min-h-[86vh] gap-5 p-5 xl:px-[20%] mx-auto transition-opacity duration-200 ease-in-out ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex justify-between w-full">
                        <button className="cursor-pointer outline outline-mabi-border py-1 px-2 rounded bg-mabi-surface-muted hover:text-mabi-green sm:text-sm xl:text-md h-fit" onClick={() => navigate('/gallery')}>{'<-'} Gallery</button>
                        <div className="flex flex-col gap-2 items-end">
                            {submission.status === 'pending' && (
                                <h4 className="p-2 bg-[#55AA00] text-[#FFF]">Pending</h4>
                            )}
                            {submission.status === 'unlisted' && (
                                <h4 className="p-2 bg-[#770000] text-[#FFF]">Unlisted</h4>
                            )}
                            {submission.status === 'rejected' && (
                                <h4 className="p-2 bg-[#111] text-[#FFF]">Rejected</h4>
                            )}
                            {submission.author === user?.username && (
                                <Link to={`/fashion/edit/${submission.id}`}><p className="outline-1 outline-mabi-border rounded text-mabi-text px-2 py-1 hover:text-mabi-gold bg-mabi-surface-muted">Edit Style</p></Link>
                            )}
                        </div>
                    </div>
                    <h1 className="sm:text-3xl xl:text-4xl bold">{submission.title}</h1>
                    <div className="flex gap-2 items-center justify-end">
                        <h2 className="text-md">Tags: </h2> 
                        {submission.tags.map((tag) => (
                            <Link key={tag} to={`/gallery?tag=${tag}`}><p className="text-md py-1 px-2 rounded bg-mabi-green w-fit h-fit">{tag}</p></Link>
                        ))}
                    </div>
                    <div className={`flex flex-col w-full gap-5 justify-center border-b-1 border-mabi-border-heavy bg-mabi-surface-muted ${submission.images.length > 1 ? 'pt-5' : 'py-5'}`}>
                        <div className="flex items-center justify-center w-full h-100 xl:h-120">
                            <img src={activeImg || submission.images[0]} alt={submission.title}
                            className="max-w-8/12 max-h-full object-contain outline-1 outline-mabi-border hover:outline-mabi-gold rounded-lg cursor-pointer"
                            onClick={() => setInflateImg(activeImg || submission.images[0])} />
                        </div>
                        {submission.images.length > 1 &&(
                            <div className={"flex justify-center flex-wrap gap-5 py-2 bg-mabi-border"}>
                                {submission.images.map((image) => {
                                    const selected = (activeImg || submission.images[0]) === image;
                                    return (
                                        <img key={image} src={`${image}`} alt={submission.title}
                                        className={`w-16 xl:w-20 h-16 xl:h-20 object-cover outline-1 outline-mabi-border hover:outline-mabi-gold rounded-lg cursor-pointer
                                        ${selected ? 'outline-mabi-gold' : 'opacity-60 hover:opacity-100 hover:outline-mabi-orange'}`}
                                        onClick={() => setActiveImg(image)} />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    {inflateImg && (
                        <dialog className="modal modal-open">
                            <div className="modal-box outline-1 w-fit max-w-[80vw] outline-mabi-border-heavy flex justify-center">
                                <img src={`${inflateImg}`} className="w-full outline-3 outline-mabi-border" />
                            </div>
                            <form method="dialog" className="modal-backdrop">
                                <button onClick={() => setInflateImg(null)}></button>
                            </form>
                        </dialog>  
                    )}
                    <div className="flex justify-between w-full py-2">
                        <div className="flex flex-col gap-2 w-[75%] xl:w-[60%]">
                            <div className="flex flex-col gap-2 w-full">
                                <h1 className="text-lg">Description</h1>
                                {submission.description && (
                                    <div className="bg-mabi-surface-muted xl:w-full sm:w-[75%] text-wrap p-2"><Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{submission.description}</Markdown></div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 w-full py-2">
                                <h2 className="text-lg font-bold">Equipment</h2>
                                <div className="flex flex-wrap gap-3">
                                    {submission.equipment.map((item) => (
                                        <div key={item.name} className="flex flex-col gap-2 py-2 px-4 outline outline-mabi-border bg-mabi-green">
                                            <h5 className="text-xs text-mabi-text-muted">{item.slot}</h5>
                                            <h4 className="text-md">{item.name}</h4>
                                            {!item.dyeable && (
                                                <h5 className="text-sm outline outline-mabi-border outline-offset-1 w-fit">Not Dyeable</h5>
                                            )}
                                            {item.dyeable && (
                                                <>
                                                    <div className="flex gap-2 text-sm">
                                                        {item.partA && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 items-center">
                                                                <p>A: {item.partA.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partA}} />
                                                            </div>
                                                        )}
                                                        {item.partB && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 items-center">
                                                                <p>B: {item.partB.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partB}} />
                                                            </div>
                                                        )}
                                                        {item.partC && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 items-center">
                                                                <p>C: {item.partC.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partC}} />
                                                                </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 text-sm">
                                                        {item.partD && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 items-center">
                                                                <p>D: {item.partD.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partD}} />
                                                            </div>
                                                        )}
                                                        {item.partE && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 items-center">
                                                                <p>E: {item.partE.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partE}} />
                                                            </div>
                                                        )}
                                                        {item.partF && (
                                                            <div className="flex gap-3 outline outline-mabi-border outline-offset-1 items-center">
                                                                <p>F: {item.partF.toUpperCase()}</p>
                                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partF}} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-10">
                            <h2 className="text-sm p-2 bg-mabi-surface-muted h-fit">Submitted: {formattedDate}</h2>
                            <div className="flex flex-col items-end gap-2 outline-1 outline-[#B59E6D] bg-mabi-surface-muted p-3">
                                <h1 className="text-lg text-start">Outfit Information</h1>
                                <div className="flex gap-2 items-center">
                                    For:
                                    <p className="bg-mabi-green text-md py-1 px-2">{submission.gender}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    Fits:
                                    <p className="bg-mabi-orange text-md py-1 px-2">{submission.race}</p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <h2 className="text-md py-1 px-2 bg-mabi-gold w-fit h-fit">Favorites: {submission.favorites_count}</h2>
                                    <button onClick={toggleFavorite}
                                    className={`btn ${user ? '' : 'btn-disabled'} ${user?.username === submission.author ? 'btn-disabled' : ''} ${submission.is_favorited ? 'btn-warning' : 'btn-success'}`}>
                                        {submission.is_favorited ? 'Unfavorite' : 'Favorite'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 p-4 outline outline-mabi-border-heavy bg-mabi-surface-muted w-75">
                                <h1 className="text-xl text-start">Outfit Creator</h1>
                                <UserNameplate username={submission.author} />
                            </div>
                        </div>
                    </div>
                </div>
            )} 
            {!submission && !isLoading && (
                <div className="flex flex-col gap-5 w-full min-h-[80vh] justify-center items-center">
                    <h1 className="text-xl">Submission not found or not available.</h1>
                    <button className="cursor-pointer outline outline-mabi-border py-1 px-2 rounded hover:text-mabi-gold sm:text-md xl:text-lg" onClick={() => navigate('/gallery')}>Back to Gallery</button>
                </div>
            )}
        </div>
    )
}

export default SubmissionPage;