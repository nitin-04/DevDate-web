import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import apiClient from "../api/apiClient";
import { addUser } from "../utils/userSlice";
import { addRequests } from "../utils/requestSlice";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import MessageNotification from "./MessageNotification";

const Body = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((store) => store.user);
    const [isAuthChecking, setIsAuthChecking] = useState(
        !user && location.pathname !== "/login" && location.pathname !== "/signup"
    );

    const fetchUser = async () => {
        if (user) {
            setIsAuthChecking(false);
            return;
        }
        try {
            const res = await apiClient.get("/profile/view");
            dispatch(addUser(res.data));
        } catch (err) {
            if (err.response?.status === 401 || err.status === 401) {
                if (location.pathname !== "/signup" && location.pathname !== "/login") {
                    navigate("/login");
                }
            }
            console.error(err);
        } finally {
            setIsAuthChecking(false);
        }
    };

    const fetchRequests = useCallback(async () => {
        try {
            const res = await apiClient.get("/users/requests/received");
            if (res.data && res.data.data) {
                dispatch(addRequests(res.data.data));
            }
        } catch (err) {
            // Silently handled in background
        }
    }, [dispatch]);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchRequests();
            // Background sync every 25 seconds for real-time notifications
            const intervalId = setInterval(fetchRequests, 25000);
            return () => clearInterval(intervalId);
        }
    }, [user, fetchRequests]);

    return (
        <div className="app flex flex-col min-h-screen relative">
            <NavBar />
            <main className="flex-grow">
                {isAuthChecking ? (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-xs font-mono text-slate-400 tracking-wider">
                            Verifying developer session...
                        </p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </main>
            <MessageNotification />
            <Footer />
        </div>
    );
};

export default Body;
