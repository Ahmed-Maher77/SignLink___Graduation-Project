const Card = ({ icon, title, children }) => (
	<div className="p-6 bg-indigo-50 rounded-xl transition-all hover:bg-indigo-100">
		<div className="w-12 h-12 bg-main rounded-lg flex items-center justify-center mb-4">
			{icon}
		</div>
		<h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
		<div className="text-gray-600">{children}</div>
	</div>
);

export default Card;
