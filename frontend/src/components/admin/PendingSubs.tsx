import { useEffect, useState } from "react";
import type { GalleryItem } from "../gallery/Gallery";
import { CheckIcon, XIcon } from "lucide-react";

function PendingSubs() {
    const [subs, setSubs] = useState<GalleryItem[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);

    const fetchSubmissions = async () => {
        const res = await fetch ('http://localhost:8000/api/admin/pending');
        const data = await res.json();
        setSubs(data.items as GalleryItem[]);
    }

    const approveHandler = async (id: number) => {
        const res = await fetch(`http://localhost:8000/api/admin/pending/${id}/approve`, {
            method: 'PATCH'
        });
        if (res) {
            fetchSubmissions();
        }
    }

    const rejectHandler = async (id: number) => {
        const res = await fetch(`http://localhost:8000/api/admin/pending/${id}/reject`, {
            method: 'PATCH'
        });
        if (res) {
            fetchSubmissions();
        }
    }

    useEffect(() => {
        const fetchSubmissions = async () => {
            const res = await fetch('http://localhost:8000/api/admin/pending');
            const data = await res.json();
            setSubs(data.items as GalleryItem[]);
            setTimeout(() => setLoading(false), 100);
        }
        fetchSubmissions();
    }, [])

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
                        <p>{sub.title}</p>
                        <p>{sub.author}</p>
                        <div className="flex gap-2 items-center">
                            <button className="btn btn-soft btn-approve" onClick={() => approveHandler(sub.id)}><CheckIcon size={20} /></button>
                            <button className="btn btn-soft btn-error" onClick={() => rejectHandler(sub.id)}><XIcon size={20} /></button>
                        </div>
                    </div>
                ))}
                {subs.length === 0 && !isLoading && (
                    <p className="text-center border border-[#ffffff90] px-5 py-2 text-lg">Caught up on pending submissions.</p>
                )}
            </div>
        </div>
    )
}

export default PendingSubs;