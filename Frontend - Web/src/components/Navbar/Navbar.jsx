import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.scss";
import NavItem from "./NavItem";
import { useEffect, useRef, useState } from "react";
import DarkLayout from "./DarkLayout";
import { useSelector } from "react-redux";
import Profile_Dropdown from "../Profile_Icon/Profile_Dropdown";

const Navbar = () => {
	const sidebarRef = useRef(null);
	const closeBtnRef = useRef(null);
	const [activeSidebar, setActiveSidebar] = useState(false);
	const isLargeScreen = useSelector((state) => state.windowScreen.isLargeScreen);
	const { username } = useSelector((state) => state.api.userData);
	const isAuth = useSelector((state) => state.api.isAuth);
	const location = useLocation();
	const navLinks = [
		{ name: "Home", path: "/", icon: "fa-solid fa-house" },
		{ name: "About", path: "/about", icon: "fa-solid fa-handshake-angle" },
		{ name: "Start a Call", path: "/meeting", icon: "fa-solid fa-headset" },
		{ name: "Contact Us", path: "/contact", icon: "fa-solid fa-comment-nodes" },
		{ name: "Login", path: "/login" },
	];

	// Close sidebar when route changes
	useEffect(() => {
		setActiveSidebar(false);
	}, [location]);

	// Handle click outside and escape key
	useEffect(() => {
		if (!activeSidebar) return;

		const handleClick = (e) => {
			const sidebar = sidebarRef.current;
			const closeBtn = closeBtnRef.current;

			// Get all anchor elements within the sidebar
			const navLinksElements = Array.from(sidebar?.querySelectorAll("a") || []);
			const allowedElements = closeBtn
				? [closeBtn, ...navLinksElements]
				: [...navLinksElements];

			// Check if the click is on an allowed element or outside the sidebar
			const isClickOnAllowed = allowedElements.some((el) =>
				el?.contains(e.target)
			);
			const isClickInsideSidebar = sidebar?.contains(e.target);

			if (isClickOnAllowed || !isClickInsideSidebar) {
				setActiveSidebar(false);
			}
		};

		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				setActiveSidebar(false);
			}
		};

		document.addEventListener("click", handleClick);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("click", handleClick);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeSidebar]);

	return (
		<div className="Navbar bg-main text-lg white-c">
			<div className="container flex justify-between items-center min-h-[60px]">
				{/* ======= Logo ======= */}
				<h1 className="font-semibold text-xl 2xl:text-2xl">
					<NavLink to="/">
						Sign<span className="orange-c">Link</span>
					</NavLink>
				</h1>
				{/* ======= Burger Icon ======= */}
				<span
					className="fa-solid fa-bars text-3xl lg:hidden"
					onClick={(e) => {
						e.stopPropagation(); // Stop event propagation
						setActiveSidebar(true);
					}}
				></span>
				{activeSidebar && !isLargeScreen && <DarkLayout />}
				{/* ======= NavItems ======= */}
				<nav
					className={`bg-main lg:bg-transparent max-lg:fixed ${
						activeSidebar ? "max-lg:right-0" : "max-lg:right-[-100%]"
					} max-lg:top-0 max-lg:w-[300px] max-lg:h-full`}
					ref={sidebarRef}
				>
					<ul className="flex gap-1 max-lg:flex-col lg:items-center">
						{activeSidebar && (
							<span
								className="fa-solid fa-xmark text-3xl ms-auto me-5 mt-4 mb-6"
								ref={closeBtnRef}
							></span>
						)}
						{navLinks.map((link, i) => {
							return <NavItem key={i} link={link} icon={link.icon} />;
						})}

						{/* ======= Profile Icon ======= */}
						{isAuth && (
							<div className="profile cursor-pointer">
								<Profile_Dropdown />
							</div>
						)}
					</ul>
				</nav>
			</div>
		</div>
	);
};

export default Navbar;
