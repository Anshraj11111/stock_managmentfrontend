const PricingCard = ({ plan, onSelect }) => {
  return (
    <div
      className={`rounded-2xl border p-8 shadow-lg transition-all duration-300 ${
        plan.highlight
          ? "border-indigo-600 scale-105 bg-white"
          : "border-gray-200 bg-white"
      }`}
    >
      <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
      <p className="text-3xl font-bold mb-1">{plan.price}</p>
      <p className="text-gray-500 mb-6">{plan.duration}</p>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="text-gray-700">
            ✔ {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl font-semibold ${
          plan.highlight
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        Get Started
      </button>
    </div>
  );
};

export default PricingCard;
