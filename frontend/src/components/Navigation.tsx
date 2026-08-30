import { Link } from "react-router-dom";
import UserCollapse from "./UserCollapse";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function Navigation() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;

    return (
        <div className="Navbar flex fixed w-[100%] bg-[#00660090] justify-center gap-[1rem] px-[1rem] h-[80px] backdrop-blur-sm hover:bg-[#00800090] transition-[0.5s] z-100">
            <div className="left flex flex-1 gap-5 items-center justify-end text-md">
                <Link to='/'><p>Home</p></Link>
                <Link to='/gallery'><p>Gallery</p></Link>
                <Link to={user ? '/upload' : '/login'}><p>Upload</p></Link>
            </div>
            <div className="middle flex flex-col flex-1 justify-center items-center hover:cursor-default">
                <h2 className="text-3xl italic font-bold text-[#ffffff]">Fashionogi</h2>
                <h5 className="italic text-sm text-[#ffd700]">Discover your Erinn Style</h5>
            </div>
            <div className="right flex flex-1 justify-start items-center">
                <UserCollapse />
            </div>
        </div>
    )
}

export default Navigation;