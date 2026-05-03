import React, { Fragment, useState } from "react";
import TogglePoint from "./TogglePoint";
import SubHeading from "../Section_Heading/SubHeading";

const TogglePointsContainer = ({ togglePoints }) => {
	const [activeToggle, setActiveToggle] = useState([1]);

	return (
		<main className="my-10 mt-14 flex flex-col gap-7">
			{togglePoints.map((point, i) => (
				<Fragment key={i}>
					{i + 1 === 2 && <SubHeading title="Who We Are" className="mt-6" />}
					<TogglePoint
						title={point.title}
						content={point.content}
						activeToggle={activeToggle}
						isActive={activeToggle.includes(i + 1)}
						order={i + 1}
						setActiveToggle={setActiveToggle}
					/>
				</Fragment>
			))}
		</main>
	);
};

export default TogglePointsContainer;
