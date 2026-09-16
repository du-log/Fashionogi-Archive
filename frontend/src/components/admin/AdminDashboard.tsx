import { useContext, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

function AdminDashboard() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const isLoading = auth?.isLoading ?? true;
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if ((!user || !user.is_admin) && !isLoading) {
            navigate('/');
        }
    }, [user, isLoading, navigate])

    return (
        <div className="relative flex flex-col items-center w-full h-[100vh] px-[10%] py-20 gap-10 bg-[#aaaaaa10]">
            <h1 className="text-4xl font-bold text-[#daa520]">Admin Dashboard</h1>
            {/*
            <div className="flex w-full h-fit bg-[#00800030]">
                <div className="stat">
                    <div className="stat-title">Pending Reviews</div>
                    <div className="stat-value text-warning">--</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Total Approved</div>
                    <div className="stat-value text-success">--</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Active Tags</div>
                    <div className="stat-value text-info">--</div>
                </div>
            </div>
            */}
            <div className="flex w-full h-fit items-center justify-center text-md xl:text-lg outline outline-1 outline-[#ffffff90]">
                <Link to='/admin/pending' className={`px-5 py-2 ${location.pathname.includes('pending') ? 'bg-[#5a5a5a90]' : 'hover:bg-[#5a5a5a70] hover:text-[#daa520]'}`}>Pending Submissions</Link>
                <Link to='/admin/deletion' className={`px-5 py-2 ${location.pathname.includes('deletion') ? 'bg-[#5a5a5a90]' : 'hover:bg-[#5a5a5a70] hover:text-[#daa520]'}`}>Pending Deletion</Link>
                <Link to='/admin/tags' className={`px-5 py-2 ${location.pathname.includes('tags') ? 'bg-[#5a5a5a90]' : 'hover:bg-[#5a5a5a70] hover:text-[#daa520]'}`}>Manage Tags</Link>
                <Link to='/admin/equip' className={`px-5 py-2 ${location.pathname.includes('equip') ? 'bg-[#5a5a5a90]' : 'hover:bg-[#5a5a5a70] hover:text-[#daa520]'}`}>Manage Equipment</Link>
            </div>
            <div className="w-full min-h-[70vh]">
                <Outlet />
            </div>
            <div className="absolute top-0 p-5 flex w-full justify-evenly items-center">
                <p className="font-bold">You are logged in as: {user?.username}</p>
                <p className="font-bold">Account ID #: {user?.id}</p>
                <Link to='/' className="px-5 py-2 outline rounded-xl hover:text-[#daa520]">Return to Main Site</Link>
            </div>
        </div>
    )
}

export default AdminDashboard;