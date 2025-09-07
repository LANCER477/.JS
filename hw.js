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

function parseUrl(link) {
    let output = {};
    let schemeParts = link.split("://");
    if (schemeParts.length !== 2) {
        throw new Error("Invalid URL: Missing or multiple scheme separators");
    }
    output.scheme = schemeParts[0];

    let authSplit = schemeParts[1].split("@");
    if (authSplit.length === 2) {
        let credentials = authSplit[0].split(":");
        if (credentials.length !== 2) {
            throw new Error("Invalid URL: Invalid authentication format");
        }
        output.auth = {
            "user-id": credentials[0],
            "password": credentials[1]
        };
    } else if (authSplit.length > 2) {
        throw new Error("Invalid URL: Multiple authentication separators");
    }

    let noAuth = authSplit.length === 2 ? authSplit[1] : authSplit[0];
    let hostAndRest = noAuth.split("/");
    let hostAndPort = hostAndRest[0];
    let [hostname, portNum] = hostAndPort.split(":");
    output.port = portNum ? Number(portNum) : undefined;

    let hostParts = hostname.split(".");
    if (hostParts.length === 3) {
        output.host = {
            subdomain: hostParts[0],
            domain: hostParts[1],
            tld: hostParts[2]
        };
    } else if (hostParts.length === 2) {
        output.host = {
            domain: hostParts[0],
            tld: hostParts[1]
        };
    } else {
        output.host = { tld: hostParts[0] };
    }

    let restPath = hostAndRest.slice(1).join("/");
    let [pathOnly, queryFrag] = restPath.split("?");
    output.path = pathOnly ? pathOnly.split("/").filter(Boolean) : [];

    if (queryFrag) {
        let [queryStr, frag] = queryFrag.split("#");

        if (queryStr) {
            output.query = {};
            queryStr.split("&").forEach(param => {
                let [key, val] = param.split("=");
                output.query[key] = val;
            });
        }

        if (frag) {
            output.fragment = frag;
        }
    }

    console.log(output);
}

parseUrl(_url);
