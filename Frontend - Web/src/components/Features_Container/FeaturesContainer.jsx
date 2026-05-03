import React from "react";
import FeatureCard from "./FeatureCard";

const features = [
    { 
        title: "AI-Powered Sign Language Translation", 
        icon: "fa-solid fa-hands",
        description: "Leverage advanced AI to instantly translate sign language into text or speech, bridging communication gaps effortlessly."
    },  
    { 
        title: "Seamless Video Communication", 
        icon: "fa-solid fa-video",
        description: "Enjoy high-quality video calls with built-in sign language recognition, ensuring smooth and natural conversations."
    },  
    { 
        title: "Inclusive & Accessible for All", 
        icon: "fa-solid fa-universal-access",
        description: "Designed for everyone, including the deaf and hard-of-hearing community, to make communication truly universal."
    }
];

const FeaturesContainer = () => {
	return (
		<div className="Features-Container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-9 my-8">
			{features.map((feature, i) => (
				<FeatureCard key={i} title={feature.title} icon={feature.icon} description={feature.description} />
			))}
		</div>
	);
};

export default FeaturesContainer;
