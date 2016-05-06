#!/usr/bin/python
from tasks import *


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

