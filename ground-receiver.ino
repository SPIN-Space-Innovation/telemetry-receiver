#include <SPI.h>
#include <RH_RF95.h>
#include <RHReliableDatagram.h>
#include <ArduinoJson.h>
#include "types.h"

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

String unmarshall(uint8_t *buf) {
  TelemetryMessage message;
  message.type = (MESSAGE_TYPE)buf[0];
  message.message_count = 0;

  message.message_count = buf[1] << 24;
  message.message_count = message.message_count | (buf[2] << 16);
  message.message_count = message.message_count | (buf[3] << 8);
  message.message_count = message.message_count | buf[4];

  String message_string =
    String((uint8_t)message.type) + "," +
    String(message.message_count) + ",";

  if (message.type == MESSAGE_TYPE::DEBUG) {
    memcpy(message.debug_message, buf + 5, sizeof(message.debug_message));
    message_string += message.debug_message;
  } else if (message.type == MESSAGE_TYPE::TELEMETRY) {
    // telemetry
    message.met = 0;
    message.met = buf[5] << 24;
    message.met = message.met | (buf[6] << 16);
    message.met = message.met | (buf[7] << 8);
    message.met = message.met | buf[8];

    message.free_memory_kb = buf[9];

    message.battery_voltage_mv = buf[10] << 8;
    message.battery_voltage_mv = message.battery_voltage_mv | buf[11];

    message.state = (STATE)buf[12];

    message_string +=
      String(message.met) + "," +
      String(message.free_memory_kb) + "," +
      String(message.battery_voltage_mv) + "," +
      String(state_to_str(message.state));

    if (message.state != STATE::SETUP and message.state != STATE::IDLE and message.state != STATE::CALIBRATION) {
      message.payload.agl_cm = 0;
      message.payload.agl_cm = buf[13] << 24;
      message.payload.agl_cm = message.payload.agl_cm | (buf[14] << 16);
      message.payload.agl_cm = message.payload.agl_cm | (buf[15] << 8);
      message.payload.agl_cm = message.payload.agl_cm | buf[16];


      message.payload.acceleration_x = buf[17] << 8;
      message.payload.acceleration_x = message.payload.acceleration_x | buf[18];
      message.payload.acceleration_y = buf[19] << 8;
      message.payload.acceleration_y = message.payload.acceleration_y | buf[20];
      message.payload.acceleration_z = buf[21] << 8;
      message.payload.acceleration_z = message.payload.acceleration_z | buf[22];

      message.payload.gyroscope_x = buf[23] << 8;
      message.payload.gyroscope_x = message.payload.gyroscope_x | buf[24];
      message.payload.gyroscope_y = buf[25] << 8;
      message.payload.gyroscope_y = message.payload.gyroscope_y | buf[26];
      message.payload.gyroscope_z = buf[27] << 8;
      message.payload.gyroscope_z = message.payload.gyroscope_z | buf[28];

      message.payload.gps_fix = (bool)buf[29];
      message.payload.gps_satellites = (uint8_t)buf[30];

      message_string += "," +
        String(message.payload.agl_cm) + "," +
        String(message.payload.acceleration_x) + "," +
        String(message.payload.acceleration_y) + "," +
        String(message.payload.acceleration_z) + "," +
        String(message.payload.gyroscope_x) + "," +
        String(message.payload.gyroscope_y) + "," +
        String(message.payload.gyroscope_z) + "," +
        String(message.payload.gps_fix) + "," +
        String(message.payload.gps_satellites);
    }
  }

  return message_string;
}

void loop() {
  uint8_t buf[RH_RF95_MAX_MESSAGE_LEN];
  uint8_t len = sizeof(buf);
  uint8_t from;
  StaticJsonDocument<200> output;

  if (rf95.available()) {
    if (rf95.recv(buf, &len)) {
      output["message"] = unmarshall(buf);
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
