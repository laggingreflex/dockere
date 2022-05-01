
# docker*e* [![npm](https://img.shields.io/npm/v/dockere.svg)](https://www.npmjs.com/package/dockere)

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

```
dockere [..options] [..non-options passed to docker run]

Options:
      --help               Show help  [boolean]
  -d, --dockerfile         Dockerfile to use.
                           Eg: alpine,nodejs,ubuntu,home,cwd  [string]
  -c, --command            Command to execute  [array] [default: ["bash"]]
  -v, --volume             Volume/mount points
                           <host>:<container>  [string]
  -h, --mountHome          Mount home directory
                           Short for --volume ~:/root  [boolean]
  -D, --mountDrives        <Experimental> Mount root drives in container's mount points /mnt/host/…
                           Short for --volume C:\:/mnt/host/c  [boolean]
  -n, --noMountCwd         Don't mount current directory. Mounts by default [boolean]
      --passThrough, --    Pass through other options/args to docker run  [boolean]
      --version            Show version number  [boolean]

Examples:
  dockere                  Run current-dir in a default (ubuntu) container
  dockere node             Run current-dir in a "node" container
  dockere -h               Mount the host's home-dir as container's ~/
  dockere -D               Mounts the hosts's root (C:|D:|…) drives in container's mount points /mnt/host/{c|d|…}
  dockere -v node_modules  Create a new volume '<root-dir>/node_modules' in the container
  dockere -c echo hi       Execute a command and exit
  dockere -- -p 8080:8080  Expose the 8080 port by passing -p flag to docker run
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

### Volume mounts

**dockere** offers some path improvements over Docker's default volume mount options.

#### Relative host-dir mount paths

Since [Docker requires host-dir to be an absolute path][1],
**dockere** lets you choose relative paths that can either be :

##### ~/home paths

All paths beginning with `~` are adjusted with proper absolute path to your **home-dir**.
Even for Windows users!

Eg.: You can mount your `~/.ssh` for the container's `root`:
```
dockere -v ~/.ssh:/root/.ssh
```

##### Relative paths

Paths that don't begin with a `/` are adjusted to absolute paths relative to **current-dir**.

Eg.: You can mount a parent dir:
```
dockere -v ../parent:/parent
```

#### Relative container-dir volume paths

Again, since [Docker requires container-dir to be an absolute path][1] as well.
**dockere** lets you choose relative paths that are adjusted to absolute path relative to your **working-dir**, which is the same name as your current-dir but inside the docker container.

\** **WARNING** \** However this creates ambiguity as to what to do with a command like this:

```
dockere -v node_modules
```

The default Docker behaviour would have been to interpret this as a [***named*** **volume**][1],
but **dockere** will treat it as a relative path and adjust it as a container-path relative to working-dir (Eg.: `/app/node_modules` in the container).

Use `--named-volume` instead to use named volumes. (todo: doesn't yet exist)


### Mount home

You can mount your home-dir as `/root`
```sh
$ dockere -m # same as: dockere -v ~:/root
...
09:02 @MyBashPrompt /docker-test
$ cd ~/.ssh
09:02 @MyBashPrompt /root/.ssh
$ _
```

## Troubleshooting

* The mounted directory seems to be empty

  Make sure you've shared the relevant drive(s)

  [![Settings > Shared Drives][share-drive-scr-l]][share-drive-scr]

[1]: https://docs.docker.com/engine/tutorials/dockervolumes/#mount-a-host-directory-as-a-data-volume

[share-drive-scr]: https://i.imgur.com/c6lOi8a.png
[share-drive-scr-l]: https://i.imgur.com/c6lOi8al.png
