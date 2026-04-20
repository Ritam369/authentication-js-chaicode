import express from "express"
import authRouter from "./modules/auth/auth.router.js"
import cookieParser from "cookie-parser"
import ApiError from "./common/utils/api-error.js"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use("/api/auth", authRouter)

// Catch-all for undefined routes
app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Route ${req.originalUrl} not found`);
});

export default app