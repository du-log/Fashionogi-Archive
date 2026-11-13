import { useState } from "react";

export interface AuthStatus {
    is_verified: boolean;
    has_password: boolean;
    has_recovery_code: boolean;
    discord_linked: boolean;
    google_linked: boolean;
}

export function AccountSecuritySection({
    AUTH_URL,
    authStatus,
    onRefreshUser
}: {
    AUTH_URL: string;
    authStatus?: AuthStatus;
    onRefreshUser: () => void;
}) {
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    const handleGenerateCode = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`${AUTH_URL}/recovery-code/generate`, {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setGeneratedCode(data.recovery_code);
                onRefreshUser();
            } else {
                alert("Could not generate recovery code.");
            }
        } catch (err) {
            console.error(err);
            alert("Error generating recovery code.");
        } finally {
            setGenerating(false);
        }
    };

    const handleOAuthLink = async (provider: "discord" | "google") => {
        try {
            const res = await fetch(`${AUTH_URL}/${provider}/link`, {
                method: "GET",
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                window.location.href = data.url;
            } else {
                alert("Your session expired or changed. Please log out and log back in first.");
            }
        } catch (err) {
            console.error(err);
            alert(`Could not start ${provider} linking.`);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-3 bg-mabi-surface outline-2 outline-mabi-border text-mabi-text">
            <div className="flex items-center justify-between border-b border-mabi-border pb-2">
                <h3 className="font-bold">Account Security & Verification</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${authStatus?.is_verified ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                    {authStatus?.is_verified ? "Verified Account" : "Unverified"}
                </span>
            </div>

            {/* One-Time Recovery Code */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">One-Time Recovery Code</p>
                        <p className="text-xs text-mabi-text-muted">
                            Status: {authStatus?.has_recovery_code ? "Active code on file" : "No recovery code generated"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerateCode}
                        disabled={generating}
                        className="btn btn-xs btn-primary"
                    >
                        {authStatus?.has_recovery_code ? "Regenerate Code" : "Generate Code"}
                    </button>
                </div>

                {generatedCode && (
                    <div className="flex flex-col gap-1 p-2 bg-[#000]/40 border border-warning text-sm">
                        <p className="text-xs text-warning font-semibold">
                            Save this code somewhere safe! It will only be shown once:
                        </p>
                        <div className="flex items-center justify-between font-mono text-base tracking-wider bg-black/50 px-2 py-1">
                            <span>{generatedCode}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedCode);
                                    alert("Copied recovery code to clipboard!");
                                }}
                                className="btn btn-xs btn-ghost"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Connected OAuth Accounts */}
            <div className="flex flex-col gap-2 border-t border-mabi-border pt-2">
                <p className="text-sm font-semibold">Connected Accounts</p>
                <p className="text-xs text-mabi-text-muted">
                    Linking a verified Discord or Google account automatically verifies your Fashionogi Archive profile and lets you log in with one click.
                </p>

                <div className="flex gap-2 mt-1">
                    {authStatus?.discord_linked ? (
                        <span className="btn btn-xs btn-disabled bg-[#5865F2]/40 text-white">
                            Discord Connected ✓
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleOAuthLink("discord")}
                            className="btn btn-xs bg-[#5865F2] hover:bg-[#4752C4] text-white border-none"
                        >
                            Link Discord
                        </button>
                    )}

                    {authStatus?.google_linked ? (
                        <span className="btn btn-xs btn-disabled bg-white/20 text-mabi-text">
                            Google Connected ✓
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleOAuthLink("google")}
                            className="btn btn-xs bg-white hover:bg-gray-200 text-black border border-mabi-border"
                        >
                            Link Google
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}