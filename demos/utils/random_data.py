#!/usr/bin/python

from optparse import OptionParser
import random

parser = OptionParser(usage='Generating array of random numbers')
parser.add_option("-q", dest="q", default=2, type="int",
                  help="Digits including in value. Default = 2")
parser.add_option("-n", dest="n", default=0, type="int",
                  help="Numbers after the decimal point. Values are integer by default.")
parser.add_option("-l", dest="length", default=40, help="Length of the array. Default = 40", type="int",)
parser.add_option("--max",  dest="max",  help="Max value. Default = None, that means determinate by digits including",
                  default=None, type="int",)
parser.add_option("--min", dest='min', help="Min value. Default = 0", default=0, type="int",)
parser.add_option("-s", dest='sort', help="Sort data. 1 - Abc, 2 - Zyx  Default = 0", default=0, type="int")

(options, args) = parser.parse_args()


def get_random_number(_min, _max, n):
    result = random.uniform(_min, _max)
    if n == 0:
        return int(round(result, 0))
    return round(result, n)


def get_list(q, n, _length, _max, _min):
    array_max = 10 ** q
    if _max:
        array_max = _max
    result = []
    for i in xrange(_length):
        result.append(get_random_number(_min, array_max, n))
    return result


print options
if options.sort == 2:
    print sorted(get_list(options.q, options.n, options.length, options.max, options.min), reverse=True)
elif options.sort == 1:
    print sorted(get_list(options.q, options.n, options.length, options.max, options.min))
else:
    print get_list(options.q, options.n, options.length, options.max, options.min)