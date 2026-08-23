function PreviewCard({imgSrc, caption} : {imgSrc: string, caption: string}) {
    return (
        <div className="group relative w-fit h-fit max-w-[225px] outline-3 outline-[#ffffff99] outline-offset-2 rounded-lg transition-transform duration-[0.2s] hover:scale-105">
            <img src={imgSrc}
            className={`aspect-[9/16] object-cover rounded-lg ${imgSrc ? "w-full h-full" : "w-[225px] h-[400px]"}`} alt={caption}></img>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#00000099] to-transparent rounded-b-lg pb-2 px-4 pt-2 transition-[0.5s] group-hover:bg-[#10101090]">
                <h3 className="font-bold text-lg text-transparent truncate transition-[0.5s] group-hover:text-[#daa520]">{imgSrc ? caption : "Select an image first"}</h3>
                <h5 className="text-sm text-transparent transition-[0.5s] group-hover:text-[#fefefe99]">{imgSrc ? "Username" : "Actual dimensions may vary"}</h5>
            </div>
        </div>
    )
}

export default PreviewCard;