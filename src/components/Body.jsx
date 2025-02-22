import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";


const Body = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((store) => store.userData);

    const fetchUser = async () => {
        try {
            if (userData) return;
            const res = await axios.get(BASE_URL + "/profile/view",
                {}, {
                withCredentials: true,
            });
            dispatch(addUser(res.data));

        }
        catch (err) {
            if (err.status == 401) {
                navigate("/login");

            }
            console.error(err);
        }
    };

    useEffect(() => {
        // if(!userData){
        fetchUser()
        // }
    }, []);

    return (
        <div className="app flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Body
