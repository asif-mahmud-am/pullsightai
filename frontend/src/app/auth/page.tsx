// app/dashboard/page.tsx
import { redirect } from "next/navigation";

const AuthIndex = () => {
    redirect("/auth/login");
};

export default AuthIndex;
