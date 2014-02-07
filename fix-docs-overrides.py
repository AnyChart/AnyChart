#!/usr/bin/env python
#coding=utf-8

import os
import re
import sys
import subprocess

MAINPATH = os.path.abspath(os.path.dirname(__file__))

def __fixErrors(isFixErrors=False):
    source = []
    for dirname, dirnames, filenames in os.walk(os.path.join(MAINPATH, 'src')):
        for filename in filenames:
            source.append(os.path.join(dirname, filename))
    filesWithErrors = ""
    for filename in source:
        path = os.path.join(MAINPATH, filename)
        data = open(path).read()
        # для начала просто ищем косяк документации в файле
        if re.search('\*\/\n\/\*\*', data):
          filesWithErrors += path + " "
          if isFixErrors:
            o = open(path, "w")
            o.write(re.sub('\*\/\n\/\*\*', '*//**' , data))
            o.close()
            print "fixied "+path

    if not isFixErrors:
      print filesWithErrors.replace(' ', '\n')+'RUN AUTOFIX to fix this\n' if (len(filesWithErrors)>0) else 'ok'


def __printHelp():
    print "Команды выполняемые скриптом:\n"\
          "\n"\
          "--lint          Флаг, что запущен в режиме линтера. В таком случае скрипт просто выведет, \n"\
          "                сообщение, что ошибки присутствуют, ничего править не будет. \n"\
          "\n"\
          "--autofix       Флаг, что запушен в режиме автофикса. В таком случае все найденные ошибки\n"\
          "                будут исправлены но не будут закомиченны.\n"\


if __name__ == '__main__':
    args = sys.argv
    if len(args) == 1:
        __printHelp()
    elif args[1] == 'help' or args[1] == '--help' or args[1] == '-h':
        __printHelp()
    elif args[1] == '--lint':
        __fixErrors()
    elif args[1] == '--autofix':
        __fixErrors(True)
    else:
        __printHelp()
