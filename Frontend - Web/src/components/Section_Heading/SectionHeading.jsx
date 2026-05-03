import React from "react";
import "./SectionHeading.scss";

const SectionHeading = ({ title, className }) => {
	return (
		<div className="Section-Heading">
			<h1 className={`text-center text-4xl lg:text-5xl font-bold ${className}`}>{title}</h1>
			<span></span>
		</div>
	);
};

export default SectionHeading;
