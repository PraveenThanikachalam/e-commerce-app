var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-oOsIM4/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init2) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init2) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init2] = argArray;
    checkURL(request, init2);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    form[key] = value;
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i4 = groups.length - 1; i4 >= 0; i4--) {
    const [mark] = groups[i4];
    for (let j3 = paths.length - 1; j3 >= 0; j3--) {
      if (paths[j3].includes(mark)) {
        paths[j3] = paths[j3].replace(mark, groups[i4][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
};
var tryDecode = (str, decoder3) => {
  try {
    return decoder3(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder3(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", 8);
  let i4 = start;
  for (; i4 < url.length; i4++) {
    const charCode = url.charCodeAt(i4);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i4);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i4);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (...paths) => {
  let p4 = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p4.at(-1) === "/") {
      p4 = p4.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p4 = `${p4}/`;
    } else if (path !== "/") {
      p4 = `${p4}${path}`;
    }
    if (path === "/" && p4 === "") {
      p4 = "/";
    }
  }
  return p4;
};
var checkOptionalParameter = (path) => {
  if (!path.match(/\:.+\?$/)) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v3, i4, a4) => a4.indexOf(v3) === i4);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex2 = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex2 === -1 ? void 0 : endIndex2));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name.toLowerCase()) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw3 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw3[key]();
  };
  json() {
    return this.#cachedBody("json");
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c3) => c3({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  for (const key of Object.keys(map)) {
    headers.set(key, map[key]);
  }
  return headers;
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status = 200;
  #executionCtx;
  #headers;
  #preparedHeaders;
  #res;
  #isFresh = true;
  #layout;
  #renderer;
  #notFoundHandler;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this.#isFresh = false;
    return this.#res ||= new Response("404 Not Found", { status: 404 });
  }
  set res(_res) {
    this.#isFresh = false;
    if (this.#res && _res) {
      try {
        for (const [k3, v3] of this.#res.headers.entries()) {
          if (k3 === "content-type") {
            continue;
          }
          if (k3 === "set-cookie") {
            const cookies = this.#res.headers.getSetCookie();
            _res.headers.delete("set-cookie");
            for (const cookie of cookies) {
              _res.headers.append("set-cookie", cookie);
            }
          } else {
            _res.headers.set(k3, v3);
          }
        }
      } catch (e2) {
        if (e2 instanceof TypeError && e2.message.includes("immutable")) {
          this.res = new Response(_res.body, {
            headers: _res.headers,
            status: _res.status
          });
          return;
        } else {
          throw e2;
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (value === void 0) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }
    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }
    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };
  status = (status) => {
    this.#isFresh = false;
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    if (this.#isFresh && !headers && !arg && this.#status === 200) {
      return new Response(data, {
        headers: this.#preparedHeaders
      });
    }
    if (arg && typeof arg !== "number") {
      const header = new Headers(arg.headers);
      if (this.#headers) {
        this.#headers.forEach((v3, k3) => {
          if (k3 === "set-cookie") {
            header.append(k3, v3);
          } else {
            header.set(k3, v3);
          }
        });
      }
      const headers2 = setHeaders(header, this.#preparedHeaders);
      return new Response(data, {
        headers: headers2,
        status: arg.status ?? this.#status
      });
    }
    const status = typeof arg === "number" ? arg : this.#status;
    this.#preparedHeaders ??= {};
    this.#headers ??= new Headers();
    setHeaders(this.#headers, this.#preparedHeaders);
    if (this.#res) {
      this.#res.headers.forEach((v3, k3) => {
        if (k3 === "set-cookie") {
          this.#headers?.append(k3, v3);
        } else {
          this.#headers?.set(k3, v3);
        }
      });
      setHeaders(this.#headers, this.#preparedHeaders);
    }
    headers ??= {};
    for (const [k3, v3] of Object.entries(headers)) {
      if (typeof v3 === "string") {
        this.#headers.set(k3, v3);
      } else {
        this.#headers.delete(k3);
        for (const v22 of v3) {
          this.#headers.append(k3, v22);
        }
      }
    }
    return new Response(data, {
      status,
      headers: this.#headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => {
    return typeof arg === "number" ? this.#newResponse(data, arg, headers) : this.#newResponse(data, arg);
  };
  text = (text2, arg, headers) => {
    if (!this.#preparedHeaders) {
      if (this.#isFresh && !headers && !arg) {
        return new Response(text2);
      }
      this.#preparedHeaders = {};
    }
    this.#preparedHeaders["content-type"] = TEXT_PLAIN;
    if (typeof arg === "number") {
      return this.#newResponse(text2, arg, headers);
    }
    return this.#newResponse(text2, arg);
  };
  json = (object, arg, headers) => {
    const body = JSON.stringify(object);
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "application/json";
    return typeof arg === "number" ? this.#newResponse(body, arg, headers) : this.#newResponse(body, arg);
  };
  html = (html, arg, headers) => {
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
    if (typeof html === "object") {
      return resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then((html2) => {
        return typeof arg === "number" ? this.#newResponse(html2, arg, headers) : this.#newResponse(html2, arg);
      });
    }
    return typeof arg === "number" ? this.#newResponse(html, arg, headers) : this.#newResponse(html, arg);
  };
  redirect = (location, status) => {
    this.#headers ??= new Headers();
    this.#headers.set("Location", String(location));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    const isContext = context instanceof Context;
    return dispatch(0);
    async function dispatch(i4) {
      if (i4 <= index) {
        throw new Error("next() called multiple times");
      }
      index = i4;
      let res;
      let isError = false;
      let handler;
      if (middleware[i4]) {
        handler = middleware[i4][0][0];
        if (isContext) {
          context.req.routeIndex = i4;
        }
      } else {
        handler = i4 === middleware.length && next || void 0;
      }
      if (!handler) {
        if (isContext && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i4 + 1);
          });
        } catch (err) {
          if (err instanceof Error && isContext && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c3) => {
  return c3.text("404 Not Found", 404);
};
var errorHandler = (err, c3) => {
  if ("getResponse" in err) {
    return err.getResponse();
  }
  console.error(err);
  return c3.text("Internal Server Error", 500);
};
var Hono = class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p4 of [path].flat()) {
        this.#path = p4;
        for (const m2 of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m2.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r3) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r3.handler;
      } else {
        handler = async (c3, next) => (await compose([], app2.errorHandler)(c3, () => r3.handler(c3, next))).res;
        handler[COMPOSED_HANDLER] = r3.handler;
      }
      subApp.#addRoute(r3.method, r3.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c3) => {
      const options2 = optionHandler(c3);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c3) => {
      let executionContext = void 0;
      try {
        executionContext = c3.executionCtx;
      } catch {
      }
      return [c3.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c3, next) => {
      const res = await applicationHandler(replaceRequest(c3.req.raw), ...getOptions(c3));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r3 = { path, method, handler };
    this.router.add(method, path, [handler, r3]);
    this.routes.push(r3);
  }
  #handleError(err, c3) {
    if (err instanceof Error) {
      return this.errorHandler(err, c3);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c3 = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c3, async () => {
          c3.res = await this.#notFoundHandler(c3);
        });
      } catch (err) {
        return this.#handleError(err, c3);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c3.finalized ? c3.res : this.#notFoundHandler(c3))
      ).catch((err) => this.#handleError(err, c3)) : res ?? this.#notFoundHandler(c3);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c3);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c3);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a4, b2) {
  if (a4.length === 1) {
    return b2.length === 1 ? a4 < b2 ? -1 : 1 : -1;
  }
  if (b2.length === 1) {
    return 1;
  }
  if (a4 === ONLY_WILDCARD_REG_EXP_STR || a4 === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b2 === ONLY_WILDCARD_REG_EXP_STR || b2 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a4 === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b2 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a4.length === b2.length ? a4 < b2 ? -1 : 1 : b2.length - a4.length;
}
var Node = class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k3) => k3 !== ONLY_WILDCARD_REG_EXP_STR && k3 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k3) => k3.length > 1 && k3 !== ONLY_WILDCARD_REG_EXP_STR && k3 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k3) => {
      const c3 = this.#children[k3];
      return (typeof c3.#varIndex === "number" ? `(${k3})@${c3.#varIndex}` : regExpMetaChars.has(k3) ? `\\${k3}` : k3) + c3.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i4 = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i4}`;
        groups[i4] = [mark, m2];
        i4++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i4 = groups.length - 1; i4 >= 0; i4--) {
      const [mark] = groups[i4];
      for (let j3 = tokens.length - 1; j3 >= 0; j3--) {
        if (tokens[j3].indexOf(mark) !== -1) {
          tokens[j3] = tokens[j3].replace(mark, groups[i4][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_4, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_4, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i4 = 0, j3 = -1, len = routesWithStaticPathFlag.length; i4 < len; i4++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i4];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h3]) => [h3, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j3++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j3, pathErrorCheckOnly);
    } catch (e2) {
      throw e2 === PATH_ERROR ? new UnsupportedPathError(path) : e2;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j3] = handlers.map(([h3, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h3, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i4 = 0, len = handlerData.length; i4 < len; i4++) {
    for (let j3 = 0, len2 = handlerData[i4].length; j3 < len2; j3++) {
      const map = handlerData[i4][j3]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k3 = 0, len3 = keys.length; k3 < len3; k3++) {
        map[keys[k3]] = paramReplacementMap[map[keys[k3]]];
      }
    }
  }
  const handlerMap = [];
  for (const i4 in indexReplacementMap) {
    handlerMap[i4] = handlerData[indexReplacementMap[i4]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k3 of Object.keys(middleware).sort((a4, b2) => b2.length - a4.length)) {
    if (buildWildcardRegExp(k3).test(path)) {
      return [...middleware[k3]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p4) => {
          handlerMap[method][p4] = [...handlerMap[METHOD_NAME_ALL][p4]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m2) => {
          middleware[m2][path] ||= findMiddleware(middleware[m2], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(middleware[m2]).forEach((p4) => {
            re.test(p4) && middleware[m2][p4].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p4) => re.test(p4) && routes[m2][p4].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i4 = 0, len = paths.length; i4 < len; i4++) {
      const path2 = paths[i4];
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          routes[m2][path2] ||= [
            ...findMiddleware(middleware[m2], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m2][path2].push([handler, paramCount - len + i4 + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r3) => {
      const ownRoute = r3[method] ? Object.keys(r3[method]).map((path) => [path, r3[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r3[METHOD_NAME_ALL]).map((path) => [path, r3[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init2) {
    this.#routers = init2.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i4 = 0;
    let res;
    for (; i4 < len; i4++) {
      const router = routers[i4];
      try {
        for (let i22 = 0, len2 = routes.length; i22 < len2; i22++) {
          router.add(...routes[i22]);
        }
        res = router.match(method, path);
      } catch (e2) {
        if (e2 instanceof UnsupportedPathError) {
          continue;
        }
        throw e2;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i4 === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m2 = /* @__PURE__ */ Object.create(null);
      m2[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m2];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i4 = 0, len = parts.length; i4 < len; i4++) {
      const p4 = parts[i4];
      if (Object.keys(curNode.#children).includes(p4)) {
        curNode = curNode.#children[p4];
        const pattern2 = getPattern(p4);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.#children[p4] = new Node2();
      const pattern = getPattern(p4);
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[p4];
    }
    const m2 = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v3, i4, a4) => a4.indexOf(v3) === i4),
      score: this.#order
    };
    m2[method] = handlerSet;
    curNode.#methods.push(m2);
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i4 = 0, len = node.#methods.length; i4 < len; i4++) {
      const m2 = node.#methods[i4];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i22 = 0, len2 = handlerSet.possibleKeys.length; i22 < len2; i22++) {
            const key = handlerSet.possibleKeys[i22];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i4 = 0, len = parts.length; i4 < len; i4++) {
      const part = parts[i4];
      const isLast = i4 === len - 1;
      const tempNodes = [];
      for (let j3 = 0, len2 = curNodes.length; j3 < len2; j3++) {
        const node = curNodes[j3];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k3 = 0, len3 = node.#patterns.length; k3 < len3; k3++) {
          const pattern = node.#patterns[k3];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.#children[key];
          const restPathString = parts.slice(i4).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
            continue;
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a4, b2) => {
        return a4.score - b2.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i4 = 0, len = results.length; i4 < len; i4++) {
        this.#node.insert(method, results[i4], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/@neondatabase/serverless/index.mjs
var io = Object.create;
var Te = Object.defineProperty;
var so = Object.getOwnPropertyDescriptor;
var oo = Object.getOwnPropertyNames;
var ao = Object.getPrototypeOf;
var uo = Object.prototype.hasOwnProperty;
var co = (r3, e2, t2) => e2 in r3 ? Te(r3, e2, { enumerable: true, configurable: true, writable: true, value: t2 }) : r3[e2] = t2;
var a = (r3, e2) => Te(r3, "name", { value: e2, configurable: true });
var z = (r3, e2) => () => (r3 && (e2 = r3(r3 = 0)), e2);
var I = (r3, e2) => () => (e2 || r3((e2 = { exports: {} }).exports, e2), e2.exports);
var se = (r3, e2) => {
  for (var t2 in e2)
    Te(r3, t2, { get: e2[t2], enumerable: true });
};
var Tn = (r3, e2, t2, n2) => {
  if (e2 && typeof e2 == "object" || typeof e2 == "function")
    for (let i4 of oo(e2))
      !uo.call(r3, i4) && i4 !== t2 && Te(r3, i4, { get: () => e2[i4], enumerable: !(n2 = so(e2, i4)) || n2.enumerable });
  return r3;
};
var Ie = (r3, e2, t2) => (t2 = r3 != null ? io(ao(r3)) : {}, Tn(e2 || !r3 || !r3.__esModule ? Te(t2, "default", {
  value: r3,
  enumerable: true
}) : t2, r3));
var O = (r3) => Tn(Te({}, "__esModule", { value: true }), r3);
var _ = (r3, e2, t2) => co(r3, typeof e2 != "symbol" ? e2 + "" : e2, t2);
var Bn = I((st) => {
  "use strict";
  p();
  st.byteLength = lo;
  st.toByteArray = po;
  st.fromByteArray = go;
  var oe = [], re = [], ho = typeof Uint8Array < "u" ? Uint8Array : Array, Rt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (ve = 0, In = Rt.length; ve < In; ++ve)
    oe[ve] = Rt[ve], re[Rt.charCodeAt(ve)] = ve;
  var ve, In;
  re[45] = 62;
  re[95] = 63;
  function Pn(r3) {
    var e2 = r3.length;
    if (e2 % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var t2 = r3.indexOf("=");
    t2 === -1 && (t2 = e2);
    var n2 = t2 === e2 ? 0 : 4 - t2 % 4;
    return [t2, n2];
  }
  a(
    Pn,
    "getLens"
  );
  function lo(r3) {
    var e2 = Pn(r3), t2 = e2[0], n2 = e2[1];
    return (t2 + n2) * 3 / 4 - n2;
  }
  a(lo, "byteLength");
  function fo(r3, e2, t2) {
    return (e2 + t2) * 3 / 4 - t2;
  }
  a(fo, "_byteLength");
  function po(r3) {
    var e2, t2 = Pn(r3), n2 = t2[0], i4 = t2[1], s3 = new ho(fo(r3, n2, i4)), o3 = 0, u4 = i4 > 0 ? n2 - 4 : n2, c3;
    for (c3 = 0; c3 < u4; c3 += 4)
      e2 = re[r3.charCodeAt(c3)] << 18 | re[r3.charCodeAt(c3 + 1)] << 12 | re[r3.charCodeAt(c3 + 2)] << 6 | re[r3.charCodeAt(c3 + 3)], s3[o3++] = e2 >> 16 & 255, s3[o3++] = e2 >> 8 & 255, s3[o3++] = e2 & 255;
    return i4 === 2 && (e2 = re[r3.charCodeAt(c3)] << 2 | re[r3.charCodeAt(c3 + 1)] >> 4, s3[o3++] = e2 & 255), i4 === 1 && (e2 = re[r3.charCodeAt(
      c3
    )] << 10 | re[r3.charCodeAt(c3 + 1)] << 4 | re[r3.charCodeAt(c3 + 2)] >> 2, s3[o3++] = e2 >> 8 & 255, s3[o3++] = e2 & 255), s3;
  }
  a(po, "toByteArray");
  function yo(r3) {
    return oe[r3 >> 18 & 63] + oe[r3 >> 12 & 63] + oe[r3 >> 6 & 63] + oe[r3 & 63];
  }
  a(yo, "tripletToBase64");
  function mo(r3, e2, t2) {
    for (var n2, i4 = [], s3 = e2; s3 < t2; s3 += 3)
      n2 = (r3[s3] << 16 & 16711680) + (r3[s3 + 1] << 8 & 65280) + (r3[s3 + 2] & 255), i4.push(yo(n2));
    return i4.join(
      ""
    );
  }
  a(mo, "encodeChunk");
  function go(r3) {
    for (var e2, t2 = r3.length, n2 = t2 % 3, i4 = [], s3 = 16383, o3 = 0, u4 = t2 - n2; o3 < u4; o3 += s3)
      i4.push(mo(r3, o3, o3 + s3 > u4 ? u4 : o3 + s3));
    return n2 === 1 ? (e2 = r3[t2 - 1], i4.push(oe[e2 >> 2] + oe[e2 << 4 & 63] + "==")) : n2 === 2 && (e2 = (r3[t2 - 2] << 8) + r3[t2 - 1], i4.push(oe[e2 >> 10] + oe[e2 >> 4 & 63] + oe[e2 << 2 & 63] + "=")), i4.join("");
  }
  a(go, "fromByteArray");
});
var Ln = I((Ft) => {
  p();
  Ft.read = function(r3, e2, t2, n2, i4) {
    var s3, o3, u4 = i4 * 8 - n2 - 1, c3 = (1 << u4) - 1, h3 = c3 >> 1, l3 = -7, d3 = t2 ? i4 - 1 : 0, b2 = t2 ? -1 : 1, C3 = r3[e2 + d3];
    for (d3 += b2, s3 = C3 & (1 << -l3) - 1, C3 >>= -l3, l3 += u4; l3 > 0; s3 = s3 * 256 + r3[e2 + d3], d3 += b2, l3 -= 8)
      ;
    for (o3 = s3 & (1 << -l3) - 1, s3 >>= -l3, l3 += n2; l3 > 0; o3 = o3 * 256 + r3[e2 + d3], d3 += b2, l3 -= 8)
      ;
    if (s3 === 0)
      s3 = 1 - h3;
    else {
      if (s3 === c3)
        return o3 ? NaN : (C3 ? -1 : 1) * (1 / 0);
      o3 = o3 + Math.pow(2, n2), s3 = s3 - h3;
    }
    return (C3 ? -1 : 1) * o3 * Math.pow(2, s3 - n2);
  };
  Ft.write = function(r3, e2, t2, n2, i4, s3) {
    var o3, u4, c3, h3 = s3 * 8 - i4 - 1, l3 = (1 << h3) - 1, d3 = l3 >> 1, b2 = i4 === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, C3 = n2 ? 0 : s3 - 1, B = n2 ? 1 : -1, Q = e2 < 0 || e2 === 0 && 1 / e2 < 0 ? 1 : 0;
    for (e2 = Math.abs(e2), isNaN(e2) || e2 === 1 / 0 ? (u4 = isNaN(e2) ? 1 : 0, o3 = l3) : (o3 = Math.floor(Math.log(e2) / Math.LN2), e2 * (c3 = Math.pow(2, -o3)) < 1 && (o3--, c3 *= 2), o3 + d3 >= 1 ? e2 += b2 / c3 : e2 += b2 * Math.pow(2, 1 - d3), e2 * c3 >= 2 && (o3++, c3 /= 2), o3 + d3 >= l3 ? (u4 = 0, o3 = l3) : o3 + d3 >= 1 ? (u4 = (e2 * c3 - 1) * Math.pow(
      2,
      i4
    ), o3 = o3 + d3) : (u4 = e2 * Math.pow(2, d3 - 1) * Math.pow(2, i4), o3 = 0)); i4 >= 8; r3[t2 + C3] = u4 & 255, C3 += B, u4 /= 256, i4 -= 8)
      ;
    for (o3 = o3 << i4 | u4, h3 += i4; h3 > 0; r3[t2 + C3] = o3 & 255, C3 += B, o3 /= 256, h3 -= 8)
      ;
    r3[t2 + C3 - B] |= Q * 128;
  };
});
var Kn = I((Re) => {
  "use strict";
  p();
  var Mt = Bn(), Be = Ln(), Rn = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  Re.Buffer = f4;
  Re.SlowBuffer = xo;
  Re.INSPECT_MAX_BYTES = 50;
  var ot = 2147483647;
  Re.kMaxLength = ot;
  f4.TYPED_ARRAY_SUPPORT = wo();
  !f4.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function wo() {
    try {
      let r3 = new Uint8Array(1), e2 = { foo: a(function() {
        return 42;
      }, "foo") };
      return Object.setPrototypeOf(e2, Uint8Array.prototype), Object.setPrototypeOf(
        r3,
        e2
      ), r3.foo() === 42;
    } catch {
      return false;
    }
  }
  a(wo, "typedArraySupport");
  Object.defineProperty(
    f4.prototype,
    "parent",
    { enumerable: true, get: a(function() {
      if (f4.isBuffer(this))
        return this.buffer;
    }, "get") }
  );
  Object.defineProperty(f4.prototype, "offset", { enumerable: true, get: a(
    function() {
      if (f4.isBuffer(this))
        return this.byteOffset;
    },
    "get"
  ) });
  function le(r3) {
    if (r3 > ot)
      throw new RangeError('The value "' + r3 + '" is invalid for option "size"');
    let e2 = new Uint8Array(
      r3
    );
    return Object.setPrototypeOf(e2, f4.prototype), e2;
  }
  a(le, "createBuffer");
  function f4(r3, e2, t2) {
    if (typeof r3 == "number") {
      if (typeof e2 == "string")
        throw new TypeError('The "string" argument must be of type string. Received type number');
      return Ot(r3);
    }
    return kn(
      r3,
      e2,
      t2
    );
  }
  a(f4, "Buffer");
  f4.poolSize = 8192;
  function kn(r3, e2, t2) {
    if (typeof r3 == "string")
      return So(
        r3,
        e2
      );
    if (ArrayBuffer.isView(r3))
      return Eo(r3);
    if (r3 == null)
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r3);
    if (ae(r3, ArrayBuffer) || r3 && ae(r3.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ae(r3, SharedArrayBuffer) || r3 && ae(r3.buffer, SharedArrayBuffer)))
      return kt(r3, e2, t2);
    if (typeof r3 == "number")
      throw new TypeError('The "value" argument must not be of type number. Received type number');
    let n2 = r3.valueOf && r3.valueOf();
    if (n2 != null && n2 !== r3)
      return f4.from(n2, e2, t2);
    let i4 = vo(r3);
    if (i4)
      return i4;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r3[Symbol.toPrimitive] == "function")
      return f4.from(r3[Symbol.toPrimitive]("string"), e2, t2);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r3);
  }
  a(kn, "from");
  f4.from = function(r3, e2, t2) {
    return kn(r3, e2, t2);
  };
  Object.setPrototypeOf(f4.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(
    f4,
    Uint8Array
  );
  function Un(r3) {
    if (typeof r3 != "number")
      throw new TypeError('"size" argument must be of type number');
    if (r3 < 0)
      throw new RangeError('The value "' + r3 + '" is invalid for option "size"');
  }
  a(Un, "assertSize");
  function bo(r3, e2, t2) {
    return Un(r3), r3 <= 0 ? le(r3) : e2 !== void 0 ? typeof t2 == "string" ? le(r3).fill(e2, t2) : le(r3).fill(e2) : le(r3);
  }
  a(
    bo,
    "alloc"
  );
  f4.alloc = function(r3, e2, t2) {
    return bo(r3, e2, t2);
  };
  function Ot(r3) {
    return Un(r3), le(
      r3 < 0 ? 0 : Nt(r3) | 0
    );
  }
  a(Ot, "allocUnsafe");
  f4.allocUnsafe = function(r3) {
    return Ot(r3);
  };
  f4.allocUnsafeSlow = function(r3) {
    return Ot(r3);
  };
  function So(r3, e2) {
    if ((typeof e2 != "string" || e2 === "") && (e2 = "utf8"), !f4.isEncoding(e2))
      throw new TypeError("Unknown encoding: " + e2);
    let t2 = On(r3, e2) | 0, n2 = le(t2), i4 = n2.write(r3, e2);
    return i4 !== t2 && (n2 = n2.slice(0, i4)), n2;
  }
  a(So, "fromString");
  function Dt(r3) {
    let e2 = r3.length < 0 ? 0 : Nt(r3.length) | 0, t2 = le(e2);
    for (let n2 = 0; n2 < e2; n2 += 1)
      t2[n2] = r3[n2] & 255;
    return t2;
  }
  a(Dt, "fromArrayLike");
  function Eo(r3) {
    if (ae(r3, Uint8Array)) {
      let e2 = new Uint8Array(r3);
      return kt(e2.buffer, e2.byteOffset, e2.byteLength);
    }
    return Dt(r3);
  }
  a(Eo, "fromArrayView");
  function kt(r3, e2, t2) {
    if (e2 < 0 || r3.byteLength < e2)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (r3.byteLength < e2 + (t2 || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let n2;
    return e2 === void 0 && t2 === void 0 ? n2 = new Uint8Array(
      r3
    ) : t2 === void 0 ? n2 = new Uint8Array(r3, e2) : n2 = new Uint8Array(r3, e2, t2), Object.setPrototypeOf(
      n2,
      f4.prototype
    ), n2;
  }
  a(kt, "fromArrayBuffer");
  function vo(r3) {
    if (f4.isBuffer(r3)) {
      let e2 = Nt(
        r3.length
      ) | 0, t2 = le(e2);
      return t2.length === 0 || r3.copy(t2, 0, 0, e2), t2;
    }
    if (r3.length !== void 0)
      return typeof r3.length != "number" || Qt(r3.length) ? le(0) : Dt(r3);
    if (r3.type === "Buffer" && Array.isArray(r3.data))
      return Dt(r3.data);
  }
  a(vo, "fromObject");
  function Nt(r3) {
    if (r3 >= ot)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ot.toString(16) + " bytes");
    return r3 | 0;
  }
  a(Nt, "checked");
  function xo(r3) {
    return +r3 != r3 && (r3 = 0), f4.alloc(+r3);
  }
  a(xo, "SlowBuffer");
  f4.isBuffer = a(function(e2) {
    return e2 != null && e2._isBuffer === true && e2 !== f4.prototype;
  }, "isBuffer");
  f4.compare = a(function(e2, t2) {
    if (ae(e2, Uint8Array) && (e2 = f4.from(e2, e2.offset, e2.byteLength)), ae(t2, Uint8Array) && (t2 = f4.from(t2, t2.offset, t2.byteLength)), !f4.isBuffer(e2) || !f4.isBuffer(t2))
      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (e2 === t2)
      return 0;
    let n2 = e2.length, i4 = t2.length;
    for (let s3 = 0, o3 = Math.min(n2, i4); s3 < o3; ++s3)
      if (e2[s3] !== t2[s3]) {
        n2 = e2[s3], i4 = t2[s3];
        break;
      }
    return n2 < i4 ? -1 : i4 < n2 ? 1 : 0;
  }, "compare");
  f4.isEncoding = a(function(e2) {
    switch (String(e2).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  }, "isEncoding");
  f4.concat = a(function(e2, t2) {
    if (!Array.isArray(e2))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (e2.length === 0)
      return f4.alloc(0);
    let n2;
    if (t2 === void 0)
      for (t2 = 0, n2 = 0; n2 < e2.length; ++n2)
        t2 += e2[n2].length;
    let i4 = f4.allocUnsafe(t2), s3 = 0;
    for (n2 = 0; n2 < e2.length; ++n2) {
      let o3 = e2[n2];
      if (ae(o3, Uint8Array))
        s3 + o3.length > i4.length ? (f4.isBuffer(
          o3
        ) || (o3 = f4.from(o3)), o3.copy(i4, s3)) : Uint8Array.prototype.set.call(i4, o3, s3);
      else if (f4.isBuffer(
        o3
      ))
        o3.copy(i4, s3);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      s3 += o3.length;
    }
    return i4;
  }, "concat");
  function On(r3, e2) {
    if (f4.isBuffer(r3))
      return r3.length;
    if (ArrayBuffer.isView(r3) || ae(r3, ArrayBuffer))
      return r3.byteLength;
    if (typeof r3 != "string")
      throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r3);
    let t2 = r3.length, n2 = arguments.length > 2 && arguments[2] === true;
    if (!n2 && t2 === 0)
      return 0;
    let i4 = false;
    for (; ; )
      switch (e2) {
        case "ascii":
        case "latin1":
        case "binary":
          return t2;
        case "utf8":
        case "utf-8":
          return Ut(r3).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return t2 * 2;
        case "hex":
          return t2 >>> 1;
        case "base64":
          return Vn(r3).length;
        default:
          if (i4)
            return n2 ? -1 : Ut(r3).length;
          e2 = ("" + e2).toLowerCase(), i4 = true;
      }
  }
  a(On, "byteLength");
  f4.byteLength = On;
  function _o(r3, e2, t2) {
    let n2 = false;
    if ((e2 === void 0 || e2 < 0) && (e2 = 0), e2 > this.length || ((t2 === void 0 || t2 > this.length) && (t2 = this.length), t2 <= 0) || (t2 >>>= 0, e2 >>>= 0, t2 <= e2))
      return "";
    for (r3 || (r3 = "utf8"); ; )
      switch (r3) {
        case "hex":
          return Mo(
            this,
            e2,
            t2
          );
        case "utf8":
        case "utf-8":
          return qn(this, e2, t2);
        case "ascii":
          return Ro(
            this,
            e2,
            t2
          );
        case "latin1":
        case "binary":
          return Fo(this, e2, t2);
        case "base64":
          return Bo(
            this,
            e2,
            t2
          );
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Do(this, e2, t2);
        default:
          if (n2)
            throw new TypeError("Unknown encoding: " + r3);
          r3 = (r3 + "").toLowerCase(), n2 = true;
      }
  }
  a(
    _o,
    "slowToString"
  );
  f4.prototype._isBuffer = true;
  function xe(r3, e2, t2) {
    let n2 = r3[e2];
    r3[e2] = r3[t2], r3[t2] = n2;
  }
  a(xe, "swap");
  f4.prototype.swap16 = a(function() {
    let e2 = this.length;
    if (e2 % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t2 = 0; t2 < e2; t2 += 2)
      xe(this, t2, t2 + 1);
    return this;
  }, "swap16");
  f4.prototype.swap32 = a(function() {
    let e2 = this.length;
    if (e2 % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t2 = 0; t2 < e2; t2 += 4)
      xe(this, t2, t2 + 3), xe(this, t2 + 1, t2 + 2);
    return this;
  }, "swap32");
  f4.prototype.swap64 = a(function() {
    let e2 = this.length;
    if (e2 % 8 !== 0)
      throw new RangeError(
        "Buffer size must be a multiple of 64-bits"
      );
    for (let t2 = 0; t2 < e2; t2 += 8)
      xe(this, t2, t2 + 7), xe(this, t2 + 1, t2 + 6), xe(this, t2 + 2, t2 + 5), xe(this, t2 + 3, t2 + 4);
    return this;
  }, "swap64");
  f4.prototype.toString = a(function() {
    let e2 = this.length;
    return e2 === 0 ? "" : arguments.length === 0 ? qn(
      this,
      0,
      e2
    ) : _o.apply(this, arguments);
  }, "toString");
  f4.prototype.toLocaleString = f4.prototype.toString;
  f4.prototype.equals = a(function(e2) {
    if (!f4.isBuffer(e2))
      throw new TypeError(
        "Argument must be a Buffer"
      );
    return this === e2 ? true : f4.compare(this, e2) === 0;
  }, "equals");
  f4.prototype.inspect = a(function() {
    let e2 = "", t2 = Re.INSPECT_MAX_BYTES;
    return e2 = this.toString(
      "hex",
      0,
      t2
    ).replace(/(.{2})/g, "$1 ").trim(), this.length > t2 && (e2 += " ... "), "<Buffer " + e2 + ">";
  }, "inspect");
  Rn && (f4.prototype[Rn] = f4.prototype.inspect);
  f4.prototype.compare = a(function(e2, t2, n2, i4, s3) {
    if (ae(e2, Uint8Array) && (e2 = f4.from(e2, e2.offset, e2.byteLength)), !f4.isBuffer(e2))
      throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e2);
    if (t2 === void 0 && (t2 = 0), n2 === void 0 && (n2 = e2 ? e2.length : 0), i4 === void 0 && (i4 = 0), s3 === void 0 && (s3 = this.length), t2 < 0 || n2 > e2.length || i4 < 0 || s3 > this.length)
      throw new RangeError("out of range index");
    if (i4 >= s3 && t2 >= n2)
      return 0;
    if (i4 >= s3)
      return -1;
    if (t2 >= n2)
      return 1;
    if (t2 >>>= 0, n2 >>>= 0, i4 >>>= 0, s3 >>>= 0, this === e2)
      return 0;
    let o3 = s3 - i4, u4 = n2 - t2, c3 = Math.min(o3, u4), h3 = this.slice(i4, s3), l3 = e2.slice(t2, n2);
    for (let d3 = 0; d3 < c3; ++d3)
      if (h3[d3] !== l3[d3]) {
        o3 = h3[d3], u4 = l3[d3];
        break;
      }
    return o3 < u4 ? -1 : u4 < o3 ? 1 : 0;
  }, "compare");
  function Nn(r3, e2, t2, n2, i4) {
    if (r3.length === 0)
      return -1;
    if (typeof t2 == "string" ? (n2 = t2, t2 = 0) : t2 > 2147483647 ? t2 = 2147483647 : t2 < -2147483648 && (t2 = -2147483648), t2 = +t2, Qt(t2) && (t2 = i4 ? 0 : r3.length - 1), t2 < 0 && (t2 = r3.length + t2), t2 >= r3.length) {
      if (i4)
        return -1;
      t2 = r3.length - 1;
    } else if (t2 < 0)
      if (i4)
        t2 = 0;
      else
        return -1;
    if (typeof e2 == "string" && (e2 = f4.from(e2, n2)), f4.isBuffer(e2))
      return e2.length === 0 ? -1 : Fn(r3, e2, t2, n2, i4);
    if (typeof e2 == "number")
      return e2 = e2 & 255, typeof Uint8Array.prototype.indexOf == "function" ? i4 ? Uint8Array.prototype.indexOf.call(r3, e2, t2) : Uint8Array.prototype.lastIndexOf.call(r3, e2, t2) : Fn(
        r3,
        [e2],
        t2,
        n2,
        i4
      );
    throw new TypeError("val must be string, number or Buffer");
  }
  a(Nn, "bidirectionalIndexOf");
  function Fn(r3, e2, t2, n2, i4) {
    let s3 = 1, o3 = r3.length, u4 = e2.length;
    if (n2 !== void 0 && (n2 = String(n2).toLowerCase(), n2 === "ucs2" || n2 === "ucs-2" || n2 === "utf16le" || n2 === "utf-16le")) {
      if (r3.length < 2 || e2.length < 2)
        return -1;
      s3 = 2, o3 /= 2, u4 /= 2, t2 /= 2;
    }
    function c3(l3, d3) {
      return s3 === 1 ? l3[d3] : l3.readUInt16BE(d3 * s3);
    }
    a(c3, "read");
    let h3;
    if (i4) {
      let l3 = -1;
      for (h3 = t2; h3 < o3; h3++)
        if (c3(r3, h3) === c3(e2, l3 === -1 ? 0 : h3 - l3)) {
          if (l3 === -1 && (l3 = h3), h3 - l3 + 1 === u4)
            return l3 * s3;
        } else
          l3 !== -1 && (h3 -= h3 - l3), l3 = -1;
    } else
      for (t2 + u4 > o3 && (t2 = o3 - u4), h3 = t2; h3 >= 0; h3--) {
        let l3 = true;
        for (let d3 = 0; d3 < u4; d3++)
          if (c3(r3, h3 + d3) !== c3(e2, d3)) {
            l3 = false;
            break;
          }
        if (l3)
          return h3;
      }
    return -1;
  }
  a(Fn, "arrayIndexOf");
  f4.prototype.includes = a(function(e2, t2, n2) {
    return this.indexOf(e2, t2, n2) !== -1;
  }, "includes");
  f4.prototype.indexOf = a(function(e2, t2, n2) {
    return Nn(this, e2, t2, n2, true);
  }, "indexOf");
  f4.prototype.lastIndexOf = a(function(e2, t2, n2) {
    return Nn(this, e2, t2, n2, false);
  }, "lastIndexOf");
  function Ao(r3, e2, t2, n2) {
    t2 = Number(t2) || 0;
    let i4 = r3.length - t2;
    n2 ? (n2 = Number(n2), n2 > i4 && (n2 = i4)) : n2 = i4;
    let s3 = e2.length;
    n2 > s3 / 2 && (n2 = s3 / 2);
    let o3;
    for (o3 = 0; o3 < n2; ++o3) {
      let u4 = parseInt(e2.substr(o3 * 2, 2), 16);
      if (Qt(u4))
        return o3;
      r3[t2 + o3] = u4;
    }
    return o3;
  }
  a(Ao, "hexWrite");
  function Co(r3, e2, t2, n2) {
    return at(Ut(
      e2,
      r3.length - t2
    ), r3, t2, n2);
  }
  a(Co, "utf8Write");
  function To(r3, e2, t2, n2) {
    return at(No(e2), r3, t2, n2);
  }
  a(To, "asciiWrite");
  function Io(r3, e2, t2, n2) {
    return at(Vn(e2), r3, t2, n2);
  }
  a(Io, "base64Write");
  function Po(r3, e2, t2, n2) {
    return at(qo(e2, r3.length - t2), r3, t2, n2);
  }
  a(Po, "ucs2Write");
  f4.prototype.write = a(function(e2, t2, n2, i4) {
    if (t2 === void 0)
      i4 = "utf8", n2 = this.length, t2 = 0;
    else if (n2 === void 0 && typeof t2 == "string")
      i4 = t2, n2 = this.length, t2 = 0;
    else if (isFinite(t2))
      t2 = t2 >>> 0, isFinite(n2) ? (n2 = n2 >>> 0, i4 === void 0 && (i4 = "utf8")) : (i4 = n2, n2 = void 0);
    else
      throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let s3 = this.length - t2;
    if ((n2 === void 0 || n2 > s3) && (n2 = s3), e2.length > 0 && (n2 < 0 || t2 < 0) || t2 > this.length)
      throw new RangeError(
        "Attempt to write outside buffer bounds"
      );
    i4 || (i4 = "utf8");
    let o3 = false;
    for (; ; )
      switch (i4) {
        case "hex":
          return Ao(this, e2, t2, n2);
        case "utf8":
        case "utf-8":
          return Co(this, e2, t2, n2);
        case "ascii":
        case "latin1":
        case "binary":
          return To(this, e2, t2, n2);
        case "base64":
          return Io(
            this,
            e2,
            t2,
            n2
          );
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Po(this, e2, t2, n2);
        default:
          if (o3)
            throw new TypeError("Unknown encoding: " + i4);
          i4 = ("" + i4).toLowerCase(), o3 = true;
      }
  }, "write");
  f4.prototype.toJSON = a(function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  }, "toJSON");
  function Bo(r3, e2, t2) {
    return e2 === 0 && t2 === r3.length ? Mt.fromByteArray(r3) : Mt.fromByteArray(r3.slice(e2, t2));
  }
  a(Bo, "base64Slice");
  function qn(r3, e2, t2) {
    t2 = Math.min(r3.length, t2);
    let n2 = [], i4 = e2;
    for (; i4 < t2; ) {
      let s3 = r3[i4], o3 = null, u4 = s3 > 239 ? 4 : s3 > 223 ? 3 : s3 > 191 ? 2 : 1;
      if (i4 + u4 <= t2) {
        let c3, h3, l3, d3;
        switch (u4) {
          case 1:
            s3 < 128 && (o3 = s3);
            break;
          case 2:
            c3 = r3[i4 + 1], (c3 & 192) === 128 && (d3 = (s3 & 31) << 6 | c3 & 63, d3 > 127 && (o3 = d3));
            break;
          case 3:
            c3 = r3[i4 + 1], h3 = r3[i4 + 2], (c3 & 192) === 128 && (h3 & 192) === 128 && (d3 = (s3 & 15) << 12 | (c3 & 63) << 6 | h3 & 63, d3 > 2047 && (d3 < 55296 || d3 > 57343) && (o3 = d3));
            break;
          case 4:
            c3 = r3[i4 + 1], h3 = r3[i4 + 2], l3 = r3[i4 + 3], (c3 & 192) === 128 && (h3 & 192) === 128 && (l3 & 192) === 128 && (d3 = (s3 & 15) << 18 | (c3 & 63) << 12 | (h3 & 63) << 6 | l3 & 63, d3 > 65535 && d3 < 1114112 && (o3 = d3));
        }
      }
      o3 === null ? (o3 = 65533, u4 = 1) : o3 > 65535 && (o3 -= 65536, n2.push(o3 >>> 10 & 1023 | 55296), o3 = 56320 | o3 & 1023), n2.push(o3), i4 += u4;
    }
    return Lo(n2);
  }
  a(qn, "utf8Slice");
  var Mn = 4096;
  function Lo(r3) {
    let e2 = r3.length;
    if (e2 <= Mn)
      return String.fromCharCode.apply(String, r3);
    let t2 = "", n2 = 0;
    for (; n2 < e2; )
      t2 += String.fromCharCode.apply(String, r3.slice(n2, n2 += Mn));
    return t2;
  }
  a(Lo, "decodeCodePointsArray");
  function Ro(r3, e2, t2) {
    let n2 = "";
    t2 = Math.min(r3.length, t2);
    for (let i4 = e2; i4 < t2; ++i4)
      n2 += String.fromCharCode(r3[i4] & 127);
    return n2;
  }
  a(Ro, "asciiSlice");
  function Fo(r3, e2, t2) {
    let n2 = "";
    t2 = Math.min(r3.length, t2);
    for (let i4 = e2; i4 < t2; ++i4)
      n2 += String.fromCharCode(r3[i4]);
    return n2;
  }
  a(Fo, "latin1Slice");
  function Mo(r3, e2, t2) {
    let n2 = r3.length;
    (!e2 || e2 < 0) && (e2 = 0), (!t2 || t2 < 0 || t2 > n2) && (t2 = n2);
    let i4 = "";
    for (let s3 = e2; s3 < t2; ++s3)
      i4 += Qo[r3[s3]];
    return i4;
  }
  a(Mo, "hexSlice");
  function Do(r3, e2, t2) {
    let n2 = r3.slice(e2, t2), i4 = "";
    for (let s3 = 0; s3 < n2.length - 1; s3 += 2)
      i4 += String.fromCharCode(n2[s3] + n2[s3 + 1] * 256);
    return i4;
  }
  a(Do, "utf16leSlice");
  f4.prototype.slice = a(function(e2, t2) {
    let n2 = this.length;
    e2 = ~~e2, t2 = t2 === void 0 ? n2 : ~~t2, e2 < 0 ? (e2 += n2, e2 < 0 && (e2 = 0)) : e2 > n2 && (e2 = n2), t2 < 0 ? (t2 += n2, t2 < 0 && (t2 = 0)) : t2 > n2 && (t2 = n2), t2 < e2 && (t2 = e2);
    let i4 = this.subarray(
      e2,
      t2
    );
    return Object.setPrototypeOf(i4, f4.prototype), i4;
  }, "slice");
  function N2(r3, e2, t2) {
    if (r3 % 1 !== 0 || r3 < 0)
      throw new RangeError("offset is not uint");
    if (r3 + e2 > t2)
      throw new RangeError(
        "Trying to access beyond buffer length"
      );
  }
  a(N2, "checkOffset");
  f4.prototype.readUintLE = f4.prototype.readUIntLE = a(function(e2, t2, n2) {
    e2 = e2 >>> 0, t2 = t2 >>> 0, n2 || N2(e2, t2, this.length);
    let i4 = this[e2], s3 = 1, o3 = 0;
    for (; ++o3 < t2 && (s3 *= 256); )
      i4 += this[e2 + o3] * s3;
    return i4;
  }, "readUIntLE");
  f4.prototype.readUintBE = f4.prototype.readUIntBE = a(function(e2, t2, n2) {
    e2 = e2 >>> 0, t2 = t2 >>> 0, n2 || N2(e2, t2, this.length);
    let i4 = this[e2 + --t2], s3 = 1;
    for (; t2 > 0 && (s3 *= 256); )
      i4 += this[e2 + --t2] * s3;
    return i4;
  }, "readUIntBE");
  f4.prototype.readUint8 = f4.prototype.readUInt8 = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 1, this.length), this[e2];
  }, "readUInt8");
  f4.prototype.readUint16LE = f4.prototype.readUInt16LE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 2, this.length), this[e2] | this[e2 + 1] << 8;
  }, "readUInt16LE");
  f4.prototype.readUint16BE = f4.prototype.readUInt16BE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 2, this.length), this[e2] << 8 | this[e2 + 1];
  }, "readUInt16BE");
  f4.prototype.readUint32LE = f4.prototype.readUInt32LE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 4, this.length), (this[e2] | this[e2 + 1] << 8 | this[e2 + 2] << 16) + this[e2 + 3] * 16777216;
  }, "readUInt32LE");
  f4.prototype.readUint32BE = f4.prototype.readUInt32BE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 4, this.length), this[e2] * 16777216 + (this[e2 + 1] << 16 | this[e2 + 2] << 8 | this[e2 + 3]);
  }, "readUInt32BE");
  f4.prototype.readBigUInt64LE = me(a(function(e2) {
    e2 = e2 >>> 0, Le(e2, "offset");
    let t2 = this[e2], n2 = this[e2 + 7];
    (t2 === void 0 || n2 === void 0) && We(e2, this.length - 8);
    let i4 = t2 + this[++e2] * 2 ** 8 + this[++e2] * 2 ** 16 + this[++e2] * 2 ** 24, s3 = this[++e2] + this[++e2] * 2 ** 8 + this[++e2] * 2 ** 16 + n2 * 2 ** 24;
    return BigInt(i4) + (BigInt(s3) << BigInt(32));
  }, "readBigUInt64LE"));
  f4.prototype.readBigUInt64BE = me(a(function(e2) {
    e2 = e2 >>> 0, Le(e2, "offset");
    let t2 = this[e2], n2 = this[e2 + 7];
    (t2 === void 0 || n2 === void 0) && We(e2, this.length - 8);
    let i4 = t2 * 2 ** 24 + this[++e2] * 2 ** 16 + this[++e2] * 2 ** 8 + this[++e2], s3 = this[++e2] * 2 ** 24 + this[++e2] * 2 ** 16 + this[++e2] * 2 ** 8 + n2;
    return (BigInt(
      i4
    ) << BigInt(32)) + BigInt(s3);
  }, "readBigUInt64BE"));
  f4.prototype.readIntLE = a(function(e2, t2, n2) {
    e2 = e2 >>> 0, t2 = t2 >>> 0, n2 || N2(e2, t2, this.length);
    let i4 = this[e2], s3 = 1, o3 = 0;
    for (; ++o3 < t2 && (s3 *= 256); )
      i4 += this[e2 + o3] * s3;
    return s3 *= 128, i4 >= s3 && (i4 -= Math.pow(2, 8 * t2)), i4;
  }, "readIntLE");
  f4.prototype.readIntBE = a(function(e2, t2, n2) {
    e2 = e2 >>> 0, t2 = t2 >>> 0, n2 || N2(e2, t2, this.length);
    let i4 = t2, s3 = 1, o3 = this[e2 + --i4];
    for (; i4 > 0 && (s3 *= 256); )
      o3 += this[e2 + --i4] * s3;
    return s3 *= 128, o3 >= s3 && (o3 -= Math.pow(2, 8 * t2)), o3;
  }, "readIntBE");
  f4.prototype.readInt8 = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 1, this.length), this[e2] & 128 ? (255 - this[e2] + 1) * -1 : this[e2];
  }, "readInt8");
  f4.prototype.readInt16LE = a(function(e2, t2) {
    e2 = e2 >>> 0, t2 || N2(e2, 2, this.length);
    let n2 = this[e2] | this[e2 + 1] << 8;
    return n2 & 32768 ? n2 | 4294901760 : n2;
  }, "readInt16LE");
  f4.prototype.readInt16BE = a(
    function(e2, t2) {
      e2 = e2 >>> 0, t2 || N2(e2, 2, this.length);
      let n2 = this[e2 + 1] | this[e2] << 8;
      return n2 & 32768 ? n2 | 4294901760 : n2;
    },
    "readInt16BE"
  );
  f4.prototype.readInt32LE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 4, this.length), this[e2] | this[e2 + 1] << 8 | this[e2 + 2] << 16 | this[e2 + 3] << 24;
  }, "readInt32LE");
  f4.prototype.readInt32BE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 4, this.length), this[e2] << 24 | this[e2 + 1] << 16 | this[e2 + 2] << 8 | this[e2 + 3];
  }, "readInt32BE");
  f4.prototype.readBigInt64LE = me(a(function(e2) {
    e2 = e2 >>> 0, Le(e2, "offset");
    let t2 = this[e2], n2 = this[e2 + 7];
    (t2 === void 0 || n2 === void 0) && We(
      e2,
      this.length - 8
    );
    let i4 = this[e2 + 4] + this[e2 + 5] * 2 ** 8 + this[e2 + 6] * 2 ** 16 + (n2 << 24);
    return (BigInt(
      i4
    ) << BigInt(32)) + BigInt(t2 + this[++e2] * 2 ** 8 + this[++e2] * 2 ** 16 + this[++e2] * 2 ** 24);
  }, "readBigInt64LE"));
  f4.prototype.readBigInt64BE = me(a(function(e2) {
    e2 = e2 >>> 0, Le(e2, "offset");
    let t2 = this[e2], n2 = this[e2 + 7];
    (t2 === void 0 || n2 === void 0) && We(e2, this.length - 8);
    let i4 = (t2 << 24) + this[++e2] * 2 ** 16 + this[++e2] * 2 ** 8 + this[++e2];
    return (BigInt(i4) << BigInt(32)) + BigInt(
      this[++e2] * 2 ** 24 + this[++e2] * 2 ** 16 + this[++e2] * 2 ** 8 + n2
    );
  }, "readBigInt64BE"));
  f4.prototype.readFloatLE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 4, this.length), Be.read(
      this,
      e2,
      true,
      23,
      4
    );
  }, "readFloatLE");
  f4.prototype.readFloatBE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 4, this.length), Be.read(this, e2, false, 23, 4);
  }, "readFloatBE");
  f4.prototype.readDoubleLE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 8, this.length), Be.read(this, e2, true, 52, 8);
  }, "readDoubleLE");
  f4.prototype.readDoubleBE = a(function(e2, t2) {
    return e2 = e2 >>> 0, t2 || N2(e2, 8, this.length), Be.read(this, e2, false, 52, 8);
  }, "readDoubleBE");
  function Y(r3, e2, t2, n2, i4, s3) {
    if (!f4.isBuffer(
      r3
    ))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e2 > i4 || e2 < s3)
      throw new RangeError('"value" argument is out of bounds');
    if (t2 + n2 > r3.length)
      throw new RangeError(
        "Index out of range"
      );
  }
  a(Y, "checkInt");
  f4.prototype.writeUintLE = f4.prototype.writeUIntLE = a(function(e2, t2, n2, i4) {
    if (e2 = +e2, t2 = t2 >>> 0, n2 = n2 >>> 0, !i4) {
      let u4 = Math.pow(2, 8 * n2) - 1;
      Y(
        this,
        e2,
        t2,
        n2,
        u4,
        0
      );
    }
    let s3 = 1, o3 = 0;
    for (this[t2] = e2 & 255; ++o3 < n2 && (s3 *= 256); )
      this[t2 + o3] = e2 / s3 & 255;
    return t2 + n2;
  }, "writeUIntLE");
  f4.prototype.writeUintBE = f4.prototype.writeUIntBE = a(function(e2, t2, n2, i4) {
    if (e2 = +e2, t2 = t2 >>> 0, n2 = n2 >>> 0, !i4) {
      let u4 = Math.pow(2, 8 * n2) - 1;
      Y(this, e2, t2, n2, u4, 0);
    }
    let s3 = n2 - 1, o3 = 1;
    for (this[t2 + s3] = e2 & 255; --s3 >= 0 && (o3 *= 256); )
      this[t2 + s3] = e2 / o3 & 255;
    return t2 + n2;
  }, "writeUIntBE");
  f4.prototype.writeUint8 = f4.prototype.writeUInt8 = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(this, e2, t2, 1, 255, 0), this[t2] = e2 & 255, t2 + 1;
  }, "writeUInt8");
  f4.prototype.writeUint16LE = f4.prototype.writeUInt16LE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(
      this,
      e2,
      t2,
      2,
      65535,
      0
    ), this[t2] = e2 & 255, this[t2 + 1] = e2 >>> 8, t2 + 2;
  }, "writeUInt16LE");
  f4.prototype.writeUint16BE = f4.prototype.writeUInt16BE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(
      this,
      e2,
      t2,
      2,
      65535,
      0
    ), this[t2] = e2 >>> 8, this[t2 + 1] = e2 & 255, t2 + 2;
  }, "writeUInt16BE");
  f4.prototype.writeUint32LE = f4.prototype.writeUInt32LE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(
      this,
      e2,
      t2,
      4,
      4294967295,
      0
    ), this[t2 + 3] = e2 >>> 24, this[t2 + 2] = e2 >>> 16, this[t2 + 1] = e2 >>> 8, this[t2] = e2 & 255, t2 + 4;
  }, "writeUInt32LE");
  f4.prototype.writeUint32BE = f4.prototype.writeUInt32BE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(this, e2, t2, 4, 4294967295, 0), this[t2] = e2 >>> 24, this[t2 + 1] = e2 >>> 16, this[t2 + 2] = e2 >>> 8, this[t2 + 3] = e2 & 255, t2 + 4;
  }, "writeUInt32BE");
  function Qn(r3, e2, t2, n2, i4) {
    $n(
      e2,
      n2,
      i4,
      r3,
      t2,
      7
    );
    let s3 = Number(e2 & BigInt(4294967295));
    r3[t2++] = s3, s3 = s3 >> 8, r3[t2++] = s3, s3 = s3 >> 8, r3[t2++] = s3, s3 = s3 >> 8, r3[t2++] = s3;
    let o3 = Number(e2 >> BigInt(32) & BigInt(4294967295));
    return r3[t2++] = o3, o3 = o3 >> 8, r3[t2++] = o3, o3 = o3 >> 8, r3[t2++] = o3, o3 = o3 >> 8, r3[t2++] = o3, t2;
  }
  a(Qn, "wrtBigUInt64LE");
  function jn(r3, e2, t2, n2, i4) {
    $n(e2, n2, i4, r3, t2, 7);
    let s3 = Number(e2 & BigInt(4294967295));
    r3[t2 + 7] = s3, s3 = s3 >> 8, r3[t2 + 6] = s3, s3 = s3 >> 8, r3[t2 + 5] = s3, s3 = s3 >> 8, r3[t2 + 4] = s3;
    let o3 = Number(e2 >> BigInt(32) & BigInt(4294967295));
    return r3[t2 + 3] = o3, o3 = o3 >> 8, r3[t2 + 2] = o3, o3 = o3 >> 8, r3[t2 + 1] = o3, o3 = o3 >> 8, r3[t2] = o3, t2 + 8;
  }
  a(jn, "wrtBigUInt64BE");
  f4.prototype.writeBigUInt64LE = me(a(function(e2, t2 = 0) {
    return Qn(this, e2, t2, BigInt(0), BigInt(
      "0xffffffffffffffff"
    ));
  }, "writeBigUInt64LE"));
  f4.prototype.writeBigUInt64BE = me(a(function(e2, t2 = 0) {
    return jn(this, e2, t2, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64BE"));
  f4.prototype.writeIntLE = a(function(e2, t2, n2, i4) {
    if (e2 = +e2, t2 = t2 >>> 0, !i4) {
      let c3 = Math.pow(
        2,
        8 * n2 - 1
      );
      Y(this, e2, t2, n2, c3 - 1, -c3);
    }
    let s3 = 0, o3 = 1, u4 = 0;
    for (this[t2] = e2 & 255; ++s3 < n2 && (o3 *= 256); )
      e2 < 0 && u4 === 0 && this[t2 + s3 - 1] !== 0 && (u4 = 1), this[t2 + s3] = (e2 / o3 >> 0) - u4 & 255;
    return t2 + n2;
  }, "writeIntLE");
  f4.prototype.writeIntBE = a(function(e2, t2, n2, i4) {
    if (e2 = +e2, t2 = t2 >>> 0, !i4) {
      let c3 = Math.pow(
        2,
        8 * n2 - 1
      );
      Y(this, e2, t2, n2, c3 - 1, -c3);
    }
    let s3 = n2 - 1, o3 = 1, u4 = 0;
    for (this[t2 + s3] = e2 & 255; --s3 >= 0 && (o3 *= 256); )
      e2 < 0 && u4 === 0 && this[t2 + s3 + 1] !== 0 && (u4 = 1), this[t2 + s3] = (e2 / o3 >> 0) - u4 & 255;
    return t2 + n2;
  }, "writeIntBE");
  f4.prototype.writeInt8 = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(
      this,
      e2,
      t2,
      1,
      127,
      -128
    ), e2 < 0 && (e2 = 255 + e2 + 1), this[t2] = e2 & 255, t2 + 1;
  }, "writeInt8");
  f4.prototype.writeInt16LE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(this, e2, t2, 2, 32767, -32768), this[t2] = e2 & 255, this[t2 + 1] = e2 >>> 8, t2 + 2;
  }, "writeInt16LE");
  f4.prototype.writeInt16BE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(this, e2, t2, 2, 32767, -32768), this[t2] = e2 >>> 8, this[t2 + 1] = e2 & 255, t2 + 2;
  }, "writeInt16BE");
  f4.prototype.writeInt32LE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(this, e2, t2, 4, 2147483647, -2147483648), this[t2] = e2 & 255, this[t2 + 1] = e2 >>> 8, this[t2 + 2] = e2 >>> 16, this[t2 + 3] = e2 >>> 24, t2 + 4;
  }, "writeInt32LE");
  f4.prototype.writeInt32BE = a(function(e2, t2, n2) {
    return e2 = +e2, t2 = t2 >>> 0, n2 || Y(this, e2, t2, 4, 2147483647, -2147483648), e2 < 0 && (e2 = 4294967295 + e2 + 1), this[t2] = e2 >>> 24, this[t2 + 1] = e2 >>> 16, this[t2 + 2] = e2 >>> 8, this[t2 + 3] = e2 & 255, t2 + 4;
  }, "writeInt32BE");
  f4.prototype.writeBigInt64LE = me(a(function(e2, t2 = 0) {
    return Qn(this, e2, t2, -BigInt(
      "0x8000000000000000"
    ), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64LE"));
  f4.prototype.writeBigInt64BE = me(a(function(e2, t2 = 0) {
    return jn(this, e2, t2, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64BE"));
  function Wn(r3, e2, t2, n2, i4, s3) {
    if (t2 + n2 > r3.length)
      throw new RangeError("Index out of range");
    if (t2 < 0)
      throw new RangeError(
        "Index out of range"
      );
  }
  a(Wn, "checkIEEE754");
  function Hn(r3, e2, t2, n2, i4) {
    return e2 = +e2, t2 = t2 >>> 0, i4 || Wn(r3, e2, t2, 4, 34028234663852886e22, -34028234663852886e22), Be.write(
      r3,
      e2,
      t2,
      n2,
      23,
      4
    ), t2 + 4;
  }
  a(Hn, "writeFloat");
  f4.prototype.writeFloatLE = a(function(e2, t2, n2) {
    return Hn(
      this,
      e2,
      t2,
      true,
      n2
    );
  }, "writeFloatLE");
  f4.prototype.writeFloatBE = a(function(e2, t2, n2) {
    return Hn(
      this,
      e2,
      t2,
      false,
      n2
    );
  }, "writeFloatBE");
  function Gn(r3, e2, t2, n2, i4) {
    return e2 = +e2, t2 = t2 >>> 0, i4 || Wn(
      r3,
      e2,
      t2,
      8,
      17976931348623157e292,
      -17976931348623157e292
    ), Be.write(r3, e2, t2, n2, 52, 8), t2 + 8;
  }
  a(Gn, "writeDouble");
  f4.prototype.writeDoubleLE = a(function(e2, t2, n2) {
    return Gn(
      this,
      e2,
      t2,
      true,
      n2
    );
  }, "writeDoubleLE");
  f4.prototype.writeDoubleBE = a(function(e2, t2, n2) {
    return Gn(
      this,
      e2,
      t2,
      false,
      n2
    );
  }, "writeDoubleBE");
  f4.prototype.copy = a(function(e2, t2, n2, i4) {
    if (!f4.isBuffer(
      e2
    ))
      throw new TypeError("argument should be a Buffer");
    if (n2 || (n2 = 0), !i4 && i4 !== 0 && (i4 = this.length), t2 >= e2.length && (t2 = e2.length), t2 || (t2 = 0), i4 > 0 && i4 < n2 && (i4 = n2), i4 === n2 || e2.length === 0 || this.length === 0)
      return 0;
    if (t2 < 0)
      throw new RangeError("targetStart out of bounds");
    if (n2 < 0 || n2 >= this.length)
      throw new RangeError("Index out of range");
    if (i4 < 0)
      throw new RangeError(
        "sourceEnd out of bounds"
      );
    i4 > this.length && (i4 = this.length), e2.length - t2 < i4 - n2 && (i4 = e2.length - t2 + n2);
    let s3 = i4 - n2;
    return this === e2 && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t2, n2, i4) : Uint8Array.prototype.set.call(e2, this.subarray(n2, i4), t2), s3;
  }, "copy");
  f4.prototype.fill = a(function(e2, t2, n2, i4) {
    if (typeof e2 == "string") {
      if (typeof t2 == "string" ? (i4 = t2, t2 = 0, n2 = this.length) : typeof n2 == "string" && (i4 = n2, n2 = this.length), i4 !== void 0 && typeof i4 != "string")
        throw new TypeError("encoding must be a string");
      if (typeof i4 == "string" && !f4.isEncoding(i4))
        throw new TypeError("Unknown encoding: " + i4);
      if (e2.length === 1) {
        let o3 = e2.charCodeAt(0);
        (i4 === "utf8" && o3 < 128 || i4 === "latin1") && (e2 = o3);
      }
    } else
      typeof e2 == "number" ? e2 = e2 & 255 : typeof e2 == "boolean" && (e2 = Number(e2));
    if (t2 < 0 || this.length < t2 || this.length < n2)
      throw new RangeError("Out of range index");
    if (n2 <= t2)
      return this;
    t2 = t2 >>> 0, n2 = n2 === void 0 ? this.length : n2 >>> 0, e2 || (e2 = 0);
    let s3;
    if (typeof e2 == "number")
      for (s3 = t2; s3 < n2; ++s3)
        this[s3] = e2;
    else {
      let o3 = f4.isBuffer(e2) ? e2 : f4.from(e2, i4), u4 = o3.length;
      if (u4 === 0)
        throw new TypeError(
          'The value "' + e2 + '" is invalid for argument "value"'
        );
      for (s3 = 0; s3 < n2 - t2; ++s3)
        this[s3 + t2] = o3[s3 % u4];
    }
    return this;
  }, "fill");
  var Pe = {};
  function qt(r3, e2, t2) {
    var n2;
    Pe[r3] = (n2 = class extends t2 {
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: e2.apply(this, arguments),
          writable: true,
          configurable: true
        }), this.name = `${this.name} [${r3}]`, this.stack, delete this.name;
      }
      get code() {
        return r3;
      }
      set code(s3) {
        Object.defineProperty(this, "code", {
          configurable: true,
          enumerable: true,
          value: s3,
          writable: true
        });
      }
      toString() {
        return `${this.name} [${r3}]: ${this.message}`;
      }
    }, a(n2, "NodeError"), n2);
  }
  a(qt, "E");
  qt("ERR_BUFFER_OUT_OF_BOUNDS", function(r3) {
    return r3 ? `${r3} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  qt("ERR_INVALID_ARG_TYPE", function(r3, e2) {
    return `The "${r3}" argument must be of type number. Received type ${typeof e2}`;
  }, TypeError);
  qt("ERR_OUT_OF_RANGE", function(r3, e2, t2) {
    let n2 = `The value of "${r3}" is out of range.`, i4 = t2;
    return Number.isInteger(t2) && Math.abs(t2) > 2 ** 32 ? i4 = Dn(String(t2)) : typeof t2 == "bigint" && (i4 = String(t2), (t2 > BigInt(2) ** BigInt(32) || t2 < -(BigInt(2) ** BigInt(32))) && (i4 = Dn(i4)), i4 += "n"), n2 += ` It must be ${e2}. Received ${i4}`, n2;
  }, RangeError);
  function Dn(r3) {
    let e2 = "", t2 = r3.length, n2 = r3[0] === "-" ? 1 : 0;
    for (; t2 >= n2 + 4; t2 -= 3)
      e2 = `_${r3.slice(t2 - 3, t2)}${e2}`;
    return `${r3.slice(
      0,
      t2
    )}${e2}`;
  }
  a(Dn, "addNumericalSeparator");
  function ko(r3, e2, t2) {
    Le(e2, "offset"), (r3[e2] === void 0 || r3[e2 + t2] === void 0) && We(e2, r3.length - (t2 + 1));
  }
  a(ko, "checkBounds");
  function $n(r3, e2, t2, n2, i4, s3) {
    if (r3 > t2 || r3 < e2) {
      let o3 = typeof e2 == "bigint" ? "n" : "", u4;
      throw s3 > 3 ? e2 === 0 || e2 === BigInt(0) ? u4 = `>= 0${o3} and < 2${o3} ** ${(s3 + 1) * 8}${o3}` : u4 = `>= -(2${o3} ** ${(s3 + 1) * 8 - 1}${o3}) and < 2 ** ${(s3 + 1) * 8 - 1}${o3}` : u4 = `>= ${e2}${o3} and <= ${t2}${o3}`, new Pe.ERR_OUT_OF_RANGE(
        "value",
        u4,
        r3
      );
    }
    ko(n2, i4, s3);
  }
  a($n, "checkIntBI");
  function Le(r3, e2) {
    if (typeof r3 != "number")
      throw new Pe.ERR_INVALID_ARG_TYPE(e2, "number", r3);
  }
  a(Le, "validateNumber");
  function We(r3, e2, t2) {
    throw Math.floor(r3) !== r3 ? (Le(r3, t2), new Pe.ERR_OUT_OF_RANGE(
      t2 || "offset",
      "an integer",
      r3
    )) : e2 < 0 ? new Pe.ERR_BUFFER_OUT_OF_BOUNDS() : new Pe.ERR_OUT_OF_RANGE(t2 || "offset", `>= ${t2 ? 1 : 0} and <= ${e2}`, r3);
  }
  a(We, "boundsError");
  var Uo = /[^+/0-9A-Za-z-_]/g;
  function Oo(r3) {
    if (r3 = r3.split("=")[0], r3 = r3.trim().replace(Uo, ""), r3.length < 2)
      return "";
    for (; r3.length % 4 !== 0; )
      r3 = r3 + "=";
    return r3;
  }
  a(Oo, "base64clean");
  function Ut(r3, e2) {
    e2 = e2 || 1 / 0;
    let t2, n2 = r3.length, i4 = null, s3 = [];
    for (let o3 = 0; o3 < n2; ++o3) {
      if (t2 = r3.charCodeAt(o3), t2 > 55295 && t2 < 57344) {
        if (!i4) {
          if (t2 > 56319) {
            (e2 -= 3) > -1 && s3.push(239, 191, 189);
            continue;
          } else if (o3 + 1 === n2) {
            (e2 -= 3) > -1 && s3.push(239, 191, 189);
            continue;
          }
          i4 = t2;
          continue;
        }
        if (t2 < 56320) {
          (e2 -= 3) > -1 && s3.push(
            239,
            191,
            189
          ), i4 = t2;
          continue;
        }
        t2 = (i4 - 55296 << 10 | t2 - 56320) + 65536;
      } else
        i4 && (e2 -= 3) > -1 && s3.push(
          239,
          191,
          189
        );
      if (i4 = null, t2 < 128) {
        if ((e2 -= 1) < 0)
          break;
        s3.push(t2);
      } else if (t2 < 2048) {
        if ((e2 -= 2) < 0)
          break;
        s3.push(t2 >> 6 | 192, t2 & 63 | 128);
      } else if (t2 < 65536) {
        if ((e2 -= 3) < 0)
          break;
        s3.push(t2 >> 12 | 224, t2 >> 6 & 63 | 128, t2 & 63 | 128);
      } else if (t2 < 1114112) {
        if ((e2 -= 4) < 0)
          break;
        s3.push(t2 >> 18 | 240, t2 >> 12 & 63 | 128, t2 >> 6 & 63 | 128, t2 & 63 | 128);
      } else
        throw new Error("Invalid code point");
    }
    return s3;
  }
  a(
    Ut,
    "utf8ToBytes"
  );
  function No(r3) {
    let e2 = [];
    for (let t2 = 0; t2 < r3.length; ++t2)
      e2.push(r3.charCodeAt(
        t2
      ) & 255);
    return e2;
  }
  a(No, "asciiToBytes");
  function qo(r3, e2) {
    let t2, n2, i4, s3 = [];
    for (let o3 = 0; o3 < r3.length && !((e2 -= 2) < 0); ++o3)
      t2 = r3.charCodeAt(o3), n2 = t2 >> 8, i4 = t2 % 256, s3.push(i4), s3.push(n2);
    return s3;
  }
  a(qo, "utf16leToBytes");
  function Vn(r3) {
    return Mt.toByteArray(Oo(r3));
  }
  a(Vn, "base64ToBytes");
  function at(r3, e2, t2, n2) {
    let i4;
    for (i4 = 0; i4 < n2 && !(i4 + t2 >= e2.length || i4 >= r3.length); ++i4)
      e2[i4 + t2] = r3[i4];
    return i4;
  }
  a(at, "blitBuffer");
  function ae(r3, e2) {
    return r3 instanceof e2 || r3 != null && r3.constructor != null && r3.constructor.name != null && r3.constructor.name === e2.name;
  }
  a(ae, "isInstance");
  function Qt(r3) {
    return r3 !== r3;
  }
  a(Qt, "numberIsNaN");
  var Qo = function() {
    let r3 = "0123456789abcdef", e2 = new Array(256);
    for (let t2 = 0; t2 < 16; ++t2) {
      let n2 = t2 * 16;
      for (let i4 = 0; i4 < 16; ++i4)
        e2[n2 + i4] = r3[t2] + r3[i4];
    }
    return e2;
  }();
  function me(r3) {
    return typeof BigInt > "u" ? jo : r3;
  }
  a(me, "defineBigIntMethod");
  function jo() {
    throw new Error("BigInt not supported");
  }
  a(jo, "BufferBigIntNotDefined");
});
var S;
var E;
var v;
var w;
var y;
var m;
var p = z(() => {
  "use strict";
  S = globalThis, E = globalThis.setImmediate ?? ((r3) => setTimeout(
    r3,
    0
  )), v = globalThis.clearImmediate ?? ((r3) => clearTimeout(r3)), w = globalThis.crypto ?? {};
  w.subtle ?? (w.subtle = {});
  y = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : Kn().Buffer, m = globalThis.process ?? {};
  m.env ?? (m.env = {});
  try {
    m.nextTick(() => {
    });
  } catch {
    let e2 = Promise.resolve();
    m.nextTick = e2.then.bind(e2);
  }
});
var ge = I((rh, jt) => {
  "use strict";
  p();
  var Fe = typeof Reflect == "object" ? Reflect : null, zn = Fe && typeof Fe.apply == "function" ? Fe.apply : a(function(e2, t2, n2) {
    return Function.prototype.apply.call(e2, t2, n2);
  }, "ReflectApply"), ut;
  Fe && typeof Fe.ownKeys == "function" ? ut = Fe.ownKeys : Object.getOwnPropertySymbols ? ut = a(function(e2) {
    return Object.getOwnPropertyNames(
      e2
    ).concat(Object.getOwnPropertySymbols(e2));
  }, "ReflectOwnKeys") : ut = a(function(e2) {
    return Object.getOwnPropertyNames(e2);
  }, "ReflectOwnKeys");
  function Wo(r3) {
    console && console.warn && console.warn(r3);
  }
  a(Wo, "ProcessEmitWarning");
  var Zn = Number.isNaN || a(function(e2) {
    return e2 !== e2;
  }, "NumberIsNaN");
  function L3() {
    L3.init.call(this);
  }
  a(L3, "EventEmitter");
  jt.exports = L3;
  jt.exports.once = Vo;
  L3.EventEmitter = L3;
  L3.prototype._events = void 0;
  L3.prototype._eventsCount = 0;
  L3.prototype._maxListeners = void 0;
  var Yn = 10;
  function ct(r3) {
    if (typeof r3 != "function")
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r3);
  }
  a(ct, "checkListener");
  Object.defineProperty(L3, "defaultMaxListeners", { enumerable: true, get: a(function() {
    return Yn;
  }, "get"), set: a(function(r3) {
    if (typeof r3 != "number" || r3 < 0 || Zn(r3))
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r3 + ".");
    Yn = r3;
  }, "set") });
  L3.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  };
  L3.prototype.setMaxListeners = a(
    function(e2) {
      if (typeof e2 != "number" || e2 < 0 || Zn(e2))
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e2 + ".");
      return this._maxListeners = e2, this;
    },
    "setMaxListeners"
  );
  function Jn(r3) {
    return r3._maxListeners === void 0 ? L3.defaultMaxListeners : r3._maxListeners;
  }
  a(Jn, "_getMaxListeners");
  L3.prototype.getMaxListeners = a(function() {
    return Jn(this);
  }, "getMaxListeners");
  L3.prototype.emit = a(function(e2) {
    for (var t2 = [], n2 = 1; n2 < arguments.length; n2++)
      t2.push(arguments[n2]);
    var i4 = e2 === "error", s3 = this._events;
    if (s3 !== void 0)
      i4 = i4 && s3.error === void 0;
    else if (!i4)
      return false;
    if (i4) {
      var o3;
      if (t2.length > 0 && (o3 = t2[0]), o3 instanceof Error)
        throw o3;
      var u4 = new Error("Unhandled error." + (o3 ? " (" + o3.message + ")" : ""));
      throw u4.context = o3, u4;
    }
    var c3 = s3[e2];
    if (c3 === void 0)
      return false;
    if (typeof c3 == "function")
      zn(c3, this, t2);
    else
      for (var h3 = c3.length, l3 = ni(c3, h3), n2 = 0; n2 < h3; ++n2)
        zn(
          l3[n2],
          this,
          t2
        );
    return true;
  }, "emit");
  function Xn(r3, e2, t2, n2) {
    var i4, s3, o3;
    if (ct(t2), s3 = r3._events, s3 === void 0 ? (s3 = r3._events = /* @__PURE__ */ Object.create(null), r3._eventsCount = 0) : (s3.newListener !== void 0 && (r3.emit(
      "newListener",
      e2,
      t2.listener ? t2.listener : t2
    ), s3 = r3._events), o3 = s3[e2]), o3 === void 0)
      o3 = s3[e2] = t2, ++r3._eventsCount;
    else if (typeof o3 == "function" ? o3 = s3[e2] = n2 ? [t2, o3] : [o3, t2] : n2 ? o3.unshift(
      t2
    ) : o3.push(t2), i4 = Jn(r3), i4 > 0 && o3.length > i4 && !o3.warned) {
      o3.warned = true;
      var u4 = new Error("Possible EventEmitter memory leak detected. " + o3.length + " " + String(e2) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u4.name = "MaxListenersExceededWarning", u4.emitter = r3, u4.type = e2, u4.count = o3.length, Wo(u4);
    }
    return r3;
  }
  a(Xn, "_addListener");
  L3.prototype.addListener = a(function(e2, t2) {
    return Xn(this, e2, t2, false);
  }, "addListener");
  L3.prototype.on = L3.prototype.addListener;
  L3.prototype.prependListener = a(function(e2, t2) {
    return Xn(this, e2, t2, true);
  }, "prependListener");
  function Ho() {
    if (!this.fired)
      return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  a(
    Ho,
    "onceWrapper"
  );
  function ei(r3, e2, t2) {
    var n2 = {
      fired: false,
      wrapFn: void 0,
      target: r3,
      type: e2,
      listener: t2
    }, i4 = Ho.bind(n2);
    return i4.listener = t2, n2.wrapFn = i4, i4;
  }
  a(ei, "_onceWrap");
  L3.prototype.once = a(function(e2, t2) {
    return ct(t2), this.on(e2, ei(this, e2, t2)), this;
  }, "once");
  L3.prototype.prependOnceListener = a(function(e2, t2) {
    return ct(t2), this.prependListener(e2, ei(
      this,
      e2,
      t2
    )), this;
  }, "prependOnceListener");
  L3.prototype.removeListener = a(
    function(e2, t2) {
      var n2, i4, s3, o3, u4;
      if (ct(t2), i4 = this._events, i4 === void 0)
        return this;
      if (n2 = i4[e2], n2 === void 0)
        return this;
      if (n2 === t2 || n2.listener === t2)
        --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete i4[e2], i4.removeListener && this.emit("removeListener", e2, n2.listener || t2));
      else if (typeof n2 != "function") {
        for (s3 = -1, o3 = n2.length - 1; o3 >= 0; o3--)
          if (n2[o3] === t2 || n2[o3].listener === t2) {
            u4 = n2[o3].listener, s3 = o3;
            break;
          }
        if (s3 < 0)
          return this;
        s3 === 0 ? n2.shift() : Go(n2, s3), n2.length === 1 && (i4[e2] = n2[0]), i4.removeListener !== void 0 && this.emit("removeListener", e2, u4 || t2);
      }
      return this;
    },
    "removeListener"
  );
  L3.prototype.off = L3.prototype.removeListener;
  L3.prototype.removeAllListeners = a(function(e2) {
    var t2, n2, i4;
    if (n2 = this._events, n2 === void 0)
      return this;
    if (n2.removeListener === void 0)
      return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n2[e2] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n2[e2]), this;
    if (arguments.length === 0) {
      var s3 = Object.keys(n2), o3;
      for (i4 = 0; i4 < s3.length; ++i4)
        o3 = s3[i4], o3 !== "removeListener" && this.removeAllListeners(o3);
      return this.removeAllListeners(
        "removeListener"
      ), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (t2 = n2[e2], typeof t2 == "function")
      this.removeListener(e2, t2);
    else if (t2 !== void 0)
      for (i4 = t2.length - 1; i4 >= 0; i4--)
        this.removeListener(e2, t2[i4]);
    return this;
  }, "removeAllListeners");
  function ti(r3, e2, t2) {
    var n2 = r3._events;
    if (n2 === void 0)
      return [];
    var i4 = n2[e2];
    return i4 === void 0 ? [] : typeof i4 == "function" ? t2 ? [i4.listener || i4] : [i4] : t2 ? $o(i4) : ni(i4, i4.length);
  }
  a(ti, "_listeners");
  L3.prototype.listeners = a(function(e2) {
    return ti(this, e2, true);
  }, "listeners");
  L3.prototype.rawListeners = a(function(e2) {
    return ti(this, e2, false);
  }, "rawListeners");
  L3.listenerCount = function(r3, e2) {
    return typeof r3.listenerCount == "function" ? r3.listenerCount(e2) : ri.call(r3, e2);
  };
  L3.prototype.listenerCount = ri;
  function ri(r3) {
    var e2 = this._events;
    if (e2 !== void 0) {
      var t2 = e2[r3];
      if (typeof t2 == "function")
        return 1;
      if (t2 !== void 0)
        return t2.length;
    }
    return 0;
  }
  a(ri, "listenerCount");
  L3.prototype.eventNames = a(function() {
    return this._eventsCount > 0 ? ut(this._events) : [];
  }, "eventNames");
  function ni(r3, e2) {
    for (var t2 = new Array(e2), n2 = 0; n2 < e2; ++n2)
      t2[n2] = r3[n2];
    return t2;
  }
  a(ni, "arrayClone");
  function Go(r3, e2) {
    for (; e2 + 1 < r3.length; e2++)
      r3[e2] = r3[e2 + 1];
    r3.pop();
  }
  a(Go, "spliceOne");
  function $o(r3) {
    for (var e2 = new Array(r3.length), t2 = 0; t2 < e2.length; ++t2)
      e2[t2] = r3[t2].listener || r3[t2];
    return e2;
  }
  a($o, "unwrapListeners");
  function Vo(r3, e2) {
    return new Promise(
      function(t2, n2) {
        function i4(o3) {
          r3.removeListener(e2, s3), n2(o3);
        }
        a(i4, "errorListener");
        function s3() {
          typeof r3.removeListener == "function" && r3.removeListener("error", i4), t2([].slice.call(
            arguments
          ));
        }
        a(s3, "resolver"), ii(r3, e2, s3, { once: true }), e2 !== "error" && Ko(r3, i4, { once: true });
      }
    );
  }
  a(Vo, "once");
  function Ko(r3, e2, t2) {
    typeof r3.on == "function" && ii(r3, "error", e2, t2);
  }
  a(
    Ko,
    "addErrorHandlerIfEventEmitter"
  );
  function ii(r3, e2, t2, n2) {
    if (typeof r3.on == "function")
      n2.once ? r3.once(e2, t2) : r3.on(e2, t2);
    else if (typeof r3.addEventListener == "function")
      r3.addEventListener(
        e2,
        a(function i4(s3) {
          n2.once && r3.removeEventListener(e2, i4), t2(s3);
        }, "wrapListener")
      );
    else
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r3);
  }
  a(ii, "eventTargetAgnosticAddListener");
});
var He = {};
se(He, { default: () => zo });
var zo;
var Ge = z(() => {
  "use strict";
  p();
  zo = {};
});
function $e(r3) {
  let e2 = 1779033703, t2 = 3144134277, n2 = 1013904242, i4 = 2773480762, s3 = 1359893119, o3 = 2600822924, u4 = 528734635, c3 = 1541459225, h3 = 0, l3 = 0, d3 = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], b2 = a(
    (A3, g2) => A3 >>> g2 | A3 << 32 - g2,
    "rrot"
  ), C3 = new Uint32Array(64), B = new Uint8Array(64), Q = a(() => {
    for (let R = 0, $2 = 0; R < 16; R++, $2 += 4)
      C3[R] = B[$2] << 24 | B[$2 + 1] << 16 | B[$2 + 2] << 8 | B[$2 + 3];
    for (let R = 16; R < 64; R++) {
      let $2 = b2(C3[R - 15], 7) ^ b2(C3[R - 15], 18) ^ C3[R - 15] >>> 3, ce = b2(C3[R - 2], 17) ^ b2(C3[R - 2], 19) ^ C3[R - 2] >>> 10;
      C3[R] = C3[R - 16] + $2 + C3[R - 7] + ce | 0;
    }
    let A3 = e2, g2 = t2, P3 = n2, K = i4, k3 = s3, j3 = o3, ue = u4, ee = c3;
    for (let R = 0; R < 64; R++) {
      let $2 = b2(
        k3,
        6
      ) ^ b2(k3, 11) ^ b2(k3, 25), ce = k3 & j3 ^ ~k3 & ue, ye = ee + $2 + ce + d3[R] + C3[R] | 0, Se = b2(A3, 2) ^ b2(A3, 13) ^ b2(A3, 22), Ae = A3 & g2 ^ A3 & P3 ^ g2 & P3, he = Se + Ae | 0;
      ee = ue, ue = j3, j3 = k3, k3 = K + ye | 0, K = P3, P3 = g2, g2 = A3, A3 = ye + he | 0;
    }
    e2 = e2 + A3 | 0, t2 = t2 + g2 | 0, n2 = n2 + P3 | 0, i4 = i4 + K | 0, s3 = s3 + k3 | 0, o3 = o3 + j3 | 0, u4 = u4 + ue | 0, c3 = c3 + ee | 0, l3 = 0;
  }, "process"), X = a((A3) => {
    typeof A3 == "string" && (A3 = new TextEncoder().encode(A3));
    for (let g2 = 0; g2 < A3.length; g2++)
      B[l3++] = A3[g2], l3 === 64 && Q();
    h3 += A3.length;
  }, "add"), de = a(() => {
    if (B[l3++] = 128, l3 == 64 && Q(), l3 + 8 > 64) {
      for (; l3 < 64; )
        B[l3++] = 0;
      Q();
    }
    for (; l3 < 58; )
      B[l3++] = 0;
    let A3 = h3 * 8;
    B[l3++] = A3 / 1099511627776 & 255, B[l3++] = A3 / 4294967296 & 255, B[l3++] = A3 >>> 24, B[l3++] = A3 >>> 16 & 255, B[l3++] = A3 >>> 8 & 255, B[l3++] = A3 & 255, Q();
    let g2 = new Uint8Array(32);
    return g2[0] = e2 >>> 24, g2[1] = e2 >>> 16 & 255, g2[2] = e2 >>> 8 & 255, g2[3] = e2 & 255, g2[4] = t2 >>> 24, g2[5] = t2 >>> 16 & 255, g2[6] = t2 >>> 8 & 255, g2[7] = t2 & 255, g2[8] = n2 >>> 24, g2[9] = n2 >>> 16 & 255, g2[10] = n2 >>> 8 & 255, g2[11] = n2 & 255, g2[12] = i4 >>> 24, g2[13] = i4 >>> 16 & 255, g2[14] = i4 >>> 8 & 255, g2[15] = i4 & 255, g2[16] = s3 >>> 24, g2[17] = s3 >>> 16 & 255, g2[18] = s3 >>> 8 & 255, g2[19] = s3 & 255, g2[20] = o3 >>> 24, g2[21] = o3 >>> 16 & 255, g2[22] = o3 >>> 8 & 255, g2[23] = o3 & 255, g2[24] = u4 >>> 24, g2[25] = u4 >>> 16 & 255, g2[26] = u4 >>> 8 & 255, g2[27] = u4 & 255, g2[28] = c3 >>> 24, g2[29] = c3 >>> 16 & 255, g2[30] = c3 >>> 8 & 255, g2[31] = c3 & 255, g2;
  }, "digest");
  return r3 === void 0 ? { add: X, digest: de } : (X(r3), de());
}
var si = z(
  () => {
    "use strict";
    p();
    a($e, "sha256");
  }
);
var U;
var Ve;
var oi = z(() => {
  "use strict";
  p();
  U = class U3 {
    constructor() {
      _(
        this,
        "_dataLength",
        0
      );
      _(this, "_bufferLength", 0);
      _(this, "_state", new Int32Array(4));
      _(
        this,
        "_buffer",
        new ArrayBuffer(68)
      );
      _(this, "_buffer8");
      _(this, "_buffer32");
      this._buffer8 = new Uint8Array(
        this._buffer,
        0,
        68
      ), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
    }
    static hashByteArray(e2, t2 = false) {
      return this.onePassHasher.start().appendByteArray(e2).end(t2);
    }
    static hashStr(e2, t2 = false) {
      return this.onePassHasher.start().appendStr(e2).end(t2);
    }
    static hashAsciiStr(e2, t2 = false) {
      return this.onePassHasher.start().appendAsciiStr(e2).end(t2);
    }
    static _hex(e2) {
      let t2 = U3.hexChars, n2 = U3.hexOut, i4, s3, o3, u4;
      for (u4 = 0; u4 < 4; u4 += 1)
        for (s3 = u4 * 8, i4 = e2[u4], o3 = 0; o3 < 8; o3 += 2)
          n2[s3 + 1 + o3] = t2.charAt(i4 & 15), i4 >>>= 4, n2[s3 + 0 + o3] = t2.charAt(i4 & 15), i4 >>>= 4;
      return n2.join("");
    }
    static _md5cycle(e2, t2) {
      let n2 = e2[0], i4 = e2[1], s3 = e2[2], o3 = e2[3];
      n2 += (i4 & s3 | ~i4 & o3) + t2[0] - 680876936 | 0, n2 = (n2 << 7 | n2 >>> 25) + i4 | 0, o3 += (n2 & i4 | ~n2 & s3) + t2[1] - 389564586 | 0, o3 = (o3 << 12 | o3 >>> 20) + n2 | 0, s3 += (o3 & n2 | ~o3 & i4) + t2[2] + 606105819 | 0, s3 = (s3 << 17 | s3 >>> 15) + o3 | 0, i4 += (s3 & o3 | ~s3 & n2) + t2[3] - 1044525330 | 0, i4 = (i4 << 22 | i4 >>> 10) + s3 | 0, n2 += (i4 & s3 | ~i4 & o3) + t2[4] - 176418897 | 0, n2 = (n2 << 7 | n2 >>> 25) + i4 | 0, o3 += (n2 & i4 | ~n2 & s3) + t2[5] + 1200080426 | 0, o3 = (o3 << 12 | o3 >>> 20) + n2 | 0, s3 += (o3 & n2 | ~o3 & i4) + t2[6] - 1473231341 | 0, s3 = (s3 << 17 | s3 >>> 15) + o3 | 0, i4 += (s3 & o3 | ~s3 & n2) + t2[7] - 45705983 | 0, i4 = (i4 << 22 | i4 >>> 10) + s3 | 0, n2 += (i4 & s3 | ~i4 & o3) + t2[8] + 1770035416 | 0, n2 = (n2 << 7 | n2 >>> 25) + i4 | 0, o3 += (n2 & i4 | ~n2 & s3) + t2[9] - 1958414417 | 0, o3 = (o3 << 12 | o3 >>> 20) + n2 | 0, s3 += (o3 & n2 | ~o3 & i4) + t2[10] - 42063 | 0, s3 = (s3 << 17 | s3 >>> 15) + o3 | 0, i4 += (s3 & o3 | ~s3 & n2) + t2[11] - 1990404162 | 0, i4 = (i4 << 22 | i4 >>> 10) + s3 | 0, n2 += (i4 & s3 | ~i4 & o3) + t2[12] + 1804603682 | 0, n2 = (n2 << 7 | n2 >>> 25) + i4 | 0, o3 += (n2 & i4 | ~n2 & s3) + t2[13] - 40341101 | 0, o3 = (o3 << 12 | o3 >>> 20) + n2 | 0, s3 += (o3 & n2 | ~o3 & i4) + t2[14] - 1502002290 | 0, s3 = (s3 << 17 | s3 >>> 15) + o3 | 0, i4 += (s3 & o3 | ~s3 & n2) + t2[15] + 1236535329 | 0, i4 = (i4 << 22 | i4 >>> 10) + s3 | 0, n2 += (i4 & o3 | s3 & ~o3) + t2[1] - 165796510 | 0, n2 = (n2 << 5 | n2 >>> 27) + i4 | 0, o3 += (n2 & s3 | i4 & ~s3) + t2[6] - 1069501632 | 0, o3 = (o3 << 9 | o3 >>> 23) + n2 | 0, s3 += (o3 & i4 | n2 & ~i4) + t2[11] + 643717713 | 0, s3 = (s3 << 14 | s3 >>> 18) + o3 | 0, i4 += (s3 & n2 | o3 & ~n2) + t2[0] - 373897302 | 0, i4 = (i4 << 20 | i4 >>> 12) + s3 | 0, n2 += (i4 & o3 | s3 & ~o3) + t2[5] - 701558691 | 0, n2 = (n2 << 5 | n2 >>> 27) + i4 | 0, o3 += (n2 & s3 | i4 & ~s3) + t2[10] + 38016083 | 0, o3 = (o3 << 9 | o3 >>> 23) + n2 | 0, s3 += (o3 & i4 | n2 & ~i4) + t2[15] - 660478335 | 0, s3 = (s3 << 14 | s3 >>> 18) + o3 | 0, i4 += (s3 & n2 | o3 & ~n2) + t2[4] - 405537848 | 0, i4 = (i4 << 20 | i4 >>> 12) + s3 | 0, n2 += (i4 & o3 | s3 & ~o3) + t2[9] + 568446438 | 0, n2 = (n2 << 5 | n2 >>> 27) + i4 | 0, o3 += (n2 & s3 | i4 & ~s3) + t2[14] - 1019803690 | 0, o3 = (o3 << 9 | o3 >>> 23) + n2 | 0, s3 += (o3 & i4 | n2 & ~i4) + t2[3] - 187363961 | 0, s3 = (s3 << 14 | s3 >>> 18) + o3 | 0, i4 += (s3 & n2 | o3 & ~n2) + t2[8] + 1163531501 | 0, i4 = (i4 << 20 | i4 >>> 12) + s3 | 0, n2 += (i4 & o3 | s3 & ~o3) + t2[13] - 1444681467 | 0, n2 = (n2 << 5 | n2 >>> 27) + i4 | 0, o3 += (n2 & s3 | i4 & ~s3) + t2[2] - 51403784 | 0, o3 = (o3 << 9 | o3 >>> 23) + n2 | 0, s3 += (o3 & i4 | n2 & ~i4) + t2[7] + 1735328473 | 0, s3 = (s3 << 14 | s3 >>> 18) + o3 | 0, i4 += (s3 & n2 | o3 & ~n2) + t2[12] - 1926607734 | 0, i4 = (i4 << 20 | i4 >>> 12) + s3 | 0, n2 += (i4 ^ s3 ^ o3) + t2[5] - 378558 | 0, n2 = (n2 << 4 | n2 >>> 28) + i4 | 0, o3 += (n2 ^ i4 ^ s3) + t2[8] - 2022574463 | 0, o3 = (o3 << 11 | o3 >>> 21) + n2 | 0, s3 += (o3 ^ n2 ^ i4) + t2[11] + 1839030562 | 0, s3 = (s3 << 16 | s3 >>> 16) + o3 | 0, i4 += (s3 ^ o3 ^ n2) + t2[14] - 35309556 | 0, i4 = (i4 << 23 | i4 >>> 9) + s3 | 0, n2 += (i4 ^ s3 ^ o3) + t2[1] - 1530992060 | 0, n2 = (n2 << 4 | n2 >>> 28) + i4 | 0, o3 += (n2 ^ i4 ^ s3) + t2[4] + 1272893353 | 0, o3 = (o3 << 11 | o3 >>> 21) + n2 | 0, s3 += (o3 ^ n2 ^ i4) + t2[7] - 155497632 | 0, s3 = (s3 << 16 | s3 >>> 16) + o3 | 0, i4 += (s3 ^ o3 ^ n2) + t2[10] - 1094730640 | 0, i4 = (i4 << 23 | i4 >>> 9) + s3 | 0, n2 += (i4 ^ s3 ^ o3) + t2[13] + 681279174 | 0, n2 = (n2 << 4 | n2 >>> 28) + i4 | 0, o3 += (n2 ^ i4 ^ s3) + t2[0] - 358537222 | 0, o3 = (o3 << 11 | o3 >>> 21) + n2 | 0, s3 += (o3 ^ n2 ^ i4) + t2[3] - 722521979 | 0, s3 = (s3 << 16 | s3 >>> 16) + o3 | 0, i4 += (s3 ^ o3 ^ n2) + t2[6] + 76029189 | 0, i4 = (i4 << 23 | i4 >>> 9) + s3 | 0, n2 += (i4 ^ s3 ^ o3) + t2[9] - 640364487 | 0, n2 = (n2 << 4 | n2 >>> 28) + i4 | 0, o3 += (n2 ^ i4 ^ s3) + t2[12] - 421815835 | 0, o3 = (o3 << 11 | o3 >>> 21) + n2 | 0, s3 += (o3 ^ n2 ^ i4) + t2[15] + 530742520 | 0, s3 = (s3 << 16 | s3 >>> 16) + o3 | 0, i4 += (s3 ^ o3 ^ n2) + t2[2] - 995338651 | 0, i4 = (i4 << 23 | i4 >>> 9) + s3 | 0, n2 += (s3 ^ (i4 | ~o3)) + t2[0] - 198630844 | 0, n2 = (n2 << 6 | n2 >>> 26) + i4 | 0, o3 += (i4 ^ (n2 | ~s3)) + t2[7] + 1126891415 | 0, o3 = (o3 << 10 | o3 >>> 22) + n2 | 0, s3 += (n2 ^ (o3 | ~i4)) + t2[14] - 1416354905 | 0, s3 = (s3 << 15 | s3 >>> 17) + o3 | 0, i4 += (o3 ^ (s3 | ~n2)) + t2[5] - 57434055 | 0, i4 = (i4 << 21 | i4 >>> 11) + s3 | 0, n2 += (s3 ^ (i4 | ~o3)) + t2[12] + 1700485571 | 0, n2 = (n2 << 6 | n2 >>> 26) + i4 | 0, o3 += (i4 ^ (n2 | ~s3)) + t2[3] - 1894986606 | 0, o3 = (o3 << 10 | o3 >>> 22) + n2 | 0, s3 += (n2 ^ (o3 | ~i4)) + t2[10] - 1051523 | 0, s3 = (s3 << 15 | s3 >>> 17) + o3 | 0, i4 += (o3 ^ (s3 | ~n2)) + t2[1] - 2054922799 | 0, i4 = (i4 << 21 | i4 >>> 11) + s3 | 0, n2 += (s3 ^ (i4 | ~o3)) + t2[8] + 1873313359 | 0, n2 = (n2 << 6 | n2 >>> 26) + i4 | 0, o3 += (i4 ^ (n2 | ~s3)) + t2[15] - 30611744 | 0, o3 = (o3 << 10 | o3 >>> 22) + n2 | 0, s3 += (n2 ^ (o3 | ~i4)) + t2[6] - 1560198380 | 0, s3 = (s3 << 15 | s3 >>> 17) + o3 | 0, i4 += (o3 ^ (s3 | ~n2)) + t2[13] + 1309151649 | 0, i4 = (i4 << 21 | i4 >>> 11) + s3 | 0, n2 += (s3 ^ (i4 | ~o3)) + t2[4] - 145523070 | 0, n2 = (n2 << 6 | n2 >>> 26) + i4 | 0, o3 += (i4 ^ (n2 | ~s3)) + t2[11] - 1120210379 | 0, o3 = (o3 << 10 | o3 >>> 22) + n2 | 0, s3 += (n2 ^ (o3 | ~i4)) + t2[2] + 718787259 | 0, s3 = (s3 << 15 | s3 >>> 17) + o3 | 0, i4 += (o3 ^ (s3 | ~n2)) + t2[9] - 343485551 | 0, i4 = (i4 << 21 | i4 >>> 11) + s3 | 0, e2[0] = n2 + e2[0] | 0, e2[1] = i4 + e2[1] | 0, e2[2] = s3 + e2[2] | 0, e2[3] = o3 + e2[3] | 0;
    }
    start() {
      return this._dataLength = 0, this._bufferLength = 0, this._state.set(U3.stateIdentity), this;
    }
    appendStr(e2) {
      let t2 = this._buffer8, n2 = this._buffer32, i4 = this._bufferLength, s3, o3;
      for (o3 = 0; o3 < e2.length; o3 += 1) {
        if (s3 = e2.charCodeAt(o3), s3 < 128)
          t2[i4++] = s3;
        else if (s3 < 2048)
          t2[i4++] = (s3 >>> 6) + 192, t2[i4++] = s3 & 63 | 128;
        else if (s3 < 55296 || s3 > 56319)
          t2[i4++] = (s3 >>> 12) + 224, t2[i4++] = s3 >>> 6 & 63 | 128, t2[i4++] = s3 & 63 | 128;
        else {
          if (s3 = (s3 - 55296) * 1024 + (e2.charCodeAt(++o3) - 56320) + 65536, s3 > 1114111)
            throw new Error("Unicode standard supports code points up to U+10FFFF");
          t2[i4++] = (s3 >>> 18) + 240, t2[i4++] = s3 >>> 12 & 63 | 128, t2[i4++] = s3 >>> 6 & 63 | 128, t2[i4++] = s3 & 63 | 128;
        }
        i4 >= 64 && (this._dataLength += 64, U3._md5cycle(this._state, n2), i4 -= 64, n2[0] = n2[16]);
      }
      return this._bufferLength = i4, this;
    }
    appendAsciiStr(e2) {
      let t2 = this._buffer8, n2 = this._buffer32, i4 = this._bufferLength, s3, o3 = 0;
      for (; ; ) {
        for (s3 = Math.min(e2.length - o3, 64 - i4); s3--; )
          t2[i4++] = e2.charCodeAt(o3++);
        if (i4 < 64)
          break;
        this._dataLength += 64, U3._md5cycle(
          this._state,
          n2
        ), i4 = 0;
      }
      return this._bufferLength = i4, this;
    }
    appendByteArray(e2) {
      let t2 = this._buffer8, n2 = this._buffer32, i4 = this._bufferLength, s3, o3 = 0;
      for (; ; ) {
        for (s3 = Math.min(e2.length - o3, 64 - i4); s3--; )
          t2[i4++] = e2[o3++];
        if (i4 < 64)
          break;
        this._dataLength += 64, U3._md5cycle(
          this._state,
          n2
        ), i4 = 0;
      }
      return this._bufferLength = i4, this;
    }
    getState() {
      let e2 = this._state;
      return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e2[0], e2[1], e2[2], e2[3]] };
    }
    setState(e2) {
      let t2 = e2.buffer, n2 = e2.state, i4 = this._state, s3;
      for (this._dataLength = e2.length, this._bufferLength = e2.buflen, i4[0] = n2[0], i4[1] = n2[1], i4[2] = n2[2], i4[3] = n2[3], s3 = 0; s3 < t2.length; s3 += 1)
        this._buffer8[s3] = t2.charCodeAt(s3);
    }
    end(e2 = false) {
      let t2 = this._bufferLength, n2 = this._buffer8, i4 = this._buffer32, s3 = (t2 >> 2) + 1;
      this._dataLength += t2;
      let o3 = this._dataLength * 8;
      if (n2[t2] = 128, n2[t2 + 1] = n2[t2 + 2] = n2[t2 + 3] = 0, i4.set(U3.buffer32Identity.subarray(s3), s3), t2 > 55 && (U3._md5cycle(this._state, i4), i4.set(U3.buffer32Identity)), o3 <= 4294967295)
        i4[14] = o3;
      else {
        let u4 = o3.toString(16).match(/(.*?)(.{0,8})$/);
        if (u4 === null)
          return;
        let c3 = parseInt(
          u4[2],
          16
        ), h3 = parseInt(u4[1], 16) || 0;
        i4[14] = c3, i4[15] = h3;
      }
      return U3._md5cycle(this._state, i4), e2 ? this._state : U3._hex(this._state);
    }
  };
  a(U, "Md5"), _(U, "stateIdentity", new Int32Array(
    [1732584193, -271733879, -1732584194, 271733878]
  )), _(U, "buffer32Identity", new Int32Array(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  )), _(U, "hexChars", "0123456789abcdef"), _(U, "hexOut", []), _(U, "onePassHasher", new U());
  Ve = U;
});
var Wt = {};
se(Wt, { createHash: () => Zo, createHmac: () => Jo, randomBytes: () => Yo });
function Yo(r3) {
  return w.getRandomValues(y.alloc(r3));
}
function Zo(r3) {
  if (r3 === "sha256")
    return { update: a(
      function(e2) {
        return { digest: a(function() {
          return y.from($e(e2));
        }, "digest") };
      },
      "update"
    ) };
  if (r3 === "md5")
    return { update: a(function(e2) {
      return { digest: a(function() {
        return typeof e2 == "string" ? Ve.hashStr(e2) : Ve.hashByteArray(e2);
      }, "digest") };
    }, "update") };
  throw new Error(
    `Hash type '${r3}' not supported`
  );
}
function Jo(r3, e2) {
  if (r3 !== "sha256")
    throw new Error(
      `Only sha256 is supported (requested: '${r3}')`
    );
  return { update: a(function(t2) {
    return {
      digest: a(function() {
        typeof e2 == "string" && (e2 = new TextEncoder().encode(e2)), typeof t2 == "string" && (t2 = new TextEncoder().encode(t2));
        let n2 = e2.length;
        if (n2 > 64)
          e2 = $e(e2);
        else if (n2 < 64) {
          let c3 = new Uint8Array(64);
          c3.set(e2), e2 = c3;
        }
        let i4 = new Uint8Array(64), s3 = new Uint8Array(
          64
        );
        for (let c3 = 0; c3 < 64; c3++)
          i4[c3] = 54 ^ e2[c3], s3[c3] = 92 ^ e2[c3];
        let o3 = new Uint8Array(t2.length + 64);
        o3.set(i4, 0), o3.set(t2, 64);
        let u4 = new Uint8Array(96);
        return u4.set(s3, 0), u4.set(
          $e(o3),
          64
        ), y.from($e(u4));
      }, "digest")
    };
  }, "update") };
}
var Ht = z(() => {
  "use strict";
  p();
  si();
  oi();
  a(Yo, "randomBytes");
  a(Zo, "createHash");
  a(Jo, "createHmac");
});
var $t = I((ai) => {
  "use strict";
  p();
  ai.parse = function(r3, e2) {
    return new Gt(r3, e2).parse();
  };
  var ht = class ht2 {
    constructor(e2, t2) {
      this.source = e2, this.transform = t2 || Xo, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var e2 = this.source[this.position++];
      return e2 === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e2, escaped: false };
    }
    record(e2) {
      this.recorded.push(e2);
    }
    newEntry(e2) {
      var t2;
      (this.recorded.length > 0 || e2) && (t2 = this.recorded.join(""), t2 === "NULL" && !e2 && (t2 = null), t2 !== null && (t2 = this.transform(t2)), this.entries.push(
        t2
      ), this.recorded = []);
    }
    consumeDimensions() {
      if (this.source[0] === "[")
        for (; !this.isEof(); ) {
          var e2 = this.nextCharacter();
          if (e2.value === "=")
            break;
        }
    }
    parse(e2) {
      var t2, n2, i4;
      for (this.consumeDimensions(); !this.isEof(); )
        if (t2 = this.nextCharacter(), t2.value === "{" && !i4)
          this.dimension++, this.dimension > 1 && (n2 = new ht2(this.source.substr(this.position - 1), this.transform), this.entries.push(
            n2.parse(true)
          ), this.position += n2.position - 2);
        else if (t2.value === "}" && !i4) {
          if (this.dimension--, !this.dimension && (this.newEntry(), e2))
            return this.entries;
        } else
          t2.value === '"' && !t2.escaped ? (i4 && this.newEntry(true), i4 = !i4) : t2.value === "," && !i4 ? this.newEntry() : this.record(
            t2.value
          );
      if (this.dimension !== 0)
        throw new Error("array dimension not balanced");
      return this.entries;
    }
  };
  a(ht, "ArrayParser");
  var Gt = ht;
  function Xo(r3) {
    return r3;
  }
  a(Xo, "identity");
});
var Vt = I((bh, ui) => {
  p();
  var ea = $t();
  ui.exports = { create: a(function(r3, e2) {
    return { parse: a(
      function() {
        return ea.parse(r3, e2);
      },
      "parse"
    ) };
  }, "create") };
});
var li = I((vh, hi) => {
  "use strict";
  p();
  var ta = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, ra = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, na = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, ia = /^-?infinity$/;
  hi.exports = a(function(e2) {
    if (ia.test(e2))
      return Number(e2.replace("i", "I"));
    var t2 = ta.exec(e2);
    if (!t2)
      return sa(e2) || null;
    var n2 = !!t2[8], i4 = parseInt(t2[1], 10);
    n2 && (i4 = ci(i4));
    var s3 = parseInt(
      t2[2],
      10
    ) - 1, o3 = t2[3], u4 = parseInt(t2[4], 10), c3 = parseInt(t2[5], 10), h3 = parseInt(t2[6], 10), l3 = t2[7];
    l3 = l3 ? 1e3 * parseFloat(l3) : 0;
    var d3, b2 = oa(e2);
    return b2 != null ? (d3 = new Date(Date.UTC(
      i4,
      s3,
      o3,
      u4,
      c3,
      h3,
      l3
    )), Kt(i4) && d3.setUTCFullYear(i4), b2 !== 0 && d3.setTime(d3.getTime() - b2)) : (d3 = new Date(
      i4,
      s3,
      o3,
      u4,
      c3,
      h3,
      l3
    ), Kt(i4) && d3.setFullYear(i4)), d3;
  }, "parseDate");
  function sa(r3) {
    var e2 = ra.exec(r3);
    if (e2) {
      var t2 = parseInt(e2[1], 10), n2 = !!e2[4];
      n2 && (t2 = ci(t2));
      var i4 = parseInt(
        e2[2],
        10
      ) - 1, s3 = e2[3], o3 = new Date(t2, i4, s3);
      return Kt(t2) && o3.setFullYear(t2), o3;
    }
  }
  a(sa, "getDate");
  function oa(r3) {
    if (r3.endsWith("+00"))
      return 0;
    var e2 = na.exec(r3.split(" ")[1]);
    if (e2) {
      var t2 = e2[1];
      if (t2 === "Z")
        return 0;
      var n2 = t2 === "-" ? -1 : 1, i4 = parseInt(e2[2], 10) * 3600 + parseInt(
        e2[3] || 0,
        10
      ) * 60 + parseInt(e2[4] || 0, 10);
      return i4 * n2 * 1e3;
    }
  }
  a(oa, "timeZoneOffset");
  function ci(r3) {
    return -(r3 - 1);
  }
  a(ci, "bcYearToNegativeYear");
  function Kt(r3) {
    return r3 >= 0 && r3 < 100;
  }
  a(
    Kt,
    "is0To99"
  );
});
var pi = I((Ah, fi) => {
  p();
  fi.exports = ua;
  var aa = Object.prototype.hasOwnProperty;
  function ua(r3) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var t2 = arguments[e2];
      for (var n2 in t2)
        aa.call(
          t2,
          n2
        ) && (r3[n2] = t2[n2]);
    }
    return r3;
  }
  a(ua, "extend");
});
var mi = I((Ih, yi) => {
  "use strict";
  p();
  var ca = pi();
  yi.exports = Me;
  function Me(r3) {
    if (!(this instanceof Me))
      return new Me(r3);
    ca(this, Ea(r3));
  }
  a(Me, "PostgresInterval");
  var ha = ["seconds", "minutes", "hours", "days", "months", "years"];
  Me.prototype.toPostgres = function() {
    var r3 = ha.filter(this.hasOwnProperty, this);
    return this.milliseconds && r3.indexOf("seconds") < 0 && r3.push("seconds"), r3.length === 0 ? "0" : r3.map(function(e2) {
      var t2 = this[e2] || 0;
      return e2 === "seconds" && this.milliseconds && (t2 = (t2 + this.milliseconds / 1e3).toFixed(6).replace(
        /\.?0+$/,
        ""
      )), t2 + " " + e2;
    }, this).join(" ");
  };
  var la = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, fa = ["years", "months", "days"], pa = ["hours", "minutes", "seconds"];
  Me.prototype.toISOString = Me.prototype.toISO = function() {
    var r3 = fa.map(t2, this).join(""), e2 = pa.map(t2, this).join("");
    return "P" + r3 + "T" + e2;
    function t2(n2) {
      var i4 = this[n2] || 0;
      return n2 === "seconds" && this.milliseconds && (i4 = (i4 + this.milliseconds / 1e3).toFixed(6).replace(
        /0+$/,
        ""
      )), i4 + la[n2];
    }
  };
  var zt = "([+-]?\\d+)", da = zt + "\\s+years?", ya = zt + "\\s+mons?", ma = zt + "\\s+days?", ga = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", wa = new RegExp([
    da,
    ya,
    ma,
    ga
  ].map(function(r3) {
    return "(" + r3 + ")?";
  }).join("\\s*")), di = {
    years: 2,
    months: 4,
    days: 6,
    hours: 9,
    minutes: 10,
    seconds: 11,
    milliseconds: 12
  }, ba = ["hours", "minutes", "seconds", "milliseconds"];
  function Sa(r3) {
    var e2 = r3 + "000000".slice(r3.length);
    return parseInt(
      e2,
      10
    ) / 1e3;
  }
  a(Sa, "parseMilliseconds");
  function Ea(r3) {
    if (!r3)
      return {};
    var e2 = wa.exec(
      r3
    ), t2 = e2[8] === "-";
    return Object.keys(di).reduce(function(n2, i4) {
      var s3 = di[i4], o3 = e2[s3];
      return !o3 || (o3 = i4 === "milliseconds" ? Sa(o3) : parseInt(o3, 10), !o3) || (t2 && ~ba.indexOf(i4) && (o3 *= -1), n2[i4] = o3), n2;
    }, {});
  }
  a(Ea, "parse");
});
var wi = I((Lh, gi) => {
  "use strict";
  p();
  gi.exports = a(function(e2) {
    if (/^\\x/.test(e2))
      return new y(
        e2.substr(2),
        "hex"
      );
    for (var t2 = "", n2 = 0; n2 < e2.length; )
      if (e2[n2] !== "\\")
        t2 += e2[n2], ++n2;
      else if (/[0-7]{3}/.test(e2.substr(n2 + 1, 3)))
        t2 += String.fromCharCode(parseInt(e2.substr(n2 + 1, 3), 8)), n2 += 4;
      else {
        for (var i4 = 1; n2 + i4 < e2.length && e2[n2 + i4] === "\\"; )
          i4++;
        for (var s3 = 0; s3 < Math.floor(i4 / 2); ++s3)
          t2 += "\\";
        n2 += Math.floor(i4 / 2) * 2;
      }
    return new y(t2, "binary");
  }, "parseBytea");
});
var Ai = I((Mh, _i) => {
  p();
  var Ke = $t(), ze = Vt(), lt2 = li(), Si = mi(), Ei = wi();
  function ft(r3) {
    return a(function(t2) {
      return t2 === null ? t2 : r3(t2);
    }, "nullAllowed");
  }
  a(ft, "allowNull");
  function vi(r3) {
    return r3 === null ? r3 : r3 === "TRUE" || r3 === "t" || r3 === "true" || r3 === "y" || r3 === "yes" || r3 === "on" || r3 === "1";
  }
  a(vi, "parseBool");
  function va(r3) {
    return r3 ? Ke.parse(r3, vi) : null;
  }
  a(va, "parseBoolArray");
  function xa(r3) {
    return parseInt(r3, 10);
  }
  a(xa, "parseBaseTenInt");
  function Yt(r3) {
    return r3 ? Ke.parse(r3, ft(xa)) : null;
  }
  a(Yt, "parseIntegerArray");
  function _a150(r3) {
    return r3 ? Ke.parse(r3, ft(function(e2) {
      return xi(e2).trim();
    })) : null;
  }
  a(_a150, "parseBigIntegerArray");
  var Aa = a(function(r3) {
    if (!r3)
      return null;
    var e2 = ze.create(r3, function(t2) {
      return t2 !== null && (t2 = er(t2)), t2;
    });
    return e2.parse();
  }, "parsePointArray"), Zt = a(function(r3) {
    if (!r3)
      return null;
    var e2 = ze.create(r3, function(t2) {
      return t2 !== null && (t2 = parseFloat(t2)), t2;
    });
    return e2.parse();
  }, "parseFloatArray"), ne2 = a(function(r3) {
    if (!r3)
      return null;
    var e2 = ze.create(r3);
    return e2.parse();
  }, "parseStringArray"), Jt = a(function(r3) {
    if (!r3)
      return null;
    var e2 = ze.create(r3, function(t2) {
      return t2 !== null && (t2 = lt2(t2)), t2;
    });
    return e2.parse();
  }, "parseDateArray"), Ca = a(function(r3) {
    if (!r3)
      return null;
    var e2 = ze.create(r3, function(t2) {
      return t2 !== null && (t2 = Si(t2)), t2;
    });
    return e2.parse();
  }, "parseIntervalArray"), Ta = a(function(r3) {
    return r3 ? Ke.parse(r3, ft(Ei)) : null;
  }, "parseByteAArray"), Xt = a(function(r3) {
    return parseInt(
      r3,
      10
    );
  }, "parseInteger"), xi = a(function(r3) {
    var e2 = String(r3);
    return /^\d+$/.test(e2) ? e2 : r3;
  }, "parseBigInteger"), bi = a(
    function(r3) {
      return r3 ? Ke.parse(r3, ft(JSON.parse)) : null;
    },
    "parseJsonArray"
  ), er = a(function(r3) {
    return r3[0] !== "(" ? null : (r3 = r3.substring(1, r3.length - 1).split(","), { x: parseFloat(r3[0]), y: parseFloat(r3[1]) });
  }, "parsePoint"), Ia = a(function(r3) {
    if (r3[0] !== "<" && r3[1] !== "(")
      return null;
    for (var e2 = "(", t2 = "", n2 = false, i4 = 2; i4 < r3.length - 1; i4++) {
      if (n2 || (e2 += r3[i4]), r3[i4] === ")") {
        n2 = true;
        continue;
      } else if (!n2)
        continue;
      r3[i4] !== "," && (t2 += r3[i4]);
    }
    var s3 = er(e2);
    return s3.radius = parseFloat(t2), s3;
  }, "parseCircle"), Pa = a(function(r3) {
    r3(
      20,
      xi
    ), r3(21, Xt), r3(23, Xt), r3(26, Xt), r3(700, parseFloat), r3(701, parseFloat), r3(16, vi), r3(
      1082,
      lt2
    ), r3(1114, lt2), r3(1184, lt2), r3(600, er), r3(651, ne2), r3(718, Ia), r3(1e3, va), r3(1001, Ta), r3(
      1005,
      Yt
    ), r3(1007, Yt), r3(1028, Yt), r3(1016, _a150), r3(1017, Aa), r3(1021, Zt), r3(1022, Zt), r3(1231, Zt), r3(1014, ne2), r3(1015, ne2), r3(1008, ne2), r3(1009, ne2), r3(1040, ne2), r3(1041, ne2), r3(1115, Jt), r3(
      1182,
      Jt
    ), r3(1185, Jt), r3(1186, Si), r3(1187, Ca), r3(17, Ei), r3(114, JSON.parse.bind(JSON)), r3(
      3802,
      JSON.parse.bind(JSON)
    ), r3(199, bi), r3(3807, bi), r3(3907, ne2), r3(2951, ne2), r3(791, ne2), r3(
      1183,
      ne2
    ), r3(1270, ne2);
  }, "init");
  _i.exports = { init: Pa };
});
var Ti = I((Uh, Ci) => {
  "use strict";
  p();
  var Z2 = 1e6;
  function Ba(r3) {
    var e2 = r3.readInt32BE(
      0
    ), t2 = r3.readUInt32BE(4), n2 = "";
    e2 < 0 && (e2 = ~e2 + (t2 === 0), t2 = ~t2 + 1 >>> 0, n2 = "-");
    var i4 = "", s3, o3, u4, c3, h3, l3;
    {
      if (s3 = e2 % Z2, e2 = e2 / Z2 >>> 0, o3 = 4294967296 * s3 + t2, t2 = o3 / Z2 >>> 0, u4 = "" + (o3 - Z2 * t2), t2 === 0 && e2 === 0)
        return n2 + u4 + i4;
      for (c3 = "", h3 = 6 - u4.length, l3 = 0; l3 < h3; l3++)
        c3 += "0";
      i4 = c3 + u4 + i4;
    }
    {
      if (s3 = e2 % Z2, e2 = e2 / Z2 >>> 0, o3 = 4294967296 * s3 + t2, t2 = o3 / Z2 >>> 0, u4 = "" + (o3 - Z2 * t2), t2 === 0 && e2 === 0)
        return n2 + u4 + i4;
      for (c3 = "", h3 = 6 - u4.length, l3 = 0; l3 < h3; l3++)
        c3 += "0";
      i4 = c3 + u4 + i4;
    }
    {
      if (s3 = e2 % Z2, e2 = e2 / Z2 >>> 0, o3 = 4294967296 * s3 + t2, t2 = o3 / Z2 >>> 0, u4 = "" + (o3 - Z2 * t2), t2 === 0 && e2 === 0)
        return n2 + u4 + i4;
      for (c3 = "", h3 = 6 - u4.length, l3 = 0; l3 < h3; l3++)
        c3 += "0";
      i4 = c3 + u4 + i4;
    }
    return s3 = e2 % Z2, o3 = 4294967296 * s3 + t2, u4 = "" + o3 % Z2, n2 + u4 + i4;
  }
  a(Ba, "readInt8");
  Ci.exports = Ba;
});
var Ri = I((qh, Li) => {
  p();
  var La = Ti(), F2 = a(function(r3, e2, t2, n2, i4) {
    t2 = t2 || 0, n2 = n2 || false, i4 = i4 || function(C3, B, Q) {
      return C3 * Math.pow(2, Q) + B;
    };
    var s3 = t2 >> 3, o3 = a(function(C3) {
      return n2 ? ~C3 & 255 : C3;
    }, "inv"), u4 = 255, c3 = 8 - t2 % 8;
    e2 < c3 && (u4 = 255 << 8 - e2 & 255, c3 = e2), t2 && (u4 = u4 >> t2 % 8);
    var h3 = 0;
    t2 % 8 + e2 >= 8 && (h3 = i4(0, o3(r3[s3]) & u4, c3));
    for (var l3 = e2 + t2 >> 3, d3 = s3 + 1; d3 < l3; d3++)
      h3 = i4(h3, o3(r3[d3]), 8);
    var b2 = (e2 + t2) % 8;
    return b2 > 0 && (h3 = i4(h3, o3(r3[l3]) >> 8 - b2, b2)), h3;
  }, "parseBits"), Bi = a(function(r3, e2, t2) {
    var n2 = Math.pow(2, t2 - 1) - 1, i4 = F2(r3, 1), s3 = F2(r3, t2, 1);
    if (s3 === 0)
      return 0;
    var o3 = 1, u4 = a(function(h3, l3, d3) {
      h3 === 0 && (h3 = 1);
      for (var b2 = 1; b2 <= d3; b2++)
        o3 /= 2, (l3 & 1 << d3 - b2) > 0 && (h3 += o3);
      return h3;
    }, "parsePrecisionBits"), c3 = F2(r3, e2, t2 + 1, false, u4);
    return s3 == Math.pow(2, t2 + 1) - 1 ? c3 === 0 ? i4 === 0 ? 1 / 0 : -1 / 0 : NaN : (i4 === 0 ? 1 : -1) * Math.pow(2, s3 - n2) * c3;
  }, "parseFloatFromBits"), Ra = a(function(r3) {
    return F2(r3, 1) == 1 ? -1 * (F2(r3, 15, 1, true) + 1) : F2(r3, 15, 1);
  }, "parseInt16"), Ii = a(function(r3) {
    return F2(r3, 1) == 1 ? -1 * (F2(
      r3,
      31,
      1,
      true
    ) + 1) : F2(r3, 31, 1);
  }, "parseInt32"), Fa = a(function(r3) {
    return Bi(r3, 23, 8);
  }, "parseFloat32"), Ma = a(function(r3) {
    return Bi(r3, 52, 11);
  }, "parseFloat64"), Da = a(function(r3) {
    var e2 = F2(r3, 16, 32);
    if (e2 == 49152)
      return NaN;
    for (var t2 = Math.pow(1e4, F2(r3, 16, 16)), n2 = 0, i4 = [], s3 = F2(r3, 16), o3 = 0; o3 < s3; o3++)
      n2 += F2(r3, 16, 64 + 16 * o3) * t2, t2 /= 1e4;
    var u4 = Math.pow(10, F2(r3, 16, 48));
    return (e2 === 0 ? 1 : -1) * Math.round(n2 * u4) / u4;
  }, "parseNumeric"), Pi = a(function(r3, e2) {
    var t2 = F2(
      e2,
      1
    ), n2 = F2(e2, 63, 1), i4 = new Date((t2 === 0 ? 1 : -1) * n2 / 1e3 + 9466848e5);
    return r3 || i4.setTime(i4.getTime() + i4.getTimezoneOffset() * 6e4), i4.usec = n2 % 1e3, i4.getMicroSeconds = function() {
      return this.usec;
    }, i4.setMicroSeconds = function(s3) {
      this.usec = s3;
    }, i4.getUTCMicroSeconds = function() {
      return this.usec;
    }, i4;
  }, "parseDate"), Ye = a(function(r3) {
    for (var e2 = F2(r3, 32), t2 = F2(r3, 32, 32), n2 = F2(r3, 32, 64), i4 = 96, s3 = [], o3 = 0; o3 < e2; o3++)
      s3[o3] = F2(r3, 32, i4), i4 += 32, i4 += 32;
    var u4 = a(function(h3) {
      var l3 = F2(r3, 32, i4);
      if (i4 += 32, l3 == 4294967295)
        return null;
      var d3;
      if (h3 == 23 || h3 == 20)
        return d3 = F2(r3, l3 * 8, i4), i4 += l3 * 8, d3;
      if (h3 == 25)
        return d3 = r3.toString(this.encoding, i4 >> 3, (i4 += l3 << 3) >> 3), d3;
      console.log("ERROR: ElementType not implemented: " + h3);
    }, "parseElement"), c3 = a(function(h3, l3) {
      var d3 = [], b2;
      if (h3.length > 1) {
        var C3 = h3.shift();
        for (b2 = 0; b2 < C3; b2++)
          d3[b2] = c3(h3, l3);
        h3.unshift(
          C3
        );
      } else
        for (b2 = 0; b2 < h3[0]; b2++)
          d3[b2] = u4(l3);
      return d3;
    }, "parse");
    return c3(s3, n2);
  }, "parseArray"), ka = a(function(r3) {
    return r3.toString("utf8");
  }, "parseText"), Ua = a(function(r3) {
    return r3 === null ? null : F2(r3, 8) > 0;
  }, "parseBool"), Oa = a(function(r3) {
    r3(20, La), r3(21, Ra), r3(23, Ii), r3(
      26,
      Ii
    ), r3(1700, Da), r3(700, Fa), r3(701, Ma), r3(16, Ua), r3(1114, Pi.bind(null, false)), r3(1184, Pi.bind(
      null,
      true
    )), r3(1e3, Ye), r3(1007, Ye), r3(1016, Ye), r3(1008, Ye), r3(1009, Ye), r3(25, ka);
  }, "init");
  Li.exports = { init: Oa };
});
var Mi = I((Wh, Fi) => {
  p();
  Fi.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});
var Xe = I((Je) => {
  p();
  var Na = Ai(), qa = Ri(), Qa = Vt(), ja = Mi();
  Je.getTypeParser = Wa;
  Je.setTypeParser = Ha;
  Je.arrayParser = Qa;
  Je.builtins = ja;
  var Ze = { text: {}, binary: {} };
  function Di(r3) {
    return String(
      r3
    );
  }
  a(Di, "noParse");
  function Wa(r3, e2) {
    return e2 = e2 || "text", Ze[e2] && Ze[e2][r3] || Di;
  }
  a(
    Wa,
    "getTypeParser"
  );
  function Ha(r3, e2, t2) {
    typeof e2 == "function" && (t2 = e2, e2 = "text"), Ze[e2][r3] = t2;
  }
  a(Ha, "setTypeParser");
  Na.init(function(r3, e2) {
    Ze.text[r3] = e2;
  });
  qa.init(function(r3, e2) {
    Ze.binary[r3] = e2;
  });
});
var et = I((Kh, tr) => {
  "use strict";
  p();
  tr.exports = {
    host: "localhost",
    user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
    database: void 0,
    password: null,
    connectionString: void 0,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 3e4,
    client_encoding: "",
    ssl: false,
    application_name: void 0,
    fallback_application_name: void 0,
    options: void 0,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var De = Xe(), Ga = De.getTypeParser(
    20,
    "text"
  ), $a = De.getTypeParser(1016, "text");
  tr.exports.__defineSetter__("parseInt8", function(r3) {
    De.setTypeParser(20, "text", r3 ? De.getTypeParser(23, "text") : Ga), De.setTypeParser(1016, "text", r3 ? De.getTypeParser(1007, "text") : $a);
  });
});
var tt = I((Yh, Ui) => {
  "use strict";
  p();
  var Va = (Ht(), O(Wt)), Ka = et();
  function za(r3) {
    var e2 = r3.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return '"' + e2 + '"';
  }
  a(za, "escapeElement");
  function ki(r3) {
    for (var e2 = "{", t2 = 0; t2 < r3.length; t2++)
      t2 > 0 && (e2 = e2 + ","), r3[t2] === null || typeof r3[t2] > "u" ? e2 = e2 + "NULL" : Array.isArray(r3[t2]) ? e2 = e2 + ki(r3[t2]) : r3[t2] instanceof y ? e2 += "\\\\x" + r3[t2].toString("hex") : e2 += za(pt(r3[t2]));
    return e2 = e2 + "}", e2;
  }
  a(ki, "arrayString");
  var pt = a(function(r3, e2) {
    if (r3 == null)
      return null;
    if (r3 instanceof y)
      return r3;
    if (ArrayBuffer.isView(r3)) {
      var t2 = y.from(r3.buffer, r3.byteOffset, r3.byteLength);
      return t2.length === r3.byteLength ? t2 : t2.slice(
        r3.byteOffset,
        r3.byteOffset + r3.byteLength
      );
    }
    return r3 instanceof Date ? Ka.parseInputDatesAsUTC ? Ja(r3) : Za(r3) : Array.isArray(r3) ? ki(r3) : typeof r3 == "object" ? Ya(r3, e2) : r3.toString();
  }, "prepareValue");
  function Ya(r3, e2) {
    if (r3 && typeof r3.toPostgres == "function") {
      if (e2 = e2 || [], e2.indexOf(r3) !== -1)
        throw new Error('circular reference detected while preparing "' + r3 + '" for query');
      return e2.push(r3), pt(r3.toPostgres(pt), e2);
    }
    return JSON.stringify(r3);
  }
  a(Ya, "prepareObject");
  function G(r3, e2) {
    for (r3 = "" + r3; r3.length < e2; )
      r3 = "0" + r3;
    return r3;
  }
  a(
    G,
    "pad"
  );
  function Za(r3) {
    var e2 = -r3.getTimezoneOffset(), t2 = r3.getFullYear(), n2 = t2 < 1;
    n2 && (t2 = Math.abs(t2) + 1);
    var i4 = G(t2, 4) + "-" + G(r3.getMonth() + 1, 2) + "-" + G(r3.getDate(), 2) + "T" + G(r3.getHours(), 2) + ":" + G(r3.getMinutes(), 2) + ":" + G(r3.getSeconds(), 2) + "." + G(
      r3.getMilliseconds(),
      3
    );
    return e2 < 0 ? (i4 += "-", e2 *= -1) : i4 += "+", i4 += G(Math.floor(e2 / 60), 2) + ":" + G(e2 % 60, 2), n2 && (i4 += " BC"), i4;
  }
  a(Za, "dateToString");
  function Ja(r3) {
    var e2 = r3.getUTCFullYear(), t2 = e2 < 1;
    t2 && (e2 = Math.abs(e2) + 1);
    var n2 = G(e2, 4) + "-" + G(r3.getUTCMonth() + 1, 2) + "-" + G(r3.getUTCDate(), 2) + "T" + G(r3.getUTCHours(), 2) + ":" + G(r3.getUTCMinutes(), 2) + ":" + G(r3.getUTCSeconds(), 2) + "." + G(r3.getUTCMilliseconds(), 3);
    return n2 += "+00:00", t2 && (n2 += " BC"), n2;
  }
  a(Ja, "dateToStringUTC");
  function Xa(r3, e2, t2) {
    return r3 = typeof r3 == "string" ? { text: r3 } : r3, e2 && (typeof e2 == "function" ? r3.callback = e2 : r3.values = e2), t2 && (r3.callback = t2), r3;
  }
  a(Xa, "normalizeQueryConfig");
  var rr = a(function(r3) {
    return Va.createHash("md5").update(r3, "utf-8").digest("hex");
  }, "md5"), eu = a(function(r3, e2, t2) {
    var n2 = rr(e2 + r3), i4 = rr(y.concat([y.from(n2), t2]));
    return "md5" + i4;
  }, "postgresMd5PasswordHash");
  Ui.exports = { prepareValue: a(function(e2) {
    return pt(
      e2
    );
  }, "prepareValueWrapper"), normalizeQueryConfig: Xa, postgresMd5PasswordHash: eu, md5: rr };
});
var ji = I((Xh, Qi) => {
  "use strict";
  p();
  var nr = (Ht(), O(Wt));
  function tu(r3) {
    if (r3.indexOf(
      "SCRAM-SHA-256"
    ) === -1)
      throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    let e2 = nr.randomBytes(18).toString("base64");
    return { mechanism: "SCRAM-SHA-256", clientNonce: e2, response: "n,,n=*,r=" + e2, message: "SASLInitialResponse" };
  }
  a(tu, "startSession");
  function ru(r3, e2, t2) {
    if (r3.message !== "SASLInitialResponse")
      throw new Error(
        "SASL: Last message was not SASLInitialResponse"
      );
    if (typeof e2 != "string")
      throw new Error(
        "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
      );
    if (typeof t2 != "string")
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    let n2 = su(t2);
    if (n2.nonce.startsWith(r3.clientNonce)) {
      if (n2.nonce.length === r3.clientNonce.length)
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    var i4 = y.from(n2.salt, "base64"), s3 = uu(
      e2,
      i4,
      n2.iteration
    ), o3 = ke(s3, "Client Key"), u4 = au(o3), c3 = "n=*,r=" + r3.clientNonce, h3 = "r=" + n2.nonce + ",s=" + n2.salt + ",i=" + n2.iteration, l3 = "c=biws,r=" + n2.nonce, d3 = c3 + "," + h3 + "," + l3, b2 = ke(u4, d3), C3 = qi(
      o3,
      b2
    ), B = C3.toString("base64"), Q = ke(s3, "Server Key"), X = ke(Q, d3);
    r3.message = "SASLResponse", r3.serverSignature = X.toString("base64"), r3.response = l3 + ",p=" + B;
  }
  a(ru, "continueSession");
  function nu(r3, e2) {
    if (r3.message !== "SASLResponse")
      throw new Error("SASL: Last message was not SASLResponse");
    if (typeof e2 != "string")
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    let { serverSignature: t2 } = ou(
      e2
    );
    if (t2 !== r3.serverSignature)
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
  }
  a(nu, "finalizeSession");
  function iu(r3) {
    if (typeof r3 != "string")
      throw new TypeError("SASL: text must be a string");
    return r3.split("").map(
      (e2, t2) => r3.charCodeAt(t2)
    ).every((e2) => e2 >= 33 && e2 <= 43 || e2 >= 45 && e2 <= 126);
  }
  a(iu, "isPrintableChars");
  function Oi(r3) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r3);
  }
  a(Oi, "isBase64");
  function Ni(r3) {
    if (typeof r3 != "string")
      throw new TypeError(
        "SASL: attribute pairs text must be a string"
      );
    return new Map(r3.split(",").map((e2) => {
      if (!/^.=/.test(e2))
        throw new Error("SASL: Invalid attribute pair entry");
      let t2 = e2[0], n2 = e2.substring(2);
      return [t2, n2];
    }));
  }
  a(Ni, "parseAttributePairs");
  function su(r3) {
    let e2 = Ni(
      r3
    ), t2 = e2.get("r");
    if (t2) {
      if (!iu(t2))
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    let n2 = e2.get("s");
    if (n2) {
      if (!Oi(n2))
        throw new Error(
          "SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64"
        );
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    let i4 = e2.get("i");
    if (i4) {
      if (!/^[1-9][0-9]*$/.test(i4))
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    } else
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    let s3 = parseInt(i4, 10);
    return { nonce: t2, salt: n2, iteration: s3 };
  }
  a(su, "parseServerFirstMessage");
  function ou(r3) {
    let t2 = Ni(r3).get("v");
    if (t2) {
      if (!Oi(t2))
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    } else
      throw new Error(
        "SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing"
      );
    return { serverSignature: t2 };
  }
  a(ou, "parseServerFinalMessage");
  function qi(r3, e2) {
    if (!y.isBuffer(r3))
      throw new TypeError(
        "first argument must be a Buffer"
      );
    if (!y.isBuffer(e2))
      throw new TypeError("second argument must be a Buffer");
    if (r3.length !== e2.length)
      throw new Error("Buffer lengths must match");
    if (r3.length === 0)
      throw new Error("Buffers cannot be empty");
    return y.from(r3.map((t2, n2) => r3[n2] ^ e2[n2]));
  }
  a(qi, "xorBuffers");
  function au(r3) {
    return nr.createHash(
      "sha256"
    ).update(r3).digest();
  }
  a(au, "sha256");
  function ke(r3, e2) {
    return nr.createHmac(
      "sha256",
      r3
    ).update(e2).digest();
  }
  a(ke, "hmacSha256");
  function uu(r3, e2, t2) {
    for (var n2 = ke(
      r3,
      y.concat([e2, y.from([0, 0, 0, 1])])
    ), i4 = n2, s3 = 0; s3 < t2 - 1; s3++)
      n2 = ke(r3, n2), i4 = qi(i4, n2);
    return i4;
  }
  a(uu, "Hi");
  Qi.exports = { startSession: tu, continueSession: ru, finalizeSession: nu };
});
var ir = {};
se(ir, { join: () => cu });
function cu(...r3) {
  return r3.join("/");
}
var sr = z(() => {
  "use strict";
  p();
  a(cu, "join");
});
var or = {};
se(or, { stat: () => hu });
function hu(r3, e2) {
  e2(new Error("No filesystem"));
}
var ar = z(
  () => {
    "use strict";
    p();
    a(hu, "stat");
  }
);
var ur = {};
se(ur, { default: () => lu });
var lu;
var cr = z(() => {
  "use strict";
  p();
  lu = {};
});
var Wi = {};
se(Wi, { StringDecoder: () => hr });
var lr;
var hr;
var Hi = z(() => {
  "use strict";
  p();
  lr = class lr {
    constructor(e2) {
      _(this, "td");
      this.td = new TextDecoder(e2);
    }
    write(e2) {
      return this.td.decode(e2, { stream: true });
    }
    end(e2) {
      return this.td.decode(e2);
    }
  };
  a(lr, "StringDecoder");
  hr = lr;
});
var Ki = I((cl, Vi) => {
  "use strict";
  p();
  var { Transform: fu } = (cr(), O(ur)), { StringDecoder: pu } = (Hi(), O(Wi)), we = Symbol("last"), dt = Symbol("decoder");
  function du(r3, e2, t2) {
    let n2;
    if (this.overflow) {
      if (n2 = this[dt].write(r3).split(this.matcher), n2.length === 1)
        return t2();
      n2.shift(), this.overflow = false;
    } else
      this[we] += this[dt].write(r3), n2 = this[we].split(this.matcher);
    this[we] = n2.pop();
    for (let i4 = 0; i4 < n2.length; i4++)
      try {
        $i(this, this.mapper(n2[i4]));
      } catch (s3) {
        return t2(
          s3
        );
      }
    if (this.overflow = this[we].length > this.maxLength, this.overflow && !this.skipOverflow) {
      t2(new Error("maximum buffer reached"));
      return;
    }
    t2();
  }
  a(du, "transform");
  function yu(r3) {
    if (this[we] += this[dt].end(), this[we])
      try {
        $i(this, this.mapper(this[we]));
      } catch (e2) {
        return r3(e2);
      }
    r3();
  }
  a(yu, "flush");
  function $i(r3, e2) {
    e2 !== void 0 && r3.push(e2);
  }
  a($i, "push");
  function Gi(r3) {
    return r3;
  }
  a(Gi, "noop");
  function mu(r3, e2, t2) {
    switch (r3 = r3 || /\r?\n/, e2 = e2 || Gi, t2 = t2 || {}, arguments.length) {
      case 1:
        typeof r3 == "function" ? (e2 = r3, r3 = /\r?\n/) : typeof r3 == "object" && !(r3 instanceof RegExp) && !r3[Symbol.split] && (t2 = r3, r3 = /\r?\n/);
        break;
      case 2:
        typeof r3 == "function" ? (t2 = e2, e2 = r3, r3 = /\r?\n/) : typeof e2 == "object" && (t2 = e2, e2 = Gi);
    }
    t2 = Object.assign({}, t2), t2.autoDestroy = true, t2.transform = du, t2.flush = yu, t2.readableObjectMode = true;
    let n2 = new fu(t2);
    return n2[we] = "", n2[dt] = new pu("utf8"), n2.matcher = r3, n2.mapper = e2, n2.maxLength = t2.maxLength, n2.skipOverflow = t2.skipOverflow || false, n2.overflow = false, n2._destroy = function(i4, s3) {
      this._writableState.errorEmitted = false, s3(i4);
    }, n2;
  }
  a(mu, "split");
  Vi.exports = mu;
});
var Zi = I((fl, fe) => {
  "use strict";
  p();
  var zi = (sr(), O(ir)), gu = (cr(), O(ur)).Stream, wu = Ki(), Yi = (Ge(), O(He)), bu = 5432, yt = m.platform === "win32", rt = m.stderr, Su = 56, Eu = 7, vu = 61440, xu = 32768;
  function _u(r3) {
    return (r3 & vu) == xu;
  }
  a(_u, "isRegFile");
  var Ue = [
    "host",
    "port",
    "database",
    "user",
    "password"
  ], fr = Ue.length, Au = Ue[fr - 1];
  function pr() {
    var r3 = rt instanceof gu && rt.writable === true;
    if (r3) {
      var e2 = Array.prototype.slice.call(arguments).concat(`
`);
      rt.write(Yi.format.apply(Yi, e2));
    }
  }
  a(pr, "warn");
  Object.defineProperty(
    fe.exports,
    "isWin",
    { get: a(function() {
      return yt;
    }, "get"), set: a(function(r3) {
      yt = r3;
    }, "set") }
  );
  fe.exports.warnTo = function(r3) {
    var e2 = rt;
    return rt = r3, e2;
  };
  fe.exports.getFileName = function(r3) {
    var e2 = r3 || m.env, t2 = e2.PGPASSFILE || (yt ? zi.join(e2.APPDATA || "./", "postgresql", "pgpass.conf") : zi.join(e2.HOME || "./", ".pgpass"));
    return t2;
  };
  fe.exports.usePgPass = function(r3, e2) {
    return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : yt ? true : (e2 = e2 || "<unkn>", _u(r3.mode) ? r3.mode & (Su | Eu) ? (pr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e2), false) : true : (pr('WARNING: password file "%s" is not a plain file', e2), false));
  };
  var Cu = fe.exports.match = function(r3, e2) {
    return Ue.slice(0, -1).reduce(function(t2, n2, i4) {
      return i4 == 1 && Number(r3[n2] || bu) === Number(
        e2[n2]
      ) ? t2 && true : t2 && (e2[n2] === "*" || e2[n2] === r3[n2]);
    }, true);
  };
  fe.exports.getPassword = function(r3, e2, t2) {
    var n2, i4 = e2.pipe(wu());
    function s3(c3) {
      var h3 = Tu(c3);
      h3 && Iu(h3) && Cu(r3, h3) && (n2 = h3[Au], i4.end());
    }
    a(s3, "onLine");
    var o3 = a(function() {
      e2.destroy(), t2(n2);
    }, "onEnd"), u4 = a(function(c3) {
      e2.destroy(), pr("WARNING: error on reading file: %s", c3), t2(void 0);
    }, "onErr");
    e2.on("error", u4), i4.on("data", s3).on("end", o3).on("error", u4);
  };
  var Tu = fe.exports.parseLine = function(r3) {
    if (r3.length < 11 || r3.match(/^\s+#/))
      return null;
    for (var e2 = "", t2 = "", n2 = 0, i4 = 0, s3 = 0, o3 = {}, u4 = false, c3 = a(function(l3, d3, b2) {
      var C3 = r3.substring(d3, b2);
      Object.hasOwnProperty.call(
        m.env,
        "PGPASS_NO_DEESCAPE"
      ) || (C3 = C3.replace(/\\([:\\])/g, "$1")), o3[Ue[l3]] = C3;
    }, "addToObj"), h3 = 0; h3 < r3.length - 1; h3 += 1) {
      if (e2 = r3.charAt(h3 + 1), t2 = r3.charAt(h3), u4 = n2 == fr - 1, u4) {
        c3(n2, i4);
        break;
      }
      h3 >= 0 && e2 == ":" && t2 !== "\\" && (c3(n2, i4, h3 + 1), i4 = h3 + 2, n2 += 1);
    }
    return o3 = Object.keys(o3).length === fr ? o3 : null, o3;
  }, Iu = fe.exports.isValidEntry = function(r3) {
    for (var e2 = { 0: function(o3) {
      return o3.length > 0;
    }, 1: function(o3) {
      return o3 === "*" ? true : (o3 = Number(o3), isFinite(o3) && o3 > 0 && o3 < 9007199254740992 && Math.floor(o3) === o3);
    }, 2: function(o3) {
      return o3.length > 0;
    }, 3: function(o3) {
      return o3.length > 0;
    }, 4: function(o3) {
      return o3.length > 0;
    } }, t2 = 0; t2 < Ue.length; t2 += 1) {
      var n2 = e2[t2], i4 = r3[Ue[t2]] || "", s3 = n2(i4);
      if (!s3)
        return false;
    }
    return true;
  };
});
var Xi = I((ml, dr) => {
  "use strict";
  p();
  var yl = (sr(), O(ir)), Ji = (ar(), O(or)), mt = Zi();
  dr.exports = function(r3, e2) {
    var t2 = mt.getFileName();
    Ji.stat(t2, function(n2, i4) {
      if (n2 || !mt.usePgPass(i4, t2))
        return e2(void 0);
      var s3 = Ji.createReadStream(t2);
      mt.getPassword(
        r3,
        s3,
        e2
      );
    });
  };
  dr.exports.warnTo = mt.warnTo;
});
var wt = I((wl, es) => {
  "use strict";
  p();
  var Pu = Xe();
  function gt2(r3) {
    this._types = r3 || Pu, this.text = {}, this.binary = {};
  }
  a(gt2, "TypeOverrides");
  gt2.prototype.getOverrides = function(r3) {
    switch (r3) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  gt2.prototype.setTypeParser = function(r3, e2, t2) {
    typeof e2 == "function" && (t2 = e2, e2 = "text"), this.getOverrides(e2)[r3] = t2;
  };
  gt2.prototype.getTypeParser = function(r3, e2) {
    return e2 = e2 || "text", this.getOverrides(e2)[r3] || this._types.getTypeParser(r3, e2);
  };
  es.exports = gt2;
});
var ts = {};
se(ts, { default: () => Bu });
var Bu;
var rs = z(() => {
  "use strict";
  p();
  Bu = {};
});
var ns = {};
se(ns, { parse: () => yr });
function yr(r3, e2 = false) {
  let { protocol: t2 } = new URL(r3), n2 = "http:" + r3.substring(t2.length), {
    username: i4,
    password: s3,
    host: o3,
    hostname: u4,
    port: c3,
    pathname: h3,
    search: l3,
    searchParams: d3,
    hash: b2
  } = new URL(n2);
  s3 = decodeURIComponent(s3), i4 = decodeURIComponent(
    i4
  ), h3 = decodeURIComponent(h3);
  let C3 = i4 + ":" + s3, B = e2 ? Object.fromEntries(d3.entries()) : l3;
  return {
    href: r3,
    protocol: t2,
    auth: C3,
    username: i4,
    password: s3,
    host: o3,
    hostname: u4,
    port: c3,
    pathname: h3,
    search: l3,
    query: B,
    hash: b2
  };
}
var mr = z(() => {
  "use strict";
  p();
  a(yr, "parse");
});
var ss = I((_l, is2) => {
  "use strict";
  p();
  var Lu = (mr(), O(ns)), gr = (ar(), O(or));
  function wr(r3) {
    if (r3.charAt(0) === "/") {
      var t2 = r3.split(" ");
      return { host: t2[0], database: t2[1] };
    }
    var e2 = Lu.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r3) ? encodeURI(r3).replace(
      /\%25(\d\d)/g,
      "%$1"
    ) : r3, true), t2 = e2.query;
    for (var n2 in t2)
      Array.isArray(t2[n2]) && (t2[n2] = t2[n2][t2[n2].length - 1]);
    var i4 = (e2.auth || ":").split(":");
    if (t2.user = i4[0], t2.password = i4.splice(1).join(":"), t2.port = e2.port, e2.protocol == "socket:")
      return t2.host = decodeURI(e2.pathname), t2.database = e2.query.db, t2.client_encoding = e2.query.encoding, t2;
    t2.host || (t2.host = e2.hostname);
    var s3 = e2.pathname;
    if (!t2.host && s3 && /^%2f/i.test(s3)) {
      var o3 = s3.split("/");
      t2.host = decodeURIComponent(
        o3[0]
      ), s3 = o3.splice(1).join("/");
    }
    switch (s3 && s3.charAt(0) === "/" && (s3 = s3.slice(1) || null), t2.database = s3 && decodeURI(s3), (t2.ssl === "true" || t2.ssl === "1") && (t2.ssl = true), t2.ssl === "0" && (t2.ssl = false), (t2.sslcert || t2.sslkey || t2.sslrootcert || t2.sslmode) && (t2.ssl = {}), t2.sslcert && (t2.ssl.cert = gr.readFileSync(t2.sslcert).toString()), t2.sslkey && (t2.ssl.key = gr.readFileSync(
      t2.sslkey
    ).toString()), t2.sslrootcert && (t2.ssl.ca = gr.readFileSync(t2.sslrootcert).toString()), t2.sslmode) {
      case "disable": {
        t2.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        break;
      case "no-verify": {
        t2.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return t2;
  }
  a(wr, "parse");
  is2.exports = wr;
  wr.parse = wr;
});
var bt = I((Tl, us) => {
  "use strict";
  p();
  var Ru = (rs(), O(ts)), as = et(), os = ss().parse, V2 = a(
    function(r3, e2, t2) {
      return t2 === void 0 ? t2 = m.env["PG" + r3.toUpperCase()] : t2 === false || (t2 = m.env[t2]), e2[r3] || t2 || as[r3];
    },
    "val"
  ), Fu = a(function() {
    switch (m.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return as.ssl;
  }, "readSSLConfigFromEnvironment"), Oe = a(
    function(r3) {
      return "'" + ("" + r3).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    },
    "quoteParamValue"
  ), ie = a(function(r3, e2, t2) {
    var n2 = e2[t2];
    n2 != null && r3.push(t2 + "=" + Oe(n2));
  }, "add"), Sr = class Sr {
    constructor(e2) {
      e2 = typeof e2 == "string" ? os(e2) : e2 || {}, e2.connectionString && (e2 = Object.assign({}, e2, os(e2.connectionString))), this.user = V2("user", e2), this.database = V2("database", e2), this.database === void 0 && (this.database = this.user), this.port = parseInt(
        V2("port", e2),
        10
      ), this.host = V2("host", e2), Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: V2("password", e2)
      }), this.binary = V2("binary", e2), this.options = V2("options", e2), this.ssl = typeof e2.ssl > "u" ? Fu() : e2.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = V2("client_encoding", e2), this.replication = V2("replication", e2), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = V2("application_name", e2, "PGAPPNAME"), this.fallback_application_name = V2("fallback_application_name", e2, false), this.statement_timeout = V2("statement_timeout", e2, false), this.lock_timeout = V2(
        "lock_timeout",
        e2,
        false
      ), this.idle_in_transaction_session_timeout = V2("idle_in_transaction_session_timeout", e2, false), this.query_timeout = V2("query_timeout", e2, false), e2.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e2.connectionTimeoutMillis / 1e3), e2.keepAlive === false ? this.keepalives = 0 : e2.keepAlive === true && (this.keepalives = 1), typeof e2.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e2.keepAliveInitialDelayMillis / 1e3));
    }
    getLibpqConnectionString(e2) {
      var t2 = [];
      ie(t2, this, "user"), ie(t2, this, "password"), ie(t2, this, "port"), ie(t2, this, "application_name"), ie(t2, this, "fallback_application_name"), ie(t2, this, "connect_timeout"), ie(
        t2,
        this,
        "options"
      );
      var n2 = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      if (ie(t2, n2, "sslmode"), ie(t2, n2, "sslca"), ie(t2, n2, "sslkey"), ie(t2, n2, "sslcert"), ie(t2, n2, "sslrootcert"), this.database && t2.push("dbname=" + Oe(this.database)), this.replication && t2.push("replication=" + Oe(this.replication)), this.host && t2.push("host=" + Oe(this.host)), this.isDomainSocket)
        return e2(null, t2.join(" "));
      this.client_encoding && t2.push("client_encoding=" + Oe(this.client_encoding)), Ru.lookup(this.host, function(i4, s3) {
        return i4 ? e2(i4, null) : (t2.push("hostaddr=" + Oe(s3)), e2(null, t2.join(" ")));
      });
    }
  };
  a(Sr, "ConnectionParameters");
  var br = Sr;
  us.exports = br;
});
var ls = I((Bl, hs) => {
  "use strict";
  p();
  var Mu = Xe(), cs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, vr = class vr {
    constructor(e2, t2) {
      this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t2, this.RowCtor = null, this.rowAsArray = e2 === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
    }
    addCommandComplete(e2) {
      var t2;
      e2.text ? t2 = cs.exec(e2.text) : t2 = cs.exec(e2.command), t2 && (this.command = t2[1], t2[3] ? (this.oid = parseInt(t2[2], 10), this.rowCount = parseInt(t2[3], 10)) : t2[2] && (this.rowCount = parseInt(
        t2[2],
        10
      )));
    }
    _parseRowAsArray(e2) {
      for (var t2 = new Array(e2.length), n2 = 0, i4 = e2.length; n2 < i4; n2++) {
        var s3 = e2[n2];
        s3 !== null ? t2[n2] = this._parsers[n2](s3) : t2[n2] = null;
      }
      return t2;
    }
    parseRow(e2) {
      for (var t2 = {}, n2 = 0, i4 = e2.length; n2 < i4; n2++) {
        var s3 = e2[n2], o3 = this.fields[n2].name;
        s3 !== null ? t2[o3] = this._parsers[n2](
          s3
        ) : t2[o3] = null;
      }
      return t2;
    }
    addRow(e2) {
      this.rows.push(e2);
    }
    addFields(e2) {
      this.fields = e2, this.fields.length && (this._parsers = new Array(e2.length));
      for (var t2 = 0; t2 < e2.length; t2++) {
        var n2 = e2[t2];
        this._types ? this._parsers[t2] = this._types.getTypeParser(n2.dataTypeID, n2.format || "text") : this._parsers[t2] = Mu.getTypeParser(n2.dataTypeID, n2.format || "text");
      }
    }
  };
  a(vr, "Result");
  var Er = vr;
  hs.exports = Er;
});
var ys = I((Fl, ds) => {
  "use strict";
  p();
  var { EventEmitter: Du } = ge(), fs = ls(), ps = tt(), _r = class _r extends Du {
    constructor(e2, t2, n2) {
      super(), e2 = ps.normalizeQueryConfig(e2, t2, n2), this.text = e2.text, this.values = e2.values, this.rows = e2.rows, this.types = e2.types, this.name = e2.name, this.binary = e2.binary, this.portal = e2.portal || "", this.callback = e2.callback, this._rowMode = e2.rowMode, m.domain && e2.callback && (this.callback = m.domain.bind(e2.callback)), this._result = new fs(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
    }
    requiresPreparation() {
      return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
    }
    _checkForMultirow() {
      this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new fs(
        this._rowMode,
        this.types
      ), this._results.push(this._result));
    }
    handleRowDescription(e2) {
      this._checkForMultirow(), this._result.addFields(e2.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(e2) {
      let t2;
      if (!this._canceledDueToError) {
        try {
          t2 = this._result.parseRow(e2.fields);
        } catch (n2) {
          this._canceledDueToError = n2;
          return;
        }
        this.emit("row", t2, this._result), this._accumulateRows && this._result.addRow(t2);
      }
    }
    handleCommandComplete(e2, t2) {
      this._checkForMultirow(), this._result.addCommandComplete(e2), this.rows && t2.sync();
    }
    handleEmptyQuery(e2) {
      this.rows && e2.sync();
    }
    handleError(e2, t2) {
      if (this._canceledDueToError && (e2 = this._canceledDueToError, this._canceledDueToError = false), this.callback)
        return this.callback(e2);
      this.emit("error", e2);
    }
    handleReadyForQuery(e2) {
      if (this._canceledDueToError)
        return this.handleError(
          this._canceledDueToError,
          e2
        );
      if (this.callback)
        try {
          this.callback(null, this._results);
        } catch (t2) {
          m.nextTick(() => {
            throw t2;
          });
        }
      this.emit("end", this._results);
    }
    submit(e2) {
      if (typeof this.text != "string" && typeof this.name != "string")
        return new Error("A query must have either text or a name. Supplying neither is unsupported.");
      let t2 = e2.parsedStatements[this.name];
      return this.text && t2 && this.text !== t2 ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e2) : e2.query(this.text), null);
    }
    hasBeenParsed(e2) {
      return this.name && e2.parsedStatements[this.name];
    }
    handlePortalSuspended(e2) {
      this._getRows(e2, this.rows);
    }
    _getRows(e2, t2) {
      e2.execute(
        { portal: this.portal, rows: t2 }
      ), t2 ? e2.flush() : e2.sync();
    }
    prepare(e2) {
      this.isPreparedStatement = true, this.hasBeenParsed(e2) || e2.parse({ text: this.text, name: this.name, types: this.types });
      try {
        e2.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: ps.prepareValue });
      } catch (t2) {
        this.handleError(t2, e2);
        return;
      }
      e2.describe(
        { type: "P", name: this.portal || "" }
      ), this._getRows(e2, this.rows);
    }
    handleCopyInResponse(e2) {
      e2.sendCopyFail("No source stream defined");
    }
    handleCopyData(e2, t2) {
    }
  };
  a(_r, "Query");
  var xr = _r;
  ds.exports = xr;
});
var ws = {};
se(ws, { Socket: () => _e, isIP: () => ku });
function ku(r3) {
  return 0;
}
var gs;
var ms;
var x;
var _e;
var St = z(() => {
  "use strict";
  p();
  gs = Ie(ge(), 1);
  a(ku, "isIP");
  ms = /^[^.]+\./, x = class x4 extends gs.EventEmitter {
    constructor() {
      super(...arguments);
      _(this, "opts", {});
      _(this, "connecting", false);
      _(this, "pending", true);
      _(this, "writable", true);
      _(this, "encrypted", false);
      _(this, "authorized", false);
      _(this, "destroyed", false);
      _(this, "ws", null);
      _(this, "writeBuffer");
      _(this, "tlsState", 0);
      _(
        this,
        "tlsRead"
      );
      _(this, "tlsWrite");
    }
    static get poolQueryViaFetch() {
      return x4.opts.poolQueryViaFetch ?? x4.defaults.poolQueryViaFetch;
    }
    static set poolQueryViaFetch(t2) {
      x4.opts.poolQueryViaFetch = t2;
    }
    static get fetchEndpoint() {
      return x4.opts.fetchEndpoint ?? x4.defaults.fetchEndpoint;
    }
    static set fetchEndpoint(t2) {
      x4.opts.fetchEndpoint = t2;
    }
    static get fetchConnectionCache() {
      return true;
    }
    static set fetchConnectionCache(t2) {
      console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
    }
    static get fetchFunction() {
      return x4.opts.fetchFunction ?? x4.defaults.fetchFunction;
    }
    static set fetchFunction(t2) {
      x4.opts.fetchFunction = t2;
    }
    static get webSocketConstructor() {
      return x4.opts.webSocketConstructor ?? x4.defaults.webSocketConstructor;
    }
    static set webSocketConstructor(t2) {
      x4.opts.webSocketConstructor = t2;
    }
    get webSocketConstructor() {
      return this.opts.webSocketConstructor ?? x4.webSocketConstructor;
    }
    set webSocketConstructor(t2) {
      this.opts.webSocketConstructor = t2;
    }
    static get wsProxy() {
      return x4.opts.wsProxy ?? x4.defaults.wsProxy;
    }
    static set wsProxy(t2) {
      x4.opts.wsProxy = t2;
    }
    get wsProxy() {
      return this.opts.wsProxy ?? x4.wsProxy;
    }
    set wsProxy(t2) {
      this.opts.wsProxy = t2;
    }
    static get coalesceWrites() {
      return x4.opts.coalesceWrites ?? x4.defaults.coalesceWrites;
    }
    static set coalesceWrites(t2) {
      x4.opts.coalesceWrites = t2;
    }
    get coalesceWrites() {
      return this.opts.coalesceWrites ?? x4.coalesceWrites;
    }
    set coalesceWrites(t2) {
      this.opts.coalesceWrites = t2;
    }
    static get useSecureWebSocket() {
      return x4.opts.useSecureWebSocket ?? x4.defaults.useSecureWebSocket;
    }
    static set useSecureWebSocket(t2) {
      x4.opts.useSecureWebSocket = t2;
    }
    get useSecureWebSocket() {
      return this.opts.useSecureWebSocket ?? x4.useSecureWebSocket;
    }
    set useSecureWebSocket(t2) {
      this.opts.useSecureWebSocket = t2;
    }
    static get forceDisablePgSSL() {
      return x4.opts.forceDisablePgSSL ?? x4.defaults.forceDisablePgSSL;
    }
    static set forceDisablePgSSL(t2) {
      x4.opts.forceDisablePgSSL = t2;
    }
    get forceDisablePgSSL() {
      return this.opts.forceDisablePgSSL ?? x4.forceDisablePgSSL;
    }
    set forceDisablePgSSL(t2) {
      this.opts.forceDisablePgSSL = t2;
    }
    static get disableSNI() {
      return x4.opts.disableSNI ?? x4.defaults.disableSNI;
    }
    static set disableSNI(t2) {
      x4.opts.disableSNI = t2;
    }
    get disableSNI() {
      return this.opts.disableSNI ?? x4.disableSNI;
    }
    set disableSNI(t2) {
      this.opts.disableSNI = t2;
    }
    static get pipelineConnect() {
      return x4.opts.pipelineConnect ?? x4.defaults.pipelineConnect;
    }
    static set pipelineConnect(t2) {
      x4.opts.pipelineConnect = t2;
    }
    get pipelineConnect() {
      return this.opts.pipelineConnect ?? x4.pipelineConnect;
    }
    set pipelineConnect(t2) {
      this.opts.pipelineConnect = t2;
    }
    static get subtls() {
      return x4.opts.subtls ?? x4.defaults.subtls;
    }
    static set subtls(t2) {
      x4.opts.subtls = t2;
    }
    get subtls() {
      return this.opts.subtls ?? x4.subtls;
    }
    set subtls(t2) {
      this.opts.subtls = t2;
    }
    static get pipelineTLS() {
      return x4.opts.pipelineTLS ?? x4.defaults.pipelineTLS;
    }
    static set pipelineTLS(t2) {
      x4.opts.pipelineTLS = t2;
    }
    get pipelineTLS() {
      return this.opts.pipelineTLS ?? x4.pipelineTLS;
    }
    set pipelineTLS(t2) {
      this.opts.pipelineTLS = t2;
    }
    static get rootCerts() {
      return x4.opts.rootCerts ?? x4.defaults.rootCerts;
    }
    static set rootCerts(t2) {
      x4.opts.rootCerts = t2;
    }
    get rootCerts() {
      return this.opts.rootCerts ?? x4.rootCerts;
    }
    set rootCerts(t2) {
      this.opts.rootCerts = t2;
    }
    wsProxyAddrForHost(t2, n2) {
      let i4 = this.wsProxy;
      if (i4 === void 0)
        throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
      return typeof i4 == "function" ? i4(t2, n2) : `${i4}?address=${t2}:${n2}`;
    }
    setNoDelay() {
      return this;
    }
    setKeepAlive() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    connect(t2, n2, i4) {
      this.connecting = true, i4 && this.once("connect", i4);
      let s3 = a(() => {
        this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
      }, "handleWebSocketOpen"), o3 = a((c3, h3 = false) => {
        c3.binaryType = "arraybuffer", c3.addEventListener("error", (l3) => {
          this.emit("error", l3), this.emit("close");
        }), c3.addEventListener("message", (l3) => {
          if (this.tlsState === 0) {
            let d3 = y.from(l3.data);
            this.emit(
              "data",
              d3
            );
          }
        }), c3.addEventListener("close", () => {
          this.emit("close");
        }), h3 ? s3() : c3.addEventListener(
          "open",
          s3
        );
      }, "configureWebSocket"), u4;
      try {
        u4 = this.wsProxyAddrForHost(n2, typeof t2 == "string" ? parseInt(t2, 10) : t2);
      } catch (c3) {
        this.emit("error", c3), this.emit("close");
        return;
      }
      try {
        let h3 = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u4;
        if (this.webSocketConstructor !== void 0)
          this.ws = new this.webSocketConstructor(h3), o3(this.ws);
        else
          try {
            this.ws = new WebSocket(
              h3
            ), o3(this.ws);
          } catch {
            this.ws = new __unstable_WebSocket(h3), o3(this.ws);
          }
      } catch (c3) {
        let l3 = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u4;
        fetch(l3, { headers: { Upgrade: "websocket" } }).then((d3) => {
          if (this.ws = d3.webSocket, this.ws == null)
            throw c3;
          this.ws.accept(), o3(
            this.ws,
            true
          );
        }).catch((d3) => {
          this.emit("error", new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${d3.message}`)), this.emit("close");
        });
      }
    }
    async startTls(t2) {
      if (this.subtls === void 0)
        throw new Error("For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information.");
      this.tlsState = 1;
      let n2 = this.subtls.TrustedCert.fromPEM(this.rootCerts), i4 = new this.subtls.WebSocketReadQueue(this.ws), s3 = i4.read.bind(
        i4
      ), o3 = this.rawWrite.bind(this), [u4, c3] = await this.subtls.startTls(t2, n2, s3, o3, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : void 0 });
      this.tlsRead = u4, this.tlsWrite = c3, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit(
        "secureConnection",
        this
      ), this.tlsReadLoop();
    }
    async tlsReadLoop() {
      for (; ; ) {
        let t2 = await this.tlsRead();
        if (t2 === void 0)
          break;
        {
          let n2 = y.from(t2);
          this.emit("data", n2);
        }
      }
    }
    rawWrite(t2) {
      if (!this.coalesceWrites) {
        this.ws.send(t2);
        return;
      }
      if (this.writeBuffer === void 0)
        this.writeBuffer = t2, setTimeout(
          () => {
            this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
          },
          0
        );
      else {
        let n2 = new Uint8Array(this.writeBuffer.length + t2.length);
        n2.set(this.writeBuffer), n2.set(t2, this.writeBuffer.length), this.writeBuffer = n2;
      }
    }
    write(t2, n2 = "utf8", i4 = (s3) => {
    }) {
      return t2.length === 0 ? (i4(), true) : (typeof t2 == "string" && (t2 = y.from(t2, n2)), this.tlsState === 0 ? (this.rawWrite(t2), i4()) : this.tlsState === 1 ? this.once("secureConnection", () => {
        this.write(
          t2,
          n2,
          i4
        );
      }) : (this.tlsWrite(t2), i4()), true);
    }
    end(t2 = y.alloc(0), n2 = "utf8", i4 = () => {
    }) {
      return this.write(t2, n2, () => {
        this.ws.close(), i4();
      }), this;
    }
    destroy() {
      return this.destroyed = true, this.end();
    }
  };
  a(x, "Socket"), _(x, "defaults", {
    poolQueryViaFetch: false,
    fetchEndpoint: a((t2, n2, i4) => {
      let s3;
      return i4?.jwtAuth ? s3 = t2.replace(ms, "apiauth.") : s3 = t2.replace(ms, "api."), "https://" + s3 + "/sql";
    }, "fetchEndpoint"),
    fetchConnectionCache: true,
    fetchFunction: void 0,
    webSocketConstructor: void 0,
    wsProxy: a((t2) => t2 + "/v2", "wsProxy"),
    useSecureWebSocket: true,
    forceDisablePgSSL: true,
    coalesceWrites: true,
    pipelineConnect: "password",
    subtls: void 0,
    rootCerts: "",
    pipelineTLS: false,
    disableSNI: false
  }), _(x, "opts", {});
  _e = x;
});
var Xr = I((T3) => {
  "use strict";
  p();
  Object.defineProperty(T3, "__esModule", { value: true });
  T3.NoticeMessage = T3.DataRowMessage = T3.CommandCompleteMessage = T3.ReadyForQueryMessage = T3.NotificationResponseMessage = T3.BackendKeyDataMessage = T3.AuthenticationMD5Password = T3.ParameterStatusMessage = T3.ParameterDescriptionMessage = T3.RowDescriptionMessage = T3.Field = T3.CopyResponse = T3.CopyDataMessage = T3.DatabaseError = T3.copyDone = T3.emptyQuery = T3.replicationStart = T3.portalSuspended = T3.noData = T3.closeComplete = T3.bindComplete = T3.parseComplete = void 0;
  T3.parseComplete = { name: "parseComplete", length: 5 };
  T3.bindComplete = { name: "bindComplete", length: 5 };
  T3.closeComplete = { name: "closeComplete", length: 5 };
  T3.noData = { name: "noData", length: 5 };
  T3.portalSuspended = { name: "portalSuspended", length: 5 };
  T3.replicationStart = { name: "replicationStart", length: 4 };
  T3.emptyQuery = { name: "emptyQuery", length: 4 };
  T3.copyDone = { name: "copyDone", length: 4 };
  var Nr = class Nr extends Error {
    constructor(e2, t2, n2) {
      super(
        e2
      ), this.length = t2, this.name = n2;
    }
  };
  a(Nr, "DatabaseError");
  var Ar = Nr;
  T3.DatabaseError = Ar;
  var qr = class qr {
    constructor(e2, t2) {
      this.length = e2, this.chunk = t2, this.name = "copyData";
    }
  };
  a(qr, "CopyDataMessage");
  var Cr = qr;
  T3.CopyDataMessage = Cr;
  var Qr = class Qr {
    constructor(e2, t2, n2, i4) {
      this.length = e2, this.name = t2, this.binary = n2, this.columnTypes = new Array(i4);
    }
  };
  a(Qr, "CopyResponse");
  var Tr = Qr;
  T3.CopyResponse = Tr;
  var jr = class jr {
    constructor(e2, t2, n2, i4, s3, o3, u4) {
      this.name = e2, this.tableID = t2, this.columnID = n2, this.dataTypeID = i4, this.dataTypeSize = s3, this.dataTypeModifier = o3, this.format = u4;
    }
  };
  a(jr, "Field");
  var Ir = jr;
  T3.Field = Ir;
  var Wr = class Wr {
    constructor(e2, t2) {
      this.length = e2, this.fieldCount = t2, this.name = "rowDescription", this.fields = new Array(
        this.fieldCount
      );
    }
  };
  a(Wr, "RowDescriptionMessage");
  var Pr = Wr;
  T3.RowDescriptionMessage = Pr;
  var Hr = class Hr {
    constructor(e2, t2) {
      this.length = e2, this.parameterCount = t2, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
    }
  };
  a(Hr, "ParameterDescriptionMessage");
  var Br = Hr;
  T3.ParameterDescriptionMessage = Br;
  var Gr = class Gr {
    constructor(e2, t2, n2) {
      this.length = e2, this.parameterName = t2, this.parameterValue = n2, this.name = "parameterStatus";
    }
  };
  a(Gr, "ParameterStatusMessage");
  var Lr = Gr;
  T3.ParameterStatusMessage = Lr;
  var $r = class $r {
    constructor(e2, t2) {
      this.length = e2, this.salt = t2, this.name = "authenticationMD5Password";
    }
  };
  a($r, "AuthenticationMD5Password");
  var Rr = $r;
  T3.AuthenticationMD5Password = Rr;
  var Vr = class Vr {
    constructor(e2, t2, n2) {
      this.length = e2, this.processID = t2, this.secretKey = n2, this.name = "backendKeyData";
    }
  };
  a(
    Vr,
    "BackendKeyDataMessage"
  );
  var Fr = Vr;
  T3.BackendKeyDataMessage = Fr;
  var Kr = class Kr {
    constructor(e2, t2, n2, i4) {
      this.length = e2, this.processId = t2, this.channel = n2, this.payload = i4, this.name = "notification";
    }
  };
  a(Kr, "NotificationResponseMessage");
  var Mr = Kr;
  T3.NotificationResponseMessage = Mr;
  var zr = class zr {
    constructor(e2, t2) {
      this.length = e2, this.status = t2, this.name = "readyForQuery";
    }
  };
  a(zr, "ReadyForQueryMessage");
  var Dr = zr;
  T3.ReadyForQueryMessage = Dr;
  var Yr = class Yr {
    constructor(e2, t2) {
      this.length = e2, this.text = t2, this.name = "commandComplete";
    }
  };
  a(Yr, "CommandCompleteMessage");
  var kr = Yr;
  T3.CommandCompleteMessage = kr;
  var Zr = class Zr {
    constructor(e2, t2) {
      this.length = e2, this.fields = t2, this.name = "dataRow", this.fieldCount = t2.length;
    }
  };
  a(Zr, "DataRowMessage");
  var Ur = Zr;
  T3.DataRowMessage = Ur;
  var Jr = class Jr {
    constructor(e2, t2) {
      this.length = e2, this.message = t2, this.name = "notice";
    }
  };
  a(Jr, "NoticeMessage");
  var Or = Jr;
  T3.NoticeMessage = Or;
});
var bs = I((Et) => {
  "use strict";
  p();
  Object.defineProperty(Et, "__esModule", { value: true });
  Et.Writer = void 0;
  var tn = class tn {
    constructor(e2 = 256) {
      this.size = e2, this.offset = 5, this.headerPosition = 0, this.buffer = y.allocUnsafe(e2);
    }
    ensure(e2) {
      var t2 = this.buffer.length - this.offset;
      if (t2 < e2) {
        var n2 = this.buffer, i4 = n2.length + (n2.length >> 1) + e2;
        this.buffer = y.allocUnsafe(
          i4
        ), n2.copy(this.buffer);
      }
    }
    addInt32(e2) {
      return this.ensure(4), this.buffer[this.offset++] = e2 >>> 24 & 255, this.buffer[this.offset++] = e2 >>> 16 & 255, this.buffer[this.offset++] = e2 >>> 8 & 255, this.buffer[this.offset++] = e2 >>> 0 & 255, this;
    }
    addInt16(e2) {
      return this.ensure(2), this.buffer[this.offset++] = e2 >>> 8 & 255, this.buffer[this.offset++] = e2 >>> 0 & 255, this;
    }
    addCString(e2) {
      if (!e2)
        this.ensure(1);
      else {
        var t2 = y.byteLength(e2);
        this.ensure(t2 + 1), this.buffer.write(
          e2,
          this.offset,
          "utf-8"
        ), this.offset += t2;
      }
      return this.buffer[this.offset++] = 0, this;
    }
    addString(e2 = "") {
      var t2 = y.byteLength(e2);
      return this.ensure(t2), this.buffer.write(e2, this.offset), this.offset += t2, this;
    }
    add(e2) {
      return this.ensure(e2.length), e2.copy(this.buffer, this.offset), this.offset += e2.length, this;
    }
    join(e2) {
      if (e2) {
        this.buffer[this.headerPosition] = e2;
        let t2 = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(t2, this.headerPosition + 1);
      }
      return this.buffer.slice(e2 ? 0 : 5, this.offset);
    }
    flush(e2) {
      var t2 = this.join(e2);
      return this.offset = 5, this.headerPosition = 0, this.buffer = y.allocUnsafe(this.size), t2;
    }
  };
  a(tn, "Writer");
  var en = tn;
  Et.Writer = en;
});
var Es = I((xt) => {
  "use strict";
  p();
  Object.defineProperty(xt, "__esModule", { value: true });
  xt.serialize = void 0;
  var rn = bs(), M2 = new rn.Writer(), Uu = a((r3) => {
    M2.addInt16(3).addInt16(
      0
    );
    for (let n2 of Object.keys(r3))
      M2.addCString(n2).addCString(r3[n2]);
    M2.addCString("client_encoding").addCString("UTF8");
    var e2 = M2.addCString("").flush(), t2 = e2.length + 4;
    return new rn.Writer().addInt32(t2).add(e2).flush();
  }, "startup"), Ou = a(() => {
    let r3 = y.allocUnsafe(8);
    return r3.writeInt32BE(8, 0), r3.writeInt32BE(80877103, 4), r3;
  }, "requestSsl"), Nu = a((r3) => M2.addCString(r3).flush(112), "password"), qu = a(function(r3, e2) {
    return M2.addCString(r3).addInt32(
      y.byteLength(e2)
    ).addString(e2), M2.flush(112);
  }, "sendSASLInitialResponseMessage"), Qu = a(
    function(r3) {
      return M2.addString(r3).flush(112);
    },
    "sendSCRAMClientFinalMessage"
  ), ju = a(
    (r3) => M2.addCString(r3).flush(81),
    "query"
  ), Ss = [], Wu = a((r3) => {
    let e2 = r3.name || "";
    e2.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e2, e2.length), console.error("This can cause conflicts and silent errors executing queries"));
    let t2 = r3.types || Ss;
    for (var n2 = t2.length, i4 = M2.addCString(e2).addCString(r3.text).addInt16(n2), s3 = 0; s3 < n2; s3++)
      i4.addInt32(t2[s3]);
    return M2.flush(80);
  }, "parse"), Ne = new rn.Writer(), Hu = a(function(r3, e2) {
    for (let t2 = 0; t2 < r3.length; t2++) {
      let n2 = e2 ? e2(r3[t2], t2) : r3[t2];
      n2 == null ? (M2.addInt16(0), Ne.addInt32(-1)) : n2 instanceof y ? (M2.addInt16(1), Ne.addInt32(n2.length), Ne.add(n2)) : (M2.addInt16(0), Ne.addInt32(y.byteLength(
        n2
      )), Ne.addString(n2));
    }
  }, "writeValues"), Gu = a((r3 = {}) => {
    let e2 = r3.portal || "", t2 = r3.statement || "", n2 = r3.binary || false, i4 = r3.values || Ss, s3 = i4.length;
    return M2.addCString(e2).addCString(t2), M2.addInt16(s3), Hu(i4, r3.valueMapper), M2.addInt16(s3), M2.add(Ne.flush()), M2.addInt16(n2 ? 1 : 0), M2.flush(66);
  }, "bind"), $u = y.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Vu = a((r3) => {
    if (!r3 || !r3.portal && !r3.rows)
      return $u;
    let e2 = r3.portal || "", t2 = r3.rows || 0, n2 = y.byteLength(e2), i4 = 4 + n2 + 1 + 4, s3 = y.allocUnsafe(1 + i4);
    return s3[0] = 69, s3.writeInt32BE(i4, 1), s3.write(e2, 5, "utf-8"), s3[n2 + 5] = 0, s3.writeUInt32BE(t2, s3.length - 4), s3;
  }, "execute"), Ku = a((r3, e2) => {
    let t2 = y.allocUnsafe(16);
    return t2.writeInt32BE(16, 0), t2.writeInt16BE(1234, 4), t2.writeInt16BE(5678, 6), t2.writeInt32BE(
      r3,
      8
    ), t2.writeInt32BE(e2, 12), t2;
  }, "cancel"), nn = a(
    (r3, e2) => {
      let n2 = 4 + y.byteLength(e2) + 1, i4 = y.allocUnsafe(1 + n2);
      return i4[0] = r3, i4.writeInt32BE(n2, 1), i4.write(e2, 5, "utf-8"), i4[n2] = 0, i4;
    },
    "cstringMessage"
  ), zu = M2.addCString("P").flush(68), Yu = M2.addCString("S").flush(68), Zu = a((r3) => r3.name ? nn(68, `${r3.type}${r3.name || ""}`) : r3.type === "P" ? zu : Yu, "describe"), Ju = a(
    (r3) => {
      let e2 = `${r3.type}${r3.name || ""}`;
      return nn(67, e2);
    },
    "close"
  ), Xu = a((r3) => M2.add(r3).flush(
    100
  ), "copyData"), ec = a((r3) => nn(102, r3), "copyFail"), vt = a((r3) => y.from([r3, 0, 0, 0, 4]), "codeOnlyBuffer"), tc = vt(72), rc = vt(83), nc = vt(88), ic = vt(99), sc = {
    startup: Uu,
    password: Nu,
    requestSsl: Ou,
    sendSASLInitialResponseMessage: qu,
    sendSCRAMClientFinalMessage: Qu,
    query: ju,
    parse: Wu,
    bind: Gu,
    execute: Vu,
    describe: Zu,
    close: Ju,
    flush: a(() => tc, "flush"),
    sync: a(
      () => rc,
      "sync"
    ),
    end: a(() => nc, "end"),
    copyData: Xu,
    copyDone: a(() => ic, "copyDone"),
    copyFail: ec,
    cancel: Ku
  };
  xt.serialize = sc;
});
var vs = I((_t) => {
  "use strict";
  p();
  Object.defineProperty(_t, "__esModule", { value: true });
  _t.BufferReader = void 0;
  var oc = y.allocUnsafe(0), on = class on {
    constructor(e2 = 0) {
      this.offset = e2, this.buffer = oc, this.encoding = "utf-8";
    }
    setBuffer(e2, t2) {
      this.offset = e2, this.buffer = t2;
    }
    int16() {
      let e2 = this.buffer.readInt16BE(this.offset);
      return this.offset += 2, e2;
    }
    byte() {
      let e2 = this.buffer[this.offset];
      return this.offset++, e2;
    }
    int32() {
      let e2 = this.buffer.readInt32BE(this.offset);
      return this.offset += 4, e2;
    }
    string(e2) {
      let t2 = this.buffer.toString(this.encoding, this.offset, this.offset + e2);
      return this.offset += e2, t2;
    }
    cstring() {
      let e2 = this.offset, t2 = e2;
      for (; this.buffer[t2++] !== 0; )
        ;
      return this.offset = t2, this.buffer.toString(this.encoding, e2, t2 - 1);
    }
    bytes(e2) {
      let t2 = this.buffer.slice(this.offset, this.offset + e2);
      return this.offset += e2, t2;
    }
  };
  a(on, "BufferReader");
  var sn = on;
  _t.BufferReader = sn;
});
var As = I((At) => {
  "use strict";
  p();
  Object.defineProperty(At, "__esModule", { value: true });
  At.Parser = void 0;
  var D2 = Xr(), ac = vs(), an = 1, uc = 4, xs = an + uc, _s = y.allocUnsafe(0), cn = class cn {
    constructor(e2) {
      if (this.buffer = _s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new ac.BufferReader(), e2?.mode === "binary")
        throw new Error("Binary mode not supported yet");
      this.mode = e2?.mode || "text";
    }
    parse(e2, t2) {
      this.mergeBuffer(e2);
      let n2 = this.bufferOffset + this.bufferLength, i4 = this.bufferOffset;
      for (; i4 + xs <= n2; ) {
        let s3 = this.buffer[i4], o3 = this.buffer.readUInt32BE(
          i4 + an
        ), u4 = an + o3;
        if (u4 + i4 <= n2) {
          let c3 = this.handlePacket(i4 + xs, s3, o3, this.buffer);
          t2(c3), i4 += u4;
        } else
          break;
      }
      i4 === n2 ? (this.buffer = _s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n2 - i4, this.bufferOffset = i4);
    }
    mergeBuffer(e2) {
      if (this.bufferLength > 0) {
        let t2 = this.bufferLength + e2.byteLength;
        if (t2 + this.bufferOffset > this.buffer.byteLength) {
          let i4;
          if (t2 <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength)
            i4 = this.buffer;
          else {
            let s3 = this.buffer.byteLength * 2;
            for (; t2 >= s3; )
              s3 *= 2;
            i4 = y.allocUnsafe(s3);
          }
          this.buffer.copy(
            i4,
            0,
            this.bufferOffset,
            this.bufferOffset + this.bufferLength
          ), this.buffer = i4, this.bufferOffset = 0;
        }
        e2.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t2;
      } else
        this.buffer = e2, this.bufferOffset = 0, this.bufferLength = e2.byteLength;
    }
    handlePacket(e2, t2, n2, i4) {
      switch (t2) {
        case 50:
          return D2.bindComplete;
        case 49:
          return D2.parseComplete;
        case 51:
          return D2.closeComplete;
        case 110:
          return D2.noData;
        case 115:
          return D2.portalSuspended;
        case 99:
          return D2.copyDone;
        case 87:
          return D2.replicationStart;
        case 73:
          return D2.emptyQuery;
        case 68:
          return this.parseDataRowMessage(
            e2,
            n2,
            i4
          );
        case 67:
          return this.parseCommandCompleteMessage(e2, n2, i4);
        case 90:
          return this.parseReadyForQueryMessage(e2, n2, i4);
        case 65:
          return this.parseNotificationMessage(
            e2,
            n2,
            i4
          );
        case 82:
          return this.parseAuthenticationResponse(e2, n2, i4);
        case 83:
          return this.parseParameterStatusMessage(e2, n2, i4);
        case 75:
          return this.parseBackendKeyData(e2, n2, i4);
        case 69:
          return this.parseErrorMessage(e2, n2, i4, "error");
        case 78:
          return this.parseErrorMessage(
            e2,
            n2,
            i4,
            "notice"
          );
        case 84:
          return this.parseRowDescriptionMessage(e2, n2, i4);
        case 116:
          return this.parseParameterDescriptionMessage(e2, n2, i4);
        case 71:
          return this.parseCopyInMessage(
            e2,
            n2,
            i4
          );
        case 72:
          return this.parseCopyOutMessage(e2, n2, i4);
        case 100:
          return this.parseCopyData(
            e2,
            n2,
            i4
          );
        default:
          return new D2.DatabaseError("received invalid response: " + t2.toString(
            16
          ), n2, "error");
      }
    }
    parseReadyForQueryMessage(e2, t2, n2) {
      this.reader.setBuffer(e2, n2);
      let i4 = this.reader.string(1);
      return new D2.ReadyForQueryMessage(t2, i4);
    }
    parseCommandCompleteMessage(e2, t2, n2) {
      this.reader.setBuffer(e2, n2);
      let i4 = this.reader.cstring();
      return new D2.CommandCompleteMessage(
        t2,
        i4
      );
    }
    parseCopyData(e2, t2, n2) {
      let i4 = n2.slice(e2, e2 + (t2 - 4));
      return new D2.CopyDataMessage(
        t2,
        i4
      );
    }
    parseCopyInMessage(e2, t2, n2) {
      return this.parseCopyMessage(e2, t2, n2, "copyInResponse");
    }
    parseCopyOutMessage(e2, t2, n2) {
      return this.parseCopyMessage(e2, t2, n2, "copyOutResponse");
    }
    parseCopyMessage(e2, t2, n2, i4) {
      this.reader.setBuffer(e2, n2);
      let s3 = this.reader.byte() !== 0, o3 = this.reader.int16(), u4 = new D2.CopyResponse(t2, i4, s3, o3);
      for (let c3 = 0; c3 < o3; c3++)
        u4.columnTypes[c3] = this.reader.int16();
      return u4;
    }
    parseNotificationMessage(e2, t2, n2) {
      this.reader.setBuffer(
        e2,
        n2
      );
      let i4 = this.reader.int32(), s3 = this.reader.cstring(), o3 = this.reader.cstring();
      return new D2.NotificationResponseMessage(t2, i4, s3, o3);
    }
    parseRowDescriptionMessage(e2, t2, n2) {
      this.reader.setBuffer(e2, n2);
      let i4 = this.reader.int16(), s3 = new D2.RowDescriptionMessage(t2, i4);
      for (let o3 = 0; o3 < i4; o3++)
        s3.fields[o3] = this.parseField();
      return s3;
    }
    parseField() {
      let e2 = this.reader.cstring(), t2 = this.reader.int32(), n2 = this.reader.int16(), i4 = this.reader.int32(), s3 = this.reader.int16(), o3 = this.reader.int32(), u4 = this.reader.int16() === 0 ? "text" : "binary";
      return new D2.Field(e2, t2, n2, i4, s3, o3, u4);
    }
    parseParameterDescriptionMessage(e2, t2, n2) {
      this.reader.setBuffer(
        e2,
        n2
      );
      let i4 = this.reader.int16(), s3 = new D2.ParameterDescriptionMessage(t2, i4);
      for (let o3 = 0; o3 < i4; o3++)
        s3.dataTypeIDs[o3] = this.reader.int32();
      return s3;
    }
    parseDataRowMessage(e2, t2, n2) {
      this.reader.setBuffer(e2, n2);
      let i4 = this.reader.int16(), s3 = new Array(i4);
      for (let o3 = 0; o3 < i4; o3++) {
        let u4 = this.reader.int32();
        s3[o3] = u4 === -1 ? null : this.reader.string(u4);
      }
      return new D2.DataRowMessage(
        t2,
        s3
      );
    }
    parseParameterStatusMessage(e2, t2, n2) {
      this.reader.setBuffer(e2, n2);
      let i4 = this.reader.cstring(), s3 = this.reader.cstring();
      return new D2.ParameterStatusMessage(t2, i4, s3);
    }
    parseBackendKeyData(e2, t2, n2) {
      this.reader.setBuffer(e2, n2);
      let i4 = this.reader.int32(), s3 = this.reader.int32();
      return new D2.BackendKeyDataMessage(t2, i4, s3);
    }
    parseAuthenticationResponse(e2, t2, n2) {
      this.reader.setBuffer(
        e2,
        n2
      );
      let i4 = this.reader.int32(), s3 = { name: "authenticationOk", length: t2 };
      switch (i4) {
        case 0:
          break;
        case 3:
          s3.length === 8 && (s3.name = "authenticationCleartextPassword");
          break;
        case 5:
          if (s3.length === 12) {
            s3.name = "authenticationMD5Password";
            let u4 = this.reader.bytes(4);
            return new D2.AuthenticationMD5Password(t2, u4);
          }
          break;
        case 10:
          s3.name = "authenticationSASL", s3.mechanisms = [];
          let o3;
          do
            o3 = this.reader.cstring(), o3 && s3.mechanisms.push(o3);
          while (o3);
          break;
        case 11:
          s3.name = "authenticationSASLContinue", s3.data = this.reader.string(t2 - 8);
          break;
        case 12:
          s3.name = "authenticationSASLFinal", s3.data = this.reader.string(t2 - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + i4);
      }
      return s3;
    }
    parseErrorMessage(e2, t2, n2, i4) {
      this.reader.setBuffer(e2, n2);
      let s3 = {}, o3 = this.reader.string(1);
      for (; o3 !== "\0"; )
        s3[o3] = this.reader.cstring(), o3 = this.reader.string(1);
      let u4 = s3.M, c3 = i4 === "notice" ? new D2.NoticeMessage(
        t2,
        u4
      ) : new D2.DatabaseError(u4, t2, i4);
      return c3.severity = s3.S, c3.code = s3.C, c3.detail = s3.D, c3.hint = s3.H, c3.position = s3.P, c3.internalPosition = s3.p, c3.internalQuery = s3.q, c3.where = s3.W, c3.schema = s3.s, c3.table = s3.t, c3.column = s3.c, c3.dataType = s3.d, c3.constraint = s3.n, c3.file = s3.F, c3.line = s3.L, c3.routine = s3.R, c3;
    }
  };
  a(cn, "Parser");
  var un = cn;
  At.Parser = un;
});
var hn = I((be) => {
  "use strict";
  p();
  Object.defineProperty(be, "__esModule", { value: true });
  be.DatabaseError = be.serialize = be.parse = void 0;
  var cc = Xr();
  Object.defineProperty(
    be,
    "DatabaseError",
    { enumerable: true, get: a(function() {
      return cc.DatabaseError;
    }, "get") }
  );
  var hc = Es();
  Object.defineProperty(be, "serialize", { enumerable: true, get: a(function() {
    return hc.serialize;
  }, "get") });
  var lc = As();
  function fc(r3, e2) {
    let t2 = new lc.Parser();
    return r3.on("data", (n2) => t2.parse(n2, e2)), new Promise((n2) => r3.on("end", () => n2()));
  }
  a(fc, "parse");
  be.parse = fc;
});
var Cs = {};
se(Cs, { connect: () => pc });
function pc({ socket: r3, servername: e2 }) {
  return r3.startTls(e2), r3;
}
var Ts = z(() => {
  "use strict";
  p();
  a(pc, "connect");
});
var pn = I((sf, Bs) => {
  "use strict";
  p();
  var Is = (St(), O(ws)), dc = ge().EventEmitter, {
    parse: yc,
    serialize: q2
  } = hn(), Ps = q2.flush(), mc = q2.sync(), gc = q2.end(), fn = class fn extends dc {
    constructor(e2) {
      super(), e2 = e2 || {}, this.stream = e2.stream || new Is.Socket(), this._keepAlive = e2.keepAlive, this._keepAliveInitialDelayMillis = e2.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e2.ssl || false, this._ending = false, this._emitMessage = false;
      var t2 = this;
      this.on("newListener", function(n2) {
        n2 === "message" && (t2._emitMessage = true);
      });
    }
    connect(e2, t2) {
      var n2 = this;
      this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(
        e2,
        t2
      ), this.stream.once("connect", function() {
        n2._keepAlive && n2.stream.setKeepAlive(
          true,
          n2._keepAliveInitialDelayMillis
        ), n2.emit("connect");
      });
      let i4 = a(function(s3) {
        n2._ending && (s3.code === "ECONNRESET" || s3.code === "EPIPE") || n2.emit("error", s3);
      }, "reportStreamError");
      if (this.stream.on("error", i4), this.stream.on("close", function() {
        n2.emit("end");
      }), !this.ssl)
        return this.attachListeners(this.stream);
      this.stream.once("data", function(s3) {
        var o3 = s3.toString("utf8");
        switch (o3) {
          case "S":
            break;
          case "N":
            return n2.stream.end(), n2.emit("error", new Error("The server does not support SSL connections"));
          default:
            return n2.stream.end(), n2.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        var u4 = (Ts(), O(Cs));
        let c3 = { socket: n2.stream };
        n2.ssl !== true && (Object.assign(
          c3,
          n2.ssl
        ), "key" in n2.ssl && (c3.key = n2.ssl.key)), Is.isIP(t2) === 0 && (c3.servername = t2);
        try {
          n2.stream = u4.connect(c3);
        } catch (h3) {
          return n2.emit("error", h3);
        }
        n2.attachListeners(n2.stream), n2.stream.on("error", i4), n2.emit("sslconnect");
      });
    }
    attachListeners(e2) {
      e2.on("end", () => {
        this.emit("end");
      }), yc(e2, (t2) => {
        var n2 = t2.name === "error" ? "errorMessage" : t2.name;
        this._emitMessage && this.emit("message", t2), this.emit(n2, t2);
      });
    }
    requestSsl() {
      this.stream.write(q2.requestSsl());
    }
    startup(e2) {
      this.stream.write(q2.startup(e2));
    }
    cancel(e2, t2) {
      this._send(q2.cancel(e2, t2));
    }
    password(e2) {
      this._send(q2.password(e2));
    }
    sendSASLInitialResponseMessage(e2, t2) {
      this._send(q2.sendSASLInitialResponseMessage(
        e2,
        t2
      ));
    }
    sendSCRAMClientFinalMessage(e2) {
      this._send(q2.sendSCRAMClientFinalMessage(e2));
    }
    _send(e2) {
      return this.stream.writable ? this.stream.write(e2) : false;
    }
    query(e2) {
      this._send(q2.query(
        e2
      ));
    }
    parse(e2) {
      this._send(q2.parse(e2));
    }
    bind(e2) {
      this._send(q2.bind(e2));
    }
    execute(e2) {
      this._send(q2.execute(e2));
    }
    flush() {
      this.stream.writable && this.stream.write(Ps);
    }
    sync() {
      this._ending = true, this._send(Ps), this._send(mc);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      if (this._ending = true, !this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(gc, () => {
        this.stream.end();
      });
    }
    close(e2) {
      this._send(q2.close(e2));
    }
    describe(e2) {
      this._send(q2.describe(e2));
    }
    sendCopyFromChunk(e2) {
      this._send(q2.copyData(e2));
    }
    endCopyFrom() {
      this._send(q2.copyDone());
    }
    sendCopyFail(e2) {
      this._send(q2.copyFail(e2));
    }
  };
  a(fn, "Connection");
  var ln = fn;
  Bs.exports = ln;
});
var Fs = I((cf, Rs) => {
  "use strict";
  p();
  var wc = ge().EventEmitter, uf = (Ge(), O(He)), bc = tt(), dn = ji(), Sc = Xi(), Ec = wt(), vc = bt(), Ls = ys(), xc = et(), _c = pn(), yn = class yn extends wc {
    constructor(e2) {
      super(), this.connectionParameters = new vc(e2), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }), this.replication = this.connectionParameters.replication;
      var t2 = e2 || {};
      this._Promise = t2.Promise || S.Promise, this._types = new Ec(t2.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t2.connection || new _c({ stream: t2.stream, ssl: this.connectionParameters.ssl, keepAlive: t2.keepAlive || false, keepAliveInitialDelayMillis: t2.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t2.binary || xc.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t2.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(e2) {
      let t2 = a(
        (n2) => {
          m.nextTick(() => {
            n2.handleError(e2, this.connection);
          });
        },
        "enqueueError"
      );
      this.activeQuery && (t2(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t2), this.queryQueue.length = 0;
    }
    _connect(e2) {
      var t2 = this, n2 = this.connection;
      if (this._connectionCallback = e2, this._connecting || this._connected) {
        let i4 = new Error("Client has already been connected. You cannot reuse a client.");
        m.nextTick(() => {
          e2(i4);
        });
        return;
      }
      this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
        n2._ending = true, n2.stream.destroy(new Error("timeout expired"));
      }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n2.connect(this.host + "/.s.PGSQL." + this.port) : n2.connect(this.port, this.host), n2.on("connect", function() {
        t2.ssl ? n2.requestSsl() : n2.startup(t2.getStartupConf());
      }), n2.on("sslconnect", function() {
        n2.startup(t2.getStartupConf());
      }), this._attachListeners(n2), n2.once("end", () => {
        let i4 = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i4), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i4) : this._handleErrorEvent(i4) : this._connectionError || this._handleErrorEvent(
          i4
        )), m.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(e2) {
      if (e2) {
        this._connect(e2);
        return;
      }
      return new this._Promise((t2, n2) => {
        this._connect((i4) => {
          i4 ? n2(i4) : t2();
        });
      });
    }
    _attachListeners(e2) {
      e2.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e2.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e2.on("authenticationSASL", this._handleAuthSASL.bind(this)), e2.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e2.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e2.on("backendKeyData", this._handleBackendKeyData.bind(this)), e2.on("error", this._handleErrorEvent.bind(this)), e2.on(
        "errorMessage",
        this._handleErrorMessage.bind(this)
      ), e2.on("readyForQuery", this._handleReadyForQuery.bind(this)), e2.on("notice", this._handleNotice.bind(this)), e2.on("rowDescription", this._handleRowDescription.bind(this)), e2.on("dataRow", this._handleDataRow.bind(this)), e2.on("portalSuspended", this._handlePortalSuspended.bind(this)), e2.on(
        "emptyQuery",
        this._handleEmptyQuery.bind(this)
      ), e2.on("commandComplete", this._handleCommandComplete.bind(this)), e2.on("parseComplete", this._handleParseComplete.bind(this)), e2.on("copyInResponse", this._handleCopyInResponse.bind(this)), e2.on("copyData", this._handleCopyData.bind(this)), e2.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(e2) {
      let t2 = this.connection;
      typeof this.password == "function" ? this._Promise.resolve().then(
        () => this.password()
      ).then((n2) => {
        if (n2 !== void 0) {
          if (typeof n2 != "string") {
            t2.emit("error", new TypeError("Password must be a string"));
            return;
          }
          this.connectionParameters.password = this.password = n2;
        } else
          this.connectionParameters.password = this.password = null;
        e2();
      }).catch((n2) => {
        t2.emit("error", n2);
      }) : this.password !== null ? e2() : Sc(
        this.connectionParameters,
        (n2) => {
          n2 !== void 0 && (this.connectionParameters.password = this.password = n2), e2();
        }
      );
    }
    _handleAuthCleartextPassword(e2) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(e2) {
      this._checkPgPass(() => {
        let t2 = bc.postgresMd5PasswordHash(
          this.user,
          this.password,
          e2.salt
        );
        this.connection.password(t2);
      });
    }
    _handleAuthSASL(e2) {
      this._checkPgPass(() => {
        this.saslSession = dn.startSession(e2.mechanisms), this.connection.sendSASLInitialResponseMessage(
          this.saslSession.mechanism,
          this.saslSession.response
        );
      });
    }
    _handleAuthSASLContinue(e2) {
      dn.continueSession(this.saslSession, this.password, e2.data), this.connection.sendSCRAMClientFinalMessage(
        this.saslSession.response
      );
    }
    _handleAuthSASLFinal(e2) {
      dn.finalizeSession(
        this.saslSession,
        e2.data
      ), this.saslSession = null;
    }
    _handleBackendKeyData(e2) {
      this.processID = e2.processID, this.secretKey = e2.secretKey;
    }
    _handleReadyForQuery(e2) {
      this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
      let { activeQuery: t2 } = this;
      this.activeQuery = null, this.readyForQuery = true, t2 && t2.handleReadyForQuery(this.connection), this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(e2) {
      if (!this._connectionError) {
        if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback)
          return this._connectionCallback(e2);
        this.emit("error", e2);
      }
    }
    _handleErrorEvent(e2) {
      if (this._connecting)
        return this._handleErrorWhileConnecting(e2);
      this._queryable = false, this._errorAllQueries(e2), this.emit("error", e2);
    }
    _handleErrorMessage(e2) {
      if (this._connecting)
        return this._handleErrorWhileConnecting(e2);
      let t2 = this.activeQuery;
      if (!t2) {
        this._handleErrorEvent(
          e2
        );
        return;
      }
      this.activeQuery = null, t2.handleError(e2, this.connection);
    }
    _handleRowDescription(e2) {
      this.activeQuery.handleRowDescription(e2);
    }
    _handleDataRow(e2) {
      this.activeQuery.handleDataRow(
        e2
      );
    }
    _handlePortalSuspended(e2) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(e2) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(e2) {
      this.activeQuery.handleCommandComplete(e2, this.connection);
    }
    _handleParseComplete(e2) {
      this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
    }
    _handleCopyInResponse(e2) {
      this.activeQuery.handleCopyInResponse(
        this.connection
      );
    }
    _handleCopyData(e2) {
      this.activeQuery.handleCopyData(e2, this.connection);
    }
    _handleNotification(e2) {
      this.emit("notification", e2);
    }
    _handleNotice(e2) {
      this.emit("notice", e2);
    }
    getStartupConf() {
      var e2 = this.connectionParameters, t2 = { user: e2.user, database: e2.database }, n2 = e2.application_name || e2.fallback_application_name;
      return n2 && (t2.application_name = n2), e2.replication && (t2.replication = "" + e2.replication), e2.statement_timeout && (t2.statement_timeout = String(parseInt(
        e2.statement_timeout,
        10
      ))), e2.lock_timeout && (t2.lock_timeout = String(parseInt(e2.lock_timeout, 10))), e2.idle_in_transaction_session_timeout && (t2.idle_in_transaction_session_timeout = String(parseInt(
        e2.idle_in_transaction_session_timeout,
        10
      ))), e2.options && (t2.options = e2.options), t2;
    }
    cancel(e2, t2) {
      if (e2.activeQuery === t2) {
        var n2 = this.connection;
        this.host && this.host.indexOf("/") === 0 ? n2.connect(this.host + "/.s.PGSQL." + this.port) : n2.connect(this.port, this.host), n2.on("connect", function() {
          n2.cancel(
            e2.processID,
            e2.secretKey
          );
        });
      } else
        e2.queryQueue.indexOf(t2) !== -1 && e2.queryQueue.splice(e2.queryQueue.indexOf(t2), 1);
    }
    setTypeParser(e2, t2, n2) {
      return this._types.setTypeParser(e2, t2, n2);
    }
    getTypeParser(e2, t2) {
      return this._types.getTypeParser(e2, t2);
    }
    escapeIdentifier(e2) {
      return '"' + e2.replace(
        /"/g,
        '""'
      ) + '"';
    }
    escapeLiteral(e2) {
      for (var t2 = false, n2 = "'", i4 = 0; i4 < e2.length; i4++) {
        var s3 = e2[i4];
        s3 === "'" ? n2 += s3 + s3 : s3 === "\\" ? (n2 += s3 + s3, t2 = true) : n2 += s3;
      }
      return n2 += "'", t2 === true && (n2 = " E" + n2), n2;
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true)
        if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
          this.readyForQuery = false, this.hasExecuted = true;
          let e2 = this.activeQuery.submit(this.connection);
          e2 && m.nextTick(() => {
            this.activeQuery.handleError(e2, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
          });
        } else
          this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
    }
    query(e2, t2, n2) {
      var i4, s3, o3, u4, c3;
      if (e2 == null)
        throw new TypeError("Client was passed a null or undefined query");
      return typeof e2.submit == "function" ? (o3 = e2.query_timeout || this.connectionParameters.query_timeout, s3 = i4 = e2, typeof t2 == "function" && (i4.callback = i4.callback || t2)) : (o3 = this.connectionParameters.query_timeout, i4 = new Ls(
        e2,
        t2,
        n2
      ), i4.callback || (s3 = new this._Promise((h3, l3) => {
        i4.callback = (d3, b2) => d3 ? l3(d3) : h3(b2);
      }))), o3 && (c3 = i4.callback, u4 = setTimeout(() => {
        var h3 = new Error("Query read timeout");
        m.nextTick(
          () => {
            i4.handleError(h3, this.connection);
          }
        ), c3(h3), i4.callback = () => {
        };
        var l3 = this.queryQueue.indexOf(i4);
        l3 > -1 && this.queryQueue.splice(l3, 1), this._pulseQueryQueue();
      }, o3), i4.callback = (h3, l3) => {
        clearTimeout(u4), c3(h3, l3);
      }), this.binary && !i4.binary && (i4.binary = true), i4._result && !i4._result._types && (i4._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
        i4.handleError(
          new Error("Client was closed and is not queryable"),
          this.connection
        );
      }), s3) : (this.queryQueue.push(i4), this._pulseQueryQueue(), s3) : (m.nextTick(
        () => {
          i4.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
        }
      ), s3);
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(e2) {
      if (this._ending = true, !this.connection._connecting)
        if (e2)
          e2();
        else
          return this._Promise.resolve();
      if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e2)
        this.connection.once("end", e2);
      else
        return new this._Promise((t2) => {
          this.connection.once("end", t2);
        });
    }
  };
  a(yn, "Client");
  var Ct = yn;
  Ct.Query = Ls;
  Rs.exports = Ct;
});
var Us = I((ff, ks) => {
  "use strict";
  p();
  var Ac = ge().EventEmitter, Ms = a(function() {
  }, "NOOP"), Ds = a(
    (r3, e2) => {
      let t2 = r3.findIndex(e2);
      return t2 === -1 ? void 0 : r3.splice(t2, 1)[0];
    },
    "removeWhere"
  ), wn = class wn {
    constructor(e2, t2, n2) {
      this.client = e2, this.idleListener = t2, this.timeoutId = n2;
    }
  };
  a(wn, "IdleItem");
  var mn = wn, bn = class bn {
    constructor(e2) {
      this.callback = e2;
    }
  };
  a(bn, "PendingItem");
  var qe = bn;
  function Cc() {
    throw new Error("Release called on client which has already been released to the pool.");
  }
  a(Cc, "throwOnDoubleRelease");
  function Tt(r3, e2) {
    if (e2)
      return { callback: e2, result: void 0 };
    let t2, n2, i4 = a(function(o3, u4) {
      o3 ? t2(o3) : n2(u4);
    }, "cb"), s3 = new r3(function(o3, u4) {
      n2 = o3, t2 = u4;
    }).catch((o3) => {
      throw Error.captureStackTrace(
        o3
      ), o3;
    });
    return { callback: i4, result: s3 };
  }
  a(Tt, "promisify");
  function Tc(r3, e2) {
    return a(
      function t2(n2) {
        n2.client = e2, e2.removeListener("error", t2), e2.on("error", () => {
          r3.log("additional client error after disconnection due to error", n2);
        }), r3._remove(e2), r3.emit("error", n2, e2);
      },
      "idleListener"
    );
  }
  a(Tc, "makeIdleListener");
  var Sn = class Sn extends Ac {
    constructor(e2, t2) {
      super(), this.options = Object.assign({}, e2), e2 != null && "password" in e2 && Object.defineProperty(
        this.options,
        "password",
        { configurable: true, enumerable: false, writable: true, value: e2.password }
      ), e2 != null && e2.ssl && e2.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {
      }, this.Client = this.options.Client || t2 || It().Client, this.Promise = this.options.Promise || S.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = /* @__PURE__ */ new WeakSet(), this._pendingQueue = [], this._endCallback = void 0, this.ending = false, this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _pulseQueue() {
      if (this.log("pulse queue"), this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log(
          "pulse queue on ending"
        ), this._idle.length && this._idle.slice().map((t2) => {
          this._remove(
            t2.client
          );
        }), this._clients.length || (this.ended = true, this._endCallback());
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull())
        return;
      let e2 = this._pendingQueue.shift();
      if (this._idle.length) {
        let t2 = this._idle.pop();
        clearTimeout(t2.timeoutId);
        let n2 = t2.client;
        n2.ref && n2.ref();
        let i4 = t2.idleListener;
        return this._acquireClient(n2, e2, i4, false);
      }
      if (!this._isFull())
        return this.newClient(e2);
      throw new Error("unexpected condition");
    }
    _remove(e2) {
      let t2 = Ds(this._idle, (n2) => n2.client === e2);
      t2 !== void 0 && clearTimeout(t2.timeoutId), this._clients = this._clients.filter((n2) => n2 !== e2), e2.end(), this.emit("remove", e2);
    }
    connect(e2) {
      if (this.ending) {
        let i4 = new Error("Cannot use a pool after calling end on the pool");
        return e2 ? e2(i4) : this.Promise.reject(
          i4
        );
      }
      let t2 = Tt(this.Promise, e2), n2 = t2.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis)
          return this._pendingQueue.push(new qe(t2.callback)), n2;
        let i4 = a((u4, c3, h3) => {
          clearTimeout(
            o3
          ), t2.callback(u4, c3, h3);
        }, "queueCallback"), s3 = new qe(i4), o3 = setTimeout(() => {
          Ds(
            this._pendingQueue,
            (u4) => u4.callback === i4
          ), s3.timedOut = true, t2.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        return this._pendingQueue.push(s3), n2;
      }
      return this.newClient(new qe(t2.callback)), n2;
    }
    newClient(e2) {
      let t2 = new this.Client(this.options);
      this._clients.push(t2);
      let n2 = Tc(this, t2);
      this.log("checking client timeout");
      let i4, s3 = false;
      this.options.connectionTimeoutMillis && (i4 = setTimeout(() => {
        this.log("ending client due to timeout"), s3 = true, t2.connection ? t2.connection.stream.destroy() : t2.end();
      }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t2.connect((o3) => {
        if (i4 && clearTimeout(i4), t2.on("error", n2), o3)
          this.log("client failed to connect", o3), this._clients = this._clients.filter((u4) => u4 !== t2), s3 && (o3.message = "Connection terminated due to connection timeout"), this._pulseQueue(), e2.timedOut || e2.callback(
            o3,
            void 0,
            Ms
          );
        else {
          if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
            let u4 = setTimeout(() => {
              this.log("ending client due to expired lifetime"), this._expired.add(t2), this._idle.findIndex((h3) => h3.client === t2) !== -1 && this._acquireClient(
                t2,
                new qe((h3, l3, d3) => d3()),
                n2,
                false
              );
            }, this.options.maxLifetimeSeconds * 1e3);
            u4.unref(), t2.once(
              "end",
              () => clearTimeout(u4)
            );
          }
          return this._acquireClient(t2, e2, n2, true);
        }
      });
    }
    _acquireClient(e2, t2, n2, i4) {
      i4 && this.emit("connect", e2), this.emit("acquire", e2), e2.release = this._releaseOnce(e2, n2), e2.removeListener("error", n2), t2.timedOut ? i4 && this.options.verify ? this.options.verify(
        e2,
        e2.release
      ) : e2.release() : i4 && this.options.verify ? this.options.verify(e2, (s3) => {
        if (s3)
          return e2.release(s3), t2.callback(s3, void 0, Ms);
        t2.callback(void 0, e2, e2.release);
      }) : t2.callback(
        void 0,
        e2,
        e2.release
      );
    }
    _releaseOnce(e2, t2) {
      let n2 = false;
      return (i4) => {
        n2 && Cc(), n2 = true, this._release(
          e2,
          t2,
          i4
        );
      };
    }
    _release(e2, t2, n2) {
      if (e2.on("error", t2), e2._poolUseCount = (e2._poolUseCount || 0) + 1, this.emit("release", n2, e2), n2 || this.ending || !e2._queryable || e2._ending || e2._poolUseCount >= this.options.maxUses) {
        e2._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e2), this._pulseQueue();
        return;
      }
      if (this._expired.has(e2)) {
        this.log("remove expired client"), this._expired.delete(e2), this._remove(e2), this._pulseQueue();
        return;
      }
      let s3;
      this.options.idleTimeoutMillis && (s3 = setTimeout(() => {
        this.log("remove idle client"), this._remove(e2);
      }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s3.unref()), this.options.allowExitOnIdle && e2.unref(), this._idle.push(new mn(e2, t2, s3)), this._pulseQueue();
    }
    query(e2, t2, n2) {
      if (typeof e2 == "function") {
        let s3 = Tt(this.Promise, e2);
        return E(function() {
          return s3.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        }), s3.result;
      }
      typeof t2 == "function" && (n2 = t2, t2 = void 0);
      let i4 = Tt(this.Promise, n2);
      return n2 = i4.callback, this.connect((s3, o3) => {
        if (s3)
          return n2(s3);
        let u4 = false, c3 = a((h3) => {
          u4 || (u4 = true, o3.release(h3), n2(h3));
        }, "onError");
        o3.once("error", c3), this.log("dispatching query");
        try {
          o3.query(e2, t2, (h3, l3) => {
            if (this.log("query dispatched"), o3.removeListener("error", c3), !u4)
              return u4 = true, o3.release(h3), h3 ? n2(h3) : n2(
                void 0,
                l3
              );
          });
        } catch (h3) {
          return o3.release(h3), n2(h3);
        }
      }), i4.result;
    }
    end(e2) {
      if (this.log("ending"), this.ending) {
        let n2 = new Error("Called end on pool more than once");
        return e2 ? e2(n2) : this.Promise.reject(n2);
      }
      this.ending = true;
      let t2 = Tt(this.Promise, e2);
      return this._endCallback = t2.callback, this._pulseQueue(), t2.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((e2, t2) => e2 + (this._expired.has(t2) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  };
  a(Sn, "Pool");
  var gn = Sn;
  ks.exports = gn;
});
var Os = {};
se(Os, { default: () => Ic });
var Ic;
var Ns = z(() => {
  "use strict";
  p();
  Ic = {};
});
var qs = I((mf, Pc) => {
  Pc.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
    "database",
    "libpq",
    "pg",
    "postgre",
    "postgres",
    "postgresql",
    "rdbms"
  ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: {
    "buffer-writer": "2.0.0",
    "packet-reader": "1.0.0",
    "pg-connection-string": "^2.5.0",
    "pg-pool": "^3.5.2",
    "pg-protocol": "^1.5.0",
    "pg-types": "^2.1.0",
    pgpass: "1.x"
  }, devDependencies: { async: "2.6.4", bluebird: "3.5.2", co: "4.6.0", "pg-copy-streams": "0.3.0" }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: {
    "pg-native": { optional: true }
  }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
});
var Ws = I((gf, js) => {
  "use strict";
  p();
  var Qs = ge().EventEmitter, Bc = (Ge(), O(He)), En = tt(), Qe = js.exports = function(r3, e2, t2) {
    Qs.call(this), r3 = En.normalizeQueryConfig(r3, e2, t2), this.text = r3.text, this.values = r3.values, this.name = r3.name, this.callback = r3.callback, this.state = "new", this._arrayMode = r3.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n2) {
      n2 === "row" && (this._emitRowEvents = true);
    }.bind(this));
  };
  Bc.inherits(
    Qe,
    Qs
  );
  var Lc = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
  Qe.prototype.handleError = function(r3) {
    var e2 = this.native.pq.resultErrorFields();
    if (e2)
      for (var t2 in e2) {
        var n2 = Lc[t2] || t2;
        r3[n2] = e2[t2];
      }
    this.callback ? this.callback(r3) : this.emit("error", r3), this.state = "error";
  };
  Qe.prototype.then = function(r3, e2) {
    return this._getPromise().then(r3, e2);
  };
  Qe.prototype.catch = function(r3) {
    return this._getPromise().catch(r3);
  };
  Qe.prototype._getPromise = function() {
    return this._promise ? this._promise : (this._promise = new Promise(function(r3, e2) {
      this._once("end", r3), this._once(
        "error",
        e2
      );
    }.bind(this)), this._promise);
  };
  Qe.prototype.submit = function(r3) {
    this.state = "running";
    var e2 = this;
    this.native = r3.native, r3.native.arrayMode = this._arrayMode;
    var t2 = a(
      function(s3, o3, u4) {
        if (r3.native.arrayMode = false, E(function() {
          e2.emit("_done");
        }), s3)
          return e2.handleError(s3);
        e2._emitRowEvents && (u4.length > 1 ? o3.forEach((c3, h3) => {
          c3.forEach((l3) => {
            e2.emit(
              "row",
              l3,
              u4[h3]
            );
          });
        }) : o3.forEach(function(c3) {
          e2.emit("row", c3, u4);
        })), e2.state = "end", e2.emit(
          "end",
          u4
        ), e2.callback && e2.callback(null, u4);
      },
      "after"
    );
    if (m.domain && (t2 = m.domain.bind(
      t2
    )), this.name) {
      this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error(
        "You supplied %s (%s)",
        this.name,
        this.name.length
      ), console.error("This can cause conflicts and silent errors executing queries"));
      var n2 = (this.values || []).map(En.prepareValue);
      if (r3.namedQueries[this.name]) {
        if (this.text && r3.namedQueries[this.name] !== this.text) {
          let s3 = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return t2(s3);
        }
        return r3.native.execute(this.name, n2, t2);
      }
      return r3.native.prepare(
        this.name,
        this.text,
        n2.length,
        function(s3) {
          return s3 ? t2(s3) : (r3.namedQueries[e2.name] = e2.text, e2.native.execute(e2.name, n2, t2));
        }
      );
    } else if (this.values) {
      if (!Array.isArray(this.values)) {
        let s3 = new Error("Query values must be an array");
        return t2(s3);
      }
      var i4 = this.values.map(En.prepareValue);
      r3.native.query(this.text, i4, t2);
    } else
      r3.native.query(this.text, t2);
  };
});
var Vs = I((Ef, $s) => {
  "use strict";
  p();
  var Rc = (Ns(), O(Os)), Fc = wt(), Sf = qs(), Hs = ge().EventEmitter, Mc = (Ge(), O(He)), Dc = bt(), Gs = Ws(), J = $s.exports = function(r3) {
    Hs.call(this), r3 = r3 || {}, this._Promise = r3.Promise || S.Promise, this._types = new Fc(r3.types), this.native = new Rc({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
    var e2 = this.connectionParameters = new Dc(
      r3
    );
    this.user = e2.user, Object.defineProperty(this, "password", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: e2.password
    }), this.database = e2.database, this.host = e2.host, this.port = e2.port, this.namedQueries = {};
  };
  J.Query = Gs;
  Mc.inherits(J, Hs);
  J.prototype._errorAllQueries = function(r3) {
    let e2 = a(
      (t2) => {
        m.nextTick(() => {
          t2.native = this.native, t2.handleError(r3);
        });
      },
      "enqueueError"
    );
    this._hasActiveQuery() && (e2(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e2), this._queryQueue.length = 0;
  };
  J.prototype._connect = function(r3) {
    var e2 = this;
    if (this._connecting) {
      m.nextTick(() => r3(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t2, n2) {
      if (t2)
        return r3(
          t2
        );
      e2.native.connect(n2, function(i4) {
        if (i4)
          return e2.native.end(), r3(i4);
        e2._connected = true, e2.native.on("error", function(s3) {
          e2._queryable = false, e2._errorAllQueries(s3), e2.emit("error", s3);
        }), e2.native.on("notification", function(s3) {
          e2.emit("notification", { channel: s3.relname, payload: s3.extra });
        }), e2.emit("connect"), e2._pulseQueryQueue(true), r3();
      });
    });
  };
  J.prototype.connect = function(r3) {
    if (r3) {
      this._connect(r3);
      return;
    }
    return new this._Promise(
      (e2, t2) => {
        this._connect((n2) => {
          n2 ? t2(n2) : e2();
        });
      }
    );
  };
  J.prototype.query = function(r3, e2, t2) {
    var n2, i4, s3, o3, u4;
    if (r3 == null)
      throw new TypeError("Client was passed a null or undefined query");
    if (typeof r3.submit == "function")
      s3 = r3.query_timeout || this.connectionParameters.query_timeout, i4 = n2 = r3, typeof e2 == "function" && (r3.callback = e2);
    else if (s3 = this.connectionParameters.query_timeout, n2 = new Gs(r3, e2, t2), !n2.callback) {
      let c3, h3;
      i4 = new this._Promise((l3, d3) => {
        c3 = l3, h3 = d3;
      }), n2.callback = (l3, d3) => l3 ? h3(l3) : c3(d3);
    }
    return s3 && (u4 = n2.callback, o3 = setTimeout(() => {
      var c3 = new Error("Query read timeout");
      m.nextTick(() => {
        n2.handleError(c3, this.connection);
      }), u4(c3), n2.callback = () => {
      };
      var h3 = this._queryQueue.indexOf(n2);
      h3 > -1 && this._queryQueue.splice(h3, 1), this._pulseQueryQueue();
    }, s3), n2.callback = (c3, h3) => {
      clearTimeout(o3), u4(c3, h3);
    }), this._queryable ? this._ending ? (n2.native = this.native, m.nextTick(() => {
      n2.handleError(
        new Error("Client was closed and is not queryable")
      );
    }), i4) : (this._queryQueue.push(
      n2
    ), this._pulseQueryQueue(), i4) : (n2.native = this.native, m.nextTick(() => {
      n2.handleError(
        new Error("Client has encountered a connection error and is not queryable")
      );
    }), i4);
  };
  J.prototype.end = function(r3) {
    var e2 = this;
    this._ending = true, this._connected || this.once(
      "connect",
      this.end.bind(this, r3)
    );
    var t2;
    return r3 || (t2 = new this._Promise(function(n2, i4) {
      r3 = a((s3) => s3 ? i4(s3) : n2(), "cb");
    })), this.native.end(function() {
      e2._errorAllQueries(new Error(
        "Connection terminated"
      )), m.nextTick(() => {
        e2.emit("end"), r3 && r3();
      });
    }), t2;
  };
  J.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  J.prototype._pulseQueryQueue = function(r3) {
    if (this._connected && !this._hasActiveQuery()) {
      var e2 = this._queryQueue.shift();
      if (!e2) {
        r3 || this.emit("drain");
        return;
      }
      this._activeQuery = e2, e2.submit(this);
      var t2 = this;
      e2.once(
        "_done",
        function() {
          t2._pulseQueryQueue();
        }
      );
    }
  };
  J.prototype.cancel = function(r3) {
    this._activeQuery === r3 ? this.native.cancel(function() {
    }) : this._queryQueue.indexOf(r3) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r3), 1);
  };
  J.prototype.ref = function() {
  };
  J.prototype.unref = function() {
  };
  J.prototype.setTypeParser = function(r3, e2, t2) {
    return this._types.setTypeParser(r3, e2, t2);
  };
  J.prototype.getTypeParser = function(r3, e2) {
    return this._types.getTypeParser(r3, e2);
  };
});
var vn = I((_f, Ks) => {
  "use strict";
  p();
  Ks.exports = Vs();
});
var It = I((Cf, nt) => {
  "use strict";
  p();
  var kc = Fs(), Uc = et(), Oc = pn(), Nc = Us(), { DatabaseError: qc } = hn(), Qc = a((r3) => {
    var e2;
    return e2 = class extends Nc {
      constructor(n2) {
        super(n2, r3);
      }
    }, a(e2, "BoundPool"), e2;
  }, "poolFactory"), xn = a(function(r3) {
    this.defaults = Uc, this.Client = r3, this.Query = this.Client.Query, this.Pool = Qc(this.Client), this._pools = [], this.Connection = Oc, this.types = Xe(), this.DatabaseError = qc;
  }, "PG");
  typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? nt.exports = new xn(vn()) : (nt.exports = new xn(kc), Object.defineProperty(nt.exports, "native", { configurable: true, enumerable: false, get() {
    var r3 = null;
    try {
      r3 = new xn(vn());
    } catch (e2) {
      if (e2.code !== "MODULE_NOT_FOUND")
        throw e2;
    }
    return Object.defineProperty(nt.exports, "native", { value: r3 }), r3;
  } }));
});
p();
var Bt = Ie(It());
St();
p();
St();
mr();
var Zs = Ie(tt());
var Js = Ie(wt());
var Pt = class Pt2 extends Error {
  constructor(t2) {
    super(t2);
    _(this, "name", "NeonDbError");
    _(this, "severity");
    _(this, "code");
    _(this, "detail");
    _(this, "hint");
    _(this, "position");
    _(this, "internalPosition");
    _(this, "internalQuery");
    _(this, "where");
    _(this, "schema");
    _(this, "table");
    _(this, "column");
    _(this, "dataType");
    _(this, "constraint");
    _(this, "file");
    _(this, "line");
    _(this, "routine");
    _(this, "sourceError");
    "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(
      this,
      Pt2
    );
  }
};
a(Pt, "NeonDbError");
var pe = Pt;
var zs = "transaction() expects an array of queries, or a function returning an array of queries";
var jc = [
  "severity",
  "code",
  "detail",
  "hint",
  "position",
  "internalPosition",
  "internalQuery",
  "where",
  "schema",
  "table",
  "column",
  "dataType",
  "constraint",
  "file",
  "line",
  "routine"
];
function Xs(r3, {
  arrayMode: e2,
  fullResults: t2,
  fetchOptions: n2,
  isolationLevel: i4,
  readOnly: s3,
  deferrable: o3,
  queryCallback: u4,
  resultCallback: c3,
  authToken: h3
} = {}) {
  if (!r3)
    throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  let l3;
  try {
    l3 = yr(r3);
  } catch {
    throw new Error("Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r3));
  }
  let {
    protocol: d3,
    username: b2,
    hostname: C3,
    port: B,
    pathname: Q
  } = l3;
  if (d3 !== "postgres:" && d3 !== "postgresql:" || !b2 || !C3 || !Q)
    throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
  function X(A3, ...g2) {
    let P3, K;
    if (typeof A3 == "string")
      P3 = A3, K = g2[1], g2 = g2[0] ?? [];
    else {
      P3 = "";
      for (let j3 = 0; j3 < A3.length; j3++)
        P3 += A3[j3], j3 < g2.length && (P3 += "$" + (j3 + 1));
    }
    g2 = g2.map((j3) => (0, Zs.prepareValue)(j3));
    let k3 = {
      query: P3,
      params: g2
    };
    return u4 && u4(k3), Wc(de, k3, K);
  }
  a(X, "resolve"), X.transaction = async (A3, g2) => {
    if (typeof A3 == "function" && (A3 = A3(X)), !Array.isArray(A3))
      throw new Error(zs);
    A3.forEach((k3) => {
      if (k3[Symbol.toStringTag] !== "NeonQueryPromise")
        throw new Error(zs);
    });
    let P3 = A3.map((k3) => k3.parameterizedQuery), K = A3.map((k3) => k3.opts ?? {});
    return de(P3, K, g2);
  };
  async function de(A3, g2, P3) {
    let {
      fetchEndpoint: K,
      fetchFunction: k3
    } = _e, j3 = typeof K == "function" ? K(C3, B, { jwtAuth: h3 !== void 0 }) : K, ue = Array.isArray(A3) ? { queries: A3 } : A3, ee = n2 ?? {}, R = e2 ?? false, $2 = t2 ?? false, ce = i4, ye = s3, Se = o3;
    P3 !== void 0 && (P3.fetchOptions !== void 0 && (ee = { ...ee, ...P3.fetchOptions }), P3.arrayMode !== void 0 && (R = P3.arrayMode), P3.fullResults !== void 0 && ($2 = P3.fullResults), P3.isolationLevel !== void 0 && (ce = P3.isolationLevel), P3.readOnly !== void 0 && (ye = P3.readOnly), P3.deferrable !== void 0 && (Se = P3.deferrable)), g2 !== void 0 && !Array.isArray(g2) && g2.fetchOptions !== void 0 && (ee = {
      ...ee,
      ...g2.fetchOptions
    });
    let Ae = h3;
    !Array.isArray(g2) && g2?.authToken !== void 0 && (Ae = g2.authToken);
    let he = { "Neon-Connection-String": r3, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" }, it = await Hc(Ae);
    it && (he.Authorization = `Bearer ${it}`), Array.isArray(A3) && (ce !== void 0 && (he["Neon-Batch-Isolation-Level"] = ce), ye !== void 0 && (he["Neon-Batch-Read-Only"] = String(ye)), Se !== void 0 && (he["Neon-Batch-Deferrable"] = String(
      Se
    )));
    let te;
    try {
      te = await (k3 ?? fetch)(j3, {
        method: "POST",
        body: JSON.stringify(ue),
        headers: he,
        ...ee
      });
    } catch (W) {
      let H = new pe(`Error connecting to database: ${W.message}`);
      throw H.sourceError = W, H;
    }
    if (te.ok) {
      let W = await te.json();
      if (Array.isArray(A3)) {
        let H = W.results;
        if (!Array.isArray(H))
          throw new pe("Neon internal error: unexpected result format");
        return H.map((Ce, Ee) => {
          let Lt = g2[Ee] ?? {}, ro = Lt.arrayMode ?? R, no = Lt.fullResults ?? $2;
          return Ys(Ce, {
            arrayMode: ro,
            fullResults: no,
            parameterizedQuery: A3[Ee],
            resultCallback: c3,
            types: Lt.types
          });
        });
      } else {
        let H = g2 ?? {}, Ce = H.arrayMode ?? R, Ee = H.fullResults ?? $2;
        return Ys(
          W,
          { arrayMode: Ce, fullResults: Ee, parameterizedQuery: A3, resultCallback: c3, types: H.types }
        );
      }
    } else {
      let { status: W } = te;
      if (W === 400) {
        let H = await te.json(), Ce = new pe(H.message);
        for (let Ee of jc)
          Ce[Ee] = H[Ee] ?? void 0;
        throw Ce;
      } else {
        let H = await te.text();
        throw new pe(`Server error (HTTP status ${W}): ${H}`);
      }
    }
  }
  return a(de, "execute"), X;
}
a(Xs, "neon");
function Wc(r3, e2, t2) {
  return { [Symbol.toStringTag]: "NeonQueryPromise", parameterizedQuery: e2, opts: t2, then: a(
    (n2, i4) => r3(e2, t2).then(n2, i4),
    "then"
  ), catch: a((n2) => r3(e2, t2).catch(n2), "catch"), finally: a((n2) => r3(
    e2,
    t2
  ).finally(n2), "finally") };
}
a(Wc, "createNeonQueryPromise");
function Ys(r3, {
  arrayMode: e2,
  fullResults: t2,
  parameterizedQuery: n2,
  resultCallback: i4,
  types: s3
}) {
  let o3 = new Js.default(
    s3
  ), u4 = r3.fields.map((l3) => l3.name), c3 = r3.fields.map((l3) => o3.getTypeParser(l3.dataTypeID)), h3 = e2 === true ? r3.rows.map((l3) => l3.map((d3, b2) => d3 === null ? null : c3[b2](d3))) : r3.rows.map((l3) => Object.fromEntries(
    l3.map((d3, b2) => [u4[b2], d3 === null ? null : c3[b2](d3)])
  ));
  return i4 && i4(n2, r3, h3, { arrayMode: e2, fullResults: t2 }), t2 ? (r3.viaNeonFetch = true, r3.rowAsArray = e2, r3.rows = h3, r3._parsers = c3, r3._types = o3, r3) : h3;
}
a(Ys, "processQueryResult");
async function Hc(r3) {
  if (typeof r3 == "string")
    return r3;
  if (typeof r3 == "function")
    try {
      return await Promise.resolve(r3());
    } catch (e2) {
      let t2 = new pe("Error getting auth token.");
      throw e2 instanceof Error && (t2 = new pe(`Error getting auth token: ${e2.message}`)), t2;
    }
}
a(Hc, "getAuthToken");
var to = Ie(bt());
var je = Ie(It());
var An = class An2 extends Bt.Client {
  constructor(t2) {
    super(t2);
    this.config = t2;
  }
  get neonConfig() {
    return this.connection.stream;
  }
  connect(t2) {
    let { neonConfig: n2 } = this;
    n2.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n2.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
    let i4 = this.config?.host !== void 0 || this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s3 = m.env.USER ?? m.env.USERNAME;
    if (!i4 && this.host === "localhost" && this.user === s3 && this.database === s3 && this.password === null)
      throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s3}, db: ${s3}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
    let o3 = super.connect(t2), u4 = n2.pipelineTLS && this.ssl, c3 = n2.pipelineConnect === "password";
    if (!u4 && !n2.pipelineConnect)
      return o3;
    let h3 = this.connection;
    if (u4 && h3.on("connect", () => h3.stream.emit("data", "S")), c3) {
      h3.removeAllListeners(
        "authenticationCleartextPassword"
      ), h3.removeAllListeners("readyForQuery"), h3.once(
        "readyForQuery",
        () => h3.on("readyForQuery", this._handleReadyForQuery.bind(this))
      );
      let l3 = this.ssl ? "sslconnect" : "connect";
      h3.on(l3, () => {
        this._handleAuthCleartextPassword(), this._handleReadyForQuery();
      });
    }
    return o3;
  }
  async _handleAuthSASLContinue(t2) {
    let n2 = this.saslSession, i4 = this.password, s3 = t2.data;
    if (n2.message !== "SASLInitialResponse" || typeof i4 != "string" || typeof s3 != "string")
      throw new Error("SASL: protocol error");
    let o3 = Object.fromEntries(s3.split(",").map((te) => {
      if (!/^.=/.test(te))
        throw new Error("SASL: Invalid attribute pair entry");
      let W = te[0], H = te.substring(2);
      return [W, H];
    })), u4 = o3.r, c3 = o3.s, h3 = o3.i;
    if (!u4 || !/^[!-+--~]+$/.test(u4))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
    if (!c3 || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(c3))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64");
    if (!h3 || !/^[1-9][0-9]*$/.test(h3))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count");
    if (!u4.startsWith(n2.clientNonce))
      throw new Error(
        "SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce"
      );
    if (u4.length === n2.clientNonce.length)
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    let l3 = parseInt(h3, 10), d3 = y.from(c3, "base64"), b2 = new TextEncoder(), C3 = b2.encode(i4), B = await w.subtle.importKey("raw", C3, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]), Q = new Uint8Array(await w.subtle.sign("HMAC", B, y.concat([d3, y.from(
      [0, 0, 0, 1]
    )]))), X = Q;
    for (var de = 0; de < l3 - 1; de++)
      Q = new Uint8Array(await w.subtle.sign(
        "HMAC",
        B,
        Q
      )), X = y.from(X.map((te, W) => X[W] ^ Q[W]));
    let A3 = X, g2 = await w.subtle.importKey(
      "raw",
      A3,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), P3 = new Uint8Array(await w.subtle.sign("HMAC", g2, b2.encode("Client Key"))), K = await w.subtle.digest(
      "SHA-256",
      P3
    ), k3 = "n=*,r=" + n2.clientNonce, j3 = "r=" + u4 + ",s=" + c3 + ",i=" + l3, ue = "c=biws,r=" + u4, ee = k3 + "," + j3 + "," + ue, R = await w.subtle.importKey(
      "raw",
      K,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    var $2 = new Uint8Array(await w.subtle.sign("HMAC", R, b2.encode(ee))), ce = y.from(P3.map((te, W) => P3[W] ^ $2[W])), ye = ce.toString("base64");
    let Se = await w.subtle.importKey(
      "raw",
      A3,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), Ae = await w.subtle.sign(
      "HMAC",
      Se,
      b2.encode("Server Key")
    ), he = await w.subtle.importKey("raw", Ae, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var it = y.from(await w.subtle.sign(
      "HMAC",
      he,
      b2.encode(ee)
    ));
    n2.message = "SASLResponse", n2.serverSignature = it.toString("base64"), n2.response = ue + ",p=" + ye, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
  }
};
a(An, "NeonClient");
var _n = An;
function Gc(r3, e2) {
  if (e2)
    return {
      callback: e2,
      result: void 0
    };
  let t2, n2, i4 = a(function(o3, u4) {
    o3 ? t2(o3) : n2(u4);
  }, "cb"), s3 = new r3(function(o3, u4) {
    n2 = o3, t2 = u4;
  });
  return { callback: i4, result: s3 };
}
a(Gc, "promisify");
var Cn = class Cn2 extends Bt.Pool {
  constructor() {
    super(...arguments);
    _(this, "Client", _n);
    _(this, "hasFetchUnsupportedListeners", false);
  }
  on(t2, n2) {
    return t2 !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t2, n2);
  }
  query(t2, n2, i4) {
    if (!_e.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t2 == "function")
      return super.query(t2, n2, i4);
    typeof n2 == "function" && (i4 = n2, n2 = void 0);
    let s3 = Gc(
      this.Promise,
      i4
    );
    i4 = s3.callback;
    try {
      let o3 = new to.default(this.options), u4 = encodeURIComponent, c3 = encodeURI, h3 = `postgresql://${u4(o3.user)}:${u4(o3.password)}@${u4(o3.host)}/${c3(o3.database)}`, l3 = typeof t2 == "string" ? t2 : t2.text, d3 = n2 ?? t2.values ?? [];
      Xs(h3, { fullResults: true, arrayMode: t2.rowMode === "array" })(l3, d3, { types: t2.types ?? this.options?.types }).then((C3) => i4(void 0, C3)).catch((C3) => i4(
        C3
      ));
    } catch (o3) {
      i4(o3);
    }
    return s3.result;
  }
};
a(Cn, "NeonPool");
var export_ClientBase = je.ClientBase;
var export_Connection = je.Connection;
var export_DatabaseError = je.DatabaseError;
var export_Query = je.Query;
var export_defaults = je.defaults;
var export_types = je.types;

// node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind");
var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

// node_modules/drizzle-orm/logger.js
var _a;
var ConsoleLogWriter = class {
  write(message2) {
    console.log(message2);
  }
};
_a = entityKind;
__publicField(ConsoleLogWriter, _a, "ConsoleLogWriter");
var _a2;
var DefaultLogger = class {
  writer;
  constructor(config) {
    this.writer = config?.writer ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p4) => {
      try {
        return JSON.stringify(p4);
      } catch {
        return String(p4);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
};
_a2 = entityKind;
__publicField(DefaultLogger, _a2, "DefaultLogger");
var _a3;
var NoopLogger = class {
  logQuery() {
  }
};
_a3 = entityKind;
__publicField(NoopLogger, _a3, "NoopLogger");

// node_modules/drizzle-orm/query-promise.js
var _a4;
var QueryPromise = class {
  [(_a4 = entityKind, Symbol.toStringTag)] = "QueryPromise";
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
};
__publicField(QueryPromise, _a4, "QueryPromise");

// node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");

// node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
var _a5;
var Table = class {
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [(_a5 = entityKind, TableName)];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /** @internal */
  [ExtraConfigColumns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = false;
  /** @internal */
  [IsDrizzleTable] = true;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
};
__publicField(Table, _a5, "Table");
/** @internal */
__publicField(Table, "Symbol", {
  Name: TableName,
  Schema,
  OriginalName,
  Columns,
  ExtraConfigColumns,
  BaseName,
  IsAlias,
  ExtraConfigBuilder
});
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}

// node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// node_modules/drizzle-orm/version.js
var version = "0.38.3";

// node_modules/drizzle-orm/tracing.js
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version);
    }
    return iife(
      (otel2, rawTracer2) => rawTracer2.startActiveSpan(
        name,
        (span) => {
          try {
            return fn(span);
          } catch (e2) {
            span.setStatus({
              code: otel2.SpanStatusCode.ERROR,
              message: e2 instanceof Error ? e2.message : "Unknown error"
              // eslint-disable-line no-instanceof/no-instanceof
            });
            throw e2;
          } finally {
            span.end();
          }
        }
      ),
      otel,
      rawTracer
    );
  }
};

// node_modules/drizzle-orm/column.js
var _a6;
var Column = class {
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  generated = void 0;
  generatedIdentity = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
};
_a6 = entityKind;
__publicField(Column, _a6, "Column");

// node_modules/drizzle-orm/column-builder.js
var _a7;
var ColumnBuilder = class {
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    if (this.config.name !== "")
      return;
    this.config.name = name;
  }
};
_a7 = entityKind;
__publicField(ColumnBuilder, _a7, "ColumnBuilder");

// node_modules/drizzle-orm/pg-core/foreign-keys.js
var _a8;
var ForeignKeyBuilder = class {
  /** @internal */
  reference;
  /** @internal */
  _onUpdate = "no action";
  /** @internal */
  _onDelete = "no action";
  constructor(config, actions2) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions2) {
      this._onUpdate = actions2.onUpdate;
      this._onDelete = actions2.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action === void 0 ? "no action" : action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action === void 0 ? "no action" : action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
};
_a8 = entityKind;
__publicField(ForeignKeyBuilder, _a8, "PgForeignKeyBuilder");
var _a9;
var ForeignKey = class {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};
_a9 = entityKind;
__publicField(ForeignKey, _a9, "PgForeignKey");

// node_modules/drizzle-orm/pg-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var _a10;
var UniqueConstraintBuilder = class {
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  /** @internal */
  columns;
  /** @internal */
  nullsNotDistinctConfig = false;
  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
};
_a10 = entityKind;
__publicField(UniqueConstraintBuilder, _a10, "PgUniqueConstraintBuilder");
var _a11;
var UniqueOnConstraintBuilder = class {
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
};
_a11 = entityKind;
__publicField(UniqueOnConstraintBuilder, _a11, "PgUniqueOnConstraintBuilder");
var _a12;
var UniqueConstraint = class {
  constructor(table, columns, nullsNotDistinct, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
    this.nullsNotDistinct = nullsNotDistinct;
  }
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
};
_a12 = entityKind;
__publicField(UniqueConstraint, _a12, "PgUniqueConstraint");

// node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i4 = startFrom; i4 < arrayString.length; i4++) {
    const char2 = arrayString[i4];
    if (char2 === "\\") {
      i4++;
      continue;
    }
    if (char2 === '"') {
      return [arrayString.slice(startFrom, i4).replace(/\\/g, ""), i4 + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char2 === "," || char2 === "}") {
      return [arrayString.slice(startFrom, i4).replace(/\\/g, ""), i4];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i4 = startFrom;
  let lastCharIsComma = false;
  while (i4 < arrayString.length) {
    const char2 = arrayString[i4];
    if (char2 === ",") {
      if (lastCharIsComma || i4 === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i4++;
      continue;
    }
    lastCharIsComma = false;
    if (char2 === "\\") {
      i4 += 2;
      continue;
    }
    if (char2 === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i4 + 1, true);
      result.push(value2);
      i4 = startFrom2;
      continue;
    }
    if (char2 === "}") {
      return [result, i4 + 1];
    }
    if (char2 === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i4 + 1);
      result.push(value2);
      i4 = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i4, false);
    result.push(value);
    i4 = newStartFrom;
  }
  return [result, i4];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}

// node_modules/drizzle-orm/pg-core/columns/common.js
var _a13;
var PgColumnBuilder = class extends ColumnBuilder {
  foreignKeyConfigs = [];
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions2 = {}) {
    this.foreignKeyConfigs.push({ ref, actions: actions2 });
    return this;
  }
  unique(name, config) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    this.config.uniqueType = config?.nulls;
    return this;
  }
  generatedAlwaysAs(as) {
    this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions: actions2 }) => {
      return iife(
        (ref2, actions22) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions22.onUpdate) {
            builder.onUpdate(actions22.onUpdate);
          }
          if (actions22.onDelete) {
            builder.onDelete(actions22.onDelete);
          }
          return builder.build(table);
        },
        ref,
        actions2
      );
    });
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
};
_a13 = entityKind;
__publicField(PgColumnBuilder, _a13, "PgColumnBuilder");
var _a14;
var PgColumn = class extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
};
_a14 = entityKind;
__publicField(PgColumn, _a14, "PgColumn");
var _a15;
var ExtraConfigColumn = class extends PgColumn {
  getSQLType() {
    return this.getSQLType();
  }
  indexConfig = {
    order: this.config.order ?? "asc",
    nulls: this.config.nulls ?? "last",
    opClass: this.config.opClass
  };
  defaultConfig = {
    order: "asc",
    nulls: "last",
    opClass: void 0
  };
  asc() {
    this.indexConfig.order = "asc";
    return this;
  }
  desc() {
    this.indexConfig.order = "desc";
    return this;
  }
  nullsFirst() {
    this.indexConfig.nulls = "first";
    return this;
  }
  nullsLast() {
    this.indexConfig.nulls = "last";
    return this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    this.indexConfig.opClass = opClass;
    return this;
  }
};
_a15 = entityKind;
__publicField(ExtraConfigColumn, _a15, "ExtraConfigColumn");
var _a16;
var IndexedColumn = class {
  constructor(name, keyAsName, type, indexConfig) {
    this.name = name;
    this.keyAsName = keyAsName;
    this.type = type;
    this.indexConfig = indexConfig;
  }
  name;
  keyAsName;
  type;
  indexConfig;
};
_a16 = entityKind;
__publicField(IndexedColumn, _a16, "IndexedColumn");
var _a17;
var PgArrayBuilder = class extends PgColumnBuilder {
  constructor(name, baseBuilder, size) {
    super(name, "array", "PgArray");
    this.config.baseBuilder = baseBuilder;
    this.config.size = size;
  }
  /** @internal */
  build(table) {
    const baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
};
_a17 = entityKind;
__publicField(PgArrayBuilder, _a17, "PgArrayBuilder");
var _a18;
var _PgArray = class extends PgColumn {
  constructor(table, config, baseColumn, range) {
    super(table, config);
    this.baseColumn = baseColumn;
    this.range = range;
    this.size = config.size;
  }
  size;
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      value = parsePgArray(value);
    }
    return value.map((v3) => this.baseColumn.mapFromDriverValue(v3));
  }
  mapToDriverValue(value, isNestedArray = false) {
    const a4 = value.map(
      (v3) => v3 === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v3, true) : this.baseColumn.mapToDriverValue(v3)
    );
    if (isNestedArray)
      return a4;
    return makePgArray(a4);
  }
};
var PgArray = _PgArray;
_a18 = entityKind;
__publicField(PgArray, _a18, "PgArray");

// node_modules/drizzle-orm/pg-core/columns/enum.js
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
var _a19;
var PgEnumColumnBuilder = class extends PgColumnBuilder {
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumColumn(
      table,
      this.config
    );
  }
};
_a19 = entityKind;
__publicField(PgEnumColumnBuilder, _a19, "PgEnumColumnBuilder");
var _a20;
var PgEnumColumn = class extends PgColumn {
  enum = this.config.enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config);
    this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};
_a20 = entityKind;
__publicField(PgEnumColumn, _a20, "PgEnumColumn");

// node_modules/drizzle-orm/subquery.js
var _a21;
var Subquery = class {
  constructor(sql2, selection, alias, isWith = false) {
    this._ = {
      brand: "Subquery",
      sql: sql2,
      selectedFields: selection,
      alias,
      isWith
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
};
_a21 = entityKind;
__publicField(Subquery, _a21, "Subquery");
var _a22;
var WithSubquery = class extends Subquery {
};
_a22 = entityKind;
__publicField(WithSubquery, _a22, "WithSubquery");

// node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

// node_modules/drizzle-orm/sql/sql.js
var _a23;
var FakePrimitiveParam = class {
};
_a23 = entityKind;
__publicField(FakePrimitiveParam, _a23, "FakePrimitiveParam");
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
var _a24;
var StringChunk = class {
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
};
_a24 = entityKind;
__publicField(StringChunk, _a24, "StringChunk");
var _a25;
var _SQL = class {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
  }
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = false;
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i4, p4] of chunk.entries()) {
          result.push(p4);
          if (i4 < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, _SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new _SQL.Aliased(this, alias);
  }
  mapWith(decoder3) {
    this.decoder = typeof decoder3 === "function" ? { mapFromDriverValue: decoder3 } : decoder3;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
};
var SQL = _SQL;
_a25 = entityKind;
__publicField(SQL, _a25, "SQL");
var _a26;
var Name = class {
  constructor(value) {
    this.value = value;
  }
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
_a26 = entityKind;
__publicField(Name, _a26, "Name");
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
var noopDecoder = {
  mapFromDriverValue: (value) => value
};
var noopEncoder = {
  mapToDriverValue: (value) => value
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};
var _a27;
var Param = class {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder3 = noopEncoder) {
    this.value = value;
    this.encoder = encoder3;
  }
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
_a27 = entityKind;
__publicField(Param, _a27, "Param");
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw3(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw3;
  function join(chunks, separator) {
    const result = [];
    for (const [i4, chunk] of chunks.entries()) {
      if (i4 > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder3) {
    return new Param(value, encoder3);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var _a28;
var Placeholder = class {
  constructor(name2) {
    this.name = name2;
  }
  getSQL() {
    return new SQL([this]);
  }
};
_a28 = entityKind;
__publicField(Placeholder, _a28, "Placeholder");
function fillPlaceholders(params, values) {
  return params.map((p4) => {
    if (is(p4, Placeholder)) {
      if (!(p4.name in values)) {
        throw new Error(`No value for placeholder "${p4.name}" was provided`);
      }
      return values[p4.name];
    }
    if (is(p4, Param) && is(p4.value, Placeholder)) {
      if (!(p4.value.name in values)) {
        throw new Error(`No value for placeholder "${p4.value.name}" was provided`);
      }
      return p4.encoder.mapToDriverValue(values[p4.value.name]);
    }
    return p4;
  });
}
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
var _a29;
var View = class {
  /** @internal */
  [(_a29 = entityKind, ViewBaseConfig)];
  /** @internal */
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
};
__publicField(View, _a29, "View");
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path, field }, columnIndex) => {
      let decoder3;
      if (is(field, Column)) {
        decoder3 = field;
      } else if (is(field, SQL)) {
        decoder3 = field.decoder;
      } else {
        decoder3 = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path.entries()) {
        if (pathChunkIndex < path.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder3.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            const objectName = path[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor")
        continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a4, b2) {
  return {
    name: typeof a4 === "string" && a4.length > 0 ? a4 : "",
    config: typeof a4 === "object" ? a4 : b2
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null)
    return false;
  if (data.constructor.name !== "Object")
    return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined")
      return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["logger"];
    if (type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["logger"];
    if (type !== "string" && type !== "undefined")
      return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0)
      return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined")
      return false;
    return true;
  }
  if (Object.keys(data).length === 0)
    return true;
  return false;
}

// node_modules/drizzle-orm/pg-core/query-builders/delete.js
var _a30;
var PgDeleteBase = class extends QueryPromise {
  constructor(table, session2, dialect, withList) {
    super();
    this.session = session2;
    this.dialect = dialect;
    this.config = { table, withList };
  }
  config;
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * await db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * await db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * await db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields = this.config.table[Table.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
  $dynamic() {
    return this;
  }
};
_a30 = entityKind;
__publicField(PgDeleteBase, _a30, "PgDelete");

// node_modules/drizzle-orm/alias.js
var _a31;
var ColumnAliasProxyHandler = class {
  constructor(table) {
    this.table = table;
  }
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
};
_a31 = entityKind;
__publicField(ColumnAliasProxyHandler, _a31, "ColumnAliasProxyHandler");
var _a32;
var TableAliasProxyHandler = class {
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
};
_a32 = entityKind;
__publicField(TableAliasProxyHandler, _a32, "TableAliasProxyHandler");
var _a33;
var RelationTableAliasProxyHandler = class {
  constructor(alias) {
    this.alias = alias;
  }
  get(target, prop) {
    if (prop === "sourceTable") {
      return aliasedTable(target.sourceTable, this.alias);
    }
    return target[prop];
  }
};
_a33 = entityKind;
__publicField(RelationTableAliasProxyHandler, _a33, "RelationTableAliasProxyHandler");
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c3) => {
    if (is(c3, Column)) {
      return aliasedTableColumn(c3, alias);
    }
    if (is(c3, SQL)) {
      return mapColumnsInSQLToAlias(c3, alias);
    }
    if (is(c3, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c3, alias);
    }
    return c3;
  }));
}

// node_modules/drizzle-orm/casing.js
function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i4) => {
    const formattedWord = i4 === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
var _a34;
var CasingCache = class {
  /** @internal */
  cache = {};
  cachedTables = {};
  convert;
  constructor(casing) {
    this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
  }
  getColumnCasing(column) {
    if (!column.keyAsName)
      return column.name;
    const schema = column.table[Table.Symbol.Schema] ?? "public";
    const tableName = column.table[Table.Symbol.OriginalName];
    const key = `${schema}.${tableName}.${column.name}`;
    if (!this.cache[key]) {
      this.cacheTable(column.table);
    }
    return this.cache[key];
  }
  cacheTable(table) {
    const schema = table[Table.Symbol.Schema] ?? "public";
    const tableName = table[Table.Symbol.OriginalName];
    const tableKey = `${schema}.${tableName}`;
    if (!this.cachedTables[tableKey]) {
      for (const column of Object.values(table[Table.Symbol.Columns])) {
        const columnKey = `${tableKey}.${column.name}`;
        this.cache[columnKey] = this.convert(column.name);
      }
      this.cachedTables[tableKey] = true;
    }
  }
  clearCache() {
    this.cache = {};
    this.cachedTables = {};
  }
};
_a34 = entityKind;
__publicField(CasingCache, _a34, "CasingCache");

// node_modules/drizzle-orm/errors.js
var _a35;
var DrizzleError = class extends Error {
  constructor({ message: message2, cause }) {
    super(message2);
    this.name = "DrizzleError";
    this.cause = cause;
  }
};
_a35 = entityKind;
__publicField(DrizzleError, _a35, "DrizzleError");
var _a36;
var TransactionRollbackError = class extends DrizzleError {
  constructor() {
    super({ message: "Rollback" });
  }
};
_a36 = entityKind;
__publicField(TransactionRollbackError, _a36, "TransactionRollbackError");

// node_modules/drizzle-orm/pg-core/columns/int.common.js
var _a37;
var PgIntColumnBaseBuilder = class extends PgColumnBuilder {
  generatedAlwaysAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "always",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "always"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
  generatedByDefaultAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "byDefault",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "byDefault"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
};
_a37 = entityKind;
__publicField(PgIntColumnBaseBuilder, _a37, "PgIntColumnBaseBuilder");

// node_modules/drizzle-orm/pg-core/columns/bigint.js
var _a38;
var PgBigInt53Builder = class extends PgIntColumnBaseBuilder {
  constructor(name) {
    super(name, "number", "PgBigInt53");
  }
  /** @internal */
  build(table) {
    return new PgBigInt53(table, this.config);
  }
};
_a38 = entityKind;
__publicField(PgBigInt53Builder, _a38, "PgBigInt53Builder");
var _a39;
var PgBigInt53 = class extends PgColumn {
  getSQLType() {
    return "bigint";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
_a39 = entityKind;
__publicField(PgBigInt53, _a39, "PgBigInt53");
var _a40;
var PgBigInt64Builder = class extends PgIntColumnBaseBuilder {
  constructor(name) {
    super(name, "bigint", "PgBigInt64");
  }
  /** @internal */
  build(table) {
    return new PgBigInt64(
      table,
      this.config
    );
  }
};
_a40 = entityKind;
__publicField(PgBigInt64Builder, _a40, "PgBigInt64Builder");
var _a41;
var PgBigInt64 = class extends PgColumn {
  getSQLType() {
    return "bigint";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
_a41 = entityKind;
__publicField(PgBigInt64, _a41, "PgBigInt64");
function bigint(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  if (config.mode === "number") {
    return new PgBigInt53Builder(name);
  }
  return new PgBigInt64Builder(name);
}

// node_modules/drizzle-orm/pg-core/columns/bigserial.js
var _a42;
var PgBigSerial53Builder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "number", "PgBigSerial53");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial53(
      table,
      this.config
    );
  }
};
_a42 = entityKind;
__publicField(PgBigSerial53Builder, _a42, "PgBigSerial53Builder");
var _a43;
var PgBigSerial53 = class extends PgColumn {
  getSQLType() {
    return "bigserial";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
_a43 = entityKind;
__publicField(PgBigSerial53, _a43, "PgBigSerial53");
var _a44;
var PgBigSerial64Builder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "bigint", "PgBigSerial64");
    this.config.hasDefault = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial64(
      table,
      this.config
    );
  }
};
_a44 = entityKind;
__publicField(PgBigSerial64Builder, _a44, "PgBigSerial64Builder");
var _a45;
var PgBigSerial64 = class extends PgColumn {
  getSQLType() {
    return "bigserial";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
_a45 = entityKind;
__publicField(PgBigSerial64, _a45, "PgBigSerial64");
function bigserial(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  if (config.mode === "number") {
    return new PgBigSerial53Builder(name);
  }
  return new PgBigSerial64Builder(name);
}

// node_modules/drizzle-orm/pg-core/columns/boolean.js
var _a46;
var PgBooleanBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "boolean", "PgBoolean");
  }
  /** @internal */
  build(table) {
    return new PgBoolean(table, this.config);
  }
};
_a46 = entityKind;
__publicField(PgBooleanBuilder, _a46, "PgBooleanBuilder");
var _a47;
var PgBoolean = class extends PgColumn {
  getSQLType() {
    return "boolean";
  }
};
_a47 = entityKind;
__publicField(PgBoolean, _a47, "PgBoolean");
function boolean(name) {
  return new PgBooleanBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/char.js
var _a48;
var PgCharBuilder = class extends PgColumnBuilder {
  constructor(name, config) {
    super(name, "string", "PgChar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgChar(
      table,
      this.config
    );
  }
};
_a48 = entityKind;
__publicField(PgCharBuilder, _a48, "PgCharBuilder");
var _a49;
var PgChar = class extends PgColumn {
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `char` : `char(${this.length})`;
  }
};
_a49 = entityKind;
__publicField(PgChar, _a49, "PgChar");
function char(a4, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgCharBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/cidr.js
var _a50;
var PgCidrBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "string", "PgCidr");
  }
  /** @internal */
  build(table) {
    return new PgCidr(table, this.config);
  }
};
_a50 = entityKind;
__publicField(PgCidrBuilder, _a50, "PgCidrBuilder");
var _a51;
var PgCidr = class extends PgColumn {
  getSQLType() {
    return "cidr";
  }
};
_a51 = entityKind;
__publicField(PgCidr, _a51, "PgCidr");
function cidr(name) {
  return new PgCidrBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/custom.js
var _a52;
var PgCustomColumnBuilder = class extends PgColumnBuilder {
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "PgCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new PgCustomColumn(
      table,
      this.config
    );
  }
};
_a52 = entityKind;
__publicField(PgCustomColumnBuilder, _a52, "PgCustomColumnBuilder");
var _a53;
var PgCustomColumn = class extends PgColumn {
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
};
_a53 = entityKind;
__publicField(PgCustomColumn, _a53, "PgCustomColumn");
function customType(customTypeParams) {
  return (a4, b2) => {
    const { name, config } = getColumnNameAndConfig(a4, b2);
    return new PgCustomColumnBuilder(name, config, customTypeParams);
  };
}

// node_modules/drizzle-orm/pg-core/columns/date.common.js
var _a54;
var PgDateColumnBaseBuilder = class extends PgColumnBuilder {
  defaultNow() {
    return this.default(sql`now()`);
  }
};
_a54 = entityKind;
__publicField(PgDateColumnBaseBuilder, _a54, "PgDateColumnBaseBuilder");

// node_modules/drizzle-orm/pg-core/columns/date.js
var _a55;
var PgDateBuilder = class extends PgDateColumnBaseBuilder {
  constructor(name) {
    super(name, "date", "PgDate");
  }
  /** @internal */
  build(table) {
    return new PgDate(table, this.config);
  }
};
_a55 = entityKind;
__publicField(PgDateBuilder, _a55, "PgDateBuilder");
var _a56;
var PgDate = class extends PgColumn {
  getSQLType() {
    return "date";
  }
  mapFromDriverValue(value) {
    return new Date(value);
  }
  mapToDriverValue(value) {
    return value.toISOString();
  }
};
_a56 = entityKind;
__publicField(PgDate, _a56, "PgDate");
var _a57;
var PgDateStringBuilder = class extends PgDateColumnBaseBuilder {
  constructor(name) {
    super(name, "string", "PgDateString");
  }
  /** @internal */
  build(table) {
    return new PgDateString(
      table,
      this.config
    );
  }
};
_a57 = entityKind;
__publicField(PgDateStringBuilder, _a57, "PgDateStringBuilder");
var _a58;
var PgDateString = class extends PgColumn {
  getSQLType() {
    return "date";
  }
};
_a58 = entityKind;
__publicField(PgDateString, _a58, "PgDateString");
function date(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  if (config?.mode === "date") {
    return new PgDateBuilder(name);
  }
  return new PgDateStringBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/double-precision.js
var _a59;
var PgDoublePrecisionBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "number", "PgDoublePrecision");
  }
  /** @internal */
  build(table) {
    return new PgDoublePrecision(
      table,
      this.config
    );
  }
};
_a59 = entityKind;
__publicField(PgDoublePrecisionBuilder, _a59, "PgDoublePrecisionBuilder");
var _a60;
var PgDoublePrecision = class extends PgColumn {
  getSQLType() {
    return "double precision";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  }
};
_a60 = entityKind;
__publicField(PgDoublePrecision, _a60, "PgDoublePrecision");
function doublePrecision(name) {
  return new PgDoublePrecisionBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/inet.js
var _a61;
var PgInetBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "string", "PgInet");
  }
  /** @internal */
  build(table) {
    return new PgInet(table, this.config);
  }
};
_a61 = entityKind;
__publicField(PgInetBuilder, _a61, "PgInetBuilder");
var _a62;
var PgInet = class extends PgColumn {
  getSQLType() {
    return "inet";
  }
};
_a62 = entityKind;
__publicField(PgInet, _a62, "PgInet");
function inet(name) {
  return new PgInetBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/integer.js
var _a63;
var PgIntegerBuilder = class extends PgIntColumnBaseBuilder {
  constructor(name) {
    super(name, "number", "PgInteger");
  }
  /** @internal */
  build(table) {
    return new PgInteger(table, this.config);
  }
};
_a63 = entityKind;
__publicField(PgIntegerBuilder, _a63, "PgIntegerBuilder");
var _a64;
var PgInteger = class extends PgColumn {
  getSQLType() {
    return "integer";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseInt(value);
    }
    return value;
  }
};
_a64 = entityKind;
__publicField(PgInteger, _a64, "PgInteger");
function integer(name) {
  return new PgIntegerBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/interval.js
var _a65;
var PgIntervalBuilder = class extends PgColumnBuilder {
  constructor(name, intervalConfig) {
    super(name, "string", "PgInterval");
    this.config.intervalConfig = intervalConfig;
  }
  /** @internal */
  build(table) {
    return new PgInterval(table, this.config);
  }
};
_a65 = entityKind;
__publicField(PgIntervalBuilder, _a65, "PgIntervalBuilder");
var _a66;
var PgInterval = class extends PgColumn {
  fields = this.config.intervalConfig.fields;
  precision = this.config.intervalConfig.precision;
  getSQLType() {
    const fields = this.fields ? ` ${this.fields}` : "";
    const precision = this.precision ? `(${this.precision})` : "";
    return `interval${fields}${precision}`;
  }
};
_a66 = entityKind;
__publicField(PgInterval, _a66, "PgInterval");
function interval(a4, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgIntervalBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/json.js
var _a67;
var PgJsonBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "json", "PgJson");
  }
  /** @internal */
  build(table) {
    return new PgJson(table, this.config);
  }
};
_a67 = entityKind;
__publicField(PgJsonBuilder, _a67, "PgJsonBuilder");
var _a68;
var PgJson = class extends PgColumn {
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "json";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
_a68 = entityKind;
__publicField(PgJson, _a68, "PgJson");
function json(name) {
  return new PgJsonBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/jsonb.js
var _a69;
var PgJsonbBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "json", "PgJsonb");
  }
  /** @internal */
  build(table) {
    return new PgJsonb(table, this.config);
  }
};
_a69 = entityKind;
__publicField(PgJsonbBuilder, _a69, "PgJsonbBuilder");
var _a70;
var PgJsonb = class extends PgColumn {
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "jsonb";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
_a70 = entityKind;
__publicField(PgJsonb, _a70, "PgJsonb");
function jsonb(name) {
  return new PgJsonbBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/line.js
var _a71;
var PgLineBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "array", "PgLine");
  }
  /** @internal */
  build(table) {
    return new PgLineTuple(
      table,
      this.config
    );
  }
};
_a71 = entityKind;
__publicField(PgLineBuilder, _a71, "PgLineBuilder");
var _a72;
var PgLineTuple = class extends PgColumn {
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a4, b2, c3] = value.slice(1, -1).split(",");
    return [Number.parseFloat(a4), Number.parseFloat(b2), Number.parseFloat(c3)];
  }
  mapToDriverValue(value) {
    return `{${value[0]},${value[1]},${value[2]}}`;
  }
};
_a72 = entityKind;
__publicField(PgLineTuple, _a72, "PgLine");
var _a73;
var PgLineABCBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "json", "PgLineABC");
  }
  /** @internal */
  build(table) {
    return new PgLineABC(
      table,
      this.config
    );
  }
};
_a73 = entityKind;
__publicField(PgLineABCBuilder, _a73, "PgLineABCBuilder");
var _a74;
var PgLineABC = class extends PgColumn {
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a4, b2, c3] = value.slice(1, -1).split(",");
    return { a: Number.parseFloat(a4), b: Number.parseFloat(b2), c: Number.parseFloat(c3) };
  }
  mapToDriverValue(value) {
    return `{${value.a},${value.b},${value.c}}`;
  }
};
_a74 = entityKind;
__publicField(PgLineABC, _a74, "PgLineABC");
function line(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  if (!config?.mode || config.mode === "tuple") {
    return new PgLineBuilder(name);
  }
  return new PgLineABCBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/macaddr.js
var _a75;
var PgMacaddrBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "string", "PgMacaddr");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr(table, this.config);
  }
};
_a75 = entityKind;
__publicField(PgMacaddrBuilder, _a75, "PgMacaddrBuilder");
var _a76;
var PgMacaddr = class extends PgColumn {
  getSQLType() {
    return "macaddr";
  }
};
_a76 = entityKind;
__publicField(PgMacaddr, _a76, "PgMacaddr");
function macaddr(name) {
  return new PgMacaddrBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/macaddr8.js
var _a77;
var PgMacaddr8Builder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "string", "PgMacaddr8");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr8(table, this.config);
  }
};
_a77 = entityKind;
__publicField(PgMacaddr8Builder, _a77, "PgMacaddr8Builder");
var _a78;
var PgMacaddr8 = class extends PgColumn {
  getSQLType() {
    return "macaddr8";
  }
};
_a78 = entityKind;
__publicField(PgMacaddr8, _a78, "PgMacaddr8");
function macaddr8(name) {
  return new PgMacaddr8Builder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/numeric.js
var _a79;
var PgNumericBuilder = class extends PgColumnBuilder {
  constructor(name, precision, scale) {
    super(name, "string", "PgNumeric");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumeric(table, this.config);
  }
};
_a79 = entityKind;
__publicField(PgNumericBuilder, _a79, "PgNumericBuilder");
var _a80;
var PgNumeric = class extends PgColumn {
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
};
_a80 = entityKind;
__publicField(PgNumeric, _a80, "PgNumeric");
function numeric(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgNumericBuilder(name, config?.precision, config?.scale);
}

// node_modules/drizzle-orm/pg-core/columns/point.js
var _a81;
var PgPointTupleBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "array", "PgPointTuple");
  }
  /** @internal */
  build(table) {
    return new PgPointTuple(
      table,
      this.config
    );
  }
};
_a81 = entityKind;
__publicField(PgPointTupleBuilder, _a81, "PgPointTupleBuilder");
var _a82;
var PgPointTuple = class extends PgColumn {
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x4, y3] = value.slice(1, -1).split(",");
      return [Number.parseFloat(x4), Number.parseFloat(y3)];
    }
    return [value.x, value.y];
  }
  mapToDriverValue(value) {
    return `(${value[0]},${value[1]})`;
  }
};
_a82 = entityKind;
__publicField(PgPointTuple, _a82, "PgPointTuple");
var _a83;
var PgPointObjectBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "json", "PgPointObject");
  }
  /** @internal */
  build(table) {
    return new PgPointObject(
      table,
      this.config
    );
  }
};
_a83 = entityKind;
__publicField(PgPointObjectBuilder, _a83, "PgPointObjectBuilder");
var _a84;
var PgPointObject = class extends PgColumn {
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x4, y3] = value.slice(1, -1).split(",");
      return { x: Number.parseFloat(x4), y: Number.parseFloat(y3) };
    }
    return value;
  }
  mapToDriverValue(value) {
    return `(${value.x},${value.y})`;
  }
};
_a84 = entityKind;
__publicField(PgPointObject, _a84, "PgPointObject");
function point(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  if (!config?.mode || config.mode === "tuple") {
    return new PgPointTupleBuilder(name);
  }
  return new PgPointObjectBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.js
function hexToBytes(hex) {
  const bytes = [];
  for (let c3 = 0; c3 < hex.length; c3 += 2) {
    bytes.push(Number.parseInt(hex.slice(c3, c3 + 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToFloat64(bytes, offset) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i4 = 0; i4 < 8; i4++) {
    view.setUint8(i4, bytes[offset + i4]);
  }
  return view.getFloat64(0, true);
}
function parseEWKB(hex) {
  const bytes = hexToBytes(hex);
  let offset = 0;
  const byteOrder = bytes[offset];
  offset += 1;
  const view = new DataView(bytes.buffer);
  const geomType = view.getUint32(offset, byteOrder === 1);
  offset += 4;
  let _srid;
  if (geomType & 536870912) {
    _srid = view.getUint32(offset, byteOrder === 1);
    offset += 4;
  }
  if ((geomType & 65535) === 1) {
    const x4 = bytesToFloat64(bytes, offset);
    offset += 8;
    const y3 = bytesToFloat64(bytes, offset);
    offset += 8;
    return [x4, y3];
  }
  throw new Error("Unsupported geometry type");
}

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.js
var _a85;
var PgGeometryBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "array", "PgGeometry");
  }
  /** @internal */
  build(table) {
    return new PgGeometry(
      table,
      this.config
    );
  }
};
_a85 = entityKind;
__publicField(PgGeometryBuilder, _a85, "PgGeometryBuilder");
var _a86;
var PgGeometry = class extends PgColumn {
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    return parseEWKB(value);
  }
  mapToDriverValue(value) {
    return `point(${value[0]} ${value[1]})`;
  }
};
_a86 = entityKind;
__publicField(PgGeometry, _a86, "PgGeometry");
var _a87;
var PgGeometryObjectBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "json", "PgGeometryObject");
  }
  /** @internal */
  build(table) {
    return new PgGeometryObject(
      table,
      this.config
    );
  }
};
_a87 = entityKind;
__publicField(PgGeometryObjectBuilder, _a87, "PgGeometryObjectBuilder");
var _a88;
var PgGeometryObject = class extends PgColumn {
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    const parsed = parseEWKB(value);
    return { x: parsed[0], y: parsed[1] };
  }
  mapToDriverValue(value) {
    return `point(${value.x} ${value.y})`;
  }
};
_a88 = entityKind;
__publicField(PgGeometryObject, _a88, "PgGeometryObject");
function geometry(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  if (!config?.mode || config.mode === "tuple") {
    return new PgGeometryBuilder(name);
  }
  return new PgGeometryObjectBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/real.js
var _a89;
var PgRealBuilder = class extends PgColumnBuilder {
  constructor(name, length) {
    super(name, "number", "PgReal");
    this.config.length = length;
  }
  /** @internal */
  build(table) {
    return new PgReal(table, this.config);
  }
};
_a89 = entityKind;
__publicField(PgRealBuilder, _a89, "PgRealBuilder");
var _a90;
var PgReal = class extends PgColumn {
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "real";
  }
  mapFromDriverValue = (value) => {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  };
};
_a90 = entityKind;
__publicField(PgReal, _a90, "PgReal");
function real(name) {
  return new PgRealBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/serial.js
var _a91;
var PgSerialBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "number", "PgSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSerial(table, this.config);
  }
};
_a91 = entityKind;
__publicField(PgSerialBuilder, _a91, "PgSerialBuilder");
var _a92;
var PgSerial = class extends PgColumn {
  getSQLType() {
    return "serial";
  }
};
_a92 = entityKind;
__publicField(PgSerial, _a92, "PgSerial");
function serial(name) {
  return new PgSerialBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/smallint.js
var _a93;
var PgSmallIntBuilder = class extends PgIntColumnBaseBuilder {
  constructor(name) {
    super(name, "number", "PgSmallInt");
  }
  /** @internal */
  build(table) {
    return new PgSmallInt(table, this.config);
  }
};
_a93 = entityKind;
__publicField(PgSmallIntBuilder, _a93, "PgSmallIntBuilder");
var _a94;
var PgSmallInt = class extends PgColumn {
  getSQLType() {
    return "smallint";
  }
  mapFromDriverValue = (value) => {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  };
};
_a94 = entityKind;
__publicField(PgSmallInt, _a94, "PgSmallInt");
function smallint(name) {
  return new PgSmallIntBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/smallserial.js
var _a95;
var PgSmallSerialBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "number", "PgSmallSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSmallSerial(
      table,
      this.config
    );
  }
};
_a95 = entityKind;
__publicField(PgSmallSerialBuilder, _a95, "PgSmallSerialBuilder");
var _a96;
var PgSmallSerial = class extends PgColumn {
  getSQLType() {
    return "smallserial";
  }
};
_a96 = entityKind;
__publicField(PgSmallSerial, _a96, "PgSmallSerial");
function smallserial(name) {
  return new PgSmallSerialBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/text.js
var _a97;
var PgTextBuilder = class extends PgColumnBuilder {
  constructor(name, config) {
    super(name, "string", "PgText");
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgText(table, this.config);
  }
};
_a97 = entityKind;
__publicField(PgTextBuilder, _a97, "PgTextBuilder");
var _a98;
var PgText = class extends PgColumn {
  enumValues = this.config.enumValues;
  getSQLType() {
    return "text";
  }
};
_a98 = entityKind;
__publicField(PgText, _a98, "PgText");
function text(a4, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgTextBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/time.js
var _a99;
var PgTimeBuilder = class extends PgDateColumnBaseBuilder {
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTime");
    this.withTimezone = withTimezone;
    this.precision = precision;
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTime(table, this.config);
  }
};
_a99 = entityKind;
__publicField(PgTimeBuilder, _a99, "PgTimeBuilder");
var _a100;
var PgTime = class extends PgColumn {
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
_a100 = entityKind;
__publicField(PgTime, _a100, "PgTime");
function time(a4, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}

// node_modules/drizzle-orm/pg-core/columns/timestamp.js
var _a101;
var PgTimestampBuilder = class extends PgDateColumnBaseBuilder {
  constructor(name, withTimezone, precision) {
    super(name, "date", "PgTimestamp");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestamp(table, this.config);
  }
};
_a101 = entityKind;
__publicField(PgTimestampBuilder, _a101, "PgTimestampBuilder");
var _a102;
var PgTimestamp = class extends PgColumn {
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
  mapFromDriverValue = (value) => {
    return new Date(this.withTimezone ? value : value + "+0000");
  };
  mapToDriverValue = (value) => {
    return value.toISOString();
  };
};
_a102 = entityKind;
__publicField(PgTimestamp, _a102, "PgTimestamp");
var _a103;
var PgTimestampStringBuilder = class extends PgDateColumnBaseBuilder {
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTimestampString");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestampString(
      table,
      this.config
    );
  }
};
_a103 = entityKind;
__publicField(PgTimestampStringBuilder, _a103, "PgTimestampStringBuilder");
var _a104;
var PgTimestampString = class extends PgColumn {
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
_a104 = entityKind;
__publicField(PgTimestampString, _a104, "PgTimestampString");
function timestamp(a4, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  if (config?.mode === "string") {
    return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
  }
  return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
}

// node_modules/drizzle-orm/pg-core/columns/uuid.js
var _a105;
var PgUUIDBuilder = class extends PgColumnBuilder {
  constructor(name) {
    super(name, "string", "PgUUID");
  }
  /**
   * Adds `default gen_random_uuid()` to the column definition.
   */
  defaultRandom() {
    return this.default(sql`gen_random_uuid()`);
  }
  /** @internal */
  build(table) {
    return new PgUUID(table, this.config);
  }
};
_a105 = entityKind;
__publicField(PgUUIDBuilder, _a105, "PgUUIDBuilder");
var _a106;
var PgUUID = class extends PgColumn {
  getSQLType() {
    return "uuid";
  }
};
_a106 = entityKind;
__publicField(PgUUID, _a106, "PgUUID");
function uuid(name) {
  return new PgUUIDBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/varchar.js
var _a107;
var PgVarcharBuilder = class extends PgColumnBuilder {
  constructor(name, config) {
    super(name, "string", "PgVarchar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgVarchar(
      table,
      this.config
    );
  }
};
_a107 = entityKind;
__publicField(PgVarcharBuilder, _a107, "PgVarcharBuilder");
var _a108;
var PgVarchar = class extends PgColumn {
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
  }
};
_a108 = entityKind;
__publicField(PgVarchar, _a108, "PgVarchar");
function varchar(a4, b2 = {}) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgVarcharBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.js
var _a109;
var PgBinaryVectorBuilder = class extends PgColumnBuilder {
  constructor(name, config) {
    super(name, "string", "PgBinaryVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgBinaryVector(
      table,
      this.config
    );
  }
};
_a109 = entityKind;
__publicField(PgBinaryVectorBuilder, _a109, "PgBinaryVectorBuilder");
var _a110;
var PgBinaryVector = class extends PgColumn {
  dimensions = this.config.dimensions;
  getSQLType() {
    return `bit(${this.dimensions})`;
  }
};
_a110 = entityKind;
__publicField(PgBinaryVector, _a110, "PgBinaryVector");
function bit(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgBinaryVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.js
var _a111;
var PgHalfVectorBuilder = class extends PgColumnBuilder {
  constructor(name, config) {
    super(name, "array", "PgHalfVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgHalfVector(
      table,
      this.config
    );
  }
};
_a111 = entityKind;
__publicField(PgHalfVectorBuilder, _a111, "PgHalfVectorBuilder");
var _a112;
var PgHalfVector = class extends PgColumn {
  dimensions = this.config.dimensions;
  getSQLType() {
    return `halfvec(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v3) => Number.parseFloat(v3));
  }
};
_a112 = entityKind;
__publicField(PgHalfVector, _a112, "PgHalfVector");
function halfvec(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgHalfVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.js
var _a113;
var PgSparseVectorBuilder = class extends PgColumnBuilder {
  constructor(name, config) {
    super(name, "string", "PgSparseVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgSparseVector(
      table,
      this.config
    );
  }
};
_a113 = entityKind;
__publicField(PgSparseVectorBuilder, _a113, "PgSparseVectorBuilder");
var _a114;
var PgSparseVector = class extends PgColumn {
  dimensions = this.config.dimensions;
  getSQLType() {
    return `sparsevec(${this.dimensions})`;
  }
};
_a114 = entityKind;
__publicField(PgSparseVector, _a114, "PgSparseVector");
function sparsevec(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgSparseVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js
var _a115;
var PgVectorBuilder = class extends PgColumnBuilder {
  constructor(name, config) {
    super(name, "array", "PgVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgVector(
      table,
      this.config
    );
  }
};
_a115 = entityKind;
__publicField(PgVectorBuilder, _a115, "PgVectorBuilder");
var _a116;
var PgVector = class extends PgColumn {
  dimensions = this.config.dimensions;
  getSQLType() {
    return `vector(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v3) => Number.parseFloat(v3));
  }
};
_a116 = entityKind;
__publicField(PgVector, _a116, "PgVector");
function vector(a4, b2) {
  const { name, config } = getColumnNameAndConfig(a4, b2);
  return new PgVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/all.js
function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector
  };
}

// node_modules/drizzle-orm/pg-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = Symbol.for("drizzle:EnableRLS");
var _a117;
var PgTable = class extends Table {
  /**@internal */
  [(_a117 = entityKind, InlineForeignKeys)] = [];
  /** @internal */
  [EnableRLS] = false;
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
};
__publicField(PgTable, _a117, "PgTable");
/** @internal */
__publicField(PgTable, "Symbol", Object.assign({}, Table.Symbol, {
  InlineForeignKeys,
  EnableRLS
}));
function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new PgTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getPgColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const builtColumnsForExtraConfig = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.buildExtraConfigColumn(rawTable);
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
  if (extraConfig) {
    table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return Object.assign(table, {
    enableRLS: () => {
      table[PgTable.Symbol.EnableRLS] = true;
      return table;
    }
  });
}
var pgTable = (name, columns, extraConfig) => {
  return pgTableWithSchema(name, columns, extraConfig, void 0);
};

// node_modules/drizzle-orm/pg-core/primary-keys.js
var _a118;
var PrimaryKeyBuilder = class {
  /** @internal */
  columns;
  /** @internal */
  name;
  constructor(columns, name) {
    this.columns = columns;
    this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
};
_a118 = entityKind;
__publicField(PrimaryKeyBuilder, _a118, "PgPrimaryKeyBuilder");
var _a119;
var PrimaryKey = class {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
};
_a119 = entityKind;
__publicField(PrimaryKey, _a119, "PgPrimaryKey");

// node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
var eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
var ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c3) => c3 !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or2(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c3) => c3 !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
var gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
var gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
};
var lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
var lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v3) => bindIfParam(v3, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v3) => bindIfParam(v3, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}

// node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

// node_modules/drizzle-orm/relations.js
var _a120;
var Relation = class {
  constructor(sourceTable, referencedTable, relationName) {
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
  referencedTableName;
  fieldName;
};
_a120 = entityKind;
__publicField(Relation, _a120, "Relation");
var _a121;
var Relations = class {
  constructor(table, config) {
    this.table = table;
    this.config = config;
  }
};
_a121 = entityKind;
__publicField(Relations, _a121, "Relations");
var _a122;
var _One = class extends Relation {
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
    this.isNullable = isNullable;
  }
  withFieldName(fieldName) {
    const relation = new _One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
var One = _One;
_a122 = entityKind;
__publicField(One, _a122, "One");
var _a123;
var _Many = class extends Relation {
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
  }
  withFieldName(fieldName) {
    const relation = new _Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
var Many = _Many;
_a123 = entityKind;
__publicField(Many, _a123, "Many");
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or: or2,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
          if (primaryKey) {
            tableConfig.primaryKey.push(...primaryKey);
          }
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function relations(table, relations2) {
  return new Relations(
    table,
    (helpers) => Object.fromEntries(
      Object.entries(relations2(helpers)).map(([key, value]) => [
        key,
        value.withFieldName(key)
      ])
    )
  );
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      config?.fields.reduce((res, f4) => res && f4.notNull, true) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder3;
      if (is(field, Column)) {
        decoder3 = field;
      } else if (is(field, SQL)) {
        decoder3 = field.decoder;
      } else {
        decoder3 = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder3.mapFromDriverValue(value);
    }
  }
  return result;
}

// node_modules/drizzle-orm/pg-core/view-base.js
var _a124;
var PgViewBase = class extends View {
};
_a124 = entityKind;
__publicField(PgViewBase, _a124, "PgViewBase");

// node_modules/drizzle-orm/pg-core/dialect.js
var _a125;
var PgDialect = class {
  /** @internal */
  casing;
  constructor(config) {
    this.casing = new CasingCache(config?.casing);
  }
  async migrate(migrations, session2, config) {
    const migrationsTable = typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
    const migrationsSchema = typeof config === "string" ? "drizzle" : config.migrationsSchema ?? "drizzle";
    const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at bigint
			)
		`;
    await session2.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(migrationsSchema)}`);
    await session2.execute(migrationTableCreate);
    const dbMigrations = await session2.all(
      sql`select id, hash, created_at from ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} order by created_at desc limit 1`
    );
    const lastDbMigration = dbMigrations[0];
    await session2.transaction(async (tx) => {
      for await (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            await tx.execute(sql.raw(stmt));
          }
          await tx.execute(
            sql`insert into ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
    });
  }
  escapeName(name) {
    return `"${name}"`;
  }
  escapeParam(num) {
    return `$${num + 1}`;
  }
  escapeString(str) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!queries?.length)
      return void 0;
    const withSqlChunks = [sql`with `];
    for (const [i4, w4] of queries.entries()) {
      withSqlChunks.push(sql`${sql.identifier(w4._.alias)} as (${w4._.sql})`);
      if (i4 < queries.length - 1) {
        withSqlChunks.push(sql`, `);
      }
    }
    withSqlChunks.push(sql` `);
    return sql.join(withSqlChunks);
  }
  buildDeleteQuery({ table, where, returning, withList }) {
    const withSql = this.buildWithCTE(withList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}delete from ${table}${whereSql}${returningSql}`;
  }
  buildUpdateSet(table, set) {
    const tableColumns = table[Table.Symbol.Columns];
    const columnNames = Object.keys(tableColumns).filter(
      (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
    );
    const setSize = columnNames.length;
    return sql.join(columnNames.flatMap((colName, i4) => {
      const col = tableColumns[colName];
      const value = set[colName] ?? sql.param(col.onUpdateFn(), col);
      const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
      if (i4 < setSize - 1) {
        return [res, sql.raw(", ")];
      }
      return [res];
    }));
  }
  buildUpdateQuery({ table, set, where, returning, withList, from, joins }) {
    const withSql = this.buildWithCTE(withList);
    const tableName = table[PgTable.Symbol.Name];
    const tableSchema = table[PgTable.Symbol.Schema];
    const origTableName = table[PgTable.Symbol.OriginalName];
    const alias = tableName === origTableName ? void 0 : tableName;
    const tableSql = sql`${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}`;
    const setSql = this.buildUpdateSet(table, set);
    const fromSql = from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
    const joinsSql = this.buildJoins(joins);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: !from })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}update ${tableSql} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = false } = {}) {
    const columnsLen = fields.length;
    const chunks = fields.flatMap(({ field }, i4) => {
      const chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField) {
        chunk.push(sql.identifier(field.fieldAlias));
      } else if (is(field, SQL.Aliased) || is(field, SQL)) {
        const query = is(field, SQL.Aliased) ? field.sql : field;
        if (isSingleTable) {
          chunk.push(
            new SQL(
              query.queryChunks.map((c3) => {
                if (is(c3, PgColumn)) {
                  return sql.identifier(this.casing.getColumnCasing(c3));
                }
                return c3;
              })
            )
          );
        } else {
          chunk.push(query);
        }
        if (is(field, SQL.Aliased)) {
          chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
        }
      } else if (is(field, Column)) {
        if (isSingleTable) {
          chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
        } else {
          chunk.push(field);
        }
      }
      if (i4 < columnsLen - 1) {
        chunk.push(sql`, `);
      }
      return chunk;
    });
    return sql.join(chunks);
  }
  buildJoins(joins) {
    if (!joins || joins.length === 0) {
      return void 0;
    }
    const joinsArray = [];
    for (const [index, joinMeta] of joins.entries()) {
      if (index === 0) {
        joinsArray.push(sql` `);
      }
      const table = joinMeta.table;
      const lateralSql = joinMeta.lateral ? sql` lateral` : void 0;
      if (is(table, PgTable)) {
        const tableName = table[PgTable.Symbol.Name];
        const tableSchema = table[PgTable.Symbol.Schema];
        const origTableName = table[PgTable.Symbol.OriginalName];
        const alias = tableName === origTableName ? void 0 : joinMeta.alias;
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`} on ${joinMeta.on}`
        );
      } else if (is(table, View)) {
        const viewName = table[ViewBaseConfig].name;
        const viewSchema = table[ViewBaseConfig].schema;
        const origViewName = table[ViewBaseConfig].originalName;
        const alias = viewName === origViewName ? void 0 : joinMeta.alias;
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${viewSchema ? sql`${sql.identifier(viewSchema)}.` : void 0}${sql.identifier(origViewName)}${alias && sql` ${sql.identifier(alias)}`} on ${joinMeta.on}`
        );
      } else {
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${table} on ${joinMeta.on}`
        );
      }
      if (index < joins.length - 1) {
        joinsArray.push(sql` `);
      }
    }
    return sql.join(joinsArray);
  }
  buildFromTable(table) {
    if (is(table, Table) && table[Table.Symbol.OriginalName] !== table[Table.Symbol.Name]) {
      let fullName = sql`${sql.identifier(table[Table.Symbol.OriginalName])}`;
      if (table[Table.Symbol.Schema]) {
        fullName = sql`${sql.identifier(table[Table.Symbol.Schema])}.${fullName}`;
      }
      return sql`${fullName} ${sql.identifier(table[Table.Symbol.Name])}`;
    }
    return table;
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit,
    offset,
    lockingClause,
    distinct,
    setOperators
  }) {
    const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (const f4 of fieldsList) {
      if (is(f4.field, Column) && getTableName(f4.field.table) !== (is(table, Subquery) ? table._.alias : is(table, PgViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f4.field.table)) {
        const tableName = getTableName(f4.field.table);
        throw new Error(
          `Your "${f4.path.join("->")}" field references a column "${tableName}"."${f4.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    }
    const isSingleTable = !joins || joins.length === 0;
    const withSql = this.buildWithCTE(withList);
    let distinctSql;
    if (distinct) {
      distinctSql = distinct === true ? sql` distinct` : sql` distinct on (${sql.join(distinct.on, sql`, `)})`;
    }
    const selection = this.buildSelection(fieldsList, { isSingleTable });
    const tableSql = this.buildFromTable(table);
    const joinsSql = this.buildJoins(joins);
    const whereSql = where ? sql` where ${where}` : void 0;
    const havingSql = having ? sql` having ${having}` : void 0;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      orderBySql = sql` order by ${sql.join(orderBy, sql`, `)}`;
    }
    let groupBySql;
    if (groupBy && groupBy.length > 0) {
      groupBySql = sql` group by ${sql.join(groupBy, sql`, `)}`;
    }
    const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    const lockingClauseSql = sql.empty();
    if (lockingClause) {
      const clauseSql = sql` for ${sql.raw(lockingClause.strength)}`;
      if (lockingClause.config.of) {
        clauseSql.append(
          sql` of ${sql.join(
            Array.isArray(lockingClause.config.of) ? lockingClause.config.of : [lockingClause.config.of],
            sql`, `
          )}`
        );
      }
      if (lockingClause.config.noWait) {
        clauseSql.append(sql` no wait`);
      } else if (lockingClause.config.skipLocked) {
        clauseSql.append(sql` skip locked`);
      }
      lockingClauseSql.append(clauseSql);
    }
    const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClauseSql}`;
    if (setOperators.length > 0) {
      return this.buildSetOperations(finalQuery, setOperators);
    }
    return finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    const [setOperator, ...rest] = setOperators;
    if (!setOperator) {
      throw new Error("Cannot pass undefined values to any set operator");
    }
    if (rest.length === 0) {
      return this.buildSetOperationQuery({ leftSelect, setOperator });
    }
    return this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
  }) {
    const leftChunk = sql`(${leftSelect.getSQL()}) `;
    const rightChunk = sql`(${rightSelect.getSQL()})`;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      const orderByValues = [];
      for (const singleOrderBy of orderBy) {
        if (is(singleOrderBy, PgColumn)) {
          orderByValues.push(sql.identifier(singleOrderBy.name));
        } else if (is(singleOrderBy, SQL)) {
          for (let i4 = 0; i4 < singleOrderBy.queryChunks.length; i4++) {
            const chunk = singleOrderBy.queryChunks[i4];
            if (is(chunk, PgColumn)) {
              singleOrderBy.queryChunks[i4] = sql.identifier(chunk.name);
            }
          }
          orderByValues.push(sql`${singleOrderBy}`);
        } else {
          orderByValues.push(sql`${singleOrderBy}`);
        }
      }
      orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)} `;
    }
    const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
    const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select, overridingSystemValue_ }) {
    const valuesSqlList = [];
    const columns = table[Table.Symbol.Columns];
    const colEntries = Object.entries(columns).filter(([_4, col]) => !col.shouldDisableInsert());
    const insertOrder = colEntries.map(
      ([, column]) => sql.identifier(this.casing.getColumnCasing(column))
    );
    if (select) {
      const select2 = valuesOrSelect;
      if (is(select2, SQL)) {
        valuesSqlList.push(select2);
      } else {
        valuesSqlList.push(select2.getSQL());
      }
    } else {
      const values = valuesOrSelect;
      valuesSqlList.push(sql.raw("values "));
      for (const [valueIndex, value] of values.entries()) {
        const valueList = [];
        for (const [fieldName, col] of colEntries) {
          const colValue = value[fieldName];
          if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
            if (col.defaultFn !== void 0) {
              const defaultFnResult = col.defaultFn();
              const defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
              valueList.push(defaultValue);
            } else if (!col.default && col.onUpdateFn !== void 0) {
              const onUpdateFnResult = col.onUpdateFn();
              const newValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
              valueList.push(newValue);
            } else {
              valueList.push(sql`default`);
            }
          } else {
            valueList.push(colValue);
          }
        }
        valuesSqlList.push(valueList);
        if (valueIndex < values.length - 1) {
          valuesSqlList.push(sql`, `);
        }
      }
    }
    const withSql = this.buildWithCTE(withList);
    const valuesSql = sql.join(valuesSqlList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const onConflictSql = onConflict ? sql` on conflict ${onConflict}` : void 0;
    const overridingSql = overridingSystemValue_ === true ? sql`overriding system value ` : void 0;
    return sql`${withSql}insert into ${table} ${insertOrder} ${overridingSql}${valuesSql}${onConflictSql}${returningSql}`;
  }
  buildRefreshMaterializedViewQuery({ view, concurrently, withNoData }) {
    const concurrentlySql = concurrently ? sql` concurrently` : void 0;
    const withNoDataSql = withNoData ? sql` with no data` : void 0;
    return sql`refresh materialized view${concurrentlySql} ${view}${withNoDataSql}`;
  }
  prepareTyping(encoder3) {
    if (is(encoder3, PgJsonb) || is(encoder3, PgJson)) {
      return "json";
    } else if (is(encoder3, PgNumeric)) {
      return "decimal";
    } else if (is(encoder3, PgTime)) {
      return "time";
    } else if (is(encoder3, PgTimestamp) || is(encoder3, PgTimestampString)) {
      return "timestamp";
    } else if (is(encoder3, PgDate) || is(encoder3, PgDateString)) {
      return "date";
    } else if (is(encoder3, PgUUID)) {
      return "uuid";
    } else {
      return "none";
    }
  }
  sqlToQuery(sql2, invokeSource) {
    return sql2.toQuery({
      casing: this.casing,
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString,
      prepareTyping: this.prepareTyping,
      invokeSource
    });
  }
  // buildRelationalQueryWithPK({
  // 	fullSchema,
  // 	schema,
  // 	tableNamesMap,
  // 	table,
  // 	tableConfig,
  // 	queryConfig: config,
  // 	tableAlias,
  // 	isRoot = false,
  // 	joinOn,
  // }: {
  // 	fullSchema: Record<string, unknown>;
  // 	schema: TablesRelationalConfig;
  // 	tableNamesMap: Record<string, string>;
  // 	table: PgTable;
  // 	tableConfig: TableRelationalConfig;
  // 	queryConfig: true | DBQueryConfig<'many', true>;
  // 	tableAlias: string;
  // 	isRoot?: boolean;
  // 	joinOn?: SQL;
  // }): BuildRelationalQueryResult<PgTable, PgColumn> {
  // 	// For { "<relation>": true }, return a table with selection of all columns
  // 	if (config === true) {
  // 		const selectionEntries = Object.entries(tableConfig.columns);
  // 		const selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = selectionEntries.map((
  // 			[key, value],
  // 		) => ({
  // 			dbKey: value.name,
  // 			tsKey: key,
  // 			field: value as PgColumn,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 		return {
  // 			tableTsKey: tableConfig.tsName,
  // 			sql: table,
  // 			selection,
  // 		};
  // 	}
  // 	// let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
  // 	// let selectionForBuild = selection;
  // 	const aliasedColumns = Object.fromEntries(
  // 		Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]),
  // 	);
  // 	const aliasedRelations = Object.fromEntries(
  // 		Object.entries(tableConfig.relations).map(([key, value]) => [key, aliasedRelation(value, tableAlias)]),
  // 	);
  // 	const aliasedFields = Object.assign({}, aliasedColumns, aliasedRelations);
  // 	let where, hasUserDefinedWhere;
  // 	if (config.where) {
  // 		const whereSql = typeof config.where === 'function' ? config.where(aliasedFields, operators) : config.where;
  // 		where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
  // 		hasUserDefinedWhere = !!where;
  // 	}
  // 	where = and(joinOn, where);
  // 	// const fieldsSelection: { tsKey: string; value: PgColumn | SQL.Aliased; isExtra?: boolean }[] = [];
  // 	let joins: Join[] = [];
  // 	let selectedColumns: string[] = [];
  // 	// Figure out which columns to select
  // 	if (config.columns) {
  // 		let isIncludeMode = false;
  // 		for (const [field, value] of Object.entries(config.columns)) {
  // 			if (value === undefined) {
  // 				continue;
  // 			}
  // 			if (field in tableConfig.columns) {
  // 				if (!isIncludeMode && value === true) {
  // 					isIncludeMode = true;
  // 				}
  // 				selectedColumns.push(field);
  // 			}
  // 		}
  // 		if (selectedColumns.length > 0) {
  // 			selectedColumns = isIncludeMode
  // 				? selectedColumns.filter((c) => config.columns?.[c] === true)
  // 				: Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
  // 		}
  // 	} else {
  // 		// Select all columns if selection is not specified
  // 		selectedColumns = Object.keys(tableConfig.columns);
  // 	}
  // 	// for (const field of selectedColumns) {
  // 	// 	const column = tableConfig.columns[field]! as PgColumn;
  // 	// 	fieldsSelection.push({ tsKey: field, value: column });
  // 	// }
  // 	let initiallySelectedRelations: {
  // 		tsKey: string;
  // 		queryConfig: true | DBQueryConfig<'many', false>;
  // 		relation: Relation;
  // 	}[] = [];
  // 	// let selectedRelations: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
  // 	// Figure out which relations to select
  // 	if (config.with) {
  // 		initiallySelectedRelations = Object.entries(config.with)
  // 			.filter((entry): entry is [typeof entry[0], NonNullable<typeof entry[1]>] => !!entry[1])
  // 			.map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey]! }));
  // 	}
  // 	const manyRelations = initiallySelectedRelations.filter((r) =>
  // 		is(r.relation, Many)
  // 		&& (schema[tableNamesMap[r.relation.referencedTable[Table.Symbol.Name]]!]?.primaryKey.length ?? 0) > 0
  // 	);
  // 	// If this is the last Many relation (or there are no Many relations), we are on the innermost subquery level
  // 	const isInnermostQuery = manyRelations.length < 2;
  // 	const selectedExtras: {
  // 		tsKey: string;
  // 		value: SQL.Aliased;
  // 	}[] = [];
  // 	// Figure out which extras to select
  // 	if (isInnermostQuery && config.extras) {
  // 		const extras = typeof config.extras === 'function'
  // 			? config.extras(aliasedFields, { sql })
  // 			: config.extras;
  // 		for (const [tsKey, value] of Object.entries(extras)) {
  // 			selectedExtras.push({
  // 				tsKey,
  // 				value: mapColumnsInAliasedSQLToAlias(value, tableAlias),
  // 			});
  // 		}
  // 	}
  // 	// Transform `fieldsSelection` into `selection`
  // 	// `fieldsSelection` shouldn't be used after this point
  // 	// for (const { tsKey, value, isExtra } of fieldsSelection) {
  // 	// 	selection.push({
  // 	// 		dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey]!.name,
  // 	// 		tsKey,
  // 	// 		field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
  // 	// 		relationTableTsKey: undefined,
  // 	// 		isJson: false,
  // 	// 		isExtra,
  // 	// 		selection: [],
  // 	// 	});
  // 	// }
  // 	let orderByOrig = typeof config.orderBy === 'function'
  // 		? config.orderBy(aliasedFields, orderByOperators)
  // 		: config.orderBy ?? [];
  // 	if (!Array.isArray(orderByOrig)) {
  // 		orderByOrig = [orderByOrig];
  // 	}
  // 	const orderBy = orderByOrig.map((orderByValue) => {
  // 		if (is(orderByValue, Column)) {
  // 			return aliasedTableColumn(orderByValue, tableAlias) as PgColumn;
  // 		}
  // 		return mapColumnsInSQLToAlias(orderByValue, tableAlias);
  // 	});
  // 	const limit = isInnermostQuery ? config.limit : undefined;
  // 	const offset = isInnermostQuery ? config.offset : undefined;
  // 	// For non-root queries without additional config except columns, return a table with selection
  // 	if (
  // 		!isRoot
  // 		&& initiallySelectedRelations.length === 0
  // 		&& selectedExtras.length === 0
  // 		&& !where
  // 		&& orderBy.length === 0
  // 		&& limit === undefined
  // 		&& offset === undefined
  // 	) {
  // 		return {
  // 			tableTsKey: tableConfig.tsName,
  // 			sql: table,
  // 			selection: selectedColumns.map((key) => ({
  // 				dbKey: tableConfig.columns[key]!.name,
  // 				tsKey: key,
  // 				field: tableConfig.columns[key] as PgColumn,
  // 				relationTableTsKey: undefined,
  // 				isJson: false,
  // 				selection: [],
  // 			})),
  // 		};
  // 	}
  // 	const selectedRelationsWithoutPK:
  // 	// Process all relations without primary keys, because they need to be joined differently and will all be on the same query level
  // 	for (
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationConfigValue,
  // 			relation,
  // 		} of initiallySelectedRelations
  // 	) {
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTable = schema[relationTableTsName]!;
  // 		if (relationTable.primaryKey.length > 0) {
  // 			continue;
  // 		}
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelation = this.buildRelationalQueryWithoutPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationConfigValue,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 			nestedQueryRelation: relation,
  // 		});
  // 		const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier('data')}`.as(selectedRelationTsKey);
  // 		joins.push({
  // 			on: sql`true`,
  // 			table: new Subquery(builtRelation.sql as SQL, {}, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: true,
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelation.selection,
  // 		});
  // 	}
  // 	const oneRelations = initiallySelectedRelations.filter((r): r is typeof r & { relation: One } =>
  // 		is(r.relation, One)
  // 	);
  // 	// Process all One relations with PKs, because they can all be joined on the same level
  // 	for (
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationConfigValue,
  // 			relation,
  // 		} of oneRelations
  // 	) {
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const relationTable = schema[relationTableTsName]!;
  // 		if (relationTable.primaryKey.length === 0) {
  // 			continue;
  // 		}
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelation = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationConfigValue,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 		});
  // 		const field = sql`case when ${sql.identifier(relationTableAlias)} is null then null else json_build_array(${
  // 			sql.join(
  // 				builtRelation.selection.map(({ field }) =>
  // 					is(field, SQL.Aliased)
  // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
  // 						: is(field, Column)
  // 						? aliasedTableColumn(field, relationTableAlias)
  // 						: field
  // 				),
  // 				sql`, `,
  // 			)
  // 		}) end`.as(selectedRelationTsKey);
  // 		const isLateralJoin = is(builtRelation.sql, SQL);
  // 		joins.push({
  // 			on: isLateralJoin ? sql`true` : joinOn,
  // 			table: is(builtRelation.sql, SQL)
  // 				? new Subquery(builtRelation.sql, {}, relationTableAlias)
  // 				: aliasedTable(builtRelation.sql, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: is(builtRelation.sql, SQL),
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelation.selection,
  // 		});
  // 	}
  // 	let distinct: PgSelectConfig['distinct'];
  // 	let tableFrom: PgTable | Subquery = table;
  // 	// Process first Many relation - each one requires a nested subquery
  // 	const manyRelation = manyRelations[0];
  // 	if (manyRelation) {
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationQueryConfig,
  // 			relation,
  // 		} = manyRelation;
  // 		distinct = {
  // 			on: tableConfig.primaryKey.map((c) => aliasedTableColumn(c as PgColumn, tableAlias)),
  // 		};
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelationJoin = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationQueryConfig,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 		});
  // 		const builtRelationSelectionField = sql`case when ${
  // 			sql.identifier(relationTableAlias)
  // 		} is null then '[]' else json_agg(json_build_array(${
  // 			sql.join(
  // 				builtRelationJoin.selection.map(({ field }) =>
  // 					is(field, SQL.Aliased)
  // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
  // 						: is(field, Column)
  // 						? aliasedTableColumn(field, relationTableAlias)
  // 						: field
  // 				),
  // 				sql`, `,
  // 			)
  // 		})) over (partition by ${sql.join(distinct.on, sql`, `)}) end`.as(selectedRelationTsKey);
  // 		const isLateralJoin = is(builtRelationJoin.sql, SQL);
  // 		joins.push({
  // 			on: isLateralJoin ? sql`true` : joinOn,
  // 			table: isLateralJoin
  // 				? new Subquery(builtRelationJoin.sql as SQL, {}, relationTableAlias)
  // 				: aliasedTable(builtRelationJoin.sql as PgTable, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: isLateralJoin,
  // 		});
  // 		// Build the "from" subquery with the remaining Many relations
  // 		const builtTableFrom = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table,
  // 			tableConfig,
  // 			queryConfig: {
  // 				...config,
  // 				where: undefined,
  // 				orderBy: undefined,
  // 				limit: undefined,
  // 				offset: undefined,
  // 				with: manyRelations.slice(1).reduce<NonNullable<typeof config['with']>>(
  // 					(result, { tsKey, queryConfig: configValue }) => {
  // 						result[tsKey] = configValue;
  // 						return result;
  // 					},
  // 					{},
  // 				),
  // 			},
  // 			tableAlias,
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field: builtRelationSelectionField,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelationJoin.selection,
  // 		});
  // 		// selection = builtTableFrom.selection.map((item) =>
  // 		// 	is(item.field, SQL.Aliased)
  // 		// 		? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
  // 		// 		: item
  // 		// );
  // 		// selectionForBuild = [{
  // 		// 	dbKey: '*',
  // 		// 	tsKey: '*',
  // 		// 	field: sql`${sql.identifier(tableAlias)}.*`,
  // 		// 	selection: [],
  // 		// 	isJson: false,
  // 		// 	relationTableTsKey: undefined,
  // 		// }];
  // 		// const newSelectionItem: (typeof selection)[number] = {
  // 		// 	dbKey: selectedRelationTsKey,
  // 		// 	tsKey: selectedRelationTsKey,
  // 		// 	field,
  // 		// 	relationTableTsKey: relationTableTsName,
  // 		// 	isJson: true,
  // 		// 	selection: builtRelationJoin.selection,
  // 		// };
  // 		// selection.push(newSelectionItem);
  // 		// selectionForBuild.push(newSelectionItem);
  // 		tableFrom = is(builtTableFrom.sql, PgTable)
  // 			? builtTableFrom.sql
  // 			: new Subquery(builtTableFrom.sql, {}, tableAlias);
  // 	}
  // 	if (selectedColumns.length === 0 && selectedRelations.length === 0 && selectedExtras.length === 0) {
  // 		throw new DrizzleError(`No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")`);
  // 	}
  // 	let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'];
  // 	function prepareSelectedColumns() {
  // 		return selectedColumns.map((key) => ({
  // 			dbKey: tableConfig.columns[key]!.name,
  // 			tsKey: key,
  // 			field: tableConfig.columns[key] as PgColumn,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 	}
  // 	function prepareSelectedExtras() {
  // 		return selectedExtras.map((item) => ({
  // 			dbKey: item.value.fieldAlias,
  // 			tsKey: item.tsKey,
  // 			field: item.value,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 	}
  // 	if (isRoot) {
  // 		selection = [
  // 			...prepareSelectedColumns(),
  // 			...prepareSelectedExtras(),
  // 		];
  // 	}
  // 	if (hasUserDefinedWhere || orderBy.length > 0) {
  // 		tableFrom = new Subquery(
  // 			this.buildSelectQuery({
  // 				table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
  // 				fields: {},
  // 				fieldsFlat: selectionForBuild.map(({ field }) => ({
  // 					path: [],
  // 					field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
  // 				})),
  // 				joins,
  // 				distinct,
  // 			}),
  // 			{},
  // 			tableAlias,
  // 		);
  // 		selectionForBuild = selection.map((item) =>
  // 			is(item.field, SQL.Aliased)
  // 				? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
  // 				: item
  // 		);
  // 		joins = [];
  // 		distinct = undefined;
  // 	}
  // 	const result = this.buildSelectQuery({
  // 		table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
  // 		fields: {},
  // 		fieldsFlat: selectionForBuild.map(({ field }) => ({
  // 			path: [],
  // 			field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
  // 		})),
  // 		where,
  // 		limit,
  // 		offset,
  // 		joins,
  // 		orderBy,
  // 		distinct,
  // 	});
  // 	return {
  // 		tableTsKey: tableConfig.tsName,
  // 		sql: result,
  // 		selection,
  // 	};
  // }
  buildRelationalQueryWithoutPK({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy = [], where;
    const joins = [];
    if (config === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config.where) {
        const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c3) => config.columns?.[c3] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config.with) {
        selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig2]) => ({ tsKey, queryConfig: queryConfig2, relation: tableConfig.relations[tsKey] }));
      }
      let extras;
      if (config.extras) {
        extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config.limit;
      offset = config.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i4) => eq(
              aliasedTableColumn(normalizedRelation.references[i4], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQueryWithoutPK({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier("data")}`.as(selectedRelationTsKey);
        joins.push({
          on: sql`true`,
          table: new Subquery(builtRelation.sql, {}, relationTableAlias),
          alias: relationTableAlias,
          joinType: "left",
          lateral: true
        });
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({ message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")` });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_build_array(${sql.join(
        selection.map(
          ({ field: field2, tsKey, isJson }) => isJson ? sql`${sql.identifier(`${tableAlias}_${tsKey}`)}.${sql.identifier("data")}` : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`coalesce(json_agg(${field}${orderBy.length > 0 ? sql` order by ${sql.join(orderBy, sql`, `)}` : void 0}), '[]'::json)`;
      }
      const nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field: field.as("data"),
        isJson: true,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [{
            path: [],
            field: sql.raw("*")
          }],
          where,
          limit,
          offset,
          orderBy,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = [];
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, PgTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
};
_a125 = entityKind;
__publicField(PgDialect, _a125, "PgDialect");

// node_modules/drizzle-orm/selection-proxy.js
var _a126;
var _SelectionProxyHandler = class {
  config;
  constructor(config) {
    this.config = { ...config };
  }
  get(subquery, prop) {
    if (prop === "_") {
      return {
        ...subquery["_"],
        selectedFields: new Proxy(
          subquery._.selectedFields,
          this
        )
      };
    }
    if (prop === ViewBaseConfig) {
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    }
    if (typeof prop === "symbol") {
      return subquery[prop];
    }
    const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
    const value = columns[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
        return value.sql;
      }
      const newValue = value.clone();
      newValue.isSelectionField = true;
      return newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql") {
        return value;
      }
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    if (is(value, Column)) {
      if (this.config.alias) {
        return new Proxy(
          value,
          new ColumnAliasProxyHandler(
            new Proxy(
              value.table,
              new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
            )
          )
        );
      }
      return value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    return new Proxy(value, new _SelectionProxyHandler(this.config));
  }
};
var SelectionProxyHandler = _SelectionProxyHandler;
_a126 = entityKind;
__publicField(SelectionProxyHandler, _a126, "SelectionProxyHandler");

// node_modules/drizzle-orm/query-builders/query-builder.js
var _a127;
var TypedQueryBuilder = class {
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
};
_a127 = entityKind;
__publicField(TypedQueryBuilder, _a127, "TypedQueryBuilder");

// node_modules/drizzle-orm/pg-core/query-builders/select.js
var _a128;
var PgSelectBuilder = class {
  fields;
  session;
  dialect;
  withList = [];
  distinct;
  constructor(config) {
    this.fields = config.fields;
    this.session = config.session;
    this.dialect = config.dialect;
    if (config.withList) {
      this.withList = config.withList;
    }
    this.distinct = config.distinct;
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  /**
   * Specify the table, subquery, or other target that you're
   * building a select query against.
   *
   * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM | Postgres from documentation}
   */
  from(source) {
    const isPartialSelect = !!this.fields;
    let fields;
    if (this.fields) {
      fields = this.fields;
    } else if (is(source, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(source._.selectedFields).map((key) => [key, source[key]])
      );
    } else if (is(source, PgViewBase)) {
      fields = source[ViewBaseConfig].selectedFields;
    } else if (is(source, SQL)) {
      fields = {};
    } else {
      fields = getTableColumns(source);
    }
    return new PgSelectBase({
      table: source,
      fields,
      isPartialSelect,
      session: this.session,
      dialect: this.dialect,
      withList: this.withList,
      distinct: this.distinct
    }).setToken(this.authToken);
  }
};
_a128 = entityKind;
__publicField(PgSelectBuilder, _a128, "PgSelectBuilder");
var _a129;
var PgSelectQueryBuilderBase = class extends TypedQueryBuilder {
  _;
  config;
  joinsNotNullableMap;
  tableName;
  isPartialSelect;
  session;
  dialect;
  constructor({ table, fields, isPartialSelect, session: session2, dialect, withList, distinct }) {
    super();
    this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: []
    };
    this.isPartialSelect = isPartialSelect;
    this.session = session2;
    this.dialect = dialect;
    this._ = {
      selectedFields: fields
    };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
  }
  createJoin(joinType) {
    return (table, on) => {
      const baseTableName = this.tableName;
      const tableName = getTableLikeName(table);
      if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (!this.isPartialSelect) {
        if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
          this.config.fields = {
            [baseTableName]: this.config.fields
          };
        }
        if (typeof tableName === "string" && !is(table, SQL)) {
          const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
          this.config.fields[tableName] = selection;
        }
      }
      if (typeof on === "function") {
        on = on(
          new Proxy(
            this.config.fields,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      if (!this.config.joins) {
        this.config.joins = [];
      }
      this.config.joins.push({ on, table, joinType, alias: tableName });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  /**
   * Executes a `left join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet | null }[] = await db.select()
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  leftJoin = this.createJoin("left");
  /**
   * Executes a `right join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet }[] = await db.select()
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  rightJoin = this.createJoin("right");
  /**
   * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet }[] = await db.select()
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  innerJoin = this.createJoin("inner");
  /**
   * Executes a `full join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet | null }[] = await db.select()
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  fullJoin = this.createJoin("full");
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      const rightSelect = typeof rightSelection === "function" ? rightSelection(getPgSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
      this.config.setOperators.push({ type, isAll, rightSelect });
      return this;
    };
  }
  /**
   * Adds `union` set operator to the query.
   *
   * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
   *
   * @example
   *
   * ```ts
   * // Select all unique names from customers and users tables
   * await db.select({ name: users.name })
   *   .from(users)
   *   .union(
   *     db.select({ name: customers.name }).from(customers)
   *   );
   * // or
   * import { union } from 'drizzle-orm/pg-core'
   *
   * await union(
   *   db.select({ name: users.name }).from(users),
   *   db.select({ name: customers.name }).from(customers)
   * );
   * ```
   */
  union = this.createSetOperator("union", false);
  /**
   * Adds `union all` set operator to the query.
   *
   * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
   *
   * @example
   *
   * ```ts
   * // Select all transaction ids from both online and in-store sales
   * await db.select({ transaction: onlineSales.transactionId })
   *   .from(onlineSales)
   *   .unionAll(
   *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   *   );
   * // or
   * import { unionAll } from 'drizzle-orm/pg-core'
   *
   * await unionAll(
   *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
   *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   * );
   * ```
   */
  unionAll = this.createSetOperator("union", true);
  /**
   * Adds `intersect` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
   *
   * @example
   *
   * ```ts
   * // Select course names that are offered in both departments A and B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .intersect(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { intersect } from 'drizzle-orm/pg-core'
   *
   * await intersect(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  intersect = this.createSetOperator("intersect", false);
  /**
   * Adds `intersect all` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets including all duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect-all}
   *
   * @example
   *
   * ```ts
   * // Select all products and quantities that are ordered by both regular and VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered
   * })
   * .from(regularCustomerOrders)
   * .intersectAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { intersectAll } from 'drizzle-orm/pg-core'
   *
   * await intersectAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  intersectAll = this.createSetOperator("intersect", true);
  /**
   * Adds `except` set operator to the query.
   *
   * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
   *
   * @example
   *
   * ```ts
   * // Select all courses offered in department A but not in department B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .except(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { except } from 'drizzle-orm/pg-core'
   *
   * await except(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  except = this.createSetOperator("except", false);
  /**
   * Adds `except all` set operator to the query.
   *
   * Calling this method will retrieve all rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except-all}
   *
   * @example
   *
   * ```ts
   * // Select all products that are ordered by regular customers but not by VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered,
   * })
   * .from(regularCustomerOrders)
   * .exceptAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered,
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { exceptAll } from 'drizzle-orm/pg-core'
   *
   * await exceptAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  exceptAll = this.createSetOperator("except", true);
  /** @internal */
  addSetOperators(setOperators) {
    this.config.setOperators.push(...setOperators);
    return this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    if (typeof where === "function") {
      where = where(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.where = where;
    return this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    if (typeof having === "function") {
      having = having(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.having = having;
    return this;
  }
  groupBy(...columns) {
    if (typeof columns[0] === "function") {
      const groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else {
      this.config.groupBy = columns;
    }
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    } else {
      const orderByArray = columns;
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).limit = limit;
    } else {
      this.config.limit = limit;
    }
    return this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).offset = offset;
    } else {
      this.config.offset = offset;
    }
    return this;
  }
  /**
   * Adds a `for` clause to the query.
   *
   * Calling this method will specify a lock strength for this query that controls how strictly it acquires exclusive access to the rows being queried.
   *
   * See docs: {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE}
   *
   * @param strength the lock strength.
   * @param config the lock configuration.
   */
  for(strength, config = {}) {
    this.config.lockingClause = { strength, config };
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
};
_a129 = entityKind;
__publicField(PgSelectQueryBuilderBase, _a129, "PgSelectQueryBuilder");
var _a130;
var PgSelectBase = class extends PgSelectQueryBuilderBase {
  /** @internal */
  _prepare(name) {
    const { session: session2, config, dialect, joinsNotNullableMap, authToken } = this;
    if (!session2) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    }
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      const fieldsList = orderSelectedFields(config.fields);
      const query = session2.prepareQuery(dialect.sqlToQuery(this.getSQL()), fieldsList, name, true);
      query.joinsNotNullableMap = joinsNotNullableMap;
      return query.setToken(authToken);
    });
  }
  /**
   * Create a prepared statement for this query. This allows
   * the database to remember this query for the given session
   * and call it by name, rather than specifying the full query.
   *
   * {@link https://www.postgresql.org/docs/current/sql-prepare.html | Postgres prepare documentation}
   */
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
};
_a130 = entityKind;
__publicField(PgSelectBase, _a130, "PgSelect");
applyMixins(PgSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
var getPgSetOperators = () => ({
  union,
  unionAll,
  intersect,
  intersectAll,
  except,
  exceptAll
});
var union = createSetOperator("union", false);
var unionAll = createSetOperator("union", true);
var intersect = createSetOperator("intersect", false);
var intersectAll = createSetOperator("intersect", true);
var except = createSetOperator("except", false);
var exceptAll = createSetOperator("except", true);

// node_modules/drizzle-orm/pg-core/query-builders/query-builder.js
var _a131;
var QueryBuilder = class {
  dialect;
  dialectConfig;
  constructor(dialect) {
    this.dialect = is(dialect, PgDialect) ? dialect : void 0;
    this.dialectConfig = is(dialect, PgDialect) ? void 0 : dialect;
  }
  $with(alias) {
    const queryBuilder = this;
    return {
      as(qb) {
        if (typeof qb === "function") {
          qb = qb(queryBuilder);
        }
        return new Proxy(
          new WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true),
          new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
    };
  }
  with(...queries) {
    const self2 = this;
    function select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self2.getDialect(),
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self2.getDialect(),
        distinct: true
      });
    }
    function selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self2.getDialect(),
        distinct: { on }
      });
    }
    return { select, selectDistinct, selectDistinctOn };
  }
  select(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect()
    });
  }
  selectDistinct(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: true
    });
  }
  selectDistinctOn(on, fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: { on }
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    if (!this.dialect) {
      this.dialect = new PgDialect(this.dialectConfig);
    }
    return this.dialect;
  }
};
_a131 = entityKind;
__publicField(QueryBuilder, _a131, "PgQueryBuilder");

// node_modules/drizzle-orm/pg-core/query-builders/insert.js
var _a132;
var PgInsertBuilder = class {
  constructor(table, session2, dialect, withList, overridingSystemValue_) {
    this.table = table;
    this.session = session2;
    this.dialect = dialect;
    this.withList = withList;
    this.overridingSystemValue_ = overridingSystemValue_;
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  overridingSystemValue() {
    this.overridingSystemValue_ = true;
    return this;
  }
  values(values) {
    values = Array.isArray(values) ? values : [values];
    if (values.length === 0) {
      throw new Error("values() must be called with at least one value");
    }
    const mappedValues = values.map((entry) => {
      const result = {};
      const cols = this.table[Table.Symbol.Columns];
      for (const colKey of Object.keys(entry)) {
        const colValue = entry[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new PgInsertBase(
      this.table,
      mappedValues,
      this.session,
      this.dialect,
      this.withList,
      false,
      this.overridingSystemValue_
    ).setToken(this.authToken);
  }
  select(selectQuery) {
    const select = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
    if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields)) {
      throw new Error(
        "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
      );
    }
    return new PgInsertBase(this.table, select, this.session, this.dialect, this.withList, true);
  }
};
_a132 = entityKind;
__publicField(PgInsertBuilder, _a132, "PgInsertBuilder");
var _a133;
var PgInsertBase = class extends QueryPromise {
  constructor(table, values, session2, dialect, withList, select, overridingSystemValue_) {
    super();
    this.session = session2;
    this.dialect = dialect;
    this.config = { table, values, withList, select, overridingSystemValue_ };
  }
  config;
  returning(fields = this.config.table[Table.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /**
   * Adds an `on conflict do nothing` clause to the query.
   *
   * Calling this method simply avoids inserting a row as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
   *
   * @param config The `target` and `where` clauses.
   *
   * @example
   * ```ts
   * // Insert one row and cancel the insert if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing();
   *
   * // Explicitly specify conflict target
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing({ target: cars.id });
   * ```
   */
  onConflictDoNothing(config = {}) {
    if (config.target === void 0) {
      this.config.onConflict = sql`do nothing`;
    } else {
      let targetColumn = "";
      targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
      const whereSql = config.where ? sql` where ${config.where}` : void 0;
      this.config.onConflict = sql`(${sql.raw(targetColumn)})${whereSql} do nothing`;
    }
    return this;
  }
  /**
   * Adds an `on conflict do update` clause to the query.
   *
   * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
   *
   * @param config The `target`, `set` and `where` clauses.
   *
   * @example
   * ```ts
   * // Update the row if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'Porsche' }
   *   });
   *
   * // Upsert with 'where' clause
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'newBMW' },
   *     targetWhere: sql`${cars.createdAt} > '2023-01-01'::date`,
   *   });
   * ```
   */
  onConflictDoUpdate(config) {
    if (config.where && (config.targetWhere || config.setWhere)) {
      throw new Error(
        'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.'
      );
    }
    const whereSql = config.where ? sql` where ${config.where}` : void 0;
    const targetWhereSql = config.targetWhere ? sql` where ${config.targetWhere}` : void 0;
    const setWhereSql = config.setWhere ? sql` where ${config.setWhere}` : void 0;
    const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
    let targetColumn = "";
    targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
    this.config.onConflict = sql`(${sql.raw(targetColumn)})${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
  $dynamic() {
    return this;
  }
};
_a133 = entityKind;
__publicField(PgInsertBase, _a133, "PgInsert");

// node_modules/drizzle-orm/pg-core/query-builders/refresh-materialized-view.js
var _a134;
var PgRefreshMaterializedView = class extends QueryPromise {
  constructor(view, session2, dialect) {
    super();
    this.session = session2;
    this.dialect = dialect;
    this.config = { view };
  }
  config;
  concurrently() {
    if (this.config.withNoData !== void 0) {
      throw new Error("Cannot use concurrently and withNoData together");
    }
    this.config.concurrently = true;
    return this;
  }
  withNoData() {
    if (this.config.concurrently !== void 0) {
      throw new Error("Cannot use concurrently and withNoData together");
    }
    this.config.withNoData = true;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildRefreshMaterializedViewQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), void 0, name, true);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
};
_a134 = entityKind;
__publicField(PgRefreshMaterializedView, _a134, "PgRefreshMaterializedView");

// node_modules/drizzle-orm/pg-core/query-builders/update.js
var _a135;
var PgUpdateBuilder = class {
  constructor(table, session2, dialect, withList) {
    this.table = table;
    this.session = session2;
    this.dialect = dialect;
    this.withList = withList;
  }
  authToken;
  setToken(token) {
    this.authToken = token;
    return this;
  }
  set(values) {
    return new PgUpdateBase(
      this.table,
      mapUpdateSet(this.table, values),
      this.session,
      this.dialect,
      this.withList
    ).setToken(this.authToken);
  }
};
_a135 = entityKind;
__publicField(PgUpdateBuilder, _a135, "PgUpdateBuilder");
var _a136;
var PgUpdateBase = class extends QueryPromise {
  constructor(table, set, session2, dialect, withList) {
    super();
    this.session = session2;
    this.dialect = dialect;
    this.config = { set, table, withList, joins: [] };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
  }
  config;
  tableName;
  joinsNotNullableMap;
  from(source) {
    const tableName = getTableLikeName(source);
    if (typeof tableName === "string") {
      this.joinsNotNullableMap[tableName] = true;
    }
    this.config.from = source;
    return this;
  }
  getTableLikeFields(table) {
    if (is(table, PgTable)) {
      return table[Table.Symbol.Columns];
    } else if (is(table, Subquery)) {
      return table._.selectedFields;
    }
    return table[ViewBaseConfig].selectedFields;
  }
  createJoin(joinType) {
    return (table, on) => {
      const tableName = getTableLikeName(table);
      if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (typeof on === "function") {
        const from = this.config.from && !is(this.config.from, SQL) ? this.getTableLikeFields(this.config.from) : void 0;
        on = on(
          new Proxy(
            this.config.table[Table.Symbol.Columns],
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          ),
          from && new Proxy(
            from,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      this.config.joins.push({ on, table, joinType, alias: tableName });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  leftJoin = this.createJoin("left");
  rightJoin = this.createJoin("right");
  innerJoin = this.createJoin("inner");
  fullJoin = this.createJoin("full");
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * await db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * await db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * await db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * await db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields) {
    if (!fields) {
      fields = Object.assign({}, this.config.table[Table.Symbol.Columns]);
      if (this.config.from) {
        const tableName = getTableLikeName(this.config.from);
        if (typeof tableName === "string" && this.config.from && !is(this.config.from, SQL)) {
          const fromFields = this.getTableLikeFields(this.config.from);
          fields[tableName] = fromFields;
        }
        for (const join of this.config.joins) {
          const tableName2 = getTableLikeName(join.table);
          if (typeof tableName2 === "string" && !is(join.table, SQL)) {
            const fromFields = this.getTableLikeFields(join.table);
            fields[tableName2] = fromFields;
          }
        }
      }
    }
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true);
    query.joinsNotNullableMap = this.joinsNotNullableMap;
    return query;
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return this._prepare().execute(placeholderValues, this.authToken);
  };
  $dynamic() {
    return this;
  }
};
_a136 = entityKind;
__publicField(PgUpdateBase, _a136, "PgUpdate");

// node_modules/drizzle-orm/pg-core/query-builders/count.js
var _a137;
var _PgCountBuilder = class extends SQL {
  constructor(params) {
    super(_PgCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
    this.params = params;
    this.mapWith(Number);
    this.session = params.session;
    this.sql = _PgCountBuilder.buildCount(
      params.source,
      params.filters
    );
  }
  sql;
  token;
  [(_a137 = entityKind, Symbol.toStringTag)] = "PgCountBuilder";
  session;
  static buildEmbeddedCount(source, filters) {
    return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
  }
  static buildCount(source, filters) {
    return sql`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters};`;
  }
  /** @intrnal */
  setToken(token) {
    this.token = token;
    return this;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.session.count(this.sql, this.token)).then(
      onfulfilled,
      onrejected
    );
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
};
var PgCountBuilder = _PgCountBuilder;
__publicField(PgCountBuilder, _a137, "PgCountBuilder");

// node_modules/drizzle-orm/pg-core/query-builders/query.js
var _a138;
var RelationalQueryBuilder = class {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session2) {
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session2;
  }
  findMany(config) {
    return new PgRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many"
    );
  }
  findFirst(config) {
    return new PgRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    );
  }
};
_a138 = entityKind;
__publicField(RelationalQueryBuilder, _a138, "PgRelationalQueryBuilder");
var _a139;
var PgRelationalQuery = class extends QueryPromise {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session2, config, mode) {
    super();
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session2;
    this.config = config;
    this.mode = mode;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      const { query, builtQuery } = this._toSQL();
      return this.session.prepareQuery(
        builtQuery,
        void 0,
        name,
        true,
        (rawRows, mapColumnValue) => {
          const rows = rawRows.map(
            (row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
          );
          if (this.mode === "first") {
            return rows[0];
          }
          return rows;
        }
      );
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  _getQuery() {
    return this.dialect.buildRelationalQueryWithoutPK({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    });
  }
  /** @internal */
  getSQL() {
    return this._getQuery().sql;
  }
  _toSQL() {
    const query = this._getQuery();
    const builtQuery = this.dialect.sqlToQuery(query.sql);
    return { query, builtQuery };
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute() {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(void 0, this.authToken);
    });
  }
};
_a139 = entityKind;
__publicField(PgRelationalQuery, _a139, "PgRelationalQuery");

// node_modules/drizzle-orm/pg-core/query-builders/raw.js
var _a140;
var PgRaw = class extends QueryPromise {
  constructor(execute, sql2, query, mapBatchResult) {
    super();
    this.execute = execute;
    this.sql = sql2;
    this.query = query;
    this.mapBatchResult = mapBatchResult;
  }
  /** @internal */
  getSQL() {
    return this.sql;
  }
  getQuery() {
    return this.query;
  }
  mapResult(result, isFromBatch) {
    return isFromBatch ? this.mapBatchResult(result) : result;
  }
  _prepare() {
    return this;
  }
  /** @internal */
  isResponseInArrayMode() {
    return false;
  }
};
_a140 = entityKind;
__publicField(PgRaw, _a140, "PgRaw");

// node_modules/drizzle-orm/pg-core/db.js
var _a141;
var PgDatabase = class {
  constructor(dialect, session2, schema) {
    this.dialect = dialect;
    this.session = session2;
    this._ = schema ? {
      schema: schema.schema,
      fullSchema: schema.fullSchema,
      tableNamesMap: schema.tableNamesMap,
      session: session2
    } : {
      schema: void 0,
      fullSchema: {},
      tableNamesMap: {},
      session: session2
    };
    this.query = {};
    if (this._.schema) {
      for (const [tableName, columns] of Object.entries(this._.schema)) {
        this.query[tableName] = new RelationalQueryBuilder(
          schema.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema.fullSchema[tableName],
          columns,
          dialect,
          session2
        );
      }
    }
  }
  query;
  /**
   * Creates a subquery that defines a temporary named result set as a CTE.
   *
   * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param alias The alias for the subquery.
   *
   * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
   *
   * @example
   *
   * ```ts
   * // Create a subquery with alias 'sq' and use it in the select query
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * const result = await db.with(sq).select().from(sq);
   * ```
   *
   * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
   *
   * ```ts
   * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
   * const sq = db.$with('sq').as(db.select({
   *   name: sql<string>`upper(${users.name})`.as('name'),
   * })
   * .from(users));
   *
   * const result = await db.with(sq).select({ name: sq.name }).from(sq);
   * ```
   */
  $with(alias) {
    const self2 = this;
    return {
      as(qb) {
        if (typeof qb === "function") {
          qb = qb(new QueryBuilder(self2.dialect));
        }
        return new Proxy(
          new WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true),
          new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
    };
  }
  $count(source, filters) {
    return new PgCountBuilder({ source, filters, session: this.session });
  }
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    const self2 = this;
    function select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self2.session,
        dialect: self2.dialect,
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self2.session,
        dialect: self2.dialect,
        withList: queries,
        distinct: true
      });
    }
    function selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self2.session,
        dialect: self2.dialect,
        withList: queries,
        distinct: { on }
      });
    }
    function update(table) {
      return new PgUpdateBuilder(table, self2.session, self2.dialect, queries);
    }
    function insert(table) {
      return new PgInsertBuilder(table, self2.session, self2.dialect, queries);
    }
    function delete_(table) {
      return new PgDeleteBase(table, self2.session, self2.dialect, queries);
    }
    return { select, selectDistinct, selectDistinctOn, update, insert, delete: delete_ };
  }
  select(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect
    });
  }
  selectDistinct(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: true
    });
  }
  selectDistinctOn(on, fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: { on }
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   *
   * // Update with returning clause
   * const updatedCar: Car[] = await db.update(cars)
   *   .set({ color: 'red' })
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  update(table) {
    return new PgUpdateBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   *
   * // Insert with returning clause
   * const insertedCar: Car[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning();
   * ```
   */
  insert(table) {
    return new PgInsertBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   *
   * // Delete with returning clause
   * const deletedCar: Car[] = await db.delete(cars)
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  delete(table) {
    return new PgDeleteBase(table, this.session, this.dialect);
  }
  refreshMaterializedView(view) {
    return new PgRefreshMaterializedView(view, this.session, this.dialect);
  }
  authToken;
  execute(query) {
    const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
    const builtQuery = this.dialect.sqlToQuery(sequel);
    const prepared = this.session.prepareQuery(
      builtQuery,
      void 0,
      void 0,
      false
    );
    return new PgRaw(
      () => prepared.execute(void 0, this.authToken),
      sequel,
      builtQuery,
      (result) => prepared.mapResult(result, true)
    );
  }
  transaction(transaction, config) {
    return this.session.transaction(transaction, config);
  }
};
_a141 = entityKind;
__publicField(PgDatabase, _a141, "PgDatabase");

// node_modules/drizzle-orm/pg-core/session.js
var _a142;
var PgPreparedQuery = class {
  constructor(query) {
    this.query = query;
  }
  authToken;
  getQuery() {
    return this.query;
  }
  mapResult(response, _isFromBatch) {
    return response;
  }
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  /** @internal */
  joinsNotNullableMap;
};
_a142 = entityKind;
__publicField(PgPreparedQuery, _a142, "PgPreparedQuery");
var _a143;
var PgSession = class {
  constructor(dialect) {
    this.dialect = dialect;
  }
  /** @internal */
  execute(query, token) {
    return tracer.startActiveSpan("drizzle.operation", () => {
      const prepared = tracer.startActiveSpan("drizzle.prepareQuery", () => {
        return this.prepareQuery(
          this.dialect.sqlToQuery(query),
          void 0,
          void 0,
          false
        );
      });
      return prepared.setToken(token).execute(void 0, token);
    });
  }
  all(query) {
    return this.prepareQuery(
      this.dialect.sqlToQuery(query),
      void 0,
      void 0,
      false
    ).all();
  }
  /** @internal */
  async count(sql2, token) {
    const res = await this.execute(sql2, token);
    return Number(
      res[0]["count"]
    );
  }
};
_a143 = entityKind;
__publicField(PgSession, _a143, "PgSession");
var _a144;
var PgTransaction = class extends PgDatabase {
  constructor(dialect, session2, schema, nestedIndex = 0) {
    super(dialect, session2, schema);
    this.schema = schema;
    this.nestedIndex = nestedIndex;
  }
  rollback() {
    throw new TransactionRollbackError();
  }
  /** @internal */
  getTransactionConfigSQL(config) {
    const chunks = [];
    if (config.isolationLevel) {
      chunks.push(`isolation level ${config.isolationLevel}`);
    }
    if (config.accessMode) {
      chunks.push(config.accessMode);
    }
    if (typeof config.deferrable === "boolean") {
      chunks.push(config.deferrable ? "deferrable" : "not deferrable");
    }
    return sql.raw(chunks.join(" "));
  }
  setTransaction(config) {
    return this.session.execute(sql`set transaction ${this.getTransactionConfigSQL(config)}`);
  }
};
_a144 = entityKind;
__publicField(PgTransaction, _a144, "PgTransaction");

// node_modules/drizzle-orm/neon-http/session.js
var rawQueryConfig = {
  arrayMode: false,
  fullResults: true
};
var queryConfig = {
  arrayMode: true,
  fullResults: true
};
var _a145;
var NeonHttpPreparedQuery = class extends PgPreparedQuery {
  constructor(client, query, logger, fields, _isResponseInArrayMode, customResultMapper) {
    super(query);
    this.client = client;
    this.logger = logger;
    this.fields = fields;
    this._isResponseInArrayMode = _isResponseInArrayMode;
    this.customResultMapper = customResultMapper;
  }
  /** @internal */
  async execute(placeholderValues = {}, token = this.authToken) {
    const params = fillPlaceholders(this.query.params, placeholderValues);
    this.logger.logQuery(this.query.sql, params);
    const { fields, client, query, customResultMapper } = this;
    if (!fields && !customResultMapper) {
      return client(
        query.sql,
        params,
        token === void 0 ? rawQueryConfig : {
          ...rawQueryConfig,
          authToken: token
        }
      );
    }
    const result = await client(
      query.sql,
      params,
      token === void 0 ? queryConfig : {
        ...queryConfig,
        authToken: token
      }
    );
    return this.mapResult(result);
  }
  mapResult(result) {
    if (!this.fields && !this.customResultMapper) {
      return result;
    }
    const rows = result.rows;
    if (this.customResultMapper) {
      return this.customResultMapper(rows);
    }
    return rows.map((row) => mapResultRow(this.fields, row, this.joinsNotNullableMap));
  }
  all(placeholderValues = {}) {
    const params = fillPlaceholders(this.query.params, placeholderValues);
    this.logger.logQuery(this.query.sql, params);
    return this.client(
      this.query.sql,
      params,
      this.authToken === void 0 ? rawQueryConfig : {
        ...rawQueryConfig,
        authToken: this.authToken
      }
    ).then((result) => result.rows);
  }
  /** @internal */
  values(placeholderValues = {}, token) {
    const params = fillPlaceholders(this.query.params, placeholderValues);
    this.logger.logQuery(this.query.sql, params);
    return this.client(this.query.sql, params, { arrayMode: true, fullResults: true, authToken: token }).then((result) => result.rows);
  }
  /** @internal */
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
};
_a145 = entityKind;
__publicField(NeonHttpPreparedQuery, _a145, "NeonHttpPreparedQuery");
var _a146;
var NeonHttpSession = class extends PgSession {
  constructor(client, dialect, schema, options = {}) {
    super(dialect);
    this.client = client;
    this.schema = schema;
    this.options = options;
    this.logger = options.logger ?? new NoopLogger();
  }
  logger;
  prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper) {
    return new NeonHttpPreparedQuery(
      this.client,
      query,
      this.logger,
      fields,
      isResponseInArrayMode,
      customResultMapper
    );
  }
  async batch(queries) {
    const preparedQueries = [];
    const builtQueries = [];
    for (const query of queries) {
      const preparedQuery = query._prepare();
      const builtQuery = preparedQuery.getQuery();
      preparedQueries.push(preparedQuery);
      builtQueries.push(
        this.client(builtQuery.sql, builtQuery.params, {
          fullResults: true,
          arrayMode: preparedQuery.isResponseInArrayMode()
        })
      );
    }
    const batchResults = await this.client.transaction(builtQueries, queryConfig);
    return batchResults.map((result, i4) => preparedQueries[i4].mapResult(result, true));
  }
  // change return type to QueryRows<true>
  async query(query, params) {
    this.logger.logQuery(query, params);
    const result = await this.client(query, params, { arrayMode: true, fullResults: true });
    return result;
  }
  // change return type to QueryRows<false>
  async queryObjects(query, params) {
    return this.client(query, params, { arrayMode: false, fullResults: true });
  }
  /** @internal */
  async count(sql2, token) {
    const res = await this.execute(sql2, token);
    return Number(
      res["rows"][0]["count"]
    );
  }
  async transaction(_transaction, _config = {}) {
    throw new Error("No transactions support in neon-http driver");
  }
};
_a146 = entityKind;
__publicField(NeonHttpSession, _a146, "NeonHttpSession");
var _a147;
var NeonTransaction = class extends PgTransaction {
  async transaction(_transaction) {
    throw new Error("No transactions support in neon-http driver");
  }
};
_a147 = entityKind;
__publicField(NeonTransaction, _a147, "NeonHttpTransaction");

// node_modules/drizzle-orm/neon-http/driver.js
var _a148;
var NeonHttpDriver = class {
  constructor(client, dialect, options = {}) {
    this.client = client;
    this.dialect = dialect;
    this.options = options;
    this.initMappers();
  }
  createSession(schema) {
    return new NeonHttpSession(this.client, this.dialect, schema, { logger: this.options.logger });
  }
  initMappers() {
    export_types.setTypeParser(export_types.builtins.TIMESTAMPTZ, (val) => val);
    export_types.setTypeParser(export_types.builtins.TIMESTAMP, (val) => val);
    export_types.setTypeParser(export_types.builtins.DATE, (val) => val);
    export_types.setTypeParser(export_types.builtins.INTERVAL, (val) => val);
  }
};
_a148 = entityKind;
__publicField(NeonHttpDriver, _a148, "NeonHttpDriver");
function wrap(target, token, cb, deep) {
  return new Proxy(target, {
    get(target2, p4) {
      const element = target2[p4];
      if (typeof element !== "function" && (typeof element !== "object" || element === null))
        return element;
      if (deep)
        return wrap(element, token, cb);
      if (p4 === "query")
        return wrap(element, token, cb, true);
      return new Proxy(element, {
        apply(target3, thisArg, argArray) {
          const res = target3.call(thisArg, ...argArray);
          if (typeof res === "object" && res !== null && "setToken" in res && typeof res.setToken === "function") {
            res.setToken(token);
          }
          return cb(target3, p4, res);
        }
      });
    }
  });
}
var _a149;
var NeonHttpDatabase = class extends PgDatabase {
  $withAuth(token) {
    this.authToken = token;
    return wrap(this, token, (target, p4, res) => {
      if (p4 === "with") {
        return wrap(res, token, (_4, __, res2) => res2);
      }
      return res;
    });
  }
  async batch(batch) {
    return this.session.batch(batch);
  }
};
_a149 = entityKind;
__publicField(NeonHttpDatabase, _a149, "NeonHttpDatabase");
function construct(client, config = {}) {
  const dialect = new PgDialect({ casing: config.casing });
  let logger;
  if (config.logger === true) {
    logger = new DefaultLogger();
  } else if (config.logger !== false) {
    logger = config.logger;
  }
  let schema;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const driver = new NeonHttpDriver(client, dialect, { logger });
  const session2 = driver.createSession(schema);
  const db = new NeonHttpDatabase(
    dialect,
    session2,
    schema
  );
  db.$client = client;
  return db;
}
function drizzle(...params) {
  if (typeof params[0] === "string") {
    const instance = Xs(params[0]);
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client)
      return construct(client, drizzleConfig);
    if (typeof connection === "object") {
      const { connectionString, ...options } = connection;
      const instance2 = Xs(connectionString, options);
      return construct(instance2, drizzleConfig);
    }
    const instance = Xs(connection);
    return construct(instance, drizzleConfig);
  }
  return construct(params[0], params[1]);
}
((drizzle2) => {
  function mock(config) {
    return construct({}, config);
  }
  drizzle2.mock = mock;
})(drizzle || (drizzle = {}));

// src/_db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  homepage_contents: () => homepage_contents,
  products: () => products,
  user_relations: () => user_relations,
  users: () => users,
  wishlist_items: () => wishlist_items,
  wishlist_items_relations: () => wishlist_items_relations,
  wishlist_relations: () => wishlist_relations,
  wishlists: () => wishlists
});
var users = pgTable("users", {
  userId: serial("userId").primaryKey().unique().notNull(),
  role: text("role").notNull(),
  name: text("name").notNull().unique(),
  avatarUrl: text("avatarUrl"),
  email: text("email").notNull().unique(),
  mobileNumber: bigint({ mode: "number" }),
  provider: text("provider").notNull()
});
var wishlists = pgTable("wishlists", {
  wishlistId: serial("wishlistId").primaryKey(),
  userId: integer("userId").notNull().references(() => users.userId)
  // Reference to Users
});
var products = pgTable("products", {
  productId: serial("productId").primaryKey(),
  productName: text("productName").notNull(),
  brand: text("brand").notNull(),
  price: text("price").notNull(),
  productDescription: jsonb("productDescription").notNull(),
  image_urls: jsonb("image_urls").notNull()
});
var homepage_contents = pgTable("homepage_contents", {
  id: serial("homepage_contents_id").primaryKey(),
  popular_categories: jsonb("popular_categories").notNull(),
  recent_deals: jsonb("recent_deals").notNull(),
  popular_products: jsonb("popular_products").notNull(),
  slides: jsonb("slides").notNull(),
  popular_with_men: jsonb("popular_with_men").notNull(),
  popular_with_women: jsonb("popular_with_women").notNull()
});
var wishlist_items = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlistId").notNull().references(() => wishlists.wishlistId),
  // Reference to Wishlists
  productId: integer("productId").notNull().references(() => products.productId)
  // Reference to Products
});
var user_relations = relations(users, ({ many }) => ({
  WishlistItems: many(wishlist_items)
  // this creates a relationship between Users and WishlistItems
}));
var wishlist_relations = relations(wishlists, ({ many }) => ({
  WishlistItems: many(wishlist_items)
  // this creates a relationship between Wishlists and WishlistItems
}));
var wishlist_items_relations = relations(
  wishlist_items,
  ({ one }) => ({
    Wishlist: one(wishlists, {
      fields: [wishlist_items.wishlistId],
      references: [wishlists.wishlistId]
    }),
    // this creates a relationship between WishlistItems and Wishlists
    Product: one(products, {
      fields: [wishlist_items.productId],
      references: [products.productId]
    })
    // this creates a relationship between WishlistItems and Products
  })
);

// node_modules/@auth/core/lib/utils/cookie.js
var __classPrivateFieldSet = function(receiver, state2, value, kind, f4) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f4)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state2 === "function" ? receiver !== state2 || !f4 : !state2.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f4.call(receiver, value) : f4 ? f4.value = value : state2.set(receiver, value), value;
};
var __classPrivateFieldGet = function(receiver, state2, kind, f4) {
  if (kind === "a" && !f4)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state2 === "function" ? receiver !== state2 || !f4 : !state2.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f4 : kind === "a" ? f4.call(receiver) : f4 ? f4.value : state2.get(receiver);
};
var _SessionStore_instances;
var _SessionStore_chunks;
var _SessionStore_option;
var _SessionStore_logger;
var _SessionStore_chunk;
var _SessionStore_clean;
var ALLOWED_COOKIE_SIZE = 4096;
var ESTIMATED_EMPTY_COOKIE_SIZE = 160;
var CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE;
function defaultCookies(useSecureCookies) {
  const cookiePrefix = useSecureCookies ? "__Secure-" : "";
  return {
    // default cookie options
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    csrfToken: {
      // Default to __Host- for CSRF token for additional protection if using useSecureCookies
      // NB: The `__Host-` prefix is stricter than the `__Secure-` prefix.
      name: `${useSecureCookies ? "__Host-" : ""}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15
        // 15 minutes in seconds
      }
    },
    state: {
      name: `${cookiePrefix}authjs.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15
        // 15 minutes in seconds
      }
    },
    nonce: {
      name: `${cookiePrefix}authjs.nonce`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies
      }
    },
    webauthnChallenge: {
      name: `${cookiePrefix}authjs.challenge`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15
        // 15 minutes in seconds
      }
    }
  };
}
var SessionStore = class {
  constructor(option, cookies, logger) {
    _SessionStore_instances.add(this);
    _SessionStore_chunks.set(this, {});
    _SessionStore_option.set(this, void 0);
    _SessionStore_logger.set(this, void 0);
    __classPrivateFieldSet(this, _SessionStore_logger, logger, "f");
    __classPrivateFieldSet(this, _SessionStore_option, option, "f");
    if (!cookies)
      return;
    const { name: sessionCookiePrefix } = option;
    for (const [name, value] of Object.entries(cookies)) {
      if (!name.startsWith(sessionCookiePrefix) || !value)
        continue;
      __classPrivateFieldGet(this, _SessionStore_chunks, "f")[name] = value;
    }
  }
  /**
   * The JWT Session or database Session ID
   * constructed from the cookie chunks.
   */
  get value() {
    const sortedKeys = Object.keys(__classPrivateFieldGet(this, _SessionStore_chunks, "f")).sort((a4, b2) => {
      const aSuffix = parseInt(a4.split(".").pop() || "0");
      const bSuffix = parseInt(b2.split(".").pop() || "0");
      return aSuffix - bSuffix;
    });
    return sortedKeys.map((key) => __classPrivateFieldGet(this, _SessionStore_chunks, "f")[key]).join("");
  }
  /**
   * Given a cookie value, return new cookies, chunked, to fit the allowed cookie size.
   * If the cookie has changed from chunked to unchunked or vice versa,
   * it deletes the old cookies as well.
   */
  chunk(value, options) {
    const cookies = __classPrivateFieldGet(this, _SessionStore_instances, "m", _SessionStore_clean).call(this);
    const chunked = __classPrivateFieldGet(this, _SessionStore_instances, "m", _SessionStore_chunk).call(this, {
      name: __classPrivateFieldGet(this, _SessionStore_option, "f").name,
      value,
      options: { ...__classPrivateFieldGet(this, _SessionStore_option, "f").options, ...options }
    });
    for (const chunk of chunked) {
      cookies[chunk.name] = chunk;
    }
    return Object.values(cookies);
  }
  /** Returns a list of cookies that should be cleaned. */
  clean() {
    return Object.values(__classPrivateFieldGet(this, _SessionStore_instances, "m", _SessionStore_clean).call(this));
  }
};
_SessionStore_chunks = /* @__PURE__ */ new WeakMap(), _SessionStore_option = /* @__PURE__ */ new WeakMap(), _SessionStore_logger = /* @__PURE__ */ new WeakMap(), _SessionStore_instances = /* @__PURE__ */ new WeakSet(), _SessionStore_chunk = function _SessionStore_chunk2(cookie) {
  const chunkCount = Math.ceil(cookie.value.length / CHUNK_SIZE);
  if (chunkCount === 1) {
    __classPrivateFieldGet(this, _SessionStore_chunks, "f")[cookie.name] = cookie.value;
    return [cookie];
  }
  const cookies = [];
  for (let i4 = 0; i4 < chunkCount; i4++) {
    const name = `${cookie.name}.${i4}`;
    const value = cookie.value.substr(i4 * CHUNK_SIZE, CHUNK_SIZE);
    cookies.push({ ...cookie, name, value });
    __classPrivateFieldGet(this, _SessionStore_chunks, "f")[name] = value;
  }
  __classPrivateFieldGet(this, _SessionStore_logger, "f").debug("CHUNKING_SESSION_COOKIE", {
    message: `Session cookie exceeds allowed ${ALLOWED_COOKIE_SIZE} bytes.`,
    emptyCookieSize: ESTIMATED_EMPTY_COOKIE_SIZE,
    valueSize: cookie.value.length,
    chunks: cookies.map((c3) => c3.value.length + ESTIMATED_EMPTY_COOKIE_SIZE)
  });
  return cookies;
}, _SessionStore_clean = function _SessionStore_clean2() {
  const cleanedChunks = {};
  for (const name in __classPrivateFieldGet(this, _SessionStore_chunks, "f")) {
    delete __classPrivateFieldGet(this, _SessionStore_chunks, "f")?.[name];
    cleanedChunks[name] = {
      name,
      value: "",
      options: { ...__classPrivateFieldGet(this, _SessionStore_option, "f").options, maxAge: 0 }
    };
  }
  return cleanedChunks;
};

// node_modules/@auth/core/errors.js
var AuthError = class extends Error {
  constructor(message2, errorOptions) {
    if (message2 instanceof Error) {
      super(void 0, {
        cause: { err: message2, ...message2.cause, ...errorOptions }
      });
    } else if (typeof message2 === "string") {
      if (errorOptions instanceof Error) {
        errorOptions = { err: errorOptions, ...errorOptions.cause };
      }
      super(message2, errorOptions);
    } else {
      super(void 0, message2);
    }
    this.name = this.constructor.name;
    this.type = this.constructor.type ?? "AuthError";
    this.kind = this.constructor.kind ?? "error";
    Error.captureStackTrace?.(this, this.constructor);
    const url = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
    this.message += `${this.message ? ". " : ""}Read more at ${url}`;
  }
};
var SignInError = class extends AuthError {
};
SignInError.kind = "signIn";
var AdapterError = class extends AuthError {
};
AdapterError.type = "AdapterError";
var AccessDenied = class extends AuthError {
};
AccessDenied.type = "AccessDenied";
var CallbackRouteError = class extends AuthError {
};
CallbackRouteError.type = "CallbackRouteError";
var ErrorPageLoop = class extends AuthError {
};
ErrorPageLoop.type = "ErrorPageLoop";
var EventError = class extends AuthError {
};
EventError.type = "EventError";
var InvalidCallbackUrl = class extends AuthError {
};
InvalidCallbackUrl.type = "InvalidCallbackUrl";
var CredentialsSignin = class extends SignInError {
  constructor() {
    super(...arguments);
    this.code = "credentials";
  }
};
CredentialsSignin.type = "CredentialsSignin";
var InvalidEndpoints = class extends AuthError {
};
InvalidEndpoints.type = "InvalidEndpoints";
var InvalidCheck = class extends AuthError {
};
InvalidCheck.type = "InvalidCheck";
var JWTSessionError = class extends AuthError {
};
JWTSessionError.type = "JWTSessionError";
var MissingAdapter = class extends AuthError {
};
MissingAdapter.type = "MissingAdapter";
var MissingAdapterMethods = class extends AuthError {
};
MissingAdapterMethods.type = "MissingAdapterMethods";
var MissingAuthorize = class extends AuthError {
};
MissingAuthorize.type = "MissingAuthorize";
var MissingSecret = class extends AuthError {
};
MissingSecret.type = "MissingSecret";
var OAuthAccountNotLinked = class extends SignInError {
};
OAuthAccountNotLinked.type = "OAuthAccountNotLinked";
var OAuthCallbackError = class extends SignInError {
};
OAuthCallbackError.type = "OAuthCallbackError";
var OAuthProfileParseError = class extends AuthError {
};
OAuthProfileParseError.type = "OAuthProfileParseError";
var SessionTokenError = class extends AuthError {
};
SessionTokenError.type = "SessionTokenError";
var OAuthSignInError = class extends SignInError {
};
OAuthSignInError.type = "OAuthSignInError";
var EmailSignInError = class extends SignInError {
};
EmailSignInError.type = "EmailSignInError";
var SignOutError = class extends AuthError {
};
SignOutError.type = "SignOutError";
var UnknownAction = class extends AuthError {
};
UnknownAction.type = "UnknownAction";
var UnsupportedStrategy = class extends AuthError {
};
UnsupportedStrategy.type = "UnsupportedStrategy";
var InvalidProvider = class extends AuthError {
};
InvalidProvider.type = "InvalidProvider";
var UntrustedHost = class extends AuthError {
};
UntrustedHost.type = "UntrustedHost";
var Verification = class extends AuthError {
};
Verification.type = "Verification";
var MissingCSRF = class extends SignInError {
};
MissingCSRF.type = "MissingCSRF";
var clientErrors = /* @__PURE__ */ new Set([
  "CredentialsSignin",
  "OAuthAccountNotLinked",
  "OAuthCallbackError",
  "AccessDenied",
  "Verification",
  "MissingCSRF",
  "AccountNotLinked",
  "WebAuthnVerificationError"
]);
function isClientError(error) {
  if (error instanceof AuthError)
    return clientErrors.has(error.type);
  return false;
}
var DuplicateConditionalUI = class extends AuthError {
};
DuplicateConditionalUI.type = "DuplicateConditionalUI";
var MissingWebAuthnAutocomplete = class extends AuthError {
};
MissingWebAuthnAutocomplete.type = "MissingWebAuthnAutocomplete";
var WebAuthnVerificationError = class extends AuthError {
};
WebAuthnVerificationError.type = "WebAuthnVerificationError";
var AccountNotLinked = class extends SignInError {
};
AccountNotLinked.type = "AccountNotLinked";
var ExperimentalFeatureNotEnabled = class extends AuthError {
};
ExperimentalFeatureNotEnabled.type = "ExperimentalFeatureNotEnabled";

// node_modules/@auth/core/lib/utils/assert.js
var warned = false;
function isValidHttpUrl(url, baseUrl) {
  try {
    return /^https?:/.test(new URL(url, url.startsWith("/") ? baseUrl : void 0).protocol);
  } catch {
    return false;
  }
}
function isSemverString(version2) {
  return /^v\d+(?:\.\d+){0,2}$/.test(version2);
}
var hasCredentials = false;
var hasEmail = false;
var hasWebAuthn = false;
var emailMethods = [
  "createVerificationToken",
  "useVerificationToken",
  "getUserByEmail"
];
var sessionMethods = [
  "createUser",
  "getUser",
  "getUserByEmail",
  "getUserByAccount",
  "updateUser",
  "linkAccount",
  "createSession",
  "getSessionAndUser",
  "updateSession",
  "deleteSession"
];
var webauthnMethods = [
  "createUser",
  "getUser",
  "linkAccount",
  "getAccount",
  "getAuthenticator",
  "createAuthenticator",
  "listAuthenticatorsByUserId",
  "updateAuthenticatorCounter"
];
function assertConfig(request, options) {
  const { url } = request;
  const warnings = [];
  if (!warned && options.debug)
    warnings.push("debug-enabled");
  if (!options.trustHost) {
    return new UntrustedHost(`Host must be trusted. URL was: ${request.url}`);
  }
  if (!options.secret?.length) {
    return new MissingSecret("Please define a `secret`");
  }
  const callbackUrlParam = request.query?.callbackUrl;
  if (callbackUrlParam && !isValidHttpUrl(callbackUrlParam, url.origin)) {
    return new InvalidCallbackUrl(`Invalid callback URL. Received: ${callbackUrlParam}`);
  }
  const { callbackUrl: defaultCallbackUrl } = defaultCookies(options.useSecureCookies ?? url.protocol === "https:");
  const callbackUrlCookie = request.cookies?.[options.cookies?.callbackUrl?.name ?? defaultCallbackUrl.name];
  if (callbackUrlCookie && !isValidHttpUrl(callbackUrlCookie, url.origin)) {
    return new InvalidCallbackUrl(`Invalid callback URL. Received: ${callbackUrlCookie}`);
  }
  let hasConditionalUIProvider = false;
  for (const p4 of options.providers) {
    const provider = typeof p4 === "function" ? p4() : p4;
    if ((provider.type === "oauth" || provider.type === "oidc") && !(provider.issuer ?? provider.options?.issuer)) {
      const { authorization: a4, token: t2, userinfo: u4 } = provider;
      let key;
      if (typeof a4 !== "string" && !a4?.url)
        key = "authorization";
      else if (typeof t2 !== "string" && !t2?.url)
        key = "token";
      else if (typeof u4 !== "string" && !u4?.url)
        key = "userinfo";
      if (key) {
        return new InvalidEndpoints(`Provider "${provider.id}" is missing both \`issuer\` and \`${key}\` endpoint config. At least one of them is required`);
      }
    }
    if (provider.type === "credentials")
      hasCredentials = true;
    else if (provider.type === "email")
      hasEmail = true;
    else if (provider.type === "webauthn") {
      hasWebAuthn = true;
      if (provider.simpleWebAuthnBrowserVersion && !isSemverString(provider.simpleWebAuthnBrowserVersion)) {
        return new AuthError(`Invalid provider config for "${provider.id}": simpleWebAuthnBrowserVersion "${provider.simpleWebAuthnBrowserVersion}" must be a valid semver string.`);
      }
      if (provider.enableConditionalUI) {
        if (hasConditionalUIProvider) {
          return new DuplicateConditionalUI(`Multiple webauthn providers have 'enableConditionalUI' set to True. Only one provider can have this option enabled at a time`);
        }
        hasConditionalUIProvider = true;
        const hasWebauthnFormField = Object.values(provider.formFields).some((f4) => f4.autocomplete && f4.autocomplete.toString().indexOf("webauthn") > -1);
        if (!hasWebauthnFormField) {
          return new MissingWebAuthnAutocomplete(`Provider "${provider.id}" has 'enableConditionalUI' set to True, but none of its formFields have 'webauthn' in their autocomplete param`);
        }
      }
    }
  }
  if (hasCredentials) {
    const dbStrategy = options.session?.strategy === "database";
    const onlyCredentials = !options.providers.some((p4) => (typeof p4 === "function" ? p4() : p4).type !== "credentials");
    if (dbStrategy && onlyCredentials) {
      return new UnsupportedStrategy("Signing in with credentials only supported if JWT strategy is enabled");
    }
    const credentialsNoAuthorize = options.providers.some((p4) => {
      const provider = typeof p4 === "function" ? p4() : p4;
      return provider.type === "credentials" && !provider.authorize;
    });
    if (credentialsNoAuthorize) {
      return new MissingAuthorize("Must define an authorize() handler to use credentials authentication provider");
    }
  }
  const { adapter, session: session2 } = options;
  const requiredMethods = [];
  if (hasEmail || session2?.strategy === "database" || !session2?.strategy && adapter) {
    if (hasEmail) {
      if (!adapter)
        return new MissingAdapter("Email login requires an adapter");
      requiredMethods.push(...emailMethods);
    } else {
      if (!adapter)
        return new MissingAdapter("Database session requires an adapter");
      requiredMethods.push(...sessionMethods);
    }
  }
  if (hasWebAuthn) {
    if (options.experimental?.enableWebAuthn) {
      warnings.push("experimental-webauthn");
    } else {
      return new ExperimentalFeatureNotEnabled("WebAuthn is an experimental feature. To enable it, set `experimental.enableWebAuthn` to `true` in your config");
    }
    if (!adapter)
      return new MissingAdapter("WebAuthn requires an adapter");
    requiredMethods.push(...webauthnMethods);
  }
  if (adapter) {
    const missing = requiredMethods.filter((m2) => !(m2 in adapter));
    if (missing.length) {
      return new MissingAdapterMethods(`Required adapter methods were missing: ${missing.join(", ")}`);
    }
  }
  if (!warned)
    warned = true;
  return warnings;
}

// node_modules/@panva/hkdf/dist/web/runtime/hkdf.js
var getGlobal = () => {
  if (typeof globalThis !== "undefined")
    return globalThis;
  if (typeof self !== "undefined")
    return self;
  if (typeof window !== "undefined")
    return window;
  throw new Error("unable to locate global object");
};
var hkdf_default = async (digest2, ikm, salt, info, keylen) => {
  const { crypto: { subtle } } = getGlobal();
  return new Uint8Array(await subtle.deriveBits({
    name: "HKDF",
    hash: `SHA-${digest2.substr(3)}`,
    salt,
    info
  }, await subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]), keylen << 3));
};

// node_modules/@panva/hkdf/dist/web/index.js
function normalizeDigest(digest2) {
  switch (digest2) {
    case "sha256":
    case "sha384":
    case "sha512":
    case "sha1":
      return digest2;
    default:
      throw new TypeError('unsupported "digest" value');
  }
}
function normalizeUint8Array(input, label) {
  if (typeof input === "string")
    return new TextEncoder().encode(input);
  if (!(input instanceof Uint8Array))
    throw new TypeError(`"${label}"" must be an instance of Uint8Array or a string`);
  return input;
}
function normalizeIkm(input) {
  const ikm = normalizeUint8Array(input, "ikm");
  if (!ikm.byteLength)
    throw new TypeError(`"ikm" must be at least one byte in length`);
  return ikm;
}
function normalizeInfo(input) {
  const info = normalizeUint8Array(input, "info");
  if (info.byteLength > 1024) {
    throw TypeError('"info" must not contain more than 1024 bytes');
  }
  return info;
}
function normalizeKeylen(input, digest2) {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 1) {
    throw new TypeError('"keylen" must be a positive integer');
  }
  const hashlen = parseInt(digest2.substr(3), 10) >> 3 || 20;
  if (input > 255 * hashlen) {
    throw new TypeError('"keylen" too large');
  }
  return input;
}
async function hkdf(digest2, ikm, salt, info, keylen) {
  return hkdf_default(normalizeDigest(digest2), normalizeIkm(ikm), normalizeUint8Array(salt, "salt"), normalizeInfo(info), normalizeKeylen(keylen, digest2));
}

// node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default = crypto;
var isCryptoKey = (key) => key instanceof CryptoKey;

// node_modules/jose/dist/browser/runtime/digest.js
var digest = async (algorithm, data) => {
  const subtleDigest = `SHA-${algorithm.slice(-3)}`;
  return new Uint8Array(await webcrypto_default.subtle.digest(subtleDigest, data));
};
var digest_default = digest;

// node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf2 = new Uint8Array(size);
  let i4 = 0;
  for (const buffer of buffers) {
    buf2.set(buffer, i4);
    i4 += buffer.length;
  }
  return buf2;
}
function p2s(alg2, p2sInput) {
  return concat(encoder.encode(alg2), new Uint8Array([0]), p2sInput);
}
function writeUInt32BE(buf2, value, offset) {
  if (value < 0 || value >= MAX_INT32) {
    throw new RangeError(`value must be >= 0 and <= ${MAX_INT32 - 1}. Received ${value}`);
  }
  buf2.set([value >>> 24, value >>> 16, value >>> 8, value & 255], offset);
}
function uint64be(value) {
  const high = Math.floor(value / MAX_INT32);
  const low = value % MAX_INT32;
  const buf2 = new Uint8Array(8);
  writeUInt32BE(buf2, high, 0);
  writeUInt32BE(buf2, low, 4);
  return buf2;
}
function uint32be(value) {
  const buf2 = new Uint8Array(4);
  writeUInt32BE(buf2, value);
  return buf2;
}
function lengthAndInput(input) {
  return concat(uint32be(input.length), input);
}
async function concatKdf(secret, bits, value) {
  const iterations = Math.ceil((bits >> 3) / 32);
  const res = new Uint8Array(iterations * 32);
  for (let iter = 0; iter < iterations; iter++) {
    const buf2 = new Uint8Array(4 + secret.length + value.length);
    buf2.set(uint32be(iter + 1));
    buf2.set(secret, 4);
    buf2.set(value, 4 + secret.length);
    res.set(await digest_default("sha256", buf2), iter * 32);
  }
  return res.slice(0, bits >> 3);
}

// node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64 = (input) => {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  const CHUNK_SIZE3 = 32768;
  const arr = [];
  for (let i4 = 0; i4 < unencoded.length; i4 += CHUNK_SIZE3) {
    arr.push(String.fromCharCode.apply(null, unencoded.subarray(i4, i4 + CHUNK_SIZE3)));
  }
  return btoa(arr.join(""));
};
var encode = (input) => {
  return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};
var decodeBase64 = (encoded) => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i4 = 0; i4 < binary.length; i4++) {
    bytes[i4] = binary.charCodeAt(i4);
  }
  return bytes;
};
var decode = (input) => {
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
};

// node_modules/jose/dist/browser/util/errors.js
var JOSEError = class extends Error {
  constructor(message2, options) {
    super(message2, options);
    this.code = "ERR_JOSE_GENERIC";
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_EXPIRED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
    this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWE_INVALID";
  }
};
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWS_INVALID";
  }
};
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWT_INVALID";
  }
};
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWK_INVALID";
  }
};
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWKS_INVALID";
  }
};
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
  constructor(message2 = "request timed out", options) {
    super(message2, options);
    this.code = "ERR_JWKS_TIMEOUT";
  }
};
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
    this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// node_modules/jose/dist/browser/runtime/random.js
var random_default = webcrypto_default.getRandomValues.bind(webcrypto_default);

// node_modules/jose/dist/browser/lib/iv.js
function bitLength(alg2) {
  switch (alg2) {
    case "A128GCM":
    case "A128GCMKW":
    case "A192GCM":
    case "A192GCMKW":
    case "A256GCM":
    case "A256GCMKW":
      return 96;
    case "A128CBC-HS256":
    case "A192CBC-HS384":
    case "A256CBC-HS512":
      return 128;
    default:
      throw new JOSENotSupported(`Unsupported JWE Algorithm: ${alg2}`);
  }
}
var iv_default = (alg2) => random_default(new Uint8Array(bitLength(alg2) >> 3));

// node_modules/jose/dist/browser/lib/check_iv_length.js
var checkIvLength = (enc2, iv) => {
  if (iv.length << 3 !== bitLength(enc2)) {
    throw new JWEInvalid("Invalid Initialization Vector length");
  }
};
var check_iv_length_default = checkIvLength;

// node_modules/jose/dist/browser/runtime/check_cek_length.js
var checkCekLength = (cek, expected) => {
  const actual = cek.byteLength << 3;
  if (actual !== expected) {
    throw new JWEInvalid(`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
  }
};
var check_cek_length_default = checkCekLength;

// node_modules/jose/dist/browser/runtime/timing_safe_equal.js
var timingSafeEqual = (a4, b2) => {
  if (!(a4 instanceof Uint8Array)) {
    throw new TypeError("First argument must be a buffer");
  }
  if (!(b2 instanceof Uint8Array)) {
    throw new TypeError("Second argument must be a buffer");
  }
  if (a4.length !== b2.length) {
    throw new TypeError("Input buffers must have the same length");
  }
  const len = a4.length;
  let out = 0;
  let i4 = -1;
  while (++i4 < len) {
    out |= a4[i4] ^ b2[i4];
  }
  return out === 0;
};
var timing_safe_equal_default = timingSafeEqual;

// node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
function checkEncCryptoKey(key, alg2, ...usages) {
  switch (alg2) {
    case "A128GCM":
    case "A192GCM":
    case "A256GCM": {
      if (!isAlgorithm(key.algorithm, "AES-GCM"))
        throw unusable("AES-GCM");
      const expected = parseInt(alg2.slice(1, 4), 10);
      const actual = key.algorithm.length;
      if (actual !== expected)
        throw unusable(expected, "algorithm.length");
      break;
    }
    case "A128KW":
    case "A192KW":
    case "A256KW": {
      if (!isAlgorithm(key.algorithm, "AES-KW"))
        throw unusable("AES-KW");
      const expected = parseInt(alg2.slice(1, 4), 10);
      const actual = key.algorithm.length;
      if (actual !== expected)
        throw unusable(expected, "algorithm.length");
      break;
    }
    case "ECDH": {
      switch (key.algorithm.name) {
        case "ECDH":
        case "X25519":
        case "X448":
          break;
        default:
          throw unusable("ECDH, X25519, or X448");
      }
      break;
    }
    case "PBES2-HS256+A128KW":
    case "PBES2-HS384+A192KW":
    case "PBES2-HS512+A256KW":
      if (!isAlgorithm(key.algorithm, "PBKDF2"))
        throw unusable("PBKDF2");
      break;
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512": {
      if (!isAlgorithm(key.algorithm, "RSA-OAEP"))
        throw unusable("RSA-OAEP");
      const expected = parseInt(alg2.slice(9), 10) || 1;
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}

// node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
var invalid_key_input_default = (actual, ...types2) => {
  return message("Key must be ", actual, ...types2);
};
function withAlg(alg2, actual, ...types2) {
  return message(`Key for the ${alg2} algorithm must be `, actual, ...types2);
}

// node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default = (key) => {
  if (isCryptoKey(key)) {
    return true;
  }
  return key?.[Symbol.toStringTag] === "KeyObject";
};
var types = ["CryptoKey"];

// node_modules/jose/dist/browser/runtime/decrypt.js
async function cbcDecrypt(enc2, cek, ciphertext, iv, tag2, aad) {
  if (!(cek instanceof Uint8Array)) {
    throw new TypeError(invalid_key_input_default(cek, "Uint8Array"));
  }
  const keySize = parseInt(enc2.slice(1, 4), 10);
  const encKey = await webcrypto_default.subtle.importKey("raw", cek.subarray(keySize >> 3), "AES-CBC", false, ["decrypt"]);
  const macKey = await webcrypto_default.subtle.importKey("raw", cek.subarray(0, keySize >> 3), {
    hash: `SHA-${keySize << 1}`,
    name: "HMAC"
  }, false, ["sign"]);
  const macData = concat(aad, iv, ciphertext, uint64be(aad.length << 3));
  const expectedTag = new Uint8Array((await webcrypto_default.subtle.sign("HMAC", macKey, macData)).slice(0, keySize >> 3));
  let macCheckPassed;
  try {
    macCheckPassed = timing_safe_equal_default(tag2, expectedTag);
  } catch {
  }
  if (!macCheckPassed) {
    throw new JWEDecryptionFailed();
  }
  let plaintext;
  try {
    plaintext = new Uint8Array(await webcrypto_default.subtle.decrypt({ iv, name: "AES-CBC" }, encKey, ciphertext));
  } catch {
  }
  if (!plaintext) {
    throw new JWEDecryptionFailed();
  }
  return plaintext;
}
async function gcmDecrypt(enc2, cek, ciphertext, iv, tag2, aad) {
  let encKey;
  if (cek instanceof Uint8Array) {
    encKey = await webcrypto_default.subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]);
  } else {
    checkEncCryptoKey(cek, enc2, "decrypt");
    encKey = cek;
  }
  try {
    return new Uint8Array(await webcrypto_default.subtle.decrypt({
      additionalData: aad,
      iv,
      name: "AES-GCM",
      tagLength: 128
    }, encKey, concat(ciphertext, tag2)));
  } catch {
    throw new JWEDecryptionFailed();
  }
}
var decrypt = async (enc2, cek, ciphertext, iv, tag2, aad) => {
  if (!isCryptoKey(cek) && !(cek instanceof Uint8Array)) {
    throw new TypeError(invalid_key_input_default(cek, ...types, "Uint8Array"));
  }
  if (!iv) {
    throw new JWEInvalid("JWE Initialization Vector missing");
  }
  if (!tag2) {
    throw new JWEInvalid("JWE Authentication Tag missing");
  }
  check_iv_length_default(enc2, iv);
  switch (enc2) {
    case "A128CBC-HS256":
    case "A192CBC-HS384":
    case "A256CBC-HS512":
      if (cek instanceof Uint8Array)
        check_cek_length_default(cek, parseInt(enc2.slice(-3), 10));
      return cbcDecrypt(enc2, cek, ciphertext, iv, tag2, aad);
    case "A128GCM":
    case "A192GCM":
    case "A256GCM":
      if (cek instanceof Uint8Array)
        check_cek_length_default(cek, parseInt(enc2.slice(1, 4), 10));
      return gcmDecrypt(enc2, cek, ciphertext, iv, tag2, aad);
    default:
      throw new JOSENotSupported("Unsupported JWE Content Encryption Algorithm");
  }
};
var decrypt_default = decrypt;

// node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint = (...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
};
var is_disjoint_default = isDisjoint;

// node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}

// node_modules/jose/dist/browser/runtime/bogus.js
var bogusWebCrypto = [
  { hash: "SHA-256", name: "HMAC" },
  true,
  ["sign"]
];
var bogus_default = bogusWebCrypto;

// node_modules/jose/dist/browser/runtime/aeskw.js
function checkKeySize(key, alg2) {
  if (key.algorithm.length !== parseInt(alg2.slice(1, 4), 10)) {
    throw new TypeError(`Invalid key size for alg: ${alg2}`);
  }
}
function getCryptoKey(key, alg2, usage) {
  if (isCryptoKey(key)) {
    checkEncCryptoKey(key, alg2, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    return webcrypto_default.subtle.importKey("raw", key, "AES-KW", true, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array"));
}
var wrap2 = async (alg2, key, cek) => {
  const cryptoKey = await getCryptoKey(key, alg2, "wrapKey");
  checkKeySize(cryptoKey, alg2);
  const cryptoKeyCek = await webcrypto_default.subtle.importKey("raw", cek, ...bogus_default);
  return new Uint8Array(await webcrypto_default.subtle.wrapKey("raw", cryptoKeyCek, cryptoKey, "AES-KW"));
};
var unwrap = async (alg2, key, encryptedKey) => {
  const cryptoKey = await getCryptoKey(key, alg2, "unwrapKey");
  checkKeySize(cryptoKey, alg2);
  const cryptoKeyCek = await webcrypto_default.subtle.unwrapKey("raw", encryptedKey, cryptoKey, "AES-KW", ...bogus_default);
  return new Uint8Array(await webcrypto_default.subtle.exportKey("raw", cryptoKeyCek));
};

// node_modules/jose/dist/browser/runtime/ecdhes.js
async function deriveKey(publicKey, privateKey, algorithm, keyLength, apu = new Uint8Array(0), apv = new Uint8Array(0)) {
  if (!isCryptoKey(publicKey)) {
    throw new TypeError(invalid_key_input_default(publicKey, ...types));
  }
  checkEncCryptoKey(publicKey, "ECDH");
  if (!isCryptoKey(privateKey)) {
    throw new TypeError(invalid_key_input_default(privateKey, ...types));
  }
  checkEncCryptoKey(privateKey, "ECDH", "deriveBits");
  const value = concat(lengthAndInput(encoder.encode(algorithm)), lengthAndInput(apu), lengthAndInput(apv), uint32be(keyLength));
  let length;
  if (publicKey.algorithm.name === "X25519") {
    length = 256;
  } else if (publicKey.algorithm.name === "X448") {
    length = 448;
  } else {
    length = Math.ceil(parseInt(publicKey.algorithm.namedCurve.substr(-3), 10) / 8) << 3;
  }
  const sharedSecret = new Uint8Array(await webcrypto_default.subtle.deriveBits({
    name: publicKey.algorithm.name,
    public: publicKey
  }, privateKey, length));
  return concatKdf(sharedSecret, keyLength, value);
}
async function generateEpk(key) {
  if (!isCryptoKey(key)) {
    throw new TypeError(invalid_key_input_default(key, ...types));
  }
  return webcrypto_default.subtle.generateKey(key.algorithm, true, ["deriveBits"]);
}
function ecdhAllowed(key) {
  if (!isCryptoKey(key)) {
    throw new TypeError(invalid_key_input_default(key, ...types));
  }
  return ["P-256", "P-384", "P-521"].includes(key.algorithm.namedCurve) || key.algorithm.name === "X25519" || key.algorithm.name === "X448";
}

// node_modules/jose/dist/browser/lib/check_p2s.js
function checkP2s(p2s2) {
  if (!(p2s2 instanceof Uint8Array) || p2s2.length < 8) {
    throw new JWEInvalid("PBES2 Salt Input must be 8 or more octets");
  }
}

// node_modules/jose/dist/browser/runtime/pbes2kw.js
function getCryptoKey2(key, alg2) {
  if (key instanceof Uint8Array) {
    return webcrypto_default.subtle.importKey("raw", key, "PBKDF2", false, ["deriveBits"]);
  }
  if (isCryptoKey(key)) {
    checkEncCryptoKey(key, alg2, "deriveBits", "deriveKey");
    return key;
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array"));
}
async function deriveKey2(p2s2, alg2, p2c, key) {
  checkP2s(p2s2);
  const salt = p2s(alg2, p2s2);
  const keylen = parseInt(alg2.slice(13, 16), 10);
  const subtleAlg = {
    hash: `SHA-${alg2.slice(8, 11)}`,
    iterations: p2c,
    name: "PBKDF2",
    salt
  };
  const wrapAlg = {
    length: keylen,
    name: "AES-KW"
  };
  const cryptoKey = await getCryptoKey2(key, alg2);
  if (cryptoKey.usages.includes("deriveBits")) {
    return new Uint8Array(await webcrypto_default.subtle.deriveBits(subtleAlg, cryptoKey, keylen));
  }
  if (cryptoKey.usages.includes("deriveKey")) {
    return webcrypto_default.subtle.deriveKey(subtleAlg, cryptoKey, wrapAlg, false, ["wrapKey", "unwrapKey"]);
  }
  throw new TypeError('PBKDF2 key "usages" must include "deriveBits" or "deriveKey"');
}
var encrypt = async (alg2, key, cek, p2c = 2048, p2s2 = random_default(new Uint8Array(16))) => {
  const derived = await deriveKey2(p2s2, alg2, p2c, key);
  const encryptedKey = await wrap2(alg2.slice(-6), derived, cek);
  return { encryptedKey, p2c, p2s: encode(p2s2) };
};
var decrypt2 = async (alg2, key, encryptedKey, p2c, p2s2) => {
  const derived = await deriveKey2(p2s2, alg2, p2c, key);
  return unwrap(alg2.slice(-6), derived, encryptedKey);
};

// node_modules/jose/dist/browser/runtime/subtle_rsaes.js
function subtleRsaEs(alg2) {
  switch (alg2) {
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512":
      return "RSA-OAEP";
    default:
      throw new JOSENotSupported(`alg ${alg2} is not supported either by JOSE or your javascript runtime`);
  }
}

// node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default = (alg2, key) => {
  if (alg2.startsWith("RS") || alg2.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg2} requires key modulusLength to be 2048 bits or larger`);
    }
  }
};

// node_modules/jose/dist/browser/runtime/rsaes.js
var encrypt2 = async (alg2, key, cek) => {
  if (!isCryptoKey(key)) {
    throw new TypeError(invalid_key_input_default(key, ...types));
  }
  checkEncCryptoKey(key, alg2, "encrypt", "wrapKey");
  check_key_length_default(alg2, key);
  if (key.usages.includes("encrypt")) {
    return new Uint8Array(await webcrypto_default.subtle.encrypt(subtleRsaEs(alg2), key, cek));
  }
  if (key.usages.includes("wrapKey")) {
    const cryptoKeyCek = await webcrypto_default.subtle.importKey("raw", cek, ...bogus_default);
    return new Uint8Array(await webcrypto_default.subtle.wrapKey("raw", cryptoKeyCek, key, subtleRsaEs(alg2)));
  }
  throw new TypeError('RSA-OAEP key "usages" must include "encrypt" or "wrapKey" for this operation');
};
var decrypt3 = async (alg2, key, encryptedKey) => {
  if (!isCryptoKey(key)) {
    throw new TypeError(invalid_key_input_default(key, ...types));
  }
  checkEncCryptoKey(key, alg2, "decrypt", "unwrapKey");
  check_key_length_default(alg2, key);
  if (key.usages.includes("decrypt")) {
    return new Uint8Array(await webcrypto_default.subtle.decrypt(subtleRsaEs(alg2), key, encryptedKey));
  }
  if (key.usages.includes("unwrapKey")) {
    const cryptoKeyCek = await webcrypto_default.subtle.unwrapKey("raw", encryptedKey, key, subtleRsaEs(alg2), ...bogus_default);
    return new Uint8Array(await webcrypto_default.subtle.exportKey("raw", cryptoKeyCek));
  }
  throw new TypeError('RSA-OAEP key "usages" must include "decrypt" or "unwrapKey" for this operation');
};

// node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}

// node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
var parse = async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const rest = [
    algorithm,
    jwk.ext ?? false,
    jwk.key_ops ?? keyUsages
  ];
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
};
var jwk_to_key_default = parse;

// node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue = (k3) => decode(k3);
var privCache;
var pubCache;
var isKeyObject = (key) => {
  return key?.[Symbol.toStringTag] === "KeyObject";
};
var importAndCache = async (cache, key, jwk, alg2, freeze = false) => {
  let cached = cache.get(key);
  if (cached?.[alg2]) {
    return cached[alg2];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg: alg2 });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg2]: cryptoKey });
  } else {
    cached[alg2] = cryptoKey;
  }
  return cryptoKey;
};
var normalizePublicKey = (key, alg2) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.p;
    delete jwk.q;
    delete jwk.qi;
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(pubCache, key, jwk, alg2);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(pubCache, key, key, alg2, true);
    return cryptoKey;
  }
  return key;
};
var normalizePrivateKey = (key, alg2) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(privCache, key, jwk, alg2);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(privCache, key, key, alg2, true);
    return cryptoKey;
  }
  return key;
};
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

// node_modules/jose/dist/browser/lib/cek.js
function bitLength2(alg2) {
  switch (alg2) {
    case "A128GCM":
      return 128;
    case "A192GCM":
      return 192;
    case "A256GCM":
    case "A128CBC-HS256":
      return 256;
    case "A192CBC-HS384":
      return 384;
    case "A256CBC-HS512":
      return 512;
    default:
      throw new JOSENotSupported(`Unsupported JWE Algorithm: ${alg2}`);
  }
}
var cek_default = (alg2) => random_default(new Uint8Array(bitLength2(alg2) >> 3));

// node_modules/jose/dist/browser/key/import.js
async function importJWK(jwk, alg2) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg2 || (alg2 = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if (jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg: alg2 });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}

// node_modules/jose/dist/browser/lib/check_key_type.js
var tag = (key) => key?.[Symbol.toStringTag];
var jwkMatchesOp = (alg2, key, usage) => {
  if (key.use !== void 0 && key.use !== "sig") {
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  }
  if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
  }
  if (key.alg !== void 0 && key.alg !== alg2) {
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg2}`);
  }
  return true;
};
var symmetricTypeCheck = (alg2, key, usage, allowJwk) => {
  if (key instanceof Uint8Array)
    return;
  if (allowJwk && isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg2, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg2, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
};
var asymmetricTypeCheck = (alg2, key, usage, allowJwk) => {
  if (allowJwk && isJWK(key)) {
    switch (usage) {
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg2, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg2, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg2, key, ...types, allowJwk ? "JSON Web Key" : null));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (usage === "sign" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
  }
  if (usage === "decrypt" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
  }
  if (key.algorithm && usage === "verify" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
  }
  if (key.algorithm && usage === "encrypt" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
  }
};
function checkKeyType(allowJwk, alg2, key, usage) {
  const symmetric = alg2.startsWith("HS") || alg2 === "dir" || alg2.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg2);
  if (symmetric) {
    symmetricTypeCheck(alg2, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg2, key, usage, allowJwk);
  }
}
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

// node_modules/jose/dist/browser/runtime/encrypt.js
async function cbcEncrypt(enc2, plaintext, cek, iv, aad) {
  if (!(cek instanceof Uint8Array)) {
    throw new TypeError(invalid_key_input_default(cek, "Uint8Array"));
  }
  const keySize = parseInt(enc2.slice(1, 4), 10);
  const encKey = await webcrypto_default.subtle.importKey("raw", cek.subarray(keySize >> 3), "AES-CBC", false, ["encrypt"]);
  const macKey = await webcrypto_default.subtle.importKey("raw", cek.subarray(0, keySize >> 3), {
    hash: `SHA-${keySize << 1}`,
    name: "HMAC"
  }, false, ["sign"]);
  const ciphertext = new Uint8Array(await webcrypto_default.subtle.encrypt({
    iv,
    name: "AES-CBC"
  }, encKey, plaintext));
  const macData = concat(aad, iv, ciphertext, uint64be(aad.length << 3));
  const tag2 = new Uint8Array((await webcrypto_default.subtle.sign("HMAC", macKey, macData)).slice(0, keySize >> 3));
  return { ciphertext, tag: tag2, iv };
}
async function gcmEncrypt(enc2, plaintext, cek, iv, aad) {
  let encKey;
  if (cek instanceof Uint8Array) {
    encKey = await webcrypto_default.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  } else {
    checkEncCryptoKey(cek, enc2, "encrypt");
    encKey = cek;
  }
  const encrypted = new Uint8Array(await webcrypto_default.subtle.encrypt({
    additionalData: aad,
    iv,
    name: "AES-GCM",
    tagLength: 128
  }, encKey, plaintext));
  const tag2 = encrypted.slice(-16);
  const ciphertext = encrypted.slice(0, -16);
  return { ciphertext, tag: tag2, iv };
}
var encrypt3 = async (enc2, plaintext, cek, iv, aad) => {
  if (!isCryptoKey(cek) && !(cek instanceof Uint8Array)) {
    throw new TypeError(invalid_key_input_default(cek, ...types, "Uint8Array"));
  }
  if (iv) {
    check_iv_length_default(enc2, iv);
  } else {
    iv = iv_default(enc2);
  }
  switch (enc2) {
    case "A128CBC-HS256":
    case "A192CBC-HS384":
    case "A256CBC-HS512":
      if (cek instanceof Uint8Array) {
        check_cek_length_default(cek, parseInt(enc2.slice(-3), 10));
      }
      return cbcEncrypt(enc2, plaintext, cek, iv, aad);
    case "A128GCM":
    case "A192GCM":
    case "A256GCM":
      if (cek instanceof Uint8Array) {
        check_cek_length_default(cek, parseInt(enc2.slice(1, 4), 10));
      }
      return gcmEncrypt(enc2, plaintext, cek, iv, aad);
    default:
      throw new JOSENotSupported("Unsupported JWE Content Encryption Algorithm");
  }
};
var encrypt_default = encrypt3;

// node_modules/jose/dist/browser/lib/aesgcmkw.js
async function wrap3(alg2, key, cek, iv) {
  const jweAlgorithm = alg2.slice(0, 7);
  const wrapped = await encrypt_default(jweAlgorithm, cek, key, iv, new Uint8Array(0));
  return {
    encryptedKey: wrapped.ciphertext,
    iv: encode(wrapped.iv),
    tag: encode(wrapped.tag)
  };
}
async function unwrap2(alg2, key, encryptedKey, iv, tag2) {
  const jweAlgorithm = alg2.slice(0, 7);
  return decrypt_default(jweAlgorithm, key, encryptedKey, iv, tag2, new Uint8Array(0));
}

// node_modules/jose/dist/browser/lib/decrypt_key_management.js
async function decryptKeyManagement(alg2, key, encryptedKey, joseHeader, options) {
  check_key_type_default(alg2, key, "decrypt");
  key = await normalize_key_default.normalizePrivateKey?.(key, alg2) || key;
  switch (alg2) {
    case "dir": {
      if (encryptedKey !== void 0)
        throw new JWEInvalid("Encountered unexpected JWE Encrypted Key");
      return key;
    }
    case "ECDH-ES":
      if (encryptedKey !== void 0)
        throw new JWEInvalid("Encountered unexpected JWE Encrypted Key");
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      if (!isObject(joseHeader.epk))
        throw new JWEInvalid(`JOSE Header "epk" (Ephemeral Public Key) missing or invalid`);
      if (!ecdhAllowed(key))
        throw new JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
      const epk = await importJWK(joseHeader.epk, alg2);
      let partyUInfo;
      let partyVInfo;
      if (joseHeader.apu !== void 0) {
        if (typeof joseHeader.apu !== "string")
          throw new JWEInvalid(`JOSE Header "apu" (Agreement PartyUInfo) invalid`);
        try {
          partyUInfo = decode(joseHeader.apu);
        } catch {
          throw new JWEInvalid("Failed to base64url decode the apu");
        }
      }
      if (joseHeader.apv !== void 0) {
        if (typeof joseHeader.apv !== "string")
          throw new JWEInvalid(`JOSE Header "apv" (Agreement PartyVInfo) invalid`);
        try {
          partyVInfo = decode(joseHeader.apv);
        } catch {
          throw new JWEInvalid("Failed to base64url decode the apv");
        }
      }
      const sharedSecret = await deriveKey(epk, key, alg2 === "ECDH-ES" ? joseHeader.enc : alg2, alg2 === "ECDH-ES" ? bitLength2(joseHeader.enc) : parseInt(alg2.slice(-5, -2), 10), partyUInfo, partyVInfo);
      if (alg2 === "ECDH-ES")
        return sharedSecret;
      if (encryptedKey === void 0)
        throw new JWEInvalid("JWE Encrypted Key missing");
      return unwrap(alg2.slice(-6), sharedSecret, encryptedKey);
    }
    case "RSA1_5":
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512": {
      if (encryptedKey === void 0)
        throw new JWEInvalid("JWE Encrypted Key missing");
      return decrypt3(alg2, key, encryptedKey);
    }
    case "PBES2-HS256+A128KW":
    case "PBES2-HS384+A192KW":
    case "PBES2-HS512+A256KW": {
      if (encryptedKey === void 0)
        throw new JWEInvalid("JWE Encrypted Key missing");
      if (typeof joseHeader.p2c !== "number")
        throw new JWEInvalid(`JOSE Header "p2c" (PBES2 Count) missing or invalid`);
      const p2cLimit = options?.maxPBES2Count || 1e4;
      if (joseHeader.p2c > p2cLimit)
        throw new JWEInvalid(`JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds`);
      if (typeof joseHeader.p2s !== "string")
        throw new JWEInvalid(`JOSE Header "p2s" (PBES2 Salt) missing or invalid`);
      let p2s2;
      try {
        p2s2 = decode(joseHeader.p2s);
      } catch {
        throw new JWEInvalid("Failed to base64url decode the p2s");
      }
      return decrypt2(alg2, key, encryptedKey, joseHeader.p2c, p2s2);
    }
    case "A128KW":
    case "A192KW":
    case "A256KW": {
      if (encryptedKey === void 0)
        throw new JWEInvalid("JWE Encrypted Key missing");
      return unwrap(alg2, key, encryptedKey);
    }
    case "A128GCMKW":
    case "A192GCMKW":
    case "A256GCMKW": {
      if (encryptedKey === void 0)
        throw new JWEInvalid("JWE Encrypted Key missing");
      if (typeof joseHeader.iv !== "string")
        throw new JWEInvalid(`JOSE Header "iv" (Initialization Vector) missing or invalid`);
      if (typeof joseHeader.tag !== "string")
        throw new JWEInvalid(`JOSE Header "tag" (Authentication Tag) missing or invalid`);
      let iv;
      try {
        iv = decode(joseHeader.iv);
      } catch {
        throw new JWEInvalid("Failed to base64url decode the iv");
      }
      let tag2;
      try {
        tag2 = decode(joseHeader.tag);
      } catch {
        throw new JWEInvalid("Failed to base64url decode the tag");
      }
      return unwrap2(alg2, key, encryptedKey, iv, tag2);
    }
    default: {
      throw new JOSENotSupported('Invalid or unsupported "alg" (JWE Algorithm) header value');
    }
  }
}
var decrypt_key_management_default = decryptKeyManagement;

// node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
var validate_crit_default = validateCrit;

// node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms = (option, algorithms) => {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s3) => typeof s3 !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
};
var validate_algorithms_default = validateAlgorithms;

// node_modules/jose/dist/browser/jwe/flattened/decrypt.js
async function flattenedDecrypt(jwe, key, options) {
  if (!isObject(jwe)) {
    throw new JWEInvalid("Flattened JWE must be an object");
  }
  if (jwe.protected === void 0 && jwe.header === void 0 && jwe.unprotected === void 0) {
    throw new JWEInvalid("JOSE Header missing");
  }
  if (jwe.iv !== void 0 && typeof jwe.iv !== "string") {
    throw new JWEInvalid("JWE Initialization Vector incorrect type");
  }
  if (typeof jwe.ciphertext !== "string") {
    throw new JWEInvalid("JWE Ciphertext missing or incorrect type");
  }
  if (jwe.tag !== void 0 && typeof jwe.tag !== "string") {
    throw new JWEInvalid("JWE Authentication Tag incorrect type");
  }
  if (jwe.protected !== void 0 && typeof jwe.protected !== "string") {
    throw new JWEInvalid("JWE Protected Header incorrect type");
  }
  if (jwe.encrypted_key !== void 0 && typeof jwe.encrypted_key !== "string") {
    throw new JWEInvalid("JWE Encrypted Key incorrect type");
  }
  if (jwe.aad !== void 0 && typeof jwe.aad !== "string") {
    throw new JWEInvalid("JWE AAD incorrect type");
  }
  if (jwe.header !== void 0 && !isObject(jwe.header)) {
    throw new JWEInvalid("JWE Shared Unprotected Header incorrect type");
  }
  if (jwe.unprotected !== void 0 && !isObject(jwe.unprotected)) {
    throw new JWEInvalid("JWE Per-Recipient Unprotected Header incorrect type");
  }
  let parsedProt;
  if (jwe.protected) {
    try {
      const protectedHeader2 = decode(jwe.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader2));
    } catch {
      throw new JWEInvalid("JWE Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jwe.header, jwe.unprotected)) {
    throw new JWEInvalid("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jwe.header,
    ...jwe.unprotected
  };
  validate_crit_default(JWEInvalid, /* @__PURE__ */ new Map(), options?.crit, parsedProt, joseHeader);
  if (joseHeader.zip !== void 0) {
    throw new JOSENotSupported('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
  }
  const { alg: alg2, enc: enc2 } = joseHeader;
  if (typeof alg2 !== "string" || !alg2) {
    throw new JWEInvalid("missing JWE Algorithm (alg) in JWE Header");
  }
  if (typeof enc2 !== "string" || !enc2) {
    throw new JWEInvalid("missing JWE Encryption Algorithm (enc) in JWE Header");
  }
  const keyManagementAlgorithms = options && validate_algorithms_default("keyManagementAlgorithms", options.keyManagementAlgorithms);
  const contentEncryptionAlgorithms = options && validate_algorithms_default("contentEncryptionAlgorithms", options.contentEncryptionAlgorithms);
  if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg2) || !keyManagementAlgorithms && alg2.startsWith("PBES2")) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc2)) {
    throw new JOSEAlgNotAllowed('"enc" (Encryption Algorithm) Header Parameter value not allowed');
  }
  let encryptedKey;
  if (jwe.encrypted_key !== void 0) {
    try {
      encryptedKey = decode(jwe.encrypted_key);
    } catch {
      throw new JWEInvalid("Failed to base64url decode the encrypted_key");
    }
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jwe);
    resolvedKey = true;
  }
  let cek;
  try {
    cek = await decrypt_key_management_default(alg2, key, encryptedKey, joseHeader, options);
  } catch (err) {
    if (err instanceof TypeError || err instanceof JWEInvalid || err instanceof JOSENotSupported) {
      throw err;
    }
    cek = cek_default(enc2);
  }
  let iv;
  let tag2;
  if (jwe.iv !== void 0) {
    try {
      iv = decode(jwe.iv);
    } catch {
      throw new JWEInvalid("Failed to base64url decode the iv");
    }
  }
  if (jwe.tag !== void 0) {
    try {
      tag2 = decode(jwe.tag);
    } catch {
      throw new JWEInvalid("Failed to base64url decode the tag");
    }
  }
  const protectedHeader = encoder.encode(jwe.protected ?? "");
  let additionalData;
  if (jwe.aad !== void 0) {
    additionalData = concat(protectedHeader, encoder.encode("."), encoder.encode(jwe.aad));
  } else {
    additionalData = protectedHeader;
  }
  let ciphertext;
  try {
    ciphertext = decode(jwe.ciphertext);
  } catch {
    throw new JWEInvalid("Failed to base64url decode the ciphertext");
  }
  const plaintext = await decrypt_default(enc2, cek, ciphertext, iv, tag2, additionalData);
  const result = { plaintext };
  if (jwe.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jwe.aad !== void 0) {
    try {
      result.additionalAuthenticatedData = decode(jwe.aad);
    } catch {
      throw new JWEInvalid("Failed to base64url decode the aad");
    }
  }
  if (jwe.unprotected !== void 0) {
    result.sharedUnprotectedHeader = jwe.unprotected;
  }
  if (jwe.header !== void 0) {
    result.unprotectedHeader = jwe.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}

// node_modules/jose/dist/browser/jwe/compact/decrypt.js
async function compactDecrypt(jwe, key, options) {
  if (jwe instanceof Uint8Array) {
    jwe = decoder.decode(jwe);
  }
  if (typeof jwe !== "string") {
    throw new JWEInvalid("Compact JWE must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag2, length } = jwe.split(".");
  if (length !== 5) {
    throw new JWEInvalid("Invalid Compact JWE");
  }
  const decrypted = await flattenedDecrypt({
    ciphertext,
    iv: iv || void 0,
    protected: protectedHeader,
    tag: tag2 || void 0,
    encrypted_key: encryptedKey || void 0
  }, key, options);
  const result = { plaintext: decrypted.plaintext, protectedHeader: decrypted.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: decrypted.key };
  }
  return result;
}

// node_modules/jose/dist/browser/lib/private_symbols.js
var unprotected = Symbol();

// node_modules/jose/dist/browser/runtime/key_to_jwk.js
var keyToJWK = async (key) => {
  if (key instanceof Uint8Array) {
    return {
      kty: "oct",
      k: encode(key)
    };
  }
  if (!isCryptoKey(key)) {
    throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array"));
  }
  if (!key.extractable) {
    throw new TypeError("non-extractable CryptoKey cannot be exported as a JWK");
  }
  const { ext, key_ops, alg: alg2, use, ...jwk } = await webcrypto_default.subtle.exportKey("jwk", key);
  return jwk;
};
var key_to_jwk_default = keyToJWK;

// node_modules/jose/dist/browser/key/export.js
async function exportJWK(key) {
  return key_to_jwk_default(key);
}

// node_modules/jose/dist/browser/lib/encrypt_key_management.js
async function encryptKeyManagement(alg2, enc2, key, providedCek, providedParameters = {}) {
  let encryptedKey;
  let parameters;
  let cek;
  check_key_type_default(alg2, key, "encrypt");
  key = await normalize_key_default.normalizePublicKey?.(key, alg2) || key;
  switch (alg2) {
    case "dir": {
      cek = key;
      break;
    }
    case "ECDH-ES":
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      if (!ecdhAllowed(key)) {
        throw new JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
      }
      const { apu, apv } = providedParameters;
      let { epk: ephemeralKey } = providedParameters;
      ephemeralKey || (ephemeralKey = (await generateEpk(key)).privateKey);
      const { x: x4, y: y3, crv, kty } = await exportJWK(ephemeralKey);
      const sharedSecret = await deriveKey(key, ephemeralKey, alg2 === "ECDH-ES" ? enc2 : alg2, alg2 === "ECDH-ES" ? bitLength2(enc2) : parseInt(alg2.slice(-5, -2), 10), apu, apv);
      parameters = { epk: { x: x4, crv, kty } };
      if (kty === "EC")
        parameters.epk.y = y3;
      if (apu)
        parameters.apu = encode(apu);
      if (apv)
        parameters.apv = encode(apv);
      if (alg2 === "ECDH-ES") {
        cek = sharedSecret;
        break;
      }
      cek = providedCek || cek_default(enc2);
      const kwAlg = alg2.slice(-6);
      encryptedKey = await wrap2(kwAlg, sharedSecret, cek);
      break;
    }
    case "RSA1_5":
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512": {
      cek = providedCek || cek_default(enc2);
      encryptedKey = await encrypt2(alg2, key, cek);
      break;
    }
    case "PBES2-HS256+A128KW":
    case "PBES2-HS384+A192KW":
    case "PBES2-HS512+A256KW": {
      cek = providedCek || cek_default(enc2);
      const { p2c, p2s: p2s2 } = providedParameters;
      ({ encryptedKey, ...parameters } = await encrypt(alg2, key, cek, p2c, p2s2));
      break;
    }
    case "A128KW":
    case "A192KW":
    case "A256KW": {
      cek = providedCek || cek_default(enc2);
      encryptedKey = await wrap2(alg2, key, cek);
      break;
    }
    case "A128GCMKW":
    case "A192GCMKW":
    case "A256GCMKW": {
      cek = providedCek || cek_default(enc2);
      const { iv } = providedParameters;
      ({ encryptedKey, ...parameters } = await wrap3(alg2, key, cek, iv));
      break;
    }
    default: {
      throw new JOSENotSupported('Invalid or unsupported "alg" (JWE Algorithm) header value');
    }
  }
  return { cek, encryptedKey, parameters };
}
var encrypt_key_management_default = encryptKeyManagement;

// node_modules/jose/dist/browser/jwe/flattened/encrypt.js
var FlattenedEncrypt = class {
  constructor(plaintext) {
    if (!(plaintext instanceof Uint8Array)) {
      throw new TypeError("plaintext must be an instance of Uint8Array");
    }
    this._plaintext = plaintext;
  }
  setKeyManagementParameters(parameters) {
    if (this._keyManagementParameters) {
      throw new TypeError("setKeyManagementParameters can only be called once");
    }
    this._keyManagementParameters = parameters;
    return this;
  }
  setProtectedHeader(protectedHeader) {
    if (this._protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this._protectedHeader = protectedHeader;
    return this;
  }
  setSharedUnprotectedHeader(sharedUnprotectedHeader) {
    if (this._sharedUnprotectedHeader) {
      throw new TypeError("setSharedUnprotectedHeader can only be called once");
    }
    this._sharedUnprotectedHeader = sharedUnprotectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this._unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this._unprotectedHeader = unprotectedHeader;
    return this;
  }
  setAdditionalAuthenticatedData(aad) {
    this._aad = aad;
    return this;
  }
  setContentEncryptionKey(cek) {
    if (this._cek) {
      throw new TypeError("setContentEncryptionKey can only be called once");
    }
    this._cek = cek;
    return this;
  }
  setInitializationVector(iv) {
    if (this._iv) {
      throw new TypeError("setInitializationVector can only be called once");
    }
    this._iv = iv;
    return this;
  }
  async encrypt(key, options) {
    if (!this._protectedHeader && !this._unprotectedHeader && !this._sharedUnprotectedHeader) {
      throw new JWEInvalid("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
    }
    if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader, this._sharedUnprotectedHeader)) {
      throw new JWEInvalid("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this._protectedHeader,
      ...this._unprotectedHeader,
      ...this._sharedUnprotectedHeader
    };
    validate_crit_default(JWEInvalid, /* @__PURE__ */ new Map(), options?.crit, this._protectedHeader, joseHeader);
    if (joseHeader.zip !== void 0) {
      throw new JOSENotSupported('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
    }
    const { alg: alg2, enc: enc2 } = joseHeader;
    if (typeof alg2 !== "string" || !alg2) {
      throw new JWEInvalid('JWE "alg" (Algorithm) Header Parameter missing or invalid');
    }
    if (typeof enc2 !== "string" || !enc2) {
      throw new JWEInvalid('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
    }
    let encryptedKey;
    if (this._cek && (alg2 === "dir" || alg2 === "ECDH-ES")) {
      throw new TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${alg2}`);
    }
    let cek;
    {
      let parameters;
      ({ cek, encryptedKey, parameters } = await encrypt_key_management_default(alg2, enc2, key, this._cek, this._keyManagementParameters));
      if (parameters) {
        if (options && unprotected in options) {
          if (!this._unprotectedHeader) {
            this.setUnprotectedHeader(parameters);
          } else {
            this._unprotectedHeader = { ...this._unprotectedHeader, ...parameters };
          }
        } else if (!this._protectedHeader) {
          this.setProtectedHeader(parameters);
        } else {
          this._protectedHeader = { ...this._protectedHeader, ...parameters };
        }
      }
    }
    let additionalData;
    let protectedHeader;
    let aadMember;
    if (this._protectedHeader) {
      protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
    } else {
      protectedHeader = encoder.encode("");
    }
    if (this._aad) {
      aadMember = encode(this._aad);
      additionalData = concat(protectedHeader, encoder.encode("."), encoder.encode(aadMember));
    } else {
      additionalData = protectedHeader;
    }
    const { ciphertext, tag: tag2, iv } = await encrypt_default(enc2, this._plaintext, cek, this._iv, additionalData);
    const jwe = {
      ciphertext: encode(ciphertext)
    };
    if (iv) {
      jwe.iv = encode(iv);
    }
    if (tag2) {
      jwe.tag = encode(tag2);
    }
    if (encryptedKey) {
      jwe.encrypted_key = encode(encryptedKey);
    }
    if (aadMember) {
      jwe.aad = aadMember;
    }
    if (this._protectedHeader) {
      jwe.protected = decoder.decode(protectedHeader);
    }
    if (this._sharedUnprotectedHeader) {
      jwe.unprotected = this._sharedUnprotectedHeader;
    }
    if (this._unprotectedHeader) {
      jwe.header = this._unprotectedHeader;
    }
    return jwe;
  }
};

// node_modules/jose/dist/browser/lib/epoch.js
var epoch_default = (date2) => Math.floor(date2.getTime() / 1e3);

// node_modules/jose/dist/browser/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = (str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
};

// node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, "");
var checkAudiencePresence = (audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
};
var jwt_claims_set_default = (protectedHeader, encodedPayload, options = {}) => {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs_default(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now2 = epoch_default(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now2 + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now2 - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now2 - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
};

// node_modules/jose/dist/browser/jwt/decrypt.js
async function jwtDecrypt(jwt, key, options) {
  const decrypted = await compactDecrypt(jwt, key, options);
  const payload = jwt_claims_set_default(decrypted.protectedHeader, decrypted.plaintext, options);
  const { protectedHeader } = decrypted;
  if (protectedHeader.iss !== void 0 && protectedHeader.iss !== payload.iss) {
    throw new JWTClaimValidationFailed('replicated "iss" claim header parameter mismatch', payload, "iss", "mismatch");
  }
  if (protectedHeader.sub !== void 0 && protectedHeader.sub !== payload.sub) {
    throw new JWTClaimValidationFailed('replicated "sub" claim header parameter mismatch', payload, "sub", "mismatch");
  }
  if (protectedHeader.aud !== void 0 && JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)) {
    throw new JWTClaimValidationFailed('replicated "aud" claim header parameter mismatch', payload, "aud", "mismatch");
  }
  const result = { payload, protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: decrypted.key };
  }
  return result;
}

// node_modules/jose/dist/browser/jwe/compact/encrypt.js
var CompactEncrypt = class {
  constructor(plaintext) {
    this._flattened = new FlattenedEncrypt(plaintext);
  }
  setContentEncryptionKey(cek) {
    this._flattened.setContentEncryptionKey(cek);
    return this;
  }
  setInitializationVector(iv) {
    this._flattened.setInitializationVector(iv);
    return this;
  }
  setProtectedHeader(protectedHeader) {
    this._flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  setKeyManagementParameters(parameters) {
    this._flattened.setKeyManagementParameters(parameters);
    return this;
  }
  async encrypt(key, options) {
    const jwe = await this._flattened.encrypt(key, options);
    return [jwe.protected, jwe.encrypted_key, jwe.iv, jwe.ciphertext, jwe.tag].join(".");
  }
};

// node_modules/jose/dist/browser/jwt/produce.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
var ProduceJWT = class {
  constructor(payload = {}) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this._payload = payload;
  }
  setIssuer(issuer) {
    this._payload = { ...this._payload, iss: issuer };
    return this;
  }
  setSubject(subject) {
    this._payload = { ...this._payload, sub: subject };
    return this;
  }
  setAudience(audience) {
    this._payload = { ...this._payload, aud: audience };
    return this;
  }
  setJti(jwtId) {
    this._payload = { ...this._payload, jti: jwtId };
    return this;
  }
  setNotBefore(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setExpirationTime(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setIssuedAt(input) {
    if (typeof input === "undefined") {
      this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
    } else if (typeof input === "string") {
      this._payload = {
        ...this._payload,
        iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
      };
    } else {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
    }
    return this;
  }
};

// node_modules/jose/dist/browser/jwt/encrypt.js
var EncryptJWT = class extends ProduceJWT {
  setProtectedHeader(protectedHeader) {
    if (this._protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this._protectedHeader = protectedHeader;
    return this;
  }
  setKeyManagementParameters(parameters) {
    if (this._keyManagementParameters) {
      throw new TypeError("setKeyManagementParameters can only be called once");
    }
    this._keyManagementParameters = parameters;
    return this;
  }
  setContentEncryptionKey(cek) {
    if (this._cek) {
      throw new TypeError("setContentEncryptionKey can only be called once");
    }
    this._cek = cek;
    return this;
  }
  setInitializationVector(iv) {
    if (this._iv) {
      throw new TypeError("setInitializationVector can only be called once");
    }
    this._iv = iv;
    return this;
  }
  replicateIssuerAsHeader() {
    this._replicateIssuerAsHeader = true;
    return this;
  }
  replicateSubjectAsHeader() {
    this._replicateSubjectAsHeader = true;
    return this;
  }
  replicateAudienceAsHeader() {
    this._replicateAudienceAsHeader = true;
    return this;
  }
  async encrypt(key, options) {
    const enc2 = new CompactEncrypt(encoder.encode(JSON.stringify(this._payload)));
    if (this._replicateIssuerAsHeader) {
      this._protectedHeader = { ...this._protectedHeader, iss: this._payload.iss };
    }
    if (this._replicateSubjectAsHeader) {
      this._protectedHeader = { ...this._protectedHeader, sub: this._payload.sub };
    }
    if (this._replicateAudienceAsHeader) {
      this._protectedHeader = { ...this._protectedHeader, aud: this._payload.aud };
    }
    enc2.setProtectedHeader(this._protectedHeader);
    if (this._iv) {
      enc2.setInitializationVector(this._iv);
    }
    if (this._cek) {
      enc2.setContentEncryptionKey(this._cek);
    }
    if (this._keyManagementParameters) {
      enc2.setKeyManagementParameters(this._keyManagementParameters);
    }
    return enc2.encrypt(key, options);
  }
};

// node_modules/jose/dist/browser/jwk/thumbprint.js
var check = (value, description) => {
  if (typeof value !== "string" || !value) {
    throw new JWKInvalid(`${description} missing or invalid`);
  }
};
async function calculateJwkThumbprint(jwk, digestAlgorithm) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  digestAlgorithm ?? (digestAlgorithm = "sha256");
  if (digestAlgorithm !== "sha256" && digestAlgorithm !== "sha384" && digestAlgorithm !== "sha512") {
    throw new TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
  }
  let components;
  switch (jwk.kty) {
    case "EC":
      check(jwk.crv, '"crv" (Curve) Parameter');
      check(jwk.x, '"x" (X Coordinate) Parameter');
      check(jwk.y, '"y" (Y Coordinate) Parameter');
      components = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
      break;
    case "OKP":
      check(jwk.crv, '"crv" (Subtype of Key Pair) Parameter');
      check(jwk.x, '"x" (Public Key) Parameter');
      components = { crv: jwk.crv, kty: jwk.kty, x: jwk.x };
      break;
    case "RSA":
      check(jwk.e, '"e" (Exponent) Parameter');
      check(jwk.n, '"n" (Modulus) Parameter');
      components = { e: jwk.e, kty: jwk.kty, n: jwk.n };
      break;
    case "oct":
      check(jwk.k, '"k" (Key Value) Parameter');
      components = { k: jwk.k, kty: jwk.kty };
      break;
    default:
      throw new JOSENotSupported('"kty" (Key Type) Parameter missing or unsupported');
  }
  const data = encoder.encode(JSON.stringify(components));
  return encode(await digest_default(digestAlgorithm, data));
}

// node_modules/jose/dist/browser/util/base64url.js
var base64url_exports = {};
__export(base64url_exports, {
  decode: () => decode2,
  encode: () => encode2
});
var encode2 = encode;
var decode2 = decode;

// node_modules/jose/dist/browser/util/decode_jwt.js
function decodeJwt(jwt) {
  if (typeof jwt !== "string")
    throw new JWTInvalid("JWTs must use Compact JWS serialization, JWT must be a string");
  const { 1: payload, length } = jwt.split(".");
  if (length === 5)
    throw new JWTInvalid("Only JWTs using Compact JWS serialization can be decoded");
  if (length !== 3)
    throw new JWTInvalid("Invalid JWT");
  if (!payload)
    throw new JWTInvalid("JWTs must contain a payload");
  let decoded;
  try {
    decoded = decode2(payload);
  } catch {
    throw new JWTInvalid("Failed to base64url decode the payload");
  }
  let result;
  try {
    result = JSON.parse(decoder.decode(decoded));
  } catch {
    throw new JWTInvalid("Failed to parse the decoded payload as JSON");
  }
  if (!isObject(result))
    throw new JWTInvalid("Invalid JWT Claims Set");
  return result;
}

// node_modules/@auth/core/lib/vendored/cookie.js
var cookie_exports = {};
__export(cookie_exports, {
  parse: () => parse2,
  serialize: () => serialize
});
var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
var __toString = Object.prototype.toString;
var NullObject = /* @__PURE__ */ (() => {
  const C3 = function() {
  };
  C3.prototype = /* @__PURE__ */ Object.create(null);
  return C3;
})();
function parse2(str, options) {
  const obj = new NullObject();
  const len = str.length;
  if (len < 2)
    return obj;
  const dec = options?.decode || decode3;
  let index = 0;
  do {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1)
      break;
    const colonIdx = str.indexOf(";", index);
    const endIdx = colonIdx === -1 ? len : colonIdx;
    if (eqIdx > endIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const keyStartIdx = startIndex(str, index, eqIdx);
    const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
    const key = str.slice(keyStartIdx, keyEndIdx);
    if (obj[key] === void 0) {
      let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
      let valEndIdx = endIndex(str, endIdx, valStartIdx);
      const value = dec(str.slice(valStartIdx, valEndIdx));
      obj[key] = value;
    }
    index = endIdx + 1;
  } while (index < len);
  return obj;
}
function startIndex(str, index, max) {
  do {
    const code = str.charCodeAt(index);
    if (code !== 32 && code !== 9)
      return index;
  } while (++index < max);
  return max;
}
function endIndex(str, index, min) {
  while (index > min) {
    const code = str.charCodeAt(--index);
    if (code !== 32 && code !== 9)
      return index + 1;
  }
  return min;
}
function serialize(name, val, options) {
  const enc2 = options?.encode || encodeURIComponent;
  if (!cookieNameRegExp.test(name)) {
    throw new TypeError(`argument name is invalid: ${name}`);
  }
  const value = enc2(val);
  if (!cookieValueRegExp.test(value)) {
    throw new TypeError(`argument val is invalid: ${val}`);
  }
  let str = name + "=" + value;
  if (!options)
    return str;
  if (options.maxAge !== void 0) {
    if (!Number.isInteger(options.maxAge)) {
      throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
    }
    str += "; Max-Age=" + options.maxAge;
  }
  if (options.domain) {
    if (!domainValueRegExp.test(options.domain)) {
      throw new TypeError(`option domain is invalid: ${options.domain}`);
    }
    str += "; Domain=" + options.domain;
  }
  if (options.path) {
    if (!pathValueRegExp.test(options.path)) {
      throw new TypeError(`option path is invalid: ${options.path}`);
    }
    str += "; Path=" + options.path;
  }
  if (options.expires) {
    if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
      throw new TypeError(`option expires is invalid: ${options.expires}`);
    }
    str += "; Expires=" + options.expires.toUTCString();
  }
  if (options.httpOnly) {
    str += "; HttpOnly";
  }
  if (options.secure) {
    str += "; Secure";
  }
  if (options.partitioned) {
    str += "; Partitioned";
  }
  if (options.priority) {
    const priority = typeof options.priority === "string" ? options.priority.toLowerCase() : void 0;
    switch (priority) {
      case "low":
        str += "; Priority=Low";
        break;
      case "medium":
        str += "; Priority=Medium";
        break;
      case "high":
        str += "; Priority=High";
        break;
      default:
        throw new TypeError(`option priority is invalid: ${options.priority}`);
    }
  }
  if (options.sameSite) {
    const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
    switch (sameSite) {
      case true:
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
    }
  }
  return str;
}
function decode3(str) {
  if (str.indexOf("%") === -1)
    return str;
  try {
    return decodeURIComponent(str);
  } catch (e2) {
    return str;
  }
}
function isDate(val) {
  return __toString.call(val) === "[object Date]";
}

// node_modules/@auth/core/jwt.js
var { parse: parseCookie } = cookie_exports;
var DEFAULT_MAX_AGE = 30 * 24 * 60 * 60;
var now = () => Date.now() / 1e3 | 0;
var alg = "dir";
var enc = "A256CBC-HS512";
async function encode3(params) {
  const { token = {}, secret, maxAge = DEFAULT_MAX_AGE, salt } = params;
  const secrets = Array.isArray(secret) ? secret : [secret];
  const encryptionSecret = await getDerivedEncryptionKey(enc, secrets[0], salt);
  const thumbprint = await calculateJwkThumbprint({ kty: "oct", k: base64url_exports.encode(encryptionSecret) }, `sha${encryptionSecret.byteLength << 3}`);
  return await new EncryptJWT(token).setProtectedHeader({ alg, enc, kid: thumbprint }).setIssuedAt().setExpirationTime(now() + maxAge).setJti(crypto.randomUUID()).encrypt(encryptionSecret);
}
async function decode4(params) {
  const { token, secret, salt } = params;
  const secrets = Array.isArray(secret) ? secret : [secret];
  if (!token)
    return null;
  const { payload } = await jwtDecrypt(token, async ({ kid, enc: enc2 }) => {
    for (const secret2 of secrets) {
      const encryptionSecret = await getDerivedEncryptionKey(enc2, secret2, salt);
      if (kid === void 0)
        return encryptionSecret;
      const thumbprint = await calculateJwkThumbprint({ kty: "oct", k: base64url_exports.encode(encryptionSecret) }, `sha${encryptionSecret.byteLength << 3}`);
      if (kid === thumbprint)
        return encryptionSecret;
    }
    throw new Error("no matching decryption secret");
  }, {
    clockTolerance: 15,
    keyManagementAlgorithms: [alg],
    contentEncryptionAlgorithms: [enc, "A256GCM"]
  });
  return payload;
}
async function getDerivedEncryptionKey(enc2, keyMaterial, salt) {
  let length;
  switch (enc2) {
    case "A256CBC-HS512":
      length = 64;
      break;
    case "A256GCM":
      length = 32;
      break;
    default:
      throw new Error("Unsupported JWT Content Encryption Algorithm");
  }
  return await hkdf("sha256", keyMaterial, salt, `Auth.js Generated Encryption Key (${salt})`, length);
}

// node_modules/@auth/core/lib/utils/callback-url.js
async function createCallbackUrl({ options, paramValue, cookieValue }) {
  const { url, callbacks } = options;
  let callbackUrl = url.origin;
  if (paramValue) {
    callbackUrl = await callbacks.redirect({
      url: paramValue,
      baseUrl: url.origin
    });
  } else if (cookieValue) {
    callbackUrl = await callbacks.redirect({
      url: cookieValue,
      baseUrl: url.origin
    });
  }
  return {
    callbackUrl,
    // Save callback URL in a cookie so that it can be used for subsequent requests in signin/signout/callback flow
    callbackUrlCookie: callbackUrl !== cookieValue ? callbackUrl : void 0
  };
}

// node_modules/@auth/core/lib/utils/logger.js
var red = "\x1B[31m";
var yellow = "\x1B[33m";
var grey = "\x1B[90m";
var reset = "\x1B[0m";
var defaultLogger = {
  error(error) {
    const name = error instanceof AuthError ? error.type : error.name;
    console.error(`${red}[auth][error]${reset} ${name}: ${error.message}`);
    if (error.cause && typeof error.cause === "object" && "err" in error.cause && error.cause.err instanceof Error) {
      const { err, ...data } = error.cause;
      console.error(`${red}[auth][cause]${reset}:`, err.stack);
      if (data)
        console.error(`${red}[auth][details]${reset}:`, JSON.stringify(data, null, 2));
    } else if (error.stack) {
      console.error(error.stack.replace(/.*/, "").substring(1));
    }
  },
  warn(code) {
    const url = `https://warnings.authjs.dev#${code}`;
    console.warn(`${yellow}[auth][warn][${code}]${reset}`, `Read more: ${url}`);
  },
  debug(message2, metadata) {
    console.log(`${grey}[auth][debug]:${reset} ${message2}`, JSON.stringify(metadata, null, 2));
  }
};
function setLogger(config) {
  const newLogger = {
    ...defaultLogger
  };
  if (!config.debug)
    newLogger.debug = () => {
    };
  if (config.logger?.error)
    newLogger.error = config.logger.error;
  if (config.logger?.warn)
    newLogger.warn = config.logger.warn;
  if (config.logger?.debug)
    newLogger.debug = config.logger.debug;
  config.logger ?? (config.logger = newLogger);
  return newLogger;
}

// node_modules/@auth/core/lib/utils/actions.js
var actions = [
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error",
  "webauthn-options"
];
function isAuthAction(action) {
  return actions.includes(action);
}

// node_modules/@auth/core/lib/utils/web.js
var { parse: parseCookie2, serialize: serializeCookie } = cookie_exports;
async function getBody(req) {
  if (!("body" in req) || !req.body || req.method !== "POST")
    return;
  const contentType = req.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return await req.json();
  } else if (contentType?.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await req.text());
    return Object.fromEntries(params);
  }
}
async function toInternalRequest(req, config) {
  try {
    if (req.method !== "GET" && req.method !== "POST")
      throw new UnknownAction("Only GET and POST requests are supported");
    config.basePath ?? (config.basePath = "/auth");
    const url = new URL(req.url);
    const { action, providerId } = parseActionAndProviderId(url.pathname, config.basePath);
    return {
      url,
      action,
      providerId,
      method: req.method,
      headers: Object.fromEntries(req.headers),
      body: req.body ? await getBody(req) : void 0,
      cookies: parseCookie2(req.headers.get("cookie") ?? "") ?? {},
      error: url.searchParams.get("error") ?? void 0,
      query: Object.fromEntries(url.searchParams)
    };
  } catch (e2) {
    const logger = setLogger(config);
    logger.error(e2);
    logger.debug("request", req);
  }
}
function toRequest(request) {
  return new Request(request.url, {
    headers: request.headers,
    method: request.method,
    body: request.method === "POST" ? JSON.stringify(request.body ?? {}) : void 0
  });
}
function toResponse(res) {
  const headers = new Headers(res.headers);
  res.cookies?.forEach((cookie) => {
    const { name, value, options } = cookie;
    const cookieHeader = serializeCookie(name, value, options);
    if (headers.has("Set-Cookie"))
      headers.append("Set-Cookie", cookieHeader);
    else
      headers.set("Set-Cookie", cookieHeader);
  });
  let body = res.body;
  if (headers.get("content-type") === "application/json")
    body = JSON.stringify(res.body);
  else if (headers.get("content-type") === "application/x-www-form-urlencoded")
    body = new URLSearchParams(res.body).toString();
  const status = res.redirect ? 302 : res.status ?? 200;
  const response = new Response(body, { headers, status });
  if (res.redirect)
    response.headers.set("Location", res.redirect);
  return response;
}
async function createHash(message2) {
  const data = new TextEncoder().encode(message2);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b2) => b2.toString(16).padStart(2, "0")).join("").toString();
}
function randomString(size) {
  const i2hex = (i4) => ("0" + i4.toString(16)).slice(-2);
  const r3 = (a4, i4) => a4 + i2hex(i4);
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes).reduce(r3, "");
}
function parseActionAndProviderId(pathname, base) {
  const a4 = pathname.match(new RegExp(`^${base}(.+)`));
  if (a4 === null)
    throw new UnknownAction(`Cannot parse action at ${pathname}`);
  const actionAndProviderId = a4.at(-1);
  const b2 = actionAndProviderId.replace(/^\//, "").split("/").filter(Boolean);
  if (b2.length !== 1 && b2.length !== 2)
    throw new UnknownAction(`Cannot parse action at ${pathname}`);
  const [action, providerId] = b2;
  if (!isAuthAction(action))
    throw new UnknownAction(`Cannot parse action at ${pathname}`);
  if (providerId && !["signin", "callback", "webauthn-options"].includes(action))
    throw new UnknownAction(`Cannot parse action at ${pathname}`);
  return { action, providerId };
}

// node_modules/@auth/core/lib/actions/callback/oauth/csrf-token.js
async function createCSRFToken({ options, cookieValue, isPost, bodyValue }) {
  if (cookieValue) {
    const [csrfToken2, csrfTokenHash2] = cookieValue.split("|");
    const expectedCsrfTokenHash = await createHash(`${csrfToken2}${options.secret}`);
    if (csrfTokenHash2 === expectedCsrfTokenHash) {
      const csrfTokenVerified = isPost && csrfToken2 === bodyValue;
      return { csrfTokenVerified, csrfToken: csrfToken2 };
    }
  }
  const csrfToken = randomString(32);
  const csrfTokenHash = await createHash(`${csrfToken}${options.secret}`);
  const cookie = `${csrfToken}|${csrfTokenHash}`;
  return { cookie, csrfToken };
}
function validateCSRF(action, verified) {
  if (verified)
    return;
  throw new MissingCSRF(`CSRF token was missing during an action ${action}`);
}

// node_modules/@auth/core/lib/utils/merge.js
function isObject2(item) {
  return item !== null && typeof item === "object";
}
function merge(target, ...sources) {
  if (!sources.length)
    return target;
  const source = sources.shift();
  if (isObject2(target) && isObject2(source)) {
    for (const key in source) {
      if (isObject2(source[key])) {
        if (!isObject2(target[key]))
          target[key] = Array.isArray(source[key]) ? [] : {};
        merge(target[key], source[key]);
      } else if (source[key] !== void 0)
        target[key] = source[key];
    }
  }
  return merge(target, ...sources);
}

// node_modules/@auth/core/lib/symbols.js
var skipCSRFCheck = Symbol("skip-csrf-check");
var raw2 = Symbol("return-type-raw");
var customFetch = Symbol("custom-fetch");
var conformInternal = Symbol("conform-internal");

// node_modules/@auth/core/lib/utils/providers.js
function parseProviders(params) {
  const { providerId, config } = params;
  const url = new URL(config.basePath ?? "/auth", params.url.origin);
  const providers = config.providers.map((p4) => {
    const provider = typeof p4 === "function" ? p4() : p4;
    const { options: userOptions, ...defaults } = provider;
    const id = userOptions?.id ?? defaults.id;
    const merged = merge(defaults, userOptions, {
      signinUrl: `${url}/signin/${id}`,
      callbackUrl: `${url}/callback/${id}`
    });
    if (provider.type === "oauth" || provider.type === "oidc") {
      merged.redirectProxyUrl ?? (merged.redirectProxyUrl = userOptions?.redirectProxyUrl ?? config.redirectProxyUrl);
      const normalized = normalizeOAuth(merged);
      if (normalized.authorization?.url.searchParams.get("response_mode") === "form_post") {
        delete normalized.redirectProxyUrl;
      }
      normalized[customFetch] ?? (normalized[customFetch] = userOptions?.[customFetch]);
      return normalized;
    }
    return merged;
  });
  return {
    providers,
    provider: providers.find(({ id }) => id === providerId)
  };
}
function normalizeOAuth(c3) {
  if (c3.issuer)
    c3.wellKnown ?? (c3.wellKnown = `${c3.issuer}/.well-known/openid-configuration`);
  const authorization = normalizeEndpoint(c3.authorization, c3.issuer);
  if (authorization && !authorization.url?.searchParams.has("scope")) {
    authorization.url.searchParams.set("scope", "openid profile email");
  }
  const token = normalizeEndpoint(c3.token, c3.issuer);
  const userinfo = normalizeEndpoint(c3.userinfo, c3.issuer);
  const checks = c3.checks ?? ["pkce"];
  if (c3.redirectProxyUrl) {
    if (!checks.includes("state"))
      checks.push("state");
    c3.redirectProxyUrl = `${c3.redirectProxyUrl}/callback/${c3.id}`;
  }
  return {
    ...c3,
    authorization,
    token,
    checks,
    userinfo,
    profile: c3.profile ?? defaultProfile,
    account: c3.account ?? defaultAccount
  };
}
var defaultProfile = (profile) => {
  return stripUndefined({
    id: profile.sub ?? profile.id ?? crypto.randomUUID(),
    name: profile.name ?? profile.nickname ?? profile.preferred_username,
    email: profile.email,
    image: profile.picture
  });
};
var defaultAccount = (account) => {
  return stripUndefined({
    access_token: account.access_token,
    id_token: account.id_token,
    refresh_token: account.refresh_token,
    expires_at: account.expires_at,
    scope: account.scope,
    token_type: account.token_type,
    session_state: account.session_state
  });
};
function stripUndefined(o3) {
  const result = {};
  for (const [k3, v3] of Object.entries(o3)) {
    if (v3 !== void 0)
      result[k3] = v3;
  }
  return result;
}
function normalizeEndpoint(e2, issuer) {
  if (!e2 && issuer)
    return;
  if (typeof e2 === "string") {
    return { url: new URL(e2) };
  }
  const url = new URL(e2?.url ?? "https://authjs.dev");
  if (e2?.params != null) {
    for (let [key, value] of Object.entries(e2.params)) {
      if (key === "claims") {
        value = JSON.stringify(value);
      }
      url.searchParams.set(key, String(value));
    }
  }
  return {
    url,
    request: e2?.request,
    conform: e2?.conform,
    ...e2?.clientPrivateKey ? { clientPrivateKey: e2?.clientPrivateKey } : null
  };
}
function isOIDCProvider(provider) {
  return provider.type === "oidc";
}

// node_modules/@auth/core/lib/init.js
var defaultCallbacks = {
  signIn() {
    return true;
  },
  redirect({ url, baseUrl }) {
    if (url.startsWith("/"))
      return `${baseUrl}${url}`;
    else if (new URL(url).origin === baseUrl)
      return url;
    return baseUrl;
  },
  session({ session: session2 }) {
    return {
      user: {
        name: session2.user?.name,
        email: session2.user?.email,
        image: session2.user?.image
      },
      expires: session2.expires?.toISOString?.() ?? session2.expires
    };
  },
  jwt({ token }) {
    return token;
  }
};
async function init({ authOptions: config, providerId, action, url, cookies: reqCookies, callbackUrl: reqCallbackUrl, csrfToken: reqCsrfToken, csrfDisabled, isPost }) {
  const logger = setLogger(config);
  const { providers, provider } = parseProviders({ url, providerId, config });
  const maxAge = 30 * 24 * 60 * 60;
  let isOnRedirectProxy = false;
  if ((provider?.type === "oauth" || provider?.type === "oidc") && provider.redirectProxyUrl) {
    try {
      isOnRedirectProxy = new URL(provider.redirectProxyUrl).origin === url.origin;
    } catch {
      throw new TypeError(`redirectProxyUrl must be a valid URL. Received: ${provider.redirectProxyUrl}`);
    }
  }
  const options = {
    debug: false,
    pages: {},
    theme: {
      colorScheme: "auto",
      logo: "",
      brandColor: "",
      buttonText: ""
    },
    // Custom options override defaults
    ...config,
    // These computed settings can have values in userOptions but we override them
    // and are request-specific.
    url,
    action,
    // @ts-expect-errors
    provider,
    cookies: merge(defaultCookies(config.useSecureCookies ?? url.protocol === "https:"), config.cookies),
    providers,
    // Session options
    session: {
      // If no adapter specified, force use of JSON Web Tokens (stateless)
      strategy: config.adapter ? "database" : "jwt",
      maxAge,
      updateAge: 24 * 60 * 60,
      generateSessionToken: () => crypto.randomUUID(),
      ...config.session
    },
    // JWT options
    jwt: {
      secret: config.secret,
      // Asserted in assert.ts
      maxAge: config.session?.maxAge ?? maxAge,
      // default to same as `session.maxAge`
      encode: encode3,
      decode: decode4,
      ...config.jwt
    },
    // Event messages
    events: eventsErrorHandler(config.events ?? {}, logger),
    adapter: adapterErrorHandler(config.adapter, logger),
    // Callback functions
    callbacks: { ...defaultCallbacks, ...config.callbacks },
    logger,
    callbackUrl: url.origin,
    isOnRedirectProxy,
    experimental: {
      ...config.experimental
    }
  };
  const cookies = [];
  if (csrfDisabled) {
    options.csrfTokenVerified = true;
  } else {
    const { csrfToken, cookie: csrfCookie, csrfTokenVerified } = await createCSRFToken({
      options,
      cookieValue: reqCookies?.[options.cookies.csrfToken.name],
      isPost,
      bodyValue: reqCsrfToken
    });
    options.csrfToken = csrfToken;
    options.csrfTokenVerified = csrfTokenVerified;
    if (csrfCookie) {
      cookies.push({
        name: options.cookies.csrfToken.name,
        value: csrfCookie,
        options: options.cookies.csrfToken.options
      });
    }
  }
  const { callbackUrl, callbackUrlCookie } = await createCallbackUrl({
    options,
    cookieValue: reqCookies?.[options.cookies.callbackUrl.name],
    paramValue: reqCallbackUrl
  });
  options.callbackUrl = callbackUrl;
  if (callbackUrlCookie) {
    cookies.push({
      name: options.cookies.callbackUrl.name,
      value: callbackUrlCookie,
      options: options.cookies.callbackUrl.options
    });
  }
  return { options, cookies };
}
function eventsErrorHandler(methods, logger) {
  return Object.keys(methods).reduce((acc, name) => {
    acc[name] = async (...args) => {
      try {
        const method = methods[name];
        return await method(...args);
      } catch (e2) {
        logger.error(new EventError(e2));
      }
    };
    return acc;
  }, {});
}
function adapterErrorHandler(adapter, logger) {
  if (!adapter)
    return;
  return Object.keys(adapter).reduce((acc, name) => {
    acc[name] = async (...args) => {
      try {
        logger.debug(`adapter_${name}`, { args });
        const method = adapter[name];
        return await method(...args);
      } catch (e2) {
        const error = new AdapterError(e2);
        logger.error(error);
        throw error;
      }
    };
    return acc;
  }, {});
}

// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var o;
var r;
var f;
var e;
var c;
var s;
var a2;
var h = {};
var v2 = [];
var p2 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var y2 = Array.isArray;
function d(n2, l3) {
  for (var u4 in l3)
    n2[u4] = l3[u4];
  return n2;
}
function w2(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _2(l3, u4, t2) {
  var i4, o3, r3, f4 = {};
  for (r3 in u4)
    "key" == r3 ? i4 = u4[r3] : "ref" == r3 ? o3 = u4[r3] : f4[r3] = u4[r3];
  if (arguments.length > 2 && (f4.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l3 && null != l3.defaultProps)
    for (r3 in l3.defaultProps)
      void 0 === f4[r3] && (f4[r3] = l3.defaultProps[r3]);
  return g(l3, f4, i4, o3, null);
}
function g(n2, t2, i4, o3, r3) {
  var f4 = { type: n2, props: t2, key: i4, ref: o3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == r3 ? ++u : r3, __i: -1, __u: 0 };
  return null == r3 && null != l.vnode && l.vnode(f4), f4;
}
function b(n2) {
  return n2.children;
}
function k(n2, l3) {
  this.props = n2, this.context = l3;
}
function x2(n2, l3) {
  if (null == l3)
    return n2.__ ? x2(n2.__, n2.__i + 1) : null;
  for (var u4; l3 < n2.__k.length; l3++)
    if (null != (u4 = n2.__k[l3]) && null != u4.__e)
      return u4.__e;
  return "function" == typeof n2.type ? x2(n2) : null;
}
function C(n2) {
  var l3, u4;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++)
      if (null != (u4 = n2.__k[l3]) && null != u4.__e) {
        n2.__e = n2.__c.base = u4.__e;
        break;
      }
    return C(n2);
  }
}
function S2(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !M.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || r)(M);
}
function M() {
  var n2, u4, t2, o3, r3, e2, c3, s3;
  for (i.sort(f); n2 = i.shift(); )
    n2.__d && (u4 = i.length, o3 = void 0, e2 = (r3 = (t2 = n2).__v).__e, c3 = [], s3 = [], t2.__P && ((o3 = d({}, r3)).__v = r3.__v + 1, l.vnode && l.vnode(o3), O2(t2.__P, o3, r3, t2.__n, t2.__P.namespaceURI, 32 & r3.__u ? [e2] : null, c3, null == e2 ? x2(r3) : e2, !!(32 & r3.__u), s3), o3.__v = r3.__v, o3.__.__k[o3.__i] = o3, j(c3, o3, s3), o3.__e != e2 && C(o3)), i.length > u4 && i.sort(f));
  M.__r = 0;
}
function P(n2, l3, u4, t2, i4, o3, r3, f4, e2, c3, s3) {
  var a4, p4, y3, d3, w4, _4 = t2 && t2.__k || v2, g2 = l3.length;
  for (u4.__d = e2, $(u4, l3, _4), e2 = u4.__d, a4 = 0; a4 < g2; a4++)
    null != (y3 = u4.__k[a4]) && (p4 = -1 === y3.__i ? h : _4[y3.__i] || h, y3.__i = a4, O2(n2, y3, p4, i4, o3, r3, f4, e2, c3, s3), d3 = y3.__e, y3.ref && p4.ref != y3.ref && (p4.ref && N(p4.ref, null, y3), s3.push(y3.ref, y3.__c || d3, y3)), null == w4 && null != d3 && (w4 = d3), 65536 & y3.__u || p4.__k === y3.__k ? e2 = I2(y3, e2, n2) : "function" == typeof y3.type && void 0 !== y3.__d ? e2 = y3.__d : d3 && (e2 = d3.nextSibling), y3.__d = void 0, y3.__u &= -196609);
  u4.__d = e2, u4.__e = w4;
}
function $(n2, l3, u4) {
  var t2, i4, o3, r3, f4, e2 = l3.length, c3 = u4.length, s3 = c3, a4 = 0;
  for (n2.__k = [], t2 = 0; t2 < e2; t2++)
    null != (i4 = l3[t2]) && "boolean" != typeof i4 && "function" != typeof i4 ? (r3 = t2 + a4, (i4 = n2.__k[t2] = "string" == typeof i4 || "number" == typeof i4 || "bigint" == typeof i4 || i4.constructor == String ? g(null, i4, null, null, null) : y2(i4) ? g(b, { children: i4 }, null, null, null) : void 0 === i4.constructor && i4.__b > 0 ? g(i4.type, i4.props, i4.key, i4.ref ? i4.ref : null, i4.__v) : i4).__ = n2, i4.__b = n2.__b + 1, o3 = null, -1 !== (f4 = i4.__i = L(i4, u4, r3, s3)) && (s3--, (o3 = u4[f4]) && (o3.__u |= 131072)), null == o3 || null === o3.__v ? (-1 == f4 && a4--, "function" != typeof i4.type && (i4.__u |= 65536)) : f4 !== r3 && (f4 == r3 - 1 ? a4-- : f4 == r3 + 1 ? a4++ : (f4 > r3 ? a4-- : a4++, i4.__u |= 65536))) : i4 = n2.__k[t2] = null;
  if (s3)
    for (t2 = 0; t2 < c3; t2++)
      null != (o3 = u4[t2]) && 0 == (131072 & o3.__u) && (o3.__e == n2.__d && (n2.__d = x2(o3)), V(o3, o3));
}
function I2(n2, l3, u4) {
  var t2, i4;
  if ("function" == typeof n2.type) {
    for (t2 = n2.__k, i4 = 0; t2 && i4 < t2.length; i4++)
      t2[i4] && (t2[i4].__ = n2, l3 = I2(t2[i4], l3, u4));
    return l3;
  }
  n2.__e != l3 && (l3 && n2.type && !u4.contains(l3) && (l3 = x2(n2)), u4.insertBefore(n2.__e, l3 || null), l3 = n2.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 === l3.nodeType);
  return l3;
}
function L(n2, l3, u4, t2) {
  var i4 = n2.key, o3 = n2.type, r3 = u4 - 1, f4 = u4 + 1, e2 = l3[u4];
  if (null === e2 || e2 && i4 == e2.key && o3 === e2.type && 0 == (131072 & e2.__u))
    return u4;
  if (t2 > (null != e2 && 0 == (131072 & e2.__u) ? 1 : 0))
    for (; r3 >= 0 || f4 < l3.length; ) {
      if (r3 >= 0) {
        if ((e2 = l3[r3]) && 0 == (131072 & e2.__u) && i4 == e2.key && o3 === e2.type)
          return r3;
        r3--;
      }
      if (f4 < l3.length) {
        if ((e2 = l3[f4]) && 0 == (131072 & e2.__u) && i4 == e2.key && o3 === e2.type)
          return f4;
        f4++;
      }
    }
  return -1;
}
function T(n2, l3, u4) {
  "-" === l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || p2.test(l3) ? u4 : u4 + "px";
}
function A(n2, l3, u4, t2, i4) {
  var o3;
  n:
    if ("style" === l3)
      if ("string" == typeof u4)
        n2.style.cssText = u4;
      else {
        if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2)
          for (l3 in t2)
            u4 && l3 in u4 || T(n2.style, l3, "");
        if (u4)
          for (l3 in u4)
            t2 && u4[l3] === t2[l3] || T(n2.style, l3, u4[l3]);
      }
    else if ("o" === l3[0] && "n" === l3[1])
      o3 = l3 !== (l3 = l3.replace(/(PointerCapture)$|Capture$/i, "$1")), l3 = l3.toLowerCase() in n2 || "onFocusOut" === l3 || "onFocusIn" === l3 ? l3.toLowerCase().slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + o3] = u4, u4 ? t2 ? u4.u = t2.u : (u4.u = e, n2.addEventListener(l3, o3 ? s : c, o3)) : n2.removeEventListener(l3, o3 ? s : c, o3);
    else {
      if ("http://www.w3.org/2000/svg" == i4)
        l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2)
        try {
          n2[l3] = null == u4 ? "" : u4;
          break n;
        } catch (n3) {
        }
      "function" == typeof u4 || (null == u4 || false === u4 && "-" !== l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u4 ? "" : u4));
    }
}
function F(n2) {
  return function(u4) {
    if (this.l) {
      var t2 = this.l[u4.type + n2];
      if (null == u4.t)
        u4.t = e++;
      else if (u4.t < t2.u)
        return;
      return t2(l.event ? l.event(u4) : u4);
    }
  };
}
function O2(n2, u4, t2, i4, o3, r3, f4, e2, c3, s3) {
  var a4, h3, v3, p4, w4, _4, g2, m2, x4, C3, S3, M2, $2, I3, H, L3, T3 = u4.type;
  if (void 0 !== u4.constructor)
    return null;
  128 & t2.__u && (c3 = !!(32 & t2.__u), r3 = [e2 = u4.__e = t2.__e]), (a4 = l.__b) && a4(u4);
  n:
    if ("function" == typeof T3)
      try {
        if (m2 = u4.props, x4 = "prototype" in T3 && T3.prototype.render, C3 = (a4 = T3.contextType) && i4[a4.__c], S3 = a4 ? C3 ? C3.props.value : a4.__ : i4, t2.__c ? g2 = (h3 = u4.__c = t2.__c).__ = h3.__E : (x4 ? u4.__c = h3 = new T3(m2, S3) : (u4.__c = h3 = new k(m2, S3), h3.constructor = T3, h3.render = q), C3 && C3.sub(h3), h3.props = m2, h3.state || (h3.state = {}), h3.context = S3, h3.__n = i4, v3 = h3.__d = true, h3.__h = [], h3._sb = []), x4 && null == h3.__s && (h3.__s = h3.state), x4 && null != T3.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = d({}, h3.__s)), d(h3.__s, T3.getDerivedStateFromProps(m2, h3.__s))), p4 = h3.props, w4 = h3.state, h3.__v = u4, v3)
          x4 && null == T3.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), x4 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
        else {
          if (x4 && null == T3.getDerivedStateFromProps && m2 !== p4 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(m2, S3), !h3.__e && (null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(m2, h3.__s, S3) || u4.__v === t2.__v)) {
            for (u4.__v !== t2.__v && (h3.props = m2, h3.state = h3.__s, h3.__d = false), u4.__e = t2.__e, u4.__k = t2.__k, u4.__k.some(function(n3) {
              n3 && (n3.__ = u4);
            }), M2 = 0; M2 < h3._sb.length; M2++)
              h3.__h.push(h3._sb[M2]);
            h3._sb = [], h3.__h.length && f4.push(h3);
            break n;
          }
          null != h3.componentWillUpdate && h3.componentWillUpdate(m2, h3.__s, S3), x4 && null != h3.componentDidUpdate && h3.__h.push(function() {
            h3.componentDidUpdate(p4, w4, _4);
          });
        }
        if (h3.context = S3, h3.props = m2, h3.__P = n2, h3.__e = false, $2 = l.__r, I3 = 0, x4) {
          for (h3.state = h3.__s, h3.__d = false, $2 && $2(u4), a4 = h3.render(h3.props, h3.state, h3.context), H = 0; H < h3._sb.length; H++)
            h3.__h.push(h3._sb[H]);
          h3._sb = [];
        } else
          do {
            h3.__d = false, $2 && $2(u4), a4 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
          } while (h3.__d && ++I3 < 25);
        h3.state = h3.__s, null != h3.getChildContext && (i4 = d(d({}, i4), h3.getChildContext())), x4 && !v3 && null != h3.getSnapshotBeforeUpdate && (_4 = h3.getSnapshotBeforeUpdate(p4, w4)), P(n2, y2(L3 = null != a4 && a4.type === b && null == a4.key ? a4.props.children : a4) ? L3 : [L3], u4, t2, i4, o3, r3, f4, e2, c3, s3), h3.base = u4.__e, u4.__u &= -161, h3.__h.length && f4.push(h3), g2 && (h3.__E = h3.__ = null);
      } catch (n3) {
        if (u4.__v = null, c3 || null != r3) {
          for (u4.__u |= c3 ? 160 : 128; e2 && 8 === e2.nodeType && e2.nextSibling; )
            e2 = e2.nextSibling;
          r3[r3.indexOf(e2)] = null, u4.__e = e2;
        } else
          u4.__e = t2.__e, u4.__k = t2.__k;
        l.__e(n3, u4, t2);
      }
    else
      null == r3 && u4.__v === t2.__v ? (u4.__k = t2.__k, u4.__e = t2.__e) : u4.__e = z2(t2.__e, u4, t2, i4, o3, r3, f4, c3, s3);
  (a4 = l.diffed) && a4(u4);
}
function j(n2, u4, t2) {
  u4.__d = void 0;
  for (var i4 = 0; i4 < t2.length; i4++)
    N(t2[i4], t2[++i4], t2[++i4]);
  l.__c && l.__c(u4, n2), n2.some(function(u5) {
    try {
      n2 = u5.__h, u5.__h = [], n2.some(function(n3) {
        n3.call(u5);
      });
    } catch (n3) {
      l.__e(n3, u5.__v);
    }
  });
}
function z2(u4, t2, i4, o3, r3, f4, e2, c3, s3) {
  var a4, v3, p4, d3, _4, g2, m2, b2 = i4.props, k3 = t2.props, C3 = t2.type;
  if ("svg" === C3 ? r3 = "http://www.w3.org/2000/svg" : "math" === C3 ? r3 = "http://www.w3.org/1998/Math/MathML" : r3 || (r3 = "http://www.w3.org/1999/xhtml"), null != f4) {
    for (a4 = 0; a4 < f4.length; a4++)
      if ((_4 = f4[a4]) && "setAttribute" in _4 == !!C3 && (C3 ? _4.localName === C3 : 3 === _4.nodeType)) {
        u4 = _4, f4[a4] = null;
        break;
      }
  }
  if (null == u4) {
    if (null === C3)
      return document.createTextNode(k3);
    u4 = document.createElementNS(r3, C3, k3.is && k3), c3 && (l.__m && l.__m(t2, f4), c3 = false), f4 = null;
  }
  if (null === C3)
    b2 === k3 || c3 && u4.data === k3 || (u4.data = k3);
  else {
    if (f4 = f4 && n.call(u4.childNodes), b2 = i4.props || h, !c3 && null != f4)
      for (b2 = {}, a4 = 0; a4 < u4.attributes.length; a4++)
        b2[(_4 = u4.attributes[a4]).name] = _4.value;
    for (a4 in b2)
      if (_4 = b2[a4], "children" == a4)
        ;
      else if ("dangerouslySetInnerHTML" == a4)
        p4 = _4;
      else if (!(a4 in k3)) {
        if ("value" == a4 && "defaultValue" in k3 || "checked" == a4 && "defaultChecked" in k3)
          continue;
        A(u4, a4, null, _4, r3);
      }
    for (a4 in k3)
      _4 = k3[a4], "children" == a4 ? d3 = _4 : "dangerouslySetInnerHTML" == a4 ? v3 = _4 : "value" == a4 ? g2 = _4 : "checked" == a4 ? m2 = _4 : c3 && "function" != typeof _4 || b2[a4] === _4 || A(u4, a4, _4, b2[a4], r3);
    if (v3)
      c3 || p4 && (v3.__html === p4.__html || v3.__html === u4.innerHTML) || (u4.innerHTML = v3.__html), t2.__k = [];
    else if (p4 && (u4.innerHTML = ""), P(u4, y2(d3) ? d3 : [d3], t2, i4, o3, "foreignObject" === C3 ? "http://www.w3.org/1999/xhtml" : r3, f4, e2, f4 ? f4[0] : i4.__k && x2(i4, 0), c3, s3), null != f4)
      for (a4 = f4.length; a4--; )
        w2(f4[a4]);
    c3 || (a4 = "value", "progress" === C3 && null == g2 ? u4.removeAttribute("value") : void 0 !== g2 && (g2 !== u4[a4] || "progress" === C3 && !g2 || "option" === C3 && g2 !== b2[a4]) && A(u4, a4, g2, b2[a4], r3), a4 = "checked", void 0 !== m2 && m2 !== u4[a4] && A(u4, a4, m2, b2[a4], r3));
  }
  return u4;
}
function N(n2, u4, t2) {
  try {
    if ("function" == typeof n2) {
      var i4 = "function" == typeof n2.__u;
      i4 && n2.__u(), i4 && null == u4 || (n2.__u = n2(u4));
    } else
      n2.current = u4;
  } catch (n3) {
    l.__e(n3, t2);
  }
}
function V(n2, u4, t2) {
  var i4, o3;
  if (l.unmount && l.unmount(n2), (i4 = n2.ref) && (i4.current && i4.current !== n2.__e || N(i4, null, u4)), null != (i4 = n2.__c)) {
    if (i4.componentWillUnmount)
      try {
        i4.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u4);
      }
    i4.base = i4.__P = null;
  }
  if (i4 = n2.__k)
    for (o3 = 0; o3 < i4.length; o3++)
      i4[o3] && V(i4[o3], u4, t2 || "function" != typeof n2.type);
  t2 || w2(n2.__e), n2.__c = n2.__ = n2.__e = n2.__d = void 0;
}
function q(n2, l3, u4) {
  return this.constructor(n2, u4);
}
n = v2.slice, l = { __e: function(n2, l3, u4, t2) {
  for (var i4, o3, r3; l3 = l3.__; )
    if ((i4 = l3.__c) && !i4.__)
      try {
        if ((o3 = i4.constructor) && null != o3.getDerivedStateFromError && (i4.setState(o3.getDerivedStateFromError(n2)), r3 = i4.__d), null != i4.componentDidCatch && (i4.componentDidCatch(n2, t2 || {}), r3 = i4.__d), r3)
          return i4.__E = i4;
      } catch (l4) {
        n2 = l4;
      }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && null == n2.constructor;
}, k.prototype.setState = function(n2, l3) {
  var u4;
  u4 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = d({}, this.state), "function" == typeof n2 && (n2 = n2(d({}, u4), this.props)), n2 && d(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), S2(this));
}, k.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), S2(this));
}, k.prototype.render = b, i = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f = function(n2, l3) {
  return n2.__v.__b - l3.__v.__b;
}, M.__r = 0, e = 0, c = F(false), s = F(true), a2 = 0;

// node_modules/preact-render-to-string/dist/index.module.js
var r2 = /[\s\n\\/='"\0<>]/;
var o2 = /^(xlink|xmlns|xml)([A-Z])/;
var i2 = /^accessK|^auto[A-Z]|^cell|^ch|^col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z]/;
var a3 = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/;
var c2 = /* @__PURE__ */ new Set(["draggable", "spellcheck"]);
var s2 = /["&<]/;
function l2(e2) {
  if (0 === e2.length || false === s2.test(e2))
    return e2;
  for (var t2 = 0, n2 = 0, r3 = "", o3 = ""; n2 < e2.length; n2++) {
    switch (e2.charCodeAt(n2)) {
      case 34:
        o3 = "&quot;";
        break;
      case 38:
        o3 = "&amp;";
        break;
      case 60:
        o3 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== t2 && (r3 += e2.slice(t2, n2)), r3 += o3, t2 = n2 + 1;
  }
  return n2 !== t2 && (r3 += e2.slice(t2, n2)), r3;
}
var u2 = {};
var f2 = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]);
var p3 = /[A-Z]/g;
function h2(e2) {
  var t2 = "";
  for (var n2 in e2) {
    var r3 = e2[n2];
    if (null != r3 && "" !== r3) {
      var o3 = "-" == n2[0] ? n2 : u2[n2] || (u2[n2] = n2.replace(p3, "-$&").toLowerCase()), i4 = ";";
      "number" != typeof r3 || o3.startsWith("--") || f2.has(o3) || (i4 = "px;"), t2 = t2 + o3 + ":" + r3 + i4;
    }
  }
  return t2 || void 0;
}
function d2() {
  this.__d = true;
}
function _3(e2, t2) {
  return { __v: e2, context: t2, props: e2.props, setState: d2, forceUpdate: d2, __d: true, __h: new Array(0) };
}
var k2;
var w3;
var x3;
var C2;
var A2 = {};
var L2 = [];
var E2 = Array.isArray;
var T2 = Object.assign;
var j2 = "";
function D(r3, o3, i4) {
  var a4 = l.__s;
  l.__s = true, k2 = l.__b, w3 = l.diffed, x3 = l.__r, C2 = l.unmount;
  var c3 = _2(b, null);
  c3.__k = [r3];
  try {
    var s3 = U2(r3, o3 || A2, false, void 0, c3, false, i4);
    return E2(s3) ? s3.join(j2) : s3;
  } catch (e2) {
    if (e2.then)
      throw new Error('Use "renderToStringAsync" for suspenseful rendering.');
    throw e2;
  } finally {
    l.__c && l.__c(r3, L2), l.__s = a4, L2.length = 0;
  }
}
function P2(e2, t2) {
  var n2, r3 = e2.type, o3 = true;
  return e2.__c ? (o3 = false, (n2 = e2.__c).state = n2.__s) : n2 = new r3(e2.props, t2), e2.__c = n2, n2.__v = e2, n2.props = e2.props, n2.context = t2, n2.__d = true, null == n2.state && (n2.state = A2), null == n2.__s && (n2.__s = n2.state), r3.getDerivedStateFromProps ? n2.state = T2({}, n2.state, r3.getDerivedStateFromProps(n2.props, n2.state)) : o3 && n2.componentWillMount ? (n2.componentWillMount(), n2.state = n2.__s !== n2.state ? n2.__s : n2.state) : !o3 && n2.componentWillUpdate && n2.componentWillUpdate(), x3 && x3(e2), n2.render(n2.props, n2.state, t2);
}
function U2(t2, s3, u4, f4, p4, d3, v3) {
  if (null == t2 || true === t2 || false === t2 || t2 === j2)
    return j2;
  var m2 = typeof t2;
  if ("object" != m2)
    return "function" == m2 ? j2 : "string" == m2 ? l2(t2) : t2 + j2;
  if (E2(t2)) {
    var y3, g2 = j2;
    p4.__k = t2;
    for (var b2 = 0; b2 < t2.length; b2++) {
      var S3 = t2[b2];
      if (null != S3 && "boolean" != typeof S3) {
        var L3, D2 = U2(S3, s3, u4, f4, p4, d3, v3);
        "string" == typeof D2 ? g2 += D2 : (y3 || (y3 = []), g2 && y3.push(g2), g2 = j2, E2(D2) ? (L3 = y3).push.apply(L3, D2) : y3.push(D2));
      }
    }
    return y3 ? (g2 && y3.push(g2), y3) : g2;
  }
  if (void 0 !== t2.constructor)
    return j2;
  t2.__ = p4, k2 && k2(t2);
  var F2 = t2.type, M2 = t2.props;
  if ("function" == typeof F2) {
    var W, $2, z4, H = s3;
    if (F2 === b) {
      if ("tpl" in M2) {
        for (var N2 = j2, q2 = 0; q2 < M2.tpl.length; q2++)
          if (N2 += M2.tpl[q2], M2.exprs && q2 < M2.exprs.length) {
            var B = M2.exprs[q2];
            if (null == B)
              continue;
            "object" != typeof B || void 0 !== B.constructor && !E2(B) ? N2 += B : N2 += U2(B, s3, u4, f4, t2, d3, v3);
          }
        return N2;
      }
      if ("UNSTABLE_comment" in M2)
        return "<!--" + l2(M2.UNSTABLE_comment) + "-->";
      $2 = M2.children;
    } else {
      if (null != (W = F2.contextType)) {
        var I3 = s3[W.__c];
        H = I3 ? I3.props.value : W.__;
      }
      var O3 = F2.prototype && "function" == typeof F2.prototype.render;
      if (O3)
        $2 = P2(t2, H), z4 = t2.__c;
      else {
        t2.__c = z4 = _3(t2, H);
        for (var R = 0; z4.__d && R++ < 25; )
          z4.__d = false, x3 && x3(t2), $2 = F2.call(z4, M2, H);
        z4.__d = true;
      }
      if (null != z4.getChildContext && (s3 = T2({}, s3, z4.getChildContext())), O3 && l.errorBoundaries && (F2.getDerivedStateFromError || z4.componentDidCatch)) {
        $2 = null != $2 && $2.type === b && null == $2.key && null == $2.props.tpl ? $2.props.children : $2;
        try {
          return U2($2, s3, u4, f4, t2, d3, v3);
        } catch (e2) {
          return F2.getDerivedStateFromError && (z4.__s = F2.getDerivedStateFromError(e2)), z4.componentDidCatch && z4.componentDidCatch(e2, A2), z4.__d ? ($2 = P2(t2, s3), null != (z4 = t2.__c).getChildContext && (s3 = T2({}, s3, z4.getChildContext())), U2($2 = null != $2 && $2.type === b && null == $2.key && null == $2.props.tpl ? $2.props.children : $2, s3, u4, f4, t2, d3, v3)) : j2;
        } finally {
          w3 && w3(t2), t2.__ = null, C2 && C2(t2);
        }
      }
    }
    $2 = null != $2 && $2.type === b && null == $2.key && null == $2.props.tpl ? $2.props.children : $2;
    try {
      var V2 = U2($2, s3, u4, f4, t2, d3, v3);
      return w3 && w3(t2), t2.__ = null, l.unmount && l.unmount(t2), V2;
    } catch (n2) {
      if (!d3 && v3 && v3.onError) {
        var K = v3.onError(n2, t2, function(e2) {
          return U2(e2, s3, u4, f4, t2, d3, v3);
        });
        if (void 0 !== K)
          return K;
        var G = l.__e;
        return G && G(n2, t2), j2;
      }
      if (!d3)
        throw n2;
      if (!n2 || "function" != typeof n2.then)
        throw n2;
      return n2.then(function e2() {
        try {
          return U2($2, s3, u4, f4, t2, d3, v3);
        } catch (n3) {
          if (!n3 || "function" != typeof n3.then)
            throw n3;
          return n3.then(function() {
            return U2($2, s3, u4, f4, t2, d3, v3);
          }, e2);
        }
      });
    }
  }
  var J, Q = "<" + F2, X = j2;
  for (var Y in M2) {
    var ee = M2[Y];
    if ("function" != typeof ee || "class" === Y || "className" === Y) {
      switch (Y) {
        case "children":
          J = ee;
          continue;
        case "key":
        case "ref":
        case "__self":
        case "__source":
          continue;
        case "htmlFor":
          if ("for" in M2)
            continue;
          Y = "for";
          break;
        case "className":
          if ("class" in M2)
            continue;
          Y = "class";
          break;
        case "defaultChecked":
          Y = "checked";
          break;
        case "defaultSelected":
          Y = "selected";
          break;
        case "defaultValue":
        case "value":
          switch (Y = "value", F2) {
            case "textarea":
              J = ee;
              continue;
            case "select":
              f4 = ee;
              continue;
            case "option":
              f4 != ee || "selected" in M2 || (Q += " selected");
          }
          break;
        case "dangerouslySetInnerHTML":
          X = ee && ee.__html;
          continue;
        case "style":
          "object" == typeof ee && (ee = h2(ee));
          break;
        case "acceptCharset":
          Y = "accept-charset";
          break;
        case "httpEquiv":
          Y = "http-equiv";
          break;
        default:
          if (o2.test(Y))
            Y = Y.replace(o2, "$1:$2").toLowerCase();
          else {
            if (r2.test(Y))
              continue;
            "-" !== Y[4] && !c2.has(Y) || null == ee ? u4 ? a3.test(Y) && (Y = "panose1" === Y ? "panose-1" : Y.replace(/([A-Z])/g, "-$1").toLowerCase()) : i2.test(Y) && (Y = Y.toLowerCase()) : ee += j2;
          }
      }
      null != ee && false !== ee && (Q = true === ee || ee === j2 ? Q + " " + Y : Q + " " + Y + '="' + ("string" == typeof ee ? l2(ee) : ee + j2) + '"');
    }
  }
  if (r2.test(F2))
    throw new Error(F2 + " is not a valid HTML tag name in " + Q + ">");
  if (X || ("string" == typeof J ? X = l2(J) : null != J && false !== J && true !== J && (X = U2(J, s3, "svg" === F2 || "foreignObject" !== F2 && u4, f4, t2, d3, v3))), w3 && w3(t2), t2.__ = null, C2 && C2(t2), !X && Z.has(F2))
    return Q + "/>";
  var te = "</" + F2 + ">", ne2 = Q + ">";
  return E2(X) ? [ne2].concat(X, [te]) : "string" != typeof X ? [ne2, X, te] : ne2 + X + te;
}
var Z = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f3 = 0;
var i3 = Array.isArray;
function u3(e2, t2, n2, o3, i4, u4) {
  t2 || (t2 = {});
  var a4, c3, l3 = t2;
  "ref" in t2 && (a4 = t2.ref, delete t2.ref);
  var p4 = { type: e2, props: l3, key: n2, ref: a4, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i4, __self: u4 };
  if ("function" == typeof e2 && (a4 = e2.defaultProps))
    for (c3 in a4)
      void 0 === l3[c3] && (l3[c3] = a4[c3]);
  return l.vnode && l.vnode(p4), p4;
}

// node_modules/@auth/core/lib/pages/error.js
function ErrorPage(props) {
  const { url, error = "default", theme } = props;
  const signinPageUrl = `${url}/signin`;
  const errors = {
    default: {
      status: 200,
      heading: "Error",
      message: u3("p", { children: u3("a", { className: "site", href: url?.origin, children: url?.host }) })
    },
    Configuration: {
      status: 500,
      heading: "Server error",
      message: u3("div", { children: [u3("p", { children: "There is a problem with the server configuration." }), u3("p", { children: "Check the server logs for more information." })] })
    },
    AccessDenied: {
      status: 403,
      heading: "Access Denied",
      message: u3("div", { children: [u3("p", { children: "You do not have permission to sign in." }), u3("p", { children: u3("a", { className: "button", href: signinPageUrl, children: "Sign in" }) })] })
    },
    Verification: {
      status: 403,
      heading: "Unable to sign in",
      message: u3("div", { children: [u3("p", { children: "The sign in link is no longer valid." }), u3("p", { children: "It may have been used already or it may have expired." })] }),
      signin: u3("a", { className: "button", href: signinPageUrl, children: "Sign in" })
    }
  };
  const { status, heading, message: message2, signin } = errors[error] ?? errors.default;
  return {
    status,
    html: u3("div", { className: "error", children: [theme?.brandColor && u3("style", { dangerouslySetInnerHTML: {
      __html: `
        :root {
          --brand-color: ${theme?.brandColor}
        }
      `
    } }), u3("div", { className: "card", children: [theme?.logo && u3("img", { src: theme?.logo, alt: "Logo", className: "logo" }), u3("h1", { children: heading }), u3("div", { className: "message", children: message2 }), signin] })] })
  };
}

// node_modules/@auth/core/lib/utils/webauthn-client.js
async function webauthnScript(authURL, providerID) {
  const WebAuthnBrowser = window.SimpleWebAuthnBrowser;
  async function fetchOptions(action) {
    const url = new URL(`${authURL}/webauthn-options/${providerID}`);
    if (action)
      url.searchParams.append("action", action);
    const formFields = getFormFields();
    formFields.forEach((field) => {
      url.searchParams.append(field.name, field.value);
    });
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to fetch options", res);
      return;
    }
    return res.json();
  }
  function getForm() {
    const formID = `#${providerID}-form`;
    const form = document.querySelector(formID);
    if (!form)
      throw new Error(`Form '${formID}' not found`);
    return form;
  }
  function getFormFields() {
    const form = getForm();
    const formFields = Array.from(form.querySelectorAll("input[data-form-field]"));
    return formFields;
  }
  async function submitForm(action, data) {
    const form = getForm();
    if (action) {
      const actionInput = document.createElement("input");
      actionInput.type = "hidden";
      actionInput.name = "action";
      actionInput.value = action;
      form.appendChild(actionInput);
    }
    if (data) {
      const dataInput = document.createElement("input");
      dataInput.type = "hidden";
      dataInput.name = "data";
      dataInput.value = JSON.stringify(data);
      form.appendChild(dataInput);
    }
    return form.submit();
  }
  async function authenticationFlow(options, autofill) {
    const authResp = await WebAuthnBrowser.startAuthentication(options, autofill);
    return await submitForm("authenticate", authResp);
  }
  async function registrationFlow(options) {
    const formFields = getFormFields();
    formFields.forEach((field) => {
      if (field.required && !field.value) {
        throw new Error(`Missing required field: ${field.name}`);
      }
    });
    const regResp = await WebAuthnBrowser.startRegistration(options);
    return await submitForm("register", regResp);
  }
  async function autofillAuthentication() {
    if (!WebAuthnBrowser.browserSupportsWebAuthnAutofill())
      return;
    const res = await fetchOptions("authenticate");
    if (!res) {
      console.error("Failed to fetch option for autofill authentication");
      return;
    }
    try {
      await authenticationFlow(res.options, true);
    } catch (e2) {
      console.error(e2);
    }
  }
  async function setupForm() {
    const form = getForm();
    if (!WebAuthnBrowser.browserSupportsWebAuthn()) {
      form.style.display = "none";
      return;
    }
    if (form) {
      form.addEventListener("submit", async (e2) => {
        e2.preventDefault();
        const res = await fetchOptions(void 0);
        if (!res) {
          console.error("Failed to fetch options for form submission");
          return;
        }
        if (res.action === "authenticate") {
          try {
            await authenticationFlow(res.options, false);
          } catch (e3) {
            console.error(e3);
          }
        } else if (res.action === "register") {
          try {
            await registrationFlow(res.options);
          } catch (e3) {
            console.error(e3);
          }
        }
      });
    }
  }
  setupForm();
  autofillAuthentication();
}

// node_modules/@auth/core/lib/pages/signin.js
var signinErrors = {
  default: "Unable to sign in.",
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallbackError: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page."
};
function ConditionalUIScript(providerID) {
  const startConditionalUIScript = `
const currentURL = window.location.href;
const authURL = currentURL.substring(0, currentURL.lastIndexOf('/'));
(${webauthnScript})(authURL, "${providerID}");
`;
  return u3(b, { children: u3("script", { dangerouslySetInnerHTML: { __html: startConditionalUIScript } }) });
}
function SigninPage(props) {
  const { csrfToken, providers = [], callbackUrl, theme, email, error: errorType } = props;
  if (typeof document !== "undefined" && theme?.brandColor) {
    document.documentElement.style.setProperty("--brand-color", theme.brandColor);
  }
  if (typeof document !== "undefined" && theme?.buttonText) {
    document.documentElement.style.setProperty("--button-text-color", theme.buttonText);
  }
  const error = errorType && (signinErrors[errorType] ?? signinErrors.default);
  const providerLogoPath = "https://authjs.dev/img/providers";
  const conditionalUIProviderID = providers.find((provider) => provider.type === "webauthn" && provider.enableConditionalUI)?.id;
  return u3("div", { className: "signin", children: [theme?.brandColor && u3("style", { dangerouslySetInnerHTML: {
    __html: `:root {--brand-color: ${theme.brandColor}}`
  } }), theme?.buttonText && u3("style", { dangerouslySetInnerHTML: {
    __html: `
        :root {
          --button-text-color: ${theme.buttonText}
        }
      `
  } }), u3("div", { className: "card", children: [error && u3("div", { className: "error", children: u3("p", { children: error }) }), theme?.logo && u3("img", { src: theme.logo, alt: "Logo", className: "logo" }), providers.map((provider, i4) => {
    let bg, brandColor, logo;
    if (provider.type === "oauth" || provider.type === "oidc") {
      ;
      ({
        bg = "#fff",
        brandColor,
        logo = `${providerLogoPath}/${provider.id}.svg`
      } = provider.style ?? {});
    }
    const color = brandColor ?? bg ?? "#fff";
    return u3("div", { className: "provider", children: [provider.type === "oauth" || provider.type === "oidc" ? u3("form", { action: provider.signinUrl, method: "POST", children: [u3("input", { type: "hidden", name: "csrfToken", value: csrfToken }), callbackUrl && u3("input", { type: "hidden", name: "callbackUrl", value: callbackUrl }), u3("button", { type: "submit", className: "button", style: {
      "--provider-bg": "#fff",
      "--provider-bg-hover": `color-mix(in srgb, ${color} 30%, #fff)`,
      "--provider-dark-bg": "#161b22",
      "--provider-dark-bg-hover": `color-mix(in srgb, ${color} 30%, #000)`
    }, tabIndex: 0, children: [u3("span", { style: {
      filter: "invert(1) grayscale(1) brightness(1.3) contrast(9000)",
      "mix-blend-mode": "luminosity",
      opacity: 0.95
    }, children: ["Sign in with ", provider.name] }), logo && u3("img", { loading: "lazy", height: 24, src: logo })] })] }) : null, (provider.type === "email" || provider.type === "credentials" || provider.type === "webauthn") && i4 > 0 && providers[i4 - 1].type !== "email" && providers[i4 - 1].type !== "credentials" && providers[i4 - 1].type !== "webauthn" && u3("hr", {}), provider.type === "email" && u3("form", { action: provider.signinUrl, method: "POST", children: [u3("input", { type: "hidden", name: "csrfToken", value: csrfToken }), u3("label", { className: "section-header", htmlFor: `input-email-for-${provider.id}-provider`, children: "Email" }), u3("input", { id: `input-email-for-${provider.id}-provider`, autoFocus: true, type: "email", name: "email", value: email, placeholder: "email@example.com", required: true }), u3("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", provider.name] })] }), provider.type === "credentials" && u3("form", { action: provider.callbackUrl, method: "POST", children: [u3("input", { type: "hidden", name: "csrfToken", value: csrfToken }), Object.keys(provider.credentials).map((credential) => {
      return u3("div", { children: [u3("label", { className: "section-header", htmlFor: `input-${credential}-for-${provider.id}-provider`, children: provider.credentials[credential].label ?? credential }), u3("input", { name: credential, id: `input-${credential}-for-${provider.id}-provider`, type: provider.credentials[credential].type ?? "text", placeholder: provider.credentials[credential].placeholder ?? "", ...provider.credentials[credential] })] }, `input-group-${provider.id}`);
    }), u3("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", provider.name] })] }), provider.type === "webauthn" && u3("form", { action: provider.callbackUrl, method: "POST", id: `${provider.id}-form`, children: [u3("input", { type: "hidden", name: "csrfToken", value: csrfToken }), Object.keys(provider.formFields).map((field) => {
      return u3("div", { children: [u3("label", { className: "section-header", htmlFor: `input-${field}-for-${provider.id}-provider`, children: provider.formFields[field].label ?? field }), u3("input", { name: field, "data-form-field": true, id: `input-${field}-for-${provider.id}-provider`, type: provider.formFields[field].type ?? "text", placeholder: provider.formFields[field].placeholder ?? "", ...provider.formFields[field] })] }, `input-group-${provider.id}`);
    }), u3("button", { id: `submitButton-${provider.id}`, type: "submit", tabIndex: 0, children: ["Sign in with ", provider.name] })] }), (provider.type === "email" || provider.type === "credentials" || provider.type === "webauthn") && i4 + 1 < providers.length && u3("hr", {})] }, provider.id);
  })] }), conditionalUIProviderID && ConditionalUIScript(conditionalUIProviderID)] });
}

// node_modules/@auth/core/lib/pages/signout.js
function SignoutPage(props) {
  const { url, csrfToken, theme } = props;
  return u3("div", { className: "signout", children: [theme?.brandColor && u3("style", { dangerouslySetInnerHTML: {
    __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      `
  } }), theme?.buttonText && u3("style", { dangerouslySetInnerHTML: {
    __html: `
        :root {
          --button-text-color: ${theme.buttonText}
        }
      `
  } }), u3("div", { className: "card", children: [theme?.logo && u3("img", { src: theme.logo, alt: "Logo", className: "logo" }), u3("h1", { children: "Signout" }), u3("p", { children: "Are you sure you want to sign out?" }), u3("form", { action: url?.toString(), method: "POST", children: [u3("input", { type: "hidden", name: "csrfToken", value: csrfToken }), u3("button", { id: "submitButton", type: "submit", children: "Sign out" })] })] })] });
}

// node_modules/@auth/core/lib/pages/styles.js
var styles_default = `:root {
  --border-width: 1px;
  --border-radius: 0.5rem;
  --color-error: #c94b4b;
  --color-info: #157efb;
  --color-info-hover: #0f6ddb;
  --color-info-text: #fff;
}

.__next-auth-theme-auto,
.__next-auth-theme-light {
  --color-background: #ececec;
  --color-background-hover: rgba(236, 236, 236, 0.8);
  --color-background-card: #fff;
  --color-text: #000;
  --color-primary: #444;
  --color-control-border: #bbb;
  --color-button-active-background: #f9f9f9;
  --color-button-active-border: #aaa;
  --color-separator: #ccc;
}

.__next-auth-theme-dark {
  --color-background: #161b22;
  --color-background-hover: rgba(22, 27, 34, 0.8);
  --color-background-card: #0d1117;
  --color-text: #fff;
  --color-primary: #ccc;
  --color-control-border: #555;
  --color-button-active-background: #060606;
  --color-button-active-border: #666;
  --color-separator: #444;
}

@media (prefers-color-scheme: dark) {
  .__next-auth-theme-auto {
    --color-background: #161b22;
    --color-background-hover: rgba(22, 27, 34, 0.8);
    --color-background-card: #0d1117;
    --color-text: #fff;
    --color-primary: #ccc;
    --color-control-border: #555;
    --color-button-active-background: #060606;
    --color-button-active-border: #666;
    --color-separator: #444;
  }

  button,
  a.button {
    color: var(--provider-dark-color, var(--color-primary)) !important;
    background-color: var(
      --provider-dark-bg,
      var(--color-background)
    ) !important;
  }

    :is(button,a.button):hover {
      background-color: var(
        --provider-dark-bg-hover,
        var(--color-background-hover)
      ) !important;
    }

    :is(button,a.button) span {
      color: var(--provider-dark-bg) !important;
    }
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
}

h1 {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  font-weight: 400;
  color: var(--color-text);
}

p {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  color: var(--color-text);
}

form {
  margin: 0;
  padding: 0;
}

label {
  font-weight: 500;
  text-align: left;
  margin-bottom: 0.25rem;
  display: block;
  color: var(--color-text);
}

input[type] {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: var(--border-width) solid var(--color-control-border);
  background: var(--color-background-card);
  font-size: 1rem;
  border-radius: var(--border-radius);
  color: var(--color-text);
}

p {
  font-size: 1.1rem;
  line-height: 2rem;
}

a.button {
  text-decoration: none;
  line-height: 1rem;
}

a.button:link,
  a.button:visited {
    background-color: var(--color-background);
    color: var(--color-primary);
  }

button,
a.button {
  padding: 0.75rem 1rem;
  color: var(--provider-color, var(--color-primary));
  background-color: var(--provider-bg, var(--color-background));
  border: 1px solid #00000031;
  font-size: 0.9rem;
  height: 50px;
  border-radius: var(--border-radius);
  transition: background-color 250ms ease-in-out;
  font-weight: 300;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:is(button,a.button):hover {
    background-color: var(--provider-bg-hover, var(--color-background-hover));
    cursor: pointer;
  }

:is(button,a.button):active {
    cursor: pointer;
  }

:is(button,a.button) span {
    color: #fff;
  }

#submitButton {
  color: var(--button-text-color, var(--color-info-text));
  background-color: var(--brand-color, var(--color-info));
  width: 100%;
}

#submitButton:hover {
    background-color: var(
      --button-hover-bg,
      var(--color-info-hover)
    ) !important;
  }

a.site {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 1rem;
  line-height: 2rem;
}

a.site:hover {
    text-decoration: underline;
  }

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page > div {
    text-align: center;
  }

.error a.button {
    padding-left: 2rem;
    padding-right: 2rem;
    margin-top: 0.5rem;
  }

.error .message {
    margin-bottom: 1.5rem;
  }

.signin input[type="text"] {
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

.signin hr {
    display: block;
    border: 0;
    border-top: 1px solid var(--color-separator);
    margin: 2rem auto 1rem auto;
    overflow: visible;
  }

.signin hr::before {
      content: "or";
      background: var(--color-background-card);
      color: #888;
      padding: 0 0.4rem;
      position: relative;
      top: -0.7rem;
    }

.signin .error {
    background: #f5f5f5;
    font-weight: 500;
    border-radius: 0.3rem;
    background: var(--color-error);
  }

.signin .error p {
      text-align: left;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      line-height: 1.2rem;
      color: var(--color-info-text);
    }

.signin > div,
  .signin form {
    display: block;
  }

.signin > div input[type], .signin form input[type] {
      margin-bottom: 0.5rem;
    }

.signin > div button, .signin form button {
      width: 100%;
    }

.signin .provider + .provider {
    margin-top: 1rem;
  }

.logo {
  display: inline-block;
  max-width: 150px;
  margin: 1.25rem 0;
  max-height: 70px;
}

.card {
  background-color: var(--color-background-card);
  border-radius: 1rem;
  padding: 1.25rem 2rem;
}

.card .header {
    color: var(--color-primary);
  }

.card input[type]::-moz-placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type]::placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type] {
    background: color-mix(in srgb, var(--color-background-card) 95%, black);
  }

.section-header {
  color: var(--color-text);
}

@media screen and (min-width: 450px) {
  .card {
    margin: 2rem 0;
    width: 368px;
  }
}

@media screen and (max-width: 450px) {
  .card {
    margin: 1rem 0;
    width: 343px;
  }
}
`;

// node_modules/@auth/core/lib/pages/verify-request.js
function VerifyRequestPage(props) {
  const { url, theme } = props;
  return u3("div", { className: "verify-request", children: [theme.brandColor && u3("style", { dangerouslySetInnerHTML: {
    __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      `
  } }), u3("div", { className: "card", children: [theme.logo && u3("img", { src: theme.logo, alt: "Logo", className: "logo" }), u3("h1", { children: "Check your email" }), u3("p", { children: "A sign in link has been sent to your email address." }), u3("p", { children: u3("a", { className: "site", href: url.origin, children: url.host }) })] })] });
}

// node_modules/@auth/core/lib/pages/index.js
function send({ html, title, status, cookies, theme, headTags }) {
  return {
    cookies,
    status,
    headers: { "Content-Type": "text/html" },
    body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${styles_default}</style><title>${title}</title>${headTags ?? ""}</head><body class="__next-auth-theme-${theme?.colorScheme ?? "auto"}"><div class="page">${D(html)}</div></body></html>`
  };
}
function renderPage(params) {
  const { url, theme, query, cookies, pages, providers } = params;
  return {
    csrf(skip, options, cookies2) {
      if (!skip) {
        return {
          headers: { "Content-Type": "application/json" },
          body: { csrfToken: options.csrfToken },
          cookies: cookies2
        };
      }
      options.logger.warn("csrf-disabled");
      cookies2.push({
        name: options.cookies.csrfToken.name,
        value: "",
        options: { ...options.cookies.csrfToken.options, maxAge: 0 }
      });
      return { status: 404, cookies: cookies2 };
    },
    providers(providers2) {
      return {
        headers: { "Content-Type": "application/json" },
        body: providers2.reduce((acc, { id, name, type, signinUrl, callbackUrl }) => {
          acc[id] = { id, name, type, signinUrl, callbackUrl };
          return acc;
        }, {})
      };
    },
    signin(providerId, error) {
      if (providerId)
        throw new UnknownAction("Unsupported action");
      if (pages?.signIn) {
        let signinUrl = `${pages.signIn}${pages.signIn.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: params.callbackUrl ?? "/" })}`;
        if (error)
          signinUrl = `${signinUrl}&${new URLSearchParams({ error })}`;
        return { redirect: signinUrl, cookies };
      }
      const webauthnProvider = providers?.find((p4) => p4.type === "webauthn" && p4.enableConditionalUI && !!p4.simpleWebAuthnBrowserVersion);
      let simpleWebAuthnBrowserScript = "";
      if (webauthnProvider) {
        const { simpleWebAuthnBrowserVersion } = webauthnProvider;
        simpleWebAuthnBrowserScript = `<script src="https://unpkg.com/@simplewebauthn/browser@${simpleWebAuthnBrowserVersion}/dist/bundle/index.umd.min.js" crossorigin="anonymous"><\/script>`;
      }
      return send({
        cookies,
        theme,
        html: SigninPage({
          csrfToken: params.csrfToken,
          // We only want to render providers
          providers: params.providers?.filter((provider) => (
            // Always render oauth and email type providers
            ["email", "oauth", "oidc"].includes(provider.type) || // Only render credentials type provider if credentials are defined
            provider.type === "credentials" && provider.credentials || // Only render webauthn type provider if formFields are defined
            provider.type === "webauthn" && provider.formFields || // Don't render other provider types
            false
          )),
          callbackUrl: params.callbackUrl,
          theme: params.theme,
          error,
          ...query
        }),
        title: "Sign In",
        headTags: simpleWebAuthnBrowserScript
      });
    },
    signout() {
      if (pages?.signOut)
        return { redirect: pages.signOut, cookies };
      return send({
        cookies,
        theme,
        html: SignoutPage({ csrfToken: params.csrfToken, url, theme }),
        title: "Sign Out"
      });
    },
    verifyRequest(props) {
      if (pages?.verifyRequest)
        return {
          redirect: `${pages.verifyRequest}${url?.search ?? ""}`,
          cookies
        };
      return send({
        cookies,
        theme,
        html: VerifyRequestPage({ url, theme, ...props }),
        title: "Verify Request"
      });
    },
    error(error) {
      if (pages?.error) {
        return {
          redirect: `${pages.error}${pages.error.includes("?") ? "&" : "?"}error=${error}`,
          cookies
        };
      }
      return send({
        cookies,
        theme,
        // @ts-expect-error fix error type
        ...ErrorPage({ url, theme, error }),
        title: "Error"
      });
    }
  };
}

// node_modules/@auth/core/lib/utils/date.js
function fromDate(time2, date2 = Date.now()) {
  return new Date(date2 + time2 * 1e3);
}

// node_modules/@auth/core/lib/actions/callback/handle-login.js
async function handleLoginOrRegister(sessionToken, _profile, _account, options) {
  if (!_account?.providerAccountId || !_account.type)
    throw new Error("Missing or invalid provider account");
  if (!["email", "oauth", "oidc", "webauthn"].includes(_account.type))
    throw new Error("Provider not supported");
  const { adapter, jwt, events, session: { strategy: sessionStrategy, generateSessionToken } } = options;
  if (!adapter) {
    return { user: _profile, account: _account };
  }
  const profile = _profile;
  let account = _account;
  const { createUser: createUser2, updateUser, getUser, getUserByAccount, getUserByEmail, linkAccount, createSession, getSessionAndUser, deleteSession } = adapter;
  let session2 = null;
  let user = null;
  let isNewUser = false;
  const useJwtSession = sessionStrategy === "jwt";
  if (sessionToken) {
    if (useJwtSession) {
      try {
        const salt = options.cookies.sessionToken.name;
        session2 = await jwt.decode({ ...jwt, token: sessionToken, salt });
        if (session2 && "sub" in session2 && session2.sub) {
          user = await getUser(session2.sub);
        }
      } catch {
      }
    } else {
      const userAndSession = await getSessionAndUser(sessionToken);
      if (userAndSession) {
        session2 = userAndSession.session;
        user = userAndSession.user;
      }
    }
  }
  if (account.type === "email") {
    const userByEmail = await getUserByEmail(profile.email);
    if (userByEmail) {
      if (user?.id !== userByEmail.id && !useJwtSession && sessionToken) {
        await deleteSession(sessionToken);
      }
      user = await updateUser({
        id: userByEmail.id,
        emailVerified: /* @__PURE__ */ new Date()
      });
      await events.updateUser?.({ user });
    } else {
      user = await createUser2({ ...profile, emailVerified: /* @__PURE__ */ new Date() });
      await events.createUser?.({ user });
      isNewUser = true;
    }
    session2 = useJwtSession ? {} : await createSession({
      sessionToken: generateSessionToken(),
      userId: user.id,
      expires: fromDate(options.session.maxAge)
    });
    return { session: session2, user, isNewUser };
  } else if (account.type === "webauthn") {
    const userByAccount2 = await getUserByAccount({
      providerAccountId: account.providerAccountId,
      provider: account.provider
    });
    if (userByAccount2) {
      if (user) {
        if (userByAccount2.id === user.id) {
          const currentAccount2 = { ...account, userId: user.id };
          return { session: session2, user, isNewUser, account: currentAccount2 };
        }
        throw new AccountNotLinked("The account is already associated with another user", { provider: account.provider });
      }
      session2 = useJwtSession ? {} : await createSession({
        sessionToken: generateSessionToken(),
        userId: userByAccount2.id,
        expires: fromDate(options.session.maxAge)
      });
      const currentAccount = {
        ...account,
        userId: userByAccount2.id
      };
      return {
        session: session2,
        user: userByAccount2,
        isNewUser,
        account: currentAccount
      };
    } else {
      if (user) {
        await linkAccount({ ...account, userId: user.id });
        await events.linkAccount?.({ user, account, profile });
        const currentAccount2 = { ...account, userId: user.id };
        return { session: session2, user, isNewUser, account: currentAccount2 };
      }
      const userByEmail = profile.email ? await getUserByEmail(profile.email) : null;
      if (userByEmail) {
        throw new AccountNotLinked("Another account already exists with the same e-mail address", { provider: account.provider });
      } else {
        user = await createUser2({ ...profile });
      }
      await events.createUser?.({ user });
      await linkAccount({ ...account, userId: user.id });
      await events.linkAccount?.({ user, account, profile });
      session2 = useJwtSession ? {} : await createSession({
        sessionToken: generateSessionToken(),
        userId: user.id,
        expires: fromDate(options.session.maxAge)
      });
      const currentAccount = { ...account, userId: user.id };
      return { session: session2, user, isNewUser: true, account: currentAccount };
    }
  }
  const userByAccount = await getUserByAccount({
    providerAccountId: account.providerAccountId,
    provider: account.provider
  });
  if (userByAccount) {
    if (user) {
      if (userByAccount.id === user.id) {
        return { session: session2, user, isNewUser };
      }
      throw new OAuthAccountNotLinked("The account is already associated with another user", { provider: account.provider });
    }
    session2 = useJwtSession ? {} : await createSession({
      sessionToken: generateSessionToken(),
      userId: userByAccount.id,
      expires: fromDate(options.session.maxAge)
    });
    return { session: session2, user: userByAccount, isNewUser };
  } else {
    const { provider: p4 } = options;
    const { type, provider, providerAccountId, userId, ...tokenSet } = account;
    const defaults = { providerAccountId, provider, type, userId };
    account = Object.assign(p4.account(tokenSet) ?? {}, defaults);
    if (user) {
      await linkAccount({ ...account, userId: user.id });
      await events.linkAccount?.({ user, account, profile });
      return { session: session2, user, isNewUser };
    }
    const userByEmail = profile.email ? await getUserByEmail(profile.email) : null;
    if (userByEmail) {
      const provider2 = options.provider;
      if (provider2?.allowDangerousEmailAccountLinking) {
        user = userByEmail;
        isNewUser = false;
      } else {
        throw new OAuthAccountNotLinked("Another account already exists with the same e-mail address", { provider: account.provider });
      }
    } else {
      user = await createUser2({ ...profile, emailVerified: null });
      isNewUser = true;
    }
    await events.createUser?.({ user });
    await linkAccount({ ...account, userId: user.id });
    await events.linkAccount?.({ user, account, profile });
    session2 = useJwtSession ? {} : await createSession({
      sessionToken: generateSessionToken(),
      userId: user.id,
      expires: fromDate(options.session.maxAge)
    });
    return { session: session2, user, isNewUser };
  }
}

// node_modules/oauth4webapi/build/index.js
var USER_AGENT;
if (typeof navigator === "undefined" || !"Cloudflare-Workers"?.startsWith?.("Mozilla/5.0 ")) {
  const NAME = "oauth4webapi";
  const VERSION = "v3.1.4";
  USER_AGENT = `${NAME}/${VERSION}`;
}
function looseInstanceOf(input, expected) {
  if (input == null) {
    return false;
  }
  try {
    return input instanceof expected || Object.getPrototypeOf(input)[Symbol.toStringTag] === expected.prototype[Symbol.toStringTag];
  } catch {
    return false;
  }
}
var ERR_INVALID_ARG_VALUE = "ERR_INVALID_ARG_VALUE";
var ERR_INVALID_ARG_TYPE = "ERR_INVALID_ARG_TYPE";
function CodedTypeError(message2, code, cause) {
  const err = new TypeError(message2, { cause });
  Object.assign(err, { code });
  return err;
}
var allowInsecureRequests = Symbol();
var clockSkew = Symbol();
var clockTolerance = Symbol();
var customFetch2 = Symbol();
var modifyAssertion = Symbol();
var jweDecrypt = Symbol();
var jwksCache = Symbol();
var encoder2 = new TextEncoder();
var decoder2 = new TextDecoder();
function buf(input) {
  if (typeof input === "string") {
    return encoder2.encode(input);
  }
  return decoder2.decode(input);
}
var CHUNK_SIZE2 = 32768;
function encodeBase64Url(input) {
  if (input instanceof ArrayBuffer) {
    input = new Uint8Array(input);
  }
  const arr = [];
  for (let i4 = 0; i4 < input.byteLength; i4 += CHUNK_SIZE2) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i4, i4 + CHUNK_SIZE2)));
  }
  return btoa(arr.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function decodeBase64Url(input) {
  try {
    const binary = atob(input.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i4 = 0; i4 < binary.length; i4++) {
      bytes[i4] = binary.charCodeAt(i4);
    }
    return bytes;
  } catch (cause) {
    throw CodedTypeError("The input to be decoded is not correctly encoded.", ERR_INVALID_ARG_VALUE, cause);
  }
}
function b64u(input) {
  if (typeof input === "string") {
    return decodeBase64Url(input);
  }
  return encodeBase64Url(input);
}
var UnsupportedOperationError = class extends Error {
  code;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = UNSUPPORTED_OPERATION;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var OperationProcessingError = class extends Error {
  code;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    if (options?.code) {
      this.code = options?.code;
    }
    Error.captureStackTrace?.(this, this.constructor);
  }
};
function OPE(message2, code, cause) {
  return new OperationProcessingError(message2, { code, cause });
}
function assertCryptoKey(key, it) {
  if (!(key instanceof CryptoKey)) {
    throw CodedTypeError(`${it} must be a CryptoKey`, ERR_INVALID_ARG_TYPE);
  }
}
function assertPrivateKey(key, it) {
  assertCryptoKey(key, it);
  if (key.type !== "private") {
    throw CodedTypeError(`${it} must be a private CryptoKey`, ERR_INVALID_ARG_VALUE);
  }
}
function isJsonObject(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return false;
  }
  return true;
}
function prepareHeaders(input) {
  if (looseInstanceOf(input, Headers)) {
    input = Object.fromEntries(input.entries());
  }
  const headers = new Headers(input);
  if (USER_AGENT && !headers.has("user-agent")) {
    headers.set("user-agent", USER_AGENT);
  }
  if (headers.has("authorization")) {
    throw CodedTypeError('"options.headers" must not include the "authorization" header name', ERR_INVALID_ARG_VALUE);
  }
  if (headers.has("dpop")) {
    throw CodedTypeError('"options.headers" must not include the "dpop" header name', ERR_INVALID_ARG_VALUE);
  }
  return headers;
}
function signal(value) {
  if (typeof value === "function") {
    value = value();
  }
  if (!(value instanceof AbortSignal)) {
    throw CodedTypeError('"options.signal" must return or be an instance of AbortSignal', ERR_INVALID_ARG_TYPE);
  }
  return value;
}
async function discoveryRequest(issuerIdentifier, options) {
  if (!(issuerIdentifier instanceof URL)) {
    throw CodedTypeError('"issuerIdentifier" must be an instance of URL', ERR_INVALID_ARG_TYPE);
  }
  checkProtocol(issuerIdentifier, options?.[allowInsecureRequests] !== true);
  const url = new URL(issuerIdentifier.href);
  switch (options?.algorithm) {
    case void 0:
    case "oidc":
      url.pathname = `${url.pathname}/.well-known/openid-configuration`.replace("//", "/");
      break;
    case "oauth2":
      if (url.pathname === "/") {
        url.pathname = ".well-known/oauth-authorization-server";
      } else {
        url.pathname = `.well-known/oauth-authorization-server/${url.pathname}`.replace("//", "/");
      }
      break;
    default:
      throw CodedTypeError('"options.algorithm" must be "oidc" (default), or "oauth2"', ERR_INVALID_ARG_VALUE);
  }
  const headers = prepareHeaders(options?.headers);
  headers.set("accept", "application/json");
  return (options?.[customFetch2] || fetch)(url.href, {
    body: void 0,
    headers: Object.fromEntries(headers.entries()),
    method: "GET",
    redirect: "manual",
    signal: options?.signal ? signal(options.signal) : void 0
  });
}
function assertNumber(input, allow0, it, code, cause) {
  try {
    if (typeof input !== "number" || !Number.isFinite(input)) {
      throw CodedTypeError(`${it} must be a number`, ERR_INVALID_ARG_TYPE, cause);
    }
    if (input > 0)
      return;
    if (allow0 && input !== 0) {
      throw CodedTypeError(`${it} must be a non-negative number`, ERR_INVALID_ARG_VALUE, cause);
    }
    throw CodedTypeError(`${it} must be a positive number`, ERR_INVALID_ARG_VALUE, cause);
  } catch (err) {
    if (code) {
      throw OPE(err.message, code, cause);
    }
    throw err;
  }
}
function assertString(input, it, code, cause) {
  try {
    if (typeof input !== "string") {
      throw CodedTypeError(`${it} must be a string`, ERR_INVALID_ARG_TYPE, cause);
    }
    if (input.length === 0) {
      throw CodedTypeError(`${it} must not be empty`, ERR_INVALID_ARG_VALUE, cause);
    }
  } catch (err) {
    if (code) {
      throw OPE(err.message, code, cause);
    }
    throw err;
  }
}
async function processDiscoveryResponse(expectedIssuerIdentifier, response) {
  if (!(expectedIssuerIdentifier instanceof URL) && expectedIssuerIdentifier !== _nodiscoverycheck) {
    throw CodedTypeError('"expectedIssuer" must be an instance of URL', ERR_INVALID_ARG_TYPE);
  }
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE);
  }
  if (response.status !== 200) {
    throw OPE('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', RESPONSE_IS_NOT_CONFORM, response);
  }
  assertReadableResponse(response);
  assertApplicationJson(response);
  let json2;
  try {
    json2 = await response.json();
  } catch (cause) {
    throw OPE('failed to parse "response" body as JSON', PARSE_ERROR, cause);
  }
  if (!isJsonObject(json2)) {
    throw OPE('"response" body must be a top level object', INVALID_RESPONSE, { body: json2 });
  }
  assertString(json2.issuer, '"response" body "issuer" property', INVALID_RESPONSE, { body: json2 });
  if (new URL(json2.issuer).href !== expectedIssuerIdentifier.href && expectedIssuerIdentifier !== _nodiscoverycheck) {
    throw OPE('"response" body "issuer" property does not match the expected value', JSON_ATTRIBUTE_COMPARISON, { expected: expectedIssuerIdentifier.href, body: json2, attribute: "issuer" });
  }
  return json2;
}
function assertApplicationJson(response) {
  assertContentType(response, "application/json");
}
function notJson(response, ...types2) {
  let msg = '"response" content-type must be ';
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `${types2.join(", ")}, or ${last}`;
  } else if (types2.length === 2) {
    msg += `${types2[0]} or ${types2[1]}`;
  } else {
    msg += types2[0];
  }
  return OPE(msg, RESPONSE_IS_NOT_JSON, response);
}
function assertContentType(response, contentType) {
  if (getContentType(response) !== contentType) {
    throw notJson(response, contentType);
  }
}
function randomBytes() {
  return b64u(crypto.getRandomValues(new Uint8Array(32)));
}
function generateRandomCodeVerifier() {
  return randomBytes();
}
function generateRandomState() {
  return randomBytes();
}
function generateRandomNonce() {
  return randomBytes();
}
async function calculatePKCECodeChallenge(codeVerifier) {
  assertString(codeVerifier, "codeVerifier");
  return b64u(await crypto.subtle.digest("SHA-256", buf(codeVerifier)));
}
function getKeyAndKid(input) {
  if (input instanceof CryptoKey) {
    return { key: input };
  }
  if (!(input?.key instanceof CryptoKey)) {
    return {};
  }
  if (input.kid !== void 0) {
    assertString(input.kid, '"kid"');
  }
  return {
    key: input.key,
    kid: input.kid
  };
}
function psAlg(key) {
  switch (key.algorithm.hash.name) {
    case "SHA-256":
      return "PS256";
    case "SHA-384":
      return "PS384";
    case "SHA-512":
      return "PS512";
    default:
      throw new UnsupportedOperationError("unsupported RsaHashedKeyAlgorithm hash name", {
        cause: key
      });
  }
}
function rsAlg(key) {
  switch (key.algorithm.hash.name) {
    case "SHA-256":
      return "RS256";
    case "SHA-384":
      return "RS384";
    case "SHA-512":
      return "RS512";
    default:
      throw new UnsupportedOperationError("unsupported RsaHashedKeyAlgorithm hash name", {
        cause: key
      });
  }
}
function esAlg(key) {
  switch (key.algorithm.namedCurve) {
    case "P-256":
      return "ES256";
    case "P-384":
      return "ES384";
    case "P-521":
      return "ES512";
    default:
      throw new UnsupportedOperationError("unsupported EcKeyAlgorithm namedCurve", { cause: key });
  }
}
function keyToJws(key) {
  switch (key.algorithm.name) {
    case "RSA-PSS":
      return psAlg(key);
    case "RSASSA-PKCS1-v1_5":
      return rsAlg(key);
    case "ECDSA":
      return esAlg(key);
    case "Ed25519":
    case "EdDSA":
      return "Ed25519";
    default:
      throw new UnsupportedOperationError("unsupported CryptoKey algorithm name", { cause: key });
  }
}
function getClockSkew(client) {
  const skew = client?.[clockSkew];
  return typeof skew === "number" && Number.isFinite(skew) ? skew : 0;
}
function getClockTolerance(client) {
  const tolerance = client?.[clockTolerance];
  return typeof tolerance === "number" && Number.isFinite(tolerance) && Math.sign(tolerance) !== -1 ? tolerance : 30;
}
function epochTime() {
  return Math.floor(Date.now() / 1e3);
}
function assertAs(as) {
  if (typeof as !== "object" || as === null) {
    throw CodedTypeError('"as" must be an object', ERR_INVALID_ARG_TYPE);
  }
  assertString(as.issuer, '"as.issuer"');
}
function assertClient(client) {
  if (typeof client !== "object" || client === null) {
    throw CodedTypeError('"client" must be an object', ERR_INVALID_ARG_TYPE);
  }
  assertString(client.client_id, '"client.client_id"');
}
function ClientSecretPost(clientSecret) {
  assertString(clientSecret, '"clientSecret"');
  return (_as, client, body, _headers) => {
    body.set("client_id", client.client_id);
    body.set("client_secret", clientSecret);
  };
}
function clientAssertionPayload(as, client) {
  const now2 = epochTime() + getClockSkew(client);
  return {
    jti: randomBytes(),
    aud: as.issuer,
    exp: now2 + 60,
    iat: now2,
    nbf: now2,
    iss: client.client_id,
    sub: client.client_id
  };
}
function PrivateKeyJwt(clientPrivateKey, options) {
  const { key, kid } = getKeyAndKid(clientPrivateKey);
  assertPrivateKey(key, '"clientPrivateKey.key"');
  return async (as, client, body, _headers) => {
    const header = { alg: keyToJws(key), kid };
    const payload = clientAssertionPayload(as, client);
    options?.[modifyAssertion]?.(header, payload);
    body.set("client_id", client.client_id);
    body.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
    body.set("client_assertion", await signJwt(header, payload, key));
  };
}
function ClientSecretJwt(clientSecret, options) {
  assertString(clientSecret, '"clientSecret"');
  const modify = options?.[modifyAssertion];
  let key;
  return async (as, client, body, _headers) => {
    key ||= await crypto.subtle.importKey("raw", buf(clientSecret), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
    const header = { alg: "HS256" };
    const payload = clientAssertionPayload(as, client);
    modify?.(header, payload);
    const data = `${b64u(buf(JSON.stringify(header)))}.${b64u(buf(JSON.stringify(payload)))}`;
    const hmac = await crypto.subtle.sign(key.algorithm, key, buf(data));
    body.set("client_id", client.client_id);
    body.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
    body.set("client_assertion", `${data}.${b64u(new Uint8Array(hmac))}`);
  };
}
function None() {
  return (_as, client, body, _headers) => {
    body.set("client_id", client.client_id);
  };
}
async function signJwt(header, payload, key) {
  if (!key.usages.includes("sign")) {
    throw CodedTypeError('CryptoKey instances used for signing assertions must include "sign" in their "usages"', ERR_INVALID_ARG_VALUE);
  }
  const input = `${b64u(buf(JSON.stringify(header)))}.${b64u(buf(JSON.stringify(payload)))}`;
  const signature = b64u(await crypto.subtle.sign(keyToSubtle(key), key, buf(input)));
  return `${input}.${signature}`;
}
var URLParse = URL.parse ? (url, base) => URL.parse(url, base) : (url, base) => {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
};
function checkProtocol(url, enforceHttps) {
  if (enforceHttps && url.protocol !== "https:") {
    throw OPE("only requests to HTTPS are allowed", HTTP_REQUEST_FORBIDDEN, url);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw OPE("only HTTP and HTTPS requests are allowed", REQUEST_PROTOCOL_FORBIDDEN, url);
  }
}
function validateEndpoint(value, endpoint, useMtlsAlias, enforceHttps) {
  let url;
  if (typeof value !== "string" || !(url = URLParse(value))) {
    throw OPE(`authorization server metadata does not contain a valid ${useMtlsAlias ? `"as.mtls_endpoint_aliases.${endpoint}"` : `"as.${endpoint}"`}`, value === void 0 ? MISSING_SERVER_METADATA : INVALID_SERVER_METADATA, { attribute: useMtlsAlias ? `mtls_endpoint_aliases.${endpoint}` : endpoint });
  }
  checkProtocol(url, enforceHttps);
  return url;
}
function resolveEndpoint(as, endpoint, useMtlsAlias, enforceHttps) {
  if (useMtlsAlias && as.mtls_endpoint_aliases && endpoint in as.mtls_endpoint_aliases) {
    return validateEndpoint(as.mtls_endpoint_aliases[endpoint], endpoint, useMtlsAlias, enforceHttps);
  }
  return validateEndpoint(as[endpoint], endpoint, useMtlsAlias, enforceHttps);
}
var ResponseBodyError = class extends Error {
  cause;
  code;
  error;
  status;
  error_description;
  response;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = RESPONSE_BODY_ERROR;
    this.cause = options.cause;
    this.error = options.cause.error;
    this.status = options.response.status;
    this.error_description = options.cause.error_description;
    Object.defineProperty(this, "response", { enumerable: false, value: options.response });
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var AuthorizationResponseError = class extends Error {
  cause;
  code;
  error;
  error_description;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = AUTHORIZATION_RESPONSE_ERROR;
    this.cause = options.cause;
    this.error = options.cause.get("error");
    this.error_description = options.cause.get("error_description") ?? void 0;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var WWWAuthenticateChallengeError = class extends Error {
  cause;
  code;
  response;
  status;
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    this.code = WWW_AUTHENTICATE_CHALLENGE;
    this.cause = options.cause;
    this.status = options.response.status;
    this.response = options.response;
    Object.defineProperty(this, "response", { enumerable: false });
    Error.captureStackTrace?.(this, this.constructor);
  }
};
function unquote(value) {
  if (value.length >= 2 && value[0] === '"' && value[value.length - 1] === '"') {
    return value.slice(1, -1);
  }
  return value;
}
var SPLIT_REGEXP = /((?:,|, )?[0-9a-zA-Z!#$%&'*+-.^_`|~]+=)/;
var SCHEMES_REGEXP = /(?:^|, ?)([0-9a-zA-Z!#$%&'*+\-.^_`|~]+)(?=$|[ ,])/g;
function wwwAuth(scheme, params) {
  const arr = params.split(SPLIT_REGEXP).slice(1);
  if (!arr.length) {
    return { scheme: scheme.toLowerCase(), parameters: {} };
  }
  arr[arr.length - 1] = arr[arr.length - 1].replace(/,$/, "");
  const parameters = {};
  for (let i4 = 1; i4 < arr.length; i4 += 2) {
    const idx = i4;
    if (arr[idx][0] === '"') {
      while (arr[idx].slice(-1) !== '"' && ++i4 < arr.length) {
        arr[idx] += arr[i4];
      }
    }
    const key = arr[idx - 1].replace(/^(?:, ?)|=$/g, "").toLowerCase();
    parameters[key] = unquote(arr[idx]);
  }
  return {
    scheme: scheme.toLowerCase(),
    parameters
  };
}
function parseWwwAuthenticateChallenges(response) {
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE);
  }
  const header = response.headers.get("www-authenticate");
  if (header === null) {
    return void 0;
  }
  const result = [];
  for (const { 1: scheme, index } of header.matchAll(SCHEMES_REGEXP)) {
    result.push([scheme, index]);
  }
  if (!result.length) {
    return void 0;
  }
  const challenges = result.map(([scheme, indexOf], i4, others) => {
    const next = others[i4 + 1];
    let parameters;
    if (next) {
      parameters = header.slice(indexOf, next[1]);
    } else {
      parameters = header.slice(indexOf);
    }
    return wwwAuth(scheme, parameters);
  });
  return challenges;
}
function assertDPoP(option) {
  if (!branded.has(option)) {
    throw CodedTypeError('"options.DPoP" is not a valid DPoPHandle', ERR_INVALID_ARG_VALUE);
  }
}
async function resourceRequest(accessToken, method, url, headers, body, options) {
  assertString(accessToken, '"accessToken"');
  if (!(url instanceof URL)) {
    throw CodedTypeError('"url" must be an instance of URL', ERR_INVALID_ARG_TYPE);
  }
  checkProtocol(url, options?.[allowInsecureRequests] !== true);
  headers = prepareHeaders(headers);
  if (options?.DPoP) {
    assertDPoP(options.DPoP);
    await options.DPoP.addProof(url, headers, method.toUpperCase(), accessToken);
    headers.set("authorization", `DPoP ${accessToken}`);
  } else {
    headers.set("authorization", `Bearer ${accessToken}`);
  }
  const response = await (options?.[customFetch2] || fetch)(url.href, {
    body,
    headers: Object.fromEntries(headers.entries()),
    method,
    redirect: "manual",
    signal: options?.signal ? signal(options.signal) : void 0
  });
  options?.DPoP?.cacheNonce(response);
  return response;
}
async function userInfoRequest(as, client, accessToken, options) {
  assertAs(as);
  assertClient(client);
  const url = resolveEndpoint(as, "userinfo_endpoint", client.use_mtls_endpoint_aliases, options?.[allowInsecureRequests] !== true);
  const headers = prepareHeaders(options?.headers);
  if (client.userinfo_signed_response_alg) {
    headers.set("accept", "application/jwt");
  } else {
    headers.set("accept", "application/json");
    headers.append("accept", "application/jwt");
  }
  return resourceRequest(accessToken, "GET", url, headers, null, {
    ...options,
    [clockSkew]: getClockSkew(client)
  });
}
var skipSubjectCheck = Symbol();
function getContentType(input) {
  return input.headers.get("content-type")?.split(";")[0];
}
async function processUserInfoResponse(as, client, expectedSubject, response, options) {
  assertAs(as);
  assertClient(client);
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE);
  }
  let challenges;
  if (challenges = parseWwwAuthenticateChallenges(response)) {
    throw new WWWAuthenticateChallengeError("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: challenges, response });
  }
  if (response.status !== 200) {
    throw OPE('"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)', RESPONSE_IS_NOT_CONFORM, response);
  }
  assertReadableResponse(response);
  let json2;
  if (getContentType(response) === "application/jwt") {
    const { claims, jwt } = await validateJwt(await response.text(), checkSigningAlgorithm.bind(void 0, client.userinfo_signed_response_alg, as.userinfo_signing_alg_values_supported, void 0), getClockSkew(client), getClockTolerance(client), options?.[jweDecrypt]).then(validateOptionalAudience.bind(void 0, client.client_id)).then(validateOptionalIssuer.bind(void 0, as));
    jwtRefs.set(response, jwt);
    json2 = claims;
  } else {
    if (client.userinfo_signed_response_alg) {
      throw OPE("JWT UserInfo Response expected", JWT_USERINFO_EXPECTED, response);
    }
    assertApplicationJson(response);
    try {
      json2 = await response.json();
    } catch (cause) {
      throw OPE('failed to parse "response" body as JSON', PARSE_ERROR, cause);
    }
  }
  if (!isJsonObject(json2)) {
    throw OPE('"response" body must be a top level object', INVALID_RESPONSE, { body: json2 });
  }
  assertString(json2.sub, '"response" body "sub" property', INVALID_RESPONSE, { body: json2 });
  switch (expectedSubject) {
    case skipSubjectCheck:
      break;
    default:
      assertString(expectedSubject, '"expectedSubject"');
      if (json2.sub !== expectedSubject) {
        throw OPE('unexpected "response" body "sub" property value', JSON_ATTRIBUTE_COMPARISON, {
          expected: expectedSubject,
          body: json2,
          attribute: "sub"
        });
      }
  }
  return json2;
}
async function authenticatedRequest(as, client, clientAuthentication, url, body, headers, options) {
  await clientAuthentication(as, client, body, headers);
  headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
  return (options?.[customFetch2] || fetch)(url.href, {
    body,
    headers: Object.fromEntries(headers.entries()),
    method: "POST",
    redirect: "manual",
    signal: options?.signal ? signal(options.signal) : void 0
  });
}
async function tokenEndpointRequest(as, client, clientAuthentication, grantType, parameters, options) {
  const url = resolveEndpoint(as, "token_endpoint", client.use_mtls_endpoint_aliases, options?.[allowInsecureRequests] !== true);
  parameters.set("grant_type", grantType);
  const headers = prepareHeaders(options?.headers);
  headers.set("accept", "application/json");
  if (options?.DPoP !== void 0) {
    assertDPoP(options.DPoP);
    await options.DPoP.addProof(url, headers, "POST");
  }
  const response = await authenticatedRequest(as, client, clientAuthentication, url, parameters, headers, options);
  options?.DPoP?.cacheNonce(response);
  return response;
}
var idTokenClaims = /* @__PURE__ */ new WeakMap();
var jwtRefs = /* @__PURE__ */ new WeakMap();
function getValidatedIdTokenClaims(ref) {
  if (!ref.id_token) {
    return void 0;
  }
  const claims = idTokenClaims.get(ref);
  if (!claims) {
    throw CodedTypeError('"ref" was already garbage collected or did not resolve from the proper sources', ERR_INVALID_ARG_VALUE);
  }
  return claims;
}
async function processGenericAccessTokenResponse(as, client, response, additionalRequiredIdTokenClaims, options) {
  assertAs(as);
  assertClient(client);
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE);
  }
  let challenges;
  if (challenges = parseWwwAuthenticateChallenges(response)) {
    throw new WWWAuthenticateChallengeError("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: challenges, response });
  }
  if (response.status !== 200) {
    let err;
    if (err = await handleOAuthBodyError(response)) {
      await response.body?.cancel();
      throw new ResponseBodyError("server responded with an error in the response body", {
        cause: err,
        response
      });
    }
    throw OPE('"response" is not a conform Token Endpoint response (unexpected HTTP status code)', RESPONSE_IS_NOT_CONFORM, response);
  }
  assertReadableResponse(response);
  assertApplicationJson(response);
  let json2;
  try {
    json2 = await response.json();
  } catch (cause) {
    throw OPE('failed to parse "response" body as JSON', PARSE_ERROR, cause);
  }
  if (!isJsonObject(json2)) {
    throw OPE('"response" body must be a top level object', INVALID_RESPONSE, { body: json2 });
  }
  assertString(json2.access_token, '"response" body "access_token" property', INVALID_RESPONSE, {
    body: json2
  });
  assertString(json2.token_type, '"response" body "token_type" property', INVALID_RESPONSE, {
    body: json2
  });
  json2.token_type = json2.token_type.toLowerCase();
  if (json2.token_type !== "dpop" && json2.token_type !== "bearer") {
    throw new UnsupportedOperationError("unsupported `token_type` value", { cause: { body: json2 } });
  }
  if (json2.expires_in !== void 0) {
    let expiresIn = typeof json2.expires_in !== "number" ? parseFloat(json2.expires_in) : json2.expires_in;
    assertNumber(expiresIn, false, '"response" body "expires_in" property', INVALID_RESPONSE, {
      body: json2
    });
    json2.expires_in = expiresIn;
  }
  if (json2.refresh_token !== void 0) {
    assertString(json2.refresh_token, '"response" body "refresh_token" property', INVALID_RESPONSE, {
      body: json2
    });
  }
  if (json2.scope !== void 0 && typeof json2.scope !== "string") {
    throw OPE('"response" body "scope" property must be a string', INVALID_RESPONSE, { body: json2 });
  }
  if (json2.id_token !== void 0) {
    assertString(json2.id_token, '"response" body "id_token" property', INVALID_RESPONSE, {
      body: json2
    });
    const requiredClaims = ["aud", "exp", "iat", "iss", "sub"];
    if (client.require_auth_time === true) {
      requiredClaims.push("auth_time");
    }
    if (client.default_max_age !== void 0) {
      assertNumber(client.default_max_age, false, '"client.default_max_age"');
      requiredClaims.push("auth_time");
    }
    if (additionalRequiredIdTokenClaims?.length) {
      requiredClaims.push(...additionalRequiredIdTokenClaims);
    }
    const { claims, jwt } = await validateJwt(json2.id_token, checkSigningAlgorithm.bind(void 0, client.id_token_signed_response_alg, as.id_token_signing_alg_values_supported, "RS256"), getClockSkew(client), getClockTolerance(client), options?.[jweDecrypt]).then(validatePresence.bind(void 0, requiredClaims)).then(validateIssuer.bind(void 0, as)).then(validateAudience.bind(void 0, client.client_id));
    if (Array.isArray(claims.aud) && claims.aud.length !== 1) {
      if (claims.azp === void 0) {
        throw OPE('ID Token "aud" (audience) claim includes additional untrusted audiences', JWT_CLAIM_COMPARISON, { claims, claim: "aud" });
      }
      if (claims.azp !== client.client_id) {
        throw OPE('unexpected ID Token "azp" (authorized party) claim value', JWT_CLAIM_COMPARISON, { expected: client.client_id, claims, claim: "azp" });
      }
    }
    if (claims.auth_time !== void 0) {
      assertNumber(claims.auth_time, false, 'ID Token "auth_time" (authentication time)', INVALID_RESPONSE, { claims });
    }
    jwtRefs.set(response, jwt);
    idTokenClaims.set(json2, claims);
  }
  return json2;
}
function validateOptionalAudience(expected, result) {
  if (result.claims.aud !== void 0) {
    return validateAudience(expected, result);
  }
  return result;
}
function validateAudience(expected, result) {
  if (Array.isArray(result.claims.aud)) {
    if (!result.claims.aud.includes(expected)) {
      throw OPE('unexpected JWT "aud" (audience) claim value', JWT_CLAIM_COMPARISON, {
        expected,
        claims: result.claims,
        claim: "aud"
      });
    }
  } else if (result.claims.aud !== expected) {
    throw OPE('unexpected JWT "aud" (audience) claim value', JWT_CLAIM_COMPARISON, {
      expected,
      claims: result.claims,
      claim: "aud"
    });
  }
  return result;
}
function validateOptionalIssuer(as, result) {
  if (result.claims.iss !== void 0) {
    return validateIssuer(as, result);
  }
  return result;
}
function validateIssuer(as, result) {
  const expected = as[_expectedIssuer]?.(result) ?? as.issuer;
  if (result.claims.iss !== expected) {
    throw OPE('unexpected JWT "iss" (issuer) claim value', JWT_CLAIM_COMPARISON, {
      expected,
      claims: result.claims,
      claim: "iss"
    });
  }
  return result;
}
var branded = /* @__PURE__ */ new WeakSet();
function brand(searchParams) {
  branded.add(searchParams);
  return searchParams;
}
async function authorizationCodeGrantRequest(as, client, clientAuthentication, callbackParameters, redirectUri, codeVerifier, options) {
  assertAs(as);
  assertClient(client);
  if (!branded.has(callbackParameters)) {
    throw CodedTypeError('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', ERR_INVALID_ARG_VALUE);
  }
  assertString(redirectUri, '"redirectUri"');
  const code = getURLSearchParameter(callbackParameters, "code");
  if (!code) {
    throw OPE('no authorization code in "callbackParameters"', INVALID_RESPONSE);
  }
  const parameters = new URLSearchParams(options?.additionalParameters);
  parameters.set("redirect_uri", redirectUri);
  parameters.set("code", code);
  if (codeVerifier !== _nopkce) {
    assertString(codeVerifier, '"codeVerifier"');
    parameters.set("code_verifier", codeVerifier);
  }
  return tokenEndpointRequest(as, client, clientAuthentication, "authorization_code", parameters, options);
}
var jwtClaimNames = {
  aud: "audience",
  c_hash: "code hash",
  client_id: "client id",
  exp: "expiration time",
  iat: "issued at",
  iss: "issuer",
  jti: "jwt id",
  nonce: "nonce",
  s_hash: "state hash",
  sub: "subject",
  ath: "access token hash",
  htm: "http method",
  htu: "http uri",
  cnf: "confirmation",
  auth_time: "authentication time"
};
function validatePresence(required, result) {
  for (const claim of required) {
    if (result.claims[claim] === void 0) {
      throw OPE(`JWT "${claim}" (${jwtClaimNames[claim]}) claim missing`, INVALID_RESPONSE, {
        claims: result.claims
      });
    }
  }
  return result;
}
var expectNoNonce = Symbol();
var skipAuthTimeCheck = Symbol();
async function processAuthorizationCodeResponse(as, client, response, options) {
  if (typeof options?.expectedNonce === "string" || typeof options?.maxAge === "number" || options?.requireIdToken) {
    return processAuthorizationCodeOpenIDResponse(as, client, response, options.expectedNonce, options.maxAge, {
      [jweDecrypt]: options[jweDecrypt]
    });
  }
  return processAuthorizationCodeOAuth2Response(as, client, response, options);
}
async function processAuthorizationCodeOpenIDResponse(as, client, response, expectedNonce, maxAge, options) {
  const additionalRequiredClaims = [];
  switch (expectedNonce) {
    case void 0:
      expectedNonce = expectNoNonce;
      break;
    case expectNoNonce:
      break;
    default:
      assertString(expectedNonce, '"expectedNonce" argument');
      additionalRequiredClaims.push("nonce");
  }
  maxAge ??= client.default_max_age;
  switch (maxAge) {
    case void 0:
      maxAge = skipAuthTimeCheck;
      break;
    case skipAuthTimeCheck:
      break;
    default:
      assertNumber(maxAge, false, '"maxAge" argument');
      additionalRequiredClaims.push("auth_time");
  }
  const result = await processGenericAccessTokenResponse(as, client, response, additionalRequiredClaims, options);
  assertString(result.id_token, '"response" body "id_token" property', INVALID_RESPONSE, {
    body: result
  });
  const claims = getValidatedIdTokenClaims(result);
  if (maxAge !== skipAuthTimeCheck) {
    const now2 = epochTime() + getClockSkew(client);
    const tolerance = getClockTolerance(client);
    if (claims.auth_time + maxAge < now2 - tolerance) {
      throw OPE("too much time has elapsed since the last End-User authentication", JWT_TIMESTAMP_CHECK, { claims, now: now2, tolerance, claim: "auth_time" });
    }
  }
  if (expectedNonce === expectNoNonce) {
    if (claims.nonce !== void 0) {
      throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
        expected: void 0,
        claims,
        claim: "nonce"
      });
    }
  } else if (claims.nonce !== expectedNonce) {
    throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
      expected: expectedNonce,
      claims,
      claim: "nonce"
    });
  }
  return result;
}
async function processAuthorizationCodeOAuth2Response(as, client, response, options) {
  const result = await processGenericAccessTokenResponse(as, client, response, void 0, options);
  const claims = getValidatedIdTokenClaims(result);
  if (claims) {
    if (client.default_max_age !== void 0) {
      assertNumber(client.default_max_age, false, '"client.default_max_age"');
      const now2 = epochTime() + getClockSkew(client);
      const tolerance = getClockTolerance(client);
      if (claims.auth_time + client.default_max_age < now2 - tolerance) {
        throw OPE("too much time has elapsed since the last End-User authentication", JWT_TIMESTAMP_CHECK, { claims, now: now2, tolerance, claim: "auth_time" });
      }
    }
    if (claims.nonce !== void 0) {
      throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
        expected: void 0,
        claims,
        claim: "nonce"
      });
    }
  }
  return result;
}
var WWW_AUTHENTICATE_CHALLENGE = "OAUTH_WWW_AUTHENTICATE_CHALLENGE";
var RESPONSE_BODY_ERROR = "OAUTH_RESPONSE_BODY_ERROR";
var UNSUPPORTED_OPERATION = "OAUTH_UNSUPPORTED_OPERATION";
var AUTHORIZATION_RESPONSE_ERROR = "OAUTH_AUTHORIZATION_RESPONSE_ERROR";
var JWT_USERINFO_EXPECTED = "OAUTH_JWT_USERINFO_EXPECTED";
var PARSE_ERROR = "OAUTH_PARSE_ERROR";
var INVALID_RESPONSE = "OAUTH_INVALID_RESPONSE";
var RESPONSE_IS_NOT_JSON = "OAUTH_RESPONSE_IS_NOT_JSON";
var RESPONSE_IS_NOT_CONFORM = "OAUTH_RESPONSE_IS_NOT_CONFORM";
var HTTP_REQUEST_FORBIDDEN = "OAUTH_HTTP_REQUEST_FORBIDDEN";
var REQUEST_PROTOCOL_FORBIDDEN = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN";
var JWT_TIMESTAMP_CHECK = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED";
var JWT_CLAIM_COMPARISON = "OAUTH_JWT_CLAIM_COMPARISON_FAILED";
var JSON_ATTRIBUTE_COMPARISON = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED";
var MISSING_SERVER_METADATA = "OAUTH_MISSING_SERVER_METADATA";
var INVALID_SERVER_METADATA = "OAUTH_INVALID_SERVER_METADATA";
function assertReadableResponse(response) {
  if (response.bodyUsed) {
    throw CodedTypeError('"response" body has been used already', ERR_INVALID_ARG_VALUE);
  }
}
async function handleOAuthBodyError(response) {
  if (response.status > 399 && response.status < 500) {
    assertReadableResponse(response);
    assertApplicationJson(response);
    try {
      const json2 = await response.clone().json();
      if (isJsonObject(json2) && typeof json2.error === "string" && json2.error.length) {
        return json2;
      }
    } catch {
    }
  }
  return void 0;
}
function checkRsaKeyAlgorithm(key) {
  const { algorithm } = key;
  if (typeof algorithm.modulusLength !== "number" || algorithm.modulusLength < 2048) {
    throw new UnsupportedOperationError(`unsupported ${algorithm.name} modulusLength`, {
      cause: key
    });
  }
}
function ecdsaHashName(key) {
  const { algorithm } = key;
  switch (algorithm.namedCurve) {
    case "P-256":
      return "SHA-256";
    case "P-384":
      return "SHA-384";
    case "P-521":
      return "SHA-512";
    default:
      throw new UnsupportedOperationError("unsupported ECDSA namedCurve", { cause: key });
  }
}
function keyToSubtle(key) {
  switch (key.algorithm.name) {
    case "ECDSA":
      return {
        name: key.algorithm.name,
        hash: ecdsaHashName(key)
      };
    case "RSA-PSS": {
      checkRsaKeyAlgorithm(key);
      switch (key.algorithm.hash.name) {
        case "SHA-256":
        case "SHA-384":
        case "SHA-512":
          return {
            name: key.algorithm.name,
            saltLength: parseInt(key.algorithm.hash.name.slice(-3), 10) >> 3
          };
        default:
          throw new UnsupportedOperationError("unsupported RSA-PSS hash name", { cause: key });
      }
    }
    case "RSASSA-PKCS1-v1_5":
      checkRsaKeyAlgorithm(key);
      return key.algorithm.name;
    case "Ed25519":
    case "EdDSA":
      return key.algorithm.name;
  }
  throw new UnsupportedOperationError("unsupported CryptoKey algorithm name", { cause: key });
}
async function validateJwt(jws, checkAlg, clockSkew2, clockTolerance2, decryptJwt) {
  let { 0: protectedHeader, 1: payload, length } = jws.split(".");
  if (length === 5) {
    if (decryptJwt !== void 0) {
      jws = await decryptJwt(jws);
      ({ 0: protectedHeader, 1: payload, length } = jws.split("."));
    } else {
      throw new UnsupportedOperationError("JWE decryption is not configured", { cause: jws });
    }
  }
  if (length !== 3) {
    throw OPE("Invalid JWT", INVALID_RESPONSE, jws);
  }
  let header;
  try {
    header = JSON.parse(buf(b64u(protectedHeader)));
  } catch (cause) {
    throw OPE("failed to parse JWT Header body as base64url encoded JSON", PARSE_ERROR, cause);
  }
  if (!isJsonObject(header)) {
    throw OPE("JWT Header must be a top level object", INVALID_RESPONSE, jws);
  }
  checkAlg(header);
  if (header.crit !== void 0) {
    throw new UnsupportedOperationError('no JWT "crit" header parameter extensions are supported', {
      cause: { header }
    });
  }
  let claims;
  try {
    claims = JSON.parse(buf(b64u(payload)));
  } catch (cause) {
    throw OPE("failed to parse JWT Payload body as base64url encoded JSON", PARSE_ERROR, cause);
  }
  if (!isJsonObject(claims)) {
    throw OPE("JWT Payload must be a top level object", INVALID_RESPONSE, jws);
  }
  const now2 = epochTime() + clockSkew2;
  if (claims.exp !== void 0) {
    if (typeof claims.exp !== "number") {
      throw OPE('unexpected JWT "exp" (expiration time) claim type', INVALID_RESPONSE, { claims });
    }
    if (claims.exp <= now2 - clockTolerance2) {
      throw OPE('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', JWT_TIMESTAMP_CHECK, { claims, now: now2, tolerance: clockTolerance2, claim: "exp" });
    }
  }
  if (claims.iat !== void 0) {
    if (typeof claims.iat !== "number") {
      throw OPE('unexpected JWT "iat" (issued at) claim type', INVALID_RESPONSE, { claims });
    }
  }
  if (claims.iss !== void 0) {
    if (typeof claims.iss !== "string") {
      throw OPE('unexpected JWT "iss" (issuer) claim type', INVALID_RESPONSE, { claims });
    }
  }
  if (claims.nbf !== void 0) {
    if (typeof claims.nbf !== "number") {
      throw OPE('unexpected JWT "nbf" (not before) claim type', INVALID_RESPONSE, { claims });
    }
    if (claims.nbf > now2 + clockTolerance2) {
      throw OPE('unexpected JWT "nbf" (not before) claim value', JWT_TIMESTAMP_CHECK, {
        claims,
        now: now2,
        tolerance: clockTolerance2,
        claim: "nbf"
      });
    }
  }
  if (claims.aud !== void 0) {
    if (typeof claims.aud !== "string" && !Array.isArray(claims.aud)) {
      throw OPE('unexpected JWT "aud" (audience) claim type', INVALID_RESPONSE, { claims });
    }
  }
  return { header, claims, jwt: jws };
}
function checkSigningAlgorithm(client, issuer, fallback, header) {
  if (client !== void 0) {
    if (typeof client === "string" ? header.alg !== client : !client.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: client,
        reason: "client configuration"
      });
    }
    return;
  }
  if (Array.isArray(issuer)) {
    if (!issuer.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: issuer,
        reason: "authorization server metadata"
      });
    }
    return;
  }
  if (fallback !== void 0) {
    if (typeof fallback === "string" ? header.alg !== fallback : typeof fallback === "function" ? !fallback(header.alg) : !fallback.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: fallback,
        reason: "default value"
      });
    }
    return;
  }
  throw OPE('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client, issuer, fallback });
}
function getURLSearchParameter(parameters, name) {
  const { 0: value, length } = parameters.getAll(name);
  if (length > 1) {
    throw OPE(`"${name}" parameter must be provided only once`, INVALID_RESPONSE);
  }
  return value;
}
var skipStateCheck = Symbol();
var expectNoState = Symbol();
function validateAuthResponse(as, client, parameters, expectedState) {
  assertAs(as);
  assertClient(client);
  if (parameters instanceof URL) {
    parameters = parameters.searchParams;
  }
  if (!(parameters instanceof URLSearchParams)) {
    throw CodedTypeError('"parameters" must be an instance of URLSearchParams, or URL', ERR_INVALID_ARG_TYPE);
  }
  if (getURLSearchParameter(parameters, "response")) {
    throw OPE('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', INVALID_RESPONSE, { parameters });
  }
  const iss = getURLSearchParameter(parameters, "iss");
  const state2 = getURLSearchParameter(parameters, "state");
  if (!iss && as.authorization_response_iss_parameter_supported) {
    throw OPE('response parameter "iss" (issuer) missing', INVALID_RESPONSE, { parameters });
  }
  if (iss && iss !== as.issuer) {
    throw OPE('unexpected "iss" (issuer) response parameter value', INVALID_RESPONSE, {
      expected: as.issuer,
      parameters
    });
  }
  switch (expectedState) {
    case void 0:
    case expectNoState:
      if (state2 !== void 0) {
        throw OPE('unexpected "state" response parameter encountered', INVALID_RESPONSE, {
          expected: void 0,
          parameters
        });
      }
      break;
    case skipStateCheck:
      break;
    default:
      assertString(expectedState, '"expectedState" argument');
      if (state2 !== expectedState) {
        throw OPE(state2 === void 0 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', INVALID_RESPONSE, { expected: expectedState, parameters });
      }
  }
  const error = getURLSearchParameter(parameters, "error");
  if (error) {
    throw new AuthorizationResponseError("authorization response from the server is an error", {
      cause: parameters
    });
  }
  const id_token = getURLSearchParameter(parameters, "id_token");
  const token = getURLSearchParameter(parameters, "token");
  if (id_token !== void 0 || token !== void 0) {
    throw new UnsupportedOperationError("implicit and hybrid flows are not supported");
  }
  return brand(new URLSearchParams(parameters));
}
var _nopkce = Symbol();
var _nodiscoverycheck = Symbol();
var _expectedIssuer = Symbol();

// node_modules/@auth/core/lib/actions/callback/oauth/checks.js
var COOKIE_TTL = 60 * 15;
async function sealCookie(name, payload, options) {
  const { cookies, logger } = options;
  const cookie = cookies[name];
  const expires = /* @__PURE__ */ new Date();
  expires.setTime(expires.getTime() + COOKIE_TTL * 1e3);
  logger.debug(`CREATE_${name.toUpperCase()}`, {
    name: cookie.name,
    payload,
    COOKIE_TTL,
    expires
  });
  const encoded = await encode3({
    ...options.jwt,
    maxAge: COOKIE_TTL,
    token: { value: payload },
    salt: cookie.name
  });
  const cookieOptions = { ...cookie.options, expires };
  return { name: cookie.name, value: encoded, options: cookieOptions };
}
async function parseCookie3(name, value, options) {
  try {
    const { logger, cookies, jwt } = options;
    logger.debug(`PARSE_${name.toUpperCase()}`, { cookie: value });
    if (!value)
      throw new InvalidCheck(`${name} cookie was missing`);
    const parsed = await decode4({
      ...jwt,
      token: value,
      salt: cookies[name].name
    });
    if (parsed?.value)
      return parsed.value;
    throw new Error("Invalid cookie");
  } catch (error) {
    throw new InvalidCheck(`${name} value could not be parsed`, {
      cause: error
    });
  }
}
function clearCookie(name, options, resCookies) {
  const { logger, cookies } = options;
  const cookie = cookies[name];
  logger.debug(`CLEAR_${name.toUpperCase()}`, { cookie });
  resCookies.push({
    name: cookie.name,
    value: "",
    options: { ...cookies[name].options, maxAge: 0 }
  });
}
function useCookie(check2, name) {
  return async function(cookies, resCookies, options) {
    const { provider, logger } = options;
    if (!provider?.checks?.includes(check2))
      return;
    const cookieValue = cookies?.[options.cookies[name].name];
    logger.debug(`USE_${name.toUpperCase()}`, { value: cookieValue });
    const parsed = await parseCookie3(name, cookieValue, options);
    clearCookie(name, options, resCookies);
    return parsed;
  };
}
var pkce = {
  /** Creates a PKCE code challenge and verifier pair. The verifier in stored in the cookie. */
  async create(options) {
    const code_verifier = generateRandomCodeVerifier();
    const value = await calculatePKCECodeChallenge(code_verifier);
    const cookie = await sealCookie("pkceCodeVerifier", code_verifier, options);
    return { cookie, value };
  },
  /**
   * Returns code_verifier if the provider is configured to use PKCE,
   * and clears the container cookie afterwards.
   * An error is thrown if the code_verifier is missing or invalid.
   */
  use: useCookie("pkce", "pkceCodeVerifier")
};
var STATE_MAX_AGE = 60 * 15;
var encodedStateSalt = "encodedState";
var state = {
  /** Creates a state cookie with an optionally encoded body. */
  async create(options, origin) {
    const { provider } = options;
    if (!provider.checks.includes("state")) {
      if (origin) {
        throw new InvalidCheck("State data was provided but the provider is not configured to use state");
      }
      return;
    }
    const payload = {
      origin,
      random: generateRandomState()
    };
    const value = await encode3({
      secret: options.jwt.secret,
      token: payload,
      salt: encodedStateSalt,
      maxAge: STATE_MAX_AGE
    });
    const cookie = await sealCookie("state", value, options);
    return { cookie, value };
  },
  /**
   * Returns state if the provider is configured to use state,
   * and clears the container cookie afterwards.
   * An error is thrown if the state is missing or invalid.
   */
  use: useCookie("state", "state"),
  /** Decodes the state. If it could not be decoded, it throws an error. */
  async decode(state2, options) {
    try {
      options.logger.debug("DECODE_STATE", { state: state2 });
      const payload = await decode4({
        secret: options.jwt.secret,
        token: state2,
        salt: encodedStateSalt
      });
      if (payload)
        return payload;
      throw new Error("Invalid state");
    } catch (error) {
      throw new InvalidCheck("State could not be decoded", { cause: error });
    }
  }
};
var nonce = {
  async create(options) {
    if (!options.provider.checks.includes("nonce"))
      return;
    const value = generateRandomNonce();
    const cookie = await sealCookie("nonce", value, options);
    return { cookie, value };
  },
  /**
   * Returns nonce if the provider is configured to use nonce,
   * and clears the container cookie afterwards.
   * An error is thrown if the nonce is missing or invalid.
   * @see https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
   * @see https://danielfett.de/2020/05/16/pkce-vs-nonce-equivalent-or-not/#nonce
   */
  use: useCookie("nonce", "nonce")
};
var WEBAUTHN_CHALLENGE_MAX_AGE = 60 * 15;
var webauthnChallengeSalt = "encodedWebauthnChallenge";
var webauthnChallenge = {
  async create(options, challenge, registerData) {
    return {
      cookie: await sealCookie("webauthnChallenge", await encode3({
        secret: options.jwt.secret,
        token: { challenge, registerData },
        salt: webauthnChallengeSalt,
        maxAge: WEBAUTHN_CHALLENGE_MAX_AGE
      }), options)
    };
  },
  /** Returns WebAuthn challenge if present. */
  async use(options, cookies, resCookies) {
    const cookieValue = cookies?.[options.cookies.webauthnChallenge.name];
    const parsed = await parseCookie3("webauthnChallenge", cookieValue, options);
    const payload = await decode4({
      secret: options.jwt.secret,
      token: parsed,
      salt: webauthnChallengeSalt
    });
    clearCookie("webauthnChallenge", options, resCookies);
    if (!payload)
      throw new InvalidCheck("WebAuthn challenge was missing");
    return payload;
  }
};

// node_modules/@auth/core/lib/actions/callback/oauth/callback.js
function formUrlEncode(token) {
  return encodeURIComponent(token).replace(/%20/g, "+");
}
function clientSecretBasic(clientId, clientSecret) {
  const username = formUrlEncode(clientId);
  const password = formUrlEncode(clientSecret);
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
}
async function handleOAuth(params, cookies, options) {
  const { logger, provider } = options;
  let as;
  const { token, userinfo } = provider;
  if ((!token?.url || token.url.host === "authjs.dev") && (!userinfo?.url || userinfo.url.host === "authjs.dev")) {
    const issuer = new URL(provider.issuer);
    const discoveryResponse = await discoveryRequest(issuer, {
      [allowInsecureRequests]: true,
      [customFetch2]: provider[customFetch]
    });
    as = await processDiscoveryResponse(issuer, discoveryResponse);
    if (!as.token_endpoint)
      throw new TypeError("TODO: Authorization server did not provide a token endpoint.");
    if (!as.userinfo_endpoint)
      throw new TypeError("TODO: Authorization server did not provide a userinfo endpoint.");
  } else {
    as = {
      issuer: provider.issuer ?? "https://authjs.dev",
      // TODO: review fallback issuer
      token_endpoint: token?.url.toString(),
      userinfo_endpoint: userinfo?.url.toString()
    };
  }
  const client = {
    client_id: provider.clientId,
    ...provider.client
  };
  let clientAuth;
  switch (client.token_endpoint_auth_method) {
    case void 0:
    case "client_secret_basic":
      clientAuth = (_as, _client, _body, headers) => {
        headers.set("authorization", clientSecretBasic(provider.clientId, provider.clientSecret));
      };
      break;
    case "client_secret_post":
      clientAuth = ClientSecretPost(provider.clientSecret);
      break;
    case "client_secret_jwt":
      clientAuth = ClientSecretJwt(provider.clientSecret);
      break;
    case "private_key_jwt":
      clientAuth = PrivateKeyJwt(provider.token.clientPrivateKey, {
        // TODO: review in the next breaking change
        [modifyAssertion](_header, payload) {
          payload.aud = [as.issuer, as.token_endpoint];
        }
      });
      break;
    case "none":
      clientAuth = None();
      break;
    default:
      throw new Error("unsupported client authentication method");
  }
  const resCookies = [];
  const state2 = await state.use(cookies, resCookies, options);
  let codeGrantParams;
  try {
    codeGrantParams = validateAuthResponse(as, client, new URLSearchParams(params), provider.checks.includes("state") ? state2 : skipStateCheck);
  } catch (err) {
    if (err instanceof AuthorizationResponseError) {
      const cause = {
        providerId: provider.id,
        ...Object.fromEntries(err.cause.entries())
      };
      logger.debug("OAuthCallbackError", cause);
      throw new OAuthCallbackError("OAuth Provider returned an error", cause);
    }
    throw err;
  }
  const codeVerifier = await pkce.use(cookies, resCookies, options);
  let redirect_uri = provider.callbackUrl;
  if (!options.isOnRedirectProxy && provider.redirectProxyUrl) {
    redirect_uri = provider.redirectProxyUrl;
  }
  let codeGrantResponse = await authorizationCodeGrantRequest(as, client, clientAuth, codeGrantParams, redirect_uri, codeVerifier ?? "decoy", {
    // TODO: move away from allowing insecure HTTP requests
    [allowInsecureRequests]: true,
    [customFetch2]: (...args) => {
      if (!provider.checks.includes("pkce")) {
        args[1].body.delete("code_verifier");
      }
      return (provider[customFetch] ?? fetch)(...args);
    }
  });
  if (provider.token?.conform) {
    codeGrantResponse = await provider.token.conform(codeGrantResponse.clone()) ?? codeGrantResponse;
  }
  let profile = {};
  const requireIdToken = isOIDCProvider(provider);
  if (provider[conformInternal]) {
    switch (provider.id) {
      case "microsoft-entra-id":
      case "azure-ad": {
        const { tid } = decodeJwt((await codeGrantResponse.clone().json()).id_token);
        if (typeof tid === "string") {
          const tenantRe = /microsoftonline\.com\/(\w+)\/v2\.0/;
          const tenantId = as.issuer?.match(tenantRe)?.[1] ?? "common";
          const issuer = new URL(as.issuer.replace(tenantId, tid));
          const discoveryResponse = await discoveryRequest(issuer, {
            [customFetch2]: provider[customFetch]
          });
          as = await processDiscoveryResponse(issuer, discoveryResponse);
        }
        break;
      }
      default:
        break;
    }
  }
  const processedCodeResponse = await processAuthorizationCodeResponse(as, client, codeGrantResponse, {
    expectedNonce: await nonce.use(cookies, resCookies, options),
    requireIdToken
  });
  const tokens = processedCodeResponse;
  if (requireIdToken) {
    const idTokenClaims2 = getValidatedIdTokenClaims(processedCodeResponse);
    profile = idTokenClaims2;
    if (provider[conformInternal] && provider.id === "apple") {
      try {
        profile.user = JSON.parse(params?.user);
      } catch {
      }
    }
    if (provider.idToken === false) {
      const userinfoResponse = await userInfoRequest(as, client, processedCodeResponse.access_token, {
        [customFetch2]: provider[customFetch],
        // TODO: move away from allowing insecure HTTP requests
        [allowInsecureRequests]: true
      });
      profile = await processUserInfoResponse(as, client, idTokenClaims2.sub, userinfoResponse);
    }
  } else {
    if (userinfo?.request) {
      const _profile = await userinfo.request({ tokens, provider });
      if (_profile instanceof Object)
        profile = _profile;
    } else if (userinfo?.url) {
      const userinfoResponse = await userInfoRequest(as, client, processedCodeResponse.access_token, { [customFetch2]: provider[customFetch] });
      profile = await userinfoResponse.json();
    } else {
      throw new TypeError("No userinfo endpoint configured");
    }
  }
  if (tokens.expires_in) {
    tokens.expires_at = Math.floor(Date.now() / 1e3) + Number(tokens.expires_in);
  }
  const profileResult = await getUserAndAccount(profile, provider, tokens, logger);
  return { ...profileResult, profile, cookies: resCookies };
}
async function getUserAndAccount(OAuthProfile, provider, tokens, logger) {
  try {
    const userFromProfile = await provider.profile(OAuthProfile, tokens);
    const user = {
      ...userFromProfile,
      // The user's id is intentionally not set based on the profile id, as
      // the user should remain independent of the provider and the profile id
      // is saved on the Account already, as `providerAccountId`.
      id: crypto.randomUUID(),
      email: userFromProfile.email?.toLowerCase()
    };
    return {
      user,
      account: {
        ...tokens,
        provider: provider.id,
        type: provider.type,
        providerAccountId: userFromProfile.id ?? crypto.randomUUID()
      }
    };
  } catch (e2) {
    logger.debug("getProfile error details", OAuthProfile);
    logger.error(new OAuthProfileParseError(e2, { provider: provider.id }));
  }
}

// node_modules/@auth/core/lib/utils/webauthn-utils.js
function inferWebAuthnOptions(action, loggedIn, userInfoResponse) {
  const { user, exists: exists2 = false } = userInfoResponse ?? {};
  switch (action) {
    case "authenticate": {
      return "authenticate";
    }
    case "register": {
      if (user && loggedIn === exists2)
        return "register";
      break;
    }
    case void 0: {
      if (!loggedIn) {
        if (user) {
          if (exists2) {
            return "authenticate";
          } else {
            return "register";
          }
        } else {
          return "authenticate";
        }
      }
      break;
    }
  }
  return null;
}
async function getRegistrationResponse(options, request, user, resCookies) {
  const regOptions = await getRegistrationOptions(options, request, user);
  const { cookie } = await webauthnChallenge.create(options, regOptions.challenge, user);
  return {
    status: 200,
    cookies: [...resCookies ?? [], cookie],
    body: {
      action: "register",
      options: regOptions
    },
    headers: {
      "Content-Type": "application/json"
    }
  };
}
async function getAuthenticationResponse(options, request, user, resCookies) {
  const authOptions = await getAuthenticationOptions(options, request, user);
  const { cookie } = await webauthnChallenge.create(options, authOptions.challenge);
  return {
    status: 200,
    cookies: [...resCookies ?? [], cookie],
    body: {
      action: "authenticate",
      options: authOptions
    },
    headers: {
      "Content-Type": "application/json"
    }
  };
}
async function verifyAuthenticate(options, request, resCookies) {
  const { adapter, provider } = options;
  const data = request.body && typeof request.body.data === "string" ? JSON.parse(request.body.data) : void 0;
  if (!data || typeof data !== "object" || !("id" in data) || typeof data.id !== "string") {
    throw new AuthError("Invalid WebAuthn Authentication response");
  }
  const credentialID = toBase64(fromBase64(data.id));
  const authenticator = await adapter.getAuthenticator(credentialID);
  if (!authenticator) {
    throw new AuthError(`WebAuthn authenticator not found in database: ${JSON.stringify({
      credentialID
    })}`);
  }
  const { challenge: expectedChallenge } = await webauthnChallenge.use(options, request.cookies, resCookies);
  let verification;
  try {
    const relayingParty = provider.getRelayingParty(options, request);
    verification = await provider.simpleWebAuthn.verifyAuthenticationResponse({
      ...provider.verifyAuthenticationOptions,
      expectedChallenge,
      response: data,
      authenticator: fromAdapterAuthenticator(authenticator),
      expectedOrigin: relayingParty.origin,
      expectedRPID: relayingParty.id
    });
  } catch (e2) {
    throw new WebAuthnVerificationError(e2);
  }
  const { verified, authenticationInfo } = verification;
  if (!verified) {
    throw new WebAuthnVerificationError("WebAuthn authentication response could not be verified");
  }
  try {
    const { newCounter } = authenticationInfo;
    await adapter.updateAuthenticatorCounter(authenticator.credentialID, newCounter);
  } catch (e2) {
    throw new AdapterError(`Failed to update authenticator counter. This may cause future authentication attempts to fail. ${JSON.stringify({
      credentialID,
      oldCounter: authenticator.counter,
      newCounter: authenticationInfo.newCounter
    })}`, e2);
  }
  const account = await adapter.getAccount(authenticator.providerAccountId, provider.id);
  if (!account) {
    throw new AuthError(`WebAuthn account not found in database: ${JSON.stringify({
      credentialID,
      providerAccountId: authenticator.providerAccountId
    })}`);
  }
  const user = await adapter.getUser(account.userId);
  if (!user) {
    throw new AuthError(`WebAuthn user not found in database: ${JSON.stringify({
      credentialID,
      providerAccountId: authenticator.providerAccountId,
      userID: account.userId
    })}`);
  }
  return {
    account,
    user
  };
}
async function verifyRegister(options, request, resCookies) {
  const { provider } = options;
  const data = request.body && typeof request.body.data === "string" ? JSON.parse(request.body.data) : void 0;
  if (!data || typeof data !== "object" || !("id" in data) || typeof data.id !== "string") {
    throw new AuthError("Invalid WebAuthn Registration response");
  }
  const { challenge: expectedChallenge, registerData: user } = await webauthnChallenge.use(options, request.cookies, resCookies);
  if (!user) {
    throw new AuthError("Missing user registration data in WebAuthn challenge cookie");
  }
  let verification;
  try {
    const relayingParty = provider.getRelayingParty(options, request);
    verification = await provider.simpleWebAuthn.verifyRegistrationResponse({
      ...provider.verifyRegistrationOptions,
      expectedChallenge,
      response: data,
      expectedOrigin: relayingParty.origin,
      expectedRPID: relayingParty.id
    });
  } catch (e2) {
    throw new WebAuthnVerificationError(e2);
  }
  if (!verification.verified || !verification.registrationInfo) {
    throw new WebAuthnVerificationError("WebAuthn registration response could not be verified");
  }
  const account = {
    providerAccountId: toBase64(verification.registrationInfo.credentialID),
    provider: options.provider.id,
    type: provider.type
  };
  const authenticator = {
    providerAccountId: account.providerAccountId,
    counter: verification.registrationInfo.counter,
    credentialID: toBase64(verification.registrationInfo.credentialID),
    credentialPublicKey: toBase64(verification.registrationInfo.credentialPublicKey),
    credentialBackedUp: verification.registrationInfo.credentialBackedUp,
    credentialDeviceType: verification.registrationInfo.credentialDeviceType,
    transports: transportsToString(data.response.transports)
  };
  return {
    user,
    account,
    authenticator
  };
}
async function getAuthenticationOptions(options, request, user) {
  const { provider, adapter } = options;
  const authenticators = user && user["id"] ? await adapter.listAuthenticatorsByUserId(user.id) : null;
  const relayingParty = provider.getRelayingParty(options, request);
  return await provider.simpleWebAuthn.generateAuthenticationOptions({
    ...provider.authenticationOptions,
    rpID: relayingParty.id,
    allowCredentials: authenticators?.map((a4) => ({
      id: fromBase64(a4.credentialID),
      type: "public-key",
      transports: stringToTransports(a4.transports)
    }))
  });
}
async function getRegistrationOptions(options, request, user) {
  const { provider, adapter } = options;
  const authenticators = user["id"] ? await adapter.listAuthenticatorsByUserId(user.id) : null;
  const userID = randomString(32);
  const relayingParty = provider.getRelayingParty(options, request);
  return await provider.simpleWebAuthn.generateRegistrationOptions({
    ...provider.registrationOptions,
    userID,
    userName: user.email,
    userDisplayName: user.name ?? void 0,
    rpID: relayingParty.id,
    rpName: relayingParty.name,
    excludeCredentials: authenticators?.map((a4) => ({
      id: fromBase64(a4.credentialID),
      type: "public-key",
      transports: stringToTransports(a4.transports)
    }))
  });
}
function assertInternalOptionsWebAuthn(options) {
  const { provider, adapter } = options;
  if (!adapter)
    throw new MissingAdapter("An adapter is required for the WebAuthn provider");
  if (!provider || provider.type !== "webauthn") {
    throw new InvalidProvider("Provider must be WebAuthn");
  }
  return { ...options, provider, adapter };
}
function fromAdapterAuthenticator(authenticator) {
  return {
    ...authenticator,
    credentialDeviceType: authenticator.credentialDeviceType,
    transports: stringToTransports(authenticator.transports),
    credentialID: fromBase64(authenticator.credentialID),
    credentialPublicKey: fromBase64(authenticator.credentialPublicKey)
  };
}
function fromBase64(base64) {
  return new Uint8Array(Buffer.from(base64, "base64"));
}
function toBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}
function transportsToString(transports) {
  return transports?.join(",");
}
function stringToTransports(tstring) {
  return tstring ? tstring.split(",") : void 0;
}

// node_modules/@auth/core/lib/actions/callback/index.js
async function callback(request, options, sessionStore, cookies) {
  if (!options.provider)
    throw new InvalidProvider("Callback route called without provider");
  const { query, body, method, headers } = request;
  const { provider, adapter, url, callbackUrl, pages, jwt, events, callbacks, session: { strategy: sessionStrategy, maxAge: sessionMaxAge }, logger } = options;
  const useJwtSession = sessionStrategy === "jwt";
  try {
    if (provider.type === "oauth" || provider.type === "oidc") {
      const params = provider.authorization?.url.searchParams.get("response_mode") === "form_post" ? body : query;
      if (options.isOnRedirectProxy && params?.state) {
        const parsedState = await state.decode(params.state, options);
        const shouldRedirect = parsedState?.origin && new URL(parsedState.origin).origin !== options.url.origin;
        if (shouldRedirect) {
          const proxyRedirect = `${parsedState.origin}?${new URLSearchParams(params)}`;
          logger.debug("Proxy redirecting to", proxyRedirect);
          return { redirect: proxyRedirect, cookies };
        }
      }
      const authorizationResult = await handleOAuth(params, request.cookies, options);
      if (authorizationResult.cookies.length) {
        cookies.push(...authorizationResult.cookies);
      }
      logger.debug("authorization result", authorizationResult);
      const { user: userFromProvider, account, profile: OAuthProfile } = authorizationResult;
      if (!userFromProvider || !account || !OAuthProfile) {
        return { redirect: `${url}/signin`, cookies };
      }
      let userByAccount;
      if (adapter) {
        const { getUserByAccount } = adapter;
        userByAccount = await getUserByAccount({
          providerAccountId: account.providerAccountId,
          provider: provider.id
        });
      }
      const redirect = await handleAuthorized({
        user: userByAccount ?? userFromProvider,
        account,
        profile: OAuthProfile
      }, options);
      if (redirect)
        return { redirect, cookies };
      const { user, session: session2, isNewUser } = await handleLoginOrRegister(sessionStore.value, userFromProvider, account, options);
      if (useJwtSession) {
        const defaultToken = {
          name: user.name,
          email: user.email,
          picture: user.image,
          sub: user.id?.toString()
        };
        const token = await callbacks.jwt({
          token: defaultToken,
          user,
          account,
          profile: OAuthProfile,
          isNewUser,
          trigger: isNewUser ? "signUp" : "signIn"
        });
        if (token === null) {
          cookies.push(...sessionStore.clean());
        } else {
          const salt = options.cookies.sessionToken.name;
          const newToken = await jwt.encode({ ...jwt, token, salt });
          const cookieExpires = /* @__PURE__ */ new Date();
          cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1e3);
          const sessionCookies = sessionStore.chunk(newToken, {
            expires: cookieExpires
          });
          cookies.push(...sessionCookies);
        }
      } else {
        cookies.push({
          name: options.cookies.sessionToken.name,
          value: session2.sessionToken,
          options: {
            ...options.cookies.sessionToken.options,
            expires: session2.expires
          }
        });
      }
      await events.signIn?.({
        user,
        account,
        profile: OAuthProfile,
        isNewUser
      });
      if (isNewUser && pages.newUser) {
        return {
          redirect: `${pages.newUser}${pages.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl })}`,
          cookies
        };
      }
      return { redirect: callbackUrl, cookies };
    } else if (provider.type === "email") {
      const paramToken = query?.token;
      const paramIdentifier = query?.email;
      if (!paramToken) {
        const e2 = new TypeError("Missing token. The sign-in URL was manually opened without token or the link was not sent correctly in the email.", { cause: { hasToken: !!paramToken } });
        e2.name = "Configuration";
        throw e2;
      }
      const secret = provider.secret ?? options.secret;
      const invite = await adapter.useVerificationToken({
        // @ts-expect-error User-land adapters might decide to omit the identifier during lookup
        identifier: paramIdentifier,
        // TODO: Drop this requirement for lookup in official adapters too
        token: await createHash(`${paramToken}${secret}`)
      });
      const hasInvite = !!invite;
      const expired = hasInvite && invite.expires.valueOf() < Date.now();
      const invalidInvite = !hasInvite || expired || // The user might have configured the link to not contain the identifier
      // so we only compare if it exists
      paramIdentifier && invite.identifier !== paramIdentifier;
      if (invalidInvite)
        throw new Verification({ hasInvite, expired });
      const { identifier } = invite;
      const user = await adapter.getUserByEmail(identifier) ?? {
        id: crypto.randomUUID(),
        email: identifier,
        emailVerified: null
      };
      const account = {
        providerAccountId: user.email,
        userId: user.id,
        type: "email",
        provider: provider.id
      };
      const redirect = await handleAuthorized({ user, account }, options);
      if (redirect)
        return { redirect, cookies };
      const { user: loggedInUser, session: session2, isNewUser } = await handleLoginOrRegister(sessionStore.value, user, account, options);
      if (useJwtSession) {
        const defaultToken = {
          name: loggedInUser.name,
          email: loggedInUser.email,
          picture: loggedInUser.image,
          sub: loggedInUser.id?.toString()
        };
        const token = await callbacks.jwt({
          token: defaultToken,
          user: loggedInUser,
          account,
          isNewUser,
          trigger: isNewUser ? "signUp" : "signIn"
        });
        if (token === null) {
          cookies.push(...sessionStore.clean());
        } else {
          const salt = options.cookies.sessionToken.name;
          const newToken = await jwt.encode({ ...jwt, token, salt });
          const cookieExpires = /* @__PURE__ */ new Date();
          cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1e3);
          const sessionCookies = sessionStore.chunk(newToken, {
            expires: cookieExpires
          });
          cookies.push(...sessionCookies);
        }
      } else {
        cookies.push({
          name: options.cookies.sessionToken.name,
          value: session2.sessionToken,
          options: {
            ...options.cookies.sessionToken.options,
            expires: session2.expires
          }
        });
      }
      await events.signIn?.({ user: loggedInUser, account, isNewUser });
      if (isNewUser && pages.newUser) {
        return {
          redirect: `${pages.newUser}${pages.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl })}`,
          cookies
        };
      }
      return { redirect: callbackUrl, cookies };
    } else if (provider.type === "credentials" && method === "POST") {
      const credentials = body ?? {};
      Object.entries(query ?? {}).forEach(([k3, v3]) => url.searchParams.set(k3, v3));
      const userFromAuthorize = await provider.authorize(
        credentials,
        // prettier-ignore
        new Request(url, { headers, method, body: JSON.stringify(body) })
      );
      const user = userFromAuthorize;
      if (!user)
        throw new CredentialsSignin();
      else
        user.id = user.id?.toString() ?? crypto.randomUUID();
      const account = {
        providerAccountId: user.id,
        type: "credentials",
        provider: provider.id
      };
      const redirect = await handleAuthorized({ user, account, credentials }, options);
      if (redirect)
        return { redirect, cookies };
      const defaultToken = {
        name: user.name,
        email: user.email,
        picture: user.image,
        sub: user.id
      };
      const token = await callbacks.jwt({
        token: defaultToken,
        user,
        account,
        isNewUser: false,
        trigger: "signIn"
      });
      if (token === null) {
        cookies.push(...sessionStore.clean());
      } else {
        const salt = options.cookies.sessionToken.name;
        const newToken = await jwt.encode({ ...jwt, token, salt });
        const cookieExpires = /* @__PURE__ */ new Date();
        cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1e3);
        const sessionCookies = sessionStore.chunk(newToken, {
          expires: cookieExpires
        });
        cookies.push(...sessionCookies);
      }
      await events.signIn?.({ user, account });
      return { redirect: callbackUrl, cookies };
    } else if (provider.type === "webauthn" && method === "POST") {
      const action = request.body?.action;
      if (typeof action !== "string" || action !== "authenticate" && action !== "register") {
        throw new AuthError("Invalid action parameter");
      }
      const localOptions = assertInternalOptionsWebAuthn(options);
      let user;
      let account;
      let authenticator;
      switch (action) {
        case "authenticate": {
          const verified = await verifyAuthenticate(localOptions, request, cookies);
          user = verified.user;
          account = verified.account;
          break;
        }
        case "register": {
          const verified = await verifyRegister(options, request, cookies);
          user = verified.user;
          account = verified.account;
          authenticator = verified.authenticator;
          break;
        }
      }
      await handleAuthorized({ user, account }, options);
      const { user: loggedInUser, isNewUser, session: session2, account: currentAccount } = await handleLoginOrRegister(sessionStore.value, user, account, options);
      if (!currentAccount) {
        throw new AuthError("Error creating or finding account");
      }
      if (authenticator && loggedInUser.id) {
        await localOptions.adapter.createAuthenticator({
          ...authenticator,
          userId: loggedInUser.id
        });
      }
      if (useJwtSession) {
        const defaultToken = {
          name: loggedInUser.name,
          email: loggedInUser.email,
          picture: loggedInUser.image,
          sub: loggedInUser.id?.toString()
        };
        const token = await callbacks.jwt({
          token: defaultToken,
          user: loggedInUser,
          account: currentAccount,
          isNewUser,
          trigger: isNewUser ? "signUp" : "signIn"
        });
        if (token === null) {
          cookies.push(...sessionStore.clean());
        } else {
          const salt = options.cookies.sessionToken.name;
          const newToken = await jwt.encode({ ...jwt, token, salt });
          const cookieExpires = /* @__PURE__ */ new Date();
          cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1e3);
          const sessionCookies = sessionStore.chunk(newToken, {
            expires: cookieExpires
          });
          cookies.push(...sessionCookies);
        }
      } else {
        cookies.push({
          name: options.cookies.sessionToken.name,
          value: session2.sessionToken,
          options: {
            ...options.cookies.sessionToken.options,
            expires: session2.expires
          }
        });
      }
      await events.signIn?.({
        user: loggedInUser,
        account: currentAccount,
        isNewUser
      });
      if (isNewUser && pages.newUser) {
        return {
          redirect: `${pages.newUser}${pages.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl })}`,
          cookies
        };
      }
      return { redirect: callbackUrl, cookies };
    }
    throw new InvalidProvider(`Callback for provider type (${provider.type}) is not supported`);
  } catch (e2) {
    if (e2 instanceof AuthError)
      throw e2;
    const error = new CallbackRouteError(e2, { provider: provider.id });
    logger.debug("callback route error details", { method, query, body });
    throw error;
  }
}
async function handleAuthorized(params, config) {
  let authorized;
  const { signIn: signIn2, redirect } = config.callbacks;
  try {
    authorized = await signIn2(params);
  } catch (e2) {
    if (e2 instanceof AuthError)
      throw e2;
    throw new AccessDenied(e2);
  }
  if (!authorized)
    throw new AccessDenied("AccessDenied");
  if (typeof authorized !== "string")
    return;
  return await redirect({ url: authorized, baseUrl: config.url.origin });
}

// node_modules/@auth/core/lib/actions/session.js
async function session(options, sessionStore, cookies, isUpdate, newSession) {
  const { adapter, jwt, events, callbacks, logger, session: { strategy: sessionStrategy, maxAge: sessionMaxAge } } = options;
  const response = {
    body: null,
    headers: { "Content-Type": "application/json" },
    cookies
  };
  const sessionToken = sessionStore.value;
  if (!sessionToken)
    return response;
  if (sessionStrategy === "jwt") {
    try {
      const salt = options.cookies.sessionToken.name;
      const payload = await jwt.decode({ ...jwt, token: sessionToken, salt });
      if (!payload)
        throw new Error("Invalid JWT");
      const token = await callbacks.jwt({
        token: payload,
        ...isUpdate && { trigger: "update" },
        session: newSession
      });
      const newExpires = fromDate(sessionMaxAge);
      if (token !== null) {
        const session2 = {
          user: { name: token.name, email: token.email, image: token.picture },
          expires: newExpires.toISOString()
        };
        const newSession2 = await callbacks.session({ session: session2, token });
        response.body = newSession2;
        const newToken = await jwt.encode({ ...jwt, token, salt });
        const sessionCookies = sessionStore.chunk(newToken, {
          expires: newExpires
        });
        response.cookies?.push(...sessionCookies);
        await events.session?.({ session: newSession2, token });
      } else {
        response.cookies?.push(...sessionStore.clean());
      }
    } catch (e2) {
      logger.error(new JWTSessionError(e2));
      response.cookies?.push(...sessionStore.clean());
    }
    return response;
  }
  try {
    const { getSessionAndUser, deleteSession, updateSession } = adapter;
    let userAndSession = await getSessionAndUser(sessionToken);
    if (userAndSession && userAndSession.session.expires.valueOf() < Date.now()) {
      await deleteSession(sessionToken);
      userAndSession = null;
    }
    if (userAndSession) {
      const { user, session: session2 } = userAndSession;
      const sessionUpdateAge = options.session.updateAge;
      const sessionIsDueToBeUpdatedDate = session2.expires.valueOf() - sessionMaxAge * 1e3 + sessionUpdateAge * 1e3;
      const newExpires = fromDate(sessionMaxAge);
      if (sessionIsDueToBeUpdatedDate <= Date.now()) {
        await updateSession({
          sessionToken,
          expires: newExpires
        });
      }
      const sessionPayload = await callbacks.session({
        // TODO: user already passed below,
        // remove from session object in https://github.com/nextauthjs/next-auth/pull/9702
        // @ts-expect-error
        session: { ...session2, user },
        user,
        newSession,
        ...isUpdate ? { trigger: "update" } : {}
      });
      response.body = sessionPayload;
      response.cookies?.push({
        name: options.cookies.sessionToken.name,
        value: sessionToken,
        options: {
          ...options.cookies.sessionToken.options,
          expires: newExpires
        }
      });
      await events.session?.({ session: sessionPayload });
    } else if (sessionToken) {
      response.cookies?.push(...sessionStore.clean());
    }
  } catch (e2) {
    logger.error(new SessionTokenError(e2));
  }
  return response;
}

// node_modules/@auth/core/lib/actions/signin/authorization-url.js
async function getAuthorizationUrl(query, options) {
  const { logger, provider } = options;
  let url = provider.authorization?.url;
  let as;
  if (!url || url.host === "authjs.dev") {
    const issuer = new URL(provider.issuer);
    const discoveryResponse = await discoveryRequest(issuer, {
      [customFetch2]: provider[customFetch],
      // TODO: move away from allowing insecure HTTP requests
      [allowInsecureRequests]: true
    });
    const as2 = await processDiscoveryResponse(issuer, discoveryResponse);
    if (!as2.authorization_endpoint) {
      throw new TypeError("Authorization server did not provide an authorization endpoint.");
    }
    url = new URL(as2.authorization_endpoint);
  }
  const authParams = url.searchParams;
  let redirect_uri = provider.callbackUrl;
  let data;
  if (!options.isOnRedirectProxy && provider.redirectProxyUrl) {
    redirect_uri = provider.redirectProxyUrl;
    data = provider.callbackUrl;
    logger.debug("using redirect proxy", { redirect_uri, data });
  }
  const params = Object.assign({
    response_type: "code",
    // clientId can technically be undefined, should we check this in assert.ts or rely on the Authorization Server to do it?
    client_id: provider.clientId,
    redirect_uri,
    // @ts-expect-error TODO:
    ...provider.authorization?.params
  }, Object.fromEntries(provider.authorization?.url.searchParams ?? []), query);
  for (const k3 in params)
    authParams.set(k3, params[k3]);
  const cookies = [];
  if (
    // Otherwise "POST /redirect_uri" wouldn't include the cookies
    provider.authorization?.url.searchParams.get("response_mode") === "form_post"
  ) {
    options.cookies.state.options.sameSite = "none";
    options.cookies.state.options.secure = true;
    options.cookies.nonce.options.sameSite = "none";
    options.cookies.nonce.options.secure = true;
  }
  const state2 = await state.create(options, data);
  if (state2) {
    authParams.set("state", state2.value);
    cookies.push(state2.cookie);
  }
  if (provider.checks?.includes("pkce")) {
    if (as && !as.code_challenge_methods_supported?.includes("S256")) {
      if (provider.type === "oidc")
        provider.checks = ["nonce"];
    } else {
      const { value, cookie } = await pkce.create(options);
      authParams.set("code_challenge", value);
      authParams.set("code_challenge_method", "S256");
      cookies.push(cookie);
    }
  }
  const nonce2 = await nonce.create(options);
  if (nonce2) {
    authParams.set("nonce", nonce2.value);
    cookies.push(nonce2.cookie);
  }
  if (provider.type === "oidc" && !url.searchParams.has("scope")) {
    url.searchParams.set("scope", "openid profile email");
  }
  logger.debug("authorization url is ready", { url, cookies, provider });
  return { redirect: url.toString(), cookies };
}

// node_modules/@auth/core/lib/actions/signin/send-token.js
async function sendToken(request, options) {
  const { body } = request;
  const { provider, callbacks, adapter } = options;
  const normalizer = provider.normalizeIdentifier ?? defaultNormalizer;
  const email = normalizer(body?.email);
  const defaultUser = { id: crypto.randomUUID(), email, emailVerified: null };
  const user = await adapter.getUserByEmail(email) ?? defaultUser;
  const account = {
    providerAccountId: email,
    userId: user.id,
    type: "email",
    provider: provider.id
  };
  let authorized;
  try {
    authorized = await callbacks.signIn({
      user,
      account,
      email: { verificationRequest: true }
    });
  } catch (e2) {
    throw new AccessDenied(e2);
  }
  if (!authorized)
    throw new AccessDenied("AccessDenied");
  if (typeof authorized === "string") {
    return {
      redirect: await callbacks.redirect({
        url: authorized,
        baseUrl: options.url.origin
      })
    };
  }
  const { callbackUrl, theme } = options;
  const token = await provider.generateVerificationToken?.() ?? randomString(32);
  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + (provider.maxAge ?? ONE_DAY_IN_SECONDS) * 1e3);
  const secret = provider.secret ?? options.secret;
  const baseUrl = new URL(options.basePath, options.url.origin);
  const sendRequest = provider.sendVerificationRequest({
    identifier: email,
    token,
    expires,
    url: `${baseUrl}/callback/${provider.id}?${new URLSearchParams({
      callbackUrl,
      token,
      email
    })}`,
    provider,
    theme,
    request: toRequest(request)
  });
  const createToken = adapter.createVerificationToken?.({
    identifier: email,
    token: await createHash(`${token}${secret}`),
    expires
  });
  await Promise.all([sendRequest, createToken]);
  return {
    redirect: `${baseUrl}/verify-request?${new URLSearchParams({
      provider: provider.id,
      type: provider.type
    })}`
  };
}
function defaultNormalizer(email) {
  if (!email)
    throw new Error("Missing email from request body.");
  let [local, domain] = email.toLowerCase().trim().split("@");
  domain = domain.split(",")[0];
  return `${local}@${domain}`;
}

// node_modules/@auth/core/lib/actions/signin/index.js
async function signIn(request, cookies, options) {
  const signInUrl = `${options.url.origin}${options.basePath}/signin`;
  if (!options.provider)
    return { redirect: signInUrl, cookies };
  switch (options.provider.type) {
    case "oauth":
    case "oidc": {
      const { redirect, cookies: authCookies } = await getAuthorizationUrl(request.query, options);
      if (authCookies)
        cookies.push(...authCookies);
      return { redirect, cookies };
    }
    case "email": {
      const response = await sendToken(request, options);
      return { ...response, cookies };
    }
    default:
      return { redirect: signInUrl, cookies };
  }
}

// node_modules/@auth/core/lib/actions/signout.js
async function signOut(cookies, sessionStore, options) {
  const { jwt, events, callbackUrl: redirect, logger, session: session2 } = options;
  const sessionToken = sessionStore.value;
  if (!sessionToken)
    return { redirect, cookies };
  try {
    if (session2.strategy === "jwt") {
      const salt = options.cookies.sessionToken.name;
      const token = await jwt.decode({ ...jwt, token: sessionToken, salt });
      await events.signOut?.({ token });
    } else {
      const session3 = await options.adapter?.deleteSession(sessionToken);
      await events.signOut?.({ session: session3 });
    }
  } catch (e2) {
    logger.error(new SignOutError(e2));
  }
  cookies.push(...sessionStore.clean());
  return { redirect, cookies };
}

// node_modules/@auth/core/lib/utils/session.js
async function getLoggedInUser(options, sessionStore) {
  const { adapter, jwt, session: { strategy: sessionStrategy } } = options;
  const sessionToken = sessionStore.value;
  if (!sessionToken)
    return null;
  if (sessionStrategy === "jwt") {
    const salt = options.cookies.sessionToken.name;
    const payload = await jwt.decode({ ...jwt, token: sessionToken, salt });
    if (payload && payload.sub) {
      return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        image: payload.picture
      };
    }
  } else {
    const userAndSession = await adapter?.getSessionAndUser(sessionToken);
    if (userAndSession) {
      return userAndSession.user;
    }
  }
  return null;
}

// node_modules/@auth/core/lib/actions/webauthn-options.js
async function webAuthnOptions(request, options, sessionStore, cookies) {
  const narrowOptions = assertInternalOptionsWebAuthn(options);
  const { provider } = narrowOptions;
  const { action } = request.query ?? {};
  if (action !== "register" && action !== "authenticate" && typeof action !== "undefined") {
    return {
      status: 400,
      body: { error: "Invalid action" },
      cookies,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
  const sessionUser = await getLoggedInUser(options, sessionStore);
  const getUserInfoResponse = sessionUser ? {
    user: sessionUser,
    exists: true
  } : await provider.getUserInfo(options, request);
  const userInfo = getUserInfoResponse?.user;
  const decision = inferWebAuthnOptions(action, !!sessionUser, getUserInfoResponse);
  switch (decision) {
    case "authenticate":
      return getAuthenticationResponse(narrowOptions, request, userInfo, cookies);
    case "register":
      if (typeof userInfo?.email === "string") {
        return getRegistrationResponse(narrowOptions, request, userInfo, cookies);
      }
      break;
    default:
      return {
        status: 400,
        body: { error: "Invalid request" },
        cookies,
        headers: {
          "Content-Type": "application/json"
        }
      };
  }
}

// node_modules/@auth/core/lib/index.js
async function AuthInternal(request, authOptions) {
  const { action, providerId, error, method } = request;
  const csrfDisabled = authOptions.skipCSRFCheck === skipCSRFCheck;
  const { options, cookies } = await init({
    authOptions,
    action,
    providerId,
    url: request.url,
    callbackUrl: request.body?.callbackUrl ?? request.query?.callbackUrl,
    csrfToken: request.body?.csrfToken,
    cookies: request.cookies,
    isPost: method === "POST",
    csrfDisabled
  });
  const sessionStore = new SessionStore(options.cookies.sessionToken, request.cookies, options.logger);
  if (method === "GET") {
    const render = renderPage({ ...options, query: request.query, cookies });
    switch (action) {
      case "callback":
        return await callback(request, options, sessionStore, cookies);
      case "csrf":
        return render.csrf(csrfDisabled, options, cookies);
      case "error":
        return render.error(error);
      case "providers":
        return render.providers(options.providers);
      case "session":
        return await session(options, sessionStore, cookies);
      case "signin":
        return render.signin(providerId, error);
      case "signout":
        return render.signout();
      case "verify-request":
        return render.verifyRequest();
      case "webauthn-options":
        return await webAuthnOptions(request, options, sessionStore, cookies);
      default:
    }
  } else {
    const { csrfTokenVerified } = options;
    switch (action) {
      case "callback":
        if (options.provider.type === "credentials")
          validateCSRF(action, csrfTokenVerified);
        return await callback(request, options, sessionStore, cookies);
      case "session":
        validateCSRF(action, csrfTokenVerified);
        return await session(options, sessionStore, cookies, true, request.body?.data);
      case "signin":
        validateCSRF(action, csrfTokenVerified);
        return await signIn(request, cookies, options);
      case "signout":
        validateCSRF(action, csrfTokenVerified);
        return await signOut(cookies, sessionStore, options);
      default:
    }
  }
  throw new UnknownAction(`Cannot handle action: ${action}`);
}

// node_modules/@auth/core/lib/utils/env.js
function setEnvDefaults(envObject, config, suppressBasePathWarning = false) {
  try {
    const url = envObject.AUTH_URL;
    if (url) {
      if (config.basePath) {
        if (!suppressBasePathWarning) {
          const logger = setLogger(config);
          logger.warn("env-url-basepath-redundant");
        }
      } else {
        config.basePath = new URL(url).pathname;
      }
    }
  } catch {
  } finally {
    config.basePath ?? (config.basePath = `/auth`);
  }
  if (!config.secret?.length) {
    config.secret = [];
    const secret = envObject.AUTH_SECRET;
    if (secret)
      config.secret.push(secret);
    for (const i4 of [1, 2, 3]) {
      const secret2 = envObject[`AUTH_SECRET_${i4}`];
      if (secret2)
        config.secret.unshift(secret2);
    }
  }
  config.redirectProxyUrl ?? (config.redirectProxyUrl = envObject.AUTH_REDIRECT_PROXY_URL);
  config.trustHost ?? (config.trustHost = !!(envObject.AUTH_URL ?? envObject.AUTH_TRUST_HOST ?? envObject.VERCEL ?? envObject.CF_PAGES ?? envObject.NODE_ENV !== "production"));
  config.providers = config.providers.map((provider) => {
    const { id } = typeof provider === "function" ? provider({}) : provider;
    const ID = id.toUpperCase().replace(/-/g, "_");
    const clientId = envObject[`AUTH_${ID}_ID`];
    const clientSecret = envObject[`AUTH_${ID}_SECRET`];
    const issuer = envObject[`AUTH_${ID}_ISSUER`];
    const apiKey = envObject[`AUTH_${ID}_KEY`];
    const finalProvider = typeof provider === "function" ? provider({ clientId, clientSecret, issuer, apiKey }) : provider;
    if (finalProvider.type === "oauth" || finalProvider.type === "oidc") {
      finalProvider.clientId ?? (finalProvider.clientId = clientId);
      finalProvider.clientSecret ?? (finalProvider.clientSecret = clientSecret);
      finalProvider.issuer ?? (finalProvider.issuer = issuer);
    } else if (finalProvider.type === "email") {
      finalProvider.apiKey ?? (finalProvider.apiKey = apiKey);
    }
    return finalProvider;
  });
}

// node_modules/@auth/core/index.js
async function Auth(request, config) {
  const logger = setLogger(config);
  const internalRequest = await toInternalRequest(request, config);
  if (!internalRequest)
    return Response.json(`Bad request.`, { status: 400 });
  const warningsOrError = assertConfig(internalRequest, config);
  if (Array.isArray(warningsOrError)) {
    warningsOrError.forEach(logger.warn);
  } else if (warningsOrError) {
    logger.error(warningsOrError);
    const htmlPages = /* @__PURE__ */ new Set([
      "signin",
      "signout",
      "error",
      "verify-request"
    ]);
    if (!htmlPages.has(internalRequest.action) || internalRequest.method !== "GET") {
      const message2 = "There was a problem with the server configuration. Check the server logs for more information.";
      return Response.json({ message: message2 }, { status: 500 });
    }
    const { pages, theme } = config;
    const authOnErrorPage = pages?.error && internalRequest.url.searchParams.get("callbackUrl")?.startsWith(pages.error);
    if (!pages?.error || authOnErrorPage) {
      if (authOnErrorPage) {
        logger.error(new ErrorPageLoop(`The error page ${pages?.error} should not require authentication`));
      }
      const page = renderPage({ theme }).error("Configuration");
      return toResponse(page);
    }
    const url = `${internalRequest.url.origin}${pages.error}?error=Configuration`;
    return Response.redirect(url);
  }
  const isRedirect = request.headers?.has("X-Auth-Return-Redirect");
  const isRaw = config.raw === raw2;
  try {
    const internalResponse = await AuthInternal(internalRequest, config);
    if (isRaw)
      return internalResponse;
    const response = toResponse(internalResponse);
    const url = response.headers.get("Location");
    if (!isRedirect || !url)
      return response;
    return Response.json({ url }, { headers: response.headers });
  } catch (e2) {
    const error = e2;
    logger.error(error);
    const isAuthError = error instanceof AuthError;
    if (isAuthError && isRaw && !isRedirect)
      throw error;
    if (request.method === "POST" && internalRequest.action === "session")
      return Response.json(null, { status: 400 });
    const isClientSafeErrorType = isClientError(error);
    const type = isClientSafeErrorType ? error.type : "Configuration";
    const params = new URLSearchParams({ error: type });
    if (error instanceof CredentialsSignin)
      params.set("code", error.code);
    const pageKind = isAuthError && error.kind || "error";
    const pagePath = config.pages?.[pageKind] ?? `${config.basePath}/${pageKind.toLowerCase()}`;
    const url = `${internalRequest.url.origin}${pagePath}?${params}`;
    if (isRedirect)
      return Response.json({ url });
    return Response.redirect(url);
  }
}

// node_modules/hono/dist/helper/adapter/index.js
var env = (c3, runtime) => {
  const global = globalThis;
  const globalEnv = global?.process?.env;
  runtime ??= getRuntimeKey();
  const runtimeEnvHandlers = {
    bun: () => globalEnv,
    node: () => globalEnv,
    "edge-light": () => globalEnv,
    deno: () => {
      return Deno.env.toObject();
    },
    workerd: () => c3.env,
    fastly: () => ({}),
    other: () => ({})
  };
  return runtimeEnvHandlers[runtime]();
};
var knownUserAgents = {
  deno: "Deno",
  bun: "Bun",
  workerd: "Cloudflare-Workers",
  node: "Node.js"
};
var getRuntimeKey = () => {
  const global = globalThis;
  const userAgentSupported = typeof navigator !== "undefined" && true;
  if (userAgentSupported) {
    for (const [runtimeKey, userAgent] of Object.entries(knownUserAgents)) {
      if (checkUserAgentEquals(userAgent)) {
        return runtimeKey;
      }
    }
  }
  if (typeof global?.EdgeRuntime === "string") {
    return "edge-light";
  }
  if (global?.fastly !== void 0) {
    return "fastly";
  }
  if (global?.process?.release?.name === "node") {
    return "node";
  }
  return "other";
};
var checkUserAgentEquals = (platform) => {
  const userAgent = "Cloudflare-Workers";
  return userAgent.startsWith(platform);
};

// node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  res;
  status;
  constructor(status = 500, options) {
    super(options?.message, { cause: options?.cause });
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      const newResponse = new Response(this.res.body, {
        status: this.status,
        headers: this.res.headers
      });
      return newResponse;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};

// node_modules/@hono/auth-js/dist/index.mjs
function setEnvDefaults2(env2, config) {
  config.secret ??= env2.AUTH_SECRET;
  setEnvDefaults(env2, config);
}
function reqWithEnvUrl(req, authUrl) {
  if (authUrl) {
    const reqUrlObj = new URL(req.url);
    const authUrlObj = new URL(authUrl);
    const props = ["hostname", "protocol", "port", "password", "username"];
    for (const prop of props) {
      if (authUrlObj[prop])
        reqUrlObj[prop] = authUrlObj[prop];
    }
    return new Request(reqUrlObj.href, req);
  }
  const url = new URL(req.url);
  const newReq = new Request(url.href, req);
  const proto = newReq.headers.get("x-forwarded-proto");
  const host = newReq.headers.get("x-forwarded-host") ?? newReq.headers.get("host");
  if (proto != null)
    url.protocol = proto.endsWith(":") ? proto : `${proto}:`;
  if (host != null) {
    url.host = host;
    const portMatch = host.match(/:(\d+)$/);
    if (portMatch)
      url.port = portMatch[1];
    else
      url.port = "";
    newReq.headers.delete("x-forwarded-host");
    newReq.headers.delete("Host");
    newReq.headers.set("Host", host);
  }
  return new Request(url.href, newReq);
}
async function getAuthUser(c3) {
  const config = c3.get("authConfig");
  const ctxEnv = env(c3);
  setEnvDefaults2(ctxEnv, config);
  const authReq = reqWithEnvUrl(c3.req.raw, ctxEnv.AUTH_URL);
  const origin = new URL(authReq.url).origin;
  const request = new Request(`${origin}${config.basePath}/session`, {
    headers: { cookie: c3.req.header("cookie") ?? "" }
  });
  let authUser = {};
  const response = await Auth(request, {
    ...config,
    callbacks: {
      ...config.callbacks,
      async session(...args) {
        authUser = args[0];
        const session22 = await config.callbacks?.session?.(...args) ?? args[0].session;
        const user = args[0].user ?? args[0].token;
        return { user, ...session22 };
      }
    }
  });
  const session2 = await response.json();
  return session2?.user ? authUser : null;
}
function verifyAuth() {
  return async (c3, next) => {
    const authUser = await getAuthUser(c3);
    const isAuth = !!authUser?.token || !!authUser?.user;
    if (!isAuth) {
      const res = new Response("Unauthorized", {
        status: 401
      });
      throw new HTTPException(401, { res });
    }
    c3.set("authUser", authUser);
    await next();
  };
}
function initAuthConfig(cb) {
  return async (c3, next) => {
    const config = cb(c3);
    c3.set("authConfig", config);
    await next();
  };
}
function authHandler() {
  return async (c3) => {
    const config = c3.get("authConfig");
    const ctxEnv = env(c3);
    setEnvDefaults2(ctxEnv, config);
    if (!config.secret || config.secret.length === 0) {
      throw new HTTPException(500, { message: "Missing AUTH_SECRET" });
    }
    const res = await Auth(reqWithEnvUrl(c3.req.raw, ctxEnv.AUTH_URL), config);
    return new Response(res.body, res);
  };
}

// src/_middlewares/checkAdmin.ts
var CheckAdmin = async (c3, next) => {
  const authUser = await getAuthUser(c3);
  const token = authUser?.token;
  console.log(token?.email);
  if (!token?.email)
    return c3.json({ error: "Email field is empty" }, 400);
  try {
    const sql2 = Xs(c3.env.DATABASE_URL);
    const db = drizzle(sql2, { schema: schema_exports });
    const user = await db.select({
      email: users.email,
      role: users.role
    }).from(users).where(eq(users.email, token.email));
    if (!user.length)
      return c3.json({ error: "User not found" }, 404);
    if (user[0].role !== "ADMIN") {
      return c3.json({ error: "Unauthorized - Admin access required" }, 403);
    }
    await next();
  } catch (error) {
    console.error("Error checking admin:", error);
    return c3.json({ error }, 500);
  }
};
var checkAdmin_default = CheckAdmin;

// node_modules/zod/lib/index.mjs
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k3) => typeof obj[obj[k3]] !== "number");
    const filtered = {};
    for (const k3 of validKeys) {
      filtered[k3] = obj[k3];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e2) {
      return obj[e2];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_4, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json2 = JSON.stringify(obj, null, 2);
  return json2.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i4 = 0;
          while (i4 < issue.path.length) {
            const el = issue.path[i4];
            const terminal = i4 === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i4++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
var errorMap = (issue, _ctx) => {
  let message2;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message2 = "Required";
      } else {
        message2 = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message2 = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message2 = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message2 = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message2 = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message2 = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message2 = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message2 = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message2 = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message2 = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message2 = `${message2} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message2 = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message2 = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message2 = `Invalid ${issue.validation}`;
      } else {
        message2 = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message2 = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message2 = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message2 = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message2 = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message2 = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message2 = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message2 = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message2 = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message2 = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message2 = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message2 = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message2 = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message2 = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message2 = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message2 = "Number must be finite";
      break;
    default:
      message2 = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message: message2 };
};
var overrideErrorMap = errorMap;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m2) => !!m2).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === errorMap ? void 0 : errorMap
      // then global default map
    ].filter((x4) => !!x4)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s3 of results) {
      if (s3.status === "aborted")
        return INVALID;
      if (s3.status === "dirty")
        status.dirty();
      arrayValue.push(s3.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x4) => x4.status === "aborted";
var isDirty = (x4) => x4.status === "dirty";
var isValid = (x4) => x4.status === "valid";
var isAsync = (x4) => typeof Promise !== "undefined" && x4 instanceof Promise;
function __classPrivateFieldGet2(receiver, state2, kind, f4) {
  if (kind === "a" && !f4)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state2 === "function" ? receiver !== state2 || !f4 : !state2.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f4 : kind === "a" ? f4.call(receiver) : f4 ? f4.value : state2.get(receiver);
}
function __classPrivateFieldSet2(receiver, state2, value, kind, f4) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f4)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state2 === "function" ? receiver !== state2 || !f4 : !state2.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f4.call(receiver, value) : f4 ? f4.value = value : state2.set(receiver, value), value;
}
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message2) => typeof message2 === "string" ? { message: message2 } : message2 || {};
  errorUtil2.toString = (message2) => typeof message2 === "string" ? message2 : message2 === null || message2 === void 0 ? void 0 : message2.message;
})(errorUtil || (errorUtil = {}));
var _ZodEnum_cache;
var _ZodNativeEnum_cache;
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    var _a150, _b;
    const { message: message2 } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message2 !== null && message2 !== void 0 ? message2 : ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: (_a150 = message2 !== null && message2 !== void 0 ? message2 : required_error) !== null && _a150 !== void 0 ? _a150 : ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: (_b = message2 !== null && message2 !== void 0 ? message2 : invalid_type_error) !== null && _b !== void 0 ? _b : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a150;
    const ctx = {
      common: {
        issues: [],
        async: (_a150 = params === null || params === void 0 ? void 0 : params.async) !== null && _a150 !== void 0 ? _a150 : false,
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    var _a150, _b;
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if ((_b = (_a150 = err === null || err === void 0 ? void 0 : err.message) === null || _a150 === void 0 ? void 0 : _a150.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
        async: true
      },
      path: (params === null || params === void 0 ? void 0 : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check2, message2) {
    const getIssueProperties = (val) => {
      if (typeof message2 === "string" || typeof message2 === "undefined") {
        return { message: message2 };
      } else if (typeof message2 === "function") {
        return message2(val);
      } else {
        return message2;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check2(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check2, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check2(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg2) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if (!decoded.typ || !decoded.alg)
      return false;
    if (alg2 && decoded.alg !== alg2)
      return false;
    return true;
  } catch (_a150) {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check2 of this._def.checks) {
      if (check2.kind === "min") {
        if (input.data.length < check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check2.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "max") {
        if (input.data.length > check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check2.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "length") {
        const tooBig = input.data.length > check2.value;
        const tooSmall = input.data.length < check2.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check2.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check2.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check2.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check2.message
            });
          }
          status.dirty();
        }
      } else if (check2.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a150) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "regex") {
        check2.regex.lastIndex = 0;
        const testResult = check2.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "trim") {
        input.data = input.data.trim();
      } else if (check2.kind === "includes") {
        if (!input.data.includes(check2.value, check2.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check2.value, position: check2.position },
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check2.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check2.kind === "startsWith") {
        if (!input.data.startsWith(check2.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check2.value },
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "endsWith") {
        if (!input.data.endsWith(check2.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check2.value },
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "datetime") {
        const regex = datetimeRegex(check2);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "time") {
        const regex = timeRegex(check2);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "ip") {
        if (!isValidIP(input.data, check2.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "jwt") {
        if (!isValidJWT(input.data, check2.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "cidr") {
        if (!isValidCidr(input.data, check2.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message2) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message2)
    });
  }
  _addCheck(check2) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  email(message2) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message2) });
  }
  url(message2) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message2) });
  }
  emoji(message2) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message2) });
  }
  uuid(message2) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message2) });
  }
  nanoid(message2) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message2) });
  }
  cuid(message2) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message2) });
  }
  cuid2(message2) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message2) });
  }
  ulid(message2) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message2) });
  }
  base64(message2) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message2) });
  }
  base64url(message2) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message2)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a150, _b;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      offset: (_a150 = options === null || options === void 0 ? void 0 : options.offset) !== null && _a150 !== void 0 ? _a150 : false,
      local: (_b = options === null || options === void 0 ? void 0 : options.local) !== null && _b !== void 0 ? _b : false,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  date(message2) {
    return this._addCheck({ kind: "date", message: message2 });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  duration(message2) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message2) });
  }
  regex(regex, message2) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message2)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === void 0 ? void 0 : options.position,
      ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
    });
  }
  startsWith(value, message2) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message2)
    });
  }
  endsWith(value, message2) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message2)
    });
  }
  min(minLength, message2) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message2)
    });
  }
  max(maxLength, message2) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message2)
    });
  }
  length(len, message2) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message2)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message2) {
    return this.min(1, errorUtil.errToObj(message2));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  var _a150;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a150 = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a150 !== void 0 ? _a150 : false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
var ZodNumber = class extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check2 of this._def.checks) {
      if (check2.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "min") {
        const tooSmall = check2.inclusive ? input.data < check2.value : input.data <= check2.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check2.value,
            type: "number",
            inclusive: check2.inclusive,
            exact: false,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "max") {
        const tooBig = check2.inclusive ? input.data > check2.value : input.data >= check2.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check2.value,
            type: "number",
            inclusive: check2.inclusive,
            exact: false,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check2.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check2.value,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check2.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message2) {
    return this.setLimit("min", value, true, errorUtil.toString(message2));
  }
  gt(value, message2) {
    return this.setLimit("min", value, false, errorUtil.toString(message2));
  }
  lte(value, message2) {
    return this.setLimit("max", value, true, errorUtil.toString(message2));
  }
  lt(value, message2) {
    return this.setLimit("max", value, false, errorUtil.toString(message2));
  }
  setLimit(kind, value, inclusive, message2) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message2)
        }
      ]
    });
  }
  _addCheck(check2) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  int(message2) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message2)
    });
  }
  positive(message2) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  negative(message2) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  nonpositive(message2) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  nonnegative(message2) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  multipleOf(value, message2) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message2)
    });
  }
  finite(message2) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message2)
    });
  }
  safe(message2) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message2)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message2)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch (_a150) {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check2 of this._def.checks) {
      if (check2.kind === "min") {
        const tooSmall = check2.inclusive ? input.data < check2.value : input.data <= check2.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check2.value,
            inclusive: check2.inclusive,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "max") {
        const tooBig = check2.inclusive ? input.data > check2.value : input.data >= check2.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check2.value,
            inclusive: check2.inclusive,
            message: check2.message
          });
          status.dirty();
        }
      } else if (check2.kind === "multipleOf") {
        if (input.data % check2.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check2.value,
            message: check2.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message2) {
    return this.setLimit("min", value, true, errorUtil.toString(message2));
  }
  gt(value, message2) {
    return this.setLimit("min", value, false, errorUtil.toString(message2));
  }
  lte(value, message2) {
    return this.setLimit("max", value, true, errorUtil.toString(message2));
  }
  lt(value, message2) {
    return this.setLimit("max", value, false, errorUtil.toString(message2));
  }
  setLimit(kind, value, inclusive, message2) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message2)
        }
      ]
    });
  }
  _addCheck(check2) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  positive(message2) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  negative(message2) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  nonpositive(message2) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  nonnegative(message2) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  multipleOf(value, message2) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message2)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  var _a150;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a150 = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a150 !== void 0 ? _a150 : false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check2 of this._def.checks) {
      if (check2.kind === "min") {
        if (input.data.getTime() < check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check2.message,
            inclusive: true,
            exact: false,
            minimum: check2.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check2.kind === "max") {
        if (input.data.getTime() > check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check2.message,
            inclusive: true,
            exact: false,
            maximum: check2.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check2) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  min(minDate, message2) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message2)
    });
  }
  max(maxDate, message2) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message2)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i4) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i4));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i4) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i4));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message2) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message2) }
    });
  }
  max(maxLength, message2) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message2) }
    });
  }
  length(len, message2) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message2) }
    });
  }
  nonempty(message2) {
    return this.min(1, message2);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return this._cached = { shape, keys };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip")
        ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message2) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message2 !== void 0 ? {
        errorMap: (issue, ctx) => {
          var _a150, _b, _c, _d;
          const defaultError = (_c = (_b = (_a150 = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a150, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d = errorUtil.errToObj(message2).message) !== null && _d !== void 0 ? _d : defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types2, params) => {
  return new ZodUnion({
    options: types2,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a4, b2) {
  const aType = getParsedType(a4);
  const bType = getParsedType(b2);
  if (a4 === b2) {
    return { valid: true, data: a4 };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b2);
    const sharedKeys = util.objectKeys(a4).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a4, ...b2 };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a4[key], b2[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a4.length !== b2.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a4.length; index++) {
      const itemA = a4[index];
      const itemB = b2[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a4 === +b2) {
    return { valid: true, data: a4 };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x4) => !!x4);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i4) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i4)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message2) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message2) }
    });
  }
  max(maxSize, message2) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message2) }
    });
  }
  size(size, message2) {
    return this.min(size, message2).max(size, message2);
  }
  nonempty(message2) {
    return this.min(1, message2);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x4) => !!x4),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x4) => !!x4),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e2) => {
          error.addIssue(makeArgsIssue(args, e2));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e2) => {
          error.addIssue(makeReturnsIssue(result, e2));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class extends ZodType {
  constructor() {
    super(...arguments);
    _ZodEnum_cache.set(this, void 0);
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet2(this, _ZodEnum_cache, "f")) {
      __classPrivateFieldSet2(this, _ZodEnum_cache, new Set(this._def.values), "f");
    }
    if (!__classPrivateFieldGet2(this, _ZodEnum_cache, "f").has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
_ZodEnum_cache = /* @__PURE__ */ new WeakMap();
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  constructor() {
    super(...arguments);
    _ZodNativeEnum_cache.set(this, void 0);
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet2(this, _ZodNativeEnum_cache, "f")) {
      __classPrivateFieldSet2(this, _ZodNativeEnum_cache, new Set(util.getValidEnumValues(this._def.values)), "f");
    }
    if (!__classPrivateFieldGet2(this, _ZodNativeEnum_cache, "f").has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
_ZodNativeEnum_cache = /* @__PURE__ */ new WeakMap();
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a4, b2) {
    return new ZodPipeline({
      in: a4,
      out: b2,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function custom(check2, params = {}, fatal) {
  if (check2)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a150, _b;
      if (!check2(data)) {
        const p4 = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
        const _fatal = (_b = (_a150 = p4.fatal) !== null && _a150 !== void 0 ? _a150 : fatal) !== null && _b !== void 0 ? _b : true;
        const p22 = typeof p4 === "string" ? { message: p4 } : p4;
        ctx.addIssue({ code: "custom", ...p22, fatal: _fatal });
      }
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;
var z3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  datetimeRegex,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  "enum": enumType,
  "function": functionType,
  "instanceof": instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  "null": nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  "undefined": undefinedType,
  union: unionType,
  unknown: unknownType,
  "void": voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError
});

// src/lib/z.validation.ts
var CredValidation = z3.object({
  email: z3.string(),
  userName: z3.string()
});
var CreateUserValidation = z3.object({
  name: z3.string(),
  email: z3.string().email(),
  avatarUrl: z3.string(),
  role: z3.string(),
  provider: z3.string(),
  mobileNumber: z3.number()
});
var DescriptionObject = z3.object({
  desp1: z3.string(),
  desp2: z3.string(),
  desp3: z3.string()
});
var ImageObject = z3.object({
  image_url: z3.string().url(),
  image_alt: z3.string()
});
var HomepageContentValidation = z3.object({
  popular_categories: z3.array(ImageObject),
  recent_deals: ImageObject,
  popular_products: z3.array(ImageObject),
  slides: z3.array(ImageObject),
  popular_with_men: z3.array(ImageObject),
  popular_with_women: z3.array(ImageObject)
});
var UpdateUserVlidation = z3.object({
  email: z3.string().email(),
  name: z3.string().optional(),
  avatarUrl: z3.string().optional(),
  mobileNumber: z3.number()
});
var AddProductValidation = z3.object({
  title: z3.string(),
  brand: z3.string(),
  price: z3.string(),
  description: z3.array(DescriptionObject),
  imageUrls: z3.array(ImageObject)
});

// src/_controllers/Homepage/homepage_contents.ts
var GetHomePageContents = async (c3) => {
  if (!c3.env.DATABASE_URL) {
    return c3.json(
      {
        error: "Configuration error",
        message: "DATABASE_URL is not set"
      },
      500
    );
  }
  const sql2 = Xs(c3.env.DATABASE_URL);
  const db = drizzle(sql2, { schema: schema_exports });
  if (c3.req.method === "GET") {
    try {
      const Response2 = await db.query.homepage_contents.findMany();
      return c3.json({ Response: "success" }, 200);
    } catch (error) {
      console.error("Error in HomePageContents:", error);
      return c3.json(
        {
          error: "Internal server error",
          message: "Failed to fetch homepage contents"
        },
        500
      );
    }
  }
};
var AddHomePageContents = async (c3) => {
  if (!c3.env.DATABASE_URL) {
    return c3.json(
      {
        error: "Configuration error",
        message: "DATABASE_URL is not set"
      },
      500
    );
  }
  const sql2 = Xs(c3.env.DATABASE_URL);
  const db = drizzle(sql2, { schema: schema_exports });
  if (c3.req.method === "POST") {
    try {
      const body = await c3.req.json();
      const validatedData = HomepageContentValidation.parse(body);
      await db.insert(homepage_contents).values({
        popular_categories: validatedData.popular_categories,
        recent_deals: validatedData.recent_deals,
        popular_products: validatedData.popular_products,
        slides: validatedData.slides,
        popular_with_men: validatedData.popular_with_men,
        popular_with_women: validatedData.popular_with_women
      });
      return c3.json(
        {
          message: "Homepage contents updated successfully",
          data: validatedData
        },
        201
      );
    } catch (error) {
      console.error("Error in HomePageContents POST:", error);
      if (error instanceof z3.ZodError) {
        return c3.json(
          {
            error: "Validation error",
            message: error.errors
          },
          400
        );
      }
      return c3.json(
        {
          error: "Internal server error",
          message: "Failed to update homepage contents"
        },
        500
      );
    }
  }
};

// src/_routes/homepage.ts
var HomepageRouter = new Hono2();
HomepageRouter.get("get-data", checkAdmin_default, GetHomePageContents);
HomepageRouter.post("add-data", verifyAuth(), AddHomePageContents);
var homepage_default = HomepageRouter;

// src/pages/404.ts
var notFound = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 - Page Not Found</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        background: linear-gradient(45deg, #1a1a1a, #2c2c2c);
        color: #fff;
      }
      .container {
        text-align: center;
        padding: 2rem;
      }
      .error-code {
        font-size: 120px;
        font-weight: bold;
        margin: 0;
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
      }
      .error-text {
        font-size: 24px;
        margin: 1rem 0;
        color: #9e9e9e;
      }
      .back-button {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        color: white;
        text-decoration: none;
        border-radius: 25px;
        font-weight: bold;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .back-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="error-code">404</h1>
      <p class="error-text">Oops! The page you're looking for doesn't exist.</p>
      <a href="/" class="back-button">Go Back Home</a>
    </div>
  </body>
</html>`;
var __default = notFound;

// node_modules/@auth/core/providers/google.js
function Google(options) {
  return {
    id: "google",
    name: "Google",
    type: "oidc",
    issuer: "https://accounts.google.com",
    style: {
      brandColor: "#1a73e8"
    },
    options
  };
}

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  return async function cors2(c3, next) {
    function set(key, value) {
      c3.res.headers.set(key, value);
    }
    const allowOrigin = findAllowOrigin(c3.req.header("origin") || "", c3);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c3.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c3.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      if (opts.allowMethods?.length) {
        set("Access-Control-Allow-Methods", opts.allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c3.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c3.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c3.res.headers.delete("Content-Length");
      c3.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c3.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  };
};

// src/_db/functions.ts
var isUserAlreadyExists = async (db, email) => {
  try {
    const userData = await db.select().from(users).where(eq(users.email, email));
    console.log(userData);
    const user = {
      isExists: userData.length > 0,
      name: userData[0]?.name,
      userId: userData[0]?.userId,
      role: userData[0]?.role,
      email: userData[0]?.email
    };
    return user;
  } catch (error) {
    console.error("Error checking user existence:", error);
  }
};

// src/_controllers/User/createUser.ts
var createUser = async (db, userInfo) => {
  const validatedData = CreateUserValidation.parse(userInfo);
  try {
    const [user] = await db.insert(users).values(userInfo).returning({ name: users.name, email: users.email });
    console.log("Database: User Created Successfully");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};
var createUser_default = createUser;

// src/_controllers/User/updateUser.ts
var UpdateUser = async (c3) => {
  const sql2 = Xs(c3.env.DATABASE_URL);
  const db = drizzle(sql2, { schema: schema_exports });
  if (c3.req.method === "PATCH") {
    try {
      const UserData = await c3.req.json();
      const validatedData = UpdateUserVlidation.parse(UserData);
      const User = await isUserAlreadyExists(db, validatedData.email);
      if (User?.isExists) {
        const response = await db.update(users).set({
          name: validatedData.name,
          avatarUrl: validatedData.avatarUrl,
          mobileNumber: validatedData.mobileNumber
        }).where(eq(users.userId, User.userId));
        console.log("User updated successfully");
      } else {
        console.log("User not exists");
      }
      return c3.json({ message: "User updated successfully" }, 200);
    } catch (error) {
      console.error("Error updating user:", error);
      return c3.json({ error: "Failed to update user" }, 500);
    }
  }
  return c3.json({ error: "Method not allowed" }, 405);
};
var updateUser_default = UpdateUser;

// src/_routes/user.ts
var UserRouter = new Hono2();
UserRouter.patch("update-user", verifyAuth(), updateUser_default);
var user_default = UserRouter;

// node_modules/@auth/core/providers/credentials.js
function Credentials(config) {
  return {
    id: "credentials",
    name: "Credentials",
    type: "credentials",
    credentials: {},
    authorize: () => null,
    // @ts-expect-error
    options: config
  };
}

// src/_controllers/Products/getProducts.ts
async function GetProducts(c3) {
  const sql2 = Xs(c3.env.DATABASE_URL);
  const db = drizzle(sql2, { schema: schema_exports });
  try {
    return c3.json({ message: "data" }, 200);
  } catch (error) {
    console.log(error);
    return c3.json({ error }, 500);
  }
}

// src/_controllers/Products/addProducts.ts
async function AddProduct(c3) {
  try {
    if (c3.req.method !== "POST")
      return c3.json({ error: "Invalid Method" }, 405);
    const sql2 = Xs(c3.env.DATABASE_URL);
    const db = drizzle(sql2, { schema: schema_exports });
    const body = await c3.req.json();
    const validatedData = AddProductValidation.parse(body);
    const [product] = await db.insert(void 0).values({
      title: validatedData.title,
      brand: validatedData.brand,
      price: validatedData.price,
      description: validatedData.description,
      imageUrls: validatedData.imageUrls
    }).returning({
      title: (void 0).title,
      brand: (void 0).brand,
      price: (void 0).price
    });
    return c3.json({ message: "Added product successfully", product }, 200);
  } catch (error) {
    return c3.json({ error }, 500);
  }
}

// src/_routes/product.ts
var ProductRouter = new Hono2();
ProductRouter.get("get-products", GetProducts);
ProductRouter.post("add-products", verifyAuth(), checkAdmin_default, AddProduct);
var product_default = ProductRouter;

// src/index.ts
var app = new Hono2();
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true
  })
);
app.get("/", (c3) => {
  return c3.text("Hello Praveen!");
});
app.use(
  initAuthConfig((c3) => ({
    basePath: "/api/auth",
    secret: c3.env.AUTH_SECRET || process.env.AUTH_SECRET,
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email" },
          userName: { label: "Name" }
        },
        async authorize({ email, userName }) {
          const sql2 = Xs(c3.env.DATABASE_URL);
          const db = drizzle(sql2, { schema: schema_exports });
          if (!email) {
            return Error("Email field is empty");
          }
          const validatedData = CredValidation.parse({ email, userName });
          const User = await isUserAlreadyExists(db, validatedData.email);
          if (!User?.isExists) {
            return await createUser_default(db, {
              name: validatedData.userName,
              email: validatedData.email,
              avatarUrl: "",
              role: "USER",
              provider: "Credentails",
              mobileNumber: 0
            });
          }
          console.log("User already exists");
          throw new Error("User already exists");
        }
      }),
      Google({
        clientId: c3.env.CLIENT_ID || process.env.CLIENT_ID,
        clientSecret: c3.env.CLIENT_SECRET || process.env.CLIENT_SECRET
      })
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        const sql2 = Xs(c3.env.DATABASE_URL);
        const db = drizzle(sql2, { schema: schema_exports });
        if (user && "email" in user) {
          const oauthUser = {
            name: user.name || "",
            avatarUrl: user.image || "",
            role: "USER",
            email: user.email || "",
            mobileNumber: parseInt(profile?.phone_number || "0", 10),
            provider: account?.provider || ""
          };
          const userExists = await isUserAlreadyExists(db, oauthUser.email);
          if (!userExists?.isExists) {
            await createUser_default(db, oauthUser);
          }
          if (userExists?.role === "USER") {
            console.log("User already exists", userExists);
            console.log("User logged in successfully");
            return true;
          }
          console.log("User Logged in successfully");
          return true;
        } else {
          console.error("Invalid user object during sign-in", user);
          return false;
        }
      }
    }
  }))
);
app.use("/api/auth/*", authHandler());
app.route("/api/homepage", homepage_default);
app.route("/api/user-info", user_default);
app.use("/api/product", verifyAuth());
app.route("/api/product", product_default);
app.use("/api/protected", async (c3) => {
  const authInfo = c3.get("authUser");
  console.log(authInfo);
  return c3.json(authInfo);
});
app.notFound((c3) => {
  return c3.html(__default);
});
var src_default = {
  port: 8080,
  fetch: app.fetch
};

// C:/Users/prave/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e2) {
      console.error("Failed to drain the unused request body.", e2);
    }
  }
};
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/prave/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e2) {
  return {
    name: e2?.name,
    message: e2?.message ?? String(e2),
    stack: e2?.stack,
    cause: e2?.cause === void 0 ? void 0 : reduceError(e2.cause)
  };
}
var jsonError = async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e2) {
    const error = reduceError(e2);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
};
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oOsIM4/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// C:/Users/prave/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}

// .wrangler/tmp/bundle-oOsIM4/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  };
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = function(type, init2) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init2.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      };
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init2) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init2.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

@neondatabase/serverless/index.mjs:
  (*! Bundled license information:
  
  ieee754/index.js:
    (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  
  buffer/index.js:
    (*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     *)
  *)

@auth/core/lib/vendored/cookie.js:
  (**
   * @source https://github.com/jshttp/cookie
   * @author blakeembrey
   * @license MIT
   *)
*/
//# sourceMappingURL=index.js.map
