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
