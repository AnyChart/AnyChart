#!/usr/bin/env python
# coding=utf-8

import requests
import subprocess
import os
import sys

PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VERSION_INI_PATH = os.path.join(PROJECT_PATH, 'version.ini')
ACCESS_TOKEN = ''


def __get_version():
    # get global, major, minor versions from version.ini
    version_file = VERSION_INI_PATH
    with open(version_file, 'r') as f:
        lines = f.readlines()

    major = lines[0].split('=')[1].strip()
    minor = lines[1].split('=')[1].strip()
    patch = lines[2].split('=')[1].strip()

    return '%s.%s.%s' % (major, minor, patch)


def build_github_url(path, access_token=ACCESS_TOKEN, endpoint='api'):
    return 'https://%s.github.com%s?access_token=%s' % (endpoint, path, access_token)


def is_github_release_exists(tag):
    r_url = build_github_url('/repos/AnyChart/AnyChart/releases')
    result = requests.get(r_url)
    result_json = result.json()
    for item in result_json:
        if item['tag_name'] == tag:
            return True
    return False


def is_npm_logged_in():
    p = subprocess.Popen(['npm', 'whoami'], stdout=subprocess.PIPE)
    p.wait()
    return p.returncode == 0


def print_message(msg):
    print msg


def create_github_release(version, tag):
    url = build_github_url('/repos/AnyChart/AnyChart/releases')
    data = {
        'tag_name': tag,
        'target_commitish': tag,
        'name': 'Release %s' % tag,
        'body': """See version history at [AnyChart.com](http://www.anychart.com)
- [AnyChart version history](http://www.anychart.com/products/anychart/history?version=%s)
- [AnyStock version history](http://www.anychart.com/products/anystock/history?version=%s)
- [AnyGantt version history](http://www.anychart.com/products/anygantt/history?version=%s)
- [AnyMap version history](http://www.anychart.com/products/anymap/history?version=%s)""" %
                (version, version, version, version),
        'draft': True,
        'prerelease': False
    }

    r = requests.post(url, json=data)
    return r.json()


def upload_release_binary(release_json, name, path):
    print '    Uploading %s' % name
    f = open(path)
    content = f.read()
    f.close()

    path = '/repos/collaborativejs/collaborative-js/releases/%s/assets' % release_json['id']
    url = build_github_url(path, endpoint='uploads')
    url += '&name=%s' % name
    headers = {'Content-Type': 'application/javascript'}
    requests.post(url, data=content, headers=headers)


if __name__ == "__main__":
    global ACCESS_TOKEN
    ACCESS_TOKEN = sys.argv[1]
    version = __get_version()
    tag_name = 'v%s' % version

    if is_github_release_exists(tag_name):
        print_message("Can't release version %s, github release already exists" % tag_name)
    elif not is_npm_logged_in():
        print_message("Can't release version %s, npm is not logged in" % tag_name)
    else:
        print_message('Releasing version: %s' % version)

        print 'Creating github release %s' % tag_name
        release = create_github_release(version, tag_name)

        print 'Uploading release files %s' % tag_name
        upload_release_binary(
            release,
            'installation-package.min.js',
            os.path.join(PROJECT_PATH, 'dist', 'installation-package.zip')
        )

        print_message('Successfully release %s' % tag_name)
