import { useState } from "react";
import UserCard from "./UserCard";
import PropTypes from 'prop-types';
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { useDispatch } from "react-redux";


const EditProfile = ({ user }) => {

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [age, setAge] = useState(user.age || "");
    const [gender, setGender] = useState(user.gender || "");
    const [about, setAbout] = useState(user.about || "");
    const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(false);

    const saveProfile = async () => {
        setError("");
        try {
            const res = await axios.patch(
                BASE_URL + "/profile/edit",
                {
                    firstName,
                    lastName,
                    age,
                    gender,
                    about,
                    photoUrl,

                },
                { withCredentials: true }
            );
            dispatch(addUser(res?.data?.data));
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 3000);

        }
        catch (err) {
            setError(err?.response?.data);
            console.error("Error:", err.response?.data || err.message);

        }
    }


    return (
        <>
            <div className="pt-2 min-h-screen flex flex-col items-center">
                <div className="flex justify-center my-10 w-full">
                    <div className="flex justify-center mx-20">
                        <div className="card bg-gray-200 text-black font-semibold w-lg shadow-xl p-6">
                            <div className="card-body ">
                                <h2 className="card-title justify-center mb-4">Edit Profile</h2>
                                <div className="">
                                    <label className="form-control w-full max-w-xs">
                                        <div className="label">
                                            <span className="label-text my-1">First Name</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Type here"
                                            value={firstName}
                                            className="input input-bordered w-full bg-white"
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </label>

                                    <label className="form-control w-full max-w-xs">
                                        <div className="label my-2">
                                            <span className="label-text">Last Name</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Type here"
                                            value={lastName}
                                            className="input input-bordered w-full bg-white"
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </label>

                                    <label className="form-control w-full max-w-xs">
                                        <div className="label my-2">
                                            <span className="label-text">Age</span>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Type here"
                                            value={age}
                                            className="input input-bordered w-full bg-white"
                                            onChange={(e) => setAge(e.target.value)}
                                        />
                                    </label>

                                    <label className="form-control w-full max-w-xs">
                                        <div className="label my-2">
                                            <span className="label-text">Gender</span>
                                        </div>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="select select-bordered w-full bg-white"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </label>

                                    <label className="form-control w-full max-w-xs">
                                        <div className="label my-2">
                                            <span className="label-text">About</span>
                                        </div>
                                        <textarea
                                            placeholder="Type here"
                                            value={about}
                                            className="textarea textarea-bordered w-full bg-white"
                                            onChange={(e) => setAbout(e.target.value)}
                                        />
                                    </label>

                                    <label className="form-control w-full max-w-xs">
                                        <div className="label my-2">
                                            <span className="label-text">Photo URL</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Type here"
                                            value={photoUrl}
                                            className="input input-bordered w-full bg-white"
                                            onChange={(e) => setPhotoUrl(e.target.value)}
                                        />
                                    </label>
                                </div>

                                <p className="text-red-600">{error}</p>

                                <div className="card-actions justify-end py-4">
                                    <button className="btn btn-primary" onClick={saveProfile}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                    <UserCard user={{ firstName, lastName, age, gender, photoUrl, about }} />
                    </div>
                </div>

                {showToast && (
                    <div className="toast toast-top toast-center">
                        <div className="alert alert-success">
                            <span>Profile saved successfully.</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

};

EditProfile.propTypes = {
    user: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        age: PropTypes.string,
        gender: PropTypes.string,
        photoUrl: PropTypes.string,
        about: PropTypes.string,
    }).isRequired
};


export default EditProfile;
