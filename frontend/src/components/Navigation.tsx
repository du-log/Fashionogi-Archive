import { Link, useNavigate } from "react-router-dom";
import UserCollapse from "./UserCollapse";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function Navigation() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    return (
        <div className="Navbar flex fixed w-full bg-[#006600] justify-center gap-4 px-4 h-22 z-100">
            <div className="left flex flex-1 gap-5 items-center justify-end text-md">
                <Link to='/'><p className="text-[#E4E7E5] hover:text-[#B59E6D]">Home</p></Link>
                <Link to='/gallery'><p className="text-[#E4E7E5] hover:text-[#B59E6D]">Gallery</p></Link>
                <Link to={user ? '/upload' : '/login'}><p className="text-[#E4E7E5] hover:text-[#B59E6D]">Upload</p></Link>
            </div>
            <div className="middle flex flex-col flex-1 justify-center items-center cursor-pointer" onClick={() => navigate('/')}>
                <h2 className="text-3xl italic font-bold text-[#fff]">Fashionogi</h2>
                <h5 className="italic text-sm text-[#ffd700]">Discover your Erinn Style</h5>
            </div>
            <div className="right flex flex-1 justify-start items-center">
                <UserCollapse />
            </div>
        </div>
    )
}

export default Navigation;