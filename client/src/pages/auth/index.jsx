import { useState } from "react"; 
import Victory from "@/assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const Auth = () => {

    const navigate = useNavigate();
    const {setUserInfo} = useAppStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const validateSignup = () => {
        if(!email.length){
            toast.error("Email is required.");
            return false;
        }
        if(!password.length){
            toast.error("Password is required.");
            return false;
        }
        if(password !== confirmPassword){
            toast.error("Password and Confirm Password should be same");
            return false;
        }
        return true;
    };

    const validateLogin = () => {
        if(!email.length){
            toast.error("Email is required.");
            return false;
        }
        if(!password.length){
            toast.error("Password is required");
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if(validateLogin()) {
            try{
                const response = await apiClient.post(LOGIN_ROUTE, 
                    {email,password}, 
                    {withCredentials: true}
                );
                if(response.data.user.id){
                    setUserInfo(response.data.user);
                    if(response.data.user.profileSetup) navigate("/chat");
                    else navigate("/profile");
                }
            } catch (error) {
                console.log({error});
                toast.error("Invalid Credentail");
            }
        }
    };

    const handleSignup = async () => {
        if(validateSignup()) {
            const response = await apiClient.post(SIGNUP_ROUTE, 
                {email, password}, 
                {withCredentials: true}
            );
            if(response.status === 201){
                setUserInfo(response.data.user);
                navigate("/profile");
            }
        }
    };

    return (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center poppins-medium">
            <div className="h-[80vh] border-5 border-white text-opacity-90 shadow-2xl md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid w-full">
                <div className="flex flex-col gap-10 items-center justify-center bg-gray-200 rounded-[3%]">
                    <div className="flex items-center justify-center flex-col">
                        <div className="flex items-center justify-center">
                            <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
                            <img src={Victory} alt="victory Emoji" className="h-[100px]" />
                        </div>
                        <p className="font-medium text-center">Fill in the details to get Started</p>
                    </div>
                    <div className="flex items-center justify-center w-full md:w-[80%] lg:w-[70%]">
                        <Tabs className="w-3/4" defaultValue="login">
                            <TabsList className="bg-transparent rounded-none w-full">
                                <TabsTrigger value="login" 
                                className="data-[state=active]:bg-transparent text-black text-md text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:border-b-black p-5 cursor-pointer transition-all duration-300">Login</TabsTrigger>
                                <TabsTrigger value="signup"
                                className="data-[state=active]:bg-transparent text-black text-md text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:border-b-black p-5 cursor-pointer transition-all duration-300">Signup</TabsTrigger>
                            </TabsList>
                            <TabsContent value="login" className="flex flex-col gap-5 mt-10">
                                <Input placeholder="Email" type="email" className="rounded-full p-6 font-bold" value={email} onChange={(e) => setEmail(e.target.value)} />
                                <Input placeholder="Password" type="password" className="rounded-full p-6 font-bold" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <Button className="rounded-full p-6 cursor-pointer" onClick={handleLogin}>Login</Button>
                            </TabsContent>
                            <TabsContent value="signup" className="flex flex-col gap-5 mt-5">
                                <Input placeholder="Email" type="email" className="rounded-full p-6 font-bold" value={email} onChange={(e) => setEmail(e.target.value)} />
                                <Input placeholder="Password" type="password" className="rounded-full p-6 font-bold" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <Input placeholder="Confirm Password" type="password" className="rounded-full p-6 font-bold" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                <Button className="rounded-full p-6 cursor-pointer" onClick={handleSignup}>Signup</Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;