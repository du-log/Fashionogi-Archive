import { Outlet } from "react-router-dom";
import Navigation from "./navbartop/Navigation";
import Footer from "./Footer";
import { useEffect, useState } from "react";

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
        <div className="flex flex-col w-full bg-mabi-base transition-colors duration-0">
            <Navigation theme={theme} toggleTheme={toggleTheme} />
            <div className="flex flex-col w-full pt-42 pb-58">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default Layout;