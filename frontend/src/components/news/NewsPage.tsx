import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import NewsCard from "./NewsCard";
import { NEWS_URL } from "../../utilities/MiscUtility";

export type Article = {
    id: number,
    title: string,
    description: string,
    type: string,
    context: string,
    created_at: string,
    author: string
}

function NewsPage() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [type, setType] = useState<string>('News');
    const [context, setContext] = useState<string>('');

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [pageLoading, setLoading] = useState<boolean>(true);

    const [articles, setArticles] = useState<Article[]>([]);

    const newArticleHandler = async () => {
        const formData = new FormData();
        if (title.length === 0 || description.length === 0 || context.length === 0) {
            alert('Fields cannot be empty.');
            return;
        }

        try {
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);
            formData.append('context', context);

            const res = await fetch (`${NEWS_URL}`, {
                method: 'post',
                body: formData,
                credentials: 'include'
            });

            if (res.ok) {
                alert('Successfully created new article!');
                resetFields();
                setModalOpen(false);
                fetchArticles();
            }
        } catch (err) {
            console.log('Could not upload article', err);
        }
    }

    const fetchArticles = async () => {
        setLoading(true);

        const res = await fetch(`${NEWS_URL}`, {
            method: 'get'
        });
        if (res.ok) {
            const data = await res.json();
            setArticles(data);
            setTimeout(() => {
                setLoading(false);
            }, 100);
        }
    }

    const resetFields = async () => {
        setTitle('');
        setDescription('');
        setType('News');
        setContext('');
    }

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        const fetchArticles = async () => {
            const res = await fetch(`${NEWS_URL}`, {
                method: 'get'
            });
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
                setTimeout(() => {
                    setLoading(false);
                }, 100);
            }
        }
        fetchArticles();
    }, [])

    return (
        <div className={`flex flex-col gap-5 min-h-[86vh] px-5 xl:px-[20%] py-20 transition-opacity duration-200 ease-in-out ${pageLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="relative flex items-center border-b pb-2">
                <h1 className="text-4xl">Site News and Announcements</h1>
                {user && user.is_admin && (
                    <p className="absolute right-1 px-2 py-1 rounded outline text-[#E4E7E5] hover:text-[#B59E6D] cursor-pointer" onClick={() => setModalOpen(true)}>Create New Post</p>
                )}
            </div>
            <div className="flex flex-col w-full p-5">
                <div className="grid grid-cols-3 xl:grid-cols-5 gap-5 w-full p-1 place-items-center">
                    {articles.map((item) => (
                        <div key={item.id} className="transition-transform duration-[0.2s] hover:scale-101"><NewsCard news={item} /></div>
                    ))}
                </div>
            </div>
            {modalOpen && (
                <dialog className="modal modal-open">
                    <div className="modal-box w-11/12 h-11/12 max-w-5xl bg-[#2A2F2C]">
                        <div className="flex flex-col gap-5 p-5">
                            <h1 className="text-4xl text-center">Write New Article</h1>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl">Title</h1>
                                <input className="w-full px-2 py-1 outline" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title... (Required)" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl">Description</h1>
                                <input className="w-full px-2 py-1 outline" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description... (Required)" />
                            </div>
                            <div>
                                <h1 className="text-2xl">Article Type</h1>
                                <select id="gender" value={type} onChange={(e) => setType(e.target.value)} 
                                className="text-[#000] bg-[#ffffff90] p-1">
                                    <option value="News">Site News</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Update">Site Update</option>
                                    <option value="Announcement">Announcement</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl">Context</h1>
                                <textarea className="w-full px-2 py-1 resize-none outline" rows={10} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Context..." />
                            </div>
                        </div>
                    </div>
                    <div className="modal-action">
                        <button className="btn btn-success" onClick={newArticleHandler}>Submit</button>
                        <button className="btn btn-warning" onClick={() => {setModalOpen(false); resetFields()}}>Cancel</button>
                    </div>
                </dialog>
            )}
        </div>
    )
}

export default NewsPage;