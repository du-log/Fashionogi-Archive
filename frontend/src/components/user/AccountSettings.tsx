import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { USERS_URL } from "../../utilities/MiscUtility";

function AccountSettings() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const userLoading = auth?.isLoading ?? true;
    const logout = auth?.logout ?? (async () => {});
    const [isLoading, setLoading] = useState<boolean>(true);
    
    const navigate = useNavigate();
    const [currentTab, setTab] = useState<string>('personal');
    const [username, setUsername] = useState<string>('');
    const [isAvailable, setAvailable] = useState<boolean>(false);
    const [availMsg, setAvailMsg] = useState<string>('');

    const handleNameCheck = async (username: string) => {
        setAvailable(false);
        if (username.length > 15) {
            setAvailMsg('Username is over 15 characters.');
            return;
        }
        if (/\s/.test(username)) {
            setAvailMsg('Username cannot contain spaces.');
            return;
        }
        const res = await fetch(`${USERS_URL}/username/check/${username}`);
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
        const res = await fetch(`${USERS_URL}/username/update/${username}`, {
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
            <div className={`flex gap-10 w-full min-h-[86vh] sm:px-[5%] xl:px-[20%] pt-10 transition-opacity duration-200 ease-in-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <div className="flex flex-1 flex-col gap-3 outline rounded-xl text-lg p-5 h-fit bg-[#3E454090]">
                    <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#2A2F2C]" onClick={() => setTab('personal')}>User Settings</p>
                    <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#2A2F2C]" onClick={() => setTab('notif')}>Notifications</p>
                    <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#2A2F2C]" onClick={() => setTab('other')}>Other</p>
                </div>
                <div className="flex flex-3 flex-col w-full px-10 py-5 outline rounded-xl overflow-y-auto bg-[#3E454090]">
                    {currentTab === 'personal' && (
                        <div className="flex flex-col p-2">
                            <h1 className="text-2xl border-b border-[#ffffff50] pb-2">User Settings</h1>
                            <div className="flex flex-col gap-2 py-2 w-full">
                                <h1 className="text-xl">Username</h1>
                                <div className="flex gap-5 items-center">
                                    <input type="text" className="bg-[#ffffff90] p-1" maxLength={15} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={user?.username} />
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
                                <h1 className="text-xl">Deactivate Account (Not Implemented)</h1>
                                <p>If you wish to have your account deactivated, please click the button below.</p>
                                <button className="btn btn-error btn-disabled">Request Account Deactivation</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default AccountSettings;