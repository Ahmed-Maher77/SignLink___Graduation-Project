import { useSelector } from "react-redux";
import useFetchUserImage from "../../utils/custom_hooks/userData/useFetchUserImage";
import React, { useState, useRef, useEffect } from "react";
import "./Profile_Dropdown.scss";
import ProfileMenu from "./ProfileMenu";

const Profile_Dropdown = () => {
    const { username, image, userId } = useSelector(
        (state) => state.api.userData
    );
    const { data, isLoading, error } = useFetchUserImage(userId, image);

    const [isOpen, setIsOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsOpen(false);
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset image error when image URL changes
    useEffect(() => {
        setImageError(false);
    }, [data?.photoUrl]);

    const getUsernameLetter = () => {
        const firstLetter = username?.trim()[0]?.toUpperCase();
        return firstLetter || "?";
    };

    return (
        <div
            className="Profile_Dropdown dropdown max-lg:hover:bg-[#6e6f72ab] trans-3"
            ref={dropdownRef}
            onClick={toggleDropdown}
        >
            <figure>
                {image && data?.photoUrl && !isLoading && !imageError ? (
                    <img
                        src={data.photoUrl}
                        alt={`${username} picture`}
                        className="w-full h-full block"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="profile-icon">{getUsernameLetter()}</div>
                )}
            </figure>

            <span className="block lg:hidden">My Profile</span>

            {/* ============================== Dropdown menu ============================== */}
            {isOpen && <ProfileMenu setIsOpen={setIsOpen} />}
        </div>
    );
};

export default Profile_Dropdown;
