import React from "react";
import "./FeatureCard.scss";

const FeatureCard = ({ title, description, icon }) => {
	return (
		<div className="Feature-Card flex flex-col gap-7 text-center bg-gray rounded-md p-5 py-7 max-w-[500px] mx-auto">
			<header>
				<span className="feature-icon flex mx-auto text-3xl bg-main w-[60px] h-[60px] justify-center items-center rounded-full">
					<span className={`text-2xl white-c ${icon}`}></span>
				</span>
				<h3 className="text-lg font-medium mt-3 trans-3">{title}</h3>
			</header>
			<p className="text-slate-700 trans-3">{description}</p>
		</div>
	);
};

export default FeatureCard;
