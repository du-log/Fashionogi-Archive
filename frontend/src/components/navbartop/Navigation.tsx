import { Link, useNavigate } from "react-router-dom";
import UserCollapse from "./UserCollapse";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import SearchBarComboBox from "./SearchBarComboBox";
import { Moon, Sun } from "lucide-react";

function Navigation( {theme, toggleTheme} : {theme: string, toggleTheme: () => void} ) {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    return (
        <div className="Navbar flex fixed w-full bg-mabi-border-heavy text-mabi-text h-fit border-b border-mabi-border z-100 justify-center items-center">
                <div className="left relative flex flex-1 gap-5 items-center justify-end text-md">
                    <Link to='/'><p className="hover:text-mabi-green">Home</p></Link>
                    <Link to='/gallery'><p className="hover:text-mabi-green">Gallery</p></Link>
                    <Link to={user ? '/upload' : '/login'}><p className="hover:text-mabi-green">Upload</p></Link>
                    <Link to='/news'><p className="hover:text-mabi-green">News</p></Link>
                </div>
                <div className="middle relative flex flex-1 justify-center items-center">
                    <div className="flex flex-col justify-center items-center p-2 rounded-2xl w-fit bg-[#00700050] outline-1 outline-mabi-border cursor-pointer" onClick={() => navigate('/')}>
                        <h2 className="text-2xl italic font-bold text-white">Fashionogi Archive</h2>
                        <h5 className="italic text-sm text-[#FFD700]">Discover your Erinn Style</h5>
                    </div>
                </div>
                <div className="right relative flex flex-1 gap-10 justify-start items-center h-22">
                    <button aria-label="Toggle Theme" onClick={toggleTheme}
                    className="group p-2 rounded-lg bg-mabi-surface hover:bg-mabi-surface-muted transition-colors flex items-center justify-center outline-1 outline-mabi-border cursor-pointer">
                        {theme === "light" ? (
                            <Moon size={20} className="text-mabi-text-muted group-hover:text-mabi-text" />
                        ) : (
                            <Sun size={20} className="text-mabi-text-muted group-hover:text-mabi-text" />
                        )}
                    </button>
                    <div className={`relative flex place-items-center z-10 bg-mabi-surface-muted rounded-lg p-2 w-fit min-w-50 h-fit min-h-16`}>
                        <UserCollapse />
                        <div className="absolute top-19.5 flex w-fit justify-center px-4 py-2 bg-mabi-border">
                            <SearchBarComboBox />
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Navigation;