#!/usr/bin/env python
# coding=utf-8

import os
import sys
from maxcdn import MaxCDN

PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def get_paths_list(path, prefix):
    result = []

    for dir_path, subdir_list, files_list in os.walk(path):
        for file_name in files_list:
            file_path = os.path.join(dir_path, file_name)
            file_rel_path = os.path.relpath(file_path, path)
            result.append(prefix + file_rel_path)

    return result


def split(array, size):
    for i in range(0, len(array), size):
        yield array[i:i + size]


if __name__ == '__main__':
    version = sys.argv[1]
    cdn_alias = sys.argv[2]
    cdn_consumer_key = sys.argv[3]
    cdn_consumer_secret = sys.argv[4]
    cdn_zone_id = sys.argv[5]

    dist_path = os.path.join(PROJECT_PATH, 'dist')

    releases = get_paths_list(dist_path, '/releases/%s/' % version)

    legacy_versioned_js = get_paths_list(os.path.join(dist_path, 'js'), '/js/%s/' % version)
    legacy_versioned_css = get_paths_list(os.path.join(dist_path, 'css'), '/css/%s/' % version)
    legacy_versioned_themes = get_paths_list(os.path.join(dist_path, 'themes'), '/themes/%s/' % version)
    legacy_schemas = [
        '/schemas/%s/json-schema.json' % version,
        '/schemas/%s/xml-schema.xsd' % version
    ]

    paths = releases
    paths += legacy_versioned_js + legacy_versioned_css
    paths += legacy_versioned_themes + legacy_schemas

    pieces = list(split(paths, 250))
    for piece in pieces:
        api = MaxCDN(cdn_alias, cdn_consumer_key, cdn_consumer_secret)
        api.purge(cdn_zone_id, piece)
