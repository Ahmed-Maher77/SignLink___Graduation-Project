import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

function RequireAuth({ children }) {
	const isAuth = useSelector((state) => state.api.isAuth);
	const navigate = useNavigate();
	const { pathname } = useLocation();

	// Check if the user is authenticated and not on the login page
	useEffect(() => {
		if (isAuth && pathname === "/login") {
			navigate("/");
		}
	}, [isAuth, pathname, navigate]);

	const handleRegisterClick = () => {
		navigate("/login", { state: { from: pathname } });
	};

	// Allow access to login page regardless of auth status
	if (pathname === "/login") {
		return children;
	}

	if (isAuth) {
		return children;
	} else {
		// return null;                    // uncomment => redirect to login page automatically
		return (
			<div
				className="flex justify-center items-center"
				style={{ height: "calc(100vh - 60px)" }}
			>
				<div className="container text-center p-3 text-lg md:text-xl lg:text-2xl">
					<h1 className="mb-10 md:mb-14">
						You need to <strong>register</strong> to access this page.
					</h1>

					<button
						onClick={handleRegisterClick}
						className="btn-main text-lg md:text-xl animated-hover-wraper"
						title="go to Login Page"
					>
						Register{" "}
						<span className="fa-solid fa-arrow-right-to-bracket ms-2 animated-hover-x"></span>
					</button>
				</div>
			</div>
		);
	}
}

export default RequireAuth;
