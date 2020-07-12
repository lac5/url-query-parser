module.exports = {
  parse: function(query) {
    let ret = {};
    query = String(query).split('&');
    for (let i = 0; i < query.length; i++) {
      let chunk = query[i];
      let eq = chunk.indexOf('=');
      if (eq > -1) {
        let key = chunk.slice(0, eq);
        let value = chunk.slice(eq + 1);
        ret[key] = value;
      } else {
        ret[chunk] = '';
      }
    }
    return o;
  },
  stringify: function(object) {
    return Object.entries(object).map(([key, value]) => `${key}=${value}`).join('&');
  },
}
