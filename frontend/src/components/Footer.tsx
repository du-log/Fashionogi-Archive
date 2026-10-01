import { Link } from "react-router-dom";

function Footer() {
    return (
        <div className="flex flex-col bottom-0 items-center bg-[#3E4540] border-t-1 border-[#ffffff20] w-[100%] p-4 text-[#E4E7E5]">
            <p>© 2026 Fashionogi Archive. All Rights Reserved.</p>
            <div className="grid grid-cols-2 py-2 border-t border-[#FFFFFF50]">
                <div className="flex flex-col gap-1 items-end text-sm pr-2">
                    <Link to='/about'><p className="hover:text-[#7CC96B]">About</p></Link>
                    <Link to='/guidelines'><p className="hover:text-[#7CC96B]">Rules and Guidelines</p></Link>
                    <Link to='/privacy'><p className="hover:text-[#7CC96B]">Privacy Policy</p></Link>
                    <Link to='/terms'><p className="hover:text-[#7CC96B]">Terms and Conditions</p></Link>
                </div>
                <div className="flex flex-col gap-1 items-start text-sm pl-2">
                    <a className="hover:text-[#7CC96B]" href="https://github.com/du-log/Fashionogi-Archive" target="_blank">GitHub</a>
                </div>
            </div>
        </div>
    )
}

export default Footer;