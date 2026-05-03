import React from "react";

const SocialIcon = ({ href, label, path }) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		className="hover:text-slate-700 trans-3"
	>
		<span className="sr-only">{label}</span>
		<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
			<path d={path} />
		</svg>
	</a>
);

export default SocialIcon;
