import UpToTop_Button from "../../components/UpToTop_Button/UpToTop_Button";
import SocialIcon from "./SocialIcon";
import SocialLinks from "./SocialLinks";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	const sections = [
		{
			title: "Product",
			links: [
				{ to: "/about", label: "Features" },
				{ to: "/meeting", label: "How It Works" },
				{ to: "/download", label: "Download" },
			],
		},
		{
			title: "Support",
			links: [
				{ to: "https://github.com/YoussifShaabanQzamel/Sign-Link-Graduation-Project", label: "Documentation" },
				{ to: "/contact", label: "Contact Us" },
				{ to: "/about", label: "About Us" },
			],
		},
	];

	const socialLinks = [
        {
            href: "https://ahmedmaher-portfolio.vercel.app/",
            label: "Portfolio",
            path: "M10 2a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-4V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-6 4h16v10H4V8z",
        },          
        {
            href: "https://www.linkedin.com/in/ahmed-maher-algohary",
            label: "LinkedIn",
            path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
        },
		{
			href: "https://web.facebook.com/profile.php?id=100012154268952",
			label: "Facebook",
			path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
		},
		{
            href: "https://github.com/Ahmed-Maher77",
            label: "GitHub",
            path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.207 11.385.6.113.793-.258.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.49.997.108-.775.42-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.123-.303-.535-1.523.116-3.176 0 0 1.008-.322 3.3 1.23a11.49 11.49 0 013.005-.404c1.02.005 2.045.138 3.005.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.873.117 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.432.372.814 1.103.814 2.222 0 1.606-.014 2.898-.014 3.293 0 .318.192.694.798.577C20.565 22.092 24 17.594 24 12.297c0-6.627-5.373-12-12-12z",
        },          
	];

	return (
		<footer className="text-gray-100" style={{ backgroundColor: "#027372" }}>
			<div className="container mx-auto px-6 py-12 pb-20">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Brand Section */}
					<div className="space-y-4">
						<h3 className="text-2xl font-bold text-white">SignLink</h3>
						<p className="text-sm">
							Breaking communication barriers through AI-powered sign language
							translation.
						</p>
					</div>

					{/* =============== Footer Links =============== */}
					{sections.map((section) => (
						<SocialLinks key={section.title} {...section} />
					))}
				</div>

				<div className="border-t border-[#4db6ac] my-8" />

				<div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
					<div className="max-md:text-sm">
						© {currentYear} <strong className="font-semibold">SignLink</strong>. All rights reserved.
					</div>

					<div className="flex space-x-6">
						{socialLinks.map((social) => (
							<SocialIcon key={social.label} {...social} />
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
