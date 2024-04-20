import React, { useState, useEffect } from 'react';
import { RoomBox } from './RoomBox';
import axios from 'axios';

const RoomSearch = ({ onSelectRoom }) => {
    const [allRooms, setAllRooms] = useState([]);
    const [displayedRooms, setDisplayedRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('room_name');
    const [roomId, setRoomId] = useState();

    useEffect(() => {
        const fetchAllRooms = async () => {
            try {
                const response = await axios.get(`http://localhost:8787/api/v1/rooms/search`, { withCredentials: true });
                setAllRooms(response.data);
                setDisplayedRooms(response.data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setAllRooms([]);
                setDisplayedRooms([]);
            }
        };

        fetchAllRooms();
    }, []);

    const handleSearch = () => {
        let filteredRooms = allRooms;
        if (searchQuery.trim() !== '') {
            if (searchType === 'room_name') {
                filteredRooms = allRooms.filter((room) =>
                    room.room_name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            } else {
                filteredRooms = allRooms.filter((room) =>
                    room.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            }
        }
        setDisplayedRooms(filteredRooms);
    };
    const handleRoomId = (roomId) => {
        onSelectRoom(roomId)
        setRoomId(roomId)
    }

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchTypeChange = (event) => {
        setSearchType(event.target.value);
    };
    console.log(roomId)
    return (
        <div>
            <div className="mb-10 flex flex-row justify-center invisible lg:visible">
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md"
                />
                <select
                    value={searchType}
                    onChange={handleSearchTypeChange}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md"
                >
                    <option value="room_name">Search by Room Name</option>
                    <option value="tag_name">Search by Tag Name</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    Search
                </button>
            </div>
            <div>
                <div className="container ml-10">
                    {displayedRooms.map((room) => (
                        <RoomBox
                            key={room.id}
                            room_id={room.id}
                            room_name={room.room_name}
                            room_capacity={room.capacity}
                            room_tags={room.tags}
                            onClick={handleRoomId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomSearch;