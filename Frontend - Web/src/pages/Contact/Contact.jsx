import React from "react";
import SectionHeading from "../../components/Section_Heading/SectionHeading";
import ContactMedia from "../../components/Contact_Media/ContactMedia";

const Contact = () => {
	const contactMedias = [
		{
			title: "Support Hotline",
			icon: "fa-solid fa-phone",
			value: "+201096528514",
			dividerAfter: true,
		},
		{
			title: "Email Support",
			icon: "fa-solid fa-envelope",
			value: "ahmedmaher.dev1@gmail.com",
			dividerAfter: false,
		},
	];

	return (
		<div className="Contact-Page" style={{minHeight: "calc(100vh - 60px)"}}>
			<div className="container py-5">
				<SectionHeading title="Contact Us" />
				{/* ===== Stay Connected ======= */}
				<section className="mt-16">
					<h2 className="font-semibold text-xl mb-3 text-center">
						Stay Connected, Seamlessly
					</h2>
					<p className="lg:text-center">
						Have questions, feedback, or need assistance? Our team is here to
						support you. <br />
						Let’s make communication more accessible for everyone!
					</p>
				</section>
				{/* ===== Contact Info ======= */}
				<>
				<section className="contact-info bg-gray-100 rounded-3xl p-4 md:p-6 mt-9 max-w-[700px] mx-auto">
					<h3 className="text-gray-600 font-semibold text-xl mb-5">
						<span className="font-bold text-gray-700">24/7</span> Customer Support
					</h3>
					<main className="flex flex-col gap-3 mt-2">
						{contactMedias.map((contact, i) => (
							<ContactMedia key={i} title={contact.title} icon={contact.icon} value={contact.value} dividerAfter={contact.dividerAfter} />
						))}
					</main>
				</section>
				</>
			</div>
		</div>
	);
};

export default Contact;
