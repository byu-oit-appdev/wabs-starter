FROM node:8

ENV NODE_ENV="production" WABS_PORT="8080" WABS_DEBUG_PORT="9229" WSO2_WELLKNOWN_URL='https://api.byu.edu/.well-known/openid-configuration'

WORKDIR /var/wabs