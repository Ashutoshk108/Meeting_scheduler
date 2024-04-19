import { useState, useEffect } from "react";
import axios from "axios";
import { RoomBox } from "./RoomBox";

export const Rooms = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get("http://localhost/api/v1/all/rooms", { withCredentials: true });
                console.log(response.data)
                setRooms(response.data);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();
    }, []);

    return (
        <div className="container ml-10">

            {rooms.map((room) => (
                <RoomBox
                    key={room.id}
                    room_name={room.room_name}
                    room_capacity={room.capacity}
                    room_tags={room.tags}
                />
            ))}
        </div>
    );
};