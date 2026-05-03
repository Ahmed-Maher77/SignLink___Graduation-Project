import Card from "./Card";
import Icon from "./Icon";

const StatsSection = () => {
	const features = [
		{
			icon: <Icon name="translation" />,
			title: "Instant Translation",
			content: (
				<>
					<span className="font-bold text-indigo-600">98.7% accuracy</span> in
					real-time sign language to speech conversion with latency under 500ms
				</>
			),
		},
		{
			icon: <Icon name="accessibility" />,
			title: "Full Accessibility",
			content: (
				<>
					Works seamlessly with:<br/>
          <p><b> ✓ </b>Keyboard controls & Screen readers</p>
          <p><b> ✓ </b>Custom text sizing </p>
				</>
			),
		},
		{
			icon: <Icon name="security" />,
			title: "Secure & Private",
			content: (
				<>
					Private conversations protected like bank transactions, meeting global privacy standards
				</>
			),
		},
	];

	return (
		<section className="bg-white py-16">
			<div className="container mx-auto px-6">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Why Choose SignLink?
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto text-lg">
						Empowering communication through cutting-edge technology and
						inclusive design
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card key={index} icon={feature.icon} title={feature.title}>
							{feature.content}
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default StatsSection;
