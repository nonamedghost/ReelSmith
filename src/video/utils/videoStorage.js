// Shared file utilities for all video providers

import fs from "fs-extra";
import axios from "axios";
import path from "path";

// 🔢 SIMPLE COUNTER FOR FILE NAMES
let clipCounter = 0;

export function getNextClipPath(PATHS) {
    clipCounter++;
    return PATHS.getBg(clipCounter);
}

export async function saveBuffer(filePath, buffer) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, buffer);
    return filePath;
}

// 📥 DOWNLOAD FILE FROM URL
export async function downloadFile(url, filePath) {
    const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });

    return filePath;
}