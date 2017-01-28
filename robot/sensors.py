#!/usr/bin/python
import ev3dev.auto as ev3



class ColorSensors:
    """
    The class for the color sensors that are used by the robot to follow lines and identify tags.

    """
    line_clr = ev3.ColorSensor(ev3.INPUT_3); assert line_clr.connected
    tag_clr = ev3.ColorSensor(ev3.INPUT_1); assert tag_clr.connected
    line_clr.mode = tag_clr.mode = 'COL-REFLECT'


    @classmethod
    def get_values(cls):
        """
        Gets the values from the line color and tag color sensor.

        Keyword arguments:
        cls -- The class
        """
        return cls.line_clr.value(), cls.tag_clr.value()


    @classmethod
    def get_line_value(cls):
        """
        Gets the value from the line color sensor.

        Keyword arguments:
        cls -- The class
        """
        return cls.line_clr.value()


    @classmethod
    def get_tag_value(cls):
        """
        Get the color value of the tag color sensor.

        Keyword arguments:
        cls -- The class
        """
        return cls.tag_clr.value()



class UltrasonicSensor:
    """
    This defines the class for the ultrasonic sensor used for detecting the box in front of the robot.

    """
    ultrasonic = ev3.UltrasonicSensor(ev3.INPUT_4); assert ultrasonic.connected
    ultrasonic.mode = 'US-DIST-CM'


    @classmethod
    def get_dist(cls):
        """
        Returns the distance from the object in front of the ultrasonic sensor.

        Keyword arguments:
        cls -- The class
        """
        return cls.ultrasonic.value()


#
#
#
#
# class GyroSensor():
#     gyro = ev3.GyroSensor(ev3.INPUT_2); assert gyro.connected
#     gyro.mode = 'GYRO-ANG'
#
#     @classmethod
#     def get_value(cls):
#         return cls.gyro.value()