FROM node

RUN apt-get -y update

RUN npm install gitbook -g

# Support gitbook pdf
RUN apt-get install -y calibre

VOLUME /repository
WORKDIR /repository

EXPOSE 4000

ENTRYPOINT ["gitbook"]
CMD ["--version"]
