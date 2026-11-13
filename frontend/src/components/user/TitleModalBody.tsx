import { useState } from "react"
import TitleBadge from "./TitleBadge";

export interface TitleProps {
    equipped_title_id?: number,
    equipped_title: {id?: number, name: string, stat_type: string},
    stats: {styles: number, favorites: number, views: number, followers: number, following: number},
    titles: Title[],
    setTitleModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    titleChangeHandler: (id?: number) => void
}

type Title = {
    id?: number,
    name: string,
    description: string,
    stat_type: string,
    requirements: {styles?: number, favorites?: number, views?: number, followers?: number, following?: number},
    is_unlocked: boolean
}

const MemberTitle: Title = {
    id: undefined,
    name: 'Member',
    description: 'Default title for all users.',
    stat_type: 'default',
    requirements: {},
    is_unlocked: true
}

export default function TitleModalBody( {equipped_title_id, equipped_title, stats, titles, setTitleModalOpen, titleChangeHandler} : TitleProps ) {
    const [selectedTitleId, setSelectedTitleId] = useState<number | undefined>(equipped_title_id);
    const [selectedTitle, setSelectedTitle] = useState<Title>(() => titles.find(title => title.id === equipped_title_id) ?? MemberTitle);

    return (
        <div className="flex flex-col w-full bg-mabi-surface-muted outline-3 outline-mabi-border text-mabi-text">
            <div className="flex flex-col gap-2 w-full px-2 py-1 border-b-1 border-mabi-border bg-mabi-surface">
                <div className="flex flex-col w-full gap-2 py-2">
                    <div className="flex gap-2 w-full items-center">
                        <p>Equipped Title:</p>
                        <div className="bg-[#000]/35"><TitleBadge name={equipped_title.name} category={equipped_title.stat_type} /></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 w-full h-full px-2 py-1">
                <div className="flex flex-col w-full max-h-100 gap-2 overflow-y-auto border-r-1 border-mabi-border">
                    <div className="flex flex-col w-60">
                        <div className={`cursor-pointer w-full p-1 
                        ${selectedTitle === MemberTitle && 'bg-[#000]/35'}`}
                        onClick={() => {setSelectedTitleId(undefined); setSelectedTitle(MemberTitle)}}>
                            <p>{MemberTitle.name}</p>
                        </div>
                        {titles.map((title) => (
                            title.is_unlocked && (
                                <div key={title.id} className={`cursor-pointer w-full p-1 
                                ${selectedTitleId === title.id && 'bg-[#000]/35'}`}
                                onClick={() => {setSelectedTitleId(title.id || undefined); setSelectedTitle(title || null)}}>
                                    <p>{title.name}</p>
                                </div>
                            )
                        ))}
                    </div>
                    <div className="items-center w-full"><hr className="w-full border-2 border-mabi-border" /></div>
                    <div className="flex flex-col w-65">
                        {titles.map((title) => (
                            !title.is_unlocked && (
                            <div key={title.id} className={`cursor-pointer w-full p-1 text-mabi-text-muted
                                ${selectedTitleId === title.id && 'bg-[#000]/25'}`}
                            onClick={() => {setSelectedTitleId(title.id || undefined); setSelectedTitle(title || null)}}>
                                <p>{title.name}</p>
                            </div>)
                        ))}
                    </div>
                </div>
                <div className="flex flex-col w-65 max-h-100 gap-4 px-2 border-l-1 border-mabi-border">
                    <div className="flex gap-2 w-full items-center">
                        <p>Title:</p>
                        <div className="bg-[#000]/35 w-fit"><TitleBadge name={selectedTitle?.name || 'Member'} category={selectedTitle?.stat_type || 'default'} /></div>
                    </div>
                    <div className="flex flex-col text-sm w-full">
                        <p>Description:</p>
                        <p className="text-wrap text-mabi-text-muted">{selectedTitle?.description}</p>
                    </div>
                    {!selectedTitle?.is_unlocked && (
                        <div className="flex flex-col text-sm">
                            <p>Progress:</p>
                            {selectedTitle?.requirements.styles && (
                                <p className="text-mabi-text-muted">{stats.styles} / {selectedTitle.requirements.styles} Approved Styles</p>
                            )}
                            {selectedTitle?.requirements.favorites && (
                                <p className="text-mabi-text-muted">{stats.favorites} / {selectedTitle.requirements.favorites} Total Favorites</p>
                            )}
                            {selectedTitle?.requirements.views && (
                                <p className="text-mabi-text-muted">{stats.views} / {selectedTitle.requirements.views} Total Views</p>
                            )}
                            {selectedTitle?.requirements.followers && (
                                <p className="text-mabi-text-muted">{stats.followers} / {selectedTitle.requirements.followers} Total Followers</p>
                            )}
                            {selectedTitle?.requirements.following && (
                                <p className="text-mabi-text-muted">{stats.following} / {selectedTitle.requirements.following} Creators Followed</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-2 items-center justify-center py-2 bg-mabi-surface border-t-1 border-mabi-border">
                <button className="btn btn-sm btn-success" onClick={() => titleChangeHandler(selectedTitleId)} disabled={selectedTitleId === (equipped_title_id ?? undefined) || !selectedTitle?.is_unlocked}>Change Title</button>
                <button className="btn btn-sm btn-error" onClick={() => setTitleModalOpen(false)}>Close</button>
            </div>
        </div>
    )
}