import { Link } from "react-router-dom";
import type { Article } from "./NewsPage";

function NewsPanel ( {article} : {article: Article} ) {
    const formattedDate: string = article ? new Date(article.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : "";

    return (
        <Link to={`/news/article/${article.id}`} className="w-full">
            <div className="group grid grid-cols-3 w-full place-items-center justify-start outline px-2 py-5 text-mabi-text bg-mabi-surface-muted cursor-pointer">
                <p className="group-hover:text-mabi-gold">{article.title}</p>
                <p className="group-hover:text-mabi-gold">{article.type}</p>
                <p className="group-hover:text-mabi-gold">{formattedDate}</p>
            </div>
        </Link>
    )
}

export default NewsPanel;