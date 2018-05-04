#!/usr/bin/env python
# coding=utf-8

import subprocess
import requests
import sys
import os

def __get_commit_msg():
    return __exec_command_and_get_output(['git', 'log', '-1', '--pretty=%B'])

def __get_commit_url():
    return 'https://github.com/AnyChart/AnyChart/commit/' + __get_commit_hash()

def __get_commit_hash():
    return __exec_command_and_get_output(['git', 'rev-parse', 'HEAD'])

def __get_commit_author():
    return __exec_command_and_get_output(['git', 'log', '-1', '--pretty=%an'])

def __get_commit_date():
    return __exec_command_and_get_output(['git', 'log', '-1', '--pretty=%ci'])

def __exec_command_and_get_output(commands):
    p = subprocess.Popen(commands, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (output, err) = p.communicate()
    return output.strip()

def __send_notification(msg):
    skype_id = os.getenv('SKYPE_ID')
    skype_key = os.getenv('SKYPE_KEY')
    chat_id = os.getenv('SKYPE_ROOM')

    def __get_access_token(id, secret):
        url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        data = {'client_id': id,
                'scope': 'https://api.botframework.com/.default',
                'grant_type': 'client_credentials',
                'client_secret': secret}
        try:
            r = requests.post(url, data=data)
            if r.status_code == requests.codes.ok:
                return r.json()['access_token']
        except Exception as e:
            print e

    def __send_msg(message, skype_id, token):
        url = ('https://apis.skype.com/v2/conversations/{}/activities'.format(skype_id))
        data = {'message': {'content': message}}
        headers = {'Authorization': 'Bearer {}'.format(token)}
        if token:
            try:
                requests.post(url, json=data, headers=headers)
            except Exception as e:
                print e

    token = __get_access_token(skype_id, skype_key)
    __send_msg(msg, chat_id, token)

msg = 'skype error'

if sys.argv[1] == 'commit':
    msg = '%s <a href="%s">commit</a> to branch %s - %s' % (__get_commit_author(), __get_commit_url(), sys.argv[2], __get_commit_msg())

__send_notification(msg)