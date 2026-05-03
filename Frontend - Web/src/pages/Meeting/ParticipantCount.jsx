import { FaUser } from "react-icons/fa";

export const ParticipantCount = ({ count, max }) => (
	<div className="participant-count">
		<FaUser className="mr-2" />
		<span>
			{count}/{max}
		</span>
	</div>
);
