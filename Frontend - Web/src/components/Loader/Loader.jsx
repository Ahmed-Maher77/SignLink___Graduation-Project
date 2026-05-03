import React from "react";
import "./Loader.scss";

const Loader = ({ customStyle }) => {
	return <div className={`loader ${customStyle}`}></div>;
};

export default Loader;
