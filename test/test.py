#!/usr/bin/python
import ev3dev.auto as ev3
import threading
import time


class Position:
    up, down = 0, -0.15


def wait_motor(motor):
    while (motor.state == ['running']):
        pass

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



mMtr_pos = Position.up
running = True



class GripThread(threading.Thread):
    def __init__(self):
        self.mMtr = ev3.MediumMotor(ev3.OUTPUT_A)
        threading.Thread.__init__(self)

    def run(self):
        self.mMtr.run_timed(time_sp=1000, duty_cycle_sp=-30)
        wait_motor(self.mMtr)
        self.mMtr.reset()
        self.mMtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=0.25 * self.mMtr.count_per_rot)
        wait_motor(self.mMtr)
        self.mMtr.reset()
        pos_prev = mMtr_pos
        while running:
            if pos_prev != mMtr_pos:
                self.mMtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=mMtr_pos * self.mMtr.count_per_rot)
                pos_prev = mMtr_pos
        self.mMtr.stop()

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

class ColorSensors():
    def __init__(self):
        self.rClr = ev3.ColorSensor(ev3.INPUT_3);   assert self.rClr.connected
        self.rClr.mode = 'COL-REFLECT'
        self.lClr = ev3.ColorSensor(ev3.INPUT_1);   assert self.lClr.connected
        self.lClr.mode = 'COL-REFLECT'

class NavigationThread(threading.Thread):
    def __init__(self, kp=0.65, kd=1, ki=0.02, direction=1, power=50):
        self.wheels = Wheels()
        self.clrs = ColorSensors()
        self.kp = kp
        self.kd = kd
        self.ki = ki
        self.command = ""
        self.direction = direction
        self.power = power
        self.minRef, self.maxRef, self.target = self.calibrate()
        threading.Thread.__init__(self)

    def correct_path(self):
        refRead = self.clrs.rClr.value()
        error = self.target - (100 * (refRead - self.minRef) / (self.maxRef - self.minRef))
        derivative = error - self.lastError
        self.lastError = error
        integral = 0.5 * self.integral + error
        course = (self.kp * error + self.kd * derivative + self.ki * integral) * self.direction
        self.wheels.set_sp(*steering(course, self.power))


    def go_to_start(self):
        self.wheels.start()
        self.following = True
        self.lastError = self.integral = 0
        while running:
            self.correct_path()
            if self.clrs.lClr.value() > self.maxRef + 10:
                break
            if self.clrs.lClr.value() < self.minRef + 10:
                self.wheels.set_sp(self.wheels.rMtr.duty_cycle_sp, 100)
                time.sleep(0.2)
                continue
            time.sleep(0.01)
        self.wheels.stop()

    def run(self):
        while running:
            if self.command == "":
                continue
            elif self.command == "go-to-start":
                self.go_to_start()
                self.command = ""



    def calibrate(self):
        min = 255
        max = 0

        self.wheels.lMtr.run_to_rel_pos(position_sp=0.5*self.wheels.lMtr.count_per_rot, duty_cycle_sp=40)
        while self.wheels.lMtr.state == ['running']:
            val = self.clrs.rClr.value()
            if val > max:
                max = val
            if val < min:
                min = val
        self.wheels.lMtr.run_to_rel_pos(position_sp=-1*self.wheels.lMtr.count_per_rot, duty_cycle_sp=40)
        while self.wheels.lMtr.state == ['running']:
            val = self.clrs.rClr.value()
            if val > max:
                max = val
            if val < min:
                min = val
        self.wheels.lMtr.run_to_rel_pos(position_sp=0.52*self.wheels.lMtr.count_per_rot, duty_cycle_sp=40)
        wait_motor(self.wheels.lMtr)
        print (min, max, max/2)
        return min, max, max/2



if __name__ == "__main__":

    grip_thread = GripThread()
    grip_thread.start()
    nav = NavigationThread()
    nav.command = "go-to-start"
    nav.start()
    time.sleep(20)

    running = False
    nav.following = False


    # snc = ev3.UltrasonicSensor(ev3.INPUT_4)

