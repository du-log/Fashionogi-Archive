import Markdown from "react-markdown";
import tnc from "./TNC.md?raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import { useEffect } from "react";

export default function TermsConditions() {
    useEffect(() => {
        document.documentElement.scrollTop = 0;
    }, [])
    
    return (
        <div className="prose prose-invert max-w-none pt-20 px-[10%] min-h-[86vh]">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks, remarkRehype]}>
                {tnc}
            </Markdown>
        </div>
    )
}