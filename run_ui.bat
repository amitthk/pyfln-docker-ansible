set "app_home=%cd%"

cd "%app_home%/pyfln-ui"
npm run ng serve -- --proxy-config proxy.conf.json