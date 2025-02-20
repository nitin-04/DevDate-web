import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
const Connections = () => {
    const connections = useSelector((store) => store.connections);
    const dispatch = useDispatch();

    const fetchConnections = async () => {
        try {
            const res = await axios.get(
                BASE_URL + "/user/connections",
                {
                    withCredentials: true
                });
            // console.log(res.data.data);
            dispatch(addConnections(res.data.data));
        }
        catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    if (!connections) return;

    if (connections.length === 0)
        return <h1>No Connections Found</h1>

    return (
        <div className="text-center my-10">
            <h1 className="text-bold text-2xl">Connections</h1>

            {connections.map((connection) => {
                const {
                    _id,
                    firstName,
                    lastName,
                    photoUrl,
                    age,
                    gender,
                    about,
                } = connection;

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

                        </div>
                    </div>
                );
            })}
        </div>
    )
};

export default Connections;
