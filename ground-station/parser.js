const parse = require('csv-parse')
const fs = require('fs')
const readline = require('readline')
const dbLogger = require('./db-logger')

const fileStream = fs.createReadStream('../../FLIGHT.LOG')
const rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
})

const startTime = new Date()
rl.on('line', (line) => {
  if (line.indexOf('RAW:') == 0) {
    data = line.replace('RAW:', '')
    data = data.split(',')
    met = +data[0]

    time = new Date(new Date(startTime.getTime()).setMilliseconds(startTime.getMilliseconds() + met))
    dbLogger(line, time)
  }
})
