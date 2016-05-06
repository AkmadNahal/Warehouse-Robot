#!/usr/bin/python
import ev3dev.auto as ev3
import threading


#
#
#
#
class Motors:
    right_mtr = ev3.LargeMotor(ev3.OUTPUT_D); assert right_mtr.connected
    left_mtr = ev3.LargeMotor(ev3.OUTPUT_C); assert left_mtr.connected
    grip_mtr = ev3.MediumMotor(ev3.OUTPUT_A); assert grip_mtr.connected

    @staticmethod
    def wait_motor(motor):
        while motor.state == ['running']:
            pass


#
#
#
#
class Wheels:
    right_wheel = Motors.right_mtr
    left_wheel = Motors.left_mtr

    @classmethod
    def start(cls):
        cls.right_wheel.duty_cycle_sp = 0
        cls.left_wheel.duty_cycle_sp = 0
        cls.right_wheel.run_direct()
        cls.left_wheel.run_direct()

    @classmethod
    def stop(cls):
        cls.right_wheel.stop()
        cls.left_wheel.stop()

    @classmethod
    def set_sp(cls, rm_sp, lm_sp):
        if rm_sp is not None:
            cls.right_wheel.duty_cycle_sp = rm_sp
        if lm_sp is not None:
            cls.left_wheel.duty_cycle_sp = lm_sp

    @classmethod
    def turn_right_rel(cls, rot, wait=True):
        if rot > 0:
            cls.left_wheel.run_to_rel_pos(position_sp=rot*cls.left_wheel.count_per_rot, duty_cycle_sp=40)
            if wait:
                Motors.wait_motor(cls.left_wheel)
        elif rot < 0:
            cls.right_wheel.run_to_rel_pos(position_sp=rot*cls.right_wheel.count_per_rot, duty_cycle_sp=40)
            if wait:
                Motors.wait_motor(cls.right_wheel)

    @classmethod
    def turn_left_rel(cls, rot, wait=True):
        if rot > 0:
            cls.right_wheel.run_to_rel_pos(position_sp=rot*cls.right_wheel.count_per_rot, duty_cycle_sp=40)
            if wait:
                Motors.wait_motor(cls.right_wheel)
        elif rot < 0:
            cls.left_wheel.run_to_rel_pos(position_sp=rot*cls.left_wheel.count_per_rot, duty_cycle_sp=40)
            if wait:
                Motors.wait_motor(cls.left_wheel)

    @classmethod
    def get_status(cls):
        if cls.right_wheel.state == ['running']:
            return True
        elif cls.left_wheel.state == ['running']:
            return True
        else:
            return False

    @staticmethod
    def steering(course, power):
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

        return int(power_left), int(power_right)

    @classmethod
    def wait_wheels(cls):
        while cls.get_status():
            pass

#
#
#
#
class Grip:
    class Position:
        up, down = 0, -0.15

    grip_mtr = grip_pos = None

    @classmethod
    def init(cls):
        cls.grip_mtr = Motors.grip_mtr
        threading.Thread(target=Grip.adjust, name='init-grip-adjust').start()

    @classmethod
    def adjust(cls):
        cls.grip_mtr.run_timed(time_sp=1000, duty_cycle_sp=-30)
        Motors.wait_motor(cls.grip_mtr)
        cls.grip_mtr.reset()
        cls.grip_mtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=0.25 * cls.grip_mtr.count_per_rot)
        Motors.wait_motor(cls.grip_mtr)
        cls.grip_mtr.reset()
        cls.grip_pos = Grip.Position.up

    @classmethod
    def move_up(cls, wait=True):
        cls.grip_mtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=Grip.Position.up * cls.grip_mtr.count_per_rot)
        if wait:
            Motors.wait_motor(cls.grip_mtr)
        cls.grip_pos = Grip.Position.up

    @classmethod
    def move_down(cls, wait=True):
        cls.grip_mtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=Grip.Position.down * cls.grip_mtr.count_per_rot)
        if wait:
            Motors.wait_motor(cls.grip_mtr)
        cls.grip_pos = Grip.Position.down
