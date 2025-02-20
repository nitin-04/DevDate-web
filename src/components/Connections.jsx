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
            const res = await axios.get(BASE_URL + "/user/connections", { withCredentials: true });
            dispatch(addConnections(res.data.data));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    if (!connections) return null;

    if (connections.length === 0) {
        return <h1 className="text-center text-2xl font-semibold mt-10">No Connections Found</h1>;
    }

    return (
        <div className="max-w-5xl mx-auto my-10 px-4">
            <h1 className="text-center text-3xl font-bold mb-6">Connections</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((connection) => {
                    const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;

                    return (
                        <div key={_id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition duration-300">
                            <img src={photoUrl} alt="profile" className="w-full h-48 object-cover" />
                            <div className="p-5">
                                <h2 className="text-xl font-semibold">{firstName + " " + lastName}</h2>
                                {age && gender && <p className="text-gray-600">{age}, {gender}</p>}
                                <p className="text-gray-700 mt-2">{about}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Connections;
