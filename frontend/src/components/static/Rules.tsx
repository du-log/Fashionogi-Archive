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
                setTimeout(() => setLoading(false), 50);
            }, [])
    
    return (
        <div className={`prose prose-invert max-w-none pt-20 px-[5%] xl:px-[20%] min-h-[69.1vh] text-mabi-text transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <title>Site Rules | Fashionogi Archive</title>
            <div className="w-full bg-gradient-to-t from-mabi-surface-muted/50 to-mabi-surface/50 p-[5%]">
                <Markdown remarkPlugins={[remarkGfm,remarkBreaks, remarkRehype]}>
                    {rules}
                </Markdown>
            </div>
        </div>
    )
}