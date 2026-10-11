import { Link, useNavigate } from "react-router-dom";
import UserCollapse from "./UserCollapse";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import SearchBarComboBox from "./SearchBarComboBox";
import { ChevronDown, ChevronUp } from "lucide-react";

function Navigation() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const [showSearch, setShowSearch] = useState<boolean>(false);

    const navigate = useNavigate();

    return (
        <div className="Navbar flex fixed w-full bg-[#006600] h-fit z-100 justify-center items-center">
                <div className="left flex flex-1 gap-5 items-center justify-end text-md">
                    <Link to='/'><p className="text-[#E4E7E5] hover:text-[#B59E6D]">Home</p></Link>
                    <Link to='/gallery'><p className="text-[#E4E7E5] hover:text-[#B59E6D]">Gallery</p></Link>
                    <Link to={user ? '/upload' : '/login'}><p className="text-[#E4E7E5] hover:text-[#B59E6D]">Upload</p></Link>
                    <Link to='/news'><p className="text-[#E4E7E5] hover:text-[#B59E6D]">News</p></Link>
                </div>
                <div className="middle flex flex-col flex-1 justify-center items-center cursor-pointer" onClick={() => navigate('/')}>
                    <h2 className="text-2xl italic font-bold text-[#fff]">Fashionogi Archive</h2>
                    <h5 className="italic text-sm text-[#ffd700]">Discover your Erinn Style</h5>
                </div>
                <div className="right flex flex-1 justify-start items-center h-22">
                    <div className="flex place-items-center z-10 bg-[#3E4540] outline outline-[#ffffff50] rounded-lg p-2 w-fit min-w-50 h-fit min-h-16">
                        <UserCollapse />
                    </div>
                    <div className="fixed mt-19 ml-4.5 place-items-center w-40 cursor-pointer rounded-b-lg bg-[#3E4540] hover:outline hover:outline-[#ffffff50]" onClick={() => showSearch ? setShowSearch(false) : setShowSearch(true)}>
                        <p className="flex justify-between">{showSearch ? <ChevronUp height={20} /> : <ChevronDown height={20} />}</p>
                    </div>
                    {showSearch && (
                        <div className="fixed mt-34 z-[-10] px-5 py-2 bg-[#006600] rounded-b-xl">
                            <SearchBarComboBox />
                        </div>
                    )}
                </div>
        </div>
    )
}

export default Navigation;