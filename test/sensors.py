#!/usr/bin/python
import ev3dev.auto as ev3


#
#
#
#
class ColorSensors:
    line_clr = ev3.ColorSensor(ev3.INPUT_3); assert line_clr.connected
    tag_clr = ev3.ColorSensor(ev3.INPUT_1); assert tag_clr.connected
    line_clr.mode = tag_clr.mode = 'COL-REFLECT'

    @classmethod
    def get_values(cls):
        return cls.line_clr.value(), cls.tag_clr.value()

    @classmethod
    def get_line_value(cls):
        return cls.line_clr.value()

    @classmethod
    def get_tag_value(cls):
        return cls.tag_clr.value()


#
#
#
#
class UltrasonicSensor:
    ultrasonic = ev3.UltrasonicSensor(ev3.INPUT_4)
    ultrasonic.mode = 'US-DIST-CM'

    @classmethod
    def get_dist(cls):
        return cls.ultrasonic.value()


#
#
#
#
class GyroSensor():
    gyro = ev3.GyroSensor(ev3.INPUT_2)
    gyro.mode = 'GYRO-ANG'

    @classmethod
    def get_value(cls):
        return cls.gyro.value()