const getTime = () => new Date().toLocaleTimeString("en-GB").slice(0, 8);

function wait(ms, ok = true) {
    return new Promise((resolve, reject) => {
        setTimeout(() => (ok ? resolve() : reject()), ms);
    });
}

console.log(getTime(), "→ start");
wait(4000)
    .then(() => console.log(getTime(), "→ resolved"))
    .catch(() => console.log(getTime(), "→ rejected"))
    .finally(() => console.log(getTime(), "→ finalized"));
console.log(getTime(), "→ after call");

export { getTime, wait };
