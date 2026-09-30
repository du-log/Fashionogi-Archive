import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

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

type Submission = {
    id: number,
    title: string,
    author: string,
    description: string,
    gender: string,
    race: string,
    images: string[],
    equipment: EquipmentDetail[]
}

function PendingSubs() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const [subs, setSubs] = useState<Submission[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

    const fetchSubmissions = async () => {
        const res = await fetch ('http://localhost:8000/api/admin/pending', {
            credentials: 'include'
        });
        const data = await res.json();
        setSubs(data.items as Submission[]);
    }

    const approveHandler = async (id: number) => {
        const res = await fetch(`http://localhost:8000/api/admin/pending/${id}/approve`, {
            method: 'PATCH',
            credentials: 'include'
        });
        if (res) {
            fetchSubmissions();
            setSelectedSub(null);
        }
    }

    const rejectHandler = async (id: number) => {
        const res = await fetch(`http://localhost:8000/api/admin/pending/${id}/reject`, {
            method: 'PATCH',
            credentials: 'include'
        });
        if (res) {
            fetchSubmissions();
            setSelectedSub(null);
        }
    }

    useEffect(() => {
        if (!user || !user.is_admin) return;
        const fetchSubmissions = async () => {
            const res = await fetch('http://localhost:8000/api/admin/pending', {
                credentials: 'include'
            });
            const data = await res.json();
            setSubs(data.items as Submission[]);
            setTimeout(() => setLoading(false), 100);
        }
        fetchSubmissions();
    }, [user])

    return (
        <div className="flex flex-col w-full max-h-[70vh] p-2 outline-2 rounded gap-2">
            <p className="text-center outline p-2">Pending Submissions: {subs.length}</p>
            <div className="grid grid-cols-4 items-center place-items-center text-lg font-bold p-2">
                <p>Index</p>
                <p>Title</p>
                <p>Author</p>
                <p>Options</p>
            </div>
            <div className="flex flex-col w-full overflow-y-auto py-2 gap-1">
                {subs.map((sub) => (
                    <div key={sub.id} className="grid grid-cols-4 w-full items-center place-items-center border border-[#ffffff90] px-2 py-2 text-lg">
                        <p>ID: {sub.id}</p>
                        <p className="cursor-pointer hover:text-[#00dab8]" onClick={() => setSelectedSub(sub)}>{sub.title}</p>
                        <p>{sub.author}</p>
                        <div className="flex gap-2 items-center">
                            <button className="btn btn-success" onClick={() => approveHandler(sub.id)}>Approve</button>
                            <button className="btn btn-error" onClick={() => rejectHandler(sub.id)}>Reject</button>
                        </div>
                    </div>
                ))}
                {subs.length === 0 && !isLoading && (
                    <p className="text-center border border-[#ffffff90] px-5 py-2 text-lg">Caught up on pending submissions.</p>
                )}
            </div>
            {selectedSub && (
                <dialog className="modal modal-open">
                    <div className="modal-box w-11/12 h-11/12 max-w-5xl">
                        <div className="flex flex-col gap-5 items-center w-full">
                            <h1 className="font-bold text-3xl">Review Submission Details</h1>
                            <h1 className="font-bold text-xl">Title: {selectedSub.title}</h1>
                            <p>Creator: {selectedSub.author}</p>
                            <p>For: {selectedSub.gender}</p>
                            <p>Fits: {selectedSub.race}</p>
                            <div className="flex flex-wrap w-full gap-3 py-5 justify-center">
                                {selectedSub.images.map((image) => (
                                    <img key={image} src={`http://localhost:8000${image}`} alt={selectedSub.title} className="aspect-[9/16] w-[25%] outline outline-[#ffffff90] rounded-lg" />
                                ))}
                            </div>
                            <div className="flex flex-col gap-2 w-[75%] xl:w-[50%]">
                                <h1 className="text-lg">Description</h1>
                                {selectedSub.description && (
                                    <div className="bg-[#40404090]  w-full text-wrap">{selectedSub.description}</div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {selectedSub.equipment.map((item) => (
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
                        <div className="modal-action justify-center">
                            <button className="btn btn-success" onClick={() => approveHandler(selectedSub.id)}>Approve</button>
                            <button className="btn btn-error" onClick={() => rejectHandler(selectedSub.id)}>Reject</button>
                            <button className="btn btn-warning" onClick={() => setSelectedSub(null)}>Close</button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setSelectedSub(null)}></button>
                    </form>
                </dialog>
            )}
        </div>
    )
}

export default PendingSubs;