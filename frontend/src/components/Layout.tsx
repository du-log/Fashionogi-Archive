import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";

function Layout() {
    return (
        <div className="flex flex-col w-full">
            <Navigation />
            <div className="flex flex-col w-full px-[20%] py-25">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default Layout;