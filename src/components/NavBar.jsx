import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
    const user = useSelector((store) => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
            dispatch(removeUser());
            return navigate("/login");
        }
        catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="navbar bg-white text-black  px-6 py-3 flex justify-between items-center shadow-md">
            <Link to="/" className="text-2xl font-bold text-blue-800 hover:text-blue-400">DevDate</Link>
            {user && (
                <div className="flex items-center gap-4">
                    <span className="font-bold text-xl">Welcome, {user.firstName}</span>
                    <div className="relative group">
                        <button
                            className="w-15 h-15 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer focus:outline-none"
                        >
                            <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                        </button>
                        <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 shadow-lg rounded-lg opacity-0 invisible transition-opacity duration-200 ease-in-out group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible">
                            <ul >
                                <li className="border-b hover:bg-gray-400">
                                    <Link to="/profile" className="block px-4 py-2">Profile</Link>
                                </li>
                                <li className="border-b hover:bg-gray-400">
                                    <Link to="/connections" className="block px-4 py-2">Connections</Link>
                                </li>
                                <li className="border-b hover:bg-gray-400">
                                    <Link to="/requests" className="block px-4 py-2">Requests</Link>
                                </li>
                                <li className="hover:bg-red-100 text-red-600">
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2">Logout</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


}

export default NavBar
