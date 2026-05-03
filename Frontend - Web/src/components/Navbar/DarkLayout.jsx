import React, { useEffect } from "react";

const DarkLayout = () => {
	useEffect(() => {
		document.body.classList.add("prevent-scrolling");
		return () => document.body.classList.remove("prevent-scrolling");
	})
	return (
		<div style={{zIndex: "9"}} className="dark-layout fixed w-full h-full top-0 left-0 bg-neutral-500 opacity-[0.6]"></div>
	);
};

export default DarkLayout;
