#!/usr/bin/env python
# coding=utf-8

import os
import sys
import subprocess
import platform
import urllib
import zipfile
import time
import re
import argparse
import shlex
import gzip
import shutil
import multiprocessing

# =======================================================================================================================
#           Project paths
# =======================================================================================================================
# java heap size in Mb
JAVA_HEAP_SIZE = 1024

# project
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
CONTRIB_PATH = os.path.join(PROJECT_PATH, 'libs')
SRC_PATH = os.path.join(PROJECT_PATH, 'src')
OUT_PATH = os.path.join(PROJECT_PATH, 'out')
DIST_PATH = os.path.join(PROJECT_PATH, 'dist')
MODULES_PATH = os.path.join(SRC_PATH, 'modules')
THEMES_PATH = os.path.join(SRC_PATH, 'themes')

# graphics
GRAPHICS_PATH = os.path.join(CONTRIB_PATH, 'graphicsjs')
GRAPHICS_SRC_PATH = os.path.join(CONTRIB_PATH, GRAPHICS_PATH, 'src')

# closure tools
COMPILER_VERSION = '20161024'
COMPILER_PATH = os.path.join(CONTRIB_PATH, 'compiler', 'closure-compiler-v%s.jar' % COMPILER_VERSION)
EXTERNS_PATH = os.path.join(PROJECT_PATH, 'externs.js')
CLOSURE_LIBRARY_PATH = os.path.join(CONTRIB_PATH, 'closure-library')
CLOSURE_SOURCE_PATH = os.path.join(CLOSURE_LIBRARY_PATH, 'closure', 'goog')
CLOSURE_BIN_PATH = os.path.join(CLOSURE_LIBRARY_PATH, 'closure', 'bin')
DEPS_WRITER_PATH = os.path.join(CLOSURE_BIN_PATH, 'build', 'depswriter.py')
CLOSURE_BUILDER_PATH = os.path.join(CLOSURE_BIN_PATH, 'build', 'closurebuilder.py')


# =======================================================================================================================
#                            Utils
# =======================================================================================================================
def __create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.mkdir(path)


# =======================================================================================================================
#                            Synchronize contributions.
# =======================================================================================================================
def __has_closure_compiler():
    return os.path.exists(COMPILER_PATH)


def __need_sync_contrib():
    return not os.path.exists(COMPILER_PATH) or \
           not os.path.exists(CLOSURE_LIBRARY_PATH) or \
           not os.path.exists(GRAPHICS_PATH)


def __sync_contrib():
    __create_dir_if_not_exists(CONTRIB_PATH)

    subprocess.call(['git', 'submodule', 'init'])
    subprocess.call(['git', 'submodule', 'update'])
    subprocess.call(['rm', '-f', '.git/hooks/post-checkout'])
    subprocess.call(['ln', '-s', '../../update-submodules', '.git/hooks/post-checkout'])

    # Download closure compiler
    if not os.path.exists(COMPILER_PATH):
        print 'Download closure compiler'
        __download_and_unzip_from_http(
            "http://dl.google.com/closure-compiler/compiler-%s.zip" % COMPILER_VERSION,
            CONTRIB_PATH,
            'compiler'
        )

    # Install lesscpy
    print 'Install lesscpy'
    commands = [] if platform.system() == 'Windows' else ['sudo']
    commands.append('easy_install')
    commands.append('lesscpy')
    try:
        subprocess.call(commands)
    except StandardError:
        raise StandardError('Sync contribution failed: you should install easy_install module for python')

    print 'Install jsbeautifier'
    commands = [] if platform.system() == 'Windows' else ['sudo']
    commands += ['easy_install', 'jsbeautifier==1.6.2']
    subprocess.call(commands)

    # Install closure linter
    global arguments
    if 'linter' in arguments and arguments['linter']:
        __install_closure_linter()

    print 'All contributions installed'


def __download_and_unzip_from_http(from_url, path, dri_name):
    z_obj_path = os.path.join(path, dri_name + '.zip')

    # download zip archive from url
    if not os.path.exists(z_obj_path):
        urllib.urlretrieve(
            from_url,
            z_obj_path
        )

    # extract zip archive
    target_path = os.path.join(path, dri_name)
    __create_dir_if_not_exists(target_path)
    z_obj = zipfile.ZipFile(z_obj_path)
    z_obj.extractall(path=target_path)
    z_obj.close()

    # remove archive file
    os.remove(z_obj_path)
    print 'Download successful'


def __install_closure_linter():
    print 'Install closure linter'
    commands = [] if platform.system() == 'Windows' else ['sudo']
    commands.append('pip')
    commands.append('install')
    commands.append('git+git://github.com/google/closure-linter.git@v2.3.19')
    try:
        subprocess.call(commands)
    except StandardError:
        raise StandardError('Sync contribution failed: you should install easy_install module for python')


def sync_required(func):
    def wrapper():
        if __need_sync_contrib():
            __sync_contrib()
        func()

    return wrapper


# =======================================================================================================================
#                            Compiler flags generation.
# =======================================================================================================================
class OptimizationLevel:
    NONE = 0
    SIMPLE = 1
    ADVANCED = 2


def __add_option(flags, flag_name, flag_value):
    flags.append('--' + flag_name + ' ' + flag_value)


def __set_pretty_print(flags):
    __add_option(flags, 'formatting', 'PRETTY_PRINT')


def __set_optimization_level(flags, level):
    # set compiler level
    if level == OptimizationLevel.NONE:
        __add_option(flags, 'compilation_level', 'WHITESPACE_ONLY')
    elif level == OptimizationLevel.SIMPLE:
        __add_option(flags, 'compilation_level', 'SIMPLE_OPTIMIZATIONS')
    elif level == OptimizationLevel.ADVANCED:
        __add_option(flags, 'compilation_level', 'ADVANCED_OPTIMIZATIONS')


def __get_output_file_arg(output_file):
    return ['--js_output_file ' + output_file]


def __get_name_spaces(modules):
    result = []
    for module in modules:
        result.append("--entry_point anychart.modules.%s" % module)
    return result


def __get_roots():
    return ['--js="%s"' % os.path.join(SRC_PATH, '**.js'),
            '--js="%s"' % os.path.join(CLOSURE_LIBRARY_PATH, '**.js'),
            '--js="%s"' % os.path.join(GRAPHICS_SRC_PATH, '**.js')]


def __get_not_optimized_compiler_args():
    compiler_args = []
    __set_optimization_level(compiler_args, OptimizationLevel.NONE)
    __set_pretty_print(compiler_args)
    return compiler_args


def __get_developers_edition_compiler_args(is_develop):
    flag = 'true' if is_develop else 'false'
    return [
        '--define "goog.DEBUG=%s"' % flag,
        '--define "anychart.DEVELOP=%s"' % flag,
    ]


def __get_performance_monitoring_compiler_args(is_performance_monitoring):
    flag = 'true' if is_performance_monitoring else 'false'
    return [
        '--define "anychart.PERFORMANCE_MONITORING=%s"' % flag,
    ]

def is_not_theme_build(modules):
    return modules and len(modules) == 1 and \
    ('anychart_ui' in modules or \
     'chart_editor' in modules or \
     'data_adapter' in modules)


def __get_optimized_compiler_args():
    compiler_args = [
        '--hide_warnings_for="closure-library"',
        # '--new_type_inf',
        '--warning_level VERBOSE',
        '--jscomp_warning accessControls',
        '--jscomp_warning ambiguousFunctionDecl',
        '--jscomp_warning checkEventfulObjectDisposal',
        '--jscomp_warning checkRegExp',
        '--jscomp_warning checkTypes',
        '--jscomp_warning checkVars',
        '--jscomp_warning commonJsModuleLoad',
        '--jscomp_warning conformanceViolations',
        '--jscomp_warning const',
        '--jscomp_warning constantProperty',
        '--jscomp_warning deprecated',
        '--jscomp_warning deprecatedAnnotations',
        '--jscomp_warning duplicateMessage',
        '--jscomp_warning es3',
        '--jscomp_warning es5Strict',
        '--jscomp_warning externsValidation',
        '--jscomp_warning fileoverviewTags',
        '--jscomp_warning functionParams',
        '--jscomp_warning globalThis',
        '--jscomp_warning internetExplorerChecks',
        '--jscomp_warning invalidCasts',
        '--jscomp_warning misplacedTypeAnnotation',
        '--jscomp_warning missingGetCssName',
        # '--jscomp_warning missingOverride',
        '--jscomp_warning missingPolyfill',
        '--jscomp_warning missingProperties',
        '--jscomp_warning missingProvide',
        '--jscomp_warning missingRequire',
        '--jscomp_warning missingReturn',
        '--jscomp_warning msgDescriptions',
        '--jscomp_warning newCheckTypes',
        '--jscomp_warning nonStandardJsDocs',
        # '--jscomp_warning reportUnknownTypes',
        '--jscomp_warning suspiciousCode',
        '--jscomp_warning strictModuleDepCheck',
        '--jscomp_warning typeInvalidation',
        '--jscomp_warning undefinedNames',
        '--jscomp_warning undefinedVars',
        '--jscomp_warning unknownDefines',
        # '--jscomp_warning unusedLocalVariables',
        # '--jscomp_warning unusedPrivateMembers',
        '--jscomp_warning uselessCode',
        # '--jscomp_warning useOfGoogBase',
        '--jscomp_warning underscore',
        '--jscomp_warning visibility',
    ]
    __set_optimization_level(compiler_args, OptimizationLevel.ADVANCED)
    return compiler_args


def __get_default_compiler_args(theme, modules):
    result = [
        'java -Xmx%sM -jar' % JAVA_HEAP_SIZE,
        COMPILER_PATH,
        '--charset UTF-8',
        '--define "anychart.VERSION=\'%s\'"' % __get_version(True),
        '--dependency_mode=STRICT',
        # '--externs ' + EXTERNS_PATH,
        '--extra_annotation_name "includeDoc"',
        '--extra_annotation_name "illustration"',
        '--extra_annotation_name "illustrationDesc"',
        '--extra_annotation_name "ignoreDoc"',
        '--extra_annotation_name "propertyDoc"',
        '--extra_annotation_name "shortDescription"',
    ]

    # Build AnyChart UI without theme.
    if is_not_theme_build(modules):
        theme = 'none'
    if not (theme == 'none'):
        if not os.path.exists(os.path.join(SRC_PATH, 'themes', theme + '.js')):
            theme = 'defaultTheme'
        result = result + ['--define "anychart.DEFAULT_THEME=\'%s\'"' % theme]
        result = result + ['--entry_point "%s"' % 'anychart.themes.' + theme]
    return result


# =======================================================================================================================
#           Build project
# =======================================================================================================================
@sync_required
def __compile_project_each():
    t = time.time()
    global arguments
    arguments['sources'] = False
    modules = __get_modules_list()
    args = []
    for module in modules:
        arguments['modules'] = [module]
        args.append(dict(arguments))
    pool = multiprocessing.Pool(arguments['process'])
    pool.map_async(__compile_project_from_map, args).get(99999)
    pool.close()
    pool.join()
    print "[PY] compile time: {:.3f} sec".format(time.time() - t)


@sync_required
def __compile_project():
    t = time.time()
    global arguments
    if arguments['modules'] is None:
        arguments['modules'] = ['anychart_bundle']
    if not __is_allowed_modules(arguments['modules']):
        raise Exception("Wrong modules: %s" % ', '.join(arguments['modules']))

    __create_dir_if_not_exists(OUT_PATH)
    __compile_project_from_map(arguments)
    print "[PY] compile time: {:.3f} sec".format(time.time() - t)


def __compile_project_from_map(options):
    __build_project(options['develop'],
                    options['modules'],
                    options['sources'],
                    options['theme'],
                    options['debug_files'],
                    options['gzip'],
                    options['performance_monitoring'],
                    options['allow_compile_css'])


def __build_project(develop, modules, sources, theme, debug, gzip, perf_monitoring, allow_compile_css):
    args = locals()
    dev_postfix = '.dev' if develop else ''
    perf_postfix = '.perf' if perf_monitoring else ''
    file_name = "%s%s%s%s" % ('_'.join(modules), dev_postfix, perf_postfix, '.min.js')
    __optimized_compiler_args = __get_optimized_compiler_args()

    if sources:
        file_name = ("%s%s%s%s" % ('-'.join(modules), dev_postfix, perf_postfix, '.js')).replace('_', '-')
        output_file = os.path.join(OUT_PATH, file_name)

        tmp_file_name = "%s%s%s%s" % ('_'.join(modules), dev_postfix, perf_postfix, '_tmp.js')
        tmp_output_file = os.path.join(OUT_PATH, tmp_file_name)

        copyright = __get_copyrigth(modules)
        wrapper = __get_wrapper(file_name)

        deps_manifest_file = os.path.join(OUT_PATH, 'deps.mf')

        __optimized_compiler_args = __get_not_optimized_compiler_args()
        commands = sum([
            __get_default_compiler_args(theme, modules),
            __optimized_compiler_args,
            __get_name_spaces(modules),
            __get_roots(),
            __get_output_file_arg(tmp_output_file),
            ['--output_manifest ' + deps_manifest_file],
        ], [])

        # print build log
        __log_compilation(output_file, args)
        
        # compile css
        if allow_compile_css:
            if 'anychart_ui' in modules or 'anychart_bundle' or 'chart_editor' in modules:
                __compile_css(__should_gen_gzip())

        __call_console_commands(commands, module=modules[0])

        output = ''
        f = open(deps_manifest_file, 'r')
        for line in f:
            output += open(line.replace('\n', ''), 'r').read()
        f.close()

        output = output\
            .replace('var COMPILED = false;', 'var COMPILED = true;')\
            .replace('var goog = goog || {};', 'this.goog = this.goog || {};\nvar goog = this.goog;\nthis.anychart = this.anychart || {};\nvar anychart = this.anychart')
        wrapper = wrapper.replace('%output%', output)

        open(output_file, 'w').write(copyright + wrapper)

        os.remove(tmp_output_file)
        os.remove(deps_manifest_file)


        # gzip binary file
        if gzip:
            __gzip_file(output_file)
    else:
        file_name = file_name.replace('_', '-')
        output_file = os.path.join(OUT_PATH, file_name)
        copyright = __get_copyrigth(modules)
        wrapper = __get_wrapper(file_name)
        commands = sum([__get_default_compiler_args(theme, modules),
                        __optimized_compiler_args,
                        __get_developers_edition_compiler_args(develop),
                        __get_performance_monitoring_compiler_args(perf_monitoring),
                        __get_name_spaces(modules),
                        __get_roots(),
                        __get_output_file_arg(output_file),
                        ['--output_wrapper "' + copyright + wrapper + '"', '--assume_function_wrapper']], [])

        # debug info
        if debug and not sources:
            path = PROJECT_PATH.replace('\\', '/')
            commands += ['--property_renaming_report %s' % output_file + '_prop_out.txt',
                         '--variable_renaming_report %s' % output_file + '_var_out.txt',
                         '--create_source_map %s' % output_file + '.map',
                         '--source_map_location_mapping \"%s|./../\"' % path]

        # print build log
        __log_compilation(output_file, args)

        # compile css
        if allow_compile_css:            
            if 'anychart_ui' in modules or 'anychart_bundle' in modules:
                __compile_css(__should_gen_gzip())

        # build binary file
        __call_console_commands(commands, module=modules[0])

        # gzip binary file
        if gzip:
            __gzip_file(output_file)


def __log_compilation(output_file, args):
    print "\nCompile %s file for modules: %s\n" \
          "Output: %s\n" \
          "Version: %s\n" \
          "Developers edition: %s\n" \
          "Debug files: %s\n" \
          "Gzip: %s \n" \
          "Theme: %s\n" \
          "Performance monitoring: %s" % (
              "source" if args['sources'] else "binary",
              ', '.join(args['modules']),
              output_file,
              __get_version(True),
              str(args['develop']),
              str(args['debug']),
              str(args['gzip']),
              str(args['theme']),
              str(args['perf_monitoring'])
          )


def __call_console_commands(commands, cwd=None, module=None):
    commands = " ".join(commands).replace('\\', '\\\\')
    commands = shlex.split(commands)
    # print commands
    p = subprocess.Popen(commands, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=cwd)
    (output, err) = p.communicate()
    retcode = p.poll()
    if len(output) > 0:
        print '({}) {}'.format(module, output)


def __get_copyrigth(modules):
    title = ''
    contains = ''
    build = 'Development' if __is_develop() else 'Production'
    version = __get_version(True)
    url = 'http://anychart.com'

    if len(modules) == 1 and modules[0] in ['anychart_bundle', 'anychart', 'anymap', 'anygantt', 'anystock',
                                            'anychart_ui', 'data_adapter']:
        module = modules[0]

        if module == 'anychart_bundle':
            title = 'AnyChart - Robust JavaScript HTML5 Web Charting Framework'
            contains = 'AnyChart, AnyMap, AnyGantt, AnyStock, AnyChart UI'
        elif module == 'anychart':
            title = 'AnyChart - Robust JavaScript HTML5 Web Charts'
            url = 'http://anychart.com/products/anychart/'
        elif module == 'anymap':
            title = 'AnyMap - JavaScript HTML5 Web Maps'
            url = 'http://anychart.com/products/anymap/'
        elif module == 'anygantt':
            title = 'AnyGantt - JavaScript HTML5 Web Gantt Charts'
            url = 'http://anychart.com/products/anygantt/'
        elif module == 'anystock':
            title = 'AnyStock - JavaScript HTML5 Web Financial Charts'
            url = 'http://anychart.com/products/anystock/'
        elif module == 'anychart_ui':
            title = 'AnyChart UI - JavaScript HTML5 Web Charting User Interface'
        elif module == 'data_adapter':
            title = 'AnyChart Data Adapter'

    if contains:
        contains = " * " + contains + "\n"

    copyright = \
        "/**\n" \
        " * %s\n%s" \
        " * %s Build\n" \
        " * Version: %s\n" \
        " * %s\n" \
        " */\n" % (title, contains, build, version, url)

    return copyright


def __get_wrapper(file_name):
    performanceStart = ''
    performanceEnd = ''
    if __is_performance_monitoring():
        performanceStart = 'window.anychart_init_start=(typeof window.performance==\'object\')' + \
                           '&&(typeof window.performance.now==\'function\')?window.performance.now():+new Date();'
        performanceEnd = ';if(console&&(typeof console.log!=\'object\'))console.log(\'AnyChart library initialized in:\',' + \
                         '(window.anychart_init_start=(typeof window.performance==\'object\')' + \
                         '&&(typeof window.performance.now==\'function\')?window.performance.now():+new Date()-window.anychart_init_start).toFixed(5),\'ms\');delete window.anychart_init_start'
    sourceMapping = ('//# sourceMappingURL=%s.map' % file_name) if __should_gen_debug_files() else ''
    return '(function(global,factory){if(typeof module===\'object\'&&typeof module.exports===\'object\'){var wrapper=function(w){if(!w.document){throw new Error(\'AnyChart requires a window with a document\');}factory.call(w,w,w.document);w.anychart.getGlobal=function(){return w;};return w.anychart;};module.exports=global.document?wrapper(global):wrapper;}else{factory.call(global,window,document)}})(typeof window!==\'undefined\'?window:this,function(window,document,opt_noGlobal){%s%s%s})%s' % (
        performanceStart, '%output%', performanceEnd, sourceMapping)


def __is_allowed_modules(modules):
    l = __get_modules_list()
    for module in modules:
        if not module in l:
            return False
    return True


modules_list_cache = None


def __get_modules_list():
    global modules_list_cache
    if modules_list_cache is None:

        modules_list_cache = []
        for f in os.listdir(MODULES_PATH):
            if f.endswith('.js'):
                modules_list_cache.append(f[:-3])
    return modules_list_cache


def __gzip_file(output_file):
    f_in = open(output_file, 'rb')
    f_out = gzip.open(output_file + '.gz', 'wb')
    f_out.writelines(f_in)
    f_out.close()
    f_in.close()


def __gzip_dir(input_path, output_path):
    archive = zipfile.ZipFile(output_path, 'w')
    for root, dirs, files in os.walk(input_path):
        for f in files:
            archive.write(os.path.join(root, f))
    archive.close()


# =======================================================================================================================
#           Build deps
# =======================================================================================================================
@sync_required
def __build_deps():
    output_file = os.path.join(SRC_PATH, 'deps.js')
    print "Writing deps to %s" % output_file
    subprocess.call([
        'python',
        DEPS_WRITER_PATH,
        '--root_with_prefix=%s %s' % (SRC_PATH, os.path.relpath(SRC_PATH, CLOSURE_SOURCE_PATH)),
        '--root_with_prefix=%s %s' % (GRAPHICS_SRC_PATH, os.path.relpath(GRAPHICS_SRC_PATH, CLOSURE_SOURCE_PATH)),
        '--output_file=' + output_file
    ])


# =======================================================================================================================
#                            Linter.
# =======================================================================================================================
@sync_required
def __lint_project():
    print 'Search for lint errors\n'
    subprocess.call([
        'gjslint',
        '--flagfile',
        'gjslint.cfg',
        '-r',
        SRC_PATH,
        '-r',
        GRAPHICS_SRC_PATH
    ])

    print 'Search for JSDoc continuation \n'
    source = []
    for dir_name, dir_names, file_names in os.walk(SRC_PATH):
        for filename in file_names:
            source.append(os.path.join(dir_name, filename))
    file_with_errors = ''
    for filename in source:
        path = os.path.join(PROJECT_PATH, filename)
        data = open(path).read()
        if re.search('\*\/\n\/\*\*', data):
            file_with_errors += path + ' '
    print file_with_errors.replace(' ', '\n') + 'RUN AUTOFIX to fix this\n' if (len(file_with_errors) > 0) else 'ok'


# =======================================================================================================================
#                            Linter Autofix.
# =======================================================================================================================
@sync_required
def __autofix_project():
    print 'Trying to autofix lint errors\n'
    subprocess.call([
        'fixjsstyle',
        '--flagfile',
        'gjslint.cfg',
        '-r',
        SRC_PATH
    ])

    print 'Trying to autofix JSDoc continuation errors\n'
    source = []
    for dir_name, dir_names, file_names in os.walk(SRC_PATH):
        for filename in file_names:
            source.append(os.path.join(dir_name, filename))
    files_with_errors = ''
    for filename in source:
        path = os.path.join(PROJECT_PATH, filename)
        data = open(path).read()
        if re.search('\*\/\n\/\*\*', data):
            files_with_errors += path + ' '
            o = open(path, 'w')
            o.write(re.sub('\*\/\n\/\*\*', '*//**', data))
            o.close()
            print 'fixed ' + path


# =======================================================================================================================
#                            Themes.
# =======================================================================================================================
def __get_themes_list():
    themes_list = []
    for f in os.listdir(THEMES_PATH):
        if f.endswith('.js') and not f.startswith('merging') and not f.startswith('template'):
            themes_list.append(f[:-3])
    return themes_list


def __js_beautifier(path):
    try:
        import jsbeautifier

        res = jsbeautifier.beautify_file(path)
        with open(path, 'w') as f:
            f.write(res)
    except ImportError:
        raise ImportError('You need install jsbeautifier. Run `./build.py libs`')


@sync_required
def __build_theme():
    global arguments
    theme = arguments['name']

    if theme in __get_themes_list():
        print "Build theme: %s" % theme
        __exec_build_theme(theme, False)
        __exec_build_theme(theme, True)
        print "Complete"
    else:
        print "Wrong theme name %s" % theme


def __build_themes():
    print 'Build all available themes'
    for theme in __get_themes_list():
        print '    Build %s' % theme
        __exec_build_theme(theme, False)
        __exec_build_theme(theme, True)
        print "    Complete"
    print "All themes built"


def __exec_build_theme(theme, is_source):
    output_file_postfix = '.js' if is_source else '.min.js'
    commands = ['java -Xmx%sM -jar' % JAVA_HEAP_SIZE,
                COMPILER_PATH,
                '--charset UTF-8',
                '--dependency_mode=STRICT',
                "--entry_point anychart.themes.%s" % theme,
                '--extra_annotation_name "includeDoc"',
                '--extra_annotation_name "illustration"',
                '--extra_annotation_name "illustrationDesc"',
                '--extra_annotation_name "ignoreDoc"',
                '--extra_annotation_name "propertyDoc"',
                '--extra_annotation_name "shortDescription"',
                "--js_output_file %s" % os.path.join(OUT_PATH, theme + output_file_postfix)]
    commands += __get_optimized_compiler_args()

    commands += __get_roots()

    __call_console_commands(commands)

    if is_source:
        __js_beautifier(os.path.join(OUT_PATH, theme + output_file_postfix))


# =======================================================================================================================
#                            Build release.
# =======================================================================================================================
@sync_required
def __build_release():
    global arguments

    t = time.time()
    full_version = __get_version(True)
    short_version = __get_version(False)
    print "Build release for version: %s" % full_version

    dev_options = {'develop': False, 'modules': None, 'sources': False, 'theme': 'defaultTheme', 'debug_files': False,
                   'gzip': True, 'performance_monitoring': False, 'allow_compile_css': False}
    prod_options = {'develop': True, 'modules': None, 'sources': False, 'theme': 'defaultTheme', 'debug_files': False,
                    'gzip': True, 'performance_monitoring': False, 'allow_compile_css': False}
    export_server_project_path = arguments['export_server_path']

    mods = ['anychart_bundle', 'anychart',
            'anymap', 'anystock', 'anygantt', 'data_adapter', 'anychart_ui', 'chart_editor']

    args = []
    for module in mods:
        dev_options['modules'] = [module]
        prod_options['modules'] = [module]
        args.append(dict(dev_options))
        args.append(dict(prod_options))
    pool = multiprocessing.Pool(arguments['process'])
    pool.map_async(__compile_project_from_map, args).get(99999)
    pool.close()
    pool.join()

    print "Compile CSS"
    __compile_css(True)

    print "Compile Themes"
    __build_themes()

    # install packages
    print "Build install packages"
    print "    Download demos from PG"
    if os.path.exists(os.path.join(OUT_PATH, 'gallery_demos')):
        shutil.rmtree(os.path.join(OUT_PATH, 'gallery_demos'))
    __download_and_unzip_from_http('http://playground.anychart.stg/gallery/develop/download', OUT_PATH, 'gallery_demos')

    print "    Build AnyGantt install packages"
    __build_product_package(
        os.path.join(OUT_PATH, 'AnyGantt' + '-' + short_version),
        'anygantt',
        lambda name: name.startswith('Gantt') or name.startswith('Pert')
    )

    print "    Build AnyStock install packages"
    __build_product_package(
        os.path.join(OUT_PATH, 'AnyStock' + '-' + short_version),
        'anystock',
        lambda name: name.startswith('Stock')
    )

    print "    Build AnyMap install packages"
    __build_product_package(
        os.path.join(OUT_PATH, 'AnyMap' + '-' + short_version),
        'anymap',
        lambda name: (name.startswith('Maps') or name.startswith('Seat')) and name != 'Maps_in_Dashboard'
    )

    print "    Build AnyChart install packages"
    __build_product_package(
        os.path.join(OUT_PATH, 'AnyChart' + '-' + short_version),
        'anychart',
        lambda name: not name.startswith('Stock') and
                     not name.startswith('Gantt') and
                     not name.startswith('Pert') and
                     not name.startswith('Resource') and
                     not name.startswith('Maps') and
                     not name.startswith('Seat') and
                     not name.startswith('Graphics')
    )

    # rm gallery demos dir
    shutil.rmtree(os.path.join(OUT_PATH, 'gallery_demos'))

    # export server
    print "Build export-server"
    if os.path.exists(export_server_project_path):
        # define version
        export_server_version, export_server_bundle_version = __get_export_server_version(export_server_project_path)

        # build export server
        shutil.copyfile(os.path.join(OUT_PATH, 'anychart-bundle.min.js'),
                        os.path.join(export_server_project_path, 'resources', 'js', 'anychart-bundle.min.js'))
        p = subprocess.Popen(['lein', 'uberjar'], cwd=export_server_project_path)
        p.wait()

        # copy to out
        shutil.copyfile(os.path.join(export_server_project_path, 'target', 'export-server-standalone.jar'),
                        os.path.join(OUT_PATH, 'export-server.jar'))
        shutil.copyfile(os.path.join(export_server_project_path, 'target', 'export-server-standalone.jar'),
                        os.path.join(OUT_PATH, 'export-server-%s-bundle-%s.jar' % (
                        export_server_version, export_server_bundle_version)))
    else:
        print "Error: Unable to build export server, there is no project at path: %s" % export_server_project_path

    print "Release build complete! Build time: {:.3f} sec".format(time.time() - t)


def __build_product_package(output_dir, binary_name, gallery_pass_func=None):
    # create folders structure
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.mkdir(output_dir)
    os.mkdir(os.path.join(output_dir, 'js'))
    os.mkdir(os.path.join(output_dir, 'css'))
    os.mkdir(os.path.join(output_dir, 'js', 'themes'))
    os.mkdir(os.path.join(output_dir, 'demos'))
    os.mkdir(os.path.join(output_dir, 'schemas'))

    # copy binaries
    shutil.copyfile(os.path.join(OUT_PATH, '%s.min.js' % binary_name),
                    os.path.join(output_dir, 'js', '%s.min.js' % binary_name))
    shutil.copyfile(os.path.join(OUT_PATH, '%s.min.js.gz' % binary_name),
                    os.path.join(output_dir, 'js', '%s.min.js.gz' % binary_name))
    shutil.copyfile(os.path.join(OUT_PATH, '%s.dev.min.js' % binary_name),
                    os.path.join(output_dir, 'js', '%s.dev.min.js' % binary_name))
    shutil.copyfile(os.path.join(OUT_PATH, '%s.dev.min.js.gz' % binary_name),
                    os.path.join(output_dir, 'js', '%s.dev.min.js.gz' % binary_name))

    # copy schemas
    shutil.copyfile(os.path.join(DIST_PATH, 'xml-schema.xsd'), os.path.join(output_dir, 'schemas', 'xml-schema.xsd'))
    shutil.copyfile(os.path.join(DIST_PATH, 'json-schema.json'), os.path.join(output_dir, 'schemas', 'json-schema.json'))

    # copy UI CSS
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.css'), os.path.join(output_dir, 'css', 'anychart-ui.css'))
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.css.gz'), os.path.join(output_dir, 'css', 'anychart-ui.css.gz'))
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.min.css'),
                    os.path.join(output_dir, 'css', 'anychart-ui.min.css'))
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.min.css.gz'),
                    os.path.join(output_dir, 'css', 'anychart-ui.min.css.gz'))

    # copy UI JS
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.min.js'), os.path.join(output_dir, 'js', 'anychart-ui.min.js'))
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.min.js.gz'),
                    os.path.join(output_dir, 'js', 'anychart-ui.min.js.gz'))
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.dev.min.js'),
                    os.path.join(output_dir, 'js', 'anychart-ui.dev.min.js'))
    shutil.copyfile(os.path.join(OUT_PATH, 'anychart-ui.dev.min.js.gz'),
                    os.path.join(output_dir, 'js', 'anychart-ui.dev.min.js.gz'))

    # copy data adapter
    shutil.copyfile(os.path.join(OUT_PATH, 'data-adapter.min.js'),
                    os.path.join(output_dir, 'js', 'data-adapter.min.js'))
    shutil.copyfile(os.path.join(OUT_PATH, 'data-adapter.min.js.gz'),
                    os.path.join(output_dir, 'js', 'data-adapter.min.js.gz'))
    shutil.copyfile(os.path.join(OUT_PATH, 'data-adapter.dev.min.js'),
                    os.path.join(output_dir, 'js', 'data-adapter.dev.min.js'))
    shutil.copyfile(os.path.join(OUT_PATH, 'data-adapter.dev.min.js.gz'),
                    os.path.join(output_dir, 'js', 'data-adapter.dev.min.js.gz'))

    # copy chart editor (anychart install package only)
    if binary_name == 'anychart':
            shutil.copyfile(os.path.join(OUT_PATH, 'chart-editor.min.js'),
                            os.path.join(output_dir, 'js', 'chart-editor.min.js'))
            shutil.copyfile(os.path.join(OUT_PATH, 'chart-editor.min.js.gz'),
                            os.path.join(output_dir, 'js', 'chart-editor.min.js.gz'))
            shutil.copyfile(os.path.join(OUT_PATH, 'chart-editor.dev.min.js'),
                            os.path.join(output_dir, 'js', 'chart-editor.dev.min.js'))
            shutil.copyfile(os.path.join(OUT_PATH, 'chart-editor.dev.min.js.gz'),
                            os.path.join(output_dir, 'js', 'chart-editor.dev.min.js.gz'))

    # copy themes
    for theme in __get_themes_list():
        shutil.copyfile(os.path.join(OUT_PATH, theme + '.js'), os.path.join(output_dir, 'js', 'themes', theme + '.js'))
        shutil.copyfile(os.path.join(OUT_PATH, theme + '.min.js'),
                        os.path.join(output_dir, 'js', 'themes', theme + '.min.js'))

    # copy demos
    for name in os.listdir(os.path.join(OUT_PATH, 'gallery_demos')):
        if name != 'js' and (not gallery_pass_func or gallery_pass_func(name)):
            shutil.copytree(os.path.join(OUT_PATH, 'gallery_demos', name), os.path.join(output_dir, 'demos', name))

    for (dirpath, dirnames, filenames) in os.walk(os.path.join(output_dir, 'demos')):
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                f = open(filepath, 'r')
                text = f.read()
                f.close()
                f = open(filepath, 'w')

                # replace binary name and add link to anychart-ui-.min.js
                text = text.replace('<script src="./../js/anychart.min.js"></script>',
                                    '<script src="../../js/%s.min.js"></script>\n        <script src="../../js/anychart-ui.min.js"></script>' % binary_name)

                # replace cdn link, to local link
                text = text.replace('https://cdn.anychart.com/css/latest/anychart-ui.min.css',
                                    '../../css/anychart-ui.min.css')

                f.write(text)
                f.close()

    # gzip package
    zip_out_file = os.path.join(OUT_PATH, binary_name + '.zip')
    if os.path.exists(zip_out_file):
        os.remove(zip_out_file)
    cls_zip_command = [
        'zip',
        '-r',
        (binary_name + '.zip').lower(),
        os.path.basename(output_dir)
    ]
    try:
        __call_console_commands(cls_zip_command, './out')
        shutil.rmtree(output_dir)
    except Exception as e:
        print "Can't zip packages because of an Error:\n" + e.message + "\n" + "You have to zip it by your self.\nRecommended command is:\n" + ' '.join(
            cls_zip_command)


def __print_gz_stat():
    result = []

    for f in os.listdir(OUT_PATH):
        if f.endswith('.gz'):
            full_path = os.path.join(OUT_PATH, f)
            stat = os.stat(full_path)
            result.append("%s size is %s" % (f, str(stat.st_size / 1024) + "Kb"))

    if len(result):
        print "Looking for gzip files size in out directory:"
        print "    " + "\n    ".join(result)
    else:
        print "No gzip files found in out directory"


def __upload_release():
    from fabric.api import env
    from maxcdn import MaxCDN

    # define build arguments
    global arguments
    version = arguments['version']
    is_latest = arguments['is_latest']
    dry_run = arguments['dry_run']
    export_server_project_path = arguments['export_server_path']

    host_string = arguments['host_string']
    max_cdn_alias = arguments['max_cdn_alias']
    max_cdn_key = arguments['max_cdn_key']
    max_cdn_secret = arguments['max_cdn_secret']
    max_cdn_zone = arguments['max_cdn_zone']

    if not host_string or not max_cdn_alias or not max_cdn_key or not max_cdn_secret or not max_cdn_zone:
        raise Exception('Wrong max cdn credits')

    print "Uploading release"
    print "version: %s" % version
    print "latest: %s" % is_latest
    print "export server: %s" % export_server_project_path
    print "dry-run: %s" % dry_run

    # static.anychart.com
    env.host_string = host_string
    env.user = host_string.split('@')[0]

    # max cdn
    api = MaxCDN(max_cdn_alias, max_cdn_key, max_cdn_secret)

    # create release upload list
    upload_list = []

    # bundle
    upload_list.append({'source_file': '%s/anychart-bundle.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart-bundle.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart-bundle.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart-bundle.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # UI
    upload_list.append({'source_file': '%s/anychart-ui.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart-ui.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart-ui.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart-ui.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # anychart
    upload_list.append({'source_file': '%s/anychart.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anychart.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # anygantt
    upload_list.append({'source_file': '%s/anygantt.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anygantt.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anygantt.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anygantt.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # anymap
    upload_list.append({'source_file': '%s/anymap.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anymap.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anymap.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anymap.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # anystock
    upload_list.append({'source_file': '%s/anystock.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anystock.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anystock.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/anystock.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # data adapter
    upload_list.append({'source_file': '%s/data-adapter.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/data-adapter.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/data-adapter.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/data-adapter.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # chart editor
    upload_list.append({'source_file': '%s/chart-editor.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/chart-editor.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/chart-editor.dev.min.js' % OUT_PATH, 'target': '/js/%s/'})
    upload_list.append({'source_file': '%s/chart-editor.dev.min.js.gz' % OUT_PATH, 'target': '/js/%s/'})

    # css
    upload_list.append({'source_file': '%s/anychart-ui.css' % OUT_PATH, 'target': '/css/%s/'})
    upload_list.append({'source_file': '%s/anychart-ui.css.gz' % OUT_PATH, 'target': '/css/%s/'})
    upload_list.append({'source_file': '%s/anychart-ui.min.css' % OUT_PATH, 'target': '/css/%s/'})
    upload_list.append({'source_file': '%s/anychart-ui.min.css.gz' % OUT_PATH, 'target': '/css/%s/'})

    # themes
    for theme in __get_themes_list():
        upload_list.append({'source_file': '%s/%s%s' % (OUT_PATH, theme, '.js'), 'target': '/themes/%s/'})
        upload_list.append({'source_file': '%s/%s%s' % (OUT_PATH, theme, '.min.js'), 'target': '/themes/%s/'})

    # schemas
    upload_list.append({'source_file': '%s/xml-schema.xsd' % DIST_PATH, 'target': '/schemas/%s/'})
    upload_list.append({'source_file': '%s/json-schema.json' % DIST_PATH, 'target': '/schemas/%s/'})

    # binaries packages
    upload_list.append({'source_file': '%s/anychart.zip' % OUT_PATH, 'target': '/binaries-package/%s/'})
    upload_list.append({'source_file': '%s/anygantt.zip' % OUT_PATH, 'target': '/binaries-package/%s/'})
    upload_list.append({'source_file': '%s/anystock.zip' % OUT_PATH, 'target': '/binaries-package/%s/'})
    upload_list.append({'source_file': '%s/anymap.zip' % OUT_PATH, 'target': '/binaries-package/%s/'})

    # export server
    export_server_version, export_server_bundle_version = __get_export_server_version(export_server_project_path)
    upload_list.append({'source_file': '%s/export-server.jar' % OUT_PATH, 'target': '/export-server/'})
    upload_list.append({'source_file': '%s/export-server-%s-bundle-%s.jar' % (
    OUT_PATH, export_server_version, export_server_bundle_version), 'target': '/export-server/'})

    # check all files exists
    should_exit = False
    for item in upload_list:
        if not os.path.exists(item['source_file']):
            should_exit = True
            print "Error: Missing file: %s" % item['source_file']

    if should_exit:
        sys.exit(1)

    # errors list
    errors = []

    # upload and invalidate
    for item in upload_list:
        errors += __upload_release_item(item, version, api, max_cdn_zone, dry_run)
        if is_latest:
            errors += __upload_release_item(item, 'latest', api, max_cdn_zone, dry_run)

    # print errors if any
    for error in errors:
        print error


def __upload_release_item(item, version, api, zone_id, dry_run):
    from fabric.api import hide, run, put
    from fabric.contrib.files import exists

    source_file = item['source_file']
    file_name = os.path.basename(source_file)

    base_path = (item['target'] % version if safe_index_of(item['target'], '%s') >= 0 else item['target'])
    upload_dir_path = '/apps/static/cdn%s' % base_path
    upload_file_path = upload_dir_path + file_name
    cdn_path = base_path + file_name
    errors = []

    # ensure target path exists
    try:
        print "Ensure directory exists: %s" % upload_dir_path
        if not dry_run:
            if not exists(upload_dir_path):
                print "Create directory: %s" % upload_dir_path
                run('mkdir %s' % upload_dir_path, quiet=True)
    except (KeyboardInterrupt, SystemExit):
        raise
    except:
        errors.append("Failed ensure path exists: %s\n%s" % (upload_dir_path, sys.exc_info()[0]))

    # upload file
    try:
        print "Upload file: %s --> %s" % (source_file, upload_file_path)
        if not dry_run:
            with hide('output', 'running', 'warnings'):
                put(source_file, upload_file_path)
    except (KeyboardInterrupt, SystemExit):
        raise
    except:
        errors.append("Failed to upload file: %s\n%s" % (upload_file_path, sys.exc_info()[0]))

    # invalidate cdn cache
    try:
        print "Invalidate CDN cache: %s" % cdn_path
        if not dry_run:
            api.purge(zone_id, cdn_path)
    except (KeyboardInterrupt, SystemExit):
        raise
    except:
        errors.append("Failed to invalidate CDN cache: %s\n%s" % (cdn_path, sys.exc_info()[0]))

    return errors


def safe_index_of(string, substring):
    try:
        index_value = string.index(substring)
    except ValueError:
        index_value = -1
    return index_value


# =======================================================================================================================
#                            Less css.
# =======================================================================================================================
def __compile_css(gzip):
    try:
        import lesscpy
    except ImportError:
        raise ImportError('You need install lesscpy. Run `./build.py libs`')

    __create_dir_if_not_exists(OUT_PATH)

    print "Compile AnyChart UI css"
    css_src_path = os.path.join(PROJECT_PATH, 'css', 'anychart.less')
    css_out_path = os.path.join(PROJECT_PATH, 'out', 'anychart-ui.css')
    css_min_out_path = os.path.join(PROJECT_PATH, 'out', 'anychart-ui.min.css')

    # Less
    f = open(css_out_path, 'w')
    f.write(lesscpy.compile(css_src_path))
    f.close()

    # Minify
    f_min = open(css_min_out_path, 'w')
    f_min.write(lesscpy.compile(css_src_path, xminify=True))
    f_min.close()

    if gzip:
        __gzip_file(css_out_path)
        __gzip_file(css_min_out_path)

    print "CSS compiled"


# =======================================================================================================================
#                            Logging.
# =======================================================================================================================
warnings_list = []


def __print_no_bundles():
    print 'No bundles found, see help for more info. (python build.py --help)'


def __print_warnings_list():
    for msg in warnings_list:
        print '\nWarning:'
        print msg


# =======================================================================================================================
#                            Version.
# =======================================================================================================================
def __get_version(opt_commits_count=False):
    # get global, major, minor versions from version.ini
    version_file = os.path.join(PROJECT_PATH, 'version.ini')
    f = open(version_file, 'r')
    lines = f.readlines()
    f.close()

    major = lines[0].split('=')[1].strip()
    minor = lines[1].split('=')[1].strip()
    patch = lines[2].split('=')[1].strip()

    if opt_commits_count:
        # get commits count from git repo
        p = subprocess.Popen(
            ['git', 'rev-list', 'HEAD', '--count'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=PROJECT_PATH)
        (output, err) = p.communicate()
        commit_count = output.strip()

        return "%s.%s.%s.%s" % (major, minor, patch, commit_count)
    else:
        return "%s.%s.%s" % (major, minor, patch)


def __get_export_server_version(export_server_project_path):
    f = open(os.path.join(export_server_project_path, 'project.clj'), 'r')
    export_server_project_text = f.read()
    f.close()
    return (
        export_server_project_text.split('defproject export-server "')[1].split('"')[0].strip(),
        export_server_project_text.split('AnyChart Bundle version')[1].split('"')[0].strip()
    )


def __is_develop():
    global arguments
    return 'develop' in arguments and str(arguments['develop']) == 'True'


def __is_performance_monitoring():
    global arguments
    return 'performance_monitoring' in arguments and str(arguments['performance_monitoring']) == 'True'


def __should_gen_debug_files():
    global arguments
    return 'debug_files' in arguments and str(arguments['debug_files']) == 'True'


def __should_gen_gzip():
    global arguments
    return 'gzip' in arguments and str(arguments['gzip']) == 'True'


#=======================================================================================================================
#           Main
# =======================================================================================================================
arguments = {}


def __exec_main_script():
    # root parser
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(help='AnyChart framework build script commands:')

    # create the parser for the "compile" command
    compile_parser = subparsers.add_parser('compile', help='Compile project or project modules')
    compile_parser.add_argument('-m', '--module', dest='modules', action='append',
                                help="Specify modules to compile, can be specified multiple times. Possible modules values: %s" % ', '.join(
                                    __get_modules_list()))
    compile_parser.add_argument('-s', '--sources', action='store_true',
                                help='Build project sources file (not minimized).')
    compile_parser.add_argument('-d', '--develop', action='store_true', help='Include developers tools into build.')
    compile_parser.add_argument('-pm', '--performance_monitoring', action='store_true',
                                help='Include performance monitoring tools into build.')
    compile_parser.add_argument('-gz', '--gzip', action='store_true', help='Create gzip copy of output file.')
    compile_parser.add_argument('-df', '--debug_files', action='store_true',
                                help='Create files with debug info (prop_out, var_out, sourcemap).')
    compile_parser.add_argument('-t', '--theme', action='store',
                                help="Specify the default theme to compile with. By default - 'defaultTheme'",
                                default='defaultTheme')
    compile_parser.add_argument('-ac', '--allow_compile_css', action='store_true',
                                help="Allow or reject build script to compile css for module")

    # create the parser for the "compile_each" command
    compile_each_parser = subparsers.add_parser('compile_each', help='Compile each project available module')
    compile_each_parser.add_argument('-d', '--develop', action='store_true',
                                     help='Include developers tools flag in each module compilation.')
    compile_each_parser.add_argument('-pm', '--performance_monitoring', action='store_true',
                                     help='Include performance monitoring tools into build.')
    compile_each_parser.add_argument('-df', '--debug_files', action='store_true',
                                     help='Create files with debug info (prop_out, var_out, sourcemap).')
    compile_each_parser.add_argument('-gz', '--gzip', action='store_true', help='Create gzip copy of output file.')
    compile_each_parser.add_argument('-t', '--theme', action='store',
                                     help="Specify the default theme to compile with. By default - 'defaultTheme'",
                                     default='defaultTheme')
    compile_each_parser.add_argument('-p', '--process', action='store', type=int,
                                     help="Specify the number of parallel processes to compile. By default 2 process",
                                     default=2)

    # create the parser for the "contrib" command
    contrib_parser = subparsers.add_parser('contrib', help='Synchronize project dependencies. Deprecated. Use "./build.py libs" instead')
    contrib_parser.add_argument('-l', '--linter', action='store_true',
                                help='Install closure linter with others contributions.')

    # create the parser for the "libs" command
    contrib_parser = subparsers.add_parser('libs', help='Synchronize project dependencies')
    contrib_parser.add_argument('-l', '--linter', action='store_true',
                                help='Install closure linter with others contributions.')

    # create the parser for the "deps" command
    subparsers.add_parser('deps', help='Generate deps.js file')

    # create the parser for the "lint" command
    subparsers.add_parser('lint', help='Exec linter check for whole project')

    # create the parser for the "autofix" command
    subparsers.add_parser('autofix', help='Try to autofix linter warnings and errors')

    # create the parser for the "theme" command
    themes_parser = subparsers.add_parser('theme',
                                          help='Build standalone theme file by name. Default value is "defaultTheme"')
    themes_parser.add_argument('-n', '--name', action='store',
                               help="Name of the theme, default value is 'defaultTheme'.\nPossible values are: %s"
                                    % ", ".join(__get_themes_list()), default='defaultTheme')
    # create the parser for the "theme" command
    themes_parser = subparsers.add_parser('themes', help='Build standalone files for all available themes')

    # create files for release
    release_parser = subparsers.add_parser('release', help='Creates release files in output directory.')
    release_parser.add_argument('-esp', '--export-server-path', dest='export_server_path', action='store',
                                default=os.path.join(PROJECT_PATH, '..', 'export-server'))
    release_parser.add_argument('-p', '--process', action='store', type=int,
                                help="Specify the number of parallel processes to compile. By default 2 process",
                                default=4)

    # create files for release
    subparsers.add_parser('gz_stat', help='Print into console size of all gzip files in out directory,'
                                          ' very useful on release day.')

    # create the parser for the "css" command
    css_parser = subparsers.add_parser('css', help='Compile AnyChart UI css')
    css_parser.add_argument('-gz', '--gzip', action='store_true', help='Create gzip copy of output files.')

    upload_release_parser = subparsers.add_parser('upload_release', help='Uploads release related files from /out folder to static.anychart.com and cdn.anychart.com. Invalidates CDN cache.')
    upload_release_parser.add_argument('-v', '--version', action='store', help="Version of the release, affects only folder on the remote server. Doesn't affect code version, export server version or wherever else version. ")
    upload_release_parser.add_argument('-nl', '--not-latest', dest='is_latest', action='store_false', help="Prevent to upload release files to 'latest' directory")
    upload_release_parser.add_argument('-dr', '--dry-run', dest='dry_run', action='store_true', help="Print what will happen, don't really upload files.")
    upload_release_parser.add_argument('-esp', '--export-server-path', dest='export_server_path', action='store', default=os.path.join(PROJECT_PATH, '..', 'export-server'))
    upload_release_parser.add_argument('-hs', '--host_string', dest='host_string', action='store')
    upload_release_parser.add_argument('-ma', '--max_cdn_alias', dest='max_cdn_alias', action='store')
    upload_release_parser.add_argument('-mk', '--max_cdn_key', dest='max_cdn_key', action='store')
    upload_release_parser.add_argument('-ms', '--max_cdn_secret', dest='max_cdn_secret', action='store')
    upload_release_parser.add_argument('-mz', '--max_cdn_zone', dest='max_cdn_zone', action='store')
    upload_release_parser.set_defaults(is_latest=True, version=__get_version(False))

    global arguments
    arguments = vars(parser.parse_args())

    command = sys.argv[1]

    if command == 'contrib' or command == 'libs':
        __sync_contrib()
    elif command == 'compile':
        __compile_project()
    elif command == 'compile_each':
        __compile_project_each()
    elif command == 'deps':
        __build_deps()
    elif command == 'lint':
        __lint_project()
    elif command == 'autofix':
        __autofix_project()
    elif command == 'theme':
        __build_theme()
    elif command == 'themes':
        __build_themes()
    elif command == 'release':
        __build_release()
    elif command == 'upload_release':
        __upload_release()
    elif command == 'gz_stat':
        __print_gz_stat()
    elif command == 'css':
        __compile_css(__should_gen_gzip())

    __print_warnings_list()


if __name__ == '__main__':
    try:
        __exec_main_script()
    except (StandardError, KeyboardInterrupt) as e:
        print e
        sys.exit(1)
