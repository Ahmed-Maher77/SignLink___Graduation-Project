import React from "react";
import Loader from "./Loader";

const MainLoader = () => {
	return (
		<div className="Main-Loader w-screen h-screen flex items-center justify-center bg-white">
			<Loader />
		</div>
	);
};

export default MainLoader;
