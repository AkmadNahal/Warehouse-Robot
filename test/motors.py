#!/usr/bin/python
import ev3dev.auto as ev3
import threading


class Motors:
    """
    This class connects the robots wheel motors to more usable variables and it has two static methods.

    """
    right_mtr = ev3.LargeMotor(ev3.OUTPUT_D); assert right_mtr.connected
    left_mtr = ev3.LargeMotor(ev3.OUTPUT_C); assert left_mtr.connected
    grip_mtr = ev3.MediumMotor(ev3.OUTPUT_A); assert grip_mtr.connected

    @staticmethod
    def motor_running(motor):
        """
        Sets the state of the motor to "running" and returns that value.

        Keyword arguments:
        motor -- The motor to run the command on
        """
        return motor.state == ["running"]


    @staticmethod
    def wait_motor(motor):
        """
        Makes the motor wait for a certain amount of time.

        Keyword arguments:
        motor -- The motor to run the command on.
        """
        ctr = 0
        while ctr < 2:
            if not Motors.motor_running(motor):
                ctr += 1
            else:
                ctr = 0



class Wheels:
    """
    This class defines the left and right wheel of the robot to appropriate variables and also sets the power in which these motors will run.

    """
    right_wheel = Motors.right_mtr
    left_wheel = Motors.left_mtr
    power = 40


    @classmethod
    def start(cls):
        """
        Sets the cycle speed of the right and left wheel to 0 and calls the command run_direct on both of the wheels.

        Keyword arguments:
        cls -- The class Wheels
        """
        cls.right_wheel.duty_cycle_sp = 0
        cls.left_wheel.duty_cycle_sp = 0
        cls.right_wheel.run_direct()
        cls.left_wheel.run_direct()


    @classmethod
    def stop(cls):
        """
        Stops the left and right motor of the robot.

        Keyword arguments:
        cls -- The class Wheels
        """
        cls.right_wheel.stop()
        cls.left_wheel.stop()


    @classmethod
    def set_sp(cls, rm_sp, lm_sp):
        """
        Sets the speed of the motors to be the same value.

        Keyword arguments:
        cls -- The class Wheels
        rm_sp -- Integer value that represents the right motor speed.
        lm_sp -- Integer value that represents the left motor speed.
        """
        if rm_sp is not None:
            cls.right_wheel.duty_cycle_sp = rm_sp
        if lm_sp is not None:
            cls.left_wheel.duty_cycle_sp = lm_sp


    @classmethod
    def turn_right_rel(cls, rot, wait=True):
        """
        Makes the robot turn right. Either by running the left motor forwards or to use the right motor in reverse.

        Keyword arguments:
        cls -- The class Wheels.
        rot -- Integer value. If this value is more than 0 then the robot will turn right with the help of the left motor. If the value is less than 0 the robot will turn right with the help of the right motor.
        wait = True
        """
        if rot > 0:
            cls.left_wheel.run_to_rel_pos(position_sp=rot*cls.left_wheel.count_per_rot, duty_cycle_sp=cls.power)
            if wait:
                Motors.wait_motor(cls.left_wheel)
        elif rot < 0:
            cls.right_wheel.run_to_rel_pos(position_sp=rot*cls.right_wheel.count_per_rot, duty_cycle_sp=cls.power)
            if wait:
                Motors.wait_motor(cls.right_wheel)


    @classmethod
    def turn_left_rel(cls, rot, wait=True):
        """
         Makes the robot turn left. Either by running the right motor forwards or to use the left motor in reverse.

        Keyword arguments:
        cls-- The class Wheels.
        rot -- Integer value. If this value is more than 0 then the robot will turn left with the help of the right motor. If the value is less than 0 the robot will turn left with the help of the left motor.
        wait = True
        """
        if rot > 0:
            cls.right_wheel.run_to_rel_pos(position_sp=rot*cls.right_wheel.count_per_rot, duty_cycle_sp=cls.power)
            if wait:
                Motors.wait_motor(cls.right_wheel)
        elif rot < 0:
            cls.left_wheel.run_to_rel_pos(position_sp=rot*cls.left_wheel.count_per_rot, duty_cycle_sp=cls.power)
            if wait:
                Motors.wait_motor(cls.left_wheel)


    @classmethod
    def turn_right_forever(cls, direction=1):
        """
        Turns the robot right until its called to stop by another function.

        Keyword arguments:
        cls -- The class Wheels
        direction -- Integer value. If 1 then the left wheel will run forever. Else the right motor will run forever.
        """
        if direction > 0:
            cls.left_wheel.run_forever(duty_cycle_sp=cls.power)
        else:
            cls.right_wheel.run_forever(duty_cycle_sp=-cls.power)


    @classmethod
    def turn_left_forever(cls, direction=1):
        """
        Turns the robot left until its called to stop by another function.

        Keyword arguments:
        cls -- The class Wheels
        direction -- Integer value. If 1 then the right wheel will run forever. Else the left motor will run forever.
        """
        if direction > 0:
            cls.right_wheel.run_forever(duty_cycle_sp=cls.power)
        else:
            cls.left_wheel.run_forever(duty_cycle_sp=-cls.power)


    @classmethod
    def move_rel(cls, rot, wait=True):
        """


        Keyword arguments:
        cls -- The class Wheels
        rot -- The rotation ....
        wait=True
        """
        cls.right_wheel.run_to_rel_pos(position_sp=rot * cls.right_wheel.count_per_rot, duty_cycle_sp=cls.power)
        cls.left_wheel.run_to_rel_pos(position_sp=rot * cls.left_wheel.count_per_rot, duty_cycle_sp=cls.power)
        if wait:
            Wheels.wait_wheels()


    @classmethod
    def wheels_running(cls):
        """
        Returns if the right or left motor is running.

        Keyword arguments:
        cls -- The class Wheels
        """
        return Motors.motor_running(cls.right_wheel) or Motors.motor_running(cls.left_wheel)


    @staticmethod
    def steering(course, power):
        """
        Steering is done by setting the course and power of the robots motors.

        Keyword arguments:
        course -- Integer value that indicates the course of the robot.
        power -- The power of the motors.
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

        return int(power_left), int(power_right)


    @classmethod
    def wait_wheels(cls):
        """
        While the wheels are running we will wait.

        Keyword arguments:
        cls -- The class Wheels
        """
        while cls.wheels_running():
            pass

#
#
#
#

class Grip:
    """
    This class defines the grip arm used to grip the boxes to be transported.

    """
    class Position:
        up, down = 0, -0.15

    grip_mtr = grip_pos = None
    power = 30


    @classmethod
    def init(cls):
        """
        Initiates the class

        Keyword arguments:
        cls -- The class Grp
        """
        cls.grip_mtr = Motors.grip_mtr
        threading.Thread(target=Grip.adjust, name='init-grip-adjust').start()


    @classmethod
    def adjust(cls):
        """
        Adjusts the grip to the proper starting position.

        Keyword arguments:
        cls - The class
        """
        cls.grip_mtr.run_timed(time_sp=1000, duty_cycle_sp=-cls.power)
        Motors.wait_motor(cls.grip_mtr)
        cls.grip_mtr.reset()
        cls.grip_mtr.run_to_abs_pos(duty_cycle_sp=cls.power, position_sp=0.25 * cls.grip_mtr.count_per_rot)
        Motors.wait_motor(cls.grip_mtr)
        cls.grip_mtr.reset()
        cls.grip_pos = Grip.Position.up


    @classmethod
    def move_up(cls, wait=True):
        """
        Moves the grip arm up to its starting position.

        Keyword arguments:
        cls -- The class
        wait=True
        """
        cls.grip_mtr.run_to_abs_pos(duty_cycle_sp=cls.power, position_sp=Grip.Position.up * cls.grip_mtr.count_per_rot)
        if wait:
            Motors.wait_motor(cls.grip_mtr)
        cls.grip_pos = Grip.Position.up


    @classmethod
    def move_down(cls, wait=True):
        """
        Moves the grip arm down to the position to move the boxes in the robots direction.

        Keyword arguments:
        cls -- The class
        wait=True
        """
        cls.grip_mtr.run_to_abs_pos(duty_cycle_sp=cls.power, position_sp=Grip.Position.down * cls.grip_mtr.count_per_rot)
        if wait:
            Motors.wait_motor(cls.grip_mtr)
        cls.grip_pos = Grip.Position.down
