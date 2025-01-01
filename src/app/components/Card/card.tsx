interface CardProps {
    title: string;
    description: string;
    link: string;
    buttonText: string;
}

export default function Card({ title, description, link, buttonText }: CardProps) {
    return (
        <div className="w-72 max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white border-2 border-blue-500">
            <div className="px-6 py-4">
                <h2 className="font-semibold text-m mb-2 text-black">{title}</h2>
                <p className="text-gray-600 text-sm">{description}</p>
                <a
                    href={link}
                    className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                    {buttonText}
                </a>
            </div>
        </div>
    );
}