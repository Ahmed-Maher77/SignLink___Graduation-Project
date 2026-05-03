import React from "react";
import { NavLink } from "react-router-dom";

const SocialLinks = ({ title, links }) => {
	return (
		<div className={title === "Product"? "lg:ms-4" : ""}>
			<h4 className="text-white font-semibold mb-4 text-lg">{title}</h4>
			<ul className="space-y-2">
				{links.map(({ to, label }) => (
					<li key={to}>
						{label === "Documentation"? (
							<a className="hover:font-semibold trans-3 transition-colors" href={to} target="_blank" title="go to Documentation">Documentation</a>
						): (
						<NavLink
							to={to}
							className="hover:font-semibold trans-3 transition-colors"
						>
							{label}
						</NavLink>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default SocialLinks;
