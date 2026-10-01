import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import policy from './PRIPOL.md?raw';
import { useEffect, useState } from "react";

export default function PrivacyPolicy() {
    const [isLoading, setLoading] = useState<boolean>(true);
        useEffect(() => {
                document.documentElement.scrollTop = 0;
                setTimeout(() => setLoading(false), 200);
            }, [])
    
    return (
        <div className={`prose prose-invert max-w-none pt-20 px-[5%] min-h-[86vh] transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="w-full bg-[#3E4540] p-[5%]">
                <Markdown remarkPlugins={[remarkGfm,remarkBreaks, remarkRehype]}>
                    {policy}
                </Markdown>
            </div>
        </div>
    )
}