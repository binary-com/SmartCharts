git clone git@github.com:binary-com/deriv-app.git
cd deriv-app && npm run bootstrap && rm -rf node_modules/@deriv/deriv-charts/dist
cd .. && npm run build -- --output-path ./deriv-app/node_modules/@deriv/deriv-charts/dist
cd deriv-app && npm run build:prod
