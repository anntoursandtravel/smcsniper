const WebSocket = require('./node_modules/ws');
const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

ws.on('open', () => {
  console.log("Connected");
  ws.send(JSON.stringify({
    ticks_history: 'frxEURUSD',
    end: 'latest',
    style: 'candles',
    granularity: 60,
    count: 5
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.error) {
     console.error("Error:", msg.error.message);
  }
  if (msg.msg_type === 'candles') {
    console.log("Candles:", msg.candles);
    process.exit(0);
  }
});

setTimeout(() => { console.log("Timeout"); process.exit(1); }, 5000);
