import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function AccountSettings() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const navigate = useNavigate();
    const [currentTab, setTab] = useState<string>('profile');
    const [username, setUsername] = useState<string | undefined>(user?.username);
    const [isAvailable, setAvailable] = useState<boolean>(false); // replace with endpoint return json
    const [isChecked, setChecked] = useState<boolean>(false); // replace with endpoint return json

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate])

    return (
        <div className="flex gap-10 w-full min-h-[70vh] px-[20%] pt-10">
            <div className="flex flex-1 flex-col gap-3 outline rounded-xl text-lg p-5">
                <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('profile')}>Profile</p>
                <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('account')}>Account</p>
                <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('notif')}>Notifications</p>
                <p className="p-2 outline rounded-lg cursor-pointer hover:bg-[#00008030]" onClick={() => setTab('other')}>Other</p>
            </div>
            <div className="flex flex-3 flex-col w-full px-10 py-5 outline rounded-xl overflow-y-auto">
                {currentTab === 'profile' && (
                    <div className="flex flex-col p-2">
                        <h1 className="text-2xl border-b border-[#ffffff50] pb-2">User Settings</h1>
                        <div className="flex flex-col gap-2 py-2 w-full">
                            <div className="flex gap-5 items-center">
                                <label htmlFor="usernameI">Change Username </label>
                                <input type="text" className="bg-[#ffffff90] p-1" maxLength={20} value={username} onChange={(e) => setUsername(e.target.value)} />
                                <button className="btn btn-warning w-fit" onClick={() => {
                                    if (username && username.length > 0) {
                                        setAvailable(true);
                                        setChecked(true);
                                    } else {
                                        setAvailable(false);
                                        setChecked(true);
                                    }
                                }}>Check</button>
                            </div> 
                            <p className={`text-sm`}>{username}</p> {/* Need to add endpoint for checking availability */}
                            <button className={`btn btn-success btn-soft w-fit
                            ${user?.username === username || !isAvailable && !isChecked ? 'btn-disabled' : ''} ${username !== user?.username && isAvailable ? '' : 'btn-disabled'}`}>
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
                    </div>
                )}
                {currentTab === 'other' && (
                    <div className="flex flex-col p-2">
                        <h1 className="text-2xl border-b border-[#ffffff50] pb-2">Other Settings</h1>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AccountSettings;