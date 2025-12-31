export function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm
        focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-200
        placeholder:text-gray-400 text-gray-800 ${className}`}
            {...props}
        />
    );
}
