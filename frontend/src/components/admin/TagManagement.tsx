import { useEffect, useState } from "react";

type tag = {
    id: number,
    name: string,
    is_active: boolean
}

function TagManagement() {
    const [tags, setTags] = useState<tag[]>([]);
    const [newTag, setNewTag] = useState<string>('');

    const fetchTags = async () => {
        const res = await fetch('http://localhost:8000/api/admin/tags');
        const data = await res.json();
        if (data) {
            setTags(data);
        }
    }

    const tagToggleHandler = async (id: number) => {
        const res = await fetch (`http://localhost:8000/api/admin/tags/${id}/toggle`, {
            method: 'PATCH'
        });
        const data = await res.json();
        if (data) {
            fetchTags();
        }
    }

    useEffect(() => {
        const fetchTags = async () => {
            const res = await fetch('http://localhost:8000/api/admin/tags');
            const data = await res.json();
            if (data) {
                setTags(data);
            }
        }
        fetchTags();
    }, [])

    return (
        <div className="flex flex-col w-full max-h-[70vh] p-2 outline-2 rounded gap-2">
            <form className="flex outline p-2 items-center justify-center gap-10">
                <p>Total Tags: {tags.length}</p>
                <input type="text" maxLength={20} value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a new tag if needed." className="outline text-lg p-2" />
                <button type="submit" className="btn">Add Tag</button>
            </form>
            <div className="w-full grid grid-cols-4 items-center place-items-center text-lg font-bold p-2">
                <p>Tag Index</p>
                <p>Tag Name</p>
                <p>Tag Status</p>
                <p>Tag Option</p>
            </div>
            <div className="flex flex-col w-full overflow-y-auto py-2 gap-1">
                {tags.map((tag, index) => (
                    <div key={tag.id} className="w-full grid grid-cols-4 items-center place-items-center border border-[#ffffff90] px-2 py-2 text-lg">
                        <p>{index + 1}.</p>
                        <p>{tag.name}</p>
                        <p>{tag.is_active ? 'Active' : 'Inactive'}</p>
                        <button className={`btn btn-soft ${tag.is_active ? 'btn-error' : 'btn-success'}`} onClick={() => tagToggleHandler(tag.id)}>{tag.is_active ? 'Deactivate' : 'Activate'}</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TagManagement;