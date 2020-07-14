const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const WebSocket = require('ws');
const { EventEmitter } = require('events')
const dbLogger = require('./db-logger')

SERVER_PORT = 3210
WS_PORT = 8080

if (!process.env.PORT_PATH) {
  throw new Error('Provide PORT_PATH in env.')
}

const dataEmitter = new EventEmitter();
const parser = new Readline()
const serialPort = new SerialPort(process.env.PORT_PATH, { baudRate: 9600 })
serialPort.pipe(parser)

parser.on('data', (line) => {
  dataEmitter.emit('data', line)
})

const COMMANDS = {
  init_calibration: 1,
  launched: 3,
  trigger_fts: 6
}

dataEmitter.on('data', dbLogger)

const wss = new WebSocket.Server({port: WS_PORT});
console.log(`Started WebSocket Server on port ${WS_PORT}`)
wss.on('connection', (ws) => {
  dataEmitter.on('data', line => ws.send(line))

  ws.on('message', message => {
    if (message.indexOf('COMMAND') === 0) {
      command = message.split('COMMAND:')[1].toLowerCase()
      if (typeof COMMANDS[command] !== 'undefined') {
        serialPort.write("CMD:" + COMMANDS[command], function(err) {
          if (err) {
            return console.log('Error on write: ', err.message)
          }
        })
      }
    }
  })
})
