openssl req \
       -newkey rsa:2048 -nodes -keyout domain.key \
       -x509 -days 365 -out domain.crt

# existing key
openssl req \
       -key domain.key \
       -new \
       -x509 -days 365 -out domain.crt
