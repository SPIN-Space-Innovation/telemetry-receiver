const delay = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

class Telemetry extends EventTarget {
  constructor(...args) {
    super(...args)

    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.addEventListener('open', (event) => {
      console.log('Connected to WebSocket server')
    })

    this.socket.addEventListener('message', ({data}) => this.dispatchEvent(new CustomEvent('data', {detail: data})))
  }

  sendCalibrate() {
    this.socket.send('COMMAND:init_calibration')
  }

  sendEjectionTestEnable() {
    this.socket.send('COMMAND:set_ejection_test_mode')
  }

  sendLaunched() {
    this.socket.send('COMMAND:launched')
  }

  sendFTS() {
    this.socket.send('COMMAND:trigger_fts')
  }
}
