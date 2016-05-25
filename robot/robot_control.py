#!/usr/bin/python
import zerorpc
import robot
import sys



#
#
#
#
class RobotControl(object):
    """


    Keyword arguments:
    """
    def __init__(self):
        """
        Initiates the class itself.

        Keyword arguments:
        self -- The class itself.
        """
        self.rrc = robot.ControlThread()
        self.rrc.start()
        self.rrc.command = 'go-to-start'

    def execute_command(self, command):
        self.rrc.command = command
        while self.rrc.command != "":
            pass
        return self.rrc.success

    def stop(self):
        self.rrc.stop()


#
#
#
#
class RobotZRPC():
    def __init__(self):
        self.rc = RobotControl()
        self.zpc = zerorpc.Server(self.rc)
        self.zpc.bind("tcp://0.0.0.0:4242")

    def start(self):
        self.zpc.run()

    def stop(self):
        self.rc.stop()
        self.zpc.stop()

def main():
    rzpc = RobotZRPC()
    try:
        rzpc.start()
    except KeyboardInterrupt:
        rzpc.stop()
        sys.exit()

if __name__ == "__main__":
    main()