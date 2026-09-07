import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { addUser } from "../utils/userSlice";
import { addRequests } from "../utils/requestSlice";
import { useEffect, useCallback } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";

import MessageNotification from "./MessageNotification";

const Body = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((store) => store.user);

    const fetchUser = async () => {
        try {
            if (user) return;
            const res = await axios.get(BASE_URL + "/profile/view", {
                withCredentials: true,
            });
            dispatch(addUser(res.data));

        }
        catch (err) {
            if (err.response?.status === 401 || err.status === 401) {
                if (location.pathname !== "/signup" && location.pathname !== "/login") {
                    navigate("/login");
                }
            }
            console.error(err);
        }
    };

    const fetchRequests = useCallback(async () => {
        try {
            const res = await axios.get(BASE_URL + "/user/requests/received", {
                withCredentials: true,
            });
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
                <Outlet />
            </main>
            <MessageNotification />
            <Footer />
        </div>
    )
}

export default Body
