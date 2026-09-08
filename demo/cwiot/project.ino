// Based on Adafruit IO Digital Input Example
// Tutorial Link: https://learn.adafruit.com/adafruit-io-basics-digital-input
#include "config.h"

// button is connected to digital pin 21
#define BUTTON_PIN 21

// set up the 'button' feed from adafruit IO
AdafruitIO_Feed *button = io.feed("button");

void setup() {
  // set button pin as an input
  pinMode(BUTTON_PIN, INPUT);

  // start the serial connection
  Serial.begin(115200);
  
  // connect to io.adafruit.com
  Serial.print("Connecting to Adafruit IO");
  io.connect();

  // wait for a connection
  while (io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  // we are connected
  Serial.println();
  Serial.println(io.statusText());
}

void loop() {
  // keep connection alive
  io.run();

  // if button pressed 
  if (digitalRead(BUTTON_PIN) == LOW){
    // save the current state to the 'digital' feed on adafruit io
    Serial.print("sending button -> ");
    Serial.println(current);
    button->save(current);
    delay(2000); // wait before listening again (avoid spam)
  }

  delay(100);
}
