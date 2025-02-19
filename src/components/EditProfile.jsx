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
    const [age, setAge] = useState(user.age);
    const [gender, setGender] = useState(user.gender);
    const [about, setAbout] = useState(user.about);
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

            console.log("Response Data:", res.data);
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
            <div className="flex justify-center my-10">
                <div className="flex justify-center mx-10">
                    <div className="card bg-gray-800 w-96  shadow-xl">
                        <div className="card-body ">
                            <h2 className="card-title justify-center">Edit Profile</h2>
                            <div >
                                <label className="form-control w-full max-w-xs  ">
                                    <div className="label">
                                        <span className="label-text">first Name</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type here"
                                        value={firstName}
                                        className="input input-bordered w-full max-w-xs"
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </label>
                                <label className="form-control w-full max-w-xs  ">
                                    <div className="label">
                                        <span className="label-text">Last Name</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type here"
                                        value={lastName}
                                        className="input input-bordered w-full max-w-xs"
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </label>
                                <label className="form-control w-full max-w-xs  ">
                                    <div className="label">
                                        <span className="label-text">Age</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type here"
                                        value={age}
                                        className="input input-bordered w-full max-w-xs"
                                        onChange={(e) => setAge(e.target.value)}
                                    />
                                </label>
                                <label className="form-control w-full max-w-xs  ">
                                    <div className="label">
                                        <span className="label-text">Gender</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type here"
                                        value={gender}
                                        className="input input-bordered w-full max-w-xs"
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                </label>
                                <label className="form-control w-full max-w-xs  ">
                                    <div className="label">
                                        <span className="label-text">About</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type here"
                                        value={about}
                                        className="input input-bordered w-full max-w-xs"
                                        onChange={(e) => setAbout(e.target.value)}
                                    />
                                </label>
                                <label className="form-control w-full max-w-xs  ">
                                    <div className="label">
                                        <span className="label-text">PhotoUrl</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type here"
                                        value={photoUrl}
                                        className="input input-bordered w-full max-w-xs"
                                        onChange={(e) => setPhotoUrl(e.target.value)}
                                    />
                                </label>

                            </div>
                            <p className="text-red-600">{error}</p>
                            <div className="card-actions justify-end py-10">
                                <button
                                    className="btn btn-primary"
                                    onClick={saveProfile}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <UserCard user={{ firstName, lastName, age, gender, photoUrl, about }} />
            </div>
            {showToast && (
                <div className="toast toast-top toast-center">
                    <div className="alert alert-success">
                        <span>Profile saved successfully.</span>
                    </div>
                </div>
            )}
        </>
    )

};

EditProfile.propTypes = {
    user: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        age: PropTypes.number,
        gender: PropTypes.string,
        photoUrl: PropTypes.string,
        about: PropTypes.string,
    }).isRequired
};


export default EditProfile;
