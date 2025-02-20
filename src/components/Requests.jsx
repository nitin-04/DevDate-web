import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests } from "../utils/requestSlice";
import { useEffect } from "react";


const Requests = () => {
    const dispatch = useDispatch();

    const fetchRequests = async () => {
        try {
            const res = await axios.get(
                BASE_URL + "/user/requests/received", {
                withCredentials: true,
            }
            )
            dispatch(addRequests(res.data.data));
        }
        catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);
    return (
        <div>

        </div>
    )
}

export default Requests
