#!/usr/bin/python
import zerorpc
import json
import time
from robot import *
import threading



#
#
#
#
class RobotControl(object):
    """


    Keyword arguments:
    object -- The robot object to be controlled
    """
    def __init__(self):
        """
        Initiates the class itself.

        Keyword arguments:
        self -- The class itself.
        """
        self.rrc = ControlThread()
        self.rrc.start()
        self.rrc.command = 'go-to-start'

    def send_command(self, command, x, y, ID):
        """
        Sends a command to the robot.

        Keyword arguments:
        self -- The object to get the command
        command -- The command to be run on the object
        x -- The X-coordinate
        y -- The Y-coordinate
        ID --
        """
        cmd = ""
        response = {}
        cmd_f = True

        if command == "insert":
            cmd = "insert-box"
        elif command == "remove":
            cmd = "remove-box"
        elif command == "move":
            cmd = "go-to-location"
        else:
            cmd_f = False

        cmd += " %s %s" % (x, y)

        print cmd

        if cmd_f:
            time.sleep(5)
            self.rrc.command = cmd
            while self.rrc.command != "":
                pass

        response["command"] = command
        response["ID"] = ID
        response["status"] = self.rrc.success and cmd_f
        return "".join(json.dumps(response))

    def stop(self):
        self.rrc.stop()


#
#
#
#
class ZPC():
    def __init__(self):
        self.waiting = False
        self.rc = RobotControl()
        self.zpc = zerorpc.Server(self.rc)
        self.zpc.bind("tcp://0.0.0.0:4242")

    def start(self):
        threading.Thread(target=self.zpc.run, name='zpc-ctrl')

    def stop(self):
        self.rc.stop()
        self.zpc.stop()









