import React from "react";
import { useSelector } from "react-redux";
import ProfileHeader from "./components/ProfileHeader";
import ProfileDetails from "./components/ProfileDetails";
import CallsHistory from "./CallsHistory/CallsHistory";
import "./Profile.scss";

const Profile = () => {
    const { username, email, image, userId } = useSelector(
        (state) => state.api.userData
    );

    return (
        <div className="Profile min-h-page w-screen overflow-hidden">
            <div className="container py-10">
                <div className="profile-container bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                    <ProfileHeader
                        username={username}
                        userId={userId}
                        image={image}
                    />
                    <ProfileDetails
                        username={username}
                        email={email}
                        userId={userId}
                    />

                    {/* Calls History Section */}
                    <div className="calls-history-section mt-8">
                        <CallsHistory />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
