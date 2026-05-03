import React from "react";
import "./SubHeading.scss";

const SubHeading = ({ title, className }) => {
	return (
		<div className={`sub-heading ${className}`}>
			<h2 className="text-center text-3xl font-bold w-fit mx-auto">{title}</h2>
		</div>
	);
};

export default SubHeading;
