import mongoose from "mongoose"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const healthcheck = asyncHandler(async (req, res) => {
    const dbOk = mongoose.connection.readyState === 1

    const response = new ApiResponse(
        dbOk ? 200 : 503,
        {
            status: dbOk ? "healthy" : "unhealthy",
            database: dbOk ? "connected" : "disconnected",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
        dbOk ? "Service is healthy" : "Database disconnected"
    )
    return res.status(response.statusCode).json(response)
})

export { healthcheck }
