#!/usr/bin/evn python
import ev3dev.auto as ev3
import threading
import time


class Position:
    up, down = 0, -0.15

# def wait_motor(motor):
#     while (motor.state == ['running']):
#         pass


rMtr_sp = 0
lMtr_sp = 0
mMtr_pos = Position.up

running = True

class WheelsThread(threading.Thread):
    def __init__(self):
        self.rMtr = ev3.LargeMotor(ev3.OUTPUT_D)
        self.lMtr = ev3.LargeMotor(ev3.OUTPUT_C)
        threading.Thread.__init__(self)

    def run(self):
        while running:
            self.rMtr.run_forever(duty_cycle_sp = rMtr_sp)
            self.lMtr.run_forever(duty_cycle_sp = lMtr_sp)

        self.rMtr.stop()
        self.lMtr.stop()

## THIS IS A RANDOM COMMENTs AND I ADD THIS

class GripThread(threading.Thread):
    def __init__(self):
        self.mMtr = ev3.MediumMotor(ev3.OUTPUT_A)
        threading.Thread.__init__(self)

    def run(self):
        self.mMtr.run_timed(time_sp=1000, duty_cycle_sp=-30)
        while self.mMtr.state == ['running']:
            pass
        self.mMtr.reset()
        self.mMtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=0.25 * self.mMtr.count_per_rot)
        while self.mMtr.state == ['running']:
            pass
        self.mMtr.reset()
        pos_prev = mMtr_pos
        while running:
            if pos_prev != mMtr_pos:
                self.mMtr.run_to_abs_pos(duty_cycle_sp=30, position_sp=mMtr_pos * self.mMtr.count_per_rot)
                pos_prev = mMtr_pos
        self.mMtr.stop()

if __name__ == "__main__":
    wheel_thread = WheelsThread()
    wheel_thread.setDaemon(True)
    wheel_thread.start()

    grip_thread = GripThread()
    grip_thread.start()

    time.sleep(4)
    mMtr_pos = Position.down
    time.sleep(4)
    mMtr_pos = Position.up
    time.sleep(4)

    running = False


    # snc = ev3.UltrasonicSensor(ev3.INPUT_4)

