import React from "react";
import "./ContactMedia.scss";

const ContactMedia = ({ title, icon, value, dividerAfter }) => {
	function selectSuitableHref() {
		switch (title) {
			case "Support Hotline":
				return `https://wa.me/${value}?text=Hello%20SignLink!`;
			case "Email Support":
				return `mailto:${value}?subject=Inquiry&body=Hello,%20I%20have%20a%20question%20about%20your%20services.`;
			default:
				return "#";
		}
	}

	return (
		<>
			<div className={`contact-mdeia flex gap-4 py-3 space-x-3 items-center ${dividerAfter && "divider"}`}>
				<span className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
					<span className={`text-indigo-600 ${icon}`}></span>
				</span>
				<div className="flex-1">
					<h3 className="text-sm font-medium text-gray-500">{title}</h3>
					{/* ==== Link ===== */}
					<a
						className="hover:text-indigo-600 trans-3 underline text-lg text-gray-800 font-medium"
						target="_blank"
						title={title}
						href={selectSuitableHref()}
					>
						{value}
					</a>
				</div>
			</div>
		</>
	);
};

export default ContactMedia;