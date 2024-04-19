import { useState } from "react";
import RoomScheduler from "../components/temp";
import RoomSearch from "../components/RoomSearch";


export const Home = () => {
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    const handleSelectRoom = (roomId) => {
        // Update the selectedRoomId state when a room is selected
        setSelectedRoomId(roomId);
    }
    console.log(selectedRoomId, "home")

    return <div>
        <div className="grid grid-cols-2">
            <div className="bg-blue-100 h-screen-full">
                <div className="flex flex-col justify-center">
                    <div className="mt-20">
                        <RoomSearch onSelectRoom={handleSelectRoom} />

                    </div>

                </div>
            </div>
            <div className="p-20">
                <RoomScheduler room_id={selectedRoomId} />
            </div>
        </div>

    </div>
}