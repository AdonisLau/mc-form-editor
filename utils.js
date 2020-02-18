const hasConsole = typeof console !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

export function error(msg) {
  if (!isProduction && hasConsole) {
    console.error(msg);
  }
}

function formatPath(path) {
  return path.replace(/\[([\w$'"]+)\]/g, (_, prop) => ('.' + prop.replace(/['"]/g, '')));
}

/**
 * @param {Object} json
 * @param {String} path
 * @returns {Any}
 * @description 根据path获取json里面的值
 */
export function getJsonValue(json, path) {
  if (json == null) {
    return json;
  }

  path = formatPath(path);

  let paths = path.split('.');

  for (let i = 0; i < paths.length; i++) {
    json = json[paths[i]];

    if (json == null) {
      return json;
    }
  }

  return json;
}

/**
 * @param {any} val
 * @return {Boolean}
 * @description 判断值是否为空值
 */
export function isEmptyValue(val) {
  return val === '' || val == null;
}
