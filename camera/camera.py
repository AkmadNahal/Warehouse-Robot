#!/usr/bin/env python

import cv2
import telegram


class Cameras:
    default, external = 0, 1


def get_video_capture(cam=0):
    return cv2.VideoCapture(cam)


def get_frame(video_capture):
    _, frame = video_capture.read()
    return frame


def show_camera_input(video_capture):
    while True:
        _, frame = video_capture.read()
        cv2.imshow('camera_input', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break


def connect_to_bot(token='224244630:AAH_6wstH8LxyPxS_ykxeBmtL98RlUbZON8'):
    bot = telegram.Bot(token=token)
    assert bot.getMe() is not None
    return bot
