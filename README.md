[![npm](https://img.shields.io/npm/v/dockere.svg)](https://www.npmjs.com/package/dockere)

# docker*e*

…as in "dock *here*"

To quickly create a Docker container and mount current directory inside it.

```batch
C:\docker-test> dir /w/b
foo.js bar.css
C:\docker-test> dockere
Sending build context to Docker daemon
Step 1 : FROM ubuntu
Step 2 : WORKDIR /docker-test
Step 3 : CMD bash -li
Successfully built <id>
root@<id>:/docker-test# ls
foo.js bar.css
root@<id>:/docker-test# _
```

## Install

```
npm i -g dockere
```

## Usage

```sh
Usage: dockere [OPTION]
  -d, --dockerfile    dockerfile template to build from. Default: ubuntu
  -c, --command       command to execute when run. Default: bash -li
  -m, --mount-home    whether to mount your home-dir as /root. Defaut: no

Examples:
  dockere
  dockere -d nodejs -m
  dockere -d ubuntu -c echo ok
```

## Features

It:

1. Creates a `Dockerfile` in current directory
2. Builds an image from it
3. Runs and attaches to it, while mounting current-dir as `/<dir-name>`

### Dockerfiles

It comes with 3 basic template Dockerfiles: ubuntu [default], nodejs, and alpine.

On an empty dir, you can choose which one to load initially by

```sh
$ dockere -d ubuntu
Sending build context to Docker daemon
Step 1 : FROM ubuntu
...
```

This will create a `Dockerfile` in your current dir and your `home-dir/.dockere` for future use.

If there's already a Dockerfile in current dir and you specify a dockerfile template name, it will ask you whether you want to overwrite it with the default one.

```sh
$ dockere -d ubuntu
? Overwrite existing Dockerfile with "ubuntu" dockerfile template from Home? (y/N)
```

If there's already a Dockerfile in current dir and you specify a dockerfile template name **that's not found** in either your home-dir or this module provides, it will ask you whether you want to create a new template with this one and save it in your home-dir.

```sh
$ dockere -d custom
? Create a new "custom" dockerfile template from existing Dockerfile: (y/N)
```

It can save these, or any additional templates you create in your `home-dir/.dockere`

When saving in home-dir, it replaces all ocurrances of current-dir with template tag `<root-dir>`, and vice-versa when loading from home-dir, so that you can use these in any other directory.

### Command

The default command used is `bash -li` which lets you attach to the container. You can specify a different command:

```sh
$ dockere -c echo ok
...
Successfully built <id>
ok
```

### Mount home

You can mount your home-dir as `/root`
```sh
$ dockere -m
...
09:02 @MyBashPrompt /docker-test
$ cd ~/.ssh
09:02 @MyBashPrompt /root/.ssh
$ _
```
