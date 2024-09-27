import React, { useEffect, useState } from 'react';
import useUser from "../../hooks/useUser";
import VideoStream from "./VideoStream";
import Viewer from "./Viewer";
import axios from 'axios';
import '../../scss/pages/OneToManyMeet/Room.scss';

const Room = () => {
    const { user } = useUser();
    const [connectedUsers, setConnectedUsers] = useState([]);
    console.log(connectedUsers)
    useEffect(() => {
        const fetchConnectedUsers = async () => {
            try {
                const response = await axios.get('/connected-users');
                setConnectedUsers(response.data);
            } catch (error) {
                console.error("Error fetching connected users:", error);
            }
        };

        // Fetch connected users every 5 seconds
        const intervalId = setInterval(fetchConnectedUsers, 5000);
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    // Filter out the current user from the connected users list
    const filteredUsers = connectedUsers.filter(connectedUser => connectedUser.user_id !== user?.id && connectedUser.username !== 'Emira');

    // Determine the first 5 users and the count of the remaining users
    const firstFiveUsers = filteredUsers.slice(0, 5);
    const remainingUsersCount = filteredUsers.length - 5;

    return (
        <div className='room'>
            {/* VideoStream or Viewer based on user role */}
            {user && user.role === 'admin' ? (
                <VideoStream user={user} />
            ) : user && user.role !== 'admin' ? (
                <Viewer user={user} />
            ) : null}

            <div className='users'>
                {/* Display the first 5 users, excluding the current user */}
                {firstFiveUsers.map(user => (
                    <div key={user.id} className='user-container'>{user.username}</div>
                ))}

                {/* If there are more than 5 users, display the count of remaining users */}
                {remainingUsersCount > 0 && (
                    <div className='user-container'>
                        {`+${remainingUsersCount} more users`}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Room;
