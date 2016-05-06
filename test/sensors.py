#!/usr/bin/python
import ev3dev.auto as ev3


#
#
#
#
class ColorSensors():
    def __init__(self):
        self.rClr = ev3.ColorSensor(ev3.INPUT_3);   assert self.rClr.connected
        self.rClr.mode = 'COL-REFLECT'
        self.lClr = ev3.ColorSensor(ev3.INPUT_1);   assert self.lClr.connected
        self.lClr.mode = 'COL-REFLECT'


