FROM node:8

WORKDIR /var/wabs

COPY ./docker/* ./

EXPOSE 3000

ENTRYPOINT ["npm", "run"]

CMD ["start"]