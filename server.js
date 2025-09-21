import http from "http";
import * as fs from 'node:fs/promises';
import mysql2 from 'mysql2'
import GroupDao from './dao/groupDao.js'


const dbiniFilename = "db.ini"
const HTTP_PORT = 81;
// CONNECT TO DB
const dbFile = await fs.open(dbiniFilename, "r");
let dbConfig = {};
for await (let line of dbFile.readLines()) {
    let parts = line.split("#")
    line = parts[0]
    parts = line.split(";")
    line = parts[0]
    parts = line.split("=")
    if(parts.length != 2 ) continue
    dbConfig[parts[0].trim()] = parts[1].trim()
}
const dbPool = mysql2.createPool(dbConfig).promise();
const groupDao = new GroupDao(dbPool)


async function serverFunction(request, response) {
    // console.log(request);
    let parts = request.url.split("?");
    if(parts.length > 2) {
        response.writeHead(400);
        response.end("Bad request");
        return;
    }
    const path = parts[0]
    console.log(path)
    
    if (!path.endsWith('/')) {
        const filePath = './wwwroot' + path
        try {
            await fs.access(filePath)
            const stat = fs.stat(filePath)
            if ((await stat).isFile()) {
                (await fs.open(filePath, 'r')).createReadStream().pipe(response)
                return
            }
        } 
        catch(_) { }
    }




    const pageData = {
        method: request.method,
        httpVersion: request.httpVersion,
        url: request.url,
        query: null,


        controller: 'home',
        action: 'index',
        slug: null,

    };

   if (parts.length == 2) {
    pageData.query = {};
    let pairs = parts[1].split("&");
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i];
        let keyValue = pair.split("=");
        pageData.query[keyValue[0]] = keyValue[1];
    }
    let queryStr = "{\\n";
    for (let key in pageData.query) {
        queryStr += `&nbsp;&nbsp;${key}: ${pageData.query[key]},\\n`;
    }
    if (queryStr.includes(",")) {
        queryStr = queryStr.slice(0, -3);
    }
    queryStr += "\\n}";
    pageData.queryString = queryStr.replace(/\\n/g, "<br>");
    } else {
        pageData.query = {};
            pageData.queryString = "{}";
    }

    pageData.path = parts[0];

    let pathParts = pageData.path.split("/").filter(Boolean); 

    if (pathParts[0]) {
        pageData.controller = pathParts[0];
    }
    if (pathParts[1]) {
        pageData.action = pathParts[1];
    }
    if (pathParts[2]) {
        pageData.slug = pathParts[2];
    }

    if (parts.length > 2) {
        throw new Error("Format error");
    }

    pageData.groupsHtml = await makeGroupsHtml()

    response.writeHead(200, {
        'Content-Type': 'text/html'
    });

    const file = await fs.open("home.html", "r");
    let html = (await file.readFile()).toString();
    file.close();
    for(let k in pageData) {
        html = html.replaceAll(`{{${k}}}`, pageData[k]);
    }
    response.end(html);
}

async function makeGroupsHtml() {
    const [data] = await dbPool.query('SELECT * FROM \`groups\`')
    let wasChild
    do {
        wasChild = false
        for (let i = 0; i < data.length; i++) {
            let grp = data[i]
            if (grp["parent_id"] != null) {
                wasChild = true
                let parent = findParent(data, grp["parent_id"])
                if (typeof parent.sub == 'undefined') {
                    parent.sub = []
                }
                parent.sub.push(grp)
                data.splice(i, 1)
            }
        }
    } while (wasChild)
    
    return grpToHtml(data)
}

function grpToHtml(grps) {
    let html = "<ul>"
    for (let grp of grps) {
        html += `<li>${grp.name}`
        if (typeof grp.sub != 'undefined' && grp.sub.length > 0) {
            html += grpToHtml(grp.sub)
        }
        html += '</li>'
    }
    html += '</ul>'
    return html
}

function findParent(arr, parent_id) {
    for (let elem of arr) {
        if (elem.id == parent_id) return elem
        if (typeof elem.sub != 'undefined') {
            let p = findParent(elem.sub, parent_id)
            if (p != null) return p
        }
    }
    return null
}








const server = http.createServer(serverFunction);
server.on('close', () => {
    console.log("Server stopped");
    process.exit(); 
});
server.listen(HTTP_PORT, () => {
    console.log("Server listening port ", HTTP_PORT);
    console.log("Press Ctrl-C to stop");
});

process.on('SIGINT', () => {
    server.close();
});
