import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function LoginOAuthAndRecovery({ AUTH_URL }: { AUTH_URL: string }) {
    const [searchParams] = useSearchParams();
    const oauthError = searchParams.get("error");

    const [recoverOpen, setRecoverOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRecoveryReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${AUTH_URL}/recovery-code/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    recovery_code: recoveryCode.trim(),
                    new_password: newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Password updated! You can now log in.");
                setRecoverOpen(false);
                setUsername("");
                setRecoveryCode("");
                setNewPassword("");
            } else {
                alert(data.detail || "Invalid username or recovery code.");
            }
        } catch (err) {
            console.error(err);
            alert("Could not reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {oauthError && (
                <div className="p-2 text-xs bg-error/20 border border-error text-error">
                    OAuth sign-in could not be completed ({oauthError}).
                </div>
            )}

            <button type="button" onClick={() => setRecoverOpen(true)} className="text-xs text-mabi-text-muted hover:underline cursor-pointer">Forgot password? Use a recovery code</button>

            <div className="flex items-center gap-2 my-1">
                <hr className="flex-1 border-mabi-border" />
                <span className="text-xs text-mabi-text-muted">OR</span>
                <hr className="flex-1 border-mabi-border" />
            </div>

            <div className="flex flex-col gap-2">
                <a href={`${AUTH_URL}/discord/login`} className="btn btn-sm w-full bg-[#5865F2] hover:bg-[#4752C4] text-white border-none">
                    Continue with Discord
                </a>
                <a href={`${AUTH_URL}/google/login`} className="btn btn-sm w-full bg-white hover:bg-gray-200 text-black border border-mabi-border">
                    Continue with Google
                </a>
            </div>

            {recoverOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <form onSubmit={handleRecoveryReset} className="flex flex-col gap-3 w-96 p-4 bg-mabi-surface outline-3 outline-mabi-border text-mabi-text">
                        <h3 className="font-bold text-base border-b border-mabi-border pb-1">
                            Reset Password with Recovery Code
                        </h3>
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="input input-sm input-bordered w-full bg-mabi-surface-muted" />
                        <input type="text" placeholder="MABI-XXXX-XXXX-XXXX" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} required className="input input-sm input-bordered w-full font-mono uppercase bg-mabi-surface-muted" />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="input input-sm input-bordered w-full bg-mabi-surface-muted" />
                        <div className="flex justify-end gap-2 mt-2">
                            <button type="submit" disabled={loading} className="btn btn-sm btn-success">
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                            <button type="button" onClick={() => setRecoverOpen(false)} className="btn btn-sm btn-error">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}