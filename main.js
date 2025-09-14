import * as fs from 'node:fs/promises';

const configPath = "config.ini";

fs.access(configPath)
    .then(async () => {
        console.log("config detected");

        const fileHandle = await fs.open(configPath, "r");
        const leftColumn = [];
        const rightColumn = [];

        for await (const record of fileHandle.readLines()) {
            const [key, val] = record.split("=");
            if (key && val) {
                leftColumn.push(key.trim());
                rightColumn.push(val.trim());
            }
        }

        console.log("left column:", leftColumn);
        console.log("right column:", rightColumn);
    })
    .catch(async () => {
        console.log("config not found, creating...");
        const created = await fs.open(configPath, "w");
        created.close();
    });
