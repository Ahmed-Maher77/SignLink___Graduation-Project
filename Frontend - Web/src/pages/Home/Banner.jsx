import React from "react";
import { NavLink } from "react-router-dom";

const Banner = () => {
	return (
        <section className="bg-main py-11">
        <div className="container text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Start Communicating?</h2>
            <p className="text-indigo-100 mb-8 md:text-lg">Join thousands of users experiencing barrier-free conversations</p>
            <NavLink to="/meeting" className="bg-white color-main px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors shadow-lg">
                Start Free Call Now
            </NavLink>
        </div>
    </section>
    );
};

export default Banner;
