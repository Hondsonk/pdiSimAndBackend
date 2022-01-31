const WebSocket = require("ws");
const { uuid } = require('uuidv4');
const express = require('express')
const bodyParser = require('body-parser');
const path = require('path')
const app = express()
const port = process.env.port || 3000;

const wss = new WebSocket.Server({ port: 8082 });
var shouldSaveData = false

wss.on("connection", ws => {
    ws.id = uuid();
    console.log(`New client connected with id: ${ws.id}`);

    ws.onmessage = ({data}) => {
        //console.log(`Client ${ws.id}: ${data}`);

    	wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`${data}`);
            }
    	}); 

    };

    ws.onclose = function() {
        console.log(`Client ${ws.id} has disconnected!`);
    };
});

var lastTen = {
	results: []
}

for (var i = 0; i < 10; i++) {
	lastTen.results.push( {
		"engineForce": 0
	})
}

app.use(bodyParser.json())

app.get('/', (req, res) => {
	console.log("Got get req")
	res.sendFile(path.join(__dirname, './app/index.html'))
})

app.post('/simData', (req, res) => {
	//console.log("Got post req", req.body)
	lastTen.results.shift()
	lastTen.results.push( { engineForce: req.body.engineForce } )

	res.send('ack\n\n')
})

app.get('/lastTen', (req, res) => {
	res.send(lastTen)
})

app.listen(port)
console.log('Server started at http://localhost:', port)

