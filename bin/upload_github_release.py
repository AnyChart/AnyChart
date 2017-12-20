#!/usr/bin/env python
# coding=utf-8

import requests
import os
import sys

PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VERSION_INI_PATH = os.path.join(PROJECT_PATH, 'version.ini')


def get_version():
    # get global, major, minor versions from version.ini
    version_file = VERSION_INI_PATH
    with open(version_file, 'r') as f:
        lines = f.readlines()

    major = lines[0].split('=')[1].strip()
    minor = lines[1].split('=')[1].strip()
    patch = lines[2].split('=')[1].strip()

    return '%s.%s.%s' % (major, minor, patch)


def build_github_url(path, endpoint='api'):
    access_token = sys.argv[1]
    return 'https://%s.github.com%s?access_token=%s' % (endpoint, path, access_token)


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
    print r.text
    return r.json()


def upload_release_binary(release_json, name, path):
    print '    Uploading %s' % name
    f = open(path)
    content = f.read()
    f.close()

    path = '/repos/AnyChart/AnyChart/releases/%s/assets' % release_json['id']
    url = build_github_url(path, endpoint='uploads')
    url += '&name=%s' % name
    headers = {'Content-Type': 'application/javascript'}
    r = requests.post(url, data=content, headers=headers)
    print r.text


if __name__ == "__main__":
    version = get_version()
    tag_name = 'v%s' % version

    print 'Creating github release %s' % tag_name
    release = create_github_release(version, tag_name)

    print 'Uploading release files %s' % tag_name
    upload_release_binary(
        release,
        'anychart-installation-package-%s.zip' % version,
        os.path.join(PROJECT_PATH, 'dist', 'anychart-installation-package-%s.zip' % version)
    )

    print 'Successfully release %s' % tag_name
