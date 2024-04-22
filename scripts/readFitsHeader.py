import sys

from astropy.io import fits

fname = sys.argv[1]
print("Looking at header for file ", fname)

hdul = fits.open(fname)

hdr = hdul[0].header

expTime = hdr['EXPTIME']

print("Exposure time: ", expTime)
print("Telescope: ", hdr['TELESCOP'])
print("Binning: ", hdr['XBINNING'], "x", hdr['YBINNING'])

hdul.close()

