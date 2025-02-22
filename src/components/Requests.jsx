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
            await axios.post(
                `${BASE_URL}/request/review/${status}/${_id}`,
                {},
                { withCredentials: true }
            );
            dispatch(removeRequest(_id));
        } catch (err) {
            console.error("Error reviewing request:", err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/user/requests/received`, {
                withCredentials: true,
            });



            if (res.data && res.data.data) {
                dispatch(addRequests(res.data.data));
            } else {
                console.error("Unexpected API response format:", res.data);
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    if (!requests) return null;

    if (requests.length === 0)
        return <h1 className="text-3xl text-center my-10 font-bold">No New Requests Found...</h1>;

    return (
        <div className="text-center my-10">
            <h1 className="font-bold text-2xl my-15">Pending Requests</h1>
            <div className="flex flex-col items-center gap-6">
                {requests
                    .filter(request => request.fromUserId)
                    .map((request) => {
                        const { _id, firstName, lastName, age, gender, photoUrl, about } = request.fromUserId;
                        console.log(age)
                        return (
                            <div
                                key={_id}
                                className="flex bg-blue-100 shadow-md rounded-lg overflow-hidden w-96 md:w-[30rem]"
                            >
                                <img
                                    src={photoUrl || "/default-user.png"}
                                    alt="User"
                                    className="w-50 h-50 object-cover"
                                />
                                <div className="p-4 flex flex-col justify-between w-full">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {firstName} {lastName}
                                        </h2>
                                        <p className='w-3/12'>{age + " " + gender}</p>
                                        <p className="text-gray-700 mt-2">{about || "No about info"}</p>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-4">
                                        <button
                                            onClick={() => reviewRequest("accepted", request._id)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => reviewRequest("rejected", request._id)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                                        >
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
};

export default Requests;
