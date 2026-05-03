import React from "react";

const Slide = ({ img, title, description }) => {
	return (
		<figure className="flex flex-col gap-4 lg:flex-row xl:flex-col lg:items-center lg:gap-10 lg:px-14 justify-between">
			<div className="img max-lg:max-w-[450px] max-lg:mx-auto lg:w-[40%] flex justify-center items-center">
				<img src={img} alt={title} className="" />
			</div>
			<figcaption className="text-center p-4 lg:p-0 max-lg:px-6 xl:w-[60%]">
				<h2 className="font-semibold text-xl mb-4 main-color md:text-2xl xl:text-3xl">{title}</h2>
				<p className="text-sm sm:text-base max-w-[500px] mx-auto md:text-lg">{description}</p>
			</figcaption>
		</figure>
	);
};

export default Slide;
