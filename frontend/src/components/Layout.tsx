import { Outlet } from "react-router-dom";
import Navigation from "./navbartop/Navigation";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import Coco from "../assets/Coco.png";
import Ropa from "../assets/Ropa_(NPC).png";

function Layout() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="flex flex-col w-full bg-gradient-to-b from-mabi-base to-mabi-border-heavy transition-colors duration-0">
            <Navigation theme={theme} toggleTheme={toggleTheme} />
            <div className="flex flex-col w-full pt-42 pb-58 z-10">
                <Outlet />
            </div>
            <Footer />
            <div className="fixed flex justify-center items-end w-[100vw] h-[100vh] opacity-10">
                <div className="flex w-full h-full justify-between items-end px-20">
                    <img src={Coco} className="w-auto h-[30%] lg:h-[25%] xl:h-[40%]" />
                    <img src={Ropa} className="w-auto h-[30%] lg:h-[25%] xl:h-[40%]" />
                </div>
            </div>
        </div>
    )
}

export default Layout;