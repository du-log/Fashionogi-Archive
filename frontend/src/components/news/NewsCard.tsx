import { Link } from "react-router-dom";
import type { Article } from "./NewsPage";

function NewsCard( {news} : {news: Article}) {

    return (
        <div className="w-70 h-50 outline-1 outline-mabi-border-heavy rounded-xl outline-offset-4 text-mabi-text">
            <div className="relative h-full w-full flex flex-col py-4 h-full outline-1 outline-mabi-border rounded-xl">
                <h2 className="text-xl px-1">{news.title}</h2>
                <p className="bg-mabi-border-heavy p-1">{news.type}</p>
                <p className="text-md px-1 text-ellipsis">{news.description}</p>
                <Link to={`/news/article/${news.id}`}><p className="absolute bottom-1 right-1 text-end">Read more...</p></Link>
            </div>
        </div>
    )
}

export default NewsCard;