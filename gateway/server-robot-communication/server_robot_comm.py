#!/usr/bin/python
import zerorpc
import json
import time
import sys
import os

#
#
#
#
class ServerGatewayRobotComm(object):

    def __init__(self, robot_ip):
        self.robot_client = zerorpc.Client()
        self.robot_client.connect("tcp://%s:4242" % robot_ip)
        self.robot_success = False

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
            self.robot_success = self.robot_client.execute_command(cmd)

        response["command"] = command
        response["ID"] = ID
        response["status"] = self.robot_success and cmd_f
        return "".join(json.dumps(response))

    def stop(self):
        self.robot_client.close()


#
#
#
#
class GatewayZRPC(object):
    def __init__(self, robot_ip):
        self.gc = ServerGatewayRobotComm(robot_ip)
        self.gzpc = zerorpc.Server(self.gc)
        self.gzpc.bind("tcp://0.0.0.0:4242")

    def start(self):
        self.gzpc.run()

    def stop(self):
        self.gc.stop()
        self.gzpc.stop()


def main(robot_ip):
    # Check IP
    if os.system("ping -c 1 " + robot_ip) != 0:
        print "IP is invalid or device is offline"
        sys.exit()

    gzpc = GatewayZRPC(robot_ip)
    try:
        gzpc.start()
    except KeyboardInterrupt:
        gzpc.stop()
        sys.exit()

if __name__ == "__main__":
    main(sys.argv[1])
