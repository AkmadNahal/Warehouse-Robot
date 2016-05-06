#!/usr/bin/python
import ev3dev.auto as ev3
import threading
import time
from motors import *
from sensors import *


#
#
#
#
class Position:
    up, down = 0, -0.15


mMtr_pos = Position.up
running = True



#
#
#
#
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


#
#
#
#
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