import React, { useRef, useState, useEffect } from "react";

const TogglePoint = ({ title, content, activeToggle, isActive, order, setActiveToggle }) => {
    const contentRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState("0px");

    // Function to update maxHeight dynamically
    const updateHeight = () => {
        if (contentRef.current) {
            if (isActive) {
                setMaxHeight(`${contentRef.current.scrollHeight}px`);
            } else {
                setMaxHeight("0px");
            }
        }
    };

    // Update height when toggling
    useEffect(() => {
        updateHeight();
    }, [isActive]);

    // Handle window resize dynamically
    useEffect(() => {
        const handleResize = () => {
            if (isActive) updateHeight();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isActive]);

    // Manage click event
    const handleClick = () => {
        setActiveToggle(prev => 
            prev.includes(order) ? prev.filter(item => item !== order) : [...prev, order]
        );
    };

    return (
        <section className="border-d-gray rounded w-full max-w-[800px] mx-auto">
            {/* ============= Point's Heading ============= */}
            <div className="head flex justify-between items-center p-3 bg-d-gray cursor-pointer" onClick={handleClick}>
                <h2 className={`text-lg ${isActive ? "white-c" : "gray-m-c"}`}>{title}</h2>
                <i className={`fa-solid fa-caret-down text-2xl trans-3 ${isActive ? "white-c rotate-180" : "gray-m-c"}`}></i>
            </div>
            {/* ============= Point's Body ============= */}
            <div 
                ref={contentRef} 
                className="body rounded overflow-hidden trans-3" 
                style={{ maxHeight, transition: "max-height 0.3s ease-in-out" }}
            >
                <p className="p-4 gray-dark-c rounded">{content}</p>
            </div>
        </section>
    );
};

export default TogglePoint;
