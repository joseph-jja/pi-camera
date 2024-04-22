import sys

from astropy.io import fits

fname = sys.argv[1]
print("Looking at header for file ", fname)

hdul = fits.open(fname)

hdr = hdul[0].header

expTime = hdr['EXPTIME']

print("Telescope: ", hdr['TELESCOP'])
print("Exposure time: ", expTime)
print("Object: ", hdr['OBJECT'])
print("Gain: ", hdr['GAIN'])
print("Offset:", hdr['OFFSET'])
print("Binning: ", hdr['XBINNING'], "x", hdr['YBINNING'])
print("Bits per pixel:", hdr['BITPIX'])
print("Width: ", hdr['NAXIS1'], " x Height: ", hdr['NAXIS2'])

hdul.close()

