#include <HC05.h>

#include <SoftwareSerial.h>

#include "DHT.h"

#include <Wire.h>

#include "Adafruit_SI1145.h"

#define DHTPIN 2     // Heat sensor digital pin

#define DHTTYPE DHT22   // Heat sensor type

// Initialize DHT sensor.
DHT dht(DHTPIN, DHTTYPE);
int photocellPin = 0;     // the cell and 10K pulldown are connected to a0
int photocellReading;     // the analog reading from the analog resistor divider

// Init the bluetooth serial port
SoftwareSerial mySerial(10, 11);

// Init the light sensor
Adafruit_SI1145 uv = Adafruit_SI1145();

void setup() {
  Serial.begin(9600);
  mySerial.begin(9600);
  dht.begin();
  uv.begin();
}

void loop() {
  // Wait a few seconds between measurements.
  delay(2000);
  
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();

  // Read the humidity
  float h = dht.readHumidity();

  // Check if any reads failed and exit early (to try again).
  if (isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  float light = uv.readIR ();
  

  // Compute heat index in Celsius (isFahreheit = false)
  float hic = dht.computeHeatIndex(t, h, false);

  // Print values to serial port
  mySerial.print("\n Temperature: ");
  mySerial.print(t);
//  mySerial.print("\n Heat index: ");
//  mySerial.print(hic);
  mySerial.print("\n Visible light value: ");
  mySerial.print(light);

  
}
