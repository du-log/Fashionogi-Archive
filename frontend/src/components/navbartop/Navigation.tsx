import { Link, useNavigate } from "react-router-dom";
import UserCollapse from "./UserCollapse";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import SearchBarComboBox from "./SearchBarComboBox";
import { ChevronDown, ChevronUp, Moon, Sun, Search, SearchX } from "lucide-react";

function Navigation( {theme, toggleTheme} : {theme: string, toggleTheme: () => void} ) {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const [showSearch, setShowSearch] = useState<boolean>(false);

    const navigate = useNavigate();

    return (
        <div className="Navbar flex fixed w-full bg-mabi-border-heavy text-mabi-text h-fit border-b border-mabi-border z-100 justify-center items-center">
                <div className="left flex flex-1 gap-5 items-center justify-end text-md">
                    <Link to='/'><p className="hover:text-mabi-green">Home</p></Link>
                    <Link to='/gallery'><p className="hover:text-mabi-green">Gallery</p></Link>
                    <Link to={user ? '/upload' : '/login'}><p className="hover:text-mabi-green">Upload</p></Link>
                    <Link to='/news'><p className="hover:text-mabi-green">News</p></Link>
                </div>
                <div className="middle flex flex-1 justify-center items-center">
                    <div className="flex flex-col justify-center items-center p-2 rounded-2xl w-fit bg-[#00700050] outline-1 outline-mabi-border cursor-pointer" onClick={() => navigate('/')}>
                        <h2 className="text-2xl italic font-bold text-white">Fashionogi Archive</h2>
                        <h5 className="italic text-sm text-[#FFD700]">Discover your Erinn Style</h5>
                    </div>
                </div>
                <div className="right flex flex-1 gap-10 justify-start items-center h-22">
                    <div className={`flex place-items-center z-10 bg-mabi-surface-muted p-2 w-fit min-w-50 h-fit min-h-16 ${showSearch ? '' : 'border-b-1 border-mabi-border'}`}>
                        <UserCollapse />
                    </div>
                    <div className={`fixed group ${showSearch ? 'mt-44 z-[-10]' : 'mt-21'} ml-5 place-items-center w-40 cursor-pointer rounded-b-lg bg-mabi-surface-muted outline-1 outline-mabi-border-heavy hover:outline-mabi-gold`} onClick={() => showSearch ? setShowSearch(false) : setShowSearch(true)}>
                        <p className="flex justify-between py-1 mt-1">{showSearch ? <SearchX height={15} className="group-hover:text-mabi-gold" /> : <Search height={15} className="group-hover:text-mabi-gold" />}</p>
                    </div>
                    {showSearch && (
                        <div className="fixed mt-25 border-b-1 border-mabi-border px-5 pt-5 pb-2 bg-mabi-surface-muted">
                            <SearchBarComboBox />
                        </div>
                    )}
                    <button aria-label="Toggle Theme" onClick={toggleTheme}
                    className="group p-2 rounded-lg bg-mabi-surface hover:bg-mabi-surface-muted transition-colors flex items-center justify-center outline-1 outline-mabi-border cursor-pointer">
                        {theme === "light" ? (
                            <Moon size={20} className="text-mabi-text-muted group-hover:text-mabi-text" />
                        ) : (
                            <Sun size={20} className="text-mabi-text-muted group-hover:text-mabi-text" />
                        )}
                    </button>
                </div>
        </div>
    )
}

export default Navigation;