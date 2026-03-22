import express from "express"
import cors from "cors"
import cookiesParser from "cookie-parser"
import rateLimit from "express-rate-limit"

const app = express()

// CORS - allow multiple origins in production (comma-separated in .env)
// When credentials: true, we cannot use "*" - must reflect the exact origin
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map(o => o.trim()).filter(Boolean) || ["*"]
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes("*") || !origin || allowedOrigins.includes(origin)) {
            callback(null, origin || "http://localhost:5173")
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true
}))

// Request body size limits (DoS protection)
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use(express.urlencoded())
// ye url ko encode karta hai 

// Rate limiting - 100 requests per 15 min per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
})
app.use("/api/", apiLimiter)

app.use(express.static("public"))
// file ya folder save karta hai public folder me 

app.use(cookiesParser())
// cookies ko parse karta hai menas cookies ko read karta hai aur cookies ko use karta hai aur cookies ko delete karta hai ye sirf cookies ko parse se severe read use delete karta hai



//routes
import userRouter from './routers/user.routers.js'

//routes declaration means usage   
app.use("/api/v1/users", userRouter)
// https://localhost:8000/api/v1/users/register

import healthRouter from './routers/healthcheck.routers.js'
app.use("/api/v1/healthcheck", healthRouter)

import tweetRouter from './routers/tweet.routers.js'
app.use("/api/v1/tweets", tweetRouter)

import subscriptionRouter from './routers/subscription.routers.js'
app.use("/api/v1/subscriptions", subscriptionRouter)

import videoRouter from './routers/video.routers.js'
app.use("/api/v1/videos", videoRouter)

import commentRouter from './routers/comment.routers.js'
app.use("/api/v1/comments", commentRouter)

import playlistRouter from './routers/playlist.routers.js'
app.use("/api/v1/playlists", playlistRouter)

import dashboardRouter from './routers/dashboard.routers.js'
app.use("/api/v1/dashboard", dashboardRouter)

import likeRouter from './routers/like.routers.js'
app.use("/api/v1/likes", likeRouter)

// 404 handler - must be before global error handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global error handler - must be last middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
})

export { app }