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
class GripThread(threading.Thread):
    def __init__(self):
        mtrs = Motors()
        self.grip_mtr = mtrs.grip_mtr
        self.grip_pos = GripPosition.up
        self.grip_running = True
        threading.Thread.__init__(self)

    def run(self):
        self.grip_mtr.run_timed(time_sp=1000, duty_cycle_sp=-30)
        wait_motor(self.grip_mtr)
        self.grip_mtr.reset()
        self.grip_mtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=0.25 * self.grip_mtr.count_per_rot)
        wait_motor(self.grip_mtr)
        self.grip_mtr.reset()
        pos_prev = self.grip_pos
        while self.grip_running:
            if pos_prev != self.grip_pos:
                self.grip_mtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=self.grip_pos * self.grip_mtr.count_per_rot)
                pos_prev = self.grip_pos
            time.sleep(0.01)
        self.grip_mtr.stop()

    def stop(self):
        self.grip_running = False



class Navigation():
    def __init__(self, kp=0.65, kd=1, ki=0.02, direction=1, power=50):
        self.wheels = Wheels()
        self.clrs = ColorSensors()
        self.kp = kp
        self.kd = kd
        self.ki = ki
        self.direction = direction
        self.power = power
        self.min_ref, self.max_ref, self.target = self.calibrate()
        self.running = True

    def calibrate(self):
        min = 255
        max = 0

        self.wheels.turn_right_rel(0.5)
        while self.wheels.get_status():
            val = self.clrs.get_line_value()
            if val > max:
                max = val
            if val < min:
                min = val
        self.wheels.turn_left_rel(-1)
        while self.wheels.get_status():
            val = self.clrs.get_line_value()
            if val > max:
                max = val
            if val < min:
                min = val
        self.wheels.turn_right_rel(0.52)
        while self.wheels.get_status():
            pass
        print (min, max, max / 2)
        return min, max, max / 2

    def correct_path(self):
        refRead = self.clrs.get_line_value()
        error = self.target - (100 * (refRead - self.min_ref) / (self.max_ref - self.min_ref))
        derivative = error - self.lastError
        self.lastError = error
        integral = 0.5 * self.integral + error
        course = (self.kp * error + self.kd * derivative + self.ki * integral) * self.direction
        self.wheels.set_sp(*steering(course, self.power))

    def go_to_start(self):
        self.wheels.start()
        self.lastError = self.integral = 0
        while self.running:
            self.correct_path()
            if self.clrs.get_tag_value() > self.max_ref + 5:
                break
            if self.clrs.get_tag_value() < self.min_ref + 10:
                self.wheels.set_sp(None, 90)
                time.sleep(0.15)
                continue
            time.sleep(0.01)
        self.wheels.stop()


#
#
#
#
class NavigationThread(threading.Thread):
    def __init__(self):
        self.command = ""
        self.nav = Navigation()
        self.running = True
        threading.Thread.__init__(self)

    def run(self):
        while self.running:
            if self.command == "":
                continue
            elif self.command == "go-to-start":
                self.nav.go_to_start()
                self.command = ""

            time.sleep(0.01)
