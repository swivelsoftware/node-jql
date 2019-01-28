module.exports = {
  rootDir: 'test',
  transform: {
    '^.+\\.tsx?$': "ts-jest"
  },
  testRegex: '((\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ]
}
