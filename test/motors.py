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

class GripPosition:
    up, down = 0, -0.15



class Motors():
    def __init__(self):
        self.right_mtr = ev3.LargeMotor(ev3.OUTPUT_D);  assert self.right_mtr.connected
        self.left_mtr = ev3.LargeMotor(ev3.OUTPUT_C);   assert self.left_mtr.connected
        self.grip_mtr = ev3.MediumMotor(ev3.OUTPUT_A);  assert self.grip_mtr.connected


#
#
#
class Wheels():
    def __init__(self):
        mtrs = Motors()
        self.right_wheel = mtrs.right_mtr
        self.left_wheel = mtrs.left_mtr

    def start(self):
        self.right_wheel.duty_cycle_sp = 0
        self.left_wheel.duty_cycle_sp = 0
        self.right_wheel.run_direct()
        self.left_wheel.run_direct()

    def stop(self):
        self.right_wheel.stop()
        self.left_wheel.stop()

    def set_sp(self, rm_sp, lm_sp):
        if rm_sp != None:
            self.right_wheel.duty_cycle_sp = rm_sp
        if lm_sp != None:
            self.left_wheel.duty_cycle_sp = lm_sp

    def turn_right_rel(self, rot):
        if rot > 0:
            self.left_wheel.run_to_rel_pos(position_sp=rot*self.left_wheel.count_per_rot, duty_cycle_sp=40)
        elif rot < 0:
            self.right_wheel.run_to_rel_pos(position_sp=rot*self.right_wheel.count_per_rot, duty_cycle_sp=40)

    def turn_left_rel(self, rot):
        if rot > 0:
            self.right_wheel.run_to_rel_pos(position_sp=rot*self.right_wheel.count_per_rot, duty_cycle_sp=40)
        elif rot < 0:
            self.left_wheel.run_to_rel_pos(position_sp=rot*self.left_wheel.count_per_rot, duty_cycle_sp=40)

    def get_status(self):
        if self.right_wheel.state == ['running']:
            return True
        elif self.left_wheel.state == ['running']:
            return  True
        else:
            return  False