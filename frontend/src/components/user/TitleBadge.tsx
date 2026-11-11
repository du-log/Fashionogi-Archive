interface TitleBadgeProps {
    name?: string,
    category?: string,
    size?: 'sm' | 'md'
}

const CATEGORY_STYLES: Record<string, string> = {
    default: "border-mabi-border text-mabi-text-muted bg-black/20",
    styles: "border-emerald-400/80 text-emerald-300 bg-emerald-500/10",
    favorites: "border-rose-400/80 text-rose-300 bg-rose-500/10",
    followers: "border-sky-400/80 text-sky-300 bg-sky-500/10",
    views: "border-amber-400/80 text-amber-300 bg-amber-500/10",
    special: "border-[#DAA700] text-[#FFD700] bg-[#DAA700]/15 shadow-[0_0_8px_rgba(218,167,0,0.35)] font-semibold"
};

export default function TitleBadge( {name = 'Member', category = 'default', size = 'sm'} : TitleBadgeProps ) {
    const flair = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
    const sizing = size === 'sm' ? 'px-1.5 py-0.5 text-sm' : 'px-2.5 py-1 text-xs';

    return (
        <div className={`w-fit leading-none outline-1 truncate max-w-full tracking-wide ${sizing} ${flair}`}>
            {name}
        </div>
    )
}