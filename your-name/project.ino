#define AIM A0
#define POWER A1
#define SHOOT 2
#define MOVE A2
#define ANGLE A3
#define JUMP 3




void setup() {

  pinMode(AIM, INPUT);
  pinMode(POWER, INPUT);
  pinMode(SHOOT, INPUT_PULLUP);
  pinMode(MOVE, INPUT);
  pinMode(ANGLE, INPUT);
  pinMode(JUMP, INPUT_PULLUP);

  Serial.begin(115200);
}

void loop() {

  // put your main code here, to run repeatedly:
 // Shooter
  int aimValue = analogRead(AIM);
  int powerValue = analogRead(POWER);

  int aim = map(aimValue, 0, 1023, 0, 180);
  int power = map(powerValue, 0, 1023, 0, 100);


  int shoot = digitalRead(SHOOT) == LOW;


  // Goalkeeper
  int moveValue = analogRead(MOVE);
  int angleValue = analogRead(ANGLE);

  int move = map(moveValue, 0, 1023, 0, 100);
  int angle = map(angleValue, 0, 1023, -90, 90);

  int jump = digitalRead(JUMP) == LOW;
    
    
    Serial.print(aim);
    Serial.print(",");

    Serial.print(power);
    Serial.print(",");

    Serial.print(shoot);
    Serial.print(",");

    Serial.print(move);
    Serial.print(",");

    Serial.print(angle);
    Serial.print(",");

    Serial.println(jump);

    delay(20);
}