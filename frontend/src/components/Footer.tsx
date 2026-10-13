import { Link } from "react-router-dom";

function Footer() {
    return (
        <div className="flex flex-col bottom-0 items-center bg-mabi-surface-muted border-t-1 border-mabi-border w-full p-4 text-mabi-text">
            <p>© 2026 Fashionogi Archive. All Rights Reserved.</p>
            <div className="grid grid-cols-2 py-2 border-t border-mabi-border-heavy">
                <div className="flex flex-col gap-1 items-end text-sm pr-2">
                    <Link to='/about'><p className="hover:text-mabi-green">About</p></Link>
                    <Link to='/guidelines'><p className="hover:text-mabi-green">Rules and Guidelines</p></Link>
                    <Link to='/privacy'><p className="hover:text-mabi-green">Privacy Policy</p></Link>
                    <Link to='/terms'><p className="hover:text-mabi-green">Terms and Conditions</p></Link>
                </div>
                <div className="flex flex-col gap-1 items-start text-sm pl-2">
                    <a className="hover:text-mabi-green" href="https://github.com/du-log/Fashionogi-Archive" target="_blank">GitHub</a>
                </div>
            </div>
        </div>
    )
}

export default Footer;