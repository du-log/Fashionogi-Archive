import { Link, useNavigate } from "react-router-dom";
import UserCollapse from "./UserCollapse";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function Navigation() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    const navigate = useNavigate();

    return (
        <div className="Navbar flex fixed w-full bg-[#006600] py-5 h-fit z-100 justify-center items-center">
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
                <div className="right flex flex-1 justify-start items-center">
                    <UserCollapse />
                </div>
        </div>
    )
}

export default Navigation;