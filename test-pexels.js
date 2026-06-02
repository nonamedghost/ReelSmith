// test-pexels.js

import { fetchBackgroundVideo }
from "./src/video/fetchBackground.js";

const path =
    await fetchBackgroundVideo("nature");

console.log(path);