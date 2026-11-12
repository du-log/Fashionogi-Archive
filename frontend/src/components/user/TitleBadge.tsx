interface TitleBadgeProps {
    name?: string,
    category?: string,
    size?: 'sm' | 'md'
}

const CATEGORY_STYLES: Record<string, string> = {
    default: "outline-1 outline-mabi-border text-[#FFF]",
    styles: "outline-1 outline-emerald-400/80 text-emerald-300 bg-emerald-500/10",
    favorites: "outline-1 outline-rose-400/80 text-rose-300 bg-rose-500/10",
    followers: "outline-1 outline-sky-400/80 text-sky-300 bg-sky-500/10",
    views: "outline-1 outline-amber-400/80 text-amber-300 bg-amber-500/10",
    special: "outline-1 outline-[#DAA700] text-[#FFD700] bg-[#DAA700]/15 shadow-[0_0_8px_rgba(218,167,0,0.35)] font-semibold"
};

export default function TitleBadge( {name = 'Member', category = 'default', size = 'md'} : TitleBadgeProps ) {
    const flair = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
    const sizing = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xl';

    return (
        <div className={`w-fit outline-1 truncate max-w-full tracking-wide ${sizing} ${flair}`}>
            {name}
        </div>
    )
}