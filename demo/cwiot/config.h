// adafruit IO credentials
#define IO_USERNAME "secret"
#define IO_KEY "secret"

// wifi credentials
#define WIFI_SSID "thomaswifi"
#define WIFI_PASS "secret"

#include "AdafruitIO_WiFi.h"
AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);