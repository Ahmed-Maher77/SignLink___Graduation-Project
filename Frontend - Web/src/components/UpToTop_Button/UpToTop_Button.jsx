import React, { useEffect, useState } from "react";
import "./UpToTop_Button.scss";

const UpToTop_Button = () => {
    const [showUpToTop_Button, setShowUpToTop_Button] = useState(window.scrollY > 100);
    
    useEffect(() => {
        const handleScroll = () => {
            setShowUpToTop_Button(window.scrollY > 100)
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])
	
    return (
		<button
			type="button"
			className={`showUpToTop_Button fixed bottom-4 bg-main white-c w-[50px] h-[50px] rounded-full flex justify-center items-center trans-3 ${showUpToTop_Button? "right-6" : "right-[-200px]"}`}
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
		>
			<span className="fas fa-arrow-up"></span>
		</button>
	);
};

export default UpToTop_Button;
