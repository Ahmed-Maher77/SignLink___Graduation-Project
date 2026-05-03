const Icon = ({ name }) => {
	const icons = {
		translation: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M13 10V3L4 14h7v7l9-11h-7z"
			/>
		),
		accessibility: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4M4 8h4m12 0h4M4 4h16"
			/>
		),
		security: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
			/>
		),
	};

	return (
		<svg
			className="w-6 h-6 text-white"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			{icons[name]}
		</svg>
	);
};

export default Icon;
