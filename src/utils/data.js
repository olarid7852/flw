import fs from "fs";

const configurationFilePath = "/tmp/file.json";

export function saveConfiguration(configuration) {
  fs.writeFile(
    configurationFilePath,
    JSON.stringify(configuration),
    function (err) {
      if (err) {
        // eslint-disable-next-line no-console
        console.log("Error saving file");
      }
      // eslint-disable-next-line no-console
      console.log("File saved");
    }
  );
}

export function loadConfiguration() {
  const data = fs.readFileSync(configurationFilePath, "utf8");
  return JSON.parse(data);
}
