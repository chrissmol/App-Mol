//#region node_modules/@firebase/util/dist/postinstall.mjs
var e = () => void 0, t = function(e) {
	let t = [], n = 0;
	for (let r = 0; r < e.length; r++) {
		let i = e.charCodeAt(r);
		i < 128 ? t[n++] = i : i < 2048 ? (t[n++] = i >> 6 | 192, t[n++] = i & 63 | 128) : (i & 64512) == 55296 && r + 1 < e.length && (e.charCodeAt(r + 1) & 64512) == 56320 ? (i = 65536 + ((i & 1023) << 10) + (e.charCodeAt(++r) & 1023), t[n++] = i >> 18 | 240, t[n++] = i >> 12 & 63 | 128, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128) : (t[n++] = i >> 12 | 224, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128);
	}
	return t;
}, n = function(e) {
	let t = [], n = 0, r = 0;
	for (; n < e.length;) {
		let i = e[n++];
		if (i < 128) t[r++] = String.fromCharCode(i);
		else if (i > 191 && i < 224) {
			let a = e[n++];
			t[r++] = String.fromCharCode((i & 31) << 6 | a & 63);
		} else if (i > 239 && i < 365) {
			let a = e[n++], o = e[n++], s = e[n++], c = ((i & 7) << 18 | (a & 63) << 12 | (o & 63) << 6 | s & 63) - 65536;
			t[r++] = String.fromCharCode(55296 + (c >> 10)), t[r++] = String.fromCharCode(56320 + (c & 1023));
		} else {
			let a = e[n++], o = e[n++];
			t[r++] = String.fromCharCode((i & 15) << 12 | (a & 63) << 6 | o & 63);
		}
	}
	return t.join("");
}, r = {
	byteToCharMap_: null,
	charToByteMap_: null,
	byteToCharMapWebSafe_: null,
	charToByteMapWebSafe_: null,
	ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
	get ENCODED_VALS() {
		return this.ENCODED_VALS_BASE + "+/=";
	},
	get ENCODED_VALS_WEBSAFE() {
		return this.ENCODED_VALS_BASE + "-_.";
	},
	HAS_NATIVE_SUPPORT: typeof atob == "function",
	encodeByteArray(e, t) {
		if (!Array.isArray(e)) throw Error("encodeByteArray takes an array as a parameter");
		this.init_();
		let n = t ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
		for (let t = 0; t < e.length; t += 3) {
			let i = e[t], a = t + 1 < e.length, o = a ? e[t + 1] : 0, s = t + 2 < e.length, c = s ? e[t + 2] : 0, l = i >> 2, u = (i & 3) << 4 | o >> 4, d = (o & 15) << 2 | c >> 6, f = c & 63;
			s || (f = 64, a || (d = 64)), r.push(n[l], n[u], n[d], n[f]);
		}
		return r.join("");
	},
	encodeString(e, n) {
		return this.HAS_NATIVE_SUPPORT && !n ? btoa(e) : this.encodeByteArray(t(e), n);
	},
	decodeString(e, t) {
		return this.HAS_NATIVE_SUPPORT && !t ? atob(e) : n(this.decodeStringToByteArray(e, t));
	},
	decodeStringToByteArray(e, t) {
		this.init_();
		let n = t ? this.charToByteMapWebSafe_ : this.charToByteMap_, r = [];
		for (let t = 0; t < e.length;) {
			let a = n[e.charAt(t++)], o = t < e.length ? n[e.charAt(t)] : 0;
			++t;
			let s = t < e.length ? n[e.charAt(t)] : 64;
			++t;
			let c = t < e.length ? n[e.charAt(t)] : 64;
			if (++t, a == null || o == null || s == null || c == null) throw new i();
			let l = a << 2 | o >> 4;
			if (r.push(l), s !== 64) {
				let e = o << 4 & 240 | s >> 2;
				if (r.push(e), c !== 64) {
					let e = s << 6 & 192 | c;
					r.push(e);
				}
			}
		}
		return r;
	},
	init_() {
		if (!this.byteToCharMap_) {
			this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
			for (let e = 0; e < this.ENCODED_VALS.length; e++) this.byteToCharMap_[e] = this.ENCODED_VALS.charAt(e), this.charToByteMap_[this.byteToCharMap_[e]] = e, this.byteToCharMapWebSafe_[e] = this.ENCODED_VALS_WEBSAFE.charAt(e), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]] = e, e >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)] = e, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)] = e);
		}
	}
}, i = class extends Error {
	constructor() {
		super(...arguments), this.name = "DecodeBase64StringError";
	}
}, a = function(e) {
	let n = t(e);
	return r.encodeByteArray(n, !0);
}, o = function(e) {
	return a(e).replace(/\./g, "");
}, s = function(e) {
	try {
		return r.decodeString(e, !0);
	} catch (e) {
		console.error("base64Decode failed: ", e);
	}
	return null;
};
function c() {
	if (typeof self < "u") return self;
	if (typeof window < "u") return window;
	if (typeof global < "u") return global;
	throw Error("Unable to locate global object.");
}
var l = () => c().__FIREBASE_DEFAULTS__, u = () => {
	if (typeof process > "u" || process.env === void 0) return;
	let e = process.env.__FIREBASE_DEFAULTS__;
	if (e) return JSON.parse(e);
}, d = () => {
	if (typeof document > "u") return;
	let e;
	try {
		e = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
	} catch {
		return;
	}
	let t = e && s(e[1]);
	return t && JSON.parse(t);
}, f = () => {
	try {
		return e() || l() || u() || d();
	} catch (e) {
		console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
		return;
	}
}, p = (e) => f()?.emulatorHosts?.[e], m = (e) => {
	let t = p(e);
	if (!t) return;
	let n = t.lastIndexOf(":");
	if (n <= 0 || n + 1 === t.length) throw Error(`Invalid host ${t} with no separate hostname and port!`);
	let r = parseInt(t.substring(n + 1), 10);
	return t[0] === "[" ? [t.substring(1, n - 1), r] : [t.substring(0, n), r];
}, h = () => f()?.config, g = (e) => f()?.[`_${e}`], _ = class {
	constructor() {
		this.reject = () => {}, this.resolve = () => {}, this.promise = new Promise((e, t) => {
			this.resolve = e, this.reject = t;
		});
	}
	wrapCallback(e) {
		return (t, n) => {
			t ? this.reject(t) : this.resolve(n), typeof e == "function" && (this.promise.catch(() => {}), e.length === 1 ? e(t) : e(t, n));
		};
	}
};
function ee(e, t) {
	if (e.uid) throw Error("The \"uid\" field is no longer supported by mockUserToken. Please use \"sub\" instead for Firebase Auth User ID.");
	let n = {
		alg: "none",
		type: "JWT"
	}, r = t || "demo-project", i = e.iat || 0, a = e.sub || e.user_id;
	if (!a) throw Error("mockUserToken must contain 'sub' or 'user_id' field!");
	let s = {
		iss: `https://securetoken.google.com/${r}`,
		aud: r,
		iat: i,
		exp: i + 3600,
		auth_time: i,
		sub: a,
		user_id: a,
		firebase: {
			sign_in_provider: "custom",
			identities: {}
		},
		...e
	};
	return [
		o(JSON.stringify(n)),
		o(JSON.stringify(s)),
		""
	].join(".");
}
function v() {
	return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function te() {
	return typeof window < "u" && !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(v());
}
function ne() {
	let e = f()?.forceEnvironment;
	if (e === "node") return !0;
	if (e === "browser") return !1;
	try {
		return Object.prototype.toString.call(global.process) === "[object process]";
	} catch {
		return !1;
	}
}
function re() {
	return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function ie() {
	let e = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
	return typeof e == "object" && e.id !== void 0;
}
function ae() {
	return typeof navigator == "object" && navigator.product === "ReactNative";
}
function oe() {
	let e = v();
	return e.indexOf("MSIE ") >= 0 || e.indexOf("Trident/") >= 0;
}
function se() {
	return !ne() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function ce() {
	try {
		return typeof indexedDB == "object";
	} catch {
		return !1;
	}
}
function le() {
	return new Promise((e, t) => {
		try {
			let n = !0, r = "validate-browser-context-for-indexeddb-analytics-module", i = self.indexedDB.open(r);
			i.onsuccess = () => {
				i.result.close(), n || self.indexedDB.deleteDatabase(r), e(!0);
			}, i.onupgradeneeded = () => {
				n = !1;
			}, i.onerror = () => {
				t(i.error?.message || "");
			};
		} catch (e) {
			t(e);
		}
	});
}
var ue = "FirebaseError", de = class e extends Error {
	constructor(t, n, r) {
		super(n), this.code = t, this.customData = r, this.name = ue, Object.setPrototypeOf(this, e.prototype), Error.captureStackTrace && Error.captureStackTrace(this, fe.prototype.create);
	}
}, fe = class {
	constructor(e, t, n) {
		this.service = e, this.serviceName = t, this.errors = n;
	}
	create(e, ...t) {
		let n = t[0] || {}, r = `${this.service}/${e}`, i = this.errors[e], a = i ? pe(i, n) : "Error";
		return new de(r, `${this.serviceName}: ${a} (${r}).`, n);
	}
};
function pe(e, t) {
	try {
		let n = 0, r = "";
		for (; n < e.length;) {
			let i = e.indexOf("{$", n);
			if (i === -1) {
				r += e.substring(n);
				break;
			}
			let a = e.indexOf("}", i + 2);
			if (a === -1) {
				r += e.substring(n);
				break;
			}
			let o = e.substring(i + 2, a), s = t[o];
			r += e.substring(n, i) + (s == null ? `<${o}?>` : String(s)), n = a + 1;
		}
		return r;
	} catch {
		return e;
	}
}
function me(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
	return !0;
}
function he(e, t) {
	if (e === t) return !0;
	let n = Object.keys(e), r = Object.keys(t);
	for (let i of n) {
		if (!r.includes(i)) return !1;
		let n = e[i], a = t[i];
		if (ge(n) && ge(a)) {
			if (!he(n, a)) return !1;
		} else if (n !== a) return !1;
	}
	for (let e of r) if (!n.includes(e)) return !1;
	return !0;
}
function ge(e) {
	return typeof e == "object" && !!e;
}
function _e(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) Array.isArray(r) ? r.forEach((e) => {
		t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e));
	}) : t.push(encodeURIComponent(n) + "=" + encodeURIComponent(r));
	return t.length ? "&" + t.join("&") : "";
}
function ve(e) {
	let t = {};
	return e.replace(/^\?/, "").split("&").forEach((e) => {
		if (e) {
			let [n, r] = e.split("=");
			t[decodeURIComponent(n)] = decodeURIComponent(r);
		}
	}), t;
}
function ye(e) {
	let t = e.indexOf("?");
	if (!t) return "";
	let n = e.indexOf("#", t);
	return e.substring(t, n > 0 ? n : void 0);
}
function be(e, t) {
	let n = new xe(e, t);
	return n.subscribe.bind(n);
}
var xe = class {
	constructor(e, t) {
		this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = t, this.task.then(() => {
			e(this);
		}).catch((e) => {
			this.error(e);
		});
	}
	next(e) {
		this.forEachObserver((t) => {
			t.next(e);
		});
	}
	error(e) {
		this.forEachObserver((t) => {
			t.error(e);
		}), this.close(e);
	}
	complete() {
		this.forEachObserver((e) => {
			e.complete();
		}), this.close();
	}
	subscribe(e, t, n) {
		let r;
		if (e === void 0 && t === void 0 && n === void 0) throw Error("Missing Observer.");
		r = Se(e, [
			"next",
			"error",
			"complete"
		]) ? e : {
			next: e,
			error: t,
			complete: n
		}, r.next === void 0 && (r.next = Ce), r.error === void 0 && (r.error = Ce), r.complete === void 0 && (r.complete = Ce);
		let i = this.unsubscribeOne.bind(this, this.observers.length);
		return this.finalized && this.task.then(() => {
			try {
				this.finalError ? r.error(this.finalError) : r.complete();
			} catch {}
		}), this.observers.push(r), i;
	}
	unsubscribeOne(e) {
		this.observers !== void 0 && this.observers[e] !== void 0 && (delete this.observers[e], --this.observerCount, this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
	}
	forEachObserver(e) {
		if (!this.finalized) for (let t = 0; t < this.observers.length; t++) this.sendOne(t, e);
	}
	sendOne(e, t) {
		this.task.then(() => {
			if (this.observers !== void 0 && this.observers[e] !== void 0) try {
				t(this.observers[e]);
			} catch (e) {
				typeof console < "u" && console.error && console.error(e);
			}
		});
	}
	close(e) {
		this.finalized || (this.finalized = !0, e !== void 0 && (this.finalError = e), this.task.then(() => {
			this.observers = void 0, this.onNoObservers = void 0;
		}));
	}
};
function Se(e, t) {
	if (typeof e != "object" || !e) return !1;
	for (let n of t) if (n in e && typeof e[n] == "function") return !0;
	return !1;
}
function Ce() {}
var we = 1e3, Te = 2, Ee = 144e5, De = .5;
function Oe(e, t = we, n = Te) {
	let r = t * n ** +e, i = Math.round(De * r * (Math.random() - .5) * 2);
	return Math.min(Ee, r + i);
}
function y(e) {
	return e && e._delegate ? e._delegate : e;
}
function ke(e) {
	try {
		return (e.startsWith("http://") || e.startsWith("https://") ? new URL(e).hostname : e).endsWith(".cloudworkstations.dev");
	} catch {
		return !1;
	}
}
async function Ae(e) {
	return (await fetch(e, { credentials: "include" })).ok;
}
//#endregion
//#region node_modules/@firebase/component/dist/esm/index.esm.js
var je = class {
	constructor(e, t, n) {
		this.name = e, this.instanceFactory = t, this.type = n, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
	}
	setInstantiationMode(e) {
		return this.instantiationMode = e, this;
	}
	setMultipleInstances(e) {
		return this.multipleInstances = e, this;
	}
	setServiceProps(e) {
		return this.serviceProps = e, this;
	}
	setInstanceCreatedCallback(e) {
		return this.onInstanceCreated = e, this;
	}
}, Me = "[DEFAULT]", Ne = class {
	constructor(e, t) {
		this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
	}
	get(e) {
		let t = this.normalizeInstanceIdentifier(e);
		if (!this.instancesDeferred.has(t)) {
			let e = new _();
			if (this.instancesDeferred.set(t, e), this.isInitialized(t) || this.shouldAutoInitialize()) try {
				let n = this.getOrInitializeService({ instanceIdentifier: t });
				n && e.resolve(n);
			} catch {}
		}
		return this.instancesDeferred.get(t).promise;
	}
	getImmediate(e) {
		let t = this.normalizeInstanceIdentifier(e?.identifier), n = e?.optional ?? !1;
		if (this.isInitialized(t) || this.shouldAutoInitialize()) try {
			return this.getOrInitializeService({ instanceIdentifier: t });
		} catch (e) {
			if (n) return null;
			throw e;
		}
		if (n) return null;
		throw Error(`Service ${this.name} is not available`);
	}
	getComponent() {
		return this.component;
	}
	setComponent(e) {
		if (e.name !== this.name) throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
		if (this.component) throw Error(`Component for ${this.name} has already been provided`);
		if (this.component = e, this.shouldAutoInitialize()) {
			if (Fe(e)) try {
				this.getOrInitializeService({ instanceIdentifier: Me });
			} catch {}
			for (let [e, t] of this.instancesDeferred.entries()) {
				let n = this.normalizeInstanceIdentifier(e);
				try {
					let e = this.getOrInitializeService({ instanceIdentifier: n });
					t.resolve(e);
				} catch {}
			}
		}
	}
	clearInstance(e = Me) {
		this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
	}
	async delete() {
		let e = Array.from(this.instances.values());
		await Promise.all([...e.filter((e) => "INTERNAL" in e).map((e) => e.INTERNAL.delete()), ...e.filter((e) => "_delete" in e).map((e) => e._delete())]);
	}
	isComponentSet() {
		return this.component != null;
	}
	isInitialized(e = Me) {
		return this.instances.has(e);
	}
	getOptions(e = Me) {
		return this.instancesOptions.get(e) || {};
	}
	initialize(e = {}) {
		let { options: t = {} } = e, n = this.normalizeInstanceIdentifier(e.instanceIdentifier);
		if (this.isInitialized(n)) throw Error(`${this.name}(${n}) has already been initialized`);
		if (!this.isComponentSet()) throw Error(`Component ${this.name} has not been registered yet`);
		let r = this.getOrInitializeService({
			instanceIdentifier: n,
			options: t
		});
		for (let [e, t] of this.instancesDeferred.entries()) n === this.normalizeInstanceIdentifier(e) && t.resolve(r);
		return r;
	}
	onInit(e, t) {
		let n = this.normalizeInstanceIdentifier(t), r = this.onInitCallbacks.get(n) ?? /* @__PURE__ */ new Set();
		r.add(e), this.onInitCallbacks.set(n, r);
		let i = this.instances.get(n);
		return i && e(i, n), () => {
			r.delete(e);
		};
	}
	invokeOnInitCallbacks(e, t) {
		let n = this.onInitCallbacks.get(t);
		if (n) for (let r of n) try {
			r(e, t);
		} catch {}
	}
	getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
		let n = this.instances.get(e);
		if (!n && this.component && (n = this.component.instanceFactory(this.container, {
			instanceIdentifier: Pe(e),
			options: t
		}), this.instances.set(e, n), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(n, e), this.component.onInstanceCreated)) try {
			this.component.onInstanceCreated(this.container, e, n);
		} catch {}
		return n || null;
	}
	normalizeInstanceIdentifier(e = Me) {
		return this.component ? this.component.multipleInstances ? e : Me : e;
	}
	shouldAutoInitialize() {
		return !!this.component && this.component.instantiationMode !== "EXPLICIT";
	}
};
function Pe(e) {
	return e === Me ? void 0 : e;
}
function Fe(e) {
	return e.instantiationMode === "EAGER";
}
var Ie = class {
	constructor(e) {
		this.name = e, this.providers = /* @__PURE__ */ new Map();
	}
	addComponent(e) {
		let t = this.getProvider(e.name);
		if (t.isComponentSet()) throw Error(`Component ${e.name} has already been registered with ${this.name}`);
		t.setComponent(e);
	}
	addOrOverwriteComponent(e) {
		this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
	}
	getProvider(e) {
		if (this.providers.has(e)) return this.providers.get(e);
		let t = new Ne(e, this);
		return this.providers.set(e, t), t;
	}
	getProviders() {
		return Array.from(this.providers.values());
	}
}, Le = [], b;
(function(e) {
	e[e.DEBUG = 0] = "DEBUG", e[e.VERBOSE = 1] = "VERBOSE", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.SILENT = 5] = "SILENT";
})(b ||= {});
var Re = {
	debug: b.DEBUG,
	verbose: b.VERBOSE,
	info: b.INFO,
	warn: b.WARN,
	error: b.ERROR,
	silent: b.SILENT
}, ze = b.INFO, Be = {
	[b.DEBUG]: "log",
	[b.VERBOSE]: "log",
	[b.INFO]: "info",
	[b.WARN]: "warn",
	[b.ERROR]: "error"
}, Ve = (e, t, ...n) => {
	if (t < e.logLevel) return;
	let r = (/* @__PURE__ */ new Date()).toISOString(), i = Be[t];
	if (i) console[i](`[${r}]  ${e.name}:`, ...n);
	else throw Error(`Attempted to log a message with an invalid logType (value: ${t})`);
}, He = class {
	constructor(e) {
		this.name = e, this._logLevel = ze, this._logHandler = Ve, this._userLogHandler = null, Le.push(this);
	}
	get logLevel() {
		return this._logLevel;
	}
	set logLevel(e) {
		if (!(e in b)) throw TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
		this._logLevel = e;
	}
	setLogLevel(e) {
		this._logLevel = typeof e == "string" ? Re[e] : e;
	}
	get logHandler() {
		return this._logHandler;
	}
	set logHandler(e) {
		if (typeof e != "function") throw TypeError("Value assigned to `logHandler` must be a function");
		this._logHandler = e;
	}
	get userLogHandler() {
		return this._userLogHandler;
	}
	set userLogHandler(e) {
		this._userLogHandler = e;
	}
	debug(...e) {
		this._userLogHandler && this._userLogHandler(this, b.DEBUG, ...e), this._logHandler(this, b.DEBUG, ...e);
	}
	log(...e) {
		this._userLogHandler && this._userLogHandler(this, b.VERBOSE, ...e), this._logHandler(this, b.VERBOSE, ...e);
	}
	info(...e) {
		this._userLogHandler && this._userLogHandler(this, b.INFO, ...e), this._logHandler(this, b.INFO, ...e);
	}
	warn(...e) {
		this._userLogHandler && this._userLogHandler(this, b.WARN, ...e), this._logHandler(this, b.WARN, ...e);
	}
	error(...e) {
		this._userLogHandler && this._userLogHandler(this, b.ERROR, ...e), this._logHandler(this, b.ERROR, ...e);
	}
}, Ue = (e, t) => t.some((t) => e instanceof t), We, Ge;
function Ke() {
	return We ||= [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	];
}
function qe() {
	return Ge ||= [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	];
}
var Je = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap();
function $e(e) {
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("success", i), e.removeEventListener("error", a);
		}, i = () => {
			t(at(e.result)), r();
		}, a = () => {
			n(e.error), r();
		};
		e.addEventListener("success", i), e.addEventListener("error", a);
	});
	return t.then((t) => {
		t instanceof IDBCursor && Je.set(t, e);
	}).catch(() => {}), Qe.set(t, e), t;
}
function et(e) {
	if (Ye.has(e)) return;
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("complete", i), e.removeEventListener("error", a), e.removeEventListener("abort", a);
		}, i = () => {
			t(), r();
		}, a = () => {
			n(e.error || new DOMException("AbortError", "AbortError")), r();
		};
		e.addEventListener("complete", i), e.addEventListener("error", a), e.addEventListener("abort", a);
	});
	Ye.set(e, t);
}
var tt = {
	get(e, t, n) {
		if (e instanceof IDBTransaction) {
			if (t === "done") return Ye.get(e);
			if (t === "objectStoreNames") return e.objectStoreNames || Xe.get(e);
			if (t === "store") return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
		}
		return at(e[t]);
	},
	set(e, t, n) {
		return e[t] = n, !0;
	},
	has(e, t) {
		return e instanceof IDBTransaction && (t === "done" || t === "store") || t in e;
	}
};
function nt(e) {
	tt = e(tt);
}
function rt(e) {
	return e === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(t, ...n) {
		let r = e.call(ot(this), t, ...n);
		return Xe.set(r, t.sort ? t.sort() : [t]), at(r);
	} : qe().includes(e) ? function(...t) {
		return e.apply(ot(this), t), at(Je.get(this));
	} : function(...t) {
		return at(e.apply(ot(this), t));
	};
}
function it(e) {
	return typeof e == "function" ? rt(e) : (e instanceof IDBTransaction && et(e), Ue(e, Ke()) ? new Proxy(e, tt) : e);
}
function at(e) {
	if (e instanceof IDBRequest) return $e(e);
	if (Ze.has(e)) return Ze.get(e);
	let t = it(e);
	return t !== e && (Ze.set(e, t), Qe.set(t, e)), t;
}
var ot = (e) => Qe.get(e);
//#endregion
//#region node_modules/idb/build/index.js
function st(e, t, { blocked: n, upgrade: r, blocking: i, terminated: a } = {}) {
	let o = indexedDB.open(e, t), s = at(o);
	return r && o.addEventListener("upgradeneeded", (e) => {
		r(at(o.result), e.oldVersion, e.newVersion, at(o.transaction), e);
	}), n && o.addEventListener("blocked", (e) => n(e.oldVersion, e.newVersion, e)), s.then((e) => {
		a && e.addEventListener("close", () => a()), i && e.addEventListener("versionchange", (e) => i(e.oldVersion, e.newVersion, e));
	}).catch(() => {}), s;
}
var ct = [
	"get",
	"getKey",
	"getAll",
	"getAllKeys",
	"count"
], lt = [
	"put",
	"add",
	"delete",
	"clear"
], ut = /* @__PURE__ */ new Map();
function dt(e, t) {
	if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string")) return;
	if (ut.get(t)) return ut.get(t);
	let n = t.replace(/FromIndex$/, ""), r = t !== n, i = lt.includes(n);
	if (!(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || ct.includes(n))) return;
	let a = async function(e, ...t) {
		let a = this.transaction(e, i ? "readwrite" : "readonly"), o = a.store;
		return r && (o = o.index(t.shift())), (await Promise.all([o[n](...t), i && a.done]))[0];
	};
	return ut.set(t, a), a;
}
nt((e) => ({
	...e,
	get: (t, n, r) => dt(t, n) || e.get(t, n, r),
	has: (t, n) => !!dt(t, n) || e.has(t, n)
}));
//#endregion
//#region node_modules/@firebase/app/dist/esm/index.esm.js
var ft = class {
	constructor(e) {
		this.container = e;
	}
	getPlatformInfoString() {
		return this.container.getProviders().map((e) => {
			if (pt(e)) {
				let t = e.getImmediate();
				return `${t.library}/${t.version}`;
			}
			return null;
		}).filter((e) => e).join(" ");
	}
};
function pt(e) {
	return e.getComponent()?.type === "VERSION";
}
var mt = "@firebase/app", ht = "0.16.1", gt = new He("@firebase/app"), _t = "@firebase/app-compat", vt = "@firebase/analytics-compat", yt = "@firebase/analytics", bt = "@firebase/app-check-compat", xt = "@firebase/app-check", St = "@firebase/auth", Ct = "@firebase/auth-compat", wt = "@firebase/database", Tt = "@firebase/data-connect", Et = "@firebase/database-compat", Dt = "@firebase/functions", Ot = "@firebase/functions-compat", kt = "@firebase/installations", At = "@firebase/installations-compat", jt = "@firebase/messaging", Mt = "@firebase/messaging-compat", Nt = "@firebase/performance", Pt = "@firebase/performance-compat", Ft = "@firebase/remote-config", It = "@firebase/remote-config-compat", Lt = "@firebase/storage", Rt = "@firebase/storage-compat", zt = "@firebase/firestore", Bt = "@firebase/ai", Vt = "@firebase/firestore-compat", Ht = "firebase", Ut = "12.18.0", Wt = "[DEFAULT]", Gt = {
	[mt]: "fire-core",
	[_t]: "fire-core-compat",
	[yt]: "fire-analytics",
	[vt]: "fire-analytics-compat",
	[xt]: "fire-app-check",
	[bt]: "fire-app-check-compat",
	[St]: "fire-auth",
	[Ct]: "fire-auth-compat",
	[wt]: "fire-rtdb",
	[Tt]: "fire-data-connect",
	[Et]: "fire-rtdb-compat",
	[Dt]: "fire-fn",
	[Ot]: "fire-fn-compat",
	[kt]: "fire-iid",
	[At]: "fire-iid-compat",
	[jt]: "fire-fcm",
	[Mt]: "fire-fcm-compat",
	[Nt]: "fire-perf",
	[Pt]: "fire-perf-compat",
	[Ft]: "fire-rc",
	[It]: "fire-rc-compat",
	[Lt]: "fire-gcs",
	[Rt]: "fire-gcs-compat",
	[zt]: "fire-fst",
	[Vt]: "fire-fst-compat",
	[Bt]: "fire-vertex",
	"fire-js": "fire-js",
	[Ht]: "fire-js-all"
}, Kt = /* @__PURE__ */ new Map(), qt = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map();
function Jt(e, t) {
	try {
		e.container.addComponent(t);
	} catch (n) {
		gt.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`, n);
	}
}
function Yt(e) {
	let t = e.name;
	if (x.has(t)) return gt.debug(`There were multiple attempts to register component ${t}.`), !1;
	x.set(t, e);
	for (let t of Kt.values()) Jt(t, e);
	for (let t of qt.values()) Jt(t, e);
	return !0;
}
function Xt(e, t) {
	let n = e.container.getProvider("heartbeat").getImmediate({ optional: !0 });
	return n && n.triggerHeartbeat(), e.container.getProvider(t);
}
function Zt(e) {
	return e != null && e.settings !== void 0;
}
var Qt = new fe("app", "Firebase", {
	"no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
	"bad-app-name": "Illegal App name: '{$appName}'",
	"duplicate-app": "Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.",
	"app-deleted": "Firebase App named '{$appName}' already deleted",
	"server-app-deleted": "Firebase Server App has been deleted",
	"no-options": "Need to provide options, when not being deployed to hosting via source.",
	"invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
	"invalid-log-argument": "First argument to `onLog` must be null or a function.",
	"idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
	"idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
	"idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
	"idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
	"finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
	"invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
}), $t = class {
	constructor(e, t, n) {
		this._isDeleted = !1, this._options = { ...e }, this._config = { ...t }, this._name = t.name, this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled, this._container = n, this.container.addComponent(new je("app", () => this, "PUBLIC"));
	}
	get automaticDataCollectionEnabled() {
		return this.checkDestroyed(), this._automaticDataCollectionEnabled;
	}
	set automaticDataCollectionEnabled(e) {
		this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
	}
	get name() {
		return this.checkDestroyed(), this._name;
	}
	get options() {
		return this.checkDestroyed(), this._options;
	}
	get config() {
		return this.checkDestroyed(), this._config;
	}
	get container() {
		return this._container;
	}
	get isDeleted() {
		return this._isDeleted;
	}
	set isDeleted(e) {
		this._isDeleted = e;
	}
	checkDestroyed() {
		if (this.isDeleted) throw Qt.create("app-deleted", { appName: this._name });
	}
}, en = Ut;
function tn(e, t = {}) {
	let n = e;
	typeof t != "object" && (t = { name: t });
	let r = {
		name: Wt,
		automaticDataCollectionEnabled: !0,
		...t
	}, i = r.name;
	if (typeof i != "string" || !i) throw Qt.create("bad-app-name", { appName: String(i) });
	if (n ||= h(), !n) throw Qt.create("no-options");
	let a = Kt.get(i);
	if (a) {
		if (!he(n, a.options)) throw Qt.create("duplicate-app", {
			appName: i,
			mismatchedParam: "options",
			oldValue: JSON.stringify(a.options),
			newValue: JSON.stringify(n)
		});
		if (he(r, a.config)) return a;
		throw Qt.create("duplicate-app", {
			appName: i,
			mismatchedParam: "config",
			oldValue: JSON.stringify(a.config),
			newValue: JSON.stringify(r)
		});
	}
	let o = new Ie(i);
	for (let e of x.values()) o.addComponent(e);
	let s = new $t(n, r, o);
	return Kt.set(i, s), s;
}
function nn(e = Wt) {
	let t = Kt.get(e);
	if (!t && e === "[DEFAULT]" && h()) return tn();
	if (!t) throw Qt.create("no-app", { appName: e });
	return t;
}
function rn(e, t, n) {
	let r = Gt[e] ?? e;
	n && (r += `-${n}`);
	let i = r.match(/\s|\//), a = t.match(/\s|\//);
	if (i || a) {
		let e = [`Unable to register library "${r}" with version "${t}":`];
		i && e.push(`library name "${r}" contains illegal characters (whitespace or "/")`), i && a && e.push("and"), a && e.push(`version name "${t}" contains illegal characters (whitespace or "/")`), gt.warn(e.join(" "));
		return;
	}
	Yt(new je(`${r}-version`, () => ({
		library: r,
		version: t
	}), "VERSION"));
}
var an = "firebase-heartbeat-database", on = 1, sn = "firebase-heartbeat-store", cn = null;
function ln() {
	return cn ||= st(an, on, { upgrade: (e, t) => {
		if (t === 0) try {
			e.createObjectStore(sn);
		} catch (e) {
			console.warn(e);
		}
	} }).catch((e) => {
		throw Qt.create("idb-open", { originalErrorMessage: e.message });
	}), cn;
}
async function un(e) {
	try {
		let t = (await ln()).transaction(sn), n = await t.objectStore(sn).get(fn(e));
		return await t.done, n;
	} catch (e) {
		if (e instanceof de) gt.warn(e.message);
		else {
			let t = Qt.create("idb-get", { originalErrorMessage: e?.message });
			gt.warn(t.message);
		}
	}
}
async function dn(e, t) {
	try {
		let n = (await ln()).transaction(sn, "readwrite");
		await n.objectStore(sn).put(t, fn(e)), await n.done;
	} catch (e) {
		if (e instanceof de) gt.warn(e.message);
		else {
			let t = Qt.create("idb-set", { originalErrorMessage: e?.message });
			gt.warn(t.message);
		}
	}
}
function fn(e) {
	return `${e.name}!${e.options.appId}`;
}
var pn = 1024, mn = 30, hn = class {
	constructor(e) {
		this.container = e, this._heartbeatsCache = null;
		let t = this.container.getProvider("app").getImmediate();
		this._storage = new vn(t), this._heartbeatsCachePromise = this._storage.read().then((e) => (this._heartbeatsCache = e, e));
	}
	async triggerHeartbeat() {
		try {
			let e = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), t = gn();
			if (this._heartbeatsCache?.heartbeats == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null) || this._heartbeatsCache.lastSentHeartbeatDate === t || this._heartbeatsCache.heartbeats.some((e) => e.date === t)) return;
			if (this._heartbeatsCache.heartbeats.push({
				date: t,
				agent: e
			}), this._heartbeatsCache.heartbeats.length > mn) {
				let e = bn(this._heartbeatsCache.heartbeats);
				this._heartbeatsCache.heartbeats.splice(e, 1);
			}
			return this._storage.overwrite(this._heartbeatsCache);
		} catch (e) {
			gt.warn(e);
		}
	}
	async getHeartbeatsHeader() {
		try {
			if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) return "";
			let e = gn(), { heartbeatsToSend: t, unsentEntries: n } = _n(this._heartbeatsCache.heartbeats), r = o(JSON.stringify({
				version: 2,
				heartbeats: t
			}));
			return this._heartbeatsCache.lastSentHeartbeatDate = e, n.length > 0 ? (this._heartbeatsCache.heartbeats = n, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), r;
		} catch (e) {
			return gt.warn(e), "";
		}
	}
};
function gn() {
	return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function _n(e, t = pn) {
	let n = [], r = e.slice();
	for (let i of e) {
		let e = n.find((e) => e.agent === i.agent);
		if (!e) {
			if (n.push({
				agent: i.agent,
				dates: [i.date]
			}), yn(n) > t) {
				n.pop();
				break;
			}
		} else if (e.dates.push(i.date), yn(n) > t) {
			e.dates.pop();
			break;
		}
		r = r.slice(1);
	}
	return {
		heartbeatsToSend: n,
		unsentEntries: r
	};
}
var vn = class {
	constructor(e) {
		this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
	}
	async runIndexedDBEnvironmentCheck() {
		return ce() ? le().then(() => !0).catch(() => !1) : !1;
	}
	async read() {
		if (await this._canUseIndexedDBPromise) {
			let e = await un(this.app);
			return e?.heartbeats ? e : { heartbeats: [] };
		}
		return { heartbeats: [] };
	}
	async overwrite(e) {
		if (await this._canUseIndexedDBPromise) {
			let t = await this.read();
			return dn(this.app, {
				lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
				heartbeats: e.heartbeats
			});
		}
	}
	async add(e) {
		if (await this._canUseIndexedDBPromise) {
			let t = await this.read();
			return dn(this.app, {
				lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
				heartbeats: [...t.heartbeats, ...e.heartbeats]
			});
		}
	}
};
function yn(e) {
	return o(JSON.stringify({
		version: 2,
		heartbeats: e
	})).length;
}
function bn(e) {
	if (e.length === 0) return -1;
	let t = 0, n = e[0].date;
	for (let r = 1; r < e.length; r++) e[r].date < n && (n = e[r].date, t = r);
	return t;
}
function xn(e) {
	Yt(new je("platform-logger", (e) => new ft(e), "PRIVATE")), Yt(new je("heartbeat", (e) => new hn(e), "PRIVATE")), rn(mt, ht, e), rn(mt, ht, "esm2020"), rn("fire-js", "");
}
xn("");
//#endregion
//#region node_modules/@firebase/app-check/dist/esm/index.esm.js
var Sn = /* @__PURE__ */ new Map(), Cn = {
	activated: !1,
	tokenObservers: []
}, S = {
	initialized: !1,
	enabled: !1
};
function wn(e) {
	return Sn.get(e) || { ...Cn };
}
function Tn(e, t) {
	return Sn.set(e, t), Sn.get(e);
}
function En() {
	return S;
}
var Dn = "https://content-firebaseappcheck.googleapis.com/v1", On = "exchangeRecaptchaEnterpriseToken", kn = "exchangeDebugToken", An = {
	RETRIAL_MIN_WAIT: 3e4,
	RETRIAL_MAX_WAIT: 96e4
}, jn = 864e5, Mn = class {
	constructor(e, t, n, r, i) {
		if (this.operation = e, this.retryPolicy = t, this.getWaitDuration = n, this.lowerBound = r, this.upperBound = i, this.pending = null, this.nextErrorWaitInterval = r, r > i) throw Error("Proactive refresh lower bound greater than upper bound!");
	}
	start() {
		this.nextErrorWaitInterval = this.lowerBound, this.process(!0).catch(() => {});
	}
	stop() {
		this.pending &&= (this.pending.reject("cancelled"), null);
	}
	isRunning() {
		return !!this.pending;
	}
	async process(e) {
		this.stop();
		try {
			this.pending = new _(), this.pending.promise.catch((e) => {}), await Nn(this.getNextRun(e)), this.pending.resolve(), await this.pending.promise, this.pending = new _(), this.pending.promise.catch((e) => {}), await this.operation(), this.pending.resolve(), await this.pending.promise, this.process(!0).catch(() => {});
		} catch (e) {
			this.retryPolicy(e) ? this.process(!1).catch(() => {}) : this.stop();
		}
	}
	getNextRun(e) {
		if (e) return this.nextErrorWaitInterval = this.lowerBound, this.getWaitDuration();
		{
			let e = this.nextErrorWaitInterval;
			return this.nextErrorWaitInterval *= 2, this.nextErrorWaitInterval > this.upperBound && (this.nextErrorWaitInterval = this.upperBound), e;
		}
	}
};
function Nn(e) {
	return new Promise((t) => {
		setTimeout(t, e);
	});
}
var Pn = new fe("appCheck", "AppCheck", {
	"already-initialized": "You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.",
	"use-before-activation": "App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.",
	"fetch-network-error": "Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.",
	"fetch-parse-error": "Fetch client could not parse response. Original error: {$originalErrorMessage}.",
	"fetch-status-error": "Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.",
	"storage-open": "Error thrown when opening storage. Original error: {$originalErrorMessage}.",
	"storage-get": "Error thrown when reading from storage. Original error: {$originalErrorMessage}.",
	"storage-set": "Error thrown when writing to storage. Original error: {$originalErrorMessage}.",
	"recaptcha-error": "ReCAPTCHA error.",
	"initial-throttle": "{$httpStatus} error. Attempts allowed again after {$time}",
	throttled: "Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"
});
function Fn(e = !1) {
	return e ? self.grecaptcha?.enterprise : self.grecaptcha;
}
function In(e) {
	if (!wn(e).activated) throw Pn.create("use-before-activation", { appName: e.name });
}
function Ln(e) {
	let t = Math.round(e / 1e3), n = Math.floor(t / 86400), r = Math.floor((t - n * 3600 * 24) / 3600), i = Math.floor((t - n * 3600 * 24 - r * 3600) / 60), a = t - n * 3600 * 24 - r * 3600 - i * 60, o = "";
	return n && (o += Rn(n) + "d:"), r && (o += Rn(r) + "h:"), o += Rn(i) + "m:" + Rn(a) + "s", o;
}
function Rn(e) {
	return e === 0 ? "00" : e >= 10 ? e.toString() : "0" + e;
}
async function zn({ url: e, body: t }, n) {
	let r = { "Content-Type": "application/json" }, i = n.getImmediate({ optional: !0 });
	if (i) {
		let e = await i.getHeartbeatsHeader();
		e && (r["X-Firebase-Client"] = e);
	}
	let a = {
		method: "POST",
		body: JSON.stringify(t),
		headers: r
	}, o;
	try {
		o = await fetch(e, a);
	} catch (e) {
		throw Pn.create("fetch-network-error", { originalErrorMessage: e?.message });
	}
	if (o.status !== 200) throw Pn.create("fetch-status-error", { httpStatus: o.status });
	let s;
	try {
		s = await o.json();
	} catch (e) {
		throw Pn.create("fetch-parse-error", { originalErrorMessage: e?.message });
	}
	let c = s.ttl.match(/^([\d.]+)(s)$/);
	if (!c || !c[2] || isNaN(Number(c[1]))) throw Pn.create("fetch-parse-error", { originalErrorMessage: `ttl field (timeToLive) is not in standard Protobuf Duration format: ${s.ttl}` });
	let l = Number(c[1]) * 1e3, u = Date.now();
	return {
		token: s.token,
		expireTimeMillis: u + l,
		issuedAtTimeMillis: u
	};
}
function Bn(e, t) {
	let { projectId: n, appId: r, apiKey: i } = e.options;
	return {
		url: `${Dn}/projects/${n}/apps/${r}:${On}?key=${i}`,
		body: { recaptcha_enterprise_token: t }
	};
}
function Vn(e, t) {
	let { projectId: n, appId: r, apiKey: i } = e.options;
	return {
		url: `${Dn}/projects/${n}/apps/${r}:${kn}?key=${i}`,
		body: { debug_token: t }
	};
}
var Hn = "firebase-app-check-database", Un = 1, Wn = "firebase-app-check-store", Gn = "debug-token", Kn = null;
function qn() {
	return Kn || (Kn = new Promise((e, t) => {
		try {
			let n = indexedDB.open(Hn, Un);
			n.onsuccess = (t) => {
				e(t.target.result);
			}, n.onerror = (e) => {
				t(Pn.create("storage-open", { originalErrorMessage: e.target.error?.message }));
			}, n.onupgradeneeded = (e) => {
				let t = e.target.result;
				e.oldVersion === 0 && t.createObjectStore(Wn, { keyPath: "compositeKey" });
			};
		} catch (e) {
			t(Pn.create("storage-open", { originalErrorMessage: e?.message }));
		}
	}), Kn);
}
function Jn(e) {
	return $n(er(e));
}
function Yn(e, t) {
	return Qn(er(e), t);
}
function Xn(e) {
	return Qn(Gn, e);
}
function Zn() {
	return $n(Gn);
}
async function Qn(e, t) {
	let n = (await qn()).transaction(Wn, "readwrite"), r = n.objectStore(Wn).put({
		compositeKey: e,
		value: t
	});
	return new Promise((e, t) => {
		r.onsuccess = (t) => {
			e();
		}, n.onerror = (e) => {
			t(Pn.create("storage-set", { originalErrorMessage: e.target.error?.message }));
		};
	});
}
async function $n(e) {
	let t = (await qn()).transaction(Wn, "readonly"), n = t.objectStore(Wn).get(e);
	return new Promise((e, r) => {
		n.onsuccess = (t) => {
			let n = t.target.result;
			e(n ? n.value : void 0);
		}, t.onerror = (e) => {
			r(Pn.create("storage-get", { originalErrorMessage: e.target.error?.message }));
		};
	});
}
function er(e) {
	return `${e.options.appId}-${e.name}`;
}
var tr = new He("@firebase/app-check");
async function nr(e) {
	if (ce()) {
		let t;
		try {
			t = await Jn(e);
		} catch (e) {
			tr.warn(`Failed to read token from IndexedDB. Error: ${e}`);
		}
		return t;
	}
}
function rr(e, t) {
	return ce() ? Yn(e, t).catch((e) => {
		tr.warn(`Failed to write token to IndexedDB. Error: ${e}`);
	}) : Promise.resolve();
}
async function ir(e) {
	let t;
	try {
		t = await Zn();
	} catch {}
	if (t) return t;
	{
		let t = crypto.randomUUID(), n = `To use this token for app debugging, register it with your project.\n\nFirebase App Check debug token: ${t}\n\n`, r = e?.options.appId, i = e?.options.projectId;
		return n += i && r ? `You can do so in the Firebase Console:\nhttps://console.firebase.google.com/project/${i}/appcheck/apps?selectedAppId=${r}\n\nOr using the Firebase CLI:\nfirebase appcheck:debugtokens:create ${t} --project ${i} --app ${r}\n\n` : "You will need to add it to your app's App Check settings in the Firebase Console for it to work.\n\n", n += "Note: To keep your project secure, please revoke and delete this token using the\nFirebase Console or the CLI (`firebase appcheck:debugtokens:delete`) when you finish debugging.\n\nWarning: This debug token is a secret and should not be shared or uploaded to source code.\n\nDebug Token Guide: https://firebase.google.com/docs/app-check/web/debug-provider\nFirebase CLI install instructions: https://firebase.google.com/docs/cli\n", console.log(n), Xn(t).catch((e) => tr.warn(`Failed to persist debug token to IndexedDB. Error: ${e}`)), t;
	}
}
function ar() {
	return En().enabled;
}
async function or() {
	let e = En();
	if (e.enabled && e.token) return e.token.promise;
	throw Error("\n            Can't get debug token in production mode.\n        ");
}
function sr(e) {
	let t = c(), n = En();
	if (n.initialized = !0, typeof t.FIREBASE_APPCHECK_DEBUG_TOKEN != "string" && t.FIREBASE_APPCHECK_DEBUG_TOKEN !== !0) return;
	n.enabled = !0;
	let r = new _();
	n.token = r, typeof t.FIREBASE_APPCHECK_DEBUG_TOKEN == "string" ? r.resolve(t.FIREBASE_APPCHECK_DEBUG_TOKEN) : r.resolve(ir(e));
}
var cr = { error: "UNKNOWN_ERROR" };
function lr(e) {
	return r.encodeString(JSON.stringify(e), !1);
}
async function ur(e, t = !1, n = !1) {
	let r = e.app;
	In(r);
	let i = wn(r), a = i.token, o;
	if (a && !_r(a) && (i.token = void 0, a = void 0), !a) {
		let e = await i.cachedTokenPromise;
		e && (_r(e) ? a = e : await rr(r, void 0));
	}
	if (!t && a && _r(a)) return { token: a.token };
	let s = !1;
	if (ar()) try {
		let t = await or();
		i.exchangeTokenPromise || (i.exchangeTokenPromise = zn(Vn(r, t), e.heartbeatServiceProvider).finally(() => {
			i.exchangeTokenPromise = void 0;
		}), s = !0);
		let n = await i.exchangeTokenPromise;
		return await rr(r, n), i.token = n, { token: n.token };
	} catch (e) {
		return e.code === "appCheck/throttled" || e.code === "appCheck/initial-throttle" ? tr.warn(e.message) : n && tr.error(e), vr(e);
	}
	try {
		i.exchangeTokenPromise || (i.exchangeTokenPromise = i.provider.getToken().finally(() => {
			i.exchangeTokenPromise = void 0;
		}), s = !0), a = await wn(r).exchangeTokenPromise;
	} catch (e) {
		e.code === "appCheck/throttled" || e.code === "appCheck/initial-throttle" ? tr.warn(e.message) : n && tr.error(e), o = e;
	}
	let c;
	return a ? o ? c = _r(a) ? {
		token: a.token,
		internalError: o
	} : vr(o) : (c = { token: a.token }, i.token = a, await rr(r, a)) : c = vr(o), s && gr(r, c), c;
}
async function dr(e) {
	let t = e.app;
	In(t);
	let { provider: n } = wn(t);
	if (ar()) {
		let n = Vn(t, await or());
		n.body.limited_use = !0;
		let { token: r } = await zn(n, e.heartbeatServiceProvider);
		return { token: r };
	}
	{
		let { token: e } = await n.getToken(!0);
		return { token: e };
	}
}
function fr(e, t, n, r) {
	let { app: i } = e, a = wn(i), o = {
		next: n,
		error: r,
		type: t
	};
	if (a.tokenObservers = [...a.tokenObservers, o], a.token && _r(a.token)) {
		let t = a.token;
		Promise.resolve().then(() => {
			n({ token: t.token }), mr(e);
		}).catch(() => {});
	}
	a.cachedTokenPromise.then(() => mr(e));
}
function pr(e, t) {
	let n = wn(e), r = n.tokenObservers.filter((e) => e.next !== t);
	r.length === 0 && n.tokenRefresher && n.tokenRefresher.isRunning() && n.tokenRefresher.stop(), n.tokenObservers = r;
}
function mr(e) {
	let { app: t } = e, n = wn(t), r = n.tokenRefresher;
	r || (r = hr(e), n.tokenRefresher = r), !r.isRunning() && n.isTokenAutoRefreshEnabled && r.start();
}
function hr(e) {
	let { app: t } = e;
	return new Mn(async () => {
		let n = wn(t), r;
		if (r = n.token ? await ur(e, !0) : await ur(e), r.error) throw r.error;
		if (r.internalError) throw r.internalError;
	}, () => !0, () => {
		let e = wn(t);
		if (e.token) {
			let t = e.token.issuedAtTimeMillis + (e.token.expireTimeMillis - e.token.issuedAtTimeMillis) * .5 + 3e5, n = e.token.expireTimeMillis - 3e5;
			return t = Math.min(t, n), Math.max(0, t - Date.now());
		}
		return 0;
	}, An.RETRIAL_MIN_WAIT, An.RETRIAL_MAX_WAIT);
}
function gr(e, t) {
	let n = wn(e).tokenObservers;
	for (let e of n) try {
		e.type === "EXTERNAL" && t.error != null ? e.error(t.error) : e.next(t);
	} catch {}
}
function _r(e) {
	return e.expireTimeMillis - Date.now() > 0;
}
function vr(e) {
	return {
		token: lr(cr),
		error: e
	};
}
var yr = class {
	constructor(e, t) {
		this.app = e, this.heartbeatServiceProvider = t;
	}
	_delete() {
		let { tokenObservers: e } = wn(this.app);
		for (let t of e) pr(this.app, t.next);
		return Promise.resolve();
	}
};
function br(e, t) {
	return new yr(e, t);
}
function xr(e) {
	return {
		getToken: (t) => ur(e, t),
		getLimitedUseToken: () => dr(e),
		addTokenListener: (t) => fr(e, "INTERNAL", t),
		removeTokenListener: (t) => pr(e.app, t)
	};
}
var Sr = "@firebase/app-check", Cr = "0.13.1";
function wr(e, t) {
	let n = new _(), r = wn(e);
	r.reCAPTCHAState = { initialized: n };
	let i = Er(e), a = Fn(!0);
	return a ? Tr(e, t, a, i, n) : kr(() => {
		let r = Fn(!0);
		if (!r) throw Error("no recaptcha");
		Tr(e, t, r, i, n);
	}), n.promise;
}
function Tr(e, t, n, r, i) {
	n.ready(() => {
		Or(e, t, n, r), i.resolve(n);
	});
}
function Er(e) {
	let t = `fire_app_check_${e.name}`, n = document.createElement("div");
	return n.id = t, n.style.display = "none", document.body.appendChild(n), t;
}
async function Dr(e) {
	In(e);
	let t = await wn(e).reCAPTCHAState.initialized.promise;
	return new Promise((n, r) => {
		let i = wn(e).reCAPTCHAState;
		t.ready(() => {
			n(t.execute(i.widgetId, { action: "fire_app_check" }));
		});
	});
}
function Or(e, t, n, r) {
	let i = n.render(r, {
		sitekey: t,
		size: "invisible",
		callback: () => {
			wn(e).reCAPTCHAState.succeeded = !0;
		},
		"error-callback": () => {
			wn(e).reCAPTCHAState.succeeded = !1;
		}
	}), a = wn(e);
	a.reCAPTCHAState = {
		...a.reCAPTCHAState,
		widgetId: i
	};
}
function kr(e) {
	let t = document.createElement("script");
	t.src = "https://www.google.com/recaptcha/enterprise.js?render=explicit", t.onload = e, document.head.appendChild(t);
}
var Ar = class e {
	constructor(e) {
		this._siteKey = e, this._throttleData = null;
	}
	async getToken(e = !1) {
		Mr(this._throttleData);
		let t = await Dr(this._app).catch((e) => {
			throw Pn.create("recaptcha-error");
		});
		if (!wn(this._app).reCAPTCHAState?.succeeded) throw Pn.create("recaptcha-error");
		let n;
		try {
			let r = Bn(this._app, t);
			e && (r.body.limited_use = !0), n = await zn(r, this._heartbeatServiceProvider);
		} catch (e) {
			throw e.code?.includes("fetch-status-error") ? (this._throttleData = jr(Number(e.customData?.httpStatus), this._throttleData), Pn.create("initial-throttle", {
				time: Ln(this._throttleData.allowRequestsAfter - Date.now()),
				httpStatus: this._throttleData.httpStatus
			})) : e;
		}
		return this._throttleData = null, n;
	}
	initialize(e) {
		this._app = e, this._heartbeatServiceProvider = Xt(e, "heartbeat"), wr(e, this._siteKey).catch(() => {});
	}
	isEqual(t) {
		return t instanceof e && this._siteKey === t._siteKey;
	}
};
function jr(e, t) {
	if (e === 404 || e === 403) return {
		backoffCount: 1,
		allowRequestsAfter: Date.now() + jn,
		httpStatus: e
	};
	{
		let n = t ? t.backoffCount : 0, r = Oe(n, 1e3, 2);
		return {
			backoffCount: n + 1,
			allowRequestsAfter: Date.now() + r,
			httpStatus: e
		};
	}
}
function Mr(e) {
	if (e && Date.now() - e.allowRequestsAfter <= 0) throw Pn.create("throttled", {
		time: Ln(e.allowRequestsAfter - Date.now()),
		httpStatus: e.httpStatus
	});
}
function Nr(e = nn(), t) {
	e = y(e);
	let n = Xt(e, "app-check");
	if (En().initialized || sr(e), ar() && or().then((e) => {
		console.log(`Firebase App Check debug token: ${e}`);
	}), n.isInitialized()) {
		let r = n.getImmediate(), i = n.getOptions();
		if (i && !!i.isTokenAutoRefreshEnabled == !!t.isTokenAutoRefreshEnabled && i.provider?.isEqual(t.provider)) return r;
		throw Pn.create("already-initialized", { appName: e.name });
	}
	let r = n.initialize({ options: t });
	return Pr(e, t.provider, t.isTokenAutoRefreshEnabled), wn(e).isTokenAutoRefreshEnabled && fr(r, "INTERNAL", () => {}), r;
}
function Pr(e, t, n = !1) {
	let r = Tn(e, { ...Cn });
	r.activated = !0, r.provider = t, r.cachedTokenPromise = nr(e).then((t) => (t && _r(t) && (r.token = t, gr(e, { token: t.token })), t)), r.isTokenAutoRefreshEnabled = n && e.automaticDataCollectionEnabled, !e.automaticDataCollectionEnabled && n && tr.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."), r.provider.initialize(e);
}
var Fr = "app-check", Ir = "app-check-internal";
function Lr() {
	Yt(new je(Fr, (e) => br(e.getProvider("app").getImmediate(), e.getProvider("heartbeat")), "PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e, t, n) => {
		e.getProvider(Ir).initialize();
	})), Yt(new je(Ir, (e) => xr(e.getProvider("app-check").getImmediate()), "PUBLIC").setInstantiationMode("EXPLICIT")), rn(Sr, Cr);
}
//#endregion
//#region node_modules/firebase/app/dist/esm/index.esm.js
Lr(), rn("firebase", "12.18.0", "app");
//#endregion
//#region node_modules/@firebase/auth/dist/esm/index-CvXU3_1x.js
function Rr() {
	return { "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK." };
}
var zr = Rr, Br = new fe("auth", "Firebase", Rr()), Vr = new He("@firebase/auth");
function Hr(e, ...t) {
	Vr.logLevel <= b.WARN && Vr.warn(`Auth (${en}): ${e}`, ...t);
}
function Ur(e, ...t) {
	Vr.logLevel <= b.ERROR && Vr.error(`Auth (${en}): ${e}`, ...t);
}
function Wr(e, ...t) {
	throw Yr(e, ...t);
}
function Gr(e, ...t) {
	return Yr(e, ...t);
}
function Kr(e, t, n) {
	return new fe("auth", "Firebase", {
		...zr(),
		[t]: n
	}).create(t, { appName: e.name });
}
function qr(e) {
	return Kr(e, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function Jr(e, t, n) {
	let r = n;
	if (!(t instanceof r)) throw r.name !== t.constructor.name && Wr(e, "argument-error"), Kr(e, "argument-error", `Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`);
}
function Yr(e, ...t) {
	if (typeof e != "string") {
		let n = t[0], r = [...t.slice(1)];
		return r[0] && (r[0].appName = e.name), e._errorFactory.create(n, ...r);
	}
	return Br.create(e, ...t);
}
function C(e, t, ...n) {
	if (!e) throw Yr(t, ...n);
}
function Xr(e) {
	let t = "INTERNAL ASSERTION FAILED: " + e;
	throw Ur(t), Error(t);
}
function Zr(e, t) {
	e || Xr(t);
}
function Qr() {
	return typeof self < "u" && self.location?.href || "";
}
function $r() {
	return ei() === "http:" || ei() === "https:";
}
function ei() {
	return typeof self < "u" && self.location?.protocol || null;
}
function ti() {
	return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && ($r() || ie() || "connection" in navigator) ? navigator.onLine : !0;
}
function ni() {
	if (typeof navigator > "u") return null;
	let e = navigator;
	return e.languages && e.languages[0] || e.language || null;
}
var ri = class {
	constructor(e, t) {
		this.shortDelay = e, this.longDelay = t, Zr(t > e, "Short delay should be less than long delay!"), this.isMobile = te() || ae();
	}
	get() {
		return ti() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
	}
};
function ii(e, t) {
	Zr(e.emulator, "Emulator should always be set here");
	let { url: n } = e.emulator;
	return t ? `${n}${t.startsWith("/") ? t.slice(1) : t}` : n;
}
var ai = class {
	static initialize(e, t, n) {
		this.fetchImpl = e, t && (this.headersImpl = t), n && (this.responseImpl = n);
	}
	static fetch() {
		if (this.fetchImpl) return this.fetchImpl;
		if (typeof self < "u" && "fetch" in self) return self.fetch;
		if (typeof globalThis < "u" && globalThis.fetch) return globalThis.fetch;
		if (typeof fetch < "u") return fetch;
		Xr("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
	static headers() {
		if (this.headersImpl) return this.headersImpl;
		if (typeof self < "u" && "Headers" in self) return self.Headers;
		if (typeof globalThis < "u" && globalThis.Headers) return globalThis.Headers;
		if (typeof Headers < "u") return Headers;
		Xr("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
	static response() {
		if (this.responseImpl) return this.responseImpl;
		if (typeof self < "u" && "Response" in self) return self.Response;
		if (typeof globalThis < "u" && globalThis.Response) return globalThis.Response;
		if (typeof Response < "u") return Response;
		Xr("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
}, oi = {
	CREDENTIAL_MISMATCH: "custom-token-mismatch",
	MISSING_CUSTOM_TOKEN: "internal-error",
	INVALID_IDENTIFIER: "invalid-email",
	MISSING_CONTINUE_URI: "internal-error",
	INVALID_PASSWORD: "wrong-password",
	MISSING_PASSWORD: "missing-password",
	INVALID_LOGIN_CREDENTIALS: "invalid-credential",
	EMAIL_EXISTS: "email-already-in-use",
	PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
	INVALID_IDP_RESPONSE: "invalid-credential",
	INVALID_PENDING_TOKEN: "invalid-credential",
	FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
	MISSING_REQ_TYPE: "internal-error",
	EMAIL_NOT_FOUND: "user-not-found",
	RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
	EXPIRED_OOB_CODE: "expired-action-code",
	INVALID_OOB_CODE: "invalid-action-code",
	MISSING_OOB_CODE: "internal-error",
	CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
	INVALID_ID_TOKEN: "invalid-user-token",
	TOKEN_EXPIRED: "user-token-expired",
	USER_NOT_FOUND: "user-token-expired",
	TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
	PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
	INVALID_CODE: "invalid-verification-code",
	INVALID_SESSION_INFO: "invalid-verification-id",
	INVALID_TEMPORARY_PROOF: "invalid-credential",
	MISSING_SESSION_INFO: "missing-verification-id",
	SESSION_EXPIRED: "code-expired",
	MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
	UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
	INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
	ADMIN_ONLY_OPERATION: "admin-restricted-operation",
	INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
	MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
	MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
	MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
	SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
	SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
	BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
	RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
	MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
	INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
	INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
	MISSING_CLIENT_TYPE: "missing-client-type",
	MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
	INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
	INVALID_REQ_TYPE: "invalid-req-type"
}, si = [
	"/v1/accounts:signInWithCustomToken",
	"/v1/accounts:signInWithEmailLink",
	"/v1/accounts:signInWithIdp",
	"/v1/accounts:signInWithPassword",
	"/v1/accounts:signInWithPhoneNumber",
	"/v1/token"
], ci = new ri(3e4, 6e4);
function li(e, t) {
	return e.tenantId && !t.tenantId ? {
		...t,
		tenantId: e.tenantId
	} : t;
}
async function ui(e, t, n, r, i = {}) {
	return di(e, i, async () => {
		let i = {}, a = {};
		r && (t === "GET" ? a = r : i = { body: JSON.stringify(r) });
		let o = _e({
			...a,
			key: e.config.apiKey
		}).slice(1), s = await e._getAdditionalHeaders();
		s["Content-Type"] = "application/json", e.languageCode && (s["X-Firebase-Locale"] = e.languageCode);
		let c = {
			method: t,
			headers: s,
			...i
		};
		return re() || (c.referrerPolicy = "strict-origin-when-cross-origin"), e.emulatorConfig && ke(e.emulatorConfig.host) && (c.credentials = "include"), ai.fetch()(await pi(e, e.config.apiHost, n, o), c);
	});
}
async function di(e, t, n) {
	e._canInitEmulator = !1;
	let r = {
		...oi,
		...t
	};
	try {
		let t = new hi(e), i = await Promise.race([n(), t.promise]);
		t.clearNetworkTimeout();
		let a = await i.json();
		if ("needConfirmation" in a) throw gi(e, "account-exists-with-different-credential", a);
		if (i.ok && !("errorMessage" in a)) return a;
		{
			let [t, n] = (i.ok ? a.errorMessage : a.error.message).split(" : ");
			if (t === "FEDERATED_USER_ID_ALREADY_LINKED") throw gi(e, "credential-already-in-use", a);
			if (t === "EMAIL_EXISTS") throw gi(e, "email-already-in-use", a);
			if (t === "USER_DISABLED") throw gi(e, "user-disabled", a);
			let o = r[t] || t.toLowerCase().replace(/[_\s]+/g, "-");
			if (n) throw Kr(e, o, n);
			Wr(e, o);
		}
	} catch (t) {
		if (t instanceof de) throw t;
		Wr(e, "network-request-failed", { message: String(t) });
	}
}
async function fi(e, t, n, r, i = {}) {
	let a = await ui(e, t, n, r, i);
	return "mfaPendingCredential" in a && Wr(e, "multi-factor-auth-required", { _serverResponse: a }), a;
}
async function pi(e, t, n, r) {
	let i = `${t}${n}?${r}`, a = e, o = a.config.emulator ? ii(e.config, i) : `${e.config.apiScheme}://${i}`;
	return si.includes(n) && (await a._persistenceManagerAvailable, a._getPersistenceType() === "COOKIE") ? a._getPersistence()._getFinalTarget(o).toString() : o;
}
function mi(e) {
	switch (e) {
		case "ENFORCE": return "ENFORCE";
		case "AUDIT": return "AUDIT";
		case "OFF": return "OFF";
		default: return "ENFORCEMENT_STATE_UNSPECIFIED";
	}
}
var hi = class {
	clearNetworkTimeout() {
		clearTimeout(this.timer);
	}
	constructor(e) {
		this.auth = e, this.timer = null, this.promise = new Promise((e, t) => {
			this.timer = setTimeout(() => t(Gr(this.auth, "network-request-failed")), ci.get());
		});
	}
};
function gi(e, t, n) {
	let r = { appName: e.name };
	n.email && (r.email = n.email), n.phoneNumber && (r.phoneNumber = n.phoneNumber);
	let i = Gr(e, t, r);
	return i.customData._tokenResponse = n, i;
}
function _i(e) {
	return e !== void 0 && e.enterprise !== void 0;
}
var vi = class {
	constructor(e) {
		if (this.siteKey = "", this.recaptchaEnforcementState = [], e.recaptchaKey === void 0) throw Error("recaptchaKey undefined");
		this.siteKey = e.recaptchaKey.split("/")[3], this.recaptchaEnforcementState = e.recaptchaEnforcementState;
	}
	getProviderEnforcementState(e) {
		if (!this.recaptchaEnforcementState || this.recaptchaEnforcementState.length === 0) return null;
		for (let t of this.recaptchaEnforcementState) if (t.provider && t.provider === e) return mi(t.enforcementState);
		return null;
	}
	isProviderEnabled(e) {
		return this.getProviderEnforcementState(e) === "ENFORCE" || this.getProviderEnforcementState(e) === "AUDIT";
	}
	isAnyProviderEnabled() {
		return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER") || this.isProviderEnabled("PHONE_PROVIDER");
	}
};
async function yi(e, t) {
	return ui(e, "GET", "/v2/recaptchaConfig", li(e, t));
}
async function bi(e, t) {
	return ui(e, "POST", "/v1/accounts:delete", t);
}
async function xi(e, t) {
	return ui(e, "POST", "/v1/accounts:lookup", t);
}
function Si(e) {
	if (e) try {
		let t = new Date(Number(e));
		if (!isNaN(t.getTime())) return t.toUTCString();
	} catch {}
}
async function Ci(e, t = !1) {
	let n = y(e), r = await n.getIdToken(t), i = Ti(r);
	C(i && i.exp && i.auth_time && i.iat, n.auth, "internal-error");
	let a = typeof i.firebase == "object" ? i.firebase : void 0, o = a?.sign_in_provider;
	return {
		claims: i,
		token: r,
		authTime: Si(wi(i.auth_time)),
		issuedAtTime: Si(wi(i.iat)),
		expirationTime: Si(wi(i.exp)),
		signInProvider: o || null,
		signInSecondFactor: a?.sign_in_second_factor || null
	};
}
function wi(e) {
	return Number(e) * 1e3;
}
function Ti(e) {
	let [t, n, r] = e.split(".");
	if (t === void 0 || n === void 0 || r === void 0) return Ur("JWT malformed, contained fewer than 3 sections"), null;
	try {
		let e = s(n);
		return e ? JSON.parse(e) : (Ur("Failed to decode base64 JWT payload"), null);
	} catch (e) {
		return Ur("Caught error parsing JWT payload as JSON", e?.toString()), null;
	}
}
function Ei(e) {
	let t = Ti(e);
	return C(t, "internal-error"), C(t.exp !== void 0, "internal-error"), C(t.iat !== void 0, "internal-error"), Number(t.exp) - Number(t.iat);
}
async function Di(e, t, n = !1) {
	if (n) return t;
	try {
		return await t;
	} catch (t) {
		throw t instanceof de && Oi(t) && e.auth.currentUser === e && await e.auth.signOut(), t;
	}
}
function Oi({ code: e }) {
	return e === "auth/user-disabled" || e === "auth/user-token-expired";
}
var ki = class {
	constructor(e) {
		this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4;
	}
	_start() {
		this.isRunning || (this.isRunning = !0, this.schedule());
	}
	_stop() {
		this.isRunning && (this.isRunning = !1, this.timerId !== null && clearTimeout(this.timerId));
	}
	getInterval(e) {
		if (e) {
			let e = this.errorBackoff;
			return this.errorBackoff = Math.min(this.errorBackoff * 2, 96e4), e;
		}
		{
			this.errorBackoff = 3e4;
			let e = (this.user.stsTokenManager.expirationTime ?? 0) - Date.now() - 3e5;
			return Math.max(0, e);
		}
	}
	schedule(e = !1) {
		if (!this.isRunning) return;
		let t = this.getInterval(e);
		this.timerId = setTimeout(async () => {
			await this.iteration();
		}, t);
	}
	async iteration() {
		try {
			await this.user.getIdToken(!0);
		} catch (e) {
			e?.code === "auth/network-request-failed" && this.schedule(!0);
			return;
		}
		this.schedule();
	}
}, Ai = class {
	constructor(e, t) {
		this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
	}
	_initializeTime() {
		this.lastSignInTime = Si(this.lastLoginAt), this.creationTime = Si(this.createdAt);
	}
	_copy(e) {
		this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
	}
	toJSON() {
		return {
			createdAt: this.createdAt,
			lastLoginAt: this.lastLoginAt
		};
	}
};
async function ji(e) {
	let t = e.auth, n = await Di(e, xi(t, { idToken: await e.getIdToken() }));
	C(n?.users.length, t, "internal-error");
	let r = n.users[0];
	e._notifyReloadListener(r);
	let i = r.providerUserInfo?.length ? Pi(r.providerUserInfo) : [], a = Ni(e.providerData, i), o = e.isAnonymous, s = !(e.email && r.passwordHash) && !a?.length, c = o ? s : !1, l = {
		uid: r.localId,
		displayName: r.displayName || null,
		photoURL: r.photoUrl || null,
		email: r.email || null,
		emailVerified: r.emailVerified || !1,
		phoneNumber: r.phoneNumber || null,
		tenantId: r.tenantId || null,
		providerData: a,
		metadata: new Ai(r.createdAt, r.lastLoginAt),
		isAnonymous: c
	};
	Object.assign(e, l);
}
async function Mi(e) {
	let t = y(e);
	await ji(t), await t.auth._persistUserIfCurrent(t), t.auth._notifyListenersIfCurrent(t);
}
function Ni(e, t) {
	return [...e.filter((e) => !t.some((t) => t.providerId === e.providerId)), ...t];
}
function Pi(e) {
	return e.map(({ providerId: e, ...t }) => ({
		providerId: e,
		uid: t.rawId || "",
		displayName: t.displayName || null,
		email: t.email || null,
		phoneNumber: t.phoneNumber || null,
		photoURL: t.photoUrl || null
	}));
}
async function Fi(e, t) {
	let n = await di(e, {}, async () => {
		let n = _e({
			grant_type: "refresh_token",
			refresh_token: t
		}).slice(1), { tokenApiHost: r, apiKey: i } = e.config, a = await pi(e, r, "/v1/token", `key=${i}`), o = await e._getAdditionalHeaders();
		o["Content-Type"] = "application/x-www-form-urlencoded";
		let s = {
			method: "POST",
			headers: o,
			body: n
		};
		return e.emulatorConfig && ke(e.emulatorConfig.host) && (s.credentials = "include"), ai.fetch()(a, s);
	});
	return {
		accessToken: n.access_token,
		expiresIn: n.expires_in,
		refreshToken: n.refresh_token
	};
}
async function Ii(e, t) {
	return ui(e, "POST", "/v2/accounts:revokeToken", li(e, t));
}
var Li = class e {
	constructor() {
		this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
	}
	get isExpired() {
		return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
	}
	updateFromServerResponse(e) {
		C(e.idToken, "internal-error"), C(e.idToken !== void 0, "internal-error"), C(e.refreshToken !== void 0, "internal-error");
		let t = "expiresIn" in e && e.expiresIn !== void 0 ? Number(e.expiresIn) : Ei(e.idToken);
		this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
	}
	updateFromIdToken(e) {
		C(e.length !== 0, "internal-error");
		let t = Ei(e);
		this.updateTokensAndExpiration(e, null, t);
	}
	async getToken(e, t = !1) {
		return !t && this.accessToken && !this.isExpired ? this.accessToken : (C(this.refreshToken, e, "user-token-expired"), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
	}
	clearRefreshToken() {
		this.refreshToken = null;
	}
	async refresh(e, t) {
		let { accessToken: n, refreshToken: r, expiresIn: i } = await Fi(e, t);
		this.updateTokensAndExpiration(n, r, Number(i));
	}
	updateTokensAndExpiration(e, t, n) {
		this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + n * 1e3;
	}
	static fromJSON(t, n) {
		let { refreshToken: r, accessToken: i, expirationTime: a } = n, o = new e();
		return r && (C(typeof r == "string", "internal-error", { appName: t }), o.refreshToken = r), i && (C(typeof i == "string", "internal-error", { appName: t }), o.accessToken = i), a && (C(typeof a == "number", "internal-error", { appName: t }), o.expirationTime = a), o;
	}
	toJSON() {
		return {
			refreshToken: this.refreshToken,
			accessToken: this.accessToken,
			expirationTime: this.expirationTime
		};
	}
	_assign(e) {
		this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
	}
	_clone() {
		return Object.assign(new e(), this.toJSON());
	}
	_performRefresh() {
		return Xr("not implemented");
	}
};
function Ri(e, t) {
	C(typeof e == "string" || e === void 0, "internal-error", { appName: t });
}
var zi = class e {
	constructor({ uid: e, auth: t, stsTokenManager: n, ...r }) {
		this.providerId = "firebase", this.proactiveRefresh = new ki(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = e, this.auth = t, this.stsTokenManager = n, this.accessToken = n.accessToken, this.displayName = r.displayName || null, this.email = r.email || null, this.emailVerified = r.emailVerified || !1, this.phoneNumber = r.phoneNumber || null, this.photoURL = r.photoURL || null, this.isAnonymous = r.isAnonymous || !1, this.tenantId = r.tenantId || null, this.providerData = r.providerData ? [...r.providerData] : [], this.metadata = new Ai(r.createdAt || void 0, r.lastLoginAt || void 0);
	}
	async getIdToken(e) {
		let t = await Di(this, this.stsTokenManager.getToken(this.auth, e));
		return C(t, this.auth, "internal-error"), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
	}
	getIdTokenResult(e) {
		return Ci(this, e);
	}
	reload() {
		return Mi(this);
	}
	_assign(e) {
		this !== e && (C(this.uid === e.uid, this.auth, "internal-error"), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((e) => ({ ...e })), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
	}
	_clone(t) {
		let n = new e({
			...this,
			auth: t,
			stsTokenManager: this.stsTokenManager._clone()
		});
		return n.metadata._copy(this.metadata), n;
	}
	_onReload(e) {
		C(!this.reloadListener, this.auth, "internal-error"), this.reloadListener = e, this.reloadUserInfo &&= (this._notifyReloadListener(this.reloadUserInfo), null);
	}
	_notifyReloadListener(e) {
		this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
	}
	_startProactiveRefresh() {
		this.proactiveRefresh._start();
	}
	_stopProactiveRefresh() {
		this.proactiveRefresh._stop();
	}
	async _updateTokensIfNecessary(e, t = !1) {
		let n = !1;
		e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), n = !0), t && await ji(this), await this.auth._persistUserIfCurrent(this), n && this.auth._notifyListenersIfCurrent(this);
	}
	async delete() {
		if (Zt(this.auth.app)) return Promise.reject(qr(this.auth));
		let e = await this.getIdToken();
		return await Di(this, bi(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
	}
	toJSON() {
		return {
			uid: this.uid,
			email: this.email || void 0,
			emailVerified: this.emailVerified,
			displayName: this.displayName || void 0,
			isAnonymous: this.isAnonymous,
			photoURL: this.photoURL || void 0,
			phoneNumber: this.phoneNumber || void 0,
			tenantId: this.tenantId || void 0,
			providerData: this.providerData.map((e) => ({ ...e })),
			stsTokenManager: this.stsTokenManager.toJSON(),
			_redirectEventId: this._redirectEventId,
			...this.metadata.toJSON(),
			apiKey: this.auth.config.apiKey,
			appName: this.auth.name
		};
	}
	get refreshToken() {
		return this.stsTokenManager.refreshToken || "";
	}
	static _fromJSON(t, n) {
		let r = n.displayName ?? void 0, i = n.email ?? void 0, a = n.phoneNumber ?? void 0, o = n.photoURL ?? void 0, s = n.tenantId ?? void 0, c = n._redirectEventId ?? void 0, l = n.createdAt ?? void 0, u = n.lastLoginAt ?? void 0, { uid: d, emailVerified: f, isAnonymous: p, providerData: m, stsTokenManager: h } = n;
		C(d && h, t, "internal-error");
		let g = Li.fromJSON(this.name, h);
		C(typeof d == "string", t, "internal-error"), Ri(r, t.name), Ri(i, t.name), C(typeof f == "boolean", t, "internal-error"), C(typeof p == "boolean", t, "internal-error"), Ri(a, t.name), Ri(o, t.name), Ri(s, t.name), Ri(c, t.name), Ri(l, t.name), Ri(u, t.name);
		let _ = new e({
			uid: d,
			auth: t,
			email: i,
			emailVerified: f,
			displayName: r,
			isAnonymous: p,
			photoURL: o,
			phoneNumber: a,
			tenantId: s,
			stsTokenManager: g,
			createdAt: l,
			lastLoginAt: u
		});
		return m && Array.isArray(m) && (_.providerData = m.map((e) => ({ ...e }))), c && (_._redirectEventId = c), _;
	}
	static async _fromIdTokenResponse(t, n, r = !1) {
		let i = new Li();
		i.updateFromServerResponse(n);
		let a = new e({
			uid: n.localId,
			auth: t,
			stsTokenManager: i,
			isAnonymous: r
		});
		return await ji(a), a;
	}
	static async _fromGetAccountInfoResponse(t, n, r) {
		let i = n.users[0];
		C(i.localId !== void 0, "internal-error");
		let a = i.providerUserInfo === void 0 ? [] : Pi(i.providerUserInfo), o = !(i.email && i.passwordHash) && !a?.length, s = new Li();
		s.updateFromIdToken(r);
		let c = new e({
			uid: i.localId,
			auth: t,
			stsTokenManager: s,
			isAnonymous: o
		}), l = {
			uid: i.localId,
			displayName: i.displayName || null,
			photoURL: i.photoUrl || null,
			email: i.email || null,
			emailVerified: i.emailVerified || !1,
			phoneNumber: i.phoneNumber || null,
			tenantId: i.tenantId || null,
			providerData: a,
			metadata: new Ai(i.createdAt, i.lastLoginAt),
			isAnonymous: !(i.email && i.passwordHash) && !a?.length
		};
		return Object.assign(c, l), c;
	}
}, Bi = /* @__PURE__ */ new Map();
function Vi(e) {
	Zr(e instanceof Function, "Expected a class definition");
	let t = Bi.get(e);
	return t ? (Zr(t instanceof e, "Instance stored in cache mismatched with class"), t) : (t = new e(), Bi.set(e, t), t);
}
var Hi = class {
	constructor() {
		this.type = "NONE", this.storage = {};
	}
	async _isAvailable() {
		return !0;
	}
	async _set(e, t) {
		this.storage[e] = t;
	}
	async _get(e) {
		let t = this.storage[e];
		return t === void 0 ? null : t;
	}
	async _remove(e) {
		delete this.storage[e];
	}
	_addListener(e, t) {}
	_removeListener(e, t) {}
};
Hi.type = "NONE";
var Ui = Hi;
function Wi(e, t, n) {
	return `firebase:${e}:${t}:${n}`;
}
var Gi = class e {
	constructor(e, t, n) {
		this.persistence = e, this.auth = t, this.userKey = n;
		let { config: r, name: i } = this.auth;
		this.fullUserKey = Wi(this.userKey, r.apiKey, i), this.fullPersistenceKey = Wi("persistence", r.apiKey, i), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
	}
	setCurrentUser(e) {
		return this.persistence._set(this.fullUserKey, e.toJSON());
	}
	async getCurrentUser() {
		let e = await this.persistence._get(this.fullUserKey);
		if (!e) return null;
		if (typeof e == "string") {
			let t = await xi(this.auth, { idToken: e }).catch(() => void 0);
			return t ? zi._fromGetAccountInfoResponse(this.auth, t, e) : null;
		}
		return zi._fromJSON(this.auth, e);
	}
	removeCurrentUser() {
		return this.persistence._remove(this.fullUserKey);
	}
	savePersistenceForRedirect() {
		return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
	}
	async setPersistence(e) {
		if (this.persistence === e) return;
		let t = await this.getCurrentUser();
		if (await this.removeCurrentUser(), this.persistence = e, t) return this.setCurrentUser(t);
	}
	delete() {
		this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
	}
	static async create(t, n, r = "authUser") {
		if (!n.length) return new e(Vi(Ui), t, r);
		let i = (await Promise.all(n.map(async (e) => {
			if (await e._isAvailable()) return e;
		}))).filter((e) => e), a = i[0] || Vi(Ui), o = Wi(r, t.config.apiKey, t.name), s = null;
		for (let e of n) try {
			let n = await e._get(o);
			if (n) {
				let r;
				if (typeof n == "string") {
					let e = await xi(t, { idToken: n }).catch(() => void 0);
					if (!e) break;
					r = await zi._fromGetAccountInfoResponse(t, e, n);
				} else r = zi._fromJSON(t, n);
				e !== a && (s = r), a = e;
				break;
			}
		} catch {}
		let c = i.filter((e) => e._shouldAllowMigration);
		return !a._shouldAllowMigration || !c.length ? new e(a, t, r) : (a = c[0], s && await a._set(o, s.toJSON()), await Promise.all(n.map(async (e) => {
			if (e !== a) try {
				await e._remove(o);
			} catch {}
		})), new e(a, t, r));
	}
};
function Ki(e) {
	let t = e.toLowerCase();
	if (t.includes("opera/") || t.includes("opr/") || t.includes("opios/")) return "Opera";
	if (Xi(t)) return "IEMobile";
	if (t.includes("msie") || t.includes("trident/")) return "IE";
	if (t.includes("edge/")) return "Edge";
	if (qi(t)) return "Firefox";
	if (t.includes("silk/")) return "Silk";
	if (Qi(t)) return "Blackberry";
	if ($i(t)) return "Webos";
	if (Ji(t)) return "Safari";
	if ((t.includes("chrome/") || Yi(t)) && !t.includes("edge/")) return "Chrome";
	if (Zi(t)) return "Android";
	{
		let t = e.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/);
		if (t?.length === 2) return t[1];
	}
	return "Other";
}
function qi(e = v()) {
	return /firefox\//i.test(e);
}
function Ji(e = v()) {
	let t = e.toLowerCase();
	return t.includes("safari/") && !t.includes("chrome/") && !t.includes("crios/") && !t.includes("android");
}
function Yi(e = v()) {
	return /crios\//i.test(e);
}
function Xi(e = v()) {
	return /iemobile/i.test(e);
}
function Zi(e = v()) {
	return /android/i.test(e);
}
function Qi(e = v()) {
	return /blackberry/i.test(e);
}
function $i(e = v()) {
	return /webos/i.test(e);
}
function ea(e = v()) {
	return /iphone|ipad|ipod/i.test(e) || /macintosh/i.test(e) && /mobile/i.test(e);
}
function ta(e = v()) {
	return ea(e) && !!window.navigator?.standalone;
}
function na() {
	return oe() && document.documentMode === 10;
}
function ra(e = v()) {
	return ea(e) || Zi(e) || $i(e) || Qi(e) || /windows phone/i.test(e) || Xi(e);
}
function ia(e, t = []) {
	let n;
	switch (e) {
		case "Browser":
			n = Ki(v());
			break;
		case "Worker":
			n = `${Ki(v())}-${e}`;
			break;
		default: n = e;
	}
	let r = t.length ? t.join(",") : "FirebaseCore-web";
	return `${n}/JsCore/${en}/${r}`;
}
var aa = class {
	constructor(e) {
		this.auth = e, this.queue = [];
	}
	pushCallback(e, t) {
		let n = (t) => new Promise((n, r) => {
			try {
				n(e(t));
			} catch (e) {
				r(e);
			}
		});
		n.onAbort = t, this.queue.push(n);
		let r = this.queue.length - 1;
		return () => {
			this.queue[r] = () => Promise.resolve();
		};
	}
	async runMiddleware(e) {
		if (this.auth.currentUser === e) return;
		let t = [];
		try {
			for (let n of this.queue) await n(e), n.onAbort && t.push(n.onAbort);
		} catch (e) {
			t.reverse();
			for (let e of t) try {
				e();
			} catch {}
			throw this.auth._errorFactory.create("login-blocked", { originalMessage: e?.message });
		}
	}
};
async function oa(e, t = {}) {
	return ui(e, "GET", "/v2/passwordPolicy", li(e, t));
}
var sa = 6, ca = class {
	constructor(e) {
		let t = e.customStrengthOptions;
		this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = t.minPasswordLength ?? sa, t.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = t.maxPasswordLength), t.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = t.containsLowercaseCharacter), t.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = t.containsUppercaseCharacter), t.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = t.containsNumericCharacter), t.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = t.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = e.allowedNonAlphanumericCharacters?.join("") ?? "", this.forceUpgradeOnSignin = e.forceUpgradeOnSignin ?? !1, this.schemaVersion = e.schemaVersion;
	}
	validatePassword(e) {
		let t = {
			isValid: !0,
			passwordPolicy: this
		};
		return this.validatePasswordLengthOptions(e, t), this.validatePasswordCharacterOptions(e, t), t.isValid &&= t.meetsMinPasswordLength ?? !0, t.isValid &&= t.meetsMaxPasswordLength ?? !0, t.isValid &&= t.containsLowercaseLetter ?? !0, t.isValid &&= t.containsUppercaseLetter ?? !0, t.isValid &&= t.containsNumericCharacter ?? !0, t.isValid &&= t.containsNonAlphanumericCharacter ?? !0, t;
	}
	validatePasswordLengthOptions(e, t) {
		let n = this.customStrengthOptions.minPasswordLength, r = this.customStrengthOptions.maxPasswordLength;
		n && (t.meetsMinPasswordLength = e.length >= n), r && (t.meetsMaxPasswordLength = e.length <= r);
	}
	validatePasswordCharacterOptions(e, t) {
		this.updatePasswordCharacterOptionsStatuses(t, !1, !1, !1, !1);
		let n;
		for (let r = 0; r < e.length; r++) n = e.charAt(r), this.updatePasswordCharacterOptionsStatuses(t, n >= "a" && n <= "z", n >= "A" && n <= "Z", n >= "0" && n <= "9", this.allowedNonAlphanumericCharacters.includes(n));
	}
	updatePasswordCharacterOptionsStatuses(e, t, n, r, i) {
		this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter ||= t), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter ||= n), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter ||= r), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter ||= i);
	}
}, la = class {
	constructor(e, t, n, r) {
		this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = n, this.config = r, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new da(this), this.idTokenSubscription = new da(this), this.beforeStateQueue = new aa(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = Br, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this._resolvePersistenceManagerAvailable = void 0, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = r.sdkClientVersion, this._persistenceManagerAvailable = new Promise((e) => this._resolvePersistenceManagerAvailable = e);
	}
	_initializeWithPersistence(e, t) {
		return t && (this._popupRedirectResolver = Vi(t)), this._initializationPromise = this.queue(async () => {
			if (!this._deleted && (this.persistenceManager = await Gi.create(this, e), this._resolvePersistenceManagerAvailable?.(), !this._deleted)) {
				if (this._popupRedirectResolver?._shouldInitProactively) try {
					await this._popupRedirectResolver._initialize(this);
				} catch {}
				await this.initializeCurrentUser(t), this.lastNotifiedUid = this.currentUser?.uid || null, !this._deleted && (this._isInitialized = !0);
			}
		}), this._initializationPromise;
	}
	async _onStorageEvent() {
		if (this._deleted) return;
		let e = await this.assertedPersistence.getCurrentUser();
		if (!(!this.currentUser && !e)) {
			if (this.currentUser && e && this.currentUser.uid === e.uid) {
				this._currentUser._assign(e), await this.currentUser.getIdToken();
				return;
			}
			await this._updateCurrentUser(e, !0);
		}
	}
	async initializeCurrentUserFromIdToken(e) {
		try {
			let t = await xi(this, { idToken: e }), n = await zi._fromGetAccountInfoResponse(this, t, e);
			await this.directlySetCurrentUser(n);
		} catch (e) {
			console.warn("FirebaseServerApp could not login user with provided authIdToken: ", e), await this.directlySetCurrentUser(null);
		}
	}
	async initializeCurrentUser(e) {
		if (Zt(this.app)) {
			let e = this.app.settings.authIdToken;
			return e ? new Promise((t) => {
				setTimeout(() => this.initializeCurrentUserFromIdToken(e).then(t, t));
			}) : this.directlySetCurrentUser(null);
		}
		let t = await this.assertedPersistence.getCurrentUser(), n = t, r = !1;
		if (e && this.config.authDomain) {
			await this.getOrInitRedirectPersistenceManager();
			let t = this.redirectUser?._redirectEventId, i = n?._redirectEventId, a = await this.tryRedirectSignIn(e);
			(!t || t === i) && a?.user && (n = a.user, r = !0);
		}
		if (!n) return this.directlySetCurrentUser(null);
		if (!n._redirectEventId) {
			if (r) try {
				await this.beforeStateQueue.runMiddleware(n);
			} catch (e) {
				n = t, this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(e));
			}
			return n ? this.reloadAndSetCurrentUserOrClear(n) : this.directlySetCurrentUser(null);
		}
		return C(this._popupRedirectResolver, this, "argument-error"), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === n._redirectEventId ? this.directlySetCurrentUser(n) : this.reloadAndSetCurrentUserOrClear(n);
	}
	async tryRedirectSignIn(e) {
		let t = null;
		try {
			t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
		} catch {
			await this._setRedirectUser(null);
		}
		return t;
	}
	async reloadAndSetCurrentUserOrClear(e) {
		try {
			await ji(e);
		} catch (e) {
			if (e?.code !== "auth/network-request-failed") return this.directlySetCurrentUser(null);
		}
		return this.directlySetCurrentUser(e);
	}
	useDeviceLanguage() {
		this.languageCode = ni();
	}
	async _delete() {
		this._deleted = !0;
	}
	async updateCurrentUser(e) {
		if (Zt(this.app)) return Promise.reject(qr(this));
		let t = e ? y(e) : null;
		return t && C(t.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token"), this._updateCurrentUser(t && t._clone(this));
	}
	async _updateCurrentUser(e, t = !1) {
		if (!this._deleted) return e && C(this.tenantId === e.tenantId, this, "tenant-id-mismatch"), t || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
			await this.directlySetCurrentUser(e), this.notifyAuthListeners();
		});
	}
	async signOut() {
		return Zt(this.app) ? Promise.reject(qr(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(null, !0));
	}
	setPersistence(e) {
		return Zt(this.app) ? Promise.reject(qr(this)) : this.queue(async () => {
			await this.assertedPersistence.setPersistence(Vi(e));
		});
	}
	_getRecaptchaConfig() {
		return this.tenantId == null ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
	}
	async validatePassword(e) {
		this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
		let t = this._getPasswordPolicyInternal();
		return t.schemaVersion === this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? t.validatePassword(e) : Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {}));
	}
	_getPasswordPolicyInternal() {
		return this.tenantId === null ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
	}
	async _updatePasswordPolicy() {
		let e = new ca(await oa(this));
		this.tenantId === null ? this._projectPasswordPolicy = e : this._tenantPasswordPolicies[this.tenantId] = e;
	}
	_getPersistenceType() {
		return this.assertedPersistence.persistence.type;
	}
	_getPersistence() {
		return this.assertedPersistence.persistence;
	}
	_updateErrorMap(e) {
		this._errorFactory = new fe("auth", "Firebase", e());
	}
	onAuthStateChanged(e, t, n) {
		return this.registerStateListener(this.authStateSubscription, e, t, n);
	}
	beforeAuthStateChanged(e, t) {
		return this.beforeStateQueue.pushCallback(e, t);
	}
	onIdTokenChanged(e, t, n) {
		return this.registerStateListener(this.idTokenSubscription, e, t, n);
	}
	authStateReady() {
		return new Promise((e, t) => {
			if (this.currentUser) e();
			else {
				let n = this.onAuthStateChanged(() => {
					n(), e();
				}, t);
			}
		});
	}
	async revokeAccessToken(e) {
		if (this.currentUser) {
			let t = {
				providerId: "apple.com",
				tokenType: "ACCESS_TOKEN",
				token: e,
				idToken: await this.currentUser.getIdToken()
			};
			this.tenantId != null && (t.tenantId = this.tenantId), await Ii(this, t);
		}
	}
	toJSON() {
		return {
			apiKey: this.config.apiKey,
			authDomain: this.config.authDomain,
			appName: this.name,
			currentUser: this._currentUser?.toJSON()
		};
	}
	async _setRedirectUser(e, t) {
		let n = await this.getOrInitRedirectPersistenceManager(t);
		return e === null ? n.removeCurrentUser() : n.setCurrentUser(e);
	}
	async getOrInitRedirectPersistenceManager(e) {
		if (!this.redirectPersistenceManager) {
			let t = e && Vi(e) || this._popupRedirectResolver;
			C(t, this, "argument-error"), this.redirectPersistenceManager = await Gi.create(this, [Vi(t._redirectPersistence)], "redirectUser"), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
		}
		return this.redirectPersistenceManager;
	}
	async _redirectUserForId(e) {
		return this._isInitialized && await this.queue(async () => {}), this._currentUser?._redirectEventId === e ? this._currentUser : this.redirectUser?._redirectEventId === e ? this.redirectUser : null;
	}
	async _persistUserIfCurrent(e) {
		if (e === this.currentUser) return this.queue(async () => this.directlySetCurrentUser(e));
	}
	_notifyListenersIfCurrent(e) {
		e === this.currentUser && this.notifyAuthListeners();
	}
	_key() {
		return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
	}
	_startProactiveRefresh() {
		this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh();
	}
	_stopProactiveRefresh() {
		this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh();
	}
	get _currentUser() {
		return this.currentUser;
	}
	notifyAuthListeners() {
		if (!this._isInitialized) return;
		this.idTokenSubscription.next(this.currentUser);
		let e = this.currentUser?.uid ?? null;
		this.lastNotifiedUid !== e && (this.lastNotifiedUid = e, this.authStateSubscription.next(this.currentUser));
	}
	registerStateListener(e, t, n, r) {
		if (this._deleted) return () => {};
		let i = typeof t == "function" ? t : t.next.bind(t), a = !1, o = this._isInitialized ? Promise.resolve() : this._initializationPromise;
		if (C(o, this, "internal-error"), o.then(() => {
			a || i(this.currentUser);
		}), typeof t == "function") {
			let i = e.addObserver(t, n, r);
			return () => {
				a = !0, i();
			};
		}
		{
			let n = e.addObserver(t);
			return () => {
				a = !0, n();
			};
		}
	}
	async directlySetCurrentUser(e) {
		this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
	}
	queue(e) {
		return this.operations = this.operations.then(e, e), this.operations;
	}
	get assertedPersistence() {
		return C(this.persistenceManager, this, "internal-error"), this.persistenceManager;
	}
	_logFramework(e) {
		!e || this.frameworks.includes(e) || (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = ia(this.config.clientPlatform, this._getFrameworks()));
	}
	_getFrameworks() {
		return this.frameworks;
	}
	async _getAdditionalHeaders() {
		let e = { "X-Client-Version": this.clientVersion };
		this.app.options.appId && (e["X-Firebase-gmpid"] = this.app.options.appId);
		let t = await this.heartbeatServiceProvider.getImmediate({ optional: !0 })?.getHeartbeatsHeader();
		t && (e["X-Firebase-Client"] = t);
		let n = await this._getAppCheckToken();
		return n && (e["X-Firebase-AppCheck"] = n), e;
	}
	async _getAppCheckToken() {
		if (Zt(this.app) && this.app.settings.appCheckToken) return this.app.settings.appCheckToken;
		let e = await this.appCheckServiceProvider.getImmediate({ optional: !0 })?.getToken();
		return e?.error && Hr(`Error while retrieving App Check token: ${e.error}`), e?.token;
	}
};
function ua(e) {
	return y(e);
}
var da = class {
	constructor(e) {
		this.auth = e, this.observer = null, this.addObserver = be((e) => this.observer = e);
	}
	get next() {
		return C(this.observer, this.auth, "internal-error"), this.observer.next.bind(this.observer);
	}
}, fa = {
	async loadJS() {
		throw Error("Unable to load external scripts");
	},
	recaptchaV2Script: "",
	recaptchaEnterpriseScript: "",
	gapiScript: ""
};
function pa(e) {
	fa = e;
}
function ma(e) {
	return fa.loadJS(e);
}
function ha() {
	return fa.recaptchaEnterpriseScript;
}
function ga() {
	return fa.gapiScript;
}
function _a(e) {
	return `__${e}${Math.floor(Math.random() * 1e6)}`;
}
var va = class {
	constructor() {
		this.enterprise = new ya();
	}
	ready(e) {
		e();
	}
	execute(e, t) {
		return Promise.resolve("token");
	}
	render(e, t) {
		return "";
	}
}, ya = class {
	ready(e) {
		e();
	}
	execute(e, t) {
		return Promise.resolve("token");
	}
	render(e, t) {
		return "";
	}
}, ba = "recaptcha-enterprise", xa = "NO_RECAPTCHA", Sa = "onFirebaseAuthREInstanceReady", Ca = class e {
	constructor(e) {
		this.type = ba, this.auth = ua(e);
	}
	async verify(t = "verify", n = !1) {
		async function r(e) {
			if (!n) {
				if (e.tenantId == null && e._agentRecaptchaConfig != null) return e._agentRecaptchaConfig.siteKey;
				if (e.tenantId != null && e._tenantRecaptchaConfigs[e.tenantId] !== void 0) return e._tenantRecaptchaConfigs[e.tenantId].siteKey;
			}
			return new Promise(async (t, n) => {
				yi(e, {
					clientType: "CLIENT_TYPE_WEB",
					version: "RECAPTCHA_ENTERPRISE"
				}).then((r) => {
					if (r.recaptchaKey === void 0) n(/* @__PURE__ */ Error("recaptcha Enterprise site key undefined"));
					else {
						let n = new vi(r);
						return e.tenantId == null ? e._agentRecaptchaConfig = n : e._tenantRecaptchaConfigs[e.tenantId] = n, t(n.siteKey);
					}
				}).catch((e) => {
					n(e);
				});
			});
		}
		function i(e, n, r) {
			let i = window.grecaptcha;
			_i(i) ? i.enterprise.ready(() => {
				i.enterprise.execute(e, { action: t }).then((e) => {
					n(e);
				}).catch(() => {
					n(xa);
				});
			}) : r(Error("No reCAPTCHA enterprise script loaded."));
		}
		return this.auth.settings.appVerificationDisabledForTesting ? new va().execute("siteKey", { action: "verify" }) : new Promise((t, a) => {
			r(this.auth).then(async (r) => {
				if (!n && _i(window.grecaptcha) && e.scriptInjectionDeferred) await e.scriptInjectionDeferred.promise, i(r, t, a);
				else {
					if (typeof window > "u") {
						a(/* @__PURE__ */ Error("RecaptchaVerifier is only supported in browser"));
						return;
					}
					let n = ha();
					n.length !== 0 && (n += r + `&onload=${Sa}`), e.scriptInjectionDeferred = new _(), window[Sa] = () => {
						e.scriptInjectionDeferred?.resolve();
					}, ma(n).then(() => e.scriptInjectionDeferred?.promise).then(() => {
						i(r, t, a);
					}).catch((e) => {
						a(e);
					});
				}
			}).catch((e) => {
				a(e);
			});
		});
	}
};
Ca.scriptInjectionDeferred = null;
async function wa(e, t, n, r = !1, i = !1) {
	let a = new Ca(e), o;
	if (i) o = xa;
	else try {
		o = await a.verify(n);
	} catch {
		o = await a.verify(n, !0);
	}
	let s = { ...t };
	if (n === "mfaSmsEnrollment" || n === "mfaSmsSignIn") {
		if ("phoneEnrollmentInfo" in s) {
			let e = s.phoneEnrollmentInfo.phoneNumber, t = s.phoneEnrollmentInfo.recaptchaToken;
			Object.assign(s, { phoneEnrollmentInfo: {
				phoneNumber: e,
				recaptchaToken: t,
				captchaResponse: o,
				clientType: "CLIENT_TYPE_WEB",
				recaptchaVersion: "RECAPTCHA_ENTERPRISE"
			} });
		} else if ("phoneSignInInfo" in s) {
			let e = s.phoneSignInInfo.recaptchaToken;
			Object.assign(s, { phoneSignInInfo: {
				recaptchaToken: e,
				captchaResponse: o,
				clientType: "CLIENT_TYPE_WEB",
				recaptchaVersion: "RECAPTCHA_ENTERPRISE"
			} });
		}
		return s;
	}
	return r ? Object.assign(s, { captchaResp: o }) : Object.assign(s, { captchaResponse: o }), Object.assign(s, { clientType: "CLIENT_TYPE_WEB" }), Object.assign(s, { recaptchaVersion: "RECAPTCHA_ENTERPRISE" }), s;
}
async function Ta(e, t, n, r, i) {
	return i === "EMAIL_PASSWORD_PROVIDER" ? e._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER") ? r(e, await wa(e, t, n, n === "getOobCode")) : r(e, t).catch(async (i) => i.code === "auth/missing-recaptcha-token" ? (console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`), r(e, await wa(e, t, n, n === "getOobCode"))) : Promise.reject(i)) : i === "PHONE_PROVIDER" ? e._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER") ? r(e, await wa(e, t, n)).catch(async (i) => e._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER") === "AUDIT" && (i.code === "auth/missing-recaptcha-token" || i.code === "auth/invalid-app-credential") ? (console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`), r(e, await wa(e, t, n, !1, !0))) : Promise.reject(i)) : r(e, await wa(e, t, n, !1, !0)) : Promise.reject(i + " provider is not supported.");
}
function Ea(e, t) {
	let n = Xt(e, "auth");
	if (n.isInitialized()) {
		let e = n.getImmediate();
		if (he(n.getOptions(), t ?? {})) return e;
		Wr(e, "already-initialized");
	}
	return n.initialize({ options: t });
}
function Da(e, t) {
	let n = t?.persistence || [], r = (Array.isArray(n) ? n : [n]).map(Vi);
	t?.errorMap && e._updateErrorMap(t.errorMap), e._initializeWithPersistence(r, t?.popupRedirectResolver);
}
function Oa(e, t, n) {
	let r = ua(e);
	C(/^https?:\/\//.test(t), r, "invalid-emulator-scheme");
	let i = !!n?.disableWarnings, a = ka(t), { host: o, port: s } = Aa(t), c = s === null ? "" : `:${s}`, l = { url: `${a}//${o}${c}/` }, u = Object.freeze({
		host: o,
		port: s,
		protocol: a.replace(":", ""),
		options: Object.freeze({ disableWarnings: i })
	});
	if (!r._canInitEmulator) {
		C(r.config.emulator && r.emulatorConfig, r, "emulator-config-failed"), C(he(l, r.config.emulator) && he(u, r.emulatorConfig), r, "emulator-config-failed");
		return;
	}
	r.config.emulator = l, r.emulatorConfig = u, r.settings.appVerificationDisabledForTesting = !0, ke(o) ? Ae(`${a}//${o}${c}`) : i || Ma();
}
function ka(e) {
	let t = e.indexOf(":");
	return t < 0 ? "" : e.substr(0, t + 1);
}
function Aa(e) {
	let t = ka(e), n = /(\/\/)?([^?#/]+)/.exec(e.substr(t.length));
	if (!n) return {
		host: "",
		port: null
	};
	let r = n[2].split("@").pop() || "", i = /^(\[[^\]]+\])(:|$)/.exec(r);
	if (i) {
		let e = i[1];
		return {
			host: e,
			port: ja(r.substr(e.length + 1))
		};
	}
	{
		let [e, t] = r.split(":");
		return {
			host: e,
			port: ja(t)
		};
	}
}
function ja(e) {
	if (!e) return null;
	let t = Number(e);
	return isNaN(t) ? null : t;
}
function Ma() {
	function e() {
		let e = document.createElement("p"), t = e.style;
		e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
	}
	typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", e) : e());
}
var Na = class {
	constructor(e, t) {
		this.providerId = e, this.signInMethod = t;
	}
	toJSON() {
		return Xr("not implemented");
	}
	_getIdTokenResponse(e) {
		return Xr("not implemented");
	}
	_linkToIdToken(e, t) {
		return Xr("not implemented");
	}
	_getReauthenticationResolver(e) {
		return Xr("not implemented");
	}
};
async function Pa(e, t) {
	return ui(e, "POST", "/v1/accounts:signUp", t);
}
async function Fa(e, t) {
	return fi(e, "POST", "/v1/accounts:signInWithPassword", li(e, t));
}
async function Ia(e, t) {
	return ui(e, "POST", "/v1/accounts:sendOobCode", li(e, t));
}
async function La(e, t) {
	return Ia(e, t);
}
async function Ra(e, t) {
	return fi(e, "POST", "/v1/accounts:signInWithEmailLink", li(e, t));
}
async function za(e, t) {
	return fi(e, "POST", "/v1/accounts:signInWithEmailLink", li(e, t));
}
var Ba = class e extends Na {
	constructor(e, t, n, r = null) {
		super("password", n), this._email = e, this._password = t, this._tenantId = r;
	}
	static _fromEmailAndPassword(t, n) {
		return new e(t, n, "password");
	}
	static _fromEmailAndCode(t, n, r = null) {
		return new e(t, n, "emailLink", r);
	}
	toJSON() {
		return {
			email: this._email,
			password: this._password,
			signInMethod: this.signInMethod,
			tenantId: this._tenantId
		};
	}
	static fromJSON(e) {
		let t = typeof e == "string" ? JSON.parse(e) : e;
		if (t?.email && t?.password) {
			if (t.signInMethod === "password") return this._fromEmailAndPassword(t.email, t.password);
			if (t.signInMethod === "emailLink") return this._fromEmailAndCode(t.email, t.password, t.tenantId);
		}
		return null;
	}
	async _getIdTokenResponse(e) {
		switch (this.signInMethod) {
			case "password": return Ta(e, {
				returnSecureToken: !0,
				email: this._email,
				password: this._password,
				clientType: "CLIENT_TYPE_WEB"
			}, "signInWithPassword", Fa, "EMAIL_PASSWORD_PROVIDER");
			case "emailLink": return Ra(e, {
				email: this._email,
				oobCode: this._password
			});
			default: Wr(e, "internal-error");
		}
	}
	async _linkToIdToken(e, t) {
		switch (this.signInMethod) {
			case "password": return Ta(e, {
				idToken: t,
				returnSecureToken: !0,
				email: this._email,
				password: this._password,
				clientType: "CLIENT_TYPE_WEB"
			}, "signUpPassword", Pa, "EMAIL_PASSWORD_PROVIDER");
			case "emailLink": return za(e, {
				idToken: t,
				email: this._email,
				oobCode: this._password
			});
			default: Wr(e, "internal-error");
		}
	}
	_getReauthenticationResolver(e) {
		return this._getIdTokenResponse(e);
	}
};
async function Va(e, t) {
	return fi(e, "POST", "/v1/accounts:signInWithIdp", li(e, t));
}
var Ha = "http://localhost", Ua = class e extends Na {
	constructor() {
		super(...arguments), this.pendingToken = null;
	}
	static _fromParams(t) {
		let n = new e(t.providerId, t.signInMethod);
		return t.idToken || t.accessToken ? (t.idToken && (n.idToken = t.idToken), t.accessToken && (n.accessToken = t.accessToken), t.nonce && !t.pendingToken && (n.nonce = t.nonce), t.pendingToken && (n.pendingToken = t.pendingToken)) : t.oauthToken && t.oauthTokenSecret ? (n.accessToken = t.oauthToken, n.secret = t.oauthTokenSecret) : Wr("argument-error"), n;
	}
	toJSON() {
		return {
			idToken: this.idToken,
			accessToken: this.accessToken,
			secret: this.secret,
			nonce: this.nonce,
			pendingToken: this.pendingToken,
			providerId: this.providerId,
			signInMethod: this.signInMethod
		};
	}
	static fromJSON(t) {
		let { providerId: n, signInMethod: r, ...i } = typeof t == "string" ? JSON.parse(t) : t;
		if (!n || !r) return null;
		let a = new e(n, r);
		return a.idToken = i.idToken || void 0, a.accessToken = i.accessToken || void 0, a.secret = i.secret, a.nonce = i.nonce, a.pendingToken = i.pendingToken || null, a;
	}
	_getIdTokenResponse(e) {
		return Va(e, this.buildRequest());
	}
	_linkToIdToken(e, t) {
		let n = this.buildRequest();
		return n.idToken = t, Va(e, n);
	}
	_getReauthenticationResolver(e) {
		let t = this.buildRequest();
		return t.autoCreate = !1, Va(e, t);
	}
	buildRequest() {
		let e = {
			requestUri: Ha,
			returnSecureToken: !0
		};
		if (this.pendingToken) e.pendingToken = this.pendingToken;
		else {
			let t = {};
			this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = _e(t);
		}
		return e;
	}
};
function Wa(e) {
	switch (e) {
		case "recoverEmail": return "RECOVER_EMAIL";
		case "resetPassword": return "PASSWORD_RESET";
		case "signIn": return "EMAIL_SIGNIN";
		case "verifyEmail": return "VERIFY_EMAIL";
		case "verifyAndChangeEmail": return "VERIFY_AND_CHANGE_EMAIL";
		case "revertSecondFactorAddition": return "REVERT_SECOND_FACTOR_ADDITION";
		default: return null;
	}
}
function Ga(e) {
	let t = ve(ye(e)).link, n = t ? ve(ye(t)).deep_link_id : null, r = ve(ye(e)).deep_link_id;
	return (r ? ve(ye(r)).link : null) || r || n || t || e;
}
var Ka = class e {
	constructor(e) {
		let t = ve(ye(e)), n = t.apiKey ?? null, r = t.oobCode ?? null, i = Wa(t.mode ?? null);
		C(n && r && i, "argument-error"), this.apiKey = n, this.operation = i, this.code = r, this.continueUrl = t.continueUrl ?? null, this.languageCode = t.lang ?? null, this.tenantId = t.tenantId ?? null;
	}
	static parseLink(t) {
		let n = Ga(t);
		try {
			return new e(n);
		} catch {
			return null;
		}
	}
}, qa = class e {
	constructor() {
		this.providerId = e.PROVIDER_ID;
	}
	static credential(e, t) {
		return Ba._fromEmailAndPassword(e, t);
	}
	static credentialWithLink(e, t) {
		let n = Ka.parseLink(t);
		return C(n, "argument-error"), Ba._fromEmailAndCode(e, n.code, n.tenantId);
	}
};
qa.PROVIDER_ID = "password", qa.EMAIL_PASSWORD_SIGN_IN_METHOD = "password", qa.EMAIL_LINK_SIGN_IN_METHOD = "emailLink";
var Ja = class {
	constructor(e) {
		this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
	}
	setDefaultLanguage(e) {
		this.defaultLanguageCode = e;
	}
	setCustomParameters(e) {
		return this.customParameters = e, this;
	}
	getCustomParameters() {
		return this.customParameters;
	}
}, Ya = class extends Ja {
	constructor() {
		super(...arguments), this.scopes = [];
	}
	addScope(e) {
		return this.scopes.includes(e) || this.scopes.push(e), this;
	}
	getScopes() {
		return [...this.scopes];
	}
}, Xa = class e extends Ya {
	constructor() {
		super("facebook.com");
	}
	static credential(t) {
		return Ua._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.FACEBOOK_SIGN_IN_METHOD,
			accessToken: t
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t || !("oauthAccessToken" in t) || !t.oauthAccessToken) return null;
		try {
			return e.credential(t.oauthAccessToken);
		} catch {
			return null;
		}
	}
};
Xa.FACEBOOK_SIGN_IN_METHOD = "facebook.com", Xa.PROVIDER_ID = "facebook.com";
var Za = class e extends Ya {
	constructor() {
		super("google.com"), this.addScope("profile");
	}
	static credential(t, n) {
		return Ua._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.GOOGLE_SIGN_IN_METHOD,
			idToken: t,
			accessToken: n
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t) return null;
		let { oauthIdToken: n, oauthAccessToken: r } = t;
		if (!n && !r) return null;
		try {
			return e.credential(n, r);
		} catch {
			return null;
		}
	}
};
Za.GOOGLE_SIGN_IN_METHOD = "google.com", Za.PROVIDER_ID = "google.com";
var Qa = class e extends Ya {
	constructor() {
		super("github.com");
	}
	static credential(t) {
		return Ua._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.GITHUB_SIGN_IN_METHOD,
			accessToken: t
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t || !("oauthAccessToken" in t) || !t.oauthAccessToken) return null;
		try {
			return e.credential(t.oauthAccessToken);
		} catch {
			return null;
		}
	}
};
Qa.GITHUB_SIGN_IN_METHOD = "github.com", Qa.PROVIDER_ID = "github.com";
var $a = class e extends Ya {
	constructor() {
		super("twitter.com");
	}
	static credential(t, n) {
		return Ua._fromParams({
			providerId: e.PROVIDER_ID,
			signInMethod: e.TWITTER_SIGN_IN_METHOD,
			oauthToken: t,
			oauthTokenSecret: n
		});
	}
	static credentialFromResult(t) {
		return e.credentialFromTaggedObject(t);
	}
	static credentialFromError(t) {
		return e.credentialFromTaggedObject(t.customData || {});
	}
	static credentialFromTaggedObject({ _tokenResponse: t }) {
		if (!t) return null;
		let { oauthAccessToken: n, oauthTokenSecret: r } = t;
		if (!n || !r) return null;
		try {
			return e.credential(n, r);
		} catch {
			return null;
		}
	}
};
$a.TWITTER_SIGN_IN_METHOD = "twitter.com", $a.PROVIDER_ID = "twitter.com";
var eo = class e {
	constructor(e) {
		this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
	}
	static async _fromIdTokenResponse(t, n, r, i = !1) {
		let a = await zi._fromIdTokenResponse(t, r, i), o = to(r);
		return new e({
			user: a,
			providerId: o,
			_tokenResponse: r,
			operationType: n
		});
	}
	static async _forOperation(t, n, r) {
		await t._updateTokensIfNecessary(r, !0);
		let i = to(r);
		return new e({
			user: t,
			providerId: i,
			_tokenResponse: r,
			operationType: n
		});
	}
};
function to(e) {
	return e.providerId ? e.providerId : "phoneNumber" in e ? "phone" : null;
}
var no = class e extends de {
	constructor(t, n, r, i) {
		super(n.code, n.message), this.operationType = r, this.user = i, Object.setPrototypeOf(this, e.prototype), this.customData = {
			appName: t.name,
			tenantId: t.tenantId ?? void 0,
			_serverResponse: n.customData._serverResponse,
			operationType: r
		};
	}
	static _fromErrorAndOperation(t, n, r, i) {
		return new e(t, n, r, i);
	}
};
function ro(e, t, n, r) {
	return (t === "reauthenticate" ? n._getReauthenticationResolver(e) : n._getIdTokenResponse(e)).catch((n) => {
		throw n.code === "auth/multi-factor-auth-required" ? no._fromErrorAndOperation(e, n, t, r) : n;
	});
}
async function io(e, t, n = !1) {
	let r = await Di(e, t._linkToIdToken(e.auth, await e.getIdToken()), n);
	return eo._forOperation(e, "link", r);
}
async function ao(e, t, n = !1) {
	let { auth: r } = e;
	if (Zt(r.app)) return Promise.reject(qr(r));
	let i = "reauthenticate";
	try {
		let a = await Di(e, ro(r, i, t, e), n);
		C(a.idToken, r, "internal-error");
		let o = Ti(a.idToken);
		C(o, r, "internal-error");
		let { sub: s } = o;
		return C(e.uid === s, r, "user-mismatch"), eo._forOperation(e, i, a);
	} catch (e) {
		throw e?.code === "auth/user-not-found" && Wr(r, "user-mismatch"), e;
	}
}
async function oo(e, t, n = !1) {
	if (Zt(e.app)) return Promise.reject(qr(e));
	let r = "signIn", i = await ro(e, r, t), a = await eo._fromIdTokenResponse(e, r, i);
	return n || await e._updateCurrentUser(a.user), a;
}
async function so(e, t) {
	return oo(ua(e), t);
}
async function co(e, t) {
	return ao(y(e), t);
}
function lo(e, t, n) {
	C(n.url?.length > 0, e, "invalid-continue-uri"), C(n.dynamicLinkDomain === void 0 || n.dynamicLinkDomain.length > 0, e, "invalid-dynamic-link-domain"), C(n.linkDomain === void 0 || n.linkDomain.length > 0, e, "invalid-hosting-link-domain"), t.continueUrl = n.url, t.dynamicLinkDomain = n.dynamicLinkDomain, t.linkDomain = n.linkDomain, t.canHandleCodeInApp = n.handleCodeInApp, n.iOS && (C(n.iOS.bundleId.length > 0, e, "missing-ios-bundle-id"), t.iOSBundleId = n.iOS.bundleId), n.android && (C(n.android.packageName.length > 0, e, "missing-android-pkg-name"), t.androidInstallApp = n.android.installApp, t.androidMinimumVersionCode = n.android.minimumVersion, t.androidPackageName = n.android.packageName);
}
async function uo(e, t, n) {
	let r = ua(e), i = {
		requestType: "EMAIL_SIGNIN",
		email: t,
		clientType: "CLIENT_TYPE_WEB"
	};
	function a(e, t) {
		C(t.handleCodeInApp, r, "argument-error"), t && lo(r, e, t);
	}
	a(i, n), await Ta(r, i, "getOobCode", La, "EMAIL_PASSWORD_PROVIDER");
}
function fo(e, t) {
	return Ka.parseLink(t)?.operation === "EMAIL_SIGNIN";
}
async function po(e, t, n) {
	if (Zt(e.app)) return Promise.reject(qr(e));
	let r = y(e), i = qa.credentialWithLink(t, n || Qr());
	return C(i._tenantId === (r.tenantId || null), r, "tenant-id-mismatch"), so(r, i);
}
function mo(e, t, n, r) {
	return y(e).onIdTokenChanged(t, n, r);
}
function ho(e, t, n) {
	return y(e).beforeAuthStateChanged(t, n);
}
function go(e, t, n, r) {
	return y(e).onAuthStateChanged(t, n, r);
}
function _o(e) {
	return y(e).signOut();
}
async function vo(e) {
	return y(e).delete();
}
var yo = "__sak", bo = class {
	constructor(e, t) {
		this.storageRetriever = e, this.type = t;
	}
	_isAvailable() {
		try {
			return this.storage ? (this.storage.setItem(yo, "1"), this.storage.removeItem(yo), Promise.resolve(!0)) : Promise.resolve(!1);
		} catch {
			return Promise.resolve(!1);
		}
	}
	_set(e, t) {
		return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve();
	}
	_get(e) {
		let t = this.storage.getItem(e);
		return Promise.resolve(t ? JSON.parse(t) : null);
	}
	_remove(e) {
		return this.storage.removeItem(e), Promise.resolve();
	}
	get storage() {
		return this.storageRetriever();
	}
}, xo = 1e3, So = 10, Co = class extends bo {
	constructor() {
		super(() => window.localStorage, "LOCAL"), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = ra(), this._shouldAllowMigration = !0;
	}
	forAllChangedKeys(e) {
		for (let t of Object.keys(this.listeners)) {
			let n = this.storage.getItem(t), r = this.localCache[t];
			n !== r && e(t, r, n);
		}
	}
	onStorageEvent(e, t = !1) {
		if (!e.key) {
			this.forAllChangedKeys((e, t, n) => {
				this.notifyListeners(e, n);
			});
			return;
		}
		let n = e.key;
		t ? this.detachListener() : this.stopPolling();
		let r = () => {
			let e = this.storage.getItem(n);
			!t && this.localCache[n] === e || this.notifyListeners(n, e);
		}, i = this.storage.getItem(n);
		na() && i !== e.newValue && e.newValue !== e.oldValue ? setTimeout(r, So) : r();
	}
	notifyListeners(e, t) {
		this.localCache[e] = t;
		let n = this.listeners[e];
		if (n) for (let e of Array.from(n)) e(t && JSON.parse(t));
	}
	startPolling() {
		this.stopPolling(), this.pollTimer = setInterval(() => {
			this.forAllChangedKeys((e, t, n) => {
				this.onStorageEvent(new StorageEvent("storage", {
					key: e,
					oldValue: t,
					newValue: n
				}), !0);
			});
		}, xo);
	}
	stopPolling() {
		this.pollTimer &&= (clearInterval(this.pollTimer), null);
	}
	attachListener() {
		window.addEventListener("storage", this.boundEventHandler);
	}
	detachListener() {
		window.removeEventListener("storage", this.boundEventHandler);
	}
	_addListener(e, t) {
		Object.keys(this.listeners).length === 0 && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t);
	}
	_removeListener(e, t) {
		this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling());
	}
	async _set(e, t) {
		await super._set(e, t), this.localCache[e] = JSON.stringify(t);
	}
	async _get(e) {
		let t = await super._get(e);
		return this.localCache[e] = JSON.stringify(t), t;
	}
	async _remove(e) {
		await super._remove(e), delete this.localCache[e];
	}
};
Co.type = "LOCAL";
var wo = Co, To = class extends bo {
	constructor() {
		super(() => window.sessionStorage, "SESSION");
	}
	_addListener(e, t) {}
	_removeListener(e, t) {}
};
To.type = "SESSION";
var Eo = To;
function Do(e) {
	return Promise.all(e.map(async (e) => {
		try {
			return {
				fulfilled: !0,
				value: await e
			};
		} catch (e) {
			return {
				fulfilled: !1,
				reason: e
			};
		}
	}));
}
var Oo = class e {
	constructor(e) {
		this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
	}
	static _getInstance(t) {
		let n = this.receivers.find((e) => e.isListeningto(t));
		if (n) return n;
		let r = new e(t);
		return this.receivers.push(r), r;
	}
	isListeningto(e) {
		return this.eventTarget === e;
	}
	async handleEvent(e) {
		let t = e, { eventId: n, eventType: r, data: i } = t.data, a = this.handlersMap[r];
		if (!a?.size) return;
		t.ports[0].postMessage({
			status: "ack",
			eventId: n,
			eventType: r
		});
		let o = await Do(Array.from(a).map(async (e) => e(t.origin, i)));
		t.ports[0].postMessage({
			status: "done",
			eventId: n,
			eventType: r,
			response: o
		});
	}
	_subscribe(e, t) {
		Object.keys(this.handlersMap).length === 0 && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(t);
	}
	_unsubscribe(e, t) {
		this.handlersMap[e] && t && this.handlersMap[e].delete(t), (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e], Object.keys(this.handlersMap).length === 0 && this.eventTarget.removeEventListener("message", this.boundEventHandler);
	}
};
Oo.receivers = [];
function ko(e = "", t = 10) {
	let n = "";
	for (let e = 0; e < t; e++) n += Math.floor(Math.random() * 10);
	return e + n;
}
var Ao = class {
	constructor(e) {
		this.target = e, this.handlers = /* @__PURE__ */ new Set();
	}
	removeMessageHandler(e) {
		e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
	}
	async _send(e, t, n = 50) {
		let r = typeof MessageChannel < "u" ? new MessageChannel() : null;
		if (!r) throw Error("connection_unavailable");
		let i, a;
		return new Promise((o, s) => {
			let c = ko("", 20);
			r.port1.start();
			let l = setTimeout(() => {
				s(/* @__PURE__ */ Error("unsupported_event"));
			}, n);
			a = {
				messageChannel: r,
				onMessage(e) {
					let t = e;
					if (t.data.eventId === c) switch (t.data.status) {
						case "ack":
							clearTimeout(l), i = setTimeout(() => {
								s(/* @__PURE__ */ Error("timeout"));
							}, 3e3);
							break;
						case "done":
							clearTimeout(i), o(t.data.response);
							break;
						default: clearTimeout(l), clearTimeout(i), s(/* @__PURE__ */ Error("invalid_response"));
					}
				}
			}, this.handlers.add(a), r.port1.addEventListener("message", a.onMessage), this.target.postMessage({
				eventType: e,
				eventId: c,
				data: t
			}, [r.port2]);
		}).finally(() => {
			a && this.removeMessageHandler(a);
		});
	}
};
function jo() {
	return window;
}
function Mo(e) {
	jo().location.href = e;
}
function No() {
	return jo().WorkerGlobalScope !== void 0 && typeof jo().importScripts == "function";
}
async function Po() {
	if (!navigator?.serviceWorker) return null;
	try {
		return (await navigator.serviceWorker.ready).active;
	} catch {
		return null;
	}
}
function Fo() {
	return navigator?.serviceWorker?.controller || null;
}
function Io() {
	return No() ? self : null;
}
var Lo = "firebaseLocalStorageDb", Ro = 1, zo = "firebaseLocalStorage", Bo = "fbase_key", Vo = class {
	constructor(e) {
		this.request = e;
	}
	toPromise() {
		return new Promise((e, t) => {
			this.request.addEventListener("success", () => {
				e(this.request.result);
			}), this.request.addEventListener("error", () => {
				t(this.request.error);
			});
		});
	}
};
function Ho(e, t) {
	return e.transaction([zo], t ? "readwrite" : "readonly").objectStore(zo);
}
function Uo() {
	return new Vo(indexedDB.deleteDatabase(Lo)).toPromise();
}
function Wo() {
	let e = indexedDB.open(Lo, Ro);
	return new Promise((t, n) => {
		e.addEventListener("error", () => {
			n(e.error);
		}), e.addEventListener("upgradeneeded", () => {
			let t = e.result;
			try {
				t.createObjectStore(zo, { keyPath: Bo });
			} catch (e) {
				n(e);
			}
		}), e.addEventListener("success", async () => {
			let n = e.result;
			n.objectStoreNames.contains(zo) ? t(n) : (n.close(), await Uo(), t(await Wo()));
		});
	});
}
async function Go(e, t, n) {
	return new Vo(Ho(e, !0).put({
		[Bo]: t,
		value: n
	})).toPromise();
}
async function Ko(e, t) {
	let n = await new Vo(Ho(e, !1).get(t)).toPromise();
	return n === void 0 ? null : n.value;
}
function qo(e, t) {
	return new Vo(Ho(e, !0).delete(t)).toPromise();
}
var Jo = 800, Yo = 3, Xo = class {
	registerLifecycleListeners() {
		typeof window < "u" && typeof window.addEventListener == "function" && (window.addEventListener("pagehide", this.onPageHide), window.addEventListener("pageshow", this.onPageShow));
	}
	unregisterLifecycleListeners() {
		typeof window < "u" && typeof window.removeEventListener == "function" && (window.removeEventListener("pagehide", this.onPageHide), window.removeEventListener("pageshow", this.onPageShow));
	}
	constructor() {
		this.type = "LOCAL", this.dbPromise = null, this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.isClosing = !1, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this.onPageHide = () => {
			this.isClosing = !0, this.stopPolling(), this.dbPromise &&= (this.dbPromise.then((e) => e.close()).catch(() => {}), null);
		}, this.onPageShow = () => {
			this.isClosing && (this.isClosing = !1, Object.keys(this.listeners).length > 0 && this.startPolling());
		}, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {}, () => {});
	}
	async _openDb() {
		if (this.isClosing) throw Error("Database is closing");
		return this.dbPromise ? this.dbPromise : (this.dbPromise = Wo(), this.dbPromise.catch(() => {
			this.dbPromise = null;
		}), this.dbPromise);
	}
	async _withRetries(e) {
		let t = 0;
		for (;;) try {
			return await e(await this._openDb());
		} catch (e) {
			if (this.isClosing || t++ > Yo) throw e;
			this.dbPromise &&= ((await this.dbPromise).close(), null);
		}
	}
	async initializeServiceWorkerMessaging() {
		return No() ? this.initializeReceiver() : this.initializeSender();
	}
	async initializeReceiver() {
		this.receiver = Oo._getInstance(Io()), this.receiver._subscribe("keyChanged", async (e, t) => ({ keyProcessed: (await this._poll()).includes(t.key) })), this.receiver._subscribe("ping", async (e, t) => ["keyChanged"]);
	}
	async initializeSender() {
		if (this.activeServiceWorker = await Po(), !this.activeServiceWorker) return;
		this.sender = new Ao(this.activeServiceWorker);
		let e = await this.sender._send("ping", {}, 800);
		e && e[0]?.fulfilled && e[0]?.value.includes("keyChanged") && (this.serviceWorkerReceiverAvailable = !0);
	}
	async notifyServiceWorker(e) {
		if (!(!this.sender || !this.activeServiceWorker || Fo() !== this.activeServiceWorker)) try {
			await this.sender._send("keyChanged", { key: e }, this.serviceWorkerReceiverAvailable ? 800 : 50);
		} catch {}
	}
	async _isAvailable() {
		try {
			return indexedDB ? (await this._withRetries(async (e) => {
				await Go(e, yo, "1"), await qo(e, yo);
			}), !0) : !1;
		} catch {}
		return !1;
	}
	async _withPendingWrite(e) {
		this.pendingWrites++;
		try {
			await e();
		} finally {
			this.pendingWrites--;
		}
	}
	async _set(e, t) {
		return this._withPendingWrite(async () => (await this._withRetries((n) => Go(n, e, t)), this.localCache[e] = t, this.notifyServiceWorker(e)));
	}
	async _get(e) {
		let t = await this._withRetries((t) => Ko(t, e));
		return this.localCache[e] = t, t;
	}
	async _remove(e) {
		return this._withPendingWrite(async () => (await this._withRetries((t) => qo(t, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
	}
	async _poll() {
		if (this.isClosing) return [];
		try {
			let e = await this._withRetries((e) => new Vo(Ho(e, !1).getAll()).toPromise());
			if (this.isClosing || !e || this.pendingWrites !== 0) return [];
			let t = [], n = /* @__PURE__ */ new Set();
			if (e.length !== 0) for (let { fbase_key: r, value: i } of e) n.add(r), JSON.stringify(this.localCache[r]) !== JSON.stringify(i) && (this.notifyListeners(r, i), t.push(r));
			for (let e of Object.keys(this.localCache)) this.localCache[e] && !n.has(e) && (this.notifyListeners(e, null), t.push(e));
			return t;
		} catch (e) {
			return this.isClosing || Hr(`Firebase Auth cross-tab polling failed with error: ${e}`), [];
		}
	}
	notifyListeners(e, t) {
		this.localCache[e] = t;
		let n = this.listeners[e];
		if (n) for (let e of Array.from(n)) e(t);
	}
	startPolling() {
		this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), Jo);
	}
	stopPolling() {
		this.pollTimer &&= (clearInterval(this.pollTimer), null);
	}
	_addListener(e, t) {
		Object.keys(this.listeners).length === 0 && (this.startPolling(), this.registerLifecycleListeners()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(t);
	}
	_removeListener(e, t) {
		this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.stopPolling(), this.unregisterLifecycleListeners());
	}
};
Xo.type = "LOCAL";
var Zo = Xo;
_a("rcb"), new ri(3e4, 6e4);
function Qo(e, t) {
	return t ? Vi(t) : (C(e._popupRedirectResolver, e, "argument-error"), e._popupRedirectResolver);
}
var $o = class extends Na {
	constructor(e) {
		super("custom", "custom"), this.params = e;
	}
	_getIdTokenResponse(e) {
		return Va(e, this._buildIdpRequest());
	}
	_linkToIdToken(e, t) {
		return Va(e, this._buildIdpRequest(t));
	}
	_getReauthenticationResolver(e) {
		return Va(e, this._buildIdpRequest());
	}
	_buildIdpRequest(e) {
		let t = {
			requestUri: this.params.requestUri,
			sessionId: this.params.sessionId,
			postBody: this.params.postBody,
			tenantId: this.params.tenantId,
			pendingToken: this.params.pendingToken,
			returnSecureToken: !0,
			returnIdpCredential: !0
		};
		return e && (t.idToken = e), t;
	}
};
function es(e) {
	return oo(e.auth, new $o(e), e.bypassAuthState);
}
function ts(e) {
	let { auth: t, user: n } = e;
	return C(n, t, "internal-error"), ao(n, new $o(e), e.bypassAuthState);
}
async function ns(e) {
	let { auth: t, user: n } = e;
	return C(n, t, "internal-error"), io(n, new $o(e), e.bypassAuthState);
}
var rs = class {
	constructor(e, t, n, r, i = !1) {
		this.auth = e, this.resolver = n, this.user = r, this.bypassAuthState = i, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t];
	}
	execute() {
		return new Promise(async (e, t) => {
			this.pendingPromise = {
				resolve: e,
				reject: t
			};
			try {
				this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
			} catch (e) {
				this.reject(e);
			}
		});
	}
	async onAuthEvent(e) {
		let { urlResponse: t, sessionId: n, postBody: r, tenantId: i, error: a, type: o } = e;
		if (a) {
			this.reject(a);
			return;
		}
		let s = {
			auth: this.auth,
			requestUri: t,
			sessionId: n,
			tenantId: i || void 0,
			postBody: r || void 0,
			user: this.user,
			bypassAuthState: this.bypassAuthState
		};
		try {
			this.resolve(await this.getIdpTask(o)(s));
		} catch (e) {
			this.reject(e);
		}
	}
	onError(e) {
		this.reject(e);
	}
	getIdpTask(e) {
		switch (e) {
			case "signInViaPopup":
			case "signInViaRedirect": return es;
			case "linkViaPopup":
			case "linkViaRedirect": return ns;
			case "reauthViaPopup":
			case "reauthViaRedirect": return ts;
			default: Wr(this.auth, "internal-error");
		}
	}
	resolve(e) {
		Zr(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
	}
	reject(e) {
		Zr(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
	}
	unregisterAndCleanUp() {
		this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
	}
}, is = new ri(2e3, 1e4);
async function as(e, t, n) {
	if (Zt(e.app)) return Promise.reject(Gr(e, "operation-not-supported-in-this-environment"));
	let r = ua(e);
	return Jr(e, t, Ja), new ss(r, "signInViaPopup", t, Qo(r, n)).executeNotNull();
}
async function os(e, t, n) {
	let r = y(e);
	if (Zt(r.auth.app)) return Promise.reject(Gr(r.auth, "operation-not-supported-in-this-environment"));
	Jr(r.auth, t, Ja);
	let i = Qo(r.auth, n);
	return new ss(r.auth, "reauthViaPopup", t, i, r).executeNotNull();
}
var ss = class e extends rs {
	constructor(t, n, r, i, a) {
		super(t, n, i, a), this.provider = r, this.authWindow = null, this.pollId = null, e.currentPopupAction && e.currentPopupAction.cancel(), e.currentPopupAction = this;
	}
	async executeNotNull() {
		let e = await this.execute();
		return C(e, this.auth, "internal-error"), e;
	}
	async onExecution() {
		Zr(this.filter.length === 1, "Popup operations only handle one event");
		let e = ko();
		this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], e), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((e) => {
			this.reject(e);
		}), this.resolver._isIframeWebStorageSupported(this.auth, (e) => {
			e || this.reject(Gr(this.auth, "web-storage-unsupported"));
		}), this.pollUserCancellation();
	}
	get eventId() {
		return this.authWindow?.associatedEvent || null;
	}
	cancel() {
		this.reject(Gr(this.auth, "cancelled-popup-request"));
	}
	cleanUp() {
		this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, e.currentPopupAction = null;
	}
	pollUserCancellation() {
		let e = () => {
			if (this.authWindow?.window?.closed) {
				this.pollId = window.setTimeout(() => {
					this.pollId = null, this.reject(Gr(this.auth, "popup-closed-by-user"));
				}, 8e3);
				return;
			}
			this.pollId = window.setTimeout(e, is.get());
		};
		e();
	}
};
ss.currentPopupAction = null;
var cs = "pendingRedirect", ls = /* @__PURE__ */ new Map(), us = class extends rs {
	constructor(e, t, n = !1) {
		super(e, [
			"signInViaRedirect",
			"linkViaRedirect",
			"reauthViaRedirect",
			"unknown"
		], t, void 0, n), this.eventId = null;
	}
	async execute() {
		let e = ls.get(this.auth._key());
		if (!e) {
			try {
				let t = await ds(this.resolver, this.auth) ? await super.execute() : null;
				e = () => Promise.resolve(t);
			} catch (t) {
				e = () => Promise.reject(t);
			}
			ls.set(this.auth._key(), e);
		}
		return this.bypassAuthState || ls.set(this.auth._key(), () => Promise.resolve(null)), e();
	}
	async onAuthEvent(e) {
		if (e.type === "signInViaRedirect") return super.onAuthEvent(e);
		if (e.type === "unknown") {
			this.resolve(null);
			return;
		}
		if (e.eventId) {
			let t = await this.auth._redirectUserForId(e.eventId);
			if (t) return this.user = t, super.onAuthEvent(e);
			this.resolve(null);
		}
	}
	async onExecution() {}
	cleanUp() {}
};
async function ds(e, t) {
	let n = hs(t), r = ms(e);
	if (!await r._isAvailable()) return !1;
	let i = await r._get(n) === "true";
	return await r._remove(n), i;
}
async function fs(e, t) {
	return ms(e)._set(hs(t), "true");
}
function ps(e, t) {
	ls.set(e._key(), t);
}
function ms(e) {
	return Vi(e._redirectPersistence);
}
function hs(e) {
	return Wi(cs, e.config.apiKey, e.name);
}
function gs(e, t, n) {
	return _s(e, t, n);
}
async function _s(e, t, n) {
	if (Zt(e.app)) return Promise.reject(qr(e));
	let r = ua(e);
	Jr(e, t, Ja), await r._initializationPromise;
	let i = Qo(r, n);
	return await fs(i, r), i._openRedirect(r, t, "signInViaRedirect");
}
async function vs(e, t, n = !1) {
	if (Zt(e.app)) return Promise.reject(qr(e));
	let r = ua(e), i = await new us(r, Qo(r, t), n).execute();
	return i && !n && (delete i.user._redirectEventId, await r._persistUserIfCurrent(i.user), await r._setRedirectUser(null, t)), i;
}
var ys = 6e5, bs = class {
	constructor(e) {
		this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now();
	}
	registerConsumer(e) {
		this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
	}
	unregisterConsumer(e) {
		this.consumers.delete(e);
	}
	onEvent(e) {
		if (this.hasEventBeenHandled(e)) return !1;
		let t = !1;
		return this.consumers.forEach((n) => {
			this.isEventForConsumer(e, n) && (t = !0, this.sendToConsumer(e, n), this.saveEventToCache(e));
		}), this.hasHandledPotentialRedirect || !Cs(e) ? t : (this.hasHandledPotentialRedirect = !0, t ||= (this.queuedRedirectEvent = e, !0), t);
	}
	sendToConsumer(e, t) {
		if (e.error && !Ss(e)) {
			let n = e.error.code?.split("auth/")[1] || "internal-error";
			t.onError(Gr(this.auth, n));
		} else t.onAuthEvent(e);
	}
	isEventForConsumer(e, t) {
		let n = t.eventId === null || !!e.eventId && e.eventId === t.eventId;
		return t.filter.includes(e.type) && n;
	}
	hasEventBeenHandled(e) {
		return Date.now() - this.lastProcessedEventTime >= ys && this.cachedEventUids.clear(), this.cachedEventUids.has(xs(e));
	}
	saveEventToCache(e) {
		this.cachedEventUids.add(xs(e)), this.lastProcessedEventTime = Date.now();
	}
};
function xs(e) {
	return [
		e.type,
		e.eventId,
		e.sessionId,
		e.tenantId
	].filter((e) => e).join("-");
}
function Ss({ type: e, error: t }) {
	return e === "unknown" && t?.code === "auth/no-auth-event";
}
function Cs(e) {
	switch (e.type) {
		case "signInViaRedirect":
		case "linkViaRedirect":
		case "reauthViaRedirect": return !0;
		case "unknown": return Ss(e);
		default: return !1;
	}
}
async function ws(e, t = {}) {
	return ui(e, "GET", "/v1/projects", t);
}
var Ts = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, Es = /^https?/;
async function Ds(e) {
	if (e.config.emulator) return;
	let { authorizedDomains: t } = await ws(e);
	for (let e of t) try {
		if (Os(e)) return;
	} catch {}
	Wr(e, "unauthorized-domain");
}
function Os(e) {
	let t = Qr(), { protocol: n, hostname: r } = new URL(t);
	if (e.startsWith("chrome-extension://")) {
		let i = new URL(e);
		return i.hostname === "" && r === "" ? n === "chrome-extension:" && e.replace("chrome-extension://", "") === t.replace("chrome-extension://", "") : n === "chrome-extension:" && i.hostname === r;
	}
	if (!Es.test(n)) return !1;
	if (Ts.test(e)) return r === e;
	let i = e.replace(/\./g, "\\.");
	return RegExp("^(.+\\." + i + "|" + i + ")$", "i").test(r);
}
var ks = new ri(3e4, 6e4);
function As() {
	let e = jo().___jsl;
	if (e?.H) {
		for (let t of Object.keys(e.H)) if (e.H[t].r = e.H[t].r || [], e.H[t].L = e.H[t].L || [], e.H[t].r = [...e.H[t].L], e.CP) for (let t = 0; t < e.CP.length; t++) e.CP[t] = null;
	}
}
function js(e) {
	return new Promise((t, n) => {
		function r() {
			As(), gapi.load("gapi.iframes", {
				callback: () => {
					t(gapi.iframes.getContext());
				},
				ontimeout: () => {
					As(), n(Gr(e, "network-request-failed"));
				},
				timeout: ks.get()
			});
		}
		if (jo().gapi?.iframes?.Iframe) t(gapi.iframes.getContext());
		else if (jo().gapi?.load) r();
		else {
			let t = _a("iframefcb");
			return jo()[t] = () => {
				gapi.load ? r() : n(Gr(e, "network-request-failed"));
			}, ma(`${ga()}?onload=${t}`).catch((e) => n(e));
		}
	}).catch((e) => {
		throw Ms = null, e;
	});
}
var Ms = null;
function Ns(e) {
	return Ms ||= js(e), Ms;
}
var Ps = new ri(5e3, 15e3), Fs = "__/auth/iframe", Is = "emulator/auth/iframe", Ls = {
	style: {
		position: "absolute",
		top: "-100px",
		width: "1px",
		height: "1px"
	},
	"aria-hidden": "true",
	tabindex: "-1"
}, Rs = /* @__PURE__ */ new Map([
	["identitytoolkit.googleapis.com", "p"],
	["staging-identitytoolkit.sandbox.googleapis.com", "s"],
	["test-identitytoolkit.sandbox.googleapis.com", "t"]
]);
function zs(e) {
	let t = e.config;
	C(t.authDomain, e, "auth-domain-config-required");
	let n = t.emulator ? ii(t, Is) : `https://${e.config.authDomain}/${Fs}`, r = {
		apiKey: t.apiKey,
		appName: e.name,
		v: en
	}, i = Rs.get(e.config.apiHost);
	i && (r.eid = i);
	let a = e._getFrameworks();
	return a.length && (r.fw = a.join(",")), `${n}?${_e(r).slice(1)}`;
}
async function Bs(e) {
	let t = await Ns(e), n = jo().gapi;
	return C(n, e, "internal-error"), t.open({
		where: document.body,
		url: zs(e),
		messageHandlersFilter: n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
		attributes: Ls,
		dontclear: !0
	}, (t) => new Promise(async (n, r) => {
		await t.restyle({ setHideOnLeave: !1 });
		let i = Gr(e, "network-request-failed"), a = jo().setTimeout(() => {
			r(i);
		}, Ps.get());
		function o() {
			jo().clearTimeout(a), n(t);
		}
		t.ping(o).then(o, () => {
			r(i);
		});
	}));
}
var Vs = {
	location: "yes",
	resizable: "yes",
	statusbar: "yes",
	toolbar: "no"
}, Hs = 500, Us = 600, Ws = "_blank", Gs = "http://localhost", Ks = class {
	constructor(e) {
		this.window = e, this.associatedEvent = null;
	}
	close() {
		if (this.window) try {
			this.window.close();
		} catch {}
	}
};
function qs(e, t, n, r = Hs, i = Us) {
	let a = Math.max((window.screen.availHeight - i) / 2, 0).toString(), o = Math.max((window.screen.availWidth - r) / 2, 0).toString(), s = "", c = {
		...Vs,
		width: r.toString(),
		height: i.toString(),
		top: a,
		left: o
	}, l = v().toLowerCase();
	n && (s = Yi(l) ? Ws : n), qi(l) && (t ||= Gs, c.scrollbars = "yes");
	let u = Object.entries(c).reduce((e, [t, n]) => `${e}${t}=${n},`, "");
	if (ta(l) && s !== "_self") return Js(t || "", s), new Ks(null);
	let d = window.open(t || "", s, u);
	C(d, e, "popup-blocked");
	try {
		d.focus();
	} catch {}
	return new Ks(d);
}
function Js(e, t) {
	let n = document.createElement("a");
	n.href = e, n.target = t;
	let r = document.createEvent("MouseEvent");
	r.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), n.dispatchEvent(r);
}
var Ys = "__/auth/handler", Xs = "emulator/auth/handler", Zs = "fac";
async function Qs(e, t, n, r, i, a) {
	C(e.config.authDomain, e, "auth-domain-config-required"), C(e.config.apiKey, e, "invalid-api-key");
	let o = {
		apiKey: e.config.apiKey,
		appName: e.name,
		authType: n,
		redirectUrl: r,
		v: en,
		eventId: i
	};
	if (t instanceof Ja) {
		t.setDefaultLanguage(e.languageCode), o.providerId = t.providerId || "", me(t.getCustomParameters()) || (o.customParameters = JSON.stringify(t.getCustomParameters()));
		for (let [e, t] of Object.entries(a || {})) o[e] = t;
	}
	if (t instanceof Ya) {
		let e = t.getScopes().filter((e) => e !== "");
		e.length > 0 && (o.scopes = e.join(","));
	}
	e.tenantId && (o.tid = e.tenantId);
	let s = o;
	for (let e of Object.keys(s)) s[e] === void 0 && delete s[e];
	let c = await e._getAppCheckToken(), l = c ? `#${Zs}=${encodeURIComponent(c)}` : "";
	return `${$s(e)}?${_e(s).slice(1)}${l}`;
}
function $s({ config: e }) {
	return e.emulator ? ii(e, Xs) : `https://${e.authDomain}/${Ys}`;
}
var ec = "webStorageSupport", tc = class {
	constructor() {
		this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = Eo, this._completeRedirectFn = vs, this._overrideRedirectResult = ps;
	}
	async _openPopup(e, t, n, r) {
		return Zr(this.eventManagers[e._key()]?.manager, "_initialize() not called before _openPopup()"), qs(e, await Qs(e, t, n, Qr(), r), ko());
	}
	async _openRedirect(e, t, n, r) {
		return await this._originValidation(e), Mo(await Qs(e, t, n, Qr(), r)), new Promise(() => {});
	}
	_initialize(e) {
		let t = e._key();
		if (this.eventManagers[t]) {
			let { manager: e, promise: n } = this.eventManagers[t];
			return e ? Promise.resolve(e) : (Zr(n, "If manager is not set, promise should be"), n);
		}
		let n = this.initAndGetManager(e);
		return this.eventManagers[t] = { promise: n }, n.catch(() => {
			delete this.eventManagers[t];
		}), n;
	}
	async initAndGetManager(e) {
		let t = await Bs(e), n = new bs(e);
		return t.register("authEvent", (t) => (C(t?.authEvent, e, "invalid-auth-event"), { status: n.onEvent(t.authEvent) ? "ACK" : "ERROR" }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: n }, this.iframes[e._key()] = t, n;
	}
	_isIframeWebStorageSupported(e, t) {
		this.iframes[e._key()].send(ec, { type: ec }, (n) => {
			let r = n?.[0]?.[ec];
			r !== void 0 && t(!!r), Wr(e, "internal-error");
		}, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
	}
	_originValidation(e) {
		let t = e._key();
		return this.originValidationPromises[t] || (this.originValidationPromises[t] = Ds(e)), this.originValidationPromises[t];
	}
	get _shouldInitProactively() {
		return ra() || Ji() || ea();
	}
}, nc = "@firebase/auth", rc = "1.13.5", ic = class {
	constructor(e) {
		this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
	}
	getUid() {
		return this.assertAuthConfigured(), this.auth.currentUser?.uid || null;
	}
	async getToken(e) {
		return this.assertAuthConfigured(), await this.auth._initializationPromise, this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null;
	}
	addAuthTokenListener(e) {
		if (this.assertAuthConfigured(), this.internalListeners.has(e)) return;
		let t = this.auth.onIdTokenChanged((t) => {
			e(t?.stsTokenManager.accessToken || null);
		});
		this.internalListeners.set(e, t), this.updateProactiveRefresh();
	}
	removeAuthTokenListener(e) {
		this.assertAuthConfigured();
		let t = this.internalListeners.get(e);
		t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
	}
	assertAuthConfigured() {
		C(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth");
	}
	updateProactiveRefresh() {
		this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
	}
};
function ac(e) {
	switch (e) {
		case "Node": return "node";
		case "ReactNative": return "rn";
		case "Worker": return "webworker";
		case "Cordova": return "cordova";
		case "WebExtension": return "web-extension";
		default: return;
	}
}
function oc(e) {
	Yt(new je("auth", (t, { options: n }) => {
		let r = t.getProvider("app").getImmediate(), i = t.getProvider("heartbeat"), a = t.getProvider("app-check-internal"), { apiKey: o, authDomain: s } = r.options;
		C(o && !o.includes(":"), "invalid-api-key", { appName: r.name });
		let c = new la(r, i, a, {
			apiKey: o,
			authDomain: s,
			clientPlatform: e,
			apiHost: "identitytoolkit.googleapis.com",
			tokenApiHost: "securetoken.googleapis.com",
			apiScheme: "https",
			sdkClientVersion: ia(e)
		});
		return Da(c, n), c;
	}, "PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e, t, n) => {
		e.getProvider("auth-internal").initialize();
	})), Yt(new je("auth-internal", (e) => ((e) => new ic(e))(ua(e.getProvider("auth").getImmediate())), "PRIVATE").setInstantiationMode("EXPLICIT")), rn(nc, rc, ac(e)), rn(nc, rc, "esm2020");
}
var sc = g("authIdTokenMaxAge") || 300, cc = null, lc = (e) => async (t) => {
	let n = t && await t.getIdTokenResult(), r = n && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(n.issuedAtTime)) / 1e3;
	if (r && r > sc) return;
	let i = n?.token;
	cc !== i && (cc = i, await fetch(e, {
		method: i ? "POST" : "DELETE",
		headers: i ? { Authorization: `Bearer ${i}` } : {}
	}));
};
function uc(e = nn()) {
	let t = Xt(e, "auth");
	if (t.isInitialized()) return t.getImmediate();
	let n = Ea(e, {
		popupRedirectResolver: tc,
		persistence: [
			Zo,
			wo,
			Eo
		]
	}), r = g("authTokenSyncURL");
	if (r && typeof isSecureContext == "boolean" && isSecureContext) {
		let e = new URL(r, location.origin);
		if (location.origin === e.origin) {
			let t = lc(e.toString());
			ho(n, t, () => t(n.currentUser)), mo(n, (e) => t(e));
		}
	}
	let i = p("auth");
	return i && Oa(n, `http://${i}`), n;
}
function dc() {
	return document.getElementsByTagName("head")?.[0] ?? document;
}
pa({
	loadJS(e) {
		return new Promise((t, n) => {
			let r = document.createElement("script");
			r.setAttribute("src", e), r.onload = t, r.onerror = (e) => {
				let t = Gr("internal-error");
				t.customData = e, n(t);
			}, r.type = "text/javascript", r.charset = "UTF-8", dc().appendChild(r);
		});
	},
	gapiScript: "https://apis.google.com/js/api.js",
	recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
	recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
}), oc("Browser");
//#endregion
//#region node_modules/@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js
var fc = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, pc = {}, mc, hc;
(function() {
	var e;
	function t(e, t) {
		function n() {}
		n.prototype = t.prototype, e.F = t.prototype, e.prototype = new n(), e.prototype.constructor = e, e.D = function(e, n, r) {
			for (var i = Array(arguments.length - 2), a = 2; a < arguments.length; a++) i[a - 2] = arguments[a];
			return t.prototype[n].apply(e, i);
		};
	}
	function n() {
		this.blockSize = -1;
	}
	function r() {
		this.blockSize = -1, this.blockSize = 64, this.g = [
			,
			,
			,
			,
		], this.C = Array(this.blockSize), this.o = this.h = 0, this.u();
	}
	t(r, n), r.prototype.u = function() {
		this.g[0] = 1732584193, this.g[1] = 4023233417, this.g[2] = 2562383102, this.g[3] = 271733878, this.o = this.h = 0;
	};
	function i(e, t, n) {
		n ||= 0;
		let r = Array(16);
		if (typeof t == "string") for (var i = 0; i < 16; ++i) r[i] = t.charCodeAt(n++) | t.charCodeAt(n++) << 8 | t.charCodeAt(n++) << 16 | t.charCodeAt(n++) << 24;
		else for (i = 0; i < 16; ++i) r[i] = t[n++] | t[n++] << 8 | t[n++] << 16 | t[n++] << 24;
		t = e.g[0], n = e.g[1], i = e.g[2];
		let a = e.g[3], o;
		o = t + (a ^ n & (i ^ a)) + r[0] + 3614090360 & 4294967295, t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[1] + 3905402710 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[2] + 606105819 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[3] + 3250441966 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (a ^ n & (i ^ a)) + r[4] + 4118548399 & 4294967295, t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[5] + 1200080426 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[6] + 2821735955 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[7] + 4249261313 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (a ^ n & (i ^ a)) + r[8] + 1770035416 & 4294967295, t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[9] + 2336552879 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[10] + 4294925233 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[11] + 2304563134 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (a ^ n & (i ^ a)) + r[12] + 1804603682 & 4294967295, t = n + (o << 7 & 4294967295 | o >>> 25), o = a + (i ^ t & (n ^ i)) + r[13] + 4254626195 & 4294967295, a = t + (o << 12 & 4294967295 | o >>> 20), o = i + (n ^ a & (t ^ n)) + r[14] + 2792965006 & 4294967295, i = a + (o << 17 & 4294967295 | o >>> 15), o = n + (t ^ i & (a ^ t)) + r[15] + 1236535329 & 4294967295, n = i + (o << 22 & 4294967295 | o >>> 10), o = t + (i ^ a & (n ^ i)) + r[1] + 4129170786 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[6] + 3225465664 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[11] + 643717713 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[0] + 3921069994 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (i ^ a & (n ^ i)) + r[5] + 3593408605 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[10] + 38016083 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[15] + 3634488961 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[4] + 3889429448 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (i ^ a & (n ^ i)) + r[9] + 568446438 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[14] + 3275163606 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[3] + 4107603335 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[8] + 1163531501 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (i ^ a & (n ^ i)) + r[13] + 2850285829 & 4294967295, t = n + (o << 5 & 4294967295 | o >>> 27), o = a + (n ^ i & (t ^ n)) + r[2] + 4243563512 & 4294967295, a = t + (o << 9 & 4294967295 | o >>> 23), o = i + (t ^ n & (a ^ t)) + r[7] + 1735328473 & 4294967295, i = a + (o << 14 & 4294967295 | o >>> 18), o = n + (a ^ t & (i ^ a)) + r[12] + 2368359562 & 4294967295, n = i + (o << 20 & 4294967295 | o >>> 12), o = t + (n ^ i ^ a) + r[5] + 4294588738 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[8] + 2272392833 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[11] + 1839030562 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[14] + 4259657740 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (n ^ i ^ a) + r[1] + 2763975236 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[4] + 1272893353 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[7] + 4139469664 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[10] + 3200236656 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (n ^ i ^ a) + r[13] + 681279174 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[0] + 3936430074 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[3] + 3572445317 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[6] + 76029189 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (n ^ i ^ a) + r[9] + 3654602809 & 4294967295, t = n + (o << 4 & 4294967295 | o >>> 28), o = a + (t ^ n ^ i) + r[12] + 3873151461 & 4294967295, a = t + (o << 11 & 4294967295 | o >>> 21), o = i + (a ^ t ^ n) + r[15] + 530742520 & 4294967295, i = a + (o << 16 & 4294967295 | o >>> 16), o = n + (i ^ a ^ t) + r[2] + 3299628645 & 4294967295, n = i + (o << 23 & 4294967295 | o >>> 9), o = t + (i ^ (n | ~a)) + r[0] + 4096336452 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[7] + 1126891415 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[14] + 2878612391 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[5] + 4237533241 & 4294967295, n = i + (o << 21 & 4294967295 | o >>> 11), o = t + (i ^ (n | ~a)) + r[12] + 1700485571 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[3] + 2399980690 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[10] + 4293915773 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[1] + 2240044497 & 4294967295, n = i + (o << 21 & 4294967295 | o >>> 11), o = t + (i ^ (n | ~a)) + r[8] + 1873313359 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[15] + 4264355552 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[6] + 2734768916 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[13] + 1309151649 & 4294967295, n = i + (o << 21 & 4294967295 | o >>> 11), o = t + (i ^ (n | ~a)) + r[4] + 4149444226 & 4294967295, t = n + (o << 6 & 4294967295 | o >>> 26), o = a + (n ^ (t | ~i)) + r[11] + 3174756917 & 4294967295, a = t + (o << 10 & 4294967295 | o >>> 22), o = i + (t ^ (a | ~n)) + r[2] + 718787259 & 4294967295, i = a + (o << 15 & 4294967295 | o >>> 17), o = n + (a ^ (i | ~t)) + r[9] + 3951481745 & 4294967295, e.g[0] = e.g[0] + t & 4294967295, e.g[1] = e.g[1] + (i + (o << 21 & 4294967295 | o >>> 11)) & 4294967295, e.g[2] = e.g[2] + i & 4294967295, e.g[3] = e.g[3] + a & 4294967295;
	}
	r.prototype.v = function(e, t) {
		t === void 0 && (t = e.length);
		let n = t - this.blockSize, r = this.C, a = this.h, o = 0;
		for (; o < t;) {
			if (a == 0) for (; o <= n;) i(this, e, o), o += this.blockSize;
			if (typeof e == "string") {
				for (; o < t;) if (r[a++] = e.charCodeAt(o++), a == this.blockSize) {
					i(this, r), a = 0;
					break;
				}
			} else for (; o < t;) if (r[a++] = e[o++], a == this.blockSize) {
				i(this, r), a = 0;
				break;
			}
		}
		this.h = a, this.o += t;
	}, r.prototype.A = function() {
		var e = Array((this.h < 56 ? this.blockSize : this.blockSize * 2) - this.h);
		e[0] = 128;
		for (var t = 1; t < e.length - 8; ++t) e[t] = 0;
		t = this.o * 8;
		for (var n = e.length - 8; n < e.length; ++n) e[n] = t & 255, t /= 256;
		for (this.v(e), e = Array(16), t = 0, n = 0; n < 4; ++n) for (let r = 0; r < 32; r += 8) e[t++] = this.g[n] >>> r & 255;
		return e;
	};
	function a(e, t) {
		var n = s;
		return Object.prototype.hasOwnProperty.call(n, e) ? n[e] : n[e] = t(e);
	}
	function o(e, t) {
		this.h = t;
		let n = [], r = !0;
		for (let i = e.length - 1; i >= 0; i--) {
			let a = e[i] | 0;
			r && a == t || (n[i] = a, r = !1);
		}
		this.g = n;
	}
	var s = {};
	function c(e) {
		return -128 <= e && e < 128 ? a(e, function(e) {
			return new o([e | 0], e < 0 ? -1 : 0);
		}) : new o([e | 0], e < 0 ? -1 : 0);
	}
	function l(e) {
		if (isNaN(e) || !isFinite(e)) return d;
		if (e < 0) return g(l(-e));
		let t = [], n = 1;
		for (let r = 0; e >= n; r++) t[r] = e / n | 0, n *= 4294967296;
		return new o(t, 0);
	}
	function u(e, t) {
		if (e.length == 0) throw Error("number format error: empty string");
		if (t ||= 10, t < 2 || 36 < t) throw Error("radix out of range: " + t);
		if (e.charAt(0) == "-") return g(u(e.substring(1), t));
		if (e.indexOf("-") >= 0) throw Error("number format error: interior \"-\" character");
		let n = l(t ** 8), r = d;
		for (let a = 0; a < e.length; a += 8) {
			var i = Math.min(8, e.length - a);
			let o = parseInt(e.substring(a, a + i), t);
			i < 8 ? (i = l(t ** +i), r = r.j(i).add(l(o))) : (r = r.j(n), r = r.add(l(o)));
		}
		return r;
	}
	var d = c(0), f = c(1), p = c(16777216);
	e = o.prototype, e.m = function() {
		if (h(this)) return -g(this).m();
		let e = 0, t = 1;
		for (let n = 0; n < this.g.length; n++) {
			let r = this.i(n);
			e += (r >= 0 ? r : 4294967296 + r) * t, t *= 4294967296;
		}
		return e;
	}, e.toString = function(e) {
		if (e ||= 10, e < 2 || 36 < e) throw Error("radix out of range: " + e);
		if (m(this)) return "0";
		if (h(this)) return "-" + g(this).toString(e);
		let t = l(e ** 6);
		var n = this;
		let r = "";
		for (;;) {
			let i = te(n, t).g;
			n = _(n, i.j(t));
			let a = ((n.g.length > 0 ? n.g[0] : n.h) >>> 0).toString(e);
			if (n = i, m(n)) return a + r;
			for (; a.length < 6;) a = "0" + a;
			r = a + r;
		}
	}, e.i = function(e) {
		return e < 0 ? 0 : e < this.g.length ? this.g[e] : this.h;
	};
	function m(e) {
		if (e.h != 0) return !1;
		for (let t = 0; t < e.g.length; t++) if (e.g[t] != 0) return !1;
		return !0;
	}
	function h(e) {
		return e.h == -1;
	}
	e.l = function(e) {
		return e = _(this, e), h(e) ? -1 : +!m(e);
	};
	function g(e) {
		let t = e.g.length, n = [];
		for (let r = 0; r < t; r++) n[r] = ~e.g[r];
		return new o(n, ~e.h).add(f);
	}
	e.abs = function() {
		return h(this) ? g(this) : this;
	}, e.add = function(e) {
		let t = Math.max(this.g.length, e.g.length), n = [], r = 0;
		for (let i = 0; i <= t; i++) {
			let t = r + (this.i(i) & 65535) + (e.i(i) & 65535), a = (t >>> 16) + (this.i(i) >>> 16) + (e.i(i) >>> 16);
			r = a >>> 16, t &= 65535, a &= 65535, n[i] = a << 16 | t;
		}
		return new o(n, n[n.length - 1] & -2147483648 ? -1 : 0);
	};
	function _(e, t) {
		return e.add(g(t));
	}
	e.j = function(e) {
		if (m(this) || m(e)) return d;
		if (h(this)) return h(e) ? g(this).j(g(e)) : g(g(this).j(e));
		if (h(e)) return g(this.j(g(e)));
		if (this.l(p) < 0 && e.l(p) < 0) return l(this.m() * e.m());
		let t = this.g.length + e.g.length, n = [];
		for (var r = 0; r < 2 * t; r++) n[r] = 0;
		for (r = 0; r < this.g.length; r++) for (let t = 0; t < e.g.length; t++) {
			let i = this.i(r) >>> 16, a = this.i(r) & 65535, o = e.i(t) >>> 16, s = e.i(t) & 65535;
			n[2 * r + 2 * t] += a * s, ee(n, 2 * r + 2 * t), n[2 * r + 2 * t + 1] += i * s, ee(n, 2 * r + 2 * t + 1), n[2 * r + 2 * t + 1] += a * o, ee(n, 2 * r + 2 * t + 1), n[2 * r + 2 * t + 2] += i * o, ee(n, 2 * r + 2 * t + 2);
		}
		for (e = 0; e < t; e++) n[e] = n[2 * e + 1] << 16 | n[2 * e];
		for (e = t; e < 2 * t; e++) n[e] = 0;
		return new o(n, 0);
	};
	function ee(e, t) {
		for (; (e[t] & 65535) != e[t];) e[t + 1] += e[t] >>> 16, e[t] &= 65535, t++;
	}
	function v(e, t) {
		this.g = e, this.h = t;
	}
	function te(e, t) {
		if (m(t)) throw Error("division by zero");
		if (m(e)) return new v(d, d);
		if (h(e)) return t = te(g(e), t), new v(g(t.g), g(t.h));
		if (h(t)) return t = te(e, g(t)), new v(g(t.g), t.h);
		if (e.g.length > 30) {
			if (h(e) || h(t)) throw Error("slowDivide_ only works with positive integers.");
			for (var n = f, r = t; r.l(e) <= 0;) n = ne(n), r = ne(r);
			var i = re(n, 1), a = re(r, 1);
			for (r = re(r, 2), n = re(n, 2); !m(r);) {
				var o = a.add(r);
				o.l(e) <= 0 && (i = i.add(n), a = o), r = re(r, 1), n = re(n, 1);
			}
			return t = _(e, i.j(t)), new v(i, t);
		}
		for (i = d; e.l(t) >= 0;) {
			for (n = Math.max(1, Math.floor(e.m() / t.m())), r = Math.ceil(Math.log(n) / Math.LN2), r = r <= 48 ? 1 : 2 ** (r - 48), a = l(n), o = a.j(t); h(o) || o.l(e) > 0;) n -= r, a = l(n), o = a.j(t);
			m(a) && (a = f), i = i.add(a), e = _(e, o);
		}
		return new v(i, e);
	}
	e.B = function(e) {
		return te(this, e).h;
	}, e.and = function(e) {
		let t = Math.max(this.g.length, e.g.length), n = [];
		for (let r = 0; r < t; r++) n[r] = this.i(r) & e.i(r);
		return new o(n, this.h & e.h);
	}, e.or = function(e) {
		let t = Math.max(this.g.length, e.g.length), n = [];
		for (let r = 0; r < t; r++) n[r] = this.i(r) | e.i(r);
		return new o(n, this.h | e.h);
	}, e.xor = function(e) {
		let t = Math.max(this.g.length, e.g.length), n = [];
		for (let r = 0; r < t; r++) n[r] = this.i(r) ^ e.i(r);
		return new o(n, this.h ^ e.h);
	};
	function ne(e) {
		let t = e.g.length + 1, n = [];
		for (let r = 0; r < t; r++) n[r] = e.i(r) << 1 | e.i(r - 1) >>> 31;
		return new o(n, e.h);
	}
	function re(e, t) {
		let n = t >> 5;
		t %= 32;
		let r = e.g.length - n, i = [];
		for (let a = 0; a < r; a++) i[a] = t > 0 ? e.i(a + n) >>> t | e.i(a + n + 1) << 32 - t : e.i(a + n);
		return new o(i, e.h);
	}
	r.prototype.digest = r.prototype.A, r.prototype.reset = r.prototype.u, r.prototype.update = r.prototype.v, hc = pc.Md5 = r, o.prototype.add = o.prototype.add, o.prototype.multiply = o.prototype.j, o.prototype.modulo = o.prototype.B, o.prototype.compare = o.prototype.l, o.prototype.toNumber = o.prototype.m, o.prototype.toString = o.prototype.toString, o.prototype.getBits = o.prototype.i, o.fromNumber = l, o.fromString = u, mc = pc.Integer = o;
}).apply(fc === void 0 ? typeof self < "u" ? self : typeof window < "u" ? window : {} : fc);
//#endregion
//#region node_modules/@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js
var gc = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, _c = {}, vc, yc, bc, xc, Sc, Cc, wc, Tc;
(function() {
	var e, t = Object.defineProperty;
	function n(e) {
		e = [
			typeof globalThis == "object" && globalThis,
			e,
			typeof window == "object" && window,
			typeof self == "object" && self,
			typeof gc == "object" && gc
		];
		for (var t = 0; t < e.length; ++t) {
			var n = e[t];
			if (n && n.Math == Math) return n;
		}
		throw Error("Cannot find global object");
	}
	var r = n(this);
	function i(e, n) {
		if (n) a: {
			var i = r;
			e = e.split(".");
			for (var a = 0; a < e.length - 1; a++) {
				var o = e[a];
				if (!(o in i)) break a;
				i = i[o];
			}
			e = e[e.length - 1], a = i[e], n = n(a), n != a && n != null && t(i, e, {
				configurable: !0,
				writable: !0,
				value: n
			});
		}
	}
	i("Symbol.dispose", function(e) {
		return e || Symbol("Symbol.dispose");
	}), i("Array.prototype.values", function(e) {
		return e || function() {
			return this[Symbol.iterator]();
		};
	}), i("Object.entries", function(e) {
		return e || function(e) {
			var t = [], n;
			for (n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push([n, e[n]]);
			return t;
		};
	});
	var a = a || {}, o = this || self;
	function s(e) {
		var t = typeof e;
		return t == "object" && e != null || t == "function";
	}
	function c(e, t, n) {
		return e.call.apply(e.bind, arguments);
	}
	function l(e, t, n) {
		return l = c, l.apply(null, arguments);
	}
	function u(e, t) {
		var n = Array.prototype.slice.call(arguments, 1);
		return function() {
			var t = n.slice();
			return t.push.apply(t, arguments), e.apply(this, t);
		};
	}
	function d(e, t) {
		function n() {}
		n.prototype = t.prototype, e.Z = t.prototype, e.prototype = new n(), e.prototype.constructor = e, e.Ob = function(e, n, r) {
			for (var i = Array(arguments.length - 2), a = 2; a < arguments.length; a++) i[a - 2] = arguments[a];
			return t.prototype[n].apply(e, i);
		};
	}
	var f = typeof AsyncContext < "u" && typeof AsyncContext.Snapshot == "function" ? (e) => e && AsyncContext.Snapshot.wrap(e) : (e) => e;
	function p(e) {
		let t = e.length;
		if (t > 0) {
			let n = Array(t);
			for (let r = 0; r < t; r++) n[r] = e[r];
			return n;
		}
		return [];
	}
	function m(e, t) {
		for (let t = 1; t < arguments.length; t++) {
			let r = arguments[t];
			var n = typeof r;
			if (n = n == "object" ? r ? Array.isArray(r) ? "array" : n : "null" : n, n == "array" || n == "object" && typeof r.length == "number") {
				n = e.length || 0;
				let t = r.length || 0;
				e.length = n + t;
				for (let i = 0; i < t; i++) e[n + i] = r[i];
			} else e.push(r);
		}
	}
	class h {
		constructor(e, t) {
			this.i = e, this.j = t, this.h = 0, this.g = null;
		}
		get() {
			let e;
			return this.h > 0 ? (this.h--, e = this.g, this.g = e.next, e.next = null) : e = this.i(), e;
		}
	}
	function g(e) {
		o.setTimeout(() => {
			throw e;
		}, 0);
	}
	function _() {
		var e = ie;
		let t = null;
		return e.g && (t = e.g, e.g = e.g.next, e.g || (e.h = null), t.next = null), t;
	}
	class ee {
		constructor() {
			this.h = this.g = null;
		}
		add(e, t) {
			let n = v.get();
			n.set(e, t), this.h ? this.h.next = n : this.g = n, this.h = n;
		}
	}
	var v = new h(() => new te(), (e) => e.reset());
	class te {
		constructor() {
			this.next = this.g = this.h = null;
		}
		set(e, t) {
			this.h = e, this.g = t, this.next = null;
		}
		reset() {
			this.next = this.g = this.h = null;
		}
	}
	let ne, re = !1, ie = new ee(), ae = () => {
		let e = Promise.resolve(void 0);
		ne = () => {
			e.then(oe);
		};
	};
	function oe() {
		for (var e; e = _();) {
			try {
				e.h.call(e.g);
			} catch (e) {
				g(e);
			}
			var t = v;
			t.j(e), t.h < 100 && (t.h++, e.next = t.g, t.g = e);
		}
		re = !1;
	}
	function se() {
		this.u = this.u, this.C = this.C;
	}
	se.prototype.u = !1, se.prototype.dispose = function() {
		this.u || (this.u = !0, this.N());
	}, se.prototype[Symbol.dispose] = function() {
		this.dispose();
	}, se.prototype.N = function() {
		if (this.C) for (; this.C.length;) this.C.shift()();
	};
	function ce(e, t) {
		this.type = e, this.g = this.target = t, this.defaultPrevented = !1;
	}
	ce.prototype.h = function() {
		this.defaultPrevented = !0;
	};
	var le = function() {
		if (!o.addEventListener || !Object.defineProperty) return !1;
		var e = !1, t = Object.defineProperty({}, "passive", { get: function() {
			e = !0;
		} });
		try {
			let e = () => {};
			o.addEventListener("test", e, t), o.removeEventListener("test", e, t);
		} catch {}
		return e;
	}();
	function ue(e) {
		return /^[\s\xa0]*$/.test(e);
	}
	function de(e, t) {
		ce.call(this, e ? e.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, e && this.init(e, t);
	}
	d(de, ce), de.prototype.init = function(e, t) {
		let n = this.type = e.type, r = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
		this.target = e.target || e.srcElement, this.g = t, t = e.relatedTarget, t || (n == "mouseover" ? t = e.fromElement : n == "mouseout" && (t = e.toElement)), this.relatedTarget = t, r ? (this.clientX = r.clientX === void 0 ? r.pageX : r.clientX, this.clientY = r.clientY === void 0 ? r.pageY : r.clientY, this.screenX = r.screenX || 0, this.screenY = r.screenY || 0) : (this.clientX = e.clientX === void 0 ? e.pageX : e.clientX, this.clientY = e.clientY === void 0 ? e.pageY : e.clientY, this.screenX = e.screenX || 0, this.screenY = e.screenY || 0), this.button = e.button, this.key = e.key || "", this.ctrlKey = e.ctrlKey, this.altKey = e.altKey, this.shiftKey = e.shiftKey, this.metaKey = e.metaKey, this.pointerId = e.pointerId || 0, this.pointerType = e.pointerType, this.state = e.state, this.i = e, e.defaultPrevented && de.Z.h.call(this);
	}, de.prototype.h = function() {
		de.Z.h.call(this);
		let e = this.i;
		e.preventDefault ? e.preventDefault() : e.returnValue = !1;
	};
	var fe = "closure_listenable_" + (Math.random() * 1e6 | 0), pe = 0;
	function me(e, t, n, r, i) {
		this.listener = e, this.proxy = null, this.src = t, this.type = n, this.capture = !!r, this.ha = i, this.key = ++pe, this.da = this.fa = !1;
	}
	function he(e) {
		e.da = !0, e.listener = null, e.proxy = null, e.src = null, e.ha = null;
	}
	function ge(e, t, n) {
		for (let r in e) t.call(n, e[r], r, e);
	}
	function _e(e, t) {
		for (let n in e) t.call(void 0, e[n], n, e);
	}
	function ve(e) {
		let t = {};
		for (let n in e) t[n] = e[n];
		return t;
	}
	let ye = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
	function be(e, t) {
		let n, r;
		for (let t = 1; t < arguments.length; t++) {
			for (n in r = arguments[t], r) e[n] = r[n];
			for (let t = 0; t < ye.length; t++) n = ye[t], Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
		}
	}
	function xe(e) {
		this.src = e, this.g = {}, this.h = 0;
	}
	xe.prototype.add = function(e, t, n, r, i) {
		let a = e.toString();
		e = this.g[a], e || (e = this.g[a] = [], this.h++);
		let o = Ce(e, t, r, i);
		return o > -1 ? (t = e[o], n || (t.fa = !1)) : (t = new me(t, this.src, a, !!r, i), t.fa = n, e.push(t)), t;
	};
	function Se(e, t) {
		let n = t.type;
		if (n in e.g) {
			var r = e.g[n], i = Array.prototype.indexOf.call(r, t, void 0), a;
			(a = i >= 0) && Array.prototype.splice.call(r, i, 1), a && (he(t), e.g[n].length == 0 && (delete e.g[n], e.h--));
		}
	}
	function Ce(e, t, n, r) {
		for (let i = 0; i < e.length; ++i) {
			let a = e[i];
			if (!a.da && a.listener == t && a.capture == !!n && a.ha == r) return i;
		}
		return -1;
	}
	var we = "closure_lm_" + (Math.random() * 1e6 | 0), Te = {};
	function Ee(e, t, n, r, i) {
		if (Array.isArray(t)) {
			for (let a = 0; a < t.length; a++) Ee(e, t[a], n, r, i);
			return null;
		}
		return n = Pe(n), e && e[fe] ? e.J(t, n, s(r) ? !!r.capture : !1, i) : De(e, t, n, !1, r, i);
	}
	function De(e, t, n, r, i, a) {
		if (!t) throw Error("Invalid event type");
		let o = s(i) ? !!i.capture : !!i, c = Me(e);
		if (c || (e[we] = c = new xe(e)), n = c.add(t, n, r, o, a), n.proxy) return n;
		if (r = Oe(), n.proxy = r, r.src = e, r.listener = n, e.addEventListener) le || (i = o), i === void 0 && (i = !1), e.addEventListener(t.toString(), r, i);
		else if (e.attachEvent) e.attachEvent(Ae(t.toString()), r);
		else if (e.addListener && e.removeListener) e.addListener(r);
		else throw Error("addEventListener and attachEvent are unavailable.");
		return n;
	}
	function Oe() {
		function e(n) {
			return t.call(e.src, e.listener, n);
		}
		let t = je;
		return e;
	}
	function y(e, t, n, r, i) {
		if (Array.isArray(t)) for (var a = 0; a < t.length; a++) y(e, t[a], n, r, i);
		else r = s(r) ? !!r.capture : !!r, n = Pe(n), e && e[fe] ? (e = e.i, a = String(t).toString(), a in e.g && (t = e.g[a], n = Ce(t, n, r, i), n > -1 && (he(t[n]), Array.prototype.splice.call(t, n, 1), t.length == 0 && (delete e.g[a], e.h--)))) : (e &&= Me(e)) && (t = e.g[t.toString()], e = -1, t && (e = Ce(t, n, r, i)), (n = e > -1 ? t[e] : null) && ke(n));
	}
	function ke(e) {
		if (typeof e != "number" && e && !e.da) {
			var t = e.src;
			if (t && t[fe]) Se(t.i, e);
			else {
				var n = e.type, r = e.proxy;
				t.removeEventListener ? t.removeEventListener(n, r, e.capture) : t.detachEvent ? t.detachEvent(Ae(n), r) : t.addListener && t.removeListener && t.removeListener(r), (n = Me(t)) ? (Se(n, e), n.h == 0 && (n.src = null, t[we] = null)) : he(e);
			}
		}
	}
	function Ae(e) {
		return e in Te ? Te[e] : Te[e] = "on" + e;
	}
	function je(e, t) {
		if (e.da) e = !0;
		else {
			t = new de(t, this);
			let n = e.listener, r = e.ha || e.src;
			e.fa && ke(e), e = n.call(r, t);
		}
		return e;
	}
	function Me(e) {
		return e = e[we], e instanceof xe ? e : null;
	}
	var Ne = "__closure_events_fn_" + (Math.random() * 1e9 >>> 0);
	function Pe(e) {
		return typeof e == "function" ? e : (e[Ne] || (e[Ne] = function(t) {
			return e.handleEvent(t);
		}), e[Ne]);
	}
	function Fe() {
		se.call(this), this.i = new xe(this), this.M = this, this.G = null;
	}
	d(Fe, se), Fe.prototype[fe] = !0, Fe.prototype.removeEventListener = function(e, t, n, r) {
		y(this, e, t, n, r);
	};
	function Ie(e, t) {
		var n, r = e.G;
		if (r) for (n = []; r; r = r.G) n.push(r);
		if (e = e.M, r = t.type || t, typeof t == "string") t = new ce(t, e);
		else if (t instanceof ce) t.target = t.target || e;
		else {
			var i = t;
			t = new ce(r, e), be(t, i);
		}
		i = !0;
		let a, o;
		if (n) for (o = n.length - 1; o >= 0; o--) a = t.g = n[o], i = Le(a, r, !0, t) && i;
		if (a = t.g = e, i = Le(a, r, !0, t) && i, i = Le(a, r, !1, t) && i, n) for (o = 0; o < n.length; o++) a = t.g = n[o], i = Le(a, r, !1, t) && i;
	}
	Fe.prototype.N = function() {
		if (Fe.Z.N.call(this), this.i) {
			var e = this.i;
			for (let t in e.g) {
				let n = e.g[t];
				for (let e = 0; e < n.length; e++) he(n[e]);
				delete e.g[t], e.h--;
			}
		}
		this.G = null;
	}, Fe.prototype.J = function(e, t, n, r) {
		return this.i.add(String(e), t, !1, n, r);
	}, Fe.prototype.K = function(e, t, n, r) {
		return this.i.add(String(e), t, !0, n, r);
	};
	function Le(e, t, n, r) {
		if (t = e.i.g[String(t)], !t) return !0;
		t = t.concat();
		let i = !0;
		for (let a = 0; a < t.length; ++a) {
			let o = t[a];
			if (o && !o.da && o.capture == n) {
				let t = o.listener, n = o.ha || o.src;
				o.fa && Se(e.i, o), i = t.call(n, r) !== !1 && i;
			}
		}
		return i && !r.defaultPrevented;
	}
	function b(e, t) {
		if (typeof e != "function") {
			if (e && typeof e.handleEvent == "function") e = l(e.handleEvent, e);
			else throw Error("Invalid listener argument");
		}
		return Number(t) > 2147483647 ? -1 : o.setTimeout(e, t || 0);
	}
	function Re(e) {
		e.g = b(() => {
			e.g = null, e.i && (e.i = !1, Re(e));
		}, e.l);
		let t = e.h;
		e.h = null, e.m.apply(null, t);
	}
	class ze extends se {
		constructor(e, t) {
			super(), this.m = e, this.l = t, this.h = null, this.i = !1, this.g = null;
		}
		j(e) {
			this.h = arguments, this.g ? this.i = !0 : Re(this);
		}
		N() {
			super.N(), this.g && (o.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
		}
	}
	function Be(e) {
		se.call(this), this.h = e, this.g = {};
	}
	d(Be, se);
	var Ve = [];
	function He(e) {
		ge(e.g, function(e, t) {
			this.g.hasOwnProperty(t) && ke(e);
		}, e), e.g = {};
	}
	Be.prototype.N = function() {
		Be.Z.N.call(this), He(this);
	}, Be.prototype.handleEvent = function() {
		throw Error("EventHandler.handleEvent not implemented");
	};
	var Ue = o.JSON.stringify, We = o.JSON.parse, Ge = class {
		stringify(e) {
			return o.JSON.stringify(e, void 0);
		}
		parse(e) {
			return o.JSON.parse(e, void 0);
		}
	};
	function Ke() {}
	function qe() {}
	var Je = {
		OPEN: "a",
		hb: "b",
		ERROR: "c",
		tb: "d"
	};
	function Ye() {
		ce.call(this, "d");
	}
	d(Ye, ce);
	function Xe() {
		ce.call(this, "c");
	}
	d(Xe, ce);
	var Ze = {}, Qe = null;
	function $e() {
		return Qe ||= new Fe();
	}
	Ze.Ia = "serverreachability";
	function et(e) {
		ce.call(this, Ze.Ia, e);
	}
	d(et, ce);
	function tt(e) {
		let t = $e();
		Ie(t, new et(t));
	}
	Ze.STAT_EVENT = "statevent";
	function nt(e, t) {
		ce.call(this, Ze.STAT_EVENT, e), this.stat = t;
	}
	d(nt, ce);
	function rt(e) {
		let t = $e();
		Ie(t, new nt(t, e));
	}
	Ze.Ja = "timingevent";
	function it(e, t) {
		ce.call(this, Ze.Ja, e), this.size = t;
	}
	d(it, ce);
	function at(e, t) {
		if (typeof e != "function") throw Error("Fn must not be null and must be a function");
		return o.setTimeout(function() {
			e();
		}, t);
	}
	function ot() {
		this.g = !0;
	}
	ot.prototype.ua = function() {
		this.g = !1;
	};
	function st(e, t, n, r, i, a) {
		e.info(function() {
			if (e.g) {
				if (a) {
					var o = "", s = a.split("&");
					for (let e = 0; e < s.length; e++) {
						var c = s[e].split("=");
						if (c.length > 1) {
							let e = c[0];
							c = c[1];
							let t = e.split("_");
							o = t.length >= 2 && t[1] == "type" ? o + (e + "=" + c + "&") : o + (e + "=redacted&");
						}
					}
				} else o = null;
			} else o = a;
			return "XMLHTTP REQ (" + r + ") [attempt " + i + "]: " + t + "\n" + n + "\n" + o;
		});
	}
	function ct(e, t, n, r, i, a, o) {
		e.info(function() {
			return "XMLHTTP RESP (" + r + ") [ attempt " + i + "]: " + t + "\n" + n + "\n" + a + " " + o;
		});
	}
	function lt(e, t, n, r) {
		e.info(function() {
			return "XMLHTTP TEXT (" + t + "): " + dt(e, n) + (r ? " " + r : "");
		});
	}
	function ut(e, t) {
		e.info(function() {
			return "TIMEOUT: " + t;
		});
	}
	ot.prototype.info = function() {};
	function dt(e, t) {
		if (!e.g) return t;
		if (!t) return null;
		try {
			let a = JSON.parse(t);
			if (a) {
				for (e = 0; e < a.length; e++) if (Array.isArray(a[e])) {
					var n = a[e];
					if (!(n.length < 2)) {
						var r = n[1];
						if (Array.isArray(r) && !(r.length < 1)) {
							var i = r[0];
							if (i != "noop" && i != "stop" && i != "close") for (let e = 1; e < r.length; e++) r[e] = "";
						}
					}
				}
			}
			return Ue(a);
		} catch {
			return t;
		}
	}
	var ft = {
		NO_ERROR: 0,
		cb: 1,
		qb: 2,
		pb: 3,
		kb: 4,
		ob: 5,
		rb: 6,
		Ga: 7,
		TIMEOUT: 8,
		ub: 9
	}, pt = {
		ib: "complete",
		Fb: "success",
		ERROR: "error",
		Ga: "abort",
		xb: "ready",
		yb: "readystatechange",
		TIMEOUT: "timeout",
		sb: "incrementaldata",
		wb: "progress",
		lb: "downloadprogress",
		Nb: "uploadprogress"
	}, mt;
	function ht() {}
	d(ht, Ke), ht.prototype.g = function() {
		return new XMLHttpRequest();
	}, mt = new ht();
	function gt(e) {
		return encodeURIComponent(String(e));
	}
	function _t(e) {
		var t = 1;
		e = e.split(":");
		let n = [];
		for (; t > 0 && e.length;) n.push(e.shift()), t--;
		return e.length && n.push(e.join(":")), n;
	}
	function vt(e, t, n, r) {
		this.j = e, this.i = t, this.l = n, this.S = r || 1, this.V = new Be(this), this.H = 45e3, this.J = null, this.o = !1, this.u = this.B = this.A = this.M = this.F = this.T = this.D = null, this.G = [], this.g = null, this.C = 0, this.m = this.v = null, this.X = -1, this.K = !1, this.P = 0, this.O = null, this.W = this.L = this.U = this.R = !1, this.h = new yt();
	}
	function yt() {
		this.i = null, this.g = "", this.h = !1;
	}
	var bt = {}, xt = {};
	function St(e, t, n) {
		e.M = 1, e.A = Jt(Wt(t)), e.u = n, e.R = !0, Ct(e, null);
	}
	function Ct(e, t) {
		e.F = Date.now(), Dt(e), e.B = Wt(e.A);
		var n = e.B, r = e.S;
		Array.isArray(r) || (r = [String(r)]), ln(n.i, "t", r), e.C = 0, n = e.j.L, e.h = new yt(), e.g = $n(e.j, n ? t : null, !e.u), e.P > 0 && (e.O = new ze(l(e.Y, e, e.g), e.P)), t = e.V, n = e.g, r = e.ba;
		var i = "readystatechange";
		Array.isArray(i) || (i && (Ve[0] = i.toString()), i = Ve);
		for (let e = 0; e < i.length; e++) {
			let a = Ee(n, i[e], r || t.handleEvent, !1, t.h || t);
			if (!a) break;
			t.g[a.key] = a;
		}
		t = e.J ? ve(e.J) : {}, e.u ? (e.v ||= "POST", t["Content-Type"] = "application/x-www-form-urlencoded", e.g.ea(e.B, e.v, e.u, t)) : (e.v = "GET", e.g.ea(e.B, e.v, null, t)), tt(), st(e.i, e.v, e.B, e.l, e.S, e.u);
	}
	vt.prototype.ba = function(e) {
		e = e.target;
		let t = this.O;
		t && An(e) == 3 ? t.j() : this.Y(e);
	}, vt.prototype.Y = function(e) {
		try {
			if (e == this.g) a: {
				let s = An(this.g), c = this.g.ya(), l = this.g.ca();
				if (!(s < 3) && (s != 3 || this.g && (this.h.h || this.g.la() || jn(this.g)))) {
					this.K || s != 4 || c == 7 || tt(c == 8 || l <= 0 ? 3 : 2), kt(this);
					var t = this.g.ca();
					this.X = t;
					var n = wt(this);
					if (this.o = t == 200, ct(this.i, this.v, this.B, this.l, this.S, s, t), this.o) {
						if (this.U && !this.L) {
							b: {
								if (this.g) {
									var r, i = this.g;
									if ((r = i.g ? i.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !ue(r)) {
										var a = r;
										break b;
									}
								}
								a = null;
							}
							if (e = a) lt(this.i, this.l, e, "Initial handshake response via X-HTTP-Initial-Response"), this.L = !0, Mt(this, e);
							else {
								this.o = !1, this.m = 3, rt(12), jt(this), At(this);
								break a;
							}
						}
						if (this.R) {
							e = !0;
							let t;
							for (; !this.K && this.C < n.length;) if (t = Et(this, n), t == xt) {
								s == 4 && (this.m = 4, rt(14), e = !1), lt(this.i, this.l, null, "[Incomplete Response]");
								break;
							} else if (t == bt) {
								this.m = 4, rt(15), lt(this.i, this.l, n, "[Invalid Chunk]"), e = !1;
								break;
							} else lt(this.i, this.l, t, null), Mt(this, t);
							if (Tt(this) && this.C != 0 && (this.h.g = this.h.g.slice(this.C), this.C = 0), s != 4 || n.length != 0 || this.h.h || (this.m = 1, rt(16), e = !1), this.o = this.o && e, !e) lt(this.i, this.l, n, "[Invalid Chunked Response]"), jt(this), At(this);
							else if (n.length > 0 && !this.W) {
								this.W = !0;
								var o = this.j;
								o.g == this && o.aa && !o.P && (o.j.info("Great, no buffering proxy detected. Bytes received: " + n.length), Gn(o), o.P = !0, rt(11));
							}
						} else lt(this.i, this.l, n, null), Mt(this, n);
						s == 4 && jt(this), this.o && !this.K && (s == 4 ? Jn(this.j, this) : (this.o = !1, Dt(this)));
					} else Mn(this.g), t == 400 && n.indexOf("Unknown SID") > 0 ? (this.m = 3, rt(12)) : (this.m = 0, rt(13)), jt(this), At(this);
				}
			}
		} catch {}
	};
	function wt(e) {
		if (!Tt(e)) return e.g.la();
		let t = jn(e.g);
		if (t === "") return "";
		let n = "", r = t.length, i = An(e.g) == 4;
		if (!e.h.i) {
			if (typeof TextDecoder > "u") return jt(e), At(e), "";
			e.h.i = new o.TextDecoder();
		}
		for (let a = 0; a < r; a++) e.h.h = !0, n += e.h.i.decode(t[a], { stream: !(i && a == r - 1) });
		return t.length = 0, e.h.g += n, e.C = 0, e.h.g;
	}
	function Tt(e) {
		return e.g ? e.v == "GET" && e.M != 2 && e.j.Aa : !1;
	}
	function Et(e, t) {
		var n = e.C, r = t.indexOf("\n", n);
		return r == -1 ? xt : (n = Number(t.substring(n, r)), isNaN(n) ? bt : (r += 1, r + n > t.length ? xt : (t = t.slice(r, r + n), e.C = r + n, t)));
	}
	vt.prototype.cancel = function() {
		this.K = !0, jt(this);
	};
	function Dt(e) {
		e.T = Date.now() + e.H, Ot(e, e.H);
	}
	function Ot(e, t) {
		if (e.D != null) throw Error("WatchDog timer not null");
		e.D = at(l(e.aa, e), t);
	}
	function kt(e) {
		e.D &&= (o.clearTimeout(e.D), null);
	}
	vt.prototype.aa = function() {
		this.D = null;
		let e = Date.now();
		e - this.T >= 0 ? (ut(this.i, this.B), this.M != 2 && (tt(), rt(17)), jt(this), this.m = 2, At(this)) : Ot(this, this.T - e);
	};
	function At(e) {
		e.j.I == 0 || e.K || Jn(e.j, e);
	}
	function jt(e) {
		kt(e);
		var t = e.O;
		t && typeof t.dispose == "function" && t.dispose(), e.O = null, He(e.V), e.g && (t = e.g, e.g = null, t.abort(), t.dispose());
	}
	function Mt(e, t) {
		try {
			var n = e.j;
			if (n.I != 0 && (n.g == e || Lt(n.h, e))) {
				if (!e.L && Lt(n.h, e) && n.I == 3) {
					try {
						var r = n.Ba.g.parse(t);
					} catch {
						r = null;
					}
					if (Array.isArray(r) && r.length == 3) {
						var i = r;
						if (i[0] == 0) {
							a: if (!n.v) {
								if (n.g) {
									if (n.g.F + 3e3 < e.F) qn(n), In(n);
									else break a;
								}
								Wn(n), rt(18);
							}
						} else n.xa = i[1], 0 < n.xa - n.K && i[2] < 37500 && n.F && n.A == 0 && !n.C && (n.C = at(l(n.Va, n), 6e3));
						It(n.h) <= 1 && n.ta && (n.ta = void 0);
					} else Xn(n, 11);
				} else if ((e.L || n.g == e) && qn(n), !ue(t)) for (i = n.Ba.g.parse(t), t = 0; t < i.length; t++) {
					let l = i[t], u = l[0];
					if (!(u <= n.K)) {
						if (n.K = u, l = l[1], n.I == 2) {
							if (l[0] == "c") {
								n.M = l[1], n.ba = l[2];
								let t = l[3];
								t != null && (n.ka = t, n.j.info("VER=" + n.ka));
								let i = l[4];
								i != null && (n.za = i, n.j.info("SVER=" + n.za));
								let u = l[5];
								u != null && typeof u == "number" && u > 0 && (r = 1.5 * u, n.O = r, n.j.info("backChannelRequestTimeoutMs_=" + r)), r = n;
								let d = e.g;
								if (d) {
									let e = d.g ? d.g.getResponseHeader("X-Client-Wire-Protocol") : null;
									if (e) {
										var a = r.h;
										a.g || e.indexOf("spdy") == -1 && e.indexOf("quic") == -1 && e.indexOf("h2") == -1 || (a.j = a.l, a.g = /* @__PURE__ */ new Set(), a.h &&= (Rt(a, a.h), null));
									}
									if (r.G) {
										let e = d.g ? d.g.getResponseHeader("X-HTTP-Session-Id") : null;
										e && (r.wa = e, x(r.J, r.G, e));
									}
								}
								n.I = 3, n.l && n.l.ra(), n.aa && (n.T = Date.now() - e.F, n.j.info("Handshake RTT: " + n.T + "ms")), r = n;
								var o = e;
								if (r.na = Qn(r, r.L ? r.ba : null, r.W), o.L) {
									zt(r.h, o);
									var s = o, c = r.O;
									c && (s.H = c), s.D && (kt(s), Dt(s)), r.g = o;
								} else Un(r);
								n.i.length > 0 && Rn(n);
							} else l[0] != "stop" && l[0] != "close" || Xn(n, 7);
						} else n.I == 3 && (l[0] == "stop" || l[0] == "close" ? l[0] == "stop" ? Xn(n, 7) : Fn(n) : l[0] != "noop" && n.l && n.l.qa(l), n.A = 0);
					}
				}
			}
			tt(4);
		} catch {}
	}
	var Nt = class {
		constructor(e, t) {
			this.g = e, this.map = t;
		}
	};
	function Pt(e) {
		this.l = e || 10, o.PerformanceNavigationTiming ? (e = o.performance.getEntriesByType("navigation"), e = e.length > 0 && (e[0].nextHopProtocol == "hq" || e[0].nextHopProtocol == "h2")) : e = !!(o.chrome && o.chrome.loadTimes && o.chrome.loadTimes() && o.chrome.loadTimes().wasFetchedViaSpdy), this.j = e ? this.l : 1, this.g = null, this.j > 1 && (this.g = /* @__PURE__ */ new Set()), this.h = null, this.i = [];
	}
	function Ft(e) {
		return e.h ? !0 : e.g ? e.g.size >= e.j : !1;
	}
	function It(e) {
		return e.h ? 1 : e.g ? e.g.size : 0;
	}
	function Lt(e, t) {
		return e.h ? e.h == t : e.g ? e.g.has(t) : !1;
	}
	function Rt(e, t) {
		e.g ? e.g.add(t) : e.h = t;
	}
	function zt(e, t) {
		e.h && e.h == t ? e.h = null : e.g && e.g.has(t) && e.g.delete(t);
	}
	Pt.prototype.cancel = function() {
		if (this.i = Bt(this), this.h) this.h.cancel(), this.h = null;
		else if (this.g && this.g.size !== 0) {
			for (let e of this.g.values()) e.cancel();
			this.g.clear();
		}
	};
	function Bt(e) {
		if (e.h != null) return e.i.concat(e.h.G);
		if (e.g != null && e.g.size !== 0) {
			let t = e.i;
			for (let n of e.g.values()) t = t.concat(n.G);
			return t;
		}
		return p(e.i);
	}
	var Vt = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
	function Ht(e, t) {
		if (e) {
			e = e.split("&");
			for (let n = 0; n < e.length; n++) {
				let r = e[n].indexOf("="), i, a = null;
				r >= 0 ? (i = e[n].substring(0, r), a = e[n].substring(r + 1)) : i = e[n], t(i, a ? decodeURIComponent(a.replace(/\+/g, " ")) : "");
			}
		}
	}
	function Ut(e) {
		this.g = this.o = this.j = "", this.u = null, this.m = this.h = "", this.l = !1;
		let t;
		e instanceof Ut ? (this.l = e.l, Gt(this, e.j), this.o = e.o, this.g = e.g, Kt(this, e.u), this.h = e.h, qt(this, un(e.i)), this.m = e.m) : e && (t = String(e).match(Vt)) ? (this.l = !1, Gt(this, t[1] || "", !0), this.o = Yt(t[2] || ""), this.g = Yt(t[3] || "", !0), Kt(this, t[4]), this.h = Yt(t[5] || "", !0), qt(this, t[6] || "", !0), this.m = Yt(t[7] || "")) : (this.l = !1, this.i = new rn(null, this.l));
	}
	Ut.prototype.toString = function() {
		let e = [];
		var t = this.j;
		t && e.push(Xt(t, Qt, !0), ":");
		var n = this.g;
		return (n || t == "file") && (e.push("//"), (t = this.o) && e.push(Xt(t, Qt, !0), "@"), e.push(gt(n).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), n = this.u, n != null && e.push(":", String(n))), (n = this.h) && (this.g && n.charAt(0) != "/" && e.push("/"), e.push(Xt(n, n.charAt(0) == "/" ? en : $t, !0))), (n = this.i.toString()) && e.push("?", n), (n = this.m) && e.push("#", Xt(n, nn)), e.join("");
	}, Ut.prototype.resolve = function(e) {
		let t = Wt(this), n = !!e.j;
		n ? Gt(t, e.j) : n = !!e.o, n ? t.o = e.o : n = !!e.g, n ? t.g = e.g : n = e.u != null;
		var r = e.h;
		if (n) Kt(t, e.u);
		else if (n = !!e.h) {
			if (r.charAt(0) != "/") {
				if (this.g && !this.h) r = "/" + r;
				else {
					var i = t.h.lastIndexOf("/");
					i != -1 && (r = t.h.slice(0, i + 1) + r);
				}
			}
			if (i = r, i == ".." || i == ".") r = "";
			else if (i.indexOf("./") != -1 || i.indexOf("/.") != -1) {
				r = i.lastIndexOf("/", 0) == 0, i = i.split("/");
				let e = [];
				for (let t = 0; t < i.length;) {
					let n = i[t++];
					n == "." ? r && t == i.length && e.push("") : n == ".." ? ((e.length > 1 || e.length == 1 && e[0] != "") && e.pop(), r && t == i.length && e.push("")) : (e.push(n), r = !0);
				}
				r = e.join("/");
			} else r = i;
		}
		return n ? t.h = r : n = e.i.toString() !== "", n ? qt(t, un(e.i)) : n = !!e.m, n && (t.m = e.m), t;
	};
	function Wt(e) {
		return new Ut(e);
	}
	function Gt(e, t, n) {
		e.j = n ? Yt(t, !0) : t, e.j &&= e.j.replace(/:$/, "");
	}
	function Kt(e, t) {
		if (t) {
			if (t = Number(t), isNaN(t) || t < 0) throw Error("Bad port number " + t);
			e.u = t;
		} else e.u = null;
	}
	function qt(e, t, n) {
		t instanceof rn ? (e.i = t, fn(e.i, e.l)) : (n || (t = Xt(t, tn)), e.i = new rn(t, e.l));
	}
	function x(e, t, n) {
		e.i.set(t, n);
	}
	function Jt(e) {
		return x(e, "zx", Math.floor(Math.random() * 2147483648).toString(36) + Math.abs(Math.floor(Math.random() * 2147483648) ^ Date.now()).toString(36)), e;
	}
	function Yt(e, t) {
		return e ? t ? decodeURI(e.replace(/%25/g, "%2525")) : decodeURIComponent(e) : "";
	}
	function Xt(e, t, n) {
		return typeof e == "string" ? (e = encodeURI(e).replace(t, Zt), n && (e = e.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), e) : null;
	}
	function Zt(e) {
		return e = e.charCodeAt(0), "%" + (e >> 4 & 15).toString(16) + (e & 15).toString(16);
	}
	var Qt = /[#\/\?@]/g, $t = /[#\?:]/g, en = /[#\?]/g, tn = /[#\?@]/g, nn = /#/g;
	function rn(e, t) {
		this.h = this.g = null, this.i = e || null, this.j = !!t;
	}
	function an(e) {
		e.g || (e.g = /* @__PURE__ */ new Map(), e.h = 0, e.i && Ht(e.i, function(t, n) {
			e.add(decodeURIComponent(t.replace(/\+/g, " ")), n);
		}));
	}
	e = rn.prototype, e.add = function(e, t) {
		an(this), this.i = null, e = dn(this, e);
		let n = this.g.get(e);
		return n || this.g.set(e, n = []), n.push(t), this.h += 1, this;
	};
	function on(e, t) {
		an(e), t = dn(e, t), e.g.has(t) && (e.i = null, e.h -= e.g.get(t).length, e.g.delete(t));
	}
	function sn(e, t) {
		return an(e), t = dn(e, t), e.g.has(t);
	}
	e.forEach = function(e, t) {
		an(this), this.g.forEach(function(n, r) {
			n.forEach(function(n) {
				e.call(t, n, r, this);
			}, this);
		}, this);
	};
	function cn(e, t) {
		an(e);
		let n = [];
		if (typeof t == "string") sn(e, t) && (n = n.concat(e.g.get(dn(e, t))));
		else for (e = Array.from(e.g.values()), t = 0; t < e.length; t++) n = n.concat(e[t]);
		return n;
	}
	e.set = function(e, t) {
		return an(this), this.i = null, e = dn(this, e), sn(this, e) && (this.h -= this.g.get(e).length), this.g.set(e, [t]), this.h += 1, this;
	}, e.get = function(e, t) {
		return e ? (e = cn(this, e), e.length > 0 ? String(e[0]) : t) : t;
	};
	function ln(e, t, n) {
		on(e, t), n.length > 0 && (e.i = null, e.g.set(dn(e, t), p(n)), e.h += n.length);
	}
	e.toString = function() {
		if (this.i) return this.i;
		if (!this.g) return "";
		let e = [], t = Array.from(this.g.keys());
		for (let r = 0; r < t.length; r++) {
			var n = t[r];
			let i = gt(n);
			n = cn(this, n);
			for (let t = 0; t < n.length; t++) {
				let r = i;
				n[t] !== "" && (r += "=" + gt(n[t])), e.push(r);
			}
		}
		return this.i = e.join("&");
	};
	function un(e) {
		let t = new rn();
		return t.i = e.i, e.g && (t.g = new Map(e.g), t.h = e.h), t;
	}
	function dn(e, t) {
		return t = String(t), e.j && (t = t.toLowerCase()), t;
	}
	function fn(e, t) {
		t && !e.j && (an(e), e.i = null, e.g.forEach(function(e, t) {
			let n = t.toLowerCase();
			t != n && (on(this, t), ln(this, n, e));
		}, e)), e.j = t;
	}
	function pn(e, t) {
		let n = new ot();
		if (o.Image) {
			let r = new Image();
			r.onload = u(hn, n, "TestLoadImage: loaded", !0, t, r), r.onerror = u(hn, n, "TestLoadImage: error", !1, t, r), r.onabort = u(hn, n, "TestLoadImage: abort", !1, t, r), r.ontimeout = u(hn, n, "TestLoadImage: timeout", !1, t, r), o.setTimeout(function() {
				r.ontimeout && r.ontimeout();
			}, 1e4), r.src = e;
		} else t(!1);
	}
	function mn(e, t) {
		let n = new ot(), r = new AbortController(), i = setTimeout(() => {
			r.abort(), hn(n, "TestPingServer: timeout", !1, t);
		}, 1e4);
		fetch(e, { signal: r.signal }).then((e) => {
			clearTimeout(i), e.ok ? hn(n, "TestPingServer: ok", !0, t) : hn(n, "TestPingServer: server error", !1, t);
		}).catch(() => {
			clearTimeout(i), hn(n, "TestPingServer: error", !1, t);
		});
	}
	function hn(e, t, n, r, i) {
		try {
			i && (i.onload = null, i.onerror = null, i.onabort = null, i.ontimeout = null), r(n);
		} catch {}
	}
	function gn() {
		this.g = new Ge();
	}
	function _n(e) {
		this.i = e.Sb || null, this.h = e.ab || !1;
	}
	d(_n, Ke), _n.prototype.g = function() {
		return new vn(this.i, this.h);
	};
	function vn(e, t) {
		Fe.call(this), this.H = e, this.o = t, this.m = void 0, this.status = this.readyState = 0, this.responseType = this.responseText = this.response = this.statusText = "", this.onreadystatechange = null, this.A = new Headers(), this.h = null, this.F = "GET", this.D = "", this.g = !1, this.B = this.j = this.l = null, this.v = new AbortController();
	}
	d(vn, Fe), e = vn.prototype, e.open = function(e, t) {
		if (this.readyState != 0) throw this.abort(), Error("Error reopening a connection");
		this.F = e, this.D = t, this.readyState = 1, xn(this);
	}, e.send = function(e) {
		if (this.readyState != 1) throw this.abort(), Error("need to call open() first. ");
		if (this.v.signal.aborted) throw this.abort(), Error("Request was aborted.");
		this.g = !0;
		let t = {
			headers: this.A,
			method: this.F,
			credentials: this.m,
			cache: void 0,
			signal: this.v.signal
		};
		e && (t.body = e), (this.H || o).fetch(new Request(this.D, t)).then(this.Pa.bind(this), this.ga.bind(this));
	}, e.abort = function() {
		this.response = this.responseText = "", this.A = new Headers(), this.status = 0, this.v.abort(), this.j && this.j.cancel("Request was aborted.").catch(() => {}), this.readyState >= 1 && this.g && this.readyState != 4 && (this.g = !1, bn(this)), this.readyState = 0;
	}, e.Pa = function(e) {
		if (this.g && (this.l = e, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = e.headers, this.readyState = 2, xn(this)), this.g && (this.readyState = 3, xn(this), this.g))) {
			if (this.responseType === "arraybuffer") e.arrayBuffer().then(this.Na.bind(this), this.ga.bind(this));
			else if (o.ReadableStream !== void 0 && "body" in e) {
				if (this.j = e.body.getReader(), this.o) {
					if (this.responseType) throw Error("responseType must be empty for \"streamBinaryChunks\" mode responses.");
					this.response = [];
				} else this.response = this.responseText = "", this.B = new TextDecoder();
				yn(this);
			} else e.text().then(this.Oa.bind(this), this.ga.bind(this));
		}
	};
	function yn(e) {
		e.j.read().then(e.Ma.bind(e)).catch(e.ga.bind(e));
	}
	e.Ma = function(e) {
		if (this.g) {
			if (this.o && e.value) this.response.push(e.value);
			else if (!this.o) {
				var t = e.value ? e.value : /* @__PURE__ */ new Uint8Array();
				(t = this.B.decode(t, { stream: !e.done })) && (this.response = this.responseText += t);
			}
			e.done ? bn(this) : xn(this), this.readyState == 3 && yn(this);
		}
	}, e.Oa = function(e) {
		this.g && (this.response = this.responseText = e, bn(this));
	}, e.Na = function(e) {
		this.g && (this.response = e, bn(this));
	}, e.ga = function() {
		this.g && bn(this);
	};
	function bn(e) {
		e.readyState = 4, e.l = null, e.j = null, e.B = null, xn(e);
	}
	e.setRequestHeader = function(e, t) {
		this.A.append(e, t);
	}, e.getResponseHeader = function(e) {
		return this.h && this.h.get(e.toLowerCase()) || "";
	}, e.getAllResponseHeaders = function() {
		if (!this.h) return "";
		let e = [], t = this.h.entries();
		for (var n = t.next(); !n.done;) n = n.value, e.push(n[0] + ": " + n[1]), n = t.next();
		return e.join("\r\n");
	};
	function xn(e) {
		e.onreadystatechange && e.onreadystatechange.call(e);
	}
	Object.defineProperty(vn.prototype, "withCredentials", {
		get: function() {
			return this.m === "include";
		},
		set: function(e) {
			this.m = e ? "include" : "same-origin";
		}
	});
	function Sn(e) {
		let t = "";
		return ge(e, function(e, n) {
			t += n, t += ":", t += e, t += "\r\n";
		}), t;
	}
	function Cn(e, t, n) {
		a: {
			for (r in n) {
				var r = !1;
				break a;
			}
			r = !0;
		}
		r || (n = Sn(n), typeof e == "string" || x(e, t, n));
	}
	function S(e) {
		Fe.call(this), this.headers = /* @__PURE__ */ new Map(), this.L = e || null, this.h = !1, this.g = null, this.D = "", this.o = 0, this.l = "", this.j = this.B = this.v = this.A = !1, this.m = null, this.F = "", this.H = !1;
	}
	d(S, Fe);
	var wn = /^https?$/i, Tn = ["POST", "PUT"];
	e = S.prototype, e.Fa = function(e) {
		this.H = e;
	}, e.ea = function(e, t, n, r) {
		if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + e);
		t = t ? t.toUpperCase() : "GET", this.D = e, this.l = "", this.o = 0, this.A = !1, this.h = !0, this.g = this.L ? this.L.g() : mt.g(), this.g.onreadystatechange = f(l(this.Ca, this));
		try {
			this.B = !0, this.g.open(t, String(e), !0), this.B = !1;
		} catch (e) {
			En(this, e);
			return;
		}
		if (e = n || "", n = new Map(this.headers), r) {
			if (Object.getPrototypeOf(r) === Object.prototype) for (var i in r) n.set(i, r[i]);
			else if (typeof r.keys == "function" && typeof r.get == "function") for (let e of r.keys()) n.set(e, r.get(e));
			else throw Error("Unknown input type for opt_headers: " + String(r));
		}
		r = Array.from(n.keys()).find((e) => e.toLowerCase() == "content-type"), i = o.FormData && e instanceof o.FormData, !(Array.prototype.indexOf.call(Tn, t, void 0) >= 0) || r || i || n.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
		for (let [e, t] of n) this.g.setRequestHeader(e, t);
		this.F && (this.g.responseType = this.F), "withCredentials" in this.g && this.g.withCredentials !== this.H && (this.g.withCredentials = this.H);
		try {
			this.m &&= (clearTimeout(this.m), null), this.v = !0, this.g.send(e), this.v = !1;
		} catch (e) {
			En(this, e);
		}
	};
	function En(e, t) {
		e.h = !1, e.g && (e.j = !0, e.g.abort(), e.j = !1), e.l = t, e.o = 5, Dn(e), kn(e);
	}
	function Dn(e) {
		e.A || (e.A = !0, Ie(e, "complete"), Ie(e, "error"));
	}
	e.abort = function(e) {
		this.g && this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1, this.o = e || 7, Ie(this, "complete"), Ie(this, "abort"), kn(this));
	}, e.N = function() {
		this.g && (this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1), kn(this, !0)), S.Z.N.call(this);
	}, e.Ca = function() {
		this.u || (this.B || this.v || this.j ? On(this) : this.Xa());
	}, e.Xa = function() {
		On(this);
	};
	function On(e) {
		if (e.h && a !== void 0) {
			if (e.v && An(e) == 4) setTimeout(e.Ca.bind(e), 0);
			else if (Ie(e, "readystatechange"), An(e) == 4) {
				e.h = !1;
				try {
					let a = e.ca();
					a: switch (a) {
						case 200:
						case 201:
						case 202:
						case 204:
						case 206:
						case 304:
						case 1223:
							var t = !0;
							break a;
						default: t = !1;
					}
					var n;
					if (!(n = t)) {
						var r;
						if (r = a === 0) {
							let t = String(e.D).match(Vt)[1] || null;
							!t && o.self && o.self.location && (t = o.self.location.protocol.slice(0, -1)), r = !wn.test(t ? t.toLowerCase() : "");
						}
						n = r;
					}
					if (n) Ie(e, "complete"), Ie(e, "success");
					else {
						e.o = 6;
						try {
							var i = An(e) > 2 ? e.g.statusText : "";
						} catch {
							i = "";
						}
						e.l = i + " [" + e.ca() + "]", Dn(e);
					}
				} finally {
					kn(e);
				}
			}
		}
	}
	function kn(e, t) {
		if (e.g) {
			e.m &&= (clearTimeout(e.m), null);
			let n = e.g;
			e.g = null, t || Ie(e, "ready");
			try {
				n.onreadystatechange = null;
			} catch {}
		}
	}
	e.isActive = function() {
		return !!this.g;
	};
	function An(e) {
		return e.g ? e.g.readyState : 0;
	}
	e.ca = function() {
		try {
			return An(this) > 2 ? this.g.status : -1;
		} catch {
			return -1;
		}
	}, e.la = function() {
		try {
			return this.g ? this.g.responseText : "";
		} catch {
			return "";
		}
	}, e.La = function(e) {
		if (this.g) {
			var t = this.g.responseText;
			return e && t.indexOf(e) == 0 && (t = t.substring(e.length)), We(t);
		}
	};
	function jn(e) {
		try {
			if (!e.g) return null;
			if ("response" in e.g) return e.g.response;
			switch (e.F) {
				case "":
				case "text": return e.g.responseText;
				case "arraybuffer": if ("mozResponseArrayBuffer" in e.g) return e.g.mozResponseArrayBuffer;
			}
			return null;
		} catch {
			return null;
		}
	}
	function Mn(e) {
		let t = {};
		e = (e.g && An(e) >= 2 && e.g.getAllResponseHeaders() || "").split("\r\n");
		for (let r = 0; r < e.length; r++) {
			if (ue(e[r])) continue;
			var n = _t(e[r]);
			let i = n[0];
			if (n = n[1], typeof n != "string") continue;
			n = n.trim();
			let a = t[i] || [];
			t[i] = a, a.push(n);
		}
		_e(t, function(e) {
			return e.join(", ");
		});
	}
	e.ya = function() {
		return this.o;
	}, e.Ha = function() {
		return typeof this.l == "string" ? this.l : String(this.l);
	};
	function Nn(e, t, n) {
		return n && n.internalChannelParams && n.internalChannelParams[e] || t;
	}
	function Pn(e) {
		this.za = 0, this.i = [], this.j = new ot(), this.ba = this.na = this.J = this.W = this.g = this.wa = this.G = this.H = this.u = this.U = this.o = null, this.Ya = this.V = 0, this.Sa = Nn("failFast", !1, e), this.F = this.C = this.v = this.m = this.l = null, this.X = !0, this.xa = this.K = -1, this.Y = this.A = this.D = 0, this.Qa = Nn("baseRetryDelayMs", 5e3, e), this.Za = Nn("retryDelaySeedMs", 1e4, e), this.Ta = Nn("forwardChannelMaxRetries", 2, e), this.va = Nn("forwardChannelRequestTimeoutMs", 2e4, e), this.ma = e && e.xmlHttpFactory || void 0, this.Ua = e && e.Rb || void 0, this.Aa = e && e.useFetchStreams || !1, this.O = void 0, this.L = e && e.supportsCrossDomainXhr || !1, this.M = "", this.h = new Pt(e && e.concurrentRequestLimit), this.Ba = new gn(), this.S = e && e.fastHandshake || !1, this.R = e && e.encodeInitMessageHeaders || !1, this.S && this.R && (this.R = !1), this.Ra = e && e.Pb || !1, e && e.ua && this.j.ua(), e && e.forceLongPolling && (this.X = !1), this.aa = !this.S && this.X && e && e.detectBufferingProxy || !1, this.ia = void 0, e && e.longPollingTimeout && e.longPollingTimeout > 0 && (this.ia = e.longPollingTimeout), this.ta = void 0, this.T = 0, this.P = !1, this.ja = this.B = null;
	}
	e = Pn.prototype, e.ka = 8, e.I = 1, e.connect = function(e, t, n, r) {
		rt(0), this.W = e, this.H = t || {}, n && r !== void 0 && (this.H.OSID = n, this.H.OAID = r), this.F = this.X, this.J = Qn(this, null, this.W), Rn(this);
	};
	function Fn(e) {
		if (Ln(e), e.I == 3) {
			var t = e.V++, n = Wt(e.J);
			if (x(n, "SID", e.M), x(n, "RID", t), x(n, "TYPE", "terminate"), Vn(e, n), t = new vt(e, e.j, t), t.M = 2, t.A = Jt(Wt(n)), n = !1, o.navigator && o.navigator.sendBeacon) try {
				n = o.navigator.sendBeacon(t.A.toString(), "");
			} catch {}
			!n && o.Image && (new Image().src = t.A, n = !0), n || (t.g = $n(t.j, null), t.g.ea(t.A)), t.F = Date.now(), Dt(t);
		}
		Zn(e);
	}
	function In(e) {
		e.g &&= (Gn(e), e.g.cancel(), null);
	}
	function Ln(e) {
		In(e), e.v &&= (o.clearTimeout(e.v), null), qn(e), e.h.cancel(), e.m &&= (typeof e.m == "number" && o.clearTimeout(e.m), null);
	}
	function Rn(e) {
		if (!Ft(e.h) && !e.m) {
			e.m = !0;
			var t = e.Ea;
			ne || ae(), re ||= (ne(), !0), ie.add(t, e), e.D = 0;
		}
	}
	function zn(e, t) {
		return It(e.h) >= e.h.j - +!!e.m ? !1 : e.m ? (e.i = t.G.concat(e.i), !0) : e.I == 1 || e.I == 2 || e.D >= (e.Sa ? 0 : e.Ta) ? !1 : (e.m = at(l(e.Ea, e, t), Yn(e, e.D)), e.D++, !0);
	}
	e.Ea = function(e) {
		if (this.m) {
			if (this.m = null, this.I == 1) {
				if (!e) {
					this.V = Math.floor(Math.random() * 1e5), e = this.V++;
					let i = new vt(this, this.j, e), a = this.o;
					if (this.U && (a ? (a = ve(a), be(a, this.U)) : a = this.U), this.u !== null || this.R || (i.J = a, a = null), this.S) a: {
						for (var t = 0, n = 0; n < this.i.length; n++) {
							b: {
								var r = this.i[n];
								if ("__data__" in r.map && (r = r.map.__data__, typeof r == "string")) {
									r = r.length;
									break b;
								}
								r = void 0;
							}
							if (r === void 0) break;
							if (t += r, t > 4096) {
								t = n;
								break a;
							}
							if (t === 4096 || n === this.i.length - 1) {
								t = n + 1;
								break a;
							}
						}
						t = 1e3;
					}
					else t = 1e3;
					t = Hn(this, i, t), n = Wt(this.J), x(n, "RID", e), x(n, "CVER", 22), this.G && x(n, "X-HTTP-Session-Id", this.G), Vn(this, n), a && (this.R ? t = "headers=" + gt(Sn(a)) + "&" + t : this.u && Cn(n, this.u, a)), Rt(this.h, i), this.Ra && x(n, "TYPE", "init"), this.S ? (x(n, "$req", t), x(n, "SID", "null"), i.U = !0, St(i, n, null)) : St(i, n, t), this.I = 2;
				}
			} else this.I == 3 && (e ? Bn(this, e) : this.i.length == 0 || Ft(this.h) || Bn(this));
		}
	};
	function Bn(e, t) {
		var n = t ? t.l : e.V++;
		let r = Wt(e.J);
		x(r, "SID", e.M), x(r, "RID", n), x(r, "AID", e.K), Vn(e, r), e.u && e.o && Cn(r, e.u, e.o), n = new vt(e, e.j, n, e.D + 1), e.u === null && (n.J = e.o), t && (e.i = t.G.concat(e.i)), t = Hn(e, n, 1e3), n.H = Math.round(e.va * .5) + Math.round(e.va * .5 * Math.random()), Rt(e.h, n), St(n, r, t);
	}
	function Vn(e, t) {
		e.H && ge(e.H, function(e, n) {
			x(t, n, e);
		}), e.l && ge({}, function(e, n) {
			x(t, n, e);
		});
	}
	function Hn(e, t, n) {
		n = Math.min(e.i.length, n);
		let r = e.l ? l(e.l.Ka, e.l, e) : null;
		a: {
			var i = e.i;
			let t = -1;
			for (;;) {
				let e = ["count=" + n];
				t == -1 ? n > 0 ? (t = i[0].g, e.push("ofs=" + t)) : t = 0 : e.push("ofs=" + t);
				let c = !0;
				for (let l = 0; l < n; l++) {
					var a = i[l].g;
					let n = i[l].map;
					if (a -= t, a < 0) t = Math.max(0, i[l].g - 100), c = !1;
					else try {
						a = "req" + a + "_" || "";
						try {
							var o = n instanceof Map ? n : Object.entries(n);
							for (let [t, n] of o) {
								let r = n;
								s(n) && (r = Ue(n)), e.push(a + t + "=" + encodeURIComponent(r));
							}
						} catch (t) {
							throw e.push(a + "type=_badmap"), t;
						}
					} catch {
						r && r(n);
					}
				}
				if (c) {
					o = e.join("&");
					break a;
				}
			}
			o = void 0;
		}
		return e = e.i.splice(0, n), t.G = e, o;
	}
	function Un(e) {
		if (!e.g && !e.v) {
			e.Y = 1;
			var t = e.Da;
			ne || ae(), re ||= (ne(), !0), ie.add(t, e), e.A = 0;
		}
	}
	function Wn(e) {
		return e.g || e.v || e.A >= 3 ? !1 : (e.Y++, e.v = at(l(e.Da, e), Yn(e, e.A)), e.A++, !0);
	}
	e.Da = function() {
		if (this.v = null, Kn(this), this.aa && !(this.P || this.g == null || this.T <= 0)) {
			var e = 4 * this.T;
			this.j.info("BP detection timer enabled: " + e), this.B = at(l(this.Wa, this), e);
		}
	}, e.Wa = function() {
		this.B && (this.B = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = !1, this.P = !0, rt(10), In(this), Kn(this));
	};
	function Gn(e) {
		e.B != null && (o.clearTimeout(e.B), e.B = null);
	}
	function Kn(e) {
		e.g = new vt(e, e.j, "rpc", e.Y), e.u === null && (e.g.J = e.o), e.g.P = 0;
		var t = Wt(e.na);
		x(t, "RID", "rpc"), x(t, "SID", e.M), x(t, "AID", e.K), x(t, "CI", e.F ? "0" : "1"), !e.F && e.ia && x(t, "TO", e.ia), x(t, "TYPE", "xmlhttp"), Vn(e, t), e.u && e.o && Cn(t, e.u, e.o), e.O && (e.g.H = e.O);
		var n = e.g;
		e = e.ba, n.M = 1, n.A = Jt(Wt(t)), n.u = null, n.R = !0, Ct(n, e);
	}
	e.Va = function() {
		this.C != null && (this.C = null, In(this), Wn(this), rt(19));
	};
	function qn(e) {
		e.C != null && (o.clearTimeout(e.C), e.C = null);
	}
	function Jn(e, t) {
		var n = null;
		if (e.g == t) {
			qn(e), Gn(e), e.g = null;
			var r = 2;
		} else if (Lt(e.h, t)) n = t.G, zt(e.h, t), r = 1;
		else return;
		if (e.I != 0) {
			if (t.o) {
				if (r == 1) {
					n = t.u ? t.u.length : 0, t = Date.now() - t.F;
					var i = e.D;
					r = $e(), Ie(r, new it(r, n)), Rn(e);
				} else Un(e);
			} else if (i = t.m, i == 3 || i == 0 && t.X > 0 || !(r == 1 && zn(e, t) || r == 2 && Wn(e))) switch (n && n.length > 0 && (t = e.h, t.i = t.i.concat(n)), i) {
				case 1:
					Xn(e, 5);
					break;
				case 4:
					Xn(e, 10);
					break;
				case 3:
					Xn(e, 6);
					break;
				default: Xn(e, 2);
			}
		}
	}
	function Yn(e, t) {
		let n = e.Qa + Math.floor(Math.random() * e.Za);
		return e.isActive() || (n *= 2), n * t;
	}
	function Xn(e, t) {
		if (e.j.info("Error code " + t), t == 2) {
			var n = l(e.bb, e), r = e.Ua;
			let t = !r;
			r = new Ut(r || "//www.google.com/images/cleardot.gif"), o.location && o.location.protocol == "http" || Gt(r, "https"), Jt(r), t ? pn(r.toString(), n) : mn(r.toString(), n);
		} else rt(2);
		e.I = 0, e.l && e.l.pa(t), Zn(e), Ln(e);
	}
	e.bb = function(e) {
		e ? (this.j.info("Successfully pinged google.com"), rt(2)) : (this.j.info("Failed to ping google.com"), rt(1));
	};
	function Zn(e) {
		if (e.I = 0, e.ja = [], e.l) {
			let t = Bt(e.h);
			(t.length != 0 || e.i.length != 0) && (m(e.ja, t), m(e.ja, e.i), e.h.i.length = 0, p(e.i), e.i.length = 0), e.l.oa();
		}
	}
	function Qn(e, t, n) {
		var r = n instanceof Ut ? Wt(n) : new Ut(n);
		if (r.g != "") t && (r.g = t + "." + r.g), Kt(r, r.u);
		else {
			var i = o.location;
			r = i.protocol, t = t ? t + "." + i.hostname : i.hostname, i = +i.port;
			let e = new Ut(null);
			r && Gt(e, r), t && (e.g = t), i && Kt(e, i), n && (e.h = n), r = e;
		}
		return n = e.G, t = e.wa, n && t && x(r, n, t), x(r, "VER", e.ka), Vn(e, r), r;
	}
	function $n(e, t, n) {
		if (t && !e.L) throw Error("Can't create secondary domain capable XhrIo object.");
		return t = e.Aa && !e.ma ? new S(new _n({ ab: n })) : new S(e.ma), t.Fa(e.L), t;
	}
	e.isActive = function() {
		return !!this.l && this.l.isActive(this);
	};
	function er() {}
	e = er.prototype, e.ra = function() {}, e.qa = function() {}, e.pa = function() {}, e.oa = function() {}, e.isActive = function() {
		return !0;
	}, e.Ka = function() {};
	function tr() {}
	tr.prototype.g = function(e, t) {
		return new nr(e, t);
	};
	function nr(e, t) {
		Fe.call(this), this.g = new Pn(t), this.l = e, this.h = t && t.messageUrlParams || null, e = t && t.messageHeaders || null, t && t.clientProtocolHeaderRequired && (e ? e["X-Client-Protocol"] = "webchannel" : e = { "X-Client-Protocol": "webchannel" }), this.g.o = e, e = t && t.initMessageHeaders || null, t && t.messageContentType && (e ? e["X-WebChannel-Content-Type"] = t.messageContentType : e = { "X-WebChannel-Content-Type": t.messageContentType }), t && t.sa && (e ? e["X-WebChannel-Client-Profile"] = t.sa : e = { "X-WebChannel-Client-Profile": t.sa }), this.g.U = e, (e = t && t.Qb) && !ue(e) && (this.g.u = e), this.A = t && t.supportsCrossDomainXhr || !1, this.v = t && t.sendRawJson || !1, (t &&= t.httpSessionIdParam) && !ue(t) && (this.g.G = t, e = this.h, e !== null && t in e && (e = this.h, t in e && delete e[t])), this.j = new ar(this);
	}
	d(nr, Fe), nr.prototype.m = function() {
		this.g.l = this.j, this.A && (this.g.L = !0), this.g.connect(this.l, this.h || void 0);
	}, nr.prototype.close = function() {
		Fn(this.g);
	}, nr.prototype.o = function(e) {
		var t = this.g;
		if (typeof e == "string") {
			var n = {};
			n.__data__ = e, e = n;
		} else this.v && (n = {}, n.__data__ = Ue(e), e = n);
		t.i.push(new Nt(t.Ya++, e)), t.I == 3 && Rn(t);
	}, nr.prototype.N = function() {
		this.g.l = null, delete this.j, Fn(this.g), delete this.g, nr.Z.N.call(this);
	};
	function rr(e) {
		Ye.call(this), e.__headers__ && (this.headers = e.__headers__, this.statusCode = e.__status__, delete e.__headers__, delete e.__status__);
		var t = e.__sm__;
		if (t) {
			a: {
				for (let n in t) {
					e = n;
					break a;
				}
				e = void 0;
			}
			(this.i = e) && (e = this.i, t = t !== null && e in t ? t[e] : void 0), this.data = t;
		} else this.data = e;
	}
	d(rr, Ye);
	function ir() {
		Xe.call(this), this.status = 1;
	}
	d(ir, Xe);
	function ar(e) {
		this.g = e;
	}
	d(ar, er), ar.prototype.ra = function() {
		Ie(this.g, "a");
	}, ar.prototype.qa = function(e) {
		Ie(this.g, new rr(e));
	}, ar.prototype.pa = function(e) {
		Ie(this.g, new ir());
	}, ar.prototype.oa = function() {
		Ie(this.g, "b");
	}, tr.prototype.createWebChannel = tr.prototype.g, nr.prototype.send = nr.prototype.o, nr.prototype.open = nr.prototype.m, nr.prototype.close = nr.prototype.close, Tc = _c.createWebChannelTransport = function() {
		return new tr();
	}, wc = _c.getStatEventTarget = function() {
		return $e();
	}, Cc = _c.Event = Ze, Sc = _c.Stat = {
		jb: 0,
		mb: 1,
		nb: 2,
		Hb: 3,
		Mb: 4,
		Jb: 5,
		Kb: 6,
		Ib: 7,
		Gb: 8,
		Lb: 9,
		PROXY: 10,
		NOPROXY: 11,
		Eb: 12,
		Ab: 13,
		Bb: 14,
		zb: 15,
		Cb: 16,
		Db: 17,
		fb: 18,
		eb: 19,
		gb: 20
	}, ft.NO_ERROR = 0, ft.TIMEOUT = 8, ft.HTTP_ERROR = 6, xc = _c.ErrorCode = ft, pt.COMPLETE = "complete", bc = _c.EventType = pt, qe.EventType = Je, Je.OPEN = "a", Je.CLOSE = "b", Je.ERROR = "c", Je.MESSAGE = "d", Fe.prototype.listen = Fe.prototype.J, yc = _c.WebChannel = qe, S.prototype.listenOnce = S.prototype.K, S.prototype.getLastError = S.prototype.Ha, S.prototype.getLastErrorCode = S.prototype.ya, S.prototype.getStatus = S.prototype.ca, S.prototype.getResponseJson = S.prototype.La, S.prototype.getResponseText = S.prototype.la, S.prototype.send = S.prototype.ea, S.prototype.setWithCredentials = S.prototype.Fa, vc = _c.XhrIo = S;
}).apply(gc === void 0 ? typeof self < "u" ? self : typeof window < "u" ? window : {} : gc);
//#endregion
//#region node_modules/re2js/build/index.js
var w = class e {
	static FOLD_CASE = 1;
	static LITERAL = 2;
	static CLASS_NL = 4;
	static DOT_NL = 8;
	static ONE_LINE = 16;
	static NON_GREEDY = 32;
	static PERL_X = 64;
	static UNICODE_GROUPS = 128;
	static WAS_DOLLAR = 256;
	static LOOKBEHIND = 512;
	static MATCH_NL = e.CLASS_NL | e.DOT_NL;
	static PERL = e.CLASS_NL | e.ONE_LINE | e.PERL_X | e.UNICODE_GROUPS;
	static POSIX = 0;
	static UNANCHORED = 0;
	static ANCHOR_START = 1;
	static ANCHOR_BOTH = 2;
}, Ec = {
	CASE_INSENSITIVE: 1,
	DOTALL: 2,
	MULTILINE: 4,
	DISABLE_UNICODE_GROUPS: 8,
	LONGEST_MATCH: 16,
	LOOKBEHINDS: 512
}, Dc = 128, Oc = new Int32Array(Dc), kc = new Int32Array(Dc), Ac = 65535;
for (let e = 0; e < Dc; e++) e >= 97 && e <= 122 ? Oc[e] = e - 32 : Oc[e] = e, e >= 65 && e <= 90 ? kc[e] = e + 32 : kc[e] = e;
var T = class {
	static CODES = /* @__PURE__ */ new Map([
		["\x07", 7],
		["\b", 8],
		["	", 9],
		["\n", 10],
		["\v", 11],
		["\f", 12],
		["\r", 13],
		[" ", 32],
		["\"", 34],
		["$", 36],
		["&", 38],
		["'", 39],
		["(", 40],
		[")", 41],
		["*", 42],
		["+", 43],
		["-", 45],
		[".", 46],
		["0", 48],
		["1", 49],
		["2", 50],
		["3", 51],
		["4", 52],
		["5", 53],
		["6", 54],
		["7", 55],
		["8", 56],
		["9", 57],
		[":", 58],
		["<", 60],
		[">", 62],
		["?", 63],
		["A", 65],
		["B", 66],
		["C", 67],
		["F", 70],
		["P", 80],
		["Q", 81],
		["U", 85],
		["Z", 90],
		["[", 91],
		["\\", 92],
		["]", 93],
		["^", 94],
		["_", 95],
		["`", 96],
		["a", 97],
		["b", 98],
		["f", 102],
		["i", 105],
		["m", 109],
		["n", 110],
		["r", 114],
		["s", 115],
		["t", 116],
		["v", 118],
		["x", 120],
		["z", 122],
		["{", 123],
		["|", 124],
		["}", 125]
	]);
	static toUpperCase(e) {
		if (e < Dc) return Oc[e];
		let t = String.fromCodePoint(e).toUpperCase(), n = t.codePointAt(0) > Ac ? 2 : 1;
		if (t.length > n) return e;
		let r = String.fromCodePoint(t.codePointAt(0)).toLowerCase(), i = r.codePointAt(0) > Ac ? 2 : 1;
		return r.length > i || r.codePointAt(0) !== e ? e : t.codePointAt(0);
	}
	static toLowerCase(e) {
		if (e < Dc) return kc[e];
		let t = String.fromCodePoint(e).toLowerCase(), n = t.codePointAt(0) > Ac ? 2 : 1;
		if (t.length > n) return e;
		let r = String.fromCodePoint(t.codePointAt(0)).toUpperCase(), i = r.codePointAt(0) > Ac ? 2 : 1;
		return r.length > i || r.codePointAt(0) !== e ? e : t.codePointAt(0);
	}
}, E = class {
	constructor(e, t = !1) {
		this.data = e, this.isStride1 = t, this.SIZE = t ? 2 : 3;
	}
	getLo(e) {
		return this.data[e * this.SIZE];
	}
	getHi(e) {
		return this.data[e * this.SIZE + 1];
	}
	getStride(e) {
		return this.isStride1 ? 1 : this.data[e * this.SIZE + 2];
	}
	get length() {
		return this.data.length / this.SIZE;
	}
}, jc = /* @__PURE__ */ new Uint8Array(256);
for (let e = 0; e < 64; e++) jc["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-".charCodeAt(e)] = e;
var Mc = (e) => {
	let t = [], n = 0, r = 0;
	for (let i = 0; i < e.length; i++) {
		let a = jc[e.charCodeAt(i)];
		n |= (a & 31) << r, a & 32 ? r += 5 : (t.push(n), n = 0, r = 0);
	}
	return t;
}, D = (e, t) => {
	let n = Mc(e), r = t ? n.length / 2 : n.length / 3, i = new Uint32Array(r * 3), a = 0, o = 0;
	for (let e = 0; e < r; e++) a += n[o++], i[e * 3] = a, a += n[o++], i[e * 3 + 1] = a, i[e * 3 + 2] = t ? 1 : n[o++];
	return i;
}, Nc = (e) => {
	let t = Mc(e), n = /* @__PURE__ */ new Map(), r = 0;
	for (let e = 0; e < t.length; e += 2) {
		r += t[e];
		let i = t[e + 1], a = i >>> 1 ^ -(i & 1);
		n.set(r, r + a);
	}
	return n;
}, Pc = class {
	constructor(e) {
		this.initializer = e, this.cache = /* @__PURE__ */ new Map();
	}
	has(e) {
		return e in this.initializer;
	}
	get(e) {
		if (this.cache.has(e)) return this.cache.get(e);
		let t = this.initializer[e], n = t ? t() : null;
		return this.cache.set(e, n), n;
	}
}, Fc = class {
	static _CASE_ORBIT = null;
	static get CASE_ORBIT() {
		return this._CASE_ORBIT ||= Nc("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC"), this._CASE_ORBIT;
	}
	static _Print = null;
	static get Print() {
		return this._Print ||= new E(D("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB", !1)), this._Print;
	}
	static CATEGORIES = new Pc({
		C: () => new E(D("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB", !1)),
		Cc: () => new E(D("AfgDgB", !0)),
		Cf: () => new E(D("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB", !1)),
		Cn: () => new E(D("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB", !1)),
		Co: () => new E(D("gg4B-nGh4hc9--BD9--B", !0)),
		Cs: () => new E(D("gg2B--B", !0)),
		L: () => new E(D("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		LC: () => new E(D("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB", !1)),
		Ll: () => new E(D("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB", !1)),
		Lm: () => new E(D("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB", !1)),
		Lo: () => new E(D("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		Lt: () => new E(D("lOGDnB2sH2sHBGBJHBJHBNQQwBAB", !1)),
		Lu: () => new E(D("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB", !1)),
		M: () => new E(D("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", !1)),
		Mc: () => new E(D("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB", !1)),
		Me: () => new E(D("okBBB1xF-wB-wBBCBCCBsshBCB", !1)),
		Mn: () => new E(D("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", !1)),
		N: () => new E(D("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB", !1)),
		Nd: () => new E(D("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ", !0)),
		Nl: () => new E(D("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB", !1)),
		No: () => new E(D("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB", !1)),
		P: () => new E(D("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", !1)),
		Pc: () => new E(D("-Cg-Hg-HBUU-u3BBBZCBwHAB", !1)),
		Pd: () => new E(D("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", !1)),
		Pe: () => new E(D("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD", !1)),
		Pf: () => new E(D("7F+6H+6HEddpuDCCFDDQEE", !1)),
		Pi: () => new E(D("rFt7Ht7HDBBDaapuDCCFDDQEE", !1)),
		Po: () => new E(D("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", !1)),
		Ps: () => new E(D("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB", !1)),
		S: () => new E(D("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", !1)),
		Sc: () => new E(D("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC", !1)),
		Sk: () => new E(D("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB", !1)),
		Sm: () => new E(D("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB", !1)),
		So: () => new E(D("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", !1)),
		Z: () => new E(D("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB", !1)),
		Zl: () => new E(D("ohIA", !0)),
		Zp: () => new E(D("phIA", !0)),
		Zs: () => new E(D("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB", !1)),
		ASCII_Hex_Digit: () => new E(D("wBJIFbF", !0)),
		Alphabetic: () => new E(D("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		Dash: () => new E(D("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", !1)),
		Emoji: () => new E(D("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", !1)),
		Emoji_Component: () => new E(D("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB", !1)),
		Emoji_Modifier: () => new E(D("7-8DE", !0)),
		Emoji_Modifier_Base: () => new E(D("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB", !1)),
		Emoji_Presentation: () => new E(D("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", !1)),
		Extended_Pictographic: () => new E(D("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB", !1)),
		Hex_Digit: () => new E(D("wBJIFbFq1-BJIFbF", !0)),
		Lowercase: () => new E(D("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB", !1)),
		Math: () => new E(D("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB", !1)),
		Quotation_Mark: () => new E(D("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB", !1)),
		Terminal_Punctuation: () => new E(D("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB", !1)),
		Uppercase: () => new E(D("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB", !1)),
		White_Space: () => new E(D("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB", !1))
	});
	static get Upper() {
		return this.CATEGORIES.get("Lu");
	}
	static SCRIPTS = new Pc({
		Adlam: () => new E(D("go6DrCFJFB", !0)),
		Ahom: () => new E(D("g4lCaDOFW", !0)),
		Anatolian_Hieroglyphs: () => new E(D("ggxCmS", !0)),
		Arabic: () => new E(D("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB", !1)),
		Armenian: () => new E(D("xpBlBDxBDCks9BE", !0)),
		Avestan: () => new E(D("g4iC1BEG", !0)),
		Balinese: () => new E(D("g4GsCCxB", !0)),
		Bamum: () => new E(D("g1pB3CpowB4R", !0)),
		Bassa_Vah: () => new E(D("w26CdDF", !0)),
		Batak: () => new E(D("g+GzBJD", !0)),
		Bengali: () => new E(D("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB", !1)),
		Beria_Erfe: () => new E(D("g17CYDY", !0)),
		Bhaiksuki: () => new E(D("ggnCICsBCNLc", !0)),
		Bopomofo: () => new E(D("qXB6wLqBxDf", !0)),
		Brahmi: () => new E(D("ggkCtCFjBKA", !0)),
		Braille: () => new E(D("ggK-H", !0)),
		Buginese: () => new E(D("gwGbDB", !0)),
		Buhid: () => new E(D("g6FT", !0)),
		Canadian_Aboriginal: () => new E(D("ggF-TxRlC7tgCP", !0)),
		Carian: () => new E(D("g1gCwB", !0)),
		Caucasian_Albanian: () => new E(D("wphCzBMA", !0)),
		Chakma: () => new E(D("gokC0BCR", !0)),
		Cham: () => new E(D("gwqB2BKNDJDD", !0)),
		Cherokee: () => new E(D("g9E1CDFz7lBvC", !0)),
		Chorasmian: () => new E(D("w9jCb", !0)),
		Common: () => new E(D("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB", !1)),
		Coptic: () => new E(D("ifNxkKzDGG", !0)),
		Cuneiform: () => new E(D("ggoC5cnDuDCEMjG", !0)),
		Cypriot: () => new E(D("ggiCFBDCCBqBBCBBEDD", !1)),
		Cypro_Minoan: () => new E(D("w8rCiD", !0)),
		Cyrillic: () => new E(D("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB", !1)),
		Deseret: () => new E(D("gghCvC", !0)),
		Devanagari: () => new E(D("goCwCFODZh7nBfhwcJ", !0)),
		Dives_Akuru: () => new E(D("gomCGBDDDBGBCBBCdBCBBDLBKJB", !1)),
		Dogra: () => new E(D("ggmC7B", !0)),
		Duployan: () => new E(D("ggvDqDGMEIIJDD", !0)),
		Egyptian_Hieroglyphs: () => new E(D("ggsC1iBL68D", !0)),
		Elbasan: () => new E(D("gohCnB", !0)),
		Elymaic: () => new E(D("g-jCW", !0)),
		Ethiopic: () => new E(D("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB", !1)),
		Garay: () => new E(D("gqjClBEcJB", !0)),
		Georgian: () => new E(D("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG", !1)),
		Glagolitic: () => new E(D("ggL-Ch9sDGCQDGCBCE", !0)),
		Gothic: () => new E(D("w5gCa", !0)),
		Grantha: () => new E(D("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB", !1)),
		Greek: () => new E(D("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB", !1)),
		Gujarati: () => new E(D("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB", !1)),
		Gunjala_Gondi: () => new E(D("grnCFCBCkBCBCFIJ", !0)),
		Gurmukhi: () => new E(D("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB", !1)),
		Gurung_Khema: () => new E(D("go4C5B", !0)),
		Han: () => new E(D("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		Hangul: () => new E(D("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC", !0)),
		Hanifi_Rohingya: () => new E(D("gojCnBJJ", !0)),
		Hanunoo: () => new E(D("g5FU", !0)),
		Hatran: () => new E(D("gniCSCBGE", !0)),
		Hebrew: () => new E(D("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB", !1)),
		Hiragana: () => new E(D("hiM1CBHCBi7-C+IBTeeBBBulQAB", !1)),
		Imperial_Aramaic: () => new E(D("giiCVCI", !0)),
		Inherited: () => new E(D("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB", !1)),
		Inscriptional_Pahlavi: () => new E(D("g7iCSGH", !0)),
		Inscriptional_Parthian: () => new E(D("g6iCVDH", !0)),
		Javanese: () => new E(D("gsqBtCDJFB", !0)),
		Kaithi: () => new E(D("gkkCiCLA", !0)),
		Kannada: () => new E(D("gkDMCCCWCJCEDICCCDIBGCCDDJCC", !0)),
		Katakana: () => new E(D("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB", !1)),
		Kawi: () => new E(D("g4nCQCoBEc", !0)),
		Kayah_Li: () => new E(D("goqBtBCA", !0)),
		Kharoshthi: () => new E(D("gwiCDCBGHCCCcDCFJII", !0)),
		Khitan_Small_Script: () => new E(D("k-7C84G84GB0OBqBAB", !1)),
		Khmer: () => new E(D("g8F9CDJHJnPf", !0)),
		Khojki: () => new E(D("gwkCRCuB", !0)),
		Khudawadi: () => new E(D("w1kC6BGJ", !0)),
		Kirat_Rai: () => new E(D("gq7C5B", !0)),
		Lao: () => new E(D("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB", !1)),
		Latin: () => new E(D("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB", !1)),
		Lepcha: () => new E(D("ggH3BEOEC", !0)),
		Limbu: () => new E(D("goGeBCLBFLBFEEBKB", !1)),
		Linear_A: () => new E(D("gwhC2JKVLH", !0)),
		Linear_B: () => new E(D("gggCLCZCSCBCODNjB6D", !0)),
		Lisu: () => new E(D("wmpBvBx1eA", !0)),
		Lycian: () => new E(D("g0gCc", !0)),
		Lydian: () => new E(D("gpiCZGA", !0)),
		Mahajani: () => new E(D("wqkCmB", !0)),
		Makasar: () => new E(D("g3nCY", !0)),
		Malayalam: () => new E(D("goDMCCCyBCCCFFPDZ", !0)),
		Mandaic: () => new E(D("giCbDA", !0)),
		Manichaean: () => new E(D("g2iCmBFL", !0)),
		Marchen: () => new E(D("wjnCfDVCN", !0)),
		Masaram_Gondi: () => new E(D("gonCGBCBBCrBBECCBCCBHBJJB", !1)),
		Medefaidrin: () => new E(D("gy7C6C", !0)),
		Meetei_Mayek: () => new E(D("g3qBWqGtBDJ", !0)),
		Mende_Kikakui: () => new E(D("gg6DkGDP", !0)),
		Meroitic_Cursive: () => new E(D("gtiCXFTDtB", !0)),
		Meroitic_Hieroglyphs: () => new E(D("gsiCf", !0)),
		Miao: () => new E(D("g47CqCF4BIQ", !0)),
		Modi: () => new E(D("gwlCkCMJ", !0)),
		Mongolian: () => new E(D("ggGBBDCCBSBH4CBIqBB2t-BMB", !1)),
		Mro: () => new E(D("gy6CeCJFB", !0)),
		Multani: () => new E(D("g0kCGBCCCBCBCOBCKB", !1)),
		Myanmar: () => new E(D("ggE-EhqmBeiDfxibT", !0)),
		Nabataean: () => new E(D("gkiCeJI", !0)),
		Nag_Mundari: () => new E(D("wm5DpB", !0)),
		Nandinagari: () => new E(D("gtmCHDtBDK", !0)),
		New_Tai_Lue: () => new E(D("gsGrBFZHKEB", !0)),
		Newa: () => new E(D("gglC7CCE", !0)),
		Nko: () => new E(D("g+B6BDC", !0)),
		Nushu: () => new E(D("h-7CvsQvsQBqMB", !1)),
		Nyiakeng_Puachue_Hmong: () => new E(D("go4DsBENDJFB", !0)),
		Ogham: () => new E(D("g0Fc", !0)),
		Ol_Chiki: () => new E(D("wiHvB", !0)),
		Ol_Onal: () => new E(D("wu5DqBFA", !0)),
		Old_Hungarian: () => new E(D("gkjCyBOyBIF", !0)),
		Old_Italic: () => new E(D("g4gCjBKC", !0)),
		Old_North_Arabian: () => new E(D("g0iCf", !0)),
		Old_Permic: () => new E(D("w6gCqB", !0)),
		Old_Persian: () => new E(D("g9gCjBFN", !0)),
		Old_Sogdian: () => new E(D("g4jCnB", !0)),
		Old_South_Arabian: () => new E(D("gziCf", !0)),
		Old_Turkic: () => new E(D("ggjCoC", !0)),
		Old_Uyghur: () => new E(D("w7jCZ", !0)),
		Oriya: () => new E(D("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR", !0)),
		Osage: () => new E(D("wlhCjBFjB", !0)),
		Osmanya: () => new E(D("gkhCdDJ", !0)),
		Pahawh_Hmong: () => new E(D("g46ClCLJCGCUGS", !0)),
		Palmyrene: () => new E(D("gjiCf", !0)),
		Pau_Cin_Hau: () => new E(D("g2mC4B", !0)),
		Phags_Pa: () => new E(D("giqB3B", !0)),
		Phoenician: () => new E(D("goiCbEA", !0)),
		Psalter_Pahlavi: () => new E(D("g8iCRIDNG", !0)),
		Rejang: () => new E(D("wpqBjBMA", !0)),
		Runic: () => new E(D("g1FqCEK", !0)),
		Samaritan: () => new E(D("ggCtBDO", !0)),
		Saurashtra: () => new E(D("gkqBlCJL", !0)),
		Sharada: () => new E(D("gskC-ChsCH", !0)),
		Shavian: () => new E(D("wihCvB", !0)),
		Siddham: () => new E(D("gslC1BDlB", !0)),
		Sidetic: () => new E(D("gqiCZ", !0)),
		SignWriting: () => new E(D("gg2DrUQECO", !0)),
		Sinhala: () => new E(D("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB", !1)),
		Sogdian: () => new E(D("w5jCpB", !0)),
		Sora_Sompeng: () => new E(D("wmkCYIJ", !0)),
		Soyombo: () => new E(D("wymCyC", !0)),
		Sundanese: () => new E(D("g8G-BhIH", !0)),
		Sunuwar: () => new E(D("g+mChBPJ", !0)),
		Syloti_Nagri: () => new E(D("ggqBsB", !0)),
		Syriac: () => new E(D("g4BNC7BDCxIK", !0)),
		Tagalog: () => new E(D("g4FVKA", !0)),
		Tagbanwa: () => new E(D("g7FMCCCB", !0)),
		Tai_Le: () => new E(D("wqGdDE", !0)),
		Tai_Tham: () => new E(D("gxG+BCcDKHJHN", !0)),
		Tai_Viet: () => new E(D("g0qBiCZE", !0)),
		Tai_Yo: () => new E(D("g25DeCVJB", !0)),
		Takri: () => new E(D("g0lC5BHJ", !0)),
		Tamil: () => new E(D("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB", !1)),
		Tangsa: () => new E(D("wz6CuCCJ", !0)),
		Tangut: () => new E(D("g-7CgBgBB+3GBhQeBiDyDB", !1)),
		Telugu: () => new E(D("ggDMCCCWCPDICCCDIBCCCBDDDJII", !0)),
		Thaana: () => new E(D("g8BxB", !0)),
		Thai: () => new E(D("hwD5BGb", !0)),
		Tibetan: () => new E(D("g4DnCCjBFmBCjBCOCGFB", !0)),
		Tifinagh: () => new E(D("wpL3BIBPA", !0)),
		Tirhuta: () => new E(D("gklCnCJJ", !0)),
		Todhri: () => new E(D("guhCzB", !0)),
		Tolong_Siki: () => new E(D("wtnCrBFJ", !0)),
		Toto: () => new E(D("w04De", !0)),
		Tulu_Tigalari: () => new E(D("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB", !1)),
		Ugaritic: () => new E(D("g8gCdCA", !0)),
		Unknown: () => new E(D("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB", !1)),
		Vai: () => new E(D("gopBrJ", !0)),
		Vithkuqi: () => new E(D("wrhCKCOCGCBCKCOCGCB", !0)),
		Wancho: () => new E(D("g24D5BGA", !0)),
		Warang_Citi: () => new E(D("glmCyCNA", !0)),
		Yezidi: () => new E(D("g0jCpBCCDB", !0)),
		Yi: () => new E(D("ggoBskBE2B", !0)),
		Zanabazar_Square: () => new E(D("gwmCnC", !0))
	});
	static FOLD_CATEGORIES = new Pc({
		L: () => new E(D("laA", !0)),
		LC: () => new E(D("laA", !0)),
		Ll: () => new E(D("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", !1)),
		Lt: () => new E(D("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB", !1)),
		Lu: () => new E(D("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", !1)),
		M: () => new E(D("5cgBgBlgHAB", !1)),
		Mn: () => new E(D("5cgBgBlgHAB", !1)),
		Emoji: () => new E(D("8mJA", !0)),
		Extended_Pictographic: () => new E(D("8mJA", !0)),
		Lowercase: () => new E(D("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", !1)),
		Math: () => new E(D("ycGDCHHFMMDDDCHHFAB", !1)),
		Uppercase: () => new E(D("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", !1))
	});
	static FOLD_SCRIPT = new Pc({
		Common: () => new E(D("8cgBgB", !1)),
		Greek: () => new E(D("1FwUwU", !1)),
		Inherited: () => new E(D("5cgBgBlgHAB", !1))
	});
}, O = class e {
	static MAX_RUNE = 1114111;
	static RUNE_ERROR = 65533;
	static isUnsearchable(t) {
		return t === e.RUNE_ERROR || t >= e.MIN_HIGH_SURROGATE && t <= e.MAX_LOW_SURROGATE;
	}
	static MAX_ASCII = 127;
	static MAX_LATIN1 = 255;
	static MAX_BMP = 65535;
	static MIN_FOLD = 65;
	static MAX_FOLD = 125251;
	static MIN_HIGH_SURROGATE = 55296;
	static MAX_HIGH_SURROGATE = 56319;
	static MIN_LOW_SURROGATE = 56320;
	static MAX_LOW_SURROGATE = 57343;
	static MIN_SUPPLEMENTARY_CODE_POINT = 65536;
	static is32(e, t) {
		let n = 0, r = e.length;
		for (; n < r;) {
			let i = n + Math.floor((r - n) / 2), a = e.getLo(i), o = e.getHi(i);
			if (a <= t && t <= o) {
				let n = e.getStride(i);
				return (t - a) % n === 0;
			}
			t < a ? r = i : n = i + 1;
		}
		return !1;
	}
	static is(t, n) {
		if (n <= e.MAX_LATIN1) {
			for (let e = 0; e < t.length; e++) {
				if (n > t.getHi(e)) continue;
				let r = t.getLo(e);
				if (n < r) return !1;
				let i = t.getStride(e);
				return (n - r) % i === 0;
			}
			return !1;
		}
		return t.length > 0 && n >= t.getLo(0) && e.is32(t, n);
	}
	static isUpper(t) {
		if (t <= e.MAX_LATIN1) {
			let e = String.fromCodePoint(t);
			return e.toUpperCase() === e && e.toLowerCase() !== e;
		}
		return e.is(Fc.Upper, t);
	}
	static isPrint(t) {
		return t <= e.MAX_LATIN1 ? t >= 32 && t < e.MAX_ASCII || t >= 161 && t !== 173 : e.is(Fc.Print, t);
	}
	static simpleFold(t) {
		if (Fc.CASE_ORBIT.has(t)) return Fc.CASE_ORBIT.get(t);
		if (t <= e.MAX_ASCII) {
			let e = T.toLowerCase(t);
			return e === t ? T.toUpperCase(t) : e;
		}
		return t;
	}
	static equalsIgnoreCase(t, n) {
		if (t === n) return !0;
		if (t < 0 || n < 0) return !1;
		if (t <= e.MAX_ASCII && n <= e.MAX_ASCII) return 65 <= t && t <= 90 && (t |= 32), 65 <= n && n <= 90 && (n |= 32), t === n;
		for (let r = e.simpleFold(t); r !== t; r = e.simpleFold(r)) if (r === n) return !0;
		return !1;
	}
}, Ic = 256, Lc = new Uint8Array(Ic);
for (let e = 0; e < Ic; e++) Lc[e] = +(97 <= e && e <= 122 || 65 <= e && e <= 90 || 48 <= e && e <= 57 || e === 95);
var Rc = null, zc = null, k = class e {
	static METACHARACTERS = "\\.+*?()|[]{}^$";
	static EMPTY_BEGIN_LINE = 1;
	static EMPTY_END_LINE = 2;
	static EMPTY_BEGIN_TEXT = 4;
	static EMPTY_END_TEXT = 8;
	static EMPTY_WORD_BOUNDARY = 16;
	static EMPTY_NO_WORD_BOUNDARY = 32;
	static EMPTY_ALL = -1;
	static emptyInts() {
		return [];
	}
	static isByteArray(e) {
		return Array.isArray(e) || Object.prototype.toString.call(e) === "[object Uint8Array]";
	}
	static isalnum(e) {
		return T.CODES.get("0") <= e && e <= T.CODES.get("9") || T.CODES.get("a") <= e && e <= T.CODES.get("z") || T.CODES.get("A") <= e && e <= T.CODES.get("Z");
	}
	static unhex(e) {
		return T.CODES.get("0") <= e && e <= T.CODES.get("9") ? e - T.CODES.get("0") : T.CODES.get("a") <= e && e <= T.CODES.get("f") ? e - T.CODES.get("a") + 10 : T.CODES.get("A") <= e && e <= T.CODES.get("F") ? e - T.CODES.get("A") + 10 : -1;
	}
	static escapeRune(t) {
		let n = "";
		if (O.isPrint(t)) e.METACHARACTERS.indexOf(String.fromCodePoint(t)) >= 0 && (n += "\\"), n += String.fromCodePoint(t);
		else switch (t) {
			case T.CODES.get("\""):
				n += "\\\"";
				break;
			case T.CODES.get("\\"):
				n += "\\\\";
				break;
			case T.CODES.get("	"):
				n += "\\t";
				break;
			case T.CODES.get("\n"):
				n += "\\n";
				break;
			case T.CODES.get("\r"):
				n += "\\r";
				break;
			case T.CODES.get("\b"):
				n += "\\b";
				break;
			case T.CODES.get("\f"):
				n += "\\f";
				break;
			default: {
				let e = t.toString(16);
				t < 256 ? (n += "\\x", e.length === 1 && (n += "0"), n += e) : n += `\\x{${e}}`;
				break;
			}
		}
		return n;
	}
	static stringToRunes(e) {
		let t = String(e), n = [], r = 0;
		for (; r < t.length;) {
			let e = t.codePointAt(r);
			n.push(e), r += e > O.MAX_BMP ? 2 : 1;
		}
		return new Int32Array(n);
	}
	static runeToString(e) {
		return String.fromCodePoint(e);
	}
	static isWordRune(e) {
		return e < Ic && Lc[e] === 1;
	}
	static emptyOpContext(t, n) {
		let r = 0;
		return t < 0 && (r |= e.EMPTY_BEGIN_TEXT | e.EMPTY_BEGIN_LINE), t === 10 && (r |= e.EMPTY_BEGIN_LINE), n < 0 && (r |= e.EMPTY_END_TEXT | e.EMPTY_END_LINE), n === 10 && (r |= e.EMPTY_END_LINE), e.isWordRune(t) === e.isWordRune(n) ? r |= e.EMPTY_NO_WORD_BOUNDARY : r |= e.EMPTY_WORD_BOUNDARY, r;
	}
	static quoteMeta(t) {
		return t.split("").map((t) => e.METACHARACTERS.indexOf(t) >= 0 ? `\\${t}` : t).join("");
	}
	static charCount(e) {
		return e > O.MAX_BMP ? 2 : 1;
	}
	static toArray(e) {
		let t = e.length, n = Array(t);
		for (let r = 0; r < t; r++) n[r] = e[r];
		return n;
	}
	static stringToUtf8ByteArray(e) {
		if (globalThis.TextEncoder) return Rc ||= new TextEncoder(), Rc.encode(e);
		{
			let t = [], n = 0;
			for (let r = 0; r < e.length; r++) {
				let i = e.charCodeAt(r);
				i < 128 ? t[n++] = i : i < 2048 ? (t[n++] = i >> 6 | 192, t[n++] = i & 63 | 128) : (i & 64512) === O.MIN_HIGH_SURROGATE && r + 1 < e.length && (e.charCodeAt(r + 1) & 64512) === O.MIN_LOW_SURROGATE ? (i = O.MIN_SUPPLEMENTARY_CODE_POINT + ((i & 1023) << 10) + (e.charCodeAt(++r) & 1023), t[n++] = i >> 18 | 240, t[n++] = i >> 12 & 63 | 128, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128) : (t[n++] = i >> 12 | 224, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128);
			}
			return t;
		}
	}
	static utf8ByteArrayToString(e) {
		if (globalThis.TextDecoder) {
			zc ||= new TextDecoder("utf-8");
			let t = e instanceof Uint8Array ? e : new Uint8Array(e);
			return zc.decode(t);
		}
		{
			let t = [], n = 0, r = 0;
			for (; n < e.length;) {
				let i = e[n++];
				if (i < 128) t[r++] = String.fromCharCode(i);
				else if (i > 191 && i < 224) {
					let a = e[n++];
					t[r++] = String.fromCharCode((i & 31) << 6 | a & 63);
				} else if (i > 239 && i < 365) {
					let a = e[n++], o = e[n++], s = e[n++], c = ((i & 7) << 18 | (a & 63) << 12 | (o & 63) << 6 | s & 63) - O.MIN_SUPPLEMENTARY_CODE_POINT;
					t[r++] = String.fromCharCode(O.MIN_HIGH_SURROGATE + (c >> 10)), t[r++] = String.fromCharCode(O.MIN_LOW_SURROGATE + (c & 1023));
				} else {
					let a = e[n++], o = e[n++];
					t[r++] = String.fromCharCode((i & 15) << 12 | (a & 63) << 6 | o & 63);
				}
			}
			return t.join("");
		}
	}
}, Bc = (e = [], t = 0) => {
	let n = Object.create(null);
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t + r;
		n[i] = a, n[a] = i;
	}
	return Object.freeze(n);
}, Vc = class e {
	static Encoding = Bc(["UTF_16", "UTF_8"]);
	getEncoding() {
		throw Error("not implemented");
	}
	asCharSequence() {
		throw Error("not implemented");
	}
	asBytes() {
		throw Error("not implemented");
	}
	length() {
		throw Error("not implemented");
	}
	isUTF8Encoding() {
		return this.getEncoding() === e.Encoding.UTF_8;
	}
	isUTF16Encoding() {
		return this.getEncoding() === e.Encoding.UTF_16;
	}
}, Hc = class extends Vc {
	constructor(e = null) {
		super(), this.bytes = e;
	}
	getEncoding() {
		return Vc.Encoding.UTF_8;
	}
	asCharSequence() {
		return k.utf8ByteArrayToString(this.bytes);
	}
	asBytes() {
		return this.bytes;
	}
	length() {
		return this.bytes.length;
	}
}, Uc = class extends Vc {
	constructor(e = null) {
		super(), this.charSequence = e;
	}
	getEncoding() {
		return Vc.Encoding.UTF_16;
	}
	asCharSequence() {
		return this.charSequence;
	}
	asBytes() {
		return k.stringToUtf8ByteArray(this.charSequence.toString());
	}
	length() {
		return this.charSequence.length;
	}
}, Wc = class {
	static utf16(e) {
		return new Uc(e);
	}
	static utf8(e) {
		return k.isByteArray(e) ? new Hc(e) : new Hc(k.stringToUtf8ByteArray(e));
	}
}, Gc = class {
	static EOF() {
		return -8;
	}
	constructor() {
		this.end = 0;
	}
	canCheckPrefix() {
		return !0;
	}
	endPos() {
		return this.end;
	}
	hasString() {
		return !1;
	}
	hasAnyString() {
		return !1;
	}
	prefixLength() {
		return 0;
	}
}, Kc = class e extends Gc {
	static RUNE_ERROR_STEP = O.RUNE_ERROR << 3 | 1;
	constructor(e, t = 0, n = e.length) {
		super(), this.bytes = e, this.start = t, this.end = n;
	}
	hasString(e, t) {
		let n = e.bytes;
		if (n.length === 0) return !0;
		let r = this.indexOf(this.bytes, n, this.start + t);
		return r !== -1 && r <= this.end - n.length;
	}
	hasAnyString(e, t) {
		return e.automaton8().searchUTF8(this.bytes, this.start + t, this.end);
	}
	step(t) {
		if (t += this.start, t >= this.end) return Gc.EOF();
		let n = this.bytes[t] & 255;
		if (n < 128) return n << 3 | 1;
		let r, i, a = 128, o = 191;
		if (n >= 194 && n <= 223) r = 2, i = n & 31;
		else if (n >= 224 && n <= 239) r = 3, i = n & 15, n === 224 ? a = 160 : n === 237 && (o = 159);
		else if (n >= 240 && n <= 244) r = 4, i = n & 7, n === 240 ? a = 144 : n === 244 && (o = 143);
		else return e.RUNE_ERROR_STEP;
		if (t + r > this.end) return e.RUNE_ERROR_STEP;
		let s = this.bytes[t + 1] & 255;
		if (s < a || s > o) return e.RUNE_ERROR_STEP;
		if (i = i << 6 | s & 63, r > 2) {
			let n = this.bytes[t + 2] & 255;
			if ((n & 192) != 128) return e.RUNE_ERROR_STEP;
			if (i = i << 6 | n & 63, r > 3) {
				let n = this.bytes[t + 3] & 255;
				if ((n & 192) != 128) return e.RUNE_ERROR_STEP;
				i = i << 6 | n & 63;
			}
		}
		return i << 3 | r;
	}
	index(e, t) {
		t += this.start;
		let n = this.indexOf(this.bytes, e.prefixUTF8, t);
		return n < 0 ? n : n - t;
	}
	context(e) {
		e += this.start;
		let t = -1;
		if (e > this.start && e <= this.end) {
			let n = e - 1;
			if (t = this.bytes[n--], t >= 128) {
				let r = e - 4;
				for (r < this.start && (r = this.start); n >= r && (this.bytes[n] & 192) == 128;) n--;
				n < this.start && (n = this.start);
				let i = this.step(n - this.start);
				t = n + (i & 7) === e ? i >> 3 : O.RUNE_ERROR;
			}
		}
		let n = e < this.end ? this.step(e - this.start) >> 3 : -1;
		return k.emptyOpContext(t, n);
	}
	indexOf(e, t, n = 0) {
		let r = t.length;
		if (r === 0) return n <= this.end ? n : -1;
		let i = t[0], a = this.end - r, o = typeof e.indexOf == "function", s = n;
		for (; s <= a;) {
			if (o) {
				if (s = e.indexOf(i, s), s === -1 || s > a) return -1;
			} else {
				for (; s <= a && e[s] !== i;) s++;
				if (s > a) return -1;
			}
			let n = !0;
			for (let i = 1; i < r; i++) if (e[s + i] !== t[i]) {
				n = !1;
				break;
			}
			if (n) return s;
			s++;
		}
		return -1;
	}
	prefixLength(e) {
		return e.prefixUTF8.length;
	}
}, qc = class extends Gc {
	constructor(e, t = 0, n = e.length) {
		super(), this.charSequence = e, this.start = t, this.end = n;
	}
	hasString(e, t) {
		let n = this.charSequence.indexOf(e.str, this.start + t);
		return n !== -1 && n <= this.end - e.str.length;
	}
	hasAnyString(e, t) {
		return e.automaton16().searchUTF16(this.charSequence, this.start + t, this.end);
	}
	step(e) {
		if (e += this.start, e >= this.end) return Gc.EOF();
		let t = this.charSequence.charCodeAt(e);
		if (t < O.MIN_HIGH_SURROGATE || t > O.MAX_HIGH_SURROGATE || e + 1 >= this.end) return t << 3 | 1;
		let n = this.charSequence.charCodeAt(e + 1);
		return n >= O.MIN_LOW_SURROGATE && n <= O.MAX_LOW_SURROGATE ? (t - O.MIN_HIGH_SURROGATE) * 1024 + (n - O.MIN_LOW_SURROGATE) + O.MIN_SUPPLEMENTARY_CODE_POINT << 3 | 2 : t << 3 | 1;
	}
	index(e, t) {
		t += this.start;
		let n = this.charSequence.indexOf(e.prefix, t);
		return n < 0 || n > this.end - e.prefix.length ? -1 : n - t;
	}
	context(e) {
		e += this.start;
		let t = e > this.start && e <= this.end ? this.charSequence.charCodeAt(e - 1) : -1, n = e < this.end ? this.charSequence.charCodeAt(e) : -1;
		return k.emptyOpContext(t, n);
	}
	prefixLength(e) {
		return e.prefix.length;
	}
}, A = class {
	static fromUTF8(e, t = 0, n = e.length) {
		return new Kc(e, t, n);
	}
	static fromUTF16(e, t = 0, n = e.length) {
		return new qc(e, t, n);
	}
}, Jc = class extends Error {
	constructor(e) {
		super(e), this.name = "RE2JSException";
	}
}, j = class extends Jc {
	constructor(e, t = null) {
		let n = `error parsing regexp: ${e}`;
		t && (n += `: \`${t}\``), super(n), this.name = "RE2JSSyntaxException", this.message = n, this.error = e, this.input = t;
	}
	getDescription() {
		return this.error;
	}
	getPattern() {
		return this.input;
	}
}, Yc = class extends Jc {
	constructor(e) {
		super(e), this.name = "RE2JSCompileException";
	}
}, Xc = class extends Jc {
	constructor(e) {
		super(e), this.name = "RE2JSGroupException";
	}
}, Zc = class extends Jc {
	constructor(e) {
		super(e), this.name = "RE2JSFlagsException";
	}
}, Qc = class extends Jc {
	constructor(e) {
		super(e), this.name = "RE2JSInternalException";
	}
}, $c = class e {
	static MAX_REPLACER_ARGS = 65535;
	static quoteReplacement(e, t = !1) {
		return t ? e.indexOf("\\") < 0 && e.indexOf("$") < 0 ? e : e.split("").map((e) => {
			let t = e.codePointAt(0);
			return t === T.CODES.get("\\") || t === T.CODES.get("$") ? `\\${e}` : e;
		}).join("") : e.indexOf("$") < 0 ? e : e.split("").map((e) => e.codePointAt(0) === T.CODES.get("$") ? "$$" : e).join("");
	}
	constructor(e, t) {
		if (e === null) throw Error("pattern is null");
		this.patternInput = e;
		let n = this.patternInput.re2();
		this.patternGroupCount = n.numberOfCapturingGroups(), this.groups = [], this.namedGroups = n.namedGroups, this.numberOfInstructions = n.numberOfInstructions(), this.lookbehindState = null, t instanceof Vc ? this.resetMatcherInput(t) : k.isByteArray(t) ? this.resetMatcherInput(Wc.utf8(t)) : this.resetMatcherInput(Wc.utf16(t));
	}
	pattern() {
		return this.patternInput;
	}
	reset() {
		return this.matcherInputLength = this.matcherInput.length(), this.appendPos = 0, this.hasMatch = !1, this.hasGroups = !1, this.anchorFlag = 0, this;
	}
	resetMatcherInput(e) {
		if (e === null) throw Error("input is null");
		return e instanceof Vc || (e = k.isByteArray(e) ? Wc.utf8(e) : Wc.utf16(e)), this.matcherInput = e, this.lookbehindState === null ? this.lookbehindState = this.patternInput.re2().createLookbehindState() : this.lookbehindState.reset(), this.reset(), this;
	}
	start(e = 0) {
		if (typeof e == "string") {
			let t = this.namedGroups[e];
			if (!Number.isFinite(t)) throw new Xc(`group '${e}' not found`);
			e = t;
		}
		return this.loadGroup(e), this.groups[2 * e];
	}
	end(e = 0) {
		if (typeof e == "string") {
			let t = this.namedGroups[e];
			if (!Number.isFinite(t)) throw new Xc(`group '${e}' not found`);
			e = t;
		}
		return this.loadGroup(e), this.groups[2 * e + 1];
	}
	programSize() {
		return this.numberOfInstructions;
	}
	group(e = 0) {
		if (typeof e == "string") {
			let t = this.namedGroups[e];
			if (!Number.isFinite(t)) throw new Xc(`group '${e}' not found`);
			e = t;
		}
		let t = this.start(e), n = this.end(e);
		return t < 0 && n < 0 ? null : this.substring(t, n);
	}
	getNamedGroups() {
		if (!this.hasMatch) throw new Xc("perhaps no match attempted");
		let e = Object.create(null);
		for (let t of Object.keys(this.namedGroups)) e[t] = this.group(t);
		return e;
	}
	groupCount() {
		return this.patternGroupCount;
	}
	loadGroup(e) {
		if (!Number.isInteger(e) || e < 0 || e > this.patternGroupCount) throw new Xc(`Group index out of bounds: ${e}`);
		if (!this.hasMatch) throw new Xc("perhaps no match attempted");
		if (e === 0 || this.hasGroups) return;
		let t = this.matcherInputLength, n = this.patternInput.re2().matchMachineInput(this.matcherInput, this.groups[0], t, this.anchorFlag, 1 + this.patternGroupCount, this.lookbehindState);
		if (!n[0]) throw new Xc("inconsistency in matching group data");
		this.groups = n[1], this.hasGroups = !0;
	}
	matches() {
		return this.genMatch(0, w.ANCHOR_BOTH);
	}
	lookingAt() {
		return this.genMatch(0, w.ANCHOR_START);
	}
	find(e = null) {
		if (e !== null) {
			if (!Number.isInteger(e) || e < 0 || e > this.matcherInputLength) throw new Xc(`start index out of bounds: ${e}`);
			return this.reset(), this.genMatch(e, 0);
		}
		if (e = 0, this.hasMatch && (e = this.groups[1], this.groups[0] === this.groups[1])) {
			let t = (this.matcherInput.isUTF16Encoding() ? A.fromUTF16(this.matcherInput.asCharSequence(), 0, this.matcherInputLength) : A.fromUTF8(this.matcherInput.asBytes(), 0, this.matcherInputLength)).step(e);
			t < 0 ? e++ : e += t & 7;
		}
		return this.genMatch(e, w.UNANCHORED);
	}
	genMatch(e, t) {
		let n = this.patternInput.re2().matchMachineInput(this.matcherInput, e, this.matcherInputLength, t, 1, this.lookbehindState);
		return n[0] ? (this.groups = n[1], this.hasMatch = !0, this.hasGroups = this.patternGroupCount === 0, this.anchorFlag = t, !0) : (this.hasMatch = !1, !1);
	}
	substring(e, t) {
		return this.matcherInput.isUTF8Encoding() ? k.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e, t)) : this.matcherInput.asCharSequence().substring(e, t).toString();
	}
	inputLength() {
		return this.matcherInputLength;
	}
	appendReplacement(e, t = !1) {
		let n = "", r = this.start(), i = this.end();
		return this.appendPos < r && (n += this.substring(this.appendPos, r)), this.appendPos = i, n += t ? this.appendReplacementInternalJava(e) : this.appendReplacementInternalJs(e), n;
	}
	appendReplacementInternalJava(e) {
		let t = "", n = 0, r = e.length, i = 0;
		for (; i < r;) {
			let a = e.codePointAt(i);
			if (a === T.CODES.get("\\")) {
				if (n < i && (t += e.substring(n, i)), i++, i >= r) throw new Xc("character to be escaped is missing");
				n = i, i++;
				continue;
			}
			if (a === T.CODES.get("$")) {
				if (n < i && (t += e.substring(n, i)), i + 1 >= r) throw new Xc("Illegal group reference: group index is missing");
				let a = e.codePointAt(i + 1);
				if (T.CODES.get("0") <= a && a <= T.CODES.get("9")) {
					let o = a - T.CODES.get("0"), s = i + 2;
					for (; s < r; s++) {
						let t = e.codePointAt(s);
						if (t < T.CODES.get("0") || t > T.CODES.get("9") || o * 10 + t - T.CODES.get("0") > this.patternGroupCount) break;
						o = o * 10 + t - T.CODES.get("0");
					}
					if (o > this.patternGroupCount) throw new Xc(`n > number of groups: ${o}`);
					let c = this.group(o);
					c !== null && (t += c), i = s, n = i;
				} else if (a === T.CODES.get("{")) {
					let a = i + 2;
					for (; a < r && e.codePointAt(a) !== T.CODES.get("}");) a++;
					if (a >= r) throw new Xc("named capture group is missing trailing '}'");
					let o = e.substring(i + 2, a), s = this.group(o);
					s !== null && (t += s), i = a + 1, n = i;
				} else throw new Xc("Illegal group reference");
				continue;
			}
			i++;
		}
		return n < r && (t += e.substring(n, r)), t;
	}
	appendReplacementInternalJs(e) {
		let t = "", n = 0, r = e.length;
		for (let i = 0; i < r - 1; i++) if (e.codePointAt(i) === T.CODES.get("$")) {
			let a = e.codePointAt(i + 1);
			if (T.CODES.get("$") === a) {
				n < i && (t += e.substring(n, i)), t += "$", i++, n = i + 1;
				continue;
			}
			if (T.CODES.get("&") === a) {
				n < i && (t += e.substring(n, i));
				let r = this.group(0);
				t += r === null ? "$&" : r, i++, n = i + 1;
				continue;
			}
			if (T.CODES.get("`") === a) {
				n < i && (t += e.substring(n, i)), t += this.substring(0, this.start(0)), i++, n = i + 1;
				continue;
			}
			if (T.CODES.get("'") === a) {
				n < i && (t += e.substring(n, i)), t += this.substring(this.end(0), this.matcherInputLength), i++, n = i + 1;
				continue;
			}
			if (T.CODES.get("1") <= a && a <= T.CODES.get("9")) {
				let o = a - T.CODES.get("0");
				for (n < i && (t += e.substring(n, i)), i += 2; i < r && (a = e.codePointAt(i), !(a < T.CODES.get("0") || a > T.CODES.get("9") || o * 10 + a - T.CODES.get("0") > this.patternGroupCount)); i++) o = o * 10 + a - T.CODES.get("0");
				if (o > this.patternGroupCount) {
					t += `$${o}`, n = i, i--;
					continue;
				}
				let s = this.group(o);
				s !== null && (t += s), n = i, i--;
				continue;
			}
			if (a === T.CODES.get("<")) {
				n < i && (t += e.substring(n, i)), i++;
				let r = i + 1;
				for (; r < e.length && e.codePointAt(r) !== T.CODES.get(">") && e.codePointAt(r) !== T.CODES.get(" ");) r++;
				if (r === e.length || e.codePointAt(r) !== T.CODES.get(">")) {
					t += e.substring(i - 1, r + 1), n = r + 1, i = r;
					continue;
				}
				let a = e.substring(i + 1, r);
				if (Object.prototype.hasOwnProperty.call(this.namedGroups, a)) {
					let e = this.group(a);
					e !== null && (t += e);
				} else t += `$<${a}>`;
				n = r + 1, i = r;
				continue;
			}
		}
		return n < r && (t += e.substring(n, r)), t;
	}
	appendTail() {
		return this.substring(this.appendPos, this.matcherInputLength);
	}
	replaceAll(e, t = !1) {
		return this.replace(e, !0, t);
	}
	replaceFirst(e, t = !1) {
		return this.replace(e, !1, t);
	}
	replace(t, n = !0, r = !1) {
		let i = "";
		this.reset();
		let a = typeof t == "function", o = Object.keys(this.namedGroups).length > 0, s = null;
		if (a) {
			if (this.groupCount() >= e.MAX_REPLACER_ARGS) throw new Xc("Too many capture groups to safely invoke replacer function");
			s = this.matcherInput.isUTF8Encoding() ? this.matcherInput.asBytes() : this.matcherInput.asCharSequence();
		}
		for (; this.find() && (i += a ? this.appendReplacementFunc(t, o, s) : this.appendReplacement(t, r), n););
		return i += this.appendTail(), i;
	}
	appendReplacementFunc(e, t, n) {
		let r = "", i = this.start(), a = this.end();
		this.appendPos < i && (r += this.substring(this.appendPos, i)), this.appendPos = a;
		let o = this.buildReplacerArgs(i, t, n);
		return r += String(e(...o)), r;
	}
	buildReplacerArgs(e, t, n) {
		let r = [this.group(0)], i = this.groupCount();
		for (let e = 1; e <= i; e++) {
			let t = this.start(e);
			t < 0 ? r.push(void 0) : r.push(this.substring(t, this.end(e)));
		}
		if (r.push(e), r.push(n), t) {
			let e = this.getNamedGroups();
			for (let t in e) e[t] === null && (e[t] = void 0);
			r.push(e);
		}
		return r;
	}
}, M = class e {
	static ALT = 1;
	static ALT_MATCH = 2;
	static CAPTURE = 3;
	static EMPTY_WIDTH = 4;
	static FAIL = 5;
	static MATCH = 6;
	static NOP = 7;
	static RUNE = 8;
	static RUNE1 = 9;
	static RUNE_ANY = 10;
	static RUNE_ANY_NOT_NL = 11;
	static LB_WRITE = 12;
	static LB_CHECK = 13;
	static isRuneOp(t) {
		return e.RUNE <= t && t <= e.RUNE_ANY_NOT_NL;
	}
	static escapeRunes(e) {
		let t = "\"";
		for (let n of e) t += k.escapeRune(n);
		return t += "\"", t;
	}
	constructor(e) {
		this.op = e, this.out = 0, this.arg = 0, this.runes = /* @__PURE__ */ new Int32Array(), this.next = null;
	}
	matchRune(e) {
		if (this.runes.length === 1) {
			let t = this.runes[0];
			return (this.arg & w.FOLD_CASE) === 0 ? e === t : O.equalsIgnoreCase(t, e);
		}
		let t = this.runes.length;
		if (t === 0) return !1;
		if (t === 2 || t === 4 || t === 6 || t === 8) {
			for (let n = 0; n < t; n += 2) {
				if (e < this.runes[n]) return !1;
				if (e <= this.runes[n + 1]) return !0;
			}
			return !1;
		}
		let n = 0, r = t >> 1;
		for (; r > 1;) {
			let t = r >> 1;
			n += this.runes[n + t << 1] <= e ? t : 0, r -= t;
		}
		n += +(this.runes[n << 1] <= e);
		let i = n - 1;
		return i >= 0 && e <= this.runes[i << 1 | 1];
	}
	matchRunePos(e) {
		if (this.runes.length === 1) {
			let t = this.runes[0];
			return (this.arg & w.FOLD_CASE) === 0 ? e === t ? 0 : -1 : O.equalsIgnoreCase(t, e) ? 0 : -1;
		}
		let t = this.runes.length;
		if (t === 0) return -1;
		if (t === 2 || t === 4 || t === 6 || t === 8) {
			for (let n = 0; n < t; n += 2) {
				if (e < this.runes[n]) return -1;
				if (e <= this.runes[n + 1]) return Math.floor(n / 2);
			}
			return -1;
		}
		let n = 0, r = t >> 1;
		for (; r > 1;) {
			let t = r >> 1;
			n += this.runes[n + t << 1] <= e ? t : 0, r -= t;
		}
		n += +(this.runes[n << 1] <= e);
		let i = n - 1;
		return i >= 0 && e <= this.runes[i << 1 | 1] ? i : -1;
	}
	toString() {
		switch (this.op) {
			case e.ALT: return `alt -> ${this.out}, ${this.arg}`;
			case e.ALT_MATCH: return `altmatch -> ${this.out}, ${this.arg}`;
			case e.CAPTURE: return `cap ${this.arg} -> ${this.out}`;
			case e.EMPTY_WIDTH: return `empty ${this.arg} -> ${this.out}`;
			case e.MATCH: return `match${this.arg === 0 ? "" : ` ${this.arg}`}`;
			case e.FAIL: return "fail";
			case e.NOP: return `nop -> ${this.out}`;
			case e.LB_WRITE: return `lbwrite ${this.arg} -> ${this.out}`;
			case e.LB_CHECK: return `lbcheck ${this.arg} -> ${this.out}`;
			case e.RUNE: return this.runes === null ? "rune <null>" : [
				"rune ",
				e.escapeRunes(this.runes),
				(this.arg & w.FOLD_CASE) === 0 ? "" : "/i",
				" -> ",
				this.out
			].join("");
			case e.RUNE1: return `rune1 ${e.escapeRunes(this.runes)} -> ${this.out}`;
			case e.RUNE_ANY: return `any -> ${this.out}`;
			case e.RUNE_ANY_NOT_NL: return `anynotnl -> ${this.out}`;
			default: throw Error("unhandled case in Inst.toString");
		}
	}
}, el = class e {
	constructor(e) {
		this.sparse = new Int32Array(e), this.densePcs = new Int32Array(e), this.denseCaps = null, this.size = 0, this.ncap = 0, this.mainThreads = 0;
	}
	static INITIAL_THREADS = 32;
	init(t) {
		this.ncap = t;
		let n = Math.min(this.densePcs.length, e.INITIAL_THREADS) * t;
		(!this.denseCaps || this.denseCaps.length < n) && (this.denseCaps = new Int32Array(n));
	}
	growCaps(e) {
		let t = this.densePcs.length * this.ncap, n = new Int32Array(Math.min(t, Math.max(e, 2 * this.denseCaps.length)));
		n.set(this.denseCaps), this.denseCaps = n;
	}
	contains(e) {
		let t = this.sparse[e];
		return t < this.size && this.densePcs[t] === e;
	}
	isEmpty() {
		return this.size === 0;
	}
	add(e) {
		let t = this.size++;
		return this.sparse[e] = t, this.densePcs[t] = e, t;
	}
	clear() {
		this.size = 0, this.mainThreads = 0;
	}
	toString() {
		let e = "{";
		for (let t = 0; t < this.size; t++) t !== 0 && (e += ", "), e += this.densePcs[t];
		return e += "}", e;
	}
}, tl = class {
	constructor(e) {
		this.pos = -1, this.pcs = new Int32Array(e.numInst()), this.size = 0, this.lbTable = new Int32Array(e.numLb + 1);
	}
	reset() {
		this.pos = -1, this.size = 0;
	}
}, nl = class e {
	static fromRE2(t) {
		let n = new e();
		return n.prog = t.prog, n.re2 = t, n.q0 = new el(n.prog.numInst()), n.q1 = new el(n.prog.numInst()), n.addStack = new Int32Array(2 * (n.prog.numInst() + 1)), n.matched = !1, n.matchcap = new Int32Array(n.prog.numCap < 2 ? 2 : n.prog.numCap), n.ncap = 0, n;
	}
	constructor() {
		this.prog = null, this.re2 = null, this.q0 = null, this.q1 = null, this.addStack = null, this.matched = !1, this.matchcap = null, this.ncap = 0, this.lbTable = null;
	}
	init(e) {
		this.ncap = e, e > this.matchcap.length ? this.matchcap = new Int32Array(e).fill(-1) : this.matchcap.fill(-1), this.q0.init(e), this.q1.init(e), this.prog.numLb > 0 && ((!this.lbTable || this.lbTable.length < this.prog.numLb + 1) && (this.lbTable = new Int32Array(this.prog.numLb + 1)), this.lbTable.fill(-1));
	}
	submatches() {
		return this.ncap === 0 ? k.emptyInts() : k.toArray(this.matchcap.subarray(0, this.ncap));
	}
	match(e, t, n, r = null) {
		let i = this.re2.cond;
		if (i === k.EMPTY_ALL || (n === w.ANCHOR_START || n === w.ANCHOR_BOTH) && t !== 0) return !1;
		this.matched = !1, this.matchcap.fill(-1);
		let a = this.prog.numLb > 0, o = t, s = t, c = !1;
		a && (r !== null && r.pos >= 0 && r.pos <= t ? (s = r.pos, c = !0) : s = 0);
		let l = a && r !== null, u = this.q0, d = this.q1, f = e.step(s), p = f >> 3, m = f & 7, h = -1, g = 0;
		f !== Gc.EOF() && (f = e.step(s + m), h = f >> 3, g = f & 7);
		let _;
		for (_ = s === 0 ? k.emptyOpContext(-1, p) : e.context(s), a && (c ? this.restoreLookbehinds(r, u, _) : this.spawnLookbehinds(u, s, _));;) {
			if (u.mainThreads === 0) {
				if ((i & k.EMPTY_BEGIN_TEXT) !== 0 && s !== 0 || (n === w.ANCHOR_START || n === w.ANCHOR_BOTH) && s !== 0 || this.matched) break;
				if (this.prog.numLb === 0 && u.isEmpty() && this.re2.prefix.length !== 0 && h !== this.re2.prefixRune && e.canCheckPrefix()) {
					let t = e.index(this.re2, s);
					if (t < 0) break;
					s += t, f = e.step(s), p = f >> 3, m = f & 7, f = e.step(s + m), h = f >> 3, g = f & 7, _ = e.context(s);
				}
			}
			s >= o && (l &&= (this.saveLookbehinds(r, u, s), !1), !this.matched && (s === 0 || n === w.UNANCHORED) && (this.ncap > 0 && (this.matchcap[0] = s), this.add(u, this.prog.start, s, this.matchcap, 0, _)));
			let t = s + m;
			if (_ = e.context(t), this.step(u, d, s, t, p, _, n, s === e.endPos()), m === 0 || this.ncap === 0 && this.matched) break;
			s += m, p = h, m = g, p !== -1 && (f = e.step(s + m), h = f >> 3, g = f & 7);
			let a = u;
			u = d, d = a;
		}
		return u.clear(), d.clear(), this.matched;
	}
	matchSet(e, t, n) {
		let r = this.re2.cond;
		if (r === k.EMPTY_ALL || (n === w.ANCHOR_START || n === w.ANCHOR_BOTH) && t !== 0) return [];
		let i = this.prog.numLb > 0 ? 0 : t, a = t, o = this.q0, s = this.q1, c = e.step(i), l = c >> 3, u = c & 7, d = -1, f = 0;
		c !== Gc.EOF() && (c = e.step(i + u), d = c >> 3, f = c & 7);
		let p = i === 0 ? k.emptyOpContext(-1, l) : e.context(i), m = /* @__PURE__ */ new Set();
		for (this.prog.numLb > 0 && this.spawnLookbehinds(o, i, p); o.mainThreads !== 0 || ((r & k.EMPTY_BEGIN_TEXT) === 0 || i === 0) && (n !== w.ANCHOR_START && n !== w.ANCHOR_BOTH || i === 0);) {
			(i === 0 || n === w.UNANCHORED) && i >= a && this.add(o, this.prog.start, i, this.matchcap, 0, p);
			let t = i + u;
			p = e.context(t);
			for (let r = 0; r < o.size; r++) {
				let a = o.densePcs[r], c = this.prog.inst[a], u = r * this.ncap, d = !1;
				switch (c.op) {
					case M.MATCH:
						if (n === w.ANCHOR_BOTH && i !== e.endPos()) break;
						m.add(c.arg);
						break;
					case M.RUNE:
						d = c.matchRune(l);
						break;
					case M.RUNE1:
						d = l === c.runes[0];
						break;
					case M.RUNE_ANY:
						d = !0;
						break;
					case M.RUNE_ANY_NOT_NL:
						d = l !== 10;
						break;
					default: continue;
				}
				d && this.add(s, c.out, t, o.denseCaps, u, p);
			}
			if (o.clear(), u === 0) break;
			i += u, l = d, u = f, l !== -1 && (c = e.step(i + u), d = c >> 3, f = c & 7);
			let r = o;
			o = s, s = r;
		}
		return s.clear(), Array.from(m).sort((e, t) => e - t);
	}
	step(e, t, n, r, i, a, o, s) {
		let c = this.re2.longest;
		for (let l = 0; l < e.size; l++) {
			let u = e.densePcs[l], d = l * this.ncap;
			if (c && this.matched && this.ncap > 0 && this.matchcap[0] < e.denseCaps[d]) continue;
			let f = this.prog.inst[u], p = !1;
			switch (f.op) {
				case M.MATCH:
					if (o === w.ANCHOR_BOTH && !s) break;
					if (this.ncap > 0 && (!c || !this.matched || this.matchcap[1] < n)) {
						e.denseCaps[d + 1] = n;
						for (let t = 0; t < this.ncap; t++) this.matchcap[t] = e.denseCaps[d + t];
					}
					c || (e.size = 0), this.matched = !0;
					break;
				case M.RUNE:
					p = f.matchRune(i);
					break;
				case M.RUNE1:
					p = i === f.runes[0];
					break;
				case M.RUNE_ANY:
					p = !0;
					break;
				case M.RUNE_ANY_NOT_NL:
					p = i !== 10;
					break;
				default: continue;
			}
			p && this.add(t, f.out, r, e.denseCaps, d, a);
		}
		e.clear();
	}
	spawnLookbehinds(e, t, n) {
		for (let r = 0; r < this.prog.lbStarts.length; r++) this.add(e, this.prog.lbStarts[r], t, this.matchcap, 0, n);
	}
	restoreLookbehinds(e, t, n) {
		this.lbTable.set(e.lbTable);
		for (let r = 0; r < e.size; r++) this.add(t, e.pcs[r], e.pos, this.matchcap, 0, n);
	}
	saveLookbehinds(e, t, n) {
		let r = 0;
		for (let n = 0; n < t.size; n++) {
			let i = t.densePcs[n];
			this.prog.lbInst[i] === 1 && M.isRuneOp(this.prog.inst[i].op) && (e.pcs[r++] = i);
		}
		e.size = r, e.pos = n, e.lbTable.set(this.lbTable);
	}
	add(e, t, n, r, i, a) {
		let o = this.addStack, s = 0;
		for (;;) {
			for (; t !== 0 && !e.contains(t);) {
				let c = e.add(t), l = this.prog.inst[t];
				switch (l.op) {
					case M.FAIL:
						t = 0;
						break;
					case M.ALT:
					case M.ALT_MATCH:
						o[s++] = l.arg, o[s++] = 0, t = l.out;
						break;
					case M.EMPTY_WIDTH:
						t = (l.arg & ~a) === 0 ? l.out : 0;
						break;
					case M.NOP:
						t = l.out;
						break;
					case M.CAPTURE:
						l.arg < this.ncap && (o[s++] = -l.arg - 1, o[s++] = r[i + l.arg], r[i + l.arg] = n), t = l.out;
						break;
					case M.LB_WRITE:
						this.lbTable[Math.abs(l.arg)] = n, t = l.out;
						break;
					case M.LB_CHECK:
						t = l.arg > 0 ? this.lbTable[l.arg] === n ? l.out : 0 : this.lbTable[-l.arg] === n ? 0 : l.out;
						break;
					case M.MATCH:
					case M.RUNE:
					case M.RUNE1:
					case M.RUNE_ANY:
					case M.RUNE_ANY_NOT_NL:
						if (this.prog.lbInst[t] === 0 && e.mainThreads++, this.ncap > 0) {
							let t = c * this.ncap;
							t + this.ncap > e.denseCaps.length && e.growCaps(t + this.ncap);
							for (let n = 0; n < this.ncap; n++) e.denseCaps[t + n] = r[i + n];
						}
						t = 0;
						break;
					default: throw new Qc("unhandled");
				}
			}
			if (s === 0) return;
			s -= 2;
			let c = o[s];
			c < 0 ? (r[i - c - 1] = o[s + 1], t = 0) : t = c;
		}
	}
}, rl = (e, t, n) => {
	let r = -2128831035;
	for (let t = 0; t < e.length; t++) r ^= e[t], r = Math.imul(r, 16777619);
	r ^= t, r = Math.imul(r, 16777619);
	for (let e = 0; e < n.length; e++) r ^= n[e], r = Math.imul(r, 16777619);
	return r;
}, il = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}, al = [], ol = -1, sl = class {
	constructor(e, t, n) {
		this.nfaStates = e, this.flag = t, this.isMatch = (t & cl.FLAG_MATCH) !== 0, this.matchIDs = n, this.next = null, this.nextAnchored = null;
	}
}, cl = class e {
	static FLAG_EMPTY_MASK = 255;
	static FLAG_MATCH = 256;
	static FLAG_LAST_WORD = 512;
	static FLAG_NEED_SHIFT = 16;
	static STATE_OVERHEAD = 160;
	static TABLE_OVERHEAD = 16;
	static PROGRESS_PER_STATE = 10;
	constructor(e, t = 8388608) {
		this.prog = e, this.maxMem = t, this.stateCache = /* @__PURE__ */ new Map(), this.stateCount = 0, this.startStates = /* @__PURE__ */ new Map(), this.failed = !1;
		for (let t = 0; t < e.numInst(); t++) {
			let n = e.getInst(t).op;
			if (n === M.LB_WRITE || n === M.LB_CHECK) {
				this.failed = !0;
				break;
			}
		}
		this.computeRuneClasses(), this.stateBudget = t, this.memBudget = t;
	}
	computeRuneClasses() {
		let e = /* @__PURE__ */ new Set(), t = (t, n) => {
			e.add(t), e.add(n + 1);
		};
		for (let e = 0; e < this.prog.numInst(); e++) {
			let n = this.prog.getInst(e);
			switch (n.op) {
				case M.RUNE:
				case M.RUNE1:
					if (n.runes.length === 1) {
						if (t(n.runes[0], n.runes[0]), (n.arg & w.FOLD_CASE) !== 0) for (let e = O.simpleFold(n.runes[0]); e !== n.runes[0]; e = O.simpleFold(e)) t(e, e);
					} else for (let e = 0; e < n.runes.length; e += 2) t(n.runes[e], n.runes[e + 1]);
					break;
				case M.RUNE_ANY_NOT_NL:
					t(10, 10);
					break;
				case M.EMPTY_WIDTH: (n.arg & (k.EMPTY_BEGIN_LINE | k.EMPTY_END_LINE)) !== 0 && t(10, 10), (n.arg & (k.EMPTY_WORD_BOUNDARY | k.EMPTY_NO_WORD_BOUNDARY)) !== 0 && (t(48, 57), t(65, 90), t(95, 95), t(97, 122));
			}
		}
		e.delete(0), this.classBounds = Int32Array.from(e).sort(), this.numClasses = this.classBounds.length + 1;
		let n = new Int32Array(O.MAX_LATIN1 + 1);
		for (let e = 0; e <= O.MAX_LATIN1; e++) n[e] = this.searchClass(e);
		this.latin1Class = n;
	}
	runeClass(e) {
		return e <= O.MAX_LATIN1 ? this.latin1Class[e] : this.searchClass(e);
	}
	searchClass(e) {
		let t = this.classBounds, n = 0, r = t.length;
		for (; n < r;) {
			let i = n + r >> 1;
			t[i] <= e ? n = i + 1 : r = i;
		}
		return n;
	}
	closure(e, t) {
		let n = /* @__PURE__ */ new Set(), r = Array.from(e), i = 0;
		for (; r.length > 0;) {
			let e = r.pop();
			if (e === 0 || n.has(e)) continue;
			n.add(e);
			let a = this.prog.getInst(e);
			switch (a.op) {
				case M.ALT:
				case M.ALT_MATCH:
					r.push(a.out), r.push(a.arg);
					break;
				case M.NOP:
				case M.CAPTURE:
					r.push(a.out);
					break;
				case M.EMPTY_WIDTH: i |= a.arg, (a.arg & ~t) === 0 && r.push(a.out);
			}
		}
		return {
			pcs: Int32Array.from(n).sort(),
			needflags: i
		};
	}
	getState(t, n, r) {
		let i = rl(t, n, r), a = this.stateCache.get(i);
		if (a) for (let e = 0; e < a.length; e++) {
			let i = a[e];
			if (i.flag === n && il(i.nfaStates, t) && il(i.matchIDs, r)) return i;
		}
		let o = e.STATE_OVERHEAD + 4 * t.length + 8 * r.length;
		if (this.memBudget < o) return null;
		this.memBudget -= o, a || (a = [], this.stateCache.set(i, a));
		let s = new sl(t, n, r);
		return a.push(s), this.stateCount++, s;
	}
	makeState(t, n, r) {
		let i = this.closure(t, n & e.FLAG_EMPTY_MASK), a = n;
		return i.needflags === 0 && (a &= e.FLAG_MATCH), a |= i.needflags << e.FLAG_NEED_SHIFT, this.getState(i.pcs, a, r);
	}
	allocTable(t, n) {
		let r = this.numClasses + 1, i = e.TABLE_OVERHEAD + 8 * r;
		if (this.memBudget < i) return null;
		this.memBudget -= i;
		let a = Array(r).fill(null);
		return n === w.UNANCHORED ? t.next = a : t.nextAnchored = a, a;
	}
	clearCache() {
		this.stateCache.clear(), this.stateCount = 0, this.startStates.clear(), this.memBudget = this.stateBudget;
	}
	resetCache(e) {
		return this.clearCache(), this.getState(e.nfaStates, e.flag, e.matchIDs);
	}
	step(t, n, r, i) {
		let a = i === w.UNANCHORED ? t.next : t.nextAnchored;
		if (a !== null) {
			let e = a[n];
			if (e !== null) return e;
		} else if (a = this.allocTable(t, i), a === null) return null;
		let o = t.flag >>> e.FLAG_NEED_SHIFT, s = t.flag & e.FLAG_EMPTY_MASK, c = s, l = 0;
		r === 10 && (c |= k.EMPTY_END_LINE, l |= k.EMPTY_BEGIN_LINE), r === ol && (c |= k.EMPTY_END_LINE | k.EMPTY_END_TEXT);
		let u = (t.flag & e.FLAG_LAST_WORD) !== 0, d = r !== ol && k.isWordRune(r);
		c |= d === u ? k.EMPTY_NO_WORD_BOUNDARY : k.EMPTY_WORD_BOUNDARY;
		let f = t.nfaStates;
		(c & ~s & o) !== 0 && (f = this.closure(f, c).pcs);
		let p = [], m = !1, h = al;
		for (let e = 0; e < f.length; e++) {
			let t = this.prog.getInst(f[e]);
			t.op === M.MATCH ? (m || (m = !0, h = []), h.push(t.arg)) : r !== ol && M.isRuneOp(t.op) && t.matchRune(r) && p.push(t.out);
		}
		h.length > 1 && h.sort((e, t) => e - t), i === w.UNANCHORED && r !== ol && p.push(this.prog.start);
		let g = l;
		m && (g |= e.FLAG_MATCH), d && (g |= e.FLAG_LAST_WORD);
		let _ = this.makeState(p, g, h);
		return _ === null ? null : (a[n] = _, _);
	}
	start(t, n) {
		let r = t.context(n), i;
		if ((r & k.EMPTY_BEGIN_TEXT) !== 0) i = k.EMPTY_BEGIN_TEXT | k.EMPTY_BEGIN_LINE;
		else if ((r & k.EMPTY_BEGIN_LINE) !== 0) i = k.EMPTY_BEGIN_LINE;
		else {
			let a = t.step(n), o = a >= 0 && k.isWordRune(a >> 3);
			i = (r & k.EMPTY_WORD_BOUNDARY) !== 0 === o ? 0 : e.FLAG_LAST_WORD;
		}
		let a = this.startStates.get(i);
		if (a === void 0) {
			if (a = this.makeState([this.prog.start], i, al), a === null && (this.clearCache(), a = this.makeState([this.prog.start], i, al), a === null)) return null;
			this.startStates.set(i, a);
		}
		return a;
	}
	stepOrReset(t, n, r, i, a, o) {
		let s = this.step(t, n, r, i);
		if (s !== null) return s;
		if (o.resetPos >= 0 && a - o.resetPos < e.PROGRESS_PER_STATE * this.stateCount) return null;
		o.resetPos = a;
		let c = this.resetCache(t);
		return c === null ? null : (s = this.step(c, n, r, i), s);
	}
	run(e, t, n, r, i) {
		let a = e.endPos(), o = this.latin1Class, s = n === w.UNANCHORED, c = { resetPos: -1 }, l = t;
		for (; l < a;) {
			let t = e.step(l), a = t >> 3, u = t & 7;
			if (u === 0) break;
			let d = a <= O.MAX_LATIN1 ? o[a] : this.runeClass(a), f = s && r.next !== null ? r.next[d] : null;
			if (f === null && (f = this.stepOrReset(r, d, a, n, l, c), f === null)) return null;
			if (r = f, r.isMatch && i(r, !1)) return !0;
			if (!s && r.nfaStates.length === 0) return !1;
			l += u;
		}
		return r = this.stepOrReset(r, this.numClasses, ol, n, l, c), r === null ? null : r.isMatch && i(r, !0);
	}
	match(e, t, n) {
		if (this.failed) return null;
		if ((n === w.ANCHOR_START || n === w.ANCHOR_BOTH) && t !== 0) return !1;
		let r = this.start(e, t);
		return r === null ? null : this.run(e, t, n, r, (e, t) => n !== w.ANCHOR_BOTH || t);
	}
	matchSet(e, t, n) {
		if (this.failed) return null;
		if ((n === w.ANCHOR_START || n === w.ANCHOR_BOTH) && t !== 0) return [];
		let r = this.start(e, t);
		if (r === null) return null;
		let i = /* @__PURE__ */ new Set();
		return this.run(e, t, n, r, (e, t) => {
			if (n !== w.ANCHOR_BOTH || t) for (let t = 0; t < e.matchIDs.length; t++) i.add(e.matchIDs[t]);
			return !1;
		}) === null ? null : Array.from(i).sort((e, t) => e - t);
	}
}, ll = 32, ul = 500, dl = 256, fl = 262144, pl = class {
	constructor() {
		this.end = 0, this.cap = /* @__PURE__ */ new Int32Array(), this.matchcap = /* @__PURE__ */ new Int32Array(), this.ncap = 0, this.jobPc = new Int32Array(dl), this.jobArg = new Uint8Array(dl), this.jobPos = new Int32Array(dl), this.jobLen = 0, this.visited = /* @__PURE__ */ new Uint32Array();
	}
	reset(e, t, n) {
		this.end = t, this.jobLen = 0, this.ncap = n;
		let r = e.numInst() * (t + 1) + ll - 1 >>> 5;
		this.visited.length < r ? this.visited = new Uint32Array(r) : this.visited.fill(0, 0, r), this.cap.length < n ? this.cap = new Int32Array(n).fill(-1) : this.cap.fill(-1, 0, n), this.matchcap.length < n ? this.matchcap = new Int32Array(n).fill(-1) : this.matchcap.fill(-1, 0, n);
	}
	shouldVisit(e, t) {
		let n = e * (this.end + 1) + t, r = n >>> 5, i = 1 << (n & 31);
		return (this.visited[r] & i) === 0 && (this.visited[r] |= i, !0);
	}
	push(e, t, n, r) {
		if (e.prog.getInst(t).op !== M.FAIL && (r || this.shouldVisit(t, n))) {
			if (this.jobLen >= this.jobPc.length) {
				let e = this.jobPc.length * 2, t = new Int32Array(e);
				t.set(this.jobPc), this.jobPc = t;
				let n = new Uint8Array(e);
				n.set(this.jobArg), this.jobArg = n;
				let r = new Int32Array(e);
				r.set(this.jobPos), this.jobPos = r;
			}
			this.jobPc[this.jobLen] = t, this.jobArg[this.jobLen] = +!!r, this.jobPos[this.jobLen] = n, this.jobLen++;
		}
	}
	tryBacktrack(e, t, n, r, i) {
		let a = e.longest;
		for (this.push(e, n, r, !1); this.jobLen > 0;) {
			this.jobLen--;
			let n = this.jobPc[this.jobLen], r = this.jobArg[this.jobLen] === 1, o = this.jobPos[this.jobLen], s = !0;
			for (; !(!s && !this.shouldVisit(n, o));) {
				s = !1;
				let c = e.prog.getInst(n);
				switch (c.op) {
					case M.FAIL: throw new Qc("unexpected InstFail");
					case M.ALT:
						if (r) {
							r = !1, n = c.arg;
							continue;
						}
						this.push(e, n, o, !0), n = c.out;
						continue;
					case M.ALT_MATCH: {
						let t = e.prog.getInst(c.out);
						if (M.isRuneOp(t.op)) {
							this.push(e, c.arg, o, !1), n = c.arg, o = this.end;
							continue;
						}
						this.push(e, c.out, this.end, !1), n = c.out;
						continue;
					}
					case M.RUNE: {
						let e = t.step(o);
						if (e === Gc.EOF() || !c.matchRune(e >> 3)) break;
						o += e & 7, n = c.out;
						continue;
					}
					case M.RUNE1: {
						let e = t.step(o);
						if (e === Gc.EOF() || e >> 3 !== c.runes[0]) break;
						o += e & 7, n = c.out;
						continue;
					}
					case M.RUNE_ANY_NOT_NL: {
						let e = t.step(o);
						if (e === Gc.EOF() || e >> 3 == 10) break;
						o += e & 7, n = c.out;
						continue;
					}
					case M.RUNE_ANY: {
						let e = t.step(o);
						if (e === Gc.EOF()) break;
						o += e & 7, n = c.out;
						continue;
					}
					case M.CAPTURE:
						if (r) {
							this.cap[c.arg] = o;
							break;
						}
						c.arg < this.ncap && (this.push(e, n, this.cap[c.arg], !0), this.cap[c.arg] = o), n = c.out;
						continue;
					case M.EMPTY_WIDTH: {
						let e = t.context(o);
						if ((c.arg & ~e) !== 0) break;
						n = c.out;
						continue;
					}
					case M.NOP:
						n = c.out;
						continue;
					case M.MATCH: {
						if (i === w.ANCHOR_BOTH && o !== this.end) break;
						if (this.ncap === 0) return !0;
						this.ncap > 1 && (this.cap[1] = o);
						let e = this.matchcap[1];
						if ((e === -1 || a && o > 0 && o > e) && this.matchcap.set(this.cap), !a || o === this.end) return !0;
						break;
					}
					case M.LB_WRITE:
					case M.LB_CHECK: throw new Qc("Backtracker cannot evaluate Lookbehind instructions");
					default: throw new Qc("bad inst");
				}
				break;
			}
		}
		return a && this.matchcap.length > 1 && this.matchcap[1] >= 0;
	}
}, ml = [], hl = class e {
	static shouldBacktrack(e) {
		return e.numInst() <= ul;
	}
	static maxBitStateLen(t) {
		return e.shouldBacktrack(t) ? Math.floor(fl / t.numInst()) : 0;
	}
	static execute(e, t, n, r, i) {
		let a = e.cond;
		if (a === k.EMPTY_ALL || (r === w.ANCHOR_START || r === w.ANCHOR_BOTH) && n !== 0 || (a & k.EMPTY_BEGIN_TEXT) !== 0 && n !== 0) return null;
		let o = ml.length > 0 ? ml.pop() : new pl(), s = t.endPos();
		o.reset(e.prog, s, i);
		let c = !1;
		if ((a & k.EMPTY_BEGIN_TEXT) !== 0 || r === w.ANCHOR_START || r === w.ANCHOR_BOTH) o.ncap > 0 && (o.cap[0] = n), o.tryBacktrack(e, t, e.prog.start, n, r) && (c = !0);
		else {
			let i = -1;
			for (; n <= s && i !== 0; n += i) {
				if (e.prefix.length > 0) {
					let r = t.index(e, n);
					if (r < 0) break;
					n += r;
				}
				if (o.ncap > 0 && (o.cap[0] = n), o.tryBacktrack(e, t, e.prog.start, n, r)) {
					c = !0;
					break;
				}
				let a = t.step(n);
				i = a === Gc.EOF() ? 0 : a & 7;
			}
		}
		if (!c) return ml.push(o), null;
		let l = i === 0 ? [] : k.toArray(o.matchcap.subarray(0, i));
		return ml.push(o), l;
	}
}, gl = class {
	constructor(e) {
		this.sparse = new Uint32Array(e), this.dense = new Uint32Array(e), this.size = 0, this.nextIndex = 0;
	}
	empty() {
		return this.nextIndex >= this.size;
	}
	next() {
		return this.dense[this.nextIndex++];
	}
	clear() {
		this.size = 0, this.nextIndex = 0;
	}
	contains(e) {
		return e < this.sparse.length && this.sparse[e] < this.size && this.dense[this.sparse[e]] === e;
	}
	insert(e) {
		this.contains(e) || this.insertNew(e);
	}
	insertNew(e) {
		e >= this.sparse.length || (this.sparse[e] = this.size, this.dense[this.size] = e, this.size++);
	}
}, _l = (e, t, n, r) => {
	let i = e.length, a = t.length, o = 0, s = 0, c = [], l = [], u = !0, d = -1, f = (i) => {
		let a = i ? e : t, u = i ? o : s, f = i ? n : r;
		return d > 0 && a[u] <= c[d] ? !1 : (c.push(a[u], a[u + 1]), i ? o += 2 : s += 2, d += 2, l.push(f), !0);
	};
	for (; o < i || s < a;) if (u = s >= a ? f(!0) : o >= i || t[s] < e[o] ? f(!1) : f(!0), !u) return null;
	return {
		merged: c,
		next: l
	};
}, vl = class {
	constructor(e) {
		this.start = e.start, this.numCap = e.numCap, this.inst = Array(e.inst.length);
		for (let t = 0; t < e.inst.length; t++) {
			let n = e.inst[t], r = new M(n.op);
			r.out = n.out, r.arg = n.arg, r.runes = n.runes ? new Int32Array(n.runes) : /* @__PURE__ */ new Int32Array(), r.next = null, this.inst[t] = r;
		}
	}
}, yl = (e) => {
	let t = new vl(e);
	for (let e = 0; e < t.inst.length; e++) {
		let n = t.inst[e];
		if (n.op !== M.ALT && n.op !== M.ALT_MATCH) continue;
		let r = "out", i = "arg", a = t.inst[n[i]];
		if (a.op !== M.ALT && a.op !== M.ALT_MATCH && (r = "arg", i = "out", a = t.inst[n[i]], a.op !== M.ALT && a.op !== M.ALT_MATCH)) continue;
		let o = t.inst[n[r]];
		if (o.op === M.ALT || o.op === M.ALT_MATCH) continue;
		let s = "out", c = "arg", l = !1;
		a.out === e ? l = !0 : a.arg === e && (l = !0, s = "arg", c = "out"), l && (a[s] = n[r]), n[r] === a[s] && (n[i] = a[c]);
	}
	return t;
}, bl = (e) => {
	if (e.inst.length >= 1e3) return null;
	let t = new gl(e.inst.length), n = new gl(e.inst.length), r = Array(e.inst.length), i = Array(e.inst.length).fill(!1), a = (o) => {
		let s = !0, c = e.inst[o];
		if (n.contains(o)) return !0;
		switch (n.insert(o), c.op) {
			case M.ALT:
			case M.ALT_MATCH: {
				s = a(c.out) && a(c.arg);
				let e = i[c.out], t = i[c.arg];
				if (e && t) return !1;
				if (t) {
					let n = c.out;
					c.out = c.arg, c.arg = n;
					let r = e;
					e = t, t = r;
				}
				e && (i[o] = !0, c.op = M.ALT_MATCH);
				let n = _l(r[c.out] || [], r[c.arg] || [], c.out, c.arg);
				if (!n) return !1;
				r[o] = new Int32Array(n.merged), c.next = new Uint32Array(n.next);
				break;
			}
			case M.CAPTURE:
			case M.EMPTY_WIDTH:
			case M.NOP:
				s = a(c.out), i[o] = i[c.out], r[o] = r[c.out] ? new Int32Array(r[c.out]) : /* @__PURE__ */ new Int32Array(), c.next = new Uint32Array(Math.floor(r[o].length / 2) + 1).fill(c.out);
				break;
			case M.MATCH:
			case M.FAIL:
				i[o] = c.op === M.MATCH;
				break;
			case M.RUNE: {
				if (i[o] = !1, c.next && c.next.length > 0) break;
				if (t.insert(c.out), !c.runes || c.runes.length === 0) {
					r[o] = /* @__PURE__ */ new Int32Array(), c.next = new Uint32Array([c.out]);
					break;
				}
				let e = [];
				if (c.runes.length === 1 && (c.arg & w.FOLD_CASE) !== 0) {
					let t = c.runes[0];
					e.push(t, t);
					for (let n = O.simpleFold(t); n !== t; n = O.simpleFold(n)) e.push(n, n);
					e.sort((e, t) => e - t);
				} else for (let t = 0; t < c.runes.length; t++) e.push(c.runes[t]);
				r[o] = new Int32Array(e), c.next = new Uint32Array(Math.floor(e.length / 2) + 1).fill(c.out), c.op = M.RUNE;
				break;
			}
			case M.RUNE1: {
				if (i[o] = !1, c.next && c.next.length > 0) break;
				t.insert(c.out);
				let e = [];
				if ((c.arg & w.FOLD_CASE) !== 0) {
					let t = c.runes[0];
					e.push(t, t);
					for (let n = O.simpleFold(t); n !== t; n = O.simpleFold(n)) e.push(n, n);
					e.sort((e, t) => e - t);
				} else e.push(c.runes[0], c.runes[0]);
				r[o] = new Int32Array(e), c.next = new Uint32Array(Math.floor(e.length / 2) + 1).fill(c.out), c.op = M.RUNE;
				break;
			}
			case M.RUNE_ANY:
				if (i[o] = !1, c.next && c.next.length > 0) break;
				t.insert(c.out), r[o] = new Int32Array([0, O.MAX_RUNE]), c.next = new Uint32Array([c.out]);
				break;
			case M.RUNE_ANY_NOT_NL:
				if (i[o] = !1, c.next && c.next.length > 0) break;
				t.insert(c.out), r[o] = new Int32Array([
					0,
					9,
					11,
					O.MAX_RUNE
				]), c.next = new Uint32Array(Math.floor(r[o].length / 2) + 1).fill(c.out);
		}
		return s;
	};
	for (t.clear(), t.insert(e.start); !t.empty();) if (n.clear(), !a(t.next())) return null;
	for (let t = 0; t < e.inst.length; t++) r[t] && (e.inst[t].runes = r[t]);
	return e;
}, xl = (e, t) => {
	for (let n = 0; n < t.inst.length; n++) {
		let r = t.inst[n];
		switch (r.op) {
			case M.ALT:
			case M.ALT_MATCH:
			case M.RUNE: break;
			case M.CAPTURE:
			case M.EMPTY_WIDTH:
			case M.NOP:
			case M.MATCH:
			case M.FAIL:
				e.inst[n].next = null;
				break;
			case M.RUNE1:
			case M.RUNE_ANY:
			case M.RUNE_ANY_NOT_NL: e.inst[n].next = null, e.inst[n].op = r.op, e.inst[n].runes = r.runes ? new Int32Array(r.runes) : /* @__PURE__ */ new Int32Array();
		}
	}
}, Sl = class e {
	static compile(e) {
		if (e.start === 0 || e.numLb > 0) return null;
		let t = e.inst[e.start];
		if (t.op !== M.EMPTY_WIDTH || (t.arg & k.EMPTY_BEGIN_TEXT) === 0) return null;
		let n = !1;
		for (let t = 0; t < e.inst.length; t++) if (e.inst[t].op === M.ALT || e.inst[t].op === M.ALT_MATCH) {
			n = !0;
			break;
		}
		for (let t = 0; t < e.inst.length; t++) {
			let r = e.inst[t], i = e.inst[r.out].op;
			switch (r.op) {
				case M.ALT:
				case M.ALT_MATCH:
					if (i === M.MATCH || e.inst[r.arg].op === M.MATCH) return null;
					break;
				case M.EMPTY_WIDTH:
					if (i === M.MATCH) {
						if ((r.arg & k.EMPTY_END_TEXT) === k.EMPTY_END_TEXT) continue;
						return null;
					}
					break;
				default: if (i === M.MATCH && n) return null;
			}
		}
		let r = yl(e);
		return r = bl(r), r !== null && xl(r, e), r;
	}
	static next(e, t) {
		let n = e.matchRunePos(t);
		return n >= 0 ? e.next[n] : e.op === M.ALT_MATCH ? e.out : 0;
	}
	static execute(t, n, r, i, a) {
		let o = t.onepass;
		if (!o) return null;
		let s = new Int32Array(a).fill(-1), c = !1, l = n.step(r), u = l >> 3, d = l & 7, f = Gc.EOF(), p = -1, m = 0;
		l !== Gc.EOF() && (f = n.step(r + d), f !== Gc.EOF() && (p = f >> 3, m = f & 7));
		let h = r === 0 ? k.emptyOpContext(-1, u) : n.context(r), g = o.start, _;
		for (;;) {
			switch (_ = o.inst[g], g = _.out, _.op) {
				case M.MATCH: return i === w.ANCHOR_BOTH && r !== n.endPos() ? null : (c = !0, s.length > 0 && (s[0] = 0, s[1] = r), a === 0 ? [] : k.toArray(s));
				case M.RUNE:
					if (!_.matchRune(u)) return null;
					break;
				case M.RUNE1:
					if (u !== _.runes[0]) return null;
					break;
				case M.RUNE_ANY: break;
				case M.RUNE_ANY_NOT_NL:
					if (u === 10) return null;
					break;
				case M.ALT:
				case M.ALT_MATCH:
					g = e.next(_, u);
					continue;
				case M.FAIL: return null;
				case M.NOP: continue;
				case M.EMPTY_WIDTH:
					if ((_.arg & ~h) !== 0) return null;
					continue;
				case M.CAPTURE:
					_.arg < s.length && (s[_.arg] = r);
					continue;
				default: throw new Qc("bad inst");
			}
			if (d === 0) break;
			h = k.emptyOpContext(u, p), r += d, u = p, d = m, u !== -1 && (f = n.step(r + d), f === Gc.EOF() ? (p = -1, m = 0) : (p = f >> 3, m = f & 7));
		}
		return c ? a === 0 ? [] : k.toArray(s) : null;
	}
}, N = class e {
	static Op = Bc([
		"NO_MATCH",
		"EMPTY_MATCH",
		"LITERAL",
		"CHAR_CLASS",
		"ANY_CHAR_NOT_NL",
		"ANY_CHAR",
		"BEGIN_LINE",
		"END_LINE",
		"BEGIN_TEXT",
		"END_TEXT",
		"WORD_BOUNDARY",
		"NO_WORD_BOUNDARY",
		"CAPTURE",
		"STAR",
		"PLUS",
		"QUEST",
		"REPEAT",
		"CONCAT",
		"ALTERNATE",
		"PLB",
		"NLB",
		"LEFT_PAREN",
		"VERTICAL_BAR"
	]);
	static isPseudoOp(t) {
		return t >= e.Op.LEFT_PAREN;
	}
	static emptySubs() {
		return [];
	}
	static quoteIfHyphen(e) {
		return e === T.CODES.get("-") ? "\\" : "";
	}
	static fromRegexp(t) {
		let n = new e(t.op);
		return n.flags = t.flags, n.subs = t.subs, n.runes = t.runes, n.cap = t.cap, n.min = t.min, n.max = t.max, n.name = t.name, n.namedGroups = t.namedGroups, n.lb = t.lb, n;
	}
	constructor(t) {
		this.op = t, this.flags = 0, this.subs = e.emptySubs(), this.runes = /* @__PURE__ */ new Int32Array(), this.min = 0, this.max = 0, this.cap = 0, this.name = null, this.namedGroups = Object.create(null), this.lb = 0;
	}
	reinit() {
		this.flags = 0, this.subs = e.emptySubs(), this.runes = /* @__PURE__ */ new Int32Array(), this.cap = 0, this.min = 0, this.max = 0, this.name = null, this.namedGroups = Object.create(null), this.lb = 0;
	}
	toString() {
		return this.appendTo();
	}
	appendTo() {
		let t = "";
		switch (this.op) {
			case e.Op.NO_MATCH:
				t += "[^\\x00-\\x{10FFFF}]";
				break;
			case e.Op.EMPTY_MATCH:
				t += "(?:)";
				break;
			case e.Op.STAR:
			case e.Op.PLUS:
			case e.Op.QUEST:
			case e.Op.REPEAT: {
				let n = this.subs[0];
				switch (n.op > e.Op.CAPTURE || n.op === e.Op.LITERAL && n.runes.length > 1 ? t += `(?:${n.appendTo()})` : t += n.appendTo(), this.op) {
					case e.Op.STAR:
						t += "*";
						break;
					case e.Op.PLUS:
						t += "+";
						break;
					case e.Op.QUEST:
						t += "?";
						break;
					case e.Op.REPEAT: t += `{${this.min}`, this.min !== this.max && (t += ",", this.max >= 0 && (t += this.max)), t += "}";
				}
				(this.flags & w.NON_GREEDY) !== 0 && (t += "?");
				break;
			}
			case e.Op.CONCAT:
				for (let n of this.subs) n.op === e.Op.ALTERNATE ? t += `(?:${n.appendTo()})` : t += n.appendTo();
				break;
			case e.Op.ALTERNATE: {
				let e = "";
				for (let n of this.subs) t += e, e = "|", t += n.appendTo();
				break;
			}
			case e.Op.LITERAL:
				(this.flags & w.FOLD_CASE) !== 0 && (t += "(?i:");
				for (let e of this.runes) t += k.escapeRune(e);
				(this.flags & w.FOLD_CASE) !== 0 && (t += ")");
				break;
			case e.Op.ANY_CHAR_NOT_NL:
				t += "(?-s:.)";
				break;
			case e.Op.ANY_CHAR:
				t += "(?s:.)";
				break;
			case e.Op.PLB:
				t += `(?<=${this.subs[0].appendTo()})`;
				break;
			case e.Op.NLB:
				t += `(?<!${this.subs[0].appendTo()})`;
				break;
			case e.Op.CAPTURE:
				this.name === null || this.name.length === 0 ? t += "(" : t += `(?P<${this.name}>`, this.subs[0].op !== e.Op.EMPTY_MATCH && (t += this.subs[0].appendTo()), t += ")";
				break;
			case e.Op.BEGIN_TEXT:
				t += "\\A";
				break;
			case e.Op.END_TEXT:
				(this.flags & w.WAS_DOLLAR) === 0 ? t += "\\z" : t += "(?-m:$)";
				break;
			case e.Op.BEGIN_LINE:
				t += "^";
				break;
			case e.Op.END_LINE:
				t += "$";
				break;
			case e.Op.WORD_BOUNDARY:
				t += "\\b";
				break;
			case e.Op.NO_WORD_BOUNDARY:
				t += "\\B";
				break;
			case e.Op.CHAR_CLASS:
				if (this.runes.length % 2 != 0) {
					t += "[invalid char class]";
					break;
				}
				if (t += "[", this.runes.length === 0) t += "^\\x00-\\x{10FFFF}";
				else if (this.runes[0] === 0 && this.runes[this.runes.length - 1] === O.MAX_RUNE) {
					t += "^";
					for (let n = 1; n < this.runes.length - 1; n += 2) {
						let r = this.runes[n] + 1, i = this.runes[n + 1] - 1;
						t += e.quoteIfHyphen(r), t += k.escapeRune(r), r !== i && (t += "-", t += e.quoteIfHyphen(i), t += k.escapeRune(i));
					}
				} else for (let n = 0; n < this.runes.length; n += 2) {
					let r = this.runes[n], i = this.runes[n + 1];
					t += e.quoteIfHyphen(r), t += k.escapeRune(r), r !== i && (t += "-", t += e.quoteIfHyphen(i), t += k.escapeRune(i));
				}
				t += "]";
				break;
			default: t += this.op;
		}
		return t;
	}
	maxCap() {
		let t = 0;
		if (this.op === e.Op.CAPTURE && (t = this.cap), this.subs !== null) for (let e of this.subs) {
			let n = e.maxCap();
			t < n && (t = n);
		}
		return t;
	}
	equals(t) {
		if (!(t !== null && t instanceof e) || this.op !== t.op) return !1;
		switch (this.op) {
			case e.Op.END_TEXT:
				if ((this.flags & w.WAS_DOLLAR) !== (t.flags & w.WAS_DOLLAR)) return !1;
				break;
			case e.Op.LITERAL:
			case e.Op.CHAR_CLASS:
				if ((this.flags & w.FOLD_CASE) !== (t.flags & w.FOLD_CASE)) return !1;
				if (this.runes === null && t.runes === null) break;
				if (this.runes === null || t.runes === null || this.runes.length !== t.runes.length) return !1;
				for (let e = 0; e < this.runes.length; e++) if (this.runes[e] !== t.runes[e]) return !1;
				break;
			case e.Op.ALTERNATE:
			case e.Op.CONCAT:
				if (this.subs.length !== t.subs.length) return !1;
				for (let e = 0; e < this.subs.length; ++e) if (!this.subs[e].equals(t.subs[e])) return !1;
				break;
			case e.Op.STAR:
			case e.Op.PLUS:
			case e.Op.QUEST:
				if ((this.flags & w.NON_GREEDY) !== (t.flags & w.NON_GREEDY) || !this.subs[0].equals(t.subs[0])) return !1;
				break;
			case e.Op.REPEAT:
				if ((this.flags & w.NON_GREEDY) !== (t.flags & w.NON_GREEDY) || this.min !== t.min || this.max !== t.max || !this.subs[0].equals(t.subs[0])) return !1;
				break;
			case e.Op.CAPTURE:
				if (this.cap !== t.cap || (this.name === null ? t.name !== null : this.name !== t.name) || !this.subs[0].equals(t.subs[0])) return !1;
				break;
			case e.Op.PLB:
			case e.Op.NLB: if (this.lb !== t.lb || !this.subs[0].equals(t.subs[0])) return !1;
		}
		return !0;
	}
}, Cl = class {
	static walk(e, t) {
		let n = [], r = e, i;
		for (;;) {
			if (r.subs.length === 0) i = t.leaf(r);
			else {
				let e = t.enter(r);
				if (e.result === void 0) {
					n.push({
						re: r,
						state: e,
						i: 0
					}), r = r.subs[0];
					continue;
				}
				i = e.result;
			}
			for (;;) {
				if (n.length === 0) return i;
				let e = n[n.length - 1];
				if (t.child(e.re, e.state, i, e.i), e.i++, e.state.result === void 0 && e.i < e.re.subs.length) {
					r = e.re.subs[e.i];
					break;
				}
				n.pop(), i = e.state.result === void 0 ? t.leave(e.re, e.state) : e.state.result;
			}
		}
	}
}, wl = class {
	constructor(e, t) {
		let n = /* @__PURE__ */ new Map(), r = [0], i = [0], a = [0], o = [0];
		for (let s of e) {
			let e = 0;
			for (let c = 0; c < s.length; c++) {
				let l = e * t + s[c], u = n.get(l);
				u === void 0 && (u = r.length, n.set(l, u), r.push(e), i.push(s[c]), a.push(a[e] + 1), o.push(0)), e = u;
			}
			o[e] = 1;
		}
		let s = r.length, c = new Int32Array(s - 1);
		for (let e = 1; e < s; e++) c[e - 1] = e;
		c.sort((e, t) => r[e] - r[t] || i[e] - i[t]);
		let l = new Int32Array(s + 1);
		for (let e = 1; e < s; e++) l[r[e] + 1]++;
		for (let e = 0; e < s; e++) l[e + 1] += l[e];
		let u = new Int32Array(s - 1);
		for (let e = 0; e < c.length; e++) u[e] = i[c[e]];
		this.childStart = l, this.childUnit = u, this.childNode = c;
		let d = new Int32Array(s);
		for (let e = 0; e < s; e++) d[e] = e;
		d.sort((e, t) => a[e] - a[t]);
		let f = new Int32Array(s), p = Uint8Array.from(o);
		for (let e = 1; e < s; e++) {
			let t = d[e], n = r[t];
			if (n !== 0) {
				let e = f[n], r = this.next(e, i[t]);
				for (; r < 0 && e !== 0;) e = f[e], r = this.next(e, i[t]);
				f[t] = r >= 0 ? r : 0;
			}
			p[t] |= p[f[t]];
		}
		this.fail = f, this.match = p;
	}
	next(e, t) {
		let n = this.childStart[e], r = this.childStart[e + 1], i = this.childUnit;
		for (; n < r;) {
			let e = n + r >> 1, a = i[e];
			if (a === t) return this.childNode[e];
			a < t ? n = e + 1 : r = e;
		}
		return -1;
	}
	advance(e, t) {
		for (;;) {
			let n = this.next(e, t);
			if (n >= 0) return n;
			if (e === 0) return 0;
			e = this.fail[e];
		}
	}
	searchUTF16(e, t, n) {
		let r = 0;
		for (let i = t; i < n; i++) if (r = this.advance(r, e.charCodeAt(i)), this.match[r] === 1) return !0;
		return !1;
	}
	searchUTF8(e, t, n) {
		let r = 0;
		for (let i = t; i < n; i++) if (r = this.advance(r, e[i]), this.match[r] === 1) return !0;
		return !1;
	}
}, P = class e {
	static Type = {
		NONE: 0,
		EXACT: 1,
		AND: 2,
		OR: 3
	};
	static MAX_SCANS = 32;
	static MAX_AC_UNITS = 1 << 18;
	constructor(t) {
		this.type = t, this.subs = [], this.str = "", this.bytes = null, this.cost = +(t === e.Type.EXACT), this.allExact = !1, this.ac16 = null, this.ac8 = null;
	}
	automaton16() {
		if (this.ac16 === null) {
			let e = this.subs.map((e) => {
				let t = Array(e.str.length);
				for (let n = 0; n < e.str.length; n++) t[n] = e.str.charCodeAt(n);
				return t;
			});
			this.ac16 = new wl(e, 65536);
		}
		return this.ac16;
	}
	automaton8() {
		return this.ac8 === null && (this.ac8 = new wl(this.subs.map((e) => e.bytes), 256)), this.ac8;
	}
	eval(t, n) {
		switch (this.type) {
			case e.Type.NONE: return !0;
			case e.Type.EXACT: return t.hasString(this, n);
			case e.Type.AND:
				for (let e = 0; e < this.subs.length; e++) if (!this.subs[e].eval(t, n)) return !1;
				return !0;
			case e.Type.OR:
				if (this.allExact) return t.hasAnyString(this, n);
				for (let e = 0; e < this.subs.length; e++) if (this.subs[e].eval(t, n)) return !0;
				return !1;
			default: return !0;
		}
	}
}, Tl = class e {
	static build(t) {
		return t ? Cl.walk(t, e.WALKER) : new P(P.Type.NONE);
	}
	static WALKER = {
		leaf: (t) => e.leaf(t),
		enter: (t) => e.enter(t),
		child: (t, n, r) => e.child(t, n, r),
		leave: (t, n) => e.leave(t, n)
	};
	static leaf(e) {
		if (e.op !== N.Op.LITERAL || e.runes.length === 0 || (e.flags & w.FOLD_CASE) !== 0) return new P(P.Type.NONE);
		let t = "";
		for (let n = 0; n < e.runes.length; n++) {
			if (O.isUnsearchable(e.runes[n])) return new P(P.Type.NONE);
			t += String.fromCodePoint(e.runes[n]);
		}
		let n = new P(P.Type.EXACT);
		return n.str = t, n.bytes = k.stringToUtf8ByteArray(n.str), n;
	}
	static enter(e) {
		switch (e.op) {
			case N.Op.CAPTURE:
			case N.Op.PLUS: return { sub: null };
			case N.Op.REPEAT: return e.min >= 1 ? { sub: null } : { result: new P(P.Type.NONE) };
			case N.Op.CONCAT: return {
				pf: new P(P.Type.AND),
				subs: []
			};
			case N.Op.ALTERNATE: return {
				pf: new P(P.Type.OR),
				subs: []
			};
			default: return { result: new P(P.Type.NONE) };
		}
	}
	static child(e, t, n) {
		if (t.subs === void 0) {
			t.sub = n;
			return;
		}
		if (t.pf.type === P.Type.AND) {
			if (n.type === P.Type.NONE) return;
			if (n.type === P.Type.AND) {
				for (let e = 0; e < n.subs.length; e++) t.subs.push(n.subs[e]);
				return;
			}
			t.subs.push(n);
			return;
		}
		if (n.type === P.Type.NONE) {
			t.result = new P(P.Type.NONE);
			return;
		}
		if (n.type === P.Type.OR) {
			for (let e = 0; e < n.subs.length; e++) t.subs.push(n.subs[e]);
			return;
		}
		t.subs.push(n);
	}
	static leave(e, t) {
		if (t.subs === void 0) return t.sub;
		let n = t.pf, r = /* @__PURE__ */ new Set(), i = [];
		for (let e of t.subs) {
			if (e.type === P.Type.EXACT) {
				if (r.has(e.str)) continue;
				r.add(e.str);
			}
			i.push(e);
		}
		if (n.type === P.Type.AND) {
			let e = [], t = 0;
			for (let n of i) t + n.cost > P.MAX_SCANS || (e.push(n), t += n.cost);
			return e.length === 0 ? new P(P.Type.NONE) : e.length === 1 ? e[0] : (n.subs = e, n.cost = t, n);
		}
		if (i.length === 0) return new P(P.Type.NONE);
		if (i.length === 1) return i[0];
		n.subs = i;
		let a = !0, o = 0, s = 0;
		for (let e of i) e.type === P.Type.EXACT ? s += e.bytes.length : a = !1, o += e.cost;
		return a ? s > P.MAX_AC_UNITS ? new P(P.Type.NONE) : (n.allExact = !0, n.cost = 1, n) : o > P.MAX_SCANS ? new P(P.Type.NONE) : (n.cost = o, n);
	}
}, El = class {
	constructor(e = 0, t = 0) {
		this.head = e, this.tail = t;
	}
}, Dl = class {
	constructor() {
		this.inst = [], this.start = 0, this.numCap = 2, this.lbStarts = [], this.numLb = 0, this.lbInst = null;
	}
	getInst(e) {
		return this.inst[e];
	}
	numInst() {
		return this.inst.length;
	}
	addInst(e) {
		this.inst.push(new M(e));
	}
	markLookbehindInsts() {
		let e = new Uint8Array(this.inst.length), t = this.lbStarts.slice();
		for (; t.length > 0;) {
			let n = t.pop();
			if (n === 0 || e[n] === 1) continue;
			e[n] = 1;
			let r = this.inst[n];
			switch (r.op) {
				case M.ALT:
				case M.ALT_MATCH:
					t.push(r.out, r.arg);
					break;
				case M.MATCH:
				case M.FAIL: break;
				default: t.push(r.out);
			}
		}
		this.lbInst = e;
	}
	skipNop(e) {
		let t = this.inst[e];
		for (; t.op === M.NOP || t.op === M.CAPTURE;) t = this.inst[e], e = t.out;
		return t;
	}
	prefix() {
		let e = "", t = this.skipNop(this.start);
		if (!M.isRuneOp(t.op) || t.runes.length !== 1) return [t.op === M.MATCH, e];
		for (; M.isRuneOp(t.op) && t.runes.length === 1 && (t.arg & w.FOLD_CASE) === 0 && !O.isUnsearchable(t.runes[0]);) e += String.fromCodePoint(t.runes[0]), t = this.skipNop(t.out);
		return [t.op === M.MATCH, e];
	}
	startCond() {
		let e = 0, t = this.start;
		loop: for (;;) {
			let n = this.inst[t];
			switch (n.op) {
				case M.EMPTY_WIDTH:
					e |= n.arg;
					break;
				case M.FAIL: return -1;
				case M.CAPTURE:
				case M.NOP: break;
				default: break loop;
			}
			t = n.out;
		}
		return e;
	}
	patch(e, t) {
		let n = e.head;
		for (; n !== 0;) {
			let e = this.inst[n >> 1];
			n & 1 ? (n = e.arg, e.arg = t) : (n = e.out, e.out = t);
		}
	}
	append(e, t) {
		if (e.head === 0) return t;
		if (t.head === 0) return e;
		let n = this.inst[e.tail >> 1];
		return e.tail & 1 ? n.arg = t.head : n.out = t.head, new El(e.head, t.tail);
	}
	toString() {
		let e = "";
		for (let t = 0; t < this.inst.length; t++) {
			let n = e.length;
			e += t, t === this.start && (e += "*"), e += "        ".substring(e.length - n), e += this.inst[t], e += "\n";
		}
		return e;
	}
}, Ol = new Int32Array([
	0,
	T.CODES.get("\n") - 1,
	T.CODES.get("\n") + 1,
	O.MAX_RUNE
]), kl = new Int32Array([0, O.MAX_RUNE]), Al = class {
	constructor(e = 0, t = new El(), n = !1) {
		this.i = e, this.out = t, this.nullable = n;
	}
}, jl = class e {
	static compileRegexp(t) {
		let n = new e(), r = n.compile(t);
		return n.prog.patch(r.out, n.newInst(M.MATCH).i), n.prog.start = r.i, n.prog.markLookbehindInsts(), n.prog;
	}
	static compileSet(t) {
		let n = new e();
		if (t.length === 0) return n.prog.start = n.newInst(M.FAIL).i, n.prog.markLookbehindInsts(), n.prog;
		let r = [];
		for (let e = 0; e < t.length; e++) {
			let i = n.compile(t[e]), a = n.newInst(M.MATCH);
			n.prog.getInst(a.i).arg = e, n.prog.patch(i.out, a.i), r.push(i.i);
		}
		let i = r[0];
		for (let e = 1; e < r.length; e++) {
			let t = n.newInst(M.ALT), a = n.prog.getInst(t.i);
			a.out = i, a.arg = r[e], i = t.i;
		}
		return n.prog.start = i, n.prog.markLookbehindInsts(), n.prog;
	}
	constructor() {
		this.prog = new Dl(), this.newInst(M.FAIL), this.runeCache = /* @__PURE__ */ new Map(), this.walker = {
			leaf: (e) => this.leaf(e),
			enter: (e) => this.enter(e),
			child: (e, t, n) => this.child(e, t, n),
			leave: (e, t) => this.leave(e, t)
		};
	}
	newInst(e) {
		return this.prog.addInst(e), new Al(this.prog.numInst() - 1, new El(), !0);
	}
	nop() {
		let e = this.newInst(M.NOP);
		return e.out = new El(e.i << 1, e.i << 1), e;
	}
	fail() {
		return new Al();
	}
	cap(e) {
		let t = this.newInst(M.CAPTURE);
		return t.out = new El(t.i << 1, t.i << 1), this.prog.getInst(t.i).arg = e, this.prog.numCap < e + 1 && (this.prog.numCap = e + 1), t;
	}
	cat(e, t) {
		return e.i === 0 || t.i === 0 ? this.fail() : (this.prog.patch(e.out, t.i), new Al(e.i, t.out, e.nullable && t.nullable));
	}
	alt(e, t) {
		if (e.i === 0) return t;
		if (t.i === 0) return e;
		let n = this.newInst(M.ALT), r = this.prog.getInst(n.i);
		return r.out = e.i, r.arg = t.i, n.out = this.prog.append(e.out, t.out), n.nullable = e.nullable || t.nullable, n;
	}
	loop(e, t) {
		let n = this.newInst(M.ALT), r = this.prog.getInst(n.i);
		return t ? (r.arg = e.i, n.out = new El(n.i << 1, n.i << 1)) : (r.out = e.i, n.out = new El(n.i << 1 | 1, n.i << 1 | 1)), this.prog.patch(e.out, n.i), n;
	}
	quest(e, t) {
		let n = this.newInst(M.ALT), r = this.prog.getInst(n.i);
		return t ? (r.arg = e.i, n.out = new El(n.i << 1, n.i << 1)) : (r.out = e.i, n.out = new El(n.i << 1 | 1, n.i << 1 | 1)), n.out = this.prog.append(n.out, e.out), n;
	}
	star(e, t) {
		return e.nullable ? this.quest(this.plus(e, t), t) : this.loop(e, t);
	}
	plus(e, t) {
		return new Al(e.i, this.loop(e, t).out, e.nullable);
	}
	empty(e) {
		let t = this.newInst(M.EMPTY_WIDTH);
		return this.prog.getInst(t.i).arg = e, t.out = new El(t.i << 1, t.i << 1), t;
	}
	rune(e, t) {
		let n = this.newInst(M.RUNE);
		n.nullable = !1;
		let r = this.prog.getInst(n.i);
		return r.runes = e, t &= w.FOLD_CASE, (e.length !== 1 || O.simpleFold(e[0]) === e[0]) && (t &= ~w.FOLD_CASE), r.arg = t, n.out = new El(n.i << 1, n.i << 1), (t & w.FOLD_CASE) === 0 && e.length === 1 || e.length === 2 && e[0] === e[1] ? r.op = M.RUNE1 : e.length === 2 && e[0] === 0 && e[1] === O.MAX_RUNE ? r.op = M.RUNE_ANY : e.length === 4 && e[0] === 0 && e[1] === T.CODES.get("\n") - 1 && e[2] === T.CODES.get("\n") + 1 && e[3] === O.MAX_RUNE && (r.op = M.RUNE_ANY_NOT_NL), n;
	}
	lookBehind(e, t) {
		let n = this.newInst(M.LB_WRITE);
		this.prog.getInst(n.i).arg = t;
		let r = this.rune(kl, 0), i = this.star(r, !0), a = this.cat(i, e);
		this.prog.patch(a.out, n.i);
		let o = this.newInst(M.LB_CHECK);
		return this.prog.getInst(o.i).arg = t, this.prog.lbStarts.push(a.i), Math.abs(t) > this.prog.numLb && (this.prog.numLb = Math.abs(t)), o.out = new El(o.i << 1, o.i << 1), o;
	}
	compile(e) {
		return Cl.walk(e, this.walker);
	}
	leaf(e) {
		switch (e.op) {
			case N.Op.NO_MATCH: return this.fail();
			case N.Op.EMPTY_MATCH: return this.nop();
			case N.Op.LITERAL: {
				if (e.runes.length === 0) return this.nop();
				let t = null;
				for (let n of e.runes) {
					let r = this.runeCache.get(n);
					r === void 0 && (r = new Int32Array([n]), this.runeCache.set(n, r));
					let i = this.rune(r, e.flags);
					t = t === null ? i : this.cat(t, i);
				}
				return t;
			}
			case N.Op.CHAR_CLASS: return this.rune(e.runes, e.flags);
			case N.Op.ANY_CHAR_NOT_NL: return this.rune(Ol, 0);
			case N.Op.ANY_CHAR: return this.rune(kl, 0);
			case N.Op.BEGIN_LINE: return this.empty(k.EMPTY_BEGIN_LINE);
			case N.Op.END_LINE: return this.empty(k.EMPTY_END_LINE);
			case N.Op.BEGIN_TEXT: return this.empty(k.EMPTY_BEGIN_TEXT);
			case N.Op.END_TEXT: return this.empty(k.EMPTY_END_TEXT);
			case N.Op.WORD_BOUNDARY: return this.empty(k.EMPTY_WORD_BOUNDARY);
			case N.Op.NO_WORD_BOUNDARY: return this.empty(k.EMPTY_NO_WORD_BOUNDARY);
			case N.Op.CONCAT:
			case N.Op.ALTERNATE: return this.nop();
			default: throw new Yc("regexp: unhandled case in compile");
		}
	}
	enter(e) {
		switch (e.op) {
			case N.Op.PLB:
			case N.Op.NLB:
			case N.Op.STAR:
			case N.Op.PLUS:
			case N.Op.QUEST: return { sub: null };
			case N.Op.CAPTURE: return {
				bra: this.cap(e.cap << 1),
				sub: null
			};
			case N.Op.CONCAT:
			case N.Op.ALTERNATE: return { f: null };
			default: throw new Yc("regexp: unhandled case in compile");
		}
	}
	child(e, t, n) {
		e.op === N.Op.CONCAT ? t.f = t.f === null ? n : this.cat(t.f, n) : e.op === N.Op.ALTERNATE ? t.f = t.f === null ? n : this.alt(t.f, n) : t.sub = n;
	}
	leave(e, t) {
		switch (e.op) {
			case N.Op.PLB:
			case N.Op.NLB: return this.lookBehind(t.sub, e.lb);
			case N.Op.CAPTURE: {
				let n = this.cap(e.cap << 1 | 1);
				return this.cat(this.cat(t.bra, t.sub), n);
			}
			case N.Op.STAR: return this.star(t.sub, (e.flags & w.NON_GREEDY) !== 0);
			case N.Op.PLUS: return this.plus(t.sub, (e.flags & w.NON_GREEDY) !== 0);
			case N.Op.QUEST: return this.quest(t.sub, (e.flags & w.NON_GREEDY) !== 0);
			case N.Op.CONCAT:
			case N.Op.ALTERNATE: return t.f;
			default: throw new Yc("regexp: unhandled case in compile");
		}
	}
}, Ml = class e {
	static simplify(t) {
		return t === null ? null : Cl.walk(t, e.WALKER);
	}
	static WALKER = {
		leaf: (t) => e.leaf(t),
		enter: (t) => e.enter(t),
		child: (t, n, r, i) => e.child(t, n, r, i),
		leave: (t, n) => e.leave(t, n)
	};
	static leaf(e) {
		if (e.op === N.Op.CHAR_CLASS) {
			if (e.runes === null) return e;
			if (e.runes.length === 0) return new N(N.Op.NO_MATCH);
			if (e.runes.length === 2 && e.runes[0] === 0 && e.runes[1] === O.MAX_RUNE) return new N(N.Op.ANY_CHAR);
			if (e.runes.length === 4 && e.runes[0] === 0 && e.runes[1] === T.CODES.get("\n") - 1 && e.runes[2] === T.CODES.get("\n") + 1 && e.runes[3] === O.MAX_RUNE) return new N(N.Op.ANY_CHAR_NOT_NL);
		}
		return e;
	}
	static enter(e) {
		switch (e.op) {
			case N.Op.PLB:
			case N.Op.NLB:
			case N.Op.CAPTURE:
			case N.Op.STAR:
			case N.Op.PLUS:
			case N.Op.QUEST: return { sub: null };
			case N.Op.CONCAT:
			case N.Op.ALTERNATE: return {
				subs: [],
				changed: !1
			};
			case N.Op.REPEAT: return e.min === 0 && e.max === 0 ? { result: new N(N.Op.EMPTY_MATCH) } : { sub: null };
			default: return { result: e };
		}
	}
	static child(e, t, n, r) {
		if (t.subs === void 0) {
			t.sub = n;
			return;
		}
		if (n !== e.subs[r] && (t.changed = !0), e.op === N.Op.CONCAT) {
			if (n.op === N.Op.NO_MATCH) {
				t.result = new N(N.Op.NO_MATCH);
				return;
			}
			if (n.op === N.Op.EMPTY_MATCH) {
				t.changed = !0;
				return;
			}
			if (n.op === N.Op.CONCAT) {
				t.changed = !0;
				for (let e = 0; e < n.subs.length; e++) t.subs.push(n.subs[e]);
				return;
			}
		} else {
			if (n.op === N.Op.NO_MATCH) {
				t.changed = !0;
				return;
			}
			if (n.op === N.Op.ALTERNATE) {
				t.changed = !0;
				for (let e = 0; e < n.subs.length; e++) t.subs.push(n.subs[e]);
				return;
			}
		}
		t.subs.push(n);
	}
	static leave(t, n) {
		switch (t.op) {
			case N.Op.PLB:
			case N.Op.NLB:
			case N.Op.CAPTURE: {
				let e = n.sub;
				if (e !== t.subs[0]) {
					let n = N.fromRegexp(t);
					return n.runes = /* @__PURE__ */ new Int32Array(), n.subs = [e], n;
				}
				return t;
			}
			case N.Op.CONCAT:
			case N.Op.ALTERNATE:
				if (n.changed) {
					let e = n.subs;
					if (e.length === 0) return new N(t.op === N.Op.CONCAT ? N.Op.EMPTY_MATCH : N.Op.NO_MATCH);
					if (e.length === 1) return e[0];
					let r = N.fromRegexp(t);
					return r.runes = /* @__PURE__ */ new Int32Array(), r.subs = e, r;
				}
				return t;
			case N.Op.STAR:
			case N.Op.PLUS:
			case N.Op.QUEST: return e.simplify1(t.op, t.flags, n.sub, t);
			case N.Op.REPEAT: return e.simplifyRepeat(t, n.sub);
			default: return t;
		}
	}
	static simplifyRepeat(t, n) {
		if (t.max === -1) {
			if (t.min === 0) return e.simplify1(N.Op.STAR, t.flags, n, null);
			if (t.min === 1) return e.simplify1(N.Op.PLUS, t.flags, n, null);
			let r = [];
			for (let e = 0; e < t.min - 1; e++) r.push(n);
			return r.push(e.simplify1(N.Op.PLUS, t.flags, n, null)), e.concat(r);
		}
		if (t.min === 1 && t.max === 1) return n;
		let r = null;
		if (t.min > 0) {
			r = [];
			for (let e = 0; e < t.min; e++) r.push(n);
		}
		if (t.max > t.min) {
			let i = e.simplify1(N.Op.QUEST, t.flags, n, null);
			for (let r = t.min + 1; r < t.max; r++) i = e.simplify1(N.Op.QUEST, t.flags, e.concat([n, i]), null);
			if (r === null) return i;
			r.push(i);
		}
		return r === null ? new N(N.Op.NO_MATCH) : e.concat(r);
	}
	static concat(e) {
		let t = [];
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (r.op === N.Op.NO_MATCH) return new N(N.Op.NO_MATCH);
			if (r.op !== N.Op.EMPTY_MATCH) {
				if (r.op === N.Op.CONCAT) {
					for (let e = 0; e < r.subs.length; e++) t.push(r.subs[e]);
					continue;
				}
				t.push(r);
			}
		}
		if (t.length === 0) return new N(N.Op.EMPTY_MATCH);
		if (t.length === 1) return t[0];
		let n = new N(N.Op.CONCAT);
		return n.subs = t, n;
	}
	static simplify1(e, t, n, r) {
		if (n.op === N.Op.EMPTY_MATCH) return n;
		if (n.op === N.Op.NO_MATCH) return e === N.Op.PLUS ? n : new N(N.Op.EMPTY_MATCH);
		if (e === n.op && (t & w.NON_GREEDY) === (n.flags & w.NON_GREEDY)) return n;
		if (r !== null && r.op === e && (r.flags & w.NON_GREEDY) === (t & w.NON_GREEDY) && n === r.subs[0]) return r;
		let i = new N(e);
		return i.flags = t, i.subs = [n], i;
	}
}, F = class {
	constructor(e, t) {
		this.sign = e, this.cls = t;
	}
}, Nl = [48, 57], Pl = [
	9,
	10,
	12,
	13,
	32,
	32
], Fl = [
	48,
	57,
	65,
	90,
	95,
	95,
	97,
	122
], Il = /* @__PURE__ */ new Map([
	["\\d", new F(1, Nl)],
	["\\D", new F(-1, Nl)],
	["\\s", new F(1, Pl)],
	["\\S", new F(-1, Pl)],
	["\\w", new F(1, Fl)],
	["\\W", new F(-1, Fl)]
]), Ll = [
	48,
	57,
	65,
	90,
	97,
	122
], Rl = [
	65,
	90,
	97,
	122
], zl = [0, 127], Bl = [
	9,
	9,
	32,
	32
], Vl = [
	0,
	31,
	127,
	127
], Hl = [48, 57], Ul = [33, 126], Wl = [97, 122], Gl = [32, 126], Kl = [
	33,
	47,
	58,
	64,
	91,
	96,
	123,
	126
], ql = [
	9,
	13,
	32,
	32
], Jl = [65, 90], Yl = [
	48,
	57,
	65,
	90,
	95,
	95,
	97,
	122
], Xl = [
	48,
	57,
	65,
	70,
	97,
	102
], Zl = /* @__PURE__ */ new Map([
	["[:alnum:]", new F(1, Ll)],
	["[:^alnum:]", new F(-1, Ll)],
	["[:alpha:]", new F(1, Rl)],
	["[:^alpha:]", new F(-1, Rl)],
	["[:ascii:]", new F(1, zl)],
	["[:^ascii:]", new F(-1, zl)],
	["[:blank:]", new F(1, Bl)],
	["[:^blank:]", new F(-1, Bl)],
	["[:cntrl:]", new F(1, Vl)],
	["[:^cntrl:]", new F(-1, Vl)],
	["[:digit:]", new F(1, Hl)],
	["[:^digit:]", new F(-1, Hl)],
	["[:graph:]", new F(1, Ul)],
	["[:^graph:]", new F(-1, Ul)],
	["[:lower:]", new F(1, Wl)],
	["[:^lower:]", new F(-1, Wl)],
	["[:print:]", new F(1, Gl)],
	["[:^print:]", new F(-1, Gl)],
	["[:punct:]", new F(1, Kl)],
	["[:^punct:]", new F(-1, Kl)],
	["[:space:]", new F(1, ql)],
	["[:^space:]", new F(-1, ql)],
	["[:upper:]", new F(1, Jl)],
	["[:^upper:]", new F(-1, Jl)],
	["[:word:]", new F(1, Yl)],
	["[:^word:]", new F(-1, Yl)],
	["[:xdigit:]", new F(1, Xl)],
	["[:^xdigit:]", new F(-1, Xl)]
]), Ql = class e {
	static charClassToString(e, t) {
		let n = "[";
		for (let r = 0; r < t; r += 2) {
			r > 0 && (n += " ");
			let t = e[r], i = e[r + 1];
			n += t === i ? `0x${t.toString(16)}` : `0x${t.toString(16)}-0x${i.toString(16)}`;
		}
		return n += "]", n;
	}
	static sortRanges(e, t) {
		let n = t >> 1, r = Array(n);
		for (let e = 0; e < n; e++) r[e] = e;
		r.sort((t, n) => e[2 * t] - e[2 * n] || e[2 * n + 1] - e[2 * t + 1]);
		let i = e.slice(0, t);
		for (let t = 0; t < n; t++) e[2 * t] = i[2 * r[t]], e[2 * t + 1] = i[2 * r[t] + 1];
	}
	constructor(e = k.emptyInts()) {
		this.r = e, this.len = e.length;
	}
	toArray() {
		return this.r instanceof Int32Array ? this.len === this.r.length ? this.r : this.r.subarray(0, this.len) : new Int32Array(this.len === this.r.length ? this.r : this.r.slice(0, this.len));
	}
	toGrowableArray() {
		return Array.isArray(this.r) ? (this.r.length = this.len, this.r) : Array.from(this.r.subarray(0, this.len));
	}
	cleanClass() {
		if (this.len < 4) return this;
		e.sortRanges(this.r, this.len);
		let t = 2;
		for (let e = 2; e < this.len; e += 2) {
			let n = this.r[e], r = this.r[e + 1];
			if (n <= this.r[t - 1] + 1) {
				r > this.r[t - 1] && (this.r[t - 1] = r);
				continue;
			}
			this.r[t] = n, this.r[t + 1] = r, t += 2;
		}
		return this.len = t, this;
	}
	appendLiteral(e, t) {
		return (t & w.FOLD_CASE) === 0 ? this.appendRange(e, e) : this.appendFoldedRange(e, e);
	}
	appendRange(e, t) {
		if (this.len > 0) {
			for (let n = 2; n <= 4; n += 2) if (this.len >= n) {
				let r = this.r[this.len - n], i = this.r[this.len - n + 1];
				if (e <= i + 1 && r <= t + 1) return e < r && (this.r[this.len - n] = e), t > i && (this.r[this.len - n + 1] = t), this;
			}
		}
		return this.r[this.len++] = e, this.r[this.len++] = t, this;
	}
	appendFoldedRange(e, t) {
		if (e <= O.MIN_FOLD && t >= O.MAX_FOLD || t < O.MIN_FOLD || e > O.MAX_FOLD) return this.appendRange(e, t);
		e < O.MIN_FOLD && (this.appendRange(e, O.MIN_FOLD - 1), e = O.MIN_FOLD), t > O.MAX_FOLD && (this.appendRange(O.MAX_FOLD + 1, t), t = O.MAX_FOLD);
		for (let n = e; n <= t; n++) {
			this.appendRange(n, n);
			for (let e = O.simpleFold(n); e !== n; e = O.simpleFold(e)) this.appendRange(e, e);
		}
		return this;
	}
	appendClass(e) {
		for (let t = 0; t < e.length; t += 2) this.appendRange(e[t], e[t + 1]);
		return this;
	}
	appendFoldedClass(e) {
		for (let t = 0; t < e.length; t += 2) this.appendFoldedRange(e[t], e[t + 1]);
		return this;
	}
	appendNegatedClass(e) {
		let t = 0;
		for (let n = 0; n < e.length; n += 2) {
			let r = e[n], i = e[n + 1];
			t <= r - 1 && this.appendRange(t, r - 1), t = i + 1;
		}
		return t <= O.MAX_RUNE && this.appendRange(t, O.MAX_RUNE), this;
	}
	appendTable(e) {
		for (let t = 0; t < e.length; ++t) {
			let n = e.getLo(t), r = e.getHi(t), i = e.getStride(t);
			if (i === 1) {
				this.appendRange(n, r);
				continue;
			}
			for (let e = n; e <= r; e += i) this.appendRange(e, e);
		}
		return this;
	}
	appendNegatedTable(e) {
		let t = 0;
		for (let n = 0; n < e.length; ++n) {
			let r = e.getLo(n), i = e.getHi(n), a = e.getStride(n);
			if (a === 1) {
				t <= r - 1 && this.appendRange(t, r - 1), t = i + 1;
				continue;
			}
			for (let e = r; e <= i; e += a) t <= e - 1 && this.appendRange(t, e - 1), t = e + 1;
		}
		return t <= O.MAX_RUNE && this.appendRange(t, O.MAX_RUNE), this;
	}
	appendTableWithSign(e, t) {
		return t < 0 ? this.appendNegatedTable(e) : this.appendTable(e);
	}
	negateClass() {
		let e = 0, t = 0;
		for (let n = 0; n < this.len; n += 2) {
			let r = this.r[n], i = this.r[n + 1];
			e <= r - 1 && (this.r[t] = e, this.r[t + 1] = r - 1, t += 2), e = i + 1;
		}
		return this.len = t, e <= O.MAX_RUNE && (this.r[this.len++] = e, this.r[this.len++] = O.MAX_RUNE), this;
	}
	appendClassWithSign(e, t) {
		return t < 0 ? this.appendNegatedClass(e) : this.appendClass(e);
	}
	appendGroup(t, n) {
		let r = t.cls;
		return n && (r = new e().appendFoldedClass(r).cleanClass().toArray()), this.appendClassWithSign(r, t.sign);
	}
	toString() {
		return e.charClassToString(this.r, this.len);
	}
}, $l = class {
	constructor(e) {
		this.str = e, this.position = 0;
	}
	pos() {
		return this.position;
	}
	rewindTo(e) {
		this.position = e;
	}
	more() {
		return this.position < this.str.length;
	}
	peek() {
		return this.str.codePointAt(this.position);
	}
	skip(e) {
		this.position += e;
	}
	skipString(e) {
		this.position += e.length;
	}
	pop() {
		let e = this.str.codePointAt(this.position);
		return this.position += k.charCount(e), e;
	}
	lookingAt(e) {
		return this.str.startsWith(e, this.position);
	}
	rest() {
		return this.str.substring(this.position);
	}
	from(e) {
		return this.str.substring(e, this.position);
	}
	toString() {
		return this.rest();
	}
}, eu = class e {
	static ERR_INTERNAL_ERROR = "regexp/syntax: internal error";
	static ERR_INVALID_CHAR_RANGE = "invalid character class range";
	static ERR_INVALID_ESCAPE = "invalid escape sequence";
	static ERR_INVALID_NAMED_CAPTURE = "invalid named capture";
	static ERR_INVALID_PERL_OP = "invalid or unsupported Perl syntax";
	static ERR_INVALID_REPEAT_OP = "invalid nested repetition operator";
	static ERR_INVALID_REPEAT_SIZE = "invalid repeat count";
	static ERR_MISSING_BRACKET = "missing closing ]";
	static ERR_MISSING_PAREN = "missing closing )";
	static ERR_MISSING_REPEAT_ARGUMENT = "missing argument to repetition operator";
	static ERR_TRAILING_BACKSLASH = "trailing backslash at end of expression";
	static ERR_DUPLICATE_NAMED_CAPTURE = "duplicate capture group name";
	static ERR_UNEXPECTED_PAREN = "unexpected )";
	static ERR_NESTING_DEPTH = "expression nests too deeply";
	static ERR_LARGE = "expression too large";
	static ERR_INVALID_CAPTURE_IN_LOOKBEHIND = "invalid capture in lookbehind";
	static MAX_HEIGHT = 1e3;
	static MAX_SIZE = 1398101;
	static MAX_RUNES = 33554432;
	static ANY_TABLE = new E(new Uint32Array([
		0,
		O.MAX_RUNE,
		1
	]));
	static ASCII_TABLE = new E(new Uint32Array([
		0,
		127,
		1
	]));
	static ASCII_FOLD_TABLE = new E(new Uint32Array([
		0,
		127,
		1,
		383,
		383,
		1,
		8490,
		8490,
		1
	]));
	static unicodeTable(t) {
		return t === "Any" ? {
			tab: e.ANY_TABLE,
			fold: e.ANY_TABLE,
			sign: 1
		} : t === "Ascii" ? {
			tab: e.ASCII_TABLE,
			fold: e.ASCII_FOLD_TABLE,
			sign: 1
		} : t === "Assigned" ? {
			tab: Fc.CATEGORIES.get("Cn"),
			fold: Fc.CATEGORIES.get("Cn"),
			sign: -1
		} : t === "Lc" ? {
			tab: Fc.CATEGORIES.get("LC"),
			fold: Fc.FOLD_CATEGORIES.get("LC"),
			sign: 1
		} : Fc.CATEGORIES.has(t) ? {
			tab: Fc.CATEGORIES.get(t),
			fold: Fc.FOLD_CATEGORIES.get(t),
			sign: 1
		} : Fc.SCRIPTS.has(t) ? {
			tab: Fc.SCRIPTS.get(t),
			fold: Fc.FOLD_SCRIPT.get(t),
			sign: 1
		} : null;
	}
	static minFoldRune(e) {
		if (e < O.MIN_FOLD || e > O.MAX_FOLD) return e;
		let t = e, n = e;
		for (e = O.simpleFold(e); e !== n; e = O.simpleFold(e)) t > e && (t = e);
		return t;
	}
	static leadingRegexp(e) {
		if (e.op === N.Op.EMPTY_MATCH) return null;
		if (e.op === N.Op.CONCAT && e.subs.length > 0) {
			let t = e.subs[0];
			return t.op === N.Op.EMPTY_MATCH ? null : t;
		}
		return e;
	}
	static literalRegexp(e, t) {
		let n = new N(N.Op.LITERAL);
		return n.flags = t, n.runes = k.stringToRunes(e), n;
	}
	static parse(t, n) {
		return new e(t, n).parseInternal();
	}
	static parseRepeat(t) {
		let n = t.pos();
		if (!t.more() || !t.lookingAt("{")) return -1;
		t.skip(1);
		let r = e.parseInt(t);
		if (r === -1 || !t.more()) return -1;
		let i;
		if (!t.lookingAt(",")) i = r;
		else {
			if (t.skip(1), !t.more()) return -1;
			if (t.lookingAt("}")) i = -1;
			else if ((i = e.parseInt(t)) === -1) return -1;
		}
		if (!t.more() || !t.lookingAt("}")) return -1;
		if (t.skip(1), r < 0 || r > 1e3 || i === -2 || i > 1e3 || i >= 0 && r > i) throw new j(e.ERR_INVALID_REPEAT_SIZE, t.from(n));
		return r << 16 | i & O.MAX_BMP;
	}
	static isValidCaptureName(e) {
		if (e.length === 0) return !1;
		for (let t = 0; t < e.length; t++) {
			let n = e.codePointAt(t);
			if (n !== T.CODES.get("_") && !k.isalnum(n)) return !1;
		}
		return !0;
	}
	static parseInt(e) {
		let t = e.pos();
		for (; e.more() && e.peek() >= T.CODES.get("0") && e.peek() <= T.CODES.get("9");) e.skip(1);
		let n = e.from(t);
		return n.length === 0 || n.length > 1 && n.codePointAt(0) === T.CODES.get("0") ? -1 : n.length > 8 ? -2 : parseInt(n, 10);
	}
	static isCharClass(e) {
		return e.op === N.Op.LITERAL && e.runes.length === 1 || e.op === N.Op.CHAR_CLASS || e.op === N.Op.ANY_CHAR_NOT_NL || e.op === N.Op.ANY_CHAR;
	}
	static matchRune(e, t) {
		switch (e.op) {
			case N.Op.LITERAL: return e.runes.length === 1 && e.runes[0] === t;
			case N.Op.CHAR_CLASS:
				for (let n = 0; n < e.runes.length; n += 2) if (e.runes[n] <= t && t <= e.runes[n + 1]) return !0;
				return !1;
			case N.Op.ANY_CHAR_NOT_NL: return t !== T.CODES.get("\n");
			case N.Op.ANY_CHAR: return !0;
		}
		return !1;
	}
	static mergeCharClass(t, n) {
		switch (t.op) {
			case N.Op.ANY_CHAR: break;
			case N.Op.ANY_CHAR_NOT_NL:
				e.matchRune(n, T.CODES.get("\n")) && (t.op = N.Op.ANY_CHAR);
				break;
			case N.Op.CHAR_CLASS: {
				let e = new Ql(Array.isArray(t.runes) ? t.runes : Array.from(t.runes));
				n.op === N.Op.LITERAL ? e.appendLiteral(n.runes[0], n.flags) : e.appendClass(n.runes), t.runes = e.toGrowableArray();
				break;
			}
			case N.Op.LITERAL:
				if (n.runes[0] === t.runes[0] && n.flags === t.flags) break;
				t.op = N.Op.CHAR_CLASS, t.runes = new Ql().appendLiteral(t.runes[0], t.flags).appendLiteral(n.runes[0], n.flags).toGrowableArray();
		}
	}
	static parseEscape(t) {
		let n = t.pos();
		if (t.skip(1), !t.more()) throw new j(e.ERR_TRAILING_BACKSLASH);
		let r = t.pop();
		bigswitch: switch (r) {
			case T.CODES.get("1"):
			case T.CODES.get("2"):
			case T.CODES.get("3"):
			case T.CODES.get("4"):
			case T.CODES.get("5"):
			case T.CODES.get("6"):
			case T.CODES.get("7"): if (!t.more() || t.peek() < T.CODES.get("0") || t.peek() > T.CODES.get("7")) break;
			case T.CODES.get("0"): {
				let e = r - T.CODES.get("0");
				for (let n = 1; n < 3 && !(!t.more() || t.peek() < T.CODES.get("0") || t.peek() > T.CODES.get("7")); n++) e = e * 8 + t.peek() - T.CODES.get("0"), t.skip(1);
				return e;
			}
			case T.CODES.get("x"): {
				if (!t.more()) break;
				if (r = t.pop(), r === T.CODES.get("{")) {
					let e = 0, n = 0;
					for (;;) {
						if (!t.more()) break bigswitch;
						if (r = t.pop(), r === T.CODES.get("}")) break;
						let i = k.unhex(r);
						if (i < 0 || (n = n * 16 + i, n > O.MAX_RUNE)) break bigswitch;
						e++;
					}
					if (e === 0) break bigswitch;
					return n;
				}
				let e = k.unhex(r);
				if (!t.more()) break;
				r = t.pop();
				let n = k.unhex(r);
				if (e < 0 || n < 0) break;
				return e * 16 + n;
			}
			case T.CODES.get("a"): return T.CODES.get("\x07");
			case T.CODES.get("f"): return T.CODES.get("\f");
			case T.CODES.get("n"): return T.CODES.get("\n");
			case T.CODES.get("r"): return T.CODES.get("\r");
			case T.CODES.get("t"): return T.CODES.get("	");
			case T.CODES.get("v"): return T.CODES.get("\v");
			default: if (r <= O.MAX_ASCII && !k.isalnum(r)) return r;
		}
		throw new j(e.ERR_INVALID_ESCAPE, t.from(n));
	}
	static parseClassChar(t, n) {
		if (!t.more()) throw new j(e.ERR_MISSING_BRACKET, t.from(n));
		return t.lookingAt("\\") ? e.parseEscape(t) : t.pop();
	}
	static hasCapture(t) {
		if (t === null) return !1;
		if (t.op === N.Op.CAPTURE) return !0;
		if (t.subs) {
			for (let n of t.subs) if (e.hasCapture(n)) return !0;
		}
		return !1;
	}
	constructor(e, t = 0) {
		this.wholeRegexp = e, this.flags = t, this.numCap = 0, this.namedGroups = Object.create(null), this.stack = [], this.free = null, this.numRegexp = 0, this.numRunes = 0, this.repeats = 0, this.height = null, this.size = null, this.nlb = 0;
	}
	newRegexp(e) {
		let t = this.free;
		return t !== null && t.subs !== null && t.subs.length > 0 ? (this.free = t.subs[0], t.reinit(), t.op = e) : (t = new N(e), this.numRegexp += 1), t;
	}
	reuse(e) {
		this.height !== null && this.height.has(e) && this.height.delete(e), e.subs !== null && e.subs.length > 0 && (e.subs[0] = this.free), this.free = e;
	}
	checkLimits(t) {
		if (this.numRunes > e.MAX_RUNES) throw new j(e.ERR_LARGE);
		this.checkSize(t), this.checkHeight(t);
	}
	checkSize(t) {
		if (this.size === null) {
			if (this.repeats === 0 && (this.repeats = 1), t.op === N.Op.REPEAT) {
				let n = t.max;
				n === -1 && (n = t.min), n <= 0 && (n = 1), n > Math.floor(e.MAX_SIZE / this.repeats) ? this.repeats = e.MAX_SIZE : this.repeats *= n;
			}
			if (this.numRegexp < Math.floor(e.MAX_SIZE / this.repeats)) return;
			this.size = /* @__PURE__ */ new Map();
			for (let e of this.stack) this.checkSize(e);
		}
		if (this.calcSize(t, !0) > e.MAX_SIZE) throw new j(e.ERR_LARGE);
	}
	calcSize(e, t = !1) {
		if (!t && this.size !== null && this.size.has(e)) return this.size.get(e);
		let n = 0;
		switch (e.op) {
			case N.Op.LITERAL:
				n = e.runes.length;
				break;
			case N.Op.PLB:
			case N.Op.NLB:
			case N.Op.CAPTURE:
			case N.Op.STAR:
				n = 2 + this.calcSize(e.subs[0]);
				break;
			case N.Op.PLUS:
			case N.Op.QUEST:
				n = 1 + this.calcSize(e.subs[0]);
				break;
			case N.Op.CONCAT:
				for (let t of e.subs) n += this.calcSize(t);
				break;
			case N.Op.ALTERNATE:
				for (let t of e.subs) n += this.calcSize(t);
				e.subs.length > 1 && (n = n + e.subs.length - 1);
				break;
			case N.Op.REPEAT: {
				let t = this.calcSize(e.subs[0]);
				if (e.max === -1) {
					n = e.min === 0 ? 2 + t : 1 + e.min * t;
					break;
				}
				n = e.max * t + (e.max - e.min);
				break;
			}
		}
		return n = Math.max(1, n), this.size === null && (this.size = /* @__PURE__ */ new Map()), this.size.set(e, n), n;
	}
	checkHeight(t) {
		if (!(this.numRegexp < e.MAX_HEIGHT)) {
			if (this.height === null) {
				this.height = /* @__PURE__ */ new Map();
				for (let e of this.stack) this.checkHeight(e);
			}
			if (this.calcHeight(t, !0) > e.MAX_HEIGHT) throw new j(e.ERR_NESTING_DEPTH);
		}
	}
	calcHeight(e, t = !1) {
		if (!t && this.height !== null && this.height.has(e)) return this.height.get(e);
		let n = 1;
		for (let t of e.subs) {
			let e = this.calcHeight(t);
			n < 1 + e && (n = 1 + e);
		}
		return this.height === null && (this.height = /* @__PURE__ */ new Map()), this.height.set(e, n), n;
	}
	pop() {
		return this.stack.pop();
	}
	popToPseudo() {
		let e = this.stack.length, t = e;
		for (; t > 0 && !N.isPseudoOp(this.stack[t - 1].op);) t--;
		return this.stack.splice(t, e - t);
	}
	push(e) {
		if (this.numRunes += e.runes.length, e.op === N.Op.CHAR_CLASS && e.runes.length === 2 && e.runes[0] === e.runes[1]) {
			if (this.maybeConcat(e.runes[0], this.flags & ~w.FOLD_CASE)) return null;
			e.op = N.Op.LITERAL, e.runes = [e.runes[0]], e.flags = this.flags & ~w.FOLD_CASE;
		} else if (e.op === N.Op.CHAR_CLASS && e.runes.length === 4 && e.runes[0] === e.runes[1] && e.runes[2] === e.runes[3] && O.simpleFold(e.runes[0]) === e.runes[2] && O.simpleFold(e.runes[2]) === e.runes[0] || e.op === N.Op.CHAR_CLASS && e.runes.length === 2 && e.runes[0] + 1 === e.runes[1] && O.simpleFold(e.runes[0]) === e.runes[1] && O.simpleFold(e.runes[1]) === e.runes[0]) {
			if (this.maybeConcat(e.runes[0], this.flags | w.FOLD_CASE)) return null;
			e.op = N.Op.LITERAL, e.runes = [e.runes[0]], e.flags = this.flags | w.FOLD_CASE;
		} else this.maybeConcat(-1, 0);
		return this.stack.push(e), this.checkLimits(e), e;
	}
	maybeConcat(e, t) {
		let n = this.stack.length;
		if (n < 2) return !1;
		let r = this.stack[n - 1], i = this.stack[n - 2];
		if (r.op !== N.Op.LITERAL || i.op !== N.Op.LITERAL || (r.flags & w.FOLD_CASE) !== (i.flags & w.FOLD_CASE)) return !1;
		Array.isArray(i.runes) || (i.runes = Array.from(i.runes));
		for (let e = 0; e < r.runes.length; e++) i.runes.push(r.runes[e]);
		return e >= 0 ? (r.runes = [e], r.flags = t, !0) : (this.pop(), this.reuse(r), !1);
	}
	newLiteral(t, n) {
		let r = this.newRegexp(N.Op.LITERAL);
		return r.flags = n, (n & w.FOLD_CASE) !== 0 && (t = e.minFoldRune(t)), r.runes = [t], r;
	}
	literal(e) {
		this.push(this.newLiteral(e, this.flags));
	}
	op(e) {
		let t = this.newRegexp(e);
		return t.flags = this.flags, this.push(t);
	}
	repeat(t, n, r, i, a, o) {
		let s = this.flags;
		if ((s & w.PERL_X) !== 0 && (a.more() && a.lookingAt("?") && (a.skip(1), s ^= w.NON_GREEDY), o !== -1)) throw new j(e.ERR_INVALID_REPEAT_OP, a.from(o));
		let c = this.stack.length;
		if (c === 0) throw new j(e.ERR_MISSING_REPEAT_ARGUMENT, a.from(i));
		let l = this.stack[c - 1];
		if (N.isPseudoOp(l.op)) throw new j(e.ERR_MISSING_REPEAT_ARGUMENT, a.from(i));
		let u = this.newRegexp(t);
		if (u.min = n, u.max = r, u.flags = s, u.subs = [l], this.stack[c - 1] = u, this.checkLimits(u), t === N.Op.REPEAT && (n >= 2 || r >= 2) && !this.repeatIsValid(u, 1e3)) throw new j(e.ERR_INVALID_REPEAT_SIZE, a.from(i));
	}
	repeatIsValid(e, t) {
		if (e.op === N.Op.REPEAT) {
			let n = e.max;
			if (n === 0) return !0;
			if (n < 0 && (n = e.min), n > t) return !1;
			n > 0 && (t = Math.trunc(t / n));
		}
		for (let n of e.subs) if (!this.repeatIsValid(n, t)) return !1;
		return !0;
	}
	concat() {
		this.maybeConcat(-1, 0);
		let e = this.popToPseudo();
		return e.length === 0 ? this.push(this.newRegexp(N.Op.EMPTY_MATCH)) : this.push(this.collapse(e, N.Op.CONCAT));
	}
	alternate() {
		let e = this.popToPseudo();
		return e.length > 0 && this.cleanAlt(e[e.length - 1]), e.length === 0 ? this.push(this.newRegexp(N.Op.NO_MATCH)) : this.push(this.collapse(e, N.Op.ALTERNATE));
	}
	cleanAlt(e) {
		e.op === N.Op.CHAR_CLASS && (e.runes = new Ql(Array.from(e.runes)).cleanClass().toArray(), e.runes.length === 2 && e.runes[0] === 0 && e.runes[1] === O.MAX_RUNE ? (e.runes = /* @__PURE__ */ new Int32Array(), e.op = N.Op.ANY_CHAR) : e.runes.length === 4 && e.runes[0] === 0 && e.runes[1] === T.CODES.get("\n") - 1 && e.runes[2] === T.CODES.get("\n") + 1 && e.runes[3] === O.MAX_RUNE && (e.runes = /* @__PURE__ */ new Int32Array(), e.op = N.Op.ANY_CHAR_NOT_NL));
	}
	collapse(e, t) {
		if (e.length === 1) return e[0];
		let n = 0;
		for (let r of e) n += r.op === t ? r.subs.length : 1;
		let r = Array(n).fill(null), i = 0;
		for (let n of e) if (n.op === t) {
			for (let e = 0; e < n.subs.length; e++) r[i++] = n.subs[e];
			this.reuse(n);
		} else r[i++] = n;
		let a = this.newRegexp(t);
		if (a.subs = r, t === N.Op.ALTERNATE && (a.subs = this.factor(a.subs), a.subs.length === 1)) {
			let e = a;
			a = a.subs[0], this.reuse(e);
		}
		return a;
	}
	factor(t) {
		if (t.length < 2) return t;
		let n = 0, r = t.length, i = 0, a = null, o = 0, s = 0, c = 0;
		for (let e = 0; e <= r; e++) {
			let l = null, u = 0, d = 0;
			if (e < r) {
				let r = t[n + e];
				if (r.op === N.Op.CONCAT && r.subs.length > 0 && (r = r.subs[0]), r.op === N.Op.LITERAL && (l = r.runes, u = r.runes.length, d = r.flags & w.FOLD_CASE), d === s) {
					let e = 0;
					for (; e < o && e < u && a[e] === l[e];) e++;
					if (e > 0) {
						o = e;
						continue;
					}
				}
			}
			if (e !== c) {
				if (e === c + 1) t[i++] = t[n + c];
				else {
					let r = this.newRegexp(N.Op.LITERAL);
					r.flags = s, r.runes = a.slice(0, o);
					for (let r = c; r < e; r++) t[n + r] = this.removeLeadingString(t[n + r], o), this.checkLimits(t[n + r]);
					let l = this.collapse(t.slice(n + c, n + e), N.Op.ALTERNATE), u = this.newRegexp(N.Op.CONCAT);
					u.subs = [r, l], t[i++] = u;
				}
			}
			c = e, a = l, o = u, s = d;
		}
		r = i, n = 0, c = 0, i = 0;
		let l = null;
		for (let a = 0; a <= r; a++) {
			let o = null;
			if (!(a < r && (o = e.leadingRegexp(t[n + a]), l !== null && l.equals(o) && (e.isCharClass(l) || l.op === N.Op.REPEAT && l.min === l.max && e.isCharClass(l.subs[0]))))) {
				if (a !== c) {
					if (a === c + 1) t[i++] = t[n + c];
					else {
						let e = l;
						for (let e = c; e < a; e++) {
							let r = e !== c;
							t[n + e] = this.removeLeadingRegexp(t[n + e], r), this.checkLimits(t[n + e]);
						}
						let r = this.collapse(t.slice(n + c, n + a), N.Op.ALTERNATE), o = this.newRegexp(N.Op.CONCAT);
						o.subs = [e, r], t[i++] = o;
					}
				}
				c = a, l = o;
			}
		}
		r = i, n = 0, c = 0, i = 0;
		for (let a = 0; a <= r; a++) if (!(a < r && e.isCharClass(t[n + a]))) {
			if (a !== c) {
				if (a === c + 1) t[i++] = t[n + c];
				else {
					let r = c;
					for (let e = c + 1; e < a; e++) {
						let i = t[n + r], a = t[n + e];
						(i.op < a.op || i.op === a.op && (i.runes === null ? 0 : i.runes.length) < (a.runes === null ? 0 : a.runes.length)) && (r = e);
					}
					let o = t[n + c];
					t[n + c] = t[n + r], t[n + r] = o;
					for (let r = c + 1; r < a; r++) e.mergeCharClass(t[n + c], t[n + r]), this.reuse(t[n + r]);
					this.cleanAlt(t[n + c]), t[i++] = t[n + c];
				}
			}
			a < r && (t[i++] = t[n + a]), c = a + 1;
		}
		r = i, n = 0, c = 0, i = 0;
		for (let e = 0; e < r; ++e) e + 1 < r && t[n + e].op === N.Op.EMPTY_MATCH && t[n + e + 1].op === N.Op.EMPTY_MATCH || (t[i++] = t[n + e]);
		return r = i, n = 0, t.slice(n, r);
	}
	removeLeadingString(e, t) {
		if (e.op === N.Op.CONCAT && e.subs.length > 0) {
			let n = this.removeLeadingString(e.subs[0], t);
			if (e.subs[0] = n, n.op === N.Op.EMPTY_MATCH) switch (this.reuse(n), e.subs.length) {
				case 0:
				case 1:
					e.op = N.Op.EMPTY_MATCH, e.subs = N.emptySubs();
					break;
				case 2: {
					let t = e;
					e = e.subs[1], this.reuse(t);
					break;
				}
				default: e.subs = e.subs.slice(1, e.subs.length);
			}
			return e;
		}
		return e.op === N.Op.LITERAL && (e.runes = e.runes.slice(t, e.runes.length), e.runes.length === 0 && (e.op = N.Op.EMPTY_MATCH)), e;
	}
	removeLeadingRegexp(e, t) {
		if (e.op === N.Op.CONCAT && e.subs.length > 0) {
			switch (t && this.reuse(e.subs[0]), e.subs = e.subs.slice(1, e.subs.length), e.subs.length) {
				case 0:
					e.op = N.Op.EMPTY_MATCH, e.subs = N.emptySubs();
					break;
				case 1: {
					let t = e;
					e = e.subs[0], this.reuse(t);
					break;
				}
			}
			return e;
		}
		return t && this.reuse(e), this.newRegexp(N.Op.EMPTY_MATCH);
	}
	parseInternal() {
		if ((this.flags & w.LITERAL) !== 0) return e.literalRegexp(this.wholeRegexp, this.flags);
		let t = -1, n = -1, r = -1, i = new $l(this.wholeRegexp);
		for (; i.more();) {
			let a = -1;
			bigswitch: switch (i.peek()) {
				case T.CODES.get("("):
					if ((this.flags & w.LOOKBEHIND) !== 0) {
						if (i.lookingAt("(?<=")) {
							this.parsePosLookBehind(), i.skip(4);
							break;
						}
						if (i.lookingAt("(?<!")) {
							this.parseNegLookBehind(), i.skip(4);
							break;
						}
					}
					if ((this.flags & w.PERL_X) !== 0 && i.lookingAt("(?")) {
						this.parsePerlFlags(i);
						break;
					}
					this.op(N.Op.LEFT_PAREN).cap = ++this.numCap, i.skip(1);
					break;
				case T.CODES.get("|"):
					this.parseVerticalBar(), i.skip(1);
					break;
				case T.CODES.get(")"):
					this.parseRightParen(), i.skip(1);
					break;
				case T.CODES.get("^"):
					(this.flags & w.ONE_LINE) === 0 ? this.op(N.Op.BEGIN_LINE) : this.op(N.Op.BEGIN_TEXT), i.skip(1);
					break;
				case T.CODES.get("$"):
					(this.flags & w.ONE_LINE) === 0 ? this.op(N.Op.END_LINE) : this.op(N.Op.END_TEXT).flags |= w.WAS_DOLLAR, i.skip(1);
					break;
				case T.CODES.get("."):
					(this.flags & w.DOT_NL) === 0 ? this.op(N.Op.ANY_CHAR_NOT_NL) : this.op(N.Op.ANY_CHAR), i.skip(1);
					break;
				case T.CODES.get("["):
					this.parseClass(i);
					break;
				case T.CODES.get("*"):
				case T.CODES.get("+"):
				case T.CODES.get("?"): {
					a = i.pos();
					let e = null;
					switch (i.pop()) {
						case T.CODES.get("*"):
							e = N.Op.STAR;
							break;
						case T.CODES.get("+"):
							e = N.Op.PLUS;
							break;
						case T.CODES.get("?"): e = N.Op.QUEST;
					}
					this.repeat(e, n, r, a, i, t);
					break;
				}
				case T.CODES.get("{"): {
					let o = i.pos(), s = e.parseRepeat(i);
					if (s < 0) {
						i.rewindTo(o), this.literal(i.pop());
						break;
					}
					a = o, n = s >> 16, r = (s & O.MAX_BMP) << 16 >> 16, this.repeat(N.Op.REPEAT, n, r, a, i, t);
					break;
				}
				case T.CODES.get("\\"): {
					let t = i.pos();
					if (i.skip(1), (this.flags & w.PERL_X) !== 0 && i.more()) switch (i.pop()) {
						case T.CODES.get("A"):
							this.op(N.Op.BEGIN_TEXT);
							break bigswitch;
						case T.CODES.get("b"):
							this.op(N.Op.WORD_BOUNDARY);
							break bigswitch;
						case T.CODES.get("B"):
							this.op(N.Op.NO_WORD_BOUNDARY);
							break bigswitch;
						case T.CODES.get("C"): throw new j(e.ERR_INVALID_ESCAPE, "\\C");
						case T.CODES.get("Q"): {
							let e = i.rest(), t = e.indexOf("\\E");
							t >= 0 ? (e = e.substring(0, t), i.skipString(e), i.skipString("\\E")) : i.skipString(e);
							let n = 0;
							for (; n < e.length;) {
								let t = e.codePointAt(n);
								this.literal(t), n += k.charCount(t);
							}
							break bigswitch;
						}
						case T.CODES.get("z"):
							this.op(N.Op.END_TEXT);
							break bigswitch;
						default: i.rewindTo(t);
					}
					else i.rewindTo(t);
					let n = this.newRegexp(N.Op.CHAR_CLASS);
					if (n.flags = this.flags, i.lookingAt("\\p") || i.lookingAt("\\P")) {
						let e = new Ql();
						if (this.parseUnicodeClass(i, e)) {
							n.runes = e.toArray(), this.push(n);
							break bigswitch;
						}
					}
					let r = new Ql();
					if (this.parsePerlClassEscape(i, r)) {
						n.runes = r.toArray(), this.push(n);
						break bigswitch;
					}
					i.rewindTo(t), this.reuse(n), this.literal(e.parseEscape(i));
					break;
				}
				default: this.literal(i.pop());
			}
			t = a;
		}
		if (this.concat(), this.swapVerticalBar() && this.pop(), this.alternate(), this.stack.length !== 1) throw new j(e.ERR_MISSING_PAREN, this.wholeRegexp);
		return this.stack[0].namedGroups = this.namedGroups, this.stack[0];
	}
	parsePerlFlags(t) {
		let n = t.pos(), r = t.rest();
		if (r.startsWith("(?P<") || r.startsWith("(?<")) {
			let n = r.charAt(2) === "P" ? 4 : 3, i = r.indexOf(">");
			if (i < 0) throw new j(e.ERR_INVALID_NAMED_CAPTURE, r);
			let a = r.substring(n, i);
			if (t.skipString(a), t.skip(n + 1), !e.isValidCaptureName(a)) throw new j(e.ERR_INVALID_NAMED_CAPTURE, r.substring(0, i + 1));
			let o = this.op(N.Op.LEFT_PAREN);
			if (o.cap = ++this.numCap, this.namedGroups[a]) throw new j(e.ERR_DUPLICATE_NAMED_CAPTURE, a);
			this.namedGroups[a] = this.numCap, o.name = a;
			return;
		}
		t.skip(2);
		let i = this.flags, a = 1, o = !1;
		loop: for (; t.more();) {
			let e = t.pop();
			switch (e) {
				case T.CODES.get("i"):
					i |= w.FOLD_CASE, o = !0;
					break;
				case T.CODES.get("m"):
					i &= ~w.ONE_LINE, o = !0;
					break;
				case T.CODES.get("s"):
					i |= w.DOT_NL, o = !0;
					break;
				case T.CODES.get("U"):
					i |= w.NON_GREEDY, o = !0;
					break;
				case T.CODES.get("-"):
					if (a < 0) break loop;
					a = -1, i = ~i, o = !1;
					break;
				case T.CODES.get(":"):
				case T.CODES.get(")"):
					if (a < 0) {
						if (!o) break loop;
						i = ~i;
					}
					e === T.CODES.get(":") && this.op(N.Op.LEFT_PAREN), this.flags = i;
					return;
				default: break loop;
			}
		}
		throw new j(e.ERR_INVALID_PERL_OP, t.from(n));
	}
	parsePosLookBehind() {
		let e = this.newRegexp(N.Op.LEFT_PAREN);
		return e.flags = this.flags, e.lb = ++this.nlb, this.push(e);
	}
	parseNegLookBehind() {
		let e = this.newRegexp(N.Op.LEFT_PAREN);
		return e.flags = this.flags, e.lb = -++this.nlb, this.push(e);
	}
	parseVerticalBar() {
		this.concat(), this.swapVerticalBar() || this.op(N.Op.VERTICAL_BAR);
	}
	swapVerticalBar() {
		let t = this.stack.length;
		if (t >= 3 && this.stack[t - 2].op === N.Op.VERTICAL_BAR && e.isCharClass(this.stack[t - 1]) && e.isCharClass(this.stack[t - 3])) {
			let n = this.stack[t - 1], r = this.stack[t - 3];
			if (n.op > r.op) {
				let e = r;
				r = n, n = e, this.stack[t - 3] = r;
			}
			return e.mergeCharClass(r, n), this.reuse(n), this.pop(), !0;
		}
		if (t >= 2) {
			let e = this.stack[t - 1], n = this.stack[t - 2];
			if (n.op === N.Op.VERTICAL_BAR) return t >= 3 && this.cleanAlt(this.stack[t - 3]), this.stack[t - 2] = e, this.stack[t - 1] = n, !0;
		}
		return !1;
	}
	parseRightParen() {
		if (this.concat(), this.swapVerticalBar() && this.pop(), this.alternate(), this.stack.length < 2) throw new j(e.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
		let t = this.pop(), n = this.pop();
		if (n.op !== N.Op.LEFT_PAREN) throw new j(e.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
		if (this.flags = n.flags, n.lb !== 0) {
			if (e.hasCapture(t)) throw new j(e.ERR_INVALID_CAPTURE_IN_LOOKBEHIND, this.wholeRegexp);
			n.op = n.lb > 0 ? N.Op.PLB : N.Op.NLB, n.subs = [t], this.push(n);
			return;
		}
		n.cap === 0 ? this.push(t) : (n.op = N.Op.CAPTURE, n.subs = [t], this.push(n));
	}
	parsePerlClassEscape(e, t) {
		let n = e.pos();
		if ((this.flags & w.PERL_X) === 0 || !e.more() || e.pop() !== T.CODES.get("\\") || !e.more()) return !1;
		e.pop();
		let r = e.from(n), i = Il.has(r) ? Il.get(r) : null;
		return i !== null && (t.appendGroup(i, (this.flags & w.FOLD_CASE) !== 0), !0);
	}
	parseNamedClass(t, n) {
		let r = t.rest(), i = r.indexOf(":]");
		if (i < 0) return !1;
		let a = r.substring(0, i + 2);
		t.skipString(a);
		let o = Zl.has(a) ? Zl.get(a) : null;
		if (o === null) throw new j(e.ERR_INVALID_CHAR_RANGE, a);
		return n.appendGroup(o, (this.flags & w.FOLD_CASE) !== 0), !0;
	}
	parseUnicodeClass(t, n) {
		let r = t.pos();
		if ((this.flags & w.UNICODE_GROUPS) === 0 || !t.lookingAt("\\p") && !t.lookingAt("\\P")) return !1;
		t.skip(1);
		let i = 1, a = t.pop();
		if (a === T.CODES.get("P") && (i = -1), !t.more()) throw t.rewindTo(r), new j(e.ERR_INVALID_CHAR_RANGE, t.rest());
		a = t.pop();
		let o;
		if (a !== T.CODES.get("{")) o = k.runeToString(a);
		else {
			let n = t.rest(), i = n.indexOf("}");
			if (i < 0) throw t.rewindTo(r), new j(e.ERR_INVALID_CHAR_RANGE, t.rest());
			o = n.substring(0, i), t.skipString(o), t.skip(1);
		}
		o.length !== 0 && o.codePointAt(0) === T.CODES.get("^") && (i = 0 - i, o = o.substring(1));
		let s = e.unicodeTable(o);
		if (s === null) throw new j(e.ERR_INVALID_CHAR_RANGE, t.from(r));
		s.sign < 0 && (i = 0 - i);
		let c = s.tab, l = s.fold;
		if ((this.flags & w.FOLD_CASE) === 0 || l === null) n.appendTableWithSign(c, i);
		else {
			let e = new Ql().appendTable(c).appendTable(l).cleanClass().toArray();
			n.appendClassWithSign(Array.from(e), i);
		}
		return !0;
	}
	parseClass(t) {
		let n = t.pos();
		t.skip(1);
		let r = this.newRegexp(N.Op.CHAR_CLASS);
		r.flags = this.flags;
		let i = new Ql(), a = 1;
		t.more() && t.lookingAt("^") && (a = -1, t.skip(1), (this.flags & w.CLASS_NL) === 0 && i.appendRange(T.CODES.get("\n"), T.CODES.get("\n")));
		let o = !0;
		for (; !t.more() || t.peek() !== T.CODES.get("]") || o;) {
			if (t.more() && t.lookingAt("-") && (this.flags & w.PERL_X) === 0 && !o) {
				let r = t.rest();
				if (r === "-" || !r.startsWith("-]")) throw t.rewindTo(n), new j(e.ERR_INVALID_CHAR_RANGE, t.rest());
			}
			o = !1;
			let r = t.pos();
			if (t.lookingAt("[:")) {
				if (this.parseNamedClass(t, i)) continue;
				t.rewindTo(r);
			}
			if (this.parseUnicodeClass(t, i) || this.parsePerlClassEscape(t, i)) continue;
			t.rewindTo(r);
			let a = e.parseClassChar(t, n), s = a;
			if (t.more() && t.lookingAt("-")) {
				if (t.skip(1), t.more() && t.lookingAt("]")) t.skip(-1);
				else if (s = e.parseClassChar(t, n), s < a) throw new j(e.ERR_INVALID_CHAR_RANGE, t.from(r));
			}
			(this.flags & w.FOLD_CASE) === 0 ? i.appendRange(a, s) : i.appendFoldedRange(a, s);
		}
		t.skip(1), i.cleanClass(), a < 0 && i.negateClass(), r.runes = i.toArray(), this.push(r);
	}
}, tu = class e {
	static initTest(t) {
		let n = e.compile(t), r = new e(n.expr, n.prog, n.numSubexp, n.longest);
		return r.cond = n.cond, r.prefix = n.prefix, r.prefixUTF8 = n.prefixUTF8, r.prefixComplete = n.prefixComplete, r.prefixRune = n.prefixRune, r.prefilter = n.prefilter, r;
	}
	static compile(t) {
		return e.compileImpl(t, w.PERL, !1);
	}
	static compilePOSIX(t) {
		return e.compileImpl(t, w.POSIX, !0);
	}
	static compileImpl(t, n, r) {
		let i = eu.parse(t, n), a = i.maxCap(), o = i.namedGroups;
		i = Ml.simplify(i);
		let s = Tl.build(i), c = jl.compileRegexp(i), l = new e(t, c, a, r);
		l.prefilter = s.type === P.Type.NONE ? null : s;
		let [u, d] = c.prefix();
		return l.prefixComplete = u, l.prefix = d, l.prefixUTF8 = k.stringToUtf8ByteArray(l.prefix), l.prefix.length > 0 && (l.prefixRune = l.prefix.codePointAt(0)), l.namedGroups = o, l;
	}
	static match(t, n) {
		return e.compile(t).match(n);
	}
	constructor(e, t, n = 0, r = 0) {
		this.expr = e, this.prog = t, this.numSubexp = n, this.longest = r, this.cond = t.startCond(), this.prefix = null, this.prefixUTF8 = null, this.prefixComplete = !1, this.prefixRune = 0, this.machinePool = [], this.dfa = new cl(this.prog), this.onepass = Sl.compile(this.prog), this.prefilter = null;
	}
	matchPrefixComplete(e, t, n, r) {
		if ((n === w.ANCHOR_START || n === w.ANCHOR_BOTH) && t !== 0) return null;
		let i = -1, a = -1, o = e.prefixLength(this);
		if (n === w.UNANCHORED) {
			let n = e.index(this, t);
			if (n < 0) return null;
			i = t + n, a = i + o;
		} else if (n === w.ANCHOR_BOTH) {
			if (e.endPos() !== o || e.index(this, 0) !== 0) return null;
			i = 0, a = o;
		} else if (n === w.ANCHOR_START) {
			if (e.index(this, 0) !== 0) return null;
			i = 0, a = o;
		}
		if (i < 0) return null;
		if (r > 0) {
			let e = new Int32Array(r).fill(-1);
			return e[0] = i, e[1] = a, Array.from(e);
		}
		return [];
	}
	createLookbehindState() {
		return this.prog.numLb > 0 ? new tl(this.prog) : null;
	}
	executeEngine(e, t, n, r, i = null) {
		if (this.prefixComplete && (r === 0 || this.numSubexp === 0)) return this.matchPrefixComplete(e, t, n, r);
		if (this.prefilter !== null && n === w.UNANCHORED && !this.prefilter.eval(e, t)) return null;
		if (this.onepass !== null) return Sl.execute(this, e, t, n, r);
		if (r > 0) return this.prog.numLb === 0 && e.endPos() <= hl.maxBitStateLen(this.prog) ? hl.execute(this, e, t, n, r) : this.doExecuteNFA(e, t, n, r, i);
		if (this.prog.numLb === 0) {
			let i = this.dfa.match(e, t, n);
			if (i !== null) return i ? [] : null;
			if (e.endPos() <= hl.maxBitStateLen(this.prog)) return hl.execute(this, e, t, n, r);
		}
		return this.doExecuteNFA(e, t, n, r, i);
	}
	numberOfCapturingGroups() {
		return this.numSubexp;
	}
	numberOfInstructions() {
		return this.prog.numInst();
	}
	get() {
		return this.machinePool.length > 0 ? this.machinePool.pop() : null;
	}
	reset() {
		this.machinePool.length = 0;
	}
	put(e) {
		this.machinePool.push(e);
	}
	toString() {
		return this.expr;
	}
	doExecuteNFA(e, t, n, r, i = null) {
		let a = this.get();
		a ||= nl.fromRE2(this), a.init(r);
		let o = a.match(e, t, n, i) ? a.submatches() : null;
		return this.put(a), o;
	}
	match(e) {
		return this.executeEngine(A.fromUTF16(e), 0, w.UNANCHORED, 0) !== null;
	}
	matchWithGroup(e, t, n, r, i, a = null) {
		return e instanceof Vc || (e = k.isByteArray(e) ? Wc.utf8(e) : Wc.utf16(e)), this.matchMachineInput(e, t, n, r, i, a);
	}
	matchMachineInput(e, t, n, r, i, a = null) {
		if (t > n) return [!1, null];
		let o = e.isUTF16Encoding() ? A.fromUTF16(e.asCharSequence(), 0, n) : A.fromUTF8(e.asBytes(), 0, n), s = this.executeEngine(o, t, r, 2 * i, a);
		return s === null ? [!1, null] : [!0, s];
	}
	matchUTF8(e) {
		return this.executeEngine(A.fromUTF8(e), 0, w.UNANCHORED, 0) !== null;
	}
	replaceAll(e, t) {
		return this.replaceAllFunc(e, () => t, 2 * e.length + 1);
	}
	replaceFirst(e, t) {
		return this.replaceAllFunc(e, () => t, 1);
	}
	replaceAllFunc(e, t, n) {
		let r = 0, i = 0, a = "", o = A.fromUTF16(e), s = this.createLookbehindState(), c = 0;
		for (; i <= e.length;) {
			let l = this.executeEngine(o, i, w.UNANCHORED, 2, s);
			if (l === null || l.length === 0) break;
			a += e.substring(r, l[0]), (l[1] > r || l[0] === 0) && (a += t(e.substring(l[0], l[1])), c++), r = l[1];
			let u = o.step(i) & 7;
			if (i + u > l[1] ? i += u : i + 1 > l[1] ? i++ : i = l[1], c >= n) break;
		}
		return a += e.substring(r), a;
	}
	pad(e) {
		if (e === null) return null;
		let t = (1 + this.numSubexp) * 2;
		if (e.length < t) {
			let n = Array(t).fill(-1);
			for (let t = 0; t < e.length; t++) n[t] = e[t];
			e = n;
		}
		return e;
	}
	allMatches(e, t, n = (e) => e) {
		let r = [], i = e.endPos();
		t < 0 && (t = i + 1);
		let a = 0, o = 0, s = -1, c = this.createLookbehindState();
		for (; o < t && a <= i;) {
			let t = this.executeEngine(e, a, w.UNANCHORED, this.prog.numCap, c);
			if (t === null || t.length === 0) break;
			let l = !0;
			if (t[1] === a) {
				t[0] === s && (l = !1);
				let n = e.step(a);
				n < 0 ? a = i + 1 : a += n & 7;
			} else a = t[1];
			s = t[1], l && (r.push(n(this.pad(t))), o++);
		}
		return r;
	}
	findUTF8(e) {
		let t = this.executeEngine(A.fromUTF8(e), 0, w.UNANCHORED, 2);
		return t === null ? null : e.slice(t[0], t[1]);
	}
	findUTF8Index(e) {
		let t = this.executeEngine(A.fromUTF8(e), 0, w.UNANCHORED, 2);
		return t === null ? null : t.slice(0, 2);
	}
	find(e) {
		let t = this.executeEngine(A.fromUTF16(e), 0, w.UNANCHORED, 2);
		return t === null ? "" : e.substring(t[0], t[1]);
	}
	findIndex(e) {
		return this.executeEngine(A.fromUTF16(e), 0, w.UNANCHORED, 2);
	}
	findUTF8Submatch(e) {
		let t = this.executeEngine(A.fromUTF8(e), 0, w.UNANCHORED, this.prog.numCap);
		if (t === null) return null;
		let n = Array(1 + this.numSubexp).fill(null);
		for (let r = 0; r < n.length; r++) 2 * r < t.length && t[2 * r] >= 0 && (n[r] = e.slice(t[2 * r], t[2 * r + 1]));
		return n;
	}
	findUTF8SubmatchIndex(e) {
		return this.pad(this.executeEngine(A.fromUTF8(e), 0, w.UNANCHORED, this.prog.numCap));
	}
	findSubmatch(e) {
		let t = this.executeEngine(A.fromUTF16(e), 0, w.UNANCHORED, this.prog.numCap);
		if (t === null) return null;
		let n = Array(1 + this.numSubexp).fill(null);
		for (let r = 0; r < n.length; r++) 2 * r < t.length && t[2 * r] >= 0 && (n[r] = e.substring(t[2 * r], t[2 * r + 1]));
		return n;
	}
	findSubmatchIndex(e) {
		return this.pad(this.executeEngine(A.fromUTF16(e), 0, w.UNANCHORED, this.prog.numCap));
	}
	findAllUTF8(e, t) {
		let n = this.allMatches(A.fromUTF8(e), t, (t) => e.slice(t[0], t[1]));
		return n.length === 0 ? null : n;
	}
	findAllUTF8Index(e, t) {
		let n = this.allMatches(A.fromUTF8(e), t, (e) => e.slice(0, 2));
		return n.length === 0 ? null : n;
	}
	findAll(e, t) {
		let n = this.allMatches(A.fromUTF16(e), t, (t) => e.substring(t[0], t[1]));
		return n.length === 0 ? null : n;
	}
	findAllIndex(e, t) {
		let n = this.allMatches(A.fromUTF16(e), t, (e) => e.slice(0, 2));
		return n.length === 0 ? null : n;
	}
	findAllUTF8Submatch(e, t) {
		let n = this.allMatches(A.fromUTF8(e), t, (t) => {
			let n = Array(t.length / 2 | 0).fill(null);
			for (let r = 0; r < n.length; r++) t[2 * r] >= 0 && (n[r] = e.slice(t[2 * r], t[2 * r + 1]));
			return n;
		});
		return n.length === 0 ? null : n;
	}
	findAllUTF8SubmatchIndex(e, t) {
		let n = this.allMatches(A.fromUTF8(e), t);
		return n.length === 0 ? null : n;
	}
	findAllSubmatch(e, t) {
		let n = this.allMatches(A.fromUTF16(e), t, (t) => {
			let n = Array(t.length / 2 | 0).fill(null);
			for (let r = 0; r < n.length; r++) t[2 * r] >= 0 && (n[r] = e.substring(t[2 * r], t[2 * r + 1]));
			return n;
		});
		return n.length === 0 ? null : n;
	}
	findAllSubmatchIndex(e, t) {
		let n = this.allMatches(A.fromUTF16(e), t);
		return n.length === 0 ? null : n;
	}
};
(class e {
	static UNANCHORED = w.UNANCHORED;
	static ANCHOR_START = w.ANCHOR_START;
	static ANCHOR_BOTH = w.ANCHOR_BOTH;
	constructor(t = e.UNANCHORED, n = 0, r = 8388608) {
		this.anchor = t, this.jsFlags = n, this.maxMem = r;
		let i = w.PERL;
		(n & Ec.DISABLE_UNICODE_GROUPS) !== 0 && (i &= ~w.UNICODE_GROUPS), (n & Ec.LOOKBEHINDS) !== 0 && (i |= w.LOOKBEHIND), this.re2Flags = i, this.regexps = [], this.prog = null, this.dfa = null, this.dummyRe2 = null;
	}
	add(e) {
		if (this.prog) throw new Yc("Cannot add patterns after compile");
		let t = e;
		(this.jsFlags & Ec.CASE_INSENSITIVE) !== 0 && (t = `(?i)${t}`), (this.jsFlags & Ec.DOTALL) !== 0 && (t = `(?s)${t}`), (this.jsFlags & Ec.MULTILINE) !== 0 && (t = `(?m)${t}`);
		let n = eu.parse(t, this.re2Flags);
		return this.regexps.push(Ml.simplify(n)), this.regexps.length - 1;
	}
	compile() {
		if (this.prog) return;
		let e = jl.compileSet(this.regexps);
		if (e.numInst() > eu.MAX_SIZE) throw new Yc(`${eu.ERR_LARGE}: the set compiles to ${e.numInst()} instructions, more than ${eu.MAX_SIZE}`);
		this.prog = e, this.dfa = new cl(this.prog, this.maxMem), this.dummyRe2 = {
			prog: this.prog,
			cond: this.prog.startCond(),
			prefix: "",
			prefixRune: 0,
			longest: !1
		};
	}
	match(t) {
		this.prog || this.compile();
		let n = k.isByteArray(t) ? A.fromUTF8(t) : A.fromUTF16(t), r = w.UNANCHORED;
		this.anchor === e.ANCHOR_START ? r = w.ANCHOR_START : this.anchor === e.ANCHOR_BOTH && (r = w.ANCHOR_BOTH);
		let i = this.dfa.matchSet(n, 0, r);
		if (i !== null) return i;
		let a = nl.fromRE2(this.dummyRe2);
		return a.init(0), a.matchSet(n, 0, r);
	}
});
var nu = class e {
	static isHexadecimal(e) {
		return "0" <= e && e <= "9" || "A" <= e && e <= "F" || "a" <= e && e <= "f";
	}
	static translate(t) {
		let n = "";
		if (t instanceof RegExp && (t.ignoreCase && (n += "i"), t.multiline && (n += "m"), t.dotAll && (n += "s"), t = t.source), typeof t != "string") return t;
		let r = "", i = !1, a = t.length;
		a === 0 && (r = "(?:)", i = !0);
		let o = !1, s = 0;
		for (; s < a;) {
			let n = t[s];
			if (n === "\\") {
				if (s + 1 < a) switch (n = t[s + 1], n) {
					case "\\":
						r += "\\\\", s += 2;
						continue;
					case "c":
						if (s + 2 < a) {
							let e = t[s + 2].charCodeAt(0);
							if (e >= 65 && e <= 90 || e >= 97 && e <= 122) {
								let t = e % 32;
								r += "\\x", r += (t >> 4).toString(16).toUpperCase(), r += (t & 15).toString(16).toUpperCase(), s += 3, i = !0;
								continue;
							}
						}
						r += "c", s += 2, i = !0;
						continue;
					case "u":
						if (s + 2 < a) {
							if (t[s + 2] === "{") {
								let n = s + 3, o = !1, c = !1;
								for (; n < a;) {
									let r = t[n];
									if (r === "}") {
										c = !0;
										break;
									}
									if (!e.isHexadecimal(r)) break;
									o = !0, n++;
								}
								if (c && o) {
									r += "\\x", s += 2, i = !0;
									continue;
								}
							} else if (s + 5 < a) {
								let n = !0;
								for (let r = 0; r < 4; r++) if (!e.isHexadecimal(t[s + 2 + r])) {
									n = !1;
									break;
								}
								if (n) {
									r += "\\x{" + t.substring(s + 2, s + 6) + "}", s += 6, i = !0;
									continue;
								}
							}
						}
						r += "u", s += 2, i = !0;
						continue;
					case "x": {
						let n = !1;
						if (s + 2 < a && t[s + 2] === "{") {
							let r = s + 3, i = !1, o = !1;
							for (; r < a;) {
								let n = t[r];
								if (n === "}") {
									o = !0;
									break;
								}
								if (!e.isHexadecimal(n)) break;
								i = !0, r++;
							}
							o && i && (n = !0);
						} else s + 3 < a && e.isHexadecimal(t[s + 2]) && e.isHexadecimal(t[s + 3]) && (n = !0);
						n ? (r += "\\x", s += 2) : (r += "x", s += 2, i = !0);
						continue;
					}
					case "n":
					case "r":
					case "t":
					case "a":
					case "f":
					case "v":
					case "d":
					case "D":
					case "s":
					case "S":
					case "w":
					case "W":
					case "b":
					case "B":
					case "p":
					case "P":
					case "A":
					case "z":
					case "Q":
					case "E":
					case "0":
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
						r += "\\" + n, s += 2;
						continue;
					default: {
						let e = t.codePointAt(s + 1);
						if (e >= 48 && e <= 57 || e >= 65 && e <= 90 || e >= 97 && e <= 122) {
							let n = k.charCount(e);
							r += t.substring(s + 1, s + 1 + n), s += n + 1, i = !0;
						} else {
							r += "\\";
							let n = k.charCount(e);
							r += t.substring(s + 1, s + 1 + n), s += n + 1;
						}
						continue;
					}
				}
			} else if (n === "/") {
				r += "\\/", s += 1, i = !0;
				continue;
			} else if (n === "[") o = !0;
			else if (n === "]") o = !1;
			else if (!o && n === "(" && s + 2 < a && t[s + 1] === "?" && t[s + 2] === "<" && s + 3 < a && !"=!>)".includes(t[s + 3])) {
				r += "(?P<", s += 3, i = !0;
				continue;
			}
			let c = t.codePointAt(s), l = k.charCount(c);
			r += t.substring(s, s + l), s += l;
		}
		let c = i ? r : t;
		return n.length > 0 ? `(?${n})${c}` : c;
	}
}, ru = class e {
	static CASE_INSENSITIVE = Ec.CASE_INSENSITIVE;
	static DOTALL = Ec.DOTALL;
	static MULTILINE = Ec.MULTILINE;
	static DISABLE_UNICODE_GROUPS = Ec.DISABLE_UNICODE_GROUPS;
	static LONGEST_MATCH = Ec.LONGEST_MATCH;
	static LOOKBEHINDS = Ec.LOOKBEHINDS;
	static quote(e) {
		return k.quoteMeta(e);
	}
	static quoteReplacement(e, t = !1) {
		return $c.quoteReplacement(e, t);
	}
	static translateRegExp(e) {
		return nu.translate(e);
	}
	static compile(t, n = 0) {
		let r = t;
		if ((n & e.CASE_INSENSITIVE) !== 0 && (r = `(?i)${r}`), (n & e.DOTALL) !== 0 && (r = `(?s)${r}`), (n & e.MULTILINE) !== 0 && (r = `(?m)${r}`), (n & ~(e.MULTILINE | e.DOTALL | e.CASE_INSENSITIVE | e.DISABLE_UNICODE_GROUPS | e.LONGEST_MATCH | e.LOOKBEHINDS)) !== 0) throw new Zc("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");
		let i = w.PERL;
		(n & e.DISABLE_UNICODE_GROUPS) !== 0 && (i &= ~w.UNICODE_GROUPS), (n & e.LOOKBEHINDS) !== 0 && (i |= w.LOOKBEHIND);
		let a = new e(t, n);
		return a.re2Input = tu.compileImpl(r, i, (n & e.LONGEST_MATCH) !== 0), a;
	}
	static matches(t, n) {
		return e.compile(t).testExact(n);
	}
	static initTest(t, n, r) {
		if (t == null) throw Error("pattern is null");
		if (r == null) throw Error("re2 is null");
		let i = new e(t, n);
		return i.re2Input = r, i;
	}
	constructor(e, t) {
		this.patternInput = e, this.flagsInput = t, this.re2Input = null;
	}
	reset() {
		this.re2Input.reset();
	}
	flags() {
		return this.flagsInput;
	}
	pattern() {
		return this.patternInput;
	}
	re2() {
		return this.re2Input;
	}
	matches(e) {
		return this.testExact(e);
	}
	matcher(e) {
		return k.isByteArray(e) && (e = Wc.utf8(e)), new $c(this, e);
	}
	test(e) {
		return k.isByteArray(e) ? this.re2Input.matchUTF8(e) : this.re2Input.match(e);
	}
	testExact(e) {
		let t = k.isByteArray(e) ? A.fromUTF8(e) : A.fromUTF16(e);
		return this.re2Input.executeEngine(t, 0, w.ANCHOR_BOTH, 0) !== null;
	}
	exec(e) {
		let t = this.matcher(e);
		if (!t.find()) return null;
		let n = [t.group(0)];
		for (let e = 1; e <= t.groupCount(); e++) {
			let r = t.group(e);
			n.push(r === null ? void 0 : r);
		}
		n.index = t.start(0), n.input = e;
		let r = this.namedGroups();
		if (Object.keys(r).length > 0) {
			let e = t.getNamedGroups();
			for (let t in e) e[t] === null && (e[t] = void 0);
			n.groups = e;
		} else n.groups = void 0;
		return n;
	}
	split(e, t = 0) {
		let n = this.matcher(e), r = [], i = 0, a = 0;
		for (; n.find();) {
			if (a === 0 && n.end() === 0) {
				a = n.end();
				continue;
			}
			if (t > 0 && r.length === t - 1) break;
			if (a === n.start()) {
				if (t === 0) {
					i += 1, a = n.end();
					continue;
				}
			} else for (; i > 0;) r.push(""), --i;
			r.push(n.substring(a, n.start())), a = n.end();
		}
		if (t === 0 && a !== n.inputLength()) {
			for (; i > 0;) r.push(""), --i;
			r.push(n.substring(a, n.inputLength()));
		}
		return (t !== 0 || r.length === 0 && !(a === n.inputLength() && a > 0)) && r.push(n.substring(a, n.inputLength())), r;
	}
	*matchAll(e) {
		let t = this.matcher(e);
		for (; t.find();) {
			let n = [t.group(0)];
			for (let e = 1; e <= t.groupCount(); e++) {
				let r = t.group(e);
				n.push(r === null ? void 0 : r);
			}
			n.index = t.start(0), n.input = e;
			let r = this.namedGroups();
			if (Object.keys(r).length > 0) {
				let e = t.getNamedGroups();
				for (let t in e) e[t] === null && (e[t] = void 0);
				n.groups = e;
			} else n.groups = void 0;
			yield n;
		}
	}
	toString() {
		return this.patternInput;
	}
	programSize() {
		return this.re2Input.numberOfInstructions();
	}
	groupCount() {
		return this.re2Input.numberOfCapturingGroups();
	}
	namedGroups() {
		return this.re2Input.namedGroups;
	}
	equals(e) {
		return this === e ? !0 : e === null || this.constructor !== e.constructor ? !1 : this.flagsInput === e.flagsInput && this.patternInput === e.patternInput;
	}
}, iu = "12.18.0";
function au(e) {
	iu = e;
}
var ou = new He("@firebase/firestore");
function su() {
	return ou.logLevel;
}
function I(e, ...t) {
	if (ou.logLevel <= b.DEBUG) {
		let n = t.map(uu);
		ou.debug(`Firestore (${iu}): ${e}`, ...n);
	}
}
function cu(e, ...t) {
	if (ou.logLevel <= b.ERROR) {
		let n = t.map(uu);
		ou.error(`Firestore (${iu}): ${e}`, ...n);
	}
}
function lu(e, ...t) {
	if (ou.logLevel <= b.WARN) {
		let n = t.map(uu);
		ou.warn(`Firestore (${iu}): ${e}`, ...n);
	}
}
function uu(e) {
	if (typeof e == "string") return e;
	try {
		return function(e) {
			return JSON.stringify(e);
		}(e);
	} catch {
		return e;
	}
}
function L(e, t, n) {
	let r = "Unexpected state";
	typeof t == "string" ? r = t : n = t, du(e, r, n);
}
function du(e, t, n) {
	let r = `FIRESTORE (${iu}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;
	if (n !== void 0) try {
		r += " CONTEXT: " + JSON.stringify(n);
	} catch {
		r += " CONTEXT: " + n;
	}
	throw cu(r), Error(r);
}
function R(e, t, n, r) {
	let i = "Unexpected state";
	typeof n == "string" ? i = n : r = n, e || du(t, i, r);
}
function z(e, t) {
	return e;
}
function fu(e) {
	let t = typeof self < "u" && (self.crypto || self.msCrypto), n = new Uint8Array(e);
	if (t && typeof t.getRandomValues == "function") t.getRandomValues(n);
	else for (let t = 0; t < e; t++) n[t] = Math.floor(256 * Math.random());
	return n;
}
var pu = class {
	static newId() {
		let e = "";
		for (; e.length < 20;) {
			let t = fu(40);
			for (let n = 0; n < t.length; ++n) e.length < 20 && t[n] < 248 && (e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(t[n] % 62));
		}
		return e;
	}
};
function B(e, t) {
	return e < t ? -1 : +(e > t);
}
function mu(e, t) {
	let n = Math.min(e.length, t.length);
	for (let r = 0; r < n; r++) {
		let n = e.charAt(r), i = t.charAt(r);
		if (n !== i) return _u(n) === _u(i) ? B(n, i) : _u(n) ? 1 : -1;
	}
	return B(e.length, t.length);
}
var hu = 55296, gu = 57343;
function _u(e) {
	let t = e.charCodeAt(0);
	return t >= hu && t <= gu;
}
function vu(e, t, n) {
	return e.length === t.length && e.every(((e, r) => n(e, t[r])));
}
var yu = class e {
	constructor(e, t) {
		this.comparator = e, this.root = t || xu.EMPTY;
	}
	insert(t, n) {
		return new e(this.comparator, this.root.insert(t, n, this.comparator).copy(null, null, xu.BLACK, null, null));
	}
	remove(t) {
		return new e(this.comparator, this.root.remove(t, this.comparator).copy(null, null, xu.BLACK, null, null));
	}
	get(e) {
		let t = this.root;
		for (; !t.isEmpty();) {
			let n = this.comparator(e, t.key);
			if (n === 0) return t.value;
			n < 0 ? t = t.left : n > 0 && (t = t.right);
		}
		return null;
	}
	indexOf(e) {
		let t = 0, n = this.root;
		for (; !n.isEmpty();) {
			let r = this.comparator(e, n.key);
			if (r === 0) return t + n.left.size;
			r < 0 ? n = n.left : (t += n.left.size + 1, n = n.right);
		}
		return -1;
	}
	isEmpty() {
		return this.root.isEmpty();
	}
	get size() {
		return this.root.size;
	}
	minKey() {
		return this.root.minKey();
	}
	maxKey() {
		return this.root.maxKey();
	}
	inorderTraversal(e) {
		return this.root.inorderTraversal(e);
	}
	forEach(e) {
		this.inorderTraversal(((t, n) => (e(t, n), !1)));
	}
	toString() {
		let e = [];
		return this.inorderTraversal(((t, n) => (e.push(`${t}:${n}`), !1))), `{${e.join(", ")}}`;
	}
	reverseTraversal(e) {
		return this.root.reverseTraversal(e);
	}
	getIterator() {
		return new bu(this.root, null, this.comparator, !1);
	}
	getIteratorFrom(e) {
		return new bu(this.root, e, this.comparator, !1);
	}
	getReverseIterator() {
		return new bu(this.root, null, this.comparator, !0);
	}
	getReverseIteratorFrom(e) {
		return new bu(this.root, e, this.comparator, !0);
	}
}, bu = class {
	constructor(e, t, n, r) {
		this.isReverse = r, this.nodeStack = [];
		let i = 1;
		for (; !e.isEmpty();) if (i = t ? n(e.key, t) : 1, t && r && (i *= -1), i < 0) e = this.isReverse ? e.left : e.right;
		else {
			if (i === 0) {
				this.nodeStack.push(e);
				break;
			}
			this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
		}
	}
	getNext() {
		let e = this.nodeStack.pop(), t = {
			key: e.key,
			value: e.value
		};
		if (this.isReverse) for (e = e.left; !e.isEmpty();) this.nodeStack.push(e), e = e.right;
		else for (e = e.right; !e.isEmpty();) this.nodeStack.push(e), e = e.left;
		return t;
	}
	hasNext() {
		return this.nodeStack.length > 0;
	}
	peek() {
		if (this.nodeStack.length === 0) return null;
		let e = this.nodeStack[this.nodeStack.length - 1];
		return {
			key: e.key,
			value: e.value
		};
	}
}, xu = class e {
	constructor(t, n, r, i, a) {
		this.key = t, this.value = n, this.color = r ?? e.RED, this.left = i ?? e.EMPTY, this.right = a ?? e.EMPTY, this.size = this.left.size + 1 + this.right.size;
	}
	copy(t, n, r, i, a) {
		return new e(t ?? this.key, n ?? this.value, r ?? this.color, i ?? this.left, a ?? this.right);
	}
	isEmpty() {
		return !1;
	}
	inorderTraversal(e) {
		return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
	}
	reverseTraversal(e) {
		return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
	}
	min() {
		return this.left.isEmpty() ? this : this.left.min();
	}
	minKey() {
		return this.min().key;
	}
	maxKey() {
		return this.right.isEmpty() ? this.key : this.right.maxKey();
	}
	insert(e, t, n) {
		let r = this, i = n(e, r.key);
		return r = i < 0 ? r.copy(null, null, null, r.left.insert(e, t, n), null) : i === 0 ? r.copy(null, t, null, null, null) : r.copy(null, null, null, null, r.right.insert(e, t, n)), r.fixUp();
	}
	removeMin() {
		if (this.left.isEmpty()) return e.EMPTY;
		let t = this;
		return t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()), t = t.copy(null, null, null, t.left.removeMin(), null), t.fixUp();
	}
	remove(t, n) {
		let r, i = this;
		if (n(t, i.key) < 0) i.left.isEmpty() || i.left.isRed() || i.left.left.isRed() || (i = i.moveRedLeft()), i = i.copy(null, null, null, i.left.remove(t, n), null);
		else {
			if (i.left.isRed() && (i = i.rotateRight()), i.right.isEmpty() || i.right.isRed() || i.right.left.isRed() || (i = i.moveRedRight()), n(t, i.key) === 0) {
				if (i.right.isEmpty()) return e.EMPTY;
				r = i.right.min(), i = i.copy(r.key, r.value, null, null, i.right.removeMin());
			}
			i = i.copy(null, null, null, null, i.right.remove(t, n));
		}
		return i.fixUp();
	}
	isRed() {
		return this.color;
	}
	fixUp() {
		let e = this;
		return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
	}
	moveRedLeft() {
		let e = this.colorFlip();
		return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
	}
	moveRedRight() {
		let e = this.colorFlip();
		return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
	}
	rotateLeft() {
		let t = this.copy(null, null, e.RED, null, this.right.left);
		return this.right.copy(null, null, this.color, t, null);
	}
	rotateRight() {
		let t = this.copy(null, null, e.RED, this.left.right, null);
		return this.left.copy(null, null, this.color, null, t);
	}
	colorFlip() {
		let e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
		return this.copy(null, null, !this.color, e, t);
	}
	checkMaxDepth() {
		return 2 ** this.check() <= this.size + 1;
	}
	check() {
		if (this.isRed() && this.left.isRed()) throw L(43730, {
			key: this.key,
			value: this.value
		});
		if (this.right.isRed()) throw L(14113, {
			key: this.key,
			value: this.value
		});
		let e = this.left.check();
		if (e !== this.right.check()) throw L(27949);
		return e + +!this.isRed();
	}
};
xu.EMPTY = null, xu.RED = !0, xu.BLACK = !1, xu.EMPTY = new class {
	constructor() {
		this.size = 0;
	}
	get key() {
		throw L(57766);
	}
	get value() {
		throw L(16141);
	}
	get color() {
		throw L(16727);
	}
	get left() {
		throw L(29726);
	}
	get right() {
		throw L(36894);
	}
	copy(e, t, n, r, i) {
		return this;
	}
	insert(e, t, n) {
		return new xu(e, t);
	}
	remove(e, t) {
		return this;
	}
	isEmpty() {
		return !0;
	}
	inorderTraversal(e) {
		return !1;
	}
	reverseTraversal(e) {
		return !1;
	}
	minKey() {
		return null;
	}
	maxKey() {
		return null;
	}
	isRed() {
		return !1;
	}
	checkMaxDepth() {
		return !0;
	}
	check() {
		return 0;
	}
}();
var Su = class e {
	constructor(e) {
		this.comparator = e, this.data = new yu(this.comparator);
	}
	has(e) {
		return this.data.get(e) !== null;
	}
	first() {
		return this.data.minKey();
	}
	last() {
		return this.data.maxKey();
	}
	get size() {
		return this.data.size;
	}
	indexOf(e) {
		return this.data.indexOf(e);
	}
	forEach(e) {
		this.data.inorderTraversal(((t, n) => (e(t), !1)));
	}
	forEachInRange(e, t) {
		let n = this.data.getIteratorFrom(e[0]);
		for (; n.hasNext();) {
			let r = n.getNext();
			if (this.comparator(r.key, e[1]) >= 0) return;
			t(r.key);
		}
	}
	forEachWhile(e, t) {
		let n;
		for (n = t === void 0 ? this.data.getIterator() : this.data.getIteratorFrom(t); n.hasNext();) if (!e(n.getNext().key)) return;
	}
	firstAfterOrEqual(e) {
		let t = this.data.getIteratorFrom(e);
		return t.hasNext() ? t.getNext().key : null;
	}
	getIterator() {
		return new Cu(this.data.getIterator());
	}
	getIteratorFrom(e) {
		return new Cu(this.data.getIteratorFrom(e));
	}
	add(e) {
		return this.copy(this.data.remove(e).insert(e, !0));
	}
	delete(e) {
		return this.has(e) ? this.copy(this.data.remove(e)) : this;
	}
	isEmpty() {
		return this.data.isEmpty();
	}
	unionWith(e) {
		let t = this;
		return t.size < e.size && (t = e, e = this), e.forEach(((e) => {
			t = t.add(e);
		})), t;
	}
	isEqual(t) {
		if (!(t instanceof e) || this.size !== t.size) return !1;
		let n = this.data.getIterator(), r = t.data.getIterator();
		for (; n.hasNext();) {
			let e = n.getNext().key, t = r.getNext().key;
			if (this.comparator(e, t) !== 0) return !1;
		}
		return !0;
	}
	toArray() {
		let e = [];
		return this.forEach(((t) => {
			e.push(t);
		})), e;
	}
	toString() {
		let e = [];
		return this.forEach(((t) => e.push(t))), "SortedSet(" + e.toString() + ")";
	}
	copy(t) {
		let n = new e(this.comparator);
		return n.data = t, n;
	}
}, Cu = class {
	constructor(e) {
		this.iter = e;
	}
	getNext() {
		return this.iter.getNext().key;
	}
	hasNext() {
		return this.iter.hasNext();
	}
}, V = {
	OK: "ok",
	CANCELLED: "cancelled",
	UNKNOWN: "unknown",
	INVALID_ARGUMENT: "invalid-argument",
	DEADLINE_EXCEEDED: "deadline-exceeded",
	NOT_FOUND: "not-found",
	ALREADY_EXISTS: "already-exists",
	PERMISSION_DENIED: "permission-denied",
	UNAUTHENTICATED: "unauthenticated",
	RESOURCE_EXHAUSTED: "resource-exhausted",
	FAILED_PRECONDITION: "failed-precondition",
	ABORTED: "aborted",
	OUT_OF_RANGE: "out-of-range",
	UNIMPLEMENTED: "unimplemented",
	INTERNAL: "internal",
	UNAVAILABLE: "unavailable",
	DATA_LOSS: "data-loss"
}, H = class extends de {
	constructor(e, t) {
		super(e, t), this.code = e, this.message = t, this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
	}
}, wu = "__name__", Tu = class e {
	constructor(e, t, n) {
		t === void 0 ? t = 0 : t > e.length && L(637, {
			offset: t,
			range: e.length
		}), n === void 0 ? n = e.length - t : n > e.length - t && L(1746, {
			length: n,
			range: e.length - t
		}), this.segments = e, this.offset = t, this.len = n;
	}
	get length() {
		return this.len;
	}
	isEqual(t) {
		return e.comparator(this, t) === 0;
	}
	child(t) {
		let n = this.segments.slice(this.offset, this.limit());
		return t instanceof e ? t.forEach(((e) => {
			n.push(e);
		})) : n.push(t), this.construct(n);
	}
	limit() {
		return this.offset + this.length;
	}
	popFirst(e) {
		return e = e === void 0 ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
	}
	popLast() {
		return this.construct(this.segments, this.offset, this.length - 1);
	}
	firstSegment() {
		return this.segments[this.offset];
	}
	lastSegment() {
		return this.get(this.length - 1);
	}
	get(e) {
		return this.segments[this.offset + e];
	}
	isEmpty() {
		return this.length === 0;
	}
	isPrefixOf(e) {
		if (e.length < this.length) return !1;
		for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
		return !0;
	}
	isImmediateParentOf(e) {
		if (this.length + 1 !== e.length) return !1;
		for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
		return !0;
	}
	forEach(e) {
		for (let t = this.offset, n = this.limit(); t < n; t++) e(this.segments[t]);
	}
	toArray() {
		return this.segments.slice(this.offset, this.limit());
	}
	static comparator(t, n) {
		let r = Math.min(t.length, n.length);
		for (let i = 0; i < r; i++) {
			let r = e.compareSegments(t.get(i), n.get(i));
			if (r !== 0) return r;
		}
		return B(t.length, n.length);
	}
	static compareSegments(t, n) {
		let r = e.isNumericId(t), i = e.isNumericId(n);
		return r && !i ? -1 : !r && i ? 1 : r && i ? e.extractNumericId(t).compare(e.extractNumericId(n)) : mu(t, n);
	}
	static isNumericId(e) {
		return e.startsWith("__id") && e.endsWith("__");
	}
	static extractNumericId(e) {
		return mc.fromString(e.substring(4, e.length - 2));
	}
}, U = class e extends Tu {
	construct(t, n, r) {
		return new e(t, n, r);
	}
	canonicalString() {
		return this.toArray().join("/");
	}
	toString() {
		return this.canonicalString();
	}
	toStringWithLeadingSlash() {
		return `/${this.canonicalString()}`;
	}
	toUriEncodedString() {
		return this.toArray().map(encodeURIComponent).join("/");
	}
	static fromString(...t) {
		let n = [];
		for (let e of t) {
			if (e.indexOf("//") >= 0) throw new H(V.INVALID_ARGUMENT, `Invalid segment (${e}). Paths must not contain // in them.`);
			n.push(...e.split("/").filter(((e) => e.length > 0)));
		}
		return new e(n);
	}
	static emptyPath() {
		return new e([]);
	}
}, Eu = /^[_a-zA-Z][_a-zA-Z0-9]*$/, Du = class e extends Tu {
	construct(t, n, r) {
		return new e(t, n, r);
	}
	static isValidIdentifier(e) {
		return Eu.test(e);
	}
	canonicalString() {
		return this.toArray().map(((t) => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), e.isValidIdentifier(t) || (t = "`" + t + "`"), t))).join(".");
	}
	toString() {
		return this.canonicalString();
	}
	isKeyField() {
		return this.length === 1 && this.get(0) === wu;
	}
	static keyField() {
		return new e([wu]);
	}
	static fromServerFormat(t) {
		let n = [], r = "", i = 0, a = () => {
			if (r.length === 0) throw new H(V.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
			n.push(r), r = "";
		}, o = !1;
		for (; i < t.length;) {
			let e = t[i];
			if (e === "\\") {
				if (i + 1 === t.length) throw new H(V.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
				let e = t[i + 1];
				if (e !== "\\" && e !== "." && e !== "`") throw new H(V.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
				r += e, i += 2;
			} else e === "`" ? (o = !o, i++) : e !== "." || o ? (r += e, i++) : (a(), i++);
		}
		if (a(), o) throw new H(V.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
		return new e(n);
	}
	static emptyPath() {
		return new e([]);
	}
}, Ou = class e {
	constructor(e) {
		this.fields = e, e.sort(Du.comparator);
	}
	static empty() {
		return new e([]);
	}
	unionWith(t) {
		let n = new Su(Du.comparator);
		for (let e of this.fields) n = n.add(e);
		for (let e of t) n = n.add(e);
		return new e(n.toArray());
	}
	covers(e) {
		for (let t of this.fields) if (t.isPrefixOf(e)) return !0;
		return !1;
	}
	isEqual(e) {
		return vu(this.fields, e.fields, ((e, t) => e.isEqual(t)));
	}
};
function ku(e) {
	let t = 0;
	for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t++;
	return t;
}
function Au(e, t) {
	for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t(n, e[n]);
}
function ju(e, t) {
	let n = [];
	for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && n.push(t(e[r], r, e));
	return n;
}
function Mu(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
	return !0;
}
var W = class e {
	constructor(e) {
		this.path = e;
	}
	static fromPath(t) {
		return new e(U.fromString(t));
	}
	static fromName(t) {
		return new e(U.fromString(t).popFirst(5));
	}
	static empty() {
		return new e(U.emptyPath());
	}
	get collectionGroup() {
		return this.path.popLast().lastSegment();
	}
	hasCollectionId(e) {
		return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
	}
	getCollectionGroup() {
		return this.path.get(this.path.length - 2);
	}
	getCollectionPath() {
		return this.path.popLast();
	}
	isEqual(e) {
		return e !== null && U.comparator(this.path, e.path) === 0;
	}
	toString() {
		return this.path.toString();
	}
	static comparator(e, t) {
		return U.comparator(e.path, t.path);
	}
	static isDocumentKey(e) {
		return e.length % 2 == 0;
	}
	static fromSegments(t) {
		return new e(new U(t.slice()));
	}
};
function Nu(e, t, n) {
	if (!n) throw new H(V.INVALID_ARGUMENT, `Function ${e}() cannot be called with an empty ${t}.`);
}
function Pu(e, t, n, r) {
	if (!0 === t && !0 === r) throw new H(V.INVALID_ARGUMENT, `${e} and ${n} cannot be used together.`);
}
function Fu(e) {
	if (!W.isDocumentKey(e)) throw new H(V.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`);
}
function Iu(e) {
	if (W.isDocumentKey(e)) throw new H(V.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`);
}
function Lu(e) {
	return typeof e == "object" && !!e && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
function Ru(e) {
	if (e === void 0) return "undefined";
	if (e === null) return "null";
	if (typeof e == "string") return e.length > 20 && (e = `${e.substring(0, 20)}...`), JSON.stringify(e);
	if (typeof e == "number" || typeof e == "boolean") return "" + e;
	if (typeof e == "object") {
		if (e instanceof Array) return "an array";
		{
			let t = function(e) {
				return e.constructor ? e.constructor.name : null;
			}(e);
			return t ? `a custom ${t} object` : "an object";
		}
	}
	return typeof e == "function" ? "a function" : L(12329, { type: typeof e });
}
function zu(e, t) {
	if ("_delegate" in e && (e = e._delegate), !(e instanceof t)) {
		if (t.name === e.constructor.name) throw new H(V.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
		{
			let n = Ru(e);
			throw new H(V.INVALID_ARGUMENT, `Expected type '${t.name}', but it was: ${n}`);
		}
	}
	return e;
}
function Bu(e, t) {
	let n = { typeString: e };
	return t && (n.value = t), n;
}
function Vu(e, t) {
	if (!Lu(e)) throw new H(V.INVALID_ARGUMENT, "JSON must be an object");
	let n;
	for (let r in t) if (t[r]) {
		let i = t[r].typeString, a = "value" in t[r] ? { value: t[r].value } : void 0;
		if (!(r in e)) {
			n = `JSON missing required field: '${r}'`;
			break;
		}
		let o = e[r];
		if (i && typeof o !== i) {
			n = `JSON field '${r}' must be a ${i}.`;
			break;
		}
		if (a !== void 0 && o !== a.value) {
			n = `Expected '${r}' field to equal '${a.value}'`;
			break;
		}
	}
	if (n) throw new H(V.INVALID_ARGUMENT, n);
	return !0;
}
var Hu = -62135596800, Uu = 1e6, Wu = class e {
	static now() {
		return e.fromMillis(Date.now());
	}
	static fromDate(t) {
		return e.fromMillis(t.getTime());
	}
	static fromMillis(t) {
		let n = Math.floor(t / 1e3), r = Math.floor((t - 1e3 * n) * Uu);
		return new e(n, r);
	}
	constructor(e, t) {
		if (this.seconds = e, this.nanoseconds = t, t < 0 || t >= 1e9) throw new H(V.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
		if (e < Hu || e >= 253402300800) throw new H(V.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
	}
	toDate() {
		return new Date(this.toMillis());
	}
	toMillis() {
		return 1e3 * this.seconds + this.nanoseconds / Uu;
	}
	_compareTo(e) {
		return this.seconds === e.seconds ? B(this.nanoseconds, e.nanoseconds) : B(this.seconds, e.seconds);
	}
	isEqual(e) {
		return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
	}
	toString() {
		return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
	}
	toJSON() {
		return {
			type: e._jsonSchemaVersion,
			seconds: this.seconds,
			nanoseconds: this.nanoseconds
		};
	}
	static fromJSON(t) {
		if (Vu(t, e._jsonSchema)) return new e(t.seconds, t.nanoseconds);
	}
	valueOf() {
		let e = this.seconds - Hu;
		return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
	}
};
Wu._jsonSchemaVersion = "firestore/timestamp/1.0", Wu._jsonSchema = {
	type: Bu("string", Wu._jsonSchemaVersion),
	seconds: Bu("number"),
	nanoseconds: Bu("number")
};
var Gu = class extends Error {
	constructor() {
		super(...arguments), this.name = "Base64DecodeError";
	}
}, Ku = class e {
	constructor(e) {
		this.binaryString = e;
	}
	static fromBase64String(t) {
		let n = function(e) {
			try {
				return atob(e);
			} catch (e) {
				throw typeof DOMException < "u" && e instanceof DOMException ? new Gu("Invalid base64 string: " + e) : e;
			}
		}(t);
		return new e(n);
	}
	static fromUint8Array(t) {
		let n = function(e) {
			let t = "";
			for (let n = 0; n < e.length; ++n) t += String.fromCharCode(e[n]);
			return t;
		}(t);
		return new e(n);
	}
	[Symbol.iterator]() {
		let e = 0;
		return { next: () => e < this.binaryString.length ? {
			value: this.binaryString.charCodeAt(e++),
			done: !1
		} : {
			value: void 0,
			done: !0
		} };
	}
	toBase64() {
		return function(e) {
			return btoa(e);
		}(this.binaryString);
	}
	toUint8Array() {
		return function(e) {
			let t = new Uint8Array(e.length);
			for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
			return t;
		}(this.binaryString);
	}
	approximateByteSize() {
		return 2 * this.binaryString.length;
	}
	compareTo(e) {
		return B(this.binaryString, e.binaryString);
	}
	isEqual(e) {
		return this.binaryString === e.binaryString;
	}
};
Ku.EMPTY_BYTE_STRING = new Ku("");
var qu = /* @__PURE__ */ new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function Ju(e) {
	if (R(!!e, 39018), typeof e == "string") {
		let t = 0, n = qu.exec(e);
		if (R(!!n, 46558, { timestamp: e }), n[1]) {
			let e = n[1];
			e = (e + "000000000").substr(0, 9), t = Number(e);
		}
		let r = new Date(e);
		return {
			seconds: Math.floor(r.getTime() / 1e3),
			nanos: t
		};
	}
	return {
		seconds: G(e.seconds),
		nanos: G(e.nanos)
	};
}
function G(e) {
	return typeof e == "number" ? e : typeof e == "string" ? Number(e) : 0;
}
function Yu(e) {
	return typeof e == "string" ? Ku.fromBase64String(e) : Ku.fromUint8Array(e);
}
var Xu = "server_timestamp", Zu = "__type__", Qu = "__previous_value__", $u = "__local_write_time__";
function ed(e) {
	return (e?.mapValue?.fields || {})[Zu]?.stringValue === Xu;
}
function td(e) {
	let t = e.mapValue.fields[Qu];
	return ed(t) ? td(t) : t;
}
function nd(e) {
	let t = Ju(e.mapValue.fields[$u].timestampValue);
	return new Wu(t.seconds, t.nanos);
}
var rd = class {
	constructor(e, t, n, r, i, a, o, s, c, l, u, d, f) {
		this.databaseId = e, this.appId = t, this.persistenceKey = n, this.host = r, this.ssl = i, this.forceLongPolling = a, this.autoDetectLongPolling = o, this.longPollingOptions = s, this.useFetchStreams = c, this.isUsingEmulator = l, this.apiKey = u, this._customHeaders = d, this.grpcFlowControlWindow = f;
	}
}, id = "(default)", ad = class e {
	constructor(e, t) {
		this.projectId = e, this.database = t || id;
	}
	static empty() {
		return new e("", "");
	}
	get isDefaultDatabase() {
		return this.database === id;
	}
	isEqual(t) {
		return t instanceof e && t.projectId === this.projectId && t.database === this.database;
	}
};
function od(e, t) {
	if (!Object.prototype.hasOwnProperty.apply(e.options, ["projectId"])) throw new H(V.INVALID_ARGUMENT, "\"projectId\" not provided in firebase.initializeApp.");
	return new ad(e.options.projectId, t);
}
var sd = -1;
function cd(e) {
	return e == null;
}
function ld(e) {
	return e === 0 && 1 / e == -1 / 0;
}
function ud(e) {
	return typeof e == "number" && Number.isInteger(e) && !ld(e) && e <= 2 ** 53 - 1 && e >= -(2 ** 53 - 1);
}
function dd(e) {
	return typeof e == "string";
}
var fd = "__type__", pd = "__max__", md = { mapValue: { fields: { __type__: { stringValue: pd } } } }, hd = "__vector__", gd = "value", _d = { nullValue: "NULL_VALUE" }, vd = { booleanValue: !0 }, yd = { booleanValue: !1 };
function bd(e) {
	return "nullValue" in e ? 0 : "booleanValue" in e ? 1 : "integerValue" in e || "doubleValue" in e ? 2 : "timestampValue" in e ? 3 : "stringValue" in e ? 5 : "bytesValue" in e ? 6 : "referenceValue" in e ? 7 : "geoPointValue" in e ? 8 : "arrayValue" in e ? 9 : "mapValue" in e ? ed(e) ? 4 : Bd(e) ? 9007199254740991 : Ld(e) ? 10 : 11 : L(28295, { value: e });
}
function xd(e, t, n) {
	if (e === t) return !0;
	let r = bd(e);
	if (r !== bd(t)) return !1;
	switch (r) {
		case 0:
		case 9007199254740991: return !0;
		case 1: return e.booleanValue === t.booleanValue;
		case 4: return nd(e).isEqual(nd(t));
		case 3: return function(e, t) {
			if (typeof e.timestampValue == "string" && typeof t.timestampValue == "string" && e.timestampValue.length === t.timestampValue.length) return e.timestampValue === t.timestampValue;
			let n = Ju(e.timestampValue), r = Ju(t.timestampValue);
			return n.seconds === r.seconds && n.nanos === r.nanos;
		}(e, t);
		case 5: return e.stringValue === t.stringValue;
		case 6: return function(e, t) {
			return Yu(e.bytesValue).isEqual(Yu(t.bytesValue));
		}(e, t);
		case 7: return e.referenceValue === t.referenceValue;
		case 8: return function(e, t) {
			return G(e.geoPointValue.latitude) === G(t.geoPointValue.latitude) && G(e.geoPointValue.longitude) === G(t.geoPointValue.longitude);
		}(e, t);
		case 2: return function(e, t, n) {
			if ("integerValue" in e && "integerValue" in t) return G(e.integerValue) === G(t.integerValue);
			let r, i;
			if ("doubleValue" in e && "doubleValue" in t) r = G(e.doubleValue), i = G(t.doubleValue);
			else {
				if (!n?.t) return !1;
				r = G(e.integerValue ?? e.doubleValue), i = G(t.integerValue ?? t.doubleValue);
			}
			return r === i ? !!n?.i || ld(r) === ld(i) : !!(n === void 0 || n.o) && isNaN(r) && isNaN(i);
		}(e, t, n);
		case 9: return vu(e.arrayValue.values || [], t.arrayValue.values || [], ((e, t) => xd(e, t, n)));
		case 10:
		case 11: return function(e, t, n) {
			let r = e.mapValue.fields || {}, i = t.mapValue.fields || {};
			if (ku(r) !== ku(i)) return !1;
			for (let e in r) if (r.hasOwnProperty(e) && (i[e] === void 0 || !xd(r[e], i[e], n))) return !1;
			return !0;
		}(e, t, n);
		default: return L(52216, { left: e });
	}
}
function Sd(e, t) {
	return (e.values || []).find(((e) => xd(e, t))) !== void 0;
}
function Cd(e, t) {
	if (e === t) return 0;
	let n = bd(e), r = bd(t);
	if (n !== r) return B(n, r);
	switch (n) {
		case 0:
		case 9007199254740991: return 0;
		case 1: return B(e.booleanValue, t.booleanValue);
		case 2: return function(e, t) {
			let n = G(e.integerValue || e.doubleValue), r = G(t.integerValue || t.doubleValue);
			return n < r ? -1 : n > r ? 1 : n === r ? 0 : isNaN(n) ? isNaN(r) ? 0 : -1 : 1;
		}(e, t);
		case 3: return wd(e.timestampValue, t.timestampValue);
		case 4: return wd(nd(e), nd(t));
		case 5: return mu(e.stringValue, t.stringValue);
		case 6: return function(e, t) {
			let n = Yu(e), r = Yu(t);
			return n.compareTo(r);
		}(e.bytesValue, t.bytesValue);
		case 7: return function(e, t) {
			let n = e.split("/"), r = t.split("/");
			for (let e = 0; e < n.length && e < r.length; e++) {
				let t = B(n[e], r[e]);
				if (t !== 0) return t;
			}
			return B(n.length, r.length);
		}(e.referenceValue, t.referenceValue);
		case 8: return function(e, t) {
			let n = B(G(e.latitude), G(t.latitude));
			return n === 0 ? B(G(e.longitude), G(t.longitude)) : n;
		}(e.geoPointValue, t.geoPointValue);
		case 9: return Td(e.arrayValue, t.arrayValue);
		case 10: return function(e, t) {
			let n = e.fields || {}, r = t.fields || {}, i = n[gd]?.arrayValue, a = r[gd]?.arrayValue, o = B(i?.values?.length || 0, a?.values?.length || 0);
			return o === 0 ? Td(i, a) : o;
		}(e.mapValue, t.mapValue);
		case 11: return function(e, t) {
			if (e === md.mapValue && t === md.mapValue) return 0;
			if (e === md.mapValue) return 1;
			if (t === md.mapValue) return -1;
			let n = e.fields || {}, r = Object.keys(n), i = t.fields || {}, a = Object.keys(i);
			r.sort(), a.sort();
			for (let e = 0; e < r.length && e < a.length; ++e) {
				let t = mu(r[e], a[e]);
				if (t !== 0) return t;
				let o = Cd(n[r[e]], i[a[e]]);
				if (o !== 0) return o;
			}
			return B(r.length, a.length);
		}(e.mapValue, t.mapValue);
		default: throw L(23264, { u: n });
	}
}
function wd(e, t) {
	if (typeof e == "string" && typeof t == "string" && e.length === t.length) return B(e, t);
	let n = Ju(e), r = Ju(t), i = B(n.seconds, r.seconds);
	return i === 0 ? B(n.nanos, r.nanos) : i;
}
function Td(e, t) {
	let n = e.values || [], r = t.values || [];
	for (let e = 0; e < n.length && e < r.length; ++e) {
		let t = Cd(n[e], r[e]);
		if (t !== void 0 && t !== 0) return t;
	}
	return B(n.length, r.length);
}
function Ed(e) {
	return Dd(e);
}
function Dd(e) {
	return "nullValue" in e ? "null" : "booleanValue" in e ? "" + e.booleanValue : "integerValue" in e ? "" + e.integerValue : "doubleValue" in e ? "" + e.doubleValue : "timestampValue" in e ? function(e) {
		let t = Ju(e);
		return `time(${t.seconds},${t.nanos})`;
	}(e.timestampValue) : "stringValue" in e ? e.stringValue : "bytesValue" in e ? function(e) {
		return Yu(e).toBase64();
	}(e.bytesValue) : "referenceValue" in e ? function(e) {
		return W.fromName(e).toString();
	}(e.referenceValue) : "geoPointValue" in e ? function(e) {
		return `geo(${e.latitude},${e.longitude})`;
	}(e.geoPointValue) : "arrayValue" in e ? function(e) {
		let t = "[", n = !0;
		for (let r of e.values || []) n ? n = !1 : t += ",", t += Dd(r);
		return t + "]";
	}(e.arrayValue) : "mapValue" in e ? function(e) {
		let t = Object.keys(e.fields || {}).sort(), n = "{", r = !0;
		for (let i of t) r ? r = !1 : n += ",", n += `${i}:${Dd(e.fields[i])}`;
		return n + "}";
	}(e.mapValue) : L(61005, { value: e });
}
function Od(e) {
	switch (bd(e)) {
		case 0:
		case 1: return 4;
		case 2: return 8;
		case 3:
		case 8: return 16;
		case 4:
			let t = td(e);
			return t ? 16 + Od(t) : 16;
		case 5: return 2 * e.stringValue.length;
		case 6: return Yu(e.bytesValue).approximateByteSize();
		case 7: return e.referenceValue.length;
		case 9: return function(e) {
			return (e.values || []).reduce(((e, t) => e + Od(t)), 0);
		}(e.arrayValue);
		case 10:
		case 11: return function(e) {
			let t = 0;
			return Au(e.fields, ((e, n) => {
				t += e.length + Od(n);
			})), t;
		}(e.mapValue);
		default: throw L(13486, { value: e });
	}
}
function kd(e, t) {
	return { referenceValue: `projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}` };
}
function Ad(e) {
	return !!e && "integerValue" in e;
}
function jd(e) {
	return !!e && "doubleValue" in e;
}
function Md(e) {
	return Ad(e) || jd(e);
}
function Nd(e) {
	return !!e && "arrayValue" in e;
}
function Pd(e) {
	return !!e && "nullValue" in e;
}
function Fd(e) {
	return !!e && "doubleValue" in e && isNaN(Number(e.doubleValue));
}
function Id(e) {
	return !!e && "mapValue" in e;
}
function Ld(e) {
	return (e?.mapValue?.fields || {})[fd]?.stringValue === hd;
}
function Rd(e) {
	return (e?.mapValue?.fields || {})[gd]?.arrayValue;
}
function zd(e) {
	if (e.geoPointValue) return { geoPointValue: { ...e.geoPointValue } };
	if (e.timestampValue && typeof e.timestampValue == "object") return { timestampValue: { ...e.timestampValue } };
	if (e.mapValue) {
		let t = { mapValue: { fields: {} } };
		return Au(e.mapValue.fields, ((e, n) => t.mapValue.fields[e] = zd(n))), t;
	}
	if (e.arrayValue) {
		let t = { arrayValue: { values: [] } };
		for (let n = 0; n < (e.arrayValue.values || []).length; ++n) t.arrayValue.values[n] = zd(e.arrayValue.values[n]);
		return t;
	}
	return { ...e };
}
function Bd(e) {
	return (((e.mapValue || {}).fields || {}).__type__ || {}).stringValue === pd;
}
var Vd = class e {
	constructor(e) {
		this.value = e;
	}
	static empty() {
		return new e({ mapValue: {} });
	}
	field(e) {
		if (e.isEmpty()) return this.value;
		{
			let t = this.value;
			for (let n = 0; n < e.length - 1; ++n) if (t = (t.mapValue.fields || {})[e.get(n)], !Id(t)) return null;
			return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
		}
	}
	set(e, t) {
		this.getFieldsMap(e.popLast())[e.lastSegment()] = zd(t);
	}
	setAll(e) {
		let t = Du.emptyPath(), n = {}, r = [];
		e.forEach(((e, i) => {
			if (!t.isImmediateParentOf(i)) {
				let e = this.getFieldsMap(t);
				this.applyChanges(e, n, r), n = {}, r = [], t = i.popLast();
			}
			e ? n[i.lastSegment()] = zd(e) : r.push(i.lastSegment());
		}));
		let i = this.getFieldsMap(t);
		this.applyChanges(i, n, r);
	}
	delete(e) {
		let t = this.field(e.popLast());
		Id(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
	}
	isEqual(e) {
		return xd(this.value, e.value);
	}
	getFieldsMap(e) {
		let t = this.value;
		t.mapValue.fields || (t.mapValue = { fields: {} });
		for (let n = 0; n < e.length; ++n) {
			let r = t.mapValue.fields[e.get(n)];
			Id(r) && r.mapValue.fields || (r = { mapValue: { fields: {} } }, t.mapValue.fields[e.get(n)] = r), t = r;
		}
		return t.mapValue.fields;
	}
	applyChanges(e, t, n) {
		Au(t, ((t, n) => e[t] = n));
		for (let t of n) delete e[t];
	}
	clone() {
		return new e(zd(this.value));
	}
};
function Hd(e) {
	let t = [];
	return Au(e.fields, ((e, n) => {
		let r = new Du([e]);
		if (Id(n)) {
			let e = Hd(n.mapValue).fields;
			if (e.length === 0) t.push(r);
			else for (let n of e) t.push(r.child(n));
		} else t.push(r);
	})), new Ou(t);
}
function Ud(e, t) {
	if (e.useProto3Json) {
		if (isNaN(t)) return { doubleValue: "NaN" };
		if (t === 1 / 0) return { doubleValue: "Infinity" };
		if (t === -1 / 0) return { doubleValue: "-Infinity" };
	}
	return { doubleValue: ld(t) ? "-0" : t };
}
function Wd(e) {
	return { integerValue: "" + e };
}
function Gd(e, t, n) {
	return ud(t) ? Wd(t) : Ud(e, t);
}
var Kd = class {
	constructor() {
		this._ = void 0;
	}
};
function qd(e, t, n) {
	return e instanceof Xd ? function(e, t) {
		let n = { fields: {
			[Zu]: { stringValue: Xu },
			[$u]: { timestampValue: {
				seconds: e.seconds,
				nanos: e.nanoseconds
			} }
		} };
		return t && ed(t) && (t = td(t)), t && (n.fields[Qu] = t), { mapValue: n };
	}(n, t) : e instanceof Zd ? Qd(e, t) : e instanceof $d ? ef(e, t) : e instanceof nf ? function(e, t) {
		let n = Yd(e, t), r = sf(n) + sf(e.l);
		return Ad(n) && Ad(e.l) ? Wd(r) : Ud(e.serializer, r);
	}(e, t) : e instanceof rf ? function(e, t) {
		return of(e, t, Math.min);
	}(e, t) : e instanceof af ? function(e, t) {
		return of(e, t, Math.max);
	}(e, t) : void 0;
}
function Jd(e, t, n) {
	return e instanceof Zd ? Qd(e, t) : e instanceof $d ? ef(e, t) : n;
}
function Yd(e, t) {
	return e instanceof nf ? Md(t) ? t : { integerValue: 0 } : null;
}
var Xd = class extends Kd {}, Zd = class extends Kd {
	constructor(e) {
		super(), this.elements = e;
	}
};
function Qd(e, t) {
	let n = cf(t);
	for (let t of e.elements) n.some(((e) => xd(e, t))) || n.push(t);
	return { arrayValue: { values: n } };
}
var $d = class extends Kd {
	constructor(e) {
		super(), this.elements = e;
	}
};
function ef(e, t) {
	let n = cf(t);
	for (let t of e.elements) n = n.filter(((e) => !xd(e, t)));
	return { arrayValue: { values: n } };
}
var tf = class extends Kd {
	constructor(e, t) {
		super(), this.serializer = e, this.l = t;
	}
}, nf = class extends tf {}, rf = class extends tf {}, af = class extends tf {};
function of(e, t, n) {
	if (!Md(t)) return e.l;
	let r = n(sf(t), sf(e.l));
	return Ad(t) && Ad(e.l) ? Wd(r) : Ud(e.serializer, r);
}
function sf(e) {
	return G(e.integerValue || e.doubleValue);
}
function cf(e) {
	return Nd(e) && e.arrayValue.values ? e.arrayValue.values.slice() : [];
}
var lf = class {
	constructor(e, t) {
		this.field = e, this.transform = t;
	}
};
function uf(e, t) {
	return e.field.isEqual(t.field) && function(e, t) {
		return e instanceof Zd && t instanceof Zd || e instanceof $d && t instanceof $d ? vu(e.elements, t.elements, xd) : e instanceof nf && t instanceof nf || e instanceof rf && t instanceof rf || e instanceof af && t instanceof af ? xd(e.l, t.l) : e instanceof Xd && t instanceof Xd;
	}(e.transform, t.transform);
}
var df = class {
	constructor(e, t) {
		this.version = e, this.transformResults = t;
	}
}, ff = class e {
	constructor(e, t) {
		this.updateTime = e, this.exists = t;
	}
	static none() {
		return new e();
	}
	static exists(t) {
		return new e(void 0, t);
	}
	static updateTime(t) {
		return new e(t);
	}
	get isNone() {
		return this.updateTime === void 0 && this.exists === void 0;
	}
	isEqual(e) {
		return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
	}
};
function pf(e, t) {
	return e.updateTime === void 0 ? e.exists === void 0 || e.exists === t.isFoundDocument() : t.isFoundDocument() && t.version.isEqual(e.updateTime);
}
var mf = class {};
function hf(e, t) {
	if (!e.hasLocalMutations || t && t.fields.length === 0) return null;
	if (t === null) return e.isNoDocument() ? new Tf(e.key, ff.none()) : new bf(e.key, e.data, ff.none());
	{
		let n = e.data, r = Vd.empty(), i = new Su(Du.comparator);
		for (let e of t.fields) if (!i.has(e)) {
			let t = n.field(e);
			t === null && e.length > 1 && (e = e.popLast(), t = n.field(e)), t === null ? r.delete(e) : r.set(e, t), i = i.add(e);
		}
		return new xf(e.key, r, new Ou(i.toArray()), ff.none());
	}
}
function gf(e, t, n) {
	e instanceof bf ? function(e, t, n) {
		let r = e.value.clone(), i = Cf(e.fieldTransforms, t, n.transformResults);
		r.setAll(i), t.convertToFoundDocument(n.version, r).setHasCommittedMutations();
	}(e, t, n) : e instanceof xf ? function(e, t, n) {
		if (!pf(e.precondition, t)) return void t.convertToUnknownDocument(n.version);
		let r = Cf(e.fieldTransforms, t, n.transformResults), i = t.data;
		i.setAll(Sf(e)), i.setAll(r), t.convertToFoundDocument(n.version, i).setHasCommittedMutations();
	}(e, t, n) : function(e, t, n) {
		t.convertToNoDocument(n.version).setHasCommittedMutations();
	}(0, t, n);
}
function _f(e, t, n, r) {
	return e instanceof bf ? function(e, t, n, r) {
		if (!pf(e.precondition, t)) return n;
		let i = e.value.clone(), a = wf(e.fieldTransforms, r, t);
		return i.setAll(a), t.convertToFoundDocument(t.version, i).setHasLocalMutations(), null;
	}(e, t, n, r) : e instanceof xf ? function(e, t, n, r) {
		if (!pf(e.precondition, t)) return n;
		let i = wf(e.fieldTransforms, r, t), a = t.data;
		return a.setAll(Sf(e)), a.setAll(i), t.convertToFoundDocument(t.version, a).setHasLocalMutations(), n === null ? null : n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(((e) => e.field)));
	}(e, t, n, r) : function(e, t, n) {
		return pf(e.precondition, t) ? (t.convertToNoDocument(t.version).setHasLocalMutations(), null) : n;
	}(e, t, n);
}
function vf(e, t) {
	let n = null;
	for (let r of e.fieldTransforms) {
		let e = t.data.field(r.field), i = Yd(r.transform, e || null);
		i != null && (n === null && (n = Vd.empty()), n.set(r.field, i));
	}
	return n || null;
}
function yf(e, t) {
	return e.type === t.type && !!e.key.isEqual(t.key) && !!e.precondition.isEqual(t.precondition) && !!function(e, t) {
		return e === void 0 && t === void 0 || !(!e || !t) && vu(e, t, ((e, t) => uf(e, t)));
	}(e.fieldTransforms, t.fieldTransforms) && (e.type === 0 ? e.value.isEqual(t.value) : e.type !== 1 || e.data.isEqual(t.data) && e.fieldMask.isEqual(t.fieldMask));
}
var bf = class extends mf {
	constructor(e, t, n, r = []) {
		super(), this.key = e, this.value = t, this.precondition = n, this.fieldTransforms = r, this.type = 0;
	}
	getFieldMask() {
		return null;
	}
}, xf = class extends mf {
	constructor(e, t, n, r, i = []) {
		super(), this.key = e, this.data = t, this.fieldMask = n, this.precondition = r, this.fieldTransforms = i, this.type = 1;
	}
	getFieldMask() {
		return this.fieldMask;
	}
};
function Sf(e) {
	let t = /* @__PURE__ */ new Map();
	return e.fieldMask.fields.forEach(((n) => {
		if (!n.isEmpty()) {
			let r = e.data.field(n);
			t.set(n, r);
		}
	})), t;
}
function Cf(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	R(e.length === n.length, 32656, {
		h: n.length,
		T: e.length
	});
	for (let i = 0; i < n.length; i++) {
		let a = e[i], o = a.transform, s = t.data.field(a.field);
		r.set(a.field, Jd(o, s, n[i]));
	}
	return r;
}
function wf(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of e) {
		let e = i.transform, a = n.data.field(i.field);
		r.set(i.field, qd(e, a, t));
	}
	return r;
}
var Tf = class extends mf {
	constructor(e, t) {
		super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
	}
	getFieldMask() {
		return null;
	}
}, Ef = class extends mf {
	constructor(e, t) {
		super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
	}
	getFieldMask() {
		return null;
	}
}, Df = class {
	constructor(e, t) {
		this.position = e, this.inclusive = t;
	}
};
function Of(e, t, n) {
	let r = 0;
	for (let i = 0; i < e.position.length; i++) {
		let a = t[i], o = e.position[i];
		if (r = a.field.isKeyField() ? W.comparator(W.fromName(o.referenceValue), n.key) : Cd(o, n.data.field(a.field)), a.dir === "desc" && (r *= -1), r !== 0) break;
	}
	return r;
}
function kf(e, t) {
	if (e === null) return t === null;
	if (t === null || e.inclusive !== t.inclusive || e.position.length !== t.position.length) return !1;
	for (let n = 0; n < e.position.length; n++) if (!xd(e.position[n], t.position[n])) return !1;
	return !0;
}
var Af = class {}, jf = class e extends Af {
	constructor(e, t, n) {
		super(), this.field = e, this.op = t, this.value = n;
	}
	static create(t, n, r) {
		return t.isKeyField() ? n === "in" || n === "not-in" ? this.createKeyFieldInFilter(t, n, r) : new zf(t, n, r) : n === "array-contains" ? new Uf(t, r) : n === "in" ? new Wf(t, r) : n === "not-in" ? new Gf(t, r) : n === "array-contains-any" ? new Kf(t, r) : new e(t, n, r);
	}
	static createKeyFieldInFilter(e, t, n) {
		return t === "in" ? new Bf(e, n) : new Vf(e, n);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return this.op === "!=" ? t !== null && t.nullValue === void 0 && this.matchesComparison(Cd(t, this.value)) : t !== null && bd(this.value) === bd(t) && this.matchesComparison(Cd(t, this.value));
	}
	matchesComparison(e) {
		switch (this.op) {
			case "<": return e < 0;
			case "<=": return e <= 0;
			case "==": return e === 0;
			case "!=": return e !== 0;
			case ">": return e > 0;
			case ">=": return e >= 0;
			default: return L(47266, { operator: this.op });
		}
	}
	isInequality() {
		return [
			"<",
			"<=",
			">",
			">=",
			"!=",
			"not-in"
		].indexOf(this.op) >= 0;
	}
	getFlattenedFilters() {
		return [this];
	}
	getFilters() {
		return [this];
	}
}, Mf = class e extends Af {
	constructor(e, t) {
		super(), this.filters = e, this.op = t, this.P = null;
	}
	static create(t, n) {
		return new e(t, n);
	}
	matches(e) {
		return Nf(this) ? this.filters.find(((t) => !t.matches(e))) === void 0 : this.filters.find(((t) => t.matches(e))) !== void 0;
	}
	getFlattenedFilters() {
		return this.P !== null || (this.P = this.filters.reduce(((e, t) => e.concat(t.getFlattenedFilters())), [])), this.P;
	}
	getFilters() {
		return Object.assign([], this.filters);
	}
};
function Nf(e) {
	return e.op === "and";
}
function Pf(e) {
	return Ff(e) && Nf(e);
}
function Ff(e) {
	for (let t of e.filters) if (t instanceof Mf) return !1;
	return !0;
}
function If(e) {
	if (e instanceof jf) return e.field.canonicalString() + e.op.toString() + Ed(e.value);
	if (Pf(e)) return e.filters.map(((e) => If(e))).join(",");
	{
		let t = e.filters.map(((e) => If(e))).join(",");
		return `${e.op}(${t})`;
	}
}
function Lf(e, t) {
	return e instanceof jf ? function(e, t) {
		return t instanceof jf && e.op === t.op && e.field.isEqual(t.field) && xd(e.value, t.value);
	}(e, t) : e instanceof Mf ? function(e, t) {
		return t instanceof Mf && e.op === t.op && e.filters.length === t.filters.length && e.filters.reduce(((e, n, r) => e && Lf(n, t.filters[r])), !0);
	}(e, t) : void L(19439);
}
function Rf(e) {
	return e instanceof jf ? function(e) {
		return `${e.field.canonicalString()} ${e.op} ${Ed(e.value)}`;
	}(e) : e instanceof Mf ? function(e) {
		return e.op.toString() + " {" + e.getFilters().map(Rf).join(" ,") + "}";
	}(e) : "Filter";
}
var zf = class extends jf {
	constructor(e, t, n) {
		super(e, t, n), this.key = W.fromName(n.referenceValue);
	}
	matches(e) {
		let t = W.comparator(e.key, this.key);
		return this.matchesComparison(t);
	}
}, Bf = class extends jf {
	constructor(e, t) {
		super(e, "in", t), this.keys = Hf("in", t);
	}
	matches(e) {
		return this.keys.some(((t) => t.isEqual(e.key)));
	}
}, Vf = class extends jf {
	constructor(e, t) {
		super(e, "not-in", t), this.keys = Hf("not-in", t);
	}
	matches(e) {
		return !this.keys.some(((t) => t.isEqual(e.key)));
	}
};
function Hf(e, t) {
	return (t.arrayValue?.values || []).map(((e) => W.fromName(e.referenceValue)));
}
var Uf = class extends jf {
	constructor(e, t) {
		super(e, "array-contains", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return Nd(t) && Sd(t.arrayValue, this.value);
	}
}, Wf = class extends jf {
	constructor(e, t) {
		super(e, "in", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return t !== null && Sd(this.value.arrayValue, t);
	}
}, Gf = class extends jf {
	constructor(e, t) {
		super(e, "not-in", t);
	}
	matches(e) {
		if (Sd(this.value.arrayValue, { nullValue: "NULL_VALUE" })) return !1;
		let t = e.data.field(this.field);
		return t !== null && t.nullValue === void 0 && !Sd(this.value.arrayValue, t);
	}
}, Kf = class extends jf {
	constructor(e, t) {
		super(e, "array-contains-any", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return !(!Nd(t) || !t.arrayValue.values) && t.arrayValue.values.some(((e) => Sd(this.value.arrayValue, e)));
	}
}, qf = class {
	constructor(e, t = "asc") {
		this.field = e, this.dir = t;
	}
};
function Jf(e, t) {
	return e.dir === t.dir && e.field.isEqual(t.field);
}
var K = class e {
	static fromTimestamp(t) {
		return new e(t);
	}
	static min() {
		return new e(new Wu(0, 0));
	}
	static max() {
		return new e(new Wu(253402300799, 999999999));
	}
	constructor(e) {
		this.timestamp = e;
	}
	compareTo(e) {
		return this.timestamp._compareTo(e.timestamp);
	}
	isEqual(e) {
		return this.timestamp.isEqual(e.timestamp);
	}
	toMicroseconds() {
		return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
	}
	toString() {
		return "SnapshotVersion(" + this.timestamp.toString() + ")";
	}
	toTimestamp() {
		return this.timestamp;
	}
}, Yf = class e {
	constructor(e, t, n, r, i, a, o) {
		this.key = e, this.documentType = t, this.version = n, this.readTime = r, this.createTime = i, this.data = a, this.documentState = o;
	}
	static newInvalidDocument(t) {
		return new e(t, 0, K.min(), K.min(), K.min(), Vd.empty(), 0);
	}
	static newFoundDocument(t, n, r, i) {
		return new e(t, 1, n, K.min(), r, i, 0);
	}
	static newNoDocument(t, n) {
		return new e(t, 2, n, K.min(), K.min(), Vd.empty(), 0);
	}
	static newUnknownDocument(t, n) {
		return new e(t, 3, n, K.min(), K.min(), Vd.empty(), 2);
	}
	convertToFoundDocument(e, t) {
		return !this.createTime.isEqual(K.min()) || this.documentType !== 2 && this.documentType !== 0 || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
	}
	convertToNoDocument(e) {
		return this.version = e, this.documentType = 2, this.data = Vd.empty(), this.documentState = 0, this;
	}
	convertToUnknownDocument(e) {
		return this.version = e, this.documentType = 3, this.data = Vd.empty(), this.documentState = 2, this;
	}
	setHasCommittedMutations() {
		return this.documentState = 2, this;
	}
	setHasLocalMutations() {
		return this.documentState = 1, this.version = K.min(), this;
	}
	setReadTime(e) {
		return this.readTime = e, this;
	}
	get hasLocalMutations() {
		return this.documentState === 1;
	}
	get hasCommittedMutations() {
		return this.documentState === 2;
	}
	get hasPendingWrites() {
		return this.hasLocalMutations || this.hasCommittedMutations;
	}
	isValidDocument() {
		return this.documentType !== 0;
	}
	isFoundDocument() {
		return this.documentType === 1;
	}
	isNoDocument() {
		return this.documentType === 2;
	}
	isUnknownDocument() {
		return this.documentType === 3;
	}
	isEqual(t) {
		return t instanceof e && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
	}
	mutableCopy() {
		return new e(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
	}
	toString() {
		return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
	}
}, Xf = -1;
function Zf(e, t) {
	let n = e.toTimestamp().seconds, r = e.toTimestamp().nanoseconds + 1;
	return new $f(K.fromTimestamp(r === 1e9 ? new Wu(n + 1, 0) : new Wu(n, r)), W.empty(), t);
}
function Qf(e) {
	return new $f(e.readTime, e.key, Xf);
}
var $f = class e {
	constructor(e, t, n) {
		this.readTime = e, this.documentKey = t, this.largestBatchId = n;
	}
	static min() {
		return new e(K.min(), W.empty(), Xf);
	}
	static max() {
		return new e(K.max(), W.empty(), Xf);
	}
};
function ep(e, t) {
	let n = e.readTime.compareTo(t.readTime);
	return n === 0 ? (n = W.comparator(e.documentKey, t.documentKey), n === 0 ? B(e.largestBatchId, t.largestBatchId) : n) : n;
}
var tp = class {
	constructor(e, t = null, n = [], r = [], i = null, a = null, o = null) {
		this.path = e, this.collectionGroup = t, this.orderBy = n, this.filters = r, this.limit = i, this.startAt = a, this.endAt = o, this.R = null;
	}
};
function np(e, t = null, n = [], r = [], i = null, a = null, o = null) {
	return new tp(e, t, n, r, i, a, o);
}
function rp(e) {
	let t = z(e);
	if (t.R === null) {
		let e = t.path.canonicalString();
		t.collectionGroup !== null && (e += "|cg:" + t.collectionGroup), e += "|f:", e += t.filters.map(((e) => If(e))).join(","), e += "|ob:", e += t.orderBy.map(((e) => function(e) {
			return e.field.canonicalString() + e.dir;
		}(e))).join(","), cd(t.limit) || (e += "|l:", e += t.limit), t.startAt && (e += "|lb:", e += t.startAt.inclusive ? "b:" : "a:", e += t.startAt.position.map(((e) => Ed(e))).join(",")), t.endAt && (e += "|ub:", e += t.endAt.inclusive ? "a:" : "b:", e += t.endAt.position.map(((e) => Ed(e))).join(",")), t.R = e;
	}
	return t.R;
}
function ip(e, t) {
	if (e.limit !== t.limit || e.orderBy.length !== t.orderBy.length) return !1;
	for (let n = 0; n < e.orderBy.length; n++) if (!Jf(e.orderBy[n], t.orderBy[n])) return !1;
	if (e.filters.length !== t.filters.length) return !1;
	for (let n = 0; n < e.filters.length; n++) if (!Lf(e.filters[n], t.filters[n])) return !1;
	return e.collectionGroup === t.collectionGroup && !!e.path.isEqual(t.path) && !!kf(e.startAt, t.startAt) && kf(e.endAt, t.endAt);
}
function ap(e) {
	return !!e.isCorePipeline;
}
function op(e) {
	return !!e.path && W.isDocumentKey(e.path) && e.collectionGroup === null && e.filters.length === 0;
}
var sp = class {
	constructor(e, t = null, n = [], r = [], i = null, a = "F", o = null, s = null) {
		this.path = e, this.collectionGroup = t, this.explicitOrderBy = n, this.filters = r, this.limit = i, this.limitType = a, this.startAt = o, this.endAt = s, this.I = null, this.A = null, this.V = null, this.startAt, this.endAt;
	}
};
function cp(e, t, n, r, i, a, o, s) {
	return new sp(e, t, n, r, i, a, o, s);
}
function lp(e) {
	return new sp(e);
}
function up(e) {
	return e.filters.length === 0 && e.limit === null && e.startAt == null && e.endAt == null && (e.explicitOrderBy.length === 0 || e.explicitOrderBy.length === 1 && e.explicitOrderBy[0].field.isKeyField());
}
function dp(e) {
	return W.isDocumentKey(e.path) && e.collectionGroup === null && e.filters.length === 0;
}
function fp(e) {
	return e.collectionGroup !== null;
}
function pp(e) {
	let t = z(e);
	if (t.I === null) {
		t.I = [];
		let e = /* @__PURE__ */ new Set();
		for (let n of t.explicitOrderBy) t.I.push(n), e.add(n.field.canonicalString());
		let n = t.explicitOrderBy.length > 0 ? t.explicitOrderBy[t.explicitOrderBy.length - 1].dir : "asc";
		(function(e) {
			let t = new Su(Du.comparator);
			return e.filters.forEach(((e) => {
				e.getFlattenedFilters().forEach(((e) => {
					e.isInequality() && (t = t.add(e.field));
				}));
			})), t;
		})(t).forEach(((r) => {
			e.has(r.canonicalString()) || r.isKeyField() || t.I.push(new qf(r, n));
		})), e.has(Du.keyField().canonicalString()) || t.I.push(new qf(Du.keyField(), n));
	}
	return t.I;
}
function mp(e) {
	let t = z(e);
	return t.A ||= hp(t, pp(e)), t.A;
}
function hp(e, t) {
	if (e.limitType === "F") return np(e.path, e.collectionGroup, t, e.filters, e.limit, e.startAt, e.endAt);
	{
		t = t.map(((e) => {
			let t = e.dir === "desc" ? "asc" : "desc";
			return new qf(e.field, t);
		}));
		let n = e.endAt ? new Df(e.endAt.position, e.endAt.inclusive) : null, r = e.startAt ? new Df(e.startAt.position, e.startAt.inclusive) : null;
		return np(e.path, e.collectionGroup, t, e.filters, e.limit, n, r);
	}
}
function gp(e, t) {
	let n = e.filters.concat([t]);
	return new sp(e.path, e.collectionGroup, e.explicitOrderBy.slice(), n, e.limit, e.limitType, e.startAt, e.endAt);
}
function _p(e, t, n) {
	return new sp(e.path, e.collectionGroup, e.explicitOrderBy.slice(), e.filters.slice(), t, n, e.startAt, e.endAt);
}
function vp(e, t) {
	return ip(mp(e), mp(t)) && e.limitType === t.limitType;
}
function yp(e) {
	return `Query(target=${function(e) {
		let t = e.path.canonicalString();
		return e.collectionGroup !== null && (t += " collectionGroup=" + e.collectionGroup), e.filters.length > 0 && (t += `, filters: [${e.filters.map(((e) => Rf(e))).join(", ")}]`), cd(e.limit) || (t += ", limit: " + e.limit), e.orderBy.length > 0 && (t += `, orderBy: [${e.orderBy.map(((e) => function(e) {
			return `${e.field.canonicalString()} (${e.dir})`;
		}(e))).join(", ")}]`), e.startAt && (t += ", startAt: ", t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map(((e) => Ed(e))).join(",")), e.endAt && (t += ", endAt: ", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map(((e) => Ed(e))).join(",")), `Target(${t})`;
	}(mp(e))}; limitType=${e.limitType})`;
}
function bp(e, t) {
	return t.isFoundDocument() && function(e, t) {
		let n = t.key.path;
		return e.collectionGroup === null ? W.isDocumentKey(e.path) ? e.path.isEqual(n) : e.path.isImmediateParentOf(n) : t.key.hasCollectionId(e.collectionGroup) && e.path.isPrefixOf(n);
	}(e, t) && function(e, t) {
		for (let n of pp(e)) if (!n.field.isKeyField() && t.data.field(n.field) === null) return !1;
		return !0;
	}(e, t) && function(e, t) {
		for (let n of e.filters) if (!n.matches(t)) return !1;
		return !0;
	}(e, t) && function(e, t) {
		return !(e.startAt && !function(e, t, n) {
			let r = Of(e, t, n);
			return e.inclusive ? r <= 0 : r < 0;
		}(e.startAt, pp(e), t) || e.endAt && !function(e, t, n) {
			let r = Of(e, t, n);
			return e.inclusive ? r >= 0 : r > 0;
		}(e.endAt, pp(e), t));
	}(e, t);
}
function xp(e) {
	return (t, n) => {
		let r = !1;
		for (let i of pp(e)) {
			let e = Sp(i, t, n);
			if (e !== 0) return e;
			r ||= i.field.isKeyField();
		}
		return 0;
	};
}
function Sp(e, t, n) {
	let r = e.field.isKeyField() ? W.comparator(t.key, n.key) : function(e, t, n) {
		let r = t.data.field(e), i = n.data.field(e);
		return r !== null && i !== null ? Cd(r, i) : L(42886);
	}(e.field, t, n);
	switch (e.dir) {
		case "asc": return r;
		case "desc": return -1 * r;
		default: return L(19790, { direction: e.dir });
	}
}
var Cp = class {
	constructor(e, t) {
		this.count = e, this.unchangedNames = t;
	}
}, wp, q;
function Tp(e) {
	switch (e) {
		case V.OK: return L(64938);
		case V.CANCELLED:
		case V.UNKNOWN:
		case V.DEADLINE_EXCEEDED:
		case V.RESOURCE_EXHAUSTED:
		case V.INTERNAL:
		case V.UNAVAILABLE:
		case V.UNAUTHENTICATED: return !1;
		case V.INVALID_ARGUMENT:
		case V.NOT_FOUND:
		case V.ALREADY_EXISTS:
		case V.PERMISSION_DENIED:
		case V.FAILED_PRECONDITION:
		case V.ABORTED:
		case V.OUT_OF_RANGE:
		case V.UNIMPLEMENTED:
		case V.DATA_LOSS: return !0;
		default: return L(15467, { code: e });
	}
}
function Ep(e) {
	if (e === void 0) return cu("GRPC error has no .code"), V.UNKNOWN;
	switch (e) {
		case wp.OK: return V.OK;
		case wp.CANCELLED: return V.CANCELLED;
		case wp.UNKNOWN: return V.UNKNOWN;
		case wp.DEADLINE_EXCEEDED: return V.DEADLINE_EXCEEDED;
		case wp.RESOURCE_EXHAUSTED: return V.RESOURCE_EXHAUSTED;
		case wp.INTERNAL: return V.INTERNAL;
		case wp.UNAVAILABLE: return V.UNAVAILABLE;
		case wp.UNAUTHENTICATED: return V.UNAUTHENTICATED;
		case wp.INVALID_ARGUMENT: return V.INVALID_ARGUMENT;
		case wp.NOT_FOUND: return V.NOT_FOUND;
		case wp.ALREADY_EXISTS: return V.ALREADY_EXISTS;
		case wp.PERMISSION_DENIED: return V.PERMISSION_DENIED;
		case wp.FAILED_PRECONDITION: return V.FAILED_PRECONDITION;
		case wp.ABORTED: return V.ABORTED;
		case wp.OUT_OF_RANGE: return V.OUT_OF_RANGE;
		case wp.UNIMPLEMENTED: return V.UNIMPLEMENTED;
		case wp.DATA_LOSS: return V.DATA_LOSS;
		default: return L(39323, { code: e });
	}
}
(q = wp ||= {})[q.OK = 0] = "OK", q[q.CANCELLED = 1] = "CANCELLED", q[q.UNKNOWN = 2] = "UNKNOWN", q[q.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", q[q.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", q[q.NOT_FOUND = 5] = "NOT_FOUND", q[q.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", q[q.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", q[q.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", q[q.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", q[q.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", q[q.ABORTED = 10] = "ABORTED", q[q.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", q[q.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", q[q.INTERNAL = 13] = "INTERNAL", q[q.UNAVAILABLE = 14] = "UNAVAILABLE", q[q.DATA_LOSS = 15] = "DATA_LOSS";
var Dp = class {
	constructor(e, t) {
		this.mapKeyFn = e, this.equalsFn = t, this.inner = {}, this.innerSize = 0;
	}
	get(e) {
		let t = this.mapKeyFn(e), n = this.inner[t];
		if (n !== void 0) {
			for (let [t, r] of n) if (this.equalsFn(t, e)) return r;
		}
	}
	has(e) {
		return this.get(e) !== void 0;
	}
	set(e, t) {
		let n = this.mapKeyFn(e), r = this.inner[n];
		if (r === void 0) return this.inner[n] = [[e, t]], void this.innerSize++;
		for (let n = 0; n < r.length; n++) if (this.equalsFn(r[n][0], e)) return void (r[n] = [e, t]);
		r.push([e, t]), this.innerSize++;
	}
	delete(e) {
		let t = this.mapKeyFn(e), n = this.inner[t];
		if (n === void 0) return !1;
		for (let r = 0; r < n.length; r++) if (this.equalsFn(n[r][0], e)) return n.length === 1 ? delete this.inner[t] : n.splice(r, 1), this.innerSize--, !0;
		return !1;
	}
	forEach(e) {
		Au(this.inner, ((t, n) => {
			for (let [t, r] of n) e(t, r);
		}));
	}
	isEmpty() {
		return Mu(this.inner);
	}
	size() {
		return this.innerSize;
	}
}, Op = new yu(W.comparator);
function kp() {
	return Op;
}
var Ap = new yu(W.comparator);
function jp(...e) {
	let t = Ap;
	for (let n of e) t = t.insert(n.key, n);
	return t;
}
function Mp(e) {
	let t = Ap;
	return e.forEach(((e, n) => t = t.insert(e, n.overlayedDocument))), t;
}
function Np() {
	return Fp();
}
function Pp() {
	return Fp();
}
function Fp() {
	return new Dp(((e) => e.toString()), ((e, t) => e.isEqual(t)));
}
var Ip = new yu(W.comparator), Lp = new Su(W.comparator);
function J(...e) {
	let t = Lp;
	for (let n of e) t = t.add(n);
	return t;
}
var Rp = new Su(B);
function zp() {
	return Rp;
}
var Bp = null;
function Vp() {
	return new TextEncoder();
}
var Hp = new mc([4294967295, 4294967295], 0);
function Up(e) {
	let t = Vp().encode(e), n = new hc();
	return n.update(t), new Uint8Array(n.digest());
}
function Wp(e) {
	let t = new DataView(e.buffer), n = t.getUint32(0, !0), r = t.getUint32(4, !0), i = t.getUint32(8, !0), a = t.getUint32(12, !0);
	return [new mc([n, r], 0), new mc([i, a], 0)];
}
var Gp = class e {
	constructor(e, t, n) {
		if (this.bitmap = e, this.padding = t, this.hashCount = n, t < 0 || t >= 8) throw new Kp(`Invalid padding: ${t}`);
		if (n < 0 || e.length > 0 && this.hashCount === 0) throw new Kp(`Invalid hash count: ${n}`);
		if (e.length === 0 && t !== 0) throw new Kp(`Invalid padding when bitmap length is 0: ${t}`);
		this.m = 8 * e.length - t, this.p = mc.fromNumber(this.m);
	}
	S(e, t, n) {
		let r = e.add(t.multiply(mc.fromNumber(n)));
		return r.compare(Hp) === 1 && (r = new mc([r.getBits(0), r.getBits(1)], 0)), r.modulo(this.p).toNumber();
	}
	v(e) {
		return !!(this.bitmap[Math.floor(e / 8)] & 1 << e % 8);
	}
	mightContain(e) {
		if (this.m === 0) return !1;
		let [t, n] = Wp(Up(e));
		for (let e = 0; e < this.hashCount; e++) {
			let r = this.S(t, n, e);
			if (!this.v(r)) return !1;
		}
		return !0;
	}
	static create(t, n, r) {
		let i = t % 8 == 0 ? 0 : 8 - t % 8, a = new Uint8Array(Math.ceil(t / 8)), o = new e(a, i, n);
		return r.forEach(((e) => o.insert(e))), o;
	}
	insert(e) {
		if (this.m === 0) return;
		let [t, n] = Wp(Up(e));
		for (let e = 0; e < this.hashCount; e++) {
			let r = this.S(t, n, e);
			this.D(r);
		}
	}
	D(e) {
		let t = Math.floor(e / 8), n = e % 8;
		this.bitmap[t] |= 1 << n;
	}
}, Kp = class extends Error {
	constructor() {
		super(...arguments), this.name = "BloomFilterError";
	}
}, qp = class e {
	constructor(e, t, n, r, i, a) {
		this.snapshotVersion = e, this.targetChanges = t, this.targetMismatches = n, this.documentUpdates = r, this.augmentedDocumentUpdates = i, this.resolvedLimboDocuments = a;
	}
	static createSynthesizedRemoteEventForCurrentChange(t, n, r) {
		let i = /* @__PURE__ */ new Map();
		return i.set(t, Jp.createSynthesizedTargetChangeForCurrentChange(t, n, r)), new e(K.min(), i, new yu(B), kp(), kp(), J());
	}
}, Jp = class e {
	constructor(e, t, n, r, i) {
		this.resumeToken = e, this.current = t, this.addedDocuments = n, this.modifiedDocuments = r, this.removedDocuments = i;
	}
	static createSynthesizedTargetChangeForCurrentChange(t, n, r) {
		return new e(r, n, J(), J(), J());
	}
}, Yp = class {
	constructor(e, t, n, r) {
		this.C = e, this.removedTargetIds = t, this.key = n, this.F = r;
	}
}, Xp = class {
	constructor(e, t) {
		this.targetId = e, this.O = t;
	}
}, Zp = class {
	constructor(e, t, n = Ku.EMPTY_BYTE_STRING, r = null) {
		this.state = e, this.targetIds = t, this.resumeToken = n, this.cause = r;
	}
}, Qp = class {
	constructor(e) {
		this.targetId = e, this.M = 0, this.N = nm(), this.L = Ku.EMPTY_BYTE_STRING, this.B = !1, this.U = !0;
	}
	get current() {
		return this.B;
	}
	get resumeToken() {
		return this.L;
	}
	get k() {
		return this.M !== 0;
	}
	get q() {
		return this.U;
	}
	$(e) {
		e.approximateByteSize() > 0 && (this.U = !0, this.L = e);
	}
	K() {
		let e = J(), t = J(), n = J();
		return this.N.forEach(((r, i) => {
			switch (i) {
				case 0:
					e = e.add(r);
					break;
				case 2:
					t = t.add(r);
					break;
				case 1:
					n = n.add(r);
					break;
				default: L(38017, { changeType: i });
			}
		})), new Jp(this.L, this.B, e, t, n);
	}
	W() {
		this.U = !1, this.N = nm();
	}
	G(e, t) {
		this.U = !0, this.N = this.N.insert(e, t);
	}
	j(e) {
		this.U = !0, this.N = this.N.remove(e);
	}
	H() {
		this.M += 1;
	}
	J() {
		--this.M, R(this.M >= 0, 3241, {
			M: this.M,
			targetId: this.targetId
		});
	}
	Y() {
		this.U = !0, this.B = !0;
	}
}, $p = "WatchChangeAggregator", em = class {
	constructor(e) {
		this.Z = e, this.X = /* @__PURE__ */ new Map(), this.ee = kp(), this.te = tm(), this.ne = kp(), this.re = tm(), this.ie = new yu(B);
	}
	se(e) {
		for (let t of e.C) e.F && e.F.isFoundDocument() ? this._e(t, e.F) : this.oe(t, e.key, e.F);
		for (let t of e.removedTargetIds) this.oe(t, e.key, e.F);
	}
	ae(e) {
		this.forEachTarget(e, ((t) => {
			let n = this.X.get(t);
			if (n) switch (e.state) {
				case 0:
					this.ue(t) && n.$(e.resumeToken);
					break;
				case 1:
					n.J(), n.k || n.W(), n.$(e.resumeToken);
					break;
				case 2:
					n.J(), n.k || this.removeTarget(t);
					break;
				case 3:
					this.ue(t) && (n.Y(), n.$(e.resumeToken));
					break;
				case 4:
					this.ue(t) && (this.ce(t), n.$(e.resumeToken));
					break;
				default: L(56790, { state: e.state });
			}
			else I($p, `handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`);
		}));
	}
	forEachTarget(e, t) {
		e.targetIds.length > 0 ? e.targetIds.forEach(t) : this.X.forEach(((e, n) => {
			this.ue(n) && t(n);
		}));
	}
	le(e) {
		return ap(e) ? e.getPipelineSourceType() === "documents" && e.getPipelineDocuments()?.length === 1 : op(e);
	}
	Ee(e) {
		let t = e.targetId, n = e.O.count, r = this.he(t);
		if (r) {
			let i = r.target;
			if (this.le(i)) {
				if (n === 0) {
					let e = new W(ap(i) ? U.fromString(i.getPipelineDocuments()[0]) : i.path);
					this.oe(t, e, Yf.newNoDocument(e, K.min()));
				} else R(n === 1, 20013, "Single document existence filter with count: " + n);
			} else {
				let r = this.Te(t);
				if (r !== n) {
					let n = this.Pe(e), i = n ? this.Re(n, e, r) : 1;
					if (i !== 0) {
						this.ce(t);
						let e = i === 2 ? "TargetPurposeExistenceFilterMismatchBloom" : "TargetPurposeExistenceFilterMismatch";
						this.ie = this.ie.insert(t, e);
					}
					Bp?.Ie(function(e, t, n, r, i) {
						let a = {
							localCacheCount: e,
							existenceFilterCount: t.count,
							databaseId: n.database,
							projectId: n.projectId
						}, o = t.unchangedNames;
						return o && (a.bloomFilter = {
							applied: i === 0,
							hashCount: o?.hashCount ?? 0,
							bitmapLength: o?.bits?.bitmap?.length ?? 0,
							padding: o?.bits?.padding ?? 0,
							mightContain: (e) => r?.mightContain(e) ?? !1
						}), a;
					}(r, e.O, this.Z.Ae(), n, i));
				}
			}
		}
	}
	Pe(e) {
		let t = e.O.unchangedNames;
		if (!t || !t.bits) return null;
		let { bits: { bitmap: n = "", padding: r = 0 }, hashCount: i = 0 } = t, a, o;
		try {
			a = Yu(n).toUint8Array();
		} catch (e) {
			if (e instanceof Gu) return lu("Decoding the base64 bloom filter in existence filter failed (" + e.message + "); ignoring the bloom filter and falling back to full re-query."), null;
			throw e;
		}
		try {
			o = new Gp(a, r, i);
		} catch (e) {
			return lu(e instanceof Kp ? "BloomFilter error: " : "Applying bloom filter failed: ", e), null;
		}
		return o.m === 0 ? null : o;
	}
	Re(e, t, n) {
		return t.O.count === n - this.Ve(e, t.targetId) ? 0 : 2;
	}
	Ve(e, t) {
		let n = this.Z.getRemoteKeysForTarget(t), r = 0;
		return n.forEach(((n) => {
			let i = this.Z.Ae(), a = `projects/${i.projectId}/databases/${i.database}/documents/${n.path.canonicalString()}`;
			e.mightContain(a) || (this.oe(t, n, null), r++);
		})), r;
	}
	de(e) {
		let t = /* @__PURE__ */ new Map();
		this.X.forEach(((n, r) => {
			let i = this.he(r);
			if (i) {
				if (n.current && this.le(i.target)) {
					let t = new W(ap(i.target) ? U.fromString(i.target.getPipelineDocuments()[0]) : i.target.path);
					this.fe(t).has(r) || this.me(r, t) || this.oe(r, t, Yf.newNoDocument(t, e));
				}
				n.q && (t.set(r, n.K()), n.W());
			}
		}));
		let n = J();
		this.re.forEach(((e, t) => {
			let r = !0;
			t.forEachWhile(((e) => {
				let t = this.he(e);
				return !t || t.purpose === "TargetPurposeLimboResolution" || (r = !1, !1);
			})), r && (n = n.add(e));
		})), this.ee.forEach(((t, n) => n.setReadTime(e))), this.ne.forEach(((t, n) => n.setReadTime(e)));
		let r = new qp(e, t, this.ie, this.ee, this.ne, n);
		return this.ee = kp(), this.te = tm(), this.ne = kp(), this.re = tm(), this.ie = new yu(B), r;
	}
	_e(e, t) {
		let n = this.X.get(e);
		if (!n || !this.ue(e)) return void I($p, `addDocumentToTarget received document for unknown inactive target (${e})`);
		let r = this.me(e, t.key) ? 2 : 0;
		n.G(t.key, r), ap(this.he(e).target) && this.he(e).target.getPipelineFlavor() !== "exact" ? this.ne = this.ne.insert(t.key, t) : this.ee = this.ee.insert(t.key, t), this.te = this.te.insert(t.key, this.fe(t.key).add(e)), this.re = this.re.insert(t.key, this.pe(t.key).add(e));
	}
	oe(e, t, n) {
		let r = this.X.get(e);
		r && this.ue(e) ? (this.me(e, t) ? r.G(t, 1) : r.j(t), this.re = this.re.insert(t, this.pe(t).delete(e)), this.re = this.re.insert(t, this.pe(t).add(e)), n && (ap(this.he(e).target) && this.he(e).target.getPipelineFlavor() !== "exact" ? this.ne = this.ne.insert(t, n) : this.ee = this.ee.insert(t, n))) : I($p, `removeDocumentFromTarget received document for unknown or inactive target (${e})`);
	}
	removeTarget(e) {
		this.X.delete(e);
	}
	Te(e) {
		let t = this.X.get(e);
		if (!t) return 0;
		let n = t.K();
		return this.Z.getRemoteKeysForTarget(e).size + n.addedDocuments.size - n.removedDocuments.size;
	}
	H(e) {
		let t = this.X.get(e);
		t || (I($p, `recordPendingTargetRequest set up tracking for target ID ${e}`), t = new Qp(e), this.X.set(e, t)), t.H();
	}
	pe(e) {
		let t = this.re.get(e);
		return t || (t = new Su(B), this.re = this.re.insert(e, t)), t;
	}
	fe(e) {
		let t = this.te.get(e);
		return t || (t = new Su(B), this.te = this.te.insert(e, t)), t;
	}
	ue(e) {
		let t = this.he(e) !== null;
		return t || I($p, "Detected inactive target", e), t;
	}
	he(e) {
		let t = this.X.get(e);
		return t === void 0 || t.k ? null : this.Z.ge(e);
	}
	ce(e) {
		this.X.set(e, new Qp(e)), this.Z.getRemoteKeysForTarget(e).forEach(((t) => {
			this.oe(e, t, null);
		}));
	}
	me(e, t) {
		return this.Z.getRemoteKeysForTarget(e).has(t);
	}
};
function tm() {
	return new yu(W.comparator);
}
function nm() {
	return new yu(W.comparator);
}
var rm = {
	asc: "ASCENDING",
	desc: "DESCENDING"
}, im = {
	"<": "LESS_THAN",
	"<=": "LESS_THAN_OR_EQUAL",
	">": "GREATER_THAN",
	">=": "GREATER_THAN_OR_EQUAL",
	"==": "EQUAL",
	"!=": "NOT_EQUAL",
	"array-contains": "ARRAY_CONTAINS",
	in: "IN",
	"not-in": "NOT_IN",
	"array-contains-any": "ARRAY_CONTAINS_ANY"
}, am = {
	and: "AND",
	or: "OR"
}, om = class {
	constructor(e, t) {
		this.databaseId = e, this.useProto3Json = t;
	}
};
function sm(e, t) {
	return e.useProto3Json || cd(t) ? t : { value: t };
}
function cm(e, t) {
	return e.useProto3Json ? `${(/* @__PURE__ */ new Date(1e3 * t.seconds)).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + t.nanoseconds).slice(-9)}Z` : {
		seconds: "" + t.seconds,
		nanos: t.nanoseconds
	};
}
function lm(e) {
	let t = Ju(e);
	return new Wu(t.seconds, t.nanos);
}
function um(e, t) {
	return e.useProto3Json ? t.toBase64() : t.toUint8Array();
}
function dm(e, t) {
	return cm(e, t.toTimestamp());
}
function fm(e) {
	return R(!!e, 49232), K.fromTimestamp(lm(e));
}
function pm(e, t) {
	return mm(e, t).canonicalString();
}
function mm(e, t) {
	let n = function(e) {
		return new U([
			"projects",
			e.projectId,
			"databases",
			e.database
		]);
	}(e).child("documents");
	return t === void 0 ? n : n.child(t);
}
function hm(e) {
	let t = U.fromString(e);
	return R(zm(t), 10190, { key: t.toString() }), t;
}
function gm(e, t) {
	return pm(e.databaseId, t.path);
}
function _m(e, t) {
	let n = hm(t);
	if (n.get(1) !== e.databaseId.projectId) throw new H(V.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + e.databaseId.projectId);
	if (n.get(3) !== e.databaseId.database) throw new H(V.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + e.databaseId.database);
	return new W(xm(n));
}
function vm(e, t) {
	return pm(e.databaseId, t);
}
function ym(e) {
	let t = hm(e);
	return t.length === 4 ? U.emptyPath() : xm(t);
}
function bm(e) {
	return new U([
		"projects",
		e.databaseId.projectId,
		"databases",
		e.databaseId.database
	]).canonicalString();
}
function xm(e) {
	return R(e.length > 4 && e.get(4) === "documents", 29091, { key: e.toString() }), e.popFirst(5);
}
function Sm(e, t, n) {
	return {
		name: gm(e, t),
		fields: n.value.mapValue.fields
	};
}
function Cm(e, t) {
	let n;
	if ("targetChange" in t) {
		t.targetChange;
		let r = function(e) {
			return e === "NO_CHANGE" ? 0 : e === "ADD" ? 1 : e === "REMOVE" ? 2 : e === "CURRENT" ? 3 : e === "RESET" ? 4 : L(39313, { state: e });
		}(t.targetChange.targetChangeType || "NO_CHANGE"), i = t.targetChange.targetIds || [], a = function(e, t) {
			return e.useProto3Json ? (R(t === void 0 || typeof t == "string", 58123), Ku.fromBase64String(t || "")) : (R(t === void 0 || t instanceof Buffer || t instanceof Uint8Array, 16193), Ku.fromUint8Array(t || /* @__PURE__ */ new Uint8Array()));
		}(e, t.targetChange.resumeToken), o = t.targetChange.cause;
		n = new Zp(r, i, a, o && function(e) {
			return new H(e.code === void 0 ? V.UNKNOWN : Ep(e.code), e.message || "");
		}(o) || null);
	} else if ("documentChange" in t) {
		t.documentChange;
		let r = t.documentChange;
		r.document, r.document.name, r.document.updateTime;
		let i = _m(e, r.document.name), a = fm(r.document.updateTime), o = r.document.createTime ? fm(r.document.createTime) : K.min(), s = new Vd({ mapValue: { fields: r.document.fields } }), c = Yf.newFoundDocument(i, a, o, s);
		n = new Yp(r.targetIds || [], r.removedTargetIds || [], c.key, c);
	} else if ("documentDelete" in t) {
		t.documentDelete;
		let r = t.documentDelete;
		r.document;
		let i = _m(e, r.document), a = r.readTime ? fm(r.readTime) : K.min(), o = Yf.newNoDocument(i, a);
		n = new Yp([], r.removedTargetIds || [], o.key, o);
	} else if ("documentRemove" in t) {
		t.documentRemove;
		let r = t.documentRemove;
		r.document;
		let i = _m(e, r.document);
		n = new Yp([], r.removedTargetIds || [], i, null);
	} else {
		if (!("filter" in t)) return L(11601, { ye: t });
		{
			t.filter;
			let e = t.filter;
			e.targetId;
			let { count: r = 0, unchangedNames: i } = e, a = new Cp(r, i), o = e.targetId;
			n = new Xp(o, a);
		}
	}
	return n;
}
function wm(e, t) {
	let n;
	if (t instanceof bf) n = { update: Sm(e, t.key, t.value) };
	else if (t instanceof Tf) n = { delete: gm(e, t.key) };
	else if (t instanceof xf) n = {
		update: Sm(e, t.key, t.data),
		updateMask: Rm(t.fieldMask)
	};
	else {
		if (!(t instanceof Ef)) return L(16599, { we: t.type });
		n = { verify: gm(e, t.key) };
	}
	return t.fieldTransforms.length > 0 && (n.updateTransforms = t.fieldTransforms.map(((e) => function(e, t) {
		let n = t.transform;
		if (n instanceof Xd) return {
			fieldPath: t.field.canonicalString(),
			setToServerValue: "REQUEST_TIME"
		};
		if (n instanceof Zd) return {
			fieldPath: t.field.canonicalString(),
			appendMissingElements: { values: n.elements }
		};
		if (n instanceof $d) return {
			fieldPath: t.field.canonicalString(),
			removeAllFromArray: { values: n.elements }
		};
		if (n instanceof nf) return {
			fieldPath: t.field.canonicalString(),
			increment: n.l
		};
		if (n instanceof rf) return {
			fieldPath: t.field.canonicalString(),
			minimum: n.l
		};
		if (n instanceof af) return {
			fieldPath: t.field.canonicalString(),
			maximum: n.l
		};
		throw L(20930, { transform: t.transform });
	}(0, e)))), t.precondition.isNone || (n.currentDocument = function(e, t) {
		return t.updateTime === void 0 ? t.exists === void 0 ? L(27497) : { exists: t.exists } : { updateTime: dm(e, t.updateTime) };
	}(e, t.precondition)), n;
}
function Tm(e, t) {
	return e && e.length > 0 ? (R(t !== void 0, 14353), e.map(((e) => function(e, t) {
		let n = e.updateTime ? fm(e.updateTime) : fm(t);
		return n.isEqual(K.min()) && (n = fm(t)), new df(n, e.transformResults || []);
	}(e, t)))) : [];
}
function Em(e, t) {
	return { documents: [vm(e, t.path)] };
}
function Dm(e, t) {
	let n = { structuredQuery: {} }, r = t.path, i;
	t.collectionGroup === null ? (i = r.popLast(), n.structuredQuery.from = [{ collectionId: r.lastSegment() }]) : (i = r, n.structuredQuery.from = [{
		collectionId: t.collectionGroup,
		allDescendants: !0
	}]), n.parent = vm(e, i);
	let a = function(e) {
		if (e.length !== 0) return Lm(Mf.create(e, "and"));
	}(t.filters);
	a && (n.structuredQuery.where = a);
	let o = function(e) {
		if (e.length !== 0) return e.map(((e) => function(e) {
			return {
				field: Fm(e.field),
				direction: Mm(e.dir)
			};
		}(e)));
	}(t.orderBy);
	o && (n.structuredQuery.orderBy = o);
	let s = sm(e, t.limit);
	return s !== null && (n.structuredQuery.limit = s), t.startAt && (n.structuredQuery.startAt = function(e) {
		return {
			before: e.inclusive,
			values: e.position
		};
	}(t.startAt)), t.endAt && (n.structuredQuery.endAt = function(e) {
		return {
			before: !e.inclusive,
			values: e.position
		};
	}(t.endAt)), {
		be: n,
		parent: i
	};
}
function Om(e) {
	let t = ym(e.parent), n = e.structuredQuery, r = n.from ? n.from.length : 0, i = null;
	if (r > 0) {
		R(r === 1, 65062);
		let e = n.from[0];
		e.allDescendants ? i = e.collectionId : t = t.child(e.collectionId);
	}
	let a = [];
	n.where && (a = function(e) {
		let t = jm(e);
		return t instanceof Mf && Pf(t) ? t.getFilters() : [t];
	}(n.where));
	let o = [];
	n.orderBy && (o = function(e) {
		return e.map(((e) => function(e) {
			return new qf(Im(e.field), function(e) {
				switch (e) {
					case "ASCENDING": return "asc";
					case "DESCENDING": return "desc";
					default: return;
				}
			}(e.direction));
		}(e)));
	}(n.orderBy));
	let s = null;
	n.limit && (s = function(e) {
		let t;
		return t = typeof e == "object" ? e.value : e, cd(t) ? null : t;
	}(n.limit));
	let c = null;
	n.startAt && (c = function(e) {
		let t = !!e.before;
		return new Df(e.values || [], t);
	}(n.startAt));
	let l = null;
	return n.endAt && (l = function(e) {
		let t = !e.before;
		return new Df(e.values || [], t);
	}(n.endAt)), cp(t, i, o, a, s, "F", c, l);
}
function km(e, t) {
	let n = function(e) {
		switch (e) {
			case "TargetPurposeListen": return null;
			case "TargetPurposeExistenceFilterMismatch": return "existence-filter-mismatch";
			case "TargetPurposeExistenceFilterMismatchBloom": return "existence-filter-mismatch-bloom";
			case "TargetPurposeLimboResolution": return "limbo-document";
			default: return L(28987, { purpose: e });
		}
	}(t.purpose);
	return n == null ? null : { "goog-listen-tags": n };
}
function Am(e, t) {
	return { structuredPipeline: { pipeline: { stages: t.stages.map(((t) => t._toProto(e))) } } };
}
function jm(e) {
	return e.unaryFilter === void 0 ? e.fieldFilter === void 0 ? e.compositeFilter === void 0 ? L(30097, { filter: e }) : function(e) {
		return Mf.create(e.compositeFilter.filters.map(((e) => jm(e))), function(e) {
			switch (e) {
				case "AND": return "and";
				case "OR": return "or";
				default: return L(1026);
			}
		}(e.compositeFilter.op));
	}(e) : function(e) {
		return jf.create(Im(e.fieldFilter.field), function(e) {
			switch (e) {
				case "EQUAL": return "==";
				case "NOT_EQUAL": return "!=";
				case "GREATER_THAN": return ">";
				case "GREATER_THAN_OR_EQUAL": return ">=";
				case "LESS_THAN": return "<";
				case "LESS_THAN_OR_EQUAL": return "<=";
				case "ARRAY_CONTAINS": return "array-contains";
				case "IN": return "in";
				case "NOT_IN": return "not-in";
				case "ARRAY_CONTAINS_ANY": return "array-contains-any";
				case "OPERATOR_UNSPECIFIED": return L(58110);
				default: return L(50506);
			}
		}(e.fieldFilter.op), e.fieldFilter.value);
	}(e) : function(e) {
		switch (e.unaryFilter.op) {
			case "IS_NAN":
				let t = Im(e.unaryFilter.field);
				return jf.create(t, "==", { doubleValue: NaN });
			case "IS_NULL":
				let n = Im(e.unaryFilter.field);
				return jf.create(n, "==", { nullValue: "NULL_VALUE" });
			case "IS_NOT_NAN":
				let r = Im(e.unaryFilter.field);
				return jf.create(r, "!=", { doubleValue: NaN });
			case "IS_NOT_NULL":
				let i = Im(e.unaryFilter.field);
				return jf.create(i, "!=", { nullValue: "NULL_VALUE" });
			case "OPERATOR_UNSPECIFIED": return L(61313);
			default: return L(60726);
		}
	}(e);
}
function Mm(e) {
	return rm[e];
}
function Nm(e) {
	return im[e];
}
function Pm(e) {
	return am[e];
}
function Fm(e) {
	return { fieldPath: e.canonicalString() };
}
function Im(e) {
	return Du.fromServerFormat(e.fieldPath);
}
function Lm(e) {
	return e instanceof jf ? function(e) {
		if (e.op === "==") {
			if (Fd(e.value)) return { unaryFilter: {
				field: Fm(e.field),
				op: "IS_NAN"
			} };
			if (Pd(e.value)) return { unaryFilter: {
				field: Fm(e.field),
				op: "IS_NULL"
			} };
		} else if (e.op === "!=") {
			if (Fd(e.value)) return { unaryFilter: {
				field: Fm(e.field),
				op: "IS_NOT_NAN"
			} };
			if (Pd(e.value)) return { unaryFilter: {
				field: Fm(e.field),
				op: "IS_NOT_NULL"
			} };
		}
		return { fieldFilter: {
			field: Fm(e.field),
			op: Nm(e.op),
			value: e.value
		} };
	}(e) : e instanceof Mf ? function(e) {
		let t = e.getFilters().map(((e) => Lm(e)));
		return t.length === 1 ? t[0] : { compositeFilter: {
			op: Pm(e.op),
			filters: t
		} };
	}(e) : L(54877, { filter: e });
}
function Rm(e) {
	let t = [];
	return e.fields.forEach(((e) => t.push(e.canonicalString()))), { fieldPaths: t };
}
function zm(e) {
	return e.length >= 4 && e.get(0) === "projects" && e.get(2) === "databases";
}
function Bm(e) {
	return !!e && typeof e._toProto == "function" && e._protoValueType === "ProtoValue";
}
function Vm(e, t) {
	let n = { fields: {} };
	return t.forEach(((t, r) => {
		if (typeof r != "string") throw Error(`Cannot encode map with non-string key: ${r}`);
		n.fields[r] = t._toProto(e);
	})), { mapValue: n };
}
function Hm(e) {
	return { stringValue: e };
}
function Um(e) {
	return new om(e, !0);
}
var Wm = class e {
	constructor(e) {
		this._byteString = e;
	}
	static fromBase64String(t) {
		try {
			return new e(Ku.fromBase64String(t));
		} catch (e) {
			throw new H(V.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e);
		}
	}
	static fromUint8Array(t) {
		return new e(Ku.fromUint8Array(t));
	}
	toBase64() {
		return this._byteString.toBase64();
	}
	toUint8Array() {
		return this._byteString.toUint8Array();
	}
	toString() {
		return "Bytes(base64: " + this.toBase64() + ")";
	}
	isEqual(e) {
		return this._byteString.isEqual(e._byteString);
	}
	toJSON() {
		return {
			type: e._jsonSchemaVersion,
			bytes: this.toBase64()
		};
	}
	static fromJSON(t) {
		if (Vu(t, e._jsonSchema)) return e.fromBase64String(t.bytes);
	}
};
Wm._jsonSchemaVersion = "firestore/bytes/1.0", Wm._jsonSchema = {
	type: Bu("string", Wm._jsonSchemaVersion),
	bytes: Bu("string")
};
var Gm = class {
	constructor(...e) {
		for (let t = 0; t < e.length; ++t) if (e[t].length === 0) throw new H(V.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
		this._internalPath = new Du(e);
	}
	isEqual(e) {
		return this._internalPath.isEqual(e._internalPath);
	}
};
function Km() {
	return new Gm(wu);
}
var qm = class {
	constructor(e) {
		this._methodName = e;
	}
}, Jm = class e {
	constructor(e, t) {
		if (!isFinite(e) || e < -90 || e > 90) throw new H(V.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
		if (!isFinite(t) || t < -180 || t > 180) throw new H(V.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
		this._lat = e, this._long = t;
	}
	get latitude() {
		return this._lat;
	}
	get longitude() {
		return this._long;
	}
	isEqual(e) {
		return this._lat === e._lat && this._long === e._long;
	}
	_compareTo(e) {
		return B(this._lat, e._lat) || B(this._long, e._long);
	}
	toJSON() {
		return {
			latitude: this._lat,
			longitude: this._long,
			type: e._jsonSchemaVersion
		};
	}
	static fromJSON(t) {
		if (Vu(t, e._jsonSchema)) return new e(t.latitude, t.longitude);
	}
};
Jm._jsonSchemaVersion = "firestore/geoPoint/1.0", Jm._jsonSchema = {
	type: Bu("string", Jm._jsonSchemaVersion),
	latitude: Bu("number"),
	longitude: Bu("number")
};
var Ym = class {
	constructor(e) {
		this.uid = e;
	}
	isAuthenticated() {
		return this.uid != null;
	}
	toKey() {
		return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
	}
	isEqual(e) {
		return e.uid === this.uid;
	}
};
Ym.UNAUTHENTICATED = new Ym(null), Ym.GOOGLE_CREDENTIALS = new Ym("google-credentials-uid"), Ym.FIRST_PARTY = new Ym("first-party-uid"), Ym.MOCK_USER = new Ym("mock-user");
var Xm = class {
	constructor() {
		this.promise = new Promise(((e, t) => {
			this.resolve = e, this.reject = t;
		}));
	}
}, Zm = class {
	constructor(e, t) {
		this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
	}
}, Qm = class {
	getToken() {
		return Promise.resolve(null);
	}
	invalidateToken() {}
	start(e, t) {
		e.enqueueRetryable((() => t(Ym.UNAUTHENTICATED)));
	}
	shutdown() {}
}, $m = class {
	constructor(e) {
		this.token = e, this.changeListener = null;
	}
	getToken() {
		return Promise.resolve(this.token);
	}
	invalidateToken() {}
	start(e, t) {
		this.changeListener = t, e.enqueueRetryable((() => t(this.token.user)));
	}
	shutdown() {
		this.changeListener = null;
	}
}, eh = class {
	constructor(e) {
		this.ve = e, this.currentUser = Ym.UNAUTHENTICATED, this.De = 0, this.forceRefresh = !1, this.auth = null;
	}
	start(e, t) {
		R(this.xe === void 0, 42304);
		let n = this.De, r = (e) => this.De === n ? Promise.resolve() : (n = this.De, t(e)), i = new Xm();
		this.xe = () => {
			this.De++, this.currentUser = this.Ce(), i.resolve(), i = new Xm(), e.enqueueRetryable((() => r(this.currentUser)));
		};
		let a = () => {
			let t = i;
			e.enqueueRetryable((async () => {
				await t.promise, await r(this.currentUser);
			}));
		}, o = (e) => {
			I("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = e, this.xe && (this.auth.addAuthTokenListener(this.xe), a());
		};
		this.ve.onInit(((e) => o(e))), setTimeout((() => {
			if (!this.auth) {
				let e = this.ve.getImmediate({ optional: !0 });
				e ? o(e) : (I("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new Xm());
			}
		}), 0), a();
	}
	getToken() {
		let e = this.De, t = this.forceRefresh;
		return this.forceRefresh = !1, this.auth ? this.auth.getToken(t).then(((t) => this.De === e ? t ? (R(typeof t.accessToken == "string", 31837, { Fe: t }), new Zm(t.accessToken, this.currentUser)) : null : (I("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()))) : Promise.resolve(null);
	}
	invalidateToken() {
		this.forceRefresh = !0;
	}
	shutdown() {
		this.auth && this.xe && this.auth.removeAuthTokenListener(this.xe), this.xe = void 0;
	}
	Ce() {
		let e = this.auth && this.auth.getUid();
		return R(e === null || typeof e == "string", 2055, { Oe: e }), new Ym(e);
	}
}, th = class {
	constructor(e, t, n) {
		this.Me = e, this.Ne = t, this.Le = n, this.type = "FirstParty", this.user = Ym.FIRST_PARTY, this.Be = /* @__PURE__ */ new Map();
	}
	Ue() {
		return this.Le ? this.Le() : null;
	}
	get headers() {
		this.Be.set("X-Goog-AuthUser", this.Me);
		let e = this.Ue();
		return e && this.Be.set("Authorization", e), this.Ne && this.Be.set("X-Goog-Iam-Authorization-Token", this.Ne), this.Be;
	}
}, nh = class {
	constructor(e, t, n) {
		this.Me = e, this.Ne = t, this.Le = n;
	}
	getToken() {
		return Promise.resolve(new th(this.Me, this.Ne, this.Le));
	}
	start(e, t) {
		e.enqueueRetryable((() => t(Ym.FIRST_PARTY)));
	}
	shutdown() {}
	invalidateToken() {}
}, rh = class {
	constructor(e) {
		this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
	}
}, ih = class {
	constructor(e, t) {
		this.ke = t, this.forceRefresh = !1, this.appCheck = null, this.qe = null, this.$e = null, Zt(e) && e.settings.appCheckToken && (this.$e = e.settings.appCheckToken);
	}
	start(e, t) {
		R(this.xe === void 0, 3512);
		let n = (e) => {
			e.error != null && I("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);
			let n = e.token !== this.qe;
			return this.qe = e.token, I("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), n ? t(e.token) : Promise.resolve();
		};
		this.xe = (t) => {
			e.enqueueRetryable((() => n(t)));
		};
		let r = (e) => {
			I("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = e, this.xe && this.appCheck.addTokenListener(this.xe);
		};
		this.ke.onInit(((e) => r(e))), setTimeout((() => {
			if (!this.appCheck) {
				let e = this.ke.getImmediate({ optional: !0 });
				e ? r(e) : I("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
			}
		}), 0);
	}
	getToken() {
		if (this.$e) return Promise.resolve(new rh(this.$e));
		let e = this.forceRefresh;
		return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then(((e) => e ? (R(typeof e.token == "string", 44558, { tokenResult: e }), this.qe = e.token, new rh(e.token)) : null)) : Promise.resolve(null);
	}
	invalidateToken() {
		this.forceRefresh = !0;
	}
	shutdown() {
		this.appCheck && this.xe && this.appCheck.removeTokenListener(this.xe), this.xe = void 0;
	}
};
function ah(e) {
	let t = {};
	return e.timeoutSeconds !== void 0 && (t.timeoutSeconds = e.timeoutSeconds), t;
}
var oh = class {
	Ke(e) {}
	shutdown() {}
}, sh = "ConnectivityMonitor", ch = class {
	constructor() {
		this.Qe = () => this.We(), this.Ge = () => this.ze(), this.je = [], this.He();
	}
	Ke(e) {
		this.je.push(e);
	}
	shutdown() {
		window.removeEventListener("online", this.Qe), window.removeEventListener("offline", this.Ge);
	}
	He() {
		window.addEventListener("online", this.Qe), window.addEventListener("offline", this.Ge);
	}
	We() {
		I(sh, "Network connectivity changed: AVAILABLE");
		for (let e of this.je) e(0);
	}
	ze() {
		I(sh, "Network connectivity changed: UNAVAILABLE");
		for (let e of this.je) e(1);
	}
	static Je() {
		return typeof window < "u" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
	}
}, lh = null;
function uh() {
	return lh === null ? lh = function() {
		return 268435456 + Math.round(2147483648 * Math.random());
	}() : lh++, "0x" + lh.toString(16);
}
var dh = "RestConnection", fh = {
	BatchGetDocuments: "batchGet",
	Commit: "commit",
	RunQuery: "runQuery",
	RunAggregationQuery: "runAggregationQuery",
	ExecutePipeline: "executePipeline"
}, ph = class {
	get Ye() {
		return !1;
	}
	constructor(e) {
		this.databaseInfo = e, this.databaseId = e.databaseId;
		let t = e.ssl ? "https" : "http", n = encodeURIComponent(this.databaseId.projectId), r = encodeURIComponent(this.databaseId.database);
		this.Ze = t + "://" + e.host, this.Xe = `projects/${n}/databases/${r}`, this.et = this.databaseId.database === id ? `project_id=${n}` : `project_id=${n}&database_id=${r}`;
	}
	tt(e, t, n, r, i) {
		let a = uh(), o = this.nt(e, t.toUriEncodedString());
		I(dh, `Sending RPC '${e}' ${a}:`, o, n);
		let s = {
			"google-cloud-resource-prefix": this.Xe,
			"x-goog-request-params": this.et
		};
		this.rt(s, r, i);
		let { host: c } = new URL(o), l = ke(c);
		return this.it(e, o, s, n, l).then(((t) => (I(dh, `Received RPC '${e}' ${a}: `, t), t)), ((t) => {
			throw lu(dh, `RPC '${e}' ${a} failed with error: `, t, "url: ", o, "request:", n), t;
		}));
	}
	st(e, t, n, r, i, a) {
		return this.tt(e, t, n, r, i);
	}
	rt(e, t, n) {
		if (e["X-Goog-Api-Client"] = function() {
			return "gl-js/ fire/" + iu;
		}(), e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), t && t.headers.forEach(((t, n) => e[n] = t)), n && n.headers.forEach(((t, n) => e[n] = t)), this.databaseInfo._customHeaders) for (let t of Object.keys(this.databaseInfo._customHeaders)) e[t] = this.databaseInfo._customHeaders[t];
	}
	nt(e, t) {
		let n = fh[e], r = `${this.Ze}/v1/${t}:${n}`;
		return this.databaseInfo.apiKey && (r = `${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`), r;
	}
	terminate() {}
}, mh = class {
	constructor(e) {
		this._t = e._t, this.ot = e.ot;
	}
	ut(e) {
		this.ct = e;
	}
	lt(e) {
		this.Et = e;
	}
	ht(e) {
		this.Tt = e;
	}
	onMessage(e) {
		this.Pt = e;
	}
	close() {
		this.ot();
	}
	send(e) {
		this._t(e);
	}
	Rt() {
		this.ct();
	}
	It() {
		this.Et();
	}
	At(e) {
		this.Tt(e);
	}
	Vt(e) {
		this.Pt(e);
	}
}, hh = "WebChannelConnection", gh = (e, t, n) => {
	e.listen(t, ((e) => {
		try {
			n(e);
		} catch (e) {
			setTimeout((() => {
				throw e;
			}), 0);
		}
	}));
}, _h = class e extends ph {
	constructor(e) {
		super(e), this.dt = [], this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
	}
	static ft() {
		e.gt ||= (gh(wc(), Cc.STAT_EVENT, ((e) => {
			e.stat === Sc.PROXY ? I(hh, "STAT_EVENT: detected buffering proxy") : e.stat === Sc.NOPROXY && I(hh, "STAT_EVENT: detected no buffering proxy");
		})), !0);
	}
	it(e, t, n, r, i) {
		let a = uh();
		return new Promise(((i, o) => {
			let s = new vc();
			s.setWithCredentials(!0), s.listenOnce(bc.COMPLETE, (() => {
				try {
					switch (s.getLastErrorCode()) {
						case xc.NO_ERROR:
							let t = s.getResponseJson();
							I(hh, `XHR for RPC '${e}' ${a} received:`, JSON.stringify(t)), i(t);
							break;
						case xc.TIMEOUT:
							I(hh, `RPC '${e}' ${a} timed out`), o(new H(V.DEADLINE_EXCEEDED, "Request time out"));
							break;
						case xc.HTTP_ERROR:
							let n = s.getStatus();
							if (I(hh, `RPC '${e}' ${a} failed with status:`, n, "response text:", s.getResponseText()), n > 0) {
								let e = s.getResponseJson();
								Array.isArray(e) && (e = e[0]);
								let t = e?.error;
								t && t.status && t.message ? o(new H(function(e) {
									let t = e.toLowerCase().replace(/_/g, "-");
									return Object.values(V).indexOf(t) >= 0 ? t : V.UNKNOWN;
								}(t.status), t.message)) : o(new H(V.UNKNOWN, "Server responded with status " + s.getStatus()));
							} else o(new H(V.UNAVAILABLE, "Connection failed."));
							break;
						default: L(9055, {
							yt: e,
							streamId: a,
							wt: s.getLastErrorCode(),
							bt: s.getLastError()
						});
					}
				} finally {
					I(hh, `RPC '${e}' ${a} completed.`);
				}
			}));
			let c = JSON.stringify(r);
			I(hh, `RPC '${e}' ${a} sending request:`, r), s.send(t, "POST", c, n, 15);
		}));
	}
	St(t, n, r) {
		let i = uh(), a = [
			this.Ze,
			"/",
			"google.firestore.v1.Firestore",
			"/",
			t,
			"/channel"
		], o = this.createWebChannelTransport(), s = {
			httpSessionIdParam: "gsessionid",
			initMessageHeaders: {},
			messageUrlParams: { database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}` },
			sendRawJson: !0,
			supportsCrossDomainXhr: !0,
			internalChannelParams: { forwardChannelRequestTimeoutMs: 6e5 },
			forceLongPolling: this.forceLongPolling,
			detectBufferingProxy: this.autoDetectLongPolling
		}, c = this.longPollingOptions.timeoutSeconds;
		c !== void 0 && (s.longPollingTimeout = Math.round(1e3 * c)), this.useFetchStreams && (s.useFetchStreams = !0), this.rt(s.initMessageHeaders, n, r), s.encodeInitMessageHeaders = !0;
		let l = a.join("");
		I(hh, `Creating RPC '${t}' stream ${i}: ${l}`, s);
		let u = o.createWebChannel(l, s);
		this.vt(u);
		let d = !1, f = !1, p = new mh({
			_t: (e) => {
				f ? I(hh, `Not sending because RPC '${t}' stream ${i} is closed:`, e) : (d ||= (I(hh, `Opening RPC '${t}' stream ${i} transport.`), u.open(), !0), I(hh, `RPC '${t}' stream ${i} sending:`, e), u.send(e));
			},
			ot: () => u.close()
		});
		return gh(u, yc.EventType.OPEN, (() => {
			f || (I(hh, `RPC '${t}' stream ${i} transport opened.`), p.Rt());
		})), gh(u, yc.EventType.CLOSE, (() => {
			f || (f = !0, I(hh, `RPC '${t}' stream ${i} transport closed`), p.At(), this.Dt(u));
		})), gh(u, yc.EventType.ERROR, ((e) => {
			f || (f = !0, lu(hh, `RPC '${t}' stream ${i} transport errored. Name:`, e.name, "Message:", e.message), p.At(new H(V.UNAVAILABLE, "The operation could not be completed")));
		})), gh(u, yc.EventType.MESSAGE, ((e) => {
			if (!f) {
				let n = e.data[0];
				R(!!n, 16349);
				let r = n, a = r?.error || r[0]?.error;
				if (a) {
					I(hh, `RPC '${t}' stream ${i} received error:`, a);
					let e = a.status, n = function(e) {
						let t = wp[e];
						if (t !== void 0) return Ep(t);
					}(e), r = a.message;
					e === "NOT_FOUND" && r.includes("database") && r.includes("does not exist") && r.includes(this.databaseId.database) && lu(`Database '${this.databaseId.database}' not found. Please check your project configuration.`), n === void 0 && (n = V.INTERNAL, r = "Unknown error status: " + e + " with message " + a.message), f = !0, p.At(new H(n, r)), u.close();
				} else I(hh, `RPC '${t}' stream ${i} received:`, n), p.Vt(n);
			}
		})), e.ft(), setTimeout((() => {
			p.It();
		}), 0), p;
	}
	terminate() {
		this.dt.forEach(((e) => e.close())), this.dt = [];
	}
	vt(e) {
		this.dt.push(e);
	}
	Dt(e) {
		this.dt = this.dt.filter(((t) => t === e));
	}
	rt(e, t, n) {
		super.rt(e, t, n), this.databaseInfo.apiKey && (e["x-goog-api-key"] = this.databaseInfo.apiKey);
	}
	createWebChannelTransport() {
		return Tc();
	}
};
function vh(e) {
	return new _h(e);
}
_h.gt = !1;
var yh = class {
	constructor(e, t, n = 1e3, r = 1.5, i = 6e4) {
		this.xt = e, this.timerId = t, this.Ct = n, this.Ft = r, this.Ot = i, this.Mt = 0, this.Nt = null, this.Lt = Date.now(), this.reset();
	}
	reset() {
		this.Mt = 0;
	}
	Bt() {
		this.Mt = this.Ot;
	}
	Ut(e) {
		this.cancel();
		let t = Math.floor(this.Mt + this.kt()), n = Math.max(0, Date.now() - this.Lt), r = Math.max(0, t - n);
		r > 0 && I("ExponentialBackoff", `Backing off for ${r} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`), this.Nt = this.xt.enqueueAfterDelay(this.timerId, r, (() => (this.Lt = Date.now(), e()))), this.Mt *= this.Ft, this.Mt < this.Ct && (this.Mt = this.Ct), this.Mt > this.Ot && (this.Mt = this.Ot);
	}
	qt() {
		this.Nt !== null && (this.Nt.skipDelay(), this.Nt = null);
	}
	cancel() {
		this.Nt !== null && (this.Nt.cancel(), this.Nt = null);
	}
	kt() {
		return (Math.random() - .5) * this.Mt;
	}
}, bh = "PersistentStream", xh = class {
	constructor(e, t, n, r, i, a, o, s) {
		this.xt = e, this.$t = n, this.Kt = r, this.connection = i, this.authCredentialsProvider = a, this.appCheckCredentialsProvider = o, this.listener = s, this.state = 0, this.Qt = 0, this.Wt = null, this.Gt = null, this.stream = null, this.zt = 0, this.jt = new yh(e, t);
	}
	Ht() {
		return this.state === 1 || this.state === 5 || this.Jt();
	}
	Jt() {
		return this.state === 2 || this.state === 3;
	}
	start() {
		this.zt = 0, this.state === 4 ? this.Yt() : this.auth();
	}
	async stop() {
		this.Ht() && await this.close(0);
	}
	Zt() {
		this.state = 0, this.jt.reset();
	}
	Xt() {
		this.Jt() && this.Wt === null && (this.Wt = this.xt.enqueueAfterDelay(this.$t, 6e4, (() => this.en())));
	}
	tn(e) {
		this.nn(), this.stream.send(e);
	}
	async en() {
		if (this.Jt()) return this.close(0);
	}
	nn() {
		this.Wt &&= (this.Wt.cancel(), null);
	}
	rn() {
		this.Gt &&= (this.Gt.cancel(), null);
	}
	async close(e, t) {
		this.nn(), this.rn(), this.jt.cancel(), this.Qt++, e === 4 ? t && t.code === V.RESOURCE_EXHAUSTED ? (cu(t.toString()), cu("Using maximum backoff delay to prevent overloading the backend."), this.jt.Bt()) : t && t.code === V.UNAUTHENTICATED && this.state !== 3 && (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()) : this.jt.reset(), this.stream !== null && (this.sn(), this.stream.close(), this.stream = null), this.state = e, await this.listener.ht(t);
	}
	sn() {}
	auth() {
		this.state = 1;
		let e = this._n(this.Qt), t = this.Qt;
		Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then((([e, n]) => {
			this.Qt === t && this.an(e, n);
		}), ((t) => {
			e((() => {
				let e = new H(V.UNKNOWN, "Fetching auth token failed: " + t.message);
				return this.un(e);
			}));
		}));
	}
	an(e, t) {
		let n = this._n(this.Qt);
		this.stream = this.cn(e, t), this.stream.ut((() => {
			n((() => this.listener.ut()));
		})), this.stream.lt((() => {
			n((() => (this.state = 2, this.Gt = this.xt.enqueueAfterDelay(this.Kt, 1e4, (() => (this.Jt() && (this.state = 3), Promise.resolve()))), this.listener.lt())));
		})), this.stream.ht(((e) => {
			n((() => this.un(e)));
		})), this.stream.onMessage(((e) => {
			n((() => ++this.zt == 1 ? this.En(e) : this.onNext(e)));
		}));
	}
	Yt() {
		this.state = 5, this.jt.Ut((async () => {
			this.state = 0, this.start();
		}));
	}
	un(e) {
		return I(bh, `close with error: ${e}`), this.stream = null, this.close(4, e);
	}
	_n(e) {
		return (t) => {
			this.xt.enqueueAndForget((() => this.Qt === e ? t() : (I(bh, "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve())));
		};
	}
}, Sh = class extends xh {
	constructor(e, t, n, r, i, a) {
		super(e, "listen_stream_connection_backoff", "listen_stream_idle", "health_check_timeout", t, n, r, a), this.serializer = i;
	}
	cn(e, t) {
		return this.connection.St("Listen", e, t);
	}
	En(e) {
		return this.onNext(e);
	}
	onNext(e) {
		this.jt.reset();
		let t = Cm(this.serializer, e), n = function(e) {
			if (!("targetChange" in e)) return K.min();
			let t = e.targetChange;
			return t.targetIds && t.targetIds.length ? K.min() : t.readTime ? fm(t.readTime) : K.min();
		}(e);
		return this.listener.hn(t, n);
	}
	Tn(e) {
		let t = {};
		t.database = bm(this.serializer), t.addTarget = function(e, t) {
			let n, r = t.target;
			if (n = ap(r) ? { pipelineQuery: Am(e, r) } : op(r) ? { documents: Em(e, r) } : { query: Dm(e, r).be }, n.targetId = t.targetId, t.resumeToken.approximateByteSize() > 0) {
				n.resumeToken = um(e, t.resumeToken);
				let r = sm(e, t.expectedCount);
				r !== null && (n.expectedCount = r);
			} else if (t.snapshotVersion.compareTo(K.min()) > 0) {
				n.readTime = cm(e, t.snapshotVersion.toTimestamp());
				let r = sm(e, t.expectedCount);
				r !== null && (n.expectedCount = r);
			}
			return n;
		}(this.serializer, e);
		let n = km(this.serializer, e);
		n && (t.labels = n), this.tn(t);
	}
	Pn(e) {
		let t = {};
		t.database = bm(this.serializer), t.removeTarget = e, this.tn(t);
	}
}, Ch = class extends xh {
	constructor(e, t, n, r, i, a) {
		super(e, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", t, n, r, a), this.serializer = i;
	}
	get Rn() {
		return this.zt > 0;
	}
	start() {
		this.lastStreamToken = void 0, super.start();
	}
	sn() {
		this.Rn && this.In([]);
	}
	cn(e, t) {
		return this.connection.St("Write", e, t);
	}
	En(e) {
		return R(!!e.streamToken, 31322), this.lastStreamToken = e.streamToken, R(!e.writeResults || e.writeResults.length === 0, 55816), this.listener.An();
	}
	onNext(e) {
		R(!!e.streamToken, 12678), this.lastStreamToken = e.streamToken, this.jt.reset();
		let t = Tm(e.writeResults, e.commitTime), n = fm(e.commitTime);
		return this.listener.Vn(n, t);
	}
	dn() {
		let e = {};
		e.database = bm(this.serializer), this.tn(e);
	}
	In(e) {
		let t = {
			streamToken: this.lastStreamToken,
			writes: e.map(((e) => wm(this.serializer, e)))
		};
		this.tn(t);
	}
}, wh = class {}, Th = class extends wh {
	constructor(e, t, n, r) {
		super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = n, this.serializer = r, this.fn = !1;
	}
	mn() {
		if (this.fn) throw new H(V.FAILED_PRECONDITION, "The client has already been terminated.");
	}
	tt(e, t, n, r) {
		return this.mn(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([i, a]) => this.connection.tt(e, mm(t, n), r, i, a))).catch(((e) => {
			throw e.name === "FirebaseError" ? (e.code === V.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e) : new H(V.UNKNOWN, e.toString());
		}));
	}
	st(e, t, n, r, i) {
		return this.mn(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([a, o]) => this.connection.st(e, mm(t, n), r, a, o, i))).catch(((e) => {
			throw e.name === "FirebaseError" ? (e.code === V.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e) : new H(V.UNKNOWN, e.toString());
		}));
	}
	terminate() {
		this.fn = !0, this.connection.terminate();
	}
};
function Eh(e, t, n, r) {
	return new Th(e, t, n, r);
}
var Dh = "ComponentProvider", Oh = /* @__PURE__ */ new Map();
function kh(e, t, n, r, i) {
	return new rd(e, t, n, i.host, i.ssl, i.experimentalForceLongPolling, i.experimentalAutoDetectLongPolling, ah(i.experimentalLongPollingOptions), i.useFetchStreams, i.isUsingEmulator, r, i._customHeaders, i.grpcFlowControlWindow);
}
var Ah = {
	didRun: !1,
	sequenceNumbersCollected: 0,
	targetsRemoved: 0,
	documentsRemoved: 0
}, jh = 41943040, Mh = class e {
	static withCacheSize(t) {
		return new e(t, e.DEFAULT_COLLECTION_PERCENTILE, e.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
	}
	constructor(e, t, n) {
		this.cacheSizeCollectionThreshold = e, this.percentileToCollect = t, this.maximumSequenceNumbersToCollect = n;
	}
};
Mh.DEFAULT_COLLECTION_PERCENTILE = 10, Mh.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, Mh.DEFAULT = new Mh(jh, Mh.DEFAULT_COLLECTION_PERCENTILE, Mh.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), Mh.DISABLED = new Mh(-1, 0, 0);
var Nh = class {
	constructor(e, t) {
		this.previousValue = e, t && (t.sequenceNumberHandler = (e) => this.pn(e), this.gn = (e) => t.writeSequenceNumber(e));
	}
	pn(e) {
		return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
	}
	next() {
		let e = ++this.previousValue;
		return this.gn && this.gn(e), e;
	}
};
Nh.yn = -1;
var Ph = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.", Fh = class {
	constructor() {
		this.onCommittedListeners = [];
	}
	addOnCommittedListener(e) {
		this.onCommittedListeners.push(e);
	}
	raiseOnCommittedEvent() {
		this.onCommittedListeners.forEach(((e) => e()));
	}
};
async function Ih(e) {
	if (e.code !== V.FAILED_PRECONDITION || e.message !== Ph) throw e;
	I("LocalStore", "Unexpectedly lost primary lease");
}
var Y = class e {
	constructor(e) {
		this.nextCallback = null, this.catchCallback = null, this.result = void 0, this.error = void 0, this.isDone = !1, this.callbackAttached = !1, e(((e) => {
			this.isDone = !0, this.result = e, this.nextCallback && this.nextCallback(e);
		}), ((e) => {
			this.isDone = !0, this.error = e, this.catchCallback && this.catchCallback(e);
		}));
	}
	catch(e) {
		return this.next(void 0, e);
	}
	next(t, n) {
		return this.callbackAttached && L(59440), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(n, this.error) : this.wrapSuccess(t, this.result) : new e(((e, r) => {
			this.nextCallback = (n) => {
				this.wrapSuccess(t, n).next(e, r);
			}, this.catchCallback = (t) => {
				this.wrapFailure(n, t).next(e, r);
			};
		}));
	}
	toPromise() {
		return new Promise(((e, t) => {
			this.next(e, t);
		}));
	}
	wrapUserFunction(t) {
		try {
			let n = t();
			return n instanceof e ? n : e.resolve(n);
		} catch (t) {
			return e.reject(t);
		}
	}
	wrapSuccess(t, n) {
		return t ? this.wrapUserFunction((() => t(n))) : e.resolve(n);
	}
	wrapFailure(t, n) {
		return t ? this.wrapUserFunction((() => t(n))) : e.reject(n);
	}
	static resolve(t) {
		return new e(((e, n) => {
			e(t);
		}));
	}
	static reject(t) {
		return new e(((e, n) => {
			n(t);
		}));
	}
	static waitFor(t) {
		return new e(((e, n) => {
			let r = 0, i = 0, a = !1;
			t.forEach(((t) => {
				++r, t.next((() => {
					++i, a && i === r && e();
				}), ((e) => n(e)));
			})), a = !0, i === r && e();
		}));
	}
	static or(t) {
		let n = e.resolve(!1);
		for (let r of t) n = n.next(((t) => t ? e.resolve(t) : r()));
		return n;
	}
	static forEach(e, t) {
		let n = [];
		return e.forEach(((e, r) => {
			n.push(t.call(this, e, r));
		})), this.waitFor(n);
	}
	static mapArray(t, n) {
		return new e(((e, r) => {
			let i = t.length, a = Array(i), o = 0;
			for (let s = 0; s < i; s++) {
				let c = s;
				n(t[c]).next(((t) => {
					a[c] = t, ++o, o === i && e(a);
				}), ((e) => r(e)));
			}
		}));
	}
	static doWhile(t, n) {
		return new e(((e, r) => {
			let i = () => {
				!0 === t() ? n().next((() => {
					i();
				}), r) : e();
			};
			i();
		}));
	}
};
function Lh(e) {
	let t = e.match(/Android ([\d.]+)/i), n = t ? t[1].split(".").slice(0, 2).join(".") : "-1";
	return Number(n);
}
function Rh(e) {
	return e.name === "IndexedDbTransactionError";
}
var zh = "LruGarbageCollector", Bh = 1048576;
function Vh([e, t], [n, r]) {
	let i = B(e, n);
	return i === 0 ? B(t, r) : i;
}
var Hh = class {
	constructor(e) {
		this.Jn = e, this.buffer = new Su(Vh), this.Yn = 0;
	}
	Zn() {
		return ++this.Yn;
	}
	Xn(e) {
		let t = [e, this.Zn()];
		if (this.buffer.size < this.Jn) this.buffer = this.buffer.add(t);
		else {
			let e = this.buffer.last();
			Vh(t, e) < 0 && (this.buffer = this.buffer.delete(e).add(t));
		}
	}
	get maxValue() {
		return this.buffer.last()[0];
	}
}, Uh = class {
	constructor(e, t, n) {
		this.garbageCollector = e, this.asyncQueue = t, this.localStore = n, this.er = null;
	}
	start() {
		this.garbageCollector.params.cacheSizeCollectionThreshold !== -1 && this.tr(6e4);
	}
	stop() {
		this.er &&= (this.er.cancel(), null);
	}
	get started() {
		return this.er !== null;
	}
	tr(e) {
		I(zh, `Garbage collection scheduled in ${e}ms`), this.er = this.asyncQueue.enqueueAfterDelay("lru_garbage_collection", e, (async () => {
			this.er = null;
			try {
				await this.localStore.collectGarbage(this.garbageCollector);
			} catch (e) {
				Rh(e) ? I(zh, "Ignoring IndexedDB error during garbage collection: ", e) : await Ih(e);
			}
			await this.tr(3e5);
		}));
	}
}, Wh = class {
	constructor(e, t) {
		this.nr = e, this.params = t;
	}
	calculateTargetCount(e, t) {
		return this.nr.rr(e).next(((e) => Math.floor(t / 100 * e)));
	}
	nthSequenceNumber(e, t) {
		if (t === 0) return Y.resolve(Nh.yn);
		let n = new Hh(t);
		return this.nr.forEachTarget(e, ((e) => n.Xn(e.sequenceNumber))).next((() => this.nr.ir(e, ((e) => n.Xn(e))))).next((() => n.maxValue));
	}
	removeTargets(e, t, n) {
		return this.nr.removeTargets(e, t, n);
	}
	removeOrphanedDocuments(e, t) {
		return this.nr.removeOrphanedDocuments(e, t);
	}
	collect(e, t) {
		return this.params.cacheSizeCollectionThreshold === -1 ? (I("LruGarbageCollector", "Garbage collection skipped; disabled"), Y.resolve(Ah)) : this.getCacheSize(e).next(((n) => n < this.params.cacheSizeCollectionThreshold ? (I("LruGarbageCollector", `Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`), Ah) : this.sr(e, t)));
	}
	getCacheSize(e) {
		return this.nr.getCacheSize(e);
	}
	sr(e, t) {
		let n, r, i, a, o, s, c, l = Date.now();
		return this.calculateTargetCount(e, this.params.percentileToCollect).next(((t) => (t > this.params.maximumSequenceNumbersToCollect ? (I("LruGarbageCollector", `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`), r = this.params.maximumSequenceNumbersToCollect) : r = t, a = Date.now(), this.nthSequenceNumber(e, r)))).next(((r) => (n = r, o = Date.now(), this.removeTargets(e, n, t)))).next(((t) => (i = t, s = Date.now(), this.removeOrphanedDocuments(e, n)))).next(((e) => (c = Date.now(), su() <= b.DEBUG && I("LruGarbageCollector", `LRU Garbage Collection\n\tCounted targets in ${a - l}ms\n\tDetermined least recently used ${r} in ` + (o - a) + `ms
\tRemoved ${i} targets in ` + (s - o) + `ms
\tRemoved ${e} documents in ` + (c - s) + `ms
Total Duration: ${c - l}ms`), Y.resolve({
			didRun: !0,
			sequenceNumbersCollected: r,
			targetsRemoved: i,
			documentsRemoved: e
		}))));
	}
};
function Gh(e, t) {
	return new Wh(e, t);
}
var Kh = "firestore.googleapis.com", qh = !0, Jh = class {
	constructor(e) {
		if (e.host === void 0) {
			if (e.ssl !== void 0) throw new H(V.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
			this.host = Kh, this.ssl = qh;
		} else this.host = e.host, this.ssl = e.ssl ?? qh;
		if (this.isUsingEmulator = e.emulatorOptions !== void 0, this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, e._customHeaders && (this._customHeaders = { ...e._customHeaders }), e.cacheSizeBytes === void 0) this.cacheSizeBytes = jh;
		else {
			if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < Bh) throw new H(V.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
			this.cacheSizeBytes = e.cacheSizeBytes;
		}
		if (Pu("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalAutoDetectLongPolling = this.experimentalForceLongPolling ? !1 : e.experimentalAutoDetectLongPolling === void 0 || !!e.experimentalAutoDetectLongPolling, this.experimentalLongPollingOptions = ah(e.experimentalLongPollingOptions ?? {}), function(e) {
			if (e.timeoutSeconds !== void 0) {
				if (isNaN(e.timeoutSeconds)) throw new H(V.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);
				if (e.timeoutSeconds < 5) throw new H(V.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);
				if (e.timeoutSeconds > 30) throw new H(V.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`);
			}
		}(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams, e.grpcFlowControlWindow !== void 0) {
			if (typeof e.grpcFlowControlWindow != "number" || e.grpcFlowControlWindow <= 0 || e.grpcFlowControlWindow > 2147483647 || !Number.isInteger(e.grpcFlowControlWindow)) throw new H(V.INVALID_ARGUMENT, "grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");
			this.grpcFlowControlWindow = e.grpcFlowControlWindow;
		}
	}
	isEqual(e) {
		return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function(e, t) {
			return e.timeoutSeconds === t.timeoutSeconds;
		}(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams && this.grpcFlowControlWindow === e.grpcFlowControlWindow && function(e, t) {
			if (e === t) return !0;
			if (!e || !t) return !1;
			let n = Object.keys(e), r = Object.keys(t);
			if (n.length !== r.length) return !1;
			for (let r of n) if (e[r] !== t[r]) return !1;
			return !0;
		}(this._customHeaders, e._customHeaders);
	}
}, Yh = class {
	constructor(e, t, n, r) {
		this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = n, this._app = r, this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new Jh({}), this._settingsFrozen = !1, this._emulatorOptions = {}, this._terminateTask = "notTerminated";
	}
	get app() {
		if (!this._app) throw new H(V.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
		return this._app;
	}
	get _initialized() {
		return this._settingsFrozen;
	}
	get _terminated() {
		return this._terminateTask !== "notTerminated";
	}
	_setSettings(e) {
		if (this._settingsFrozen) throw new H(V.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
		this._settings = new Jh(e), this._emulatorOptions = e.emulatorOptions || {}, e.credentials !== void 0 && (this._authCredentials = function(e) {
			if (!e) return new Qm();
			switch (e.type) {
				case "firstParty": return new nh(e.sessionIndex || "0", e.iamToken || null, e.authTokenFactory || null);
				case "provider": return e.client;
				default: throw new H(V.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
			}
		}(e.credentials));
	}
	_getSettings() {
		return this._settings;
	}
	_getEmulatorOptions() {
		return this._emulatorOptions;
	}
	_freezeSettings() {
		return this._settingsFrozen = !0, this._settings;
	}
	_delete() {
		return this._terminateTask === "notTerminated" && (this._terminateTask = this._terminate()), this._terminateTask;
	}
	async _restart() {
		this._terminateTask === "notTerminated" ? await this._terminate() : this._terminateTask = "notTerminated";
	}
	toJSON() {
		return {
			app: this._app,
			databaseId: this._databaseId,
			settings: this._settings
		};
	}
	_terminate() {
		return function(e) {
			let t = Oh.get(e);
			t && (I(Dh, "Removing Datastore"), Oh.delete(e), t.terminate());
		}(this), Promise.resolve();
	}
};
function Xh(e, t, n, r = {}) {
	e = zu(e, Yh);
	let i = ke(t), a = e._getSettings(), o = {
		...a,
		emulatorOptions: e._getEmulatorOptions()
	}, s = `${t}:${n}`;
	i && Ae(`https://${s}`), a.host !== Kh && a.host !== s && lu("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");
	let c = {
		...a,
		host: s,
		ssl: i,
		emulatorOptions: r
	};
	if (!he(c, o) && (e._setSettings(c), r.mockUserToken)) {
		let t, n;
		if (typeof r.mockUserToken == "string") t = r.mockUserToken, n = Ym.MOCK_USER;
		else {
			t = ee(r.mockUserToken, e._app?.options.projectId);
			let i = r.mockUserToken.sub || r.mockUserToken.user_id;
			if (!i) throw new H(V.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
			n = new Ym(i);
		}
		e._authCredentials = new $m(new Zm(t, n));
	}
}
var Zh = class e {
	constructor(e, t, n) {
		this.converter = t, this._query = n, this.type = "query", this.firestore = e;
	}
	withConverter(t) {
		return new e(this.firestore, t, this._query);
	}
}, Qh = class e {
	constructor(e, t, n) {
		this.converter = t, this._key = n, this.type = "document", this.firestore = e;
	}
	get _path() {
		return this._key.path;
	}
	get id() {
		return this._key.path.lastSegment();
	}
	get path() {
		return this._key.path.canonicalString();
	}
	get parent() {
		return new $h(this.firestore, this.converter, this._key.path.popLast());
	}
	withConverter(t) {
		return new e(this.firestore, t, this._key);
	}
	toJSON() {
		return {
			type: e._jsonSchemaVersion,
			referencePath: this._key.toString()
		};
	}
	static fromJSON(t, n, r) {
		if (Vu(n, e._jsonSchema)) return new e(t, r || null, new W(U.fromString(n.referencePath)));
	}
};
Qh._jsonSchemaVersion = "firestore/documentReference/1.0", Qh._jsonSchema = {
	type: Bu("string", Qh._jsonSchemaVersion),
	referencePath: Bu("string")
};
var $h = class e extends Zh {
	constructor(e, t, n) {
		super(e, t, lp(n)), this._path = n, this.type = "collection";
	}
	get id() {
		return this._query.path.lastSegment();
	}
	get path() {
		return this._query.path.canonicalString();
	}
	get parent() {
		let e = this._path.popLast();
		return e.isEmpty() ? null : new Qh(this.firestore, null, new W(e));
	}
	withConverter(t) {
		return new e(this.firestore, t, this._path);
	}
};
function eg(e, t, ...n) {
	if (e = y(e), Nu("collection", "path", t), e instanceof Yh) {
		let r = U.fromString(t, ...n);
		return Iu(r), new $h(e, null, r);
	}
	{
		if (!(e instanceof Qh || e instanceof $h)) throw new H(V.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
		let r = e._path.child(U.fromString(t, ...n));
		return Iu(r), new $h(e.firestore, null, r);
	}
}
function tg(e, t, ...n) {
	if (e = y(e), arguments.length === 1 && (t = pu.newId()), Nu("doc", "path", t), e instanceof Yh) {
		let r = U.fromString(t, ...n);
		return Fu(r), new Qh(e, null, new W(r));
	}
	{
		if (!(e instanceof Qh || e instanceof $h)) throw new H(V.INVALID_ARGUMENT, "Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
		let r = e._path.child(U.fromString(t, ...n));
		return Fu(r), new Qh(e.firestore, e instanceof $h ? e.converter : null, new W(r));
	}
}
var ng = class e {
	constructor(e) {
		this._values = (e || []).map(((e) => e));
	}
	toArray() {
		return this._values.map(((e) => e));
	}
	isEqual(e) {
		return function(e, t) {
			if (e.length !== t.length) return !1;
			for (let n = 0; n < e.length; ++n) if (e[n] !== t[n]) return !1;
			return !0;
		}(this._values, e._values);
	}
	toJSON() {
		return {
			type: e._jsonSchemaVersion,
			vectorValues: this._values
		};
	}
	static fromJSON(t) {
		if (Vu(t, e._jsonSchema)) {
			if (Array.isArray(t.vectorValues) && t.vectorValues.every(((e) => typeof e == "number"))) return new e(t.vectorValues);
			throw new H(V.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
		}
	}
};
ng._jsonSchemaVersion = "firestore/vectorValue/1.0", ng._jsonSchema = {
	type: Bu("string", ng._jsonSchemaVersion),
	vectorValues: Bu("object")
};
var rg = /^__.*__$/, ig = class {
	constructor(e, t, n) {
		this.data = e, this.fieldMask = t, this.fieldTransforms = n;
	}
	toMutation(e, t) {
		return this.fieldMask === null ? new bf(e, this.data, t, this.fieldTransforms) : new xf(e, this.data, this.fieldMask, t, this.fieldTransforms);
	}
}, ag = class {
	constructor(e, t, n) {
		this.data = e, this.fieldMask = t, this.fieldTransforms = n;
	}
	toMutation(e, t) {
		return new xf(e, this.data, this.fieldMask, t, this.fieldTransforms);
	}
};
function og(e) {
	switch (e) {
		case 0:
		case 2:
		case 1: return !0;
		case 3:
		case 4: return !1;
		default: throw L(40011, { dataSource: e });
	}
}
var sg = class e {
	constructor(e, t, n, r, i, a) {
		this.settings = e, this.databaseId = t, this.serializer = n, this.ignoreUndefinedProperties = r, i === void 0 && this.validatePath(), this.fieldTransforms = i || [], this.fieldMask = a || [];
	}
	get path() {
		return this.settings.path;
	}
	get dataSource() {
		return this.settings.dataSource;
	}
	contextWith(t) {
		return new e({
			...this.settings,
			...t
		}, this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
	}
	childContextForField(e) {
		let t = this.path?.child(e), n = this.contextWith({
			path: t,
			arrayElement: !1
		});
		return n.validatePathSegment(e), n;
	}
	childContextForFieldPath(e) {
		let t = this.path?.child(e), n = this.contextWith({
			path: t,
			arrayElement: !1
		});
		return n.validatePath(), n;
	}
	childContextForArray(e) {
		return this.contextWith({
			path: void 0,
			arrayElement: !0
		});
	}
	createError(e) {
		return Cg(e, this.settings.methodName, this.settings.hasConverter || !1, this.path, this.settings.targetDoc);
	}
	contains(e) {
		return this.fieldMask.find(((t) => e.isPrefixOf(t))) !== void 0 || this.fieldTransforms.find(((t) => e.isPrefixOf(t.field))) !== void 0;
	}
	validatePath() {
		if (this.path) for (let e = 0; e < this.path.length; e++) this.validatePathSegment(this.path.get(e));
	}
	validatePathSegment(e) {
		if (e.length === 0) throw this.createError("Document fields must not be empty");
		if (og(this.dataSource) && rg.test(e)) throw this.createError("Document fields cannot begin and end with \"__\"");
	}
}, cg = class {
	constructor(e, t, n) {
		this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = n || Um(e);
	}
	createContext(e, t, n, r = !1) {
		return new sg({
			dataSource: e,
			methodName: t,
			targetDoc: n,
			path: Du.emptyPath(),
			arrayElement: !1,
			hasConverter: r
		}, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
	}
};
function lg(e) {
	let t = e._freezeSettings(), n = Um(e._databaseId);
	return new cg(e._databaseId, !!t.ignoreUndefinedProperties, n);
}
function ug(e, t, n, r, i, a = {}) {
	let o = e.createContext(a.merge || a.mergeFields ? 2 : 0, t, n, i);
	yg("Data must be an object, but it was:", o, r);
	let s = _g(r, o), c, l;
	if (a.merge) c = new Ou(o.fieldMask), l = o.fieldTransforms;
	else if (a.mergeFields) {
		let e = [];
		for (let r of a.mergeFields) {
			let i = bg(t, r, n);
			if (!o.contains(i)) throw new H(V.INVALID_ARGUMENT, `Field '${i}' is specified in your field mask but missing from your input data.`);
			wg(e, i) || e.push(i);
		}
		c = new Ou(e), l = o.fieldTransforms.filter(((e) => c.covers(e.field)));
	} else c = null, l = o.fieldTransforms;
	return new ig(new Vd(s), c, l);
}
var dg = class e extends qm {
	_toFieldTransform(e) {
		if (e.dataSource !== 2) throw e.dataSource === 1 ? e.createError(`${this._methodName}() can only appear at the top level of your update data`) : e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
		return e.fieldMask.push(e.path), null;
	}
	isEqual(t) {
		return t instanceof e;
	}
}, fg = class e extends qm {
	_toFieldTransform(e) {
		return new lf(e.path, new Xd());
	}
	isEqual(t) {
		return t instanceof e;
	}
};
function pg(e, t, n, r) {
	let i = e.createContext(1, t, n);
	yg("Data must be an object, but it was:", i, r);
	let a = [], o = Vd.empty();
	return Au(r, ((e, r) => {
		let s = Sg(t, e, n);
		r = y(r);
		let c = i.childContextForFieldPath(s);
		if (r instanceof dg) a.push(s);
		else {
			let e = gg(r, c);
			e != null && (a.push(s), o.set(s, e));
		}
	})), new ag(o, new Ou(a), i.fieldTransforms);
}
function mg(e, t, n, r, i, a) {
	let o = e.createContext(1, t, n), s = [bg(t, r, n)], c = [i];
	if (a.length % 2 != 0) throw new H(V.INVALID_ARGUMENT, `Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);
	for (let e = 0; e < a.length; e += 2) s.push(bg(t, a[e])), c.push(a[e + 1]);
	let l = [], u = Vd.empty();
	for (let e = s.length - 1; e >= 0; --e) if (!wg(l, s[e])) {
		let t = s[e], n = c[e];
		n = y(n);
		let r = o.childContextForFieldPath(t);
		if (n instanceof dg) l.push(t);
		else {
			let e = gg(n, r);
			e != null && (l.push(t), u.set(t, e));
		}
	}
	return new ag(u, new Ou(l), o.fieldTransforms);
}
function hg(e, t, n, r = !1) {
	return gg(n, e.createContext(r ? 4 : 3, t));
}
function gg(e, t, n) {
	if (vg(e = y(e))) return yg("Unsupported field value:", t, e), _g(e, t);
	if (e instanceof qm) return function(e, t) {
		if (!og(t.dataSource)) throw t.createError(`${e._methodName}() can only be used with update() and set()`);
		if (!t.path) throw t.createError(`${e._methodName}() is not currently supported inside arrays`);
		let n = e._toFieldTransform(t);
		n && t.fieldTransforms.push(n);
	}(e, t), null;
	if (e === void 0 && t.ignoreUndefinedProperties) return null;
	if (t.path && t.fieldMask.push(t.path), e instanceof Array) {
		if (t.settings.arrayElement && t.dataSource !== 4) throw t.createError("Nested arrays are not supported");
		return function(e, t) {
			let n = [], r = 0;
			for (let i of e) {
				let e = gg(i, t.childContextForArray(r));
				e ??= { nullValue: "NULL_VALUE" }, n.push(e), r++;
			}
			return { arrayValue: { values: n } };
		}(e, t);
	}
	return function(e, t, n) {
		if ((e = y(e)) === null) return { nullValue: "NULL_VALUE" };
		if (typeof e == "number") return Gd(t.serializer, e);
		if (typeof e == "boolean") return { booleanValue: e };
		if (typeof e == "string") return { stringValue: e };
		if (e instanceof Date) {
			let n = Wu.fromDate(e);
			return { timestampValue: cm(t.serializer, n) };
		}
		if (e instanceof Wu) {
			let n = new Wu(e.seconds, 1e3 * Math.floor(e.nanoseconds / 1e3));
			return { timestampValue: cm(t.serializer, n) };
		}
		if (e instanceof Jm) return { geoPointValue: {
			latitude: e.latitude,
			longitude: e.longitude
		} };
		if (e instanceof Wm) return { bytesValue: um(t.serializer, e._byteString) };
		if (e instanceof Qh) {
			let n = t.databaseId, r = e.firestore._databaseId;
			if (!r.isEqual(n)) throw t.createError(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);
			return { referenceValue: pm(e.firestore._databaseId || t.databaseId, e._key.path) };
		}
		if (e instanceof ng) return function(e, t) {
			let n = e instanceof ng ? e.toArray() : e;
			return { mapValue: { fields: {
				[fd]: { stringValue: hd },
				[gd]: { arrayValue: { values: n.map(((e) => {
					if (typeof e != "number") throw t.createError("VectorValues must only contain numeric values.");
					return Ud(t.serializer, e);
				})) } }
			} } };
		}(e, t);
		if (Bm(e)) return e._toProto(t.serializer);
		throw t.createError(`Unsupported field value: ${Ru(e)}`);
	}(e, t);
}
function _g(e, t) {
	let n = {};
	return Mu(e) ? t.path && t.path.length > 0 && t.fieldMask.push(t.path) : Au(e, ((e, r) => {
		let i = gg(r, t.childContextForField(e));
		i != null && (n[e] = i);
	})), { mapValue: { fields: n } };
}
function vg(e) {
	return !(typeof e != "object" || !e || e instanceof Array || e instanceof Date || e instanceof Wu || e instanceof Jm || e instanceof Wm || e instanceof Qh || e instanceof qm || e instanceof ng || Bm(e));
}
function yg(e, t, n) {
	if (!vg(n) || !Lu(n)) {
		let r = Ru(n);
		throw r === "an object" ? t.createError(e + " a custom object") : t.createError(e + " " + r);
	}
}
function bg(e, t, n) {
	if ((t = y(t)) instanceof Gm) return t._internalPath;
	if (typeof t == "string") return Sg(e, t);
	throw Cg("Field path arguments must be of type string or ", e, !1, void 0, n);
}
var xg = /* @__PURE__ */ RegExp("[~\\*/\\[\\]]");
function Sg(e, t, n) {
	if (t.search(xg) >= 0) throw Cg(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`, e, !1, void 0, n);
	try {
		return new Gm(...t.split("."))._internalPath;
	} catch {
		throw Cg(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, e, !1, void 0, n);
	}
}
function Cg(e, t, n, r, i) {
	let a = r && !r.isEmpty(), o = i !== void 0, s = `Function ${t}() called with invalid data`;
	n && (s += " (via `toFirestore()`)"), s += ". ";
	let c = "";
	return (a || o) && (c += " (found", a && (c += ` in field ${r}`), o && (c += ` in document ${i}`), c += ")"), new H(V.INVALID_ARGUMENT, s + e + c);
}
function wg(e, t) {
	return e.some(((e) => e.isEqual(t)));
}
function Tg(e) {
	return typeof e._readUserData == "function";
}
var Eg = class e {
	constructor(e) {
		this.optionDefinitions = e;
	}
	_getKnownOptions(t, n) {
		let r = Vd.empty();
		for (let i in this.optionDefinitions) if (this.optionDefinitions.hasOwnProperty(i)) {
			let a = this.optionDefinitions[i];
			if (i in t) {
				let o = t[i], s;
				a.nestedOptions && Lu(o) ? s = { mapValue: { fields: new e(a.nestedOptions).getOptionsProto(n, o) } } : o && (s = gg(o, n) ?? void 0), s && r.set(Du.fromServerFormat(a.serverName), s);
			}
		}
		return r;
	}
	getOptionsProto(e, t, n) {
		let r = this._getKnownOptions(t, e);
		if (n) {
			let t = new Map(ju(n, ((t, n) => [Du.fromServerFormat(n), t === void 0 ? null : gg(t, e)])));
			r.setAll(t);
		}
		return r.value.mapValue.fields ?? {};
	}
};
function Dg(e) {
	return typeof e == "object" && !!e && !!("nullValue" in e && (e.nullValue === null || e.nullValue === "NULL_VALUE") || "booleanValue" in e && (e.booleanValue === null || typeof e.booleanValue == "boolean") || "integerValue" in e && (e.integerValue === null || typeof e.integerValue == "number" || typeof e.integerValue == "string") || "doubleValue" in e && (e.doubleValue === null || typeof e.doubleValue == "number") || "timestampValue" in e && (e.timestampValue === null || function(e) {
		return typeof e == "object" && !!e && "seconds" in e && (e.seconds === null || typeof e.seconds == "number" || typeof e.seconds == "string") && "nanos" in e && (e.nanos === null || typeof e.nanos == "number");
	}(e.timestampValue)) || "stringValue" in e && (e.stringValue === null || typeof e.stringValue == "string") || "bytesValue" in e && (e.bytesValue === null || e.bytesValue instanceof Uint8Array) || "referenceValue" in e && (e.referenceValue === null || typeof e.referenceValue == "string") || "geoPointValue" in e && (e.geoPointValue === null || function(e) {
		return typeof e == "object" && !!e && "latitude" in e && (e.latitude === null || typeof e.latitude == "number") && "longitude" in e && (e.longitude === null || typeof e.longitude == "number");
	}(e.geoPointValue)) || "arrayValue" in e && (e.arrayValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("values" in e) || e.values !== null && !Array.isArray(e.values));
	}(e.arrayValue)) || "mapValue" in e && (e.mapValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("fields" in e) || e.fields !== null && !Lu(e.fields));
	}(e.mapValue)) || "fieldReferenceValue" in e && (e.fieldReferenceValue === null || typeof e.fieldReferenceValue == "string") || "functionValue" in e && (e.functionValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("name" in e) || e.name !== null && typeof e.name != "string" || !("args" in e) || e.args !== null && !Array.isArray(e.args));
	}(e.functionValue)) || "pipelineValue" in e && (e.pipelineValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("stages" in e) || e.stages !== null && !Array.isArray(e.stages));
	}(e.pipelineValue)));
}
function Og() {
	return new fg("serverTimestamp");
}
function kg(e) {
	return new ng(e);
}
function X(e) {
	let t;
	return e instanceof Mg ? e : (t = Lu(e) ? qg(e) : e instanceof Array ? Jg(e) : Hg(e, void 0), t);
}
function Ag(e) {
	if (e instanceof Mg) return e;
	if (e instanceof ng) return Vg(e);
	if (Array.isArray(e)) return Vg(kg(e));
	throw Error("Unsupported value: " + typeof e);
}
function jg(e) {
	return dd(e) ? Rg(e) : X(e);
}
var Mg = class {
	constructor() {
		this._protoValueType = "ProtoValue";
	}
	add(e) {
		return new Z("add", [this, X(e)], "add");
	}
	asBoolean() {
		if (this instanceof Ug) return this;
		if (this instanceof Bg) return new Gg(this);
		if (this instanceof Lg) return new Kg(this);
		if (this instanceof Z) return new Wg(this);
		throw new H("invalid-argument", `Conversion of type ${typeof this} to BooleanExpression not supported.`);
	}
	subtract(e) {
		return new Z("subtract", [this, X(e)], "subtract");
	}
	multiply(e) {
		return new Z("multiply", [this, X(e)], "multiply");
	}
	divide(e) {
		return new Z("divide", [this, X(e)], "divide");
	}
	mod(e) {
		return new Z("mod", [this, X(e)], "mod");
	}
	equal(e) {
		return new Z("equal", [this, X(e)], "equal").asBoolean();
	}
	notEqual(e) {
		return new Z("not_equal", [this, X(e)], "notEqual").asBoolean();
	}
	lessThan(e) {
		return new Z("less_than", [this, X(e)], "lessThan").asBoolean();
	}
	lessThanOrEqual(e) {
		return new Z("less_than_or_equal", [this, X(e)], "lessThanOrEqual").asBoolean();
	}
	greaterThan(e) {
		return new Z("greater_than", [this, X(e)], "greaterThan").asBoolean();
	}
	greaterThanOrEqual(e) {
		return new Z("greater_than_or_equal", [this, X(e)], "greaterThanOrEqual").asBoolean();
	}
	arrayConcat(e, ...t) {
		let n = [e, ...t].map(((e) => X(e)));
		return new Z("array_concat", [this, ...n], "arrayConcat");
	}
	arrayContains(e) {
		return new Z("array_contains", [this, X(e)], "arrayContains").asBoolean();
	}
	arrayContainsAll(e) {
		let t = Array.isArray(e) ? new Ig(e.map(X), "arrayContainsAll") : e;
		return new Z("array_contains_all", [this, t], "arrayContainsAll").asBoolean();
	}
	arrayContainsAny(e) {
		let t = Array.isArray(e) ? new Ig(e.map(X), "arrayContainsAny") : e;
		return new Z("array_contains_any", [this, t], "arrayContainsAny").asBoolean();
	}
	arrayReverse() {
		return new Z("array_reverse", [this]);
	}
	arrayLength() {
		return new Z("array_length", [this], "arrayLength");
	}
	equalAny(e) {
		let t = Array.isArray(e) ? new Ig(e.map(X), "equalAny") : e;
		return new Z("equal_any", [this, t], "equalAny").asBoolean();
	}
	notEqualAny(e) {
		let t = Array.isArray(e) ? new Ig(e.map(X), "notEqualAny") : e;
		return new Z("not_equal_any", [this, t], "notEqualAny").asBoolean();
	}
	exists() {
		return new Z("exists", [this], "exists").asBoolean();
	}
	charLength() {
		return new Z("char_length", [this], "charLength");
	}
	like(e) {
		return new Z("like", [this, X(e)], "like").asBoolean();
	}
	regexContains(e) {
		return new Z("regex_contains", [this, X(e)], "regexContains").asBoolean();
	}
	regexFind(e) {
		return new Z("regex_find", [this, X(e)], "regexFind");
	}
	regexFindAll(e) {
		return new Z("regex_find_all", [this, X(e)], "regexFindAll");
	}
	regexMatch(e) {
		return new Z("regex_match", [this, X(e)], "regexMatch").asBoolean();
	}
	stringContains(e) {
		return new Z("string_contains", [this, X(e)], "stringContains").asBoolean();
	}
	startsWith(e) {
		return new Z("starts_with", [this, X(e)], "startsWith").asBoolean();
	}
	endsWith(e) {
		return new Z("ends_with", [this, X(e)], "endsWith").asBoolean();
	}
	toLower() {
		return new Z("to_lower", [this], "toLower");
	}
	toUpper() {
		return new Z("to_upper", [this], "toUpper");
	}
	trim(e) {
		let t = [this];
		return e && t.push(X(e)), new Z("trim", t, "trim");
	}
	ltrim(e) {
		let t = [this];
		return e && t.push(X(e)), new Z("ltrim", t, "ltrim");
	}
	rtrim(e) {
		let t = [this];
		return e && t.push(X(e)), new Z("rtrim", t, "rtrim");
	}
	type() {
		return new Z("type", [this]);
	}
	isType(e) {
		return new Z("is_type", [this, Vg(e)], "isType").asBoolean();
	}
	stringConcat(e, ...t) {
		let n = [e, ...t].map(X);
		return new Z("string_concat", [this, ...n], "stringConcat");
	}
	stringIndexOf(e) {
		return new Z("string_index_of", [this, X(e)], "stringIndexOf");
	}
	stringRepeat(e) {
		return new Z("string_repeat", [this, X(e)], "stringRepeat");
	}
	stringReplaceAll(e, t) {
		return new Z("string_replace_all", [
			this,
			X(e),
			X(t)
		], "stringReplaceAll");
	}
	stringReplaceOne(e, t) {
		return new Z("string_replace_one", [
			this,
			X(e),
			X(t)
		], "stringReplaceOne");
	}
	concat(e, ...t) {
		let n = [e, ...t].map(X);
		return new Z("concat", [this, ...n], "concat");
	}
	reverse() {
		return new Z("reverse", [this], "reverse");
	}
	arrayFilter(e, t) {
		return new Z("array_filter", [
			this,
			X(e),
			t
		], "arrayFilter");
	}
	arrayTransform(e, t) {
		return new Z("array_transform", [
			this,
			X(e),
			t
		], "arrayTransform");
	}
	arrayTransformWithIndex(e, t, n) {
		return new Z("array_transform", [
			this,
			X(e),
			X(t),
			n
		], "arrayTransformWithIndex");
	}
	arraySlice(e, t) {
		let n = [this, X(e)];
		return t !== void 0 && n.push(X(t)), new Z("array_slice", n, "arraySlice");
	}
	arrayFirst() {
		return new Z("array_first", [this], "arrayFirst");
	}
	arrayFirstN(e) {
		return new Z("array_first_n", [this, X(e)], "arrayFirstN");
	}
	arrayLast() {
		return new Z("array_last", [this], "arrayLast");
	}
	arrayLastN(e) {
		return new Z("array_last_n", [this, X(e)], "arrayLastN");
	}
	arrayMaximum() {
		return new Z("maximum", [this], "arrayMaximum");
	}
	arrayMaximumN(e) {
		return new Z("maximum_n", [this, X(e)], "arrayMaximumN");
	}
	arrayMinimum() {
		return new Z("minimum", [this], "arrayMinimum");
	}
	arrayMinimumN(e) {
		return new Z("minimum_n", [this, X(e)], "arrayMinimumN");
	}
	arrayIndexOf(e) {
		return new Z("array_index_of", [
			this,
			X(e),
			X("first")
		], "arrayIndexOf");
	}
	arrayLastIndexOf(e) {
		return new Z("array_index_of", [
			this,
			X(e),
			X("last")
		], "arrayLastIndexOf");
	}
	arrayIndexOfAll(e) {
		return new Z("array_index_of_all", [this, X(e)], "arrayIndexOfAll");
	}
	byteLength() {
		return new Z("byte_length", [this], "byteLength");
	}
	ceil() {
		return new Z("ceil", [this]);
	}
	floor() {
		return new Z("floor", [this]);
	}
	abs() {
		return new Z("abs", [this]);
	}
	exp() {
		return new Z("exp", [this]);
	}
	mapGet(e) {
		return new Z("map_get", [this, Vg(e)], "mapGet");
	}
	mapSet(e, t, ...n) {
		return new Z("map_set", [
			this,
			X(e),
			X(t),
			...n.map(X)
		], "mapSet");
	}
	mapKeys() {
		return new Z("map_keys", [this], "mapKeys");
	}
	mapValues() {
		return new Z("map_values", [this], "mapValues");
	}
	mapEntries() {
		return new Z("map_entries", [this], "mapEntries");
	}
	getField(e) {
		return new Z("get_field", [this, X(e)], "get_field");
	}
	count() {
		return Ng._create("count", [this], "count");
	}
	sum() {
		return Ng._create("sum", [this], "sum");
	}
	average() {
		return Ng._create("average", [this], "average");
	}
	minimum() {
		return Ng._create("minimum", [this], "minimum");
	}
	maximum() {
		return Ng._create("maximum", [this], "maximum");
	}
	first() {
		return Ng._create("first", [this], "first");
	}
	last() {
		return Ng._create("last", [this], "last");
	}
	arrayAgg() {
		return Ng._create("array_agg", [this], "arrayAgg");
	}
	arrayAggDistinct() {
		return Ng._create("array_agg_distinct", [this], "arrayAggDistinct");
	}
	countDistinct() {
		return Ng._create("count_distinct", [this], "countDistinct");
	}
	logicalMaximum(e, ...t) {
		let n = [e, ...t];
		return new Z("maximum", [this, ...n.map(X)], "logicalMaximum");
	}
	logicalMinimum(e, ...t) {
		let n = [e, ...t];
		return new Z("minimum", [this, ...n.map(X)], "minimum");
	}
	vectorLength() {
		return new Z("vector_length", [this], "vectorLength");
	}
	cosineDistance(e) {
		return new Z("cosine_distance", [this, Ag(e)], "cosineDistance");
	}
	dotProduct(e) {
		return new Z("dot_product", [this, Ag(e)], "dotProduct");
	}
	euclideanDistance(e) {
		return new Z("euclidean_distance", [this, Ag(e)], "euclideanDistance");
	}
	unixMicrosToTimestamp() {
		return new Z("unix_micros_to_timestamp", [this], "unixMicrosToTimestamp");
	}
	timestampToUnixMicros() {
		return new Z("timestamp_to_unix_micros", [this], "timestampToUnixMicros");
	}
	unixMillisToTimestamp() {
		return new Z("unix_millis_to_timestamp", [this], "unixMillisToTimestamp");
	}
	timestampToUnixMillis() {
		return new Z("timestamp_to_unix_millis", [this], "timestampToUnixMillis");
	}
	unixSecondsToTimestamp() {
		return new Z("unix_seconds_to_timestamp", [this], "unixSecondsToTimestamp");
	}
	timestampToUnixSeconds() {
		return new Z("timestamp_to_unix_seconds", [this], "timestampToUnixSeconds");
	}
	timestampAdd(e, t) {
		return new Z("timestamp_add", [
			this,
			X(e),
			X(t)
		], "timestampAdd");
	}
	timestampSubtract(e, t) {
		return new Z("timestamp_subtract", [
			this,
			X(e),
			X(t)
		], "timestampSubtract");
	}
	timestampDiff(e, t) {
		return new Z("timestamp_diff", [
			this,
			jg(e),
			X(t)
		], "timestampDiff");
	}
	timestampExtract(e, t) {
		let n = [this, X(e)];
		return t && n.push(X(t)), new Z("timestamp_extract", n, "timestampExtract");
	}
	documentId() {
		return new Z("document_id", [this], "documentId");
	}
	parent() {
		return new Z("parent", [this], "parent");
	}
	substring(e, t) {
		let n = X(e);
		return new Z("substring", t === void 0 ? [this, n] : [
			this,
			n,
			X(t)
		], "substring");
	}
	arrayGet(e) {
		return new Z("array_get", [this, X(e)], "arrayGet");
	}
	isError() {
		return new Z("is_error", [this], "isError").asBoolean();
	}
	ifError(e) {
		let t = new Z("if_error", [this, X(e)], "ifError");
		return e instanceof Ug ? t.asBoolean() : t;
	}
	isAbsent() {
		return new Z("is_absent", [this], "isAbsent").asBoolean();
	}
	mapRemove(e) {
		return new Z("map_remove", [this, X(e)], "mapRemove");
	}
	mapMerge(e, ...t) {
		let n = X(e), r = t.map(X);
		return new Z("map_merge", [
			this,
			n,
			...r
		], "mapMerge");
	}
	pow(e) {
		return new Z("pow", [this, X(e)]);
	}
	trunc(e) {
		return e === void 0 ? new Z("trunc", [this]) : new Z("trunc", [this, X(e)], "trunc");
	}
	round(e) {
		return e === void 0 ? new Z("round", [this]) : new Z("round", [this, X(e)], "round");
	}
	collectionId() {
		return new Z("collection_id", [this]);
	}
	length() {
		return new Z("length", [this]);
	}
	ln() {
		return new Z("ln", [this]);
	}
	sqrt() {
		return new Z("sqrt", [this]);
	}
	stringReverse() {
		return new Z("string_reverse", [this]);
	}
	ifAbsent(e) {
		return new Z("if_absent", [this, X(e)], "ifAbsent");
	}
	ifNull(e) {
		return new Z("if_null", [this, X(e)], "ifNull");
	}
	coalesce(e, ...t) {
		return new Z("coalesce", [
			this,
			X(e),
			...t.map(X)
		], "coalesce");
	}
	join(e) {
		return new Z("join", [this, X(e)], "join");
	}
	log10() {
		return new Z("log10", [this]);
	}
	arraySum() {
		return new Z("sum", [this]);
	}
	split(e) {
		return new Z("split", [this, X(e)]);
	}
	timestampTruncate(e, t) {
		let n = [this, X(e)];
		return t && n.push(X(t)), new Z("timestamp_trunc", n);
	}
	ascending() {
		return Yg(this);
	}
	descending() {
		return Xg(this);
	}
	as(e) {
		return new Fg(this, e, "as");
	}
}, Ng = class e {
	constructor(e, t) {
		this.name = e, this.params = t, this.exprType = "AggregateFunction", this._protoValueType = "ProtoValue";
	}
	static _create(t, n, r) {
		let i = new e(t, n);
		return i._methodName = r, i;
	}
	as(e) {
		return new Pg(this, e, "as");
	}
	_toProto(e) {
		return { functionValue: {
			name: this.name,
			args: this.params.map(((t) => t._toProto(e)))
		} };
	}
	_readUserData(e) {
		e = this._methodName ? e.contextWith({ methodName: this._methodName }) : e, this.params.forEach(((t) => t._readUserData(e)));
	}
}, Pg = class {
	constructor(e, t, n) {
		this.aggregate = e, this.alias = t, this._methodName = n;
	}
	_readUserData(e) {
		this.aggregate._readUserData(e);
	}
}, Fg = class {
	constructor(e, t, n) {
		this.expr = e, this.alias = t, this._methodName = n, this.exprType = "AliasedExpression", this.selectable = !0;
	}
	_readUserData(e) {
		this.expr._readUserData(e);
	}
}, Ig = class extends Mg {
	constructor(e, t) {
		super(), this.ur = e, this._methodName = t, this.expressionType = "ListOfExpressions";
	}
	_toProto(e) {
		return { arrayValue: { values: this.ur.map(((t) => t._toProto(e))) } };
	}
	_readUserData(e) {
		this.ur.forEach(((t) => t._readUserData(e)));
	}
}, Lg = class extends Mg {
	constructor(e, t) {
		super(), this.fieldPath = e, this._methodName = t, this.expressionType = "Field", this.selectable = !0;
	}
	get _fieldPath() {
		return this.fieldPath;
	}
	get fieldName() {
		return this.fieldPath.canonicalString();
	}
	get alias() {
		return this.fieldName;
	}
	get expr() {
		return this;
	}
	geoDistance(e) {
		return new Z("geo_distance", [this, X(e)], "geoDistance");
	}
	_toProto(e) {
		return { fieldReferenceValue: this.fieldPath.canonicalString() };
	}
	_readUserData(e) {}
};
function Rg(e) {
	return zg(e, "field");
}
function zg(e, t) {
	return new Lg(typeof e == "string" ? wu === e ? Km()._internalPath : bg("field", e) : e._internalPath, t);
}
var Bg = class e extends Mg {
	constructor(e, t) {
		super(), this.value = e, this._methodName = t, this.expressionType = "Constant";
	}
	static _fromProto(t) {
		let n = new e(t, void 0);
		return n._protoValue = t, n;
	}
	_toProto(e) {
		return R(this._protoValue !== void 0, 237), this._protoValue;
	}
	_getValue() {
		return this._protoValue;
	}
	_readUserData(e) {
		e = this._methodName ? e.contextWith({ methodName: this._methodName }) : e, Dg(this._protoValue) || (this._protoValue = gg(this.value, e));
	}
};
function Vg(e, t) {
	return Hg(e, "constant");
}
function Hg(e, t) {
	let n = new Bg(e, t);
	return typeof e == "boolean" ? new Gg(n) : n;
}
var Z = class extends Mg {
	constructor(e, t, n, r) {
		super(), this.name = e, this.params = t, this.expressionType = "Function", this._optionsProto = void 0, n !== void 0 && (this._methodName = n), r !== void 0 && (this._options = r);
	}
	get _optionsUtil() {
		return new Eg({});
	}
	_toProto(e) {
		let t = { functionValue: {
			name: this.name,
			args: this.params.map(((t) => t._toProto(e)))
		} };
		return this._optionsProto && (t.functionValue.options = this._optionsProto), t;
	}
	_readUserData(e) {
		e = this._methodName ? e.contextWith({ methodName: this._methodName }) : e, this.params.forEach(((t) => t._readUserData(e))), this._options && (this._optionsProto = this._optionsUtil.getOptionsProto(e, this._options));
	}
}, Ug = class e extends Mg {
	get _methodName() {
		return this._expr._methodName;
	}
	countIf() {
		return Ng._create("count_if", [this], "countIf");
	}
	not() {
		return new Z("not", [this], "not").asBoolean();
	}
	conditional(e, t) {
		return new Z("conditional", [
			this,
			e,
			t
		], "conditional");
	}
	ifError(t) {
		let n = X(t), r = new Z("if_error", [this, n], "ifError");
		return n instanceof e ? r.asBoolean() : r;
	}
	_toProto(e) {
		return this._expr._toProto(e);
	}
	_readUserData(e) {
		this._expr._readUserData(e);
	}
}, Wg = class extends Ug {
	constructor(e) {
		super(), this._expr = e, this.expressionType = "Function";
	}
}, Gg = class extends Ug {
	constructor(e) {
		super(), this._expr = e, this.expressionType = "Constant";
	}
	_getValue() {
		return this._expr._getValue();
	}
}, Kg = class extends Ug {
	constructor(e) {
		super(), this._expr = e, this.expressionType = "Field";
	}
};
function qg(e, t) {
	let n = [];
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) {
		let r = e[t];
		n.push(Vg(t)), n.push(X(r));
	}
	return new Z("map", n, "map");
}
function Jg(e) {
	return function(e, t) {
		return new Z("array", e.map(((e) => X(e))), t);
	}(e, "array");
}
function Yg(e) {
	return new Zg(jg(e), "ascending", "ascending");
}
function Xg(e) {
	return new Zg(jg(e), "descending", "descending");
}
var Zg = class {
	constructor(e, t, n) {
		this.expr = e, this.direction = t, this._methodName = n, this._protoValueType = "ProtoValue";
	}
	_toProto(e) {
		return { mapValue: { fields: {
			direction: Hm(this.direction),
			expression: this.expr._toProto(e)
		} } };
	}
	_readUserData(e) {
		this.expr._readUserData(e);
	}
}, Qg = class {
	constructor(e) {
		this.optionsProto = void 0, {rawOptions: this.rawOptions, ...this.knownOptions} = e;
	}
	_readUserData(e) {
		this.optionsProto = this._optionsUtil.getOptionsProto(e, this.knownOptions, this.rawOptions);
	}
	_toProto(e) {
		return {
			name: this._name,
			options: this.optionsProto
		};
	}
}, $g = class extends Qg {
	get _name() {
		return "add_fields";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		super(t), this.fields = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [Vm(e, this.fields)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), f_(this.fields, e);
	}
}, e_ = class extends Qg {
	get _name() {
		return "aggregate";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t, n) {
		super(n), this.groups = e, this.accumulators = t;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [Vm(e, this.accumulators), Vm(e, this.groups)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), f_(this.groups, e), f_(this.accumulators, e);
	}
}, t_ = class extends Qg {
	get _name() {
		return "distinct";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		super(t), this.groups = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [Vm(e, this.groups)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), f_(this.groups, e);
	}
}, n_ = class extends Qg {
	get _name() {
		return "collection";
	}
	get _optionsUtil() {
		return new Eg({ forceIndex: { serverName: "force_index" } });
	}
	constructor(e, t) {
		super(t), this.Er = e.startsWith("/") ? e : "/" + e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [{ referenceValue: this.Er }]
		};
	}
	_readUserData(e) {
		super._readUserData(e);
	}
}, r_ = class extends Qg {
	get _name() {
		return "collection_group";
	}
	get _optionsUtil() {
		return new Eg({ forceIndex: { serverName: "force_index" } });
	}
	constructor(e, t) {
		super(t), this.collectionId = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [{ referenceValue: "" }, { stringValue: this.collectionId }]
		};
	}
	_readUserData(e) {
		super._readUserData(e);
	}
}, i_ = class extends Qg {
	get _name() {
		return "database";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	_toProto(e) {
		return { ...super._toProto(e) };
	}
	_readUserData(e) {
		super._readUserData(e);
	}
}, a_ = class extends Qg {
	get _name() {
		return "documents";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		if (super(t), !e || e.length === 0) throw new H(V.INVALID_ARGUMENT, "Empty document paths are not allowed in DocumentsSource");
		let n = e.map(((e) => e.startsWith("/") ? e : "/" + e)), r = new Set(n);
		if (r.size !== n.length) throw new H(V.INVALID_ARGUMENT, "Duplicate document paths are not allowed in DocumentsSource");
		this.hr = n, this.Tr = r;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: this.hr.map(((e) => ({ referenceValue: e })))
		};
	}
	_readUserData(e) {
		super._readUserData(e);
	}
}, o_ = class extends Qg {
	get _name() {
		return "where";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		super(t), this.condition = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [this.condition._toProto(e)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), f_(this.condition, e);
	}
}, s_ = class extends Qg {
	get _name() {
		return "limit";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		R(!isNaN(e) && e !== 1 / 0 && e !== -1 / 0, 34860), super(t), this.limit = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [Gd(e, this.limit)]
		};
	}
}, c_ = class extends Qg {
	get _name() {
		return "offset";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		super(t), this.offset = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [Gd(e, this.offset)]
		};
	}
}, l_ = class extends Qg {
	get _name() {
		return "select";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		super(t), this.selections = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [Vm(e, this.selections)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), f_(this.selections, e);
	}
}, u_ = class extends Qg {
	get _name() {
		return "sort";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		super(t), this.orderings = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: this.orderings.map(((t) => t._toProto(e)))
		};
	}
	_readUserData(e) {
		super._readUserData(e), f_(this.orderings, e);
	}
}, d_ = class e extends Qg {
	get _name() {
		return "replace_with";
	}
	get _optionsUtil() {
		return new Eg({});
	}
	constructor(e, t) {
		super(t), this.map = e;
	}
	_toProto(t) {
		return {
			...super._toProto(t),
			args: [this.map._toProto(t), Hm(e.Pr)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), f_(this.map, e);
	}
};
d_.Pr = "full_replace";
function f_(e, t) {
	return Tg(e) ? e._readUserData(t) : Array.isArray(e) || e instanceof Map ? e.forEach(((e) => e._readUserData(t))) : Object.values(e).forEach(((e) => e._readUserData(t))), e;
}
var p_ = class e {
	constructor(e, t, n, r) {
		this._db = e, this.userDataReader = t, this._userDataWriter = n, this.stages = r;
	}
	Ar(e, t) {
		let n = this.userDataReader.createContext(3, e);
		return Tg(t) ? t._readUserData(n) : t.forEach(((e) => e._readUserData(n))), t;
	}
	where(t) {
		let n = this.stages.map(((e) => e));
		return this.Ar("where", t), n.push(new o_(t, {})), new e(this._db, this.userDataReader, this._userDataWriter, n);
	}
	limit(t) {
		let n = this.stages.map(((e) => e));
		return n.push(new s_(t, {})), new e(this._db, this.userDataReader, this._userDataWriter, n);
	}
	sort(t, ...n) {
		let r = this.stages.map(((e) => e));
		return "orderings" in t ? r.push(new u_(this.Ar("sort", t.orderings), {})) : r.push(new u_(this.Ar("sort", [t, ...n]), {})), new e(this._db, this.userDataReader, this._userDataWriter, r);
	}
	Vr(e) {
		return { pipeline: { stages: this.stages.map(((t) => t._toProto(e))) } };
	}
}, m_ = class {
	constructor(e, t, n) {
		this.serializer = e, this.stages = t, this.listenOptions = n, this.isCorePipeline = !0;
	}
	getPipelineCollection() {
		return g_(this);
	}
	getPipelineCollectionGroup() {
		return __(this);
	}
	getPipelineCollectionId() {
		return v_(this);
	}
	getPipelineDocuments() {
		return y_(this);
	}
	getPipelineFlavor() {
		return function(e) {
			let t = "exact";
			return e.stages.forEach(((n, r) => {
				n._name !== t_.name && n._name !== e_.name || (t = "keyless"), n._name === l_.name && t === "exact" && (t = "augmented"), n._name === $g.name && r < e.stages.length - 1 && t === "exact" && (t = "augmented");
			})), t;
		}(this);
	}
	getPipelineSourceType() {
		return h_(this);
	}
};
function h_(e) {
	let t = e.stages[0];
	return t instanceof n_ || t instanceof r_ || t instanceof i_ || t instanceof a_ ? t._name : "unknown";
}
function g_(e) {
	if (h_(e) === "collection") return e.stages[0].Er;
}
function __(e) {
	if (h_(e) === "collection_group") return e.stages[0].collectionId;
}
function v_(e) {
	switch (h_(e)) {
		case "collection": return U.fromString(g_(e)).lastSegment();
		case "collection_group": return __(e);
		default: return;
	}
}
function y_(e) {
	if (h_(e) === "documents") return e.stages[0].hr;
}
var Q = class e {
	constructor(e, t) {
		this.type = e, this.value = t;
	}
	static dr() {
		return new e("ERROR", void 0);
	}
	static mr() {
		return new e("UNSET", void 0);
	}
	static pr() {
		return new e("NULL", _d);
	}
	static newValue(t) {
		return Pd(t) ? new e("NULL", _d) : function(e) {
			return !!e && "booleanValue" in e;
		}(t) ? new e("BOOLEAN", t) : Ad(t) ? new e("INT", t) : jd(t) ? new e("DOUBLE", t) : function(e) {
			return !!e && "timestampValue" in e && !!e.timestampValue;
		}(t) ? new e("TIMESTAMP", t) : function(e) {
			return !!e && "stringValue" in e;
		}(t) ? new e("STRING", t) : function(e) {
			return !!e && "bytesValue" in e;
		}(t) ? new e("BYTES", t) : t.referenceValue ? new e("REFERENCE", t) : t.geoPointValue ? new e("GEO_POINT", t) : Nd(t) ? new e("ARRAY", t) : Ld(t) ? new e("VECTOR", t) : Id(t) ? new e("MAP", t) : new e("ERROR", void 0);
	}
	gr() {
		return this.type === "ERROR" || this.type === "UNSET";
	}
	yr() {
		return this.type === "NULL";
	}
};
function b_(e) {
	if (!e.gr()) return e.value;
}
function x_(e) {
	return e instanceof Ug ? e._expr : e;
}
function $(e) {
	if ((e = x_(e)) instanceof Lg) return new S_(e);
	if (e instanceof Bg) return new C_(e);
	if (e instanceof Ig) return new w_(e);
	if (e instanceof Z) {
		if (e.name === "add") return new j_(e);
		if (e.name === "subtract") return new M_(e);
		if (e.name === "multiply") return new N_(e);
		if (e.name === "divide") return new P_(e);
		if (e.name === "mod") return new F_(e);
		if (e.name === "and") return new I_(e);
		if (e.name === "equal") return new Q_(e);
		if (e.name === "not_equal") return new $_(e);
		if (e.name === "less_than") return new ev(e);
		if (e.name === "less_than_or_equal") return new tv(e);
		if (e.name === "greater_than") return new nv(e);
		if (e.name === "greater_than_or_equal") return new rv(e);
		if (e.name === "array_concat") return new iv(e);
		if (e.name === "array_reverse") return new av(e);
		if (e.name === "array_contains") return new ov(e);
		if (e.name === "array_contains_all") return new sv(e);
		if (e.name === "array_contains_any") return new cv(e);
		if (e.name === "array_length") return new lv(e);
		if (e.name === "array_element") return new uv(e);
		if (e.name === "equal_any") return new B_(e);
		if (e.name === "not_equal_any") return new V_(e);
		if (e.name === "is_nan") return new H_(e);
		if (e.name === "is_not_nan") return new U_(e);
		if (e.name === "is_null") return new W_(e);
		if (e.name === "is_not_null") return new G_(e);
		if (e.name === "is_error") return new K_(e);
		if (e.name === "exists") return new q_(e);
		if (e.name === "not") return new L_(e);
		if (e.name === "or") return new R_(e);
		if (e.name === "xor") return new z_(e);
		if (e.name === "conditional") return new J_(e);
		if (e.name === "maximum") return new Y_(e);
		if (e.name === "minimum") return new X_(e);
		if (e.name === "reverse") return new dv(e);
		if (e.name === "replace_first") return new fv(e);
		if (e.name === "replace_all") return new pv(e);
		if (e.name === "char_length") return new mv(e);
		if (e.name === "byte_length") return new hv(e);
		if (e.name === "like") return new _v(e);
		if (e.name === "regex_contains") return new vv(e);
		if (e.name === "regex_match") return new yv(e);
		if (e.name === "string_contains") return new bv(e);
		if (e.name === "starts_with") return new xv(e);
		if (e.name === "ends_with") return new Sv(e);
		if (e.name === "to_lower") return new Cv(e);
		if (e.name === "to_upper") return new wv(e);
		if (e.name === "trim") return new Tv(e);
		if (e.name === "string_concat") return new Ev(e);
		if (e.name === "map_get") return new Dv(e);
		if (e.name === "cosine_distance") return new kv(e);
		if (e.name === "dot_product") return new Av(e);
		if (e.name === "euclidean_distance") return new jv(e);
		if (e.name === "vector_length") return new Mv(e);
		if (e.name === "unix_micros_to_timestamp") return new qv(e);
		if (e.name === "timestamp_to_unix_micros") return new Zv(e);
		if (e.name === "unix_millis_to_timestamp") return new Jv(e);
		if (e.name === "timestamp_to_unix_millis") return new Qv(e);
		if (e.name === "unix_seconds_to_timestamp") return new Yv(e);
		if (e.name === "timestamp_to_unix_seconds") return new $v(e);
		if (e.name === "timestamp_add") return new ty(e);
		if (e.name === "timestamp_subtract") return new ny(e);
	}
	throw Error(`Unknown Expr : ${e}`);
}
var S_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		if (this.expr.fieldName === wu) return Q.newValue({ referenceValue: gm(e.serializer, t.key) });
		if (this.expr.fieldName === "__update_time__") return Q.newValue({ timestampValue: dm(e.serializer, t.version) });
		if (this.expr.fieldName === "__create_time__") return Q.newValue({ timestampValue: dm(e.serializer, t.createTime) });
		let n = t.data.field(this.expr._fieldPath);
		return n ? ed(n) ? Q.newValue(function(e, t) {
			if (e.serverTimestampBehavior === "estimate") return { timestampValue: dm(e.serializer, K.fromTimestamp(nd(t))) };
			if (e.serverTimestampBehavior === "previous") {
				let e = td(t);
				if (e) return e;
			}
			return { nullValue: "NULL_VALUE" };
		}(e, n)) : Q.newValue(n) : Q.mr();
	}
}, C_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return Q.newValue(this.expr._getValue());
	}
}, w_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = this.expr.ur.map(((n) => $(n).evaluate(e, t)));
		return n.some(((e) => e.gr())) ? Q.dr() : Q.newValue({ arrayValue: { values: n.map(((e) => e.value)) } });
	}
};
function T_(e) {
	return jd(e) ? Number(e.doubleValue) : Number(e.integerValue);
}
function E_(e) {
	return BigInt(e.integerValue);
}
var D_ = BigInt("0x7fffffffffffffff"), O_ = -BigInt("0x8000000000000000"), k_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length >= 2, 24778);
		let n = $(this.expr.params[0]).evaluate(e, t), r = $(this.expr.params[1]).evaluate(e, t), i = this.wr(n, r);
		for (let n of this.expr.params.slice(2)) {
			let r = $(n).evaluate(e, t);
			i = this.wr(i, r);
		}
		return i;
	}
	wr(e, t) {
		if (e.gr() || t.gr()) return Q.dr();
		if (e.yr() || t.yr()) return Q.pr();
		let n = e.value, r = t.value;
		if (!jd(n) && !Ad(n) || !jd(r) && !Ad(r)) return Q.dr();
		if (jd(n) || jd(r)) {
			let e = this.br(n, r);
			return e ? Q.newValue(e) : Q.dr();
		}
		if (Ad(n) && Ad(r)) {
			let e = this.Sr(n, r);
			return e === void 0 ? Q.dr() : typeof e == "number" ? Q.newValue({ doubleValue: e }) : e < O_ || e > D_ ? Q.dr() : Q.newValue({ integerValue: `${e}` });
		}
		return Q.dr();
	}
};
function A_(e, t) {
	return bd(e) === bd(t) ? Fd(e) || Fd(t) ? "NOT_EQ" : Pd(e) && Pd(t) ? "EQ" : Pd(e) || Pd(t) ? "NULL" : Nd(e) && Nd(t) ? function(e, t) {
		if (e.values?.length !== t.values?.length) return "NOT_EQ";
		let n = !1;
		for (let r = 0; r < (e.values?.length ?? 0); r++) {
			let i = e.values[r], a = t.values[r];
			switch (A_(i, a)) {
				case "EQ": break;
				case "NOT_EQ":
				case "TYPE_MISMATCH": return "NOT_EQ";
				case "NULL":
					n = !0;
					break;
				default: L(44609, {
					vr: i,
					Dr: a
				});
			}
		}
		return n ? "NULL" : "EQ";
	}(e.arrayValue, t.arrayValue) : Ld(e) && Ld(t) || Id(e) && Id(t) ? function(e, t) {
		let n = e.fields || {}, r = t.fields || {};
		if (ku(n) !== ku(r)) return "NOT_EQ";
		let i = !1;
		for (let e in n) if (n.hasOwnProperty(e)) {
			if (r[e] === void 0) return "NOT_EQ";
			switch (A_(n[e], r[e])) {
				case "NOT_EQ":
				case "TYPE_MISMATCH": return "NOT_EQ";
				case "NULL": i = !0;
			}
		}
		return i ? "NULL" : "EQ";
	}(e.mapValue, t.mapValue) : function(e, t) {
		return xd(e, t, {
			o: !1,
			t: !0,
			i: !0
		});
	}(e, t) ? "EQ" : "NOT_EQ" : "TYPE_MISMATCH";
}
var j_ = class extends k_ {
	Sr(e, t) {
		return E_(e) + E_(t);
	}
	br(e, t) {
		return { doubleValue: T_(e) + T_(t) };
	}
}, M_ = class extends k_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		return E_(e) - E_(t);
	}
	br(e, t) {
		return { doubleValue: T_(e) - T_(t) };
	}
}, N_ = class extends k_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		return E_(e) * E_(t);
	}
	br(e, t) {
		return { doubleValue: T_(e) * T_(t) };
	}
}, P_ = class extends k_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		let n = E_(t);
		if (n !== BigInt(0)) return E_(e) / n;
	}
	br(e, t) {
		let n = T_(t);
		return n === 0 ? { doubleValue: ld(n) ? -Infinity : Infinity } : { doubleValue: T_(e) / n };
	}
}, F_ = class extends k_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		let n = E_(t);
		if (n !== BigInt(0)) return E_(e) % n;
	}
	br(e, t) {
		let n = T_(t);
		if (n !== 0) return { doubleValue: T_(e) % n };
	}
}, I_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = !1, r = !1;
		for (let i of this.expr.params) {
			let a = $(i).evaluate(e, t);
			switch (a.type) {
				case "BOOLEAN":
					if (!a.value?.booleanValue) return Q.newValue(yd);
					break;
				case "NULL":
					r = !0;
					break;
				default: n = !0;
			}
		}
		return n ? Q.dr() : r ? Q.pr() : Q.newValue(vd);
	}
}, L_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 9634);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "BOOLEAN": return Q.newValue({ booleanValue: !n.value?.booleanValue });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, R_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = !1, r = !1;
		for (let i of this.expr.params) {
			let a = $(i).evaluate(e, t);
			switch (a.type) {
				case "BOOLEAN":
					if (a.value?.booleanValue) return Q.newValue(vd);
					break;
				case "NULL":
					r = !0;
					break;
				default: n = !0;
			}
		}
		return n ? Q.dr() : r ? Q.pr() : Q.newValue(yd);
	}
}, z_ = class e {
	constructor(e) {
		this.expr = e;
	}
	evaluate(t, n) {
		let r = !1, i = !1;
		for (let a of this.expr.params) {
			let o = $(a).evaluate(t, n);
			switch (o.type) {
				case "BOOLEAN":
					r = e.xor(r, !!o.value?.booleanValue);
					break;
				case "NULL":
					i = !0;
					break;
				default: return Q.dr();
			}
		}
		return i ? Q.pr() : Q.newValue({ booleanValue: r });
	}
	static xor(e, t) {
		return (e || t) && !(e && t);
	}
}, B_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 2, 55094);
		let n = !1, r = $(this.expr.params[0]).evaluate(e, t);
		switch (r.type) {
			case "NULL":
				n = !0;
				break;
			case "ERROR":
			case "UNSET": return Q.dr();
		}
		let i = $(this.expr.params[1]).evaluate(e, t);
		switch (i.type) {
			case "ARRAY": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		if (n) return Q.pr();
		for (let e of i.value?.arrayValue?.values ?? []) switch (Pd(r.value) && Pd(e) ? "EQ" : A_(r.value, e)) {
			case "EQ": return Q.newValue(vd);
			case "NOT_EQ":
			case "TYPE_MISMATCH": break;
			case "NULL":
				n = !0;
				break;
			default: L(44608, {
				value: r.value,
				candidate: e
			});
		}
		return n ? Q.pr() : Q.newValue(yd);
	}
}, V_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return new L_(new Z("not", [new Z("equal_any", this.expr.params)])).evaluate(e, t);
	}
}, H_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 23322);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "INT": return Q.newValue(yd);
			case "DOUBLE": return Q.newValue({ booleanValue: isNaN(T_(n.value)) });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, U_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return R(this.expr.params.length === 1, 50406), new L_(new Z("not", [new Z("is_nan", this.expr.params)])).evaluate(e, t);
	}
}, W_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		switch (R(this.expr.params.length === 1, 23123), $(this.expr.params[0]).evaluate(e, t).type) {
			case "NULL": return Q.newValue(vd);
			case "UNSET":
			case "ERROR": return Q.dr();
			default: return Q.newValue(yd);
		}
	}
}, G_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return R(this.expr.params.length === 1, 23167), new L_(new Z("not", [new Z("is_null", this.expr.params)])).evaluate(e, t);
	}
}, K_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return R(this.expr.params.length === 1, 5228), $(this.expr.params[0]).evaluate(e, t).type === "ERROR" ? Q.newValue(vd) : Q.newValue(yd);
	}
}, q_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		switch (R(this.expr.params.length === 1, 6877), $(this.expr.params[0]).evaluate(e, t).type) {
			case "ERROR": return Q.dr();
			case "UNSET": return Q.newValue(yd);
			default: return Q.newValue(vd);
		}
	}
}, J_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 3, 11706);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "BOOLEAN": return n.value?.booleanValue ? $(this.expr.params[1]).evaluate(e, t) : $(this.expr.params[2]).evaluate(e, t);
			case "NULL": return $(this.expr.params[2]).evaluate(e, t);
			default: return Q.dr();
		}
	}
}, Y_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = this.expr.params.map(((n) => $(n).evaluate(e, t))), r;
		for (let e of n) switch (e.type) {
			case "ERROR":
			case "UNSET":
			case "NULL": continue;
			default: r = r === void 0 || Cd(e.value, r.value) > 0 ? e : r;
		}
		return r === void 0 ? Q.pr() : r;
	}
}, X_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = this.expr.params.map(((n) => $(n).evaluate(e, t))), r;
		for (let e of n) switch (e.type) {
			case "ERROR":
			case "UNSET":
			case "NULL": continue;
			default: r = r === void 0 || Cd(e.value, r.value) < 0 ? e : r;
		}
		return r === void 0 ? Q.pr() : r;
	}
}, Z_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 2, 31033, `${this.expr.name}() function should have exactly 2 params`);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "ERROR":
			case "UNSET": return Q.dr();
		}
		let r = $(this.expr.params[1]).evaluate(e, t);
		switch (r.type) {
			case "ERROR":
			case "UNSET": return Q.dr();
		}
		return this.Cr(n, r);
	}
}, Q_ = class extends Z_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		if (e.yr() && t.yr()) return Q.newValue(vd);
		if (e.yr() || t.yr() || Fd(e.value) || Fd(t.value) || bd(e.value) !== bd(t.value)) return Q.newValue(yd);
		switch (A_(e.value, t.value)) {
			case "EQ": return Q.newValue(vd);
			case "NOT_EQ": return Q.newValue(yd);
			case "NULL": return Q.pr();
			default: L(44615, {
				left: e,
				right: t
			});
		}
	}
}, $_ = class extends Z_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		switch (A_(e.value, t.value)) {
			case "EQ": return Q.newValue(yd);
			case "NOT_EQ":
			case "TYPE_MISMATCH": return Q.newValue(vd);
			case "NULL": return Q.pr();
			default: L(44614, {
				left: e,
				right: t
			});
		}
	}
}, ev = class extends Z_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return bd(e.value) !== bd(t.value) || Fd(e.value) || Fd(t.value) ? Q.newValue(yd) : Q.newValue({ booleanValue: Cd(e.value, t.value) < 0 });
	}
}, tv = class extends Z_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return bd(e.value) !== bd(t.value) || Fd(e.value) || Fd(t.value) ? Q.newValue(yd) : A_(e.value, t.value) === "EQ" ? Q.newValue(vd) : Q.newValue({ booleanValue: Cd(e.value, t.value) < 0 });
	}
}, nv = class extends Z_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return bd(e.value) !== bd(t.value) || Fd(e.value) || Fd(t.value) ? Q.newValue(yd) : Q.newValue({ booleanValue: Cd(e.value, t.value) > 0 });
	}
}, rv = class extends Z_ {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return bd(e.value) !== bd(t.value) || Fd(e.value) || Fd(t.value) ? Q.newValue(yd) : A_(e.value, t.value) === "EQ" ? Q.newValue(vd) : Q.newValue({ booleanValue: Cd(e.value, t.value) > 0 });
	}
}, iv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, av = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 216);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "NULL": return Q.pr();
			case "ARRAY": {
				let e = n.value.arrayValue?.values ?? [];
				return Q.newValue({ arrayValue: { values: [...e].reverse() } });
			}
			default: return Q.dr();
		}
	}
}, ov = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return R(this.expr.params.length === 2, 52884), new B_(new Z("eq_any", [this.expr.params[1], this.expr.params[0]])).evaluate(e, t);
	}
}, sv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 2, 1392);
		let n = !1, r = $(this.expr.params[0]).evaluate(e, t);
		switch (r.type) {
			case "ARRAY": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		let i = $(this.expr.params[1]).evaluate(e, t);
		switch (i.type) {
			case "ARRAY": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		if (n) return Q.pr();
		let a = i.value?.arrayValue?.values ?? [], o = r.value?.arrayValue?.values ?? [];
		for (let e of a) {
			let t = !1;
			n = !1;
			for (let r of o) {
				switch (Pd(e) && Pd(r) ? "EQ" : A_(e, r)) {
					case "EQ":
						t = !0;
						break;
					case "NOT_EQ":
					case "TYPE_MISMATCH": break;
					case "NULL":
						n = !0;
						break;
					default: L(44613, {
						value: r,
						search: e
					});
				}
				if (t) break;
			}
			if (!t) return Q.newValue(yd);
		}
		return Q.newValue(vd);
	}
}, cv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 2, 2680);
		let n = !1, r = $(this.expr.params[0]).evaluate(e, t);
		switch (r.type) {
			case "ARRAY": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		let i = $(this.expr.params[1]).evaluate(e, t);
		switch (i.type) {
			case "ARRAY": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		if (n) return Q.pr();
		let a = i.value?.arrayValue?.values ?? [], o = r.value?.arrayValue?.values ?? [];
		for (let e of o) for (let t of a) switch (Pd(e) && Pd(t) ? "EQ" : A_(e, t)) {
			case "EQ": return Q.newValue(vd);
			case "NOT_EQ":
			case "TYPE_MISMATCH": break;
			case "NULL":
				n = !0;
				break;
			default: L(60403, {
				value: e,
				search: t
			});
		}
		return n ? Q.pr() : Q.newValue(yd);
	}
}, lv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 38605);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "NULL": return Q.pr();
			case "ARRAY": return Q.newValue({ integerValue: `${n.value?.arrayValue?.values?.length ?? 0}` });
			default: return Q.dr();
		}
	}
}, uv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, dv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 1508);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "NULL": return Q.pr();
			case "BYTES": {
				let e = n.value?.bytesValue;
				if (typeof e == "string") {
					let t = Ku.fromBase64String(e).toUint8Array();
					return t.reverse(), Q.newValue({ bytesValue: Ku.fromUint8Array(t).toBase64() });
				}
				return Q.newValue({ bytesValue: new Uint8Array(e).reverse() });
			}
			case "STRING": {
				let e = n.value?.stringValue, t = new Intl.__PRIVATE_Segmenter(void 0, { granularity: "grapheme" }).segment(e), r = Array.from(t, ((e) => e.segment)).reverse();
				return Q.newValue({ stringValue: r.join("") });
			}
			default: return Q.dr();
		}
	}
}, fv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, pv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, mv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 19400);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "NULL": return Q.pr();
			case "STRING": {
				let e = function(e) {
					let t = 0;
					for (let n = 0; n < e.length; n++) {
						let r = e.codePointAt(n);
						if (r === void 0) return;
						if (r <= 65535) {
							if (r >= 55296 && r <= 57343) {
								if (r <= 56319) {
									let r = e.codePointAt(n + 1);
									r !== void 0 && r >= 56320 && r <= 57343 ? (t += 1, n++) : t += 1;
								} else t += 1;
							} else t += 1;
						} else {
							if (!(r <= 1114111)) return;
							t += 1, n++;
						}
					}
					return t;
				}(n.value.stringValue);
				return e === void 0 ? Q.dr() : Q.newValue({ integerValue: e });
			}
			default: return Q.dr();
		}
	}
}, hv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 8486);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "BYTES": {
				let e = n.value?.bytesValue;
				return typeof e == "string" ? Q.newValue({ integerValue: Ku.fromBase64String(e).toUint8Array().length }) : Q.newValue({ integerValue: new Uint8Array(e).length });
			}
			case "STRING": {
				let e = function(e) {
					let t = 0;
					for (let n = 0; n < e.length; n++) {
						let r = e.codePointAt(n);
						if (r === void 0) return;
						if (r >= 55296 && r <= 57343) {
							if (!(r <= 56319)) return;
							{
								let r = e.codePointAt(n + 1);
								if (r === void 0 || !(r >= 56320 && r <= 57343)) return;
								t += 4, n++;
							}
						} else if (r <= 127) t += 1;
						else if (r <= 2047) t += 2;
						else if (r <= 65535) t += 3;
						else {
							if (!(r <= 1114111)) return;
							t += 4, n++;
						}
					}
					return t;
				}(n.value?.stringValue);
				return e === void 0 ? Q.dr() : Q.newValue({ integerValue: e });
			}
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, gv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 2, 39773, `${this.expr.name}() function should have exactly two parameters`);
		let n = !1, r = $(this.expr.params[0]).evaluate(e, t);
		switch (r.type) {
			case "STRING": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		let i = $(this.expr.params[1]).evaluate(e, t);
		switch (i.type) {
			case "STRING": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		return n ? Q.pr() : this.Fr(r.value?.stringValue, i.value?.stringValue);
	}
}, _v = class extends gv {
	Fr(e, t) {
		try {
			let n = function(e) {
				let t = "";
				for (let n = 0; n < e.length; n++) {
					let r = e.charAt(n);
					switch (r) {
						case "_":
							t += ".";
							break;
						case "%":
							t += ".*";
							break;
						case "\\":
						case ".":
						case "*":
						case "?":
						case "+":
						case "^":
						case "$":
						case "|":
						case "(":
						case ")":
						case "[":
						case "]":
						case "{":
						case "}":
							t += "\\" + r;
							break;
						default: t += r;
					}
				}
				return "^" + t + "$";
			}(t), r = ru.compile(n);
			return Q.newValue({ booleanValue: r.matches(e) });
		} catch (e) {
			return lu(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${e}`), Q.dr();
		}
	}
}, vv = class extends gv {
	Fr(e, t) {
		try {
			let n = ru.compile(t);
			return Q.newValue({ booleanValue: n.test(e) });
		} catch {
			return lu(`Invalid regex pattern found in regex_contains: ${t}, returning error`), Q.dr();
		}
	}
}, yv = class extends gv {
	Fr(e, t) {
		try {
			return Q.newValue({ booleanValue: ru.compile(t).matches(e) });
		} catch {
			return lu(`Invalid regex pattern found in regex_match: ${t}, returning error`), Q.dr();
		}
	}
}, bv = class extends gv {
	Fr(e, t) {
		return Q.newValue({ booleanValue: e.includes(t) });
	}
}, xv = class extends gv {
	Fr(e, t) {
		return Q.newValue({ booleanValue: e.startsWith(t) });
	}
}, Sv = class extends gv {
	Fr(e, t) {
		return Q.newValue({ booleanValue: e.endsWith(t) });
	}
}, Cv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 29079);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "STRING": return Q.newValue({ stringValue: n.value?.stringValue?.toLowerCase() });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, wv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 60487);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "STRING": return Q.newValue({ stringValue: n.value?.stringValue?.toUpperCase() });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, Tv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 28544);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "STRING": return Q.newValue({ stringValue: n.value?.stringValue?.trim() });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, Ev = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = this.expr.params.map(((n) => $(n).evaluate(e, t))), r = "", i = !1;
		for (let e of n) switch (e.type) {
			case "STRING":
				r += e.value.stringValue;
				break;
			case "NULL":
				i = !0;
				break;
			default: return Q.dr();
		}
		return i ? Q.pr() : Q.newValue({ stringValue: r });
	}
}, Dv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 2, 4483);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "UNSET": return Q.mr();
			case "MAP": break;
			default: return Q.dr();
		}
		let r = $(this.expr.params[1]).evaluate(e, t);
		if (r.type !== "STRING") return Q.dr();
		let i = n.value?.mapValue?.fields?.[r.value?.stringValue];
		return i === void 0 ? Q.mr() : Q.newValue(i);
	}
}, Ov = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 2, 25231, `${this.expr.name}() function should have exactly 2 params`);
		let n = !1, r = $(this.expr.params[0]).evaluate(e, t);
		switch (r.type) {
			case "VECTOR": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		let i = $(this.expr.params[1]).evaluate(e, t);
		switch (i.type) {
			case "VECTOR": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		if (n) return Q.pr();
		let a = Rd(r.value), o = Rd(i.value);
		if (a === void 0 || o === void 0 || a.values?.length !== o.values?.length) return Q.dr();
		let s = this.Or(a, o);
		return s === void 0 || isNaN(s) ? Q.dr() : Q.newValue({ doubleValue: s });
	}
}, kv = class extends Ov {
	Or(e, t) {
		let n = e?.values ?? [], r = t?.values ?? [];
		if (n.length === 0) return;
		let i = 0, a = 0, o = 0;
		for (let e = 0; e < n.length; e++) {
			if (!Md(n[e]) || !Md(r[e])) return;
			let t = T_(n[e]), s = T_(r[e]);
			i += t * s, a += t * t, o += s * s;
		}
		let s = Math.sqrt(a) * Math.sqrt(o);
		if (s !== 0) return 1 - Math.max(-1, Math.min(1, i / s));
	}
}, Av = class extends Ov {
	Or(e, t) {
		let n = e?.values ?? [], r = t?.values ?? [];
		if (n.length === 0) return 0;
		let i = 0;
		for (let e = 0; e < n.length; e++) {
			if (!Md(n[e]) || !Md(r[e])) return;
			i += T_(n[e]) * T_(r[e]);
		}
		return i;
	}
}, jv = class extends Ov {
	Or(e, t) {
		let n = e?.values ?? [], r = t?.values ?? [];
		if (n.length === 0) return 0;
		let i = 0;
		for (let e = 0; e < n.length; e++) {
			if (!Md(n[e]) || !Md(r[e])) return;
			let t = T_(n[e]), a = T_(r[e]);
			i += (t - a) ** 2;
		}
		return Math.sqrt(i);
	}
}, Mv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 39044);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "VECTOR": {
				let e = Rd(n.value);
				return Q.newValue({ integerValue: e?.values?.length ?? 0 });
			}
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, Nv = BigInt(-62135596800), Pv = BigInt(253402300799), Fv = BigInt(1e3), Iv = BigInt(1e6), Lv = Nv * Fv, Rv = Pv * Fv + BigInt(999), zv = Nv * Iv, Bv = Pv * Iv + BigInt(999999);
function Vv(e) {
	return e >= zv && e <= Bv;
}
function Hv(e) {
	return e >= Nv && e <= Pv;
}
function Uv(e, t) {
	let n = BigInt(e);
	return !(n < Nv || n > Pv) && !(t < 0 || t >= 1e9) && (n !== Nv || t === 0) && !(n === Pv && t > 999999999);
}
function Wv(e, t) {
	return t < 0 ? {
		seconds: e - 1,
		nanos: t + 1e9
	} : {
		seconds: e,
		nanos: t
	};
}
function Gv(e) {
	return BigInt(e.seconds) * Iv + BigInt(Math.trunc(e.nanoseconds / 1e3));
}
var Kv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 49262, `${this.expr.name}() function should have exactly one parameter`);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "INT": return this.toTimestamp(BigInt(n.value.integerValue));
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, qv = class extends Kv {
	toTimestamp(e) {
		if (!Vv(e)) return Q.dr();
		let t = Number(e / Iv), n = Number(e % Iv * BigInt(1e3)), r = Wv(t, n);
		return t = r.seconds, n = r.nanos, Uv(t, n) ? Q.newValue({ timestampValue: {
			seconds: t,
			nanos: n
		} }) : Q.dr();
	}
}, Jv = class extends Kv {
	toTimestamp(e) {
		if (!function(e) {
			return e >= Lv && e <= Rv;
		}(e)) return Q.dr();
		let t = Number(e / Fv), n = Number(e % Fv * BigInt(1e6)), r = Wv(t, n);
		return t = r.seconds, n = r.nanos, Uv(t, n) ? Q.newValue({ timestampValue: {
			seconds: t,
			nanos: n
		} }) : Q.dr();
	}
}, Yv = class extends Kv {
	toTimestamp(e) {
		if (!Hv(e)) return Q.dr();
		let t = Number(e);
		return Q.newValue({ timestampValue: {
			seconds: t,
			nanos: 0
		} });
	}
}, Xv = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 1, 1265, `${this.expr.name}() function should have exactly one parameter`);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "TIMESTAMP": break;
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
		let r = lm(n.value.timestampValue);
		return Uv(r.seconds, r.nanoseconds) ? this.Mr(r) : Q.dr();
	}
}, Zv = class extends Xv {
	Mr(e) {
		let t = Gv(e);
		return Vv(t) ? Q.newValue({ integerValue: `${t.toString()}` }) : Q.dr();
	}
}, Qv = class extends Xv {
	Mr(e) {
		let t = Gv(e), n = t / BigInt(1e3), r = t % BigInt(1e3);
		return n > BigInt(0) || r === BigInt(0) ? Q.newValue({ integerValue: n.toString() }) : Q.newValue({ integerValue: (n - BigInt(1)).toString() });
	}
}, $v = class extends Xv {
	Mr(e) {
		let t = BigInt(e.seconds);
		return Hv(t) ? Q.newValue({ integerValue: t.toString() }) : Q.dr();
	}
}, ey = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		R(this.expr.params.length === 3, 2775, `${this.expr.name}() function should have exactly 3 parameters`);
		let n = !1, r = $(this.expr.params[0]).evaluate(e, t);
		switch (r.type) {
			case "TIMESTAMP": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		let i = $(this.expr.params[1]).evaluate(e, t), a;
		switch (i.type) {
			case "STRING":
				if (a = function(e) {
					switch (e) {
						case "microsecond": return "microsecond";
						case "millisecond": return "millisecond";
						case "second": return "second";
						case "minute": return "minute";
						case "hour": return "hour";
						case "day": return "day";
						default: return;
					}
				}(i.value.stringValue), a === void 0) return Q.dr();
				break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		let o = $(this.expr.params[2]).evaluate(e, t);
		switch (o.type) {
			case "INT": break;
			case "NULL":
				n = !0;
				break;
			default: return Q.dr();
		}
		if (n) return Q.pr();
		let s = BigInt(o.value.integerValue), c;
		try {
			switch (a) {
				case "microsecond":
					c = s;
					break;
				case "millisecond":
					c = s * BigInt(1e3);
					break;
				case "second":
					c = s * BigInt(1e6);
					break;
				case "minute":
					c = s * BigInt(6e7);
					break;
				case "hour":
					c = s * BigInt(36e8);
					break;
				case "day":
					c = s * BigInt(864e8);
					break;
				default: return Q.dr();
			}
			if (a !== "microsecond" && s !== BigInt(0) && c / s !== BigInt(this.Nr(a))) return Q.dr();
		} catch (e) {
			return lu(`Error during timestamp arithmetic: ${e}`), Q.dr();
		}
		let l = lm(r.value.timestampValue);
		if (!Uv(l.seconds, l.nanoseconds)) return Q.dr();
		let u = Gv(l), d = this.Lr(u, c);
		if (!Vv(d)) return Q.dr();
		let f = Number(d / Iv), p = d % Iv, m = Number((p < 0 ? p + Iv : p) * BigInt(1e3)), h = p < 0 ? f - 1 : f;
		return Uv(h, m) ? Q.newValue({ timestampValue: {
			seconds: h,
			nanos: m
		} }) : Q.dr();
	}
	Nr(e) {
		switch (e) {
			case "millisecond": return 1e3;
			case "second": return 1e6;
			case "minute": return 6e7;
			case "hour": return 36e8;
			case "day": return 864e8;
			default: return 1;
		}
	}
}, ty = class extends ey {
	Lr(e, t) {
		return e + t;
	}
}, ny = class extends ey {
	Lr(e, t) {
		return e - t;
	}
};
function ry(e) {
	if ((e = x_(e)) instanceof Lg) return `fld(${e.fieldName})`;
	if (e instanceof Bg) return `cst(${function(e) {
		return e === null ? "null" : typeof e == "number" ? e.toString() : typeof e == "string" ? `"${e}"` : e instanceof Qh ? `ref(${e.path})` : e instanceof ng ? `vec(${JSON.stringify(e)})` : JSON.stringify(e);
	}(e.value)})`;
	if (e instanceof Z) return `fn(${e.name},[${e.params.map(ry).join(",")}])`;
	if (e.expressionType === "ListOfExpressions") return `list([${e.ur.map(ry).join(",")}])`;
	throw Error(`Unrecognized expr ${JSON.stringify(e, null, 2)}`);
}
function iy(e) {
	if (e instanceof $g) return `${e._name}(${ay(e.fields)})`;
	if (e instanceof e_) {
		let t = `${e._name}(${ay(e.accumulators)})`;
		return e.groups.size > 0 && (t += `grouping(${ay(e.groups)})`), t;
	}
	if (e instanceof t_) return `${e._name}(${ay(e.groups)})`;
	if (e instanceof n_) return `${e._name}(${e.Er})`;
	if (e instanceof r_) return `${e._name}(${e.collectionId})`;
	if (e instanceof i_) return `${e._name}()`;
	if (e instanceof a_) return `${e._name}(${e.hr.sort()})`;
	if (e instanceof o_) return `${e._name}(${ry(e.condition)})`;
	if (e instanceof s_) return `${e._name}(${e.limit})`;
	if (e instanceof u_) return `${e._name}(${function(e) {
		return e.map(((e) => `${ry(e.expr)}${e.direction}`)).join(",");
	}(e.orderings)})`;
	throw Error(`Unrecognized stage ${e._name}`);
}
function ay(e) {
	return `${Array.from(e.entries()).sort().map((([e, t]) => `${e}=${ry(t)}`)).join(",")}`;
}
function oy(e) {
	return e.stages.map(((e) => iy(e))).join("|");
}
function sy(e, t) {
	return oy(e) === oy(t);
}
function cy(e) {
	return e instanceof m_;
}
function ly(e) {
	return cy(e) ? oy(e) : yp(e);
}
function uy(e) {
	return cy(e) ? oy(e) : function(e) {
		return `${rp(mp(e))}|lt:${e.limitType}`;
	}(e);
}
function dy(e, t) {
	return e instanceof m_ && t instanceof m_ ? sy(e, t) : !(e instanceof m_ && !(t instanceof m_) || !(e instanceof m_) && t instanceof m_) && vp(e, t);
}
function fy(e) {
	return ap(e) ? oy(e) : rp(e);
}
function py(e, t) {
	return e instanceof m_ && t instanceof m_ ? sy(e, t) : !(e instanceof m_ && !(t instanceof m_) || !(e instanceof m_) && t instanceof m_) && ip(e, t);
}
function my(e, t) {
	let n = function(e) {
		let t = !1, n = [];
		for (let r of e) if (r instanceof u_) {
			if (t = !0, r.orderings.some(((e) => e.expr instanceof Lg && e.expr.fieldName === wu))) n.push(r);
			else {
				let e = r.orderings.map(((e) => e));
				e.push(Rg(wu).ascending()), n.push(new u_(e, {}));
			}
		} else r instanceof s_ && (t ||= (n.push(new u_([Rg(wu).ascending()], {})), !0)), n.push(r);
		return t || n.push(new u_([Rg(wu).ascending()], {})), n;
	}(e.stages);
	if (e.userDataReader) {
		let t = e.userDataReader.createContext(3, "toCorePipeline");
		n.forEach(((e) => e._readUserData(t)));
	}
	return new m_(e.userDataReader.serializer, n, t);
}
var hy = class {
	constructor(e, t, n, r) {
		this.batchId = e, this.localWriteTime = t, this.baseMutations = n, this.mutations = r;
	}
	applyToRemoteDocument(e, t) {
		let n = t.mutationResults;
		for (let t = 0; t < this.mutations.length; t++) {
			let r = this.mutations[t];
			r.key.isEqual(e.key) && gf(r, e, n[t]);
		}
	}
	applyToLocalView(e, t) {
		for (let n of this.baseMutations) n.key.isEqual(e.key) && (t = _f(n, e, t, this.localWriteTime));
		for (let n of this.mutations) n.key.isEqual(e.key) && (t = _f(n, e, t, this.localWriteTime));
		return t;
	}
	applyToLocalDocumentSet(e, t) {
		let n = Pp();
		return this.mutations.forEach(((r) => {
			let i = e.get(r.key), a = i.overlayedDocument, o = this.applyToLocalView(a, i.mutatedFields);
			o = t.has(r.key) ? null : o;
			let s = hf(a, o);
			s !== null && n.set(r.key, s), a.isValidDocument() || a.convertToNoDocument(K.min());
		})), n;
	}
	keys() {
		return this.mutations.reduce(((e, t) => e.add(t.key)), J());
	}
	isEqual(e) {
		return this.batchId === e.batchId && vu(this.mutations, e.mutations, ((e, t) => yf(e, t))) && vu(this.baseMutations, e.baseMutations, ((e, t) => yf(e, t)));
	}
}, gy = class e {
	constructor(e, t, n, r) {
		this.batch = e, this.commitVersion = t, this.mutationResults = n, this.docVersions = r;
	}
	static from(t, n, r) {
		R(t.mutations.length === r.length, 58842, {
			Br: t.mutations.length,
			Ur: r.length
		});
		let i = function() {
			return Ip;
		}(), a = t.mutations;
		for (let e = 0; e < a.length; e++) i = i.insert(a[e].key, r[e].version);
		return new e(t, n, r, i);
	}
}, _y = "";
function vy(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) t.length > 0 && (t = by(t)), t = yy(e.get(n), t);
	return by(t);
}
function yy(e, t) {
	let n = t, r = e.length;
	for (let t = 0; t < r; t++) {
		let r = e.charAt(t);
		switch (r) {
			case "\0":
				n += "";
				break;
			case _y:
				n += "";
				break;
			default: n += r;
		}
	}
	return n;
}
function by(e) {
	return e + "";
}
var xy = class {
	constructor(e, t) {
		this.largestBatchId = e, this.mutation = t;
	}
	getKey() {
		return this.mutation.key;
	}
	isEqual(e) {
		return e !== null && this.mutation === e.mutation;
	}
	toString() {
		return `Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`;
	}
}, Sy = class e {
	constructor(e, t, n, r, i = K.min(), a = K.min(), o = Ku.EMPTY_BYTE_STRING, s = null) {
		this.target = e, this.targetId = t, this.purpose = n, this.sequenceNumber = r, this.snapshotVersion = i, this.lastLimboFreeSnapshotVersion = a, this.resumeToken = o, this.expectedCount = s;
	}
	withSequenceNumber(t) {
		return new e(this.target, this.targetId, this.purpose, t, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
	}
	withResumeToken(t, n) {
		return new e(this.target, this.targetId, this.purpose, this.sequenceNumber, n, this.lastLimboFreeSnapshotVersion, t, null);
	}
	withExpectedCount(t) {
		return new e(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, t);
	}
	withLastLimboFreeSnapshotVersion(t) {
		return new e(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, t, this.resumeToken, this.expectedCount);
	}
}, Cy = class {
	constructor(e) {
		this.qr = e;
	}
};
function wy(e) {
	let t = Om({
		parent: e.parent,
		structuredQuery: e.structuredQuery
	});
	return e.limitType === "LAST" ? _p(t, t.limit, "L") : t;
}
var Ty = class {
	constructor() {}
	Xr(e, t) {
		this.ei(e, t), t.ti();
	}
	ei(e, t) {
		if ("nullValue" in e) this.ni(t, 5);
		else if ("booleanValue" in e) this.ni(t, 10), t.ri(+!!e.booleanValue);
		else if ("integerValue" in e) this.ni(t, 15), t.ri(G(e.integerValue));
		else if ("doubleValue" in e) {
			let n = G(e.doubleValue);
			isNaN(n) ? this.ni(t, 13) : (this.ni(t, 15), ld(n) ? t.ri(0) : t.ri(n));
		} else if ("timestampValue" in e) {
			let n = e.timestampValue;
			this.ni(t, 20), typeof n == "string" && (n = Ju(n)), t.ii(`${n.seconds || ""}`), t.ri(n.nanos || 0);
		} else if ("stringValue" in e) this.si(e.stringValue, t), this._i(t);
		else if ("bytesValue" in e) this.ni(t, 30), t.oi(Yu(e.bytesValue)), this._i(t);
		else if ("referenceValue" in e) this.ai(e.referenceValue, t);
		else if ("geoPointValue" in e) {
			let n = e.geoPointValue;
			this.ni(t, 45), t.ri(n.latitude || 0), t.ri(n.longitude || 0);
		} else "mapValue" in e ? Bd(e) ? this.ni(t, 2 ** 53 - 1) : Ld(e) ? this.ui(e.mapValue, t) : (this.ci(e.mapValue, t), this._i(t)) : "arrayValue" in e ? (this.li(e.arrayValue, t), this._i(t)) : L(19022, { Ei: e });
	}
	si(e, t) {
		this.ni(t, 25), this.hi(e, t);
	}
	hi(e, t) {
		t.ii(e);
	}
	ci(e, t) {
		let n = e.fields || {};
		this.ni(t, 55);
		for (let e of Object.keys(n)) this.si(e, t), this.ei(n[e], t);
	}
	ui(e, t) {
		let n = e.fields || {};
		this.ni(t, 53);
		let r = gd, i = n[r].arrayValue?.values?.length || 0;
		this.ni(t, 15), t.ri(G(i)), this.si(r, t), this.ei(n[r], t);
	}
	li(e, t) {
		let n = e.values || [];
		this.ni(t, 50);
		for (let e of n) this.ei(e, t);
	}
	ai(e, t) {
		this.ni(t, 37), W.fromName(e).path.forEach(((e) => {
			this.ni(t, 60), this.hi(e, t);
		}));
	}
	ni(e, t) {
		e.ri(t);
	}
	_i(e) {
		e.ri(2);
	}
};
Ty.Ti = new Ty();
var Ey = class {
	constructor() {
		this.Yi = new Dy();
	}
	addToCollectionParentIndex(e, t) {
		return this.Yi.add(t), Y.resolve();
	}
	getCollectionParents(e, t) {
		return Y.resolve(this.Yi.getEntries(t));
	}
	addFieldIndex(e, t) {
		return Y.resolve();
	}
	deleteFieldIndex(e, t) {
		return Y.resolve();
	}
	deleteAllFieldIndexes(e) {
		return Y.resolve();
	}
	createTargetIndexes(e, t) {
		return Y.resolve();
	}
	getDocumentsMatchingTarget(e, t) {
		return Y.resolve(null);
	}
	getIndexType(e, t) {
		return Y.resolve(0);
	}
	getFieldIndexes(e, t) {
		return Y.resolve([]);
	}
	getNextCollectionGroupToUpdate(e) {
		return Y.resolve(null);
	}
	getMinOffset(e, t) {
		return Y.resolve($f.min());
	}
	getMinOffsetFromCollectionGroup(e, t) {
		return Y.resolve($f.min());
	}
	updateCollectionGroup(e, t, n) {
		return Y.resolve();
	}
	updateIndexEntries(e, t) {
		return Y.resolve();
	}
}, Dy = class {
	constructor() {
		this.index = {};
	}
	add(e) {
		let t = e.lastSegment(), n = e.popLast(), r = this.index[t] || new Su(U.comparator), i = !r.has(n);
		return this.index[t] = r.add(n), i;
	}
	has(e) {
		let t = e.lastSegment(), n = e.popLast(), r = this.index[t];
		return r && r.has(n);
	}
	getEntries(e) {
		return (this.index[e] || new Su(U.comparator)).toArray();
	}
}, Oy = class e {
	constructor(e) {
		this.gs = e;
	}
	next() {
		return this.gs += 2, this.gs;
	}
	static ys() {
		return new e(0);
	}
	static ws() {
		return new e(-1);
	}
};
function ky(e, t) {
	let n = t;
	for (let t of e.stages) n = My({
		serializer: e.serializer,
		serverTimestampBehavior: e.listenOptions?.serverTimestampBehavior
	}, t, n);
	return n;
}
function Ay(e, t) {
	return ky(e, [t]).length > 0;
}
function jy(e, t) {
	return cy(e) ? Ay(e, t) : bp(e, t);
}
function My(e, t, n) {
	if (t instanceof n_) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument() && `/${e.key.getCollectionPath().canonicalString()}` === t.Er));
	}(0, t, n);
	if (t instanceof o_) return function(e, t, n) {
		return n.filter(((n) => {
			let r = b_($(t.condition).evaluate(e, n));
			return r !== void 0 && xd(r, vd);
		}));
	}(e, t, n);
	if (t instanceof r_) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument() && e.key.getCollectionPath().lastSegment() === t.collectionId));
	}(0, t, n);
	if (t instanceof i_) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument()));
	}(0, 0, n);
	if (t instanceof a_) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument() && t.Tr.has(e.key.path.toStringWithLeadingSlash())));
	}(0, t, n);
	if (t instanceof s_) return function(e, t, n) {
		return n.slice(0, t.limit);
	}(0, t, n);
	if (t instanceof u_) return function(e, t, n) {
		let r = t.orderings.map(((e) => ({
			Os: $(e.expr),
			direction: e.direction
		})));
		return [...n].sort(((t, n) => {
			for (let { Os: i, direction: a } of r) {
				let r = b_(i.evaluate(e, t)), o = b_(i.evaluate(e, n)), s = Cd(r ?? _d, o ?? _d);
				if (s !== 0) return a === "ascending" ? s : -s;
			}
			return 0;
		}));
	}(e, t, n);
	throw Error(`Unknown stage: ${t._name}`);
}
function Ny(e) {
	let t = function(e) {
		for (let t = e.stages.length - 1; t >= 0; t--) {
			let n = e.stages[t];
			if (n instanceof u_) return n.orderings;
		}
		throw Error("Pipeline must contain at least one Sort stage");
	}(e);
	return (n, r) => {
		for (let i of t) {
			let t = b_($(i.expr).evaluate({ serializer: e.serializer }, n)), a = b_($(i.expr).evaluate({ serializer: e.serializer }, r)), o = Cd(t || _d, a || _d);
			if (o !== 0) return i.direction === "ascending" ? o : -o;
		}
		return 0;
	};
}
function Py(e) {
	for (let t = e.stages.length - 1; t >= 0; t--) {
		let n = e.stages[t];
		if (n instanceof s_) return { limit: n.limit };
	}
}
var Fy = class {
	constructor() {
		this.changes = new Dp(((e) => e.toString()), ((e, t) => e.isEqual(t))), this.changesApplied = !1;
	}
	addEntry(e) {
		this.assertNotApplied(), this.changes.set(e.key, e);
	}
	removeEntry(e, t) {
		this.assertNotApplied(), this.changes.set(e, Yf.newInvalidDocument(e).setReadTime(t));
	}
	getEntry(e, t) {
		this.assertNotApplied();
		let n = this.changes.get(t);
		return n === void 0 ? this.getFromCache(e, t) : Y.resolve(n);
	}
	getEntries(e, t) {
		return this.getAllFromCache(e, t);
	}
	apply(e) {
		return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(e);
	}
	assertNotApplied() {}
}, Iy = class {
	constructor(e, t) {
		this.overlayedDocument = e, this.mutatedFields = t;
	}
}, Ly = class {
	constructor(e, t, n, r) {
		this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = n, this.indexManager = r;
	}
	getDocument(e, t) {
		let n = null;
		return this.documentOverlayCache.getOverlay(e, t).next(((r) => (n = r, this.remoteDocumentCache.getEntry(e, t)))).next(((e) => (n !== null && _f(n.mutation, e, Ou.empty(), Wu.now()), e)));
	}
	getDocuments(e, t) {
		return this.remoteDocumentCache.getEntries(e, t).next(((t) => this.getLocalViewOfDocuments(e, t, J()).next((() => t))));
	}
	getLocalViewOfDocuments(e, t, n = J()) {
		let r = Np();
		return this.populateOverlays(e, r, t).next((() => this.computeViews(e, t, r, n).next(((e) => {
			let t = jp();
			return e.forEach(((e, n) => {
				t = t.insert(e, n.overlayedDocument);
			})), t;
		}))));
	}
	getOverlayedDocuments(e, t) {
		let n = Np();
		return this.populateOverlays(e, n, t).next((() => this.computeViews(e, t, n, J())));
	}
	populateOverlays(e, t, n) {
		let r = [];
		return n.forEach(((e) => {
			t.has(e) || r.push(e);
		})), this.documentOverlayCache.getOverlays(e, r).next(((e) => {
			e.forEach(((e, n) => {
				t.set(e, n);
			}));
		}));
	}
	computeViews(e, t, n, r) {
		let i = kp(), a = Fp(), o = function() {
			return Fp();
		}();
		return t.forEach(((e, t) => {
			let o = n.get(t.key);
			r.has(t.key) && (o === void 0 || o.mutation instanceof xf) ? i = i.insert(t.key, t) : o === void 0 ? a.set(t.key, Ou.empty()) : (a.set(t.key, o.mutation.getFieldMask()), _f(o.mutation, t, o.mutation.getFieldMask(), Wu.now()));
		})), this.recalculateAndSaveOverlays(e, i).next(((e) => (e.forEach(((e, t) => a.set(e, t))), t.forEach(((e, t) => o.set(e, new Iy(t, a.get(e) ?? null)))), o)));
	}
	recalculateAndSaveOverlays(e, t) {
		let n = Fp(), r = new yu(((e, t) => e - t)), i = J();
		return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next(((e) => {
			for (let i of e) i.keys().forEach(((e) => {
				let a = t.get(e);
				if (a === null) return;
				let o = n.get(e) || Ou.empty();
				o = i.applyToLocalView(a, o), n.set(e, o);
				let s = (r.get(i.batchId) || J()).add(e);
				r = r.insert(i.batchId, s);
			}));
		})).next((() => {
			let a = [], o = r.getReverseIterator();
			for (; o.hasNext();) {
				let r = o.getNext(), s = r.key, c = r.value, l = Pp();
				c.forEach(((e) => {
					if (!i.has(e)) {
						let r = hf(t.get(e), n.get(e));
						r !== null && l.set(e, r), i = i.add(e);
					}
				})), a.push(this.documentOverlayCache.saveOverlays(e, s, l));
			}
			return Y.waitFor(a);
		})).next((() => n));
	}
	recalculateAndSaveOverlaysForDocumentKeys(e, t) {
		return this.remoteDocumentCache.getEntries(e, t).next(((t) => this.recalculateAndSaveOverlays(e, t)));
	}
	getDocumentsMatchingQuery(e, t, n, r) {
		return cy(t) ? this.getDocumentsMatchingPipeline(e, t, n, r) : dp(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : fp(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, n, r) : this.getDocumentsMatchingCollectionQuery(e, t, n, r);
	}
	getNextDocuments(e, t, n, r) {
		return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, n, r).next(((i) => {
			let a = r - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, n.largestBatchId, r - i.size) : Y.resolve(Np()), o = Xf, s = i;
			return a.next(((t) => Y.forEach(t, ((t, n) => (o < n.largestBatchId && (o = n.largestBatchId), i.get(t) ? Y.resolve() : this.remoteDocumentCache.getEntry(e, t).next(((e) => {
				s = s.insert(t, e);
			}))))).next((() => this.populateOverlays(e, t, i))).next((() => this.computeViews(e, s, t, J()))).next(((e) => ({
				batchId: o,
				changes: Mp(e)
			})))));
		}));
	}
	getDocumentsMatchingDocumentQuery(e, t) {
		return this.getDocument(e, new W(t)).next(((e) => {
			let t = jp();
			return e.isFoundDocument() && (t = t.insert(e.key, e)), t;
		}));
	}
	getDocumentsMatchingCollectionGroupQuery(e, t, n, r) {
		let i = t.collectionGroup, a = jp();
		return this.indexManager.getCollectionParents(e, i).next(((o) => Y.forEach(o, ((o) => {
			let s = function(e, t) {
				return new sp(t, null, e.explicitOrderBy.slice(), e.filters.slice(), e.limit, e.limitType, e.startAt, e.endAt);
			}(t, o.child(i));
			return this.getDocumentsMatchingCollectionQuery(e, s, n, r).next(((e) => {
				e.forEach(((e, t) => {
					a = a.insert(e, t);
				}));
			}));
		})).next((() => a))));
	}
	getDocumentsMatchingCollectionQuery(e, t, n, r) {
		let i;
		return this.documentOverlayCache.getOverlaysForCollection(e, t.path, n.largestBatchId).next(((a) => (i = a, this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, r)))).next(((e) => this.retrieveMatchingLocalDocuments(i, e, ((e) => bp(t, e)))));
	}
	getDocumentsMatchingPipeline(e, t, n, r) {
		if (h_(t) === "collection_group") {
			let i = __(t), a = jp();
			return this.indexManager.getCollectionParents(e, i).next(((o) => Y.forEach(o, ((o) => {
				let s = function(e, t) {
					let n = e.stages.map(((e) => e instanceof r_ ? new n_(t.canonicalString(), {}) : e));
					return new m_(e.serializer, n);
				}(t, o.child(i));
				return this.getDocumentsMatchingPipeline(e, s, n, r).next(((e) => {
					e.forEach(((e, t) => {
						a = a.insert(e, t);
					}));
				}));
			})).next((() => a))));
		}
		{
			let i;
			return this.getOverlaysForPipeline(e, t, n.largestBatchId).next(((a) => {
				switch (i = a, h_(t)) {
					case "collection": return this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, r);
					case "documents":
						let a = J();
						for (let e of y_(t)) a = a.add(W.fromPath(e));
						return this.remoteDocumentCache.getEntries(e, a);
					case "database": return this.remoteDocumentCache.getAllEntries(e);
					default: throw new H("invalid-argument", `Invalid pipeline source to execute offline: ${oy(t)}`);
				}
			})).next(((e) => this.retrieveMatchingLocalDocuments(i, e, ((e) => Ay(t, e)))));
		}
	}
	retrieveMatchingLocalDocuments(e, t, n) {
		e.forEach(((e, n) => {
			let r = n.getKey();
			t.get(r) === null && (t = t.insert(r, Yf.newInvalidDocument(r)));
		}));
		let r = jp();
		return t.forEach(((t, i) => {
			let a = e.get(t);
			a !== void 0 && _f(a.mutation, i, Ou.empty(), Wu.now()), n(i) && (r = r.insert(t, i));
		})), r;
	}
	getOverlaysForPipeline(e, t, n) {
		switch (h_(t)) {
			case "collection": return this.documentOverlayCache.getOverlaysForCollection(e, U.fromString(g_(t)), n);
			case "collection_group": throw new H("invalid-argument", `Unexpected collection group pipeline: ${oy(t)}`);
			case "documents": return this.documentOverlayCache.getOverlays(e, y_(t).map(((e) => W.fromPath(e))));
			case "database": return this.documentOverlayCache.getAllOverlays(e, n);
			default: throw new H("invalid-argument", `Failed to get overlays for pipeline: ${oy(t)}`);
		}
	}
}, Ry = class {
	constructor(e) {
		this.serializer = e, this.Ks = /* @__PURE__ */ new Map(), this.Qs = /* @__PURE__ */ new Map();
	}
	getBundleMetadata(e, t) {
		return Y.resolve(this.Ks.get(t));
	}
	saveBundleMetadata(e, t) {
		return this.Ks.set(t.id, function(e) {
			return {
				id: e.id,
				version: e.version,
				createTime: fm(e.createTime)
			};
		}(t)), Y.resolve();
	}
	getNamedQuery(e, t) {
		return Y.resolve(this.Qs.get(t));
	}
	saveNamedQuery(e, t) {
		return this.Qs.set(t.name, function(e) {
			return {
				name: e.name,
				query: wy(e.bundledQuery),
				readTime: fm(e.readTime)
			};
		}(t)), Y.resolve();
	}
}, zy = class {
	constructor() {
		this.overlays = new yu(W.comparator), this.Ws = /* @__PURE__ */ new Map();
	}
	getOverlay(e, t) {
		return Y.resolve(this.overlays.get(t));
	}
	getOverlays(e, t) {
		let n = Np();
		return Y.forEach(t, ((t) => this.getOverlay(e, t).next(((e) => {
			e !== null && n.set(t, e);
		})))).next((() => n));
	}
	getAllOverlays(e, t) {
		let n = Np();
		return this.overlays.forEach(((e, r) => {
			r.largestBatchId > t && n.set(e, r);
		})), Y.resolve(n);
	}
	saveOverlays(e, t, n) {
		return n.forEach(((n, r) => {
			this.Yr(e, t, r);
		})), Y.resolve();
	}
	removeOverlaysForBatchId(e, t, n) {
		let r = this.Ws.get(n);
		return r !== void 0 && (r.forEach(((e) => this.overlays = this.overlays.remove(e))), this.Ws.delete(n)), Y.resolve();
	}
	getOverlaysForCollection(e, t, n) {
		let r = Np(), i = t.length + 1, a = new W(t.child("")), o = this.overlays.getIteratorFrom(a);
		for (; o.hasNext();) {
			let e = o.getNext().value, a = e.getKey();
			if (!t.isPrefixOf(a.path)) break;
			a.path.length === i && e.largestBatchId > n && r.set(e.getKey(), e);
		}
		return Y.resolve(r);
	}
	getOverlaysForCollectionGroup(e, t, n, r) {
		let i = new yu(((e, t) => e - t)), a = this.overlays.getIterator();
		for (; a.hasNext();) {
			let e = a.getNext().value;
			if (e.getKey().getCollectionGroup() === t && e.largestBatchId > n) {
				let t = i.get(e.largestBatchId);
				t === null && (t = Np(), i = i.insert(e.largestBatchId, t)), t.set(e.getKey(), e);
			}
		}
		let o = Np(), s = i.getIterator();
		for (; s.hasNext() && (s.getNext().value.forEach(((e, t) => o.set(e, t))), !(o.size() >= r)););
		return Y.resolve(o);
	}
	Yr(e, t, n) {
		let r = this.overlays.get(n.key);
		if (r !== null) {
			let e = this.Ws.get(r.largestBatchId).delete(n.key);
			this.Ws.set(r.largestBatchId, e);
		}
		this.overlays = this.overlays.insert(n.key, new xy(t, n));
		let i = this.Ws.get(t);
		i === void 0 && (i = J(), this.Ws.set(t, i)), this.Ws.set(t, i.add(n.key));
	}
}, By = class {
	constructor() {
		this.sessionToken = Ku.EMPTY_BYTE_STRING;
	}
	getSessionToken(e) {
		return Y.resolve(this.sessionToken);
	}
	setSessionToken(e, t) {
		return this.sessionToken = t, Y.resolve();
	}
}, Vy = class {
	constructor() {
		this.Gs = new Su(Hy.zs), this.js = new Su(Hy.Hs);
	}
	isEmpty() {
		return this.Gs.isEmpty();
	}
	addReference(e, t) {
		let n = new Hy(e, t);
		this.Gs = this.Gs.add(n), this.js = this.js.add(n);
	}
	Js(e, t) {
		e.forEach(((e) => this.addReference(e, t)));
	}
	removeReference(e, t) {
		this.Ys(new Hy(e, t));
	}
	Zs(e, t) {
		e.forEach(((e) => this.removeReference(e, t)));
	}
	Xs(e) {
		let t = new W(new U([])), n = new Hy(t, e), r = new Hy(t, e + 1), i = [];
		return this.js.forEachInRange([n, r], ((e) => {
			this.Ys(e), i.push(e.key);
		})), i;
	}
	e_() {
		this.Gs.forEach(((e) => this.Ys(e)));
	}
	Ys(e) {
		this.Gs = this.Gs.delete(e), this.js = this.js.delete(e);
	}
	t_(e) {
		let t = new W(new U([])), n = new Hy(t, e), r = new Hy(t, e + 1), i = J();
		return this.js.forEachInRange([n, r], ((e) => {
			i = i.add(e.key);
		})), i;
	}
	containsKey(e) {
		let t = new Hy(e, 0), n = this.Gs.firstAfterOrEqual(t);
		return n !== null && e.isEqual(n.key);
	}
}, Hy = class {
	constructor(e, t) {
		this.key = e, this.n_ = t;
	}
	static zs(e, t) {
		return W.comparator(e.key, t.key) || B(e.n_, t.n_);
	}
	static Hs(e, t) {
		return B(e.n_, t.n_) || W.comparator(e.key, t.key);
	}
}, Uy = class {
	constructor(e, t) {
		this.indexManager = e, this.referenceDelegate = t, this.mutationQueue = [], this.Wr = 1, this.r_ = new Su(Hy.zs);
	}
	checkEmpty(e) {
		return Y.resolve(this.mutationQueue.length === 0);
	}
	addMutationBatch(e, t, n, r) {
		let i = this.Wr;
		this.Wr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
		let a = new hy(i, t, n, r);
		this.mutationQueue.push(a);
		for (let t of r) this.r_ = this.r_.add(new Hy(t.key, i)), this.indexManager.addToCollectionParentIndex(e, t.key.path.popLast());
		return Y.resolve(a);
	}
	lookupMutationBatch(e, t) {
		return Y.resolve(this.i_(t));
	}
	getNextMutationBatchAfterBatchId(e, t) {
		let n = t + 1, r = this.s_(n), i = r < 0 ? 0 : r;
		return Y.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
	}
	getHighestUnacknowledgedBatchId() {
		return Y.resolve(this.mutationQueue.length === 0 ? sd : this.Wr - 1);
	}
	getAllMutationBatches(e) {
		return Y.resolve(this.mutationQueue.slice());
	}
	getAllMutationBatchesAffectingDocumentKey(e, t) {
		let n = new Hy(t, 0), r = new Hy(t, Infinity), i = [];
		return this.r_.forEachInRange([n, r], ((e) => {
			let t = this.i_(e.n_);
			i.push(t);
		})), Y.resolve(i);
	}
	getAllMutationBatchesAffectingDocumentKeys(e, t) {
		let n = new Su(B);
		return t.forEach(((e) => {
			let t = new Hy(e, 0), r = new Hy(e, Infinity);
			this.r_.forEachInRange([t, r], ((e) => {
				n = n.add(e.n_);
			}));
		})), Y.resolve(this.__(n));
	}
	getAllMutationBatchesAffectingQuery(e, t) {
		let n = t.path, r = n.length + 1, i = n;
		W.isDocumentKey(i) || (i = i.child(""));
		let a = new Hy(new W(i), 0), o = new Su(B);
		return this.r_.forEachWhile(((e) => {
			let t = e.key.path;
			return !!n.isPrefixOf(t) && (t.length === r && (o = o.add(e.n_)), !0);
		}), a), Y.resolve(this.__(o));
	}
	__(e) {
		let t = [];
		return e.forEach(((e) => {
			let n = this.i_(e);
			n !== null && t.push(n);
		})), t;
	}
	removeMutationBatch(e, t) {
		R(this.o_(t.batchId, "removed") === 0, 55003), this.mutationQueue.shift();
		let n = this.r_;
		return Y.forEach(t.mutations, ((r) => {
			let i = new Hy(r.key, t.batchId);
			return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(e, r.key);
		})).next((() => {
			this.r_ = n;
		}));
	}
	jr(e) {}
	containsKey(e, t) {
		let n = new Hy(t, 0), r = this.r_.firstAfterOrEqual(n);
		return Y.resolve(t.isEqual(r && r.key));
	}
	performConsistencyCheck(e) {
		return this.mutationQueue.length, Y.resolve();
	}
	o_(e, t) {
		return this.s_(e);
	}
	s_(e) {
		return this.mutationQueue.length === 0 ? 0 : e - this.mutationQueue[0].batchId;
	}
	i_(e) {
		let t = this.s_(e);
		return t < 0 || t >= this.mutationQueue.length ? null : this.mutationQueue[t];
	}
}, Wy = class {
	constructor(e) {
		this.a_ = e, this.docs = function() {
			return new yu(W.comparator);
		}(), this.size = 0;
	}
	setIndexManager(e) {
		this.indexManager = e;
	}
	addEntry(e, t) {
		let n = t.key, r = this.docs.get(n), i = r ? r.size : 0, a = this.a_(t);
		return this.docs = this.docs.insert(n, {
			document: t.mutableCopy(),
			size: a
		}), this.size += a - i, this.indexManager.addToCollectionParentIndex(e, n.path.popLast());
	}
	removeEntry(e) {
		let t = this.docs.get(e);
		t && (this.docs = this.docs.remove(e), this.size -= t.size);
	}
	getEntry(e, t) {
		let n = this.docs.get(t);
		return Y.resolve(n ? n.document.mutableCopy() : Yf.newInvalidDocument(t));
	}
	getEntries(e, t) {
		let n = kp();
		return t.forEach(((e) => {
			let t = this.docs.get(e);
			n = n.insert(e, t ? t.document.mutableCopy() : Yf.newInvalidDocument(e));
		})), Y.resolve(n);
	}
	getAllEntries(e) {
		let t = kp();
		return this.docs.forEach(((e, n) => {
			t = t.insert(e, n.document);
		})), Y.resolve(t);
	}
	getDocumentsMatchingQuery(e, t, n, r) {
		let i, a;
		cy(t) ? (i = U.fromString(g_(t)), a = (e) => Ay(t, e)) : (i = t.path, a = (e) => bp(t, e));
		let o = kp(), s = new W(i.child("__id-9223372036854775808__")), c = this.docs.getIteratorFrom(s);
		for (; c.hasNext();) {
			let { key: e, value: { document: t } } = c.getNext();
			if (!i.isPrefixOf(e.path)) break;
			e.path.length > i.length + 1 || ep(Qf(t), n) <= 0 || (r.has(t.key) || a(t)) && (o = o.insert(t.key, t.mutableCopy()));
		}
		return Y.resolve(o);
	}
	getAllFromCollectionGroup(e, t, n, r) {
		L(9500);
	}
	u_(e, t) {
		return Y.forEach(this.docs, ((e) => t(e)));
	}
	newChangeBuffer(e) {
		return new Gy(this);
	}
	getSize(e) {
		return Y.resolve(this.size);
	}
}, Gy = class extends Fy {
	constructor(e) {
		super(), this.qs = e;
	}
	applyChanges(e) {
		let t = [];
		return this.changes.forEach(((n, r) => {
			r.isValidDocument() ? t.push(this.qs.addEntry(e, r)) : this.qs.removeEntry(n);
		})), Y.waitFor(t);
	}
	getFromCache(e, t) {
		return this.qs.getEntry(e, t);
	}
	getAllFromCache(e, t) {
		return this.qs.getEntries(e, t);
	}
}, Ky = class {
	constructor(e) {
		this.persistence = e, this.c_ = new Dp(((e) => fy(e)), py), this.lastRemoteSnapshotVersion = K.min(), this.highestTargetId = 0, this.l_ = 0, this.E_ = new Vy(), this.targetCount = 0, this.h_ = Oy.ys();
	}
	forEachTarget(e, t) {
		return this.c_.forEach(((e, n) => t(n))), Y.resolve();
	}
	getLastRemoteSnapshotVersion(e) {
		return Y.resolve(this.lastRemoteSnapshotVersion);
	}
	getHighestSequenceNumber(e) {
		return Y.resolve(this.l_);
	}
	allocateTargetId(e) {
		return this.highestTargetId = this.h_.next(), Y.resolve(this.highestTargetId);
	}
	setTargetsMetadata(e, t, n) {
		return n && (this.lastRemoteSnapshotVersion = n), t > this.l_ && (this.l_ = t), Y.resolve();
	}
	vs(e) {
		this.c_.set(e.target, e);
		let t = e.targetId;
		t > this.highestTargetId && (this.h_ = new Oy(t), this.highestTargetId = t), e.sequenceNumber > this.l_ && (this.l_ = e.sequenceNumber);
	}
	addTargetData(e, t) {
		return this.vs(t), this.targetCount += 1, Y.resolve();
	}
	updateTargetData(e, t) {
		return this.vs(t), Y.resolve();
	}
	removeTargetData(e, t) {
		return this.c_.delete(t.target), this.E_.Xs(t.targetId), --this.targetCount, Y.resolve();
	}
	removeTargets(e, t, n) {
		let r = 0, i = [];
		return this.c_.forEach(((a, o) => {
			o.sequenceNumber <= t && n.get(o.targetId) === null && (this.c_.delete(a), i.push(this.removeMatchingKeysForTargetId(e, o.targetId)), r++);
		})), Y.waitFor(i).next((() => r));
	}
	getTargetCount(e) {
		return Y.resolve(this.targetCount);
	}
	getTargetData(e, t) {
		let n = this.c_.get(t) || null;
		return Y.resolve(n);
	}
	addMatchingKeys(e, t, n) {
		return this.E_.Js(t, n), Y.resolve();
	}
	removeMatchingKeys(e, t, n) {
		this.E_.Zs(t, n);
		let r = this.persistence.referenceDelegate, i = [];
		return r && t.forEach(((t) => {
			i.push(r.markPotentiallyOrphaned(e, t));
		})), Y.waitFor(i);
	}
	removeMatchingKeysForTargetId(e, t) {
		return this.E_.Xs(t), Y.resolve();
	}
	getMatchingKeysForTargetId(e, t) {
		let n = this.E_.t_(t);
		return Y.resolve(n);
	}
	containsKey(e, t) {
		return Y.resolve(this.E_.containsKey(t));
	}
}, qy = class {
	constructor(e, t) {
		this.T_ = {}, this.overlays = {}, this.P_ = new Nh(0), this.R_ = !1, this.R_ = !0, this.I_ = new By(), this.referenceDelegate = e(this), this.A_ = new Ky(this), this.indexManager = new Ey(), this.remoteDocumentCache = function(e) {
			return new Wy(e);
		}(((e) => this.referenceDelegate.V_(e))), this.serializer = new Cy(t), this.d_ = new Ry(this.serializer);
	}
	start() {
		return Promise.resolve();
	}
	shutdown() {
		return this.R_ = !1, Promise.resolve();
	}
	get started() {
		return this.R_;
	}
	setDatabaseDeletedListener() {}
	setNetworkEnabled() {}
	getIndexManager(e) {
		return this.indexManager;
	}
	getDocumentOverlayCache(e) {
		let t = this.overlays[e.toKey()];
		return t || (t = new zy(), this.overlays[e.toKey()] = t), t;
	}
	getMutationQueue(e, t) {
		let n = this.T_[e.toKey()];
		return n || (n = new Uy(t, this.referenceDelegate), this.T_[e.toKey()] = n), n;
	}
	getGlobalsCache() {
		return this.I_;
	}
	getTargetCache() {
		return this.A_;
	}
	getRemoteDocumentCache() {
		return this.remoteDocumentCache;
	}
	getBundleCache() {
		return this.d_;
	}
	runTransaction(e, t, n) {
		I("MemoryPersistence", "Starting transaction:", e);
		let r = new Jy(this.P_.next());
		return this.referenceDelegate.f_(), n(r).next(((e) => this.referenceDelegate.m_(r).next((() => e)))).toPromise().then(((e) => (r.raiseOnCommittedEvent(), e)));
	}
	p_(e, t) {
		return Y.or(Object.values(this.T_).map(((n) => () => n.containsKey(e, t))));
	}
}, Jy = class extends Fh {
	constructor(e) {
		super(), this.currentSequenceNumber = e;
	}
}, Yy = class e {
	constructor(e) {
		this.persistence = e, this.g_ = new Vy(), this.y_ = null;
	}
	static w_(t) {
		return new e(t);
	}
	get b_() {
		if (this.y_) return this.y_;
		throw L(60996);
	}
	addReference(e, t, n) {
		return this.g_.addReference(n, t), this.b_.delete(n.toString()), Y.resolve();
	}
	removeReference(e, t, n) {
		return this.g_.removeReference(n, t), this.b_.add(n.toString()), Y.resolve();
	}
	markPotentiallyOrphaned(e, t) {
		return this.b_.add(t.toString()), Y.resolve();
	}
	removeTarget(e, t) {
		this.g_.Xs(t.targetId).forEach(((e) => this.b_.add(e.toString())));
		let n = this.persistence.getTargetCache();
		return n.getMatchingKeysForTargetId(e, t.targetId).next(((e) => {
			e.forEach(((e) => this.b_.add(e.toString())));
		})).next((() => n.removeTargetData(e, t)));
	}
	f_() {
		this.y_ = /* @__PURE__ */ new Set();
	}
	m_(e) {
		let t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
		return Y.forEach(this.b_, ((n) => {
			let r = W.fromPath(n);
			return this.S_(e, r).next(((e) => {
				e || t.removeEntry(r, K.min());
			}));
		})).next((() => (this.y_ = null, t.apply(e))));
	}
	updateLimboDocument(e, t) {
		return this.S_(e, t).next(((e) => {
			e ? this.b_.delete(t.toString()) : this.b_.add(t.toString());
		}));
	}
	V_(e) {
		return 0;
	}
	S_(e, t) {
		return Y.or([
			() => Y.resolve(this.g_.containsKey(t)),
			() => this.persistence.getTargetCache().containsKey(e, t),
			() => this.persistence.p_(e, t)
		]);
	}
}, Xy = class e {
	constructor(e, t) {
		this.persistence = e, this.v_ = new Dp(((e) => vy(e.path)), ((e, t) => e.isEqual(t))), this.garbageCollector = Gh(this, t);
	}
	static w_(t, n) {
		return new e(t, n);
	}
	f_() {}
	m_(e) {
		return Y.resolve();
	}
	forEachTarget(e, t) {
		return this.persistence.getTargetCache().forEachTarget(e, t);
	}
	rr(e) {
		let t = this.xs(e);
		return this.persistence.getTargetCache().getTargetCount(e).next(((e) => t.next(((t) => e + t))));
	}
	xs(e) {
		let t = 0;
		return this.ir(e, ((e) => {
			t++;
		})).next((() => t));
	}
	ir(e, t) {
		return Y.forEach(this.v_, ((n, r) => this.Fs(e, n, r).next(((e) => e ? Y.resolve() : t(r)))));
	}
	removeTargets(e, t, n) {
		return this.persistence.getTargetCache().removeTargets(e, t, n);
	}
	removeOrphanedDocuments(e, t) {
		let n = 0, r = this.persistence.getRemoteDocumentCache(), i = r.newChangeBuffer();
		return r.u_(e, ((r) => this.Fs(e, r, t).next(((e) => {
			e || (n++, i.removeEntry(r, K.min()));
		})))).next((() => i.apply(e))).next((() => n));
	}
	markPotentiallyOrphaned(e, t) {
		return this.v_.set(t, e.currentSequenceNumber), Y.resolve();
	}
	removeTarget(e, t) {
		let n = t.withSequenceNumber(e.currentSequenceNumber);
		return this.persistence.getTargetCache().updateTargetData(e, n);
	}
	addReference(e, t, n) {
		return this.v_.set(n, e.currentSequenceNumber), Y.resolve();
	}
	removeReference(e, t, n) {
		return this.v_.set(n, e.currentSequenceNumber), Y.resolve();
	}
	updateLimboDocument(e, t) {
		return this.v_.set(t, e.currentSequenceNumber), Y.resolve();
	}
	V_(e) {
		let t = e.key.toString().length;
		return e.isFoundDocument() && (t += Od(e.data.value)), t;
	}
	Fs(e, t, n) {
		return Y.or([
			() => this.persistence.p_(e, t),
			() => this.persistence.getTargetCache().containsKey(e, t),
			() => {
				let e = this.v_.get(t);
				return Y.resolve(e !== void 0 && e > n);
			}
		]);
	}
	getCacheSize(e) {
		return this.persistence.getRemoteDocumentCache().getSize(e);
	}
}, Zy = class e {
	constructor(e, t, n, r) {
		this.targetId = e, this.fromCache = t, this.Ao = n, this.Vo = r;
	}
	static fo(t, n) {
		let r = J(), i = J();
		for (let e of n.docChanges) switch (e.type) {
			case 0:
				r = r.add(e.doc.key);
				break;
			case 1: i = i.add(e.doc.key);
		}
		return new e(t, n.fromCache, r, i);
	}
};
function Qy(e, t) {
	return W.comparator(e.key, t.key);
}
var $y = class {
	constructor() {
		this._documentReadCount = 0;
	}
	get documentReadCount() {
		return this._documentReadCount;
	}
	incrementDocumentReadCount(e) {
		this._documentReadCount += e;
	}
}, eb = class {
	constructor() {
		this.mo = !1, this.po = !1, this.yo = 100, this.wo = function() {
			return se() ? 8 : Lh(v()) > 0 ? 6 : 4;
		}();
	}
	initialize(e, t) {
		this.bo = e, this.indexManager = t, this.mo = !0;
	}
	getDocumentsMatchingQuery(e, t, n, r) {
		let i = { result: null };
		return this.So(e, t).next(((e) => {
			i.result = e;
		})).next((() => {
			if (!i.result) return this.vo(e, t, r, n).next(((e) => {
				i.result = e;
			}));
		})).next((() => {
			if (i.result) return;
			let n = new $y();
			return this.Do(e, t, n).next(((r) => {
				if (i.result = r, this.po) return this.xo(e, t, n, r.size);
			}));
		})).next((() => i.result));
	}
	xo(e, t, n, r) {
		return cy(t) ? Y.resolve() : n.documentReadCount < this.yo ? (su() <= b.DEBUG && I("QueryEngine", "SDK will not create cache indexes for query:", yp(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.yo, "documents"), Y.resolve()) : (su() <= b.DEBUG && I("QueryEngine", "Query:", yp(t), "scans", n.documentReadCount, "local documents and returns", r, "documents as results."), n.documentReadCount > this.wo * r ? (su() <= b.DEBUG && I("QueryEngine", "The SDK decides to create cache indexes for query:", yp(t), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, mp(t))) : Y.resolve());
	}
	So(e, t) {
		if (cy(t)) return Y.resolve(null);
		let n = t;
		if (up(n)) return Y.resolve(null);
		let r = mp(n);
		return this.indexManager.getIndexType(e, r).next(((t) => t === 0 ? null : (n.limit !== null && t === 1 && (n = _p(n, null, "F"), r = mp(n)), this.indexManager.getDocumentsMatchingTarget(e, r).next(((t) => {
			let i = J(...t);
			return this.bo.getDocuments(e, i).next(((t) => this.indexManager.getMinOffset(e, r).next(((r) => {
				let a = this.Co(n, t);
				return this.Fo(n, a, i, r.readTime) ? this.So(e, _p(n, null, "F")) : this.Oo(e, a, n, r);
			}))));
		})))));
	}
	vo(e, t, n, r) {
		return (cy(t) ? function(e) {
			for (let t of e.stages) {
				if (t instanceof s_ || t instanceof c_) return !1;
				if (t instanceof o_) {
					if (t.condition instanceof Wg && t.condition._expr.name === "exists" && t.condition._expr.params[0] instanceof Lg && t.condition._expr.params[0].fieldName === wu) continue;
					return !1;
				}
			}
			return !0;
		}(t) : up(t)) || r.isEqual(K.min()) ? Y.resolve(null) : this.bo.getDocuments(e, n).next(((i) => {
			let a = this.Co(t, i);
			return this.Fo(t, a, n, r) ? Y.resolve(null) : (su() <= b.DEBUG && I("QueryEngine", "Re-using previous result from %s to execute query: %s", r.toString(), ly(t)), this.Oo(e, a, t, Zf(r, Xf)).next(((e) => e)));
		}));
	}
	Co(e, t) {
		let n, r;
		return cy(e) ? (n = new Su(Qy), r = (t) => Ay(e, t)) : (n = new Su(xp(e)), r = (t) => bp(e, t)), t.forEach(((e, t) => {
			r(t) && (n = n.add(t));
		})), n;
	}
	Fo(e, t, n, r) {
		if (cy(e)) return function(e) {
			return e.stages.some(((e) => e instanceof s_ || e instanceof c_));
		}(e);
		if (e.limit === null) return !1;
		if (n.size !== t.size) return !0;
		let i = e.limitType === "F" ? t.last() : t.first();
		return !!i && (i.hasPendingWrites || i.version.compareTo(r) > 0);
	}
	Do(e, t, n) {
		return su() <= b.DEBUG && I("QueryEngine", "Using full collection scan to execute query:", ly(t)), this.bo.getDocumentsMatchingQuery(e, t, $f.min(), n);
	}
	Oo(e, t, n, r) {
		return this.bo.getDocumentsMatchingQuery(e, n, r).next(((e) => (t.forEach(((t) => {
			e = e.insert(t.key, t);
		})), e)));
	}
}, tb = "LocalStore", nb = 3e8, rb = class {
	constructor(e, t, n, r) {
		this.persistence = e, this.Mo = t, this.serializer = r, this.No = new yu(B), this.Lo = new Dp(((e) => fy(e)), py), this.Bo = /* @__PURE__ */ new Map(), this.Uo = e.getRemoteDocumentCache(), this.A_ = e.getTargetCache(), this.d_ = e.getBundleCache(), this.ko(n);
	}
	ko(e) {
		this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new Ly(this.Uo, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.Uo.setIndexManager(this.indexManager), this.Mo.initialize(this.localDocuments, this.indexManager);
	}
	collectGarbage(e) {
		return this.persistence.runTransaction("Collect garbage", "readwrite-primary", ((t) => e.collect(t, this.No)));
	}
};
function ib(e, t, n, r) {
	return new rb(e, t, n, r);
}
async function ab(e, t) {
	let n = z(e);
	return await n.persistence.runTransaction("Handle user change", "readonly", ((e) => {
		let r;
		return n.mutationQueue.getAllMutationBatches(e).next(((i) => (r = i, n.ko(t), n.mutationQueue.getAllMutationBatches(e)))).next(((t) => {
			let i = [], a = [], o = J();
			for (let e of r) {
				i.push(e.batchId);
				for (let t of e.mutations) o = o.add(t.key);
			}
			for (let e of t) {
				a.push(e.batchId);
				for (let t of e.mutations) o = o.add(t.key);
			}
			return n.localDocuments.getDocuments(e, o).next(((e) => ({
				qo: e,
				removedBatchIds: i,
				addedBatchIds: a
			})));
		}));
	}));
}
function ob(e, t) {
	let n = z(e);
	return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", ((e) => {
		let r = t.batch.keys(), i = n.Uo.newChangeBuffer({ trackRemovals: !0 });
		return function(e, t, n, r) {
			let i = n.batch, a = i.keys(), o = Y.resolve();
			return a.forEach(((e) => {
				o = o.next((() => r.getEntry(t, e))).next(((t) => {
					let a = n.docVersions.get(e);
					R(a !== null, 48541), t.version.compareTo(a) < 0 && (i.applyToRemoteDocument(t, n), t.isValidDocument() && (t.setReadTime(n.commitVersion), r.addEntry(t)));
				}));
			})), o.next((() => e.mutationQueue.removeMutationBatch(t, i)));
		}(n, e, t, i).next((() => i.apply(e))).next((() => n.mutationQueue.performConsistencyCheck(e))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(e, r, t.batch.batchId))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e, function(e) {
			let t = J();
			for (let n = 0; n < e.mutationResults.length; ++n) e.mutationResults[n].transformResults.length > 0 && (t = t.add(e.batch.mutations[n].key));
			return t;
		}(t)))).next((() => n.localDocuments.getDocuments(e, r)));
	}));
}
function sb(e) {
	let t = z(e);
	return t.persistence.runTransaction("Get last remote snapshot version", "readonly", ((e) => t.A_.getLastRemoteSnapshotVersion(e)));
}
function cb(e, t) {
	let n = z(e), r = t.snapshotVersion, i = n.No;
	return n.persistence.runTransaction("Apply remote event", "readwrite-primary", ((e) => {
		let a = n.Uo.newChangeBuffer({ trackRemovals: !0 });
		i = n.No;
		let o = [];
		t.targetChanges.forEach(((a, s) => {
			let c = i.get(s);
			if (!c) return;
			o.push(n.A_.removeMatchingKeys(e, a.removedDocuments, s).next((() => n.A_.addMatchingKeys(e, a.addedDocuments, s))));
			let l = c.withSequenceNumber(e.currentSequenceNumber);
			t.targetMismatches.get(s) === null ? a.resumeToken.approximateByteSize() > 0 && (l = l.withResumeToken(a.resumeToken, r)) : l = l.withResumeToken(Ku.EMPTY_BYTE_STRING, K.min()).withLastLimboFreeSnapshotVersion(K.min()), i = i.insert(s, l), function(e, t, n) {
				return e.resumeToken.approximateByteSize() === 0 || t.snapshotVersion.toMicroseconds() - e.snapshotVersion.toMicroseconds() >= nb || n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0;
			}(c, l, a) && o.push(n.A_.updateTargetData(e, l));
		}));
		let s = kp(), c = J();
		if (t.documentUpdates.forEach(((r) => {
			t.resolvedLimboDocuments.has(r) && o.push(n.persistence.referenceDelegate.updateLimboDocument(e, r));
		})), o.push(lb(e, a, t.documentUpdates).next(((e) => {
			s = e.$o, c = e.Ko;
		}))), !r.isEqual(K.min())) {
			let t = n.A_.getLastRemoteSnapshotVersion(e).next(((t) => n.A_.setTargetsMetadata(e, e.currentSequenceNumber, r)));
			o.push(t);
		}
		return Y.waitFor(o).next((() => a.apply(e))).next((() => n.localDocuments.getLocalViewOfDocuments(e, s, c))).next((() => s));
	})).then(((e) => (n.No = i, e)));
}
function lb(e, t, n) {
	let r = J(), i = J();
	return n.forEach(((e) => r = r.add(e))), t.getEntries(e, r).next(((e) => {
		let r = kp();
		return n.forEach(((n, a) => {
			let o = e.get(n);
			a.isFoundDocument() !== o.isFoundDocument() && (i = i.add(n)), a.isNoDocument() && a.version.isEqual(K.min()) ? (t.removeEntry(n, a.readTime), r = r.insert(n, a)) : !o.isValidDocument() || a.version.compareTo(o.version) > 0 || a.version.compareTo(o.version) === 0 && o.hasPendingWrites ? (t.addEntry(a), r = r.insert(n, a)) : I(tb, "Ignoring outdated watch update for ", n, ". Current version:", o.version, " Watch version:", a.version);
		})), {
			$o: r,
			Ko: i
		};
	}));
}
function ub(e, t) {
	let n = z(e);
	return n.persistence.runTransaction("Get next mutation batch", "readonly", ((e) => (t === void 0 && (t = sd), n.mutationQueue.getNextMutationBatchAfterBatchId(e, t))));
}
function db(e, t) {
	let n = z(e);
	return n.persistence.runTransaction("Allocate target", "readwrite", ((e) => {
		let r;
		return n.A_.getTargetData(e, t).next(((i) => i ? (r = i, Y.resolve(r)) : n.A_.allocateTargetId(e).next(((i) => (r = new Sy(t, i, "TargetPurposeListen", e.currentSequenceNumber), n.A_.addTargetData(e, r).next((() => r)))))));
	})).then(((e) => {
		let r = n.No.get(e.targetId);
		return (r === null || e.snapshotVersion.compareTo(r.snapshotVersion) > 0) && (n.No = n.No.insert(e.targetId, e), n.Lo.set(t, e.targetId)), e;
	}));
}
async function fb(e, t, n) {
	let r = z(e), i = r.No.get(t), a = n ? "readwrite" : "readwrite-primary";
	try {
		n || await r.persistence.runTransaction("Release target", a, ((e) => r.persistence.referenceDelegate.removeTarget(e, i)));
	} catch (e) {
		if (!Rh(e)) throw e;
		I(tb, `Failed to update sequence numbers for target ${t}: ${e}`);
	}
	r.No = r.No.remove(t), r.Lo.delete(i.target);
}
function pb(e, t, n) {
	let r = z(e), i = K.min(), a = J();
	return r.persistence.runTransaction("Execute query", "readwrite", ((e) => function(e, t, n) {
		let r = z(e), i = r.Lo.get(n);
		return i === void 0 ? r.A_.getTargetData(t, n) : Y.resolve(r.No.get(i));
	}(r, e, cy(t) ? t : mp(t)).next(((t) => {
		if (t) return i = t.lastLimboFreeSnapshotVersion, r.A_.getMatchingKeysForTargetId(e, t.targetId).next(((e) => {
			a = e;
		}));
	})).next((() => r.Mo.getDocumentsMatchingQuery(e, t, n ? i : K.min(), n ? a : J()))).next(((e) => (mb(r, e), {
		documents: e,
		Qo: a
	})))));
}
function mb(e, t) {
	t.forEach(((t, n) => {
		let r = n.key.getCollectionGroup(), i = e.Bo.get(r) || K.min();
		n.readTime.compareTo(i) > 0 && e.Bo.set(r, n.readTime);
	}));
}
var hb = class {
	constructor(e, t) {
		this.asyncQueue = e, this.onlineStateHandler = t, this.state = "Unknown", this.Jo = 0, this.Yo = null, this.Zo = !0;
	}
	Xo() {
		this.Jo === 0 && (this.ea("Unknown"), this.Yo = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, (() => (this.Yo = null, this.ta("Backend didn't respond within 10 seconds."), this.ea("Offline"), Promise.resolve()))));
	}
	na(e) {
		this.state === "Online" ? this.ea("Unknown") : (this.Jo++, this.Jo >= 1 && (this.ra(), this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`), this.ea("Offline")));
	}
	set(e) {
		this.ra(), this.Jo = 0, e === "Online" && (this.Zo = !1), this.ea(e);
	}
	ea(e) {
		e !== this.state && (this.state = e, this.onlineStateHandler(e));
	}
	ta(e) {
		let t = `Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
		this.Zo ? (cu(t), this.Zo = !1) : I("OnlineStateTracker", t);
	}
	ra() {
		this.Yo !== null && (this.Yo.cancel(), this.Yo = null);
	}
}, gb = "RemoteStore", _b = class {
	constructor(e, t, n, r, i) {
		this.localStore = e, this.datastore = t, this.asyncQueue = n, this.remoteSyncer = {}, this.ia = [], this.sa = /* @__PURE__ */ new Map(), this._a = /* @__PURE__ */ new Map(), this.oa = /* @__PURE__ */ new Map(), this.aa = new Oy(1e3), this.ua = new Oy(1001), this.ca = /* @__PURE__ */ new Set(), this.la = [], this.Ea = i, this.Ea.Ke(((e) => {
			n.enqueueAndForget((async () => {
				Db(this) && (I(gb, "Restarting streams for network reachability change."), await async function(e) {
					let t = z(e);
					t.ca.add(4), await yb(t), t.ha.set("Unknown"), t.ca.delete(4), await vb(t);
				}(this));
			}));
		})), this.ha = new hb(n, r);
	}
};
async function vb(e) {
	if (Db(e)) for (let t of e.la) await t(!0);
}
async function yb(e) {
	for (let t of e.la) await t(!1);
}
function bb(e, t) {
	return e._a.get(t) || void 0;
}
function xb(e, t) {
	let n = z(e), r = bb(n, t.targetId);
	if (r !== void 0 && n.sa.has(r)) return;
	let i = function(e, t) {
		let n = bb(e, t);
		n !== void 0 && e.oa.delete(n);
		let r = function(e, t) {
			return t % 2 == 0 ? e.aa.next() : e.ua.next();
		}(e, t);
		return e._a.set(t, r), e.oa.set(r, t), r;
	}(n, t.targetId);
	I(gb, "remoteStoreListen mapping SDK target ID to remote", t.targetId, i);
	let a = new Sy(t.target, i, t.purpose, t.sequenceNumber, t.snapshotVersion, t.lastLimboFreeSnapshotVersion, t.resumeToken);
	n.sa.set(i, a), Eb(n) ? Tb(n) : Kb(n).Jt() && Cb(n, a);
}
function Sb(e, t) {
	let n = z(e), r = Kb(n), i = bb(n, t);
	I(gb, "remoteStoreUnlisten removing mapping of SDK target ID to remote", t, i), n.sa.delete(i), n._a.delete(t), n.oa.delete(i), r.Jt() && wb(n, i), n.sa.size === 0 && (r.Jt() ? r.Xt() : Db(n) && n.ha.set("Unknown"));
}
function Cb(e, t) {
	if (e.Ta.H(t.targetId), t.resumeToken.approximateByteSize() > 0 || t.snapshotVersion.compareTo(K.min()) > 0) {
		let n = e.oa.get(t.targetId);
		if (n === void 0) return void I(gb, "SDK target ID not found for remote ID: " + t.targetId);
		let r = e.remoteSyncer.getRemoteKeysForTarget(n).size;
		t = t.withExpectedCount(r);
	}
	Kb(e).Tn(t);
}
function wb(e, t) {
	e.Ta.H(t), Kb(e).Pn(t);
}
function Tb(e) {
	e.Ta = new em({
		getRemoteKeysForTarget: (t) => {
			let n = e.oa.get(t);
			return n === void 0 ? J() : e.remoteSyncer.getRemoteKeysForTarget(n);
		},
		ge: (t) => e.sa.get(t) || null,
		Ae: () => e.datastore.serializer.databaseId
	}), Kb(e).start(), e.ha.Xo();
}
function Eb(e) {
	return Db(e) && !Kb(e).Ht() && e.sa.size > 0;
}
function Db(e) {
	return z(e).ca.size === 0;
}
function Ob(e) {
	e.Ta = void 0;
}
async function kb(e) {
	e.ha.set("Online");
}
async function Ab(e) {
	e.sa.forEach(((t, n) => {
		Cb(e, t);
	}));
}
async function jb(e, t) {
	Ob(e), Eb(e) ? (e.ha.na(t), Tb(e)) : e.ha.set("Unknown");
}
async function Mb(e, t, n) {
	if (e.ha.set("Online"), t instanceof Zp && t.state === 2 && t.cause) try {
		await async function(e, t) {
			let n = t.cause;
			for (let r of t.targetIds) {
				if (e.sa.has(r)) {
					let t = e.oa.get(r);
					t !== void 0 && (await e.remoteSyncer.rejectListen(t, n), e._a.delete(t), e.oa.delete(r)), e.sa.delete(r);
				}
				e.Ta.removeTarget(r);
			}
		}(e, t);
	} catch (n) {
		I(gb, "Failed to remove targets %s: %s ", t.targetIds.join(","), n), await Nb(e, n);
	}
	else if (t instanceof Yp ? e.Ta.se(t) : t instanceof Xp ? e.Ta.Ee(t) : e.Ta.ae(t), !n.isEqual(K.min())) try {
		let t = await sb(e.localStore);
		n.compareTo(t) >= 0 && await function(e, t) {
			let n = e.Ta.de(t);
			n.targetChanges.forEach(((n, r) => {
				if (n.resumeToken.approximateByteSize() > 0) {
					let i = e.sa.get(r);
					i && e.sa.set(r, i.withResumeToken(n.resumeToken, t));
				}
			})), n.targetMismatches.forEach(((t, n) => {
				let r = e.sa.get(t);
				r && (e.sa.set(t, r.withResumeToken(Ku.EMPTY_BYTE_STRING, r.snapshotVersion)), wb(e, t), Cb(e, new Sy(r.target, t, n, r.sequenceNumber)));
			}));
			let r = function(e, t) {
				let n = /* @__PURE__ */ new Map();
				t.targetChanges.forEach(((t, r) => {
					let i = e.oa.get(r);
					i !== void 0 && n.set(i, t);
				}));
				let r = new yu(B);
				return t.targetMismatches.forEach(((t, n) => {
					let i = e.oa.get(t);
					i !== void 0 && (r = r.insert(i, n));
				})), new qp(t.snapshotVersion, n, r, t.documentUpdates, t.augmentedDocumentUpdates, t.resolvedLimboDocuments);
			}(e, n);
			return e.remoteSyncer.applyRemoteEvent(r);
		}(e, n);
	} catch (t) {
		I(gb, "Failed to raise snapshot:", t), await Nb(e, t);
	}
}
async function Nb(e, t, n) {
	if (!Rh(t)) throw t;
	e.ca.add(1), await yb(e), e.ha.set("Offline"), n ||= () => sb(e.localStore), e.asyncQueue.enqueueRetryable((async () => {
		I(gb, "Retrying IndexedDB access"), await n(), e.ca.delete(1), await vb(e);
	}));
}
function Pb(e, t) {
	return t().catch(((n) => Nb(e, n, t)));
}
async function Fb(e) {
	let t = z(e), n = qb(t), r = t.ia.length > 0 ? t.ia[t.ia.length - 1].batchId : sd;
	for (; Ib(t);) try {
		let e = await ub(t.localStore, r);
		if (e === null) {
			t.ia.length === 0 && n.Xt();
			break;
		}
		r = e.batchId, Lb(t, e);
	} catch (e) {
		await Nb(t, e);
	}
	Rb(t) && zb(t);
}
function Ib(e) {
	return Db(e) && e.ia.length < 10;
}
function Lb(e, t) {
	e.ia.push(t);
	let n = qb(e);
	n.Jt() && n.Rn && n.In(t.mutations);
}
function Rb(e) {
	return Db(e) && !qb(e).Ht() && e.ia.length > 0;
}
function zb(e) {
	qb(e).start();
}
async function Bb(e) {
	qb(e).dn();
}
async function Vb(e) {
	let t = qb(e);
	for (let n of e.ia) t.In(n.mutations);
}
async function Hb(e, t, n) {
	let r = e.ia.shift(), i = gy.from(r, t, n);
	await Pb(e, (() => e.remoteSyncer.applySuccessfulWrite(i))), await Fb(e);
}
async function Ub(e, t) {
	t && qb(e).Rn && await async function(e, t) {
		if (function(e) {
			return Tp(e) && e !== V.ABORTED;
		}(t.code)) {
			let n = e.ia.shift();
			qb(e).Zt(), await Pb(e, (() => e.remoteSyncer.rejectFailedWrite(n.batchId, t))), await Fb(e);
		}
	}(e, t), Rb(e) && zb(e);
}
async function Wb(e, t) {
	let n = z(e);
	n.asyncQueue.verifyOperationInProgress(), I(gb, "RemoteStore received new credentials");
	let r = Db(n);
	n.ca.add(3), await yb(n), r && n.ha.set("Unknown"), await n.remoteSyncer.handleCredentialChange(t), n.ca.delete(3), await vb(n);
}
async function Gb(e, t) {
	let n = z(e);
	t ? (n.ca.delete(2), await vb(n)) : t || (n.ca.add(2), await yb(n), n.ha.set("Unknown"));
}
function Kb(e) {
	return e.Pa || (e.Pa = function(e, t, n) {
		let r = z(e);
		return r.mn(), new Sh(t, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
	}(e.datastore, e.asyncQueue, {
		ut: kb.bind(null, e),
		lt: Ab.bind(null, e),
		ht: jb.bind(null, e),
		hn: Mb.bind(null, e)
	}), e.la.push((async (t) => {
		t ? (e.Pa.Zt(), Eb(e) ? Tb(e) : e.ha.set("Unknown")) : (await e.Pa.stop(), Ob(e));
	}))), e.Pa;
}
function qb(e) {
	return e.Ra || (e.Ra = function(e, t, n) {
		let r = z(e);
		return r.mn(), new Ch(t, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
	}(e.datastore, e.asyncQueue, {
		ut: () => Promise.resolve(),
		lt: Bb.bind(null, e),
		ht: Ub.bind(null, e),
		An: Vb.bind(null, e),
		Vn: Hb.bind(null, e)
	}), e.la.push((async (t) => {
		t ? (e.Ra.Zt(), await Fb(e)) : (await e.Ra.stop(), e.ia.length > 0 && (I(gb, `Stopping write stream with ${e.ia.length} pending writes`), e.ia = []));
	}))), e.Ra;
}
var Jb = class {
	constructor(e) {
		this.observer = e, this.muted = !1;
	}
	next(e) {
		this.muted || this.observer.next && this.Ia(this.observer.next, e);
	}
	error(e) {
		this.muted || (this.observer.error ? this.Ia(this.observer.error, e) : cu("Uncaught Error in snapshot listener:", e.toString()));
	}
	Aa() {
		this.muted = !0;
	}
	Ia(e, t) {
		setTimeout((() => {
			this.muted || e(t);
		}), 0);
	}
}, Yb = class e {
	constructor(e, t, n, r, i) {
		this.asyncQueue = e, this.timerId = t, this.targetTimeMs = n, this.op = r, this.removalCallback = i, this.deferred = new Xm(), this.then = this.deferred.promise.then.bind(this.deferred.promise), this.deferred.promise.catch(((e) => {}));
	}
	get promise() {
		return this.deferred.promise;
	}
	static createAndSchedule(t, n, r, i, a) {
		let o = Date.now() + r, s = new e(t, n, o, i, a);
		return s.start(r), s;
	}
	start(e) {
		this.timerHandle = setTimeout((() => this.handleDelayElapsed()), e);
	}
	skipDelay() {
		return this.handleDelayElapsed();
	}
	cancel(e) {
		this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new H(V.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
	}
	handleDelayElapsed() {
		this.asyncQueue.enqueueAndForget((() => this.timerHandle === null ? Promise.resolve() : (this.clearTimeout(), this.op().then(((e) => this.deferred.resolve(e))))));
	}
	clearTimeout() {
		this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
	}
};
function Xb(e, t) {
	if (cu("AsyncQueue", `${t}: ${e}`), Rh(e)) return new H(V.UNAVAILABLE, `${t}: ${e}`);
	throw e;
}
var Zb = class {
	constructor() {
		this.activeTargetIds = zp();
	}
	La(e) {
		this.activeTargetIds = this.activeTargetIds.add(e);
	}
	Ba(e) {
		this.activeTargetIds = this.activeTargetIds.delete(e);
	}
	Na() {
		let e = {
			activeTargetIds: this.activeTargetIds.toArray(),
			updateTimeMs: Date.now()
		};
		return JSON.stringify(e);
	}
}, Qb = class {
	constructor() {
		this.du = new Zb(), this.fu = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
	}
	addPendingMutation(e) {}
	updateMutationState(e, t, n) {}
	addLocalQueryTarget(e, t = !0) {
		return t && this.du.La(e), this.fu[e] || "not-current";
	}
	updateQueryState(e, t, n) {
		this.fu[e] = t;
	}
	removeLocalQueryTarget(e) {
		this.du.Ba(e);
	}
	isLocalQueryTarget(e) {
		return this.du.activeTargetIds.has(e);
	}
	clearQueryState(e) {
		delete this.fu[e];
	}
	getAllActiveQueryTargets() {
		return this.du.activeTargetIds;
	}
	isActiveQueryTarget(e) {
		return this.du.activeTargetIds.has(e);
	}
	start() {
		return this.du = new Zb(), Promise.resolve();
	}
	handleUserChange(e, t, n) {}
	setOnlineState(e) {}
	shutdown() {}
	writeSequenceNumber(e) {}
	notifyBundleLoaded(e) {}
};
function $b() {
	return typeof document < "u" ? document : null;
}
var ex = class e {
	static emptySet(t) {
		return new e(t.comparator);
	}
	constructor(e) {
		this.comparator = e ? (t, n) => e(t, n) || W.comparator(t.key, n.key) : (e, t) => W.comparator(e.key, t.key), this.keyedMap = jp(), this.sortedSet = new yu(this.comparator);
	}
	has(e) {
		return this.keyedMap.get(e) != null;
	}
	get(e) {
		return this.keyedMap.get(e);
	}
	first() {
		return this.sortedSet.minKey();
	}
	last() {
		return this.sortedSet.maxKey();
	}
	isEmpty() {
		return this.sortedSet.isEmpty();
	}
	indexOf(e) {
		let t = this.keyedMap.get(e);
		return t ? this.sortedSet.indexOf(t) : -1;
	}
	get size() {
		return this.sortedSet.size;
	}
	forEach(e) {
		this.sortedSet.inorderTraversal(((t, n) => (e(t), !1)));
	}
	add(e) {
		let t = this.delete(e.key);
		return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
	}
	delete(e) {
		let t = this.get(e);
		return t ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t)) : this;
	}
	isEqual(t) {
		if (!(t instanceof e) || this.size !== t.size) return !1;
		let n = this.sortedSet.getIterator(), r = t.sortedSet.getIterator();
		for (; n.hasNext();) {
			let e = n.getNext().key, t = r.getNext().key;
			if (!e.isEqual(t)) return !1;
		}
		return !0;
	}
	toString() {
		let e = [];
		return this.forEach(((t) => {
			e.push(t.toString());
		})), e.length === 0 ? "DocumentSet ()" : "DocumentSet (\n  " + e.join("  \n") + "\n)";
	}
	copy(t, n) {
		let r = new e();
		return r.comparator = this.comparator, r.keyedMap = t, r.sortedSet = n, r;
	}
}, tx = class {
	constructor() {
		this.mu = new yu(W.comparator);
	}
	track(e) {
		let t = e.doc.key, n = this.mu.get(t);
		n ? e.type !== 0 && n.type === 3 ? this.mu = this.mu.insert(t, e) : e.type === 3 && n.type !== 1 ? this.mu = this.mu.insert(t, {
			type: n.type,
			doc: e.doc
		}) : e.type === 2 && n.type === 2 ? this.mu = this.mu.insert(t, {
			type: 2,
			doc: e.doc
		}) : e.type === 2 && n.type === 0 ? this.mu = this.mu.insert(t, {
			type: 0,
			doc: e.doc
		}) : e.type === 1 && n.type === 0 ? this.mu = this.mu.remove(t) : e.type === 1 && n.type === 2 ? this.mu = this.mu.insert(t, {
			type: 1,
			doc: n.doc
		}) : e.type === 0 && n.type === 1 ? this.mu = this.mu.insert(t, {
			type: 2,
			doc: e.doc
		}) : L(63341, {
			ye: e,
			pu: n
		}) : this.mu = this.mu.insert(t, e);
	}
	gu() {
		let e = [];
		return this.mu.inorderTraversal(((t, n) => {
			e.push(n);
		})), e;
	}
}, nx = class e {
	constructor(e, t, n, r, i, a, o, s, c) {
		this.query = e, this.docs = t, this.oldDocs = n, this.docChanges = r, this.mutatedKeys = i, this.fromCache = a, this.syncStateChanged = o, this.excludesMetadataChanges = s, this.hasCachedResults = c;
	}
	static fromInitialDocuments(t, n, r, i, a) {
		let o = [];
		return n.forEach(((e) => {
			o.push({
				type: 0,
				doc: e
			});
		})), new e(t, n, ex.emptySet(n), o, r, i, !0, !1, a);
	}
	get hasPendingWrites() {
		return !this.mutatedKeys.isEmpty();
	}
	isEqual(e) {
		if (!(this.fromCache === e.fromCache && this.hasCachedResults === e.hasCachedResults && this.syncStateChanged === e.syncStateChanged && this.mutatedKeys.isEqual(e.mutatedKeys) && dy(this.query, e.query) && this.docs.isEqual(e.docs) && this.oldDocs.isEqual(e.oldDocs))) return !1;
		let t = this.docChanges, n = e.docChanges;
		if (t.length !== n.length) return !1;
		for (let e = 0; e < t.length; e++) if (t[e].type !== n[e].type || !t[e].doc.isEqual(n[e].doc)) return !1;
		return !0;
	}
}, rx = class {
	constructor() {
		this.yu = void 0, this.wu = [];
	}
	bu() {
		return this.wu.some(((e) => e.Su()));
	}
}, ix = class {
	constructor() {
		this.queries = ax(), this.onlineState = "Unknown", this.vu = /* @__PURE__ */ new Set();
	}
	terminate() {
		(function(e, t) {
			let n = z(e), r = n.queries;
			n.queries = ax(), r.forEach(((e, n) => {
				for (let e of n.wu) e.onError(t);
			}));
		})(this, new H(V.ABORTED, "Firestore shutting down"));
	}
};
function ax() {
	return new Dp(((e) => uy(e)), dy);
}
async function ox(e, t) {
	let n = z(e), r = 3, i = t.query, a = n.queries.get(i);
	a ? !a.bu() && t.Su() && (r = 2) : (a = new rx(), r = +!t.Su());
	try {
		switch (r) {
			case 0:
				a.yu = await n.onListen(i, !0);
				break;
			case 1:
				a.yu = await n.onListen(i, !1);
				break;
			case 2: await n.onFirstRemoteStoreListen(i);
		}
	} catch (e) {
		let n = Xb(e, `Initialization of query '${cy(t.query) ? oy(t.query) : yp(t.query)}' failed`);
		t.onError(n);
		return;
	}
	n.queries.set(i, a), a.wu.push(t), t.Du(n.onlineState), a.yu && t.xu(a.yu) && ux(n);
}
async function sx(e, t) {
	let n = z(e), r = t.query, i = 3, a = n.queries.get(r);
	if (a) {
		let e = a.wu.indexOf(t);
		e >= 0 && (a.wu.splice(e, 1), a.wu.length === 0 ? i = +!t.Su() : !a.bu() && t.Su() && (i = 2));
	}
	switch (i) {
		case 0: return n.queries.delete(r), n.onUnlisten(r, !0);
		case 1: return n.queries.delete(r), n.onUnlisten(r, !1);
		case 2: return n.onLastRemoteStoreUnlisten(r);
		default: return;
	}
}
function cx(e, t) {
	let n = z(e), r = !1;
	for (let e of t) {
		let t = e.query, i = n.queries.get(t);
		if (i) {
			for (let t of i.wu) t.xu(e) && (r = !0);
			i.yu = e;
		}
	}
	r && ux(n);
}
function lx(e, t, n) {
	let r = z(e), i = r.queries.get(t);
	if (i) for (let e of i.wu) e.onError(n);
	r.queries.delete(t);
}
function ux(e) {
	e.vu.forEach(((e) => {
		e.next();
	}));
}
var dx;
(function(e) {
	e.Default = "default", e.Cache = "cache";
})(dx ||= {});
var fx = class {
	constructor(e, t, n) {
		this.query = e, this.Cu = t, this.Fu = !1, this.Ou = null, this.onlineState = "Unknown", this.options = n || {};
	}
	xu(e) {
		if (!this.options.includeMetadataChanges) {
			let t = [];
			for (let n of e.docChanges) n.type !== 3 && t.push(n);
			e = new nx(e.query, e.docs, e.oldDocs, t, e.mutatedKeys, e.fromCache, e.syncStateChanged, !0, e.hasCachedResults);
		}
		let t = !1;
		return this.Fu ? this.Mu(e) && (this.Cu.next(e), t = !0) : this.Nu(e, this.onlineState) && (this.Lu(e), t = !0), this.Ou = e, t;
	}
	onError(e) {
		this.Cu.error(e);
	}
	Du(e) {
		this.onlineState = e;
		let t = !1;
		return this.Ou && !this.Fu && this.Nu(this.Ou, e) && (this.Lu(this.Ou), t = !0), t;
	}
	Nu(e, t) {
		if (!e.fromCache || !this.Su()) return !0;
		let n = t !== "Offline";
		return (!this.options.waitForSyncWhenOnline || !n) && (!e.docs.isEmpty() || e.hasCachedResults || t === "Offline");
	}
	Mu(e) {
		if (e.docChanges.length > 0) return !0;
		let t = this.Ou && this.Ou.hasPendingWrites !== e.hasPendingWrites;
		return !(!e.syncStateChanged && !t) && !0 === this.options.includeMetadataChanges;
	}
	Lu(e) {
		e = nx.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults), this.Fu = !0, this.Cu.next(e);
	}
	Su() {
		return this.options.source !== dx.Cache;
	}
}, px = class {
	constructor(e) {
		this.key = e;
	}
}, mx = class {
	constructor(e) {
		this.key = e;
	}
}, hx = class {
	constructor(e, t) {
		this.query = e, this.Gu = t, this.zu = null, this.hasCachedResults = !1, this.current = !1, this.ju = J(), this.mutatedKeys = J(), this.Hu = cy(e) ? Ny(e) : xp(e), this.Ju = new ex(this.Hu);
	}
	get Yu() {
		return this.Gu;
	}
	Zu(e, t) {
		let n = t ? t.Xu : new tx(), r = t ? t.Ju : this.Ju, i = t ? t.mutatedKeys : this.mutatedKeys, a = r, o = !1, [s, c] = this.ec(this.query, r);
		e.inorderTraversal(((e, t) => {
			let l = r.get(e), u = jy(this.query, t) ? t : null, d = !!l && this.mutatedKeys.has(l.key), f = !!u && (u.hasLocalMutations || this.mutatedKeys.has(u.key) && u.hasCommittedMutations), p = !1;
			l && u ? l.data.isEqual(u.data) ? d !== f && (n.track({
				type: 3,
				doc: u
			}), p = !0) : this.tc(l, u) || (n.track({
				type: 2,
				doc: u
			}), p = !0, (s && this.Hu(u, s) > 0 || c && this.Hu(u, c) < 0) && (o = !0)) : !l && u ? (n.track({
				type: 0,
				doc: u
			}), p = !0) : l && !u && (n.track({
				type: 1,
				doc: l
			}), p = !0, (s || c) && (o = !0)), p && (u ? (a = a.add(u), i = f ? i.add(e) : i.delete(e)) : (a = a.delete(e), i = i.delete(e)));
		}));
		let l = this.nc(this.query);
		if (l) {
			if (cy(this.query)) {
				let e = [];
				a.forEach(((t) => e.push(t)));
				let t = ky(this.query, e), r = new ex(Ny(this.query));
				for (let e of t) r = r.add(e);
				a.forEach(((e) => {
					r.has(e.key) || (i = i.delete(e.key), n.track({
						type: 1,
						doc: e
					}));
				})), a = r;
			} else {
				let e = this.rc(this.query);
				for (; a.size > l;) {
					let t = e === "F" ? a.last() : a.first();
					a = a.delete(t.key), i = i.delete(t.key), n.track({
						type: 1,
						doc: t
					});
				}
			}
		}
		return {
			Ju: a,
			Xu: n,
			Fo: o,
			mutatedKeys: i
		};
	}
	nc(e) {
		return cy(e) ? Py(e)?.limit : e.limit || void 0;
	}
	rc(e) {
		if (cy(e)) {
			let t = Py(e);
			return t && t.limit < 0 ? "L" : "F";
		}
		return e.limitType;
	}
	ec(e, t) {
		if (cy(e)) {
			let n = Py(e)?.limit;
			return [t.size === n ? t.last() : null, null];
		}
		return [e.limitType === "F" && t.size === this.nc(this.query) ? t.last() : null, e.limitType === "L" && t.size === this.nc(this.query) ? t.first() : null];
	}
	tc(e, t) {
		return e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations;
	}
	applyChanges(e, t, n, r) {
		let i = this.Ju;
		this.Ju = e.Ju, this.mutatedKeys = e.mutatedKeys;
		let a = e.Xu.gu();
		a.sort(((e, t) => function(e, t) {
			let n = (e) => {
				switch (e) {
					case 0: return 1;
					case 2:
					case 3: return 2;
					case 1: return 0;
					default: return L(20277, { ye: e });
				}
			};
			return n(e) - n(t);
		}(e.type, t.type) || this.Hu(e.doc, t.doc))), this.sc(n), r ??= !1;
		let o = t && !r ? this._c() : [], s = this.ju.size === 0 && this.current && !r ? 1 : 0, c = s !== this.zu;
		return this.zu = s, a.length !== 0 || c ? {
			snapshot: new nx(this.query, e.Ju, i, a, e.mutatedKeys, s === 0, c, !1, !!n && n.resumeToken.approximateByteSize() > 0),
			oc: o
		} : { oc: o };
	}
	Du(e) {
		return this.current && e === "Offline" ? (this.current = !1, this.applyChanges({
			Ju: this.Ju,
			Xu: new tx(),
			mutatedKeys: this.mutatedKeys,
			Fo: !1
		}, !1)) : { oc: [] };
	}
	ac(e) {
		return !this.Gu.has(e) && !!this.Ju.has(e) && !this.Ju.get(e).hasLocalMutations;
	}
	sc(e) {
		e && (e.addedDocuments.forEach(((e) => this.Gu = this.Gu.add(e))), e.modifiedDocuments.forEach(((e) => {})), e.removedDocuments.forEach(((e) => this.Gu = this.Gu.delete(e))), this.current = e.current);
	}
	_c() {
		if (!this.current) return [];
		let e = this.ju;
		this.ju = J(), this.Ju.forEach(((e) => {
			this.ac(e.key) && (this.ju = this.ju.add(e.key));
		}));
		let t = [];
		return e.forEach(((e) => {
			this.ju.has(e) || t.push(new mx(e));
		})), this.ju.forEach(((n) => {
			e.has(n) || t.push(new px(n));
		})), t;
	}
	uc(e) {
		this.Gu = e.Qo, this.ju = J();
		let t = this.Zu(e.documents);
		return this.applyChanges(t, !0);
	}
	cc() {
		return nx.fromInitialDocuments(this.query, this.Ju, this.mutatedKeys, this.zu === 0, this.hasCachedResults);
	}
}, gx = "SyncEngine", _x = class {
	constructor(e, t, n) {
		this.query = e, this.targetId = t, this.view = n;
	}
}, vx = class {
	constructor(e) {
		this.key = e, this.lc = !1;
	}
}, yx = class {
	constructor(e, t, n, r, i, a) {
		this.localStore = e, this.remoteStore = t, this.eventManager = n, this.sharedClientState = r, this.currentUser = i, this.maxConcurrentLimboResolutions = a, this.Ec = {}, this.hc = new Dp(((e) => uy(e)), dy), this.Tc = /* @__PURE__ */ new Map(), this.Pc = /* @__PURE__ */ new Set(), this.Rc = new yu(W.comparator), this.Ic = /* @__PURE__ */ new Map(), this.Ac = new Vy(), this.Vc = {}, this.dc = /* @__PURE__ */ new Map(), this.fc = Oy.ws(), this.onlineState = "Unknown", this.mc = void 0;
	}
	get isPrimaryClient() {
		return !0 === this.mc;
	}
};
async function bx(e, t, n = !0) {
	let r = Hx(e), i, a = r.hc.get(t);
	return a ? (r.sharedClientState.addLocalQueryTarget(a.targetId), i = a.view.cc()) : i = await Sx(r, t, n, !0), i;
}
async function xx(e, t) {
	await Sx(Hx(e), t, !0, !1);
}
async function Sx(e, t, n, r) {
	let i = await db(e.localStore, cy(t) ? t : mp(t)), a = i.targetId, o = e.sharedClientState.addLocalQueryTarget(a, n), s;
	return r && (s = await Cx(e, t, a, o === "current", i.resumeToken)), e.isPrimaryClient && n && xb(e.remoteStore, i), s;
}
async function Cx(e, t, n, r, i) {
	e.gc = (t, n, r) => async function(e, t, n, r) {
		let i = t.view.Zu(n);
		i.Fo && (i = await pb(e.localStore, t.query, !1).then((({ documents: e }) => t.view.Zu(e, i))));
		let a = r && r.targetChanges.get(t.targetId), o = r && r.targetMismatches.get(t.targetId) != null, s = t.view.applyChanges(i, e.isPrimaryClient, a, o);
		return Ix(e, t.targetId, s.oc), s.snapshot;
	}(e, t, n, r);
	let a = await pb(e.localStore, t, !0), o = new hx(t, a.Qo), s = o.Zu(a.documents), c = Jp.createSynthesizedTargetChangeForCurrentChange(n, r && e.onlineState !== "Offline", i), l = o.applyChanges(s, e.isPrimaryClient, c);
	Ix(e, n, l.oc);
	let u = new _x(t, n, o);
	return e.hc.set(t, u), e.Tc.has(n) ? e.Tc.get(n).push(t) : e.Tc.set(n, [t]), l.snapshot;
}
async function wx(e, t, n) {
	let r = z(e), i = r.hc.get(t), a = r.Tc.get(i.targetId);
	if (a.length > 1) return r.Tc.set(i.targetId, a.filter(((e) => !dy(e, t)))), void r.hc.delete(t);
	r.isPrimaryClient ? (r.sharedClientState.removeLocalQueryTarget(i.targetId), r.sharedClientState.isActiveQueryTarget(i.targetId) || await fb(r.localStore, i.targetId, !1).then((() => {
		r.sharedClientState.clearQueryState(i.targetId), n && Sb(r.remoteStore, i.targetId), Px(r, i.targetId);
	})).catch(Ih)) : (Px(r, i.targetId), await fb(r.localStore, i.targetId, !0));
}
async function Tx(e, t) {
	let n = z(e), r = n.hc.get(t), i = n.Tc.get(r.targetId);
	n.isPrimaryClient && i.length === 1 && (n.sharedClientState.removeLocalQueryTarget(r.targetId), Sb(n.remoteStore, r.targetId));
}
async function Ex(e, t, n) {
	let r = Ux(e);
	try {
		let e = await function(e, t) {
			let n = z(e), r = Wu.now(), i = t.reduce(((e, t) => e.add(t.key)), J()), a, o;
			return n.persistence.runTransaction("Locally write mutations", "readwrite", ((e) => {
				let s = kp(), c = J();
				return n.Uo.getEntries(e, i).next(((e) => {
					s = e, s.forEach(((e, t) => {
						t.isValidDocument() || (c = c.add(e));
					}));
				})).next((() => n.localDocuments.getOverlayedDocuments(e, s))).next(((i) => {
					a = i;
					let o = [];
					for (let e of t) {
						let t = vf(e, a.get(e.key).overlayedDocument);
						t != null && o.push(new xf(e.key, t, Hd(t.value.mapValue), ff.exists(!0)));
					}
					return n.mutationQueue.addMutationBatch(e, r, o, t);
				})).next(((t) => {
					o = t;
					let r = t.applyToLocalDocumentSet(a, c);
					return n.documentOverlayCache.saveOverlays(e, t.batchId, r);
				}));
			})).then((() => ({
				batchId: o.batchId,
				changes: Mp(a)
			})));
		}(r.localStore, t);
		r.sharedClientState.addPendingMutation(e.batchId), function(e, t, n) {
			let r = e.Vc[e.currentUser.toKey()];
			r ||= new yu(B), r = r.insert(t, n), e.Vc[e.currentUser.toKey()] = r;
		}(r, e.batchId, n), await zx(r, e.changes), await Fb(r.remoteStore);
	} catch (e) {
		let t = Xb(e, "Failed to persist write");
		n.reject(t);
	}
}
async function Dx(e, t) {
	let n = z(e);
	try {
		let e = await cb(n.localStore, t);
		t.targetChanges.forEach(((e, t) => {
			let r = n.Ic.get(t);
			r && (R(e.addedDocuments.size + e.modifiedDocuments.size + e.removedDocuments.size <= 1, 22616), e.addedDocuments.size > 0 ? r.lc = !0 : e.modifiedDocuments.size > 0 ? R(r.lc, 14607) : e.removedDocuments.size > 0 && (R(r.lc, 42227), r.lc = !1));
		})), await zx(n, e, t);
	} catch (e) {
		await Ih(e);
	}
}
function Ox(e, t, n) {
	let r = z(e);
	if (r.isPrimaryClient && n === 0 || !r.isPrimaryClient && n === 1) {
		let e = [];
		r.hc.forEach(((n, r) => {
			let i = r.view.Du(t);
			i.snapshot && e.push(i.snapshot);
		})), function(e, t) {
			let n = z(e);
			n.onlineState = t;
			let r = !1;
			n.queries.forEach(((e, n) => {
				for (let e of n.wu) e.Du(t) && (r = !0);
			})), r && ux(n);
		}(r.eventManager, t), e.length && r.Ec.hn(e), r.onlineState = t, r.isPrimaryClient && r.sharedClientState.setOnlineState(t);
	}
}
async function kx(e, t, n) {
	let r = z(e);
	r.sharedClientState.updateQueryState(t, "rejected", n);
	let i = r.Ic.get(t), a = i && i.key;
	if (a) {
		let e = new yu(W.comparator);
		e = e.insert(a, Yf.newNoDocument(a, K.min()));
		let n = J().add(a);
		await Dx(r, new qp(K.min(), /* @__PURE__ */ new Map(), new yu(B), e, kp(), n)), r.Rc = r.Rc.remove(a), r.Ic.delete(t), Rx(r);
	} else await fb(r.localStore, t, !1).then((() => Px(r, t, n))).catch(Ih);
}
async function Ax(e, t) {
	let n = z(e), r = t.batch.batchId;
	try {
		let e = await ob(n.localStore, t);
		Nx(n, r, null), Mx(n, r), n.sharedClientState.updateMutationState(r, "acknowledged"), await zx(n, e);
	} catch (e) {
		await Ih(e);
	}
}
async function jx(e, t, n) {
	let r = z(e);
	try {
		let e = await function(e, t) {
			let n = z(e);
			return n.persistence.runTransaction("Reject batch", "readwrite-primary", ((e) => {
				let r;
				return n.mutationQueue.lookupMutationBatch(e, t).next(((t) => (R(t !== null, 37113), r = t.keys(), n.mutationQueue.removeMutationBatch(e, t)))).next((() => n.mutationQueue.performConsistencyCheck(e))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(e, r, t))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e, r))).next((() => n.localDocuments.getDocuments(e, r)));
			}));
		}(r.localStore, t);
		Nx(r, t, n), Mx(r, t), r.sharedClientState.updateMutationState(t, "rejected", n), await zx(r, e);
	} catch (e) {
		await Ih(e);
	}
}
function Mx(e, t) {
	(e.dc.get(t) || []).forEach(((e) => {
		e.resolve();
	})), e.dc.delete(t);
}
function Nx(e, t, n) {
	let r = z(e), i = r.Vc[r.currentUser.toKey()];
	if (i) {
		let e = i.get(t);
		e && (n ? e.reject(n) : e.resolve(), i = i.remove(t)), r.Vc[r.currentUser.toKey()] = i;
	}
}
function Px(e, t, n = null) {
	e.sharedClientState.removeLocalQueryTarget(t);
	for (let r of e.Tc.get(t)) e.hc.delete(r), n && e.Ec.yc(r, n);
	e.Tc.delete(t), e.isPrimaryClient && e.Ac.Xs(t).forEach(((t) => {
		e.Ac.containsKey(t) || Fx(e, t);
	}));
}
function Fx(e, t) {
	e.Pc.delete(t.path.canonicalString());
	let n = e.Rc.get(t);
	n !== null && (Sb(e.remoteStore, n), e.Rc = e.Rc.remove(t), e.Ic.delete(n), Rx(e));
}
function Ix(e, t, n) {
	for (let r of n) r instanceof px ? (e.Ac.addReference(r.key, t), Lx(e, r)) : r instanceof mx ? (I(gx, "Document no longer in limbo: " + r.key), e.Ac.removeReference(r.key, t), e.Ac.containsKey(r.key) || Fx(e, r.key)) : L(19791, { wc: r });
}
function Lx(e, t) {
	let n = t.key, r = n.path.canonicalString();
	e.Rc.get(n) || e.Pc.has(r) || (I(gx, "New document in limbo: " + n), e.Pc.add(r), Rx(e));
}
function Rx(e) {
	for (; e.Pc.size > 0 && e.Rc.size < e.maxConcurrentLimboResolutions;) {
		let t = e.Pc.values().next().value;
		e.Pc.delete(t);
		let n = new W(U.fromString(t)), r = e.fc.next();
		e.Ic.set(r, new vx(n)), e.Rc = e.Rc.insert(n, r), xb(e.remoteStore, new Sy(mp(lp(n.path)), r, "TargetPurposeLimboResolution", Nh.yn));
	}
}
async function zx(e, t, n) {
	let r = z(e), i = [], a = [], o = [];
	r.hc.isEmpty() || (r.hc.forEach(((e, s) => {
		o.push(r.gc(s, t, n).then(((e) => {
			if ((e || n) && r.isPrimaryClient) {
				let t = e ? !e.fromCache : n?.targetChanges.get(s.targetId)?.current;
				r.sharedClientState.updateQueryState(s.targetId, t ? "current" : "not-current");
			}
			if (e) {
				i.push(e);
				let t = Zy.fo(s.targetId, e);
				a.push(t);
			}
		})));
	})), await Promise.all(o), r.Ec.hn(i), await async function(e, t) {
		let n = z(e);
		try {
			await n.persistence.runTransaction("notifyLocalViewChanges", "readwrite", ((e) => Y.forEach(t, ((t) => Y.forEach(t.Ao, ((r) => n.persistence.referenceDelegate.addReference(e, t.targetId, r))).next((() => Y.forEach(t.Vo, ((r) => n.persistence.referenceDelegate.removeReference(e, t.targetId, r)))))))));
		} catch (e) {
			if (!Rh(e)) throw e;
			I(tb, "Failed to update sequence numbers: " + e);
		}
		for (let e of t) {
			let t = e.targetId;
			if (!e.fromCache) {
				let e = n.No.get(t), r = e.snapshotVersion, i = e.withLastLimboFreeSnapshotVersion(r);
				n.No = n.No.insert(t, i);
			}
		}
	}(r.localStore, a));
}
async function Bx(e, t) {
	let n = z(e);
	if (!n.currentUser.isEqual(t)) {
		I(gx, "User change. New user:", t.toKey());
		let e = await ab(n.localStore, t);
		n.currentUser = t, function(e, t) {
			e.dc.forEach(((e) => {
				e.forEach(((e) => {
					e.reject(new H(V.CANCELLED, t));
				}));
			})), e.dc.clear();
		}(n, "'waitForPendingWrites' promise is rejected due to a user change."), n.sharedClientState.handleUserChange(t, e.removedBatchIds, e.addedBatchIds), await zx(n, e.qo);
	}
}
function Vx(e, t) {
	let n = z(e), r = n.Ic.get(t);
	if (r && r.lc) return J().add(r.key);
	{
		let e = J(), r = n.Tc.get(t);
		if (!r) return e;
		for (let t of r ?? []) {
			let r = n.hc.get(t);
			e = e.unionWith(r.view.Yu);
		}
		return e;
	}
}
function Hx(e) {
	let t = z(e);
	return t.remoteStore.remoteSyncer.applyRemoteEvent = Dx.bind(null, t), t.remoteStore.remoteSyncer.getRemoteKeysForTarget = Vx.bind(null, t), t.remoteStore.remoteSyncer.rejectListen = kx.bind(null, t), t.Ec.hn = cx.bind(null, t.eventManager), t.Ec.yc = lx.bind(null, t.eventManager), t;
}
function Ux(e) {
	let t = z(e);
	return t.remoteStore.remoteSyncer.applySuccessfulWrite = Ax.bind(null, t), t.remoteStore.remoteSyncer.rejectFailedWrite = jx.bind(null, t), t;
}
var Wx = class {
	constructor() {
		this.kind = "memory", this.synchronizeTabs = !1;
	}
	async initialize(e) {
		this.serializer = Um(e.databaseInfo.databaseId), this.sharedClientState = this.Sc(e), this.persistence = this.vc(e), await this.persistence.start(), this.localStore = this.Dc(e), this.gcScheduler = this.xc(e, this.localStore), this.indexBackfillerScheduler = this.Cc(e, this.localStore);
	}
	xc(e, t) {
		return null;
	}
	Cc(e, t) {
		return null;
	}
	Dc(e) {
		return ib(this.persistence, new eb(), e.initialUser, this.serializer);
	}
	vc(e) {
		return new qy(Yy.w_, this.serializer);
	}
	Sc(e) {
		return new Qb();
	}
	async terminate() {
		this.gcScheduler?.stop(), this.indexBackfillerScheduler?.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
	}
};
Wx.provider = { build: () => new Wx() };
var Gx = class extends Wx {
	constructor(e) {
		super(), this.cacheSizeBytes = e;
	}
	xc(e, t) {
		R(this.persistence.referenceDelegate instanceof Xy, 46915);
		let n = this.persistence.referenceDelegate.garbageCollector;
		return new Uh(n, e.asyncQueue, t);
	}
	vc(e) {
		let t = this.cacheSizeBytes === void 0 ? Mh.DEFAULT : Mh.withCacheSize(this.cacheSizeBytes);
		return new qy(((e) => Xy.w_(e, t)), this.serializer);
	}
}, Kx = class {
	async initialize(e, t) {
		this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(t, !e.synchronizeTabs), this.sharedClientState.onlineStateHandler = (e) => Ox(this.syncEngine, e, 1), this.remoteStore.remoteSyncer.handleCredentialChange = Bx.bind(null, this.syncEngine), await Gb(this.remoteStore, this.syncEngine.isPrimaryClient));
	}
	createEventManager(e) {
		return function() {
			return new ix();
		}();
	}
	createDatastore(e) {
		let t = Um(e.databaseInfo.databaseId), n = vh(e.databaseInfo);
		return Eh(e.authCredentials, e.appCheckCredentials, n, t);
	}
	createRemoteStore(e) {
		return function(e, t, n, r, i) {
			return new _b(e, t, n, r, i);
		}(this.localStore, this.datastore, e.asyncQueue, ((e) => Ox(this.syncEngine, e, 0)), function() {
			return ch.Je() ? new ch() : new oh();
		}());
	}
	createSyncEngine(e, t) {
		return function(e, t, n, r, i, a, o) {
			let s = new yx(e, t, n, r, i, a);
			return o && (s.mc = !0), s;
		}(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
	}
	async terminate() {
		await async function(e) {
			let t = z(e);
			I(gb, "RemoteStore shutting down."), t.ca.add(5), await yb(t), t.Ea.shutdown(), t.ha.set("Unknown");
		}(this.remoteStore), this.datastore?.terminate(), this.eventManager?.terminate();
	}
};
Kx.provider = { build: () => new Kx() };
var qx = "FirestoreClient", Jx = class {
	constructor(e, t, n, r, i) {
		this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = n, this._databaseInfo = r, this.user = Ym.UNAUTHENTICATED, this.clientId = pu.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this._uninitializedComponentsProvider = i, this.authCredentials.start(n, (async (e) => {
			I(qx, "Received user=", e.uid), await this.authCredentialListener(e), this.user = e;
		})), this.appCheckCredentials.start(n, ((e) => (I(qx, "Received new app check token=", e), this.appCheckCredentialListener(e, this.user))));
	}
	get configuration() {
		return {
			asyncQueue: this.asyncQueue,
			databaseInfo: this._databaseInfo,
			clientId: this.clientId,
			authCredentials: this.authCredentials,
			appCheckCredentials: this.appCheckCredentials,
			initialUser: this.user,
			maxConcurrentLimboResolutions: 100
		};
	}
	setCredentialChangeListener(e) {
		this.authCredentialListener = e;
	}
	setAppCheckTokenChangeListener(e) {
		this.appCheckCredentialListener = e;
	}
	terminate() {
		this.asyncQueue.enterRestrictedMode();
		let e = new Xm();
		return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
			try {
				this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
			} catch (t) {
				let n = Xb(t, "Failed to shutdown persistence");
				e.reject(n);
			}
		})), e.promise;
	}
};
async function Yx(e, t) {
	e.asyncQueue.verifyOperationInProgress(), I(qx, "Initializing OfflineComponentProvider");
	let n = e.configuration;
	await t.initialize(n);
	let r = n.initialUser;
	e.setCredentialChangeListener((async (e) => {
		r.isEqual(e) || (await ab(t.localStore, e), r = e);
	})), t.persistence.setDatabaseDeletedListener((() => e.terminate())), e._offlineComponents = t;
}
async function Xx(e, t) {
	e.asyncQueue.verifyOperationInProgress();
	let n = await Zx(e);
	I(qx, "Initializing OnlineComponentProvider"), await t.initialize(n, e.configuration), e.setCredentialChangeListener(((e) => Wb(t.remoteStore, e))), e.setAppCheckTokenChangeListener(((e, n) => Wb(t.remoteStore, n))), e._onlineComponents = t;
}
async function Zx(e) {
	if (!e._offlineComponents) {
		if (e._uninitializedComponentsProvider) {
			I(qx, "Using user provided OfflineComponentProvider");
			try {
				await Yx(e, e._uninitializedComponentsProvider._offline);
			} catch (t) {
				let n = t;
				if (!function(e) {
					return e.name === "FirebaseError" ? e.code === V.FAILED_PRECONDITION || e.code === V.UNIMPLEMENTED : !(typeof DOMException < "u" && e instanceof DOMException) || e.code === 22 || e.code === 20 || e.code === 11;
				}(n)) throw n;
				lu("Error using user provided cache. Falling back to memory cache: " + n), await Yx(e, new Wx());
			}
		} else I(qx, "Using default OfflineComponentProvider"), await Yx(e, new Gx(void 0));
	}
	return e._offlineComponents;
}
async function Qx(e) {
	return e._onlineComponents || (e._uninitializedComponentsProvider ? (I(qx, "Using user provided OnlineComponentProvider"), await Xx(e, e._uninitializedComponentsProvider._online)) : (I(qx, "Using default OnlineComponentProvider"), await Xx(e, new Kx()))), e._onlineComponents;
}
function $x(e) {
	return Qx(e).then(((e) => e.syncEngine));
}
async function eS(e) {
	let t = await Qx(e), n = t.eventManager;
	return n.onListen = bx.bind(null, t.syncEngine), n.onUnlisten = wx.bind(null, t.syncEngine), n.onFirstRemoteStoreListen = xx.bind(null, t.syncEngine), n.onLastRemoteStoreUnlisten = Tx.bind(null, t.syncEngine), n;
}
function tS(e, t, n = {}) {
	let r = new Xm();
	return e.asyncQueue.enqueueAndForget((async () => function(e, t, n, r, i) {
		let a = new Jb({
			next: (s) => {
				a.Aa(), t.enqueueAndForget((() => sx(e, o)));
				let c = s.docs.has(n);
				!c && s.fromCache ? i.reject(new H(V.UNAVAILABLE, "Failed to get document because the client is offline.")) : c && s.fromCache && r && r.source === "server" ? i.reject(new H(V.UNAVAILABLE, "Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to \"server\" to retrieve the cached document.)")) : i.resolve(s);
			},
			error: (e) => i.reject(e)
		}), o = new fx(lp(n.path), a, {
			includeMetadataChanges: !0,
			waitForSyncWhenOnline: !0
		});
		return ox(e, o);
	}(await eS(e), e.asyncQueue, t, n, r))), r.promise;
}
function nS(e, t, n = {}) {
	let r = new Xm();
	return e.asyncQueue.enqueueAndForget((async () => function(e, t, n, r, i) {
		let a = new Jb({
			next: (n) => {
				a.Aa(), t.enqueueAndForget((() => sx(e, o))), n.fromCache && r.source === "server" ? i.reject(new H(V.UNAVAILABLE, "Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to \"server\" to retrieve the cached documents.)")) : i.resolve(n);
			},
			error: (e) => i.reject(e)
		}), o = new fx(n instanceof p_ ? my(n) : n, a, {
			includeMetadataChanges: !0,
			waitForSyncWhenOnline: !0
		});
		return ox(e, o);
	}(await eS(e), e.asyncQueue, t, n, r))), r.promise;
}
function rS(e, t) {
	let n = new Xm();
	return e.asyncQueue.enqueueAndForget((async () => Ex(await $x(e), t, n))), n.promise;
}
var iS = class {
	constructor(e, t, n, r, i) {
		this._firestore = e, this._userDataWriter = t, this._key = n, this._document = r, this._converter = i;
	}
	get id() {
		return this._key.path.lastSegment();
	}
	get ref() {
		return new Qh(this._firestore, this._converter, this._key);
	}
	exists() {
		return this._document !== null;
	}
	data() {
		if (this._document) {
			if (this._converter) {
				let e = new aS(this._firestore, this._userDataWriter, this._key, this._document, null);
				return this._converter.fromFirestore(e);
			}
			return this._userDataWriter.convertValue(this._document.data.value);
		}
	}
	_fieldsProto() {
		return this._document?.data.clone().value.mapValue.fields ?? void 0;
	}
	get(e) {
		if (this._document) {
			let t = this._document.data.field(bg("DocumentSnapshot.get", e));
			if (t !== null) return this._userDataWriter.convertValue(t);
		}
	}
}, aS = class extends iS {
	data() {
		return super.data();
	}
}, oS = class {
	convertValue(e, t = "none") {
		switch (bd(e)) {
			case 0: return null;
			case 1: return e.booleanValue;
			case 2: return G(e.integerValue || e.doubleValue);
			case 3: return this.convertTimestamp(e.timestampValue);
			case 4: return this.convertServerTimestamp(e, t);
			case 5: return e.stringValue;
			case 6: return this.convertBytes(Yu(e.bytesValue));
			case 7: return this.convertReference(e.referenceValue);
			case 8: return this.convertGeoPoint(e.geoPointValue);
			case 9: return this.convertArray(e.arrayValue, t);
			case 11: return this.convertObject(e.mapValue, t);
			case 10: return this.convertVectorValue(e.mapValue);
			default: throw L(62114, { value: e });
		}
	}
	convertObject(e, t) {
		return this.convertObjectMap(e.fields, t);
	}
	convertObjectMap(e, t = "none") {
		let n = {};
		return Au(e, ((e, r) => {
			n[e] = this.convertValue(r, t);
		})), n;
	}
	convertVectorValue(e) {
		let t = e.fields?.[gd].arrayValue?.values?.map(((e) => G(e.doubleValue)));
		return new ng(t);
	}
	convertGeoPoint(e) {
		return new Jm(G(e.latitude), G(e.longitude));
	}
	convertArray(e, t) {
		return (e.values || []).map(((e) => this.convertValue(e, t)));
	}
	convertServerTimestamp(e, t) {
		switch (t) {
			case "previous":
				let n = td(e);
				return n == null ? null : this.convertValue(n, t);
			case "estimate": return this.convertTimestamp(nd(e));
			default: return null;
		}
	}
	convertTimestamp(e) {
		let t = Ju(e);
		return new Wu(t.seconds, t.nanos);
	}
	convertDocumentKey(e, t) {
		let n = U.fromString(e);
		R(zm(n), 9688, { name: e });
		let r = new ad(n.get(1), n.get(3)), i = new W(n.popFirst(5));
		return r.isEqual(t) || cu(`A document reference to ${i} refers to a different database (${r.projectId}/${r.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), i;
	}
};
function sS(e, t, n) {
	let r;
	return r = e ? n && (n.merge || n.mergeFields) ? e.toFirestore(t, n) : e.toFirestore(t) : t, r;
}
var cS = "AsyncQueue", lS = class {
	constructor(e = Promise.resolve()) {
		this.qc = [], this.$c = !1, this.Kc = [], this.Qc = null, this.Wc = !1, this.Gc = !1, this.zc = [], this.jt = new yh(this, "async_queue_retry"), this.jc = () => {
			let e = $b();
			e && I(cS, "Visibility state changed to " + e.visibilityState), this.jt.qt();
		}, this.Hc = e;
		let t = $b();
		t && typeof t.addEventListener == "function" && t.addEventListener("visibilitychange", this.jc);
	}
	get isShuttingDown() {
		return this.$c;
	}
	enqueueAndForget(e) {
		this.enqueue(e);
	}
	enqueueAndForgetEvenWhileRestricted(e) {
		this.Jc(), this.Yc(e);
	}
	enterRestrictedMode(e) {
		if (!this.$c) {
			this.$c = !0, this.Gc = e || !1;
			let t = $b();
			t && typeof t.removeEventListener == "function" && t.removeEventListener("visibilitychange", this.jc);
		}
	}
	enqueue(e) {
		if (this.Jc(), this.$c) return new Promise((() => {}));
		let t = new Xm();
		return this.Yc((() => this.$c && this.Gc ? Promise.resolve() : (e().then(t.resolve, t.reject), t.promise))).then((() => t.promise));
	}
	enqueueRetryable(e) {
		this.enqueueAndForget((() => (this.qc.push(e), this.Zc())));
	}
	async Zc() {
		if (this.qc.length !== 0) {
			try {
				await this.qc[0](), this.qc.shift(), this.jt.reset();
			} catch (e) {
				if (!Rh(e)) throw e;
				I(cS, "Operation failed with retryable error: " + e);
			}
			this.qc.length > 0 && this.jt.Ut((() => this.Zc()));
		}
	}
	Yc(e) {
		let t = this.Hc.then((() => (this.Wc = !0, e().catch(((e) => {
			throw this.Qc = e, this.Wc = !1, cu("INTERNAL UNHANDLED ERROR: ", uS(e)), e;
		})).then(((e) => (this.Wc = !1, e))))));
		return this.Hc = t, t;
	}
	enqueueAfterDelay(e, t, n) {
		this.Jc(), this.zc.indexOf(e) > -1 && (t = 0);
		let r = Yb.createAndSchedule(this, e, t, n, ((e) => this.Xc(e)));
		return this.Kc.push(r), r;
	}
	Jc() {
		this.Qc && L(47125, { el: uS(this.Qc) });
	}
	verifyOperationInProgress() {}
	async tl() {
		let e;
		do
			e = this.Hc, await e;
		while (e !== this.Hc);
	}
	nl(e) {
		for (let t of this.Kc) if (t.timerId === e) return !0;
		return !1;
	}
	rl(e) {
		return this.tl().then((() => {
			this.Kc.sort(((e, t) => e.targetTimeMs - t.targetTimeMs));
			for (let t of this.Kc) if (t.skipDelay(), e !== "all" && t.timerId === e) break;
			return this.tl();
		}));
	}
	il(e) {
		this.zc.push(e);
	}
	Xc(e) {
		let t = this.Kc.indexOf(e);
		this.Kc.splice(t, 1);
	}
};
function uS(e) {
	let t = e.message || "";
	return e.stack && (t = e.stack.includes(e.message) ? e.stack : e.message + "\n" + e.stack), t;
}
var dS = class extends Yh {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.type = "firestore", this._queue = new lS(), this._persistenceKey = r?.name || "[DEFAULT]";
	}
	async _terminate() {
		if (this._firestoreClient) {
			let e = this._firestoreClient.terminate();
			this._queue = new lS(e), this._firestoreClient = void 0, await e;
		}
	}
};
function fS(e, t) {
	let n = typeof e == "object" ? e : nn(), r = typeof e == "string" ? e : t || id, i = Xt(n, "firestore").getImmediate({ identifier: r });
	if (!i._initialized) {
		let e = m("firestore");
		e && Xh(i, ...e);
	}
	return i;
}
function pS(e) {
	if (e._terminated) throw new H(V.FAILED_PRECONDITION, "The client has already been terminated.");
	return e._firestoreClient || mS(e), e._firestoreClient;
}
function mS(e) {
	let t = e._freezeSettings(), n = kh(e._databaseId, e._app?.options.appId || "", e._persistenceKey, e._app?.options.apiKey, t);
	e._componentsProvider || t.localCache?._offlineComponentProvider && t.localCache?._onlineComponentProvider && (e._componentsProvider = {
		_offline: t.localCache._offlineComponentProvider,
		_online: t.localCache._onlineComponentProvider
	}), e._firestoreClient = new Jx(e._authCredentials, e._appCheckCredentials, e._queue, n, e._componentsProvider && function(e) {
		let t = e?._online.build();
		return {
			_offline: e?._offline.build(t),
			_online: t
		};
	}(e._componentsProvider));
}
var hS = class extends oS {
	constructor(e) {
		super(), this.firestore = e;
	}
	convertBytes(e) {
		return new Wm(e);
	}
	convertReference(e) {
		let t = this.convertDocumentKey(e, this.firestore._databaseId);
		return new Qh(this.firestore, null, t);
	}
}, gS = class {
	constructor(e, t) {
		this.hasPendingWrites = e, this.fromCache = t;
	}
	isEqual(e) {
		return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
	}
}, _S = class e extends iS {
	constructor(e, t, n, r, i, a) {
		super(e, t, n, r, a), this._firestore = e, this._firestoreImpl = e, this.metadata = i;
	}
	exists() {
		return super.exists();
	}
	data(e = {}) {
		if (this._document) {
			if (this._converter) {
				let t = new vS(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, null);
				return this._converter.fromFirestore(t, e);
			}
			return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
		}
	}
	get(e, t = {}) {
		if (this._document) {
			let n = this._document.data.field(bg("DocumentSnapshot.get", e));
			if (n !== null) return this._userDataWriter.convertValue(n, t.serverTimestamps);
		}
	}
	toJSON() {
		if (this.metadata.hasPendingWrites) throw new H(V.FAILED_PRECONDITION, "DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
		let t = this._document, n = {};
		return n.type = e._jsonSchemaVersion, n.bundle = "", n.bundleSource = "DocumentSnapshot", n.bundleName = this._key.toString(), !t || !t.isValidDocument() || !t.isFoundDocument() ? n : (this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields, "previous"), n.bundle = (this._firestore, this.ref.path, "NOT SUPPORTED"), n);
	}
};
_S._jsonSchemaVersion = "firestore/documentSnapshot/1.0", _S._jsonSchema = {
	type: Bu("string", _S._jsonSchemaVersion),
	bundleSource: Bu("string", "DocumentSnapshot"),
	bundleName: Bu("string"),
	bundle: Bu("string")
};
var vS = class extends _S {
	data(e = {}) {
		return super.data(e);
	}
}, yS = class e {
	constructor(e, t, n, r) {
		this._firestore = e, this._userDataWriter = t, this._snapshot = r, this.metadata = new gS(r.hasPendingWrites, r.fromCache), this.query = n;
	}
	get docs() {
		let e = [];
		return this.forEach(((t) => e.push(t))), e;
	}
	get size() {
		return this._snapshot.docs.size;
	}
	get empty() {
		return this.size === 0;
	}
	forEach(e, t) {
		this._snapshot.docs.forEach(((n) => {
			e.call(t, new vS(this._firestore, this._userDataWriter, n.key, n, new gS(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
		}));
	}
	docChanges(e = {}) {
		let t = !!e.includeMetadataChanges;
		if (t && this._snapshot.excludesMetadataChanges) throw new H(V.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
		return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === t || (this._cachedChanges = function(e, t) {
			if (e._snapshot.oldDocs.isEmpty()) {
				let t = 0;
				return e._snapshot.docChanges.map(((n) => {
					cy(e._snapshot.query) ? Ny(e._snapshot.query) : e.query._query;
					let r = new vS(e._firestore, e._userDataWriter, n.doc.key, n.doc, new gS(e._snapshot.mutatedKeys.has(n.doc.key), e._snapshot.fromCache), e.query.converter);
					return n.doc, {
						type: "added",
						doc: r,
						oldIndex: -1,
						newIndex: t++
					};
				}));
			}
			{
				let n = e._snapshot.oldDocs;
				return e._snapshot.docChanges.filter(((e) => t || e.type !== 3)).map(((t) => {
					let r = new vS(e._firestore, e._userDataWriter, t.doc.key, t.doc, new gS(e._snapshot.mutatedKeys.has(t.doc.key), e._snapshot.fromCache), e.query.converter), i = -1, a = -1;
					return t.type !== 0 && (i = n.indexOf(t.doc.key), n = n.delete(t.doc.key)), t.type !== 1 && (n = n.add(t.doc), a = n.indexOf(t.doc.key)), {
						type: bS(t.type),
						doc: r,
						oldIndex: i,
						newIndex: a
					};
				}));
			}
		}(this, t), this._cachedChangesIncludeMetadataChanges = t), this._cachedChanges;
	}
	toJSON() {
		if (this.metadata.hasPendingWrites) throw new H(V.FAILED_PRECONDITION, "QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
		let t = {};
		t.type = e._jsonSchemaVersion, t.bundleSource = "QuerySnapshot", t.bundleName = pu.newId(), this._firestore._databaseId.database, this._firestore._databaseId.projectId;
		let n = [], r = [], i = [];
		return this.docs.forEach(((e) => {
			e._document !== null && (n.push(e._document), r.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields, "previous")), i.push(e.ref.path));
		})), t.bundle = (this._firestore, this.query._query, t.bundleName, "NOT SUPPORTED"), t;
	}
};
function bS(e) {
	switch (e) {
		case 0: return "added";
		case 2:
		case 3: return "modified";
		case 1: return "removed";
		default: return L(61501, { type: e });
	}
}
yS._jsonSchemaVersion = "firestore/querySnapshot/1.0", yS._jsonSchema = {
	type: Bu("string", yS._jsonSchemaVersion),
	bundleSource: Bu("string", "QuerySnapshot"),
	bundleName: Bu("string"),
	bundle: Bu("string")
};
//#endregion
//#region node_modules/@firebase/firestore/dist/index.esm.js
function xS(e) {
	if (e.limitType === "L" && e.explicitOrderBy.length === 0) throw new H(V.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}
var SS = class {}, CS = class extends SS {};
function wS(e, t, ...n) {
	let r = [];
	t instanceof SS && r.push(t), r = r.concat(n), function(e) {
		let t = e.filter(((e) => e instanceof DS)).length, n = e.filter(((e) => e instanceof TS)).length;
		if (t > 1 || t > 0 && n > 0) throw new H(V.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
	}(r);
	for (let t of r) e = t._apply(e);
	return e;
}
var TS = class e extends CS {
	constructor(e, t, n) {
		super(), this._field = e, this._op = t, this._value = n, this.type = "where";
	}
	static _create(t, n, r) {
		return new e(t, n, r);
	}
	_apply(e) {
		let t = this._parse(e);
		return AS(e._query, t), new Zh(e.firestore, e.converter, gp(e._query, t));
	}
	_parse(e) {
		let t = lg(e.firestore);
		return function(e, t, n, r, i, a, o) {
			let s;
			if (i.isKeyField()) {
				if (a === "array-contains" || a === "array-contains-any") throw new H(V.INVALID_ARGUMENT, `Invalid Query. You can't perform '${a}' queries on documentId().`);
				if (a === "in" || a === "not-in") {
					kS(o, a);
					let t = [];
					for (let n of o) t.push(OS(r, e, n));
					s = { arrayValue: { values: t } };
				} else s = OS(r, e, o);
			} else a !== "in" && a !== "not-in" && a !== "array-contains-any" || kS(o, a), s = hg(n, t, o, a === "in" || a === "not-in");
			return jf.create(i, a, s);
		}(e._query, "where", t, e.firestore._databaseId, this._field, this._op, this._value);
	}
};
function ES(e, t, n) {
	let r = t, i = bg("where", e);
	return TS._create(i, r, n);
}
var DS = class e extends SS {
	constructor(e, t) {
		super(), this.type = e, this._queryConstraints = t;
	}
	static _create(t, n) {
		return new e(t, n);
	}
	_parse(e) {
		let t = this._queryConstraints.map(((t) => t._parse(e))).filter(((e) => e.getFilters().length > 0));
		return t.length === 1 ? t[0] : Mf.create(t, this._getOperator());
	}
	_apply(e) {
		let t = this._parse(e);
		return t.getFilters().length === 0 ? e : (function(e, t) {
			let n = e, r = t.getFlattenedFilters();
			for (let e of r) AS(n, e), n = gp(n, e);
		}(e._query, t), new Zh(e.firestore, e.converter, gp(e._query, t)));
	}
	_getQueryConstraints() {
		return this._queryConstraints;
	}
	_getOperator() {
		return this.type === "and" ? "and" : "or";
	}
};
function OS(e, t, n) {
	if (typeof (n = y(n)) == "string") {
		if (n === "") throw new H(V.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
		if (!fp(t) && n.indexOf("/") !== -1) throw new H(V.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);
		let r = t.path.child(U.fromString(n));
		if (!W.isDocumentKey(r)) throw new H(V.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);
		return kd(e, new W(r));
	}
	if (n instanceof Qh) return kd(e, n._key);
	throw new H(V.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Ru(n)}.`);
}
function kS(e, t) {
	if (!Array.isArray(e) || e.length === 0) throw new H(V.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${t.toString()}' filters.`);
}
function AS(e, t) {
	let n = function(e, t) {
		for (let n of e) for (let e of n.getFlattenedFilters()) if (t.indexOf(e.op) >= 0) return e.op;
		return null;
	}(e.filters, function(e) {
		switch (e) {
			case "!=": return ["!=", "not-in"];
			case "array-contains-any":
			case "in": return ["not-in"];
			case "not-in": return [
				"array-contains-any",
				"in",
				"not-in",
				"!="
			];
			default: return [];
		}
	}(t.op));
	if (n !== null) throw n === t.op ? new H(V.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${t.op.toString()}' filter.`) : new H(V.INVALID_ARGUMENT, `Invalid query. You cannot use '${t.op.toString()}' filters with '${n.toString()}' filters.`);
}
var jS = class {
	constructor(e, t) {
		this._firestore = e, this._commitHandler = t, this._mutations = [], this._committed = !1, this._dataReader = lg(e);
	}
	set(e, t, n) {
		this._verifyNotCommitted();
		let r = MS(e, this._firestore), i = sS(r.converter, t, n), a = ug(this._dataReader, "WriteBatch.set", r._key, i, r.converter !== null, n);
		return this._mutations.push(a.toMutation(r._key, ff.none())), this;
	}
	update(e, t, n, ...r) {
		this._verifyNotCommitted();
		let i = MS(e, this._firestore), a;
		return a = typeof (t = y(t)) == "string" || t instanceof Gm ? mg(this._dataReader, "WriteBatch.update", i._key, t, n, r) : pg(this._dataReader, "WriteBatch.update", i._key, t), this._mutations.push(a.toMutation(i._key, ff.exists(!0))), this;
	}
	delete(e) {
		this._verifyNotCommitted();
		let t = MS(e, this._firestore);
		return this._mutations = this._mutations.concat(new Tf(t._key, ff.none())), this;
	}
	commit() {
		return this._verifyNotCommitted(), this._committed = !0, this._mutations.length > 0 ? this._commitHandler(this._mutations) : Promise.resolve();
	}
	_verifyNotCommitted() {
		if (this._committed) throw new H(V.FAILED_PRECONDITION, "A write batch can no longer be used after commit() has been called.");
	}
};
function MS(e, t) {
	if ((e = y(e)).firestore !== t) throw new H(V.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
	return e;
}
function NS(e) {
	e = zu(e, Qh);
	let t = zu(e.firestore, dS);
	return tS(pS(t), e._key).then(((n) => BS(t, e, n)));
}
function PS(e) {
	e = zu(e, Zh);
	let t = zu(e.firestore, dS), n = pS(t), r = new hS(t);
	return xS(e._query), nS(n, e._query).then(((n) => new yS(t, r, e, n)));
}
function FS(e, t, n) {
	e = zu(e, Qh);
	let r = zu(e.firestore, dS), i = sS(e.converter, t, n);
	return zS(r, [ug(lg(r), "setDoc", e._key, i, e.converter !== null, n).toMutation(e._key, ff.none())]);
}
function IS(e, t, n, ...r) {
	e = zu(e, Qh);
	let i = zu(e.firestore, dS), a = lg(i), o;
	return o = typeof (t = y(t)) == "string" || t instanceof Gm ? mg(a, "updateDoc", e._key, t, n, r) : pg(a, "updateDoc", e._key, t), zS(i, [o.toMutation(e._key, ff.exists(!0))]);
}
function LS(e) {
	return zS(zu(e.firestore, dS), [new Tf(e._key, ff.none())]);
}
function RS(e, t) {
	let n = zu(e.firestore, dS), r = tg(e), i = sS(e.converter, t);
	return zS(n, [ug(lg(e.firestore), "addDoc", r._key, i, e.converter !== null, {}).toMutation(r._key, ff.exists(!1))]).then((() => r));
}
function zS(e, t) {
	return rS(pS(e), t);
}
function BS(e, t, n) {
	let r = n.docs.get(t._key);
	return new _S(e, new hS(e), t._key, r, new gS(n.hasPendingWrites, n.fromCache), t.converter);
}
function VS(e) {
	return e = zu(e, dS), pS(e), new jS(e, ((t) => zS(e, t)));
}
var HS = "@firebase/firestore", US = "4.17.1";
(function(e, t = !0) {
	au(en), Yt(new je("firestore", ((e, { instanceIdentifier: n, options: r }) => {
		let i = e.getProvider("app").getImmediate(), a = new dS(new eh(e.getProvider("auth-internal")), new ih(i, e.getProvider("app-check-internal")), od(i, n), i);
		return r = {
			useFetchStreams: t,
			...r
		}, a._setSettings(r), a;
	}), "PUBLIC").setMultipleInstances(!0)), rn(HS, US, e), rn(HS, US, "esm2020");
})();
//#endregion
export { qa as EmailAuthProvider, Za as GoogleAuthProvider, Ar as ReCaptchaEnterpriseProvider, Wu as Timestamp, RS as addDoc, eg as collection, LS as deleteDoc, vo as deleteUser, tg as doc, uc as getAuth, NS as getDoc, PS as getDocs, fS as getFirestore, tn as initializeApp, Nr as initializeAppCheck, fo as isSignInWithEmailLink, go as onAuthStateChanged, wS as query, co as reauthenticateWithCredential, os as reauthenticateWithPopup, uo as sendSignInLinkToEmail, Og as serverTimestamp, FS as setDoc, po as signInWithEmailLink, as as signInWithPopup, gs as signInWithRedirect, _o as signOut, IS as updateDoc, ES as where, VS as writeBatch };
