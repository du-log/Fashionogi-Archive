import { Link } from "react-router-dom";
import { MailIcon, KeyIcon } from "lucide-react";

function LoginPage() {
    return (
        <div className="flex flex-col gap-4 items-center justify-center w-full h-[100vh]">
            <div className="flex flex-col items-center py-5 px-10 outline-1 rounded-xl bg-[#00800090]">
                <h1 className="text-4xl text-[#ffffff] italic">Fashionogi</h1>
                <h5 className="text-lg text-[#ffd700] italic">Discover your Erinn Style</h5>
            </div>
            <div className="flex flex-col items-center px-20 py-10 rounded-lg outline outline-[#ffffff90] bg-[#00660070] gap-5">
                <h1 className="text-4xl text-[#eeeeee] font-bold py-10">Sign In</h1>
                <form method="POST" className="flex flex-col gap-5 text-md">
                    <div className="flex gap-2 items-center">
                        <label><MailIcon size={25}/></label>
                        <input type="email" className="bg-[#ffffff] text-[#000000] p-1" autoComplete="email" placeholder="Email" />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <div className="flex gap-2 items-center">
                            <label><KeyIcon size={25} /></label>
                            <input type="password" className="bg-[#ffffff] text-[#000000] p-1" autoComplete="password" placeholder="Password" />
                        </div>
                        <Link to='/'><p className="text-xs text-[#ffffff90] hover:text-[#a5f500]">Forgot password?</p></Link>
                    </div>
                    <div className="flex gap-3 items-center">
                        <label className="text-md text-[#eeeeee]">Remember Me</label>
                        <input type="checkbox" className="cursor-pointer w-5 h-5" />
                    </div>
                    <button type="submit" className="rounded-lg bg-[#006000] px-2 py-3 cursor-pointer transition-color duration-50 hover:bg-[#008000] font-bold text-[#eeeeee] outline outline-[#ffffff90]">Log In</button>
                </form>
                <div className="flex flex-col items-center text-[#eeeeee]">Don't have an account?<Link to='/'><p className="text-md hover:text-[#a5f500]">Register</p></Link></div>
                <div className="flex flex-col items-center text-[#eeeeee] gap-3">
                    Or sign up with:
                    <div className="flex justify-center gap-10">
                        <Link to='/'><p className="px-3 py-1 rounded-xl bg-[#0000ab] text-lg hover:bg-[#0000cd] outline outline-[#ffffff90]">Discord</p></Link>
                        <Link to='/'><p className="px-3 py-1 rounded-xl bg-[#ab0000] text-lg hover:bg-[#cd0000] outline outline-[#ffffff90]">Google</p></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;