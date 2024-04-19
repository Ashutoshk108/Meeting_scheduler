import { useState, useEffect } from 'react';

export const RoomBox = ({
    room_id,
    room_name,
    room_capacity,
    room_tags,
    onClick,
}: any) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleRoomClick = () => {
        setIsClicked(true);
        onClick(room_id);
    };

    useEffect(() => {
        if (isClicked) {
            const timer = setTimeout(() => {
                setIsClicked(false);
            }, 300); // 3 seconds duration

            return () => clearTimeout(timer);
        }
    }, [isClicked]);

    return (
        <>
            <div
                className={`flex mb-4 w-4/5 border rounded-lg shadow md:flex-row md:max-w-xl transition-all duration-300 ${isClicked
                    ? 'bg-blue-100 scale-105 border-blue-400'
                    : 'bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                onClick={handleRoomClick}
                style={{ cursor: 'pointer' }}
            >
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-row justify-between items-center">
                        <div className="text-left font-bold text-xl p-4">{room_name}</div>
                        <div className="flex flex-wrap gap-2 p-4">
                            {room_tags.map((tag: string) => (
                                <div
                                    className={`px-3 py-1 rounded-full transition-colors duration-300 ${isClicked
                                        ? 'bg-blue-200 text-blue-800'
                                        : 'bg-gray-200 text-gray-700'
                                        } font-semibold`}
                                >
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-row justify-end font-semibold p-1 text-right">
                        Seat Capacity: {room_capacity}
                    </div>
                </div>
            </div>
        </>
    );
};