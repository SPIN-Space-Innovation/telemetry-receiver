## Telemetry Receiver

### About
The telemetry receiver acts as a proxy between the rocket and the ground station. It receives telemetry messages from the rocket over radio, processes and transmits them over the serial USB port. It also receives commands over the serial USB port, which then transmits over radio to the rocket.

It is currently tested on Adafruit Feather M0 with LoRa Radio module.
