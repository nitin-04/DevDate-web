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
            const res =  axios.post(
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
        return <h1>No Request Found</h1>

    return (
        <div className="text-center my-10">
            <h1 className="text-bold text-2xl">Pending Requests</h1>

            {requests.map((request) => {
                const {
                    _id,
                    firstName,
                    lastName,
                    photoUrl,
                    age,
                    gender,
                    about,
                } = request.fromUserId;

                return (

                    <div
                        key={_id}
                        className="card card-side bg-base-300 shadow-xl " >
                        <figure>
                            <img
                                src={photoUrl}
                                alt="photo" />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">{firstName + " " + lastName}</h2>
                            {age && gender && <p>{age + "," + gender}</p>}
                            <p>{about}</p>
                            <div className="card-actions justify-end">
                                <button
                                    onClick={() => reviewRequest("accepted", request._id)}
                                    className="btn btn-primary">Accept</button>
                                <button
                                    onClick={() => reviewRequest("rejected", request._id)}
                                    className="btn btn-ghost">Deny</button>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default Requests
