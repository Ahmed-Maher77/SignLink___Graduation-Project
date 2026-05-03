import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
	const navigate = useNavigate();
    const { pathname } = useLocation();

    // Redirect to meeting page if the URL ends with "/call"
    useEffect(() => {
        if (pathname.endsWith("/call") || pathname.endsWith("/call/")) {
            console.log("Redirecting to /meeting...");
            navigate("/meeting", { replace: true });
        }
    }, [pathname, navigate]);

	return (
		<div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-full text-center">
			<div className="container">
				<h1 className="text-4xl font-semibold">404 - Page Not Found</h1>
				<NavLink className="btn-black text-white p-4 px-6 block mx-auto mt-9 rounded-full w-fit animated-hover-wraper trans-3" to="/">
					<i className="fa-solid fa-arrow-left me-3 animated-hover-x"></i> Go
					Back To SignLink
				</NavLink>
			</div>
		</div>
	);
};

export default NotFound;
