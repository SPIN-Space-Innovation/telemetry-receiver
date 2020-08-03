require('dotenv').config()
const axios = require('axios')

let previousData = null
let lastPacketNumber = 0
let packetsLost = 0
let startTime = Date.now()
let influxEndpoint = `${process.env.INFLUXDB_HOST}/write?db=${process.env.INFLUXDB_DB}&precision=ms`

module.exports = async (messageStr, date) => {
  let message
  try {
    message = JSON.parse(messageStr)
  } catch (e) {
    return
  }

  data = message.message

  if (data.indexOf('RAW:') >= 0) {
    // Example message: (#)RAW:....
    packetNumberEnd = data.indexOf(')')
    packetNumber = parseInt(data.substring(1, packetNumberEnd))
    packetsLost += packetNumber - lastPacketNumber - 1
    lastPacketNumber = packetNumber

    rawStart = data.indexOf('RAW:')
    data = data.substr(rawStart + 4)
    measurementBody = 'measurement,source=telemetry '
    try {
      data = data.split(',')
      dataObj = {
        met: +data[0],
        free_memory: parseInt(data[1], 10),
        battery: data[2] ? parseFloat(data[2]) : null,
        state: data[3].replace(/\n|\r/g, ''),
        agl: data[4] ? parseFloat(data[4]) : null,
        acc_x: data[5] ? parseFloat(data[5]) : null,
        acc_y: data[6] ? parseFloat(data[6]) : null,
        acc_z: data[7] ? parseFloat(data[7]) : null,
        gyro_x: data[8] ? parseFloat(data[8]) : null,
        gyro_y: data[9] ? parseFloat(data[9]) : null,
        gyro_z: data[10] ? parseFloat(data[10]) : null,
        verical_velocity: null,
        rssi: parseInt(message.rssi),
        packets_lost: packetsLost
      }

      if (dataObj.agl != null && previousData && previousData[4]) {
        dt = dataObj.met - previousData[0]
        scale = 1000 / dt
        diff = dataObj.agl - parseFloat(previousData[4])
        dataObj.vertical_velocity = diff * scale // meters per second
      }

      values = []
      for (let key in dataObj) {
        if (dataObj[key] === null || key == 'state') {
          // TODO: handle string values
          continue
        }

        values.push(`${key}=${dataObj[key]}`)
      }
      measurementBody += `${values.join(',')} ${dataObj.met + startTime}`

      await axios.post(
        influxEndpoint,
        measurementBody,
        {
          headers: {
            'content-type': 'application/json',
            'Authorization': `Token ${process.env.INFLUXDB_TOKEN}`
          }
        }
      )
    } catch (e) {
      console.log(e)
    }

    previousData = data
  }
}
