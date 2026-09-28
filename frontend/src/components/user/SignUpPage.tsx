import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function SignUpPage() {
    const auth = useContext(AuthContext);
        if (!auth) throw new Error('AuthContext not provided');
    const {register} = auth;

    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [verify, setVerify] = useState<string>('');

    const [showPw, setShowPw] = useState<boolean>(false);

    const [agree, setAgree] = useState<boolean>(false);

    const [nameErr, setNameErr] = useState<string>('');
    const [emailErr, setEmailErr] = useState<string>('');
    const [pwErr, setPwErr] = useState<string>('');

    const [isRegistered, setRegistered] = useState<boolean>(false);

    const registerHandler = async (e: React.SubmitEvent) => {
        e.preventDefault();

        setNameErr('');
        setEmailErr('');
        setPwErr('');

        if (username.length === 0 ) {
            setNameErr('Field required.');
            return;
        }
        if (username.length > 0 && username.length < 3) {
            setNameErr('Username must be between 3 and 15 characters long.');
        }
        if (email.length === 0 ) {
            setEmailErr('Field required.');
            return;
        }
        if (password.length === 0 ) {
            setPwErr('Field required.');
            return;
        }
        if (password.length > 0 && password.length < 8) {
            setPwErr('Password must be between 8 and 16 characters, no spaces.');
            return;
        }
        if (verify !== password) {
            setPwErr('Passwords do not match.')
        }

        if (!username || !email || !password || verify !== password) return;

        try {
            const res = await register(username, email, password);
            const success = typeof res === 'boolean' ? res : res.success;
            const message = typeof res === 'boolean' ? '' : res.message;
            const type = typeof res === 'boolean' ? '' : res.type;
            if (success) {
                setRegistered(true);
            } else {
                if (type === 'AccEmailHas') {
                    setEmailErr(message);
                    return;
                } else if (type === 'AccNameHas') {
                    setNameErr(message);
                    return;
                }
            }
        } catch (err) {
            console.error('Could not register', err);
        }
    }

    useEffect(() => {
        const timerDebounce = setTimeout(async () => {
            if (password.length >= 8 && verify.length > 0) {
                if (verify !== password) {
                    setPwErr('Passwords do not match.')
                } else {
                    setPwErr('');
                }
            } else {
                setPwErr('');
            }
        }, 0);
        return () => clearTimeout(timerDebounce);
    }, [password, verify])

    return (
        <div className="flex flex-col gap-4 items-center justify-center w-full h-[100vh] text-lg">
            {!isRegistered && (
                <div className="flex flex-col gap-5 items-center outline outline-[#fff] py-10 px-5 rounded-xl bg-[#00660070]">
                    <h1 className="text-3xl">Sign Up</h1>
                    <form className="flex flex-col w-full py-10 px-5 gap-5" method="post" onSubmit={(e) => registerHandler(e)}>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex gap-10 items-center justify-between w-full">
                                <label htmlFor="usernameL">Username</label>
                                <input className={`bg-[#fff] text-[#000] ${nameErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type="text" id="usernameL" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={15} required
                                title="Username must be between 3 and 15 characters long. This can be changed later." />
                            </div>
                            <span className="text-[#aa0000]">{nameErr}</span>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex gap-10 items-center justify-between w-full">
                                <label htmlFor="emailL">Email</label>
                                <input className={`bg-[#fff] text-[#000] ${emailErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type="email" id="emailL" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <span className="text-[#aa0000]">{emailErr}</span>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex flex-col gap-6">
                                <div className="flex gap-10 items-center justify-between w-full">
                                    <label htmlFor="passwordL">Password</label>
                                    <div className="relative flex items-center">
                                        <input className={`bg-[#fff] text-[#000] ${pwErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type={showPw ? 'text' : 'password'} pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8.16}$" id="passwordL" value={password} onChange={(e) => setPassword(e.target.value)} required
                                        title="Must contain at least one number, one uppercase letter, one lowercase letter, one special character, no spaces, and be between 8-16 characters" />
                                        <p className={`absolute right-1 z-100 cursor-pointer text-sm ${showPw ? 'text-[#00000050]' : 'text-[#000]'}`} onClick={() => setShowPw((show) => !show)}>{showPw ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}</p>
                                    </div>
                                </div>
                                <div className="flex gap-10 items-center justify-between w-full">
                                    <label htmlFor="verifyL">Confirm Password</label>
                                    <input className={`bg-[#fff] text-[#000] ${pwErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type='password' id="verifyL" value={verify} onChange={(e) => setVerify(e.target.value)} required />
                                </div>
                            </div>
                            <span className="text-[#ff0000]">{pwErr}</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <label>I agree to the Terms and Conditions.</label>
                            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                        </div>
                        <button type="submit" className={`btn btn-xl btn-success ${!agree ? 'btn-disabled' : ''}`}>Register</button>
                    </form>
                </div>
            )}
            {isRegistered && (
                <div className="flex flex-col items-center gap-5">
                    <h1 className="text-3xl">Registration successful!</h1>
                    <p>Please check your email to verify your account.</p>
                    <Link to='/login'><p className="hover:text-[#00fa70]">Click to return to login.</p></Link>
                </div>
            )}
        </div>
    )
}

export default SignUpPage;