import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { Loader } from "lucide-react";

const updateApiToken = (token: string | null) => {
    if (token) {
        axiosInstance.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common["Authorization"];
    }
};
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken } = useAuth();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await getToken();
                updateApiToken(token);
            } catch (error) {
                updateApiToken(null);
                console.log("Error in AuthProvider:", error);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, [getToken]);
    if (loading) {
        return (
            <div className="h-screen w-max flex items-center justify-center">
                <Loader className="size-8 Dtext-emerald-500 animate-spin" />
            </div>
        );
    }
    return <>{children}</>;
};

export default AuthProvider;
