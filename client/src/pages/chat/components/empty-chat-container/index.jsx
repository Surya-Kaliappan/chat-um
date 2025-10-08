import { animationDefaultOptions } from "@/lib/utils";
import Lottie from "react-lottie";

const EmptyChatContaienr = () => {
    return (
        <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
            <Lottie
                isClickToPauseDisabled={true}
                height={300}
                width={300}
                options={animationDefaultOptions}
            />
            <div className="text-white flex flex-col gap-5 items-center lg:text-4xl text-3xl transition-all duration-300 text-center">
                <h3 className="poppins-medium">
                    Hi! Welcome to
                    <span className="text-[#0c6aeb] font-semibold"> Chat </span>
                    <span className="text-[#f59c0d] font-semibold">UM</span>

                </h3>
            </div>
        </div>
    );
};

export default EmptyChatContaienr;