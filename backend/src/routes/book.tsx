import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { cors } from "hono/cors";

export const book = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();

book.use(cors({
    origin: "http://localhost:5173",
    credentials: true,

}))

book.use('/*', async (c, next) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const sessionKey = await getCookie(c, "sessionKey");
    console.log(sessionKey, 1);

    if (!sessionKey) {
        try {
            const today = new Date();
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const session = await prisma.sessions.create({
                data: {
                    expires_at: lastDayOfMonth
                }
            });

            console.log(session.token, 2);
            await setCookie(c, "sessionKey", session.token);
            console.log("cookie created in browser", 2)
            const sessionKey = await getCookie(c, "sessionKey");
            console.log("fetched session key from the browser", sessionKey, 3)

        } catch (err) {
            console.log(err);
            return c.status(500);
        }
    } else {
        try {
            const session = await prisma.sessions.findUnique({
                where: {
                    token: sessionKey
                }
            });

            console.log(session, 3);
            if (!session || session.expires_at < new Date()) {
                deleteCookie(c, "sessionKey");
                try {
                    const today = new Date();
                    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    const newSession = await prisma.sessions.create({
                        data: {
                            expires_at: lastDayOfMonth
                        }
                    });
                    await setCookie(c, "sessionKey", newSession.token, { secure: true });
                    const newSessionKey = await getCookie(c, "sessionKey");
                    console.log(newSessionKey, 4);
                } catch (err) {
                    console.log(err);
                    return c.status(500);
                }
            }
        } catch (err) {
            console.log(err);
            return c.status(500);
        }
    }
    await next();
});


book.get('/sessions', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const sessions = await prisma.sessions.findMany({});

        return c.json(sessions);
    } catch (err) {
        console.log(err);
        return c.status(411);
    }
})

book.delete('/delete/sessions', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        await prisma.sessions.deleteMany({})
    } catch (err) {
        console.log(err)
    }
    return c.json({ msg: "Data deleted" })
})


book.get('/hi', (c) => {
    return c.text('Hello Hono!')
})

book.post('/rooms', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());

    try {
        const room = await prisma.rooms.create({
            data: {
                room_name: body.room_name,
                capacity: body.capacity,
            },
        });
        console.log('Data inserted');
        return c.json(room);
    } catch (err) {
        console.log(err);
        return c.status(500);
    }
});


book.get('/rooms', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const rooms = await prisma.rooms.findMany({});
        console.log(rooms);
        return c.json({ rooms })

    } catch (err) {
        console.log(err);
        return c.status(401);
    }
})

book.post('/tags', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const tag = await prisma.tags.create({
            data: {
                name: body.name
            }
        })

        return c.json({ tag })

    } catch (err) {
        console.log(err);
        return c.status(500);
    }
})

book.get('/tags', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const tags = await prisma.tags.findMany({});
        console.log(tags);
        return c.json({ tags })

    } catch (err) {
        console.log(err);
        return c.status(401);
    }
})


book.post('/room-tags', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const room = await prisma.rooms.findUnique({
            where: {
                id: body.room_id
            }
        })
        if (!room) {
            return c.json({ error: "Room not found" }, 400);
        }

        const tags = await prisma.tags.findMany({
            where: {
                id: { in: body.tag_id }
            }
        });
        if (tags.length != body.tag_id.length) {
            return c.json({ error: "One or more tags not found" }, 404);
        }
        // Create the RoomTags entries
        const roomTags = await Promise.all(
            body.tag_id.map((tagId: any) => prisma.roomTags.create({
                data: {
                    room_id: body.room_id,
                    tag_id: tagId
                }
            }))
        );

        return c.json({
            roomTags
        })

    } catch (err) {
        console.log(err);
        return c.json({ error: "Internal server error" }, 500);
    }
});

book.get('/room-tags', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const roomTags = await prisma.roomTags.findMany({})

        return c.json({ roomTags })

    } catch (err) {
        console.log(err);
        return c.json({ error: "Internal server error" }, 500);
    }
})

book.get('/all/rooms', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const rooms = await prisma.rooms.findMany({
            include: {
                RoomTags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        const roomData = rooms.map((room) => ({
            room_name: room.room_name,
            capacity: room.capacity,
            tags: room.RoomTags.map((roomTag) => roomTag.tag.name),
        }));

        return c.json(roomData);
    } catch (error) {
        console.error(error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});


book.get('/rooms/search', async (c) => {
    const body = await c.req.query();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        let rooms = await prisma.rooms.findMany({
            where: {
                room_name: {
                    contains: body.name,
                    mode: 'insensitive'
                }
            },
            include: {
                RoomTags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        if (body.tagName) {
            rooms = rooms.filter((room) =>
                room.RoomTags.some((roomTag) => roomTag.tag.name.toLowerCase().includes(body.tagName.toLowerCase()))
            );
        }

        // Map the rooms to the desired response format
        const roomData = rooms.map((room) => ({
            id: room.id,
            room_name: room.room_name,
            capacity: room.capacity,
            tags: room.RoomTags.map((roomTag) => roomTag.tag.name),
        }));

        return c.json(roomData);

    } catch (err) {
        console.error(err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});


book.post('/bookings', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const { room_id, booking_date, start_time, end_time, title } = await c.req.json();
        console.log("logger", room_id, booking_date, start_time, end_time)
        const sessionKey = await getCookie(c, "sessionKey");
        const session = await prisma.sessions.findUnique({
            where: { token: sessionKey },
        });
        const session_id = session?.id;
        console.log("session_id", session_id)
        console.log("sessionKey", sessionKey)
        //const status = "booked"

        // Fetch the session based on the session token

        if (!session) {
            return c.json({ error: 'Session not found' }, 404);
        }

        // Fetch the room
        const room = await prisma.rooms.findUnique({
            where: { id: room_id },
        });
        if (!room) {
            return c.json({ error: 'Room not found' }, 404);
        }

        // Check if the room is available during the requested time slot
        const existingBookings = await prisma.bookings.findMany({
            where: {
                room_id: room_id,
                booking_date: booking_date,
                start_time: {
                    lte: end_time,
                },
                end_time: {
                    gte: start_time,
                },
            },
        });

        if (existingBookings.length > 0) {
            return c.json({ error: 'Room not available during the requested time slot' }, 400);
        }

        // Create the new booking
        const booking = await prisma.bookings.create({
            data: {
                session_id: session.id,
                room_id: room_id,
                booking_date: booking_date,
                start_time: start_time,
                end_time: end_time,
                title: title,
            },
        });

        return c.json(booking);
    } catch (error) {
        console.error(error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

book.get('/bookings/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const id = await Number(c.req.param("id"))
    try {
        const bookings = await prisma.bookings.findMany({
            where: {
                room_id: id
            }
        });

        return c.json({ bookings }, 200);

    } catch (err) {
        console.log(err);
        return c.json({ msg: "Error occured" })
    }
})

book.get('/all/bookings', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    try {
        const bookings = await prisma.bookings.findMany()
        return c.json({ bookings }, 200);

    } catch (err) {
        console.log(err);
        return c.json({ msg: "Error occured" })
    }
})

book.delete('/bookings/:id', async (c) => {
    const prisma = new PrismaClient({ datasourceUrl: c.env.DATABASE_URL }).$extends(withAccelerate());

    try {
        const id = await Number(c.req.param("id"));
        const deletedBooking = await prisma.bookings.delete({
            where: {
                id: id
            },
        });

        if (deletedBooking) {
            return c.json({ msg: 'Booking deleted successfully' }, 200);
        } else {
            return c.json({ msg: 'Booking not found' }, 404);
        }
    } catch (err) {
        console.log(err);
        return c.json({ msg: 'Error occurred' }, 500);
    }
});


book.get('/new/rooms/search', async (c) => {
    const body = await c.req.query();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        let rooms = await prisma.rooms.findMany({
            where: {
                room_name: {
                    contains: body.name,
                    mode: 'insensitive'
                }
            },
            include: {
                RoomTags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        if (body.tagName) {
            rooms = rooms.filter((room) =>
                room.RoomTags.some((roomTag) => roomTag.tag.name.toLowerCase().includes(body.tagName.toLowerCase()))
            );
        }

        // Map the rooms to the desired response format
        const roomData = rooms.map((room) => ({
            id: room.id,
            room_name: room.room_name,
            capacity: room.capacity,
            tags: room.RoomTags.map((roomTag) => roomTag.tag.name),
        }));

        return c.json(roomData);

    } catch (err) {
        console.error(err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});