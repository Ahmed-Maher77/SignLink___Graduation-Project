import React from "react";
import { useDispatch } from "react-redux";
import { setIsAuth } from "../../utils/redux-toolkit/apiSlice";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const ProfileMenu = ({ setIsOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleProfileClick = () => {
        setIsOpen(false);
        navigate("/profile");
    };

    const handleLogout = () => {
        setIsOpen(false);
        dispatch(setIsAuth(false));
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
    };

	return (
		<div className="dropdown-menu">
			<div className="dropdown-item" onClick={handleProfileClick}>
				<span className="icon fa-solid fa-user"></span> My Profile
			</div>
			<div className="dropdown-divider" />
			<div className="dropdown-item logout" onClick={handleLogout}>
				<span className="icon fa-solid fa-person-walking-arrow-right"></span>{" "}
				Logout
			</div>
		</div>
	);
};

export default ProfileMenu;
