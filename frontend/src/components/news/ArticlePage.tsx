import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import { NEWS_URL } from "../../utilities/MiscUtility";
import type { Article } from "./NewsPage";

function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pageLoading, setLoading] = useState<boolean>(true);
    const [pageData, setPageData] = useState<Article | null>(null);

    const formattedDate: string = pageData ? new Date(pageData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : "";

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        const fetchArticle = async () => {
            const res = await fetch(`${NEWS_URL}/article/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPageData(data);
                setTimeout(() => setLoading(false), 200);
            }
        }
        fetchArticle();
    }, [id])

    return (
        <div className={`flex flex-col min-h-[86vh] px-10 xl:px-[20%] py-20 gap-5 transition-opacity duration-200 ease-in-out ${pageLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            {pageData && (
                <div className="flex flex-col gap-5 px-10 xl:px-[10%] py-10 bg-[#1A1F1C] rounded-xl min-h-[60vh]">
                    <button className="cursor-pointer outline outline-[#aaff0050] py-1 px-2 rounded text-[#ffffff90] hover:text-[#aaff0090] sm:text-sm xl:text-md w-fit" onClick={() => navigate('/news')}>{'<-'} News</button>
                    <h1 className="text-4xl">{pageData.title}</h1>
                    <div className="flex justify-between items-center py-2 border-b">
                        <div className="flex flex-col items-end">
                            <p>Author</p>
                            <p className="cursor-pointer" onClick={() => navigate(`/profile/${pageData.author}`)}>{pageData.author}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p>Article Type</p>
                            <p>{pageData.type}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p>Published</p>
                            <p>{formattedDate}</p>
                        </div>
                    </div>
                    <Markdown remarkPlugins={[remarkGfm, remarkBreaks, remarkRehype]}>{pageData.context}</Markdown>
                </div>
            )}
        </div>
    )
}

export default ArticlePage;