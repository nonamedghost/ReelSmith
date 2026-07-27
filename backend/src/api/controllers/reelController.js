import { runPipeline } from "../../pipeline/runPipeline.js";

export async function generateReel(req, res) {
    try {
        await runPipeline();

        res.json({
            success: true,
            message: "Reel generated successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
}