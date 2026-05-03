import React from "react";
import SectionHeading from "../../components/Section_Heading/SectionHeading";
import TogglePointsContainer from "../../components/Toggle_Point/TogglePointsContainer";
import SubHeading from "../../components/Section_Heading/SubHeading.jsx";
import FeaturesContainer from "../../components/Features_Container/FeaturesContainer.jsx";

const missionAndStory = [
    {
        title: "Our Mission",
        content:
            "We believe in a world where communication knows no boundaries. Our app bridges the gap between sign language users and non-sign language users through cutting-edge translation technology, fostering inclusivity and connection.",
    },
    {
        title: "Our Story",
        content:
            "It all started with a desire to make technology accessible for the deaf community. By combining advanced AI with a passion for inclusivity, we've created an app that translates sign language in real time, helping people communicate effortlessly.",
    },
];

const About = () => {
    return (
        <div className="About-Page">
            <div className="container py-5">
                <SectionHeading title="About Us" />
                {/* Hero Section for Breaking Barriers in Communication */}
                <section className="w-full flex flex-col items-center my-10 animate-fade-in">
                    {/* Icon */}
                    <div className="text-5xl my-3">🤝</div>
                    <div className="w-full max-w-2xl text-center mb-2">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-blue-700">
                            Breaking Barriers in Communication
                        </h2>
                        <p className="text-lg md:text-xl font-medium text-gray-700">
                            Empowering conversations with innovative technology
                            for everyone.
                        </p>
                    </div>
                </section>
                {/* Mission and Story Toggle Section */}
                <section className="my-8">
                    <TogglePointsContainer togglePoints={missionAndStory} />
                </section>
                {/* ========== Key Features ========== */}
                <section className="features">
                    <SubHeading title="Key Features" className="mt-12" />
                    <FeaturesContainer />
                </section>
            </div>
        </div>
    );
};

export default About;
