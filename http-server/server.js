// start creating server here
import { error } from "console";
import http from "http"
import url from "url"

let todos = [];
let idCounter = 1;

//helper to send response
function sendJSON(res,statusCode,data){
    res.writeHead(statusCode,{"Content-Type": "application/json"});
    res.end(JSON.stringify(data));
}

function sendText(res,statusCode,text){
    res.writeHead(statusCode,{"Content-Type": "application/json"});
    res.end(text);
}

//helper to parse request body
function parseBody(req){
    return new Promise((resolve,reject)=>{
        let body="";
        req.on("data", chunk=>{
            body += chunk;
        });
        req.on("end", ()=>{
            try {
                const parsed = JSON.parse(body || "{}");
                resolve(parsed)
            } catch (error) {
                reject(error)
            }
        })
    })
}

const server = http.createServer(async(req,res)=>{
    const parsedUrl = url.parse(req.url,true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if(req.method==="GET" && pathname==="/"){
        return sendText(res,200,"Hello World")
    }

    if(req.method==="POST" && pathname==="/create/todo"){
        try {
            const body=await parseBody(req);
            const {title,description} = body;
            if(!title || !description){
                return sendJSON(res,400,{
                    error: "Invalid input"
                })
            }
            const newTodo = {
                id: idCounter++,
                title,
                description
            };
            todos.push(newTodo);
            return sendJSON(res,200,todos);
        } catch (error) {
            return sendJSON(res,400,{error:"Invalid JSON"})
        }
    }

    if(req.method==="GET" && pathname==="/todos"){
        return sendJSON(res,200,todos)
    }

    if(req.method==="GET" && pathname==="/todo"){
        const id=parseInt(query.id);
        if(isNaN(id)){
            return sendJSON(res,404,{error:"Todo not found"})
        }
        const todo = todos.find(t=>t.id===id);
        if(!todo){
            return sendJSON(res,404,{error: "Todo not found"})
        }

        return sendJSON(res,200,todo)
    }

    if(req.method==="DELETE" && pathname==="/todo"){
        const id=parseInt(query.id);

        if(isNaN(id)){
            return sendJSON(res,404,{error:"Todo not found"})
        }

        const index = todos.findIndex(t=>t.id===id);

        if(index===-1){
            return sendJSON(res,404,{error: "Todo not found"})
        }

        todos.splice(index,1);

        return sendJSON(res,200,{message: "Deleted"})
    }

    return sendJSON(res,404,{error: "Route not found"})

})

server.listen(3000,()=>{
    console.log("Server running on port 3000")
})

