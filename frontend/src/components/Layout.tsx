import { Outlet } from "react-router-dom";
import Navigation from "./navbartop/Navigation";
import Footer from "./Footer";

function Layout() {
    return (
        <div className="flex flex-col w-full bg-mabi-base">
            <Navigation />
            <div className="flex flex-col w-full pt-22 pb-58">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default Layout;