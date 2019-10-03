/**
 * Parameter formats of specific functions
 * If not defined, the format will be '{0}, {1}, {2}, ...'
 */
export const formats = {
  // string functions
  POSITION: '{0} IN {1}',

  // date functions
  ADDDATE: '{0}, INTERVAL {1} {2}',
  DATE_ADD: '{0}, INTERVAL {1} {2}',
  DATE_SUB: '{0}, INTERVAL {1} {2}',
  EXTRACT: '{0} FROM {1}',
  SUBDATE: '{0}, INTERVAL {1} {2}',
  CAST: '{0} AS {1}',
}
