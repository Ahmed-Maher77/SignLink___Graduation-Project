import React from "react";

const instructions = [
    "Click the 'Open Camera' button to enable your camera and microphone.",
    "Use the 'Mute' and 'Stop Camera' buttons to control your audio and video.",
    "Click the 'Start Call' button to create a new meeting, or 'Join Call' to join an existing meeting",
    "Click the 'Share' or 'Copy' icon to share the Call ID with participants to join the call.",
    "Only the 'Person who created the Call' can close it.",
];

const Instructions = () => {
    const renderInstruction = (instruction) => {
        // Split the instruction by single quotes
        const parts = instruction.split("'");
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                // Odd indices are inside quotes
                return <b key={index}>{part}</b>;
            }
            return part;
        });
    };

    return (
        <main className="bg-gray-100 p-5 rounded-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-6">
                <i className="fa-solid fa-circle-question text-blue-600 text-2xl"></i>
                How to Start a Call:
            </h2>
            <ul className="space-y-4 text-gray-700">
                {instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-[8px]">
                        <i className="fa-solid fa-check-circle text-green-500 text-lg mt-[5px]"></i>
                        <span>
                            {renderInstruction(instruction)}{" "}
                            {/* Render the instruction with bolded words */}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Browser Requirement Hint */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <i className="fa-solid fa-lightbulb text-blue-600 text-lg mt-[2px]"></i>
                    <div>
                        <h3 className="text-sm font-semibold text-blue-800 mb-1">
                            Browser Recommendation
                        </h3>
                        <p className="text-sm text-blue-700">
                            For optimal performance and access to all features,
                            use a modern browser (Chrome, Edge, Safari) and
                            ensure it's updated to the latest version.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Instructions;
