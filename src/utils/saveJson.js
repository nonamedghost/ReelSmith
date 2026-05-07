import fs from "fs";

export function saveJson(path, data) {

  fs.writeFileSync(
    path,
    JSON.stringify(data, null, 2)
  );

}