const _url = "https://login:passw0rd@music.portal.fun:80/rock/ballads?search=scorpions&from=1990#descending";

const invalidUrl = "123";
let result = {
    "scheme": "https",
    "auth": {
        "user-id": "login",
        "password": "passw0rd"
    },
    "host": {
        "tld": "fun",
        "domain": "portal",
        "subdomain": "music"
    },
    "port": 80,
    "path": [
        "rock",
        "ballads"
    ],
    "query": {
        "search": "scorpions",
        "from": "1990"
    },
    "fragment": "descending"
};

function parseUrl(inputUrl) {
    const output = {};

    const schemeSplit = inputUrl.split("://");
    if (schemeSplit.length !== 2) {
        throw new Error("Invalid URL: Missing or multiple scheme separators");
    }
    output.scheme = schemeSplit[0];

    const authSplit = schemeSplit[1].split("@");
    if (authSplit.length === 2) {
        const creds = authSplit[0].split(":");
        if (creds.length !== 2) {
            throw new Error("Invalid URL: Invalid authentication format");
        }
        output.auth = {
            "user-id": creds[0],
            "password": creds[1]
        };
    } else if (authSplit.length > 2) {
        throw new Error("Invalid URL: Multiple authentication separators");
    }

    const mainPart = (authSplit.length === 2) ? authSplit[1] : authSplit[0];
    const chunks = mainPart.split("/");
    const hostAndPort = chunks[0];
    const [hostname, portStr] = hostAndPort.split(":");
    output.port = portStr ? Number(portStr) : undefined;

    const hostBits = hostname.split(".");
    if (hostBits.length === 3) {
        output.host = { subdomain: hostBits[0], domain: hostBits[1], tld: hostBits[2] };
    } else if (hostBits.length === 2) {
        output.host = { domain: hostBits[0], tld: hostBits[1] };
    } else {
        output.host = { tld: hostBits[0] };
    }

    const afterHost = chunks.slice(1).join("/");
    const [rawPath, rawQuery] = afterHost.split("?");
    output.path = rawPath ? rawPath.split("/").filter(x => x.length > 0) : [];

    if (rawQuery) {
        const [queryStr, fragStr] = rawQuery.split("#");
        
        if (queryStr) {
            output.query = {};
            queryStr.split("&").forEach(q => {
                const [k, v] = q.split("=");
                output.query[k] = v;
            });
        }
        if (fragStr) {
            output.fragment = fragStr;
        }
    }

    console.log(output);
}

parseUrl(_url);
