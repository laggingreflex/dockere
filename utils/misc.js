
export function defer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

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

// console.log('>' + new File('path', 'data'))
// process.exit(console.log())
