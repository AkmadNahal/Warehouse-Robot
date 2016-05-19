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

    kp = kd = ki = direction = def_power = None
    min_ref = max_ref = target = None
    running = ctr_running = use_tag_ctr = False

    current_location = None

    x_tags = y_tags = None

    tag_ctr = 0

    @classmethod
    def init(cls, kp=0.65, kd=1, ki=0.02, direction=1, power=40):
        cls.kp = kp
        cls.kd = kd
        cls.ki = ki
        cls.direction = direction
        cls.def_power = Wheels.power = power
        cls.x_tags = cls.y_tags = 4
        threading.Thread(target=cls.calibrate, name='init-nav-calibrate').start()
        threading.Thread(target=cls.tag_counter, name='nav-tag_ctr').start()


    @classmethod
    def calibrate(cls):
        min = 255
        max = 0

        Wheels.turn_right_rel(0.5, False)
        while Wheels.wheels_running():
            val = ColorSensors.get_line_value()
            if val > max:
                max = val
            if val < min:
                min = val
        Wheels.turn_left_rel(-1, False)
        while Wheels.wheels_running():
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
        Wheels.set_sp(*Wheels.steering(course, Wheels.power))
        return last_error, integral

    @classmethod
    def go_to_start(cls):
        cls.follow_line_until_wtag()
        cls.current_location = (0, 0)

    @classmethod
    def tag_counter(cls):
        cls.tag_ctr = 0
        cls.ctr_running = True
        while cls.ctr_running:
            if cls.use_tag_ctr:
                if ColorSensors.get_tag_value() < cls.min_ref + 10:
                    cls.tag_ctr += 1
                    time.sleep(0.2)
            time.sleep(0.01)

    @classmethod
    def follow_line_until(cls, n_tags):
        Wheels.start()
        last_error = integral = 0
        cls.tag_ctr = 0
        cls.running = cls.use_tag_ctr = True
        while cls.running:
            last_error, integral = cls.correct_path(last_error, integral)
            if cls.tag_ctr == n_tags:
                break
            time.sleep(0.01)
        Wheels.stop()
        cls.use_tag_ctr = cls.running = False

    @classmethod
    def follow_line_until_wtag(cls):
        Wheels.start()
        last_error = integral = 0
        cls.running = True
        while cls.running:
            last_error, integral = cls.correct_path(last_error, integral)
            if ColorSensors.get_tag_value() > Navigation.max_ref + 5:
                break
            time.sleep(0.01)
        Wheels.stop()
        cls.running = False

    def follow_line_forever(cls):
        Wheels.start()
        last_error = integral = 0
        cls.running = True
        while cls.running:
            last_error, integral = cls.correct_path(last_error, integral)
            time.sleep(0.01)
        Wheels.stop()
        cls.running = False

    @classmethod
    def go_to_location(cls, loc):

        if cls.current_location is None:
            return 2

        x_to, y_to = loc
        x_from, y_from = cls.current_location

        if x_to < 0 or y_to < 0 or x_to >= cls.x_tags or y_to >= cls.y_tags or (x_to == 0 and y_to > 0):
            return 1

        if cls.current_location == loc:
            return 0

        def go_to_local():
            x_from, y_from = cls.current_location
            if x_from < x_to:
                cls.follow_line_until(x_to - x_from)
            elif x_from > x_to:
                Wheels.turn_right_rel(1.1)
                cls.follow_line_until(cls.y_tags + 1 + x_to)
            if y_to > 0:
                Wheels.turn_right_rel(1.1)
                cls.follow_line_until(y_to)

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

    @classmethod
    def turn_right_until(cls, n_tags, direction=1):
        Wheels.turn_right_forever(direction)
        time.sleep(0.3)
        cls.tag_ctr = 0
        cls.running = cls.use_tag_ctr = True
        while cls.running and cls.tag_ctr < n_tags:
            pass
        Wheels.stop()
        cls.running = cls.use_tag_ctr = False

    @classmethod
    def turn_left_until(cls, n_tags, direction=1):
        Wheels.turn_left_forever(direction)
        time.sleep(0.3)
        cls.tag_ctr = 0
        cls.running = cls.use_tag_ctr = True
        while cls.running and cls.tag_ctr < n_tags:
            pass
        Wheels.stop()
        cls.running = cls.use_tag_ctr = False

    @classmethod
    def move_until(cls, n_tags, direction=1):
        Wheels.start()
        Wheels.set_sp(direction*Wheels.power, direction*Wheels.power)
        time.sleep(0.3)
        cls.tag_ctr = 0
        cls.running = cls.use_tag_ctr = True
        while cls.running and cls.tag_ctr < n_tags:
            pass
        Wheels.stop()
        cls.running = cls.use_tag_ctr = False

    @classmethod
    def set_power(cls, power):
        Wheels.power = power

    @classmethod
    def reset_power(cls):
        Wheels.power = cls.def_power

    @classmethod
    def stop(cls):
        Wheels.stop()
        cls.running = cls.ctr_running = False


#
#
#
#
class BoxCollector:

    power = 30

    @classmethod
    def collect_box(cls):
        Navigation.set_power(cls.power)
        if Navigation.current_location == (0, 0):
            if 5 < UltrasonicSensor.get_dist() / 10 < 40:
                Wheels.move_rel(0.1)
                Navigation.follow_line_until_wtag()
                Grip.move_down()
            else:
                Navigation.reset_power()
                return 1
        else:
            Navigation.turn_right_until(2)
            while len(filter(lambda x: 'tag_counter' in x.getName(), threading.enumerate())) > 0:
                time.sleep(0.05)
            if 5 < UltrasonicSensor.get_dist() / 10 < 40:
                Navigation.follow_line_until_wtag()
                Grip.move_down()
                Navigation.move_until(1, -1)
                Navigation.turn_left_until(2, -1)
            else:
                Navigation.turn_left_until(2, -1)
                Navigation.reset_power()
                return 1
        Navigation.reset_power()
        return 0

    @classmethod
    def place_box(cls):
        Navigation.set_power(cls.power)
        if Navigation.current_location == (0, 0):
            Wheels.move_rel(0.1)
            Navigation.follow_line_until_wtag()
            Grip.move_up()
            Wheels.move_rel(-0.7)

        else:
            Wheels.turn_right_rel(0.9)
            Navigation.follow_line_until_wtag()
            Grip.move_up()
            Navigation.move_until(1, -1)
            Navigation.turn_left_until(2, -1)
        Navigation.reset_power()


#
#
#
#
class ControlThread(threading.Thread):
    def __init__(self):
        self.command = ""
        self.running = False
        self.active = False
        self.success = False
        self.commands = ["go-to-start", "go-to-location", "collect-box", "place-box", "insert-box", "remove-box"]
        threading.Thread.__init__(self)

    def run(self):
        Navigation.init()
        Grip.init()
        while len(filter(lambda x: 'init' in x.getName(), threading.enumerate())) > 0:
            time.sleep(0.05)
        self.running = True
        while self.running:
            if self.command != "":
                cmd = self.command.strip().split()
                if cmd[0] not in self.commands or len(cmd) > 1 and (not cmd[1].isdigit() or not cmd[2].isdigit()):
                    continue
                if cmd[0] == "go-to-start":
                    Navigation.go_to_start()
                    self.success = True
                elif cmd[0] == "go-to-location":
                    Navigation.go_to_location((int(cmd[1]), int(cmd[2])))
                    self.success = True
                elif cmd[0] == "collect-box":
                    BoxCollector.collect_box()
                    self.success = True
                elif cmd[0] == "place-box":
                    BoxCollector.place_box()
                    self.success = True
                elif cmd[0] == "insert-box":
                    Navigation.go_to_location((0, 0))
                    ret = BoxCollector.collect_box()
                    if ret == 0:
                        Navigation.go_to_location((int(cmd[1]), int(cmd[2])))
                        BoxCollector.place_box()
                        Navigation.go_to_location((0, 0))
                    self.success = ret == 0
                elif cmd[0] == "remove-box":
                    Navigation.go_to_location((int(cmd[1]), int(cmd[2])))
                    ret = BoxCollector.collect_box()
                    Navigation.go_to_location((0, 0))
                    if ret == 0:
                        BoxCollector.place_box()
                    self.success = ret == 0
                self.command = ""
            time.sleep(0.1)
        self.running = False

    def stop(self):
        self.running = False
        Navigation.stop()