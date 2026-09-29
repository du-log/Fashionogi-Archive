import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { USERS_URL } from "../../utilities/MiscUtility";

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

function SignUpPage() {
    const auth = useContext(AuthContext);
        if (!auth) throw new Error('AuthContext not provided');
    const {register} = auth;

    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [verify, setVerify] = useState<string>('');

    const [showPw, setShowPw] = useState<boolean>(false);
    const [termsAgree, setTermsAgree] = useState<boolean>(false);
    const [privacyAgree, setPrivacyAgree] = useState<boolean>(false);

    const [nameErr, setNameErr] = useState<string>('');
    const [emailErr, setEmailErr] = useState<string>('');
    const [pwErr, setPwErr] = useState<string>('');

    const [isEmailChecking, setEmailChecking] = useState<boolean>(false);
    const [isNameChecking, setNameChecking] = useState<boolean>(false);
    const [isRegistered, setRegistered] = useState<boolean>(false);

    const navigate = useNavigate();

    const strength = getPasswordStrength(password);

    const requirements = [
        {label: '8-16 characters', met: password.length >= 8 && password.length <= 16},
        {label: 'One uppercase letter', met: /[A-Z]/.test(password)},
        {label: 'One lowercase letter', met: /[a-z]/.test(password)},
        {label: 'One number', met: /[0-9]/.test(password)},
        {label: 'One special character', met: /[^A-Za-z0-9]/.test(password)},
        {label: 'No spaces', met: password.length > 0 && !/\s/.test(password)}
    ]

    const isValidEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const registerHandler = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (username.length === 0 ) {
            setNameErr('Field required.');
            return;
        }
        if (username.length > 0 && username.length < 3) {
            setNameErr('Username must be between 3 and 15 characters long.');
        }
        if (/\s/.test(username)) {
            setNameErr('Username cannot contain spaces.')
        }
        if (email.length === 0 ) {
            setEmailErr('Field required.');
            return;
        }
        if (!isValidEmail(email)) {
            setEmailErr('Please enter a valid email address (e.g., name@domain.com).');
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
        if (/\s/.test(password)) {
            setPwErr('Password cannot contain spaces.');
            return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
            setPwErr('Password does not fulfill requirements.')
        }
        if (verify !== password) {
            setPwErr('Passwords do not match.')
        }

        if (!username || !email || !password || verify !== password) return;

        try {
            const trim = email.trim();
            const res = await register(username, trim, password);
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
            if (username.length === 0) {
                setNameErr('');
                return;
            }
            if (username.length < 3) {
                setNameErr('');
                return;
            }
            if (/\s/.test(username)) {
                setNameErr('Username cannot contain spaces.');
                return;
            }

            setNameChecking(true);
            try {
                const res = await fetch(`${USERS_URL}/username/check/${username}`);
                const data = await res.json();
                if (data.success) {
                    setNameErr('');
                } else {
                    setNameErr('Username is already taken.');
                }
            } catch (err) {
                console.error('Failed name check', err);
            } finally {
                setNameChecking(false);
            }
        }, 500);

        return () => clearTimeout(timerDebounce);
    }, [username])

    useEffect(() => {
        const timerDebounce = setTimeout(async () => {
            if (email.length === 0) return;
            if (!isValidEmail(email)) {
                setEmailErr('Please enter a valid email (e.g., name@domain.com).');
                return;
            }
            if (/\s/.test(email)) {
                setEmailErr('Please enter a valid email (e.g., name@domain.com).');
                return;
            }

            setEmailChecking(true);
            try {
                const res = await fetch(`${USERS_URL}/email/check/${email}`);
                const data = await res.json();
                if (data.success) {
                    setEmailErr('');
                } else {
                    setEmailErr('Email is already in use.');
                }
            } catch (err) {
                console.error('Could not check email', err);
            } finally {
                setEmailChecking(false);
            }
        }, 500);

        return () => clearTimeout(timerDebounce);
    }, [email])

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
        <div className="flex flex-col gap-4 items-center justify-center w-full h-[100vh] text-lg text-[#E4E7E5]">
            {!isRegistered && (
                <div className="flex flex-col gap-5 items-center outline outline-[#fff] pt-10 pb-5 px-5 rounded-xl bg-[#00660070]">
                    <h1 className="text-4xl">Sign Up</h1>
                    <p className="text-wrap text-center w-[75%]">Join us and share your styles with your fellow Fashionogi!</p>
                    <form className="flex flex-col w-full py-10 px-5 gap-5" method="post" onSubmit={(e) => registerHandler(e)}>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex gap-10 items-center justify-between w-full">
                                <label htmlFor="usernameL">Username</label>
                                <div className="flex items-center relative">
                                    <input className={`bg-[#fff] text-[#000] px-1 ${nameErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type="text" id="usernameL" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={15} required
                                    title="Username must be between 3 and 15 characters long. This can be changed later." />
                                    {!isNameChecking && nameErr.length === 0 && username.length >= 3 && (
                                        <p className="absolute right-1 text-[#00a000]"><CheckIcon size={20} /></p>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-[#ffffff90]">Must be between 3-15 characters, no spaces.</p>
                            <span className="flex text-[#aa0000] text-wrap">{nameErr}</span>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex gap-10 items-center justify-between w-full">
                                <label htmlFor="emailL">Email</label>
                                <div className="flex items-center relative">
                                    <input className={`bg-[#fff] text-[#000] px-1 ${emailErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type="email" id="emailL" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    {!isEmailChecking && emailErr.length === 0 && isValidEmail(email) && (
                                        <p className="absolute right-1 text-[#00a000]"><CheckIcon size={20} /></p>
                                    )}
                                </div>
                            </div>
                            <span className="text-[#aa0000] text-wrap">{emailErr}</span>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex flex-col gap-6">
                                <div className="flex gap-10 items-center justify-between w-full">
                                    <label htmlFor="passwordL">Password</label>
                                    <div className="relative flex items-center">
                                        <input className={`bg-[#fff] text-[#000] px-1 ${pwErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type={showPw ? 'text' : 'password'} pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8.16}$" id="passwordL" value={password} onChange={(e) => setPassword(e.target.value)} required
                                        title="Must contain at least one number, one uppercase letter, one lowercase letter, one special character, no spaces, and be between 8-16 characters" maxLength={16} />
                                        <p className={`absolute right-1 z-100 cursor-pointer text-sm ${showPw ? 'text-[#00000050]' : 'text-[#000]'}`} onClick={() => setShowPw((show) => !show)}>{showPw ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}</p>
                                    </div>
                                </div>
                                {password.length > 0 && (
                                    <>
                                    <div className="flex flex-col w-1/2 place-self-end bg-[#2A2F2C90] outline outline-[#758277] p-2">
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
                                <div className="flex gap-10 items-center justify-between w-full">
                                    <label htmlFor="verifyL">Confirm Password</label>
                                    <input className={`bg-[#fff] text-[#000] px-1 ${pwErr.length > 0 ? 'outline-2 outline-[#ff0000]' : ''}`} type='password' id="verifyL" value={verify} onChange={(e) => setVerify(e.target.value)} required />
                                </div>
                            </div>
                            <span className="text-[#ff0000]">{pwErr}</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <label>I have read the <a href="/privacy" target="_blank">Privacy Policy</a>.</label>
                            <input type="checkbox" checked={privacyAgree} onChange={(e) => setPrivacyAgree(e.target.checked)} />
                        </div>
                        <div className="flex items-center gap-5">
                            <label>I agree to the <a href="/terms" target="_blank">Terms and Conditions</a>.</label>
                            <input type="checkbox" checked={termsAgree} onChange={(e) => setTermsAgree(e.target.checked)} />
                        </div>
                        <button type="submit" className={`btn btn-xl btn-success ${(!privacyAgree || !termsAgree) ? 'btn-disabled' : ''}`}>Register</button>
                        <p className="place-self-center text-sm rounded px-2 py-1 outline w-fit cursor-pointer text-[#7CC96B] hover:text-[#a5f500]" onClick={() => navigate('/login')}>Return to Login</p>
                        <p className="place-self-center text-sm rounded px-2 py-1 outline w-fit cursor-pointer text-[#7CC96B] hover:text-[#a5f500]" onClick={() => navigate('/')}>Return to Home</p>
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