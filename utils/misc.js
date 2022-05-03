export class Error extends global.Error {}

export class File extends String {
  constructor(path, data) {
    super(data);
    this.path = path;
    this.data = data;
  }
  toString() {
    return String(this.data);
  }
}

export function defer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

export function arrify(thing) {
  if (Array.isArray(thing)) return thing;
  if (typeof thing === typeof undefined) return [];
  return [thing];
}

// console.log('>' + new File('path', 'data'))
// process.exit(console.log())
