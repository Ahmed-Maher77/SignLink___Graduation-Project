import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";


function NavItem({ link, icon }) {
    const isAuth = useSelector(state => state.api.isAuth);
    const isLargeScreen = useSelector(state => state.windowScreen.isLargeScreen);

    if (link.name === "Login" && isAuth) return null;
    return (
        <li className={`${link.name === "Login" && !isLargeScreen ? "absolute bottom-[15px] w-full" : ""}`}>
            <NavLink to={link.path} className={`flex max-lg:text-xl max-lg:px-6 p-3 py-4 gap-3 items-center ${link.name === "Login" ? "login-btn max-lg:mt-6" : ""}`}>
                {icon && (<span className="lg:hidden">
                        <span className={`${icon}`}></span>
                    </span>)
                }

                {link.name === "Login" && <i className="fa-solid fa-arrow-right-to-bracket mt-1"></i>}
                {link.name}
            </NavLink>
        </li>
    );

}
export default NavItem;