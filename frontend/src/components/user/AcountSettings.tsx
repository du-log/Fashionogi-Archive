import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function AccountSettings() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading = auth?.isLoading ?? true;
    const logout = auth?.logout ?? (async () => {});
    const [isLoading, setLoading] = useState<boolean>(true);
    
    const navigate = useNavigate();
    const [currentTab, setTab] = useState<string>('profile');
    const [username, setUsername] = useState<string>('');
    const [isAvailable, setAvailable] = useState<boolean>(false);
    const [availMsg, setAvailMsg] = useState<string>('');

    const handleNameCheck = async (username: string) => {
        const res = await fetch(`http://localhost:8000/api/users/username/check/${username}`);
        const data = await res.json();

        setAvailable(data.success);
        setAvailMsg(data.message);
    }

    const handleNameReset = async () => {
        setUsername('');
        setAvailMsg('');
        setAvailable(false);
    }

    const handleNameChange = async (username: string) => {
        const res = await fetch(`http://localhost:8000/api/users/username/update/${username}`, {
            method: 'PATCH',
            credentials: 'include'
        })
        if (res.ok) {
            alert('Sucessfully changed username. \nReturning back to login due to change in user credentials.');
            logout();
            window.location.reload();
        }
    }

    useEffect(() => {
        if (!user && !userLoading) navigate('/login');

        document.documentElement.scrollTop = 0;
        setTimeout(() =>setLoading(false), 50);
    }, [user, userLoading, navigate])

    return (
        <>
            {userLoading || isLoading && (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <span className="loading loading-spinner loading-xl"></span>
                </div>
            )}
            <div className={`flex gap-10 w-full min-h-[70vh] sm:px-[5%] xl:px-[20%] pt-10 transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <div className="flex flex-1 flex-col gap-3 outline rounded-xl text-lg p-5">
                    <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('profile')}>User Settings</p>
                    <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('account')}>Account Settings</p>
                    <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('notif')}>Notifications</p>
                    <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('other')}>Other</p>
                </div>
                <div className="flex flex-3 flex-col w-full px-10 py-5 outline rounded-xl overflow-y-auto">
                    {currentTab === 'profile' && (
                        <div className="flex flex-col p-2">
                            <h1 className="text-2xl border-b border-[#ffffff50] pb-2">User Settings</h1>
                            <div className="flex flex-col gap-2 py-2 w-full">
                                <h1 className="text-xl">Username</h1>
                                <div className="flex gap-5 items-center">
                                    <input type="text" className="bg-[#ffffff90] p-1" maxLength={20} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={user?.username} />
                                    <button className={`btn btn-warning w-fit ${username.length < 3 || username === user?.username ? 'btn-disabled' : ''}`} onClick={() => handleNameCheck(username)}>Check</button>
                                    <button className="btn btn-secondary btn-soft" onClick={handleNameReset}>Clear</button>
                                </div>
                                <p className={`text-sm ${isAvailable && availMsg.length > 0 ? 'text-[#00aa00]' : 'text-[#aa0000]'}`}>{availMsg}</p>
                                <button className={`btn btn-success btn-soft w-fit
                                ${user?.username === username || !isAvailable ? 'btn-disabled' : ''} ${username !== user?.username && isAvailable ? '' : 'btn-disabled'}`}
                                onClick={() => handleNameChange(username)}>
                                    Change Username
                                </button>
                            </div>
                        </div>
                    )}
                    {currentTab === 'account' && (
                        <div className="flex flex-col p-2">
                            <h1 className="text-2xl border-b border-[#ffffff50] pb-2">Account Settings</h1>
                        </div>
                    )}
                    {currentTab === 'notif' && (
                        <div className="flex flex-col p-2">
                            <h1 className="text-2xl border-b border-[#ffffff50] pb-2">Notification Settings</h1>
                            <p>Not currently implemented.</p>
                        </div>
                    )}
                    {currentTab === 'other' && (
                        <div className="flex flex-col p-2">
                            <h1 className="text-2xl border-b border-[#ffffff50] pb-2">Other Settings</h1>
                            <div className="flex flex-col gap-2 py-2 w-full">
                                <h1 className="text-xl">Deactivate Account</h1>
                                <p>If you wish to have your account deactivated, please click the button below.</p>
                                <button className="btn btn-error">Request Account Deactivation</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default AccountSettings;