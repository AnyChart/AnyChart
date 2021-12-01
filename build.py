#!/usr/bin/env python
# coding=utf-8


import imp
import os
import sys
import subprocess
import platform
import urllib
import urllib2
import zipfile
import time
import argparse
import shlex
import gzip
import json
import traceback
import collections
import time
import re
import json


# region --- Project paths
# ======================================================================================================================
# Project paths
# ======================================================================================================================
# java heap size in Mb
JAVA_HEAP_SIZE = 1024

# project
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
LIBS_PATH = os.path.join(PROJECT_PATH, 'libs')
SRC_PATH = os.path.join(PROJECT_PATH, 'src')
OUT_PATH = os.path.join(PROJECT_PATH, 'out')
MANIFEST_OUT_PATH = os.path.join(OUT_PATH, 'file.manifest.json')
TRAVIS_COMMANDS_PATH = os.path.join(OUT_PATH, 'travis-copy-bundles')
DIST_PATH = os.path.join(PROJECT_PATH, 'dist')
THEMES_PATH = os.path.join(SRC_PATH, 'themes')

# graphics
GRAPHICS_PATH = os.path.join(LIBS_PATH, 'graphicsjs')
GRAPHICS_SRC_PATH = os.path.join(LIBS_PATH, GRAPHICS_PATH, 'src')

# closure tools
# COMPILER_VERSION = '20170521'
# COMPILER_VERSION = '20161024'
COMPILER_VERSION = '20180204'
COMPILER_PATH = os.path.join(LIBS_PATH, 'compiler', 'closure-compiler-v%s.jar' % COMPILER_VERSION)
CLOSURE_LIBRARY_PATH = os.path.join(LIBS_PATH, 'closure-library')
CLOSURE_SOURCE_PATH = os.path.join(CLOSURE_LIBRARY_PATH, 'closure', 'goog')
CLOSURE_BIN_PATH = os.path.join(CLOSURE_LIBRARY_PATH, 'closure', 'bin')
DEPS_WRITER_PATH = os.path.join(CLOSURE_BIN_PATH, 'build', 'depswriter.py')
CLOSURE_BUILDER_PATH = os.path.join(CLOSURE_BIN_PATH, 'build', 'closurebuilder.py')

# special files
STAT_REPORT_OUT_PATH = os.path.join(OUT_PATH, 'size.stat.json')
MODULES_CONFIG_PATH = os.path.join(PROJECT_PATH, 'bin', 'sources','modules.json')
VERSION_INI_PATH = os.path.join(PROJECT_PATH, 'version.ini')
ANYCHART_DEPS_PATH = os.path.join(SRC_PATH, 'deps.js')
CLOSURE_DEPS_PATH = os.path.join(CLOSURE_SOURCE_PATH, 'deps.js')

CHECKS_FLAGS = os.path.join(PROJECT_PATH, 'bin', 'sources','checks.flags')
COMMON_FLAGS = os.path.join(PROJECT_PATH, 'bin', 'sources','common.flags')
BINARIES_WRAPPER_START = os.path.join(PROJECT_PATH, 'bin', 'sources','binaries_wrapper_start.txt')
BINARIES_WRAPPER_END = os.path.join(PROJECT_PATH, 'bin', 'sources','binaries_wrapper_end.txt')
AMD_WRAPPER_START = os.path.join(PROJECT_PATH, 'bin', 'sources','amd_wrapper_start.txt')
AMD_WRAPPER_END = os.path.join(PROJECT_PATH, 'bin', 'sources','amd_wrapper_end.txt')
GIT_CONTRIBUTORS_URL = 'https://api.github.com/repos/anychart/anychart/contributors'
GIT_COMPARE_URL_TEMPLATE = 'https://api.github.com/repos/AnyChart/AnyChart/compare/master...%s'


# endregion
# region --- Utils
# ======================================================================================================================
# Utils
# ======================================================================================================================
def __create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.mkdir(path)


def __download_and_unzip_from_http(from_url, path, dir_name):
    z_obj_path = os.path.join(path, dir_name + '.zip')

    # download zip archive from url
    if not os.path.exists(z_obj_path):
        urllib.urlretrieve(
            from_url,
            z_obj_path
        )

    # extract zip archive
    target_path = os.path.join(path, dir_name)
    __create_dir_if_not_exists(target_path)
    z_obj = zipfile.ZipFile(z_obj_path)
    z_obj.extractall(path=target_path)
    z_obj.close()

    # remove archive file
    os.remove(z_obj_path)


def __ensure_installed(module_name, version=None):
    try:
        imp.find_module(module_name)
        return False
    except ImportError:
        print 'Installing ' + module_name
        commands = ['python', '-m', 'pip', 'install',
                    module_name if version is None else '%s==%s' % (module_name, version),
                    '--user']
        try:
            subprocess.call(commands)
        except StandardError:
            raise StandardError('Install failed: you should install pip manually first')
        print 'Done'
        return True


def sync_libs(needs_lesscpy=False, needs_jsb=False):
    __create_dir_if_not_exists(LIBS_PATH)
    flag = False
    if not os.path.exists(CLOSURE_LIBRARY_PATH) or \
            not os.path.exists(GRAPHICS_PATH):
        flag = True
        print 'Initializing submodules'
        subprocess.call(['git', 'submodule', 'update', '--init'])
        subprocess.call(['rm', '-f', '.git/hooks/post-checkout'])
        subprocess.call(['ln', '-s', '../../update-submodules', '.git/hooks/post-checkout'])
        print 'Done'
    if not os.path.exists(COMPILER_PATH):
        flag = True
        print 'Downloading closure compiler'
        __download_and_unzip_from_http(
            'http://dl.google.com/closure-compiler/compiler-%s.zip' % COMPILER_VERSION,
            LIBS_PATH,
            'compiler'
        )
        print 'Done'
    if needs_lesscpy:
        flag = __ensure_installed('lesscpy') or flag
    if needs_jsb:
        flag = __ensure_installed('jsbeautifier', '1.6.2') or flag
    if flag:
        print 'All libraries installed'


def __gzip_file(f):
    with open(f, 'rb') as f_in, gzip.open(f + '.gz', 'wb') as f_out:
        f_out.writelines(f_in)


def __get_gzip_file_size(f):
    gzip_path = f + '.gz'
    rm_after = False

    if not os.path.exists(gzip_path):
        __gzip_file(f)
        rm_after = True
    size = os.path.getsize(gzip_path)

    if rm_after:
        os.remove(gzip_path)

    return int(round(size / 1000))


# endregion
# region --- Decorators
# ======================================================================================================================
# Decorators
# ======================================================================================================================
def memoize(func):
    def wrapper():
        if not hasattr(func, 'cache'):
            func.cache = func()
        return func.cache

    return wrapper


def stopwatch(prefix=''):
    def decorator(func):
        def wrapper(*args, **kwargs):
            t = time.time()
            res = func(*args, **kwargs)
            print '{}Done in {:.3f} sec'.format(prefix, time.time() - t)
            return res

        return wrapper

    return decorator


def sync_required(needs_lesscpy=False, needs_jsb=False):
    def sync_decorator(func):
        def wrapper(*args, **kwargs):
            sync_libs(needs_lesscpy, needs_jsb)
            func(*args, **kwargs)

        return wrapper

    return sync_decorator


def needs_out_dir(func):
    def wrapper(*args, **kwargs):
        __create_dir_if_not_exists(OUT_PATH)
        return func(*args, **kwargs)

    return wrapper


# endregion
# region --- Project file parsers
# ======================================================================================================================
#                            Project file parsers
# ======================================================================================================================
@memoize
def __get_modules_config():
    with open(MODULES_CONFIG_PATH, 'r') as f:
        res = json.load(f)
    return res


@memoize
def __get_themes_list():
    themes_list = []
    restricted = ['merging.js', 'defaultTheme.js']
    for f in os.listdir(THEMES_PATH):
        if f.endswith('.js') and f not in restricted:
            themes_list.append(f[:-3])
    return themes_list


def __get_version():
    # get global, major, minor versions from version.ini
    version_file = VERSION_INI_PATH
    with open(version_file, 'r') as f:
        lines = f.readlines()

    major = lines[0].split('=')[1].strip()
    minor = lines[1].split('=')[1].strip()
    patch = lines[2].split('=')[1].strip()

    return '%s.%s.%s' % (major, minor, patch)

def __get_current_branch_name():
    (name_output, name_err) = subprocess.Popen(
        ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        cwd=PROJECT_PATH).communicate()
    return name_output.strip()


@memoize
def __get_build_version():
    branch_name = __get_current_branch_name()

    travis_branch = os.environ.get('TRAVIS_BRANCH') if branch_name == 'HEAD' else None
    github_token = os.environ.get('GITHUB_TOKEN') if 'GITHUB_TOKEN' in os.environ else None

    if travis_branch is not None:
        # see https://anychart.atlassian.net/browse/DVF-3193
        get_request = lambda url: urllib2.Request(url, None, {'Authorization' : 'token %s' % github_token if github_token else ''})

        contributors_response = urllib2.urlopen(get_request(GIT_CONTRIBUTORS_URL))
        contributors_data = json.loads(contributors_response.read())
        contributions = 0
        for contributor in contributors_data:
            contributions += contributor['contributions']

        compare_response = urllib2.urlopen(get_request(GIT_COMPARE_URL_TEMPLATE % travis_branch))
        compare_data = json.loads(compare_response.read())

        behind_by = compare_data.get('behind_by', 0)
        ahead_by = compare_data.get('ahead_by', 0)
        commits_count = contributions - behind_by + ahead_by
    else:
        (count_output, name_err) = subprocess.Popen(
            ['git', 'rev-list', 'HEAD', '--count'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=PROJECT_PATH).communicate()
        commits_count = count_output.strip()

    return '%s.%s' % (__get_version(), commits_count)


def __version_by_pattern(pattern, path, value=None, rc=None):
    f = open(path, 'r')
    text = f.read()
    f.close()
    try:
        if value:
            text = re.sub(pattern % '([0-9]+\.[0-9]+\.[0-9]+)', pattern % value, text)
            f = open(path, 'w')
            f.write(text)
            f.close()
            if rc:
                return re.search(pattern % '([0-9]+\.[0-9]+\.[0-9]+(-rc)[0-9]+)', text, re.IGNORECASE).group(1)
            else:
                return re.search(pattern % '([0-9]+\.[0-9]+\.[0-9]+)', text, re.IGNORECASE).group(1)
        else:
            if rc:
                return re.search(pattern % '([0-9]+\.[0-9]+\.[0-9]+(\-rc)[0-9]+)', text, re.IGNORECASE).group(1)
            else:
                return re.search(pattern % '([0-9]+\.[0-9]+\.[0-9]+)', text, re.IGNORECASE).group(1)
    except (StandardError, KeyboardInterrupt):
        print traceback.format_exc()
        print "No version found in %s" % path


def __package_json_version(value=None, rc=False):
    return __version_by_pattern(
        '"version": "%s"',
        os.path.join(PROJECT_PATH, 'package.json'),
        value,
        rc
    )


def __json_schema_version(value=None, rc=False):
    return __version_by_pattern(
        '"description": "AnyChart JSON Schema, version %s"',
        os.path.join(PROJECT_PATH, 'dist', 'json-schema.json'),
        value,
        rc
    )


def __xml_schema_target_namespace_version(value=None, rc=False):
    return __version_by_pattern(
        'targetNamespace="http://anychart.com/schemas/%s/xml-schema.xsd"',
        os.path.join(PROJECT_PATH, 'dist', 'xml-schema.xsd'),
        value,
        rc
    )


def __xml_schema_xmlns_version(value=None, rc=False):
    return __version_by_pattern(
        'xmlns="http://anychart.com/schemas/%s/xml-schema.xsd"',
        os.path.join(PROJECT_PATH, 'dist', 'xml-schema.xsd'),
        value,
        rc
    )


def __definition_file_version(value=None, rc=False):
    if rc:
        f = open(os.path.join(PROJECT_PATH, 'dist', 'index.d.ts'), 'r+')
        text = f.read()
        f.write(text.replace('Library, vdevelop','Library, v0.0.0'))
        f.close()
    return __version_by_pattern(
        'Type definitions for AnyChart JavaScript Charting Library, v%s',
        os.path.join(PROJECT_PATH, 'dist', 'index.d.ts'),
        value,
        rc
    )


def __json_2_xml_version(value=None, rc=False):
    return __version_by_pattern(
        "'xmlns', 'http://anychart.com/schemas/%s/xml-schema.xsd'",
        os.path.join(PROJECT_PATH, 'src', 'utils.js'),
        value,
        rc
    )


def __all_files_versions(value=None, rc=False):
    return {
        "json2xml": __json_2_xml_version(value, rc),
        # "xml-schema-target": __xml_schema_target_namespace_version(value, rc),
        # "xml-schema-xmlns": __xml_schema_xmlns_version(value, rc),
        # "json-schema": __json_schema_version(value, rc),
        "definition-file": __definition_file_version(value, rc),
        "package-json": __package_json_version(value, rc),
        "project-(version-ini)": __project_version(value)
    }


def __project_version(value=None):
    f = open(VERSION_INI_PATH, 'r')
    text = f.read()
    f.close()

    if value:
        split = value.split('.')
        text = re.sub("version\.major=([0-9]+)", "version.major=" + split[0], text)
        text = re.sub("version\.minor=([0-9]+)", "version.minor=" + split[1], text)
        text = re.sub("version\.patch=([0-9]+)", "version.patch=" + split[2], text)
        f = open(VERSION_INI_PATH, 'w')
        f.write(text)
        f.close()
        return __get_version()
    else:
        return __get_version()


def __is_rc_version(value):
    try:
        return re.search('([0-9]+\.[0-9]+\.[0-9]+(-rc)[0-9]+)', value, re.IGNORECASE).group(1)
    except:
        return False

def __print_version(*args, **kwargs):
    if kwargs['commits_count']:
        print __get_build_version()
    elif kwargs['major_only']:
        print __get_version().split('.')[0]
    elif kwargs['verify']:
        version = __get_version()
        m = __all_files_versions(None, __is_rc_version(version))
        res = all(x == version for x in m.values())
        print "Ok" if res else "Fail\n " + json.dumps(m)
    elif kwargs['set']:
        print kwargs['set']
        m = __all_files_versions(kwargs['set'], __is_rc_version(kwargs['set']))
        res = all(x == kwargs['set'] for x in m.values())
        print "Ok" if res else "Fail\n " + json.dumps(m)
    else:
        print __get_version()


@memoize
def __get_builds():
    obj = __get_modules_config()
    modules = obj['parts']
    builds = dict()

    def put_in_order(name, descriptor):
        build = builds.get(__get_build_name(descriptor))
        if build is None:
            build = builds[__get_build_name(descriptor)] = (list(), set())
        if name not in build[1]:
            for dependency in descriptor['deps']:
                child_descriptor = modules.get(dependency)
                if child_descriptor is None:
                    raise Exception('Module %s depends on unknown module %s' % (name, dependency))
                if __get_build_name(child_descriptor) != __get_build_name(descriptor):
                    raise Exception('Module %s depends on module %s that belongs to another build sequence' %
                                    (name, child_descriptor))
                put_in_order(dependency, child_descriptor)
            build[0].append(name)
            build[1].add(name)

    for item in modules.iteritems():
        put_in_order(item[0], item[1])

    return {key: value[0] for (key, value) in builds.iteritems()}


@memoize
def __parse_deps():
    def __parse_file(deps_file_path):
        in_dep = False
        dep = ''
        pattern = re.compile(r'''^([^,]+),\[([^\]]*)\],\[([^\]]*)\],.+''')
        with open(deps_file_path, 'r') as f:
            for line in f:
                line = re.sub('[ \r\n\']', '', line)
                if line.startswith('goog.addDependency('):
                    in_dep = not line.endswith(');')
                    dep = line[19:] if in_dep else line[19:-2]
                elif in_dep:
                    in_dep = not line.endswith(');')
                    dep += line if in_dep else line[-2]
                else:
                    in_dep = False
                if dep and not in_dep:
                    match = re.match(pattern, dep)
                    if not match:
                        raise Exception('Failed to parse "%s" in deps file %s' % (dep, deps_file_path))
                    file_name, provides, requires = match.groups('')
                    file_name = os.path.normpath(os.path.join(CLOSURE_SOURCE_PATH, file_name))
                    provides = provides.split(',') if provides else []
                    requires = requires.split(',') if requires else []
                    for ns in provides:
                        if ns in result:
                            raise Exception('Duplicate namespace %s provided in file %s. Original provide in %s' %
                                            (ns, file_name, result[ns][0]))
                        result[ns] = (file_name, provides, requires)

    result = dict()
    __parse_file(CLOSURE_DEPS_PATH)
    __parse_file(ANYCHART_DEPS_PATH)
    return result


# endregion
# region --- Compiler calling
# =======================================================================================================================
# Compiler calling
# =======================================================================================================================
def __call_console_commands(commands):
    commands = ' '.join(commands).replace('\\', '\\\\')
    # print ' '
    # print commands
    # print ' '
    commands = shlex.split(commands)
    p = subprocess.Popen(commands, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (output, err) = p.communicate()
    p.poll()
    return p.returncode, output


def __compile(entry_point=None, output=None, js_files=True, level="ADVANCED_OPTIMIZATIONS", theme=None,
              flag_file=COMMON_FLAGS, defines=None, version=False, dev_edition=None, perf_mon=None,
              additional_params=None, manifest=None, checks_only=False, debug_files=None, externs=None):
    def make_define(*args):
        if isinstance(args[0], tuple):
            args = args[0]
        return '--define="%s=%s"' % args

    def make_entry_point(entry):
        return '--entry_point="%s"' % entry

    def make_js_file(f):
        return '--js="%s"' % f

    commands = ['java -Xmx%sM -jar' % JAVA_HEAP_SIZE, COMPILER_PATH,
                '--compilation_level="%s"' % level]

    if js_files:
        if isinstance(js_files, bool):
            js_files = [os.path.join(SRC_PATH, '**.js'),
                        os.path.join(CLOSURE_SOURCE_PATH, '**.js'),
                        '!' + os.path.join(CLOSURE_SOURCE_PATH, '**_test.js'),
                        os.path.join(GRAPHICS_SRC_PATH, '**.js')]
            commands.append('--dependency_mode=STRICT')
        commands.extend(map(make_js_file, js_files))

    if externs is not None:
        commands.append('--externs="%s"' % externs)

    if output is not None:
        commands.append('--js_output_file="%s"' % output)

    if debug_files is not None:
        # path = PROJECT_PATH.replace('\\', '/')
        commands.extend(['--property_renaming_report="%s.prop_renaming.txt"' % os.path.join(OUT_PATH, debug_files),
                         '--variable_renaming_report="%s.var_renaming.txt"' % os.path.join(OUT_PATH, debug_files),
                         # '--create_source_map %s' % output_file + '.map',
                         # '--source_map_location_mapping \"%s|./../\"' % path
                         ])

    if checks_only:
        commands.append('--checks_only')

    if version:
        if isinstance(version, bool):
            version = __get_build_version()
        commands.append(make_define('anychart.VERSION', version))

    if dev_edition is not None:
        dev_edition = str(dev_edition).lower()
        commands.append(make_define('goog.DEBUG', dev_edition))
        commands.append(make_define('anychart.DEVELOP', dev_edition))

    if perf_mon is not None:
        commands.append(make_define('anychart.PERFORMANCE_MONITORING', 'true' if perf_mon else 'false'))

    if defines is not None:
        commands.extend(map(make_define, defines))

    if theme is not None and theme is not 'none':
        if not os.path.exists(os.path.join(SRC_PATH, 'themes', theme + '.js')):
            theme = 'defaultTheme'
        commands.append(make_define('anychart.DEFAULT_THEME', theme))
        commands.append(make_entry_point(__get_theme_entry_point(theme)))

    if entry_point is not None:
        commands.extend(map(make_entry_point,
                            (entry_point,) if isinstance(entry_point, basestring) else entry_point))

    if flag_file is not None:
        commands.append('--flagfile="%s"' % flag_file)

    if manifest is not None:
        commands.append('--output_manifest="%s"' % manifest)

    if additional_params is not None:
        commands.extend(additional_params)

    return __call_console_commands(commands)


def __get_theme_entry_point(theme_name):
    return 'anychart.themes.%s' % theme_name


def __get_module_entry_point(module_name):
    descriptor = __get_modules_config()['parts'].get(module_name)
    if descriptor is None:
        raise Exception('No module %s declared in modules.json' % module_name)
    return descriptor['entry']


def __get_build_name(descriptor):
    return descriptor.get('build', 'bundle')


# endregion
# region --- Building
# ======================================================================================================================
# Building
# ======================================================================================================================
def __create_opt_dummy(module_name):
    target_dir = os.path.join(OUT_PATH, 'tmp')
    __create_dir_if_not_exists(target_dir)
    f_name = os.path.join(target_dir, module_name + '.js')
    with open(f_name, 'w') as f:
        f.write('\n')
    return f_name


def __make_manifest(module_name, files, theme_name='none', gen_manifest=False, add_opt_dummy=False):
    man_file = os.path.join(OUT_PATH, '%s.manifest.txt' % module_name)
    # output_file = os.path.join(OUT_PATH, '%s.tmp.js' % module_name)
    print '  Building manifest for "%s"' % module_name

    descriptor = __get_modules_config()['parts'][module_name]
    entry_point = descriptor['entry']

    deps = __parse_deps()
    all_files = [__create_opt_dummy(module_name)] if add_opt_dummy else []
    all_files.append(os.path.join(CLOSURE_SOURCE_PATH, 'base.js'))
    placed_ns = set()

    def put_in_order(name):
        dep = deps.get(name, None)
        if dep is None:
            raise Exception('Unknown namespace %s requested for %s entry point' % (name, entry_point))
        if len(dep[1]) > 0 and name not in placed_ns:
            for provide in dep[1]:
                placed_ns.add(provide)
            for requirement in dep[2]:
                put_in_order(requirement)
            all_files.append(dep[0])

    put_in_order(entry_point)

    # if theme_name is not None and theme_name is not 'none':
    #     put_in_order(__get_theme_entry_point(theme_name))

    module_files = []
    for line in all_files:
        if line in files:
            files[line].append(module_name)
        else:
            module_files.append(line)
            files[line] = [module_name]

    if gen_manifest:
        with open(man_file, 'w') as f:
            f.write('\n'.join(all_files))

    # if __compile(entry_point, output_file, level='WHITESPACE_ONLY', manifest=man_file,
    #              additional_params=('--jscomp_off="*"',),
    #              theme=theme_name if descriptor.get('includeTheme', False) else None) != 0:
    #     print 'Compilation failed'
    #     sys.exit(1)
    # os.remove(output_file)
    # module_files = []
    # with open(man_file, 'r') as f:
    #     for line in f:
    #         line = line.replace('\n', '').replace('/', os.path.sep)
    #         if line in files:
    #             files[line].append(module_name)
    #         else:
    #             module_files.append(line)
    #             files[line] = [module_name]
    #
    # if not gen_manifest:
    #     os.remove(man_file)

    return module_files


@stopwatch()
def __make_build(build_name, modules, checks_only=False, theme_name='none', dev_edition=False, perf_mon=False,
                 gen_manifest=False, debug_files=False, output=OUT_PATH, is_amd=False):
    modules_parts_output = os.path.join(output, 'parts')
    __create_dir_if_not_exists(modules_parts_output)
    print '\nBuilding manifests for target "%s" (%s parts) to %s' % (build_name, len(modules), modules_parts_output)
    files_list_file_name = os.path.join(OUT_PATH, '%s.files.list' % build_name)
    additional_flags = [
        '--module_output_path_prefix "%s%s"' % (modules_parts_output, os.path.sep),
        '--rename_prefix_namespace="$"',
        '--rewrite_polyfills="false"'
    ]
    if gen_manifest:
        # additional_flags.append('--formatting="PRETTY_PRINT"')
        # additional_flags.append('--formatting="PRINT_INPUT_DELIMITER"')
        additional_flags.append('--output_module_dependencies "%s"' %
                                os.path.join(OUT_PATH, '%s.manifest.json' % build_name))
    files = {}
    all_files = []
    for module_name in modules:
        module_files = __make_manifest(module_name, files, theme_name, gen_manifest)
        module_descriptor = __get_modules_config()['parts'][module_name]
        module_deps = module_descriptor['deps']
        module_def = '--module %s:%s%s' % \
                     (module_name, len(module_files), '' if len(module_deps) == 0 else ':' + ','.join(module_deps))
        normalized_module_name = module_name.replace('-', '_')
        module_wrapper = '--module_wrapper %s:"if(!_.%s){_.%s=1;(function($){%s}).call(this,$)}"' % \
                         (module_name, normalized_module_name, normalized_module_name, '%s')
        additional_flags.append(module_def)
        additional_flags.append(module_wrapper)
        all_files.extend(module_files)

    with open(files_list_file_name, 'w') as files_list:
        with open(CHECKS_FLAGS, 'r') as checks:
            for line in checks:
                files_list.write(line)
        files_list.write('\n'.join(map(lambda f: '--js="%s"' % f, all_files)))

    print '  %s module binaries' % ('Checking' if checks_only else 'Building')
    (err_code, errors) = __compile(js_files=False, version=True, dev_edition=dev_edition, perf_mon=perf_mon,
                                   additional_params=additional_flags, checks_only=checks_only,
                                   debug_files=build_name if debug_files else None, flag_file=files_list_file_name)
    if err_code:
        print errors
        sys.exit(1)

    if gen_manifest:
        with open(MANIFEST_OUT_PATH, 'w') as f:
            f.write(json.dumps(files))
            # f.write('{')
            # keys = files.keys()
            # keys.sort()
            # f.write(', '.join(map(lambda key: '"%s":%s' % (key, json.dumps(keys[key])), keys)))
            # f.write('}')
    else:
        os.remove(files_list_file_name)

    return errors


@stopwatch()
def __make_bundle(bundle_name, modules, dev_edition=False, perf_mon=False, debug_files=False, gzip=False, stat=False,
                  output=OUT_PATH, is_amd=False):
    print ''
    modules_parts_output = os.path.join(output, 'parts')
    postfix = '.amd' if is_amd else ''
    output = os.path.join(output, 'amd') if is_amd else output
    file_name = os.path.join(output, '%s%s.min.js' % (bundle_name, postfix))

    if not stat:
        print 'Assembling module "%s"' \
              '\n  Output: %s' \
              '\n  Modules: %s' \
              '\n  Developers edition: %s' \
              '\n  Performance monitoring: %s' % (bundle_name,
                                                  file_name,
                                                  ', '.join(modules),
                                                  str(dev_edition).lower(),
                                                  str(perf_mon).lower())

    wrapper = __get_bundle_wrapper(bundle_name, modules, file_name, perf_mon, debug_files, stat, is_amd)
    with open(file_name, 'w') as output:
        output.write(wrapper[0])
        for module_name in modules:
            with open(os.path.join(modules_parts_output, '%s.js' % module_name)) as f:
                for line in f:
                    output.write(line)
        output.write(wrapper[1])

    if gzip:
        __gzip_file(file_name)


def __get_bundle_wrapper(bundle_name, modules, file_name='', performance_monitoring=False, debug_files=False,
                         stat=False, is_amd=False):
    if stat:
        return '', ''
    perf_start = ''
    perf_end = ''
    camel_case_bundle_name = bundle_name.replace('-', '_');
    if performance_monitoring:
        perf_start = "window.%s_init_start=(typeof window.performance=='object')" \
                     "&&(typeof window.performance.now=='function')?window.performance.now():+new Date();" % camel_case_bundle_name
        perf_end = ";if(console&&(typeof console.log!='object'))" \
                   "console.log('AnyChart \"%s\" module initialized in:'," \
                   "((typeof window.performance=='object')&&(typeof window.performance.now=='function')?" \
                   "window.performance.now():+new Date()-window.%s_init_start).toFixed(5),'ms');" \
                   "delete window.%s_init_start;" % (camel_case_bundle_name, camel_case_bundle_name, camel_case_bundle_name)
    source_mapping = ('//# sourceMappingURL=%s.map' % file_name) if debug_files else ''

    wrapper_start = AMD_WRAPPER_START if is_amd else BINARIES_WRAPPER_START
    f = open(wrapper_start, 'r')
    start = f.read()
    f.close()

    wrapper_end = AMD_WRAPPER_END if is_amd else BINARIES_WRAPPER_END
    f = open(wrapper_end, 'r')
    end = f.read()
    f.close()

    core_check = '' \
        if any(map(lambda item: __get_modules_config()['parts'][item].get('skipCoreCheck', False), modules)) \
        else "throw Error('anychart-base.min.js module should be included first. See modules explanation at https://docs.anychart.com/Quick_Start/Modules for details');"

    branch_name = __get_current_branch_name()
    date_mask = '%Y-%m-%d' #if branch_name == 'master' else '%Y-%m-%d %H:%M'
    start = start % (
        ', '.join(modules),
        __get_build_version(),
        time.strftime(date_mask),
        time.strftime('%Y'),
        perf_start,
        core_check
    )
    end = end % (perf_end, source_mapping)

    return start, end


# endregion
# region --- Locales index building
# ======================================================================================================================
# Locales index building
# ======================================================================================================================
def build_locales_indexes():
    locales_path = os.path.join(PROJECT_PATH, 'dist', 'locales')
    result = {}
    for (path, dirs, files) in os.walk(locales_path):
        for file_name in files:
            locale_path = os.path.join(path, file_name)
            f = open(locale_path, 'r')
            text = f.read()
            f.close()

            code = re.search("code: '(.+)',", text, re.IGNORECASE).group(1)
            eng_name = re.search("engName: '(.+)',", text, re.IGNORECASE).group(1)
            native_name = re.search("nativeName: '(.+)',", text, re.IGNORECASE).group(1)

            result[code] = {'eng-name': eng_name, 'native-name': native_name}

    return result


# endregion
# region --- Locales index building
# ======================================================================================================================
# Geodata index building
# ======================================================================================================================
def build_geodata_indexes():
    geo_data_path = os.path.join(PROJECT_PATH, 'dist', 'geodata')
    result = {}
    for (path, dirs, files) in os.walk(geo_data_path):
        rel_path = os.path.relpath(path, geo_data_path)
        split = rel_path.split('/')

        if not split[-1] + '.js' in files:
            continue

        target = result
        for item in split:
            if not item in target:
                target[item] = {}
            target = target[item]
            if item == split[-1]:
                name_parts = item.split('_')
                name_parts = map(lambda x: x.capitalize(), name_parts)
                target['name'] = ' '.join(name_parts)

    return result


# endregion
# region --- CSS index building
# ======================================================================================================================
# CSS index building
# ======================================================================================================================
def build_css_indexes():
    css_data_path = os.path.join(PROJECT_PATH, 'dist', 'css')
    result = []
    for (path, dirs, files) in os.walk(css_data_path):
        for file_name in files:
            result.append({ 'name': file_name })

    return result


# endregion
# region --- Fonts index building
# ======================================================================================================================
# Fonts index building
# ======================================================================================================================
def build_fonts_indexes():
    fonts_data_path = os.path.join(PROJECT_PATH, 'dist', 'fonts')
    result = {}
    target = []
    for (path, dirs, files) in os.walk(fonts_data_path):
        directory = path.rsplit('/', 1)[-1]

        local_path = "".join(path.rsplit(PROJECT_PATH))
        if 'demos' in local_path:
            continue

        for file_name in files:
            if file_name != '.DS_Store':
                target.append({ 'name': file_name })

        result[directory] = target

    return result


# endregion
# region --- Themes building
# ======================================================================================================================
# Themes building
# ======================================================================================================================
def build_theme(theme, output):
    min_file_name = os.path.join(output, theme + '.min.js')
    file_name = os.path.join(output, theme + '.js')
    (err, output) = __compile(__get_theme_entry_point(theme), min_file_name, flag_file=CHECKS_FLAGS)
    if len(output) > 0:
        print output
    try:
        import jsbeautifier
        res = jsbeautifier.beautify_file(min_file_name)
        with open(file_name, 'w') as f:
            f.write(res)
    except ImportError:
        raise ImportError('Please install jsbeautifier manually first.')


# endregion
# region --- Actions
# ======================================================================================================================
# Actions
# ======================================================================================================================
@sync_required()
@needs_out_dir
@stopwatch()
def __compile_project(*args, **kwargs):
    __build_deps()

    checks = kwargs['check_only']
    output = os.path.join(PROJECT_PATH, kwargs['output']) if kwargs['output'] else OUT_PATH

    __create_dir_if_not_exists(output)

    module = 'Default'
    if kwargs['is_amd']:
        __create_dir_if_not_exists(os.path.join(output, 'amd'))
        module = 'AMD'


    builds = kwargs['build'] or ['bundle']
    print '\n%s AnyChart\nVersion: %s\nModule: %s' % ('Checking' if checks else 'Building', __get_build_version(), module)
    compile_errors = ''
    for build_name, build in __get_builds().iteritems():
        if build_name in builds:
            compile_errors += __make_build(build_name, build, checks, kwargs['theme'], kwargs['develop'],
                                           kwargs['performance_monitoring'], kwargs['manifest'], kwargs['debug_files'],
                                           output=output, is_amd=kwargs['is_amd'])

    if not checks:
        print '\nBuilding bundles\n'
        module_configs = __get_modules_config()['parts']
        bundles = __get_modules_config()['modules']
        built_bundles = {}
        for bundle_name, bundle in bundles.iteritems():
            if all(map(lambda module_name: __get_build_name(module_configs[module_name]) in builds, bundle['parts'])):
                __make_bundle(bundle_name, bundle['parts'], kwargs['develop'], kwargs['performance_monitoring'],
                              kwargs['debug_files'], kwargs['gzip'], output=output, is_amd=kwargs['is_amd'])
                built_bundles[bundle_name] = bundle['parts']
            else:
                print 'Skipping bundle "%s"' % bundle_name
        for build_name, build in __get_builds().iteritems():
            if build_name in builds:
                __make_bundle('anychart-' + build_name, build, kwargs['develop'], kwargs['performance_monitoring'],
                              kwargs['debug_files'], kwargs['gzip'], output=output, is_amd=kwargs['is_amd'])
                built_bundles['anychart-' + build_name] = build

        modules_json = {'parts': {}, 'modules': {}}

        for part, part_config in module_configs.iteritems():
            modules_json['parts'][part] = {'deps': part_config.get('deps', [])}
        for bundle, parts in built_bundles.iteritems():
            modules_json['modules'][bundle] = {'parts': parts}
            if bundle in bundles:
                if 'type' in bundles[bundle]: modules_json['modules'][bundle]['type'] = bundles[bundle]['type']
                if 'name' in bundles[bundle]: modules_json['modules'][bundle]['name'] = bundles[bundle]['name']
                if 'icon' in bundles[bundle]: modules_json['modules'][bundle]['icon'] = bundles[bundle]['icon']
                if 'docs' in bundles[bundle]: modules_json['modules'][bundle]['docs'] = bundles[bundle]['docs']
                if 'desc' in bundles[bundle]: modules_json['modules'][bundle]['desc'] = bundles[bundle]['desc']

                if kwargs['is_amd']:
                    bundle_path = os.path.join(output, 'amd', bundle + '.amd.min.js')
                else:
                    bundle_path = os.path.join(output, bundle + '.min.js')

                modules_json['modules'][bundle]['size'] = __get_gzip_file_size(bundle_path)
            elif bundle == 'anychart-bundle':
                modules_json['modules'][bundle]['name'] = 'AnyChart Bundle'
                modules_json['modules'][bundle]['type'] = 'bundle'
                modules_json['modules'][bundle]['desc'] = 'AnyChart Bundle module'
                modules_json['modules'][bundle]['docs'] = 'https://docs.anychart.com/Quick_Start/Modules#bundle'

        with open(os.path.join(output, 'modules.json'), 'w') as f:
            f.write(json.dumps(modules_json))

        # resource_json = {'modules': modules_json, 'addons': {}, 'css': {}, 'fonts': {}}
        resource_json = {}
        # resource_json['modules'] = modules_json
        # resource_json['css'] = build_css_indexes()
        # resource_json['fonts'] = build_fonts_indexes()

        # We are still need to generate resources.json with themes
        # section cause /bin/sources/modules.json are not presented
        # on cdn.
        # resources.json will be overwritten on cdn
        resource_json['themes'] = __get_modules_config()['themes']
        # resource_json['locales'] = build_locales_indexes()
        # resource_json['geodata'] = build_geodata_indexes()
        # resource_json['addons'] = [ {'name': 'anychart-chart-editor.min.js'},
        #                             {'name': 'graphics.js'},
        #                             {'name': 'graphics.min.js'} ]

        with open(os.path.join(output, 'resources.json'), 'w') as f:
            f.write(json.dumps(resource_json))

    print ''
    print compile_errors


@stopwatch()
def __sync_libs(*args, **kwargs):
    print 'Syncing libs'
    sync_libs(not kwargs['skip_less'], not kwargs['skip_jsb'])


@sync_required()
@stopwatch()
def __build_deps(*args, **kwargs):
    output_file = os.path.join(SRC_PATH, 'deps.js')
    print 'Writing deps to %s' % output_file
    subprocess.call([
        'python',
        DEPS_WRITER_PATH,
        '--root_with_prefix=%s %s' % (SRC_PATH, os.path.relpath(SRC_PATH, CLOSURE_SOURCE_PATH)),
        '--root_with_prefix=%s %s' % (GRAPHICS_SRC_PATH, os.path.relpath(GRAPHICS_SRC_PATH, CLOSURE_SOURCE_PATH)),
        '--output_file=' + output_file
    ])


@sync_required(needs_jsb=True)
@needs_out_dir
@stopwatch()
def __build_themes(*args, **kwargs):
    themes = kwargs['themes'] if len(kwargs['themes']) > 0 else __get_themes_list()
    output = os.path.join(PROJECT_PATH, kwargs['output']) if kwargs['output'] else OUT_PATH
    text = 'Building %s theme'

    if len(themes) > 1:
        print 'Building themes (%i items)' % len(themes)
        text = '  ' + text
        func = stopwatch('    ')(build_theme)
    else:
        func = build_theme

    for theme in themes:
        print text % theme
        func(theme, output)


@sync_required(needs_lesscpy=True)
@needs_out_dir
@stopwatch()
def __compile_css(*args, **kwargs):
    output = os.path.join(PROJECT_PATH, kwargs['output']) if kwargs['output'] else OUT_PATH
    __create_dir_if_not_exists(output)

    try:
        import lesscpy

        print 'Compiling AnyChart UI css'
        css_src_path = os.path.join(PROJECT_PATH, 'css', 'anychart.less')
        css_out_path = os.path.join(output, 'anychart-ui.css')
        css_min_out_path = os.path.join(output, 'anychart-ui.min.css')

        header = '\n'.join(['/*!',
                            ' '.join([' * AnyChart is lightweight robust charting library with great API and Docs, '
                                      'that works with your stack and has tons of chart types and features.']),
                            ' * Version: %s',
                            ' * License: https://www.anychart.com/buy/',
                            ' * Contact: sales@anychart.com',
                            ' * Copyright: AnyChart.com %s. All rights reserved.',
                            ' */']) % (time.strftime('%Y-%m-%d'), time.strftime('%Y')) + '\n'

        # Less
        with open(css_out_path, 'w') as f:
            f.write(header + lesscpy.compile(css_src_path))

        # Minify
        with open(css_min_out_path, 'w') as f:
            f.write(header + lesscpy.compile(css_src_path, xminify=True))

        if kwargs['gzip']:
            __gzip_file(css_out_path)
            __gzip_file(css_min_out_path)

    except ImportError:
        raise ImportError('Please install lesscpy manually first.')


@sync_required()
@needs_out_dir
@stopwatch()
def __stat(*args, **kwargs):
    if not kwargs['skip_building']:
        __build_deps()

    build_name = 'bundle'
    theme_name = 'defaultTheme'
    modules = __get_builds()[build_name]
    modules_parts_output = os.path.join(OUT_PATH, 'parts')

    print '\nBuilding size statistics report to %s' % STAT_REPORT_OUT_PATH

    print '  Building manifests (%s items)' % len(modules)

    __create_dir_if_not_exists(modules_parts_output)
    files_list_file_name = os.path.join(OUT_PATH, '%s.files.list' % build_name)
    additional_flags = [
        '--module_output_path_prefix "%s%s"' % (modules_parts_output, os.path.sep),
        '--rename_prefix_namespace="$"',
        '--rewrite_polyfills="false"',
        '--formatting="PRINT_INPUT_DELIMITER"',
        '--output_module_dependencies "%s"' % os.path.join(OUT_PATH, '%s.manifest.json' % build_name)
    ]

    files = {}
    all_files = []
    files_per_module = {}
    for module_name in modules:
        module_files = __make_manifest(module_name, files, theme_name, add_opt_dummy=True)
        module_descriptor = __get_modules_config()['parts'][module_name]
        module_deps = module_descriptor['deps']
        module_def = '--module %s:%s%s' % \
                     (module_name, len(module_files), '' if len(module_deps) == 0 else ':' + ','.join(module_deps))
        module_wrapper = '--module_wrapper %s:"// Module %s\n%s\n"' % (module_name, module_name, '%s')
        additional_flags.append(module_def)
        additional_flags.append(module_wrapper)
        all_files.extend(module_files)
        files_per_module[module_name] = module_files

    if not kwargs['skip_building']:
        with open(files_list_file_name, 'w') as files_list:
            with open(CHECKS_FLAGS, 'r') as checks:
                for line in checks:
                    files_list.write(line)
            files_list.write('\n'.join(map(lambda f: '--js="%s"' % f, all_files)))

        print '  Building module binaries'
        stopwatch('  ')(__compile)(js_files=False, version=True, additional_params=additional_flags,
                                   flag_file=files_list_file_name, perf_mon=False, dev_edition=False)

        # os.remove(files_list_file_name)

        print 'Building bundle'
        __make_bundle('stats-' + build_name, modules, stat=True)

    with open(os.path.join(OUT_PATH, '%s.manifest.json' % build_name), 'r') as f:
        manifest = json.load(f)

    modules_from_manifest = {
        item['name']: {'originalInputs': files_per_module[item['name']], 'inputs': [[i, 0] for i in item['inputs']]}
        for item in manifest}

    input_delimiter = re.compile(r'^// Input (\d+)\r?\n?$')
    module_delimiter = re.compile(r'^// Module (.+)\r?\n?$')
    with open(os.path.join(OUT_PATH, 'stats-%s.min.js' % build_name), 'r') as f:
        curr_module = None
        curr_input = None
        curr_size = 0
        for line in f:
            match = re.match(module_delimiter, line)
            if match:
                if curr_input is not None:
                    modules_from_manifest[curr_module]['inputs'][curr_input][1] = curr_size
                    if curr_input == 0:
                        modules_from_manifest[curr_module]['inputs'][curr_input].append(True)
                curr_size = 0
                curr_input = None
                curr_module = match.group(1)
                # print 'Found module %s' % curr_module
            else:
                match = re.match(input_delimiter, line)
                if match:
                    if curr_module is None:
                        raise Exception('Found input delimiter before module delimiter')
                    if curr_input is not None:
                        modules_from_manifest[curr_module]['inputs'][curr_input][1] = curr_size
                        if curr_input == 0:
                            modules_from_manifest[curr_module]['inputs'][curr_input].append(True)
                    curr_size = 0
                    curr_input = int(match.group(1))
                    # print 'Found input %s' % curr_input
                else:
                    curr_size += len(line)

    inputs = []
    for item in modules_from_manifest.itervalues():
        item['inputsBySize'] = ['{}: {:.3f}Kb{}'.format(os.path.relpath(i[0], PROJECT_PATH).replace('\\', '/'),
                                                        float(i[1]) / 1024,
                                                        ' (may be incorrect due to opt)' if len(i) > 2 else '')
                                for i in sorted(item['inputs'], cmp=lambda a, b: cmp(a[1], b[1]), reverse=True)]
        item['inputsByName'] = ['{}: {:.3f}Kb{}'.format(os.path.relpath(i[0], PROJECT_PATH).replace('\\', '/'),
                                                        float(i[1]) / 1024,
                                                        ' (may be incorrect due to opt)' if len(i) > 2 else '')
                                for i in sorted(item['inputs'], cmp=lambda a, b: cmp(a[0], b[0]))]
        item['inputsTree'] = [{}, 0]
        for i in item['inputs']:
            path = os.path.relpath(i[0], PROJECT_PATH).replace('\\', '/').split('/')
            root = item['inputsTree']
            for el in path:
                root[1] += i[1]
                if el not in root[0]:
                    root[0][el] = i[1] if el.endswith('.js') else [{}, 0]
                root = root[0][el]

        inputs.extend(item['inputs'])

    modules_from_manifest['__%s__' % build_name] = {'inputs': inputs}
    item = modules_from_manifest['__%s__' % build_name]
    item['inputsBySize'] = ['{}: {:.3f}Kb{}'.format(os.path.relpath(i[0], PROJECT_PATH).replace('\\', '/'),
                                                    float(i[1]) / 1024,
                                                    ' (may be incorrect due to opt)' if len(i) > 2 else '')
                            for i in sorted(item['inputs'], cmp=lambda a, b: cmp(a[1], b[1]), reverse=True)]
    item['inputsByName'] = ['{}: {:.3f}Kb{}'.format(os.path.relpath(i[0], PROJECT_PATH).replace('\\', '/'),
                                                    float(i[1]) / 1024,
                                                    ' (may be incorrect due to opt)' if len(i) > 2 else '')
                            for i in sorted(item['inputs'], cmp=lambda a, b: cmp(a[0], b[0]))]
    item['inputsTree'] = [{}, 0]
    for i in item['inputs']:
        path = os.path.relpath(i[0], PROJECT_PATH).replace('\\', '/').split('/')
        root = item['inputsTree']
        for el in path:
            root[1] += i[1]
            if el not in root[0]:
                root[0][el] = [{}, 0]
            root = root[0][el]
        root[1] += i[1]

    with open(STAT_REPORT_OUT_PATH, 'w') as f:
        f.write(json.dumps(modules_from_manifest))


# endregion
# region --- Main
# ======================================================================================================================
# Main
# ======================================================================================================================
def __exec_main_script():
    # root parser
    parser = argparse.ArgumentParser()
    parser.set_defaults(compile_css=False, gzip=False)
    subparsers = parser.add_subparsers(help='AnyChart framework build script commands:')

    # region ---- create parser for the 'compile' command
    compile_parser = subparsers.add_parser('compile', help='compile project or project modules')
    compile_parser.set_defaults(action=__compile_project,
                                sources=False,
                                develop=False,
                                performance_monitoring=False,
                                gzip=False,
                                debug_files=False,
                                theme='defaultTheme',
                                check_only=False,
                                manifest=False,
                                build=None,
                                is_amd=False)
    # compile_parser.add_argument('-s', '--sources',
    #                             action='store_true',
    #                             help='build project sources file (not minimized).')
    compile_parser.add_argument('-gm', '--manifest',
                                action='store_true',
                                help='output build target manifests JSON')
    compile_parser.add_argument('-b', '-m', '--build',
                                action='append',
                                help='build target name to be built. Defaults to ["main"]. '
                                     'Can be passed multiple times. Available build targets: %s' %
                                     ', '.join(__get_builds().iterkeys()))
    compile_parser.add_argument('-d', '--develop',
                                action='store_true',
                                help='include developers tools into build.')
    compile_parser.add_argument('-pm', '--performance_monitoring',
                                action='store_true',
                                help='include performance monitoring tools into build.')
    compile_parser.add_argument('-gz', '--gzip',
                                action='store_true',
                                help='create gzip copy of output file.')
    compile_parser.add_argument('-df', '--debug_files',
                                action='store_true',
                                help='create files with debug info (prop_out, var_out, sourcemap).')
    compile_parser.add_argument('-t', '--theme',
                                action='store',
                                help='specify the default theme to compile with. By default - "defaultTheme"')
    compile_parser.add_argument('-c', '--check_only',
                                action='store_true',
                                help='only compilation checks are applied - no output is generated')
    compile_parser.add_argument('-o', '--output',
                                dest='output',
                                action='store',
                                help='Output directory')
    compile_parser.add_argument('-amd', '--is_amd',
                                action='store_true',
                                help='Whether to compile as AMD-module')

    # compile_parser.add_argument('-m', '--module',
    #                             metavar='',
    #                             dest='parts',
    #                             action='append',
    #                             help='specify modules to compile, can be specified multiple times. '
    #                                  'Possible modules values: %s' % ', '.join(__get_macro_modules_list().keys()))

    # endregion

    # region ---- create parser for the 'themes' command
    themes_parser = subparsers.add_parser('themes',
                                          help='build standalone theme file by name. Default value is "defaultTheme"')
    themes_parser.set_defaults(action=__build_themes,
                               themes=[])
    themes_parser.add_argument('-o', '--output',
                               dest='output',
                               action='store',
                               help='Output directory')

    themes_parser.add_argument('-n', '--name',
                               dest='themes',
                               action='append',
                               help='name of the theme, default value is "defaultTheme". '
                                    'Can be passed multiple times.\nPossible values are: %s. '
                                    % ', '.join(__get_themes_list()))
    # endregion

    # region --- create parser for the 'libs' command
    libs_parser = subparsers.add_parser('libs', help='download project requirements')
    libs_parser.set_defaults(action=__sync_libs,
                             skip_less=False,
                             skip_jsb=False)
    libs_parser.add_argument('-sl', '--skip_less',
                             action='store_true',
                             help='skip lesscpy installing')
    libs_parser.add_argument('-sb', '--skip_jsb',
                             action='store_true',
                             help='skip jsbeautifier installing')
    # endregion

    # region ---- create the parser for the 'deps' command
    subparsers.add_parser('deps', help='generate deps.js file') \
        .set_defaults(action=__build_deps)
    # endregion

    # region ---- create the parser for the 'css' command
    css_parser = subparsers.add_parser('css', help='compile AnyChart UI css')

    css_parser.set_defaults(action=__compile_css)

    css_parser.add_argument('-o', '--output',
                            dest='output',
                            action='store',
                            help='Output directory')
    # endregion

    # region ---- create the parser for the 'stat' command
    stat_parser = subparsers.add_parser('stat', help='build size statistics report')
    stat_parser.set_defaults(action=__stat,
                             skip_build=False)
    stat_parser.add_argument('-s', '--skip_building',
                             action='store_true',
                             help='skip building stat-min')
    # endregion

    # region ---- create the parser for the 'version' command
    stat_parser = subparsers.add_parser('version', help='Print AnyChart version')
    stat_parser.set_defaults(action=__print_version,
                             commits_count=False)
    stat_parser.add_argument('-m', '--major_only',
                             action='store_true',
                             help="Show only major version")
    stat_parser.add_argument('-c', '--commits_count',
                             action='store_true',
                             help="Don't show commits count")
    stat_parser.add_argument('-s', '--set',
                             action='store',
                             help="Set version to specified")
    stat_parser.add_argument('-v', '--verify',
                             action='store_true',
                             help="Verify that version is set correctly for all files")
    # endregion

    params = parser.parse_args()
    params.action(**vars(params))


if __name__ == '__main__':
    try:
        __exec_main_script()
    except (StandardError, KeyboardInterrupt):
        print traceback.format_exc()
        sys.exit(1)


# endregion
