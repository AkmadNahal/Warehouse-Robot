#!/usr/bin/python
import threading
import time
from motors import *
from sensors import *

#
#
#
#
class Navigation:

    kp = kd = ki = direction = power = None
    min_ref = max_ref = target = None
    running = False

    current_location = None
    x_tags = y_tags = None

    tag_ctr = 0

    @classmethod
    def init(cls, kp=0.65, kd=1, ki=0.02, direction=1, power=50):
        cls.kp = kp
        cls.kd = kd
        cls.ki = ki
        cls.direction = direction
        cls.power = power
        cls.x_tags = cls.y_tags = 4
        threading.Thread(target=Navigation.calibrate, name='init-nav-calibrate').start()

    @classmethod
    def calibrate(cls):
        min = 255
        max = 0

        Wheels.turn_right_rel(0.5, False)
        while Wheels.get_status():
            val = ColorSensors.get_line_value()
            if val > max:
                max = val
            if val < min:
                min = val
        Wheels.turn_left_rel(-1, False)
        while Wheels.get_status():
            val = ColorSensors.get_line_value()
            if val > max:
                max = val
            if val < min:
                min = val
        Wheels.turn_right_rel(0.52)
        cls.min_ref, cls.max_ref, cls.target = min, max, max / 2

    @classmethod
    def correct_path(cls, last_error, integral):
        refRead = ColorSensors.get_line_value()
        error = cls.target - (100 * (refRead - cls.min_ref) / (cls.max_ref - cls.min_ref))
        derivative = error - last_error
        last_error = error
        integral = 0.5 * integral + error
        course = (cls.kp * error + cls.kd * derivative + cls.ki * integral) * cls.direction
        Wheels.set_sp(*Wheels.steering(course, cls.power))
        return last_error, integral

    @classmethod
    def go_to_start(cls):
        Wheels.start()
        last_error = integral = 0
        cls.running = True
        while cls.running:
            last_error, integral = cls.correct_path(last_error, integral)
            if ColorSensors.get_tag_value() > cls.max_ref + 10:
                break
            time.sleep(0.01)
        Wheels.stop()
        cls.running = False
        cls.current_location = (0, 0)

    @classmethod
    def tag_counter(cls):
        cls.tag_ctr = 0
        time.sleep(0.2)
        while cls.running:
            if ColorSensors.get_tag_value() < cls.min_ref + 10:
                cls.tag_ctr += 1
                time.sleep(0.2)

    @classmethod
    def follow_line_until(cls, n_tags):
        Wheels.start()
        last_error = integral = 0
        cls.running = True
        cls.tag_ctr = 0
        threading.Thread(target=Navigation.tag_counter, name='line_follower-nav-tag_counter').start()
        while cls.running:
            last_error, integral = cls.correct_path(last_error, integral)
            if cls.tag_ctr == n_tags:
                break
            time.sleep(0.01)
        Wheels.stop()
        cls.running = False

    @classmethod
    def go_to_location(cls, loc):

        if cls.current_location is None:
            return 2

        x_to, y_to = loc
        x_from, y_from = cls.current_location

        if x_to < 0 or y_to < 0 or x_to >= cls.x_tags or y_to >= cls.y_tags:
            return 1

        if cls.current_location == loc:
            return 0

        def go_to_local():
            x_from, y_from = cls.current_location
            cls.follow_line_until((cls.x_tags + x_to - x_from) % cls.x_tags)
            if y_to > 0:
                Wheels.turn_right_rel(0.5)
                cls.follow_line_until(y_to + 1)

        if y_from > 0:
            if x_from == x_to:
                if y_from < y_to:
                    cls.follow_line_until(y_to - y_from)
                else:
                    cls.go_to_start()
                    go_to_local()
            else:
                cls.go_to_start()
                go_to_local()
        else:
            go_to_local()

        cls.current_location = loc
        return 0






#
#
#
#
class ControlThread(threading.Thread):
    def __init__(self):
        self.command = ""
        self.running = False
        threading.Thread.__init__(self)

    def run(self):
        Navigation.init()
        Grip.init()
        while len(filter(lambda x: 'init' in x.getName(), threading.enumerate())) > 0:
            time.sleep(0.05)
        self.running = True
        while self.running:
            if self.command == "":
                continue
            else:
                cmd = self.command.strip().split()
                if cmd[0] == "go-to-start":
                    Navigation.go_to_start()
                elif cmd[0] == "go-to-location":
                    Navigation.go_to_location((int(cmd[1]), int(cmd[2])))
                self.command = ""

            time.sleep(0.1)
        self.running = False


    def stop(self):
        self.running = False