const targets = await (await fetch('http://127.0.0.1:9223/json')).json();
const target = targets.find((item) => item.type === 'page');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, {once: true}));
let id = 1;
const pending = new Map();
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message.result);
        pending.delete(message.id);
    }
});
const send = (method, params = {}) => new Promise((resolve) => {
    const requestId = id++;
    pending.set(requestId, resolve);
    socket.send(JSON.stringify({id: requestId, method, params}));
});
const result = await send('Runtime.evaluate', {
    expression: `(async () => {
        const module = await import('/node_modules/.vite/deps/@theatre_studio.js');
        return {
            keys: Object.keys(module),
            defaultKeys: module.default ? Object.keys(module.default) : [],
            nestedDefaultKeys: module.default?.default ? Object.keys(module.default.default) : [],
            initializeTypes: [
                typeof module.initialize,
                typeof module.default?.initialize,
                typeof module.default?.default?.initialize
            ]
        };
    })()`,
    awaitPromise: true,
    returnByValue: true,
});
console.log(result);
socket.close();
