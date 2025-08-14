import Image from "next/image";

const DashboardNavbar = () => {
    return (
        <div className="h-[88px] flex items-center justify-between  border-b-1 border-white">
            <div className="flex items-center space-x-4">
                <Image
                    src="/images/logo.svg"
                    alt="pull sight logo"
                    width={100}
                    height={37}
                    className=""
                />
                <span className="text-base font-medium">
                    Welcome back, Ralph 👋
                </span>
            </div>
        </div>
    );
};

export default DashboardNavbar;
