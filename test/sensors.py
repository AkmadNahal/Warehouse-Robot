#!/usr/bin/python
import ev3dev.auto as ev3


#
#
#
#
class ColorSensors():
    def __init__(self):
        self.line_clr = ev3.ColorSensor(ev3.INPUT_3);   assert self.line_clr.connected
        self.tag_clr = ev3.ColorSensor(ev3.INPUT_1);    assert self.tag_clr.connected
        self.line_clr.mode = self.tag_clr.mode = 'COL-REFLECT'

    def get_values(self):
        return self.line_clr.value(), self.tag_clr.value()

    def get_line_value(self):
        return self.line_clr.value()

    def get_tag_value(self):
        return self.tag_clr.value()


class UltrasonicSensor():
    def __init__(self):
        self.ultrasonic = ev3.UltrasonicSensor(ev3.INPUT_4)
        self.ultrasonic.mode = 'US-DIST-CM'

    def get_dist(self):
        return self.ultrasonic.value()

class GyroSensor():
    def __init__(self):
        self.gyro = ev3.GyroSensor(ev3.INPUT_2)
        self.gyro.mode = 'GYRO-ANG'

    def get_value(self):
        return self.gyro.value()



