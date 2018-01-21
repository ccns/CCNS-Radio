CCNS Radio
===

A nodejs based radio system that accept song request by youtube url and play on the server side web ui. Support discord chatbot control.

Installation
---
### edit config
```
$ cp config/default-sample.json config/default.json
$ vim config/default.json
```
### start server
```
$ npm install 
$ npm start
```
### development settings
```
$ ./scripts/install-git-hooks
$ ./node_modules/.bin/eslint --init
? How would you like to configure ESLint?
❯ Use a popular style guide
? Which style guide do you want to follow?
❯ Standard
? What format do you want your config file to be in?
❯ JSON
```

Costume
---
### change kanban musume
Replace `public/img/kanban-musume` by your musume(?

Discord bot support
---
Support discord bot control.
