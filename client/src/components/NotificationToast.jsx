import { getColor } from "@/lib/utils";
import { Avatar, AvatarImage } from "./ui/avatar";

export const NotificationToast = ({imageUrl, name, message, color}) => {
    return (
        <div className="flex items-center gap-5">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-500 rounded-full overflow-hidden">
                { name != '#' ? <Avatar className="h-10 sm:h-12 w-10 sm:w-12 rounded-full overflow-hidden bg-[#1c1d25]">
                    {imageUrl ? (
                        <AvatarImage src={`${imageUrl}`} alt="profile" className="object-cover w-full h-full bg-black" />
                    ) : (
                        <div className={`uppercase h-10 w-10 sm:h-12 sm:w-12 text-md sm:text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(color)}`}>
                            {name.split("").shift()}
                        </div>
                    )}
                </Avatar> : <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">#</div>
                }
            </div>
            <div className="flex flex-col">
                <span className="text-white text-[14px] font-bold">{name}</span>
                <span className="font-bold text-netural-700">{message}</span>
            </div>
        </div>
    );
}