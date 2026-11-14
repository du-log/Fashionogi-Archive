import { Link } from "react-router-dom";

function Footer( {theme} : {theme: string} ) {
    return (
        <div className="flex flex-col bottom-0 items-center bg-gradient-to-b from-mabi-surface-muted to-mabi-surface border-t-1 border-mabi-border w-full p-4 text-mabi-text z-10">
            <p>© 2026 Fashionogi Archive. All Rights Reserved.</p>
            <div className="grid grid-cols-2 py-2 border-t border-mabi-border-heavy">
                <div className="flex flex-col gap-1 items-end text-sm pr-2">
                    <Link to='/about'><p className={`${theme === 'light' ? 'hover:text-mabi-green' : 'hover:text-mabi-orange'}`}>About</p></Link>
                    <Link to='/guidelines'><p className={`${theme === 'light' ? 'hover:text-mabi-green' : 'hover:text-mabi-orange'}`}>Rules and Guidelines</p></Link>
                    <Link to='/privacy'><p className={`${theme === 'light' ? 'hover:text-mabi-green' : 'hover:text-mabi-orange'}`}>Privacy Policy</p></Link>
                    <Link to='/terms'><p className={`${theme === 'light' ? 'hover:text-mabi-green' : 'hover:text-mabi-orange'}`}>Terms and Conditions</p></Link>
                </div>
                <div className="flex flex-col gap-1 items-start text-sm pl-2">
                    <a className={`${theme === 'light' ? 'hover:text-mabi-green' : 'hover:text-mabi-orange'}`} href="https://github.com/du-log/Fashionogi-Archive" target="_blank">GitHub</a>
                </div>
            </div>
        </div>
    )
}

export default Footer;