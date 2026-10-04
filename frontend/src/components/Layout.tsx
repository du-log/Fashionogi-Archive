import { Outlet } from "react-router-dom";
import Navigation from "./navbartop/Navigation";
import Footer from "./Footer";

function Layout() {
    return (
        <div className="flex flex-col w-full bg-[#2A2F2C]">
            <Navigation />
            <div className="flex flex-col w-full py-22">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default Layout;