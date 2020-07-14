const express = require('express')
const app = express()

SERVER_PORT = 3210

app.use(express.static('public'))
app.listen(SERVER_PORT, () => {
  console.log(`HTTP Server listening on port ${SERVER_PORT}.`)
})
