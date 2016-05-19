#!/usr/bin/python
import zerorpc
import json
from tasks import *

class RobotControl(object):
    def __init__(self):
        self.rrc = ControlThread()
        self.rrc.start()

    def send_command(self, command, x, y, ID):
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

        if cmd_f:
            self.rrc.command = cmd
            while self.rrc.command != "":
                pass

        response["command"] = command
        response["ID"] = ID
        response["status"] = self.rrc.success
        return json.dumps(response)

s = zerorpc.Server(RobotControl())
s.bind("tcp://0.0.0.0:4242")
s.run()






