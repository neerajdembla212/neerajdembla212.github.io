# neerajdembla212.github.io

# Run on local
In order to run the project and test on local : 
- install `http-server` using `npm install -g http-server`
- on project's root folder run `http-server` command, this will fire up the theme on your `localhost:808*`

# Make changes in less files
Whenever you need to change color, add or remove any css in existing theme always add your classes with new values in `LESS/custom.less` 

# compile less files
Whenever you make changes in `LESS/` folder you need to compile the changes using `less` to css in order to apply the changes everywhere in theme
- install less using `npm install less -g` 
- after changing any `*.less` file always run `lessc LESS/style.less css/style.css` in root folder. this command will recompile all files imported in `LESS/styles.less` and apply changes

As soon as your PR is merged in master branch the changes will be automatically visible on https://neerajdembla212.github.io
