#!/usr/bin/env python
# coding=utf-8

import os
import sys
from maxcdn import MaxCDN

def get_paths_list(path, prefix):
    result = []

    for dir_path, subdir_list, files_list in os.walk(path):
        for file_name in files_list:
            file_path = os.path.join(dir_path, file_name)
            file_rel_path = os.path.relpath(file_path, path)
            result.append(os.path.join(prefix, file_rel_path))

    return result


def split(array, size):
    for i in range(0, len(array), size):
        yield array[i:i + size]


if __name__ == '__main__':
    dir_invalidate = sys.argv[1]
    url_prefix = sys.argv[2]
    cdn_alias = os.environ.get('CDN_ALIAS')
    cdn_consumer_key = os.environ.get('CDN_CONSUMER_KEY')
    cdn_consumer_secret = os.environ.get('CDN_CONSUMER_SECRET')
    cdn_zone_id = os.environ.get('CDN_ZONE_ID')

    if not cdn_alias:
        print("Environment variable was not found: CDN_ALIAS\n export CDN_ALIAS='blabla'")
        sys.exit(1)
    if not cdn_consumer_key:
        print("Environment variable was not found: CDN_CONSUMER_KEY\n export CDN_CONSUMER_KEY='blabla'")
        sys.exit(1)
    if not cdn_consumer_secret:
        print("Environment variable was not found: CDN_CONSUMER_SECRET\n export CDN_CONSUMER_SECRET='blabla'")
        sys.exit(1)
    if not cdn_zone_id:
        print("Environment variable was not found: CDN_ZONE_ID\n export CDN_ZONE_ID='blabla'")
        sys.exit(1)

    paths = get_paths_list(dir_invalidate, url_prefix)

    print "Invalidate following files:"
    print paths

    pieces = list(split(paths, 200))
    for piece in pieces:
        api = MaxCDN(cdn_alias, cdn_consumer_key, cdn_consumer_secret)
        api.purge(cdn_zone_id, piece)
