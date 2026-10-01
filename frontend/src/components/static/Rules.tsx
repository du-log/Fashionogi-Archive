import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rules from "./RULES.md?raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";

export default function Rules() {
    const [isLoading, setLoading] = useState<boolean>(true);
        useEffect(() => {
                document.documentElement.scrollTop = 0;
                setTimeout(() => setLoading(false), 200);
            }, [])
    
    return (
        <div className={`prose prose-invert max-w-none pt-20 px-[5%] min-h-[86vh] transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="w-full bg-[#3E4540] p-[5%]">
                <Markdown remarkPlugins={[remarkGfm,remarkBreaks, remarkRehype]}>
                    {rules}
                </Markdown>
            </div>
        </div>
    )
}