#include <SPI.h>
#include <RH_RF95.h>
#include <RHReliableDatagram.h>
#include <ArduinoJson.h>

#define CLIENT_ADDRESS 1
#define SERVER_ADDRESS 2

RH_RF95 rf95(8, 3); // Adafruit Feather M0 with RFM95 
RHReliableDatagram manager(rf95, CLIENT_ADDRESS);

void printJson(JsonDocument &doc) {
  String output;
  serializeJson(doc, output);
  Serial.println(output);
}

void setup() {
  Serial.begin(9600);
  while (!Serial) ; // Wait for serial port to be available
  if (!manager.init())
    Serial.println("init failed");

  rf95.setSignalBandwidth(500000);
  rf95.setSpreadingFactor(8);

  manager.setRetries(15);
}

void loop() {
  uint8_t buf[RH_RF95_MAX_MESSAGE_LEN];
  uint8_t len = sizeof(buf);
  uint8_t from;
  StaticJsonDocument<200> output;

  if (rf95.available()) {
    if (rf95.recv(buf, &len)) {
      output["message"] = (char*)buf;
      output["rssi"] = rf95.lastRssi();
      printJson(output);
    }
  }

  if (Serial.available()) {
    String message = Serial.readString();
    char buf[RH_RF95_MAX_MESSAGE_LEN];
    if (message.length() + 1 > RH_RF95_MAX_MESSAGE_LEN) {
      Serial.println("Message too big.");
    } else {
      message.toCharArray(buf, message.length() + 1);
      buf[message.length()] = '\0';
      Serial.println("Sending " + String((char*)buf));

      if (manager.sendtoWait((uint8_t*)buf, message.length() + 1, SERVER_ADDRESS)) {
        Serial.println("Message received");
      } else {
        Serial.println("Message not received");
      }
    }
  }

  delay(10);
}
