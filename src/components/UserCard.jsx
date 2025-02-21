import PropTypes from 'prop-types';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';
import { removeUserFromFeed } from '../utils/feedSlice';
import { useDispatch } from 'react-redux';

const UserCard = ({ user }) => {
    const dispatch = useDispatch();
    const { _id, firstName, lastName, age, gender, photoUrl, about } = user;

    const handleSendRequest = async (status, userId) => {
        try {
            await axios.post(
                BASE_URL + "/request/send/" + status + "/" + userId,
                {},
                { withCredentials: true }
            );
            dispatch(removeUserFromFeed(userId));
            
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-80 text-black">
            <img className="w-full h-40 object-cover rounded-md" src={photoUrl} alt="User" />
            <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold">{firstName} {lastName}</h2>
                {age && gender && <p className="text-gray-500">{age}, {gender}</p>}
                <p className="text-gray-700 mt-2">{about}</p>
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                        onClick={() => handleSendRequest("ignored", _id)}
                    >Ignore</button>
                    <button
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-green-600 cursor-pointer"
                        onClick={() => handleSendRequest("interested", _id)}
                    >Interested</button>
                </div>
            </div>
        </div>
    );
};

UserCard.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        about: PropTypes.string,
        gender: PropTypes.string,
        age: PropTypes.number,
        photoUrl: PropTypes.string
    }).isRequired
};

export default UserCard;