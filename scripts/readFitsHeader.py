import sys

from astropy.io import fits

fname = sys.argv[1]
print("Looking at header for file ", fname)

hdul = fits.open(fname)

hdr = hdul[0].header

expTime = hdr['EXPTIME']

print(expTime)
print(hdr['TELESCOP'])
print(hdr['XBINNING'])
print(hdr['YBINNING'])

hdul.close()

