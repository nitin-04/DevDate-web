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
            const res = await axios.post(
                BASE_URL + "/request/send/" + status + "/" + userId,
                {},
                { withCredentials: true }
            );
            dispatch(removeUserFromFeed(userId))
        }
        catch (err) {
            console.error(err);

        }
    }



    return (
        <div className="card bg-base-400 w-96 shadow-xl">
            <figure>
                <img
                    alt="photo"
                    src={photoUrl}
                />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{firstName + " " + lastName}</h2>
                {age && gender && <p>{age + "," + gender}</p>}
                <p>{about}</p>
                <div className="card-actions justify-end m-auto ">
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSendRequest("ignored", _id)}
                    >Ignore</button>
                    <button
                        className="btn btn-primary border-b-gray-700"
                        onClick={() => handleSendRequest("interested", _id)}
                    >Interested</button>
                </div>
            </div>
        </div>
    )
}

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


