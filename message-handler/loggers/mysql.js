const mysql = require('mysql')

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : '',
  password : '',
  database : ''
});

connection.connect();

previousData = null
lastPacketNumber = 0
packetsLost = 0
module.exports = (messageStr, date) => {
  let message;
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
    data = data.substr(rawStart + 4);
    try {
      data = data.split(',')
      met = +data[0]
      freeMemory = parseInt(data[1], 10)
      battery = data[2] ? parseFloat(data[2]) : null
      state = data[3].replace(/\n|\r/g, '')
      agl = data[4] ? parseFloat(data[4]) : null
      accX = data[5] ? parseFloat(data[5]) : null
      accY = data[6] ? parseFloat(data[6]) : null
      accZ = data[7] ? parseFloat(data[7]) : null
      gyroX = data[8] ? parseFloat(data[8]) : null
      gyroY = data[9] ? parseFloat(data[9]) : null
      gyroZ = data[10] ? parseFloat(data[10]) : null

      verticalVelocity = null
      if (agl != null && previousData && previousData[4]) {
        dt = met - previousData[0]
        scale = 1000 / dt
        diff = agl - parseFloat(previousData[4])
        verticalVelocity = diff * scale // meters per second
      }

      connection.query('INSERT INTO raw SET ?', {
        met, free_memory: freeMemory, battery, state,
        ground_level: null, agl, altitude: null, pressure: null,
        acc_x: accX, acc_y: accY, acc_z: accZ,
        gyro_x: gyroX, gyro_y: gyroY, gyro_z: gyroZ,
        vertical_velocity: verticalVelocity, rssi: message.rssi,
        packets_lost: packetsLost,
        created_at: date || new Date()
      }, (err) => {
        if (err) console.log(err)
      })
    } catch (e) {
      console.log(e)
    }

    previousData = data
  }
}
