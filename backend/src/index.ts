import { Hono } from 'hono'
import { book } from './routes/book'
import { cors } from 'hono/cors';

const app = new Hono()

app.use(cors({origin: "http://localhost:5173",
credentials: true,
headers: [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Accept",
  "Origin",
  "User-Agent",
  "DNT",
  "Cache-Control",
  "X-Mx-ReqToken",
  "Keep-Alive",
  "X-Requested-With",
  "If-Modified-Since",
  "X-CSRF-Token",
  "Access-Control-Allow-Headers",
  "Access-Control-Allow-Origin",
  "Access-Control-Allow-Credentials",
],
}));


app.route('/api/v1', book);

export default app
