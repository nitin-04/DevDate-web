import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";


const Requests = () => {
    const requests = useSelector((store) => store.requests);
    const dispatch = useDispatch();


    const reviewRequest = async (status, _id) => {
        try {
            const res = axios.post(
                BASE_URL + "/request/review/" + status + "/" + _id,
                {},
                { withCredentials: true }
            );
            dispatch(removeRequest(_id));

        }
        catch (err) {
            console.error(err);
        }
    }



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


    if (!requests) return;

    if (requests.length === 0)
        return <h1 className="text-3xl text-center my-10 font-bold" >No New Request Found...</h1>

    return (
        <div className="text-center my-22">
            <h1 className="font-bold text-2xl my-18">Pending Requests</h1>
            <div className="flex flex-col items-center gap-6">
                {requests.map((request) => {
                    const {
                        _id,
                        firstName,
                        lastName,
                        age,
                        gender,
                        about,
                        photoUrl,
                    } = request.fromUserId;

                    return (
                        <div
                            key={_id}
                            className="flex bg-gray-300 shadow-md rounded-lg overflow-hidden w-96 md:w-[30rem]">
                            <img
                                src={photoUrl}
                                alt="User"
                                className="w-40 h-40 object-cover"
                            />
                            <div className="p-4 flex flex-col justify-between w-full">
                                <div>
                                    <h2 className="text-lg font-semibold">{firstName} {lastName}</h2>
                                    {age && gender && <p className="text-gray-500">{age}, {gender}</p>}
                                    <p className="text-gray-700 mt-2">{about}</p>
                                </div>
                                <div className="flex justify-end gap-4 mt-4">
                                    <button
                                        onClick={() => reviewRequest("accepted", request._id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => reviewRequest("rejected", request._id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                        Deny
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Requests
