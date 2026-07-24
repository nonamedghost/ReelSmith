export function getHealth(req, res) {
    res.json({
        status: "ok",
        message: "Backend is running",
    });
}