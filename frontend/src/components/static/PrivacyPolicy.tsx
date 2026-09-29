import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import policy from './PRIPOL.md?raw';
import { useEffect } from "react";

export default function PrivacyPolicy() {
    useEffect(() => {
        document.documentElement.scrollTop = 0;
    }, [])
    
    return (
        <div className="prose prose-invert max-w-none pt-20 px-[10%] min-h-[86vh]">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks, remarkRehype]}>
                {policy}
            </Markdown>
        </div>
    )
}