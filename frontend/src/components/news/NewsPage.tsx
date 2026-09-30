import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import NewsCard from "./NewsCard";

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

    const [articles, setArticles] = useState<Article[]>([]);

    const dummyNews: Article = {
        'id': 1,
        'title': 'Dummy Article',
        'description': 'This is the description',
        'type': 'News',
        'context': 'I am a dummy news article made to test the card component.',
        'created_at': 'September 29, 2026',
        'author': 'Me'
    };

    return (
        <div className="flex flex-col gap-5 min-h-[86vh] px-[20%] py-20">
            <div className="flex justify-between items-center border-b pb-2">
                <h1 className="text-3xl">Site News and Announcements</h1>
                {user && user.is_admin && (
                    <p className="px-2 py-1 rounded outline text-[#E4E7E5] hover:text-[#B59E6D]">Create New Post</p>
                )}
            </div>
            <div className="flex flex-col w-full p-5 outline">
                <div className="grid grid-cols-5 w-full p-1">
                    <NewsCard news={dummyNews} />
                </div>
            </div>
        </div>
    )
}

export default NewsPage;