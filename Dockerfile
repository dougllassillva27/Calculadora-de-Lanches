FROM nginx:1.27-alpine
COPY index.html styles.css script.js favicon.ico /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
