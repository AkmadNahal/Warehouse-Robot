#!/usr/bin/python
import zerorpc
import json
import time
from tasks import *

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

rc = RobotControl()
s = zerorpc.Server(rc)
s.bind("tcp://0.0.0.0:4242")
s.run()
rc.rrc.stop()







