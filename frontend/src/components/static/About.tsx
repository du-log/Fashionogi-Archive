import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import about from "./ABOUT.md?raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";

export default function About() {
    const [isLoading, setLoading] = useState<boolean>(true);
    useEffect(() => {
            document.documentElement.scrollTop = 0;
            setTimeout(() => setLoading(false), 50);
        }, [])
    
    return (
        <div className={`prose prose-invert max-w-none pt-20 px-[5%] xl:px-[20%] min-h-[69.1vh] text-mabi-text transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <title>About | Fashionogi Archive</title>
            <div className="w-full bg-gradient-to-t from-mabi-surface-muted/50 to-mabi-surface/50 p-[5%]">
                <Markdown remarkPlugins={[remarkGfm,remarkBreaks, remarkRehype]}>
                    {about}
                </Markdown>
            </div>
        </div>
    )
}