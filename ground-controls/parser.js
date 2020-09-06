const fs = require('fs')
const delay = require('delay')
const readline = require('readline')
const influxdbLogger = require('../message-handler/loggers/influxdb')

const fileStream = fs.createReadStream('./FLIGHT.LOG')
const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
})

const startTime = new Date()
const messages = []
rl.on('line', (line) => {
  message_prefix = line.substr(0,2)
  if (message_prefix === '1,') {
    // debug message
  } else if (message_prefix === '0,') {
    data = line.split(',')
    met = +data[2];
    time = new Date(new Date(startTime.getTime()).setMilliseconds(startTime.getMilliseconds() + met))

    messages.push([JSON.stringify({message: line, rssi: 0}), time.getTime()])
  }
})

fileStream.on('end', async () => {
  for (const message of messages) {
    influxdbLogger.apply(null, message)
    await delay(10) // rate limiting, otherwise some messages fail
  }
})
