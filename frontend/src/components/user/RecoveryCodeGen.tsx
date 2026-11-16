import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { AUTH_URL } from "../../utilities/MiscUtility";

export default function RecoveryCodeGen() {
    const auth = useContext(AuthContext);
    const user = auth?.user ?? null;
    const checkSession = auth?.checkSession ?? (() => {})

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
                checkSession();
            } else {
                alert("Could not generate recovery code.");
            }
        } catch (err) {
            console.error(err);
            alert("Error generating recovery code.");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="flex flex-col gap-5 w-full text-mabi-text">
            <h1 className="text-xl">One-Time Recovery Code</h1>
            <div>
                <p className={`font-bold p-1 outline-1 outline-mabi-border bg-[#666] w-fit ${user?.auth_status?.has_recovery_code ? 'text-green-400' : 'text-red-400'}`}>{user?.auth_status?.has_recovery_code ? 'You have an active recovery code. If you have lost it or forgot to save it, please generate another and store it in a secure location.' 
                : 'You do not have a recovery code yet! We recommend generating one in the event that you need to recover your password.'}</p>
            </div>
            <button className="btn btn-warning w-fit" onClick={handleGenerateCode} disabled={generating}>{user?.auth_status?.has_recovery_code ? 'Regenerate Recovery Code' : 'Generate Recovery Code'}</button>
            {generatedCode && (
                <div className="flex flex-col gap-2 bg-mabi-surface p-4 outline-2 outline-mabi-orange">
                    <div className="flex flex-col">
                        <p className="text-mabi-orange font-bold">This code will only be shown once. Please save it somewhere safe:</p>
                        <p className="text-xl px-2 py-1 outline-1 bg-mabi-surface font-mono">{generatedCode}</p>
                    </div>
                    <button className="btn btn-warning w-fit" onClick={() => navigator.clipboard.writeText(generatedCode)}>Copy Code</button>
                </div>
            )}
        </div>
    )
}