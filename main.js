import { wait, getTime } from "./helper.js";
import { EventEmitter } from "node:events";

const processor = new EventEmitter();

function handleRate(value) {
    processor.rate = value;
    console.log(getTime(), `Rate set -> ${value}`);
    processor.emit("check");
}

function handlePrice(value) {
    processor.price = value;
    console.log(getTime(), `Price set -> ${value}`);
    processor.emit("check");
}

function handleCheck() {
    if (processor.rate !== undefined && processor.price !== undefined) {
        const result = processor.price * processor.rate;
        console.log(`Calculated: ${processor.price} × ${processor.rate} = ${result}`);
    }
}

processor.on("rate", handleRate);
processor.on("price", handlePrice);
processor.on("check", handleCheck);

await Promise.all([
    wait(Math.random() * 2000).then(() => processor.emit("rate", 42)),
    wait(Math.random() * 2000).then(() => processor.emit("price", 100)),
]);
processor.removeListener("rate", handleRate);
processor.removeListener("price", handlePrice);
processor.removeListener("check", handleCheck);
