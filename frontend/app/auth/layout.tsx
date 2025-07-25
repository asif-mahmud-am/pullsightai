import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div
            className="min-h-screen bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: "url('/images/gradient-bg.svg')" }}
        >
            <div className="container">{children}</div>
        </div>
    );
};

export default AuthLayout;
