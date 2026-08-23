import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
    created_at: string,
    status: string,
    tags: string[],
    images: string[],
    equipment: EquipmentDetail[]
}

function SubmissionPage() {
    const { id } = useParams();
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isVisible, setVisible] = useState<boolean>(false);

    const formattedDate: string = submission ? new Date(submission.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "";

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const res = await fetch(`http://localhost:8000/submission/id/${id}`);
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
                setTimeout(() => setVisible(true), 200);
            }
        }
        if (id) fetchSubmission();
    }, [id]);

    return (
        <div>
            {!isVisible && (
                <div className={`flex flex-col items-center justify-center min-h-[70vh] w-full transition-opacity duration-200 ease-in-out ${!isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <span className="text-[#ffffff90]">Loading...</span>
                    <span className="loading loading-ring loading-xl" />
                </div>
            )}
            {submission && (
                <div className={`flex flex-col items-start w-full min-h-[80vh] gap-5 p-5 xl:px-[20%] mx-auto transition-opacity duration-200 ease-in-out ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex justify-between w-full">
                        <button className="cursor-pointer outline outline-[#aaff0050] py-1 px-2 rounded text-[#ffffff90] hover:text-[#aaff0090] sm:text-sm xl:text-md" onClick={() => history.back()}>{'<-'} Back</button>
                        {submission.status === 'pending' && (
                            <h4 className="p-2 rounded-lg bg-[#aaff00] text-[#ffffff]">Pending</h4>
                        )}
                    </div>
                    <h1 className="sm:text-3xl xl:text-4xl bold">{submission.title}</h1>
                    <div className="flex w-full gap-3 py-5 justify-center border-b border-[#ffffff90] bg-[#41414130]">
                        {submission.images.map((image) => (
                            <img key={image} src={`http://localhost:8000${image}`} alt={submission.title} className="aspect-[9/16] sm:w-[15%] xl:w-[20%] outline outline-[#ffffff90] rounded-lg shadow-lg hover:scale-105" />
                        ))}
                    </div>
                    <div className="flex justify-between w-full py-2">
                        <div className="flex flex-col gap-2">
                            {submission.description && (
                                <div className="w-full text-wrap">Description: {submission.description}</div>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <h2 className="text-sm p-2 rounded bg-[#90909030] h-fit">Submitted: {formattedDate}</h2>
                            <div className="flex gap-2 items-center">
                                for:
                                <p className="rounded bg-[#008000] text-[#ffffff] text-sm py-1 px-2">{submission.gender}</p>
                            </div>
                            <div className="flex gap-2 items-center rounded">
                                <h2 className="text-md">Tags: </h2> 
                                {submission.tags.map((tag) => (
                                    <p key={tag} className="text-sm py-1 px-2 rounded bg-[#009090] w-fit h-fit">{tag}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 w-[75%] py-2">
                        <h2 className="text-lg font-bold">Equipment</h2>
                        <div className="flex flex-wrap gap-3">
                            {submission.equipment.map((item) => (
                                <div key={item.name} className="flex flex-col gap-1 py-2 px-4 rounded outline outline-[#ffffff30] bg-[#91009120]">
                                    <h5 className="text-xs text-[#ffffff30]">{item.slot}</h5>
                                    <h4 className="text-md">{item.name}</h4>
                                    <div className="flex gap-1 text-sm">
                                        {item.partA && (<div className="flex gap-1 text-md">A: {item.partA} <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partA}} /></div>)}
                                        {item.partB && (<div className="flex gap-1 text-md">B: {item.partB} <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partB}} /></div>)}
                                        {item.partC && (<div className="flex gap-1 text-md">C: {item.partC} <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partC}} /></div>)}
                                    </div>
                                    <div className="flex gap-1 text-sm">
                                        {item.partD && (<div className="flex gap-1 text-md">D: {item.partD} <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partD}} /></div>)}
                                        {item.partE && (<div className="flex gap-1 text-md">E: {item.partE} <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partE}} /></div>)}
                                        {item.partF && (<div className="flex gap-1 text-md">F: {item.partF} <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.partF}} /></div>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )} 
            {!submission && !isLoading && (
                <div className="flex w-full min-h-[80vh] justify-center items-center">
                    <h1 className="text-xl">Submission not found.</h1>
                </div>
            )}
        </div>
    )
}

export default SubmissionPage;