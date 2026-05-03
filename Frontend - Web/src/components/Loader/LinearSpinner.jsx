import React from "react";
import loaderSvg from "../../assets/3-dots-scale.svg";

const LinearSpinner = ({ customClass }) => {
	return (
		<figure className="linear-spinner flex items-center gap-2 justify-center">
			<img
				src={loaderSvg}
				alt="spinner"
				className={`max-h-[40px] ${customClass}`}
			/>
		</figure>
	);
};

export default LinearSpinner;
