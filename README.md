# toaster
More than just a toaster

# To run
npm start || node bin/www
navigate to http://localhost:3000

# Ro debug
node-inspector
navigate to http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858
place 'debugger' lines where you want break points
mocha --debug-brk /path/to/file

# Typescript
For testing we need to install the DefinetilyTyped code:
tsd install mocha --save
tsd install chai --sav
