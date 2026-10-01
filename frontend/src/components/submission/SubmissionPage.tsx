import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import UserNameplate from "../user/UserNameplate";
import { BASE_URL, SUBS_URL } from "../../utilities/MiscUtility";
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

    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    const formattedDate: string = submission ? new Date(submission.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "";

    const fetchSubmission = async () => {
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
                fetchSubmission();
            }
        } catch (err) {
            console.error('Failed to toggle', err);
        }
    }

    useEffect(() => {
        const fetchSubmission = async () => {
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
                document.documentElement.scrollTop = 0;
                setLoading(false);
                setTimeout(() => setVisible(true), 200);
            }
        }
        if (id) fetchSubmission();
    }, [id]);

    return (
        <div>
            {!isVisible && (
                <div className={`flex flex-col items-center justify-center min-h-[90vh] w-full transition-opacity duration-200 ease-in-out ${!isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <span className="text-[#ffffff90]">Loading...</span>
                    <span className="loading loading-ring loading-xl" />
                </div>
            )}
            {submission && (
                <div className={`flex flex-col items-start w-full min-h-[86vh] gap-5 p-5 xl:px-[20%] mx-auto transition-opacity duration-200 ease-in-out ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex justify-between w-full">
                        <button className="cursor-pointer outline outline-[#aaff0050] py-1 px-2 rounded text-[#ffffff90] hover:text-[#aaff0090] sm:text-sm xl:text-md" onClick={() => navigate('/gallery')}>{'<-'} Gallery</button>
                        {submission.status === 'pending' && (
                            <h4 className="p-2 rounded-lg bg-[#55aa00] text-[#ffffff]">Pending</h4>
                        )}
                        {submission.status === 'flagged_for_deletion' && (
                            <h4 className="p-2 rounded-lg bg-[#770000] text-[#ffffff]">Flagged for Deletion</h4>
                        )}
                        {submission.status === 'rejected' && (
                            <h4 className="p-2 rounded-lg bg-[#111111] text-[#ffffff]">Rejected</h4>
                        )}
                    </div>
                    <h1 className="sm:text-3xl xl:text-4xl bold">{submission.title}</h1>
                    <div className="flex gap-2 items-center justify-end">
                        <h2 className="text-md">Tags: </h2> 
                        {submission.tags.map((tag) => (
                            <Link key={tag} to={`/gallery?tag=${tag}`}><p className="text-md py-1 px-2 rounded bg-[#009090] w-fit h-fit">{tag}</p></Link>
                        ))}
                    </div>
                    <div className="flex w-full gap-3 py-5 justify-center border-b border-[#ffffff90] bg-[#41414130]">
                        {submission.images.map((image) => (
                            <img key={image} src={`${BASE_URL}${image}`} alt={submission.title} className="aspect-[9/16] w-[15%] outline outline-[#ffffff90] rounded-lg cursor-pointer" onClick={() => setInflateImg(image)} />
                        ))}
                    </div>
                    {inflateImg && (
                        <dialog className="modal modal-open">
                            <div className="modal-box">
                                <img src={`${BASE_URL}${inflateImg}`} className="aspect-[9/16] place-self-center" />
                            </div>
                            <form method="dialog" className="modal-backdrop">
                                <button onClick={() => setInflateImg(null)}></button>
                            </form>
                        </dialog>  
                    )}
                    <div className="flex justify-between w-full py-2">
                        <div className="flex flex-col gap-2 w-[75%] xl:w-[50%]">
                            <h1 className="text-lg">Description</h1>
                            {submission.description && (
                                <div className="bg-[#40404090]  xl:w-full sm:w-[75%] text-wrap p-1"><Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{submission.description}</Markdown></div>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-10">
                            <h2 className="text-sm p-2 rounded bg-[#90909030] h-fit">Submitted: {formattedDate}</h2>
                            <div className="flex flex-col items-end gap-2 outline-1 outline-[#B59E6D] bg-[#3E4540] rounded-md p-3">
                                <h1 className="text-lg text-start">Outfit Information</h1>
                                <div className="flex gap-2 items-center">
                                    For:
                                    <p className="rounded bg-[#008000] text-[#ffffff] text-md py-1 px-2">{submission.gender}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    Fits:
                                    <p className="rounded bg-[#008000] text-[#ffffff] text-md py-1 px-2">{submission.race}</p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <h2 className="text-md py-1 px-2 rounded bg-[#550000] w-fit h-fit">Favorites: {submission.favorites_count}</h2>
                                    <button onClick={toggleFavorite}
                                    className={`btn ${user ? '' : 'btn-disabled'} ${user?.username === submission.author ? 'btn-disabled' : ''} ${submission.is_favorited ? 'btn-warning' : 'btn-success'}`}>
                                        {submission.is_favorited ? 'Unfavorite' : 'Favorite'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 p-4 outline outline-[#B59E6D] rounded bg-[#3E4540]">
                                <h1 className="text-xl text-start">Outfit Creator</h1>
                            <UserNameplate username={submission.author} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 w-[75%] py-2">
                        <h2 className="text-lg font-bold">Equipment</h2>
                        <div className="flex flex-wrap gap-3">
                            {submission.equipment.map((item) => (
                                <div key={item.name} className="flex flex-col gap-2 py-2 px-4 rounded outline outline-[#ffffff30] bg-[#91009120]">
                                    <h5 className="text-xs text-[#ffffff30]">{item.slot}</h5>
                                    <h4 className="text-md">{item.name}</h4>
                                    {!item.dyeable && (
                                        <h5 className="text-sm text-[#fff] outline outline-[#ffffff30] outline-offset-1 rounded w-fit">Not Dyeable</h5>
                                    )}
                                    {item.dyeable && (
                                        <>
                                            <div className="flex gap-2 text-sm">
                                                {item.partA && (
                                                    <div className="flex gap-3 outline outline-[#ffffff30] outline-offset-1 rounded items-center">
                                                        <p>A: {item.partA.toUpperCase()}</p>
                                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partA}} />
                                                    </div>
                                                )}
                                                {item.partB && (
                                                    <div className="flex gap-3 outline outline-[#ffffff30] outline-offset-1 rounded items-center">
                                                        <p>B: {item.partB.toUpperCase()}</p>
                                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partB}} />
                                                    </div>
                                                )}
                                                {item.partC && (
                                                    <div className="flex gap-3 outline outline-[#ffffff30] outline-offset-1 rounded items-center">
                                                        <p>C: {item.partC.toUpperCase()}</p>
                                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partC}} />
                                                        </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 text-sm">
                                                {item.partD && (
                                                    <div className="flex gap-3 outline outline-[#ffffff30] outline-offset-1 rounded items-center">
                                                        <p>D: {item.partD.toUpperCase()}</p>
                                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partD}} />
                                                    </div>
                                                )}
                                                {item.partE && (
                                                    <div className="flex gap-3 outline outline-[#ffffff30] outline-offset-1 rounded items-center">
                                                        <p>E: {item.partE.toUpperCase()}</p>
                                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partE}} />
                                                    </div>
                                                )}
                                                {item.partF && (
                                                    <div className="flex gap-3 outline outline-[#ffffff30] outline-offset-1 rounded items-center">
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
            )} 
            {!submission && !isLoading && (
                <div className="flex flex-col gap-5 w-full min-h-[80vh] justify-center items-center">
                    <h1 className="text-xl">Submission not found or not available.</h1>
                    <button className="cursor-pointer outline outline-[#aaff0050] py-1 px-2 rounded text-[#ffffff90] hover:text-[#aaff0090] sm:text-md xl:text-lg" onClick={() => navigate('/gallery')}>Back to Gallery</button>
                </div>
            )}
        </div>
    )
}

export default SubmissionPage;