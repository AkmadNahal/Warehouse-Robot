#!/usr/bin/python
import ev3dev.auto as ev3



#
#
#
#
def wait_motor(motor):
    while (motor.state == ['running']):
        pass

#
#
#
#
def steering(course, power):
    """
    Computes how fast each motor in a pair should turn to achieve the
    specified steering.
    Input:
        course [-100, 100]:
        * -100 means turn left as fast as possible,
        *  0   means drive in a straight line, and
        *  100  means turn right as fast as possible.
        * If >100 pr = -power
        * If <100 pl = power
    power: the power that should be applied to the outmost motor (the one
        rotating faster). The power of the other motor will be computed
        automatically.
    Output:
        a tuple of power values for a pair of motors.
    Example:
        for (motor, power) in zip((left_motor, right_motor), steering(50, 90)):
            motor.run_forever(speed_sp=power)
    """

    power_left = power_right = power
    s = (50 - abs(float(course))) / 50

    if course >= 0:
        power_right *= s
        if course > 100:
            power_right = - power
    else:
        power_left *= s
        if course < -100:
            power_left = - power

    return (int(power_left), int(power_right))



#
#
#
class Wheels():
    def __init__(self):
        self.rMtr = ev3.LargeMotor(ev3.OUTPUT_D);   assert self.rMtr.connected
        self.lMtr = ev3.LargeMotor(ev3.OUTPUT_C);   assert self.lMtr.connected

    def start(self):
        self.rMtr.duty_cycle_sp = 0
        self.lMtr.duty_cycle_sp = 0
        self.rMtr.run_direct()
        self.lMtr.run_direct()

    def stop(self):
        self.rMtr.stop()
        self.lMtr.stop()

    def set_sp(self, rm_sp, lm_sp):
        self.rMtr.duty_cycle_sp = rm_sp
        self.lMtr.duty_cycle_sp = lm_sp