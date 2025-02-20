import PropTypes from 'prop-types';

const UserCard = ({ user }) => {
    const { firstName, lastName, age, gender, photoUrl, about } = user;
    

    const handleSendRequest = async (status)



    return (
        <div className="card bg-base-400 w-96 shadow-xl">
            <figure>
                <img
                    alt="photo"
                    src={user.photoUrl}
                />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{firstName + " " + lastName}</h2>
                {age && gender && <p>{age + "," + gender}</p>}
                <p>{about}</p>
                <div className="card-actions justify-end m-auto ">
                    <button className="btn btn-primary">Ignore</button>
                    <button className="btn btn-primary border-b-gray-700">Interested</button>
                </div>
            </div>
        </div>
    )
}

UserCard.propTypes = {
    user: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        about: PropTypes.string,
        gender: PropTypes.string,
        age: PropTypes.number,
        photoUrl: PropTypes.string
    }).isRequired
};

export default UserCard;


