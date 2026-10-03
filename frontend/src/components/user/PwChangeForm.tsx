import { useState } from "react"

export default function PwChangeForm() {
    const [verifyPw, setVerifyPw] = useState<string>('');
    const [verified, setVerified] = useState<boolean>(false);
    const [verifyErr, setVerifyErr] = useState<string>('');

    const pwVerifyHandler = async () => {
        setVerifyErr('');
        const res = await fetch('');
        if (res.ok) {
            setVerified(true);
        } else {
            setVerifyErr('The password you entered is incorrect.');
        }
    }

    return (
        <div className="flex">
            {!verified && (
                <div className="flex flex-col">
                    <p>Enter Current Password</p>
                    <input type="password" value={verifyPw} onChange={(e) => setVerifyPw(e.target.value)} />
                    <span>{verifyErr}</span>
                    <button className="btn btn-warning" onClick={() => pwVerifyHandler}>Verify</button>
                </div>
            )}
        </div>
    )
}