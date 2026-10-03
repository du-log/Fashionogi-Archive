import { useState, useEffect, useContext } from "react"
import { USERS_URL } from "../../utilities/MiscUtility";
import { EyeIcon, EyeOffIcon, CheckIcon, XIcon } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";

const getPasswordStrength = (pw: string) => {
        if (!pw) return { label: "", color: "bg-transparent", textColor: "", width: "w-0" };
        
        let score = 0;

        if (pw.length >= 8) score += 1;

        if (pw.length >= 12) score += 1;

        if (/[A-Z]/.test(pw)) score += 1;

        if (/[a-z]/.test(pw)) score += 1;

        if (/[0-9]/.test(pw)) score += 1;

        if (/[^A-Za-z0-9]/.test(pw)) score += 1;

        if (score < 3) return { label: "Weak", color: "bg-[#ff0000]", textColor: "text-[#ff0000]", width: "w-1/3" };
        if (score < 5) return { label: "Medium", color: "bg-[#eab308]", textColor: "text-[#eab308]", width: "w-2/3" };
        return { label: "Strong", color: "bg-[#00fa70]", textColor: "text-[#00fa70]", width: "w-full" };
    }

export default function PwChangeForm() {
    const [verifyPw, setVerifyPw] = useState<string>('');
    const [verified, setVerified] = useState<boolean>(false);
    const [verifyErr, setVerifyErr] = useState<string>('');

    const [password, setPassword] = useState<string>('');
    const [check, setCheck] = useState<string>('');
    const [pwErr, setPwErr] = useState<string>('');

    const [showPw, setShowPw] = useState<boolean>(false);
    const [showVerify, setShowVerify] = useState<boolean>(false);
    const strength = getPasswordStrength(password);

    const auth = useContext(AuthContext);
    if (!auth) throw new Error('AuthContext not provided');
    const {logout} = auth;

    const requirements = [
        {label: '8-16 characters', met: password.length >= 8 && password.length <= 16},
        {label: 'One uppercase letter', met: /[A-Z]/.test(password)},
        {label: 'One lowercase letter', met: /[a-z]/.test(password)},
        {label: 'One number', met: /[0-9]/.test(password)},
        {label: 'One special character', met: /[^A-Za-z0-9]/.test(password)},
        {label: 'No spaces', met: password.length > 0 && !/\s/.test(password)}
    ]

    const pwVerifyHandler = async () => {
        setVerifyErr('');
        const res = await fetch(`${USERS_URL}/password/verify/${verifyPw}`, {
            credentials: 'include'
        });
        if (res.ok) {
            setVerified(true);
        } else {
            setVerifyErr('The password you entered is incorrect.');
        }
    }

    const pwChangeHandler = async () => {
        if (password.length === 0 ) {
            setPwErr('Field required.');
            return;
        }
        if (password.length > 0 && password.length < 8) {
            setPwErr('Password must be between 8 and 16 characters, no spaces.');
            return;
        }
        if (/\s/.test(password)) {
            setPwErr('Password cannot contain spaces.');
            return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
            setPwErr('Password does not fulfill requirements.')
            return;
        }
        if (check !== password) {
            setPwErr('Passwords do not match.')
            return;
        }

        setPwErr('');
        const res = await fetch(`${USERS_URL}/password/update/${password}`, {
            method: 'PATCH',
            credentials: 'include'
        });
        if (res.ok) {
            alert('Password successfully changed. Returning to login.');
            logout();
        }
    }

    useEffect(() => {
            const timerDebounce = setTimeout(async () => {
                if (password.length >= 8 && check.length > 0) {
                    if (check !== password) {
                        setPwErr('Passwords do not match.')
                    } else {
                        setPwErr('');
                    }
                } else {
                    setPwErr('');
                }
            }, 0);
            return () => clearTimeout(timerDebounce);
        }, [password, check])

    return (
        <div className="flex flex-col gap-10 justify-center items-center p-10 bg-[#3E454090]">
            <h1 className="text-3xl">Password Change Form</h1>
            {!verified && (
                <div className="flex flex-col gap-5 p-10 outline rounded">
                    <p>Enter Current Password</p>
                    <div className="relative flex items-center">
                        <input className={`bg-[#fff] text-[#000] px-2 py-1 ${pwErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type={showVerify ? 'text' : 'password'} value={verifyPw} onChange={(e) => setVerifyPw(e.target.value)} required
                        maxLength={16} />
                        <p className={`absolute right-1 z-100 cursor-pointer text-sm ${showVerify ? 'text-[#00000050]' : 'text-[#000]'}`} onClick={() => setShowVerify((show) => !show)}>{showVerify ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}</p>
                    </div>
                    <span>{verifyErr}</span>
                    <button className="btn btn-warning" onClick={pwVerifyHandler}>Verify</button>
                </div>
            )}
            {verified && (
                <div className="flex flex-col gap-5 p-10 outline rounded">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-5 w-full">
                                <label htmlFor="passwordL">New Password</label>
                                <div className="relative flex items-center">
                                    <input className={`bg-[#fff] text-[#000] px-2 py-1 ${pwErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type={showPw ? 'text' : 'password'} pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8.16}$" id="passwordL" value={password} onChange={(e) => setPassword(e.target.value)} required
                                    title="Must contain at least one number, one uppercase letter, one lowercase letter, one special character, no spaces, and be between 8-16 characters" maxLength={16} />
                                    <p className={`absolute right-1 z-100 cursor-pointer text-sm ${showPw ? 'text-[#00000050]' : 'text-[#000]'}`} onClick={() => setShowPw((show) => !show)}>{showPw ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}</p>
                                </div>
                            </div>
                            {password.length > 0 && (
                                <>
                                <div className="flex flex-col w-full place-self-end bg-[#2A2F2C90] outline outline-[#758277] p-2">
                                    <div className="w-full h-1.5 bg-[#00000090] rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-300 ${strength.width} ${strength.color}`} />
                                    </div>
                                    <p className={`${strength.textColor} text-end`}>{strength.label}</p>
                                    <div className="p-1 flex flex-col text-sm items-end">
                                        {requirements.map((req) => (
                                            <div className="flex gap-1 items-center">
                                                <p className={`${req.met ? 'text-[#00f000]' : 'text-[#a00000]'}`}>{req.label}</p>
                                                <p className={`${req.met ? 'text-[#00f000]' : 'text-[#a00000]'}`}>{req.met ? <CheckIcon /> : <XIcon />}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                </>
                            )}
                            <div className="flex flex-col gap-5 w-full">
                                <label htmlFor="verifyL">Confirm Password</label>
                                <input className={`bg-[#fff] text-[#000] px-2 py-1 ${pwErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type='password' id="verifyL" value={check} onChange={(e) => setCheck(e.target.value)} required />
                            </div>
                        </div>
                        <span className="text-[#ff0000]">{pwErr}</span>
                        <button className="btn btn-success" onClick={pwChangeHandler}>Change Password</button>
                    </div>
                </div>
            )}
        </div>
    )
}