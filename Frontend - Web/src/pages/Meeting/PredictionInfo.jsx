import React from "react";
import PropTypes from "prop-types";
import "./CallPage.scss";

const PredictionInfo = ({ topPrediction, getConfidenceClass }) => (
	<div className="prediction-info">
		<strong>Top Predictions:</strong>
		<span style={{ display: "flex", gap: 5 }}>
			{topPrediction.label}
			<span className={getConfidenceClass(topPrediction.probability)}>
				({topPrediction.probability.toFixed(2)}%)
			</span>
		</span>
	</div>
);

PredictionInfo.propTypes = {
	topPrediction: PropTypes.object.isRequired,
	getConfidenceClass: PropTypes.func.isRequired,
};

export default PredictionInfo;
