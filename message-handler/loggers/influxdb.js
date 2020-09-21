require('dotenv').config({path:__dirname+'/./../.env'})
const axios = require('axios')

let lastPacketNumber = 0
let packetsLost = 0
let startTime = Date.now()
let influxEndpoint = `${process.env.INFLUXDB_HOST}/write?db=${process.env.INFLUXDB_DB}&precision=ms`


// TODO: Fix start time

module.exports = async (messageStr, overwriteTimeMs) => {
  let message
  try { message = JSON.parse(messageStr)
  } catch (e) {
    return
  }

  data = message.message
  message_prefix = data.substr(0,2)

  if (message_prefix === '0,') {
    try {
      data = data.split(',')

      packetNumber = +data[1]
      packetsLost += packetNumber - lastPacketNumber - 1
      lastPacketNumber = packetNumber

      measurementBody = 'measurement,source=telemetry '

      dataObj = {
        met: +data[2],
        free_memory: parseInt(data[3], 10),
        battery: (+data[4])/1000, // mv -> v
        state: data[5].replace(/\n|\r/g, ''),
        agl: (+data[8])/100 || null, // cm -> m
        acc_x: (+data[9])/100 || null, // cm/s^2 -> m/s^2
        acc_y: (+data[10])/100 || null, // cm/s^2 -> m/s^2
        acc_z: (+data[11])/100 || null, // cm/s^2 -> m/s^2
        gyro_x: +data[12] || null,
        gyro_y: +data[13] || null,
        gyro_z: +data[14] || null,
        verical_velocity: null,
        rssi: +message.rssi,
        packets_lost: packetsLost
      }

      values = []
      for (let key in dataObj) {
        if (dataObj[key] === null || key == 'state') {
          // TODO: handle string values
          continue
        }

        values.push(`${key}=${dataObj[key]}`)
      }
      measurementBody += `${values.join(',')} ${(dataObj.met + startTime) || overwriteTimeMs}`

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
  } else if (message_prefix === '1,') {
    console.log("DEBUG: " + data)
    // debug message
  }
}
