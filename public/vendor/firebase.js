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
}, p = (e) => f()?.emulatorHosts?.[e], m = () => f()?.config, ee = (e) => f()?.[`_${e}`], te = class {
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
function h() {
	return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function ne() {
	return typeof window < "u" && !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(h());
}
function re() {
	let e = f()?.forceEnvironment;
	if (e === "node") return !0;
	if (e === "browser") return !1;
	try {
		return Object.prototype.toString.call(global.process) === "[object process]";
	} catch {
		return !1;
	}
}
function ie() {
	return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function ae() {
	let e = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
	return typeof e == "object" && e.id !== void 0;
}
function oe() {
	return typeof navigator == "object" && navigator.product === "ReactNative";
}
function se() {
	let e = h();
	return e.indexOf("MSIE ") >= 0 || e.indexOf("Trident/") >= 0;
}
function ce() {
	return !re() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function le() {
	return !re() && !!navigator.userAgent && (navigator.userAgent.includes("Safari") || navigator.userAgent.includes("WebKit")) && !navigator.userAgent.includes("Chrome");
}
function ue() {
	try {
		return typeof indexedDB == "object";
	} catch {
		return !1;
	}
}
function de() {
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
var fe = "FirebaseError", pe = class e extends Error {
	constructor(t, n, r) {
		super(n), this.code = t, this.customData = r, this.name = fe, Object.setPrototypeOf(this, e.prototype), Error.captureStackTrace && Error.captureStackTrace(this, me.prototype.create);
	}
}, me = class {
	constructor(e, t, n) {
		this.service = e, this.serviceName = t, this.errors = n;
	}
	create(e, ...t) {
		let n = t[0] || {}, r = `${this.service}/${e}`, i = this.errors[e], a = i ? he(i, n) : "Error";
		return new pe(r, `${this.serviceName}: ${a} (${r}).`, n);
	}
};
function he(e, t) {
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
function ge(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
	return !0;
}
function _e(e, t) {
	if (e === t) return !0;
	let n = Object.keys(e), r = Object.keys(t);
	for (let i of n) {
		if (!r.includes(i)) return !1;
		let n = e[i], a = t[i];
		if (ve(n) && ve(a)) {
			if (!_e(n, a)) return !1;
		} else if (n !== a) return !1;
	}
	for (let e of r) if (!n.includes(e)) return !1;
	return !0;
}
function ve(e) {
	return typeof e == "object" && !!e;
}
function ye(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) Array.isArray(r) ? r.forEach((e) => {
		t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e));
	}) : t.push(encodeURIComponent(n) + "=" + encodeURIComponent(r));
	return t.length ? "&" + t.join("&") : "";
}
function be(e) {
	let t = {};
	return e.replace(/^\?/, "").split("&").forEach((e) => {
		if (e) {
			let [n, r] = e.split("=");
			t[decodeURIComponent(n)] = decodeURIComponent(r);
		}
	}), t;
}
function xe(e) {
	let t = e.indexOf("?");
	if (!t) return "";
	let n = e.indexOf("#", t);
	return e.substring(t, n > 0 ? n : void 0);
}
function Se(e, t) {
	let n = new Ce(e, t);
	return n.subscribe.bind(n);
}
var Ce = class {
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
		r = we(e, [
			"next",
			"error",
			"complete"
		]) ? e : {
			next: e,
			error: t,
			complete: n
		}, r.next === void 0 && (r.next = Te), r.error === void 0 && (r.error = Te), r.complete === void 0 && (r.complete = Te);
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
function we(e, t) {
	if (typeof e != "object" || !e) return !1;
	for (let n of t) if (n in e && typeof e[n] == "function") return !0;
	return !1;
}
function Te() {}
function g(e) {
	return e && e._delegate ? e._delegate : e;
}
function Ee(e) {
	try {
		return (e.startsWith("http://") || e.startsWith("https://") ? new URL(e).hostname : e).endsWith(".cloudworkstations.dev");
	} catch {
		return !1;
	}
}
async function De(e) {
	return (await fetch(e, { credentials: "include" })).ok;
}
//#endregion
//#region node_modules/@firebase/component/dist/esm/index.esm.js
var Oe = class {
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
}, ke = "[DEFAULT]", Ae = class {
	constructor(e, t) {
		this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
	}
	get(e) {
		let t = this.normalizeInstanceIdentifier(e);
		if (!this.instancesDeferred.has(t)) {
			let e = new te();
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
			if (Me(e)) try {
				this.getOrInitializeService({ instanceIdentifier: ke });
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
	clearInstance(e = ke) {
		this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
	}
	async delete() {
		let e = Array.from(this.instances.values());
		await Promise.all([...e.filter((e) => "INTERNAL" in e).map((e) => e.INTERNAL.delete()), ...e.filter((e) => "_delete" in e).map((e) => e._delete())]);
	}
	isComponentSet() {
		return this.component != null;
	}
	isInitialized(e = ke) {
		return this.instances.has(e);
	}
	getOptions(e = ke) {
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
			instanceIdentifier: je(e),
			options: t
		}), this.instances.set(e, n), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(n, e), this.component.onInstanceCreated)) try {
			this.component.onInstanceCreated(this.container, e, n);
		} catch {}
		return n || null;
	}
	normalizeInstanceIdentifier(e = ke) {
		return this.component ? this.component.multipleInstances ? e : ke : e;
	}
	shouldAutoInitialize() {
		return !!this.component && this.component.instantiationMode !== "EXPLICIT";
	}
};
function je(e) {
	return e === ke ? void 0 : e;
}
function Me(e) {
	return e.instantiationMode === "EAGER";
}
var Ne = class {
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
		let t = new Ae(e, this);
		return this.providers.set(e, t), t;
	}
	getProviders() {
		return Array.from(this.providers.values());
	}
}, Pe = [], _;
(function(e) {
	e[e.DEBUG = 0] = "DEBUG", e[e.VERBOSE = 1] = "VERBOSE", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.SILENT = 5] = "SILENT";
})(_ ||= {});
var Fe = {
	debug: _.DEBUG,
	verbose: _.VERBOSE,
	info: _.INFO,
	warn: _.WARN,
	error: _.ERROR,
	silent: _.SILENT
}, Ie = _.INFO, Le = {
	[_.DEBUG]: "log",
	[_.VERBOSE]: "log",
	[_.INFO]: "info",
	[_.WARN]: "warn",
	[_.ERROR]: "error"
}, Re = (e, t, ...n) => {
	if (t < e.logLevel) return;
	let r = (/* @__PURE__ */ new Date()).toISOString(), i = Le[t];
	if (i) console[i](`[${r}]  ${e.name}:`, ...n);
	else throw Error(`Attempted to log a message with an invalid logType (value: ${t})`);
}, ze = class {
	constructor(e) {
		this.name = e, this._logLevel = Ie, this._logHandler = Re, this._userLogHandler = null, Pe.push(this);
	}
	get logLevel() {
		return this._logLevel;
	}
	set logLevel(e) {
		if (!(e in _)) throw TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
		this._logLevel = e;
	}
	setLogLevel(e) {
		this._logLevel = typeof e == "string" ? Fe[e] : e;
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
		this._userLogHandler && this._userLogHandler(this, _.DEBUG, ...e), this._logHandler(this, _.DEBUG, ...e);
	}
	log(...e) {
		this._userLogHandler && this._userLogHandler(this, _.VERBOSE, ...e), this._logHandler(this, _.VERBOSE, ...e);
	}
	info(...e) {
		this._userLogHandler && this._userLogHandler(this, _.INFO, ...e), this._logHandler(this, _.INFO, ...e);
	}
	warn(...e) {
		this._userLogHandler && this._userLogHandler(this, _.WARN, ...e), this._logHandler(this, _.WARN, ...e);
	}
	error(...e) {
		this._userLogHandler && this._userLogHandler(this, _.ERROR, ...e), this._logHandler(this, _.ERROR, ...e);
	}
}, Be = (e, t) => t.some((t) => e instanceof t), Ve, He;
function Ue() {
	return Ve ||= [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	];
}
function We() {
	return He ||= [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	];
}
var Ge = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakMap(), Je = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap();
function Xe(e) {
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("success", i), e.removeEventListener("error", a);
		}, i = () => {
			t(nt(e.result)), r();
		}, a = () => {
			n(e.error), r();
		};
		e.addEventListener("success", i), e.addEventListener("error", a);
	});
	return t.then((t) => {
		t instanceof IDBCursor && Ge.set(t, e);
	}).catch(() => {}), Ye.set(t, e), t;
}
function Ze(e) {
	if (Ke.has(e)) return;
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
	Ke.set(e, t);
}
var Qe = {
	get(e, t, n) {
		if (e instanceof IDBTransaction) {
			if (t === "done") return Ke.get(e);
			if (t === "objectStoreNames") return e.objectStoreNames || qe.get(e);
			if (t === "store") return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
		}
		return nt(e[t]);
	},
	set(e, t, n) {
		return e[t] = n, !0;
	},
	has(e, t) {
		return e instanceof IDBTransaction && (t === "done" || t === "store") || t in e;
	}
};
function $e(e) {
	Qe = e(Qe);
}
function et(e) {
	return e === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(t, ...n) {
		let r = e.call(rt(this), t, ...n);
		return qe.set(r, t.sort ? t.sort() : [t]), nt(r);
	} : We().includes(e) ? function(...t) {
		return e.apply(rt(this), t), nt(Ge.get(this));
	} : function(...t) {
		return nt(e.apply(rt(this), t));
	};
}
function tt(e) {
	return typeof e == "function" ? et(e) : (e instanceof IDBTransaction && Ze(e), Be(e, Ue()) ? new Proxy(e, Qe) : e);
}
function nt(e) {
	if (e instanceof IDBRequest) return Xe(e);
	if (Je.has(e)) return Je.get(e);
	let t = tt(e);
	return t !== e && (Je.set(e, t), Ye.set(t, e)), t;
}
var rt = (e) => Ye.get(e);
//#endregion
//#region node_modules/idb/build/index.js
function it(e, t, { blocked: n, upgrade: r, blocking: i, terminated: a } = {}) {
	let o = indexedDB.open(e, t), s = nt(o);
	return r && o.addEventListener("upgradeneeded", (e) => {
		r(nt(o.result), e.oldVersion, e.newVersion, nt(o.transaction), e);
	}), n && o.addEventListener("blocked", (e) => n(e.oldVersion, e.newVersion, e)), s.then((e) => {
		a && e.addEventListener("close", () => a()), i && e.addEventListener("versionchange", (e) => i(e.oldVersion, e.newVersion, e));
	}).catch(() => {}), s;
}
var at = [
	"get",
	"getKey",
	"getAll",
	"getAllKeys",
	"count"
], ot = [
	"put",
	"add",
	"delete",
	"clear"
], st = /* @__PURE__ */ new Map();
function ct(e, t) {
	if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string")) return;
	if (st.get(t)) return st.get(t);
	let n = t.replace(/FromIndex$/, ""), r = t !== n, i = ot.includes(n);
	if (!(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || at.includes(n))) return;
	let a = async function(e, ...t) {
		let a = this.transaction(e, i ? "readwrite" : "readonly"), o = a.store;
		return r && (o = o.index(t.shift())), (await Promise.all([o[n](...t), i && a.done]))[0];
	};
	return st.set(t, a), a;
}
$e((e) => ({
	...e,
	get: (t, n, r) => ct(t, n) || e.get(t, n, r),
	has: (t, n) => !!ct(t, n) || e.has(t, n)
}));
//#endregion
//#region node_modules/@firebase/app/dist/esm/index.esm.js
var lt = class {
	constructor(e) {
		this.container = e;
	}
	getPlatformInfoString() {
		return this.container.getProviders().map((e) => {
			if (ut(e)) {
				let t = e.getImmediate();
				return `${t.library}/${t.version}`;
			}
			return null;
		}).filter((e) => e).join(" ");
	}
};
function ut(e) {
	return e.getComponent()?.type === "VERSION";
}
var dt = "@firebase/app", ft = "0.16.1", pt = new ze("@firebase/app"), mt = "@firebase/app-compat", ht = "@firebase/analytics-compat", gt = "@firebase/analytics", _t = "@firebase/app-check-compat", vt = "@firebase/app-check", yt = "@firebase/auth", bt = "@firebase/auth-compat", xt = "@firebase/database", St = "@firebase/data-connect", Ct = "@firebase/database-compat", wt = "@firebase/functions", Tt = "@firebase/functions-compat", Et = "@firebase/installations", Dt = "@firebase/installations-compat", Ot = "@firebase/messaging", kt = "@firebase/messaging-compat", At = "@firebase/performance", jt = "@firebase/performance-compat", Mt = "@firebase/remote-config", Nt = "@firebase/remote-config-compat", Pt = "@firebase/storage", Ft = "@firebase/storage-compat", It = "@firebase/firestore", Lt = "@firebase/ai", Rt = "@firebase/firestore-compat", zt = "firebase", Bt = "12.18.0", Vt = "[DEFAULT]", Ht = {
	[dt]: "fire-core",
	[mt]: "fire-core-compat",
	[gt]: "fire-analytics",
	[ht]: "fire-analytics-compat",
	[vt]: "fire-app-check",
	[_t]: "fire-app-check-compat",
	[yt]: "fire-auth",
	[bt]: "fire-auth-compat",
	[xt]: "fire-rtdb",
	[St]: "fire-data-connect",
	[Ct]: "fire-rtdb-compat",
	[wt]: "fire-fn",
	[Tt]: "fire-fn-compat",
	[Et]: "fire-iid",
	[Dt]: "fire-iid-compat",
	[Ot]: "fire-fcm",
	[kt]: "fire-fcm-compat",
	[At]: "fire-perf",
	[jt]: "fire-perf-compat",
	[Mt]: "fire-rc",
	[Nt]: "fire-rc-compat",
	[Pt]: "fire-gcs",
	[Ft]: "fire-gcs-compat",
	[It]: "fire-fst",
	[Rt]: "fire-fst-compat",
	[Lt]: "fire-vertex",
	"fire-js": "fire-js",
	[zt]: "fire-js-all"
}, Ut = /* @__PURE__ */ new Map(), Wt = /* @__PURE__ */ new Map(), Gt = /* @__PURE__ */ new Map();
function Kt(e, t) {
	try {
		e.container.addComponent(t);
	} catch (n) {
		pt.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`, n);
	}
}
function qt(e) {
	let t = e.name;
	if (Gt.has(t)) return pt.debug(`There were multiple attempts to register component ${t}.`), !1;
	Gt.set(t, e);
	for (let t of Ut.values()) Kt(t, e);
	for (let t of Wt.values()) Kt(t, e);
	return !0;
}
function Jt(e, t) {
	let n = e.container.getProvider("heartbeat").getImmediate({ optional: !0 });
	return n && n.triggerHeartbeat(), e.container.getProvider(t);
}
function Yt(e) {
	return e != null && e.settings !== void 0;
}
var Xt = new me("app", "Firebase", {
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
}), v = class {
	constructor(e, t, n) {
		this._isDeleted = !1, this._options = { ...e }, this._config = { ...t }, this._name = t.name, this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled, this._container = n, this.container.addComponent(new Oe("app", () => this, "PUBLIC"));
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
		if (this.isDeleted) throw Xt.create("app-deleted", { appName: this._name });
	}
}, Zt = Bt;
function Qt(e, t = {}) {
	let n = e;
	typeof t != "object" && (t = { name: t });
	let r = {
		name: Vt,
		automaticDataCollectionEnabled: !0,
		...t
	}, i = r.name;
	if (typeof i != "string" || !i) throw Xt.create("bad-app-name", { appName: String(i) });
	if (n ||= m(), !n) throw Xt.create("no-options");
	let a = Ut.get(i);
	if (a) {
		if (!_e(n, a.options)) throw Xt.create("duplicate-app", {
			appName: i,
			mismatchedParam: "options",
			oldValue: JSON.stringify(a.options),
			newValue: JSON.stringify(n)
		});
		if (_e(r, a.config)) return a;
		throw Xt.create("duplicate-app", {
			appName: i,
			mismatchedParam: "config",
			oldValue: JSON.stringify(a.config),
			newValue: JSON.stringify(r)
		});
	}
	let o = new Ne(i);
	for (let e of Gt.values()) o.addComponent(e);
	let s = new v(n, r, o);
	return Ut.set(i, s), s;
}
function $t(e = Vt) {
	let t = Ut.get(e);
	if (!t && e === "[DEFAULT]" && m()) return Qt();
	if (!t) throw Xt.create("no-app", { appName: e });
	return t;
}
function en(e, t, n) {
	let r = Ht[e] ?? e;
	n && (r += `-${n}`);
	let i = r.match(/\s|\//), a = t.match(/\s|\//);
	if (i || a) {
		let e = [`Unable to register library "${r}" with version "${t}":`];
		i && e.push(`library name "${r}" contains illegal characters (whitespace or "/")`), i && a && e.push("and"), a && e.push(`version name "${t}" contains illegal characters (whitespace or "/")`), pt.warn(e.join(" "));
		return;
	}
	qt(new Oe(`${r}-version`, () => ({
		library: r,
		version: t
	}), "VERSION"));
}
var tn = "firebase-heartbeat-database", nn = 1, rn = "firebase-heartbeat-store", an = null;
function on() {
	return an ||= it(tn, nn, { upgrade: (e, t) => {
		if (t === 0) try {
			e.createObjectStore(rn);
		} catch (e) {
			console.warn(e);
		}
	} }).catch((e) => {
		throw Xt.create("idb-open", { originalErrorMessage: e.message });
	}), an;
}
async function sn(e) {
	try {
		let t = (await on()).transaction(rn), n = await t.objectStore(rn).get(ln(e));
		return await t.done, n;
	} catch (e) {
		if (e instanceof pe) pt.warn(e.message);
		else {
			let t = Xt.create("idb-get", { originalErrorMessage: e?.message });
			pt.warn(t.message);
		}
	}
}
async function cn(e, t) {
	try {
		let n = (await on()).transaction(rn, "readwrite");
		await n.objectStore(rn).put(t, ln(e)), await n.done;
	} catch (e) {
		if (e instanceof pe) pt.warn(e.message);
		else {
			let t = Xt.create("idb-set", { originalErrorMessage: e?.message });
			pt.warn(t.message);
		}
	}
}
function ln(e) {
	return `${e.name}!${e.options.appId}`;
}
var un = 1024, dn = 30, fn = class {
	constructor(e) {
		this.container = e, this._heartbeatsCache = null;
		let t = this.container.getProvider("app").getImmediate();
		this._storage = new hn(t), this._heartbeatsCachePromise = this._storage.read().then((e) => (this._heartbeatsCache = e, e));
	}
	async triggerHeartbeat() {
		try {
			let e = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), t = pn();
			if (this._heartbeatsCache?.heartbeats == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null) || this._heartbeatsCache.lastSentHeartbeatDate === t || this._heartbeatsCache.heartbeats.some((e) => e.date === t)) return;
			if (this._heartbeatsCache.heartbeats.push({
				date: t,
				agent: e
			}), this._heartbeatsCache.heartbeats.length > dn) {
				let e = _n(this._heartbeatsCache.heartbeats);
				this._heartbeatsCache.heartbeats.splice(e, 1);
			}
			return this._storage.overwrite(this._heartbeatsCache);
		} catch (e) {
			pt.warn(e);
		}
	}
	async getHeartbeatsHeader() {
		try {
			if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) return "";
			let e = pn(), { heartbeatsToSend: t, unsentEntries: n } = mn(this._heartbeatsCache.heartbeats), r = o(JSON.stringify({
				version: 2,
				heartbeats: t
			}));
			return this._heartbeatsCache.lastSentHeartbeatDate = e, n.length > 0 ? (this._heartbeatsCache.heartbeats = n, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), r;
		} catch (e) {
			return pt.warn(e), "";
		}
	}
};
function pn() {
	return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function mn(e, t = un) {
	let n = [], r = e.slice();
	for (let i of e) {
		let e = n.find((e) => e.agent === i.agent);
		if (!e) {
			if (n.push({
				agent: i.agent,
				dates: [i.date]
			}), gn(n) > t) {
				n.pop();
				break;
			}
		} else if (e.dates.push(i.date), gn(n) > t) {
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
var hn = class {
	constructor(e) {
		this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
	}
	async runIndexedDBEnvironmentCheck() {
		return ue() ? de().then(() => !0).catch(() => !1) : !1;
	}
	async read() {
		if (await this._canUseIndexedDBPromise) {
			let e = await sn(this.app);
			return e?.heartbeats ? e : { heartbeats: [] };
		}
		return { heartbeats: [] };
	}
	async overwrite(e) {
		if (await this._canUseIndexedDBPromise) {
			let t = await this.read();
			return cn(this.app, {
				lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
				heartbeats: e.heartbeats
			});
		}
	}
	async add(e) {
		if (await this._canUseIndexedDBPromise) {
			let t = await this.read();
			return cn(this.app, {
				lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
				heartbeats: [...t.heartbeats, ...e.heartbeats]
			});
		}
	}
};
function gn(e) {
	return o(JSON.stringify({
		version: 2,
		heartbeats: e
	})).length;
}
function _n(e) {
	if (e.length === 0) return -1;
	let t = 0, n = e[0].date;
	for (let r = 1; r < e.length; r++) e[r].date < n && (n = e[r].date, t = r);
	return t;
}
function vn(e) {
	qt(new Oe("platform-logger", (e) => new lt(e), "PRIVATE")), qt(new Oe("heartbeat", (e) => new fn(e), "PRIVATE")), en(dt, ft, e), en(dt, ft, "esm2020"), en("fire-js", "");
}
//#endregion
//#region node_modules/firebase/app/dist/esm/index.esm.js
vn(""), en("firebase", "12.18.0", "app");
//#endregion
//#region node_modules/@firebase/auth/dist/esm/index-CvXU3_1x.js
function yn() {
	return { "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK." };
}
var bn = yn, xn = new me("auth", "Firebase", yn()), Sn = new ze("@firebase/auth");
function Cn(e, ...t) {
	Sn.logLevel <= _.WARN && Sn.warn(`Auth (${Zt}): ${e}`, ...t);
}
function wn(e, ...t) {
	Sn.logLevel <= _.ERROR && Sn.error(`Auth (${Zt}): ${e}`, ...t);
}
function Tn(e, ...t) {
	throw kn(e, ...t);
}
function En(e, ...t) {
	return kn(e, ...t);
}
function y(e, t, n) {
	return new me("auth", "Firebase", {
		...bn(),
		[t]: n
	}).create(t, { appName: e.name });
}
function Dn(e) {
	return y(e, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function On(e, t, n) {
	let r = n;
	if (!(t instanceof r)) throw r.name !== t.constructor.name && Tn(e, "argument-error"), y(e, "argument-error", `Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`);
}
function kn(e, ...t) {
	if (typeof e != "string") {
		let n = t[0], r = [...t.slice(1)];
		return r[0] && (r[0].appName = e.name), e._errorFactory.create(n, ...r);
	}
	return xn.create(e, ...t);
}
function b(e, t, ...n) {
	if (!e) throw kn(t, ...n);
}
function An(e) {
	let t = "INTERNAL ASSERTION FAILED: " + e;
	throw wn(t), Error(t);
}
function jn(e, t) {
	e || An(t);
}
function Mn() {
	return typeof self < "u" && self.location?.href || "";
}
function Nn() {
	return Pn() === "http:" || Pn() === "https:";
}
function Pn() {
	return typeof self < "u" && self.location?.protocol || null;
}
function Fn() {
	return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && (Nn() || ae() || "connection" in navigator) ? navigator.onLine : !0;
}
function In() {
	if (typeof navigator > "u") return null;
	let e = navigator;
	return e.languages && e.languages[0] || e.language || null;
}
var Ln = class {
	constructor(e, t) {
		this.shortDelay = e, this.longDelay = t, jn(t > e, "Short delay should be less than long delay!"), this.isMobile = ne() || oe();
	}
	get() {
		return Fn() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
	}
};
function Rn(e, t) {
	jn(e.emulator, "Emulator should always be set here");
	let { url: n } = e.emulator;
	return t ? `${n}${t.startsWith("/") ? t.slice(1) : t}` : n;
}
var zn = class {
	static initialize(e, t, n) {
		this.fetchImpl = e, t && (this.headersImpl = t), n && (this.responseImpl = n);
	}
	static fetch() {
		if (this.fetchImpl) return this.fetchImpl;
		if (typeof self < "u" && "fetch" in self) return self.fetch;
		if (typeof globalThis < "u" && globalThis.fetch) return globalThis.fetch;
		if (typeof fetch < "u") return fetch;
		An("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
	static headers() {
		if (this.headersImpl) return this.headersImpl;
		if (typeof self < "u" && "Headers" in self) return self.Headers;
		if (typeof globalThis < "u" && globalThis.Headers) return globalThis.Headers;
		if (typeof Headers < "u") return Headers;
		An("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
	static response() {
		if (this.responseImpl) return this.responseImpl;
		if (typeof self < "u" && "Response" in self) return self.Response;
		if (typeof globalThis < "u" && globalThis.Response) return globalThis.Response;
		if (typeof Response < "u") return Response;
		An("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
	}
}, Bn = {
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
}, Vn = [
	"/v1/accounts:signInWithCustomToken",
	"/v1/accounts:signInWithEmailLink",
	"/v1/accounts:signInWithIdp",
	"/v1/accounts:signInWithPassword",
	"/v1/accounts:signInWithPhoneNumber",
	"/v1/token"
], Hn = new Ln(3e4, 6e4);
function Un(e, t) {
	return e.tenantId && !t.tenantId ? {
		...t,
		tenantId: e.tenantId
	} : t;
}
async function Wn(e, t, n, r, i = {}) {
	return Gn(e, i, async () => {
		let i = {}, a = {};
		r && (t === "GET" ? a = r : i = { body: JSON.stringify(r) });
		let o = ye({
			...a,
			key: e.config.apiKey
		}).slice(1), s = await e._getAdditionalHeaders();
		s["Content-Type"] = "application/json", e.languageCode && (s["X-Firebase-Locale"] = e.languageCode);
		let c = {
			method: t,
			headers: s,
			...i
		};
		return ie() || (c.referrerPolicy = "strict-origin-when-cross-origin"), e.emulatorConfig && Ee(e.emulatorConfig.host) && (c.credentials = "include"), zn.fetch()(await qn(e, e.config.apiHost, n, o), c);
	});
}
async function Gn(e, t, n) {
	e._canInitEmulator = !1;
	let r = {
		...Bn,
		...t
	};
	try {
		let t = new Yn(e), i = await Promise.race([n(), t.promise]);
		t.clearNetworkTimeout();
		let a = await i.json();
		if ("needConfirmation" in a) throw Xn(e, "account-exists-with-different-credential", a);
		if (i.ok && !("errorMessage" in a)) return a;
		{
			let [t, n] = (i.ok ? a.errorMessage : a.error.message).split(" : ");
			if (t === "FEDERATED_USER_ID_ALREADY_LINKED") throw Xn(e, "credential-already-in-use", a);
			if (t === "EMAIL_EXISTS") throw Xn(e, "email-already-in-use", a);
			if (t === "USER_DISABLED") throw Xn(e, "user-disabled", a);
			let o = r[t] || t.toLowerCase().replace(/[_\s]+/g, "-");
			if (n) throw y(e, o, n);
			Tn(e, o);
		}
	} catch (t) {
		if (t instanceof pe) throw t;
		Tn(e, "network-request-failed", { message: String(t) });
	}
}
async function Kn(e, t, n, r, i = {}) {
	let a = await Wn(e, t, n, r, i);
	return "mfaPendingCredential" in a && Tn(e, "multi-factor-auth-required", { _serverResponse: a }), a;
}
async function qn(e, t, n, r) {
	let i = `${t}${n}?${r}`, a = e, o = a.config.emulator ? Rn(e.config, i) : `${e.config.apiScheme}://${i}`;
	return Vn.includes(n) && (await a._persistenceManagerAvailable, a._getPersistenceType() === "COOKIE") ? a._getPersistence()._getFinalTarget(o).toString() : o;
}
function Jn(e) {
	switch (e) {
		case "ENFORCE": return "ENFORCE";
		case "AUDIT": return "AUDIT";
		case "OFF": return "OFF";
		default: return "ENFORCEMENT_STATE_UNSPECIFIED";
	}
}
var Yn = class {
	clearNetworkTimeout() {
		clearTimeout(this.timer);
	}
	constructor(e) {
		this.auth = e, this.timer = null, this.promise = new Promise((e, t) => {
			this.timer = setTimeout(() => t(En(this.auth, "network-request-failed")), Hn.get());
		});
	}
};
function Xn(e, t, n) {
	let r = { appName: e.name };
	n.email && (r.email = n.email), n.phoneNumber && (r.phoneNumber = n.phoneNumber);
	let i = En(e, t, r);
	return i.customData._tokenResponse = n, i;
}
function Zn(e) {
	return e !== void 0 && e.enterprise !== void 0;
}
var Qn = class {
	constructor(e) {
		if (this.siteKey = "", this.recaptchaEnforcementState = [], e.recaptchaKey === void 0) throw Error("recaptchaKey undefined");
		this.siteKey = e.recaptchaKey.split("/")[3], this.recaptchaEnforcementState = e.recaptchaEnforcementState;
	}
	getProviderEnforcementState(e) {
		if (!this.recaptchaEnforcementState || this.recaptchaEnforcementState.length === 0) return null;
		for (let t of this.recaptchaEnforcementState) if (t.provider && t.provider === e) return Jn(t.enforcementState);
		return null;
	}
	isProviderEnabled(e) {
		return this.getProviderEnforcementState(e) === "ENFORCE" || this.getProviderEnforcementState(e) === "AUDIT";
	}
	isAnyProviderEnabled() {
		return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER") || this.isProviderEnabled("PHONE_PROVIDER");
	}
};
async function $n(e, t) {
	return Wn(e, "GET", "/v2/recaptchaConfig", Un(e, t));
}
async function er(e, t) {
	return Wn(e, "POST", "/v1/accounts:delete", t);
}
async function tr(e, t) {
	return Wn(e, "POST", "/v1/accounts:lookup", t);
}
function nr(e) {
	if (e) try {
		let t = new Date(Number(e));
		if (!isNaN(t.getTime())) return t.toUTCString();
	} catch {}
}
async function rr(e, t = !1) {
	let n = g(e), r = await n.getIdToken(t), i = ar(r);
	b(i && i.exp && i.auth_time && i.iat, n.auth, "internal-error");
	let a = typeof i.firebase == "object" ? i.firebase : void 0, o = a?.sign_in_provider;
	return {
		claims: i,
		token: r,
		authTime: nr(ir(i.auth_time)),
		issuedAtTime: nr(ir(i.iat)),
		expirationTime: nr(ir(i.exp)),
		signInProvider: o || null,
		signInSecondFactor: a?.sign_in_second_factor || null
	};
}
function ir(e) {
	return Number(e) * 1e3;
}
function ar(e) {
	let [t, n, r] = e.split(".");
	if (t === void 0 || n === void 0 || r === void 0) return wn("JWT malformed, contained fewer than 3 sections"), null;
	try {
		let e = s(n);
		return e ? JSON.parse(e) : (wn("Failed to decode base64 JWT payload"), null);
	} catch (e) {
		return wn("Caught error parsing JWT payload as JSON", e?.toString()), null;
	}
}
function or(e) {
	let t = ar(e);
	return b(t, "internal-error"), b(t.exp !== void 0, "internal-error"), b(t.iat !== void 0, "internal-error"), Number(t.exp) - Number(t.iat);
}
async function sr(e, t, n = !1) {
	if (n) return t;
	try {
		return await t;
	} catch (t) {
		throw t instanceof pe && cr(t) && e.auth.currentUser === e && await e.auth.signOut(), t;
	}
}
function cr({ code: e }) {
	return e === "auth/user-disabled" || e === "auth/user-token-expired";
}
var lr = class {
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
}, ur = class {
	constructor(e, t) {
		this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
	}
	_initializeTime() {
		this.lastSignInTime = nr(this.lastLoginAt), this.creationTime = nr(this.createdAt);
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
async function dr(e) {
	let t = e.auth, n = await sr(e, tr(t, { idToken: await e.getIdToken() }));
	b(n?.users.length, t, "internal-error");
	let r = n.users[0];
	e._notifyReloadListener(r);
	let i = r.providerUserInfo?.length ? mr(r.providerUserInfo) : [], a = pr(e.providerData, i), o = e.isAnonymous, s = !(e.email && r.passwordHash) && !a?.length, c = o ? s : !1, l = {
		uid: r.localId,
		displayName: r.displayName || null,
		photoURL: r.photoUrl || null,
		email: r.email || null,
		emailVerified: r.emailVerified || !1,
		phoneNumber: r.phoneNumber || null,
		tenantId: r.tenantId || null,
		providerData: a,
		metadata: new ur(r.createdAt, r.lastLoginAt),
		isAnonymous: c
	};
	Object.assign(e, l);
}
async function fr(e) {
	let t = g(e);
	await dr(t), await t.auth._persistUserIfCurrent(t), t.auth._notifyListenersIfCurrent(t);
}
function pr(e, t) {
	return [...e.filter((e) => !t.some((t) => t.providerId === e.providerId)), ...t];
}
function mr(e) {
	return e.map(({ providerId: e, ...t }) => ({
		providerId: e,
		uid: t.rawId || "",
		displayName: t.displayName || null,
		email: t.email || null,
		phoneNumber: t.phoneNumber || null,
		photoURL: t.photoUrl || null
	}));
}
async function hr(e, t) {
	let n = await Gn(e, {}, async () => {
		let n = ye({
			grant_type: "refresh_token",
			refresh_token: t
		}).slice(1), { tokenApiHost: r, apiKey: i } = e.config, a = await qn(e, r, "/v1/token", `key=${i}`), o = await e._getAdditionalHeaders();
		o["Content-Type"] = "application/x-www-form-urlencoded";
		let s = {
			method: "POST",
			headers: o,
			body: n
		};
		return e.emulatorConfig && Ee(e.emulatorConfig.host) && (s.credentials = "include"), zn.fetch()(a, s);
	});
	return {
		accessToken: n.access_token,
		expiresIn: n.expires_in,
		refreshToken: n.refresh_token
	};
}
async function gr(e, t) {
	return Wn(e, "POST", "/v2/accounts:revokeToken", Un(e, t));
}
var _r = class e {
	constructor() {
		this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
	}
	get isExpired() {
		return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
	}
	updateFromServerResponse(e) {
		b(e.idToken, "internal-error"), b(e.idToken !== void 0, "internal-error"), b(e.refreshToken !== void 0, "internal-error");
		let t = "expiresIn" in e && e.expiresIn !== void 0 ? Number(e.expiresIn) : or(e.idToken);
		this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
	}
	updateFromIdToken(e) {
		b(e.length !== 0, "internal-error");
		let t = or(e);
		this.updateTokensAndExpiration(e, null, t);
	}
	async getToken(e, t = !1) {
		return !t && this.accessToken && !this.isExpired ? this.accessToken : (b(this.refreshToken, e, "user-token-expired"), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
	}
	clearRefreshToken() {
		this.refreshToken = null;
	}
	async refresh(e, t) {
		let { accessToken: n, refreshToken: r, expiresIn: i } = await hr(e, t);
		this.updateTokensAndExpiration(n, r, Number(i));
	}
	updateTokensAndExpiration(e, t, n) {
		this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + n * 1e3;
	}
	static fromJSON(t, n) {
		let { refreshToken: r, accessToken: i, expirationTime: a } = n, o = new e();
		return r && (b(typeof r == "string", "internal-error", { appName: t }), o.refreshToken = r), i && (b(typeof i == "string", "internal-error", { appName: t }), o.accessToken = i), a && (b(typeof a == "number", "internal-error", { appName: t }), o.expirationTime = a), o;
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
		return An("not implemented");
	}
};
function vr(e, t) {
	b(typeof e == "string" || e === void 0, "internal-error", { appName: t });
}
var yr = class e {
	constructor({ uid: e, auth: t, stsTokenManager: n, ...r }) {
		this.providerId = "firebase", this.proactiveRefresh = new lr(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = e, this.auth = t, this.stsTokenManager = n, this.accessToken = n.accessToken, this.displayName = r.displayName || null, this.email = r.email || null, this.emailVerified = r.emailVerified || !1, this.phoneNumber = r.phoneNumber || null, this.photoURL = r.photoURL || null, this.isAnonymous = r.isAnonymous || !1, this.tenantId = r.tenantId || null, this.providerData = r.providerData ? [...r.providerData] : [], this.metadata = new ur(r.createdAt || void 0, r.lastLoginAt || void 0);
	}
	async getIdToken(e) {
		let t = await sr(this, this.stsTokenManager.getToken(this.auth, e));
		return b(t, this.auth, "internal-error"), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
	}
	getIdTokenResult(e) {
		return rr(this, e);
	}
	reload() {
		return fr(this);
	}
	_assign(e) {
		this !== e && (b(this.uid === e.uid, this.auth, "internal-error"), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((e) => ({ ...e })), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
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
		b(!this.reloadListener, this.auth, "internal-error"), this.reloadListener = e, this.reloadUserInfo &&= (this._notifyReloadListener(this.reloadUserInfo), null);
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
		e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), n = !0), t && await dr(this), await this.auth._persistUserIfCurrent(this), n && this.auth._notifyListenersIfCurrent(this);
	}
	async delete() {
		if (Yt(this.auth.app)) return Promise.reject(Dn(this.auth));
		let e = await this.getIdToken();
		return await sr(this, er(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
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
		let r = n.displayName ?? void 0, i = n.email ?? void 0, a = n.phoneNumber ?? void 0, o = n.photoURL ?? void 0, s = n.tenantId ?? void 0, c = n._redirectEventId ?? void 0, l = n.createdAt ?? void 0, u = n.lastLoginAt ?? void 0, { uid: d, emailVerified: f, isAnonymous: p, providerData: m, stsTokenManager: ee } = n;
		b(d && ee, t, "internal-error");
		let te = _r.fromJSON(this.name, ee);
		b(typeof d == "string", t, "internal-error"), vr(r, t.name), vr(i, t.name), b(typeof f == "boolean", t, "internal-error"), b(typeof p == "boolean", t, "internal-error"), vr(a, t.name), vr(o, t.name), vr(s, t.name), vr(c, t.name), vr(l, t.name), vr(u, t.name);
		let h = new e({
			uid: d,
			auth: t,
			email: i,
			emailVerified: f,
			displayName: r,
			isAnonymous: p,
			photoURL: o,
			phoneNumber: a,
			tenantId: s,
			stsTokenManager: te,
			createdAt: l,
			lastLoginAt: u
		});
		return m && Array.isArray(m) && (h.providerData = m.map((e) => ({ ...e }))), c && (h._redirectEventId = c), h;
	}
	static async _fromIdTokenResponse(t, n, r = !1) {
		let i = new _r();
		i.updateFromServerResponse(n);
		let a = new e({
			uid: n.localId,
			auth: t,
			stsTokenManager: i,
			isAnonymous: r
		});
		return await dr(a), a;
	}
	static async _fromGetAccountInfoResponse(t, n, r) {
		let i = n.users[0];
		b(i.localId !== void 0, "internal-error");
		let a = i.providerUserInfo === void 0 ? [] : mr(i.providerUserInfo), o = !(i.email && i.passwordHash) && !a?.length, s = new _r();
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
			metadata: new ur(i.createdAt, i.lastLoginAt),
			isAnonymous: !(i.email && i.passwordHash) && !a?.length
		};
		return Object.assign(c, l), c;
	}
}, br = /* @__PURE__ */ new Map();
function xr(e) {
	jn(e instanceof Function, "Expected a class definition");
	let t = br.get(e);
	return t ? (jn(t instanceof e, "Instance stored in cache mismatched with class"), t) : (t = new e(), br.set(e, t), t);
}
var Sr = class {
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
Sr.type = "NONE";
var Cr = Sr;
function wr(e, t, n) {
	return `firebase:${e}:${t}:${n}`;
}
var Tr = class e {
	constructor(e, t, n) {
		this.persistence = e, this.auth = t, this.userKey = n;
		let { config: r, name: i } = this.auth;
		this.fullUserKey = wr(this.userKey, r.apiKey, i), this.fullPersistenceKey = wr("persistence", r.apiKey, i), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
	}
	setCurrentUser(e) {
		return this.persistence._set(this.fullUserKey, e.toJSON());
	}
	async getCurrentUser() {
		let e = await this.persistence._get(this.fullUserKey);
		if (!e) return null;
		if (typeof e == "string") {
			let t = await tr(this.auth, { idToken: e }).catch(() => void 0);
			return t ? yr._fromGetAccountInfoResponse(this.auth, t, e) : null;
		}
		return yr._fromJSON(this.auth, e);
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
		if (!n.length) return new e(xr(Cr), t, r);
		let i = (await Promise.all(n.map(async (e) => {
			if (await e._isAvailable()) return e;
		}))).filter((e) => e), a = i[0] || xr(Cr), o = wr(r, t.config.apiKey, t.name), s = null;
		for (let e of n) try {
			let n = await e._get(o);
			if (n) {
				let r;
				if (typeof n == "string") {
					let e = await tr(t, { idToken: n }).catch(() => void 0);
					if (!e) break;
					r = await yr._fromGetAccountInfoResponse(t, e, n);
				} else r = yr._fromJSON(t, n);
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
function Er(e) {
	let t = e.toLowerCase();
	if (t.includes("opera/") || t.includes("opr/") || t.includes("opios/")) return "Opera";
	if (Ar(t)) return "IEMobile";
	if (t.includes("msie") || t.includes("trident/")) return "IE";
	if (t.includes("edge/")) return "Edge";
	if (Dr(t)) return "Firefox";
	if (t.includes("silk/")) return "Silk";
	if (Mr(t)) return "Blackberry";
	if (Nr(t)) return "Webos";
	if (Or(t)) return "Safari";
	if ((t.includes("chrome/") || kr(t)) && !t.includes("edge/")) return "Chrome";
	if (jr(t)) return "Android";
	{
		let t = e.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/);
		if (t?.length === 2) return t[1];
	}
	return "Other";
}
function Dr(e = h()) {
	return /firefox\//i.test(e);
}
function Or(e = h()) {
	let t = e.toLowerCase();
	return t.includes("safari/") && !t.includes("chrome/") && !t.includes("crios/") && !t.includes("android");
}
function kr(e = h()) {
	return /crios\//i.test(e);
}
function Ar(e = h()) {
	return /iemobile/i.test(e);
}
function jr(e = h()) {
	return /android/i.test(e);
}
function Mr(e = h()) {
	return /blackberry/i.test(e);
}
function Nr(e = h()) {
	return /webos/i.test(e);
}
function Pr(e = h()) {
	return /iphone|ipad|ipod/i.test(e) || /macintosh/i.test(e) && /mobile/i.test(e);
}
function Fr(e = h()) {
	return Pr(e) && !!window.navigator?.standalone;
}
function Ir() {
	return se() && document.documentMode === 10;
}
function Lr(e = h()) {
	return Pr(e) || jr(e) || Nr(e) || Mr(e) || /windows phone/i.test(e) || Ar(e);
}
function Rr(e, t = []) {
	let n;
	switch (e) {
		case "Browser":
			n = Er(h());
			break;
		case "Worker":
			n = `${Er(h())}-${e}`;
			break;
		default: n = e;
	}
	let r = t.length ? t.join(",") : "FirebaseCore-web";
	return `${n}/JsCore/${Zt}/${r}`;
}
var zr = class {
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
async function Br(e, t = {}) {
	return Wn(e, "GET", "/v2/passwordPolicy", Un(e, t));
}
var Vr = 6, Hr = class {
	constructor(e) {
		let t = e.customStrengthOptions;
		this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = t.minPasswordLength ?? Vr, t.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = t.maxPasswordLength), t.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = t.containsLowercaseCharacter), t.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = t.containsUppercaseCharacter), t.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = t.containsNumericCharacter), t.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = t.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = e.allowedNonAlphanumericCharacters?.join("") ?? "", this.forceUpgradeOnSignin = e.forceUpgradeOnSignin ?? !1, this.schemaVersion = e.schemaVersion;
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
}, Ur = class {
	constructor(e, t, n, r) {
		this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = n, this.config = r, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new Gr(this), this.idTokenSubscription = new Gr(this), this.beforeStateQueue = new zr(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = xn, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this._resolvePersistenceManagerAvailable = void 0, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = r.sdkClientVersion, this._persistenceManagerAvailable = new Promise((e) => this._resolvePersistenceManagerAvailable = e);
	}
	_initializeWithPersistence(e, t) {
		return t && (this._popupRedirectResolver = xr(t)), this._initializationPromise = this.queue(async () => {
			if (!this._deleted && (this.persistenceManager = await Tr.create(this, e), this._resolvePersistenceManagerAvailable?.(), !this._deleted)) {
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
			let t = await tr(this, { idToken: e }), n = await yr._fromGetAccountInfoResponse(this, t, e);
			await this.directlySetCurrentUser(n);
		} catch (e) {
			console.warn("FirebaseServerApp could not login user with provided authIdToken: ", e), await this.directlySetCurrentUser(null);
		}
	}
	async initializeCurrentUser(e) {
		if (Yt(this.app)) {
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
		return b(this._popupRedirectResolver, this, "argument-error"), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === n._redirectEventId ? this.directlySetCurrentUser(n) : this.reloadAndSetCurrentUserOrClear(n);
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
			await dr(e);
		} catch (e) {
			if (e?.code !== "auth/network-request-failed") return this.directlySetCurrentUser(null);
		}
		return this.directlySetCurrentUser(e);
	}
	useDeviceLanguage() {
		this.languageCode = In();
	}
	async _delete() {
		this._deleted = !0;
	}
	async updateCurrentUser(e) {
		if (Yt(this.app)) return Promise.reject(Dn(this));
		let t = e ? g(e) : null;
		return t && b(t.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token"), this._updateCurrentUser(t && t._clone(this));
	}
	async _updateCurrentUser(e, t = !1) {
		if (!this._deleted) return e && b(this.tenantId === e.tenantId, this, "tenant-id-mismatch"), t || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
			await this.directlySetCurrentUser(e), this.notifyAuthListeners();
		});
	}
	async signOut() {
		return Yt(this.app) ? Promise.reject(Dn(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(null, !0));
	}
	setPersistence(e) {
		return Yt(this.app) ? Promise.reject(Dn(this)) : this.queue(async () => {
			await this.assertedPersistence.setPersistence(xr(e));
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
		let e = new Hr(await Br(this));
		this.tenantId === null ? this._projectPasswordPolicy = e : this._tenantPasswordPolicies[this.tenantId] = e;
	}
	_getPersistenceType() {
		return this.assertedPersistence.persistence.type;
	}
	_getPersistence() {
		return this.assertedPersistence.persistence;
	}
	_updateErrorMap(e) {
		this._errorFactory = new me("auth", "Firebase", e());
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
			this.tenantId != null && (t.tenantId = this.tenantId), await gr(this, t);
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
			let t = e && xr(e) || this._popupRedirectResolver;
			b(t, this, "argument-error"), this.redirectPersistenceManager = await Tr.create(this, [xr(t._redirectPersistence)], "redirectUser"), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
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
		if (b(o, this, "internal-error"), o.then(() => {
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
		return b(this.persistenceManager, this, "internal-error"), this.persistenceManager;
	}
	_logFramework(e) {
		!e || this.frameworks.includes(e) || (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = Rr(this.config.clientPlatform, this._getFrameworks()));
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
		if (Yt(this.app) && this.app.settings.appCheckToken) return this.app.settings.appCheckToken;
		let e = await this.appCheckServiceProvider.getImmediate({ optional: !0 })?.getToken();
		return e?.error && Cn(`Error while retrieving App Check token: ${e.error}`), e?.token;
	}
};
function Wr(e) {
	return g(e);
}
var Gr = class {
	constructor(e) {
		this.auth = e, this.observer = null, this.addObserver = Se((e) => this.observer = e);
	}
	get next() {
		return b(this.observer, this.auth, "internal-error"), this.observer.next.bind(this.observer);
	}
}, Kr = {
	async loadJS() {
		throw Error("Unable to load external scripts");
	},
	recaptchaV2Script: "",
	recaptchaEnterpriseScript: "",
	gapiScript: ""
};
function qr(e) {
	Kr = e;
}
function Jr(e) {
	return Kr.loadJS(e);
}
function Yr() {
	return Kr.recaptchaEnterpriseScript;
}
function Xr() {
	return Kr.gapiScript;
}
function Zr(e) {
	return `__${e}${Math.floor(Math.random() * 1e6)}`;
}
var Qr = class {
	constructor() {
		this.enterprise = new $r();
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
}, $r = class {
	ready(e) {
		e();
	}
	execute(e, t) {
		return Promise.resolve("token");
	}
	render(e, t) {
		return "";
	}
}, ei = "recaptcha-enterprise", ti = "NO_RECAPTCHA", ni = "onFirebaseAuthREInstanceReady", ri = class e {
	constructor(e) {
		this.type = ei, this.auth = Wr(e);
	}
	async verify(t = "verify", n = !1) {
		async function r(e) {
			if (!n) {
				if (e.tenantId == null && e._agentRecaptchaConfig != null) return e._agentRecaptchaConfig.siteKey;
				if (e.tenantId != null && e._tenantRecaptchaConfigs[e.tenantId] !== void 0) return e._tenantRecaptchaConfigs[e.tenantId].siteKey;
			}
			return new Promise(async (t, n) => {
				$n(e, {
					clientType: "CLIENT_TYPE_WEB",
					version: "RECAPTCHA_ENTERPRISE"
				}).then((r) => {
					if (r.recaptchaKey === void 0) n(/* @__PURE__ */ Error("recaptcha Enterprise site key undefined"));
					else {
						let n = new Qn(r);
						return e.tenantId == null ? e._agentRecaptchaConfig = n : e._tenantRecaptchaConfigs[e.tenantId] = n, t(n.siteKey);
					}
				}).catch((e) => {
					n(e);
				});
			});
		}
		function i(e, n, r) {
			let i = window.grecaptcha;
			Zn(i) ? i.enterprise.ready(() => {
				i.enterprise.execute(e, { action: t }).then((e) => {
					n(e);
				}).catch(() => {
					n(ti);
				});
			}) : r(Error("No reCAPTCHA enterprise script loaded."));
		}
		return this.auth.settings.appVerificationDisabledForTesting ? new Qr().execute("siteKey", { action: "verify" }) : new Promise((t, a) => {
			r(this.auth).then(async (r) => {
				if (!n && Zn(window.grecaptcha) && e.scriptInjectionDeferred) await e.scriptInjectionDeferred.promise, i(r, t, a);
				else {
					if (typeof window > "u") {
						a(/* @__PURE__ */ Error("RecaptchaVerifier is only supported in browser"));
						return;
					}
					let n = Yr();
					n.length !== 0 && (n += r + `&onload=${ni}`), e.scriptInjectionDeferred = new te(), window[ni] = () => {
						e.scriptInjectionDeferred?.resolve();
					}, Jr(n).then(() => e.scriptInjectionDeferred?.promise).then(() => {
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
ri.scriptInjectionDeferred = null;
async function ii(e, t, n, r = !1, i = !1) {
	let a = new ri(e), o;
	if (i) o = ti;
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
async function ai(e, t, n, r, i) {
	return i === "EMAIL_PASSWORD_PROVIDER" ? e._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER") ? r(e, await ii(e, t, n, n === "getOobCode")) : r(e, t).catch(async (i) => i.code === "auth/missing-recaptcha-token" ? (console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`), r(e, await ii(e, t, n, n === "getOobCode"))) : Promise.reject(i)) : i === "PHONE_PROVIDER" ? e._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER") ? r(e, await ii(e, t, n)).catch(async (i) => e._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER") === "AUDIT" && (i.code === "auth/missing-recaptcha-token" || i.code === "auth/invalid-app-credential") ? (console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`), r(e, await ii(e, t, n, !1, !0))) : Promise.reject(i)) : r(e, await ii(e, t, n, !1, !0)) : Promise.reject(i + " provider is not supported.");
}
function oi(e, t) {
	let n = Jt(e, "auth");
	if (n.isInitialized()) {
		let e = n.getImmediate();
		if (_e(n.getOptions(), t ?? {})) return e;
		Tn(e, "already-initialized");
	}
	return n.initialize({ options: t });
}
function si(e, t) {
	let n = t?.persistence || [], r = (Array.isArray(n) ? n : [n]).map(xr);
	t?.errorMap && e._updateErrorMap(t.errorMap), e._initializeWithPersistence(r, t?.popupRedirectResolver);
}
function ci(e, t, n) {
	let r = Wr(e);
	b(/^https?:\/\//.test(t), r, "invalid-emulator-scheme");
	let i = !!n?.disableWarnings, a = li(t), { host: o, port: s } = ui(t), c = s === null ? "" : `:${s}`, l = { url: `${a}//${o}${c}/` }, u = Object.freeze({
		host: o,
		port: s,
		protocol: a.replace(":", ""),
		options: Object.freeze({ disableWarnings: i })
	});
	if (!r._canInitEmulator) {
		b(r.config.emulator && r.emulatorConfig, r, "emulator-config-failed"), b(_e(l, r.config.emulator) && _e(u, r.emulatorConfig), r, "emulator-config-failed");
		return;
	}
	r.config.emulator = l, r.emulatorConfig = u, r.settings.appVerificationDisabledForTesting = !0, Ee(o) ? De(`${a}//${o}${c}`) : i || fi();
}
function li(e) {
	let t = e.indexOf(":");
	return t < 0 ? "" : e.substr(0, t + 1);
}
function ui(e) {
	let t = li(e), n = /(\/\/)?([^?#/]+)/.exec(e.substr(t.length));
	if (!n) return {
		host: "",
		port: null
	};
	let r = n[2].split("@").pop() || "", i = /^(\[[^\]]+\])(:|$)/.exec(r);
	if (i) {
		let e = i[1];
		return {
			host: e,
			port: di(r.substr(e.length + 1))
		};
	}
	{
		let [e, t] = r.split(":");
		return {
			host: e,
			port: di(t)
		};
	}
}
function di(e) {
	if (!e) return null;
	let t = Number(e);
	return isNaN(t) ? null : t;
}
function fi() {
	function e() {
		let e = document.createElement("p"), t = e.style;
		e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
	}
	typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", e) : e());
}
var pi = class {
	constructor(e, t) {
		this.providerId = e, this.signInMethod = t;
	}
	toJSON() {
		return An("not implemented");
	}
	_getIdTokenResponse(e) {
		return An("not implemented");
	}
	_linkToIdToken(e, t) {
		return An("not implemented");
	}
	_getReauthenticationResolver(e) {
		return An("not implemented");
	}
};
async function mi(e, t) {
	return Wn(e, "POST", "/v1/accounts:signUp", t);
}
async function hi(e, t) {
	return Kn(e, "POST", "/v1/accounts:signInWithPassword", Un(e, t));
}
async function gi(e, t) {
	return Kn(e, "POST", "/v1/accounts:signInWithEmailLink", Un(e, t));
}
async function _i(e, t) {
	return Kn(e, "POST", "/v1/accounts:signInWithEmailLink", Un(e, t));
}
var vi = class e extends pi {
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
			case "password": return ai(e, {
				returnSecureToken: !0,
				email: this._email,
				password: this._password,
				clientType: "CLIENT_TYPE_WEB"
			}, "signInWithPassword", hi, "EMAIL_PASSWORD_PROVIDER");
			case "emailLink": return gi(e, {
				email: this._email,
				oobCode: this._password
			});
			default: Tn(e, "internal-error");
		}
	}
	async _linkToIdToken(e, t) {
		switch (this.signInMethod) {
			case "password": return ai(e, {
				idToken: t,
				returnSecureToken: !0,
				email: this._email,
				password: this._password,
				clientType: "CLIENT_TYPE_WEB"
			}, "signUpPassword", mi, "EMAIL_PASSWORD_PROVIDER");
			case "emailLink": return _i(e, {
				idToken: t,
				email: this._email,
				oobCode: this._password
			});
			default: Tn(e, "internal-error");
		}
	}
	_getReauthenticationResolver(e) {
		return this._getIdTokenResponse(e);
	}
};
async function yi(e, t) {
	return Kn(e, "POST", "/v1/accounts:signInWithIdp", Un(e, t));
}
var bi = "http://localhost", xi = class e extends pi {
	constructor() {
		super(...arguments), this.pendingToken = null;
	}
	static _fromParams(t) {
		let n = new e(t.providerId, t.signInMethod);
		return t.idToken || t.accessToken ? (t.idToken && (n.idToken = t.idToken), t.accessToken && (n.accessToken = t.accessToken), t.nonce && !t.pendingToken && (n.nonce = t.nonce), t.pendingToken && (n.pendingToken = t.pendingToken)) : t.oauthToken && t.oauthTokenSecret ? (n.accessToken = t.oauthToken, n.secret = t.oauthTokenSecret) : Tn("argument-error"), n;
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
		return yi(e, this.buildRequest());
	}
	_linkToIdToken(e, t) {
		let n = this.buildRequest();
		return n.idToken = t, yi(e, n);
	}
	_getReauthenticationResolver(e) {
		let t = this.buildRequest();
		return t.autoCreate = !1, yi(e, t);
	}
	buildRequest() {
		let e = {
			requestUri: bi,
			returnSecureToken: !0
		};
		if (this.pendingToken) e.pendingToken = this.pendingToken;
		else {
			let t = {};
			this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = ye(t);
		}
		return e;
	}
};
function Si(e) {
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
function Ci(e) {
	let t = be(xe(e)).link, n = t ? be(xe(t)).deep_link_id : null, r = be(xe(e)).deep_link_id;
	return (r ? be(xe(r)).link : null) || r || n || t || e;
}
var wi = class e {
	constructor(e) {
		let t = be(xe(e)), n = t.apiKey ?? null, r = t.oobCode ?? null, i = Si(t.mode ?? null);
		b(n && r && i, "argument-error"), this.apiKey = n, this.operation = i, this.code = r, this.continueUrl = t.continueUrl ?? null, this.languageCode = t.lang ?? null, this.tenantId = t.tenantId ?? null;
	}
	static parseLink(t) {
		let n = Ci(t);
		try {
			return new e(n);
		} catch {
			return null;
		}
	}
}, Ti = class e {
	constructor() {
		this.providerId = e.PROVIDER_ID;
	}
	static credential(e, t) {
		return vi._fromEmailAndPassword(e, t);
	}
	static credentialWithLink(e, t) {
		let n = wi.parseLink(t);
		return b(n, "argument-error"), vi._fromEmailAndCode(e, n.code, n.tenantId);
	}
};
Ti.PROVIDER_ID = "password", Ti.EMAIL_PASSWORD_SIGN_IN_METHOD = "password", Ti.EMAIL_LINK_SIGN_IN_METHOD = "emailLink";
var Ei = class {
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
}, Di = class extends Ei {
	constructor() {
		super(...arguments), this.scopes = [];
	}
	addScope(e) {
		return this.scopes.includes(e) || this.scopes.push(e), this;
	}
	getScopes() {
		return [...this.scopes];
	}
}, Oi = class e extends Di {
	constructor() {
		super("facebook.com");
	}
	static credential(t) {
		return xi._fromParams({
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
Oi.FACEBOOK_SIGN_IN_METHOD = "facebook.com", Oi.PROVIDER_ID = "facebook.com";
var ki = class e extends Di {
	constructor() {
		super("google.com"), this.addScope("profile");
	}
	static credential(t, n) {
		return xi._fromParams({
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
ki.GOOGLE_SIGN_IN_METHOD = "google.com", ki.PROVIDER_ID = "google.com";
var Ai = class e extends Di {
	constructor() {
		super("github.com");
	}
	static credential(t) {
		return xi._fromParams({
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
Ai.GITHUB_SIGN_IN_METHOD = "github.com", Ai.PROVIDER_ID = "github.com";
var ji = class e extends Di {
	constructor() {
		super("twitter.com");
	}
	static credential(t, n) {
		return xi._fromParams({
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
ji.TWITTER_SIGN_IN_METHOD = "twitter.com", ji.PROVIDER_ID = "twitter.com";
var Mi = class e {
	constructor(e) {
		this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
	}
	static async _fromIdTokenResponse(t, n, r, i = !1) {
		let a = await yr._fromIdTokenResponse(t, r, i), o = Ni(r);
		return new e({
			user: a,
			providerId: o,
			_tokenResponse: r,
			operationType: n
		});
	}
	static async _forOperation(t, n, r) {
		await t._updateTokensIfNecessary(r, !0);
		let i = Ni(r);
		return new e({
			user: t,
			providerId: i,
			_tokenResponse: r,
			operationType: n
		});
	}
};
function Ni(e) {
	return e.providerId ? e.providerId : "phoneNumber" in e ? "phone" : null;
}
var Pi = class e extends pe {
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
function Fi(e, t, n, r) {
	return (t === "reauthenticate" ? n._getReauthenticationResolver(e) : n._getIdTokenResponse(e)).catch((n) => {
		throw n.code === "auth/multi-factor-auth-required" ? Pi._fromErrorAndOperation(e, n, t, r) : n;
	});
}
async function Ii(e, t, n = !1) {
	let r = await sr(e, t._linkToIdToken(e.auth, await e.getIdToken()), n);
	return Mi._forOperation(e, "link", r);
}
async function Li(e, t, n = !1) {
	let { auth: r } = e;
	if (Yt(r.app)) return Promise.reject(Dn(r));
	let i = "reauthenticate";
	try {
		let a = await sr(e, Fi(r, i, t, e), n);
		b(a.idToken, r, "internal-error");
		let o = ar(a.idToken);
		b(o, r, "internal-error");
		let { sub: s } = o;
		return b(e.uid === s, r, "user-mismatch"), Mi._forOperation(e, i, a);
	} catch (e) {
		throw e?.code === "auth/user-not-found" && Tn(r, "user-mismatch"), e;
	}
}
async function Ri(e, t, n = !1) {
	if (Yt(e.app)) return Promise.reject(Dn(e));
	let r = "signIn", i = await Fi(e, r, t), a = await Mi._fromIdTokenResponse(e, r, i);
	return n || await e._updateCurrentUser(a.user), a;
}
async function zi(e, t) {
	return Li(g(e), t);
}
function Bi(e, t, n, r) {
	return g(e).onIdTokenChanged(t, n, r);
}
function Vi(e, t, n) {
	return g(e).beforeAuthStateChanged(t, n);
}
function Hi(e, t, n, r) {
	return g(e).onAuthStateChanged(t, n, r);
}
function Ui(e) {
	return g(e).signOut();
}
async function Wi(e) {
	return g(e).delete();
}
var Gi = "__sak", Ki = class {
	constructor(e, t) {
		this.storageRetriever = e, this.type = t;
	}
	_isAvailable() {
		try {
			return this.storage ? (this.storage.setItem(Gi, "1"), this.storage.removeItem(Gi), Promise.resolve(!0)) : Promise.resolve(!1);
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
}, qi = 1e3, Ji = 10, Yi = class extends Ki {
	constructor() {
		super(() => window.localStorage, "LOCAL"), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = Lr(), this._shouldAllowMigration = !0;
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
		Ir() && i !== e.newValue && e.newValue !== e.oldValue ? setTimeout(r, Ji) : r();
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
		}, qi);
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
Yi.type = "LOCAL";
var Xi = Yi, Zi = class extends Ki {
	constructor() {
		super(() => window.sessionStorage, "SESSION");
	}
	_addListener(e, t) {}
	_removeListener(e, t) {}
};
Zi.type = "SESSION";
var Qi = Zi;
function $i(e) {
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
var ea = class e {
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
		let o = await $i(Array.from(a).map(async (e) => e(t.origin, i)));
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
ea.receivers = [];
function ta(e = "", t = 10) {
	let n = "";
	for (let e = 0; e < t; e++) n += Math.floor(Math.random() * 10);
	return e + n;
}
var na = class {
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
			let c = ta("", 20);
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
function ra() {
	return window;
}
function ia(e) {
	ra().location.href = e;
}
function aa() {
	return ra().WorkerGlobalScope !== void 0 && typeof ra().importScripts == "function";
}
async function oa() {
	if (!navigator?.serviceWorker) return null;
	try {
		return (await navigator.serviceWorker.ready).active;
	} catch {
		return null;
	}
}
function sa() {
	return navigator?.serviceWorker?.controller || null;
}
function ca() {
	return aa() ? self : null;
}
var la = "firebaseLocalStorageDb", ua = 1, da = "firebaseLocalStorage", fa = "fbase_key", pa = class {
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
function ma(e, t) {
	return e.transaction([da], t ? "readwrite" : "readonly").objectStore(da);
}
function ha() {
	return new pa(indexedDB.deleteDatabase(la)).toPromise();
}
function ga() {
	let e = indexedDB.open(la, ua);
	return new Promise((t, n) => {
		e.addEventListener("error", () => {
			n(e.error);
		}), e.addEventListener("upgradeneeded", () => {
			let t = e.result;
			try {
				t.createObjectStore(da, { keyPath: fa });
			} catch (e) {
				n(e);
			}
		}), e.addEventListener("success", async () => {
			let n = e.result;
			n.objectStoreNames.contains(da) ? t(n) : (n.close(), await ha(), t(await ga()));
		});
	});
}
async function _a(e, t, n) {
	return new pa(ma(e, !0).put({
		[fa]: t,
		value: n
	})).toPromise();
}
async function va(e, t) {
	let n = await new pa(ma(e, !1).get(t)).toPromise();
	return n === void 0 ? null : n.value;
}
function ya(e, t) {
	return new pa(ma(e, !0).delete(t)).toPromise();
}
var ba = 800, xa = 3, Sa = class {
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
		return this.dbPromise ? this.dbPromise : (this.dbPromise = ga(), this.dbPromise.catch(() => {
			this.dbPromise = null;
		}), this.dbPromise);
	}
	async _withRetries(e) {
		let t = 0;
		for (;;) try {
			return await e(await this._openDb());
		} catch (e) {
			if (this.isClosing || t++ > xa) throw e;
			this.dbPromise &&= ((await this.dbPromise).close(), null);
		}
	}
	async initializeServiceWorkerMessaging() {
		return aa() ? this.initializeReceiver() : this.initializeSender();
	}
	async initializeReceiver() {
		this.receiver = ea._getInstance(ca()), this.receiver._subscribe("keyChanged", async (e, t) => ({ keyProcessed: (await this._poll()).includes(t.key) })), this.receiver._subscribe("ping", async (e, t) => ["keyChanged"]);
	}
	async initializeSender() {
		if (this.activeServiceWorker = await oa(), !this.activeServiceWorker) return;
		this.sender = new na(this.activeServiceWorker);
		let e = await this.sender._send("ping", {}, 800);
		e && e[0]?.fulfilled && e[0]?.value.includes("keyChanged") && (this.serviceWorkerReceiverAvailable = !0);
	}
	async notifyServiceWorker(e) {
		if (!(!this.sender || !this.activeServiceWorker || sa() !== this.activeServiceWorker)) try {
			await this.sender._send("keyChanged", { key: e }, this.serviceWorkerReceiverAvailable ? 800 : 50);
		} catch {}
	}
	async _isAvailable() {
		try {
			return indexedDB ? (await this._withRetries(async (e) => {
				await _a(e, Gi, "1"), await ya(e, Gi);
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
		return this._withPendingWrite(async () => (await this._withRetries((n) => _a(n, e, t)), this.localCache[e] = t, this.notifyServiceWorker(e)));
	}
	async _get(e) {
		let t = await this._withRetries((t) => va(t, e));
		return this.localCache[e] = t, t;
	}
	async _remove(e) {
		return this._withPendingWrite(async () => (await this._withRetries((t) => ya(t, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
	}
	async _poll() {
		if (this.isClosing) return [];
		try {
			let e = await this._withRetries((e) => new pa(ma(e, !1).getAll()).toPromise());
			if (this.isClosing || !e || this.pendingWrites !== 0) return [];
			let t = [], n = /* @__PURE__ */ new Set();
			if (e.length !== 0) for (let { fbase_key: r, value: i } of e) n.add(r), JSON.stringify(this.localCache[r]) !== JSON.stringify(i) && (this.notifyListeners(r, i), t.push(r));
			for (let e of Object.keys(this.localCache)) this.localCache[e] && !n.has(e) && (this.notifyListeners(e, null), t.push(e));
			return t;
		} catch (e) {
			return this.isClosing || Cn(`Firebase Auth cross-tab polling failed with error: ${e}`), [];
		}
	}
	notifyListeners(e, t) {
		this.localCache[e] = t;
		let n = this.listeners[e];
		if (n) for (let e of Array.from(n)) e(t);
	}
	startPolling() {
		this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), ba);
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
Sa.type = "LOCAL";
var Ca = Sa;
Zr("rcb"), new Ln(3e4, 6e4);
function wa(e, t) {
	return t ? xr(t) : (b(e._popupRedirectResolver, e, "argument-error"), e._popupRedirectResolver);
}
var Ta = class extends pi {
	constructor(e) {
		super("custom", "custom"), this.params = e;
	}
	_getIdTokenResponse(e) {
		return yi(e, this._buildIdpRequest());
	}
	_linkToIdToken(e, t) {
		return yi(e, this._buildIdpRequest(t));
	}
	_getReauthenticationResolver(e) {
		return yi(e, this._buildIdpRequest());
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
function Ea(e) {
	return Ri(e.auth, new Ta(e), e.bypassAuthState);
}
function Da(e) {
	let { auth: t, user: n } = e;
	return b(n, t, "internal-error"), Li(n, new Ta(e), e.bypassAuthState);
}
async function Oa(e) {
	let { auth: t, user: n } = e;
	return b(n, t, "internal-error"), Ii(n, new Ta(e), e.bypassAuthState);
}
var ka = class {
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
			case "signInViaRedirect": return Ea;
			case "linkViaPopup":
			case "linkViaRedirect": return Oa;
			case "reauthViaPopup":
			case "reauthViaRedirect": return Da;
			default: Tn(this.auth, "internal-error");
		}
	}
	resolve(e) {
		jn(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
	}
	reject(e) {
		jn(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
	}
	unregisterAndCleanUp() {
		this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
	}
}, Aa = new Ln(2e3, 1e4);
async function ja(e, t, n) {
	if (Yt(e.app)) return Promise.reject(En(e, "operation-not-supported-in-this-environment"));
	let r = Wr(e);
	return On(e, t, Ei), new Na(r, "signInViaPopup", t, wa(r, n)).executeNotNull();
}
async function Ma(e, t, n) {
	let r = g(e);
	if (Yt(r.auth.app)) return Promise.reject(En(r.auth, "operation-not-supported-in-this-environment"));
	On(r.auth, t, Ei);
	let i = wa(r.auth, n);
	return new Na(r.auth, "reauthViaPopup", t, i, r).executeNotNull();
}
var Na = class e extends ka {
	constructor(t, n, r, i, a) {
		super(t, n, i, a), this.provider = r, this.authWindow = null, this.pollId = null, e.currentPopupAction && e.currentPopupAction.cancel(), e.currentPopupAction = this;
	}
	async executeNotNull() {
		let e = await this.execute();
		return b(e, this.auth, "internal-error"), e;
	}
	async onExecution() {
		jn(this.filter.length === 1, "Popup operations only handle one event");
		let e = ta();
		this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], e), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((e) => {
			this.reject(e);
		}), this.resolver._isIframeWebStorageSupported(this.auth, (e) => {
			e || this.reject(En(this.auth, "web-storage-unsupported"));
		}), this.pollUserCancellation();
	}
	get eventId() {
		return this.authWindow?.associatedEvent || null;
	}
	cancel() {
		this.reject(En(this.auth, "cancelled-popup-request"));
	}
	cleanUp() {
		this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, e.currentPopupAction = null;
	}
	pollUserCancellation() {
		let e = () => {
			if (this.authWindow?.window?.closed) {
				this.pollId = window.setTimeout(() => {
					this.pollId = null, this.reject(En(this.auth, "popup-closed-by-user"));
				}, 8e3);
				return;
			}
			this.pollId = window.setTimeout(e, Aa.get());
		};
		e();
	}
};
Na.currentPopupAction = null;
var Pa = "pendingRedirect", Fa = /* @__PURE__ */ new Map(), Ia = class extends ka {
	constructor(e, t, n = !1) {
		super(e, [
			"signInViaRedirect",
			"linkViaRedirect",
			"reauthViaRedirect",
			"unknown"
		], t, void 0, n), this.eventId = null;
	}
	async execute() {
		let e = Fa.get(this.auth._key());
		if (!e) {
			try {
				let t = await La(this.resolver, this.auth) ? await super.execute() : null;
				e = () => Promise.resolve(t);
			} catch (t) {
				e = () => Promise.reject(t);
			}
			Fa.set(this.auth._key(), e);
		}
		return this.bypassAuthState || Fa.set(this.auth._key(), () => Promise.resolve(null)), e();
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
async function La(e, t) {
	let n = Va(t), r = Ba(e);
	if (!await r._isAvailable()) return !1;
	let i = await r._get(n) === "true";
	return await r._remove(n), i;
}
async function Ra(e, t) {
	return Ba(e)._set(Va(t), "true");
}
function za(e, t) {
	Fa.set(e._key(), t);
}
function Ba(e) {
	return xr(e._redirectPersistence);
}
function Va(e) {
	return wr(Pa, e.config.apiKey, e.name);
}
function Ha(e, t, n) {
	return Ua(e, t, n);
}
async function Ua(e, t, n) {
	if (Yt(e.app)) return Promise.reject(Dn(e));
	let r = Wr(e);
	On(e, t, Ei), await r._initializationPromise;
	let i = wa(r, n);
	return await Ra(i, r), i._openRedirect(r, t, "signInViaRedirect");
}
async function Wa(e, t, n = !1) {
	if (Yt(e.app)) return Promise.reject(Dn(e));
	let r = Wr(e), i = await new Ia(r, wa(r, t), n).execute();
	return i && !n && (delete i.user._redirectEventId, await r._persistUserIfCurrent(i.user), await r._setRedirectUser(null, t)), i;
}
var Ga = 6e5, Ka = class {
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
		}), this.hasHandledPotentialRedirect || !Ya(e) ? t : (this.hasHandledPotentialRedirect = !0, t ||= (this.queuedRedirectEvent = e, !0), t);
	}
	sendToConsumer(e, t) {
		if (e.error && !Ja(e)) {
			let n = e.error.code?.split("auth/")[1] || "internal-error";
			t.onError(En(this.auth, n));
		} else t.onAuthEvent(e);
	}
	isEventForConsumer(e, t) {
		let n = t.eventId === null || !!e.eventId && e.eventId === t.eventId;
		return t.filter.includes(e.type) && n;
	}
	hasEventBeenHandled(e) {
		return Date.now() - this.lastProcessedEventTime >= Ga && this.cachedEventUids.clear(), this.cachedEventUids.has(qa(e));
	}
	saveEventToCache(e) {
		this.cachedEventUids.add(qa(e)), this.lastProcessedEventTime = Date.now();
	}
};
function qa(e) {
	return [
		e.type,
		e.eventId,
		e.sessionId,
		e.tenantId
	].filter((e) => e).join("-");
}
function Ja({ type: e, error: t }) {
	return e === "unknown" && t?.code === "auth/no-auth-event";
}
function Ya(e) {
	switch (e.type) {
		case "signInViaRedirect":
		case "linkViaRedirect":
		case "reauthViaRedirect": return !0;
		case "unknown": return Ja(e);
		default: return !1;
	}
}
async function Xa(e, t = {}) {
	return Wn(e, "GET", "/v1/projects", t);
}
var Za = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, Qa = /^https?/;
async function $a(e) {
	if (e.config.emulator) return;
	let { authorizedDomains: t } = await Xa(e);
	for (let e of t) try {
		if (eo(e)) return;
	} catch {}
	Tn(e, "unauthorized-domain");
}
function eo(e) {
	let t = Mn(), { protocol: n, hostname: r } = new URL(t);
	if (e.startsWith("chrome-extension://")) {
		let i = new URL(e);
		return i.hostname === "" && r === "" ? n === "chrome-extension:" && e.replace("chrome-extension://", "") === t.replace("chrome-extension://", "") : n === "chrome-extension:" && i.hostname === r;
	}
	if (!Qa.test(n)) return !1;
	if (Za.test(e)) return r === e;
	let i = e.replace(/\./g, "\\.");
	return RegExp("^(.+\\." + i + "|" + i + ")$", "i").test(r);
}
var to = new Ln(3e4, 6e4);
function no() {
	let e = ra().___jsl;
	if (e?.H) {
		for (let t of Object.keys(e.H)) if (e.H[t].r = e.H[t].r || [], e.H[t].L = e.H[t].L || [], e.H[t].r = [...e.H[t].L], e.CP) for (let t = 0; t < e.CP.length; t++) e.CP[t] = null;
	}
}
function ro(e) {
	return new Promise((t, n) => {
		function r() {
			no(), gapi.load("gapi.iframes", {
				callback: () => {
					t(gapi.iframes.getContext());
				},
				ontimeout: () => {
					no(), n(En(e, "network-request-failed"));
				},
				timeout: to.get()
			});
		}
		if (ra().gapi?.iframes?.Iframe) t(gapi.iframes.getContext());
		else if (ra().gapi?.load) r();
		else {
			let t = Zr("iframefcb");
			return ra()[t] = () => {
				gapi.load ? r() : n(En(e, "network-request-failed"));
			}, Jr(`${Xr()}?onload=${t}`).catch((e) => n(e));
		}
	}).catch((e) => {
		throw io = null, e;
	});
}
var io = null;
function ao(e) {
	return io ||= ro(e), io;
}
var oo = new Ln(5e3, 15e3), so = "__/auth/iframe", co = "emulator/auth/iframe", lo = {
	style: {
		position: "absolute",
		top: "-100px",
		width: "1px",
		height: "1px"
	},
	"aria-hidden": "true",
	tabindex: "-1"
}, uo = /* @__PURE__ */ new Map([
	["identitytoolkit.googleapis.com", "p"],
	["staging-identitytoolkit.sandbox.googleapis.com", "s"],
	["test-identitytoolkit.sandbox.googleapis.com", "t"]
]);
function fo(e) {
	let t = e.config;
	b(t.authDomain, e, "auth-domain-config-required");
	let n = t.emulator ? Rn(t, co) : `https://${e.config.authDomain}/${so}`, r = {
		apiKey: t.apiKey,
		appName: e.name,
		v: Zt
	}, i = uo.get(e.config.apiHost);
	i && (r.eid = i);
	let a = e._getFrameworks();
	return a.length && (r.fw = a.join(",")), `${n}?${ye(r).slice(1)}`;
}
async function po(e) {
	let t = await ao(e), n = ra().gapi;
	return b(n, e, "internal-error"), t.open({
		where: document.body,
		url: fo(e),
		messageHandlersFilter: n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
		attributes: lo,
		dontclear: !0
	}, (t) => new Promise(async (n, r) => {
		await t.restyle({ setHideOnLeave: !1 });
		let i = En(e, "network-request-failed"), a = ra().setTimeout(() => {
			r(i);
		}, oo.get());
		function o() {
			ra().clearTimeout(a), n(t);
		}
		t.ping(o).then(o, () => {
			r(i);
		});
	}));
}
var mo = {
	location: "yes",
	resizable: "yes",
	statusbar: "yes",
	toolbar: "no"
}, ho = 500, go = 600, _o = "_blank", vo = "http://localhost", yo = class {
	constructor(e) {
		this.window = e, this.associatedEvent = null;
	}
	close() {
		if (this.window) try {
			this.window.close();
		} catch {}
	}
};
function bo(e, t, n, r = ho, i = go) {
	let a = Math.max((window.screen.availHeight - i) / 2, 0).toString(), o = Math.max((window.screen.availWidth - r) / 2, 0).toString(), s = "", c = {
		...mo,
		width: r.toString(),
		height: i.toString(),
		top: a,
		left: o
	}, l = h().toLowerCase();
	n && (s = kr(l) ? _o : n), Dr(l) && (t ||= vo, c.scrollbars = "yes");
	let u = Object.entries(c).reduce((e, [t, n]) => `${e}${t}=${n},`, "");
	if (Fr(l) && s !== "_self") return xo(t || "", s), new yo(null);
	let d = window.open(t || "", s, u);
	b(d, e, "popup-blocked");
	try {
		d.focus();
	} catch {}
	return new yo(d);
}
function xo(e, t) {
	let n = document.createElement("a");
	n.href = e, n.target = t;
	let r = document.createEvent("MouseEvent");
	r.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), n.dispatchEvent(r);
}
var So = "__/auth/handler", Co = "emulator/auth/handler", wo = "fac";
async function To(e, t, n, r, i, a) {
	b(e.config.authDomain, e, "auth-domain-config-required"), b(e.config.apiKey, e, "invalid-api-key");
	let o = {
		apiKey: e.config.apiKey,
		appName: e.name,
		authType: n,
		redirectUrl: r,
		v: Zt,
		eventId: i
	};
	if (t instanceof Ei) {
		t.setDefaultLanguage(e.languageCode), o.providerId = t.providerId || "", ge(t.getCustomParameters()) || (o.customParameters = JSON.stringify(t.getCustomParameters()));
		for (let [e, t] of Object.entries(a || {})) o[e] = t;
	}
	if (t instanceof Di) {
		let e = t.getScopes().filter((e) => e !== "");
		e.length > 0 && (o.scopes = e.join(","));
	}
	e.tenantId && (o.tid = e.tenantId);
	let s = o;
	for (let e of Object.keys(s)) s[e] === void 0 && delete s[e];
	let c = await e._getAppCheckToken(), l = c ? `#${wo}=${encodeURIComponent(c)}` : "";
	return `${Eo(e)}?${ye(s).slice(1)}${l}`;
}
function Eo({ config: e }) {
	return e.emulator ? Rn(e, Co) : `https://${e.authDomain}/${So}`;
}
var Do = "webStorageSupport", Oo = class {
	constructor() {
		this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = Qi, this._completeRedirectFn = Wa, this._overrideRedirectResult = za;
	}
	async _openPopup(e, t, n, r) {
		return jn(this.eventManagers[e._key()]?.manager, "_initialize() not called before _openPopup()"), bo(e, await To(e, t, n, Mn(), r), ta());
	}
	async _openRedirect(e, t, n, r) {
		return await this._originValidation(e), ia(await To(e, t, n, Mn(), r)), new Promise(() => {});
	}
	_initialize(e) {
		let t = e._key();
		if (this.eventManagers[t]) {
			let { manager: e, promise: n } = this.eventManagers[t];
			return e ? Promise.resolve(e) : (jn(n, "If manager is not set, promise should be"), n);
		}
		let n = this.initAndGetManager(e);
		return this.eventManagers[t] = { promise: n }, n.catch(() => {
			delete this.eventManagers[t];
		}), n;
	}
	async initAndGetManager(e) {
		let t = await po(e), n = new Ka(e);
		return t.register("authEvent", (t) => (b(t?.authEvent, e, "invalid-auth-event"), { status: n.onEvent(t.authEvent) ? "ACK" : "ERROR" }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: n }, this.iframes[e._key()] = t, n;
	}
	_isIframeWebStorageSupported(e, t) {
		this.iframes[e._key()].send(Do, { type: Do }, (n) => {
			let r = n?.[0]?.[Do];
			r !== void 0 && t(!!r), Tn(e, "internal-error");
		}, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
	}
	_originValidation(e) {
		let t = e._key();
		return this.originValidationPromises[t] || (this.originValidationPromises[t] = $a(e)), this.originValidationPromises[t];
	}
	get _shouldInitProactively() {
		return Lr() || Or() || Pr();
	}
}, ko = "@firebase/auth", Ao = "1.13.5", jo = class {
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
		b(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth");
	}
	updateProactiveRefresh() {
		this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
	}
};
function Mo(e) {
	switch (e) {
		case "Node": return "node";
		case "ReactNative": return "rn";
		case "Worker": return "webworker";
		case "Cordova": return "cordova";
		case "WebExtension": return "web-extension";
		default: return;
	}
}
function No(e) {
	qt(new Oe("auth", (t, { options: n }) => {
		let r = t.getProvider("app").getImmediate(), i = t.getProvider("heartbeat"), a = t.getProvider("app-check-internal"), { apiKey: o, authDomain: s } = r.options;
		b(o && !o.includes(":"), "invalid-api-key", { appName: r.name });
		let c = new Ur(r, i, a, {
			apiKey: o,
			authDomain: s,
			clientPlatform: e,
			apiHost: "identitytoolkit.googleapis.com",
			tokenApiHost: "securetoken.googleapis.com",
			apiScheme: "https",
			sdkClientVersion: Rr(e)
		});
		return si(c, n), c;
	}, "PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e, t, n) => {
		e.getProvider("auth-internal").initialize();
	})), qt(new Oe("auth-internal", (e) => ((e) => new jo(e))(Wr(e.getProvider("auth").getImmediate())), "PRIVATE").setInstantiationMode("EXPLICIT")), en(ko, Ao, Mo(e)), en(ko, Ao, "esm2020");
}
var Po = ee("authIdTokenMaxAge") || 300, Fo = null, Io = (e) => async (t) => {
	let n = t && await t.getIdTokenResult(), r = n && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(n.issuedAtTime)) / 1e3;
	if (r && r > Po) return;
	let i = n?.token;
	Fo !== i && (Fo = i, await fetch(e, {
		method: i ? "POST" : "DELETE",
		headers: i ? { Authorization: `Bearer ${i}` } : {}
	}));
};
function Lo(e = $t()) {
	let t = Jt(e, "auth");
	if (t.isInitialized()) return t.getImmediate();
	let n = oi(e, {
		popupRedirectResolver: Oo,
		persistence: [
			Ca,
			Xi,
			Qi
		]
	}), r = ee("authTokenSyncURL");
	if (r && typeof isSecureContext == "boolean" && isSecureContext) {
		let e = new URL(r, location.origin);
		if (location.origin === e.origin) {
			let t = Io(e.toString());
			Vi(n, t, () => t(n.currentUser)), Bi(n, (e) => t(e));
		}
	}
	let i = p("auth");
	return i && ci(n, `http://${i}`), n;
}
function Ro() {
	return document.getElementsByTagName("head")?.[0] ?? document;
}
qr({
	loadJS(e) {
		return new Promise((t, n) => {
			let r = document.createElement("script");
			r.setAttribute("src", e), r.onload = t, r.onerror = (e) => {
				let t = En("internal-error");
				t.customData = e, n(t);
			}, r.type = "text/javascript", r.charset = "UTF-8", Ro().appendChild(r);
		});
	},
	gapiScript: "https://apis.google.com/js/api.js",
	recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
	recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
}), No("Browser");
//#endregion
//#region node_modules/@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js
var zo = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Bo = {}, Vo, Ho;
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
		if (e < 0) return te(l(-e));
		let t = [], n = 1;
		for (let r = 0; e >= n; r++) t[r] = e / n | 0, n *= 4294967296;
		return new o(t, 0);
	}
	function u(e, t) {
		if (e.length == 0) throw Error("number format error: empty string");
		if (t ||= 10, t < 2 || 36 < t) throw Error("radix out of range: " + t);
		if (e.charAt(0) == "-") return te(u(e.substring(1), t));
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
		if (ee(this)) return -te(this).m();
		let e = 0, t = 1;
		for (let n = 0; n < this.g.length; n++) {
			let r = this.i(n);
			e += (r >= 0 ? r : 4294967296 + r) * t, t *= 4294967296;
		}
		return e;
	}, e.toString = function(e) {
		if (e ||= 10, e < 2 || 36 < e) throw Error("radix out of range: " + e);
		if (m(this)) return "0";
		if (ee(this)) return "-" + te(this).toString(e);
		let t = l(e ** 6);
		var n = this;
		let r = "";
		for (;;) {
			let i = ie(n, t).g;
			n = h(n, i.j(t));
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
	function ee(e) {
		return e.h == -1;
	}
	e.l = function(e) {
		return e = h(this, e), ee(e) ? -1 : +!m(e);
	};
	function te(e) {
		let t = e.g.length, n = [];
		for (let r = 0; r < t; r++) n[r] = ~e.g[r];
		return new o(n, ~e.h).add(f);
	}
	e.abs = function() {
		return ee(this) ? te(this) : this;
	}, e.add = function(e) {
		let t = Math.max(this.g.length, e.g.length), n = [], r = 0;
		for (let i = 0; i <= t; i++) {
			let t = r + (this.i(i) & 65535) + (e.i(i) & 65535), a = (t >>> 16) + (this.i(i) >>> 16) + (e.i(i) >>> 16);
			r = a >>> 16, t &= 65535, a &= 65535, n[i] = a << 16 | t;
		}
		return new o(n, n[n.length - 1] & -2147483648 ? -1 : 0);
	};
	function h(e, t) {
		return e.add(te(t));
	}
	e.j = function(e) {
		if (m(this) || m(e)) return d;
		if (ee(this)) return ee(e) ? te(this).j(te(e)) : te(te(this).j(e));
		if (ee(e)) return te(this.j(te(e)));
		if (this.l(p) < 0 && e.l(p) < 0) return l(this.m() * e.m());
		let t = this.g.length + e.g.length, n = [];
		for (var r = 0; r < 2 * t; r++) n[r] = 0;
		for (r = 0; r < this.g.length; r++) for (let t = 0; t < e.g.length; t++) {
			let i = this.i(r) >>> 16, a = this.i(r) & 65535, o = e.i(t) >>> 16, s = e.i(t) & 65535;
			n[2 * r + 2 * t] += a * s, ne(n, 2 * r + 2 * t), n[2 * r + 2 * t + 1] += i * s, ne(n, 2 * r + 2 * t + 1), n[2 * r + 2 * t + 1] += a * o, ne(n, 2 * r + 2 * t + 1), n[2 * r + 2 * t + 2] += i * o, ne(n, 2 * r + 2 * t + 2);
		}
		for (e = 0; e < t; e++) n[e] = n[2 * e + 1] << 16 | n[2 * e];
		for (e = t; e < 2 * t; e++) n[e] = 0;
		return new o(n, 0);
	};
	function ne(e, t) {
		for (; (e[t] & 65535) != e[t];) e[t + 1] += e[t] >>> 16, e[t] &= 65535, t++;
	}
	function re(e, t) {
		this.g = e, this.h = t;
	}
	function ie(e, t) {
		if (m(t)) throw Error("division by zero");
		if (m(e)) return new re(d, d);
		if (ee(e)) return t = ie(te(e), t), new re(te(t.g), te(t.h));
		if (ee(t)) return t = ie(e, te(t)), new re(te(t.g), t.h);
		if (e.g.length > 30) {
			if (ee(e) || ee(t)) throw Error("slowDivide_ only works with positive integers.");
			for (var n = f, r = t; r.l(e) <= 0;) n = ae(n), r = ae(r);
			var i = oe(n, 1), a = oe(r, 1);
			for (r = oe(r, 2), n = oe(n, 2); !m(r);) {
				var o = a.add(r);
				o.l(e) <= 0 && (i = i.add(n), a = o), r = oe(r, 1), n = oe(n, 1);
			}
			return t = h(e, i.j(t)), new re(i, t);
		}
		for (i = d; e.l(t) >= 0;) {
			for (n = Math.max(1, Math.floor(e.m() / t.m())), r = Math.ceil(Math.log(n) / Math.LN2), r = r <= 48 ? 1 : 2 ** (r - 48), a = l(n), o = a.j(t); ee(o) || o.l(e) > 0;) n -= r, a = l(n), o = a.j(t);
			m(a) && (a = f), i = i.add(a), e = h(e, o);
		}
		return new re(i, e);
	}
	e.B = function(e) {
		return ie(this, e).h;
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
	function ae(e) {
		let t = e.g.length + 1, n = [];
		for (let r = 0; r < t; r++) n[r] = e.i(r) << 1 | e.i(r - 1) >>> 31;
		return new o(n, e.h);
	}
	function oe(e, t) {
		let n = t >> 5;
		t %= 32;
		let r = e.g.length - n, i = [];
		for (let a = 0; a < r; a++) i[a] = t > 0 ? e.i(a + n) >>> t | e.i(a + n + 1) << 32 - t : e.i(a + n);
		return new o(i, e.h);
	}
	r.prototype.digest = r.prototype.A, r.prototype.reset = r.prototype.u, r.prototype.update = r.prototype.v, Ho = Bo.Md5 = r, o.prototype.add = o.prototype.add, o.prototype.multiply = o.prototype.j, o.prototype.modulo = o.prototype.B, o.prototype.compare = o.prototype.l, o.prototype.toNumber = o.prototype.m, o.prototype.toString = o.prototype.toString, o.prototype.getBits = o.prototype.i, o.fromNumber = l, o.fromString = u, Vo = Bo.Integer = o;
}).apply(zo === void 0 ? typeof self < "u" ? self : typeof window < "u" ? window : {} : zo);
//#endregion
//#region node_modules/@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js
var Uo = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Wo = {}, Go, Ko, qo, Jo, Yo, Xo, Zo, Qo;
(function() {
	var e, t = Object.defineProperty;
	function n(e) {
		e = [
			typeof globalThis == "object" && globalThis,
			e,
			typeof window == "object" && window,
			typeof self == "object" && self,
			typeof Uo == "object" && Uo
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
	class ee {
		constructor(e, t) {
			this.i = e, this.j = t, this.h = 0, this.g = null;
		}
		get() {
			let e;
			return this.h > 0 ? (this.h--, e = this.g, this.g = e.next, e.next = null) : e = this.i(), e;
		}
	}
	function te(e) {
		o.setTimeout(() => {
			throw e;
		}, 0);
	}
	function h() {
		var e = se;
		let t = null;
		return e.g && (t = e.g, e.g = e.g.next, e.g || (e.h = null), t.next = null), t;
	}
	class ne {
		constructor() {
			this.h = this.g = null;
		}
		add(e, t) {
			let n = re.get();
			n.set(e, t), this.h ? this.h.next = n : this.g = n, this.h = n;
		}
	}
	var re = new ee(() => new ie(), (e) => e.reset());
	class ie {
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
	let ae, oe = !1, se = new ne(), ce = () => {
		let e = Promise.resolve(void 0);
		ae = () => {
			e.then(le);
		};
	};
	function le() {
		for (var e; e = h();) {
			try {
				e.h.call(e.g);
			} catch (e) {
				te(e);
			}
			var t = re;
			t.j(e), t.h < 100 && (t.h++, e.next = t.g, t.g = e);
		}
		oe = !1;
	}
	function ue() {
		this.u = this.u, this.C = this.C;
	}
	ue.prototype.u = !1, ue.prototype.dispose = function() {
		this.u || (this.u = !0, this.N());
	}, ue.prototype[Symbol.dispose] = function() {
		this.dispose();
	}, ue.prototype.N = function() {
		if (this.C) for (; this.C.length;) this.C.shift()();
	};
	function de(e, t) {
		this.type = e, this.g = this.target = t, this.defaultPrevented = !1;
	}
	de.prototype.h = function() {
		this.defaultPrevented = !0;
	};
	var fe = function() {
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
	function pe(e) {
		return /^[\s\xa0]*$/.test(e);
	}
	function me(e, t) {
		de.call(this, e ? e.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, e && this.init(e, t);
	}
	d(me, de), me.prototype.init = function(e, t) {
		let n = this.type = e.type, r = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null;
		this.target = e.target || e.srcElement, this.g = t, t = e.relatedTarget, t || (n == "mouseover" ? t = e.fromElement : n == "mouseout" && (t = e.toElement)), this.relatedTarget = t, r ? (this.clientX = r.clientX === void 0 ? r.pageX : r.clientX, this.clientY = r.clientY === void 0 ? r.pageY : r.clientY, this.screenX = r.screenX || 0, this.screenY = r.screenY || 0) : (this.clientX = e.clientX === void 0 ? e.pageX : e.clientX, this.clientY = e.clientY === void 0 ? e.pageY : e.clientY, this.screenX = e.screenX || 0, this.screenY = e.screenY || 0), this.button = e.button, this.key = e.key || "", this.ctrlKey = e.ctrlKey, this.altKey = e.altKey, this.shiftKey = e.shiftKey, this.metaKey = e.metaKey, this.pointerId = e.pointerId || 0, this.pointerType = e.pointerType, this.state = e.state, this.i = e, e.defaultPrevented && me.Z.h.call(this);
	}, me.prototype.h = function() {
		me.Z.h.call(this);
		let e = this.i;
		e.preventDefault ? e.preventDefault() : e.returnValue = !1;
	};
	var he = "closure_listenable_" + (Math.random() * 1e6 | 0), ge = 0;
	function _e(e, t, n, r, i) {
		this.listener = e, this.proxy = null, this.src = t, this.type = n, this.capture = !!r, this.ha = i, this.key = ++ge, this.da = this.fa = !1;
	}
	function ve(e) {
		e.da = !0, e.listener = null, e.proxy = null, e.src = null, e.ha = null;
	}
	function ye(e, t, n) {
		for (let r in e) t.call(n, e[r], r, e);
	}
	function be(e, t) {
		for (let n in e) t.call(void 0, e[n], n, e);
	}
	function xe(e) {
		let t = {};
		for (let n in e) t[n] = e[n];
		return t;
	}
	let Se = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
	function Ce(e, t) {
		let n, r;
		for (let t = 1; t < arguments.length; t++) {
			for (n in r = arguments[t], r) e[n] = r[n];
			for (let t = 0; t < Se.length; t++) n = Se[t], Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
		}
	}
	function we(e) {
		this.src = e, this.g = {}, this.h = 0;
	}
	we.prototype.add = function(e, t, n, r, i) {
		let a = e.toString();
		e = this.g[a], e || (e = this.g[a] = [], this.h++);
		let o = g(e, t, r, i);
		return o > -1 ? (t = e[o], n || (t.fa = !1)) : (t = new _e(t, this.src, a, !!r, i), t.fa = n, e.push(t)), t;
	};
	function Te(e, t) {
		let n = t.type;
		if (n in e.g) {
			var r = e.g[n], i = Array.prototype.indexOf.call(r, t, void 0), a;
			(a = i >= 0) && Array.prototype.splice.call(r, i, 1), a && (ve(t), e.g[n].length == 0 && (delete e.g[n], e.h--));
		}
	}
	function g(e, t, n, r) {
		for (let i = 0; i < e.length; ++i) {
			let a = e[i];
			if (!a.da && a.listener == t && a.capture == !!n && a.ha == r) return i;
		}
		return -1;
	}
	var Ee = "closure_lm_" + (Math.random() * 1e6 | 0), De = {};
	function Oe(e, t, n, r, i) {
		if (Array.isArray(t)) {
			for (let a = 0; a < t.length; a++) Oe(e, t[a], n, r, i);
			return null;
		}
		return n = Ie(n), e && e[he] ? e.J(t, n, s(r) ? !!r.capture : !1, i) : ke(e, t, n, !1, r, i);
	}
	function ke(e, t, n, r, i, a) {
		if (!t) throw Error("Invalid event type");
		let o = s(i) ? !!i.capture : !!i, c = _(e);
		if (c || (e[Ee] = c = new we(e)), n = c.add(t, n, r, o, a), n.proxy) return n;
		if (r = Ae(), n.proxy = r, r.src = e, r.listener = n, e.addEventListener) fe || (i = o), i === void 0 && (i = !1), e.addEventListener(t.toString(), r, i);
		else if (e.attachEvent) e.attachEvent(Ne(t.toString()), r);
		else if (e.addListener && e.removeListener) e.addListener(r);
		else throw Error("addEventListener and attachEvent are unavailable.");
		return n;
	}
	function Ae() {
		function e(n) {
			return t.call(e.src, e.listener, n);
		}
		let t = Pe;
		return e;
	}
	function je(e, t, n, r, i) {
		if (Array.isArray(t)) for (var a = 0; a < t.length; a++) je(e, t[a], n, r, i);
		else r = s(r) ? !!r.capture : !!r, n = Ie(n), e && e[he] ? (e = e.i, a = String(t).toString(), a in e.g && (t = e.g[a], n = g(t, n, r, i), n > -1 && (ve(t[n]), Array.prototype.splice.call(t, n, 1), t.length == 0 && (delete e.g[a], e.h--)))) : (e &&= _(e)) && (t = e.g[t.toString()], e = -1, t && (e = g(t, n, r, i)), (n = e > -1 ? t[e] : null) && Me(n));
	}
	function Me(e) {
		if (typeof e != "number" && e && !e.da) {
			var t = e.src;
			if (t && t[he]) Te(t.i, e);
			else {
				var n = e.type, r = e.proxy;
				t.removeEventListener ? t.removeEventListener(n, r, e.capture) : t.detachEvent ? t.detachEvent(Ne(n), r) : t.addListener && t.removeListener && t.removeListener(r), (n = _(t)) ? (Te(n, e), n.h == 0 && (n.src = null, t[Ee] = null)) : ve(e);
			}
		}
	}
	function Ne(e) {
		return e in De ? De[e] : De[e] = "on" + e;
	}
	function Pe(e, t) {
		if (e.da) e = !0;
		else {
			t = new me(t, this);
			let n = e.listener, r = e.ha || e.src;
			e.fa && Me(e), e = n.call(r, t);
		}
		return e;
	}
	function _(e) {
		return e = e[Ee], e instanceof we ? e : null;
	}
	var Fe = "__closure_events_fn_" + (Math.random() * 1e9 >>> 0);
	function Ie(e) {
		return typeof e == "function" ? e : (e[Fe] || (e[Fe] = function(t) {
			return e.handleEvent(t);
		}), e[Fe]);
	}
	function Le() {
		ue.call(this), this.i = new we(this), this.M = this, this.G = null;
	}
	d(Le, ue), Le.prototype[he] = !0, Le.prototype.removeEventListener = function(e, t, n, r) {
		je(this, e, t, n, r);
	};
	function Re(e, t) {
		var n, r = e.G;
		if (r) for (n = []; r; r = r.G) n.push(r);
		if (e = e.M, r = t.type || t, typeof t == "string") t = new de(t, e);
		else if (t instanceof de) t.target = t.target || e;
		else {
			var i = t;
			t = new de(r, e), Ce(t, i);
		}
		i = !0;
		let a, o;
		if (n) for (o = n.length - 1; o >= 0; o--) a = t.g = n[o], i = ze(a, r, !0, t) && i;
		if (a = t.g = e, i = ze(a, r, !0, t) && i, i = ze(a, r, !1, t) && i, n) for (o = 0; o < n.length; o++) a = t.g = n[o], i = ze(a, r, !1, t) && i;
	}
	Le.prototype.N = function() {
		if (Le.Z.N.call(this), this.i) {
			var e = this.i;
			for (let t in e.g) {
				let n = e.g[t];
				for (let e = 0; e < n.length; e++) ve(n[e]);
				delete e.g[t], e.h--;
			}
		}
		this.G = null;
	}, Le.prototype.J = function(e, t, n, r) {
		return this.i.add(String(e), t, !1, n, r);
	}, Le.prototype.K = function(e, t, n, r) {
		return this.i.add(String(e), t, !0, n, r);
	};
	function ze(e, t, n, r) {
		if (t = e.i.g[String(t)], !t) return !0;
		t = t.concat();
		let i = !0;
		for (let a = 0; a < t.length; ++a) {
			let o = t[a];
			if (o && !o.da && o.capture == n) {
				let t = o.listener, n = o.ha || o.src;
				o.fa && Te(e.i, o), i = t.call(n, r) !== !1 && i;
			}
		}
		return i && !r.defaultPrevented;
	}
	function Be(e, t) {
		if (typeof e != "function") {
			if (e && typeof e.handleEvent == "function") e = l(e.handleEvent, e);
			else throw Error("Invalid listener argument");
		}
		return Number(t) > 2147483647 ? -1 : o.setTimeout(e, t || 0);
	}
	function Ve(e) {
		e.g = Be(() => {
			e.g = null, e.i && (e.i = !1, Ve(e));
		}, e.l);
		let t = e.h;
		e.h = null, e.m.apply(null, t);
	}
	class He extends ue {
		constructor(e, t) {
			super(), this.m = e, this.l = t, this.h = null, this.i = !1, this.g = null;
		}
		j(e) {
			this.h = arguments, this.g ? this.i = !0 : Ve(this);
		}
		N() {
			super.N(), this.g && (o.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
		}
	}
	function Ue(e) {
		ue.call(this), this.h = e, this.g = {};
	}
	d(Ue, ue);
	var We = [];
	function Ge(e) {
		ye(e.g, function(e, t) {
			this.g.hasOwnProperty(t) && Me(e);
		}, e), e.g = {};
	}
	Ue.prototype.N = function() {
		Ue.Z.N.call(this), Ge(this);
	}, Ue.prototype.handleEvent = function() {
		throw Error("EventHandler.handleEvent not implemented");
	};
	var Ke = o.JSON.stringify, qe = o.JSON.parse, Je = class {
		stringify(e) {
			return o.JSON.stringify(e, void 0);
		}
		parse(e) {
			return o.JSON.parse(e, void 0);
		}
	};
	function Ye() {}
	function Xe() {}
	var Ze = {
		OPEN: "a",
		hb: "b",
		ERROR: "c",
		tb: "d"
	};
	function Qe() {
		de.call(this, "d");
	}
	d(Qe, de);
	function $e() {
		de.call(this, "c");
	}
	d($e, de);
	var et = {}, tt = null;
	function nt() {
		return tt ||= new Le();
	}
	et.Ia = "serverreachability";
	function rt(e) {
		de.call(this, et.Ia, e);
	}
	d(rt, de);
	function it(e) {
		let t = nt();
		Re(t, new rt(t));
	}
	et.STAT_EVENT = "statevent";
	function at(e, t) {
		de.call(this, et.STAT_EVENT, e), this.stat = t;
	}
	d(at, de);
	function ot(e) {
		let t = nt();
		Re(t, new at(t, e));
	}
	et.Ja = "timingevent";
	function st(e, t) {
		de.call(this, et.Ja, e), this.size = t;
	}
	d(st, de);
	function ct(e, t) {
		if (typeof e != "function") throw Error("Fn must not be null and must be a function");
		return o.setTimeout(function() {
			e();
		}, t);
	}
	function lt() {
		this.g = !0;
	}
	lt.prototype.ua = function() {
		this.g = !1;
	};
	function ut(e, t, n, r, i, a) {
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
	function dt(e, t, n, r, i, a, o) {
		e.info(function() {
			return "XMLHTTP RESP (" + r + ") [ attempt " + i + "]: " + t + "\n" + n + "\n" + a + " " + o;
		});
	}
	function ft(e, t, n, r) {
		e.info(function() {
			return "XMLHTTP TEXT (" + t + "): " + mt(e, n) + (r ? " " + r : "");
		});
	}
	function pt(e, t) {
		e.info(function() {
			return "TIMEOUT: " + t;
		});
	}
	lt.prototype.info = function() {};
	function mt(e, t) {
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
			return Ke(a);
		} catch {
			return t;
		}
	}
	var ht = {
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
	}, gt = {
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
	}, _t;
	function vt() {}
	d(vt, Ye), vt.prototype.g = function() {
		return new XMLHttpRequest();
	}, _t = new vt();
	function yt(e) {
		return encodeURIComponent(String(e));
	}
	function bt(e) {
		var t = 1;
		e = e.split(":");
		let n = [];
		for (; t > 0 && e.length;) n.push(e.shift()), t--;
		return e.length && n.push(e.join(":")), n;
	}
	function xt(e, t, n, r) {
		this.j = e, this.i = t, this.l = n, this.S = r || 1, this.V = new Ue(this), this.H = 45e3, this.J = null, this.o = !1, this.u = this.B = this.A = this.M = this.F = this.T = this.D = null, this.G = [], this.g = null, this.C = 0, this.m = this.v = null, this.X = -1, this.K = !1, this.P = 0, this.O = null, this.W = this.L = this.U = this.R = !1, this.h = new St();
	}
	function St() {
		this.i = null, this.g = "", this.h = !1;
	}
	var Ct = {}, wt = {};
	function Tt(e, t, n) {
		e.M = 1, e.A = Zt(qt(t)), e.u = n, e.R = !0, Et(e, null);
	}
	function Et(e, t) {
		e.F = Date.now(), At(e), e.B = qt(e.A);
		var n = e.B, r = e.S;
		Array.isArray(r) || (r = [String(r)]), fn(n.i, "t", r), e.C = 0, n = e.j.L, e.h = new St(), e.g = tr(e.j, n ? t : null, !e.u), e.P > 0 && (e.O = new He(l(e.Y, e, e.g), e.P)), t = e.V, n = e.g, r = e.ba;
		var i = "readystatechange";
		Array.isArray(i) || (i && (We[0] = i.toString()), i = We);
		for (let e = 0; e < i.length; e++) {
			let a = Oe(n, i[e], r || t.handleEvent, !1, t.h || t);
			if (!a) break;
			t.g[a.key] = a;
		}
		t = e.J ? xe(e.J) : {}, e.u ? (e.v ||= "POST", t["Content-Type"] = "application/x-www-form-urlencoded", e.g.ea(e.B, e.v, e.u, t)) : (e.v = "GET", e.g.ea(e.B, e.v, null, t)), it(), ut(e.i, e.v, e.B, e.l, e.S, e.u);
	}
	xt.prototype.ba = function(e) {
		e = e.target;
		let t = this.O;
		t && Mn(e) == 3 ? t.j() : this.Y(e);
	}, xt.prototype.Y = function(e) {
		try {
			if (e == this.g) a: {
				let s = Mn(this.g), c = this.g.ya(), l = this.g.ca();
				if (!(s < 3) && (s != 3 || this.g && (this.h.h || this.g.la() || Nn(this.g)))) {
					this.K || s != 4 || c == 7 || it(c == 8 || l <= 0 ? 3 : 2), Mt(this);
					var t = this.g.ca();
					this.X = t;
					var n = Dt(this);
					if (this.o = t == 200, dt(this.i, this.v, this.B, this.l, this.S, s, t), this.o) {
						if (this.U && !this.L) {
							b: {
								if (this.g) {
									var r, i = this.g;
									if ((r = i.g ? i.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !pe(r)) {
										var a = r;
										break b;
									}
								}
								a = null;
							}
							if (e = a) ft(this.i, this.l, e, "Initial handshake response via X-HTTP-Initial-Response"), this.L = !0, Ft(this, e);
							else {
								this.o = !1, this.m = 3, ot(12), Pt(this), Nt(this);
								break a;
							}
						}
						if (this.R) {
							e = !0;
							let t;
							for (; !this.K && this.C < n.length;) if (t = kt(this, n), t == wt) {
								s == 4 && (this.m = 4, ot(14), e = !1), ft(this.i, this.l, null, "[Incomplete Response]");
								break;
							} else if (t == Ct) {
								this.m = 4, ot(15), ft(this.i, this.l, n, "[Invalid Chunk]"), e = !1;
								break;
							} else ft(this.i, this.l, t, null), Ft(this, t);
							if (Ot(this) && this.C != 0 && (this.h.g = this.h.g.slice(this.C), this.C = 0), s != 4 || n.length != 0 || this.h.h || (this.m = 1, ot(16), e = !1), this.o = this.o && e, !e) ft(this.i, this.l, n, "[Invalid Chunked Response]"), Pt(this), Nt(this);
							else if (n.length > 0 && !this.W) {
								this.W = !0;
								var o = this.j;
								o.g == this && o.aa && !o.P && (o.j.info("Great, no buffering proxy detected. Bytes received: " + n.length), qn(o), o.P = !0, ot(11));
							}
						} else ft(this.i, this.l, n, null), Ft(this, n);
						s == 4 && Pt(this), this.o && !this.K && (s == 4 ? Xn(this.j, this) : (this.o = !1, At(this)));
					} else Pn(this.g), t == 400 && n.indexOf("Unknown SID") > 0 ? (this.m = 3, ot(12)) : (this.m = 0, ot(13)), Pt(this), Nt(this);
				}
			}
		} catch {}
	};
	function Dt(e) {
		if (!Ot(e)) return e.g.la();
		let t = Nn(e.g);
		if (t === "") return "";
		let n = "", r = t.length, i = Mn(e.g) == 4;
		if (!e.h.i) {
			if (typeof TextDecoder > "u") return Pt(e), Nt(e), "";
			e.h.i = new o.TextDecoder();
		}
		for (let a = 0; a < r; a++) e.h.h = !0, n += e.h.i.decode(t[a], { stream: !(i && a == r - 1) });
		return t.length = 0, e.h.g += n, e.C = 0, e.h.g;
	}
	function Ot(e) {
		return e.g ? e.v == "GET" && e.M != 2 && e.j.Aa : !1;
	}
	function kt(e, t) {
		var n = e.C, r = t.indexOf("\n", n);
		return r == -1 ? wt : (n = Number(t.substring(n, r)), isNaN(n) ? Ct : (r += 1, r + n > t.length ? wt : (t = t.slice(r, r + n), e.C = r + n, t)));
	}
	xt.prototype.cancel = function() {
		this.K = !0, Pt(this);
	};
	function At(e) {
		e.T = Date.now() + e.H, jt(e, e.H);
	}
	function jt(e, t) {
		if (e.D != null) throw Error("WatchDog timer not null");
		e.D = ct(l(e.aa, e), t);
	}
	function Mt(e) {
		e.D &&= (o.clearTimeout(e.D), null);
	}
	xt.prototype.aa = function() {
		this.D = null;
		let e = Date.now();
		e - this.T >= 0 ? (pt(this.i, this.B), this.M != 2 && (it(), ot(17)), Pt(this), this.m = 2, Nt(this)) : jt(this, this.T - e);
	};
	function Nt(e) {
		e.j.I == 0 || e.K || Xn(e.j, e);
	}
	function Pt(e) {
		Mt(e);
		var t = e.O;
		t && typeof t.dispose == "function" && t.dispose(), e.O = null, Ge(e.V), e.g && (t = e.g, e.g = null, t.abort(), t.dispose());
	}
	function Ft(e, t) {
		try {
			var n = e.j;
			if (n.I != 0 && (n.g == e || Bt(n.h, e))) {
				if (!e.L && Bt(n.h, e) && n.I == 3) {
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
									if (n.g.F + 3e3 < e.F) Yn(n), Rn(n);
									else break a;
								}
								Kn(n), ot(18);
							}
						} else n.xa = i[1], 0 < n.xa - n.K && i[2] < 37500 && n.F && n.A == 0 && !n.C && (n.C = ct(l(n.Va, n), 6e3));
						zt(n.h) <= 1 && n.ta && (n.ta = void 0);
					} else Qn(n, 11);
				} else if ((e.L || n.g == e) && Yn(n), !pe(t)) for (i = n.Ba.g.parse(t), t = 0; t < i.length; t++) {
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
										a.g || e.indexOf("spdy") == -1 && e.indexOf("quic") == -1 && e.indexOf("h2") == -1 || (a.j = a.l, a.g = /* @__PURE__ */ new Set(), a.h &&= (Vt(a, a.h), null));
									}
									if (r.G) {
										let e = d.g ? d.g.getResponseHeader("X-HTTP-Session-Id") : null;
										e && (r.wa = e, v(r.J, r.G, e));
									}
								}
								n.I = 3, n.l && n.l.ra(), n.aa && (n.T = Date.now() - e.F, n.j.info("Handshake RTT: " + n.T + "ms")), r = n;
								var o = e;
								if (r.na = er(r, r.L ? r.ba : null, r.W), o.L) {
									Ht(r.h, o);
									var s = o, c = r.O;
									c && (s.H = c), s.D && (Mt(s), At(s)), r.g = o;
								} else Gn(r);
								n.i.length > 0 && Bn(n);
							} else l[0] != "stop" && l[0] != "close" || Qn(n, 7);
						} else n.I == 3 && (l[0] == "stop" || l[0] == "close" ? l[0] == "stop" ? Qn(n, 7) : Ln(n) : l[0] != "noop" && n.l && n.l.qa(l), n.A = 0);
					}
				}
			}
			it(4);
		} catch {}
	}
	var It = class {
		constructor(e, t) {
			this.g = e, this.map = t;
		}
	};
	function Lt(e) {
		this.l = e || 10, o.PerformanceNavigationTiming ? (e = o.performance.getEntriesByType("navigation"), e = e.length > 0 && (e[0].nextHopProtocol == "hq" || e[0].nextHopProtocol == "h2")) : e = !!(o.chrome && o.chrome.loadTimes && o.chrome.loadTimes() && o.chrome.loadTimes().wasFetchedViaSpdy), this.j = e ? this.l : 1, this.g = null, this.j > 1 && (this.g = /* @__PURE__ */ new Set()), this.h = null, this.i = [];
	}
	function Rt(e) {
		return e.h ? !0 : e.g ? e.g.size >= e.j : !1;
	}
	function zt(e) {
		return e.h ? 1 : e.g ? e.g.size : 0;
	}
	function Bt(e, t) {
		return e.h ? e.h == t : e.g ? e.g.has(t) : !1;
	}
	function Vt(e, t) {
		e.g ? e.g.add(t) : e.h = t;
	}
	function Ht(e, t) {
		e.h && e.h == t ? e.h = null : e.g && e.g.has(t) && e.g.delete(t);
	}
	Lt.prototype.cancel = function() {
		if (this.i = Ut(this), this.h) this.h.cancel(), this.h = null;
		else if (this.g && this.g.size !== 0) {
			for (let e of this.g.values()) e.cancel();
			this.g.clear();
		}
	};
	function Ut(e) {
		if (e.h != null) return e.i.concat(e.h.G);
		if (e.g != null && e.g.size !== 0) {
			let t = e.i;
			for (let n of e.g.values()) t = t.concat(n.G);
			return t;
		}
		return p(e.i);
	}
	var Wt = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
	function Gt(e, t) {
		if (e) {
			e = e.split("&");
			for (let n = 0; n < e.length; n++) {
				let r = e[n].indexOf("="), i, a = null;
				r >= 0 ? (i = e[n].substring(0, r), a = e[n].substring(r + 1)) : i = e[n], t(i, a ? decodeURIComponent(a.replace(/\+/g, " ")) : "");
			}
		}
	}
	function Kt(e) {
		this.g = this.o = this.j = "", this.u = null, this.m = this.h = "", this.l = !1;
		let t;
		e instanceof Kt ? (this.l = e.l, Jt(this, e.j), this.o = e.o, this.g = e.g, Yt(this, e.u), this.h = e.h, Xt(this, pn(e.i)), this.m = e.m) : e && (t = String(e).match(Wt)) ? (this.l = !1, Jt(this, t[1] || "", !0), this.o = Qt(t[2] || ""), this.g = Qt(t[3] || "", !0), Yt(this, t[4]), this.h = Qt(t[5] || "", !0), Xt(this, t[6] || "", !0), this.m = Qt(t[7] || "")) : (this.l = !1, this.i = new sn(null, this.l));
	}
	Kt.prototype.toString = function() {
		let e = [];
		var t = this.j;
		t && e.push($t(t, tn, !0), ":");
		var n = this.g;
		return (n || t == "file") && (e.push("//"), (t = this.o) && e.push($t(t, tn, !0), "@"), e.push(yt(n).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), n = this.u, n != null && e.push(":", String(n))), (n = this.h) && (this.g && n.charAt(0) != "/" && e.push("/"), e.push($t(n, n.charAt(0) == "/" ? rn : nn, !0))), (n = this.i.toString()) && e.push("?", n), (n = this.m) && e.push("#", $t(n, on)), e.join("");
	}, Kt.prototype.resolve = function(e) {
		let t = qt(this), n = !!e.j;
		n ? Jt(t, e.j) : n = !!e.o, n ? t.o = e.o : n = !!e.g, n ? t.g = e.g : n = e.u != null;
		var r = e.h;
		if (n) Yt(t, e.u);
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
		return n ? t.h = r : n = e.i.toString() !== "", n ? Xt(t, pn(e.i)) : n = !!e.m, n && (t.m = e.m), t;
	};
	function qt(e) {
		return new Kt(e);
	}
	function Jt(e, t, n) {
		e.j = n ? Qt(t, !0) : t, e.j &&= e.j.replace(/:$/, "");
	}
	function Yt(e, t) {
		if (t) {
			if (t = Number(t), isNaN(t) || t < 0) throw Error("Bad port number " + t);
			e.u = t;
		} else e.u = null;
	}
	function Xt(e, t, n) {
		t instanceof sn ? (e.i = t, hn(e.i, e.l)) : (n || (t = $t(t, an)), e.i = new sn(t, e.l));
	}
	function v(e, t, n) {
		e.i.set(t, n);
	}
	function Zt(e) {
		return v(e, "zx", Math.floor(Math.random() * 2147483648).toString(36) + Math.abs(Math.floor(Math.random() * 2147483648) ^ Date.now()).toString(36)), e;
	}
	function Qt(e, t) {
		return e ? t ? decodeURI(e.replace(/%25/g, "%2525")) : decodeURIComponent(e) : "";
	}
	function $t(e, t, n) {
		return typeof e == "string" ? (e = encodeURI(e).replace(t, en), n && (e = e.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), e) : null;
	}
	function en(e) {
		return e = e.charCodeAt(0), "%" + (e >> 4 & 15).toString(16) + (e & 15).toString(16);
	}
	var tn = /[#\/\?@]/g, nn = /[#\?:]/g, rn = /[#\?]/g, an = /[#\?@]/g, on = /#/g;
	function sn(e, t) {
		this.h = this.g = null, this.i = e || null, this.j = !!t;
	}
	function cn(e) {
		e.g || (e.g = /* @__PURE__ */ new Map(), e.h = 0, e.i && Gt(e.i, function(t, n) {
			e.add(decodeURIComponent(t.replace(/\+/g, " ")), n);
		}));
	}
	e = sn.prototype, e.add = function(e, t) {
		cn(this), this.i = null, e = mn(this, e);
		let n = this.g.get(e);
		return n || this.g.set(e, n = []), n.push(t), this.h += 1, this;
	};
	function ln(e, t) {
		cn(e), t = mn(e, t), e.g.has(t) && (e.i = null, e.h -= e.g.get(t).length, e.g.delete(t));
	}
	function un(e, t) {
		return cn(e), t = mn(e, t), e.g.has(t);
	}
	e.forEach = function(e, t) {
		cn(this), this.g.forEach(function(n, r) {
			n.forEach(function(n) {
				e.call(t, n, r, this);
			}, this);
		}, this);
	};
	function dn(e, t) {
		cn(e);
		let n = [];
		if (typeof t == "string") un(e, t) && (n = n.concat(e.g.get(mn(e, t))));
		else for (e = Array.from(e.g.values()), t = 0; t < e.length; t++) n = n.concat(e[t]);
		return n;
	}
	e.set = function(e, t) {
		return cn(this), this.i = null, e = mn(this, e), un(this, e) && (this.h -= this.g.get(e).length), this.g.set(e, [t]), this.h += 1, this;
	}, e.get = function(e, t) {
		return e ? (e = dn(this, e), e.length > 0 ? String(e[0]) : t) : t;
	};
	function fn(e, t, n) {
		ln(e, t), n.length > 0 && (e.i = null, e.g.set(mn(e, t), p(n)), e.h += n.length);
	}
	e.toString = function() {
		if (this.i) return this.i;
		if (!this.g) return "";
		let e = [], t = Array.from(this.g.keys());
		for (let r = 0; r < t.length; r++) {
			var n = t[r];
			let i = yt(n);
			n = dn(this, n);
			for (let t = 0; t < n.length; t++) {
				let r = i;
				n[t] !== "" && (r += "=" + yt(n[t])), e.push(r);
			}
		}
		return this.i = e.join("&");
	};
	function pn(e) {
		let t = new sn();
		return t.i = e.i, e.g && (t.g = new Map(e.g), t.h = e.h), t;
	}
	function mn(e, t) {
		return t = String(t), e.j && (t = t.toLowerCase()), t;
	}
	function hn(e, t) {
		t && !e.j && (cn(e), e.i = null, e.g.forEach(function(e, t) {
			let n = t.toLowerCase();
			t != n && (ln(this, t), fn(this, n, e));
		}, e)), e.j = t;
	}
	function gn(e, t) {
		let n = new lt();
		if (o.Image) {
			let r = new Image();
			r.onload = u(vn, n, "TestLoadImage: loaded", !0, t, r), r.onerror = u(vn, n, "TestLoadImage: error", !1, t, r), r.onabort = u(vn, n, "TestLoadImage: abort", !1, t, r), r.ontimeout = u(vn, n, "TestLoadImage: timeout", !1, t, r), o.setTimeout(function() {
				r.ontimeout && r.ontimeout();
			}, 1e4), r.src = e;
		} else t(!1);
	}
	function _n(e, t) {
		let n = new lt(), r = new AbortController(), i = setTimeout(() => {
			r.abort(), vn(n, "TestPingServer: timeout", !1, t);
		}, 1e4);
		fetch(e, { signal: r.signal }).then((e) => {
			clearTimeout(i), e.ok ? vn(n, "TestPingServer: ok", !0, t) : vn(n, "TestPingServer: server error", !1, t);
		}).catch(() => {
			clearTimeout(i), vn(n, "TestPingServer: error", !1, t);
		});
	}
	function vn(e, t, n, r, i) {
		try {
			i && (i.onload = null, i.onerror = null, i.onabort = null, i.ontimeout = null), r(n);
		} catch {}
	}
	function yn() {
		this.g = new Je();
	}
	function bn(e) {
		this.i = e.Sb || null, this.h = e.ab || !1;
	}
	d(bn, Ye), bn.prototype.g = function() {
		return new xn(this.i, this.h);
	};
	function xn(e, t) {
		Le.call(this), this.H = e, this.o = t, this.m = void 0, this.status = this.readyState = 0, this.responseType = this.responseText = this.response = this.statusText = "", this.onreadystatechange = null, this.A = new Headers(), this.h = null, this.F = "GET", this.D = "", this.g = !1, this.B = this.j = this.l = null, this.v = new AbortController();
	}
	d(xn, Le), e = xn.prototype, e.open = function(e, t) {
		if (this.readyState != 0) throw this.abort(), Error("Error reopening a connection");
		this.F = e, this.D = t, this.readyState = 1, wn(this);
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
		this.response = this.responseText = "", this.A = new Headers(), this.status = 0, this.v.abort(), this.j && this.j.cancel("Request was aborted.").catch(() => {}), this.readyState >= 1 && this.g && this.readyState != 4 && (this.g = !1, Cn(this)), this.readyState = 0;
	}, e.Pa = function(e) {
		if (this.g && (this.l = e, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = e.headers, this.readyState = 2, wn(this)), this.g && (this.readyState = 3, wn(this), this.g))) {
			if (this.responseType === "arraybuffer") e.arrayBuffer().then(this.Na.bind(this), this.ga.bind(this));
			else if (o.ReadableStream !== void 0 && "body" in e) {
				if (this.j = e.body.getReader(), this.o) {
					if (this.responseType) throw Error("responseType must be empty for \"streamBinaryChunks\" mode responses.");
					this.response = [];
				} else this.response = this.responseText = "", this.B = new TextDecoder();
				Sn(this);
			} else e.text().then(this.Oa.bind(this), this.ga.bind(this));
		}
	};
	function Sn(e) {
		e.j.read().then(e.Ma.bind(e)).catch(e.ga.bind(e));
	}
	e.Ma = function(e) {
		if (this.g) {
			if (this.o && e.value) this.response.push(e.value);
			else if (!this.o) {
				var t = e.value ? e.value : /* @__PURE__ */ new Uint8Array();
				(t = this.B.decode(t, { stream: !e.done })) && (this.response = this.responseText += t);
			}
			e.done ? Cn(this) : wn(this), this.readyState == 3 && Sn(this);
		}
	}, e.Oa = function(e) {
		this.g && (this.response = this.responseText = e, Cn(this));
	}, e.Na = function(e) {
		this.g && (this.response = e, Cn(this));
	}, e.ga = function() {
		this.g && Cn(this);
	};
	function Cn(e) {
		e.readyState = 4, e.l = null, e.j = null, e.B = null, wn(e);
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
	function wn(e) {
		e.onreadystatechange && e.onreadystatechange.call(e);
	}
	Object.defineProperty(xn.prototype, "withCredentials", {
		get: function() {
			return this.m === "include";
		},
		set: function(e) {
			this.m = e ? "include" : "same-origin";
		}
	});
	function Tn(e) {
		let t = "";
		return ye(e, function(e, n) {
			t += n, t += ":", t += e, t += "\r\n";
		}), t;
	}
	function En(e, t, n) {
		a: {
			for (r in n) {
				var r = !1;
				break a;
			}
			r = !0;
		}
		r || (n = Tn(n), typeof e == "string" || v(e, t, n));
	}
	function y(e) {
		Le.call(this), this.headers = /* @__PURE__ */ new Map(), this.L = e || null, this.h = !1, this.g = null, this.D = "", this.o = 0, this.l = "", this.j = this.B = this.v = this.A = !1, this.m = null, this.F = "", this.H = !1;
	}
	d(y, Le);
	var Dn = /^https?$/i, On = ["POST", "PUT"];
	e = y.prototype, e.Fa = function(e) {
		this.H = e;
	}, e.ea = function(e, t, n, r) {
		if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + e);
		t = t ? t.toUpperCase() : "GET", this.D = e, this.l = "", this.o = 0, this.A = !1, this.h = !0, this.g = this.L ? this.L.g() : _t.g(), this.g.onreadystatechange = f(l(this.Ca, this));
		try {
			this.B = !0, this.g.open(t, String(e), !0), this.B = !1;
		} catch (e) {
			kn(this, e);
			return;
		}
		if (e = n || "", n = new Map(this.headers), r) {
			if (Object.getPrototypeOf(r) === Object.prototype) for (var i in r) n.set(i, r[i]);
			else if (typeof r.keys == "function" && typeof r.get == "function") for (let e of r.keys()) n.set(e, r.get(e));
			else throw Error("Unknown input type for opt_headers: " + String(r));
		}
		r = Array.from(n.keys()).find((e) => e.toLowerCase() == "content-type"), i = o.FormData && e instanceof o.FormData, !(Array.prototype.indexOf.call(On, t, void 0) >= 0) || r || i || n.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
		for (let [e, t] of n) this.g.setRequestHeader(e, t);
		this.F && (this.g.responseType = this.F), "withCredentials" in this.g && this.g.withCredentials !== this.H && (this.g.withCredentials = this.H);
		try {
			this.m &&= (clearTimeout(this.m), null), this.v = !0, this.g.send(e), this.v = !1;
		} catch (e) {
			kn(this, e);
		}
	};
	function kn(e, t) {
		e.h = !1, e.g && (e.j = !0, e.g.abort(), e.j = !1), e.l = t, e.o = 5, b(e), jn(e);
	}
	function b(e) {
		e.A || (e.A = !0, Re(e, "complete"), Re(e, "error"));
	}
	e.abort = function(e) {
		this.g && this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1, this.o = e || 7, Re(this, "complete"), Re(this, "abort"), jn(this));
	}, e.N = function() {
		this.g && (this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1), jn(this, !0)), y.Z.N.call(this);
	}, e.Ca = function() {
		this.u || (this.B || this.v || this.j ? An(this) : this.Xa());
	}, e.Xa = function() {
		An(this);
	};
	function An(e) {
		if (e.h && a !== void 0) {
			if (e.v && Mn(e) == 4) setTimeout(e.Ca.bind(e), 0);
			else if (Re(e, "readystatechange"), Mn(e) == 4) {
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
							let t = String(e.D).match(Wt)[1] || null;
							!t && o.self && o.self.location && (t = o.self.location.protocol.slice(0, -1)), r = !Dn.test(t ? t.toLowerCase() : "");
						}
						n = r;
					}
					if (n) Re(e, "complete"), Re(e, "success");
					else {
						e.o = 6;
						try {
							var i = Mn(e) > 2 ? e.g.statusText : "";
						} catch {
							i = "";
						}
						e.l = i + " [" + e.ca() + "]", b(e);
					}
				} finally {
					jn(e);
				}
			}
		}
	}
	function jn(e, t) {
		if (e.g) {
			e.m &&= (clearTimeout(e.m), null);
			let n = e.g;
			e.g = null, t || Re(e, "ready");
			try {
				n.onreadystatechange = null;
			} catch {}
		}
	}
	e.isActive = function() {
		return !!this.g;
	};
	function Mn(e) {
		return e.g ? e.g.readyState : 0;
	}
	e.ca = function() {
		try {
			return Mn(this) > 2 ? this.g.status : -1;
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
			return e && t.indexOf(e) == 0 && (t = t.substring(e.length)), qe(t);
		}
	};
	function Nn(e) {
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
	function Pn(e) {
		let t = {};
		e = (e.g && Mn(e) >= 2 && e.g.getAllResponseHeaders() || "").split("\r\n");
		for (let r = 0; r < e.length; r++) {
			if (pe(e[r])) continue;
			var n = bt(e[r]);
			let i = n[0];
			if (n = n[1], typeof n != "string") continue;
			n = n.trim();
			let a = t[i] || [];
			t[i] = a, a.push(n);
		}
		be(t, function(e) {
			return e.join(", ");
		});
	}
	e.ya = function() {
		return this.o;
	}, e.Ha = function() {
		return typeof this.l == "string" ? this.l : String(this.l);
	};
	function Fn(e, t, n) {
		return n && n.internalChannelParams && n.internalChannelParams[e] || t;
	}
	function In(e) {
		this.za = 0, this.i = [], this.j = new lt(), this.ba = this.na = this.J = this.W = this.g = this.wa = this.G = this.H = this.u = this.U = this.o = null, this.Ya = this.V = 0, this.Sa = Fn("failFast", !1, e), this.F = this.C = this.v = this.m = this.l = null, this.X = !0, this.xa = this.K = -1, this.Y = this.A = this.D = 0, this.Qa = Fn("baseRetryDelayMs", 5e3, e), this.Za = Fn("retryDelaySeedMs", 1e4, e), this.Ta = Fn("forwardChannelMaxRetries", 2, e), this.va = Fn("forwardChannelRequestTimeoutMs", 2e4, e), this.ma = e && e.xmlHttpFactory || void 0, this.Ua = e && e.Rb || void 0, this.Aa = e && e.useFetchStreams || !1, this.O = void 0, this.L = e && e.supportsCrossDomainXhr || !1, this.M = "", this.h = new Lt(e && e.concurrentRequestLimit), this.Ba = new yn(), this.S = e && e.fastHandshake || !1, this.R = e && e.encodeInitMessageHeaders || !1, this.S && this.R && (this.R = !1), this.Ra = e && e.Pb || !1, e && e.ua && this.j.ua(), e && e.forceLongPolling && (this.X = !1), this.aa = !this.S && this.X && e && e.detectBufferingProxy || !1, this.ia = void 0, e && e.longPollingTimeout && e.longPollingTimeout > 0 && (this.ia = e.longPollingTimeout), this.ta = void 0, this.T = 0, this.P = !1, this.ja = this.B = null;
	}
	e = In.prototype, e.ka = 8, e.I = 1, e.connect = function(e, t, n, r) {
		ot(0), this.W = e, this.H = t || {}, n && r !== void 0 && (this.H.OSID = n, this.H.OAID = r), this.F = this.X, this.J = er(this, null, this.W), Bn(this);
	};
	function Ln(e) {
		if (zn(e), e.I == 3) {
			var t = e.V++, n = qt(e.J);
			if (v(n, "SID", e.M), v(n, "RID", t), v(n, "TYPE", "terminate"), Un(e, n), t = new xt(e, e.j, t), t.M = 2, t.A = Zt(qt(n)), n = !1, o.navigator && o.navigator.sendBeacon) try {
				n = o.navigator.sendBeacon(t.A.toString(), "");
			} catch {}
			!n && o.Image && (new Image().src = t.A, n = !0), n || (t.g = tr(t.j, null), t.g.ea(t.A)), t.F = Date.now(), At(t);
		}
		$n(e);
	}
	function Rn(e) {
		e.g &&= (qn(e), e.g.cancel(), null);
	}
	function zn(e) {
		Rn(e), e.v &&= (o.clearTimeout(e.v), null), Yn(e), e.h.cancel(), e.m &&= (typeof e.m == "number" && o.clearTimeout(e.m), null);
	}
	function Bn(e) {
		if (!Rt(e.h) && !e.m) {
			e.m = !0;
			var t = e.Ea;
			ae || ce(), oe ||= (ae(), !0), se.add(t, e), e.D = 0;
		}
	}
	function Vn(e, t) {
		return zt(e.h) >= e.h.j - +!!e.m ? !1 : e.m ? (e.i = t.G.concat(e.i), !0) : e.I == 1 || e.I == 2 || e.D >= (e.Sa ? 0 : e.Ta) ? !1 : (e.m = ct(l(e.Ea, e, t), Zn(e, e.D)), e.D++, !0);
	}
	e.Ea = function(e) {
		if (this.m) {
			if (this.m = null, this.I == 1) {
				if (!e) {
					this.V = Math.floor(Math.random() * 1e5), e = this.V++;
					let i = new xt(this, this.j, e), a = this.o;
					if (this.U && (a ? (a = xe(a), Ce(a, this.U)) : a = this.U), this.u !== null || this.R || (i.J = a, a = null), this.S) a: {
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
					t = Wn(this, i, t), n = qt(this.J), v(n, "RID", e), v(n, "CVER", 22), this.G && v(n, "X-HTTP-Session-Id", this.G), Un(this, n), a && (this.R ? t = "headers=" + yt(Tn(a)) + "&" + t : this.u && En(n, this.u, a)), Vt(this.h, i), this.Ra && v(n, "TYPE", "init"), this.S ? (v(n, "$req", t), v(n, "SID", "null"), i.U = !0, Tt(i, n, null)) : Tt(i, n, t), this.I = 2;
				}
			} else this.I == 3 && (e ? Hn(this, e) : this.i.length == 0 || Rt(this.h) || Hn(this));
		}
	};
	function Hn(e, t) {
		var n = t ? t.l : e.V++;
		let r = qt(e.J);
		v(r, "SID", e.M), v(r, "RID", n), v(r, "AID", e.K), Un(e, r), e.u && e.o && En(r, e.u, e.o), n = new xt(e, e.j, n, e.D + 1), e.u === null && (n.J = e.o), t && (e.i = t.G.concat(e.i)), t = Wn(e, n, 1e3), n.H = Math.round(e.va * .5) + Math.round(e.va * .5 * Math.random()), Vt(e.h, n), Tt(n, r, t);
	}
	function Un(e, t) {
		e.H && ye(e.H, function(e, n) {
			v(t, n, e);
		}), e.l && ye({}, function(e, n) {
			v(t, n, e);
		});
	}
	function Wn(e, t, n) {
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
								s(n) && (r = Ke(n)), e.push(a + t + "=" + encodeURIComponent(r));
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
	function Gn(e) {
		if (!e.g && !e.v) {
			e.Y = 1;
			var t = e.Da;
			ae || ce(), oe ||= (ae(), !0), se.add(t, e), e.A = 0;
		}
	}
	function Kn(e) {
		return e.g || e.v || e.A >= 3 ? !1 : (e.Y++, e.v = ct(l(e.Da, e), Zn(e, e.A)), e.A++, !0);
	}
	e.Da = function() {
		if (this.v = null, Jn(this), this.aa && !(this.P || this.g == null || this.T <= 0)) {
			var e = 4 * this.T;
			this.j.info("BP detection timer enabled: " + e), this.B = ct(l(this.Wa, this), e);
		}
	}, e.Wa = function() {
		this.B && (this.B = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = !1, this.P = !0, ot(10), Rn(this), Jn(this));
	};
	function qn(e) {
		e.B != null && (o.clearTimeout(e.B), e.B = null);
	}
	function Jn(e) {
		e.g = new xt(e, e.j, "rpc", e.Y), e.u === null && (e.g.J = e.o), e.g.P = 0;
		var t = qt(e.na);
		v(t, "RID", "rpc"), v(t, "SID", e.M), v(t, "AID", e.K), v(t, "CI", e.F ? "0" : "1"), !e.F && e.ia && v(t, "TO", e.ia), v(t, "TYPE", "xmlhttp"), Un(e, t), e.u && e.o && En(t, e.u, e.o), e.O && (e.g.H = e.O);
		var n = e.g;
		e = e.ba, n.M = 1, n.A = Zt(qt(t)), n.u = null, n.R = !0, Et(n, e);
	}
	e.Va = function() {
		this.C != null && (this.C = null, Rn(this), Kn(this), ot(19));
	};
	function Yn(e) {
		e.C != null && (o.clearTimeout(e.C), e.C = null);
	}
	function Xn(e, t) {
		var n = null;
		if (e.g == t) {
			Yn(e), qn(e), e.g = null;
			var r = 2;
		} else if (Bt(e.h, t)) n = t.G, Ht(e.h, t), r = 1;
		else return;
		if (e.I != 0) {
			if (t.o) {
				if (r == 1) {
					n = t.u ? t.u.length : 0, t = Date.now() - t.F;
					var i = e.D;
					r = nt(), Re(r, new st(r, n)), Bn(e);
				} else Gn(e);
			} else if (i = t.m, i == 3 || i == 0 && t.X > 0 || !(r == 1 && Vn(e, t) || r == 2 && Kn(e))) switch (n && n.length > 0 && (t = e.h, t.i = t.i.concat(n)), i) {
				case 1:
					Qn(e, 5);
					break;
				case 4:
					Qn(e, 10);
					break;
				case 3:
					Qn(e, 6);
					break;
				default: Qn(e, 2);
			}
		}
	}
	function Zn(e, t) {
		let n = e.Qa + Math.floor(Math.random() * e.Za);
		return e.isActive() || (n *= 2), n * t;
	}
	function Qn(e, t) {
		if (e.j.info("Error code " + t), t == 2) {
			var n = l(e.bb, e), r = e.Ua;
			let t = !r;
			r = new Kt(r || "//www.google.com/images/cleardot.gif"), o.location && o.location.protocol == "http" || Jt(r, "https"), Zt(r), t ? gn(r.toString(), n) : _n(r.toString(), n);
		} else ot(2);
		e.I = 0, e.l && e.l.pa(t), $n(e), zn(e);
	}
	e.bb = function(e) {
		e ? (this.j.info("Successfully pinged google.com"), ot(2)) : (this.j.info("Failed to ping google.com"), ot(1));
	};
	function $n(e) {
		if (e.I = 0, e.ja = [], e.l) {
			let t = Ut(e.h);
			(t.length != 0 || e.i.length != 0) && (m(e.ja, t), m(e.ja, e.i), e.h.i.length = 0, p(e.i), e.i.length = 0), e.l.oa();
		}
	}
	function er(e, t, n) {
		var r = n instanceof Kt ? qt(n) : new Kt(n);
		if (r.g != "") t && (r.g = t + "." + r.g), Yt(r, r.u);
		else {
			var i = o.location;
			r = i.protocol, t = t ? t + "." + i.hostname : i.hostname, i = +i.port;
			let e = new Kt(null);
			r && Jt(e, r), t && (e.g = t), i && Yt(e, i), n && (e.h = n), r = e;
		}
		return n = e.G, t = e.wa, n && t && v(r, n, t), v(r, "VER", e.ka), Un(e, r), r;
	}
	function tr(e, t, n) {
		if (t && !e.L) throw Error("Can't create secondary domain capable XhrIo object.");
		return t = e.Aa && !e.ma ? new y(new bn({ ab: n })) : new y(e.ma), t.Fa(e.L), t;
	}
	e.isActive = function() {
		return !!this.l && this.l.isActive(this);
	};
	function nr() {}
	e = nr.prototype, e.ra = function() {}, e.qa = function() {}, e.pa = function() {}, e.oa = function() {}, e.isActive = function() {
		return !0;
	}, e.Ka = function() {};
	function rr() {}
	rr.prototype.g = function(e, t) {
		return new ir(e, t);
	};
	function ir(e, t) {
		Le.call(this), this.g = new In(t), this.l = e, this.h = t && t.messageUrlParams || null, e = t && t.messageHeaders || null, t && t.clientProtocolHeaderRequired && (e ? e["X-Client-Protocol"] = "webchannel" : e = { "X-Client-Protocol": "webchannel" }), this.g.o = e, e = t && t.initMessageHeaders || null, t && t.messageContentType && (e ? e["X-WebChannel-Content-Type"] = t.messageContentType : e = { "X-WebChannel-Content-Type": t.messageContentType }), t && t.sa && (e ? e["X-WebChannel-Client-Profile"] = t.sa : e = { "X-WebChannel-Client-Profile": t.sa }), this.g.U = e, (e = t && t.Qb) && !pe(e) && (this.g.u = e), this.A = t && t.supportsCrossDomainXhr || !1, this.v = t && t.sendRawJson || !1, (t &&= t.httpSessionIdParam) && !pe(t) && (this.g.G = t, e = this.h, e !== null && t in e && (e = this.h, t in e && delete e[t])), this.j = new sr(this);
	}
	d(ir, Le), ir.prototype.m = function() {
		this.g.l = this.j, this.A && (this.g.L = !0), this.g.connect(this.l, this.h || void 0);
	}, ir.prototype.close = function() {
		Ln(this.g);
	}, ir.prototype.o = function(e) {
		var t = this.g;
		if (typeof e == "string") {
			var n = {};
			n.__data__ = e, e = n;
		} else this.v && (n = {}, n.__data__ = Ke(e), e = n);
		t.i.push(new It(t.Ya++, e)), t.I == 3 && Bn(t);
	}, ir.prototype.N = function() {
		this.g.l = null, delete this.j, Ln(this.g), delete this.g, ir.Z.N.call(this);
	};
	function ar(e) {
		Qe.call(this), e.__headers__ && (this.headers = e.__headers__, this.statusCode = e.__status__, delete e.__headers__, delete e.__status__);
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
	d(ar, Qe);
	function or() {
		$e.call(this), this.status = 1;
	}
	d(or, $e);
	function sr(e) {
		this.g = e;
	}
	d(sr, nr), sr.prototype.ra = function() {
		Re(this.g, "a");
	}, sr.prototype.qa = function(e) {
		Re(this.g, new ar(e));
	}, sr.prototype.pa = function(e) {
		Re(this.g, new or());
	}, sr.prototype.oa = function() {
		Re(this.g, "b");
	}, rr.prototype.createWebChannel = rr.prototype.g, ir.prototype.send = ir.prototype.o, ir.prototype.open = ir.prototype.m, ir.prototype.close = ir.prototype.close, Qo = Wo.createWebChannelTransport = function() {
		return new rr();
	}, Zo = Wo.getStatEventTarget = function() {
		return nt();
	}, Xo = Wo.Event = et, Yo = Wo.Stat = {
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
	}, ht.NO_ERROR = 0, ht.TIMEOUT = 8, ht.HTTP_ERROR = 6, Jo = Wo.ErrorCode = ht, gt.COMPLETE = "complete", qo = Wo.EventType = gt, Xe.EventType = Ze, Ze.OPEN = "a", Ze.CLOSE = "b", Ze.ERROR = "c", Ze.MESSAGE = "d", Le.prototype.listen = Le.prototype.J, Ko = Wo.WebChannel = Xe, y.prototype.listenOnce = y.prototype.K, y.prototype.getLastError = y.prototype.Ha, y.prototype.getLastErrorCode = y.prototype.ya, y.prototype.getStatus = y.prototype.ca, y.prototype.getResponseJson = y.prototype.La, y.prototype.getResponseText = y.prototype.la, y.prototype.send = y.prototype.ea, y.prototype.setWithCredentials = y.prototype.Fa, Go = Wo.XhrIo = y;
}).apply(Uo === void 0 ? typeof self < "u" ? self : typeof window < "u" ? window : {} : Uo);
//#endregion
//#region node_modules/re2js/build/index.js
var x = class e {
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
}, $o = {
	CASE_INSENSITIVE: 1,
	DOTALL: 2,
	MULTILINE: 4,
	DISABLE_UNICODE_GROUPS: 8,
	LONGEST_MATCH: 16,
	LOOKBEHINDS: 512
}, es = 128, ts = new Int32Array(es), ns = new Int32Array(es), rs = 65535;
for (let e = 0; e < es; e++) e >= 97 && e <= 122 ? ts[e] = e - 32 : ts[e] = e, e >= 65 && e <= 90 ? ns[e] = e + 32 : ns[e] = e;
var S = class {
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
		if (e < es) return ts[e];
		let t = String.fromCodePoint(e).toUpperCase(), n = t.codePointAt(0) > rs ? 2 : 1;
		if (t.length > n) return e;
		let r = String.fromCodePoint(t.codePointAt(0)).toLowerCase(), i = r.codePointAt(0) > rs ? 2 : 1;
		return r.length > i || r.codePointAt(0) !== e ? e : t.codePointAt(0);
	}
	static toLowerCase(e) {
		if (e < es) return ns[e];
		let t = String.fromCodePoint(e).toLowerCase(), n = t.codePointAt(0) > rs ? 2 : 1;
		if (t.length > n) return e;
		let r = String.fromCodePoint(t.codePointAt(0)).toUpperCase(), i = r.codePointAt(0) > rs ? 2 : 1;
		return r.length > i || r.codePointAt(0) !== e ? e : t.codePointAt(0);
	}
}, C = class {
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
}, is = /* @__PURE__ */ new Uint8Array(256);
for (let e = 0; e < 64; e++) is["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-".charCodeAt(e)] = e;
var as = (e) => {
	let t = [], n = 0, r = 0;
	for (let i = 0; i < e.length; i++) {
		let a = is[e.charCodeAt(i)];
		n |= (a & 31) << r, a & 32 ? r += 5 : (t.push(n), n = 0, r = 0);
	}
	return t;
}, w = (e, t) => {
	let n = as(e), r = t ? n.length / 2 : n.length / 3, i = new Uint32Array(r * 3), a = 0, o = 0;
	for (let e = 0; e < r; e++) a += n[o++], i[e * 3] = a, a += n[o++], i[e * 3 + 1] = a, i[e * 3 + 2] = t ? 1 : n[o++];
	return i;
}, os = (e) => {
	let t = as(e), n = /* @__PURE__ */ new Map(), r = 0;
	for (let e = 0; e < t.length; e += 2) {
		r += t[e];
		let i = t[e + 1], a = i >>> 1 ^ -(i & 1);
		n.set(r, r + a);
	}
	return n;
}, ss = class {
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
}, cs = class {
	static _CASE_ORBIT = null;
	static get CASE_ORBIT() {
		return this._CASE_ORBIT ||= os("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC"), this._CASE_ORBIT;
	}
	static _Print = null;
	static get Print() {
		return this._Print ||= new C(w("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB", !1)), this._Print;
	}
	static CATEGORIES = new ss({
		C: () => new C(w("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB", !1)),
		Cc: () => new C(w("AfgDgB", !0)),
		Cf: () => new C(w("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB", !1)),
		Cn: () => new C(w("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB", !1)),
		Co: () => new C(w("gg4B-nGh4hc9--BD9--B", !0)),
		Cs: () => new C(w("gg2B--B", !0)),
		L: () => new C(w("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		LC: () => new C(w("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB", !1)),
		Ll: () => new C(w("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB", !1)),
		Lm: () => new C(w("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB", !1)),
		Lo: () => new C(w("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		Lt: () => new C(w("lOGDnB2sH2sHBGBJHBJHBNQQwBAB", !1)),
		Lu: () => new C(w("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB", !1)),
		M: () => new C(w("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", !1)),
		Mc: () => new C(w("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB", !1)),
		Me: () => new C(w("okBBB1xF-wB-wBBCBCCBsshBCB", !1)),
		Mn: () => new C(w("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", !1)),
		N: () => new C(w("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB", !1)),
		Nd: () => new C(w("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ", !0)),
		Nl: () => new C(w("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB", !1)),
		No: () => new C(w("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB", !1)),
		P: () => new C(w("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", !1)),
		Pc: () => new C(w("-Cg-Hg-HBUU-u3BBBZCBwHAB", !1)),
		Pd: () => new C(w("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", !1)),
		Pe: () => new C(w("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD", !1)),
		Pf: () => new C(w("7F+6H+6HEddpuDCCFDDQEE", !1)),
		Pi: () => new C(w("rFt7Ht7HDBBDaapuDCCFDDQEE", !1)),
		Po: () => new C(w("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", !1)),
		Ps: () => new C(w("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB", !1)),
		S: () => new C(w("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", !1)),
		Sc: () => new C(w("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC", !1)),
		Sk: () => new C(w("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB", !1)),
		Sm: () => new C(w("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB", !1)),
		So: () => new C(w("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", !1)),
		Z: () => new C(w("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB", !1)),
		Zl: () => new C(w("ohIA", !0)),
		Zp: () => new C(w("phIA", !0)),
		Zs: () => new C(w("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB", !1)),
		ASCII_Hex_Digit: () => new C(w("wBJIFbF", !0)),
		Alphabetic: () => new C(w("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		Dash: () => new C(w("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", !1)),
		Emoji: () => new C(w("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", !1)),
		Emoji_Component: () => new C(w("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB", !1)),
		Emoji_Modifier: () => new C(w("7-8DE", !0)),
		Emoji_Modifier_Base: () => new C(w("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB", !1)),
		Emoji_Presentation: () => new C(w("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", !1)),
		Extended_Pictographic: () => new C(w("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB", !1)),
		Hex_Digit: () => new C(w("wBJIFbFq1-BJIFbF", !0)),
		Lowercase: () => new C(w("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB", !1)),
		Math: () => new C(w("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB", !1)),
		Quotation_Mark: () => new C(w("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB", !1)),
		Terminal_Punctuation: () => new C(w("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB", !1)),
		Uppercase: () => new C(w("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB", !1)),
		White_Space: () => new C(w("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB", !1))
	});
	static get Upper() {
		return this.CATEGORIES.get("Lu");
	}
	static SCRIPTS = new ss({
		Adlam: () => new C(w("go6DrCFJFB", !0)),
		Ahom: () => new C(w("g4lCaDOFW", !0)),
		Anatolian_Hieroglyphs: () => new C(w("ggxCmS", !0)),
		Arabic: () => new C(w("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB", !1)),
		Armenian: () => new C(w("xpBlBDxBDCks9BE", !0)),
		Avestan: () => new C(w("g4iC1BEG", !0)),
		Balinese: () => new C(w("g4GsCCxB", !0)),
		Bamum: () => new C(w("g1pB3CpowB4R", !0)),
		Bassa_Vah: () => new C(w("w26CdDF", !0)),
		Batak: () => new C(w("g+GzBJD", !0)),
		Bengali: () => new C(w("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB", !1)),
		Beria_Erfe: () => new C(w("g17CYDY", !0)),
		Bhaiksuki: () => new C(w("ggnCICsBCNLc", !0)),
		Bopomofo: () => new C(w("qXB6wLqBxDf", !0)),
		Brahmi: () => new C(w("ggkCtCFjBKA", !0)),
		Braille: () => new C(w("ggK-H", !0)),
		Buginese: () => new C(w("gwGbDB", !0)),
		Buhid: () => new C(w("g6FT", !0)),
		Canadian_Aboriginal: () => new C(w("ggF-TxRlC7tgCP", !0)),
		Carian: () => new C(w("g1gCwB", !0)),
		Caucasian_Albanian: () => new C(w("wphCzBMA", !0)),
		Chakma: () => new C(w("gokC0BCR", !0)),
		Cham: () => new C(w("gwqB2BKNDJDD", !0)),
		Cherokee: () => new C(w("g9E1CDFz7lBvC", !0)),
		Chorasmian: () => new C(w("w9jCb", !0)),
		Common: () => new C(w("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB", !1)),
		Coptic: () => new C(w("ifNxkKzDGG", !0)),
		Cuneiform: () => new C(w("ggoC5cnDuDCEMjG", !0)),
		Cypriot: () => new C(w("ggiCFBDCCBqBBCBBEDD", !1)),
		Cypro_Minoan: () => new C(w("w8rCiD", !0)),
		Cyrillic: () => new C(w("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB", !1)),
		Deseret: () => new C(w("gghCvC", !0)),
		Devanagari: () => new C(w("goCwCFODZh7nBfhwcJ", !0)),
		Dives_Akuru: () => new C(w("gomCGBDDDBGBCBBCdBCBBDLBKJB", !1)),
		Dogra: () => new C(w("ggmC7B", !0)),
		Duployan: () => new C(w("ggvDqDGMEIIJDD", !0)),
		Egyptian_Hieroglyphs: () => new C(w("ggsC1iBL68D", !0)),
		Elbasan: () => new C(w("gohCnB", !0)),
		Elymaic: () => new C(w("g-jCW", !0)),
		Ethiopic: () => new C(w("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB", !1)),
		Garay: () => new C(w("gqjClBEcJB", !0)),
		Georgian: () => new C(w("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG", !1)),
		Glagolitic: () => new C(w("ggL-Ch9sDGCQDGCBCE", !0)),
		Gothic: () => new C(w("w5gCa", !0)),
		Grantha: () => new C(w("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB", !1)),
		Greek: () => new C(w("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB", !1)),
		Gujarati: () => new C(w("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB", !1)),
		Gunjala_Gondi: () => new C(w("grnCFCBCkBCBCFIJ", !0)),
		Gurmukhi: () => new C(w("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB", !1)),
		Gurung_Khema: () => new C(w("go4C5B", !0)),
		Han: () => new C(w("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
		Hangul: () => new C(w("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC", !0)),
		Hanifi_Rohingya: () => new C(w("gojCnBJJ", !0)),
		Hanunoo: () => new C(w("g5FU", !0)),
		Hatran: () => new C(w("gniCSCBGE", !0)),
		Hebrew: () => new C(w("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB", !1)),
		Hiragana: () => new C(w("hiM1CBHCBi7-C+IBTeeBBBulQAB", !1)),
		Imperial_Aramaic: () => new C(w("giiCVCI", !0)),
		Inherited: () => new C(w("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB", !1)),
		Inscriptional_Pahlavi: () => new C(w("g7iCSGH", !0)),
		Inscriptional_Parthian: () => new C(w("g6iCVDH", !0)),
		Javanese: () => new C(w("gsqBtCDJFB", !0)),
		Kaithi: () => new C(w("gkkCiCLA", !0)),
		Kannada: () => new C(w("gkDMCCCWCJCEDICCCDIBGCCDDJCC", !0)),
		Katakana: () => new C(w("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB", !1)),
		Kawi: () => new C(w("g4nCQCoBEc", !0)),
		Kayah_Li: () => new C(w("goqBtBCA", !0)),
		Kharoshthi: () => new C(w("gwiCDCBGHCCCcDCFJII", !0)),
		Khitan_Small_Script: () => new C(w("k-7C84G84GB0OBqBAB", !1)),
		Khmer: () => new C(w("g8F9CDJHJnPf", !0)),
		Khojki: () => new C(w("gwkCRCuB", !0)),
		Khudawadi: () => new C(w("w1kC6BGJ", !0)),
		Kirat_Rai: () => new C(w("gq7C5B", !0)),
		Lao: () => new C(w("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB", !1)),
		Latin: () => new C(w("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB", !1)),
		Lepcha: () => new C(w("ggH3BEOEC", !0)),
		Limbu: () => new C(w("goGeBCLBFLBFEEBKB", !1)),
		Linear_A: () => new C(w("gwhC2JKVLH", !0)),
		Linear_B: () => new C(w("gggCLCZCSCBCODNjB6D", !0)),
		Lisu: () => new C(w("wmpBvBx1eA", !0)),
		Lycian: () => new C(w("g0gCc", !0)),
		Lydian: () => new C(w("gpiCZGA", !0)),
		Mahajani: () => new C(w("wqkCmB", !0)),
		Makasar: () => new C(w("g3nCY", !0)),
		Malayalam: () => new C(w("goDMCCCyBCCCFFPDZ", !0)),
		Mandaic: () => new C(w("giCbDA", !0)),
		Manichaean: () => new C(w("g2iCmBFL", !0)),
		Marchen: () => new C(w("wjnCfDVCN", !0)),
		Masaram_Gondi: () => new C(w("gonCGBCBBCrBBECCBCCBHBJJB", !1)),
		Medefaidrin: () => new C(w("gy7C6C", !0)),
		Meetei_Mayek: () => new C(w("g3qBWqGtBDJ", !0)),
		Mende_Kikakui: () => new C(w("gg6DkGDP", !0)),
		Meroitic_Cursive: () => new C(w("gtiCXFTDtB", !0)),
		Meroitic_Hieroglyphs: () => new C(w("gsiCf", !0)),
		Miao: () => new C(w("g47CqCF4BIQ", !0)),
		Modi: () => new C(w("gwlCkCMJ", !0)),
		Mongolian: () => new C(w("ggGBBDCCBSBH4CBIqBB2t-BMB", !1)),
		Mro: () => new C(w("gy6CeCJFB", !0)),
		Multani: () => new C(w("g0kCGBCCCBCBCOBCKB", !1)),
		Myanmar: () => new C(w("ggE-EhqmBeiDfxibT", !0)),
		Nabataean: () => new C(w("gkiCeJI", !0)),
		Nag_Mundari: () => new C(w("wm5DpB", !0)),
		Nandinagari: () => new C(w("gtmCHDtBDK", !0)),
		New_Tai_Lue: () => new C(w("gsGrBFZHKEB", !0)),
		Newa: () => new C(w("gglC7CCE", !0)),
		Nko: () => new C(w("g+B6BDC", !0)),
		Nushu: () => new C(w("h-7CvsQvsQBqMB", !1)),
		Nyiakeng_Puachue_Hmong: () => new C(w("go4DsBENDJFB", !0)),
		Ogham: () => new C(w("g0Fc", !0)),
		Ol_Chiki: () => new C(w("wiHvB", !0)),
		Ol_Onal: () => new C(w("wu5DqBFA", !0)),
		Old_Hungarian: () => new C(w("gkjCyBOyBIF", !0)),
		Old_Italic: () => new C(w("g4gCjBKC", !0)),
		Old_North_Arabian: () => new C(w("g0iCf", !0)),
		Old_Permic: () => new C(w("w6gCqB", !0)),
		Old_Persian: () => new C(w("g9gCjBFN", !0)),
		Old_Sogdian: () => new C(w("g4jCnB", !0)),
		Old_South_Arabian: () => new C(w("gziCf", !0)),
		Old_Turkic: () => new C(w("ggjCoC", !0)),
		Old_Uyghur: () => new C(w("w7jCZ", !0)),
		Oriya: () => new C(w("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR", !0)),
		Osage: () => new C(w("wlhCjBFjB", !0)),
		Osmanya: () => new C(w("gkhCdDJ", !0)),
		Pahawh_Hmong: () => new C(w("g46ClCLJCGCUGS", !0)),
		Palmyrene: () => new C(w("gjiCf", !0)),
		Pau_Cin_Hau: () => new C(w("g2mC4B", !0)),
		Phags_Pa: () => new C(w("giqB3B", !0)),
		Phoenician: () => new C(w("goiCbEA", !0)),
		Psalter_Pahlavi: () => new C(w("g8iCRIDNG", !0)),
		Rejang: () => new C(w("wpqBjBMA", !0)),
		Runic: () => new C(w("g1FqCEK", !0)),
		Samaritan: () => new C(w("ggCtBDO", !0)),
		Saurashtra: () => new C(w("gkqBlCJL", !0)),
		Sharada: () => new C(w("gskC-ChsCH", !0)),
		Shavian: () => new C(w("wihCvB", !0)),
		Siddham: () => new C(w("gslC1BDlB", !0)),
		Sidetic: () => new C(w("gqiCZ", !0)),
		SignWriting: () => new C(w("gg2DrUQECO", !0)),
		Sinhala: () => new C(w("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB", !1)),
		Sogdian: () => new C(w("w5jCpB", !0)),
		Sora_Sompeng: () => new C(w("wmkCYIJ", !0)),
		Soyombo: () => new C(w("wymCyC", !0)),
		Sundanese: () => new C(w("g8G-BhIH", !0)),
		Sunuwar: () => new C(w("g+mChBPJ", !0)),
		Syloti_Nagri: () => new C(w("ggqBsB", !0)),
		Syriac: () => new C(w("g4BNC7BDCxIK", !0)),
		Tagalog: () => new C(w("g4FVKA", !0)),
		Tagbanwa: () => new C(w("g7FMCCCB", !0)),
		Tai_Le: () => new C(w("wqGdDE", !0)),
		Tai_Tham: () => new C(w("gxG+BCcDKHJHN", !0)),
		Tai_Viet: () => new C(w("g0qBiCZE", !0)),
		Tai_Yo: () => new C(w("g25DeCVJB", !0)),
		Takri: () => new C(w("g0lC5BHJ", !0)),
		Tamil: () => new C(w("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB", !1)),
		Tangsa: () => new C(w("wz6CuCCJ", !0)),
		Tangut: () => new C(w("g-7CgBgBB+3GBhQeBiDyDB", !1)),
		Telugu: () => new C(w("ggDMCCCWCPDICCCDIBCCCBDDDJII", !0)),
		Thaana: () => new C(w("g8BxB", !0)),
		Thai: () => new C(w("hwD5BGb", !0)),
		Tibetan: () => new C(w("g4DnCCjBFmBCjBCOCGFB", !0)),
		Tifinagh: () => new C(w("wpL3BIBPA", !0)),
		Tirhuta: () => new C(w("gklCnCJJ", !0)),
		Todhri: () => new C(w("guhCzB", !0)),
		Tolong_Siki: () => new C(w("wtnCrBFJ", !0)),
		Toto: () => new C(w("w04De", !0)),
		Tulu_Tigalari: () => new C(w("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB", !1)),
		Ugaritic: () => new C(w("g8gCdCA", !0)),
		Unknown: () => new C(w("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB", !1)),
		Vai: () => new C(w("gopBrJ", !0)),
		Vithkuqi: () => new C(w("wrhCKCOCGCBCKCOCGCB", !0)),
		Wancho: () => new C(w("g24D5BGA", !0)),
		Warang_Citi: () => new C(w("glmCyCNA", !0)),
		Yezidi: () => new C(w("g0jCpBCCDB", !0)),
		Yi: () => new C(w("ggoBskBE2B", !0)),
		Zanabazar_Square: () => new C(w("gwmCnC", !0))
	});
	static FOLD_CATEGORIES = new ss({
		L: () => new C(w("laA", !0)),
		LC: () => new C(w("laA", !0)),
		Ll: () => new C(w("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", !1)),
		Lt: () => new C(w("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB", !1)),
		Lu: () => new C(w("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", !1)),
		M: () => new C(w("5cgBgBlgHAB", !1)),
		Mn: () => new C(w("5cgBgBlgHAB", !1)),
		Emoji: () => new C(w("8mJA", !0)),
		Extended_Pictographic: () => new C(w("8mJA", !0)),
		Lowercase: () => new C(w("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", !1)),
		Math: () => new C(w("ycGDCHHFMMDDDCHHFAB", !1)),
		Uppercase: () => new C(w("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", !1))
	});
	static FOLD_SCRIPT = new ss({
		Common: () => new C(w("8cgBgB", !1)),
		Greek: () => new C(w("1FwUwU", !1)),
		Inherited: () => new C(w("5cgBgBlgHAB", !1))
	});
}, T = class e {
	static MAX_RUNE = 1114111;
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
		return e.is(cs.Upper, t);
	}
	static isPrint(t) {
		return t <= e.MAX_LATIN1 ? t >= 32 && t < e.MAX_ASCII || t >= 161 && t !== 173 : e.is(cs.Print, t);
	}
	static simpleFold(e) {
		if (cs.CASE_ORBIT.has(e)) return cs.CASE_ORBIT.get(e);
		let t = S.toLowerCase(e);
		return t === e ? S.toUpperCase(e) : t;
	}
	static equalsIgnoreCase(t, n) {
		if (t === n) return !0;
		if (t < 0 || n < 0) return !1;
		if (t <= e.MAX_ASCII && n <= e.MAX_ASCII) return 65 <= t && t <= 90 && (t |= 32), 65 <= n && n <= 90 && (n |= 32), t === n;
		for (let r = e.simpleFold(t); r !== t; r = e.simpleFold(r)) if (r === n) return !0;
		return !1;
	}
}, ls = 256, us = new Uint8Array(ls);
for (let e = 0; e < ls; e++) us[e] = +(97 <= e && e <= 122 || 65 <= e && e <= 90 || 48 <= e && e <= 57 || e === 95);
var ds = null, fs = null, E = class e {
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
		return Array.isArray(e) || e instanceof Uint8Array;
	}
	static isalnum(e) {
		return S.CODES.get("0") <= e && e <= S.CODES.get("9") || S.CODES.get("a") <= e && e <= S.CODES.get("z") || S.CODES.get("A") <= e && e <= S.CODES.get("Z");
	}
	static unhex(e) {
		return S.CODES.get("0") <= e && e <= S.CODES.get("9") ? e - S.CODES.get("0") : S.CODES.get("a") <= e && e <= S.CODES.get("f") ? e - S.CODES.get("a") + 10 : S.CODES.get("A") <= e && e <= S.CODES.get("F") ? e - S.CODES.get("A") + 10 : -1;
	}
	static escapeRune(t) {
		let n = "";
		if (T.isPrint(t)) e.METACHARACTERS.indexOf(String.fromCodePoint(t)) >= 0 && (n += "\\"), n += String.fromCodePoint(t);
		else switch (t) {
			case S.CODES.get("\""):
				n += "\\\"";
				break;
			case S.CODES.get("\\"):
				n += "\\\\";
				break;
			case S.CODES.get("	"):
				n += "\\t";
				break;
			case S.CODES.get("\n"):
				n += "\\n";
				break;
			case S.CODES.get("\r"):
				n += "\\r";
				break;
			case S.CODES.get("\b"):
				n += "\\b";
				break;
			case S.CODES.get("\f"):
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
			n.push(e), r += e > T.MAX_BMP ? 2 : 1;
		}
		return n;
	}
	static runeToString(e) {
		return String.fromCodePoint(e);
	}
	static isWordRune(e) {
		return e < ls && us[e] === 1;
	}
	static emptyOpContext(t, n) {
		let r = 0;
		return t < 0 && (r |= e.EMPTY_BEGIN_TEXT | e.EMPTY_BEGIN_LINE), t === 10 && (r |= e.EMPTY_BEGIN_LINE), n < 0 && (r |= e.EMPTY_END_TEXT | e.EMPTY_END_LINE), n === 10 && (r |= e.EMPTY_END_LINE), e.isWordRune(t) === e.isWordRune(n) ? r |= e.EMPTY_NO_WORD_BOUNDARY : r |= e.EMPTY_WORD_BOUNDARY, r;
	}
	static quoteMeta(t) {
		return t.split("").map((t) => e.METACHARACTERS.indexOf(t) >= 0 ? `\\${t}` : t).join("");
	}
	static charCount(e) {
		return e > T.MAX_BMP ? 2 : 1;
	}
	static toArray(e) {
		let t = e.length, n = Array(t);
		for (let r = 0; r < t; r++) n[r] = e[r];
		return n;
	}
	static stringToUtf8ByteArray(e) {
		if (globalThis.TextEncoder) return ds ||= new TextEncoder(), ds.encode(e);
		{
			let t = [], n = 0;
			for (let r = 0; r < e.length; r++) {
				let i = e.charCodeAt(r);
				i < 128 ? t[n++] = i : i < 2048 ? (t[n++] = i >> 6 | 192, t[n++] = i & 63 | 128) : (i & 64512) === T.MIN_HIGH_SURROGATE && r + 1 < e.length && (e.charCodeAt(r + 1) & 64512) === T.MIN_LOW_SURROGATE ? (i = T.MIN_SUPPLEMENTARY_CODE_POINT + ((i & 1023) << 10) + (e.charCodeAt(++r) & 1023), t[n++] = i >> 18 | 240, t[n++] = i >> 12 & 63 | 128, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128) : (t[n++] = i >> 12 | 224, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128);
			}
			return t;
		}
	}
	static utf8ByteArrayToString(e) {
		if (globalThis.TextDecoder) {
			fs ||= new TextDecoder("utf-8");
			let t = e instanceof Uint8Array ? e : new Uint8Array(e);
			return fs.decode(t);
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
					let a = e[n++], o = e[n++], s = e[n++], c = ((i & 7) << 18 | (a & 63) << 12 | (o & 63) << 6 | s & 63) - T.MIN_SUPPLEMENTARY_CODE_POINT;
					t[r++] = String.fromCharCode(T.MIN_HIGH_SURROGATE + (c >> 10)), t[r++] = String.fromCharCode(T.MIN_LOW_SURROGATE + (c & 1023));
				} else {
					let a = e[n++], o = e[n++];
					t[r++] = String.fromCharCode((i & 15) << 12 | (a & 63) << 6 | o & 63);
				}
			}
			return t.join("");
		}
	}
}, ps = (e = [], t = 0) => {
	let n = Object.create(null);
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t + r;
		n[i] = a, n[a] = i;
	}
	return Object.freeze(n);
}, ms = class e {
	static Encoding = ps(["UTF_16", "UTF_8"]);
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
}, hs = class extends ms {
	constructor(e = null) {
		super(), this.bytes = e;
	}
	getEncoding() {
		return ms.Encoding.UTF_8;
	}
	asCharSequence() {
		return E.utf8ByteArrayToString(this.bytes);
	}
	asBytes() {
		return this.bytes;
	}
	length() {
		return this.bytes.length;
	}
}, gs = class extends ms {
	constructor(e = null) {
		super(), this.charSequence = e;
	}
	getEncoding() {
		return ms.Encoding.UTF_16;
	}
	asCharSequence() {
		return this.charSequence;
	}
	asBytes() {
		return E.stringToUtf8ByteArray(this.charSequence.toString());
	}
	length() {
		return this.charSequence.length;
	}
}, _s = class {
	static utf16(e) {
		return new gs(e);
	}
	static utf8(e) {
		return E.isByteArray(e) ? new hs(e) : new hs(E.stringToUtf8ByteArray(e));
	}
}, vs = class {
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
}, ys = class extends vs {
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
		return e.ac8 ? e.ac8.searchUTF8(this.bytes, this.start + t, this.end) : !1;
	}
	step(e) {
		if (e += this.start, e >= this.end) return vs.EOF();
		let t = this.bytes[e] & 255;
		if (t < 128) return t << 3 | 1;
		if (t >= 194 && t <= 223 && e + 1 < this.end) {
			let n = this.bytes[e + 1] & 255;
			return (n & 192) == 128 ? ((t & 31) << 6 | n & 63) << 3 | 2 : t << 3 | 1;
		}
		if (t >= 224 && t <= 239 && e + 2 < this.end) {
			let n = this.bytes[e + 1] & 255;
			if ((n & 192) != 128) return t << 3 | 1;
			let r = this.bytes[e + 2] & 255;
			return (r & 192) == 128 ? ((t & 15) << 12 | (n & 63) << 6 | r & 63) << 3 | 3 : t << 3 | 1;
		}
		if (t >= 240 && t <= 244 && e + 3 < this.end) {
			let n = this.bytes[e + 1] & 255;
			if ((n & 192) != 128) return t << 3 | 1;
			let r = this.bytes[e + 2] & 255;
			if ((r & 192) != 128) return t << 3 | 1;
			let i = this.bytes[e + 3] & 255;
			return (i & 192) == 128 ? ((t & 7) << 18 | (n & 63) << 12 | (r & 63) << 6 | i & 63) << 3 | 4 : t << 3 | 1;
		}
		return t << 3 | 1;
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
				n < this.start && (n = this.start), t = this.step(n - this.start) >> 3;
			}
		}
		let n = e < this.end ? this.step(e - this.start) >> 3 : -1;
		return E.emptyOpContext(t, n);
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
}, bs = class extends vs {
	constructor(e, t = 0, n = e.length) {
		super(), this.charSequence = e, this.start = t, this.end = n;
	}
	hasString(e, t) {
		let n = this.charSequence.indexOf(e.str, this.start + t);
		return n !== -1 && n <= this.end - e.str.length;
	}
	hasAnyString(e, t) {
		return e.ac16 ? e.ac16.searchUTF16(this.charSequence, this.start + t, this.end) : !1;
	}
	step(e) {
		if (e += this.start, e >= this.end) return vs.EOF();
		let t = this.charSequence.charCodeAt(e);
		if (t < T.MIN_HIGH_SURROGATE || t > T.MAX_HIGH_SURROGATE || e + 1 >= this.end) return t << 3 | 1;
		let n = this.charSequence.charCodeAt(e + 1);
		return n >= T.MIN_LOW_SURROGATE && n <= T.MAX_LOW_SURROGATE ? (t - T.MIN_HIGH_SURROGATE) * 1024 + (n - T.MIN_LOW_SURROGATE) + T.MIN_SUPPLEMENTARY_CODE_POINT << 3 | 2 : t << 3 | 1;
	}
	index(e, t) {
		t += this.start;
		let n = this.charSequence.indexOf(e.prefix, t);
		return n < 0 || n > this.end - e.prefix.length ? -1 : n - t;
	}
	context(e) {
		e += this.start;
		let t = e > this.start && e <= this.end ? this.charSequence.charCodeAt(e - 1) : -1, n = e < this.end ? this.charSequence.charCodeAt(e) : -1;
		return E.emptyOpContext(t, n);
	}
	prefixLength(e) {
		return e.prefix.length;
	}
}, D = class {
	static fromUTF8(e, t = 0, n = e.length) {
		return new ys(e, t, n);
	}
	static fromUTF16(e, t = 0, n = e.length) {
		return new bs(e, t, n);
	}
}, xs = class extends Error {
	constructor(e) {
		super(e), this.name = "RE2JSException";
	}
}, O = class extends xs {
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
}, Ss = class extends xs {
	constructor(e) {
		super(e), this.name = "RE2JSCompileException";
	}
}, Cs = class extends xs {
	constructor(e) {
		super(e), this.name = "RE2JSGroupException";
	}
}, ws = class extends xs {
	constructor(e) {
		super(e), this.name = "RE2JSFlagsException";
	}
}, Ts = class extends xs {
	constructor(e) {
		super(e), this.name = "RE2JSInternalException";
	}
}, Es = class e {
	static MAX_REPLACER_ARGS = 65535;
	static quoteReplacement(e, t = !1) {
		return t ? e.indexOf("\\") < 0 && e.indexOf("$") < 0 ? e : e.split("").map((e) => {
			let t = e.codePointAt(0);
			return t === S.CODES.get("\\") || t === S.CODES.get("$") ? `\\${e}` : e;
		}).join("") : e.indexOf("$") < 0 ? e : e.split("").map((e) => e.codePointAt(0) === S.CODES.get("$") ? "$$" : e).join("");
	}
	constructor(e, t) {
		if (e === null) throw Error("pattern is null");
		this.patternInput = e;
		let n = this.patternInput.re2();
		this.patternGroupCount = n.numberOfCapturingGroups(), this.groups = [], this.namedGroups = n.namedGroups, this.numberOfInstructions = n.numberOfInstructions(), t instanceof ms ? this.resetMatcherInput(t) : E.isByteArray(t) ? this.resetMatcherInput(_s.utf8(t)) : this.resetMatcherInput(_s.utf16(t));
	}
	pattern() {
		return this.patternInput;
	}
	reset() {
		return this.matcherInputLength = this.matcherInput.length(), this.appendPos = 0, this.hasMatch = !1, this.hasGroups = !1, this.anchorFlag = 0, this;
	}
	resetMatcherInput(e) {
		if (e === null) throw Error("input is null");
		return e instanceof ms || (e = E.isByteArray(e) ? _s.utf8(e) : _s.utf16(e)), this.matcherInput = e, this.reset(), this;
	}
	start(e = 0) {
		if (typeof e == "string") {
			let t = this.namedGroups[e];
			if (!Number.isFinite(t)) throw new Cs(`group '${e}' not found`);
			e = t;
		}
		return this.loadGroup(e), this.groups[2 * e];
	}
	end(e = 0) {
		if (typeof e == "string") {
			let t = this.namedGroups[e];
			if (!Number.isFinite(t)) throw new Cs(`group '${e}' not found`);
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
			if (!Number.isFinite(t)) throw new Cs(`group '${e}' not found`);
			e = t;
		}
		let t = this.start(e), n = this.end(e);
		return t < 0 && n < 0 ? null : this.substring(t, n);
	}
	getNamedGroups() {
		if (!this.hasMatch) throw new Cs("perhaps no match attempted");
		let e = Object.create(null);
		for (let t of Object.keys(this.namedGroups)) e[t] = this.group(t);
		return e;
	}
	groupCount() {
		return this.patternGroupCount;
	}
	loadGroup(e) {
		if (e < 0 || e > this.patternGroupCount) throw new Cs(`Group index out of bounds: ${e}`);
		if (!this.hasMatch) throw new Cs("perhaps no match attempted");
		if (e === 0 || this.hasGroups) return;
		let t = this.matcherInputLength, n = this.patternInput.re2().matchMachineInput(this.matcherInput, this.groups[0], t, this.anchorFlag, 1 + this.patternGroupCount);
		if (!n[0]) throw new Cs("inconsistency in matching group data");
		this.groups = n[1], this.hasGroups = !0;
	}
	matches() {
		return this.genMatch(0, x.ANCHOR_BOTH);
	}
	lookingAt() {
		return this.genMatch(0, x.ANCHOR_START);
	}
	find(e = null) {
		if (e !== null) {
			if (e < 0 || e > this.matcherInputLength) throw new Cs(`start index out of bounds: ${e}`);
			return this.reset(), this.genMatch(e, 0);
		}
		if (e = 0, this.hasMatch && (e = this.groups[1], this.groups[0] === this.groups[1])) {
			let t = (this.matcherInput.isUTF16Encoding() ? D.fromUTF16(this.matcherInput.asCharSequence(), 0, this.matcherInputLength) : D.fromUTF8(this.matcherInput.asBytes(), 0, this.matcherInputLength)).step(e);
			t < 0 ? e++ : e += t & 7;
		}
		return this.genMatch(e, x.UNANCHORED);
	}
	genMatch(e, t) {
		let n = this.patternInput.re2().matchMachineInput(this.matcherInput, e, this.matcherInputLength, t, 1);
		return n[0] ? (this.groups = n[1], this.hasMatch = !0, this.hasGroups = this.patternGroupCount === 0, this.anchorFlag = t, !0) : (this.hasMatch = !1, !1);
	}
	substring(e, t) {
		return this.matcherInput.isUTF8Encoding() ? E.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e, t)) : this.matcherInput.asCharSequence().substring(e, t).toString();
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
			if (a === S.CODES.get("\\")) {
				if (n < i && (t += e.substring(n, i)), i++, i >= r) throw new Cs("character to be escaped is missing");
				n = i, i++;
				continue;
			}
			if (a === S.CODES.get("$")) {
				if (n < i && (t += e.substring(n, i)), i + 1 >= r) throw new Cs("Illegal group reference: group index is missing");
				let a = e.codePointAt(i + 1);
				if (S.CODES.get("0") <= a && a <= S.CODES.get("9")) {
					let o = a - S.CODES.get("0"), s = i + 2;
					for (; s < r; s++) {
						let t = e.codePointAt(s);
						if (t < S.CODES.get("0") || t > S.CODES.get("9") || o * 10 + t - S.CODES.get("0") > this.patternGroupCount) break;
						o = o * 10 + t - S.CODES.get("0");
					}
					if (o > this.patternGroupCount) throw new Cs(`n > number of groups: ${o}`);
					let c = this.group(o);
					c !== null && (t += c), i = s, n = i;
				} else if (a === S.CODES.get("{")) {
					let a = i + 2;
					for (; a < r && e.codePointAt(a) !== S.CODES.get("}");) a++;
					if (a >= r) throw new Cs("named capture group is missing trailing '}'");
					let o = e.substring(i + 2, a), s = this.group(o);
					s !== null && (t += s), i = a + 1, n = i;
				} else throw new Cs("Illegal group reference");
				continue;
			}
			i++;
		}
		return n < r && (t += e.substring(n, r)), t;
	}
	appendReplacementInternalJs(e) {
		let t = "", n = 0, r = e.length;
		for (let i = 0; i < r - 1; i++) if (e.codePointAt(i) === S.CODES.get("$")) {
			let a = e.codePointAt(i + 1);
			if (S.CODES.get("$") === a) {
				n < i && (t += e.substring(n, i)), t += "$", i++, n = i + 1;
				continue;
			}
			if (S.CODES.get("&") === a) {
				n < i && (t += e.substring(n, i));
				let r = this.group(0);
				t += r === null ? "$&" : r, i++, n = i + 1;
				continue;
			}
			if (S.CODES.get("`") === a) {
				n < i && (t += e.substring(n, i)), t += this.substring(0, this.start(0)), i++, n = i + 1;
				continue;
			}
			if (S.CODES.get("'") === a) {
				n < i && (t += e.substring(n, i)), t += this.substring(this.end(0), this.matcherInputLength), i++, n = i + 1;
				continue;
			}
			if (S.CODES.get("1") <= a && a <= S.CODES.get("9")) {
				let o = a - S.CODES.get("0");
				for (n < i && (t += e.substring(n, i)), i += 2; i < r && (a = e.codePointAt(i), !(a < S.CODES.get("0") || a > S.CODES.get("9") || o * 10 + a - S.CODES.get("0") > this.patternGroupCount)); i++) o = o * 10 + a - S.CODES.get("0");
				if (o > this.patternGroupCount) {
					t += `$${o}`, n = i, i--;
					continue;
				}
				let s = this.group(o);
				s !== null && (t += s), n = i, i--;
				continue;
			}
			if (a === S.CODES.get("<")) {
				n < i && (t += e.substring(n, i)), i++;
				let r = i + 1;
				for (; r < e.length && e.codePointAt(r) !== S.CODES.get(">") && e.codePointAt(r) !== S.CODES.get(" ");) r++;
				if (r === e.length || e.codePointAt(r) !== S.CODES.get(">")) {
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
			if (this.groupCount() >= e.MAX_REPLACER_ARGS) throw new Cs("Too many capture groups to safely invoke replacer function");
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
}, k = class e {
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
		for (let n of e) t += E.escapeRune(n);
		return t += "\"", t;
	}
	constructor(e) {
		this.op = e, this.out = 0, this.arg = 0, this.runes = [], this.next = null;
	}
	matchRune(e) {
		if (this.runes.length === 1) {
			let t = this.runes[0];
			return (this.arg & x.FOLD_CASE) === 0 ? e === t : T.equalsIgnoreCase(t, e);
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
			return (this.arg & x.FOLD_CASE) === 0 ? e === t ? 0 : -1 : T.equalsIgnoreCase(t, e) ? 0 : -1;
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
				(this.arg & x.FOLD_CASE) === 0 ? "" : "/i",
				" -> ",
				this.out
			].join("");
			case e.RUNE1: return `rune1 ${e.escapeRunes(this.runes)} -> ${this.out}`;
			case e.RUNE_ANY: return `any -> ${this.out}`;
			case e.RUNE_ANY_NOT_NL: return `anynotnl -> ${this.out}`;
			default: throw Error("unhandled case in Inst.toString");
		}
	}
}, Ds = class {
	constructor(e) {
		this.sparse = new Int32Array(e), this.densePcs = new Int32Array(e), this.denseCaps = null, this.size = 0, this.ncap = 0;
	}
	init(e) {
		this.ncap = e;
		let t = this.densePcs.length * e;
		(!this.denseCaps || this.denseCaps.length < t) && (this.denseCaps = new Int32Array(t));
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
		this.size = 0;
	}
	toString() {
		let e = "{";
		for (let t = 0; t < this.size; t++) t !== 0 && (e += ", "), e += this.densePcs[t];
		return e += "}", e;
	}
}, Os = class e {
	static fromRE2(t) {
		let n = new e();
		return n.prog = t.prog, n.re2 = t, n.q0 = new Ds(n.prog.numInst()), n.q1 = new Ds(n.prog.numInst()), n.matched = !1, n.matchcap = new Int32Array(n.prog.numCap < 2 ? 2 : n.prog.numCap), n.ncap = 0, n;
	}
	static fromMachine(t) {
		return e.fromRE2(t.re2);
	}
	constructor() {
		this.prog = null, this.re2 = null, this.q0 = null, this.q1 = null, this.matched = !1, this.matchcap = null, this.ncap = 0, this.lbTable = null;
	}
	init(e) {
		this.ncap = e, e > this.matchcap.length ? this.matchcap = new Int32Array(e).fill(-1) : this.matchcap.fill(-1), this.q0.init(e), this.q1.init(e), this.prog.numLb > 0 && ((!this.lbTable || this.lbTable.length < this.prog.numLb + 1) && (this.lbTable = new Int32Array(this.prog.numLb + 1)), this.lbTable.fill(-1));
	}
	submatches() {
		return this.ncap === 0 ? E.emptyInts() : E.toArray(this.matchcap.subarray(0, this.ncap));
	}
	match(e, t, n) {
		let r = this.re2.cond;
		if (r === E.EMPTY_ALL || (n === x.ANCHOR_START || n === x.ANCHOR_BOTH) && t !== 0) return !1;
		this.matched = !1, this.matchcap.fill(-1);
		let i = this.prog.numLb > 0 ? 0 : t, a = t, o = this.q0, s = this.q1, c = e.step(i), l = c >> 3, u = c & 7, d = -1, f = 0;
		c !== vs.EOF() && (c = e.step(i + u), d = c >> 3, f = c & 7);
		let p;
		for (p = i === 0 ? E.emptyOpContext(-1, l) : e.context(i);;) {
			if (o.isEmpty()) {
				if ((r & E.EMPTY_BEGIN_TEXT) !== 0 && i !== 0 || (n === x.ANCHOR_START || n === x.ANCHOR_BOTH) && i !== 0 || this.matched) break;
				if (this.prog.numLb === 0 && this.re2.prefix.length !== 0 && d !== this.re2.prefixRune && e.canCheckPrefix()) {
					let t = e.index(this.re2, i);
					if (t < 0) break;
					i += t, c = e.step(i), l = c >> 3, u = c & 7, c = e.step(i + u), d = c >> 3, f = c & 7, p = e.context(i);
				}
			}
			if (i === 0 && this.prog.numLb > 0) for (let e = 0; e < this.prog.lbStarts.length; e++) this.add(o, this.prog.lbStarts[e], i, this.matchcap, 0, p);
			!this.matched && (i === 0 || n === x.UNANCHORED) && i >= a && (this.ncap > 0 && (this.matchcap[0] = i), this.add(o, this.prog.start, i, this.matchcap, 0, p));
			let t = i + u;
			if (p = e.context(t), this.step(o, s, i, t, l, p, n, i === e.endPos()), u === 0 || this.ncap === 0 && this.matched) break;
			i += u, l = d, u = f, l !== -1 && (c = e.step(i + u), d = c >> 3, f = c & 7);
			let m = o;
			o = s, s = m;
		}
		return s.clear(), this.matched;
	}
	matchSet(e, t, n) {
		let r = this.re2.cond;
		if (r === E.EMPTY_ALL || (n === x.ANCHOR_START || n === x.ANCHOR_BOTH) && t !== 0) return [];
		let i = this.prog.numLb > 0 ? 0 : t, a = t, o = this.q0, s = this.q1, c = e.step(i), l = c >> 3, u = c & 7, d = -1, f = 0;
		c !== vs.EOF() && (c = e.step(i + u), d = c >> 3, f = c & 7);
		let p = i === 0 ? E.emptyOpContext(-1, l) : e.context(i), m = /* @__PURE__ */ new Set();
		for (; !(o.isEmpty() && ((r & E.EMPTY_BEGIN_TEXT) !== 0 && i !== 0 || (n === x.ANCHOR_START || n === x.ANCHOR_BOTH) && i !== 0));) {
			if (i === 0 && this.prog.numLb > 0) for (let e = 0; e < this.prog.lbStarts.length; e++) this.add(o, this.prog.lbStarts[e], i, this.matchcap, 0, p);
			(i === 0 || n === x.UNANCHORED) && i >= a && this.add(o, this.prog.start, i, this.matchcap, 0, p);
			let t = i + u;
			p = e.context(t);
			for (let r = 0; r < o.size; r++) {
				let a = o.densePcs[r], c = this.prog.inst[a], u = r * this.ncap, d = !1;
				switch (c.op) {
					case k.MATCH:
						if (n === x.ANCHOR_BOTH && i !== e.endPos()) break;
						m.add(c.arg);
						break;
					case k.RUNE:
						d = c.matchRune(l);
						break;
					case k.RUNE1:
						d = l === c.runes[0];
						break;
					case k.RUNE_ANY:
						d = !0;
						break;
					case k.RUNE_ANY_NOT_NL:
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
				case k.MATCH:
					if (o === x.ANCHOR_BOTH && !s) break;
					if (this.ncap > 0 && (!c || !this.matched || this.matchcap[1] < n)) {
						e.denseCaps[d + 1] = n;
						for (let t = 0; t < this.ncap; t++) this.matchcap[t] = e.denseCaps[d + t];
					}
					c || (e.size = 0), this.matched = !0;
					break;
				case k.RUNE:
					p = f.matchRune(i);
					break;
				case k.RUNE1:
					p = i === f.runes[0];
					break;
				case k.RUNE_ANY:
					p = !0;
					break;
				case k.RUNE_ANY_NOT_NL:
					p = i !== 10;
					break;
				default: continue;
			}
			p && this.add(t, f.out, r, e.denseCaps, d, a);
		}
		e.clear();
	}
	add(e, t, n, r, i, a) {
		for (;;) {
			if (t === 0 || e.contains(t)) return;
			let o = e.add(t), s = this.prog.inst[t];
			switch (s.op) {
				case k.FAIL: return;
				case k.ALT:
				case k.ALT_MATCH:
					this.add(e, s.out, n, r, i, a), t = s.arg;
					continue;
				case k.EMPTY_WIDTH:
					if ((s.arg & ~a) === 0) {
						t = s.out;
						continue;
					}
					return;
				case k.NOP:
					t = s.out;
					continue;
				case k.CAPTURE:
					if (s.arg < this.ncap) {
						let t = r[i + s.arg];
						r[i + s.arg] = n, this.add(e, s.out, n, r, i, a), r[i + s.arg] = t;
						return;
					}
					t = s.out;
					continue;
				case k.LB_WRITE:
					this.lbTable[Math.abs(s.arg)] = n, t = s.out;
					continue;
				case k.LB_CHECK:
					if (s.arg > 0) {
						if (this.lbTable[s.arg] === n) {
							t = s.out;
							continue;
						}
					} else if (this.lbTable[-s.arg] !== n) {
						t = s.out;
						continue;
					}
					return;
				case k.MATCH:
				case k.RUNE:
				case k.RUNE1:
				case k.RUNE_ANY:
				case k.RUNE_ANY_NOT_NL:
					if (this.ncap > 0) {
						let t = o * this.ncap;
						for (let n = 0; n < this.ncap; n++) e.denseCaps[t + n] = r[i + n];
					}
					return;
				default: throw new Ts("unhandled");
			}
		}
	}
}, ks = (e) => {
	let t = -2128831035;
	for (let n = 0; n < e.length; n++) t ^= e[n], t = Math.imul(t, 16777619);
	return t;
}, As = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}, js = class {
	constructor(e, t, n = []) {
		this.nfaStates = e, this.isMatch = t, this.matchIDs = n, this.nextLatin1 = Array(T.MAX_LATIN1 + 1).fill(null), this.nextLatin1Anchored = Array(T.MAX_LATIN1 + 1).fill(null), this.transKeys = [], this.transVals = [], this.lastSeen = 0;
	}
}, Ms = class e {
	static MAX_CACHE_CLEARS = 5;
	static STATE_MEMORY_ESTIMATE = 838;
	constructor(t, n = 8388608) {
		this.prog = t, this.stateCache = /* @__PURE__ */ new Map(), this.stateCount = 0, this.startState = null, this.stateLimit = Math.max(1, Math.floor(n / e.STATE_MEMORY_ESTIMATE)), this.cacheClears = 0, this.failed = !1, this.clock = 0;
	}
	computeClosure(e) {
		let t = /* @__PURE__ */ new Set(), n = [...e], r = !1, i = [];
		for (; n.length > 0;) {
			let e = n.pop();
			if (t.has(e)) continue;
			t.add(e);
			let a = this.prog.getInst(e);
			switch (a.op) {
				case k.MATCH:
					r = !0, i.includes(a.arg) || i.push(a.arg);
					break;
				case k.ALT:
				case k.ALT_MATCH:
					n.push(a.out), n.push(a.arg);
					break;
				case k.NOP:
				case k.CAPTURE:
					n.push(a.out);
					break;
				case k.EMPTY_WIDTH:
				case k.LB_WRITE:
				case k.LB_CHECK: return null;
			}
		}
		let a = Int32Array.from(t).sort();
		return i.sort((e, t) => e - t), {
			pcs: a,
			isMatch: r,
			matchIDs: i
		};
	}
	getState(t) {
		let n = this.computeClosure(t);
		if (!n) return null;
		let r = n.pcs, i = ks(r), a = this.stateCache.get(i);
		if (a) for (let e = 0; e < a.length; e++) {
			let t = a[e];
			if (As(t.nfaStates, r)) return t.lastSeen = ++this.clock, t;
		}
		else a = [], this.stateCache.set(i, a);
		if (this.failed) return null;
		if (this.stateCount >= this.stateLimit) {
			if (this.cacheClears++, this.cacheClears >= e.MAX_CACHE_CLEARS) return this.failed = !0, this.stateCache.clear(), this.stateCount = 0, this.startState = null, null;
			this.evictCache(), a = this.stateCache.get(i), a || (a = [], this.stateCache.set(i, a));
		}
		let o = new js(r, n.isMatch, n.matchIDs);
		return o.lastSeen = ++this.clock, a.push(o), this.stateCount++, o;
	}
	evictCache() {
		let e = [];
		for (let t of this.stateCache.values()) for (let n = 0; n < t.length; n++) e.push(t[n]);
		e.sort((e, t) => e.lastSeen - t.lastSeen);
		let t = Math.max(1, Math.floor(this.stateLimit / 2)), n = e.length - t, r = e.slice(n), i = new Set(r);
		this.stateCache.clear(), this.stateCount = 0;
		for (let e = 0; e < r.length; e++) {
			let t = r[e];
			t.nextLatin1.fill(null), t.nextLatin1Anchored.fill(null), t.transKeys.length = 0, t.transVals.length = 0;
			let n = ks(t.nfaStates), i = this.stateCache.get(n);
			i || (i = [], this.stateCache.set(n, i)), i.push(t), this.stateCount++;
		}
		this.startState && !i.has(this.startState) && (this.startState = null);
	}
	step(e, t, n) {
		if (t <= T.MAX_LATIN1) {
			if (n === x.UNANCHORED) {
				let n = e.nextLatin1[t];
				if (n !== null) return n;
			} else {
				let n = e.nextLatin1Anchored[t];
				if (n !== null) return n;
			}
		} else {
			let r = t + (n === x.UNANCHORED ? 0 : T.MAX_RUNE + 1), i = e.transKeys, a = i.length;
			for (let t = 0; t < a; t++) if (i[t] === r) return e.transVals[t];
		}
		let r = [];
		for (let n = 0; n < e.nfaStates.length; n++) {
			let i = e.nfaStates[n], a = this.prog.getInst(i);
			k.isRuneOp(a.op) && a.matchRune(t) && r.push(a.out);
		}
		n === x.UNANCHORED && r.push(this.prog.start);
		let i = this.getState(r);
		if (t <= T.MAX_LATIN1) n === x.UNANCHORED ? e.nextLatin1[t] = i : e.nextLatin1Anchored[t] = i;
		else {
			let r = t + (n === x.UNANCHORED ? 0 : T.MAX_RUNE + 1);
			e.transKeys.push(r), e.transVals.push(i);
		}
		return i;
	}
	match(e, t, n) {
		if ((n === x.ANCHOR_START || n === x.ANCHOR_BOTH) && t !== 0) return !1;
		if (!this.startState && (this.startState = this.getState([this.prog.start]), !this.startState)) return null;
		let r = e.endPos(), i = this.startState;
		if (i.isMatch) {
			if (n === x.ANCHOR_BOTH) {
				if (t === r) return !0;
			} else return !0;
		}
		let a = t;
		for (; a < r;) {
			let t = e.step(a), o = t >> 3, s = t & 7;
			if (s === 0) break;
			if (i = n === x.UNANCHORED && o <= T.MAX_LATIN1 && i.nextLatin1[o] || this.step(i, o, n), i === null) return null;
			if (i.lastSeen = ++this.clock, i.isMatch) {
				if (n === x.ANCHOR_BOTH) {
					if (a + s === r) return !0;
				} else return !0;
			}
			if (i.nfaStates.length === 0 && n !== x.UNANCHORED) return !1;
			a += s;
		}
		return !1;
	}
	matchSet(e, t, n) {
		if ((n === x.ANCHOR_START || n === x.ANCHOR_BOTH) && t !== 0) return [];
		if (!this.startState && (this.startState = this.getState([this.prog.start]), !this.startState)) return null;
		let r = e.endPos(), i = this.startState, a = /* @__PURE__ */ new Set(), o = (e, t) => {
			e.isMatch && (n === x.ANCHOR_BOTH ? t === r && e.matchIDs.forEach((e) => a.add(e)) : e.matchIDs.forEach((e) => a.add(e)));
		};
		o(i, t);
		let s = t;
		for (; s < r;) {
			let t = e.step(s), r = t >> 3, a = t & 7;
			if (a === 0) break;
			if (i = n === x.UNANCHORED && r <= T.MAX_LATIN1 && i.nextLatin1[r] || this.step(i, r, n), i === null) return null;
			if (i.lastSeen = ++this.clock, s += a, o(i, s), i.nfaStates.length === 0 && n !== x.UNANCHORED) break;
		}
		return Array.from(a).sort((e, t) => e - t);
	}
}, Ns = 32, Ps = 500, Fs = 256, Is = 262144, Ls = class {
	constructor() {
		this.end = 0, this.cap = /* @__PURE__ */ new Int32Array(), this.matchcap = /* @__PURE__ */ new Int32Array(), this.ncap = 0, this.jobPc = new Int32Array(Fs), this.jobArg = new Uint8Array(Fs), this.jobPos = new Int32Array(Fs), this.jobLen = 0, this.visited = /* @__PURE__ */ new Uint32Array();
	}
	reset(e, t, n) {
		this.end = t, this.jobLen = 0, this.ncap = n;
		let r = e.numInst() * (t + 1) + Ns - 1 >>> 5;
		this.visited.length < r ? this.visited = new Uint32Array(r) : this.visited.fill(0, 0, r), this.cap.length < n ? this.cap = new Int32Array(n).fill(-1) : this.cap.fill(-1, 0, n), this.matchcap.length < n ? this.matchcap = new Int32Array(n).fill(-1) : this.matchcap.fill(-1, 0, n);
	}
	shouldVisit(e, t) {
		let n = e * (this.end + 1) + t, r = n >>> 5, i = 1 << (n & 31);
		return (this.visited[r] & i) === 0 && (this.visited[r] |= i, !0);
	}
	push(e, t, n, r) {
		if (e.prog.getInst(t).op !== k.FAIL && (r || this.shouldVisit(t, n))) {
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
					case k.FAIL: throw new Ts("unexpected InstFail");
					case k.ALT:
						if (r) {
							r = !1, n = c.arg;
							continue;
						}
						this.push(e, n, o, !0), n = c.out;
						continue;
					case k.ALT_MATCH: {
						let t = e.prog.getInst(c.out);
						if (k.isRuneOp(t.op)) {
							this.push(e, c.arg, o, !1), n = c.arg, o = this.end;
							continue;
						}
						this.push(e, c.out, this.end, !1), n = c.out;
						continue;
					}
					case k.RUNE: {
						let e = t.step(o);
						if (e === vs.EOF() || !c.matchRune(e >> 3)) break;
						o += e & 7, n = c.out;
						continue;
					}
					case k.RUNE1: {
						let e = t.step(o);
						if (e === vs.EOF() || e >> 3 !== c.runes[0]) break;
						o += e & 7, n = c.out;
						continue;
					}
					case k.RUNE_ANY_NOT_NL: {
						let e = t.step(o);
						if (e === vs.EOF() || e >> 3 == 10) break;
						o += e & 7, n = c.out;
						continue;
					}
					case k.RUNE_ANY: {
						let e = t.step(o);
						if (e === vs.EOF()) break;
						o += e & 7, n = c.out;
						continue;
					}
					case k.CAPTURE:
						if (r) {
							this.cap[c.arg] = o;
							break;
						}
						c.arg < this.ncap && (this.push(e, n, this.cap[c.arg], !0), this.cap[c.arg] = o), n = c.out;
						continue;
					case k.EMPTY_WIDTH: {
						let e = t.context(o);
						if ((c.arg & ~e) !== 0) break;
						n = c.out;
						continue;
					}
					case k.NOP:
						n = c.out;
						continue;
					case k.MATCH: {
						if (i === x.ANCHOR_BOTH && o !== this.end) break;
						if (this.ncap === 0) return !0;
						this.ncap > 1 && (this.cap[1] = o);
						let e = this.matchcap[1];
						if ((e === -1 || a && o > 0 && o > e) && this.matchcap.set(this.cap), !a || o === this.end) return !0;
						break;
					}
					case k.LB_WRITE:
					case k.LB_CHECK: throw new Ts("Backtracker cannot evaluate Lookbehind instructions");
					default: throw new Ts("bad inst");
				}
				break;
			}
		}
		return a && this.matchcap.length > 1 && this.matchcap[1] >= 0;
	}
}, Rs = [], zs = class e {
	static shouldBacktrack(e) {
		return e.numInst() <= Ps;
	}
	static maxBitStateLen(t) {
		return e.shouldBacktrack(t) ? Math.floor(Is / t.numInst()) : 0;
	}
	static execute(e, t, n, r, i) {
		let a = e.cond;
		if (a === E.EMPTY_ALL || (r === x.ANCHOR_START || r === x.ANCHOR_BOTH) && n !== 0 || (a & E.EMPTY_BEGIN_TEXT) !== 0 && n !== 0) return null;
		let o = Rs.length > 0 ? Rs.pop() : new Ls(), s = t.endPos();
		o.reset(e.prog, s, i);
		let c = !1;
		if ((a & E.EMPTY_BEGIN_TEXT) !== 0 || r === x.ANCHOR_START || r === x.ANCHOR_BOTH) o.ncap > 0 && (o.cap[0] = n), o.tryBacktrack(e, t, e.prog.start, n, r) && (c = !0);
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
				i = a === vs.EOF() ? 0 : a & 7;
			}
		}
		if (!c) return Rs.push(o), null;
		let l = i === 0 ? [] : E.toArray(o.matchcap.subarray(0, i));
		return Rs.push(o), l;
	}
}, Bs = class {
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
}, Vs = (e, t, n, r) => {
	let i = e.length, a = t.length, o = 0, s = 0, c = [], l = [], u = !0, d = -1, f = (i) => {
		let a = i ? e : t, u = i ? o : s, f = i ? n : r;
		return d > 0 && a[u] <= c[d] ? !1 : (c.push(a[u], a[u + 1]), i ? o += 2 : s += 2, d += 2, l.push(f), !0);
	};
	for (; o < i || s < a;) if (u = s >= a ? f(!0) : o >= i || t[s] < e[o] ? f(!1) : f(!0), !u) return null;
	return {
		merged: c,
		next: l
	};
}, Hs = class {
	constructor(e) {
		this.start = e.start, this.numCap = e.numCap, this.inst = Array(e.inst.length);
		for (let t = 0; t < e.inst.length; t++) {
			let n = e.inst[t], r = new k(n.op);
			r.out = n.out, r.arg = n.arg, r.runes = n.runes ? n.runes.slice() : [], r.next = null, this.inst[t] = r;
		}
	}
}, Us = (e) => {
	let t = new Hs(e);
	for (let e = 0; e < t.inst.length; e++) {
		let n = t.inst[e];
		if (n.op !== k.ALT && n.op !== k.ALT_MATCH) continue;
		let r = "out", i = "arg", a = t.inst[n[i]];
		if (a.op !== k.ALT && a.op !== k.ALT_MATCH && (r = "arg", i = "out", a = t.inst[n[i]], a.op !== k.ALT && a.op !== k.ALT_MATCH)) continue;
		let o = t.inst[n[r]];
		if (o.op === k.ALT || o.op === k.ALT_MATCH) continue;
		let s = "out", c = "arg", l = !1;
		a.out === e ? l = !0 : a.arg === e && (l = !0, s = "arg", c = "out"), l && (a[s] = n[r]), n[r] === a[s] && (n[i] = a[c]);
	}
	return t;
}, Ws = (e) => {
	if (e.inst.length >= 1e3) return null;
	let t = new Bs(e.inst.length), n = new Bs(e.inst.length), r = Array(e.inst.length), i = Array(e.inst.length).fill(!1), a = (o) => {
		let s = !0, c = e.inst[o];
		if (n.contains(o)) return !0;
		switch (n.insert(o), c.op) {
			case k.ALT:
			case k.ALT_MATCH: {
				s = a(c.out) && a(c.arg);
				let e = i[c.out], t = i[c.arg];
				if (e && t) return !1;
				if (t) {
					let n = c.out;
					c.out = c.arg, c.arg = n;
					let r = e;
					e = t, t = r;
				}
				e && (i[o] = !0, c.op = k.ALT_MATCH);
				let n = Vs(r[c.out] || [], r[c.arg] || [], c.out, c.arg);
				if (!n) return !1;
				r[o] = n.merged, c.next = new Uint32Array(n.next);
				break;
			}
			case k.CAPTURE:
			case k.EMPTY_WIDTH:
			case k.NOP:
				s = a(c.out), i[o] = i[c.out], r[o] = r[c.out] ? r[c.out].slice() : [], c.next = new Uint32Array(Math.floor(r[o].length / 2) + 1).fill(c.out);
				break;
			case k.MATCH:
			case k.FAIL:
				i[o] = c.op === k.MATCH;
				break;
			case k.RUNE: {
				if (i[o] = !1, c.next && c.next.length > 0) break;
				if (t.insert(c.out), !c.runes || c.runes.length === 0) {
					r[o] = [], c.next = new Uint32Array([c.out]);
					break;
				}
				let e = [];
				if (c.runes.length === 1 && (c.arg & x.FOLD_CASE) !== 0) {
					let t = c.runes[0];
					e.push(t, t);
					for (let n = T.simpleFold(t); n !== t; n = T.simpleFold(n)) e.push(n, n);
					e.sort((e, t) => e - t);
				} else for (let t = 0; t < c.runes.length; t++) e.push(c.runes[t]);
				r[o] = e, c.next = new Uint32Array(Math.floor(e.length / 2) + 1).fill(c.out), c.op = k.RUNE;
				break;
			}
			case k.RUNE1: {
				if (i[o] = !1, c.next && c.next.length > 0) break;
				t.insert(c.out);
				let e = [];
				if ((c.arg & x.FOLD_CASE) !== 0) {
					let t = c.runes[0];
					e.push(t, t);
					for (let n = T.simpleFold(t); n !== t; n = T.simpleFold(n)) e.push(n, n);
					e.sort((e, t) => e - t);
				} else e.push(c.runes[0], c.runes[0]);
				r[o] = e, c.next = new Uint32Array(Math.floor(e.length / 2) + 1).fill(c.out), c.op = k.RUNE;
				break;
			}
			case k.RUNE_ANY:
				if (i[o] = !1, c.next && c.next.length > 0) break;
				t.insert(c.out), r[o] = [0, T.MAX_RUNE], c.next = new Uint32Array([c.out]);
				break;
			case k.RUNE_ANY_NOT_NL:
				if (i[o] = !1, c.next && c.next.length > 0) break;
				t.insert(c.out), r[o] = [
					0,
					9,
					11,
					T.MAX_RUNE
				], c.next = new Uint32Array(Math.floor(r[o].length / 2) + 1).fill(c.out);
		}
		return s;
	};
	for (t.clear(), t.insert(e.start); !t.empty();) if (n.clear(), !a(t.next())) return null;
	for (let t = 0; t < e.inst.length; t++) r[t] && (e.inst[t].runes = r[t]);
	return e;
}, Gs = (e, t) => {
	for (let n = 0; n < t.inst.length; n++) {
		let r = t.inst[n];
		switch (r.op) {
			case k.ALT:
			case k.ALT_MATCH:
			case k.RUNE: break;
			case k.CAPTURE:
			case k.EMPTY_WIDTH:
			case k.NOP:
			case k.MATCH:
			case k.FAIL:
				e.inst[n].next = null;
				break;
			case k.RUNE1:
			case k.RUNE_ANY:
			case k.RUNE_ANY_NOT_NL: e.inst[n].next = null, e.inst[n].op = r.op, e.inst[n].runes = r.runes ? r.runes.slice() : [];
		}
	}
}, Ks = class e {
	static compile(e) {
		if (e.start === 0 || e.numLb > 0) return null;
		let t = e.inst[e.start];
		if (t.op !== k.EMPTY_WIDTH || (t.arg & E.EMPTY_BEGIN_TEXT) === 0) return null;
		let n = !1;
		for (let t = 0; t < e.inst.length; t++) if (e.inst[t].op === k.ALT || e.inst[t].op === k.ALT_MATCH) {
			n = !0;
			break;
		}
		for (let t = 0; t < e.inst.length; t++) {
			let r = e.inst[t], i = e.inst[r.out].op;
			switch (r.op) {
				case k.ALT:
				case k.ALT_MATCH:
					if (i === k.MATCH || e.inst[r.arg].op === k.MATCH) return null;
					break;
				case k.EMPTY_WIDTH:
					if (i === k.MATCH) {
						if ((r.arg & E.EMPTY_END_TEXT) === E.EMPTY_END_TEXT) continue;
						return null;
					}
					break;
				default: if (i === k.MATCH && n) return null;
			}
		}
		let r = Us(e);
		return r = Ws(r), r !== null && Gs(r, e), r;
	}
	static next(e, t) {
		let n = e.matchRunePos(t);
		return n >= 0 ? e.next[n] : e.op === k.ALT_MATCH ? e.out : 0;
	}
	static execute(t, n, r, i, a) {
		let o = t.onepass;
		if (!o) return null;
		let s = new Int32Array(a).fill(-1), c = !1, l = n.step(r), u = l >> 3, d = l & 7, f = vs.EOF(), p = -1, m = 0;
		l !== vs.EOF() && (f = n.step(r + d), f !== vs.EOF() && (p = f >> 3, m = f & 7));
		let ee = r === 0 ? E.emptyOpContext(-1, u) : n.context(r), te = o.start, h;
		for (;;) {
			switch (h = o.inst[te], te = h.out, h.op) {
				case k.MATCH: return i === x.ANCHOR_BOTH && r !== n.endPos() ? null : (c = !0, s.length > 0 && (s[0] = 0, s[1] = r), a === 0 ? [] : E.toArray(s));
				case k.RUNE:
					if (!h.matchRune(u)) return null;
					break;
				case k.RUNE1:
					if (u !== h.runes[0]) return null;
					break;
				case k.RUNE_ANY: break;
				case k.RUNE_ANY_NOT_NL:
					if (u === 10) return null;
					break;
				case k.ALT:
				case k.ALT_MATCH:
					te = e.next(h, u);
					continue;
				case k.FAIL: return null;
				case k.NOP: continue;
				case k.EMPTY_WIDTH:
					if ((h.arg & ~ee) !== 0) return null;
					continue;
				case k.CAPTURE:
					h.arg < s.length && (s[h.arg] = r);
					continue;
				default: throw new Ts("bad inst");
			}
			if (d === 0) break;
			ee = E.emptyOpContext(u, p), r += d, u = p, d = m, u !== -1 && (f = n.step(r + d), f === vs.EOF() ? (p = -1, m = 0) : (p = f >> 3, m = f & 7));
		}
		return c ? a === 0 ? [] : E.toArray(s) : null;
	}
}, A = class e {
	static Op = ps([
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
		return e === S.CODES.get("-") ? "\\" : "";
	}
	static fromRegexp(t) {
		let n = new e(t.op);
		return n.flags = t.flags, n.subs = t.subs, n.runes = t.runes, n.cap = t.cap, n.min = t.min, n.max = t.max, n.name = t.name, n.namedGroups = t.namedGroups, n.lb = t.lb, n;
	}
	constructor(t) {
		this.op = t, this.flags = 0, this.subs = e.emptySubs(), this.runes = [], this.min = 0, this.max = 0, this.cap = 0, this.name = null, this.namedGroups = Object.create(null), this.lb = 0;
	}
	reinit() {
		this.flags = 0, this.subs = e.emptySubs(), this.runes = [], this.cap = 0, this.min = 0, this.max = 0, this.name = null, this.namedGroups = Object.create(null), this.lb = 0;
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
				(this.flags & x.NON_GREEDY) !== 0 && (t += "?");
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
				(this.flags & x.FOLD_CASE) !== 0 && (t += "(?i:");
				for (let e of this.runes) t += E.escapeRune(e);
				(this.flags & x.FOLD_CASE) !== 0 && (t += ")");
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
				(this.flags & x.WAS_DOLLAR) === 0 ? t += "\\z" : t += "(?-m:$)";
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
				else if (this.runes[0] === 0 && this.runes[this.runes.length - 1] === T.MAX_RUNE) {
					t += "^";
					for (let n = 1; n < this.runes.length - 1; n += 2) {
						let r = this.runes[n] + 1, i = this.runes[n + 1] - 1;
						t += e.quoteIfHyphen(r), t += E.escapeRune(r), r !== i && (t += "-", t += e.quoteIfHyphen(i), t += E.escapeRune(i));
					}
				} else for (let n = 0; n < this.runes.length; n += 2) {
					let r = this.runes[n], i = this.runes[n + 1];
					t += e.quoteIfHyphen(r), t += E.escapeRune(r), r !== i && (t += "-", t += e.quoteIfHyphen(i), t += E.escapeRune(i));
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
				if ((this.flags & x.WAS_DOLLAR) !== (t.flags & x.WAS_DOLLAR)) return !1;
				break;
			case e.Op.LITERAL:
			case e.Op.CHAR_CLASS:
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
				if ((this.flags & x.NON_GREEDY) !== (t.flags & x.NON_GREEDY) || !this.subs[0].equals(t.subs[0])) return !1;
				break;
			case e.Op.REPEAT:
				if ((this.flags & x.NON_GREEDY) !== (t.flags & x.NON_GREEDY) || this.min !== t.min || this.max !== t.max || !this.subs[0].equals(t.subs[0])) return !1;
				break;
			case e.Op.CAPTURE:
				if (this.cap !== t.cap || (this.name === null ? t.name !== null : this.name !== t.name) || !this.subs[0].equals(t.subs[0])) return !1;
				break;
			case e.Op.PLB:
			case e.Op.NLB: if (this.lb !== t.lb || !this.subs[0].equals(t.subs[0])) return !1;
		}
		return !0;
	}
}, qs = class {
	constructor(e) {
		this.next = [Object.create(null)], this.fail = [0], this.match = [!1];
		for (let t of e) {
			let e = 0;
			for (let n = 0; n < t.length; n++) {
				let r = t[n];
				r in this.next[e] || (this.next.push(Object.create(null)), this.fail.push(0), this.match.push(!1), this.next[e][r] = this.next.length - 1), e = this.next[e][r];
			}
			this.match[e] = !0;
		}
		let t = [];
		for (let e in this.next[0]) if (Object.prototype.hasOwnProperty.call(this.next[0], e)) {
			let n = this.next[0][e];
			this.fail[n] = 0, t.push(n);
		}
		for (; t.length > 0;) {
			let e = t.shift();
			for (let n in this.next[e]) if (Object.prototype.hasOwnProperty.call(this.next[e], n)) {
				let r = this.next[e][n], i = this.fail[e];
				for (; i !== 0 && !(n in this.next[i]);) i = this.fail[i];
				n in this.next[i] ? this.fail[r] = this.next[i][n] : this.fail[r] = 0, this.match[r] = this.match[r] || this.match[this.fail[r]], t.push(r);
			}
		}
	}
	searchUTF16(e, t, n) {
		let r = 0;
		for (let i = t; i < n; i++) {
			let t = e.charCodeAt(i);
			for (; r !== 0 && !(t in this.next[r]);) r = this.fail[r];
			if (t in this.next[r] && (r = this.next[r][t]), this.match[r]) return !0;
		}
		return !1;
	}
	searchUTF8(e, t, n) {
		let r = 0;
		for (let i = t; i < n; i++) {
			let t = e[i];
			for (; r !== 0 && !(t in this.next[r]);) r = this.fail[r];
			if (t in this.next[r] && (r = this.next[r][t]), this.match[r]) return !0;
		}
		return !1;
	}
}, j = class e {
	static Type = {
		NONE: 0,
		EXACT: 1,
		AND: 2,
		OR: 3
	};
	constructor(e) {
		this.type = e, this.subs = [], this.str = "", this.bytes = null, this.ac16 = null, this.ac8 = null;
	}
	eval(t, n) {
		switch (this.type) {
			case e.Type.NONE: return !0;
			case e.Type.EXACT: return t.hasString(this, n);
			case e.Type.AND:
				for (let e = 0; e < this.subs.length; e++) if (!this.subs[e].eval(t, n)) return !1;
				return !0;
			case e.Type.OR:
				if (this.ac16 && this.ac8) return t.hasAnyString(this, n);
				for (let e = 0; e < this.subs.length; e++) if (this.subs[e].eval(t, n)) return !0;
				return !1;
			default: return !0;
		}
	}
}, Js = class e {
	static build(t) {
		let n = e.fromRegexp(t);
		return e.simplify(n);
	}
	static fromRegexp(t) {
		if (!t) return new j(j.Type.NONE);
		switch (t.op) {
			case A.Op.PLB:
			case A.Op.NLB:
			case A.Op.NO_MATCH:
			case A.Op.EMPTY_MATCH:
			case A.Op.BEGIN_LINE:
			case A.Op.END_LINE:
			case A.Op.BEGIN_TEXT:
			case A.Op.END_TEXT:
			case A.Op.WORD_BOUNDARY:
			case A.Op.NO_WORD_BOUNDARY:
			case A.Op.CHAR_CLASS:
			case A.Op.ANY_CHAR_NOT_NL:
			case A.Op.ANY_CHAR: return new j(j.Type.NONE);
			case A.Op.LITERAL: {
				if (t.runes.length === 0 || (t.flags & x.FOLD_CASE) !== 0) return new j(j.Type.NONE);
				let e = new j(j.Type.EXACT), n = "";
				for (let e = 0; e < t.runes.length; e++) n += String.fromCodePoint(t.runes[e]);
				return e.str = n, e.bytes = E.stringToUtf8ByteArray(e.str), e;
			}
			case A.Op.CAPTURE:
			case A.Op.PLUS: return e.fromRegexp(t.subs[0]);
			case A.Op.REPEAT: return t.min >= 1 ? e.fromRegexp(t.subs[0]) : new j(j.Type.NONE);
			case A.Op.CONCAT: {
				let n = new j(j.Type.AND);
				for (let r of t.subs) n.subs.push(e.fromRegexp(r));
				return n;
			}
			case A.Op.ALTERNATE: {
				let n = new j(j.Type.OR);
				for (let r of t.subs) n.subs.push(e.fromRegexp(r));
				return n;
			}
			default: return new j(j.Type.NONE);
		}
	}
	static simplify(t) {
		if (t.type === j.Type.EXACT || t.type === j.Type.NONE) return t;
		if (t.type === j.Type.AND) {
			let n = [];
			for (let r of t.subs) {
				let t = e.simplify(r);
				if (t.type !== j.Type.NONE) {
					if (t.type === j.Type.AND) for (let e = 0; e < t.subs.length; e++) n.push(t.subs[e]);
					else n.push(t);
				}
			}
			return n.length === 0 ? new j(j.Type.NONE) : n.length === 1 ? n[0] : (t.subs = n, t);
		}
		if (t.type === j.Type.OR) {
			let n = [];
			for (let r of t.subs) {
				let t = e.simplify(r);
				if (t.type === j.Type.NONE) return new j(j.Type.NONE);
				if (t.type === j.Type.OR) for (let e = 0; e < t.subs.length; e++) n.push(t.subs[e]);
				else n.push(t);
			}
			if (n.length === 0) return new j(j.Type.NONE);
			if (n.length === 1) return n[0];
			let r = /* @__PURE__ */ new Set(), i = [];
			for (let e of n) e.type === j.Type.EXACT ? r.has(e.str) || (r.add(e.str), i.push(e)) : i.push(e);
			t.subs = i;
			let a = !0;
			for (let e of i) if (e.type !== j.Type.EXACT) {
				a = !1;
				break;
			}
			return a && i.length > 1 && (t.ac16 = new qs(i.map((e) => {
				let t = [];
				for (let n = 0; n < e.str.length; n++) t.push(e.str.charCodeAt(n));
				return t;
			})), t.ac8 = new qs(i.map((e) => e.bytes))), t;
		}
		return t;
	}
}, Ys = class {
	constructor(e = 0, t = 0) {
		this.head = e, this.tail = t;
	}
}, Xs = class {
	constructor() {
		this.inst = [], this.start = 0, this.numCap = 2, this.lbStarts = [], this.numLb = 0;
	}
	getInst(e) {
		return this.inst[e];
	}
	numInst() {
		return this.inst.length;
	}
	addInst(e) {
		this.inst.push(new k(e));
	}
	skipNop(e) {
		let t = this.inst[e];
		for (; t.op === k.NOP || t.op === k.CAPTURE;) t = this.inst[e], e = t.out;
		return t;
	}
	prefix() {
		let e = "", t = this.skipNop(this.start);
		if (!k.isRuneOp(t.op) || t.runes.length !== 1) return [t.op === k.MATCH, e];
		for (; k.isRuneOp(t.op) && t.runes.length === 1 && (t.arg & x.FOLD_CASE) === 0;) e += String.fromCodePoint(t.runes[0]), t = this.skipNop(t.out);
		return [t.op === k.MATCH, e];
	}
	startCond() {
		let e = 0, t = this.start;
		loop: for (;;) {
			let n = this.inst[t];
			switch (n.op) {
				case k.EMPTY_WIDTH:
					e |= n.arg;
					break;
				case k.FAIL: return -1;
				case k.CAPTURE:
				case k.NOP: break;
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
		return e.tail & 1 ? n.arg = t.head : n.out = t.head, new Ys(e.head, t.tail);
	}
	toString() {
		let e = "";
		for (let t = 0; t < this.inst.length; t++) {
			let n = e.length;
			e += t, t === this.start && (e += "*"), e += "        ".substring(e.length - n), e += this.inst[t], e += "\n";
		}
		return e;
	}
}, Zs = class {
	constructor(e = 0, t = new Ys(), n = !1) {
		this.i = e, this.out = t, this.nullable = n;
	}
}, Qs = class e {
	static ANY_RUNE_NOT_NL() {
		return [
			0,
			S.CODES.get("\n") - 1,
			S.CODES.get("\n") + 1,
			T.MAX_RUNE
		];
	}
	static ANY_RUNE() {
		return [0, T.MAX_RUNE];
	}
	static compileRegexp(t) {
		let n = new e(), r = n.compile(t);
		return n.prog.patch(r.out, n.newInst(k.MATCH).i), n.prog.start = r.i, n.prog;
	}
	static compileSet(t) {
		let n = new e();
		if (t.length === 0) return n.prog.start = n.newInst(k.FAIL).i, n.prog;
		let r = [];
		for (let e = 0; e < t.length; e++) {
			let i = n.compile(t[e]), a = n.newInst(k.MATCH);
			n.prog.getInst(a.i).arg = e, n.prog.patch(i.out, a.i), r.push(i.i);
		}
		let i = r[0];
		for (let e = 1; e < r.length; e++) {
			let t = n.newInst(k.ALT), a = n.prog.getInst(t.i);
			a.out = i, a.arg = r[e], i = t.i;
		}
		return n.prog.start = i, n.prog;
	}
	constructor() {
		this.prog = new Xs(), this.newInst(k.FAIL);
	}
	newInst(e) {
		return this.prog.addInst(e), new Zs(this.prog.numInst() - 1, new Ys(), !0);
	}
	nop() {
		let e = this.newInst(k.NOP);
		return e.out = new Ys(e.i << 1, e.i << 1), e;
	}
	fail() {
		return new Zs();
	}
	cap(e) {
		let t = this.newInst(k.CAPTURE);
		return t.out = new Ys(t.i << 1, t.i << 1), this.prog.getInst(t.i).arg = e, this.prog.numCap < e + 1 && (this.prog.numCap = e + 1), t;
	}
	cat(e, t) {
		return e.i === 0 || t.i === 0 ? this.fail() : (this.prog.patch(e.out, t.i), new Zs(e.i, t.out, e.nullable && t.nullable));
	}
	alt(e, t) {
		if (e.i === 0) return t;
		if (t.i === 0) return e;
		let n = this.newInst(k.ALT), r = this.prog.getInst(n.i);
		return r.out = e.i, r.arg = t.i, n.out = this.prog.append(e.out, t.out), n.nullable = e.nullable || t.nullable, n;
	}
	loop(e, t) {
		let n = this.newInst(k.ALT), r = this.prog.getInst(n.i);
		return t ? (r.arg = e.i, n.out = new Ys(n.i << 1, n.i << 1)) : (r.out = e.i, n.out = new Ys(n.i << 1 | 1, n.i << 1 | 1)), this.prog.patch(e.out, n.i), n;
	}
	quest(e, t) {
		let n = this.newInst(k.ALT), r = this.prog.getInst(n.i);
		return t ? (r.arg = e.i, n.out = new Ys(n.i << 1, n.i << 1)) : (r.out = e.i, n.out = new Ys(n.i << 1 | 1, n.i << 1 | 1)), n.out = this.prog.append(n.out, e.out), n;
	}
	star(e, t) {
		return e.nullable ? this.quest(this.plus(e, t), t) : this.loop(e, t);
	}
	plus(e, t) {
		return new Zs(e.i, this.loop(e, t).out, e.nullable);
	}
	empty(e) {
		let t = this.newInst(k.EMPTY_WIDTH);
		return this.prog.getInst(t.i).arg = e, t.out = new Ys(t.i << 1, t.i << 1), t;
	}
	rune(e, t) {
		let n = this.newInst(k.RUNE);
		n.nullable = !1;
		let r = this.prog.getInst(n.i);
		return r.runes = e, t &= x.FOLD_CASE, (e.length !== 1 || T.simpleFold(e[0]) === e[0]) && (t &= ~x.FOLD_CASE), r.arg = t, n.out = new Ys(n.i << 1, n.i << 1), (t & x.FOLD_CASE) === 0 && e.length === 1 || e.length === 2 && e[0] === e[1] ? r.op = k.RUNE1 : e.length === 2 && e[0] === 0 && e[1] === T.MAX_RUNE ? r.op = k.RUNE_ANY : e.length === 4 && e[0] === 0 && e[1] === S.CODES.get("\n") - 1 && e[2] === S.CODES.get("\n") + 1 && e[3] === T.MAX_RUNE && (r.op = k.RUNE_ANY_NOT_NL), n;
	}
	lookBehind(t, n) {
		let r = this.newInst(k.LB_WRITE);
		this.prog.getInst(r.i).arg = n;
		let i = this.rune(e.ANY_RUNE(), 0), a = this.star(i, !0), o = this.cat(a, t);
		this.prog.patch(o.out, r.i);
		let s = this.newInst(k.LB_CHECK);
		return this.prog.getInst(s.i).arg = n, this.prog.lbStarts.push(o.i), Math.abs(n) > this.prog.numLb && (this.prog.numLb = Math.abs(n)), s.out = new Ys(s.i << 1, s.i << 1), s;
	}
	compile(t) {
		switch (t.op) {
			case A.Op.NO_MATCH: return this.fail();
			case A.Op.EMPTY_MATCH: return this.nop();
			case A.Op.LITERAL:
				if (t.runes.length === 0) return this.nop();
				{
					let e = null;
					for (let n of t.runes) {
						let r = this.rune([n], t.flags);
						e = e === null ? r : this.cat(e, r);
					}
					return e;
				}
			case A.Op.CHAR_CLASS: return this.rune(t.runes, t.flags);
			case A.Op.ANY_CHAR_NOT_NL: return this.rune(e.ANY_RUNE_NOT_NL(), 0);
			case A.Op.ANY_CHAR: return this.rune(e.ANY_RUNE(), 0);
			case A.Op.BEGIN_LINE: return this.empty(E.EMPTY_BEGIN_LINE);
			case A.Op.END_LINE: return this.empty(E.EMPTY_END_LINE);
			case A.Op.BEGIN_TEXT: return this.empty(E.EMPTY_BEGIN_TEXT);
			case A.Op.END_TEXT: return this.empty(E.EMPTY_END_TEXT);
			case A.Op.WORD_BOUNDARY: return this.empty(E.EMPTY_WORD_BOUNDARY);
			case A.Op.NO_WORD_BOUNDARY: return this.empty(E.EMPTY_NO_WORD_BOUNDARY);
			case A.Op.PLB:
			case A.Op.NLB: return this.lookBehind(this.compile(t.subs[0]), t.lb);
			case A.Op.CAPTURE: {
				let e = this.cap(t.cap << 1), n = this.compile(t.subs[0]), r = this.cap(t.cap << 1 | 1);
				return this.cat(this.cat(e, n), r);
			}
			case A.Op.STAR: return this.star(this.compile(t.subs[0]), (t.flags & x.NON_GREEDY) !== 0);
			case A.Op.PLUS: return this.plus(this.compile(t.subs[0]), (t.flags & x.NON_GREEDY) !== 0);
			case A.Op.QUEST: return this.quest(this.compile(t.subs[0]), (t.flags & x.NON_GREEDY) !== 0);
			case A.Op.CONCAT:
				if (t.subs.length === 0) return this.nop();
				{
					let e = null;
					for (let n of t.subs) {
						let t = this.compile(n);
						e = e === null ? t : this.cat(e, t);
					}
					return e;
				}
			case A.Op.ALTERNATE:
				if (t.subs.length === 0) return this.nop();
				{
					let e = null;
					for (let n of t.subs) {
						let t = this.compile(n);
						e = e === null ? t : this.alt(e, t);
					}
					return e;
				}
			default: throw new Ss("regexp: unhandled case in compile");
		}
	}
}, $s = class e {
	static simplify(t) {
		if (t === null) return null;
		switch (t.op) {
			case A.Op.PLB:
			case A.Op.NLB:
			case A.Op.CAPTURE: {
				let n = e.simplify(t.subs[0]);
				if (n !== t.subs[0]) {
					let e = A.fromRegexp(t);
					return e.runes = [], e.subs = [n], e;
				}
				return t;
			}
			case A.Op.CONCAT:
			case A.Op.ALTERNATE: {
				let n = [], r = !1;
				for (let i = 0; i < t.subs.length; i++) {
					let a = t.subs[i], o = e.simplify(a);
					if (o !== a && (r = !0), t.op === A.Op.CONCAT) {
						if (o.op === A.Op.NO_MATCH) return new A(A.Op.NO_MATCH);
						if (o.op === A.Op.EMPTY_MATCH) {
							r = !0;
							continue;
						}
						if (o.op === A.Op.CONCAT) {
							r = !0;
							for (let e = 0; e < o.subs.length; e++) n.push(o.subs[e]);
							continue;
						}
					} else if (t.op === A.Op.ALTERNATE) {
						if (o.op === A.Op.NO_MATCH) {
							r = !0;
							continue;
						}
						if (o.op === A.Op.ALTERNATE) {
							r = !0;
							for (let e = 0; e < o.subs.length; e++) n.push(o.subs[e]);
							continue;
						}
					}
					n.push(o);
				}
				if (r) {
					if (n.length === 0) return new A(t.op === A.Op.CONCAT ? A.Op.EMPTY_MATCH : A.Op.NO_MATCH);
					if (n.length === 1) return n[0];
					let e = A.fromRegexp(t);
					return e.runes = [], e.subs = n, e;
				}
				return t;
			}
			case A.Op.CHAR_CLASS: return t.runes === null ? t : t.runes.length === 0 ? new A(A.Op.NO_MATCH) : t.runes.length === 2 && t.runes[0] === 0 && t.runes[1] === T.MAX_RUNE ? new A(A.Op.ANY_CHAR) : t.runes.length === 4 && t.runes[0] === 0 && t.runes[1] === S.CODES.get("\n") - 1 && t.runes[2] === S.CODES.get("\n") + 1 && t.runes[3] === T.MAX_RUNE ? new A(A.Op.ANY_CHAR_NOT_NL) : t;
			case A.Op.STAR:
			case A.Op.PLUS:
			case A.Op.QUEST: {
				let n = e.simplify(t.subs[0]);
				return e.simplify1(t.op, t.flags, n, t);
			}
			case A.Op.REPEAT: {
				if (t.min === 0 && t.max === 0) return new A(A.Op.EMPTY_MATCH);
				let n = e.simplify(t.subs[0]);
				if (t.max === -1) {
					if (t.min === 0) return e.simplify1(A.Op.STAR, t.flags, n, null);
					if (t.min === 1) return e.simplify1(A.Op.PLUS, t.flags, n, null);
					let r = new A(A.Op.CONCAT), i = [];
					for (let e = 0; e < t.min - 1; e++) i.push(n);
					return i.push(e.simplify1(A.Op.PLUS, t.flags, n, null)), r.subs = i.slice(0), e.simplify(r);
				}
				if (t.min === 1 && t.max === 1) return n;
				let r = null;
				if (t.min > 0) {
					r = [];
					for (let e = 0; e < t.min; e++) r.push(n);
				}
				if (t.max > t.min) {
					let i = e.simplify1(A.Op.QUEST, t.flags, n, null);
					for (let r = t.min + 1; r < t.max; r++) {
						let r = new A(A.Op.CONCAT);
						r.subs = [n, i], i = e.simplify1(A.Op.QUEST, t.flags, r, null);
					}
					if (r === null) return i;
					r.push(i);
				}
				if (r !== null) {
					let t = new A(A.Op.CONCAT);
					return t.subs = r.slice(0), e.simplify(t);
				}
				return new A(A.Op.NO_MATCH);
			}
		}
		return t;
	}
	static simplify1(e, t, n, r) {
		if (n.op === A.Op.EMPTY_MATCH) return n;
		if (n.op === A.Op.NO_MATCH) return e === A.Op.PLUS ? n : new A(A.Op.EMPTY_MATCH);
		if (e === n.op && (t & x.NON_GREEDY) === (n.flags & x.NON_GREEDY)) return n;
		if (r !== null && r.op === e && (r.flags & x.NON_GREEDY) === (t & x.NON_GREEDY) && n === r.subs[0]) return r;
		let i = new A(e);
		return i.flags = t, i.subs = [n], i;
	}
}, M = class {
	constructor(e, t) {
		this.sign = e, this.cls = t;
	}
}, ec = [48, 57], tc = [
	9,
	10,
	12,
	13,
	32,
	32
], nc = [
	48,
	57,
	65,
	90,
	95,
	95,
	97,
	122
], rc = /* @__PURE__ */ new Map([
	["\\d", new M(1, ec)],
	["\\D", new M(-1, ec)],
	["\\s", new M(1, tc)],
	["\\S", new M(-1, tc)],
	["\\w", new M(1, nc)],
	["\\W", new M(-1, nc)]
]), ic = [
	48,
	57,
	65,
	90,
	97,
	122
], ac = [
	65,
	90,
	97,
	122
], oc = [0, 127], sc = [
	9,
	9,
	32,
	32
], cc = [
	0,
	31,
	127,
	127
], lc = [48, 57], uc = [33, 126], dc = [97, 122], fc = [32, 126], pc = [
	33,
	47,
	58,
	64,
	91,
	96,
	123,
	126
], mc = [
	9,
	13,
	32,
	32
], hc = [65, 90], gc = [
	48,
	57,
	65,
	90,
	95,
	95,
	97,
	122
], _c = [
	48,
	57,
	65,
	70,
	97,
	102
], vc = /* @__PURE__ */ new Map([
	["[:alnum:]", new M(1, ic)],
	["[:^alnum:]", new M(-1, ic)],
	["[:alpha:]", new M(1, ac)],
	["[:^alpha:]", new M(-1, ac)],
	["[:ascii:]", new M(1, oc)],
	["[:^ascii:]", new M(-1, oc)],
	["[:blank:]", new M(1, sc)],
	["[:^blank:]", new M(-1, sc)],
	["[:cntrl:]", new M(1, cc)],
	["[:^cntrl:]", new M(-1, cc)],
	["[:digit:]", new M(1, lc)],
	["[:^digit:]", new M(-1, lc)],
	["[:graph:]", new M(1, uc)],
	["[:^graph:]", new M(-1, uc)],
	["[:lower:]", new M(1, dc)],
	["[:^lower:]", new M(-1, dc)],
	["[:print:]", new M(1, fc)],
	["[:^print:]", new M(-1, fc)],
	["[:punct:]", new M(1, pc)],
	["[:^punct:]", new M(-1, pc)],
	["[:space:]", new M(1, mc)],
	["[:^space:]", new M(-1, mc)],
	["[:upper:]", new M(1, hc)],
	["[:^upper:]", new M(-1, hc)],
	["[:word:]", new M(1, gc)],
	["[:^word:]", new M(-1, gc)],
	["[:xdigit:]", new M(1, _c)],
	["[:^xdigit:]", new M(-1, _c)]
]), yc = class e {
	static charClassToString(e, t) {
		let n = "[";
		for (let r = 0; r < t; r += 2) {
			r > 0 && (n += " ");
			let t = e[r], i = e[r + 1];
			n += t === i ? `0x${t.toString(16)}` : `0x${t.toString(16)}-0x${i.toString(16)}`;
		}
		return n += "]", n;
	}
	static cmp(e, t, n, r) {
		let i = e[t] - n;
		return i === 0 ? r - e[t + 1] : i;
	}
	static qsortIntPair(t, n, r) {
		let i = ((n + r) / 2 | 0) & -2, a = t[i], o = t[i + 1], s = n, c = r;
		for (; s <= c;) {
			for (; s < r && e.cmp(t, s, a, o) < 0;) s += 2;
			for (; c > n && e.cmp(t, c, a, o) > 0;) c -= 2;
			if (s <= c) {
				if (s !== c) {
					let e = t[s];
					t[s] = t[c], t[c] = e, e = t[s + 1], t[s + 1] = t[c + 1], t[c + 1] = e;
				}
				s += 2, c -= 2;
			}
		}
		n < c && e.qsortIntPair(t, n, c), s < r && e.qsortIntPair(t, s, r);
	}
	constructor(e = E.emptyInts()) {
		this.r = e, this.len = e.length;
	}
	toArray() {
		return this.len === this.r.length ? this.r : this.r.slice(0, this.len);
	}
	cleanClass() {
		if (this.len < 4) return this;
		e.qsortIntPair(this.r, 0, this.len - 2);
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
		return (t & x.FOLD_CASE) === 0 ? this.appendRange(e, e) : this.appendFoldedRange(e, e);
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
		if (e <= T.MIN_FOLD && t >= T.MAX_FOLD || t < T.MIN_FOLD || e > T.MAX_FOLD) return this.appendRange(e, t);
		e < T.MIN_FOLD && (this.appendRange(e, T.MIN_FOLD - 1), e = T.MIN_FOLD), t > T.MAX_FOLD && (this.appendRange(T.MAX_FOLD + 1, t), t = T.MAX_FOLD);
		for (let n = e; n <= t; n++) {
			this.appendRange(n, n);
			for (let e = T.simpleFold(n); e !== n; e = T.simpleFold(e)) this.appendRange(e, e);
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
		return t <= T.MAX_RUNE && this.appendRange(t, T.MAX_RUNE), this;
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
		return t <= T.MAX_RUNE && this.appendRange(t, T.MAX_RUNE), this;
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
		return this.len = t, e <= T.MAX_RUNE && (this.r[this.len++] = e, this.r[this.len++] = T.MAX_RUNE), this;
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
}, bc = class {
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
		return this.position += E.charCount(e), e;
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
}, xc = class e {
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
	static MAX_SIZE = 3355443;
	static MAX_RUNES = 33554432;
	static ANY_TABLE = new C(new Uint32Array([
		0,
		T.MAX_RUNE,
		1
	]));
	static ASCII_TABLE = new C(new Uint32Array([
		0,
		127,
		1
	]));
	static ASCII_FOLD_TABLE = new C(new Uint32Array([
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
			tab: cs.CATEGORIES.get("Cn"),
			fold: cs.CATEGORIES.get("Cn"),
			sign: -1
		} : t === "Lc" ? {
			tab: cs.CATEGORIES.get("LC"),
			fold: cs.FOLD_CATEGORIES.get("LC"),
			sign: 1
		} : cs.CATEGORIES.has(t) ? {
			tab: cs.CATEGORIES.get(t),
			fold: cs.FOLD_CATEGORIES.get(t),
			sign: 1
		} : cs.SCRIPTS.has(t) ? {
			tab: cs.SCRIPTS.get(t),
			fold: cs.FOLD_SCRIPT.get(t),
			sign: 1
		} : null;
	}
	static minFoldRune(e) {
		if (e < T.MIN_FOLD || e > T.MAX_FOLD) return e;
		let t = e, n = e;
		for (e = T.simpleFold(e); e !== n; e = T.simpleFold(e)) t > e && (t = e);
		return t;
	}
	static leadingRegexp(e) {
		if (e.op === A.Op.EMPTY_MATCH) return null;
		if (e.op === A.Op.CONCAT && e.subs.length > 0) {
			let t = e.subs[0];
			return t.op === A.Op.EMPTY_MATCH ? null : t;
		}
		return e;
	}
	static literalRegexp(e, t) {
		let n = new A(A.Op.LITERAL);
		return n.flags = t, n.runes = E.stringToRunes(e), n;
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
		if (t.skip(1), r < 0 || r > 1e3 || i === -2 || i > 1e3 || i >= 0 && r > i) throw new O(e.ERR_INVALID_REPEAT_SIZE, t.from(n));
		return r << 16 | i & T.MAX_BMP;
	}
	static isValidCaptureName(e) {
		if (e.length === 0) return !1;
		for (let t = 0; t < e.length; t++) {
			let n = e.codePointAt(t);
			if (n !== S.CODES.get("_") && !E.isalnum(n)) return !1;
		}
		return !0;
	}
	static parseInt(e) {
		let t = e.pos();
		for (; e.more() && e.peek() >= S.CODES.get("0") && e.peek() <= S.CODES.get("9");) e.skip(1);
		let n = e.from(t);
		return n.length === 0 || n.length > 1 && n.codePointAt(0) === S.CODES.get("0") ? -1 : n.length > 8 ? -2 : parseInt(n, 10);
	}
	static isCharClass(e) {
		return e.op === A.Op.LITERAL && e.runes.length === 1 || e.op === A.Op.CHAR_CLASS || e.op === A.Op.ANY_CHAR_NOT_NL || e.op === A.Op.ANY_CHAR;
	}
	static matchRune(e, t) {
		switch (e.op) {
			case A.Op.LITERAL: return e.runes.length === 1 && e.runes[0] === t;
			case A.Op.CHAR_CLASS:
				for (let n = 0; n < e.runes.length; n += 2) if (e.runes[n] <= t && t <= e.runes[n + 1]) return !0;
				return !1;
			case A.Op.ANY_CHAR_NOT_NL: return t !== S.CODES.get("\n");
			case A.Op.ANY_CHAR: return !0;
		}
		return !1;
	}
	static mergeCharClass(t, n) {
		switch (t.op) {
			case A.Op.ANY_CHAR: break;
			case A.Op.ANY_CHAR_NOT_NL:
				e.matchRune(n, S.CODES.get("\n")) && (t.op = A.Op.ANY_CHAR);
				break;
			case A.Op.CHAR_CLASS:
				t.runes = n.op === A.Op.LITERAL ? new yc(t.runes).appendLiteral(n.runes[0], n.flags).toArray() : new yc(t.runes).appendClass(n.runes).toArray();
				break;
			case A.Op.LITERAL:
				if (n.runes[0] === t.runes[0] && n.flags === t.flags) break;
				t.op = A.Op.CHAR_CLASS, t.runes = new yc().appendLiteral(t.runes[0], t.flags).appendLiteral(n.runes[0], n.flags).toArray();
		}
	}
	static parseEscape(t) {
		let n = t.pos();
		if (t.skip(1), !t.more()) throw new O(e.ERR_TRAILING_BACKSLASH);
		let r = t.pop();
		bigswitch: switch (r) {
			case S.CODES.get("1"):
			case S.CODES.get("2"):
			case S.CODES.get("3"):
			case S.CODES.get("4"):
			case S.CODES.get("5"):
			case S.CODES.get("6"):
			case S.CODES.get("7"): if (!t.more() || t.peek() < S.CODES.get("0") || t.peek() > S.CODES.get("7")) break;
			case S.CODES.get("0"): {
				let e = r - S.CODES.get("0");
				for (let n = 1; n < 3 && !(!t.more() || t.peek() < S.CODES.get("0") || t.peek() > S.CODES.get("7")); n++) e = e * 8 + t.peek() - S.CODES.get("0"), t.skip(1);
				return e;
			}
			case S.CODES.get("x"): {
				if (!t.more()) break;
				if (r = t.pop(), r === S.CODES.get("{")) {
					let e = 0, n = 0;
					for (;;) {
						if (!t.more()) break bigswitch;
						if (r = t.pop(), r === S.CODES.get("}")) break;
						let i = E.unhex(r);
						if (i < 0 || (n = n * 16 + i, n > T.MAX_RUNE)) break bigswitch;
						e++;
					}
					if (e === 0) break bigswitch;
					return n;
				}
				let e = E.unhex(r);
				if (!t.more()) break;
				r = t.pop();
				let n = E.unhex(r);
				if (e < 0 || n < 0) break;
				return e * 16 + n;
			}
			case S.CODES.get("a"): return S.CODES.get("\x07");
			case S.CODES.get("f"): return S.CODES.get("\f");
			case S.CODES.get("n"): return S.CODES.get("\n");
			case S.CODES.get("r"): return S.CODES.get("\r");
			case S.CODES.get("t"): return S.CODES.get("	");
			case S.CODES.get("v"): return S.CODES.get("\v");
			default:
				if (r <= T.MAX_ASCII && !E.isalnum(r)) return r;
				break;
		}
		throw new O(e.ERR_INVALID_ESCAPE, t.from(n));
	}
	static parseClassChar(t, n) {
		if (!t.more()) throw new O(e.ERR_MISSING_BRACKET, t.from(n));
		return t.lookingAt("\\") ? e.parseEscape(t) : t.pop();
	}
	static concatRunes(e, t) {
		for (let n = 0; n < t.length; n++) e.push(t[n]);
		return e;
	}
	static hasCapture(t) {
		if (t === null) return !1;
		if (t.op === A.Op.CAPTURE) return !0;
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
		return t !== null && t.subs !== null && t.subs.length > 0 ? (this.free = t.subs[0], t.reinit(), t.op = e) : (t = new A(e), this.numRegexp += 1), t;
	}
	reuse(e) {
		this.height !== null && this.height.has(e) && this.height.delete(e), e.subs !== null && e.subs.length > 0 && (e.subs[0] = this.free), this.free = e;
	}
	checkLimits(t) {
		if (this.numRunes > e.MAX_RUNES) throw new O(e.ERR_LARGE);
		this.checkSize(t), this.checkHeight(t);
	}
	checkSize(t) {
		if (this.size === null) {
			if (this.repeats === 0 && (this.repeats = 1), t.op === A.Op.REPEAT) {
				let n = t.max;
				n === -1 && (n = t.min), n <= 0 && (n = 1), n > Math.floor(e.MAX_SIZE / this.repeats) ? this.repeats = e.MAX_SIZE : this.repeats *= n;
			}
			if (this.numRegexp < Math.floor(e.MAX_SIZE / this.repeats)) return;
			this.size = /* @__PURE__ */ new Map();
			for (let e of this.stack) this.checkSize(e);
		}
		if (this.calcSize(t, !0) > e.MAX_SIZE) throw new O(e.ERR_LARGE);
	}
	calcSize(e, t = !1) {
		if (!t && this.size !== null && this.size.has(e)) return this.size.get(e);
		let n = 0;
		switch (e.op) {
			case A.Op.LITERAL:
				n = e.runes.length;
				break;
			case A.Op.PLB:
			case A.Op.NLB:
			case A.Op.CAPTURE:
			case A.Op.STAR:
				n = 2 + this.calcSize(e.subs[0]);
				break;
			case A.Op.PLUS:
			case A.Op.QUEST:
				n = 1 + this.calcSize(e.subs[0]);
				break;
			case A.Op.CONCAT:
				for (let t of e.subs) n += this.calcSize(t);
				break;
			case A.Op.ALTERNATE:
				for (let t of e.subs) n += this.calcSize(t);
				e.subs.length > 1 && (n = n + e.subs.length - 1);
				break;
			case A.Op.REPEAT: {
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
			if (this.calcHeight(t, !0) > e.MAX_HEIGHT) throw new O(e.ERR_NESTING_DEPTH);
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
		for (; t > 0 && !A.isPseudoOp(this.stack[t - 1].op);) t--;
		let n = this.stack.slice(t, e);
		return this.stack = this.stack.slice(0, t), n;
	}
	push(e) {
		if (this.numRunes += e.runes.length, e.op === A.Op.CHAR_CLASS && e.runes.length === 2 && e.runes[0] === e.runes[1]) {
			if (this.maybeConcat(e.runes[0], this.flags & ~x.FOLD_CASE)) return null;
			e.op = A.Op.LITERAL, e.runes = [e.runes[0]], e.flags = this.flags & ~x.FOLD_CASE;
		} else if (e.op === A.Op.CHAR_CLASS && e.runes.length === 4 && e.runes[0] === e.runes[1] && e.runes[2] === e.runes[3] && T.simpleFold(e.runes[0]) === e.runes[2] && T.simpleFold(e.runes[2]) === e.runes[0] || e.op === A.Op.CHAR_CLASS && e.runes.length === 2 && e.runes[0] + 1 === e.runes[1] && T.simpleFold(e.runes[0]) === e.runes[1] && T.simpleFold(e.runes[1]) === e.runes[0]) {
			if (this.maybeConcat(e.runes[0], this.flags | x.FOLD_CASE)) return null;
			e.op = A.Op.LITERAL, e.runes = [e.runes[0]], e.flags = this.flags | x.FOLD_CASE;
		} else this.maybeConcat(-1, 0);
		return this.stack.push(e), this.checkLimits(e), e;
	}
	maybeConcat(t, n) {
		let r = this.stack.length;
		if (r < 2) return !1;
		let i = this.stack[r - 1], a = this.stack[r - 2];
		return i.op !== A.Op.LITERAL || a.op !== A.Op.LITERAL || (i.flags & x.FOLD_CASE) !== (a.flags & x.FOLD_CASE) ? !1 : (a.runes = e.concatRunes(a.runes, i.runes), t >= 0 ? (i.runes = [t], i.flags = n, !0) : (this.pop(), this.reuse(i), !1));
	}
	newLiteral(t, n) {
		let r = this.newRegexp(A.Op.LITERAL);
		return r.flags = n, (n & x.FOLD_CASE) !== 0 && (t = e.minFoldRune(t)), r.runes = [t], r;
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
		if ((s & x.PERL_X) !== 0 && (a.more() && a.lookingAt("?") && (a.skip(1), s ^= x.NON_GREEDY), o !== -1)) throw new O(e.ERR_INVALID_REPEAT_OP, a.from(o));
		let c = this.stack.length;
		if (c === 0) throw new O(e.ERR_MISSING_REPEAT_ARGUMENT, a.from(i));
		let l = this.stack[c - 1];
		if (A.isPseudoOp(l.op)) throw new O(e.ERR_MISSING_REPEAT_ARGUMENT, a.from(i));
		let u = this.newRegexp(t);
		if (u.min = n, u.max = r, u.flags = s, u.subs = [l], this.stack[c - 1] = u, this.checkLimits(u), t === A.Op.REPEAT && (n >= 2 || r >= 2) && !this.repeatIsValid(u, 1e3)) throw new O(e.ERR_INVALID_REPEAT_SIZE, a.from(i));
	}
	repeatIsValid(e, t) {
		if (e.op === A.Op.REPEAT) {
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
		return e.length === 0 ? this.push(this.newRegexp(A.Op.EMPTY_MATCH)) : this.push(this.collapse(e, A.Op.CONCAT));
	}
	alternate() {
		let e = this.popToPseudo();
		return e.length > 0 && this.cleanAlt(e[e.length - 1]), e.length === 0 ? this.push(this.newRegexp(A.Op.NO_MATCH)) : this.push(this.collapse(e, A.Op.ALTERNATE));
	}
	cleanAlt(e) {
		e.op === A.Op.CHAR_CLASS && (e.runes = new yc(e.runes).cleanClass().toArray(), e.runes.length === 2 && e.runes[0] === 0 && e.runes[1] === T.MAX_RUNE ? (e.runes = [], e.op = A.Op.ANY_CHAR) : e.runes.length === 4 && e.runes[0] === 0 && e.runes[1] === S.CODES.get("\n") - 1 && e.runes[2] === S.CODES.get("\n") + 1 && e.runes[3] === T.MAX_RUNE && (e.runes = [], e.op = A.Op.ANY_CHAR_NOT_NL));
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
		if (a.subs = r, t === A.Op.ALTERNATE && (a.subs = this.factor(a.subs), a.subs.length === 1)) {
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
				if (r.op === A.Op.CONCAT && r.subs.length > 0 && (r = r.subs[0]), r.op === A.Op.LITERAL && (l = r.runes, u = r.runes.length, d = r.flags & x.FOLD_CASE), d === s) {
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
					let r = this.newRegexp(A.Op.LITERAL);
					r.flags = s, r.runes = a.slice(0, o);
					for (let r = c; r < e; r++) t[n + r] = this.removeLeadingString(t[n + r], o), this.checkLimits(t[n + r]);
					let l = this.collapse(t.slice(n + c, n + e), A.Op.ALTERNATE), u = this.newRegexp(A.Op.CONCAT);
					u.subs = [r, l], t[i++] = u;
				}
			}
			c = e, a = l, o = u, s = d;
		}
		r = i, n = 0, c = 0, i = 0;
		let l = null;
		for (let a = 0; a <= r; a++) {
			let o = null;
			if (!(a < r && (o = e.leadingRegexp(t[n + a]), l !== null && l.equals(o) && (e.isCharClass(l) || l.op === A.Op.REPEAT && l.min === l.max && e.isCharClass(l.subs[0]))))) {
				if (a !== c) {
					if (a === c + 1) t[i++] = t[n + c];
					else {
						let e = l;
						for (let e = c; e < a; e++) {
							let r = e !== c;
							t[n + e] = this.removeLeadingRegexp(t[n + e], r), this.checkLimits(t[n + e]);
						}
						let r = this.collapse(t.slice(n + c, n + a), A.Op.ALTERNATE), o = this.newRegexp(A.Op.CONCAT);
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
		for (let e = 0; e < r; ++e) e + 1 < r && t[n + e].op === A.Op.EMPTY_MATCH && t[n + e + 1].op === A.Op.EMPTY_MATCH || (t[i++] = t[n + e]);
		return r = i, n = 0, t.slice(n, r);
	}
	removeLeadingString(e, t) {
		if (e.op === A.Op.CONCAT && e.subs.length > 0) {
			let n = this.removeLeadingString(e.subs[0], t);
			if (e.subs[0] = n, n.op === A.Op.EMPTY_MATCH) switch (this.reuse(n), e.subs.length) {
				case 0:
				case 1:
					e.op = A.Op.EMPTY_MATCH, e.subs = A.emptySubs();
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
		return e.op === A.Op.LITERAL && (e.runes = e.runes.slice(t, e.runes.length), e.runes.length === 0 && (e.op = A.Op.EMPTY_MATCH)), e;
	}
	removeLeadingRegexp(e, t) {
		if (e.op === A.Op.CONCAT && e.subs.length > 0) {
			switch (t && this.reuse(e.subs[0]), e.subs = e.subs.slice(1, e.subs.length), e.subs.length) {
				case 0:
					e.op = A.Op.EMPTY_MATCH, e.subs = A.emptySubs();
					break;
				case 1: {
					let t = e;
					e = e.subs[0], this.reuse(t);
					break;
				}
			}
			return e;
		}
		return t && this.reuse(e), this.newRegexp(A.Op.EMPTY_MATCH);
	}
	parseInternal() {
		if ((this.flags & x.LITERAL) !== 0) return e.literalRegexp(this.wholeRegexp, this.flags);
		let t = -1, n = -1, r = -1, i = new bc(this.wholeRegexp);
		for (; i.more();) {
			let a = -1;
			bigswitch: switch (i.peek()) {
				case S.CODES.get("("):
					if ((this.flags & x.LOOKBEHIND) !== 0) {
						if (i.lookingAt("(?<=")) {
							this.parsePosLookBehind(), i.skip(4);
							break;
						}
						if (i.lookingAt("(?<!")) {
							this.parseNegLookBehind(), i.skip(4);
							break;
						}
					}
					if ((this.flags & x.PERL_X) !== 0 && i.lookingAt("(?")) {
						this.parsePerlFlags(i);
						break;
					}
					this.op(A.Op.LEFT_PAREN).cap = ++this.numCap, i.skip(1);
					break;
				case S.CODES.get("|"):
					this.parseVerticalBar(), i.skip(1);
					break;
				case S.CODES.get(")"):
					this.parseRightParen(), i.skip(1);
					break;
				case S.CODES.get("^"):
					(this.flags & x.ONE_LINE) === 0 ? this.op(A.Op.BEGIN_LINE) : this.op(A.Op.BEGIN_TEXT), i.skip(1);
					break;
				case S.CODES.get("$"):
					(this.flags & x.ONE_LINE) === 0 ? this.op(A.Op.END_LINE) : this.op(A.Op.END_TEXT).flags |= x.WAS_DOLLAR, i.skip(1);
					break;
				case S.CODES.get("."):
					(this.flags & x.DOT_NL) === 0 ? this.op(A.Op.ANY_CHAR_NOT_NL) : this.op(A.Op.ANY_CHAR), i.skip(1);
					break;
				case S.CODES.get("["):
					this.parseClass(i);
					break;
				case S.CODES.get("*"):
				case S.CODES.get("+"):
				case S.CODES.get("?"): {
					a = i.pos();
					let e = null;
					switch (i.pop()) {
						case S.CODES.get("*"):
							e = A.Op.STAR;
							break;
						case S.CODES.get("+"):
							e = A.Op.PLUS;
							break;
						case S.CODES.get("?"): e = A.Op.QUEST;
					}
					this.repeat(e, n, r, a, i, t);
					break;
				}
				case S.CODES.get("{"): {
					a = i.pos();
					let o = e.parseRepeat(i);
					if (o < 0) {
						i.rewindTo(a), this.literal(i.pop());
						break;
					}
					n = o >> 16, r = (o & T.MAX_BMP) << 16 >> 16, this.repeat(A.Op.REPEAT, n, r, a, i, t);
					break;
				}
				case S.CODES.get("\\"): {
					let t = i.pos();
					if (i.skip(1), (this.flags & x.PERL_X) !== 0 && i.more()) switch (i.pop()) {
						case S.CODES.get("A"):
							this.op(A.Op.BEGIN_TEXT);
							break bigswitch;
						case S.CODES.get("b"):
							this.op(A.Op.WORD_BOUNDARY);
							break bigswitch;
						case S.CODES.get("B"):
							this.op(A.Op.NO_WORD_BOUNDARY);
							break bigswitch;
						case S.CODES.get("C"): throw new O(e.ERR_INVALID_ESCAPE, "\\C");
						case S.CODES.get("Q"): {
							let e = i.rest(), t = e.indexOf("\\E");
							t >= 0 ? (e = e.substring(0, t), i.skipString(e), i.skipString("\\E")) : i.skipString(e);
							let n = 0;
							for (; n < e.length;) {
								let t = e.codePointAt(n);
								this.literal(t), n += E.charCount(t);
							}
							break bigswitch;
						}
						case S.CODES.get("z"):
							this.op(A.Op.END_TEXT);
							break bigswitch;
						default:
							i.rewindTo(t);
							break;
					}
					else i.rewindTo(t);
					let n = this.newRegexp(A.Op.CHAR_CLASS);
					if (n.flags = this.flags, i.lookingAt("\\p") || i.lookingAt("\\P")) {
						let e = new yc();
						if (this.parseUnicodeClass(i, e)) {
							n.runes = e.toArray(), this.push(n);
							break bigswitch;
						}
					}
					let r = new yc();
					if (this.parsePerlClassEscape(i, r)) {
						n.runes = r.toArray(), this.push(n);
						break bigswitch;
					}
					i.rewindTo(t), this.reuse(n), this.literal(e.parseEscape(i));
					break;
				}
				default:
					this.literal(i.pop());
					break;
			}
			t = a;
		}
		if (this.concat(), this.swapVerticalBar() && this.pop(), this.alternate(), this.stack.length !== 1) throw new O(e.ERR_MISSING_PAREN, this.wholeRegexp);
		return this.stack[0].namedGroups = this.namedGroups, this.stack[0];
	}
	parsePerlFlags(t) {
		let n = t.pos(), r = t.rest();
		if (r.startsWith("(?P<") || r.startsWith("(?<")) {
			let n = r.charAt(2) === "P" ? 4 : 3, i = r.indexOf(">");
			if (i < 0) throw new O(e.ERR_INVALID_NAMED_CAPTURE, r);
			let a = r.substring(n, i);
			if (t.skipString(a), t.skip(n + 1), !e.isValidCaptureName(a)) throw new O(e.ERR_INVALID_NAMED_CAPTURE, r.substring(0, i + 1));
			let o = this.op(A.Op.LEFT_PAREN);
			if (o.cap = ++this.numCap, this.namedGroups[a]) throw new O(e.ERR_DUPLICATE_NAMED_CAPTURE, a);
			this.namedGroups[a] = this.numCap, o.name = a;
			return;
		}
		t.skip(2);
		let i = this.flags, a = 1, o = !1;
		loop: for (; t.more();) {
			let e = t.pop();
			switch (e) {
				case S.CODES.get("i"):
					i |= x.FOLD_CASE, o = !0;
					break;
				case S.CODES.get("m"):
					i &= ~x.ONE_LINE, o = !0;
					break;
				case S.CODES.get("s"):
					i |= x.DOT_NL, o = !0;
					break;
				case S.CODES.get("U"):
					i |= x.NON_GREEDY, o = !0;
					break;
				case S.CODES.get("-"):
					if (a < 0) break loop;
					a = -1, i = ~i, o = !1;
					break;
				case S.CODES.get(":"):
				case S.CODES.get(")"):
					if (a < 0) {
						if (!o) break loop;
						i = ~i;
					}
					e === S.CODES.get(":") && this.op(A.Op.LEFT_PAREN), this.flags = i;
					return;
				default: break loop;
			}
		}
		throw new O(e.ERR_INVALID_PERL_OP, t.from(n));
	}
	parsePosLookBehind() {
		let e = this.newRegexp(A.Op.LEFT_PAREN);
		return e.flags = this.flags, e.lb = ++this.nlb, this.push(e);
	}
	parseNegLookBehind() {
		let e = this.newRegexp(A.Op.LEFT_PAREN);
		return e.flags = this.flags, e.lb = -++this.nlb, this.push(e);
	}
	parseVerticalBar() {
		this.concat(), this.swapVerticalBar() || this.op(A.Op.VERTICAL_BAR);
	}
	swapVerticalBar() {
		let t = this.stack.length;
		if (t >= 3 && this.stack[t - 2].op === A.Op.VERTICAL_BAR && e.isCharClass(this.stack[t - 1]) && e.isCharClass(this.stack[t - 3])) {
			let n = this.stack[t - 1], r = this.stack[t - 3];
			if (n.op > r.op) {
				let e = r;
				r = n, n = e, this.stack[t - 3] = r;
			}
			return e.mergeCharClass(r, n), this.reuse(n), this.pop(), !0;
		}
		if (t >= 2) {
			let e = this.stack[t - 1], n = this.stack[t - 2];
			if (n.op === A.Op.VERTICAL_BAR) return t >= 3 && this.cleanAlt(this.stack[t - 3]), this.stack[t - 2] = e, this.stack[t - 1] = n, !0;
		}
		return !1;
	}
	parseRightParen() {
		if (this.concat(), this.swapVerticalBar() && this.pop(), this.alternate(), this.stack.length < 2) throw new O(e.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
		let t = this.pop(), n = this.pop();
		if (n.op !== A.Op.LEFT_PAREN) throw new O(e.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
		if (this.flags = n.flags, n.lb !== 0) {
			if (e.hasCapture(t)) throw new O(e.ERR_INVALID_CAPTURE_IN_LOOKBEHIND, this.wholeRegexp);
			n.op = n.lb > 0 ? A.Op.PLB : A.Op.NLB, n.subs = [t], this.push(n);
			return;
		}
		n.cap === 0 ? this.push(t) : (n.op = A.Op.CAPTURE, n.subs = [t], this.push(n));
	}
	parsePerlClassEscape(e, t) {
		let n = e.pos();
		if ((this.flags & x.PERL_X) === 0 || !e.more() || e.pop() !== S.CODES.get("\\") || !e.more()) return !1;
		e.pop();
		let r = e.from(n), i = rc.has(r) ? rc.get(r) : null;
		return i !== null && (t.appendGroup(i, (this.flags & x.FOLD_CASE) !== 0), !0);
	}
	parseNamedClass(t, n) {
		let r = t.rest(), i = r.indexOf(":]");
		if (i < 0) return !1;
		let a = r.substring(0, i + 2);
		t.skipString(a);
		let o = vc.has(a) ? vc.get(a) : null;
		if (o === null) throw new O(e.ERR_INVALID_CHAR_RANGE, a);
		return n.appendGroup(o, (this.flags & x.FOLD_CASE) !== 0), !0;
	}
	parseUnicodeClass(t, n) {
		let r = t.pos();
		if ((this.flags & x.UNICODE_GROUPS) === 0 || !t.lookingAt("\\p") && !t.lookingAt("\\P")) return !1;
		t.skip(1);
		let i = 1, a = t.pop();
		if (a === S.CODES.get("P") && (i = -1), !t.more()) throw t.rewindTo(r), new O(e.ERR_INVALID_CHAR_RANGE, t.rest());
		a = t.pop();
		let o;
		if (a !== S.CODES.get("{")) o = E.runeToString(a);
		else {
			let n = t.rest(), i = n.indexOf("}");
			if (i < 0) throw t.rewindTo(r), new O(e.ERR_INVALID_CHAR_RANGE, t.rest());
			o = n.substring(0, i), t.skipString(o), t.skip(1);
		}
		o.length !== 0 && o.codePointAt(0) === S.CODES.get("^") && (i = 0 - i, o = o.substring(1));
		let s = e.unicodeTable(o);
		if (s === null) throw new O(e.ERR_INVALID_CHAR_RANGE, t.from(r));
		s.sign < 0 && (i = 0 - i);
		let c = s.tab, l = s.fold;
		if ((this.flags & x.FOLD_CASE) === 0 || l === null) n.appendTableWithSign(c, i);
		else {
			let e = new yc().appendTable(c).appendTable(l).cleanClass().toArray();
			n.appendClassWithSign(e, i);
		}
		return !0;
	}
	parseClass(t) {
		let n = t.pos();
		t.skip(1);
		let r = this.newRegexp(A.Op.CHAR_CLASS);
		r.flags = this.flags;
		let i = new yc(), a = 1;
		t.more() && t.lookingAt("^") && (a = -1, t.skip(1), (this.flags & x.CLASS_NL) === 0 && i.appendRange(S.CODES.get("\n"), S.CODES.get("\n")));
		let o = !0;
		for (; !t.more() || t.peek() !== S.CODES.get("]") || o;) {
			if (t.more() && t.lookingAt("-") && (this.flags & x.PERL_X) === 0 && !o) {
				let r = t.rest();
				if (r === "-" || !r.startsWith("-]")) throw t.rewindTo(n), new O(e.ERR_INVALID_CHAR_RANGE, t.rest());
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
				else if (s = e.parseClassChar(t, n), s < a) throw new O(e.ERR_INVALID_CHAR_RANGE, t.from(r));
			}
			(this.flags & x.FOLD_CASE) === 0 ? i.appendRange(a, s) : i.appendFoldedRange(a, s);
		}
		t.skip(1), i.cleanClass(), a < 0 && i.negateClass(), r.runes = i.toArray(), this.push(r);
	}
}, Sc = class e {
	static initTest(t) {
		let n = e.compile(t), r = new e(n.expr, n.prog, n.numSubexp, n.longest);
		return r.cond = n.cond, r.prefix = n.prefix, r.prefixUTF8 = n.prefixUTF8, r.prefixComplete = n.prefixComplete, r.prefixRune = n.prefixRune, r.prefilter = n.prefilter, r;
	}
	static compile(t) {
		return e.compileImpl(t, x.PERL, !1);
	}
	static compilePOSIX(t) {
		return e.compileImpl(t, x.POSIX, !0);
	}
	static compileImpl(t, n, r) {
		let i = xc.parse(t, n), a = i.maxCap();
		i = $s.simplify(i);
		let o = Js.build(i), s = Qs.compileRegexp(i), c = new e(t, s, a, r);
		c.prefilter = o.type === j.Type.NONE ? null : o;
		let [l, u] = s.prefix();
		return c.prefixComplete = l, c.prefix = u, c.prefixUTF8 = E.stringToUtf8ByteArray(c.prefix), c.prefix.length > 0 && (c.prefixRune = c.prefix.codePointAt(0)), c.namedGroups = i.namedGroups, c;
	}
	static match(t, n) {
		return e.compile(t).match(n);
	}
	constructor(e, t, n = 0, r = 0) {
		this.expr = e, this.prog = t, this.numSubexp = n, this.longest = r, this.cond = t.startCond(), this.prefix = null, this.prefixUTF8 = null, this.prefixComplete = !1, this.prefixRune = 0, this.machinePool = [], this.dfa = new Ms(this.prog), this.onepass = Ks.compile(this.prog), this.prefilter = null;
	}
	matchPrefixComplete(e, t, n, r) {
		if ((n === x.ANCHOR_START || n === x.ANCHOR_BOTH) && t !== 0) return null;
		let i = -1, a = -1, o = e.prefixLength(this);
		if (n === x.UNANCHORED) {
			let n = e.index(this, t);
			if (n < 0) return null;
			i = t + n, a = i + o;
		} else if (n === x.ANCHOR_BOTH) {
			if (e.endPos() !== o || e.index(this, 0) !== 0) return null;
			i = 0, a = o;
		} else if (n === x.ANCHOR_START) {
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
	executeEngine(e, t, n, r) {
		if (this.prefixComplete && (r === 0 || this.numSubexp === 0)) return this.matchPrefixComplete(e, t, n, r);
		if (this.prefilter !== null && n === x.UNANCHORED && !this.prefilter.eval(e, t)) return null;
		if (this.onepass !== null) return Ks.execute(this, e, t, n, r);
		if (r > 0) return this.prog.numLb === 0 && e.endPos() <= zs.maxBitStateLen(this.prog) ? zs.execute(this, e, t, n, r) : this.doExecuteNFA(e, t, n, r);
		if (this.prog.numLb === 0) {
			let i = this.dfa.match(e, t, n);
			if (i !== null) return i ? [] : null;
			if (e.endPos() <= zs.maxBitStateLen(this.prog)) return zs.execute(this, e, t, n, r);
		}
		return this.doExecuteNFA(e, t, n, r);
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
	doExecuteNFA(e, t, n, r) {
		let i = this.get();
		i ||= Os.fromRE2(this), i.init(r);
		let a = i.match(e, t, n) ? i.submatches() : null;
		return this.put(i), a;
	}
	match(e) {
		return this.executeEngine(D.fromUTF16(e), 0, x.UNANCHORED, 0) !== null;
	}
	matchWithGroup(e, t, n, r, i) {
		return e instanceof ms || (e = E.isByteArray(e) ? _s.utf8(e) : _s.utf16(e)), this.matchMachineInput(e, t, n, r, i);
	}
	matchMachineInput(e, t, n, r, i) {
		if (t > n) return [!1, null];
		let a = e.isUTF16Encoding() ? D.fromUTF16(e.asCharSequence(), 0, n) : D.fromUTF8(e.asBytes(), 0, n), o = this.executeEngine(a, t, r, 2 * i);
		return o === null ? [!1, null] : [!0, o];
	}
	matchUTF8(e) {
		return this.executeEngine(D.fromUTF8(e), 0, x.UNANCHORED, 0) !== null;
	}
	replaceAll(e, t) {
		return this.replaceAllFunc(e, () => t, 2 * e.length + 1);
	}
	replaceFirst(e, t) {
		return this.replaceAllFunc(e, () => t, 1);
	}
	replaceAllFunc(e, t, n) {
		let r = 0, i = 0, a = "", o = D.fromUTF16(e), s = 0;
		for (; i <= e.length;) {
			let c = this.executeEngine(o, i, x.UNANCHORED, 2);
			if (c === null || c.length === 0) break;
			a += e.substring(r, c[0]), (c[1] > r || c[0] === 0) && (a += t(e.substring(c[0], c[1])), s++), r = c[1];
			let l = o.step(i) & 7;
			if (i + l > c[1] ? i += l : i + 1 > c[1] ? i++ : i = c[1], s >= n) break;
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
		let a = 0, o = 0, s = -1;
		for (; o < t && a <= i;) {
			let t = this.executeEngine(e, a, x.UNANCHORED, this.prog.numCap);
			if (t === null || t.length === 0) break;
			let c = !0;
			if (t[1] === a) {
				t[0] === s && (c = !1);
				let n = e.step(a);
				n < 0 ? a = i + 1 : a += n & 7;
			} else a = t[1];
			s = t[1], c && (r.push(n(this.pad(t))), o++);
		}
		return r;
	}
	findUTF8(e) {
		let t = this.executeEngine(D.fromUTF8(e), 0, x.UNANCHORED, 2);
		return t === null ? null : e.slice(t[0], t[1]);
	}
	findUTF8Index(e) {
		let t = this.executeEngine(D.fromUTF8(e), 0, x.UNANCHORED, 2);
		return t === null ? null : t.slice(0, 2);
	}
	find(e) {
		let t = this.executeEngine(D.fromUTF16(e), 0, x.UNANCHORED, 2);
		return t === null ? "" : e.substring(t[0], t[1]);
	}
	findIndex(e) {
		return this.executeEngine(D.fromUTF16(e), 0, x.UNANCHORED, 2);
	}
	findUTF8Submatch(e) {
		let t = this.executeEngine(D.fromUTF8(e), 0, x.UNANCHORED, this.prog.numCap);
		if (t === null) return null;
		let n = Array(1 + this.numSubexp).fill(null);
		for (let r = 0; r < n.length; r++) 2 * r < t.length && t[2 * r] >= 0 && (n[r] = e.slice(t[2 * r], t[2 * r + 1]));
		return n;
	}
	findUTF8SubmatchIndex(e) {
		return this.pad(this.executeEngine(D.fromUTF8(e), 0, x.UNANCHORED, this.prog.numCap));
	}
	findSubmatch(e) {
		let t = this.executeEngine(D.fromUTF16(e), 0, x.UNANCHORED, this.prog.numCap);
		if (t === null) return null;
		let n = Array(1 + this.numSubexp).fill(null);
		for (let r = 0; r < n.length; r++) 2 * r < t.length && t[2 * r] >= 0 && (n[r] = e.substring(t[2 * r], t[2 * r + 1]));
		return n;
	}
	findSubmatchIndex(e) {
		return this.pad(this.executeEngine(D.fromUTF16(e), 0, x.UNANCHORED, this.prog.numCap));
	}
	findAllUTF8(e, t) {
		let n = this.allMatches(D.fromUTF8(e), t, (t) => e.slice(t[0], t[1]));
		return n.length === 0 ? null : n;
	}
	findAllUTF8Index(e, t) {
		let n = this.allMatches(D.fromUTF8(e), t, (e) => e.slice(0, 2));
		return n.length === 0 ? null : n;
	}
	findAll(e, t) {
		let n = this.allMatches(D.fromUTF16(e), t, (t) => e.substring(t[0], t[1]));
		return n.length === 0 ? null : n;
	}
	findAllIndex(e, t) {
		let n = this.allMatches(D.fromUTF16(e), t, (e) => e.slice(0, 2));
		return n.length === 0 ? null : n;
	}
	findAllUTF8Submatch(e, t) {
		let n = this.allMatches(D.fromUTF8(e), t, (t) => {
			let n = Array(t.length / 2 | 0).fill(null);
			for (let r = 0; r < n.length; r++) t[2 * r] >= 0 && (n[r] = e.slice(t[2 * r], t[2 * r + 1]));
			return n;
		});
		return n.length === 0 ? null : n;
	}
	findAllUTF8SubmatchIndex(e, t) {
		let n = this.allMatches(D.fromUTF8(e), t);
		return n.length === 0 ? null : n;
	}
	findAllSubmatch(e, t) {
		let n = this.allMatches(D.fromUTF16(e), t, (t) => {
			let n = Array(t.length / 2 | 0).fill(null);
			for (let r = 0; r < n.length; r++) t[2 * r] >= 0 && (n[r] = e.substring(t[2 * r], t[2 * r + 1]));
			return n;
		});
		return n.length === 0 ? null : n;
	}
	findAllSubmatchIndex(e, t) {
		let n = this.allMatches(D.fromUTF16(e), t);
		return n.length === 0 ? null : n;
	}
};
(class e {
	static UNANCHORED = x.UNANCHORED;
	static ANCHOR_START = x.ANCHOR_START;
	static ANCHOR_BOTH = x.ANCHOR_BOTH;
	constructor(t = e.UNANCHORED, n = 0, r = 8388608) {
		this.anchor = t, this.jsFlags = n, this.maxMem = r;
		let i = x.PERL;
		(n & $o.DISABLE_UNICODE_GROUPS) !== 0 && (i &= ~x.UNICODE_GROUPS), (n & $o.LOOKBEHINDS) !== 0 && (i |= x.LOOKBEHIND), this.re2Flags = i, this.regexps = [], this.prog = null, this.dfa = null, this.dummyRe2 = null;
	}
	add(e) {
		if (this.prog) throw new Ss("Cannot add patterns after compile");
		let t = e;
		(this.jsFlags & $o.CASE_INSENSITIVE) !== 0 && (t = `(?i)${t}`), (this.jsFlags & $o.DOTALL) !== 0 && (t = `(?s)${t}`), (this.jsFlags & $o.MULTILINE) !== 0 && (t = `(?m)${t}`);
		let n = xc.parse(t, this.re2Flags);
		return this.regexps.push($s.simplify(n)), this.regexps.length - 1;
	}
	compile() {
		this.prog || (this.prog = Qs.compileSet(this.regexps), this.dfa = new Ms(this.prog, this.maxMem), this.dummyRe2 = {
			prog: this.prog,
			cond: this.prog.startCond(),
			prefix: "",
			prefixRune: 0,
			longest: !1
		});
	}
	match(t) {
		this.prog || this.compile();
		let n = E.isByteArray(t) ? D.fromUTF8(t) : D.fromUTF16(t), r = x.UNANCHORED;
		this.anchor === e.ANCHOR_START ? r = x.ANCHOR_START : this.anchor === e.ANCHOR_BOTH && (r = x.ANCHOR_BOTH);
		let i = this.dfa.matchSet(n, 0, r);
		if (i !== null) return i;
		let a = Os.fromRE2(this.dummyRe2);
		return a.init(0), a.matchSet(n, 0, r);
	}
});
var Cc = class e {
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
							let n = E.charCount(e);
							r += t.substring(s + 1, s + 1 + n), s += n + 1, i = !0;
						} else {
							r += "\\";
							let n = E.charCount(e);
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
			let c = t.codePointAt(s), l = E.charCount(c);
			r += t.substring(s, s + l), s += l;
		}
		let c = i ? r : t;
		return n.length > 0 ? `(?${n})${c}` : c;
	}
}, wc = class e {
	static CASE_INSENSITIVE = $o.CASE_INSENSITIVE;
	static DOTALL = $o.DOTALL;
	static MULTILINE = $o.MULTILINE;
	static DISABLE_UNICODE_GROUPS = $o.DISABLE_UNICODE_GROUPS;
	static LONGEST_MATCH = $o.LONGEST_MATCH;
	static LOOKBEHINDS = $o.LOOKBEHINDS;
	static quote(e) {
		return E.quoteMeta(e);
	}
	static quoteReplacement(e, t = !1) {
		return Es.quoteReplacement(e, t);
	}
	static translateRegExp(e) {
		return Cc.translate(e);
	}
	static compile(t, n = 0) {
		let r = t;
		if ((n & e.CASE_INSENSITIVE) !== 0 && (r = `(?i)${r}`), (n & e.DOTALL) !== 0 && (r = `(?s)${r}`), (n & e.MULTILINE) !== 0 && (r = `(?m)${r}`), (n & ~(e.MULTILINE | e.DOTALL | e.CASE_INSENSITIVE | e.DISABLE_UNICODE_GROUPS | e.LONGEST_MATCH | e.LOOKBEHINDS)) !== 0) throw new ws("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");
		let i = x.PERL;
		(n & e.DISABLE_UNICODE_GROUPS) !== 0 && (i &= ~x.UNICODE_GROUPS), (n & e.LOOKBEHINDS) !== 0 && (i |= x.LOOKBEHIND);
		let a = new e(t, n);
		return a.re2Input = Sc.compileImpl(r, i, (n & e.LONGEST_MATCH) !== 0), a;
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
		return E.isByteArray(e) && (e = _s.utf8(e)), new Es(this, e);
	}
	test(e) {
		return E.isByteArray(e) ? this.re2Input.matchUTF8(e) : this.re2Input.match(e);
	}
	testExact(e) {
		let t = E.isByteArray(e) ? D.fromUTF8(e) : D.fromUTF16(e);
		return this.re2Input.executeEngine(t, 0, x.ANCHOR_BOTH, 0) !== null;
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
}, Tc = "12.18.0";
function Ec(e) {
	Tc = e;
}
var Dc = new ze("@firebase/firestore");
function Oc() {
	return Dc.logLevel;
}
function N(e, ...t) {
	if (Dc.logLevel <= _.DEBUG) {
		let n = t.map(jc);
		Dc.debug(`Firestore (${Tc}): ${e}`, ...n);
	}
}
function kc(e, ...t) {
	if (Dc.logLevel <= _.ERROR) {
		let n = t.map(jc);
		Dc.error(`Firestore (${Tc}): ${e}`, ...n);
	}
}
function Ac(e, ...t) {
	if (Dc.logLevel <= _.WARN) {
		let n = t.map(jc);
		Dc.warn(`Firestore (${Tc}): ${e}`, ...n);
	}
}
function jc(e) {
	if (typeof e == "string") return e;
	try {
		return function(e) {
			return JSON.stringify(e);
		}(e);
	} catch {
		return e;
	}
}
function P(e, t, n) {
	let r = "Unexpected state";
	typeof t == "string" ? r = t : n = t, Mc(e, r, n);
}
function Mc(e, t, n) {
	let r = `FIRESTORE (${Tc}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;
	if (n !== void 0) try {
		r += " CONTEXT: " + JSON.stringify(n);
	} catch {
		r += " CONTEXT: " + n;
	}
	throw kc(r), Error(r);
}
function F(e, t, n, r) {
	let i = "Unexpected state";
	typeof n == "string" ? i = n : r = n, e || Mc(t, i, r);
}
function I(e, t) {
	return e;
}
function Nc(e) {
	let t = typeof self < "u" && (self.crypto || self.msCrypto), n = new Uint8Array(e);
	if (t && typeof t.getRandomValues == "function") t.getRandomValues(n);
	else for (let t = 0; t < e; t++) n[t] = Math.floor(256 * Math.random());
	return n;
}
var Pc = class {
	static newId() {
		let e = "";
		for (; e.length < 20;) {
			let t = Nc(40);
			for (let n = 0; n < t.length; ++n) e.length < 20 && t[n] < 248 && (e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(t[n] % 62));
		}
		return e;
	}
};
function L(e, t) {
	return e < t ? -1 : +(e > t);
}
function Fc(e, t) {
	let n = Math.min(e.length, t.length);
	for (let r = 0; r < n; r++) {
		let n = e.charAt(r), i = t.charAt(r);
		if (n !== i) return Rc(n) === Rc(i) ? L(n, i) : Rc(n) ? 1 : -1;
	}
	return L(e.length, t.length);
}
var Ic = 55296, Lc = 57343;
function Rc(e) {
	let t = e.charCodeAt(0);
	return t >= Ic && t <= Lc;
}
function zc(e, t, n) {
	return e.length === t.length && e.every(((e, r) => n(e, t[r])));
}
function Bc(e) {
	return e + "\0";
}
var Vc = class e {
	constructor(e, t) {
		this.comparator = e, this.root = t || Uc.EMPTY;
	}
	insert(t, n) {
		return new e(this.comparator, this.root.insert(t, n, this.comparator).copy(null, null, Uc.BLACK, null, null));
	}
	remove(t) {
		return new e(this.comparator, this.root.remove(t, this.comparator).copy(null, null, Uc.BLACK, null, null));
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
		return new Hc(this.root, null, this.comparator, !1);
	}
	getIteratorFrom(e) {
		return new Hc(this.root, e, this.comparator, !1);
	}
	getReverseIterator() {
		return new Hc(this.root, null, this.comparator, !0);
	}
	getReverseIteratorFrom(e) {
		return new Hc(this.root, e, this.comparator, !0);
	}
}, Hc = class {
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
}, Uc = class e {
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
		if (this.isRed() && this.left.isRed()) throw P(43730, {
			key: this.key,
			value: this.value
		});
		if (this.right.isRed()) throw P(14113, {
			key: this.key,
			value: this.value
		});
		let e = this.left.check();
		if (e !== this.right.check()) throw P(27949);
		return e + +!this.isRed();
	}
};
Uc.EMPTY = null, Uc.RED = !0, Uc.BLACK = !1, Uc.EMPTY = new class {
	constructor() {
		this.size = 0;
	}
	get key() {
		throw P(57766);
	}
	get value() {
		throw P(16141);
	}
	get color() {
		throw P(16727);
	}
	get left() {
		throw P(29726);
	}
	get right() {
		throw P(36894);
	}
	copy(e, t, n, r, i) {
		return this;
	}
	insert(e, t, n) {
		return new Uc(e, t);
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
var R = class e {
	constructor(e) {
		this.comparator = e, this.data = new Vc(this.comparator);
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
		return new Wc(this.data.getIterator());
	}
	getIteratorFrom(e) {
		return new Wc(this.data.getIteratorFrom(e));
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
}, Wc = class {
	constructor(e) {
		this.iter = e;
	}
	getNext() {
		return this.iter.getNext().key;
	}
	hasNext() {
		return this.iter.hasNext();
	}
};
function Gc(e) {
	return e.hasNext() ? e.getNext() : void 0;
}
var z = {
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
}, B = class extends pe {
	constructor(e, t) {
		super(e, t), this.code = e, this.message = t, this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
	}
}, Kc = "__name__", qc = class e {
	constructor(e, t, n) {
		t === void 0 ? t = 0 : t > e.length && P(637, {
			offset: t,
			range: e.length
		}), n === void 0 ? n = e.length - t : n > e.length - t && P(1746, {
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
		return L(t.length, n.length);
	}
	static compareSegments(t, n) {
		let r = e.isNumericId(t), i = e.isNumericId(n);
		return r && !i ? -1 : !r && i ? 1 : r && i ? e.extractNumericId(t).compare(e.extractNumericId(n)) : Fc(t, n);
	}
	static isNumericId(e) {
		return e.startsWith("__id") && e.endsWith("__");
	}
	static extractNumericId(e) {
		return Vo.fromString(e.substring(4, e.length - 2));
	}
}, V = class e extends qc {
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
			if (e.indexOf("//") >= 0) throw new B(z.INVALID_ARGUMENT, `Invalid segment (${e}). Paths must not contain // in them.`);
			n.push(...e.split("/").filter(((e) => e.length > 0)));
		}
		return new e(n);
	}
	static emptyPath() {
		return new e([]);
	}
}, Jc = /^[_a-zA-Z][_a-zA-Z0-9]*$/, Yc = class e extends qc {
	construct(t, n, r) {
		return new e(t, n, r);
	}
	static isValidIdentifier(e) {
		return Jc.test(e);
	}
	canonicalString() {
		return this.toArray().map(((t) => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), e.isValidIdentifier(t) || (t = "`" + t + "`"), t))).join(".");
	}
	toString() {
		return this.canonicalString();
	}
	isKeyField() {
		return this.length === 1 && this.get(0) === Kc;
	}
	static keyField() {
		return new e([Kc]);
	}
	static fromServerFormat(t) {
		let n = [], r = "", i = 0, a = () => {
			if (r.length === 0) throw new B(z.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
			n.push(r), r = "";
		}, o = !1;
		for (; i < t.length;) {
			let e = t[i];
			if (e === "\\") {
				if (i + 1 === t.length) throw new B(z.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
				let e = t[i + 1];
				if (e !== "\\" && e !== "." && e !== "`") throw new B(z.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
				r += e, i += 2;
			} else e === "`" ? (o = !o, i++) : e !== "." || o ? (r += e, i++) : (a(), i++);
		}
		if (a(), o) throw new B(z.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
		return new e(n);
	}
	static emptyPath() {
		return new e([]);
	}
}, Xc = class e {
	constructor(e) {
		this.fields = e, e.sort(Yc.comparator);
	}
	static empty() {
		return new e([]);
	}
	unionWith(t) {
		let n = new R(Yc.comparator);
		for (let e of this.fields) n = n.add(e);
		for (let e of t) n = n.add(e);
		return new e(n.toArray());
	}
	covers(e) {
		for (let t of this.fields) if (t.isPrefixOf(e)) return !0;
		return !1;
	}
	isEqual(e) {
		return zc(this.fields, e.fields, ((e, t) => e.isEqual(t)));
	}
};
function Zc(e) {
	let t = 0;
	for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t++;
	return t;
}
function Qc(e, t) {
	for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t(n, e[n]);
}
function $c(e, t) {
	let n = [];
	for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && n.push(t(e[r], r, e));
	return n;
}
function el(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
	return !0;
}
var H = class e {
	constructor(e) {
		this.path = e;
	}
	static fromPath(t) {
		return new e(V.fromString(t));
	}
	static fromName(t) {
		return new e(V.fromString(t).popFirst(5));
	}
	static empty() {
		return new e(V.emptyPath());
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
		return e !== null && V.comparator(this.path, e.path) === 0;
	}
	toString() {
		return this.path.toString();
	}
	static comparator(e, t) {
		return V.comparator(e.path, t.path);
	}
	static isDocumentKey(e) {
		return e.length % 2 == 0;
	}
	static fromSegments(t) {
		return new e(new V(t.slice()));
	}
};
function tl(e, t, n) {
	if (!n) throw new B(z.INVALID_ARGUMENT, `Function ${e}() cannot be called with an empty ${t}.`);
}
function nl(e, t, n, r) {
	if (!0 === t && !0 === r) throw new B(z.INVALID_ARGUMENT, `${e} and ${n} cannot be used together.`);
}
function rl(e) {
	if (!H.isDocumentKey(e)) throw new B(z.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`);
}
function il(e) {
	if (H.isDocumentKey(e)) throw new B(z.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`);
}
function al(e) {
	return typeof e == "object" && !!e && (Object.getPrototypeOf(e) === Object.prototype || Object.getPrototypeOf(e) === null);
}
function ol(e) {
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
	return typeof e == "function" ? "a function" : P(12329, { type: typeof e });
}
function sl(e, t) {
	if ("_delegate" in e && (e = e._delegate), !(e instanceof t)) {
		if (t.name === e.constructor.name) throw new B(z.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
		{
			let n = ol(e);
			throw new B(z.INVALID_ARGUMENT, `Expected type '${t.name}', but it was: ${n}`);
		}
	}
	return e;
}
function cl(e, t) {
	let n = { typeString: e };
	return t && (n.value = t), n;
}
function ll(e, t) {
	if (!al(e)) throw new B(z.INVALID_ARGUMENT, "JSON must be an object");
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
	if (n) throw new B(z.INVALID_ARGUMENT, n);
	return !0;
}
var ul = -62135596800, dl = 1e6, fl = class e {
	static now() {
		return e.fromMillis(Date.now());
	}
	static fromDate(t) {
		return e.fromMillis(t.getTime());
	}
	static fromMillis(t) {
		let n = Math.floor(t / 1e3), r = Math.floor((t - 1e3 * n) * dl);
		return new e(n, r);
	}
	constructor(e, t) {
		if (this.seconds = e, this.nanoseconds = t, t < 0 || t >= 1e9) throw new B(z.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
		if (e < ul || e >= 253402300800) throw new B(z.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
	}
	toDate() {
		return new Date(this.toMillis());
	}
	toMillis() {
		return 1e3 * this.seconds + this.nanoseconds / dl;
	}
	_compareTo(e) {
		return this.seconds === e.seconds ? L(this.nanoseconds, e.nanoseconds) : L(this.seconds, e.seconds);
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
		if (ll(t, e._jsonSchema)) return new e(t.seconds, t.nanoseconds);
	}
	valueOf() {
		let e = this.seconds - ul;
		return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
	}
};
fl._jsonSchemaVersion = "firestore/timestamp/1.0", fl._jsonSchema = {
	type: cl("string", fl._jsonSchemaVersion),
	seconds: cl("number"),
	nanoseconds: cl("number")
};
var pl = class extends Error {
	constructor() {
		super(...arguments), this.name = "Base64DecodeError";
	}
}, ml = class e {
	constructor(e) {
		this.binaryString = e;
	}
	static fromBase64String(t) {
		let n = function(e) {
			try {
				return atob(e);
			} catch (e) {
				throw typeof DOMException < "u" && e instanceof DOMException ? new pl("Invalid base64 string: " + e) : e;
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
		return L(this.binaryString, e.binaryString);
	}
	isEqual(e) {
		return this.binaryString === e.binaryString;
	}
};
ml.EMPTY_BYTE_STRING = new ml("");
var hl = /* @__PURE__ */ new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function gl(e) {
	if (F(!!e, 39018), typeof e == "string") {
		let t = 0, n = hl.exec(e);
		if (F(!!n, 46558, { timestamp: e }), n[1]) {
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
		seconds: U(e.seconds),
		nanos: U(e.nanos)
	};
}
function U(e) {
	return typeof e == "number" ? e : typeof e == "string" ? Number(e) : 0;
}
function _l(e) {
	return typeof e == "string" ? ml.fromBase64String(e) : ml.fromUint8Array(e);
}
var vl = "server_timestamp", yl = "__type__", bl = "__previous_value__", xl = "__local_write_time__";
function Sl(e) {
	return (e?.mapValue?.fields || {})[yl]?.stringValue === vl;
}
function Cl(e) {
	let t = e.mapValue.fields[bl];
	return Sl(t) ? Cl(t) : t;
}
function wl(e) {
	let t = gl(e.mapValue.fields[xl].timestampValue);
	return new fl(t.seconds, t.nanos);
}
var Tl = class {
	constructor(e, t, n, r, i, a, o, s, c, l, u, d, f) {
		this.databaseId = e, this.appId = t, this.persistenceKey = n, this.host = r, this.ssl = i, this.forceLongPolling = a, this.autoDetectLongPolling = o, this.longPollingOptions = s, this.useFetchStreams = c, this.isUsingEmulator = l, this.apiKey = u, this._customHeaders = d, this.grpcFlowControlWindow = f;
	}
}, El = "(default)", Dl = class e {
	constructor(e, t) {
		this.projectId = e, this.database = t || El;
	}
	static empty() {
		return new e("", "");
	}
	get isDefaultDatabase() {
		return this.database === El;
	}
	isEqual(t) {
		return t instanceof e && t.projectId === this.projectId && t.database === this.database;
	}
};
function Ol(e, t) {
	if (!Object.prototype.hasOwnProperty.apply(e.options, ["projectId"])) throw new B(z.INVALID_ARGUMENT, "\"projectId\" not provided in firebase.initializeApp.");
	return new Dl(e.options.projectId, t);
}
var kl = -1;
function Al(e) {
	return e == null;
}
function jl(e) {
	return e === 0 && 1 / e == -1 / 0;
}
function Ml(e) {
	return typeof e == "number" && Number.isInteger(e) && !jl(e) && e <= 2 ** 53 - 1 && e >= -(2 ** 53 - 1);
}
function Nl(e) {
	return typeof e == "string";
}
var Pl = "__type__", Fl = "__max__", Il = { mapValue: { fields: { __type__: { stringValue: Fl } } } }, Ll = "__vector__", Rl = "value", zl = { nullValue: "NULL_VALUE" }, Bl = { booleanValue: !0 }, Vl = { booleanValue: !1 };
function Hl(e) {
	return "nullValue" in e ? 0 : "booleanValue" in e ? 1 : "integerValue" in e || "doubleValue" in e ? 2 : "timestampValue" in e ? 3 : "stringValue" in e ? 5 : "bytesValue" in e ? 6 : "referenceValue" in e ? 7 : "geoPointValue" in e ? 8 : "arrayValue" in e ? 9 : "mapValue" in e ? Sl(e) ? 4 : cu(e) ? 9007199254740991 : au(e) ? 10 : 11 : P(28295, { value: e });
}
function Ul(e, t, n) {
	if (e === t) return !0;
	let r = Hl(e);
	if (r !== Hl(t)) return !1;
	switch (r) {
		case 0:
		case 9007199254740991: return !0;
		case 1: return e.booleanValue === t.booleanValue;
		case 4: return wl(e).isEqual(wl(t));
		case 3: return function(e, t) {
			if (typeof e.timestampValue == "string" && typeof t.timestampValue == "string" && e.timestampValue.length === t.timestampValue.length) return e.timestampValue === t.timestampValue;
			let n = gl(e.timestampValue), r = gl(t.timestampValue);
			return n.seconds === r.seconds && n.nanos === r.nanos;
		}(e, t);
		case 5: return e.stringValue === t.stringValue;
		case 6: return function(e, t) {
			return _l(e.bytesValue).isEqual(_l(t.bytesValue));
		}(e, t);
		case 7: return e.referenceValue === t.referenceValue;
		case 8: return function(e, t) {
			return U(e.geoPointValue.latitude) === U(t.geoPointValue.latitude) && U(e.geoPointValue.longitude) === U(t.geoPointValue.longitude);
		}(e, t);
		case 2: return function(e, t, n) {
			if ("integerValue" in e && "integerValue" in t) return U(e.integerValue) === U(t.integerValue);
			let r, i;
			if ("doubleValue" in e && "doubleValue" in t) r = U(e.doubleValue), i = U(t.doubleValue);
			else {
				if (!n?.t) return !1;
				r = U(e.integerValue ?? e.doubleValue), i = U(t.integerValue ?? t.doubleValue);
			}
			return r === i ? !!n?.i || jl(r) === jl(i) : !!(n === void 0 || n.o) && isNaN(r) && isNaN(i);
		}(e, t, n);
		case 9: return zc(e.arrayValue.values || [], t.arrayValue.values || [], ((e, t) => Ul(e, t, n)));
		case 10:
		case 11: return function(e, t, n) {
			let r = e.mapValue.fields || {}, i = t.mapValue.fields || {};
			if (Zc(r) !== Zc(i)) return !1;
			for (let e in r) if (r.hasOwnProperty(e) && (i[e] === void 0 || !Ul(r[e], i[e], n))) return !1;
			return !0;
		}(e, t, n);
		default: return P(52216, { left: e });
	}
}
function Wl(e, t) {
	return (e.values || []).find(((e) => Ul(e, t))) !== void 0;
}
function Gl(e, t) {
	if (e === t) return 0;
	let n = Hl(e), r = Hl(t);
	if (n !== r) return L(n, r);
	switch (n) {
		case 0:
		case 9007199254740991: return 0;
		case 1: return L(e.booleanValue, t.booleanValue);
		case 2: return function(e, t) {
			let n = U(e.integerValue || e.doubleValue), r = U(t.integerValue || t.doubleValue);
			return n < r ? -1 : n > r ? 1 : n === r ? 0 : isNaN(n) ? isNaN(r) ? 0 : -1 : 1;
		}(e, t);
		case 3: return Kl(e.timestampValue, t.timestampValue);
		case 4: return Kl(wl(e), wl(t));
		case 5: return Fc(e.stringValue, t.stringValue);
		case 6: return function(e, t) {
			let n = _l(e), r = _l(t);
			return n.compareTo(r);
		}(e.bytesValue, t.bytesValue);
		case 7: return function(e, t) {
			let n = e.split("/"), r = t.split("/");
			for (let e = 0; e < n.length && e < r.length; e++) {
				let t = L(n[e], r[e]);
				if (t !== 0) return t;
			}
			return L(n.length, r.length);
		}(e.referenceValue, t.referenceValue);
		case 8: return function(e, t) {
			let n = L(U(e.latitude), U(t.latitude));
			return n === 0 ? L(U(e.longitude), U(t.longitude)) : n;
		}(e.geoPointValue, t.geoPointValue);
		case 9: return ql(e.arrayValue, t.arrayValue);
		case 10: return function(e, t) {
			let n = e.fields || {}, r = t.fields || {}, i = n[Rl]?.arrayValue, a = r[Rl]?.arrayValue, o = L(i?.values?.length || 0, a?.values?.length || 0);
			return o === 0 ? ql(i, a) : o;
		}(e.mapValue, t.mapValue);
		case 11: return function(e, t) {
			if (e === Il.mapValue && t === Il.mapValue) return 0;
			if (e === Il.mapValue) return 1;
			if (t === Il.mapValue) return -1;
			let n = e.fields || {}, r = Object.keys(n), i = t.fields || {}, a = Object.keys(i);
			r.sort(), a.sort();
			for (let e = 0; e < r.length && e < a.length; ++e) {
				let t = Fc(r[e], a[e]);
				if (t !== 0) return t;
				let o = Gl(n[r[e]], i[a[e]]);
				if (o !== 0) return o;
			}
			return L(r.length, a.length);
		}(e.mapValue, t.mapValue);
		default: throw P(23264, { u: n });
	}
}
function Kl(e, t) {
	if (typeof e == "string" && typeof t == "string" && e.length === t.length) return L(e, t);
	let n = gl(e), r = gl(t), i = L(n.seconds, r.seconds);
	return i === 0 ? L(n.nanos, r.nanos) : i;
}
function ql(e, t) {
	let n = e.values || [], r = t.values || [];
	for (let e = 0; e < n.length && e < r.length; ++e) {
		let t = Gl(n[e], r[e]);
		if (t !== void 0 && t !== 0) return t;
	}
	return L(n.length, r.length);
}
function Jl(e) {
	return Yl(e);
}
function Yl(e) {
	return "nullValue" in e ? "null" : "booleanValue" in e ? "" + e.booleanValue : "integerValue" in e ? "" + e.integerValue : "doubleValue" in e ? "" + e.doubleValue : "timestampValue" in e ? function(e) {
		let t = gl(e);
		return `time(${t.seconds},${t.nanos})`;
	}(e.timestampValue) : "stringValue" in e ? e.stringValue : "bytesValue" in e ? function(e) {
		return _l(e).toBase64();
	}(e.bytesValue) : "referenceValue" in e ? function(e) {
		return H.fromName(e).toString();
	}(e.referenceValue) : "geoPointValue" in e ? function(e) {
		return `geo(${e.latitude},${e.longitude})`;
	}(e.geoPointValue) : "arrayValue" in e ? function(e) {
		let t = "[", n = !0;
		for (let r of e.values || []) n ? n = !1 : t += ",", t += Yl(r);
		return t + "]";
	}(e.arrayValue) : "mapValue" in e ? function(e) {
		let t = Object.keys(e.fields || {}).sort(), n = "{", r = !0;
		for (let i of t) r ? r = !1 : n += ",", n += `${i}:${Yl(e.fields[i])}`;
		return n + "}";
	}(e.mapValue) : P(61005, { value: e });
}
function Xl(e) {
	switch (Hl(e)) {
		case 0:
		case 1: return 4;
		case 2: return 8;
		case 3:
		case 8: return 16;
		case 4:
			let t = Cl(e);
			return t ? 16 + Xl(t) : 16;
		case 5: return 2 * e.stringValue.length;
		case 6: return _l(e.bytesValue).approximateByteSize();
		case 7: return e.referenceValue.length;
		case 9: return function(e) {
			return (e.values || []).reduce(((e, t) => e + Xl(t)), 0);
		}(e.arrayValue);
		case 10:
		case 11: return function(e) {
			let t = 0;
			return Qc(e.fields, ((e, n) => {
				t += e.length + Xl(n);
			})), t;
		}(e.mapValue);
		default: throw P(13486, { value: e });
	}
}
function Zl(e, t) {
	return { referenceValue: `projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}` };
}
function Ql(e) {
	return !!e && "integerValue" in e;
}
function $l(e) {
	return !!e && "doubleValue" in e;
}
function eu(e) {
	return Ql(e) || $l(e);
}
function tu(e) {
	return !!e && "arrayValue" in e;
}
function nu(e) {
	return !!e && "nullValue" in e;
}
function ru(e) {
	return !!e && "doubleValue" in e && isNaN(Number(e.doubleValue));
}
function iu(e) {
	return !!e && "mapValue" in e;
}
function au(e) {
	return (e?.mapValue?.fields || {})[Pl]?.stringValue === Ll;
}
function ou(e) {
	return (e?.mapValue?.fields || {})[Rl]?.arrayValue;
}
function su(e) {
	if (e.geoPointValue) return { geoPointValue: { ...e.geoPointValue } };
	if (e.timestampValue && typeof e.timestampValue == "object") return { timestampValue: { ...e.timestampValue } };
	if (e.mapValue) {
		let t = { mapValue: { fields: {} } };
		return Qc(e.mapValue.fields, ((e, n) => t.mapValue.fields[e] = su(n))), t;
	}
	if (e.arrayValue) {
		let t = { arrayValue: { values: [] } };
		for (let n = 0; n < (e.arrayValue.values || []).length; ++n) t.arrayValue.values[n] = su(e.arrayValue.values[n]);
		return t;
	}
	return { ...e };
}
function cu(e) {
	return (((e.mapValue || {}).fields || {}).__type__ || {}).stringValue === Fl;
}
var lu = { mapValue: { fields: {
	[Pl]: { stringValue: Ll },
	[Rl]: { arrayValue: {} }
} } };
function uu(e) {
	return "nullValue" in e ? zl : "booleanValue" in e ? { booleanValue: !1 } : "integerValue" in e || "doubleValue" in e ? { doubleValue: NaN } : "timestampValue" in e ? { timestampValue: { seconds: -(2 ** 53 - 1) } } : "stringValue" in e ? { stringValue: "" } : "bytesValue" in e ? { bytesValue: "" } : "referenceValue" in e ? Zl(Dl.empty(), H.empty()) : "geoPointValue" in e ? { geoPointValue: {
		latitude: -90,
		longitude: -180
	} } : "arrayValue" in e ? { arrayValue: {} } : "mapValue" in e ? au(e) ? lu : { mapValue: {} } : P(35942, { value: e });
}
function du(e) {
	return "nullValue" in e ? { booleanValue: !1 } : "booleanValue" in e ? { doubleValue: NaN } : "integerValue" in e || "doubleValue" in e ? { timestampValue: { seconds: -(2 ** 53 - 1) } } : "timestampValue" in e ? { stringValue: "" } : "stringValue" in e ? { bytesValue: "" } : "bytesValue" in e ? Zl(Dl.empty(), H.empty()) : "referenceValue" in e ? { geoPointValue: {
		latitude: -90,
		longitude: -180
	} } : "geoPointValue" in e ? { arrayValue: {} } : "arrayValue" in e ? lu : "mapValue" in e ? au(e) ? { mapValue: {} } : Il : P(61959, { value: e });
}
function fu(e, t) {
	let n = Gl(e.value, t.value);
	return n === 0 ? e.inclusive && !t.inclusive ? -1 : !e.inclusive && t.inclusive ? 1 : 0 : n;
}
function pu(e, t) {
	let n = Gl(e.value, t.value);
	return n === 0 ? e.inclusive && !t.inclusive ? 1 : !e.inclusive && t.inclusive ? -1 : 0 : n;
}
var mu = class e {
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
			for (let n = 0; n < e.length - 1; ++n) if (t = (t.mapValue.fields || {})[e.get(n)], !iu(t)) return null;
			return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
		}
	}
	set(e, t) {
		this.getFieldsMap(e.popLast())[e.lastSegment()] = su(t);
	}
	setAll(e) {
		let t = Yc.emptyPath(), n = {}, r = [];
		e.forEach(((e, i) => {
			if (!t.isImmediateParentOf(i)) {
				let e = this.getFieldsMap(t);
				this.applyChanges(e, n, r), n = {}, r = [], t = i.popLast();
			}
			e ? n[i.lastSegment()] = su(e) : r.push(i.lastSegment());
		}));
		let i = this.getFieldsMap(t);
		this.applyChanges(i, n, r);
	}
	delete(e) {
		let t = this.field(e.popLast());
		iu(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
	}
	isEqual(e) {
		return Ul(this.value, e.value);
	}
	getFieldsMap(e) {
		let t = this.value;
		t.mapValue.fields || (t.mapValue = { fields: {} });
		for (let n = 0; n < e.length; ++n) {
			let r = t.mapValue.fields[e.get(n)];
			iu(r) && r.mapValue.fields || (r = { mapValue: { fields: {} } }, t.mapValue.fields[e.get(n)] = r), t = r;
		}
		return t.mapValue.fields;
	}
	applyChanges(e, t, n) {
		Qc(t, ((t, n) => e[t] = n));
		for (let t of n) delete e[t];
	}
	clone() {
		return new e(su(this.value));
	}
};
function hu(e) {
	let t = [];
	return Qc(e.fields, ((e, n) => {
		let r = new Yc([e]);
		if (iu(n)) {
			let e = hu(n.mapValue).fields;
			if (e.length === 0) t.push(r);
			else for (let n of e) t.push(r.child(n));
		} else t.push(r);
	})), new Xc(t);
}
function gu(e, t) {
	if (e.useProto3Json) {
		if (isNaN(t)) return { doubleValue: "NaN" };
		if (t === 1 / 0) return { doubleValue: "Infinity" };
		if (t === -1 / 0) return { doubleValue: "-Infinity" };
	}
	return { doubleValue: jl(t) ? "-0" : t };
}
function _u(e) {
	return { integerValue: "" + e };
}
function vu(e, t, n) {
	return Ml(t) ? _u(t) : gu(e, t);
}
var yu = class {
	constructor() {
		this._ = void 0;
	}
};
function bu(e, t, n) {
	return e instanceof Cu ? function(e, t) {
		let n = { fields: {
			[yl]: { stringValue: vl },
			[xl]: { timestampValue: {
				seconds: e.seconds,
				nanos: e.nanoseconds
			} }
		} };
		return t && Sl(t) && (t = Cl(t)), t && (n.fields[bl] = t), { mapValue: n };
	}(n, t) : e instanceof wu ? Tu(e, t) : e instanceof Eu ? Du(e, t) : e instanceof ku ? function(e, t) {
		let n = Su(e, t), r = Nu(n) + Nu(e.l);
		return Ql(n) && Ql(e.l) ? _u(r) : gu(e.serializer, r);
	}(e, t) : e instanceof Au ? function(e, t) {
		return Mu(e, t, Math.min);
	}(e, t) : e instanceof ju ? function(e, t) {
		return Mu(e, t, Math.max);
	}(e, t) : void 0;
}
function xu(e, t, n) {
	return e instanceof wu ? Tu(e, t) : e instanceof Eu ? Du(e, t) : n;
}
function Su(e, t) {
	return e instanceof ku ? eu(t) ? t : { integerValue: 0 } : null;
}
var Cu = class extends yu {}, wu = class extends yu {
	constructor(e) {
		super(), this.elements = e;
	}
};
function Tu(e, t) {
	let n = Pu(t);
	for (let t of e.elements) n.some(((e) => Ul(e, t))) || n.push(t);
	return { arrayValue: { values: n } };
}
var Eu = class extends yu {
	constructor(e) {
		super(), this.elements = e;
	}
};
function Du(e, t) {
	let n = Pu(t);
	for (let t of e.elements) n = n.filter(((e) => !Ul(e, t)));
	return { arrayValue: { values: n } };
}
var Ou = class extends yu {
	constructor(e, t) {
		super(), this.serializer = e, this.l = t;
	}
}, ku = class extends Ou {}, Au = class extends Ou {}, ju = class extends Ou {};
function Mu(e, t, n) {
	if (!eu(t)) return e.l;
	let r = n(Nu(t), Nu(e.l));
	return Ql(t) && Ql(e.l) ? _u(r) : gu(e.serializer, r);
}
function Nu(e) {
	return U(e.integerValue || e.doubleValue);
}
function Pu(e) {
	return tu(e) && e.arrayValue.values ? e.arrayValue.values.slice() : [];
}
var Fu = class {
	constructor(e, t) {
		this.field = e, this.transform = t;
	}
};
function Iu(e, t) {
	return e.field.isEqual(t.field) && function(e, t) {
		return e instanceof wu && t instanceof wu || e instanceof Eu && t instanceof Eu ? zc(e.elements, t.elements, Ul) : e instanceof ku && t instanceof ku || e instanceof Au && t instanceof Au || e instanceof ju && t instanceof ju ? Ul(e.l, t.l) : e instanceof Cu && t instanceof Cu;
	}(e.transform, t.transform);
}
var Lu = class {
	constructor(e, t) {
		this.version = e, this.transformResults = t;
	}
}, Ru = class e {
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
function zu(e, t) {
	return e.updateTime === void 0 ? e.exists === void 0 || e.exists === t.isFoundDocument() : t.isFoundDocument() && t.version.isEqual(e.updateTime);
}
var Bu = class {};
function Vu(e, t) {
	if (!e.hasLocalMutations || t && t.fields.length === 0) return null;
	if (t === null) return e.isNoDocument() ? new Zu(e.key, Ru.none()) : new Ku(e.key, e.data, Ru.none());
	{
		let n = e.data, r = mu.empty(), i = new R(Yc.comparator);
		for (let e of t.fields) if (!i.has(e)) {
			let t = n.field(e);
			t === null && e.length > 1 && (e = e.popLast(), t = n.field(e)), t === null ? r.delete(e) : r.set(e, t), i = i.add(e);
		}
		return new qu(e.key, r, new Xc(i.toArray()), Ru.none());
	}
}
function Hu(e, t, n) {
	e instanceof Ku ? function(e, t, n) {
		let r = e.value.clone(), i = Yu(e.fieldTransforms, t, n.transformResults);
		r.setAll(i), t.convertToFoundDocument(n.version, r).setHasCommittedMutations();
	}(e, t, n) : e instanceof qu ? function(e, t, n) {
		if (!zu(e.precondition, t)) return void t.convertToUnknownDocument(n.version);
		let r = Yu(e.fieldTransforms, t, n.transformResults), i = t.data;
		i.setAll(Ju(e)), i.setAll(r), t.convertToFoundDocument(n.version, i).setHasCommittedMutations();
	}(e, t, n) : function(e, t, n) {
		t.convertToNoDocument(n.version).setHasCommittedMutations();
	}(0, t, n);
}
function Uu(e, t, n, r) {
	return e instanceof Ku ? function(e, t, n, r) {
		if (!zu(e.precondition, t)) return n;
		let i = e.value.clone(), a = Xu(e.fieldTransforms, r, t);
		return i.setAll(a), t.convertToFoundDocument(t.version, i).setHasLocalMutations(), null;
	}(e, t, n, r) : e instanceof qu ? function(e, t, n, r) {
		if (!zu(e.precondition, t)) return n;
		let i = Xu(e.fieldTransforms, r, t), a = t.data;
		return a.setAll(Ju(e)), a.setAll(i), t.convertToFoundDocument(t.version, a).setHasLocalMutations(), n === null ? null : n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(((e) => e.field)));
	}(e, t, n, r) : function(e, t, n) {
		return zu(e.precondition, t) ? (t.convertToNoDocument(t.version).setHasLocalMutations(), null) : n;
	}(e, t, n);
}
function Wu(e, t) {
	let n = null;
	for (let r of e.fieldTransforms) {
		let e = t.data.field(r.field), i = Su(r.transform, e || null);
		i != null && (n === null && (n = mu.empty()), n.set(r.field, i));
	}
	return n || null;
}
function Gu(e, t) {
	return e.type === t.type && !!e.key.isEqual(t.key) && !!e.precondition.isEqual(t.precondition) && !!function(e, t) {
		return e === void 0 && t === void 0 || !(!e || !t) && zc(e, t, ((e, t) => Iu(e, t)));
	}(e.fieldTransforms, t.fieldTransforms) && (e.type === 0 ? e.value.isEqual(t.value) : e.type !== 1 || e.data.isEqual(t.data) && e.fieldMask.isEqual(t.fieldMask));
}
var Ku = class extends Bu {
	constructor(e, t, n, r = []) {
		super(), this.key = e, this.value = t, this.precondition = n, this.fieldTransforms = r, this.type = 0;
	}
	getFieldMask() {
		return null;
	}
}, qu = class extends Bu {
	constructor(e, t, n, r, i = []) {
		super(), this.key = e, this.data = t, this.fieldMask = n, this.precondition = r, this.fieldTransforms = i, this.type = 1;
	}
	getFieldMask() {
		return this.fieldMask;
	}
};
function Ju(e) {
	let t = /* @__PURE__ */ new Map();
	return e.fieldMask.fields.forEach(((n) => {
		if (!n.isEmpty()) {
			let r = e.data.field(n);
			t.set(n, r);
		}
	})), t;
}
function Yu(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	F(e.length === n.length, 32656, {
		h: n.length,
		T: e.length
	});
	for (let i = 0; i < n.length; i++) {
		let a = e[i], o = a.transform, s = t.data.field(a.field);
		r.set(a.field, xu(o, s, n[i]));
	}
	return r;
}
function Xu(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of e) {
		let e = i.transform, a = n.data.field(i.field);
		r.set(i.field, bu(e, a, t));
	}
	return r;
}
var Zu = class extends Bu {
	constructor(e, t) {
		super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
	}
	getFieldMask() {
		return null;
	}
}, Qu = class extends Bu {
	constructor(e, t) {
		super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
	}
	getFieldMask() {
		return null;
	}
}, $u = class {
	constructor(e, t) {
		this.position = e, this.inclusive = t;
	}
};
function ed(e, t, n) {
	let r = 0;
	for (let i = 0; i < e.position.length; i++) {
		let a = t[i], o = e.position[i];
		if (r = a.field.isKeyField() ? H.comparator(H.fromName(o.referenceValue), n.key) : Gl(o, n.data.field(a.field)), a.dir === "desc" && (r *= -1), r !== 0) break;
	}
	return r;
}
function td(e, t) {
	if (e === null) return t === null;
	if (t === null || e.inclusive !== t.inclusive || e.position.length !== t.position.length) return !1;
	for (let n = 0; n < e.position.length; n++) if (!Ul(e.position[n], t.position[n])) return !1;
	return !0;
}
var nd = class {}, W = class e extends nd {
	constructor(e, t, n) {
		super(), this.field = e, this.op = t, this.value = n;
	}
	static create(t, n, r) {
		return t.isKeyField() ? n === "in" || n === "not-in" ? this.createKeyFieldInFilter(t, n, r) : new dd(t, n, r) : n === "array-contains" ? new hd(t, r) : n === "in" ? new gd(t, r) : n === "not-in" ? new _d(t, r) : n === "array-contains-any" ? new vd(t, r) : new e(t, n, r);
	}
	static createKeyFieldInFilter(e, t, n) {
		return t === "in" ? new fd(e, n) : new pd(e, n);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return this.op === "!=" ? t !== null && t.nullValue === void 0 && this.matchesComparison(Gl(t, this.value)) : t !== null && Hl(this.value) === Hl(t) && this.matchesComparison(Gl(t, this.value));
	}
	matchesComparison(e) {
		switch (this.op) {
			case "<": return e < 0;
			case "<=": return e <= 0;
			case "==": return e === 0;
			case "!=": return e !== 0;
			case ">": return e > 0;
			case ">=": return e >= 0;
			default: return P(47266, { operator: this.op });
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
}, G = class e extends nd {
	constructor(e, t) {
		super(), this.filters = e, this.op = t, this.P = null;
	}
	static create(t, n) {
		return new e(t, n);
	}
	matches(e) {
		return rd(this) ? this.filters.find(((t) => !t.matches(e))) === void 0 : this.filters.find(((t) => t.matches(e))) !== void 0;
	}
	getFlattenedFilters() {
		return this.P !== null || (this.P = this.filters.reduce(((e, t) => e.concat(t.getFlattenedFilters())), [])), this.P;
	}
	getFilters() {
		return Object.assign([], this.filters);
	}
};
function rd(e) {
	return e.op === "and";
}
function id(e) {
	return e.op === "or";
}
function ad(e) {
	return od(e) && rd(e);
}
function od(e) {
	for (let t of e.filters) if (t instanceof G) return !1;
	return !0;
}
function sd(e) {
	if (e instanceof W) return e.field.canonicalString() + e.op.toString() + Jl(e.value);
	if (ad(e)) return e.filters.map(((e) => sd(e))).join(",");
	{
		let t = e.filters.map(((e) => sd(e))).join(",");
		return `${e.op}(${t})`;
	}
}
function cd(e, t) {
	return e instanceof W ? function(e, t) {
		return t instanceof W && e.op === t.op && e.field.isEqual(t.field) && Ul(e.value, t.value);
	}(e, t) : e instanceof G ? function(e, t) {
		return t instanceof G && e.op === t.op && e.filters.length === t.filters.length && e.filters.reduce(((e, n, r) => e && cd(n, t.filters[r])), !0);
	}(e, t) : void P(19439);
}
function ld(e, t) {
	let n = e.filters.concat(t);
	return G.create(n, e.op);
}
function ud(e) {
	return e instanceof W ? function(e) {
		return `${e.field.canonicalString()} ${e.op} ${Jl(e.value)}`;
	}(e) : e instanceof G ? function(e) {
		return e.op.toString() + " {" + e.getFilters().map(ud).join(" ,") + "}";
	}(e) : "Filter";
}
var dd = class extends W {
	constructor(e, t, n) {
		super(e, t, n), this.key = H.fromName(n.referenceValue);
	}
	matches(e) {
		let t = H.comparator(e.key, this.key);
		return this.matchesComparison(t);
	}
}, fd = class extends W {
	constructor(e, t) {
		super(e, "in", t), this.keys = md("in", t);
	}
	matches(e) {
		return this.keys.some(((t) => t.isEqual(e.key)));
	}
}, pd = class extends W {
	constructor(e, t) {
		super(e, "not-in", t), this.keys = md("not-in", t);
	}
	matches(e) {
		return !this.keys.some(((t) => t.isEqual(e.key)));
	}
};
function md(e, t) {
	return (t.arrayValue?.values || []).map(((e) => H.fromName(e.referenceValue)));
}
var hd = class extends W {
	constructor(e, t) {
		super(e, "array-contains", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return tu(t) && Wl(t.arrayValue, this.value);
	}
}, gd = class extends W {
	constructor(e, t) {
		super(e, "in", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return t !== null && Wl(this.value.arrayValue, t);
	}
}, _d = class extends W {
	constructor(e, t) {
		super(e, "not-in", t);
	}
	matches(e) {
		if (Wl(this.value.arrayValue, { nullValue: "NULL_VALUE" })) return !1;
		let t = e.data.field(this.field);
		return t !== null && t.nullValue === void 0 && !Wl(this.value.arrayValue, t);
	}
}, vd = class extends W {
	constructor(e, t) {
		super(e, "array-contains-any", t);
	}
	matches(e) {
		let t = e.data.field(this.field);
		return !(!tu(t) || !t.arrayValue.values) && t.arrayValue.values.some(((e) => Wl(this.value.arrayValue, e)));
	}
}, yd = class {
	constructor(e, t = "asc") {
		this.field = e, this.dir = t;
	}
};
function bd(e, t) {
	return e.dir === t.dir && e.field.isEqual(t.field);
}
var K = class e {
	static fromTimestamp(t) {
		return new e(t);
	}
	static min() {
		return new e(new fl(0, 0));
	}
	static max() {
		return new e(new fl(253402300799, 999999999));
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
}, xd = class e {
	constructor(e, t, n, r, i, a, o) {
		this.key = e, this.documentType = t, this.version = n, this.readTime = r, this.createTime = i, this.data = a, this.documentState = o;
	}
	static newInvalidDocument(t) {
		return new e(t, 0, K.min(), K.min(), K.min(), mu.empty(), 0);
	}
	static newFoundDocument(t, n, r, i) {
		return new e(t, 1, n, K.min(), r, i, 0);
	}
	static newNoDocument(t, n) {
		return new e(t, 2, n, K.min(), K.min(), mu.empty(), 0);
	}
	static newUnknownDocument(t, n) {
		return new e(t, 3, n, K.min(), K.min(), mu.empty(), 2);
	}
	convertToFoundDocument(e, t) {
		return !this.createTime.isEqual(K.min()) || this.documentType !== 2 && this.documentType !== 0 || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
	}
	convertToNoDocument(e) {
		return this.version = e, this.documentType = 2, this.data = mu.empty(), this.documentState = 0, this;
	}
	convertToUnknownDocument(e) {
		return this.version = e, this.documentType = 3, this.data = mu.empty(), this.documentState = 2, this;
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
}, Sd = -1, Cd = class {
	constructor(e, t, n, r) {
		this.indexId = e, this.collectionGroup = t, this.fields = n, this.indexState = r;
	}
};
function wd(e) {
	return e.fields.find(((e) => e.kind === 2));
}
function Td(e) {
	return e.fields.filter(((e) => e.kind !== 2));
}
Cd.UNKNOWN_ID = -1;
var Ed = class {
	constructor(e, t) {
		this.fieldPath = e, this.kind = t;
	}
}, Dd = class e {
	constructor(e, t) {
		this.sequenceNumber = e, this.offset = t;
	}
	static empty() {
		return new e(0, Ad.min());
	}
};
function Od(e, t) {
	let n = e.toTimestamp().seconds, r = e.toTimestamp().nanoseconds + 1;
	return new Ad(K.fromTimestamp(r === 1e9 ? new fl(n + 1, 0) : new fl(n, r)), H.empty(), t);
}
function kd(e) {
	return new Ad(e.readTime, e.key, Sd);
}
var Ad = class e {
	constructor(e, t, n) {
		this.readTime = e, this.documentKey = t, this.largestBatchId = n;
	}
	static min() {
		return new e(K.min(), H.empty(), Sd);
	}
	static max() {
		return new e(K.max(), H.empty(), Sd);
	}
};
function jd(e, t) {
	let n = e.readTime.compareTo(t.readTime);
	return n === 0 ? (n = H.comparator(e.documentKey, t.documentKey), n === 0 ? L(e.largestBatchId, t.largestBatchId) : n) : n;
}
var Md = class {
	constructor(e, t = null, n = [], r = [], i = null, a = null, o = null) {
		this.path = e, this.collectionGroup = t, this.orderBy = n, this.filters = r, this.limit = i, this.startAt = a, this.endAt = o, this.R = null;
	}
};
function Nd(e, t = null, n = [], r = [], i = null, a = null, o = null) {
	return new Md(e, t, n, r, i, a, o);
}
function Pd(e) {
	let t = I(e);
	if (t.R === null) {
		let e = t.path.canonicalString();
		t.collectionGroup !== null && (e += "|cg:" + t.collectionGroup), e += "|f:", e += t.filters.map(((e) => sd(e))).join(","), e += "|ob:", e += t.orderBy.map(((e) => function(e) {
			return e.field.canonicalString() + e.dir;
		}(e))).join(","), Al(t.limit) || (e += "|l:", e += t.limit), t.startAt && (e += "|lb:", e += t.startAt.inclusive ? "b:" : "a:", e += t.startAt.position.map(((e) => Jl(e))).join(",")), t.endAt && (e += "|ub:", e += t.endAt.inclusive ? "a:" : "b:", e += t.endAt.position.map(((e) => Jl(e))).join(",")), t.R = e;
	}
	return t.R;
}
function Fd(e, t) {
	if (e.limit !== t.limit || e.orderBy.length !== t.orderBy.length) return !1;
	for (let n = 0; n < e.orderBy.length; n++) if (!bd(e.orderBy[n], t.orderBy[n])) return !1;
	if (e.filters.length !== t.filters.length) return !1;
	for (let n = 0; n < e.filters.length; n++) if (!cd(e.filters[n], t.filters[n])) return !1;
	return e.collectionGroup === t.collectionGroup && !!e.path.isEqual(t.path) && !!td(e.startAt, t.startAt) && td(e.endAt, t.endAt);
}
function Id(e) {
	return !!e.isCorePipeline;
}
function Ld(e) {
	return !!e.path && H.isDocumentKey(e.path) && e.collectionGroup === null && e.filters.length === 0;
}
function Rd(e, t) {
	return e.filters.filter(((e) => e instanceof W && e.field.isEqual(t)));
}
function zd(e, t, n) {
	let r = zl, i = !0;
	for (let n of Rd(e, t)) {
		let e = zl, t = !0;
		switch (n.op) {
			case "<":
			case "<=":
				e = uu(n.value);
				break;
			case "==":
			case "in":
			case ">=":
				e = n.value;
				break;
			case ">":
				e = n.value, t = !1;
				break;
			case "!=":
			case "not-in": e = zl;
		}
		fu({
			value: r,
			inclusive: i
		}, {
			value: e,
			inclusive: t
		}) < 0 && (r = e, i = t);
	}
	if (n !== null) {
		for (let a = 0; a < e.orderBy.length; ++a) if (e.orderBy[a].field.isEqual(t)) {
			let e = n.position[a];
			fu({
				value: r,
				inclusive: i
			}, {
				value: e,
				inclusive: n.inclusive
			}) < 0 && (r = e, i = n.inclusive);
			break;
		}
	}
	return {
		value: r,
		inclusive: i
	};
}
function Bd(e, t, n) {
	let r = Il, i = !0;
	for (let n of Rd(e, t)) {
		let e = Il, t = !0;
		switch (n.op) {
			case ">=":
			case ">":
				e = du(n.value), t = !1;
				break;
			case "==":
			case "in":
			case "<=":
				e = n.value;
				break;
			case "<":
				e = n.value, t = !1;
				break;
			case "!=":
			case "not-in": e = Il;
		}
		pu({
			value: r,
			inclusive: i
		}, {
			value: e,
			inclusive: t
		}) > 0 && (r = e, i = t);
	}
	if (n !== null) {
		for (let a = 0; a < e.orderBy.length; ++a) if (e.orderBy[a].field.isEqual(t)) {
			let e = n.position[a];
			pu({
				value: r,
				inclusive: i
			}, {
				value: e,
				inclusive: n.inclusive
			}) > 0 && (r = e, i = n.inclusive);
			break;
		}
	}
	return {
		value: r,
		inclusive: i
	};
}
var Vd = class {
	constructor(e, t = null, n = [], r = [], i = null, a = "F", o = null, s = null) {
		this.path = e, this.collectionGroup = t, this.explicitOrderBy = n, this.filters = r, this.limit = i, this.limitType = a, this.startAt = o, this.endAt = s, this.I = null, this.A = null, this.V = null, this.startAt, this.endAt;
	}
};
function Hd(e, t, n, r, i, a, o, s) {
	return new Vd(e, t, n, r, i, a, o, s);
}
function Ud(e) {
	return new Vd(e);
}
function Wd(e) {
	return e.filters.length === 0 && e.limit === null && e.startAt == null && e.endAt == null && (e.explicitOrderBy.length === 0 || e.explicitOrderBy.length === 1 && e.explicitOrderBy[0].field.isKeyField());
}
function Gd(e) {
	return H.isDocumentKey(e.path) && e.collectionGroup === null && e.filters.length === 0;
}
function Kd(e) {
	return e.collectionGroup !== null;
}
function qd(e) {
	let t = I(e);
	if (t.I === null) {
		t.I = [];
		let e = /* @__PURE__ */ new Set();
		for (let n of t.explicitOrderBy) t.I.push(n), e.add(n.field.canonicalString());
		let n = t.explicitOrderBy.length > 0 ? t.explicitOrderBy[t.explicitOrderBy.length - 1].dir : "asc";
		(function(e) {
			let t = new R(Yc.comparator);
			return e.filters.forEach(((e) => {
				e.getFlattenedFilters().forEach(((e) => {
					e.isInequality() && (t = t.add(e.field));
				}));
			})), t;
		})(t).forEach(((r) => {
			e.has(r.canonicalString()) || r.isKeyField() || t.I.push(new yd(r, n));
		})), e.has(Yc.keyField().canonicalString()) || t.I.push(new yd(Yc.keyField(), n));
	}
	return t.I;
}
function Jd(e) {
	let t = I(e);
	return t.A ||= Yd(t, qd(e)), t.A;
}
function Yd(e, t) {
	if (e.limitType === "F") return Nd(e.path, e.collectionGroup, t, e.filters, e.limit, e.startAt, e.endAt);
	{
		t = t.map(((e) => {
			let t = e.dir === "desc" ? "asc" : "desc";
			return new yd(e.field, t);
		}));
		let n = e.endAt ? new $u(e.endAt.position, e.endAt.inclusive) : null, r = e.startAt ? new $u(e.startAt.position, e.startAt.inclusive) : null;
		return Nd(e.path, e.collectionGroup, t, e.filters, e.limit, n, r);
	}
}
function Xd(e, t) {
	let n = e.filters.concat([t]);
	return new Vd(e.path, e.collectionGroup, e.explicitOrderBy.slice(), n, e.limit, e.limitType, e.startAt, e.endAt);
}
function Zd(e, t, n) {
	return new Vd(e.path, e.collectionGroup, e.explicitOrderBy.slice(), e.filters.slice(), t, n, e.startAt, e.endAt);
}
function Qd(e, t) {
	return Fd(Jd(e), Jd(t)) && e.limitType === t.limitType;
}
function $d(e) {
	return `Query(target=${function(e) {
		let t = e.path.canonicalString();
		return e.collectionGroup !== null && (t += " collectionGroup=" + e.collectionGroup), e.filters.length > 0 && (t += `, filters: [${e.filters.map(((e) => ud(e))).join(", ")}]`), Al(e.limit) || (t += ", limit: " + e.limit), e.orderBy.length > 0 && (t += `, orderBy: [${e.orderBy.map(((e) => function(e) {
			return `${e.field.canonicalString()} (${e.dir})`;
		}(e))).join(", ")}]`), e.startAt && (t += ", startAt: ", t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map(((e) => Jl(e))).join(",")), e.endAt && (t += ", endAt: ", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map(((e) => Jl(e))).join(",")), `Target(${t})`;
	}(Jd(e))}; limitType=${e.limitType})`;
}
function ef(e, t) {
	return t.isFoundDocument() && function(e, t) {
		let n = t.key.path;
		return e.collectionGroup === null ? H.isDocumentKey(e.path) ? e.path.isEqual(n) : e.path.isImmediateParentOf(n) : t.key.hasCollectionId(e.collectionGroup) && e.path.isPrefixOf(n);
	}(e, t) && function(e, t) {
		for (let n of qd(e)) if (!n.field.isKeyField() && t.data.field(n.field) === null) return !1;
		return !0;
	}(e, t) && function(e, t) {
		for (let n of e.filters) if (!n.matches(t)) return !1;
		return !0;
	}(e, t) && function(e, t) {
		return !(e.startAt && !function(e, t, n) {
			let r = ed(e, t, n);
			return e.inclusive ? r <= 0 : r < 0;
		}(e.startAt, qd(e), t) || e.endAt && !function(e, t, n) {
			let r = ed(e, t, n);
			return e.inclusive ? r >= 0 : r > 0;
		}(e.endAt, qd(e), t));
	}(e, t);
}
function tf(e) {
	return (t, n) => {
		let r = !1;
		for (let i of qd(e)) {
			let e = nf(i, t, n);
			if (e !== 0) return e;
			r ||= i.field.isKeyField();
		}
		return 0;
	};
}
function nf(e, t, n) {
	let r = e.field.isKeyField() ? H.comparator(t.key, n.key) : function(e, t, n) {
		let r = t.data.field(e), i = n.data.field(e);
		return r !== null && i !== null ? Gl(r, i) : P(42886);
	}(e.field, t, n);
	switch (e.dir) {
		case "asc": return r;
		case "desc": return -1 * r;
		default: return P(19790, { direction: e.dir });
	}
}
var rf = class {
	constructor(e, t) {
		this.count = e, this.unchangedNames = t;
	}
}, af, q;
function of(e) {
	switch (e) {
		case z.OK: return P(64938);
		case z.CANCELLED:
		case z.UNKNOWN:
		case z.DEADLINE_EXCEEDED:
		case z.RESOURCE_EXHAUSTED:
		case z.INTERNAL:
		case z.UNAVAILABLE:
		case z.UNAUTHENTICATED: return !1;
		case z.INVALID_ARGUMENT:
		case z.NOT_FOUND:
		case z.ALREADY_EXISTS:
		case z.PERMISSION_DENIED:
		case z.FAILED_PRECONDITION:
		case z.ABORTED:
		case z.OUT_OF_RANGE:
		case z.UNIMPLEMENTED:
		case z.DATA_LOSS: return !0;
		default: return P(15467, { code: e });
	}
}
function sf(e) {
	if (e === void 0) return kc("GRPC error has no .code"), z.UNKNOWN;
	switch (e) {
		case af.OK: return z.OK;
		case af.CANCELLED: return z.CANCELLED;
		case af.UNKNOWN: return z.UNKNOWN;
		case af.DEADLINE_EXCEEDED: return z.DEADLINE_EXCEEDED;
		case af.RESOURCE_EXHAUSTED: return z.RESOURCE_EXHAUSTED;
		case af.INTERNAL: return z.INTERNAL;
		case af.UNAVAILABLE: return z.UNAVAILABLE;
		case af.UNAUTHENTICATED: return z.UNAUTHENTICATED;
		case af.INVALID_ARGUMENT: return z.INVALID_ARGUMENT;
		case af.NOT_FOUND: return z.NOT_FOUND;
		case af.ALREADY_EXISTS: return z.ALREADY_EXISTS;
		case af.PERMISSION_DENIED: return z.PERMISSION_DENIED;
		case af.FAILED_PRECONDITION: return z.FAILED_PRECONDITION;
		case af.ABORTED: return z.ABORTED;
		case af.OUT_OF_RANGE: return z.OUT_OF_RANGE;
		case af.UNIMPLEMENTED: return z.UNIMPLEMENTED;
		case af.DATA_LOSS: return z.DATA_LOSS;
		default: return P(39323, { code: e });
	}
}
(q = af ||= {})[q.OK = 0] = "OK", q[q.CANCELLED = 1] = "CANCELLED", q[q.UNKNOWN = 2] = "UNKNOWN", q[q.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", q[q.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", q[q.NOT_FOUND = 5] = "NOT_FOUND", q[q.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", q[q.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", q[q.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", q[q.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", q[q.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", q[q.ABORTED = 10] = "ABORTED", q[q.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", q[q.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", q[q.INTERNAL = 13] = "INTERNAL", q[q.UNAVAILABLE = 14] = "UNAVAILABLE", q[q.DATA_LOSS = 15] = "DATA_LOSS";
var cf = class {
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
		Qc(this.inner, ((t, n) => {
			for (let [t, r] of n) e(t, r);
		}));
	}
	isEmpty() {
		return el(this.inner);
	}
	size() {
		return this.innerSize;
	}
}, lf = new Vc(H.comparator);
function uf() {
	return lf;
}
var df = new Vc(H.comparator);
function ff(...e) {
	let t = df;
	for (let n of e) t = t.insert(n.key, n);
	return t;
}
function pf(e) {
	let t = df;
	return e.forEach(((e, n) => t = t.insert(e, n.overlayedDocument))), t;
}
function mf() {
	return gf();
}
function hf() {
	return gf();
}
function gf() {
	return new cf(((e) => e.toString()), ((e, t) => e.isEqual(t)));
}
var _f = new Vc(H.comparator), vf = new R(H.comparator);
function J(...e) {
	let t = vf;
	for (let n of e) t = t.add(n);
	return t;
}
var yf = new R(L);
function bf() {
	return yf;
}
var xf = null;
function Sf() {
	return new TextEncoder();
}
var Cf = new Vo([4294967295, 4294967295], 0);
function wf(e) {
	let t = Sf().encode(e), n = new Ho();
	return n.update(t), new Uint8Array(n.digest());
}
function Tf(e) {
	let t = new DataView(e.buffer), n = t.getUint32(0, !0), r = t.getUint32(4, !0), i = t.getUint32(8, !0), a = t.getUint32(12, !0);
	return [new Vo([n, r], 0), new Vo([i, a], 0)];
}
var Ef = class e {
	constructor(e, t, n) {
		if (this.bitmap = e, this.padding = t, this.hashCount = n, t < 0 || t >= 8) throw new Df(`Invalid padding: ${t}`);
		if (n < 0 || e.length > 0 && this.hashCount === 0) throw new Df(`Invalid hash count: ${n}`);
		if (e.length === 0 && t !== 0) throw new Df(`Invalid padding when bitmap length is 0: ${t}`);
		this.m = 8 * e.length - t, this.p = Vo.fromNumber(this.m);
	}
	S(e, t, n) {
		let r = e.add(t.multiply(Vo.fromNumber(n)));
		return r.compare(Cf) === 1 && (r = new Vo([r.getBits(0), r.getBits(1)], 0)), r.modulo(this.p).toNumber();
	}
	v(e) {
		return !!(this.bitmap[Math.floor(e / 8)] & 1 << e % 8);
	}
	mightContain(e) {
		if (this.m === 0) return !1;
		let [t, n] = Tf(wf(e));
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
		let [t, n] = Tf(wf(e));
		for (let e = 0; e < this.hashCount; e++) {
			let r = this.S(t, n, e);
			this.D(r);
		}
	}
	D(e) {
		let t = Math.floor(e / 8), n = e % 8;
		this.bitmap[t] |= 1 << n;
	}
}, Df = class extends Error {
	constructor() {
		super(...arguments), this.name = "BloomFilterError";
	}
}, Of = class e {
	constructor(e, t, n, r, i, a) {
		this.snapshotVersion = e, this.targetChanges = t, this.targetMismatches = n, this.documentUpdates = r, this.augmentedDocumentUpdates = i, this.resolvedLimboDocuments = a;
	}
	static createSynthesizedRemoteEventForCurrentChange(t, n, r) {
		let i = /* @__PURE__ */ new Map();
		return i.set(t, kf.createSynthesizedTargetChangeForCurrentChange(t, n, r)), new e(K.min(), i, new Vc(L), uf(), uf(), J());
	}
}, kf = class e {
	constructor(e, t, n, r, i) {
		this.resumeToken = e, this.current = t, this.addedDocuments = n, this.modifiedDocuments = r, this.removedDocuments = i;
	}
	static createSynthesizedTargetChangeForCurrentChange(t, n, r) {
		return new e(r, n, J(), J(), J());
	}
}, Af = class {
	constructor(e, t, n, r) {
		this.C = e, this.removedTargetIds = t, this.key = n, this.F = r;
	}
}, jf = class {
	constructor(e, t) {
		this.targetId = e, this.O = t;
	}
}, Mf = class {
	constructor(e, t, n = ml.EMPTY_BYTE_STRING, r = null) {
		this.state = e, this.targetIds = t, this.resumeToken = n, this.cause = r;
	}
}, Nf = class {
	constructor(e) {
		this.targetId = e, this.M = 0, this.N = Lf(), this.L = ml.EMPTY_BYTE_STRING, this.B = !1, this.U = !0;
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
				default: P(38017, { changeType: i });
			}
		})), new kf(this.L, this.B, e, t, n);
	}
	W() {
		this.U = !1, this.N = Lf();
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
		--this.M, F(this.M >= 0, 3241, {
			M: this.M,
			targetId: this.targetId
		});
	}
	Y() {
		this.U = !0, this.B = !0;
	}
}, Pf = "WatchChangeAggregator", Ff = class {
	constructor(e) {
		this.Z = e, this.X = /* @__PURE__ */ new Map(), this.ee = uf(), this.te = If(), this.ne = uf(), this.re = If(), this.ie = new Vc(L);
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
				default: P(56790, { state: e.state });
			}
			else N(Pf, `handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`);
		}));
	}
	forEachTarget(e, t) {
		e.targetIds.length > 0 ? e.targetIds.forEach(t) : this.X.forEach(((e, n) => {
			this.ue(n) && t(n);
		}));
	}
	le(e) {
		return Id(e) ? e.getPipelineSourceType() === "documents" && e.getPipelineDocuments()?.length === 1 : Ld(e);
	}
	Ee(e) {
		let t = e.targetId, n = e.O.count, r = this.he(t);
		if (r) {
			let i = r.target;
			if (this.le(i)) {
				if (n === 0) {
					let e = new H(Id(i) ? V.fromString(i.getPipelineDocuments()[0]) : i.path);
					this.oe(t, e, xd.newNoDocument(e, K.min()));
				} else F(n === 1, 20013, "Single document existence filter with count: " + n);
			} else {
				let r = this.Te(t);
				if (r !== n) {
					let n = this.Pe(e), i = n ? this.Re(n, e, r) : 1;
					if (i !== 0) {
						this.ce(t);
						let e = i === 2 ? "TargetPurposeExistenceFilterMismatchBloom" : "TargetPurposeExistenceFilterMismatch";
						this.ie = this.ie.insert(t, e);
					}
					xf?.Ie(function(e, t, n, r, i) {
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
			a = _l(n).toUint8Array();
		} catch (e) {
			if (e instanceof pl) return Ac("Decoding the base64 bloom filter in existence filter failed (" + e.message + "); ignoring the bloom filter and falling back to full re-query."), null;
			throw e;
		}
		try {
			o = new Ef(a, r, i);
		} catch (e) {
			return Ac(e instanceof Df ? "BloomFilter error: " : "Applying bloom filter failed: ", e), null;
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
					let t = new H(Id(i.target) ? V.fromString(i.target.getPipelineDocuments()[0]) : i.target.path);
					this.fe(t).has(r) || this.me(r, t) || this.oe(r, t, xd.newNoDocument(t, e));
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
		let r = new Of(e, t, this.ie, this.ee, this.ne, n);
		return this.ee = uf(), this.te = If(), this.ne = uf(), this.re = If(), this.ie = new Vc(L), r;
	}
	_e(e, t) {
		let n = this.X.get(e);
		if (!n || !this.ue(e)) return void N(Pf, `addDocumentToTarget received document for unknown inactive target (${e})`);
		let r = this.me(e, t.key) ? 2 : 0;
		n.G(t.key, r), Id(this.he(e).target) && this.he(e).target.getPipelineFlavor() !== "exact" ? this.ne = this.ne.insert(t.key, t) : this.ee = this.ee.insert(t.key, t), this.te = this.te.insert(t.key, this.fe(t.key).add(e)), this.re = this.re.insert(t.key, this.pe(t.key).add(e));
	}
	oe(e, t, n) {
		let r = this.X.get(e);
		r && this.ue(e) ? (this.me(e, t) ? r.G(t, 1) : r.j(t), this.re = this.re.insert(t, this.pe(t).delete(e)), this.re = this.re.insert(t, this.pe(t).add(e)), n && (Id(this.he(e).target) && this.he(e).target.getPipelineFlavor() !== "exact" ? this.ne = this.ne.insert(t, n) : this.ee = this.ee.insert(t, n))) : N(Pf, `removeDocumentFromTarget received document for unknown or inactive target (${e})`);
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
		t || (N(Pf, `recordPendingTargetRequest set up tracking for target ID ${e}`), t = new Nf(e), this.X.set(e, t)), t.H();
	}
	pe(e) {
		let t = this.re.get(e);
		return t || (t = new R(L), this.re = this.re.insert(e, t)), t;
	}
	fe(e) {
		let t = this.te.get(e);
		return t || (t = new R(L), this.te = this.te.insert(e, t)), t;
	}
	ue(e) {
		let t = this.he(e) !== null;
		return t || N(Pf, "Detected inactive target", e), t;
	}
	he(e) {
		let t = this.X.get(e);
		return t === void 0 || t.k ? null : this.Z.ge(e);
	}
	ce(e) {
		this.X.set(e, new Nf(e)), this.Z.getRemoteKeysForTarget(e).forEach(((t) => {
			this.oe(e, t, null);
		}));
	}
	me(e, t) {
		return this.Z.getRemoteKeysForTarget(e).has(t);
	}
};
function If() {
	return new Vc(H.comparator);
}
function Lf() {
	return new Vc(H.comparator);
}
var Rf = {
	asc: "ASCENDING",
	desc: "DESCENDING"
}, zf = {
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
}, Bf = {
	and: "AND",
	or: "OR"
}, Vf = class {
	constructor(e, t) {
		this.databaseId = e, this.useProto3Json = t;
	}
};
function Hf(e, t) {
	return e.useProto3Json || Al(t) ? t : { value: t };
}
function Uf(e, t) {
	return e.useProto3Json ? `${(/* @__PURE__ */ new Date(1e3 * t.seconds)).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + t.nanoseconds).slice(-9)}Z` : {
		seconds: "" + t.seconds,
		nanos: t.nanoseconds
	};
}
function Wf(e) {
	let t = gl(e);
	return new fl(t.seconds, t.nanos);
}
function Gf(e, t) {
	return e.useProto3Json ? t.toBase64() : t.toUint8Array();
}
function Kf(e, t) {
	return Uf(e, t.toTimestamp());
}
function qf(e) {
	return F(!!e, 49232), K.fromTimestamp(Wf(e));
}
function Jf(e, t) {
	return Yf(e, t).canonicalString();
}
function Yf(e, t) {
	let n = function(e) {
		return new V([
			"projects",
			e.projectId,
			"databases",
			e.database
		]);
	}(e).child("documents");
	return t === void 0 ? n : n.child(t);
}
function Xf(e) {
	let t = V.fromString(e);
	return F(Sp(t), 10190, { key: t.toString() }), t;
}
function Zf(e, t) {
	return Jf(e.databaseId, t.path);
}
function Qf(e, t) {
	let n = Xf(t);
	if (n.get(1) !== e.databaseId.projectId) throw new B(z.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + e.databaseId.projectId);
	if (n.get(3) !== e.databaseId.database) throw new B(z.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + e.databaseId.database);
	return new H(np(n));
}
function $f(e, t) {
	return Jf(e.databaseId, t);
}
function ep(e) {
	let t = Xf(e);
	return t.length === 4 ? V.emptyPath() : np(t);
}
function tp(e) {
	return new V([
		"projects",
		e.databaseId.projectId,
		"databases",
		e.databaseId.database
	]).canonicalString();
}
function np(e) {
	return F(e.length > 4 && e.get(4) === "documents", 29091, { key: e.toString() }), e.popFirst(5);
}
function rp(e, t, n) {
	return {
		name: Zf(e, t),
		fields: n.value.mapValue.fields
	};
}
function ip(e, t, n) {
	let r = Qf(e, t.name), i = qf(t.updateTime), a = t.createTime ? qf(t.createTime) : K.min(), o = new mu({ mapValue: { fields: t.fields } }), s = xd.newFoundDocument(r, i, a, o);
	return n && s.setHasCommittedMutations(), n ? s.setHasCommittedMutations() : s;
}
function ap(e, t) {
	let n;
	if ("targetChange" in t) {
		t.targetChange;
		let r = function(e) {
			return e === "NO_CHANGE" ? 0 : e === "ADD" ? 1 : e === "REMOVE" ? 2 : e === "CURRENT" ? 3 : e === "RESET" ? 4 : P(39313, { state: e });
		}(t.targetChange.targetChangeType || "NO_CHANGE"), i = t.targetChange.targetIds || [], a = function(e, t) {
			return e.useProto3Json ? (F(t === void 0 || typeof t == "string", 58123), ml.fromBase64String(t || "")) : (F(t === void 0 || t instanceof Buffer || t instanceof Uint8Array, 16193), ml.fromUint8Array(t || /* @__PURE__ */ new Uint8Array()));
		}(e, t.targetChange.resumeToken), o = t.targetChange.cause;
		n = new Mf(r, i, a, o && function(e) {
			return new B(e.code === void 0 ? z.UNKNOWN : sf(e.code), e.message || "");
		}(o) || null);
	} else if ("documentChange" in t) {
		t.documentChange;
		let r = t.documentChange;
		r.document, r.document.name, r.document.updateTime;
		let i = Qf(e, r.document.name), a = qf(r.document.updateTime), o = r.document.createTime ? qf(r.document.createTime) : K.min(), s = new mu({ mapValue: { fields: r.document.fields } }), c = xd.newFoundDocument(i, a, o, s);
		n = new Af(r.targetIds || [], r.removedTargetIds || [], c.key, c);
	} else if ("documentDelete" in t) {
		t.documentDelete;
		let r = t.documentDelete;
		r.document;
		let i = Qf(e, r.document), a = r.readTime ? qf(r.readTime) : K.min(), o = xd.newNoDocument(i, a);
		n = new Af([], r.removedTargetIds || [], o.key, o);
	} else if ("documentRemove" in t) {
		t.documentRemove;
		let r = t.documentRemove;
		r.document;
		let i = Qf(e, r.document);
		n = new Af([], r.removedTargetIds || [], i, null);
	} else {
		if (!("filter" in t)) return P(11601, { ye: t });
		{
			t.filter;
			let e = t.filter;
			e.targetId;
			let { count: r = 0, unchangedNames: i } = e, a = new rf(r, i), o = e.targetId;
			n = new jf(o, a);
		}
	}
	return n;
}
function op(e, t) {
	let n;
	if (t instanceof Ku) n = { update: rp(e, t.key, t.value) };
	else if (t instanceof Zu) n = { delete: Zf(e, t.key) };
	else if (t instanceof qu) n = {
		update: rp(e, t.key, t.data),
		updateMask: xp(t.fieldMask)
	};
	else {
		if (!(t instanceof Qu)) return P(16599, { we: t.type });
		n = { verify: Zf(e, t.key) };
	}
	return t.fieldTransforms.length > 0 && (n.updateTransforms = t.fieldTransforms.map(((e) => function(e, t) {
		let n = t.transform;
		if (n instanceof Cu) return {
			fieldPath: t.field.canonicalString(),
			setToServerValue: "REQUEST_TIME"
		};
		if (n instanceof wu) return {
			fieldPath: t.field.canonicalString(),
			appendMissingElements: { values: n.elements }
		};
		if (n instanceof Eu) return {
			fieldPath: t.field.canonicalString(),
			removeAllFromArray: { values: n.elements }
		};
		if (n instanceof ku) return {
			fieldPath: t.field.canonicalString(),
			increment: n.l
		};
		if (n instanceof Au) return {
			fieldPath: t.field.canonicalString(),
			minimum: n.l
		};
		if (n instanceof ju) return {
			fieldPath: t.field.canonicalString(),
			maximum: n.l
		};
		throw P(20930, { transform: t.transform });
	}(0, e)))), t.precondition.isNone || (n.currentDocument = function(e, t) {
		return t.updateTime === void 0 ? t.exists === void 0 ? P(27497) : { exists: t.exists } : { updateTime: Kf(e, t.updateTime) };
	}(e, t.precondition)), n;
}
function sp(e, t) {
	let n = t.currentDocument ? function(e) {
		return e.updateTime === void 0 ? e.exists === void 0 ? Ru.none() : Ru.exists(e.exists) : Ru.updateTime(qf(e.updateTime));
	}(t.currentDocument) : Ru.none(), r = t.updateTransforms ? t.updateTransforms.map(((t) => function(e, t) {
		let n = null;
		return "setToServerValue" in t ? (F(t.setToServerValue === "REQUEST_TIME", 16630, { proto: t }), n = new Cu()) : "appendMissingElements" in t ? n = new wu(t.appendMissingElements.values || []) : "removeAllFromArray" in t ? n = new Eu(t.removeAllFromArray.values || []) : "increment" in t ? n = new ku(e, t.increment) : "minimum" in t ? n = new Au(e, t.minimum) : "maximum" in t ? n = new ju(e, t.maximum) : P(16584, { proto: t }), new Fu(Yc.fromServerFormat(t.fieldPath), n);
	}(e, t))) : [];
	if (t.update) {
		t.update.name;
		let i = Qf(e, t.update.name), a = new mu({ mapValue: { fields: t.update.fields } });
		return t.updateMask ? new qu(i, a, function(e) {
			return new Xc((e.fieldPaths || []).map(((e) => Yc.fromServerFormat(e))));
		}(t.updateMask), n, r) : new Ku(i, a, n, r);
	}
	return t.delete ? new Zu(Qf(e, t.delete), n) : t.verify ? new Qu(Qf(e, t.verify), n) : P(1463, { proto: t });
}
function cp(e, t) {
	return e && e.length > 0 ? (F(t !== void 0, 14353), e.map(((e) => function(e, t) {
		let n = e.updateTime ? qf(e.updateTime) : qf(t);
		return n.isEqual(K.min()) && (n = qf(t)), new Lu(n, e.transformResults || []);
	}(e, t)))) : [];
}
function lp(e, t) {
	return { documents: [$f(e, t.path)] };
}
function up(e, t) {
	let n = { structuredQuery: {} }, r = t.path, i;
	t.collectionGroup === null ? (i = r.popLast(), n.structuredQuery.from = [{ collectionId: r.lastSegment() }]) : (i = r, n.structuredQuery.from = [{
		collectionId: t.collectionGroup,
		allDescendants: !0
	}]), n.parent = $f(e, i);
	let a = function(e) {
		if (e.length !== 0) return bp(G.create(e, "and"));
	}(t.filters);
	a && (n.structuredQuery.where = a);
	let o = function(e) {
		if (e.length !== 0) return e.map(((e) => function(e) {
			return {
				field: vp(e.field),
				direction: hp(e.dir)
			};
		}(e)));
	}(t.orderBy);
	o && (n.structuredQuery.orderBy = o);
	let s = Hf(e, t.limit);
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
function dp(e) {
	let t = ep(e.parent), n = e.structuredQuery, r = n.from ? n.from.length : 0, i = null;
	if (r > 0) {
		F(r === 1, 65062);
		let e = n.from[0];
		e.allDescendants ? i = e.collectionId : t = t.child(e.collectionId);
	}
	let a = [];
	n.where && (a = function(e) {
		let t = mp(e);
		return t instanceof G && ad(t) ? t.getFilters() : [t];
	}(n.where));
	let o = [];
	n.orderBy && (o = function(e) {
		return e.map(((e) => function(e) {
			return new yd(yp(e.field), function(e) {
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
		return t = typeof e == "object" ? e.value : e, Al(t) ? null : t;
	}(n.limit));
	let c = null;
	n.startAt && (c = function(e) {
		let t = !!e.before;
		return new $u(e.values || [], t);
	}(n.startAt));
	let l = null;
	return n.endAt && (l = function(e) {
		let t = !e.before;
		return new $u(e.values || [], t);
	}(n.endAt)), Hd(t, i, o, a, s, "F", c, l);
}
function fp(e, t) {
	let n = function(e) {
		switch (e) {
			case "TargetPurposeListen": return null;
			case "TargetPurposeExistenceFilterMismatch": return "existence-filter-mismatch";
			case "TargetPurposeExistenceFilterMismatchBloom": return "existence-filter-mismatch-bloom";
			case "TargetPurposeLimboResolution": return "limbo-document";
			default: return P(28987, { purpose: e });
		}
	}(t.purpose);
	return n == null ? null : { "goog-listen-tags": n };
}
function pp(e, t) {
	return { structuredPipeline: { pipeline: { stages: t.stages.map(((t) => t._toProto(e))) } } };
}
function mp(e) {
	return e.unaryFilter === void 0 ? e.fieldFilter === void 0 ? e.compositeFilter === void 0 ? P(30097, { filter: e }) : function(e) {
		return G.create(e.compositeFilter.filters.map(((e) => mp(e))), function(e) {
			switch (e) {
				case "AND": return "and";
				case "OR": return "or";
				default: return P(1026);
			}
		}(e.compositeFilter.op));
	}(e) : function(e) {
		return W.create(yp(e.fieldFilter.field), function(e) {
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
				case "OPERATOR_UNSPECIFIED": return P(58110);
				default: return P(50506);
			}
		}(e.fieldFilter.op), e.fieldFilter.value);
	}(e) : function(e) {
		switch (e.unaryFilter.op) {
			case "IS_NAN":
				let t = yp(e.unaryFilter.field);
				return W.create(t, "==", { doubleValue: NaN });
			case "IS_NULL":
				let n = yp(e.unaryFilter.field);
				return W.create(n, "==", { nullValue: "NULL_VALUE" });
			case "IS_NOT_NAN":
				let r = yp(e.unaryFilter.field);
				return W.create(r, "!=", { doubleValue: NaN });
			case "IS_NOT_NULL":
				let i = yp(e.unaryFilter.field);
				return W.create(i, "!=", { nullValue: "NULL_VALUE" });
			case "OPERATOR_UNSPECIFIED": return P(61313);
			default: return P(60726);
		}
	}(e);
}
function hp(e) {
	return Rf[e];
}
function gp(e) {
	return zf[e];
}
function _p(e) {
	return Bf[e];
}
function vp(e) {
	return { fieldPath: e.canonicalString() };
}
function yp(e) {
	return Yc.fromServerFormat(e.fieldPath);
}
function bp(e) {
	return e instanceof W ? function(e) {
		if (e.op === "==") {
			if (ru(e.value)) return { unaryFilter: {
				field: vp(e.field),
				op: "IS_NAN"
			} };
			if (nu(e.value)) return { unaryFilter: {
				field: vp(e.field),
				op: "IS_NULL"
			} };
		} else if (e.op === "!=") {
			if (ru(e.value)) return { unaryFilter: {
				field: vp(e.field),
				op: "IS_NOT_NAN"
			} };
			if (nu(e.value)) return { unaryFilter: {
				field: vp(e.field),
				op: "IS_NOT_NULL"
			} };
		}
		return { fieldFilter: {
			field: vp(e.field),
			op: gp(e.op),
			value: e.value
		} };
	}(e) : e instanceof G ? function(e) {
		let t = e.getFilters().map(((e) => bp(e)));
		return t.length === 1 ? t[0] : { compositeFilter: {
			op: _p(e.op),
			filters: t
		} };
	}(e) : P(54877, { filter: e });
}
function xp(e) {
	let t = [];
	return e.fields.forEach(((e) => t.push(e.canonicalString()))), { fieldPaths: t };
}
function Sp(e) {
	return e.length >= 4 && e.get(0) === "projects" && e.get(2) === "databases";
}
function Cp(e) {
	return !!e && typeof e._toProto == "function" && e._protoValueType === "ProtoValue";
}
function wp(e, t) {
	let n = { fields: {} };
	return t.forEach(((t, r) => {
		if (typeof r != "string") throw Error(`Cannot encode map with non-string key: ${r}`);
		n.fields[r] = t._toProto(e);
	})), { mapValue: n };
}
function Tp(e) {
	return { stringValue: e };
}
function Ep(e) {
	return new Vf(e, !0);
}
var Dp = class e {
	constructor(e) {
		this._byteString = e;
	}
	static fromBase64String(t) {
		try {
			return new e(ml.fromBase64String(t));
		} catch (e) {
			throw new B(z.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e);
		}
	}
	static fromUint8Array(t) {
		return new e(ml.fromUint8Array(t));
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
		if (ll(t, e._jsonSchema)) return e.fromBase64String(t.bytes);
	}
};
Dp._jsonSchemaVersion = "firestore/bytes/1.0", Dp._jsonSchema = {
	type: cl("string", Dp._jsonSchemaVersion),
	bytes: cl("string")
};
var Op = class {
	constructor(...e) {
		for (let t = 0; t < e.length; ++t) if (e[t].length === 0) throw new B(z.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
		this._internalPath = new Yc(e);
	}
	isEqual(e) {
		return this._internalPath.isEqual(e._internalPath);
	}
};
function kp() {
	return new Op(Kc);
}
var Ap = class {
	constructor(e) {
		this._methodName = e;
	}
}, jp = class e {
	constructor(e, t) {
		if (!isFinite(e) || e < -90 || e > 90) throw new B(z.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
		if (!isFinite(t) || t < -180 || t > 180) throw new B(z.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
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
		return L(this._lat, e._lat) || L(this._long, e._long);
	}
	toJSON() {
		return {
			latitude: this._lat,
			longitude: this._long,
			type: e._jsonSchemaVersion
		};
	}
	static fromJSON(t) {
		if (ll(t, e._jsonSchema)) return new e(t.latitude, t.longitude);
	}
};
jp._jsonSchemaVersion = "firestore/geoPoint/1.0", jp._jsonSchema = {
	type: cl("string", jp._jsonSchemaVersion),
	latitude: cl("number"),
	longitude: cl("number")
};
var Mp = class {
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
Mp.UNAUTHENTICATED = new Mp(null), Mp.GOOGLE_CREDENTIALS = new Mp("google-credentials-uid"), Mp.FIRST_PARTY = new Mp("first-party-uid"), Mp.MOCK_USER = new Mp("mock-user");
var Np = class {
	constructor() {
		this.promise = new Promise(((e, t) => {
			this.resolve = e, this.reject = t;
		}));
	}
}, Pp = class {
	constructor(e, t) {
		this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
	}
}, Fp = class {
	getToken() {
		return Promise.resolve(null);
	}
	invalidateToken() {}
	start(e, t) {
		e.enqueueRetryable((() => t(Mp.UNAUTHENTICATED)));
	}
	shutdown() {}
}, Ip = class {
	constructor(e) {
		this.ve = e, this.currentUser = Mp.UNAUTHENTICATED, this.De = 0, this.forceRefresh = !1, this.auth = null;
	}
	start(e, t) {
		F(this.xe === void 0, 42304);
		let n = this.De, r = (e) => this.De === n ? Promise.resolve() : (n = this.De, t(e)), i = new Np();
		this.xe = () => {
			this.De++, this.currentUser = this.Ce(), i.resolve(), i = new Np(), e.enqueueRetryable((() => r(this.currentUser)));
		};
		let a = () => {
			let t = i;
			e.enqueueRetryable((async () => {
				await t.promise, await r(this.currentUser);
			}));
		}, o = (e) => {
			N("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = e, this.xe && (this.auth.addAuthTokenListener(this.xe), a());
		};
		this.ve.onInit(((e) => o(e))), setTimeout((() => {
			if (!this.auth) {
				let e = this.ve.getImmediate({ optional: !0 });
				e ? o(e) : (N("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new Np());
			}
		}), 0), a();
	}
	getToken() {
		let e = this.De, t = this.forceRefresh;
		return this.forceRefresh = !1, this.auth ? this.auth.getToken(t).then(((t) => this.De === e ? t ? (F(typeof t.accessToken == "string", 31837, { Fe: t }), new Pp(t.accessToken, this.currentUser)) : null : (N("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()))) : Promise.resolve(null);
	}
	invalidateToken() {
		this.forceRefresh = !0;
	}
	shutdown() {
		this.auth && this.xe && this.auth.removeAuthTokenListener(this.xe), this.xe = void 0;
	}
	Ce() {
		let e = this.auth && this.auth.getUid();
		return F(e === null || typeof e == "string", 2055, { Oe: e }), new Mp(e);
	}
}, Lp = class {
	constructor(e, t, n) {
		this.Me = e, this.Ne = t, this.Le = n, this.type = "FirstParty", this.user = Mp.FIRST_PARTY, this.Be = /* @__PURE__ */ new Map();
	}
	Ue() {
		return this.Le ? this.Le() : null;
	}
	get headers() {
		this.Be.set("X-Goog-AuthUser", this.Me);
		let e = this.Ue();
		return e && this.Be.set("Authorization", e), this.Ne && this.Be.set("X-Goog-Iam-Authorization-Token", this.Ne), this.Be;
	}
}, Rp = class {
	constructor(e, t, n) {
		this.Me = e, this.Ne = t, this.Le = n;
	}
	getToken() {
		return Promise.resolve(new Lp(this.Me, this.Ne, this.Le));
	}
	start(e, t) {
		e.enqueueRetryable((() => t(Mp.FIRST_PARTY)));
	}
	shutdown() {}
	invalidateToken() {}
}, zp = class {
	constructor(e) {
		this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
	}
}, Bp = class {
	constructor(e, t) {
		this.ke = t, this.forceRefresh = !1, this.appCheck = null, this.qe = null, this.$e = null, Yt(e) && e.settings.appCheckToken && (this.$e = e.settings.appCheckToken);
	}
	start(e, t) {
		F(this.xe === void 0, 3512);
		let n = (e) => {
			e.error != null && N("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);
			let n = e.token !== this.qe;
			return this.qe = e.token, N("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), n ? t(e.token) : Promise.resolve();
		};
		this.xe = (t) => {
			e.enqueueRetryable((() => n(t)));
		};
		let r = (e) => {
			N("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = e, this.xe && this.appCheck.addTokenListener(this.xe);
		};
		this.ke.onInit(((e) => r(e))), setTimeout((() => {
			if (!this.appCheck) {
				let e = this.ke.getImmediate({ optional: !0 });
				e ? r(e) : N("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
			}
		}), 0);
	}
	getToken() {
		if (this.$e) return Promise.resolve(new zp(this.$e));
		let e = this.forceRefresh;
		return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then(((e) => e ? (F(typeof e.token == "string", 44558, { tokenResult: e }), this.qe = e.token, new zp(e.token)) : null)) : Promise.resolve(null);
	}
	invalidateToken() {
		this.forceRefresh = !0;
	}
	shutdown() {
		this.appCheck && this.xe && this.appCheck.removeTokenListener(this.xe), this.xe = void 0;
	}
};
function Vp(e) {
	let t = {};
	return e.timeoutSeconds !== void 0 && (t.timeoutSeconds = e.timeoutSeconds), t;
}
var Hp = class {
	Ke(e) {}
	shutdown() {}
}, Up = "ConnectivityMonitor", Wp = class {
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
		N(Up, "Network connectivity changed: AVAILABLE");
		for (let e of this.je) e(0);
	}
	ze() {
		N(Up, "Network connectivity changed: UNAVAILABLE");
		for (let e of this.je) e(1);
	}
	static Je() {
		return typeof window < "u" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
	}
}, Gp = null;
function Kp() {
	return Gp === null ? Gp = function() {
		return 268435456 + Math.round(2147483648 * Math.random());
	}() : Gp++, "0x" + Gp.toString(16);
}
var qp = "RestConnection", Jp = {
	BatchGetDocuments: "batchGet",
	Commit: "commit",
	RunQuery: "runQuery",
	RunAggregationQuery: "runAggregationQuery",
	ExecutePipeline: "executePipeline"
}, Yp = class {
	get Ye() {
		return !1;
	}
	constructor(e) {
		this.databaseInfo = e, this.databaseId = e.databaseId;
		let t = e.ssl ? "https" : "http", n = encodeURIComponent(this.databaseId.projectId), r = encodeURIComponent(this.databaseId.database);
		this.Ze = t + "://" + e.host, this.Xe = `projects/${n}/databases/${r}`, this.et = this.databaseId.database === El ? `project_id=${n}` : `project_id=${n}&database_id=${r}`;
	}
	tt(e, t, n, r, i) {
		let a = Kp(), o = this.nt(e, t.toUriEncodedString());
		N(qp, `Sending RPC '${e}' ${a}:`, o, n);
		let s = {
			"google-cloud-resource-prefix": this.Xe,
			"x-goog-request-params": this.et
		};
		this.rt(s, r, i);
		let { host: c } = new URL(o), l = Ee(c);
		return this.it(e, o, s, n, l).then(((t) => (N(qp, `Received RPC '${e}' ${a}: `, t), t)), ((t) => {
			throw Ac(qp, `RPC '${e}' ${a} failed with error: `, t, "url: ", o, "request:", n), t;
		}));
	}
	st(e, t, n, r, i, a) {
		return this.tt(e, t, n, r, i);
	}
	rt(e, t, n) {
		if (e["X-Goog-Api-Client"] = function() {
			return "gl-js/ fire/" + Tc;
		}(), e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), t && t.headers.forEach(((t, n) => e[n] = t)), n && n.headers.forEach(((t, n) => e[n] = t)), this.databaseInfo._customHeaders) for (let t of Object.keys(this.databaseInfo._customHeaders)) e[t] = this.databaseInfo._customHeaders[t];
	}
	nt(e, t) {
		let n = Jp[e], r = `${this.Ze}/v1/${t}:${n}`;
		return this.databaseInfo.apiKey && (r = `${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`), r;
	}
	terminate() {}
}, Xp = class {
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
}, Zp = "WebChannelConnection", Qp = (e, t, n) => {
	e.listen(t, ((e) => {
		try {
			n(e);
		} catch (e) {
			setTimeout((() => {
				throw e;
			}), 0);
		}
	}));
}, $p = class e extends Yp {
	constructor(e) {
		super(e), this.dt = [], this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
	}
	static ft() {
		e.gt ||= (Qp(Zo(), Xo.STAT_EVENT, ((e) => {
			e.stat === Yo.PROXY ? N(Zp, "STAT_EVENT: detected buffering proxy") : e.stat === Yo.NOPROXY && N(Zp, "STAT_EVENT: detected no buffering proxy");
		})), !0);
	}
	it(e, t, n, r, i) {
		let a = Kp();
		return new Promise(((i, o) => {
			let s = new Go();
			s.setWithCredentials(!0), s.listenOnce(qo.COMPLETE, (() => {
				try {
					switch (s.getLastErrorCode()) {
						case Jo.NO_ERROR:
							let t = s.getResponseJson();
							N(Zp, `XHR for RPC '${e}' ${a} received:`, JSON.stringify(t)), i(t);
							break;
						case Jo.TIMEOUT:
							N(Zp, `RPC '${e}' ${a} timed out`), o(new B(z.DEADLINE_EXCEEDED, "Request time out"));
							break;
						case Jo.HTTP_ERROR:
							let n = s.getStatus();
							if (N(Zp, `RPC '${e}' ${a} failed with status:`, n, "response text:", s.getResponseText()), n > 0) {
								let e = s.getResponseJson();
								Array.isArray(e) && (e = e[0]);
								let t = e?.error;
								t && t.status && t.message ? o(new B(function(e) {
									let t = e.toLowerCase().replace(/_/g, "-");
									return Object.values(z).indexOf(t) >= 0 ? t : z.UNKNOWN;
								}(t.status), t.message)) : o(new B(z.UNKNOWN, "Server responded with status " + s.getStatus()));
							} else o(new B(z.UNAVAILABLE, "Connection failed."));
							break;
						default: P(9055, {
							yt: e,
							streamId: a,
							wt: s.getLastErrorCode(),
							bt: s.getLastError()
						});
					}
				} finally {
					N(Zp, `RPC '${e}' ${a} completed.`);
				}
			}));
			let c = JSON.stringify(r);
			N(Zp, `RPC '${e}' ${a} sending request:`, r), s.send(t, "POST", c, n, 15);
		}));
	}
	St(t, n, r) {
		let i = Kp(), a = [
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
		N(Zp, `Creating RPC '${t}' stream ${i}: ${l}`, s);
		let u = o.createWebChannel(l, s);
		this.vt(u);
		let d = !1, f = !1, p = new Xp({
			_t: (e) => {
				f ? N(Zp, `Not sending because RPC '${t}' stream ${i} is closed:`, e) : (d ||= (N(Zp, `Opening RPC '${t}' stream ${i} transport.`), u.open(), !0), N(Zp, `RPC '${t}' stream ${i} sending:`, e), u.send(e));
			},
			ot: () => u.close()
		});
		return Qp(u, Ko.EventType.OPEN, (() => {
			f || (N(Zp, `RPC '${t}' stream ${i} transport opened.`), p.Rt());
		})), Qp(u, Ko.EventType.CLOSE, (() => {
			f || (f = !0, N(Zp, `RPC '${t}' stream ${i} transport closed`), p.At(), this.Dt(u));
		})), Qp(u, Ko.EventType.ERROR, ((e) => {
			f || (f = !0, Ac(Zp, `RPC '${t}' stream ${i} transport errored. Name:`, e.name, "Message:", e.message), p.At(new B(z.UNAVAILABLE, "The operation could not be completed")));
		})), Qp(u, Ko.EventType.MESSAGE, ((e) => {
			if (!f) {
				let n = e.data[0];
				F(!!n, 16349);
				let r = n, a = r?.error || r[0]?.error;
				if (a) {
					N(Zp, `RPC '${t}' stream ${i} received error:`, a);
					let e = a.status, n = function(e) {
						let t = af[e];
						if (t !== void 0) return sf(t);
					}(e), r = a.message;
					e === "NOT_FOUND" && r.includes("database") && r.includes("does not exist") && r.includes(this.databaseId.database) && Ac(`Database '${this.databaseId.database}' not found. Please check your project configuration.`), n === void 0 && (n = z.INTERNAL, r = "Unknown error status: " + e + " with message " + a.message), f = !0, p.At(new B(n, r)), u.close();
				} else N(Zp, `RPC '${t}' stream ${i} received:`, n), p.Vt(n);
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
		return Qo();
	}
};
function em(e) {
	return new $p(e);
}
$p.gt = !1;
var tm = class {
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
		r > 0 && N("ExponentialBackoff", `Backing off for ${r} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`), this.Nt = this.xt.enqueueAfterDelay(this.timerId, r, (() => (this.Lt = Date.now(), e()))), this.Mt *= this.Ft, this.Mt < this.Ct && (this.Mt = this.Ct), this.Mt > this.Ot && (this.Mt = this.Ot);
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
}, nm = "PersistentStream", rm = class {
	constructor(e, t, n, r, i, a, o, s) {
		this.xt = e, this.$t = n, this.Kt = r, this.connection = i, this.authCredentialsProvider = a, this.appCheckCredentialsProvider = o, this.listener = s, this.state = 0, this.Qt = 0, this.Wt = null, this.Gt = null, this.stream = null, this.zt = 0, this.jt = new tm(e, t);
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
		this.nn(), this.rn(), this.jt.cancel(), this.Qt++, e === 4 ? t && t.code === z.RESOURCE_EXHAUSTED ? (kc(t.toString()), kc("Using maximum backoff delay to prevent overloading the backend."), this.jt.Bt()) : t && t.code === z.UNAUTHENTICATED && this.state !== 3 && (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()) : this.jt.reset(), this.stream !== null && (this.sn(), this.stream.close(), this.stream = null), this.state = e, await this.listener.ht(t);
	}
	sn() {}
	auth() {
		this.state = 1;
		let e = this._n(this.Qt), t = this.Qt;
		Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then((([e, n]) => {
			this.Qt === t && this.an(e, n);
		}), ((t) => {
			e((() => {
				let e = new B(z.UNKNOWN, "Fetching auth token failed: " + t.message);
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
		return N(nm, `close with error: ${e}`), this.stream = null, this.close(4, e);
	}
	_n(e) {
		return (t) => {
			this.xt.enqueueAndForget((() => this.Qt === e ? t() : (N(nm, "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve())));
		};
	}
}, im = class extends rm {
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
		let t = ap(this.serializer, e), n = function(e) {
			if (!("targetChange" in e)) return K.min();
			let t = e.targetChange;
			return t.targetIds && t.targetIds.length ? K.min() : t.readTime ? qf(t.readTime) : K.min();
		}(e);
		return this.listener.hn(t, n);
	}
	Tn(e) {
		let t = {};
		t.database = tp(this.serializer), t.addTarget = function(e, t) {
			let n, r = t.target;
			if (n = Id(r) ? { pipelineQuery: pp(e, r) } : Ld(r) ? { documents: lp(e, r) } : { query: up(e, r).be }, n.targetId = t.targetId, t.resumeToken.approximateByteSize() > 0) {
				n.resumeToken = Gf(e, t.resumeToken);
				let r = Hf(e, t.expectedCount);
				r !== null && (n.expectedCount = r);
			} else if (t.snapshotVersion.compareTo(K.min()) > 0) {
				n.readTime = Uf(e, t.snapshotVersion.toTimestamp());
				let r = Hf(e, t.expectedCount);
				r !== null && (n.expectedCount = r);
			}
			return n;
		}(this.serializer, e);
		let n = fp(this.serializer, e);
		n && (t.labels = n), this.tn(t);
	}
	Pn(e) {
		let t = {};
		t.database = tp(this.serializer), t.removeTarget = e, this.tn(t);
	}
}, am = class extends rm {
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
		return F(!!e.streamToken, 31322), this.lastStreamToken = e.streamToken, F(!e.writeResults || e.writeResults.length === 0, 55816), this.listener.An();
	}
	onNext(e) {
		F(!!e.streamToken, 12678), this.lastStreamToken = e.streamToken, this.jt.reset();
		let t = cp(e.writeResults, e.commitTime), n = qf(e.commitTime);
		return this.listener.Vn(n, t);
	}
	dn() {
		let e = {};
		e.database = tp(this.serializer), this.tn(e);
	}
	In(e) {
		let t = {
			streamToken: this.lastStreamToken,
			writes: e.map(((e) => op(this.serializer, e)))
		};
		this.tn(t);
	}
}, om = class {}, sm = class extends om {
	constructor(e, t, n, r) {
		super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = n, this.serializer = r, this.fn = !1;
	}
	mn() {
		if (this.fn) throw new B(z.FAILED_PRECONDITION, "The client has already been terminated.");
	}
	tt(e, t, n, r) {
		return this.mn(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([i, a]) => this.connection.tt(e, Yf(t, n), r, i, a))).catch(((e) => {
			throw e.name === "FirebaseError" ? (e.code === z.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e) : new B(z.UNKNOWN, e.toString());
		}));
	}
	st(e, t, n, r, i) {
		return this.mn(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([a, o]) => this.connection.st(e, Yf(t, n), r, a, o, i))).catch(((e) => {
			throw e.name === "FirebaseError" ? (e.code === z.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e) : new B(z.UNKNOWN, e.toString());
		}));
	}
	terminate() {
		this.fn = !0, this.connection.terminate();
	}
};
function cm(e, t, n, r) {
	return new sm(e, t, n, r);
}
var lm = "ComponentProvider", um = /* @__PURE__ */ new Map();
function dm(e, t, n, r, i) {
	return new Tl(e, t, n, i.host, i.ssl, i.experimentalForceLongPolling, i.experimentalAutoDetectLongPolling, Vp(i.experimentalLongPollingOptions), i.useFetchStreams, i.isUsingEmulator, r, i._customHeaders, i.grpcFlowControlWindow);
}
var fm = {
	didRun: !1,
	sequenceNumbersCollected: 0,
	targetsRemoved: 0,
	documentsRemoved: 0
}, pm = 41943040, mm = class e {
	static withCacheSize(t) {
		return new e(t, e.DEFAULT_COLLECTION_PERCENTILE, e.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
	}
	constructor(e, t, n) {
		this.cacheSizeCollectionThreshold = e, this.percentileToCollect = t, this.maximumSequenceNumbersToCollect = n;
	}
};
mm.DEFAULT_COLLECTION_PERCENTILE = 10, mm.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, mm.DEFAULT = new mm(pm, mm.DEFAULT_COLLECTION_PERCENTILE, mm.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), mm.DISABLED = new mm(-1, 0, 0);
var hm = class {
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
hm.yn = -1;
var gm = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.", _m = class {
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
async function vm(e) {
	if (e.code !== z.FAILED_PRECONDITION || e.message !== gm) throw e;
	N("LocalStore", "Unexpectedly lost primary lease");
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
		return this.callbackAttached && P(59440), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(n, this.error) : this.wrapSuccess(t, this.result) : new e(((e, r) => {
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
}, ym = "SimpleDb", bm = class e {
	static open(t, n, r, i) {
		try {
			return new e(n, t.transaction(i, r));
		} catch (e) {
			throw new wm(n, e);
		}
	}
	constructor(e, t) {
		this.action = e, this.transaction = t, this.aborted = !1, this.wn = new Np(), this.transaction.oncomplete = () => {
			this.wn.resolve();
		}, this.transaction.onabort = () => {
			t.error ? this.wn.reject(new wm(e, t.error)) : this.wn.resolve();
		}, this.transaction.onerror = (t) => {
			let n = km(t.target.error);
			this.wn.reject(new wm(e, n));
		};
	}
	get bn() {
		return this.wn.promise;
	}
	abort(e) {
		e && this.wn.reject(e), this.aborted || (N(ym, "Aborting transaction:", e ? e.message : "Client-initiated abort"), this.aborted = !0, this.transaction.abort());
	}
	Sn() {
		let e = this.transaction;
		this.aborted || typeof e.commit != "function" || e.commit();
	}
	store(e) {
		return new Em(this.transaction.objectStore(e));
	}
}, xm = class e {
	static delete(e) {
		return N(ym, "Removing database:", e), Dm(c().indexedDB.deleteDatabase(e)).toPromise();
	}
	static Je() {
		if (!ue()) return !1;
		if (e.vn()) return !0;
		let t = h(), n = e.Dn(t), r = 0 < n && n < 10, i = Sm(t), a = 0 < i && i < 4.5;
		return !(t.indexOf("MSIE ") > 0 || t.indexOf("Trident/") > 0 || t.indexOf("Edge/") > 0 || r || a);
	}
	static vn() {
		return typeof process < "u" && process.__PRIVATE_env?.__PRIVATE_USE_MOCK_PERSISTENCE === "YES";
	}
	static xn(e, t) {
		return e.store(t);
	}
	static Dn(e) {
		let t = e.match(/i(?:phone|pad|pod) os ([\d_]+)/i), n = t ? t[1].split("_").slice(0, 2).join(".") : "-1";
		return Number(n);
	}
	constructor(t, n, r) {
		this.name = t, this.version = n, this.Cn = r, this.Fn = null, e.Dn(h()) === 12.2 && kc("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.");
	}
	async On(e) {
		return this.db ||= (N(ym, "Opening database:", this.name), await new Promise(((t, n) => {
			let r = indexedDB.open(this.name, this.version);
			r.onsuccess = (e) => {
				let n = e.target.result;
				t(n);
			}, r.onblocked = () => {
				n(new wm(e, "Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."));
			}, r.onerror = (t) => {
				let r = t.target.error;
				r.name === "VersionError" ? n(new B(z.FAILED_PRECONDITION, "A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")) : r.name === "InvalidStateError" ? n(new B(z.FAILED_PRECONDITION, "Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: " + r)) : n(new wm(e, r));
			}, r.onupgradeneeded = (e) => {
				N(ym, "Database \"" + this.name + "\" requires upgrade from version:", e.oldVersion);
				let t = e.target.result;
				this.Cn.Mn(t, r.transaction, e.oldVersion, this.version).next((() => {
					N(ym, "Database upgrade to version " + this.version + " complete");
				}));
			};
		}))), this.Nn && (this.db.onversionchange = (e) => this.Nn(e)), this.db;
	}
	Ln(e) {
		this.Nn = e, this.db && (this.db.onversionchange = (t) => e(t));
	}
	async runTransaction(e, t, n, r) {
		let i = t === "readonly", a = 0;
		for (;;) {
			++a;
			try {
				this.db = await this.On(e);
				let t = bm.open(this.db, e, i ? "readonly" : "readwrite", n), a = r(t).next(((e) => (t.Sn(), e))).catch(((e) => (t.abort(e), Y.reject(e)))).toPromise();
				return a.catch((() => {})), await t.bn, a;
			} catch (e) {
				let t = e, n = t.name !== "FirebaseError" && a < 3;
				if (N(ym, "Transaction failed with error:", t.message, "Retrying:", n), this.close(), !n) return Promise.reject(t);
			}
		}
	}
	close() {
		this.db && this.db.close(), this.db = void 0;
	}
};
function Sm(e) {
	let t = e.match(/Android ([\d.]+)/i), n = t ? t[1].split(".").slice(0, 2).join(".") : "-1";
	return Number(n);
}
var Cm = class {
	constructor(e) {
		this.Bn = e, this.Un = !1, this.kn = null;
	}
	get isDone() {
		return this.Un;
	}
	get qn() {
		return this.kn;
	}
	set cursor(e) {
		this.Bn = e;
	}
	done() {
		this.Un = !0;
	}
	$n(e) {
		this.kn = e;
	}
	delete() {
		return Dm(this.Bn.delete());
	}
}, wm = class extends B {
	constructor(e, t) {
		super(z.UNAVAILABLE, `IndexedDB transaction '${e}' failed: ${t}`), this.name = "IndexedDbTransactionError";
	}
};
function Tm(e) {
	return e.name === "IndexedDbTransactionError";
}
var Em = class {
	constructor(e) {
		this.store = e;
	}
	put(e, t) {
		let n;
		return t === void 0 ? (N(ym, "PUT", this.store.name, "<auto-key>", e), n = this.store.put(e)) : (N(ym, "PUT", this.store.name, e, t), n = this.store.put(t, e)), Dm(n);
	}
	add(e) {
		return N(ym, "ADD", this.store.name, e, e), Dm(this.store.add(e));
	}
	get(e) {
		return Dm(this.store.get(e)).next(((t) => (t === void 0 && (t = null), N(ym, "GET", this.store.name, e, t), t)));
	}
	delete(e) {
		return N(ym, "DELETE", this.store.name, e), Dm(this.store.delete(e));
	}
	count() {
		return N(ym, "COUNT", this.store.name), Dm(this.store.count());
	}
	Kn(e, t) {
		let n = this.options(e, t), r = n.index ? this.store.index(n.index) : this.store;
		if (typeof r.getAll == "function") {
			let e = r.getAll(n.range);
			return new Y(((t, n) => {
				e.onerror = (e) => {
					n(e.target.error);
				}, e.onsuccess = (e) => {
					t(e.target.result);
				};
			}));
		}
		{
			let e = this.cursor(n), t = [];
			return this.Qn(e, ((e, n) => {
				t.push(n);
			})).next((() => t));
		}
	}
	Wn(e, t) {
		let n = this.store.getAll(e, t === null ? void 0 : t);
		return new Y(((e, t) => {
			n.onerror = (e) => {
				t(e.target.error);
			}, n.onsuccess = (t) => {
				e(t.target.result);
			};
		}));
	}
	Gn(e, t) {
		N(ym, "DELETE ALL", this.store.name);
		let n = this.options(e, t);
		n.zn = !1;
		let r = this.cursor(n);
		return this.Qn(r, ((e, t, n) => n.delete()));
	}
	jn(e, t) {
		let n;
		t ? n = e : (n = {}, t = e);
		let r = this.cursor(n);
		return this.Qn(r, t);
	}
	Hn(e) {
		let t = this.cursor({});
		return new Y(((n, r) => {
			t.onerror = (e) => {
				r(km(e.target.error));
			}, t.onsuccess = (t) => {
				let r = t.target.result;
				r ? e(r.primaryKey, r.value).next(((e) => {
					e ? r.continue() : n();
				})) : n();
			};
		}));
	}
	Qn(e, t) {
		let n = [];
		return new Y(((r, i) => {
			e.onerror = (e) => {
				i(e.target.error);
			}, e.onsuccess = (e) => {
				let i = e.target.result;
				if (!i) return void r();
				let a = new Cm(i), o = t(i.primaryKey, i.value, a);
				if (o instanceof Y) {
					let e = o.catch(((e) => (a.done(), Y.reject(e))));
					n.push(e);
				}
				a.isDone ? r() : a.qn === null ? i.continue() : i.continue(a.qn);
			};
		})).next((() => Y.waitFor(n)));
	}
	options(e, t) {
		let n;
		return e !== void 0 && (typeof e == "string" ? n = e : t = e), {
			index: n,
			range: t
		};
	}
	cursor(e) {
		let t = "next";
		if (e.reverse && (t = "prev"), e.index) {
			let n = this.store.index(e.index);
			return e.zn ? n.openKeyCursor(e.range, t) : n.openCursor(e.range, t);
		}
		return this.store.openCursor(e.range, t);
	}
};
function Dm(e) {
	return new Y(((t, n) => {
		e.onsuccess = (e) => {
			let n = e.target.result;
			t(n);
		}, e.onerror = (e) => {
			n(km(e.target.error));
		};
	}));
}
var Om = !1;
function km(e) {
	let t = xm.Dn(h());
	if (t >= 12.2 && t < 13) {
		let t = "An internal error was encountered in the Indexed Database server";
		if (e.message.indexOf(t) >= 0) {
			let e = new B("internal", `IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);
			return Om || (Om = !0, setTimeout((() => {
				throw e;
			}), 0)), e;
		}
	}
	return e;
}
var Am = "LruGarbageCollector", jm = 1048576;
function Mm([e, t], [n, r]) {
	let i = L(e, n);
	return i === 0 ? L(t, r) : i;
}
var Nm = class {
	constructor(e) {
		this.Jn = e, this.buffer = new R(Mm), this.Yn = 0;
	}
	Zn() {
		return ++this.Yn;
	}
	Xn(e) {
		let t = [e, this.Zn()];
		if (this.buffer.size < this.Jn) this.buffer = this.buffer.add(t);
		else {
			let e = this.buffer.last();
			Mm(t, e) < 0 && (this.buffer = this.buffer.delete(e).add(t));
		}
	}
	get maxValue() {
		return this.buffer.last()[0];
	}
}, Pm = class {
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
		N(Am, `Garbage collection scheduled in ${e}ms`), this.er = this.asyncQueue.enqueueAfterDelay("lru_garbage_collection", e, (async () => {
			this.er = null;
			try {
				await this.localStore.collectGarbage(this.garbageCollector);
			} catch (e) {
				Tm(e) ? N(Am, "Ignoring IndexedDB error during garbage collection: ", e) : await vm(e);
			}
			await this.tr(3e5);
		}));
	}
}, Fm = class {
	constructor(e, t) {
		this.nr = e, this.params = t;
	}
	calculateTargetCount(e, t) {
		return this.nr.rr(e).next(((e) => Math.floor(t / 100 * e)));
	}
	nthSequenceNumber(e, t) {
		if (t === 0) return Y.resolve(hm.yn);
		let n = new Nm(t);
		return this.nr.forEachTarget(e, ((e) => n.Xn(e.sequenceNumber))).next((() => this.nr.ir(e, ((e) => n.Xn(e))))).next((() => n.maxValue));
	}
	removeTargets(e, t, n) {
		return this.nr.removeTargets(e, t, n);
	}
	removeOrphanedDocuments(e, t) {
		return this.nr.removeOrphanedDocuments(e, t);
	}
	collect(e, t) {
		return this.params.cacheSizeCollectionThreshold === -1 ? (N("LruGarbageCollector", "Garbage collection skipped; disabled"), Y.resolve(fm)) : this.getCacheSize(e).next(((n) => n < this.params.cacheSizeCollectionThreshold ? (N("LruGarbageCollector", `Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`), fm) : this.sr(e, t)));
	}
	getCacheSize(e) {
		return this.nr.getCacheSize(e);
	}
	sr(e, t) {
		let n, r, i, a, o, s, c, l = Date.now();
		return this.calculateTargetCount(e, this.params.percentileToCollect).next(((t) => (t > this.params.maximumSequenceNumbersToCollect ? (N("LruGarbageCollector", `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`), r = this.params.maximumSequenceNumbersToCollect) : r = t, a = Date.now(), this.nthSequenceNumber(e, r)))).next(((r) => (n = r, o = Date.now(), this.removeTargets(e, n, t)))).next(((t) => (i = t, s = Date.now(), this.removeOrphanedDocuments(e, n)))).next(((e) => (c = Date.now(), Oc() <= _.DEBUG && N("LruGarbageCollector", `LRU Garbage Collection\n\tCounted targets in ${a - l}ms\n\tDetermined least recently used ${r} in ` + (o - a) + `ms
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
function Im(e, t) {
	return new Fm(e, t);
}
var Lm = "firestore.googleapis.com", Rm = !0, zm = class {
	constructor(e) {
		if (e.host === void 0) {
			if (e.ssl !== void 0) throw new B(z.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
			this.host = Lm, this.ssl = Rm;
		} else this.host = e.host, this.ssl = e.ssl ?? Rm;
		if (this.isUsingEmulator = e.emulatorOptions !== void 0, this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, e._customHeaders && (this._customHeaders = { ...e._customHeaders }), e.cacheSizeBytes === void 0) this.cacheSizeBytes = pm;
		else {
			if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < jm) throw new B(z.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
			this.cacheSizeBytes = e.cacheSizeBytes;
		}
		if (nl("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalAutoDetectLongPolling = this.experimentalForceLongPolling ? !1 : e.experimentalAutoDetectLongPolling === void 0 || !!e.experimentalAutoDetectLongPolling, this.experimentalLongPollingOptions = Vp(e.experimentalLongPollingOptions ?? {}), function(e) {
			if (e.timeoutSeconds !== void 0) {
				if (isNaN(e.timeoutSeconds)) throw new B(z.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);
				if (e.timeoutSeconds < 5) throw new B(z.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);
				if (e.timeoutSeconds > 30) throw new B(z.INVALID_ARGUMENT, `invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`);
			}
		}(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams, e.grpcFlowControlWindow !== void 0) {
			if (typeof e.grpcFlowControlWindow != "number" || e.grpcFlowControlWindow <= 0 || e.grpcFlowControlWindow > 2147483647 || !Number.isInteger(e.grpcFlowControlWindow)) throw new B(z.INVALID_ARGUMENT, "grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");
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
}, Bm = class {
	constructor(e, t, n, r) {
		this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = n, this._app = r, this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new zm({}), this._settingsFrozen = !1, this._emulatorOptions = {}, this._terminateTask = "notTerminated";
	}
	get app() {
		if (!this._app) throw new B(z.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
		return this._app;
	}
	get _initialized() {
		return this._settingsFrozen;
	}
	get _terminated() {
		return this._terminateTask !== "notTerminated";
	}
	_setSettings(e) {
		if (this._settingsFrozen) throw new B(z.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
		this._settings = new zm(e), this._emulatorOptions = e.emulatorOptions || {}, e.credentials !== void 0 && (this._authCredentials = function(e) {
			if (!e) return new Fp();
			switch (e.type) {
				case "firstParty": return new Rp(e.sessionIndex || "0", e.iamToken || null, e.authTokenFactory || null);
				case "provider": return e.client;
				default: throw new B(z.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
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
			let t = um.get(e);
			t && (N(lm, "Removing Datastore"), um.delete(e), t.terminate());
		}(this), Promise.resolve();
	}
}, Vm = class e {
	constructor(e, t, n) {
		this.converter = t, this._query = n, this.type = "query", this.firestore = e;
	}
	withConverter(t) {
		return new e(this.firestore, t, this._query);
	}
}, Hm = class e {
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
		return new Um(this.firestore, this.converter, this._key.path.popLast());
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
		if (ll(n, e._jsonSchema)) return new e(t, r || null, new H(V.fromString(n.referencePath)));
	}
};
Hm._jsonSchemaVersion = "firestore/documentReference/1.0", Hm._jsonSchema = {
	type: cl("string", Hm._jsonSchemaVersion),
	referencePath: cl("string")
};
var Um = class e extends Vm {
	constructor(e, t, n) {
		super(e, t, Ud(n)), this._path = n, this.type = "collection";
	}
	get id() {
		return this._query.path.lastSegment();
	}
	get path() {
		return this._query.path.canonicalString();
	}
	get parent() {
		let e = this._path.popLast();
		return e.isEmpty() ? null : new Hm(this.firestore, null, new H(e));
	}
	withConverter(t) {
		return new e(this.firestore, t, this._path);
	}
};
function Wm(e, t, ...n) {
	if (e = g(e), tl("collection", "path", t), e instanceof Bm) {
		let r = V.fromString(t, ...n);
		return il(r), new Um(e, null, r);
	}
	{
		if (!(e instanceof Hm || e instanceof Um)) throw new B(z.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
		let r = e._path.child(V.fromString(t, ...n));
		return il(r), new Um(e.firestore, null, r);
	}
}
function Gm(e, t, ...n) {
	if (e = g(e), arguments.length === 1 && (t = Pc.newId()), tl("doc", "path", t), e instanceof Bm) {
		let r = V.fromString(t, ...n);
		return rl(r), new Hm(e, null, new H(r));
	}
	{
		if (!(e instanceof Hm || e instanceof Um)) throw new B(z.INVALID_ARGUMENT, "Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
		let r = e._path.child(V.fromString(t, ...n));
		return rl(r), new Hm(e.firestore, e instanceof Um ? e.converter : null, new H(r));
	}
}
var Km = class e {
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
		if (ll(t, e._jsonSchema)) {
			if (Array.isArray(t.vectorValues) && t.vectorValues.every(((e) => typeof e == "number"))) return new e(t.vectorValues);
			throw new B(z.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
		}
	}
};
Km._jsonSchemaVersion = "firestore/vectorValue/1.0", Km._jsonSchema = {
	type: cl("string", Km._jsonSchemaVersion),
	vectorValues: cl("object")
};
var qm = /^__.*__$/, Jm = class {
	constructor(e, t, n) {
		this.data = e, this.fieldMask = t, this.fieldTransforms = n;
	}
	toMutation(e, t) {
		return this.fieldMask === null ? new Ku(e, this.data, t, this.fieldTransforms) : new qu(e, this.data, this.fieldMask, t, this.fieldTransforms);
	}
}, Ym = class {
	constructor(e, t, n) {
		this.data = e, this.fieldMask = t, this.fieldTransforms = n;
	}
	toMutation(e, t) {
		return new qu(e, this.data, this.fieldMask, t, this.fieldTransforms);
	}
};
function Xm(e) {
	switch (e) {
		case 0:
		case 2:
		case 1: return !0;
		case 3:
		case 4: return !1;
		default: throw P(40011, { dataSource: e });
	}
}
var Zm = class e {
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
		return ph(e, this.settings.methodName, this.settings.hasConverter || !1, this.path, this.settings.targetDoc);
	}
	contains(e) {
		return this.fieldMask.find(((t) => e.isPrefixOf(t))) !== void 0 || this.fieldTransforms.find(((t) => e.isPrefixOf(t.field))) !== void 0;
	}
	validatePath() {
		if (this.path) for (let e = 0; e < this.path.length; e++) this.validatePathSegment(this.path.get(e));
	}
	validatePathSegment(e) {
		if (e.length === 0) throw this.createError("Document fields must not be empty");
		if (Xm(this.dataSource) && qm.test(e)) throw this.createError("Document fields cannot begin and end with \"__\"");
	}
}, Qm = class {
	constructor(e, t, n) {
		this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = n || Ep(e);
	}
	createContext(e, t, n, r = !1) {
		return new Zm({
			dataSource: e,
			methodName: t,
			targetDoc: n,
			path: Yc.emptyPath(),
			arrayElement: !1,
			hasConverter: r
		}, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
	}
};
function $m(e) {
	let t = e._freezeSettings(), n = Ep(e._databaseId);
	return new Qm(e._databaseId, !!t.ignoreUndefinedProperties, n);
}
function eh(e, t, n, r, i, a = {}) {
	let o = e.createContext(a.merge || a.mergeFields ? 2 : 0, t, n, i);
	lh("Data must be an object, but it was:", o, r);
	let s = sh(r, o), c, l;
	if (a.merge) c = new Xc(o.fieldMask), l = o.fieldTransforms;
	else if (a.mergeFields) {
		let e = [];
		for (let r of a.mergeFields) {
			let i = uh(t, r, n);
			if (!o.contains(i)) throw new B(z.INVALID_ARGUMENT, `Field '${i}' is specified in your field mask but missing from your input data.`);
			mh(e, i) || e.push(i);
		}
		c = new Xc(e), l = o.fieldTransforms.filter(((e) => c.covers(e.field)));
	} else c = null, l = o.fieldTransforms;
	return new Jm(new mu(s), c, l);
}
var th = class e extends Ap {
	_toFieldTransform(e) {
		if (e.dataSource !== 2) throw e.dataSource === 1 ? e.createError(`${this._methodName}() can only appear at the top level of your update data`) : e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
		return e.fieldMask.push(e.path), null;
	}
	isEqual(t) {
		return t instanceof e;
	}
}, nh = class e extends Ap {
	_toFieldTransform(e) {
		return new Fu(e.path, new Cu());
	}
	isEqual(t) {
		return t instanceof e;
	}
};
function rh(e, t, n, r) {
	let i = e.createContext(1, t, n);
	lh("Data must be an object, but it was:", i, r);
	let a = [], o = mu.empty();
	return Qc(r, ((e, r) => {
		let s = fh(t, e, n);
		r = g(r);
		let c = i.childContextForFieldPath(s);
		if (r instanceof th) a.push(s);
		else {
			let e = oh(r, c);
			e != null && (a.push(s), o.set(s, e));
		}
	})), new Ym(o, new Xc(a), i.fieldTransforms);
}
function ih(e, t, n, r, i, a) {
	let o = e.createContext(1, t, n), s = [uh(t, r, n)], c = [i];
	if (a.length % 2 != 0) throw new B(z.INVALID_ARGUMENT, `Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);
	for (let e = 0; e < a.length; e += 2) s.push(uh(t, a[e])), c.push(a[e + 1]);
	let l = [], u = mu.empty();
	for (let e = s.length - 1; e >= 0; --e) if (!mh(l, s[e])) {
		let t = s[e], n = c[e];
		n = g(n);
		let r = o.childContextForFieldPath(t);
		if (n instanceof th) l.push(t);
		else {
			let e = oh(n, r);
			e != null && (l.push(t), u.set(t, e));
		}
	}
	return new Ym(u, new Xc(l), o.fieldTransforms);
}
function ah(e, t, n, r = !1) {
	return oh(n, e.createContext(r ? 4 : 3, t));
}
function oh(e, t, n) {
	if (ch(e = g(e))) return lh("Unsupported field value:", t, e), sh(e, t);
	if (e instanceof Ap) return function(e, t) {
		if (!Xm(t.dataSource)) throw t.createError(`${e._methodName}() can only be used with update() and set()`);
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
				let e = oh(i, t.childContextForArray(r));
				e ??= { nullValue: "NULL_VALUE" }, n.push(e), r++;
			}
			return { arrayValue: { values: n } };
		}(e, t);
	}
	return function(e, t, n) {
		if ((e = g(e)) === null) return { nullValue: "NULL_VALUE" };
		if (typeof e == "number") return vu(t.serializer, e);
		if (typeof e == "boolean") return { booleanValue: e };
		if (typeof e == "string") return { stringValue: e };
		if (e instanceof Date) {
			let n = fl.fromDate(e);
			return { timestampValue: Uf(t.serializer, n) };
		}
		if (e instanceof fl) {
			let n = new fl(e.seconds, 1e3 * Math.floor(e.nanoseconds / 1e3));
			return { timestampValue: Uf(t.serializer, n) };
		}
		if (e instanceof jp) return { geoPointValue: {
			latitude: e.latitude,
			longitude: e.longitude
		} };
		if (e instanceof Dp) return { bytesValue: Gf(t.serializer, e._byteString) };
		if (e instanceof Hm) {
			let n = t.databaseId, r = e.firestore._databaseId;
			if (!r.isEqual(n)) throw t.createError(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);
			return { referenceValue: Jf(e.firestore._databaseId || t.databaseId, e._key.path) };
		}
		if (e instanceof Km) return function(e, t) {
			let n = e instanceof Km ? e.toArray() : e;
			return { mapValue: { fields: {
				[Pl]: { stringValue: Ll },
				[Rl]: { arrayValue: { values: n.map(((e) => {
					if (typeof e != "number") throw t.createError("VectorValues must only contain numeric values.");
					return gu(t.serializer, e);
				})) } }
			} } };
		}(e, t);
		if (Cp(e)) return e._toProto(t.serializer);
		throw t.createError(`Unsupported field value: ${ol(e)}`);
	}(e, t);
}
function sh(e, t) {
	let n = {};
	return el(e) ? t.path && t.path.length > 0 && t.fieldMask.push(t.path) : Qc(e, ((e, r) => {
		let i = oh(r, t.childContextForField(e));
		i != null && (n[e] = i);
	})), { mapValue: { fields: n } };
}
function ch(e) {
	return !(typeof e != "object" || !e || e instanceof Array || e instanceof Date || e instanceof fl || e instanceof jp || e instanceof Dp || e instanceof Hm || e instanceof Ap || e instanceof Km || Cp(e));
}
function lh(e, t, n) {
	if (!ch(n) || !al(n)) {
		let r = ol(n);
		throw r === "an object" ? t.createError(e + " a custom object") : t.createError(e + " " + r);
	}
}
function uh(e, t, n) {
	if ((t = g(t)) instanceof Op) return t._internalPath;
	if (typeof t == "string") return fh(e, t);
	throw ph("Field path arguments must be of type string or ", e, !1, void 0, n);
}
var dh = /* @__PURE__ */ RegExp("[~\\*/\\[\\]]");
function fh(e, t, n) {
	if (t.search(dh) >= 0) throw ph(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`, e, !1, void 0, n);
	try {
		return new Op(...t.split("."))._internalPath;
	} catch {
		throw ph(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, e, !1, void 0, n);
	}
}
function ph(e, t, n, r, i) {
	let a = r && !r.isEmpty(), o = i !== void 0, s = `Function ${t}() called with invalid data`;
	n && (s += " (via `toFirestore()`)"), s += ". ";
	let c = "";
	return (a || o) && (c += " (found", a && (c += ` in field ${r}`), o && (c += ` in document ${i}`), c += ")"), new B(z.INVALID_ARGUMENT, s + e + c);
}
function mh(e, t) {
	return e.some(((e) => e.isEqual(t)));
}
function hh(e) {
	return typeof e._readUserData == "function";
}
var gh = class e {
	constructor(e) {
		this.optionDefinitions = e;
	}
	_getKnownOptions(t, n) {
		let r = mu.empty();
		for (let i in this.optionDefinitions) if (this.optionDefinitions.hasOwnProperty(i)) {
			let a = this.optionDefinitions[i];
			if (i in t) {
				let o = t[i], s;
				a.nestedOptions && al(o) ? s = { mapValue: { fields: new e(a.nestedOptions).getOptionsProto(n, o) } } : o && (s = oh(o, n) ?? void 0), s && r.set(Yc.fromServerFormat(a.serverName), s);
			}
		}
		return r;
	}
	getOptionsProto(e, t, n) {
		let r = this._getKnownOptions(t, e);
		if (n) {
			let t = new Map($c(n, ((t, n) => [Yc.fromServerFormat(n), t === void 0 ? null : oh(t, e)])));
			r.setAll(t);
		}
		return r.value.mapValue.fields ?? {};
	}
};
function _h(e) {
	return typeof e == "object" && !!e && !!("nullValue" in e && (e.nullValue === null || e.nullValue === "NULL_VALUE") || "booleanValue" in e && (e.booleanValue === null || typeof e.booleanValue == "boolean") || "integerValue" in e && (e.integerValue === null || typeof e.integerValue == "number" || typeof e.integerValue == "string") || "doubleValue" in e && (e.doubleValue === null || typeof e.doubleValue == "number") || "timestampValue" in e && (e.timestampValue === null || function(e) {
		return typeof e == "object" && !!e && "seconds" in e && (e.seconds === null || typeof e.seconds == "number" || typeof e.seconds == "string") && "nanos" in e && (e.nanos === null || typeof e.nanos == "number");
	}(e.timestampValue)) || "stringValue" in e && (e.stringValue === null || typeof e.stringValue == "string") || "bytesValue" in e && (e.bytesValue === null || e.bytesValue instanceof Uint8Array) || "referenceValue" in e && (e.referenceValue === null || typeof e.referenceValue == "string") || "geoPointValue" in e && (e.geoPointValue === null || function(e) {
		return typeof e == "object" && !!e && "latitude" in e && (e.latitude === null || typeof e.latitude == "number") && "longitude" in e && (e.longitude === null || typeof e.longitude == "number");
	}(e.geoPointValue)) || "arrayValue" in e && (e.arrayValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("values" in e) || e.values !== null && !Array.isArray(e.values));
	}(e.arrayValue)) || "mapValue" in e && (e.mapValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("fields" in e) || e.fields !== null && !al(e.fields));
	}(e.mapValue)) || "fieldReferenceValue" in e && (e.fieldReferenceValue === null || typeof e.fieldReferenceValue == "string") || "functionValue" in e && (e.functionValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("name" in e) || e.name !== null && typeof e.name != "string" || !("args" in e) || e.args !== null && !Array.isArray(e.args));
	}(e.functionValue)) || "pipelineValue" in e && (e.pipelineValue === null || function(e) {
		return typeof e == "object" && !!e && !(!("stages" in e) || e.stages !== null && !Array.isArray(e.stages));
	}(e.pipelineValue)));
}
function vh() {
	return new nh("serverTimestamp");
}
function yh(e) {
	return new Km(e);
}
function X(e) {
	let t;
	return e instanceof Sh ? e : (t = al(e) ? Lh(e) : e instanceof Array ? Rh(e) : Mh(e, void 0), t);
}
function bh(e) {
	if (e instanceof Sh) return e;
	if (e instanceof Km) return jh(e);
	if (Array.isArray(e)) return jh(yh(e));
	throw Error("Unsupported value: " + typeof e);
}
function xh(e) {
	return Nl(e) ? Oh(e) : X(e);
}
var Sh = class {
	constructor() {
		this._protoValueType = "ProtoValue";
	}
	add(e) {
		return new Z("add", [this, X(e)], "add");
	}
	asBoolean() {
		if (this instanceof Nh) return this;
		if (this instanceof Ah) return new Fh(this);
		if (this instanceof Dh) return new Ih(this);
		if (this instanceof Z) return new Ph(this);
		throw new B("invalid-argument", `Conversion of type ${typeof this} to BooleanExpression not supported.`);
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
		let t = Array.isArray(e) ? new Eh(e.map(X), "arrayContainsAll") : e;
		return new Z("array_contains_all", [this, t], "arrayContainsAll").asBoolean();
	}
	arrayContainsAny(e) {
		let t = Array.isArray(e) ? new Eh(e.map(X), "arrayContainsAny") : e;
		return new Z("array_contains_any", [this, t], "arrayContainsAny").asBoolean();
	}
	arrayReverse() {
		return new Z("array_reverse", [this]);
	}
	arrayLength() {
		return new Z("array_length", [this], "arrayLength");
	}
	equalAny(e) {
		let t = Array.isArray(e) ? new Eh(e.map(X), "equalAny") : e;
		return new Z("equal_any", [this, t], "equalAny").asBoolean();
	}
	notEqualAny(e) {
		let t = Array.isArray(e) ? new Eh(e.map(X), "notEqualAny") : e;
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
		return new Z("is_type", [this, jh(e)], "isType").asBoolean();
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
		return new Z("map_get", [this, jh(e)], "mapGet");
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
		return Ch._create("count", [this], "count");
	}
	sum() {
		return Ch._create("sum", [this], "sum");
	}
	average() {
		return Ch._create("average", [this], "average");
	}
	minimum() {
		return Ch._create("minimum", [this], "minimum");
	}
	maximum() {
		return Ch._create("maximum", [this], "maximum");
	}
	first() {
		return Ch._create("first", [this], "first");
	}
	last() {
		return Ch._create("last", [this], "last");
	}
	arrayAgg() {
		return Ch._create("array_agg", [this], "arrayAgg");
	}
	arrayAggDistinct() {
		return Ch._create("array_agg_distinct", [this], "arrayAggDistinct");
	}
	countDistinct() {
		return Ch._create("count_distinct", [this], "countDistinct");
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
		return new Z("cosine_distance", [this, bh(e)], "cosineDistance");
	}
	dotProduct(e) {
		return new Z("dot_product", [this, bh(e)], "dotProduct");
	}
	euclideanDistance(e) {
		return new Z("euclidean_distance", [this, bh(e)], "euclideanDistance");
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
			xh(e),
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
		return e instanceof Nh ? t.asBoolean() : t;
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
		return zh(this);
	}
	descending() {
		return Bh(this);
	}
	as(e) {
		return new Th(this, e, "as");
	}
}, Ch = class e {
	constructor(e, t) {
		this.name = e, this.params = t, this.exprType = "AggregateFunction", this._protoValueType = "ProtoValue";
	}
	static _create(t, n, r) {
		let i = new e(t, n);
		return i._methodName = r, i;
	}
	as(e) {
		return new wh(this, e, "as");
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
}, wh = class {
	constructor(e, t, n) {
		this.aggregate = e, this.alias = t, this._methodName = n;
	}
	_readUserData(e) {
		this.aggregate._readUserData(e);
	}
}, Th = class {
	constructor(e, t, n) {
		this.expr = e, this.alias = t, this._methodName = n, this.exprType = "AliasedExpression", this.selectable = !0;
	}
	_readUserData(e) {
		this.expr._readUserData(e);
	}
}, Eh = class extends Sh {
	constructor(e, t) {
		super(), this.ur = e, this._methodName = t, this.expressionType = "ListOfExpressions";
	}
	_toProto(e) {
		return { arrayValue: { values: this.ur.map(((t) => t._toProto(e))) } };
	}
	_readUserData(e) {
		this.ur.forEach(((t) => t._readUserData(e)));
	}
}, Dh = class extends Sh {
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
function Oh(e) {
	return kh(e, "field");
}
function kh(e, t) {
	return new Dh(typeof e == "string" ? Kc === e ? kp()._internalPath : uh("field", e) : e._internalPath, t);
}
var Ah = class e extends Sh {
	constructor(e, t) {
		super(), this.value = e, this._methodName = t, this.expressionType = "Constant";
	}
	static _fromProto(t) {
		let n = new e(t, void 0);
		return n._protoValue = t, n;
	}
	_toProto(e) {
		return F(this._protoValue !== void 0, 237), this._protoValue;
	}
	_getValue() {
		return this._protoValue;
	}
	_readUserData(e) {
		e = this._methodName ? e.contextWith({ methodName: this._methodName }) : e, _h(this._protoValue) || (this._protoValue = oh(this.value, e));
	}
};
function jh(e, t) {
	return Mh(e, "constant");
}
function Mh(e, t) {
	let n = new Ah(e, t);
	return typeof e == "boolean" ? new Fh(n) : n;
}
var Z = class extends Sh {
	constructor(e, t, n, r) {
		super(), this.name = e, this.params = t, this.expressionType = "Function", this._optionsProto = void 0, n !== void 0 && (this._methodName = n), r !== void 0 && (this._options = r);
	}
	get _optionsUtil() {
		return new gh({});
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
}, Nh = class e extends Sh {
	get _methodName() {
		return this._expr._methodName;
	}
	countIf() {
		return Ch._create("count_if", [this], "countIf");
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
}, Ph = class extends Nh {
	constructor(e) {
		super(), this._expr = e, this.expressionType = "Function";
	}
}, Fh = class extends Nh {
	constructor(e) {
		super(), this._expr = e, this.expressionType = "Constant";
	}
	_getValue() {
		return this._expr._getValue();
	}
}, Ih = class extends Nh {
	constructor(e) {
		super(), this._expr = e, this.expressionType = "Field";
	}
};
function Lh(e, t) {
	let n = [];
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) {
		let r = e[t];
		n.push(jh(t)), n.push(X(r));
	}
	return new Z("map", n, "map");
}
function Rh(e) {
	return function(e, t) {
		return new Z("array", e.map(((e) => X(e))), t);
	}(e, "array");
}
function zh(e) {
	return new Vh(xh(e), "ascending", "ascending");
}
function Bh(e) {
	return new Vh(xh(e), "descending", "descending");
}
var Vh = class {
	constructor(e, t, n) {
		this.expr = e, this.direction = t, this._methodName = n, this._protoValueType = "ProtoValue";
	}
	_toProto(e) {
		return { mapValue: { fields: {
			direction: Tp(this.direction),
			expression: this.expr._toProto(e)
		} } };
	}
	_readUserData(e) {
		this.expr._readUserData(e);
	}
}, Hh = class {
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
}, Uh = class extends Hh {
	get _name() {
		return "add_fields";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t) {
		super(t), this.fields = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [wp(e, this.fields)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), ng(this.fields, e);
	}
}, Wh = class extends Hh {
	get _name() {
		return "aggregate";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t, n) {
		super(n), this.groups = e, this.accumulators = t;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [wp(e, this.accumulators), wp(e, this.groups)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), ng(this.groups, e), ng(this.accumulators, e);
	}
}, Gh = class extends Hh {
	get _name() {
		return "distinct";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t) {
		super(t), this.groups = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [wp(e, this.groups)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), ng(this.groups, e);
	}
}, Kh = class extends Hh {
	get _name() {
		return "collection";
	}
	get _optionsUtil() {
		return new gh({ forceIndex: { serverName: "force_index" } });
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
}, qh = class extends Hh {
	get _name() {
		return "collection_group";
	}
	get _optionsUtil() {
		return new gh({ forceIndex: { serverName: "force_index" } });
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
}, Jh = class extends Hh {
	get _name() {
		return "database";
	}
	get _optionsUtil() {
		return new gh({});
	}
	_toProto(e) {
		return { ...super._toProto(e) };
	}
	_readUserData(e) {
		super._readUserData(e);
	}
}, Yh = class extends Hh {
	get _name() {
		return "documents";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t) {
		if (super(t), !e || e.length === 0) throw new B(z.INVALID_ARGUMENT, "Empty document paths are not allowed in DocumentsSource");
		let n = e.map(((e) => e.startsWith("/") ? e : "/" + e)), r = new Set(n);
		if (r.size !== n.length) throw new B(z.INVALID_ARGUMENT, "Duplicate document paths are not allowed in DocumentsSource");
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
}, Xh = class extends Hh {
	get _name() {
		return "where";
	}
	get _optionsUtil() {
		return new gh({});
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
		super._readUserData(e), ng(this.condition, e);
	}
}, Zh = class extends Hh {
	get _name() {
		return "limit";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t) {
		F(!isNaN(e) && e !== 1 / 0 && e !== -1 / 0, 34860), super(t), this.limit = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [vu(e, this.limit)]
		};
	}
}, Qh = class extends Hh {
	get _name() {
		return "offset";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t) {
		super(t), this.offset = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [vu(e, this.offset)]
		};
	}
}, $h = class extends Hh {
	get _name() {
		return "select";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t) {
		super(t), this.selections = e;
	}
	_toProto(e) {
		return {
			...super._toProto(e),
			args: [wp(e, this.selections)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), ng(this.selections, e);
	}
}, eg = class extends Hh {
	get _name() {
		return "sort";
	}
	get _optionsUtil() {
		return new gh({});
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
		super._readUserData(e), ng(this.orderings, e);
	}
}, tg = class e extends Hh {
	get _name() {
		return "replace_with";
	}
	get _optionsUtil() {
		return new gh({});
	}
	constructor(e, t) {
		super(t), this.map = e;
	}
	_toProto(t) {
		return {
			...super._toProto(t),
			args: [this.map._toProto(t), Tp(e.Pr)]
		};
	}
	_readUserData(e) {
		super._readUserData(e), ng(this.map, e);
	}
};
tg.Pr = "full_replace";
function ng(e, t) {
	return hh(e) ? e._readUserData(t) : Array.isArray(e) || e instanceof Map ? e.forEach(((e) => e._readUserData(t))) : Object.values(e).forEach(((e) => e._readUserData(t))), e;
}
var rg = class e {
	constructor(e, t, n, r) {
		this._db = e, this.userDataReader = t, this._userDataWriter = n, this.stages = r;
	}
	Ar(e, t) {
		let n = this.userDataReader.createContext(3, e);
		return hh(t) ? t._readUserData(n) : t.forEach(((e) => e._readUserData(n))), t;
	}
	where(t) {
		let n = this.stages.map(((e) => e));
		return this.Ar("where", t), n.push(new Xh(t, {})), new e(this._db, this.userDataReader, this._userDataWriter, n);
	}
	limit(t) {
		let n = this.stages.map(((e) => e));
		return n.push(new Zh(t, {})), new e(this._db, this.userDataReader, this._userDataWriter, n);
	}
	sort(t, ...n) {
		let r = this.stages.map(((e) => e));
		return "orderings" in t ? r.push(new eg(this.Ar("sort", t.orderings), {})) : r.push(new eg(this.Ar("sort", [t, ...n]), {})), new e(this._db, this.userDataReader, this._userDataWriter, r);
	}
	Vr(e) {
		return { pipeline: { stages: this.stages.map(((t) => t._toProto(e))) } };
	}
}, ig = class {
	constructor(e, t, n) {
		this.serializer = e, this.stages = t, this.listenOptions = n, this.isCorePipeline = !0;
	}
	getPipelineCollection() {
		return og(this);
	}
	getPipelineCollectionGroup() {
		return sg(this);
	}
	getPipelineCollectionId() {
		return cg(this);
	}
	getPipelineDocuments() {
		return lg(this);
	}
	getPipelineFlavor() {
		return function(e) {
			let t = "exact";
			return e.stages.forEach(((n, r) => {
				n._name !== Gh.name && n._name !== Wh.name || (t = "keyless"), n._name === $h.name && t === "exact" && (t = "augmented"), n._name === Uh.name && r < e.stages.length - 1 && t === "exact" && (t = "augmented");
			})), t;
		}(this);
	}
	getPipelineSourceType() {
		return ag(this);
	}
};
function ag(e) {
	let t = e.stages[0];
	return t instanceof Kh || t instanceof qh || t instanceof Jh || t instanceof Yh ? t._name : "unknown";
}
function og(e) {
	if (ag(e) === "collection") return e.stages[0].Er;
}
function sg(e) {
	if (ag(e) === "collection_group") return e.stages[0].collectionId;
}
function cg(e) {
	switch (ag(e)) {
		case "collection": return V.fromString(og(e)).lastSegment();
		case "collection_group": return sg(e);
		default: return;
	}
}
function lg(e) {
	if (ag(e) === "documents") return e.stages[0].hr;
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
		return new e("NULL", zl);
	}
	static newValue(t) {
		return nu(t) ? new e("NULL", zl) : function(e) {
			return !!e && "booleanValue" in e;
		}(t) ? new e("BOOLEAN", t) : Ql(t) ? new e("INT", t) : $l(t) ? new e("DOUBLE", t) : function(e) {
			return !!e && "timestampValue" in e && !!e.timestampValue;
		}(t) ? new e("TIMESTAMP", t) : function(e) {
			return !!e && "stringValue" in e;
		}(t) ? new e("STRING", t) : function(e) {
			return !!e && "bytesValue" in e;
		}(t) ? new e("BYTES", t) : t.referenceValue ? new e("REFERENCE", t) : t.geoPointValue ? new e("GEO_POINT", t) : tu(t) ? new e("ARRAY", t) : au(t) ? new e("VECTOR", t) : iu(t) ? new e("MAP", t) : new e("ERROR", void 0);
	}
	gr() {
		return this.type === "ERROR" || this.type === "UNSET";
	}
	yr() {
		return this.type === "NULL";
	}
};
function ug(e) {
	if (!e.gr()) return e.value;
}
function dg(e) {
	return e instanceof Nh ? e._expr : e;
}
function $(e) {
	if ((e = dg(e)) instanceof Dh) return new fg(e);
	if (e instanceof Ah) return new pg(e);
	if (e instanceof Eh) return new mg(e);
	if (e instanceof Z) {
		if (e.name === "add") return new xg(e);
		if (e.name === "subtract") return new Sg(e);
		if (e.name === "multiply") return new Cg(e);
		if (e.name === "divide") return new wg(e);
		if (e.name === "mod") return new Tg(e);
		if (e.name === "and") return new Eg(e);
		if (e.name === "equal") return new Hg(e);
		if (e.name === "not_equal") return new Ug(e);
		if (e.name === "less_than") return new Wg(e);
		if (e.name === "less_than_or_equal") return new Gg(e);
		if (e.name === "greater_than") return new Kg(e);
		if (e.name === "greater_than_or_equal") return new qg(e);
		if (e.name === "array_concat") return new Jg(e);
		if (e.name === "array_reverse") return new Yg(e);
		if (e.name === "array_contains") return new Xg(e);
		if (e.name === "array_contains_all") return new Zg(e);
		if (e.name === "array_contains_any") return new Qg(e);
		if (e.name === "array_length") return new $g(e);
		if (e.name === "array_element") return new e_(e);
		if (e.name === "equal_any") return new Ag(e);
		if (e.name === "not_equal_any") return new jg(e);
		if (e.name === "is_nan") return new Mg(e);
		if (e.name === "is_not_nan") return new Ng(e);
		if (e.name === "is_null") return new Pg(e);
		if (e.name === "is_not_null") return new Fg(e);
		if (e.name === "is_error") return new Ig(e);
		if (e.name === "exists") return new Lg(e);
		if (e.name === "not") return new Dg(e);
		if (e.name === "or") return new Og(e);
		if (e.name === "xor") return new kg(e);
		if (e.name === "conditional") return new Rg(e);
		if (e.name === "maximum") return new zg(e);
		if (e.name === "minimum") return new Bg(e);
		if (e.name === "reverse") return new t_(e);
		if (e.name === "replace_first") return new n_(e);
		if (e.name === "replace_all") return new r_(e);
		if (e.name === "char_length") return new i_(e);
		if (e.name === "byte_length") return new a_(e);
		if (e.name === "like") return new s_(e);
		if (e.name === "regex_contains") return new c_(e);
		if (e.name === "regex_match") return new l_(e);
		if (e.name === "string_contains") return new u_(e);
		if (e.name === "starts_with") return new d_(e);
		if (e.name === "ends_with") return new f_(e);
		if (e.name === "to_lower") return new p_(e);
		if (e.name === "to_upper") return new m_(e);
		if (e.name === "trim") return new h_(e);
		if (e.name === "string_concat") return new g_(e);
		if (e.name === "map_get") return new __(e);
		if (e.name === "cosine_distance") return new y_(e);
		if (e.name === "dot_product") return new b_(e);
		if (e.name === "euclidean_distance") return new x_(e);
		if (e.name === "vector_length") return new S_(e);
		if (e.name === "unix_micros_to_timestamp") return new L_(e);
		if (e.name === "timestamp_to_unix_micros") return new V_(e);
		if (e.name === "unix_millis_to_timestamp") return new R_(e);
		if (e.name === "timestamp_to_unix_millis") return new H_(e);
		if (e.name === "unix_seconds_to_timestamp") return new z_(e);
		if (e.name === "timestamp_to_unix_seconds") return new U_(e);
		if (e.name === "timestamp_add") return new G_(e);
		if (e.name === "timestamp_subtract") return new K_(e);
	}
	throw Error(`Unknown Expr : ${e}`);
}
var fg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		if (this.expr.fieldName === Kc) return Q.newValue({ referenceValue: Zf(e.serializer, t.key) });
		if (this.expr.fieldName === "__update_time__") return Q.newValue({ timestampValue: Kf(e.serializer, t.version) });
		if (this.expr.fieldName === "__create_time__") return Q.newValue({ timestampValue: Kf(e.serializer, t.createTime) });
		let n = t.data.field(this.expr._fieldPath);
		return n ? Sl(n) ? Q.newValue(function(e, t) {
			if (e.serverTimestampBehavior === "estimate") return { timestampValue: Kf(e.serializer, K.fromTimestamp(wl(t))) };
			if (e.serverTimestampBehavior === "previous") {
				let e = Cl(t);
				if (e) return e;
			}
			return { nullValue: "NULL_VALUE" };
		}(e, n)) : Q.newValue(n) : Q.mr();
	}
}, pg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return Q.newValue(this.expr._getValue());
	}
}, mg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = this.expr.ur.map(((n) => $(n).evaluate(e, t)));
		return n.some(((e) => e.gr())) ? Q.dr() : Q.newValue({ arrayValue: { values: n.map(((e) => e.value)) } });
	}
};
function hg(e) {
	return $l(e) ? Number(e.doubleValue) : Number(e.integerValue);
}
function gg(e) {
	return BigInt(e.integerValue);
}
var _g = BigInt("0x7fffffffffffffff"), vg = -BigInt("0x8000000000000000"), yg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length >= 2, 24778);
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
		if (!$l(n) && !Ql(n) || !$l(r) && !Ql(r)) return Q.dr();
		if ($l(n) || $l(r)) {
			let e = this.br(n, r);
			return e ? Q.newValue(e) : Q.dr();
		}
		if (Ql(n) && Ql(r)) {
			let e = this.Sr(n, r);
			return e === void 0 ? Q.dr() : typeof e == "number" ? Q.newValue({ doubleValue: e }) : e < vg || e > _g ? Q.dr() : Q.newValue({ integerValue: `${e}` });
		}
		return Q.dr();
	}
};
function bg(e, t) {
	return Hl(e) === Hl(t) ? ru(e) || ru(t) ? "NOT_EQ" : nu(e) && nu(t) ? "EQ" : nu(e) || nu(t) ? "NULL" : tu(e) && tu(t) ? function(e, t) {
		if (e.values?.length !== t.values?.length) return "NOT_EQ";
		let n = !1;
		for (let r = 0; r < (e.values?.length ?? 0); r++) {
			let i = e.values[r], a = t.values[r];
			switch (bg(i, a)) {
				case "EQ": break;
				case "NOT_EQ":
				case "TYPE_MISMATCH": return "NOT_EQ";
				case "NULL":
					n = !0;
					break;
				default: P(44609, {
					vr: i,
					Dr: a
				});
			}
		}
		return n ? "NULL" : "EQ";
	}(e.arrayValue, t.arrayValue) : au(e) && au(t) || iu(e) && iu(t) ? function(e, t) {
		let n = e.fields || {}, r = t.fields || {};
		if (Zc(n) !== Zc(r)) return "NOT_EQ";
		let i = !1;
		for (let e in n) if (n.hasOwnProperty(e)) {
			if (r[e] === void 0) return "NOT_EQ";
			switch (bg(n[e], r[e])) {
				case "NOT_EQ":
				case "TYPE_MISMATCH": return "NOT_EQ";
				case "NULL": i = !0;
			}
		}
		return i ? "NULL" : "EQ";
	}(e.mapValue, t.mapValue) : function(e, t) {
		return Ul(e, t, {
			o: !1,
			t: !0,
			i: !0
		});
	}(e, t) ? "EQ" : "NOT_EQ" : "TYPE_MISMATCH";
}
var xg = class extends yg {
	Sr(e, t) {
		return gg(e) + gg(t);
	}
	br(e, t) {
		return { doubleValue: hg(e) + hg(t) };
	}
}, Sg = class extends yg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		return gg(e) - gg(t);
	}
	br(e, t) {
		return { doubleValue: hg(e) - hg(t) };
	}
}, Cg = class extends yg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		return gg(e) * gg(t);
	}
	br(e, t) {
		return { doubleValue: hg(e) * hg(t) };
	}
}, wg = class extends yg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		let n = gg(t);
		if (n !== BigInt(0)) return gg(e) / n;
	}
	br(e, t) {
		let n = hg(t);
		return n === 0 ? { doubleValue: jl(n) ? -Infinity : Infinity } : { doubleValue: hg(e) / n };
	}
}, Tg = class extends yg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Sr(e, t) {
		let n = gg(t);
		if (n !== BigInt(0)) return gg(e) % n;
	}
	br(e, t) {
		let n = hg(t);
		if (n !== 0) return { doubleValue: hg(e) % n };
	}
}, Eg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = !1, r = !1;
		for (let i of this.expr.params) {
			let a = $(i).evaluate(e, t);
			switch (a.type) {
				case "BOOLEAN":
					if (!a.value?.booleanValue) return Q.newValue(Vl);
					break;
				case "NULL":
					r = !0;
					break;
				default: n = !0;
			}
		}
		return n ? Q.dr() : r ? Q.pr() : Q.newValue(Bl);
	}
}, Dg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 9634);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "BOOLEAN": return Q.newValue({ booleanValue: !n.value?.booleanValue });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, Og = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = !1, r = !1;
		for (let i of this.expr.params) {
			let a = $(i).evaluate(e, t);
			switch (a.type) {
				case "BOOLEAN":
					if (a.value?.booleanValue) return Q.newValue(Bl);
					break;
				case "NULL":
					r = !0;
					break;
				default: n = !0;
			}
		}
		return n ? Q.dr() : r ? Q.pr() : Q.newValue(Vl);
	}
}, kg = class e {
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
}, Ag = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 2, 55094);
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
		for (let e of i.value?.arrayValue?.values ?? []) switch (nu(r.value) && nu(e) ? "EQ" : bg(r.value, e)) {
			case "EQ": return Q.newValue(Bl);
			case "NOT_EQ":
			case "TYPE_MISMATCH": break;
			case "NULL":
				n = !0;
				break;
			default: P(44608, {
				value: r.value,
				candidate: e
			});
		}
		return n ? Q.pr() : Q.newValue(Vl);
	}
}, jg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return new Dg(new Z("not", [new Z("equal_any", this.expr.params)])).evaluate(e, t);
	}
}, Mg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 23322);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "INT": return Q.newValue(Vl);
			case "DOUBLE": return Q.newValue({ booleanValue: isNaN(hg(n.value)) });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, Ng = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return F(this.expr.params.length === 1, 50406), new Dg(new Z("not", [new Z("is_nan", this.expr.params)])).evaluate(e, t);
	}
}, Pg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		switch (F(this.expr.params.length === 1, 23123), $(this.expr.params[0]).evaluate(e, t).type) {
			case "NULL": return Q.newValue(Bl);
			case "UNSET":
			case "ERROR": return Q.dr();
			default: return Q.newValue(Vl);
		}
	}
}, Fg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return F(this.expr.params.length === 1, 23167), new Dg(new Z("not", [new Z("is_null", this.expr.params)])).evaluate(e, t);
	}
}, Ig = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return F(this.expr.params.length === 1, 5228), $(this.expr.params[0]).evaluate(e, t).type === "ERROR" ? Q.newValue(Bl) : Q.newValue(Vl);
	}
}, Lg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		switch (F(this.expr.params.length === 1, 6877), $(this.expr.params[0]).evaluate(e, t).type) {
			case "ERROR": return Q.dr();
			case "UNSET": return Q.newValue(Vl);
			default: return Q.newValue(Bl);
		}
	}
}, Rg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 3, 11706);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "BOOLEAN": return n.value?.booleanValue ? $(this.expr.params[1]).evaluate(e, t) : $(this.expr.params[2]).evaluate(e, t);
			case "NULL": return $(this.expr.params[2]).evaluate(e, t);
			default: return Q.dr();
		}
	}
}, zg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = this.expr.params.map(((n) => $(n).evaluate(e, t))), r;
		for (let e of n) switch (e.type) {
			case "ERROR":
			case "UNSET":
			case "NULL": continue;
			default: r = r === void 0 || Gl(e.value, r.value) > 0 ? e : r;
		}
		return r === void 0 ? Q.pr() : r;
	}
}, Bg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		let n = this.expr.params.map(((n) => $(n).evaluate(e, t))), r;
		for (let e of n) switch (e.type) {
			case "ERROR":
			case "UNSET":
			case "NULL": continue;
			default: r = r === void 0 || Gl(e.value, r.value) < 0 ? e : r;
		}
		return r === void 0 ? Q.pr() : r;
	}
}, Vg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 2, 31033, `${this.expr.name}() function should have exactly 2 params`);
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
}, Hg = class extends Vg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		if (e.yr() && t.yr()) return Q.newValue(Bl);
		if (e.yr() || t.yr() || ru(e.value) || ru(t.value) || Hl(e.value) !== Hl(t.value)) return Q.newValue(Vl);
		switch (bg(e.value, t.value)) {
			case "EQ": return Q.newValue(Bl);
			case "NOT_EQ": return Q.newValue(Vl);
			case "NULL": return Q.pr();
			default: P(44615, {
				left: e,
				right: t
			});
		}
	}
}, Ug = class extends Vg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		switch (bg(e.value, t.value)) {
			case "EQ": return Q.newValue(Vl);
			case "NOT_EQ":
			case "TYPE_MISMATCH": return Q.newValue(Bl);
			case "NULL": return Q.pr();
			default: P(44614, {
				left: e,
				right: t
			});
		}
	}
}, Wg = class extends Vg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return Hl(e.value) !== Hl(t.value) || ru(e.value) || ru(t.value) ? Q.newValue(Vl) : Q.newValue({ booleanValue: Gl(e.value, t.value) < 0 });
	}
}, Gg = class extends Vg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return Hl(e.value) !== Hl(t.value) || ru(e.value) || ru(t.value) ? Q.newValue(Vl) : bg(e.value, t.value) === "EQ" ? Q.newValue(Bl) : Q.newValue({ booleanValue: Gl(e.value, t.value) < 0 });
	}
}, Kg = class extends Vg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return Hl(e.value) !== Hl(t.value) || ru(e.value) || ru(t.value) ? Q.newValue(Vl) : Q.newValue({ booleanValue: Gl(e.value, t.value) > 0 });
	}
}, qg = class extends Vg {
	constructor(e) {
		super(e), this.expr = e;
	}
	Cr(e, t) {
		return Hl(e.value) !== Hl(t.value) || ru(e.value) || ru(t.value) ? Q.newValue(Vl) : bg(e.value, t.value) === "EQ" ? Q.newValue(Bl) : Q.newValue({ booleanValue: Gl(e.value, t.value) > 0 });
	}
}, Jg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, Yg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 216);
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
}, Xg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		return F(this.expr.params.length === 2, 52884), new Ag(new Z("eq_any", [this.expr.params[1], this.expr.params[0]])).evaluate(e, t);
	}
}, Zg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 2, 1392);
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
				switch (nu(e) && nu(r) ? "EQ" : bg(e, r)) {
					case "EQ":
						t = !0;
						break;
					case "NOT_EQ":
					case "TYPE_MISMATCH": break;
					case "NULL":
						n = !0;
						break;
					default: P(44613, {
						value: r,
						search: e
					});
				}
				if (t) break;
			}
			if (!t) return Q.newValue(Vl);
		}
		return Q.newValue(Bl);
	}
}, Qg = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 2, 2680);
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
		for (let e of o) for (let t of a) switch (nu(e) && nu(t) ? "EQ" : bg(e, t)) {
			case "EQ": return Q.newValue(Bl);
			case "NOT_EQ":
			case "TYPE_MISMATCH": break;
			case "NULL":
				n = !0;
				break;
			default: P(60403, {
				value: e,
				search: t
			});
		}
		return n ? Q.pr() : Q.newValue(Vl);
	}
}, $g = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 38605);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "NULL": return Q.pr();
			case "ARRAY": return Q.newValue({ integerValue: `${n.value?.arrayValue?.values?.length ?? 0}` });
			default: return Q.dr();
		}
	}
}, e_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, t_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 1508);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "NULL": return Q.pr();
			case "BYTES": {
				let e = n.value?.bytesValue;
				if (typeof e == "string") {
					let t = ml.fromBase64String(e).toUint8Array();
					return t.reverse(), Q.newValue({ bytesValue: ml.fromUint8Array(t).toBase64() });
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
}, n_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, r_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		throw Error("Unimplemented");
	}
}, i_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 19400);
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
}, a_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 8486);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "BYTES": {
				let e = n.value?.bytesValue;
				return typeof e == "string" ? Q.newValue({ integerValue: ml.fromBase64String(e).toUint8Array().length }) : Q.newValue({ integerValue: new Uint8Array(e).length });
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
}, o_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 2, 39773, `${this.expr.name}() function should have exactly two parameters`);
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
}, s_ = class extends o_ {
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
			}(t), r = wc.compile(n);
			return Q.newValue({ booleanValue: r.matches(e) });
		} catch (e) {
			return Ac(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${e}`), Q.dr();
		}
	}
}, c_ = class extends o_ {
	Fr(e, t) {
		try {
			let n = wc.compile(t);
			return Q.newValue({ booleanValue: n.test(e) });
		} catch {
			return Ac(`Invalid regex pattern found in regex_contains: ${t}, returning error`), Q.dr();
		}
	}
}, l_ = class extends o_ {
	Fr(e, t) {
		try {
			return Q.newValue({ booleanValue: wc.compile(t).matches(e) });
		} catch {
			return Ac(`Invalid regex pattern found in regex_match: ${t}, returning error`), Q.dr();
		}
	}
}, u_ = class extends o_ {
	Fr(e, t) {
		return Q.newValue({ booleanValue: e.includes(t) });
	}
}, d_ = class extends o_ {
	Fr(e, t) {
		return Q.newValue({ booleanValue: e.startsWith(t) });
	}
}, f_ = class extends o_ {
	Fr(e, t) {
		return Q.newValue({ booleanValue: e.endsWith(t) });
	}
}, p_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 29079);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "STRING": return Q.newValue({ stringValue: n.value?.stringValue?.toLowerCase() });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, m_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 60487);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "STRING": return Q.newValue({ stringValue: n.value?.stringValue?.toUpperCase() });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, h_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 28544);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "STRING": return Q.newValue({ stringValue: n.value?.stringValue?.trim() });
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, g_ = class {
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
}, __ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 2, 4483);
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
}, v_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 2, 25231, `${this.expr.name}() function should have exactly 2 params`);
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
		let a = ou(r.value), o = ou(i.value);
		if (a === void 0 || o === void 0 || a.values?.length !== o.values?.length) return Q.dr();
		let s = this.Or(a, o);
		return s === void 0 || isNaN(s) ? Q.dr() : Q.newValue({ doubleValue: s });
	}
}, y_ = class extends v_ {
	Or(e, t) {
		let n = e?.values ?? [], r = t?.values ?? [];
		if (n.length === 0) return;
		let i = 0, a = 0, o = 0;
		for (let e = 0; e < n.length; e++) {
			if (!eu(n[e]) || !eu(r[e])) return;
			let t = hg(n[e]), s = hg(r[e]);
			i += t * s, a += t * t, o += s * s;
		}
		let s = Math.sqrt(a) * Math.sqrt(o);
		if (s !== 0) return 1 - Math.max(-1, Math.min(1, i / s));
	}
}, b_ = class extends v_ {
	Or(e, t) {
		let n = e?.values ?? [], r = t?.values ?? [];
		if (n.length === 0) return 0;
		let i = 0;
		for (let e = 0; e < n.length; e++) {
			if (!eu(n[e]) || !eu(r[e])) return;
			i += hg(n[e]) * hg(r[e]);
		}
		return i;
	}
}, x_ = class extends v_ {
	Or(e, t) {
		let n = e?.values ?? [], r = t?.values ?? [];
		if (n.length === 0) return 0;
		let i = 0;
		for (let e = 0; e < n.length; e++) {
			if (!eu(n[e]) || !eu(r[e])) return;
			let t = hg(n[e]), a = hg(r[e]);
			i += (t - a) ** 2;
		}
		return Math.sqrt(i);
	}
}, S_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 39044);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "VECTOR": {
				let e = ou(n.value);
				return Q.newValue({ integerValue: e?.values?.length ?? 0 });
			}
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, C_ = BigInt(-62135596800), w_ = BigInt(253402300799), T_ = BigInt(1e3), E_ = BigInt(1e6), D_ = C_ * T_, O_ = w_ * T_ + BigInt(999), k_ = C_ * E_, A_ = w_ * E_ + BigInt(999999);
function j_(e) {
	return e >= k_ && e <= A_;
}
function M_(e) {
	return e >= C_ && e <= w_;
}
function N_(e, t) {
	let n = BigInt(e);
	return !(n < C_ || n > w_) && !(t < 0 || t >= 1e9) && (n !== C_ || t === 0) && !(n === w_ && t > 999999999);
}
function P_(e, t) {
	return t < 0 ? {
		seconds: e - 1,
		nanos: t + 1e9
	} : {
		seconds: e,
		nanos: t
	};
}
function F_(e) {
	return BigInt(e.seconds) * E_ + BigInt(Math.trunc(e.nanoseconds / 1e3));
}
var I_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 49262, `${this.expr.name}() function should have exactly one parameter`);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "INT": return this.toTimestamp(BigInt(n.value.integerValue));
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
	}
}, L_ = class extends I_ {
	toTimestamp(e) {
		if (!j_(e)) return Q.dr();
		let t = Number(e / E_), n = Number(e % E_ * BigInt(1e3)), r = P_(t, n);
		return t = r.seconds, n = r.nanos, N_(t, n) ? Q.newValue({ timestampValue: {
			seconds: t,
			nanos: n
		} }) : Q.dr();
	}
}, R_ = class extends I_ {
	toTimestamp(e) {
		if (!function(e) {
			return e >= D_ && e <= O_;
		}(e)) return Q.dr();
		let t = Number(e / T_), n = Number(e % T_ * BigInt(1e6)), r = P_(t, n);
		return t = r.seconds, n = r.nanos, N_(t, n) ? Q.newValue({ timestampValue: {
			seconds: t,
			nanos: n
		} }) : Q.dr();
	}
}, z_ = class extends I_ {
	toTimestamp(e) {
		if (!M_(e)) return Q.dr();
		let t = Number(e);
		return Q.newValue({ timestampValue: {
			seconds: t,
			nanos: 0
		} });
	}
}, B_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 1, 1265, `${this.expr.name}() function should have exactly one parameter`);
		let n = $(this.expr.params[0]).evaluate(e, t);
		switch (n.type) {
			case "TIMESTAMP": break;
			case "NULL": return Q.pr();
			default: return Q.dr();
		}
		let r = Wf(n.value.timestampValue);
		return N_(r.seconds, r.nanoseconds) ? this.Mr(r) : Q.dr();
	}
}, V_ = class extends B_ {
	Mr(e) {
		let t = F_(e);
		return j_(t) ? Q.newValue({ integerValue: `${t.toString()}` }) : Q.dr();
	}
}, H_ = class extends B_ {
	Mr(e) {
		let t = F_(e), n = t / BigInt(1e3), r = t % BigInt(1e3);
		return n > BigInt(0) || r === BigInt(0) ? Q.newValue({ integerValue: n.toString() }) : Q.newValue({ integerValue: (n - BigInt(1)).toString() });
	}
}, U_ = class extends B_ {
	Mr(e) {
		let t = BigInt(e.seconds);
		return M_(t) ? Q.newValue({ integerValue: t.toString() }) : Q.dr();
	}
}, W_ = class {
	constructor(e) {
		this.expr = e;
	}
	evaluate(e, t) {
		F(this.expr.params.length === 3, 2775, `${this.expr.name}() function should have exactly 3 parameters`);
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
			return Ac(`Error during timestamp arithmetic: ${e}`), Q.dr();
		}
		let l = Wf(r.value.timestampValue);
		if (!N_(l.seconds, l.nanoseconds)) return Q.dr();
		let u = F_(l), d = this.Lr(u, c);
		if (!j_(d)) return Q.dr();
		let f = Number(d / E_), p = d % E_, m = Number((p < 0 ? p + E_ : p) * BigInt(1e3)), ee = p < 0 ? f - 1 : f;
		return N_(ee, m) ? Q.newValue({ timestampValue: {
			seconds: ee,
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
}, G_ = class extends W_ {
	Lr(e, t) {
		return e + t;
	}
}, K_ = class extends W_ {
	Lr(e, t) {
		return e - t;
	}
};
function q_(e) {
	if ((e = dg(e)) instanceof Dh) return `fld(${e.fieldName})`;
	if (e instanceof Ah) return `cst(${function(e) {
		return e === null ? "null" : typeof e == "number" ? e.toString() : typeof e == "string" ? `"${e}"` : e instanceof Hm ? `ref(${e.path})` : e instanceof Km ? `vec(${JSON.stringify(e)})` : JSON.stringify(e);
	}(e.value)})`;
	if (e instanceof Z) return `fn(${e.name},[${e.params.map(q_).join(",")}])`;
	if (e.expressionType === "ListOfExpressions") return `list([${e.ur.map(q_).join(",")}])`;
	throw Error(`Unrecognized expr ${JSON.stringify(e, null, 2)}`);
}
function J_(e) {
	if (e instanceof Uh) return `${e._name}(${Y_(e.fields)})`;
	if (e instanceof Wh) {
		let t = `${e._name}(${Y_(e.accumulators)})`;
		return e.groups.size > 0 && (t += `grouping(${Y_(e.groups)})`), t;
	}
	if (e instanceof Gh) return `${e._name}(${Y_(e.groups)})`;
	if (e instanceof Kh) return `${e._name}(${e.Er})`;
	if (e instanceof qh) return `${e._name}(${e.collectionId})`;
	if (e instanceof Jh) return `${e._name}()`;
	if (e instanceof Yh) return `${e._name}(${e.hr.sort()})`;
	if (e instanceof Xh) return `${e._name}(${q_(e.condition)})`;
	if (e instanceof Zh) return `${e._name}(${e.limit})`;
	if (e instanceof eg) return `${e._name}(${function(e) {
		return e.map(((e) => `${q_(e.expr)}${e.direction}`)).join(",");
	}(e.orderings)})`;
	throw Error(`Unrecognized stage ${e._name}`);
}
function Y_(e) {
	return `${Array.from(e.entries()).sort().map((([e, t]) => `${e}=${q_(t)}`)).join(",")}`;
}
function X_(e) {
	return e.stages.map(((e) => J_(e))).join("|");
}
function Z_(e, t) {
	return X_(e) === X_(t);
}
function Q_(e) {
	return e instanceof ig;
}
function $_(e) {
	return Q_(e) ? X_(e) : $d(e);
}
function ev(e) {
	return Q_(e) ? X_(e) : function(e) {
		return `${Pd(Jd(e))}|lt:${e.limitType}`;
	}(e);
}
function tv(e, t) {
	return e instanceof ig && t instanceof ig ? Z_(e, t) : !(e instanceof ig && !(t instanceof ig) || !(e instanceof ig) && t instanceof ig) && Qd(e, t);
}
function nv(e) {
	return Id(e) ? X_(e) : Pd(e);
}
function rv(e, t) {
	return e instanceof ig && t instanceof ig ? Z_(e, t) : !(e instanceof ig && !(t instanceof ig) || !(e instanceof ig) && t instanceof ig) && Fd(e, t);
}
function iv(e, t) {
	let n = function(e) {
		let t = !1, n = [];
		for (let r of e) if (r instanceof eg) {
			if (t = !0, r.orderings.some(((e) => e.expr instanceof Dh && e.expr.fieldName === Kc))) n.push(r);
			else {
				let e = r.orderings.map(((e) => e));
				e.push(Oh(Kc).ascending()), n.push(new eg(e, {}));
			}
		} else r instanceof Zh && (t ||= (n.push(new eg([Oh(Kc).ascending()], {})), !0)), n.push(r);
		return t || n.push(new eg([Oh(Kc).ascending()], {})), n;
	}(e.stages);
	if (e.userDataReader) {
		let t = e.userDataReader.createContext(3, "toCorePipeline");
		n.forEach(((e) => e._readUserData(t)));
	}
	return new ig(e.userDataReader.serializer, n, t);
}
var av = class {
	constructor(e, t, n, r) {
		this.batchId = e, this.localWriteTime = t, this.baseMutations = n, this.mutations = r;
	}
	applyToRemoteDocument(e, t) {
		let n = t.mutationResults;
		for (let t = 0; t < this.mutations.length; t++) {
			let r = this.mutations[t];
			r.key.isEqual(e.key) && Hu(r, e, n[t]);
		}
	}
	applyToLocalView(e, t) {
		for (let n of this.baseMutations) n.key.isEqual(e.key) && (t = Uu(n, e, t, this.localWriteTime));
		for (let n of this.mutations) n.key.isEqual(e.key) && (t = Uu(n, e, t, this.localWriteTime));
		return t;
	}
	applyToLocalDocumentSet(e, t) {
		let n = hf();
		return this.mutations.forEach(((r) => {
			let i = e.get(r.key), a = i.overlayedDocument, o = this.applyToLocalView(a, i.mutatedFields);
			o = t.has(r.key) ? null : o;
			let s = Vu(a, o);
			s !== null && n.set(r.key, s), a.isValidDocument() || a.convertToNoDocument(K.min());
		})), n;
	}
	keys() {
		return this.mutations.reduce(((e, t) => e.add(t.key)), J());
	}
	isEqual(e) {
		return this.batchId === e.batchId && zc(this.mutations, e.mutations, ((e, t) => Gu(e, t))) && zc(this.baseMutations, e.baseMutations, ((e, t) => Gu(e, t)));
	}
}, ov = class e {
	constructor(e, t, n, r) {
		this.batch = e, this.commitVersion = t, this.mutationResults = n, this.docVersions = r;
	}
	static from(t, n, r) {
		F(t.mutations.length === r.length, 58842, {
			Br: t.mutations.length,
			Ur: r.length
		});
		let i = function() {
			return _f;
		}(), a = t.mutations;
		for (let e = 0; e < a.length; e++) i = i.insert(a[e].key, r[e].version);
		return new e(t, n, r, i);
	}
}, sv = "";
function cv(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) t.length > 0 && (t = uv(t)), t = lv(e.get(n), t);
	return uv(t);
}
function lv(e, t) {
	let n = t, r = e.length;
	for (let t = 0; t < r; t++) {
		let r = e.charAt(t);
		switch (r) {
			case "\0":
				n += "";
				break;
			case sv:
				n += "";
				break;
			default: n += r;
		}
	}
	return n;
}
function uv(e) {
	return e + "";
}
function dv(e) {
	let t = e.length;
	if (F(t >= 2, 64408, { path: e }), t === 2) return F(e.charAt(0) === sv && e.charAt(1) === "", 56145, { path: e }), V.emptyPath();
	let n = t - 2, r = [], i = "";
	for (let a = 0; a < t;) {
		let t = e.indexOf(sv, a);
		switch ((t < 0 || t > n) && P(50515, { path: e }), e.charAt(t + 1)) {
			case "":
				let n = e.substring(a, t), o;
				i.length === 0 ? o = n : (i += n, o = i, i = ""), r.push(o);
				break;
			case "":
				i += e.substring(a, t), i += "\0";
				break;
			case "":
				i += e.substring(a, t + 1);
				break;
			default: P(61167, { path: e });
		}
		a = t + 2;
	}
	return new V(r);
}
var fv = "remoteDocuments", pv = "owner", mv = "owner", hv = "mutationQueues", gv = "userId", _v = "mutations", vv = "batchId", yv = "userMutationsIndex", bv = ["userId", "batchId"];
function xv(e, t) {
	return [e, cv(t)];
}
function Sv(e, t, n) {
	return [
		e,
		cv(t),
		n
	];
}
var Cv = {}, wv = "documentMutations", Tv = "remoteDocumentsV14", Ev = [
	"prefixPath",
	"collectionGroup",
	"readTime",
	"documentId"
], Dv = "documentKeyIndex", Ov = [
	"prefixPath",
	"collectionGroup",
	"documentId"
], kv = "collectionGroupIndex", Av = [
	"collectionGroup",
	"readTime",
	"prefixPath",
	"documentId"
], jv = "remoteDocumentGlobal", Mv = "remoteDocumentGlobalKey", Nv = "targets", Pv = "queryTargetsIndex", Fv = ["canonicalId", "targetId"], Iv = "targetDocuments", Lv = ["targetId", "path"], Rv = "documentTargetsIndex", zv = ["path", "targetId"], Bv = "targetGlobalKey", Vv = "targetGlobal", Hv = "collectionParents", Uv = ["collectionId", "parent"], Wv = "clientMetadata", Gv = "clientId", Kv = "bundles", qv = "bundleId", Jv = "namedQueries", Yv = "name", Xv = "indexConfiguration", Zv = "indexId", Qv = "collectionGroupIndex", $v = "collectionGroup", ey = "indexState", ty = ["indexId", "uid"], ny = "sequenceNumberIndex", ry = ["uid", "sequenceNumber"], iy = "indexEntries", ay = [
	"indexId",
	"uid",
	"arrayValue",
	"directionalValue",
	"orderedDocumentKey",
	"documentKey"
], oy = "documentKeyIndex", sy = [
	"indexId",
	"uid",
	"orderedDocumentKey"
], cy = "documentOverlays", ly = [
	"userId",
	"collectionPath",
	"documentId"
], uy = "collectionPathOverlayIndex", dy = [
	"userId",
	"collectionPath",
	"largestBatchId"
], fy = "collectionGroupOverlayIndex", py = [
	"userId",
	"collectionGroup",
	"largestBatchId"
], my = "globals", hy = "name", gy = [
	hv,
	_v,
	wv,
	fv,
	Nv,
	pv,
	Vv,
	Iv,
	Wv,
	jv,
	Hv,
	Kv,
	Jv
], _y = [...gy, cy], vy = [
	hv,
	_v,
	wv,
	Tv,
	Nv,
	pv,
	Vv,
	Iv,
	Wv,
	jv,
	Hv,
	Kv,
	Jv,
	cy
], yy = vy, by = [
	...yy,
	Xv,
	ey,
	iy
], xy = by, Sy = [...by, my], Cy = Sy;
function wy(e, t, n) {
	let r = e.store(_v), i = e.store(wv), a = [], o = IDBKeyRange.only(n.batchId), s = 0, c = r.jn({ range: o }, ((e, t, n) => (s++, n.delete())));
	a.push(c.next((() => {
		F(s === 1, 47070, { batchId: n.batchId });
	})));
	let l = [];
	for (let e of n.mutations) {
		let r = Sv(t, e.key.path, n.batchId);
		a.push(i.delete(r)), l.push(e.key);
	}
	return Y.waitFor(a).next((() => l));
}
function Ty(e) {
	if (!e) return 0;
	let t;
	if (e.document) t = e.document;
	else if (e.unknownDocument) t = e.unknownDocument;
	else {
		if (!e.noDocument) throw P(14731);
		t = e.noDocument;
	}
	return JSON.stringify(t).length;
}
var Ey = class extends _m {
	constructor(e, t) {
		super(), this.kr = e, this.currentSequenceNumber = t;
	}
};
function Dy(e, t) {
	let n = I(e);
	return xm.xn(n.kr, t);
}
var Oy = class {
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
}, ky = class e {
	constructor(e, t, n, r, i = K.min(), a = K.min(), o = ml.EMPTY_BYTE_STRING, s = null) {
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
}, Ay = class {
	constructor(e) {
		this.qr = e;
	}
};
function jy(e, t) {
	let n;
	if (t.document) n = ip(e.qr, t.document, !!t.hasCommittedMutations);
	else if (t.noDocument) {
		let e = H.fromSegments(t.noDocument.path), r = Fy(t.noDocument.readTime);
		n = xd.newNoDocument(e, r), t.hasCommittedMutations && n.setHasCommittedMutations();
	} else {
		if (!t.unknownDocument) return P(56709);
		{
			let e = H.fromSegments(t.unknownDocument.path), r = Fy(t.unknownDocument.version);
			n = xd.newUnknownDocument(e, r);
		}
	}
	return t.readTime && n.setReadTime(function(e) {
		let t = new fl(e[0], e[1]);
		return K.fromTimestamp(t);
	}(t.readTime)), n;
}
function My(e, t) {
	let n = t.key, r = {
		prefixPath: n.getCollectionPath().popLast().toArray(),
		collectionGroup: n.collectionGroup,
		documentId: n.path.lastSegment(),
		readTime: Ny(t.readTime),
		hasCommittedMutations: t.hasCommittedMutations
	};
	if (t.isFoundDocument()) r.document = function(e, t) {
		return {
			name: Zf(e, t.key),
			fields: t.data.value.mapValue.fields,
			updateTime: Uf(e, t.version.toTimestamp()),
			createTime: Uf(e, t.createTime.toTimestamp())
		};
	}(e.qr, t);
	else if (t.isNoDocument()) r.noDocument = {
		path: n.path.toArray(),
		readTime: Py(t.version)
	};
	else {
		if (!t.isUnknownDocument()) return P(57904, { document: t });
		r.unknownDocument = {
			path: n.path.toArray(),
			version: Py(t.version)
		};
	}
	return r;
}
function Ny(e) {
	let t = e.toTimestamp();
	return [t.seconds, t.nanoseconds];
}
function Py(e) {
	let t = e.toTimestamp();
	return {
		seconds: t.seconds,
		nanoseconds: t.nanoseconds
	};
}
function Fy(e) {
	let t = new fl(e.seconds, e.nanoseconds);
	return K.fromTimestamp(t);
}
function Iy(e, t) {
	let n = (t.baseMutations || []).map(((t) => sp(e.qr, t)));
	for (let e = 0; e < t.mutations.length - 1; ++e) {
		let n = t.mutations[e];
		e + 1 < t.mutations.length && t.mutations[e + 1].transform !== void 0 && (n.updateTransforms = t.mutations[e + 1].transform.fieldTransforms, t.mutations.splice(e + 1, 1), ++e);
	}
	let r = t.mutations.map(((t) => sp(e.qr, t))), i = fl.fromMillis(t.localWriteTimeMs);
	return new av(t.batchId, i, n, r);
}
function Ly(e, t) {
	let n = Fy(t.readTime), r = t.lastLimboFreeSnapshotVersion === void 0 ? K.min() : Fy(t.lastLimboFreeSnapshotVersion), i;
	return i = function(e) {
		return e.structuredPipeline !== void 0;
	}(t.query) ? function(e, t) {
		let n = e.structuredPipeline;
		F((n?.pipeline?.stages ?? []).length > 0, 1845);
		let r = n?.pipeline?.stages.map(Uy);
		return new ig(t, r);
	}(t.query, e.qr) : function(e) {
		return e.documents !== void 0;
	}(t.query) ? function(e) {
		let t = e.documents.length;
		return F(t === 1, 1966, { count: t }), Jd(Ud(ep(e.documents[0])));
	}(t.query) : function(e) {
		return Jd(dp(e));
	}(t.query), new ky(i, t.targetId, "TargetPurposeListen", t.lastListenSequenceNumber, n, r, ml.fromBase64String(t.resumeToken));
}
function Ry(e, t) {
	let n = Py(t.snapshotVersion), r = Py(t.lastLimboFreeSnapshotVersion), i;
	i = Id(t.target) ? pp(e.qr, t.target) : Ld(t.target) ? lp(e.qr, t.target) : up(e.qr, t.target).be;
	let a = t.resumeToken.toBase64();
	return {
		targetId: t.targetId,
		canonicalId: nv(t.target),
		readTime: n,
		resumeToken: a,
		lastListenSequenceNumber: t.sequenceNumber,
		lastLimboFreeSnapshotVersion: r,
		query: i
	};
}
function zy(e) {
	let t = dp({
		parent: e.parent,
		structuredQuery: e.structuredQuery
	});
	return e.limitType === "LAST" ? Zd(t, t.limit, "L") : t;
}
function By(e, t) {
	return new Oy(t.largestBatchId, sp(e.qr, t.overlayMutation));
}
function Vy(e, t) {
	let n = t.path.lastSegment();
	return [
		e,
		cv(t.path.popLast()),
		n
	];
}
function Hy(e, t, n, r) {
	return {
		indexId: e,
		uid: t,
		sequenceNumber: n,
		readTime: Py(r.readTime),
		documentKey: cv(r.documentKey.path),
		largestBatchId: r.largestBatchId
	};
}
function Uy(e) {
	switch (e.name) {
		case "collection": return new Kh(e.args[0].referenceValue, {});
		case "collection_group": return new qh(e.args[1].stringValue, {});
		case "database": return new Jh({});
		case "documents": return new Yh(e.args.map(((e) => e.referenceValue)), {});
		case "where": return new Xh(Wy(e.args[0]), {});
		case "limit": {
			let t = e.args[0].integerValue ?? e.args[0].doubleValue;
			return new Zh(typeof t == "number" ? t : Number(t), {});
		}
		case "sort": return new eg(e.args.map(((e) => function(e) {
			let t = e.mapValue?.fields;
			return new Vh(Wy(t.expression), t.direction?.stringValue, "orderingFromProto");
		}(e))), {});
		default: throw Error(`Stage type: ${e.name} not supported.`);
	}
}
function Wy(e) {
	return e.fieldReferenceValue ? new Dh(uh("_exprFromProto", e.fieldReferenceValue), "_exprFromProto") : e.functionValue ? function(e) {
		return new Z(e.functionValue.name, e.functionValue.args?.map(Wy) || []);
	}(e) : Ah._fromProto(e);
}
var Gy = class e {
	constructor(e, t, n, r) {
		this.userId = e, this.serializer = t, this.indexManager = n, this.referenceDelegate = r, this.$r = {};
	}
	static Kr(t, n, r, i) {
		F(t.uid !== "", 64387);
		let a = t.isAuthenticated() ? t.uid : "";
		return new e(a, n, r, i);
	}
	checkEmpty(e) {
		let t = !0, n = IDBKeyRange.bound([this.userId, -Infinity], [this.userId, Infinity]);
		return qy(e).jn({
			index: yv,
			range: n
		}, ((e, n, r) => {
			t = !1, r.done();
		})).next((() => t));
	}
	addMutationBatch(e, t, n, r) {
		let i = Jy(e), a = qy(e);
		return a.add({}).next(((o) => {
			F(typeof o == "number", 49019);
			let s = new av(o, t, n, r), c = function(e, t, n) {
				let r = n.baseMutations.map(((t) => op(e.qr, t))), i = n.mutations.map(((t) => op(e.qr, t)));
				return {
					userId: t,
					batchId: n.batchId,
					localWriteTimeMs: n.localWriteTime.toMillis(),
					baseMutations: r,
					mutations: i
				};
			}(this.serializer, this.userId, s), l = [], u = new R(((e, t) => L(e.canonicalString(), t.canonicalString())));
			for (let e of r) {
				let t = Sv(this.userId, e.key.path, o);
				u = u.add(e.key.path.popLast()), l.push(a.put(c)), l.push(i.put(t, Cv));
			}
			return u.forEach(((t) => {
				l.push(this.indexManager.addToCollectionParentIndex(e, t));
			})), e.addOnCommittedListener((() => {
				this.$r[o] = s.keys();
			})), Y.waitFor(l).next((() => s));
		}));
	}
	lookupMutationBatch(e, t) {
		return qy(e).get(t).next(((e) => e ? (F(e.userId === this.userId, 48, "Unexpected user for mutation batch", {
			userId: e.userId,
			batchId: t
		}), Iy(this.serializer, e)) : null));
	}
	Qr(e, t) {
		return this.$r[t] ? Y.resolve(this.$r[t]) : this.lookupMutationBatch(e, t).next(((e) => {
			if (e) {
				let n = e.keys();
				return this.$r[t] = n, n;
			}
			return null;
		}));
	}
	getNextMutationBatchAfterBatchId(e, t) {
		let n = t + 1, r = IDBKeyRange.lowerBound([this.userId, n]), i = null;
		return qy(e).jn({
			index: yv,
			range: r
		}, ((e, t, r) => {
			t.userId === this.userId && (F(t.batchId >= n, 47524, { Wr: n }), i = Iy(this.serializer, t)), r.done();
		})).next((() => i));
	}
	getHighestUnacknowledgedBatchId(e) {
		let t = IDBKeyRange.upperBound([this.userId, Infinity]), n = kl;
		return qy(e).jn({
			index: yv,
			range: t,
			reverse: !0
		}, ((e, t, r) => {
			n = t.batchId, r.done();
		})).next((() => n));
	}
	getAllMutationBatches(e) {
		let t = IDBKeyRange.bound([this.userId, kl], [this.userId, Infinity]);
		return qy(e).Kn(yv, t).next(((e) => e.map(((e) => Iy(this.serializer, e)))));
	}
	getAllMutationBatchesAffectingDocumentKey(e, t) {
		let n = xv(this.userId, t.path), r = IDBKeyRange.lowerBound(n), i = [];
		return Jy(e).jn({ range: r }, ((n, r, a) => {
			let [o, s, c] = n, l = dv(s);
			if (o === this.userId && t.path.isEqual(l)) return qy(e).get(c).next(((e) => {
				if (!e) throw P(61480, {
					Gr: n,
					batchId: c
				});
				F(e.userId === this.userId, 10503, "Unexpected user for mutation batch", {
					userId: e.userId,
					batchId: c
				}), i.push(Iy(this.serializer, e));
			}));
			a.done();
		})).next((() => i));
	}
	getAllMutationBatchesAffectingDocumentKeys(e, t) {
		let n = new R(L), r = [];
		return t.forEach(((t) => {
			let i = xv(this.userId, t.path), a = IDBKeyRange.lowerBound(i), o = Jy(e).jn({ range: a }, ((e, r, i) => {
				let [a, o, s] = e, c = dv(o);
				a === this.userId && t.path.isEqual(c) ? n = n.add(s) : i.done();
			}));
			r.push(o);
		})), Y.waitFor(r).next((() => this.zr(e, n)));
	}
	getAllMutationBatchesAffectingQuery(e, t) {
		let n = t.path, r = n.length + 1, i = xv(this.userId, n), a = IDBKeyRange.lowerBound(i), o = new R(L);
		return Jy(e).jn({ range: a }, ((e, t, i) => {
			let [a, s, c] = e, l = dv(s);
			a === this.userId && n.isPrefixOf(l) ? l.length === r && (o = o.add(c)) : i.done();
		})).next((() => this.zr(e, o)));
	}
	zr(e, t) {
		let n = [], r = [];
		return t.forEach(((t) => {
			r.push(qy(e).get(t).next(((e) => {
				if (e === null) throw P(35274, { batchId: t });
				F(e.userId === this.userId, 9748, "Unexpected user for mutation batch", {
					userId: e.userId,
					batchId: t
				}), n.push(Iy(this.serializer, e));
			})));
		})), Y.waitFor(r).next((() => n));
	}
	removeMutationBatch(e, t) {
		return wy(e.kr, this.userId, t).next(((n) => (e.addOnCommittedListener((() => {
			this.jr(t.batchId);
		})), Y.forEach(n, ((t) => this.referenceDelegate.markPotentiallyOrphaned(e, t))))));
	}
	jr(e) {
		delete this.$r[e];
	}
	performConsistencyCheck(e) {
		return this.checkEmpty(e).next(((t) => {
			if (!t) return Y.resolve();
			let n = IDBKeyRange.lowerBound(function(e) {
				return [e];
			}(this.userId)), r = [];
			return Jy(e).jn({ range: n }, ((e, t, n) => {
				if (e[0] === this.userId) {
					let t = dv(e[1]);
					r.push(t);
				} else n.done();
			})).next((() => {
				F(r.length === 0, 56720, { Hr: r.map(((e) => e.canonicalString())) });
			}));
		}));
	}
	containsKey(e, t) {
		return Ky(e, this.userId, t);
	}
	Jr(e) {
		return Yy(e).get(this.userId).next(((e) => e || {
			userId: this.userId,
			lastAcknowledgedBatchId: kl,
			lastStreamToken: ""
		}));
	}
};
function Ky(e, t, n) {
	let r = xv(t, n.path), i = r[1], a = IDBKeyRange.lowerBound(r), o = !1;
	return Jy(e).jn({
		range: a,
		zn: !0
	}, ((e, n, r) => {
		let [a, s, c] = e;
		a === t && s === i && (o = !0), r.done();
	})).next((() => o));
}
function qy(e) {
	return Dy(e, _v);
}
function Jy(e) {
	return Dy(e, wv);
}
function Yy(e) {
	return Dy(e, hv);
}
var Xy = class {
	getBundleMetadata(e, t) {
		return Zy(e).get(t).next(((e) => {
			if (e) return function(e) {
				return {
					id: e.bundleId,
					createTime: Fy(e.createTime),
					version: e.version
				};
			}(e);
		}));
	}
	saveBundleMetadata(e, t) {
		return Zy(e).put(function(e) {
			return {
				bundleId: e.id,
				createTime: Py(qf(e.createTime)),
				version: e.version
			};
		}(t));
	}
	getNamedQuery(e, t) {
		return Qy(e).get(t).next(((e) => {
			if (e) return function(e) {
				return {
					name: e.name,
					query: zy(e.bundledQuery),
					readTime: Fy(e.readTime)
				};
			}(e);
		}));
	}
	saveNamedQuery(e, t) {
		return Qy(e).put(function(e) {
			return {
				name: e.name,
				readTime: Py(qf(e.readTime)),
				bundledQuery: e.bundledQuery
			};
		}(t));
	}
};
function Zy(e) {
	return Dy(e, Kv);
}
function Qy(e) {
	return Dy(e, Jv);
}
var $y = class e {
	constructor(e, t) {
		this.serializer = e, this.userId = t;
	}
	static Kr(t, n) {
		let r = n.uid || "";
		return new e(t, r);
	}
	getOverlay(e, t) {
		return eb(e).get(Vy(this.userId, t)).next(((e) => e ? By(this.serializer, e) : null));
	}
	getOverlays(e, t) {
		let n = mf();
		return Y.forEach(t, ((t) => this.getOverlay(e, t).next(((e) => {
			e !== null && n.set(t, e);
		})))).next((() => n));
	}
	getAllOverlays(e, t) {
		let n = mf();
		return eb(e).jn(((e, r) => {
			let i = By(this.serializer, r);
			i.largestBatchId > t && n.set(i.getKey(), i);
		})).next((() => n));
	}
	saveOverlays(e, t, n) {
		let r = [];
		return n.forEach(((n, i) => {
			let a = new Oy(t, i);
			r.push(this.Yr(e, a));
		})), Y.waitFor(r);
	}
	removeOverlaysForBatchId(e, t, n) {
		let r = /* @__PURE__ */ new Set();
		t.forEach(((e) => r.add(cv(e.getCollectionPath()))));
		let i = [];
		return r.forEach(((t) => {
			let r = IDBKeyRange.bound([
				this.userId,
				t,
				n
			], [
				this.userId,
				t,
				n + 1
			], !1, !0);
			i.push(eb(e).Gn(uy, r));
		})), Y.waitFor(i);
	}
	getOverlaysForCollection(e, t, n) {
		let r = mf(), i = cv(t), a = IDBKeyRange.bound([
			this.userId,
			i,
			n
		], [
			this.userId,
			i,
			Infinity
		], !0);
		return eb(e).Kn(uy, a).next(((e) => {
			for (let t of e) {
				let e = By(this.serializer, t);
				r.set(e.getKey(), e);
			}
			return r;
		}));
	}
	getOverlaysForCollectionGroup(e, t, n, r) {
		let i = mf(), a, o = IDBKeyRange.bound([
			this.userId,
			t,
			n
		], [
			this.userId,
			t,
			Infinity
		], !0);
		return eb(e).jn({
			index: fy,
			range: o
		}, ((e, t, n) => {
			let o = By(this.serializer, t);
			i.size() < r || o.largestBatchId === a ? (i.set(o.getKey(), o), a = o.largestBatchId) : n.done();
		})).next((() => i));
	}
	Yr(e, t) {
		return eb(e).put(function(e, t, n) {
			let [r, i, a] = Vy(t, n.mutation.key);
			return {
				userId: t,
				collectionPath: i,
				documentId: a,
				collectionGroup: n.mutation.key.getCollectionGroup(),
				largestBatchId: n.largestBatchId,
				overlayMutation: op(e.qr, n.mutation)
			};
		}(this.serializer, this.userId, t));
	}
};
function eb(e) {
	return Dy(e, cy);
}
var tb = class {
	Zr(e) {
		return Dy(e, my);
	}
	getSessionToken(e) {
		return this.Zr(e).get("sessionToken").next(((e) => {
			let t = e?.value;
			return t ? ml.fromUint8Array(t) : ml.EMPTY_BYTE_STRING;
		}));
	}
	setSessionToken(e, t) {
		return this.Zr(e).put({
			name: "sessionToken",
			value: t.toUint8Array()
		});
	}
}, nb = class {
	constructor() {}
	Xr(e, t) {
		this.ei(e, t), t.ti();
	}
	ei(e, t) {
		if ("nullValue" in e) this.ni(t, 5);
		else if ("booleanValue" in e) this.ni(t, 10), t.ri(+!!e.booleanValue);
		else if ("integerValue" in e) this.ni(t, 15), t.ri(U(e.integerValue));
		else if ("doubleValue" in e) {
			let n = U(e.doubleValue);
			isNaN(n) ? this.ni(t, 13) : (this.ni(t, 15), jl(n) ? t.ri(0) : t.ri(n));
		} else if ("timestampValue" in e) {
			let n = e.timestampValue;
			this.ni(t, 20), typeof n == "string" && (n = gl(n)), t.ii(`${n.seconds || ""}`), t.ri(n.nanos || 0);
		} else if ("stringValue" in e) this.si(e.stringValue, t), this._i(t);
		else if ("bytesValue" in e) this.ni(t, 30), t.oi(_l(e.bytesValue)), this._i(t);
		else if ("referenceValue" in e) this.ai(e.referenceValue, t);
		else if ("geoPointValue" in e) {
			let n = e.geoPointValue;
			this.ni(t, 45), t.ri(n.latitude || 0), t.ri(n.longitude || 0);
		} else "mapValue" in e ? cu(e) ? this.ni(t, 2 ** 53 - 1) : au(e) ? this.ui(e.mapValue, t) : (this.ci(e.mapValue, t), this._i(t)) : "arrayValue" in e ? (this.li(e.arrayValue, t), this._i(t)) : P(19022, { Ei: e });
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
		let r = Rl, i = n[r].arrayValue?.values?.length || 0;
		this.ni(t, 15), t.ri(U(i)), this.si(r, t), this.ei(n[r], t);
	}
	li(e, t) {
		let n = e.values || [];
		this.ni(t, 50);
		for (let e of n) this.ei(e, t);
	}
	ai(e, t) {
		this.ni(t, 37), H.fromName(e).path.forEach(((e) => {
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
nb.Ti = new nb();
var rb = 255;
function ib(e) {
	if (e === 0) return 8;
	let t = 0;
	return e >> 4 || (t += 4, e <<= 4), e >> 6 || (t += 2, e <<= 2), e >> 7 || (t += 1), t;
}
function ab(e) {
	let t = 64 - function(e) {
		let t = 0;
		for (let n = 0; n < 8; ++n) {
			let r = ib(255 & e[n]);
			if (t += r, r !== 8) break;
		}
		return t;
	}(e);
	return Math.ceil(t / 8);
}
var ob = class {
	constructor() {
		this.buffer = /* @__PURE__ */ new Uint8Array(1024), this.position = 0;
	}
	Pi(e) {
		let t = e[Symbol.iterator](), n = t.next();
		for (; !n.done;) this.Ri(n.value), n = t.next();
		this.Ii();
	}
	Ai(e) {
		let t = e[Symbol.iterator](), n = t.next();
		for (; !n.done;) this.Vi(n.value), n = t.next();
		this.di();
	}
	fi(e) {
		for (let t of e) {
			let e = t.charCodeAt(0);
			if (e < 128) this.Ri(e);
			else if (e < 2048) this.Ri(960 | e >>> 6), this.Ri(128 | 63 & e);
			else if (t < "\ud800" || "\udbff" < t) this.Ri(480 | e >>> 12), this.Ri(128 | 63 & e >>> 6), this.Ri(128 | 63 & e);
			else {
				let e = t.codePointAt(0);
				this.Ri(240 | e >>> 18), this.Ri(128 | 63 & e >>> 12), this.Ri(128 | 63 & e >>> 6), this.Ri(128 | 63 & e);
			}
		}
		this.Ii();
	}
	mi(e) {
		for (let t of e) {
			let e = t.charCodeAt(0);
			if (e < 128) this.Vi(e);
			else if (e < 2048) this.Vi(960 | e >>> 6), this.Vi(128 | 63 & e);
			else if (t < "\ud800" || "\udbff" < t) this.Vi(480 | e >>> 12), this.Vi(128 | 63 & e >>> 6), this.Vi(128 | 63 & e);
			else {
				let e = t.codePointAt(0);
				this.Vi(240 | e >>> 18), this.Vi(128 | 63 & e >>> 12), this.Vi(128 | 63 & e >>> 6), this.Vi(128 | 63 & e);
			}
		}
		this.di();
	}
	pi(e) {
		let t = this.gi(e), n = ab(t);
		this.yi(1 + n), this.buffer[this.position++] = 255 & n;
		for (let e = t.length - n; e < t.length; ++e) this.buffer[this.position++] = 255 & t[e];
	}
	wi(e) {
		let t = this.gi(e), n = ab(t);
		this.yi(1 + n), this.buffer[this.position++] = ~(255 & n);
		for (let e = t.length - n; e < t.length; ++e) this.buffer[this.position++] = ~(255 & t[e]);
	}
	bi() {
		this.Si(rb), this.Si(255);
	}
	Di() {
		this.xi(rb), this.xi(255);
	}
	reset() {
		this.position = 0;
	}
	seed(e) {
		this.yi(e.length), this.buffer.set(e, this.position), this.position += e.length;
	}
	Ci() {
		return this.buffer.slice(0, this.position);
	}
	gi(e) {
		let t = function(e) {
			let t = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
			return t.setFloat64(0, e, !1), new Uint8Array(t.buffer);
		}(e), n = !!(128 & t[0]);
		t[0] ^= n ? 255 : 128;
		for (let e = 1; e < t.length; ++e) t[e] ^= n ? 255 : 0;
		return t;
	}
	Ri(e) {
		let t = 255 & e;
		t === 0 ? (this.Si(0), this.Si(255)) : t === rb ? (this.Si(rb), this.Si(0)) : this.Si(t);
	}
	Vi(e) {
		let t = 255 & e;
		t === 0 ? (this.xi(0), this.xi(255)) : t === rb ? (this.xi(rb), this.xi(0)) : this.xi(e);
	}
	Ii() {
		this.Si(0), this.Si(1);
	}
	di() {
		this.xi(0), this.xi(1);
	}
	Si(e) {
		this.yi(1), this.buffer[this.position++] = e;
	}
	xi(e) {
		this.yi(1), this.buffer[this.position++] = ~e;
	}
	yi(e) {
		let t = e + this.position;
		if (t <= this.buffer.length) return;
		let n = 2 * this.buffer.length;
		n < t && (n = t);
		let r = new Uint8Array(n);
		r.set(this.buffer), this.buffer = r;
	}
}, sb = class {
	constructor(e) {
		this.Fi = e;
	}
	oi(e) {
		this.Fi.Pi(e);
	}
	ii(e) {
		this.Fi.fi(e);
	}
	ri(e) {
		this.Fi.pi(e);
	}
	ti() {
		this.Fi.bi();
	}
}, cb = class {
	constructor(e) {
		this.Fi = e;
	}
	oi(e) {
		this.Fi.Ai(e);
	}
	ii(e) {
		this.Fi.mi(e);
	}
	ri(e) {
		this.Fi.wi(e);
	}
	ti() {
		this.Fi.Di();
	}
}, lb = class {
	constructor() {
		this.Fi = new ob(), this.ascending = new sb(this.Fi), this.descending = new cb(this.Fi);
	}
	seed(e) {
		this.Fi.seed(e);
	}
	Oi(e) {
		return e === 0 ? this.ascending : this.descending;
	}
	Ci() {
		return this.Fi.Ci();
	}
	reset() {
		this.Fi.reset();
	}
}, ub = class e {
	constructor(e, t, n, r) {
		this.Mi = e, this.Ni = t, this.Li = n, this.Bi = r;
	}
	Ui() {
		let t = this.Bi.length, n = t === 0 || this.Bi[t - 1] === 255 ? t + 1 : t, r = new Uint8Array(n);
		return r.set(this.Bi, 0), n === t ? ++r[r.length - 1] : r.set([0], this.Bi.length), new e(this.Mi, this.Ni, this.Li, r);
	}
	ki(e, t, n) {
		return {
			indexId: this.Mi,
			uid: e,
			arrayValue: pb(this.Li),
			directionalValue: pb(this.Bi),
			orderedDocumentKey: pb(t),
			documentKey: n.path.toArray()
		};
	}
	qi(e, t, n) {
		let r = this.ki(e, t, n);
		return [
			r.indexId,
			r.uid,
			r.arrayValue,
			r.directionalValue,
			r.orderedDocumentKey,
			r.documentKey
		];
	}
};
function db(e, t) {
	let n = e.Mi - t.Mi;
	return n === 0 ? (n = fb(e.Li, t.Li), n === 0 ? (n = fb(e.Bi, t.Bi), n === 0 ? H.comparator(e.Ni, t.Ni) : n) : n) : n;
}
function fb(e, t) {
	for (let n = 0; n < e.length && n < t.length; ++n) {
		let r = e[n] - t[n];
		if (r !== 0) return r;
	}
	return e.length - t.length;
}
function pb(e) {
	return le() ? function(e) {
		let t = "";
		for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
		return t;
	}(e) : e;
}
function mb(e) {
	return typeof e == "string" ? function(e) {
		let t = new Uint8Array(e.length);
		for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
		return t;
	}(e) : e;
}
var hb = class {
	constructor(e) {
		this.$i = new R(((e, t) => Yc.comparator(e.field, t.field))), this.collectionId = e.collectionGroup == null ? e.path.lastSegment() : e.collectionGroup, this.Ki = e.orderBy, this.Qi = [];
		for (let t of e.filters) {
			let e = t;
			e.isInequality() ? this.$i = this.$i.add(e) : this.Qi.push(e);
		}
	}
	get Wi() {
		return this.$i.size > 1;
	}
	Gi(e) {
		if (F(e.collectionGroup === this.collectionId, 49279), this.Wi) return !1;
		let t = wd(e);
		if (t !== void 0 && !this.zi(t)) return !1;
		let n = Td(e), r = /* @__PURE__ */ new Set(), i = 0, a = 0;
		for (; i < n.length && this.zi(n[i]); ++i) r = r.add(n[i].fieldPath.canonicalString());
		if (i === n.length) return !0;
		if (this.$i.size > 0) {
			let e = this.$i.getIterator().getNext();
			if (!r.has(e.field.canonicalString())) {
				let t = n[i];
				if (!this.ji(e, t) || !this.Hi(this.Ki[a++], t)) return !1;
			}
			++i;
		}
		for (; i < n.length; ++i) {
			let e = n[i];
			if (a >= this.Ki.length || !this.Hi(this.Ki[a++], e)) return !1;
		}
		return !0;
	}
	Ji() {
		if (this.Wi) return null;
		let e = new R(Yc.comparator), t = [];
		for (let n of this.Qi) if (!n.field.isKeyField()) {
			if (n.op === "array-contains" || n.op === "array-contains-any") t.push(new Ed(n.field, 2));
			else {
				if (e.has(n.field)) continue;
				e = e.add(n.field), t.push(new Ed(n.field, 0));
			}
		}
		for (let n of this.Ki) n.field.isKeyField() || e.has(n.field) || (e = e.add(n.field), t.push(new Ed(n.field, n.dir === "asc" ? 0 : 1)));
		return new Cd(Cd.UNKNOWN_ID, this.collectionId, t, Dd.empty());
	}
	zi(e) {
		for (let t of this.Qi) if (this.ji(t, e)) return !0;
		return !1;
	}
	ji(e, t) {
		if (e === void 0 || !e.field.isEqual(t.fieldPath)) return !1;
		let n = e.op === "array-contains" || e.op === "array-contains-any";
		return t.kind === 2 === n;
	}
	Hi(e, t) {
		return !!e.field.isEqual(t.fieldPath) && (t.kind === 0 && e.dir === "asc" || t.kind === 1 && e.dir === "desc");
	}
};
function gb(e) {
	if (F(e instanceof W || e instanceof G, 20012), e instanceof W) {
		if (e instanceof gd) {
			let t = e.value.arrayValue?.values?.map(((t) => W.create(e.field, "==", t))) || [];
			return G.create(t, "or");
		}
		return e;
	}
	let t = e.filters.map(((e) => gb(e)));
	return G.create(t, e.op);
}
function _b(e) {
	if (e.getFilters().length === 0) return [];
	let t = xb(gb(e));
	return F(bb(t), 7391), vb(t) || yb(t) ? [t] : t.getFilters();
}
function vb(e) {
	return e instanceof W;
}
function yb(e) {
	return e instanceof G && ad(e);
}
function bb(e) {
	return vb(e) || yb(e) || function(e) {
		if (e instanceof G && id(e)) {
			for (let t of e.getFilters()) if (!vb(t) && !yb(t)) return !1;
			return !0;
		}
		return !1;
	}(e);
}
function xb(e) {
	if (F(e instanceof W || e instanceof G, 34018), e instanceof W) return e;
	if (e.filters.length === 1) return xb(e.filters[0]);
	let t = e.filters.map(((e) => xb(e))), n = G.create(t, e.op);
	return n = wb(n), bb(n) ? n : (F(n instanceof G, 64498), F(rd(n), 40251), F(n.filters.length > 1, 57927), n.filters.reduce(((e, t) => Sb(e, t))));
}
function Sb(e, t) {
	let n;
	return F(e instanceof W || e instanceof G, 38388), F(t instanceof W || t instanceof G, 25473), n = e instanceof W ? t instanceof W ? function(e, t) {
		return G.create([e, t], "and");
	}(e, t) : Cb(e, t) : t instanceof W ? Cb(t, e) : function(e, t) {
		if (F(e.filters.length > 0 && t.filters.length > 0, 48005), rd(e) && rd(t)) return ld(e, t.getFilters());
		let n = id(e) ? e : t, r = id(e) ? t : e, i = n.filters.map(((e) => Sb(e, r)));
		return G.create(i, "or");
	}(e, t), wb(n);
}
function Cb(e, t) {
	if (rd(t)) return ld(t, e.getFilters());
	{
		let n = t.filters.map(((t) => Sb(e, t)));
		return G.create(n, "or");
	}
}
function wb(e) {
	if (F(e instanceof W || e instanceof G, 11850), e instanceof W) return e;
	let t = e.getFilters();
	if (t.length === 1) return wb(t[0]);
	if (od(e)) return e;
	let n = t.map(((e) => wb(e))), r = [];
	return n.forEach(((t) => {
		t instanceof W ? r.push(t) : t instanceof G && (t.op === e.op ? r.push(...t.filters) : r.push(t));
	})), r.length === 1 ? r[0] : G.create(r, e.op);
}
var Tb = class {
	constructor() {
		this.Yi = new Eb();
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
		return Y.resolve(Ad.min());
	}
	getMinOffsetFromCollectionGroup(e, t) {
		return Y.resolve(Ad.min());
	}
	updateCollectionGroup(e, t, n) {
		return Y.resolve();
	}
	updateIndexEntries(e, t) {
		return Y.resolve();
	}
}, Eb = class {
	constructor() {
		this.index = {};
	}
	add(e) {
		let t = e.lastSegment(), n = e.popLast(), r = this.index[t] || new R(V.comparator), i = !r.has(n);
		return this.index[t] = r.add(n), i;
	}
	has(e) {
		let t = e.lastSegment(), n = e.popLast(), r = this.index[t];
		return r && r.has(n);
	}
	getEntries(e) {
		return (this.index[e] || new R(V.comparator)).toArray();
	}
}, Db = "IndexedDbIndexManager", Ob = /* @__PURE__ */ new Uint8Array(), kb = class {
	constructor(e, t) {
		this.databaseId = t, this.Zi = new Eb(), this.Xi = new cf(((e) => Pd(e)), ((e, t) => Fd(e, t))), this.uid = e.uid || "";
	}
	addToCollectionParentIndex(e, t) {
		if (!this.Zi.has(t)) {
			let n = t.lastSegment(), r = t.popLast();
			e.addOnCommittedListener((() => {
				this.Zi.add(t);
			}));
			let i = {
				collectionId: n,
				parent: cv(r)
			};
			return Ab(e).put(i);
		}
		return Y.resolve();
	}
	getCollectionParents(e, t) {
		let n = [], r = IDBKeyRange.bound([t, ""], [Bc(t), ""], !1, !0);
		return Ab(e).Kn(r).next(((e) => {
			for (let r of e) {
				if (r.collectionId !== t) break;
				n.push(dv(r.parent));
			}
			return n;
		}));
	}
	addFieldIndex(e, t) {
		let n = Mb(e), r = function(e) {
			return {
				indexId: e.indexId,
				collectionGroup: e.collectionGroup,
				fields: e.fields.map(((e) => [e.fieldPath.canonicalString(), e.kind]))
			};
		}(t);
		delete r.indexId;
		let i = n.add(r);
		if (t.indexState) {
			let n = Nb(e);
			return i.next(((e) => {
				n.put(Hy(e, this.uid, t.indexState.sequenceNumber, t.indexState.offset));
			}));
		}
		return i.next();
	}
	deleteFieldIndex(e, t) {
		let n = Mb(e), r = Nb(e), i = jb(e);
		return n.delete(t.indexId).next((() => r.delete(IDBKeyRange.bound([t.indexId], [t.indexId + 1], !1, !0)))).next((() => i.delete(IDBKeyRange.bound([t.indexId], [t.indexId + 1], !1, !0))));
	}
	deleteAllFieldIndexes(e) {
		let t = Mb(e), n = jb(e), r = Nb(e);
		return t.Gn().next((() => n.Gn())).next((() => r.Gn()));
	}
	createTargetIndexes(e, t) {
		return Y.forEach(this.es(t), ((t) => this.getIndexType(e, t).next(((n) => {
			if (n === 0 || n === 1) {
				let n = new hb(t).Ji();
				if (n != null) return this.addFieldIndex(e, n);
			}
		}))));
	}
	getDocumentsMatchingTarget(e, t) {
		let n = jb(e), r = !0, i = /* @__PURE__ */ new Map();
		return Y.forEach(this.es(t), ((t) => this.ts(e, t).next(((e) => {
			r &&= !!e, i.set(t, e);
		})))).next((() => {
			if (r) {
				let e = J(), r = [];
				return Y.forEach(i, ((i, a) => {
					N(Db, `Using index ${function(e) {
						return `id=${e.indexId}|cg=${e.collectionGroup}|f=${e.fields.map(((e) => `${e.fieldPath}:${e.kind}`)).join(",")}`;
					}(i)} to execute ${Pd(t)}`);
					let o = function(e, t) {
						let n = wd(t);
						if (n === void 0) return null;
						for (let t of Rd(e, n.fieldPath)) switch (t.op) {
							case "array-contains-any": return t.value.arrayValue.values || [];
							case "array-contains": return [t.value];
						}
						return null;
					}(a, i), s = function(e, t) {
						let n = /* @__PURE__ */ new Map();
						for (let r of Td(t)) for (let t of Rd(e, r.fieldPath)) switch (t.op) {
							case "==":
							case "in":
								n.set(r.fieldPath.canonicalString(), t.value);
								break;
							case "not-in":
							case "!=": return n.set(r.fieldPath.canonicalString(), t.value), Array.from(n.values());
						}
						return null;
					}(a, i), c = function(e, t) {
						let n = [], r = !0;
						for (let i of Td(t)) {
							let t = i.kind === 0 ? zd(e, i.fieldPath, e.startAt) : Bd(e, i.fieldPath, e.startAt);
							n.push(t.value), r &&= t.inclusive;
						}
						return new $u(n, r);
					}(a, i), l = function(e, t) {
						let n = [], r = !0;
						for (let i of Td(t)) {
							let t = i.kind === 0 ? Bd(e, i.fieldPath, e.endAt) : zd(e, i.fieldPath, e.endAt);
							n.push(t.value), r &&= t.inclusive;
						}
						return new $u(n, r);
					}(a, i), u = this.ns(i, a, c), d = this.ns(i, a, l), f = this.rs(i, a, s), p = this.ss(i.indexId, o, u, c.inclusive, d, l.inclusive, f);
					return Y.forEach(p, ((i) => n.Wn(i, t.limit).next(((t) => {
						t.forEach(((t) => {
							let n = H.fromSegments(t.documentKey);
							e.has(n) || (e = e.add(n), r.push(n));
						}));
					}))));
				})).next((() => r));
			}
			return Y.resolve(null);
		}));
	}
	es(e) {
		let t = this.Xi.get(e);
		return t || (t = e.filters.length === 0 ? [e] : _b(G.create(e.filters, "and")).map(((t) => Nd(e.path, e.collectionGroup, e.orderBy, t.getFilters(), e.limit, e.startAt, e.endAt))), this.Xi.set(e, t), t);
	}
	ss(e, t, n, r, i, a, o) {
		let s = (t == null ? 1 : t.length) * Math.max(n.length, i.length), c = s / (t == null ? 1 : t.length), l = [];
		for (let u = 0; u < s; ++u) {
			let s = t ? this._s(t[u / c]) : Ob, d = this.us(e, s, n[u % c], r), f = this.cs(e, s, i[u % c], a), p = o.map(((t) => this.us(e, s, t, !0)));
			l.push(...this.createRange(d, f, p));
		}
		return l;
	}
	us(e, t, n, r) {
		let i = new ub(e, H.empty(), t, n);
		return r ? i : i.Ui();
	}
	cs(e, t, n, r) {
		let i = new ub(e, H.empty(), t, n);
		return r ? i.Ui() : i;
	}
	ts(e, t) {
		let n = new hb(t), r = t.collectionGroup == null ? t.path.lastSegment() : t.collectionGroup;
		return this.getFieldIndexes(e, r).next(((e) => {
			let t = null;
			for (let r of e) n.Gi(r) && (!t || r.fields.length > t.fields.length) && (t = r);
			return t;
		}));
	}
	getIndexType(e, t) {
		let n = 2, r = this.es(t);
		return Y.forEach(r, ((t) => this.ts(e, t).next(((e) => {
			e ? n !== 0 && e.fields.length < function(e) {
				let t = new R(Yc.comparator), n = !1;
				for (let r of e.filters) for (let e of r.getFlattenedFilters()) e.field.isKeyField() || (e.op === "array-contains" || e.op === "array-contains-any" ? n = !0 : t = t.add(e.field));
				for (let n of e.orderBy) n.field.isKeyField() || (t = t.add(n.field));
				return t.size + +!!n;
			}(t) && (n = 1) : n = 0;
		})))).next((() => function(e) {
			return e.limit !== null;
		}(t) && r.length > 1 && n === 2 ? 1 : n));
	}
	ls(e, t) {
		let n = new lb();
		for (let r of Td(e)) {
			let e = t.data.field(r.fieldPath);
			if (e == null) return null;
			let i = n.Oi(r.kind);
			nb.Ti.Xr(e, i);
		}
		return n.Ci();
	}
	_s(e) {
		let t = new lb();
		return nb.Ti.Xr(e, t.Oi(0)), t.Ci();
	}
	Es(e, t) {
		let n = new lb();
		return nb.Ti.Xr(Zl(this.databaseId, t), n.Oi(function(e) {
			let t = Td(e);
			return t.length === 0 ? 0 : t[t.length - 1].kind;
		}(e))), n.Ci();
	}
	rs(e, t, n) {
		if (n === null) return [];
		let r = [];
		r.push(new lb());
		let i = 0;
		for (let a of Td(e)) {
			let e = n[i++];
			for (let n of r) if (this.hs(t, a.fieldPath) && tu(e)) r = this.Ts(r, a, e);
			else {
				let t = n.Oi(a.kind);
				nb.Ti.Xr(e, t);
			}
		}
		return this.Ps(r);
	}
	ns(e, t, n) {
		return this.rs(e, t, n.position);
	}
	Ps(e) {
		let t = [];
		for (let n = 0; n < e.length; ++n) t[n] = e[n].Ci();
		return t;
	}
	Ts(e, t, n) {
		let r = [...e], i = [];
		for (let e of n.arrayValue.values || []) for (let n of r) {
			let r = new lb();
			r.seed(n.Ci()), nb.Ti.Xr(e, r.Oi(t.kind)), i.push(r);
		}
		return i;
	}
	hs(e, t) {
		return !!e.filters.find(((e) => e instanceof W && e.field.isEqual(t) && (e.op === "in" || e.op === "not-in")));
	}
	getFieldIndexes(e, t) {
		let n = Mb(e), r = Nb(e);
		return (t ? n.Kn(Qv, IDBKeyRange.bound(t, t)) : n.Kn()).next(((e) => {
			let t = [];
			return Y.forEach(e, ((e) => r.get([e.indexId, this.uid]).next(((n) => {
				t.push(function(e, t) {
					let n = t ? new Dd(t.sequenceNumber, new Ad(Fy(t.readTime), new H(dv(t.documentKey)), t.largestBatchId)) : Dd.empty(), r = e.fields.map((([e, t]) => new Ed(Yc.fromServerFormat(e), t)));
					return new Cd(e.indexId, e.collectionGroup, r, n);
				}(e, n));
			})))).next((() => t));
		}));
	}
	getNextCollectionGroupToUpdate(e) {
		return this.getFieldIndexes(e).next(((e) => e.length === 0 ? null : (e.sort(((e, t) => {
			let n = e.indexState.sequenceNumber - t.indexState.sequenceNumber;
			return n === 0 ? L(e.collectionGroup, t.collectionGroup) : n;
		})), e[0].collectionGroup)));
	}
	updateCollectionGroup(e, t, n) {
		let r = Mb(e), i = Nb(e);
		return this.Rs(e).next(((e) => r.Kn(Qv, IDBKeyRange.bound(t, t)).next(((t) => Y.forEach(t, ((t) => i.put(Hy(t.indexId, this.uid, e, n))))))));
	}
	updateIndexEntries(e, t) {
		let n = /* @__PURE__ */ new Map();
		return Y.forEach(t, ((t, r) => {
			let i = n.get(t.collectionGroup);
			return (i ? Y.resolve(i) : this.getFieldIndexes(e, t.collectionGroup)).next(((i) => (n.set(t.collectionGroup, i), Y.forEach(i, ((n) => this.Is(e, t, n).next(((t) => {
				let i = this.As(r, n);
				return t.isEqual(i) ? Y.resolve() : this.Vs(e, r, n, t, i);
			})))))));
		}));
	}
	ds(e, t, n, r) {
		return jb(e).put(r.ki(this.uid, this.Es(n, t.key), t.key));
	}
	fs(e, t, n, r) {
		return jb(e).delete(r.qi(this.uid, this.Es(n, t.key), t.key));
	}
	Is(e, t, n) {
		let r = jb(e), i = new R(db);
		return r.jn({
			index: oy,
			range: IDBKeyRange.only([
				n.indexId,
				this.uid,
				pb(this.Es(n, t))
			])
		}, ((e, r) => {
			i = i.add(new ub(n.indexId, t, mb(r.arrayValue), mb(r.directionalValue)));
		})).next((() => i));
	}
	As(e, t) {
		let n = new R(db), r = this.ls(t, e);
		if (r == null) return n;
		let i = wd(t);
		if (i != null) {
			let a = e.data.field(i.fieldPath);
			if (tu(a)) for (let i of a.arrayValue.values || []) n = n.add(new ub(t.indexId, e.key, this._s(i), r));
		} else n = n.add(new ub(t.indexId, e.key, Ob, r));
		return n;
	}
	Vs(e, t, n, r, i) {
		N(Db, "Updating index entries for document '%s'", t.key);
		let a = [];
		return function(e, t, n, r, i) {
			let a = e.getIterator(), o = t.getIterator(), s = Gc(a), c = Gc(o);
			for (; s || c;) {
				let e = !1, t = !1;
				if (s && c) {
					let r = n(s, c);
					r < 0 ? t = !0 : r > 0 && (e = !0);
				} else s == null ? e = !0 : t = !0;
				e ? (r(c), c = Gc(o)) : t ? (i(s), s = Gc(a)) : (s = Gc(a), c = Gc(o));
			}
		}(r, i, db, ((r) => {
			a.push(this.ds(e, t, n, r));
		}), ((r) => {
			a.push(this.fs(e, t, n, r));
		})), Y.waitFor(a);
	}
	Rs(e) {
		let t = 1;
		return Nb(e).jn({
			index: ny,
			reverse: !0,
			range: IDBKeyRange.upperBound([this.uid, 2 ** 53 - 1])
		}, ((e, n, r) => {
			r.done(), t = n.sequenceNumber + 1;
		})).next((() => t));
	}
	createRange(e, t, n) {
		n = n.sort(((e, t) => db(e, t))).filter(((e, t, n) => !t || db(e, n[t - 1]) !== 0));
		let r = [];
		r.push(e);
		for (let i of n) {
			let n = db(i, e), a = db(i, t);
			if (n === 0) r[0] = e.Ui();
			else if (n > 0 && a < 0) r.push(i), r.push(i.Ui());
			else if (a > 0) break;
		}
		r.push(t);
		let i = [];
		for (let e = 0; e < r.length; e += 2) {
			if (this.ps(r[e], r[e + 1])) return [];
			let t = r[e].qi(this.uid, Ob, H.empty()), n = r[e + 1].qi(this.uid, Ob, H.empty());
			i.push(IDBKeyRange.bound(t, n));
		}
		return i;
	}
	ps(e, t) {
		return db(e, t) > 0;
	}
	getMinOffsetFromCollectionGroup(e, t) {
		return this.getFieldIndexes(e, t).next(Pb);
	}
	getMinOffset(e, t) {
		return Y.mapArray(this.es(t), ((t) => this.ts(e, t).next(((e) => e || P(44426))))).next(Pb);
	}
};
function Ab(e) {
	return Dy(e, Hv);
}
function jb(e) {
	return Dy(e, iy);
}
function Mb(e) {
	return Dy(e, Xv);
}
function Nb(e) {
	return Dy(e, ey);
}
function Pb(e) {
	F(e.length !== 0, 28825);
	let t = e[0].indexState.offset, n = t.largestBatchId;
	for (let r = 1; r < e.length; r++) {
		let i = e[r].indexState.offset;
		jd(i, t) < 0 && (t = i), n < i.largestBatchId && (n = i.largestBatchId);
	}
	return new Ad(t.readTime, t.documentKey, n);
}
var Fb = class e {
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
}, Ib = class {
	constructor(e, t) {
		this.referenceDelegate = e, this.serializer = t;
	}
	allocateTargetId(e) {
		return this.bs(e).next(((t) => (t.highestTargetId = new Fb(t.highestTargetId).next(), this.Ss(e, t).next((() => t.highestTargetId)))));
	}
	getLastRemoteSnapshotVersion(e) {
		return this.bs(e).next(((e) => K.fromTimestamp(new fl(e.lastRemoteSnapshotVersion.seconds, e.lastRemoteSnapshotVersion.nanoseconds))));
	}
	getHighestSequenceNumber(e) {
		return this.bs(e).next(((e) => e.highestListenSequenceNumber));
	}
	setTargetsMetadata(e, t, n) {
		return this.bs(e).next(((r) => (r.highestListenSequenceNumber = t, n && (r.lastRemoteSnapshotVersion = n.toTimestamp()), t > r.highestListenSequenceNumber && (r.highestListenSequenceNumber = t), this.Ss(e, r))));
	}
	addTargetData(e, t) {
		return this.vs(e, t).next((() => this.bs(e).next(((n) => (n.targetCount += 1, this.Ds(t, n), this.Ss(e, n))))));
	}
	updateTargetData(e, t) {
		return this.vs(e, t);
	}
	removeTargetData(e, t) {
		return this.removeMatchingKeysForTargetId(e, t.targetId).next((() => Lb(e).delete(t.targetId))).next((() => this.bs(e))).next(((t) => (F(t.targetCount > 0, 8065), --t.targetCount, this.Ss(e, t))));
	}
	removeTargets(e, t, n) {
		let r = 0, i = [];
		return Lb(e).jn(((a, o) => {
			let s = Ly(this.serializer, o);
			s.sequenceNumber <= t && n.get(s.targetId) === null && (r++, i.push(this.removeTargetData(e, s)));
		})).next((() => Y.waitFor(i))).next((() => r));
	}
	forEachTarget(e, t) {
		return Lb(e).jn(((e, n) => {
			t(Ly(this.serializer, n));
		}));
	}
	bs(e) {
		return Rb(e).get(Bv).next(((e) => (F(e !== null, 2888), e)));
	}
	Ss(e, t) {
		return Rb(e).put(Bv, t);
	}
	vs(e, t) {
		return Lb(e).put(Ry(this.serializer, t));
	}
	Ds(e, t) {
		let n = !1;
		return e.targetId > t.highestTargetId && (t.highestTargetId = e.targetId, n = !0), e.sequenceNumber > t.highestListenSequenceNumber && (t.highestListenSequenceNumber = e.sequenceNumber, n = !0), n;
	}
	getTargetCount(e) {
		return this.bs(e).next(((e) => e.targetCount));
	}
	getTargetData(e, t) {
		let n = nv(t), r = IDBKeyRange.bound([n, -Infinity], [n, Infinity]), i = null;
		return Lb(e).jn({
			range: r,
			index: Pv
		}, ((e, n, r) => {
			let a = Ly(this.serializer, n);
			rv(t, a.target) && (i = a, r.done());
		})).next((() => i));
	}
	addMatchingKeys(e, t, n) {
		let r = [], i = zb(e);
		return t.forEach(((t) => {
			let a = cv(t.path);
			r.push(i.put({
				targetId: n,
				path: a
			})), r.push(this.referenceDelegate.addReference(e, n, t));
		})), Y.waitFor(r);
	}
	removeMatchingKeys(e, t, n) {
		let r = zb(e);
		return Y.forEach(t, ((t) => {
			let i = cv(t.path);
			return Y.waitFor([r.delete([n, i]), this.referenceDelegate.removeReference(e, n, t)]);
		}));
	}
	removeMatchingKeysForTargetId(e, t) {
		let n = zb(e), r = IDBKeyRange.bound([t], [t + 1], !1, !0);
		return n.delete(r);
	}
	getMatchingKeysForTargetId(e, t) {
		let n = IDBKeyRange.bound([t], [t + 1], !1, !0), r = zb(e), i = J();
		return r.jn({
			range: n,
			zn: !0
		}, ((e, t, n) => {
			let r = new H(dv(e[1]));
			i = i.add(r);
		})).next((() => i));
	}
	containsKey(e, t) {
		let n = cv(t.path), r = IDBKeyRange.bound([n], [Bc(n)], !1, !0), i = 0;
		return zb(e).jn({
			index: Rv,
			zn: !0,
			range: r
		}, (([e, t], n, r) => {
			e !== 0 && (i++, r.done());
		})).next((() => i > 0));
	}
	ge(e, t) {
		return Lb(e).get(t).next(((e) => e ? Ly(this.serializer, e) : null));
	}
};
function Lb(e) {
	return Dy(e, Nv);
}
function Rb(e) {
	return Dy(e, Vv);
}
function zb(e) {
	return Dy(e, Iv);
}
var Bb = class {
	constructor(e, t) {
		this.db = e, this.garbageCollector = Im(this, t);
	}
	rr(e) {
		let t = this.xs(e);
		return this.db.getTargetCache().getTargetCount(e).next(((e) => t.next(((t) => e + t))));
	}
	xs(e) {
		let t = 0;
		return this.ir(e, ((e) => {
			t++;
		})).next((() => t));
	}
	forEachTarget(e, t) {
		return this.db.getTargetCache().forEachTarget(e, t);
	}
	ir(e, t) {
		return this.Cs(e, ((e, n) => t(n)));
	}
	addReference(e, t, n) {
		return Vb(e, n);
	}
	removeReference(e, t, n) {
		return Vb(e, n);
	}
	removeTargets(e, t, n) {
		return this.db.getTargetCache().removeTargets(e, t, n);
	}
	markPotentiallyOrphaned(e, t) {
		return Vb(e, t);
	}
	Fs(e, t) {
		return function(e, t) {
			let n = !1;
			return Yy(e).Hn(((r) => Ky(e, r, t).next(((e) => (e && (n = !0), Y.resolve(!e)))))).next((() => n));
		}(e, t);
	}
	removeOrphanedDocuments(e, t) {
		let n = this.db.getRemoteDocumentCache().newChangeBuffer(), r = [], i = 0;
		return this.Cs(e, ((a, o) => {
			if (o <= t) {
				let t = this.Fs(e, a).next(((t) => {
					if (!t) return i++, n.getEntry(e, a).next((() => (n.removeEntry(a, K.min()), zb(e).delete(function(e) {
						return [0, cv(e.path)];
					}(a)))));
				}));
				r.push(t);
			}
		})).next((() => Y.waitFor(r))).next((() => n.apply(e))).next((() => i));
	}
	removeTarget(e, t) {
		let n = t.withSequenceNumber(e.currentSequenceNumber);
		return this.db.getTargetCache().updateTargetData(e, n);
	}
	updateLimboDocument(e, t) {
		return Vb(e, t);
	}
	Cs(e, t) {
		let n = zb(e), r, i = hm.yn;
		return n.jn({ index: Rv }, (([e, n], { path: a, sequenceNumber: o }) => {
			e === 0 ? (i !== hm.yn && t(new H(dv(r)), i), i = o, r = a) : i = hm.yn;
		})).next((() => {
			i !== hm.yn && t(new H(dv(r)), i);
		}));
	}
	getCacheSize(e) {
		return this.db.getRemoteDocumentCache().getSize(e);
	}
};
function Vb(e, t) {
	return zb(e).put(function(e, t) {
		return {
			targetId: 0,
			path: cv(e.path),
			sequenceNumber: t
		};
	}(t, e.currentSequenceNumber));
}
function Hb(e, t) {
	let n = t;
	for (let t of e.stages) n = Gb({
		serializer: e.serializer,
		serverTimestampBehavior: e.listenOptions?.serverTimestampBehavior
	}, t, n);
	return n;
}
function Ub(e, t) {
	return Hb(e, [t]).length > 0;
}
function Wb(e, t) {
	return Q_(e) ? Ub(e, t) : ef(e, t);
}
function Gb(e, t, n) {
	if (t instanceof Kh) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument() && `/${e.key.getCollectionPath().canonicalString()}` === t.Er));
	}(0, t, n);
	if (t instanceof Xh) return function(e, t, n) {
		return n.filter(((n) => {
			let r = ug($(t.condition).evaluate(e, n));
			return r !== void 0 && Ul(r, Bl);
		}));
	}(e, t, n);
	if (t instanceof qh) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument() && e.key.getCollectionPath().lastSegment() === t.collectionId));
	}(0, t, n);
	if (t instanceof Jh) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument()));
	}(0, 0, n);
	if (t instanceof Yh) return function(e, t, n) {
		return n.filter(((e) => e.isFoundDocument() && t.Tr.has(e.key.path.toStringWithLeadingSlash())));
	}(0, t, n);
	if (t instanceof Zh) return function(e, t, n) {
		return n.slice(0, t.limit);
	}(0, t, n);
	if (t instanceof eg) return function(e, t, n) {
		let r = t.orderings.map(((e) => ({
			Os: $(e.expr),
			direction: e.direction
		})));
		return [...n].sort(((t, n) => {
			for (let { Os: i, direction: a } of r) {
				let r = ug(i.evaluate(e, t)), o = ug(i.evaluate(e, n)), s = Gl(r ?? zl, o ?? zl);
				if (s !== 0) return a === "ascending" ? s : -s;
			}
			return 0;
		}));
	}(e, t, n);
	throw Error(`Unknown stage: ${t._name}`);
}
function Kb(e) {
	let t = function(e) {
		for (let t = e.stages.length - 1; t >= 0; t--) {
			let n = e.stages[t];
			if (n instanceof eg) return n.orderings;
		}
		throw Error("Pipeline must contain at least one Sort stage");
	}(e);
	return (n, r) => {
		for (let i of t) {
			let t = ug($(i.expr).evaluate({ serializer: e.serializer }, n)), a = ug($(i.expr).evaluate({ serializer: e.serializer }, r)), o = Gl(t || zl, a || zl);
			if (o !== 0) return i.direction === "ascending" ? o : -o;
		}
		return 0;
	};
}
function qb(e) {
	for (let t = e.stages.length - 1; t >= 0; t--) {
		let n = e.stages[t];
		if (n instanceof Zh) return { limit: n.limit };
	}
}
var Jb = class {
	constructor() {
		this.changes = new cf(((e) => e.toString()), ((e, t) => e.isEqual(t))), this.changesApplied = !1;
	}
	addEntry(e) {
		this.assertNotApplied(), this.changes.set(e.key, e);
	}
	removeEntry(e, t) {
		this.assertNotApplied(), this.changes.set(e, xd.newInvalidDocument(e).setReadTime(t));
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
}, Yb = class {
	constructor(e) {
		this.serializer = e;
	}
	setIndexManager(e) {
		this.indexManager = e;
	}
	addEntry(e, t, n) {
		return $b(e).put(n);
	}
	removeEntry(e, t, n) {
		return $b(e).delete(function(e, t) {
			let n = e.path.toArray();
			return [
				n.slice(0, n.length - 2),
				n[n.length - 2],
				Ny(t),
				n[n.length - 1]
			];
		}(t, n));
	}
	updateMetadata(e, t) {
		return this.getMetadata(e).next(((n) => (n.byteSize += t, this.Ms(e, n))));
	}
	getEntry(e, t) {
		let n = xd.newInvalidDocument(t);
		return $b(e).jn({
			index: Dv,
			range: IDBKeyRange.only(ex(t))
		}, ((e, r) => {
			n = this.Ns(t, r);
		})).next((() => n));
	}
	Ls(e, t) {
		let n = {
			size: 0,
			document: xd.newInvalidDocument(t)
		};
		return $b(e).jn({
			index: Dv,
			range: IDBKeyRange.only(ex(t))
		}, ((e, r) => {
			n = {
				document: this.Ns(t, r),
				size: Ty(r)
			};
		})).next((() => n));
	}
	getEntries(e, t) {
		let n = uf();
		return this.Bs(e, t, ((e, t) => {
			let r = this.Ns(e, t);
			n = n.insert(e, r);
		})).next((() => n));
	}
	getAllEntries(e) {
		let t = uf();
		return $b(e).jn(((e, n) => {
			let r = this.Ns(H.fromSegments(n.prefixPath.concat(n.collectionGroup, n.documentId)), n);
			t = t.insert(r.key, r);
		})).next((() => t));
	}
	Us(e, t) {
		let n = uf(), r = new Vc(H.comparator);
		return this.Bs(e, t, ((e, t) => {
			let i = this.Ns(e, t);
			n = n.insert(e, i), r = r.insert(e, Ty(t));
		})).next((() => ({
			documents: n,
			ks: r
		})));
	}
	Bs(e, t, n) {
		if (t.isEmpty()) return Y.resolve();
		let r = new R(nx);
		t.forEach(((e) => r = r.add(e)));
		let i = IDBKeyRange.bound(ex(r.first()), ex(r.last())), a = r.getIterator(), o = a.getNext();
		return $b(e).jn({
			index: Dv,
			range: i
		}, ((e, t, r) => {
			let i = H.fromSegments([
				...t.prefixPath,
				t.collectionGroup,
				t.documentId
			]);
			for (; o && nx(o, i) < 0;) n(o, null), o = a.getNext();
			o && o.isEqual(i) && (n(o, t), o = a.hasNext() ? a.getNext() : null), o ? r.$n(ex(o)) : r.done();
		})).next((() => {
			for (; o;) n(o, null), o = a.hasNext() ? a.getNext() : null;
		}));
	}
	getDocumentsMatchingQuery(e, t, n, r, i) {
		let a = Q_(t) ? V.fromString(og(t)) : t.path, o = [
			a.popLast().toArray(),
			a.lastSegment(),
			Ny(n.readTime),
			n.documentKey.path.isEmpty() ? "" : n.documentKey.path.lastSegment()
		], s = [
			a.popLast().toArray(),
			a.lastSegment(),
			[2 ** 53 - 1, 2 ** 53 - 1],
			""
		];
		return $b(e).Kn(IDBKeyRange.bound(o, s, !0)).next(((e) => {
			i?.incrementDocumentReadCount(e.length);
			let n = uf();
			for (let i of e) {
				let e = this.Ns(H.fromSegments(i.prefixPath.concat(i.collectionGroup, i.documentId)), i);
				e.isFoundDocument() && (Wb(t, e) || r.has(e.key)) && (n = n.insert(e.key, e));
			}
			return n;
		}));
	}
	getAllFromCollectionGroup(e, t, n, r) {
		let i = uf(), a = tx(t, n), o = tx(t, Ad.max());
		return $b(e).jn({
			index: kv,
			range: IDBKeyRange.bound(a, o, !0)
		}, ((e, t, n) => {
			let a = this.Ns(H.fromSegments(t.prefixPath.concat(t.collectionGroup, t.documentId)), t);
			i = i.insert(a.key, a), i.size === r && n.done();
		})).next((() => i));
	}
	newChangeBuffer(e) {
		return new Zb(this, !!e && e.trackRemovals);
	}
	getSize(e) {
		return this.getMetadata(e).next(((e) => e.byteSize));
	}
	getMetadata(e) {
		return Qb(e).get(Mv).next(((e) => (F(!!e, 20021), e)));
	}
	Ms(e, t) {
		return Qb(e).put(Mv, t);
	}
	Ns(e, t) {
		if (t) {
			let e = jy(this.serializer, t);
			if (!(e.isNoDocument() && e.version.isEqual(K.min()))) return e;
		}
		return xd.newInvalidDocument(e);
	}
};
function Xb(e) {
	return new Yb(e);
}
var Zb = class extends Jb {
	constructor(e, t) {
		super(), this.qs = e, this.trackRemovals = t, this.$s = new cf(((e) => e.toString()), ((e, t) => e.isEqual(t)));
	}
	applyChanges(e) {
		let t = [], n = 0, r = new R(((e, t) => L(e.canonicalString(), t.canonicalString())));
		return this.changes.forEach(((i, a) => {
			let o = this.$s.get(i);
			if (t.push(this.qs.removeEntry(e, i, o.readTime)), a.isValidDocument()) {
				let s = My(this.qs.serializer, a);
				r = r.add(i.path.popLast());
				let c = Ty(s);
				n += c - o.size, t.push(this.qs.addEntry(e, i, s));
			} else if (n -= o.size, this.trackRemovals) {
				let n = My(this.qs.serializer, a.convertToNoDocument(K.min()));
				t.push(this.qs.addEntry(e, i, n));
			}
		})), r.forEach(((n) => {
			t.push(this.qs.indexManager.addToCollectionParentIndex(e, n));
		})), t.push(this.qs.updateMetadata(e, n)), Y.waitFor(t);
	}
	getFromCache(e, t) {
		return this.qs.Ls(e, t).next(((e) => (this.$s.set(t, {
			size: e.size,
			readTime: e.document.readTime
		}), e.document)));
	}
	getAllFromCache(e, t) {
		return this.qs.Us(e, t).next((({ documents: e, ks: t }) => (t.forEach(((t, n) => {
			this.$s.set(t, {
				size: n,
				readTime: e.get(t).readTime
			});
		})), e)));
	}
};
function Qb(e) {
	return Dy(e, jv);
}
function $b(e) {
	return Dy(e, Tv);
}
function ex(e) {
	let t = e.path.toArray();
	return [
		t.slice(0, t.length - 2),
		t[t.length - 2],
		t[t.length - 1]
	];
}
function tx(e, t) {
	let n = t.documentKey.path.toArray();
	return [
		e,
		Ny(t.readTime),
		n.slice(0, n.length - 2),
		n.length > 0 ? n[n.length - 1] : ""
	];
}
function nx(e, t) {
	let n = e.path.toArray(), r = t.path.toArray(), i = 0;
	for (let e = 0; e < n.length - 2 && e < r.length - 2; ++e) if (i = L(n[e], r[e]), i) return i;
	return i = L(n.length, r.length), i || (i = L(n[n.length - 2], r[r.length - 2]), i || L(n[n.length - 1], r[r.length - 1]));
}
var rx = class {
	constructor(e, t) {
		this.overlayedDocument = e, this.mutatedFields = t;
	}
}, ix = class {
	constructor(e, t, n, r) {
		this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = n, this.indexManager = r;
	}
	getDocument(e, t) {
		let n = null;
		return this.documentOverlayCache.getOverlay(e, t).next(((r) => (n = r, this.remoteDocumentCache.getEntry(e, t)))).next(((e) => (n !== null && Uu(n.mutation, e, Xc.empty(), fl.now()), e)));
	}
	getDocuments(e, t) {
		return this.remoteDocumentCache.getEntries(e, t).next(((t) => this.getLocalViewOfDocuments(e, t, J()).next((() => t))));
	}
	getLocalViewOfDocuments(e, t, n = J()) {
		let r = mf();
		return this.populateOverlays(e, r, t).next((() => this.computeViews(e, t, r, n).next(((e) => {
			let t = ff();
			return e.forEach(((e, n) => {
				t = t.insert(e, n.overlayedDocument);
			})), t;
		}))));
	}
	getOverlayedDocuments(e, t) {
		let n = mf();
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
		let i = uf(), a = gf(), o = function() {
			return gf();
		}();
		return t.forEach(((e, t) => {
			let o = n.get(t.key);
			r.has(t.key) && (o === void 0 || o.mutation instanceof qu) ? i = i.insert(t.key, t) : o === void 0 ? a.set(t.key, Xc.empty()) : (a.set(t.key, o.mutation.getFieldMask()), Uu(o.mutation, t, o.mutation.getFieldMask(), fl.now()));
		})), this.recalculateAndSaveOverlays(e, i).next(((e) => (e.forEach(((e, t) => a.set(e, t))), t.forEach(((e, t) => o.set(e, new rx(t, a.get(e) ?? null)))), o)));
	}
	recalculateAndSaveOverlays(e, t) {
		let n = gf(), r = new Vc(((e, t) => e - t)), i = J();
		return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next(((e) => {
			for (let i of e) i.keys().forEach(((e) => {
				let a = t.get(e);
				if (a === null) return;
				let o = n.get(e) || Xc.empty();
				o = i.applyToLocalView(a, o), n.set(e, o);
				let s = (r.get(i.batchId) || J()).add(e);
				r = r.insert(i.batchId, s);
			}));
		})).next((() => {
			let a = [], o = r.getReverseIterator();
			for (; o.hasNext();) {
				let r = o.getNext(), s = r.key, c = r.value, l = hf();
				c.forEach(((e) => {
					if (!i.has(e)) {
						let r = Vu(t.get(e), n.get(e));
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
		return Q_(t) ? this.getDocumentsMatchingPipeline(e, t, n, r) : Gd(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : Kd(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, n, r) : this.getDocumentsMatchingCollectionQuery(e, t, n, r);
	}
	getNextDocuments(e, t, n, r) {
		return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, n, r).next(((i) => {
			let a = r - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, n.largestBatchId, r - i.size) : Y.resolve(mf()), o = Sd, s = i;
			return a.next(((t) => Y.forEach(t, ((t, n) => (o < n.largestBatchId && (o = n.largestBatchId), i.get(t) ? Y.resolve() : this.remoteDocumentCache.getEntry(e, t).next(((e) => {
				s = s.insert(t, e);
			}))))).next((() => this.populateOverlays(e, t, i))).next((() => this.computeViews(e, s, t, J()))).next(((e) => ({
				batchId: o,
				changes: pf(e)
			})))));
		}));
	}
	getDocumentsMatchingDocumentQuery(e, t) {
		return this.getDocument(e, new H(t)).next(((e) => {
			let t = ff();
			return e.isFoundDocument() && (t = t.insert(e.key, e)), t;
		}));
	}
	getDocumentsMatchingCollectionGroupQuery(e, t, n, r) {
		let i = t.collectionGroup, a = ff();
		return this.indexManager.getCollectionParents(e, i).next(((o) => Y.forEach(o, ((o) => {
			let s = function(e, t) {
				return new Vd(t, null, e.explicitOrderBy.slice(), e.filters.slice(), e.limit, e.limitType, e.startAt, e.endAt);
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
		return this.documentOverlayCache.getOverlaysForCollection(e, t.path, n.largestBatchId).next(((a) => (i = a, this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, r)))).next(((e) => this.retrieveMatchingLocalDocuments(i, e, ((e) => ef(t, e)))));
	}
	getDocumentsMatchingPipeline(e, t, n, r) {
		if (ag(t) === "collection_group") {
			let i = sg(t), a = ff();
			return this.indexManager.getCollectionParents(e, i).next(((o) => Y.forEach(o, ((o) => {
				let s = function(e, t) {
					let n = e.stages.map(((e) => e instanceof qh ? new Kh(t.canonicalString(), {}) : e));
					return new ig(e.serializer, n);
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
				switch (i = a, ag(t)) {
					case "collection": return this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, r);
					case "documents":
						let a = J();
						for (let e of lg(t)) a = a.add(H.fromPath(e));
						return this.remoteDocumentCache.getEntries(e, a);
					case "database": return this.remoteDocumentCache.getAllEntries(e);
					default: throw new B("invalid-argument", `Invalid pipeline source to execute offline: ${X_(t)}`);
				}
			})).next(((e) => this.retrieveMatchingLocalDocuments(i, e, ((e) => Ub(t, e)))));
		}
	}
	retrieveMatchingLocalDocuments(e, t, n) {
		e.forEach(((e, n) => {
			let r = n.getKey();
			t.get(r) === null && (t = t.insert(r, xd.newInvalidDocument(r)));
		}));
		let r = ff();
		return t.forEach(((t, i) => {
			let a = e.get(t);
			a !== void 0 && Uu(a.mutation, i, Xc.empty(), fl.now()), n(i) && (r = r.insert(t, i));
		})), r;
	}
	getOverlaysForPipeline(e, t, n) {
		switch (ag(t)) {
			case "collection": return this.documentOverlayCache.getOverlaysForCollection(e, V.fromString(og(t)), n);
			case "collection_group": throw new B("invalid-argument", `Unexpected collection group pipeline: ${X_(t)}`);
			case "documents": return this.documentOverlayCache.getOverlays(e, lg(t).map(((e) => H.fromPath(e))));
			case "database": return this.documentOverlayCache.getAllOverlays(e, n);
			default: throw new B("invalid-argument", `Failed to get overlays for pipeline: ${X_(t)}`);
		}
	}
}, ax = class {
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
				createTime: qf(e.createTime)
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
				query: zy(e.bundledQuery),
				readTime: qf(e.readTime)
			};
		}(t)), Y.resolve();
	}
}, ox = class {
	constructor() {
		this.overlays = new Vc(H.comparator), this.Ws = /* @__PURE__ */ new Map();
	}
	getOverlay(e, t) {
		return Y.resolve(this.overlays.get(t));
	}
	getOverlays(e, t) {
		let n = mf();
		return Y.forEach(t, ((t) => this.getOverlay(e, t).next(((e) => {
			e !== null && n.set(t, e);
		})))).next((() => n));
	}
	getAllOverlays(e, t) {
		let n = mf();
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
		let r = mf(), i = t.length + 1, a = new H(t.child("")), o = this.overlays.getIteratorFrom(a);
		for (; o.hasNext();) {
			let e = o.getNext().value, a = e.getKey();
			if (!t.isPrefixOf(a.path)) break;
			a.path.length === i && e.largestBatchId > n && r.set(e.getKey(), e);
		}
		return Y.resolve(r);
	}
	getOverlaysForCollectionGroup(e, t, n, r) {
		let i = new Vc(((e, t) => e - t)), a = this.overlays.getIterator();
		for (; a.hasNext();) {
			let e = a.getNext().value;
			if (e.getKey().getCollectionGroup() === t && e.largestBatchId > n) {
				let t = i.get(e.largestBatchId);
				t === null && (t = mf(), i = i.insert(e.largestBatchId, t)), t.set(e.getKey(), e);
			}
		}
		let o = mf(), s = i.getIterator();
		for (; s.hasNext() && (s.getNext().value.forEach(((e, t) => o.set(e, t))), !(o.size() >= r)););
		return Y.resolve(o);
	}
	Yr(e, t, n) {
		let r = this.overlays.get(n.key);
		if (r !== null) {
			let e = this.Ws.get(r.largestBatchId).delete(n.key);
			this.Ws.set(r.largestBatchId, e);
		}
		this.overlays = this.overlays.insert(n.key, new Oy(t, n));
		let i = this.Ws.get(t);
		i === void 0 && (i = J(), this.Ws.set(t, i)), this.Ws.set(t, i.add(n.key));
	}
}, sx = class {
	constructor() {
		this.sessionToken = ml.EMPTY_BYTE_STRING;
	}
	getSessionToken(e) {
		return Y.resolve(this.sessionToken);
	}
	setSessionToken(e, t) {
		return this.sessionToken = t, Y.resolve();
	}
}, cx = class {
	constructor() {
		this.Gs = new R(lx.zs), this.js = new R(lx.Hs);
	}
	isEmpty() {
		return this.Gs.isEmpty();
	}
	addReference(e, t) {
		let n = new lx(e, t);
		this.Gs = this.Gs.add(n), this.js = this.js.add(n);
	}
	Js(e, t) {
		e.forEach(((e) => this.addReference(e, t)));
	}
	removeReference(e, t) {
		this.Ys(new lx(e, t));
	}
	Zs(e, t) {
		e.forEach(((e) => this.removeReference(e, t)));
	}
	Xs(e) {
		let t = new H(new V([])), n = new lx(t, e), r = new lx(t, e + 1), i = [];
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
		let t = new H(new V([])), n = new lx(t, e), r = new lx(t, e + 1), i = J();
		return this.js.forEachInRange([n, r], ((e) => {
			i = i.add(e.key);
		})), i;
	}
	containsKey(e) {
		let t = new lx(e, 0), n = this.Gs.firstAfterOrEqual(t);
		return n !== null && e.isEqual(n.key);
	}
}, lx = class {
	constructor(e, t) {
		this.key = e, this.n_ = t;
	}
	static zs(e, t) {
		return H.comparator(e.key, t.key) || L(e.n_, t.n_);
	}
	static Hs(e, t) {
		return L(e.n_, t.n_) || H.comparator(e.key, t.key);
	}
}, ux = class {
	constructor(e, t) {
		this.indexManager = e, this.referenceDelegate = t, this.mutationQueue = [], this.Wr = 1, this.r_ = new R(lx.zs);
	}
	checkEmpty(e) {
		return Y.resolve(this.mutationQueue.length === 0);
	}
	addMutationBatch(e, t, n, r) {
		let i = this.Wr;
		this.Wr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
		let a = new av(i, t, n, r);
		this.mutationQueue.push(a);
		for (let t of r) this.r_ = this.r_.add(new lx(t.key, i)), this.indexManager.addToCollectionParentIndex(e, t.key.path.popLast());
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
		return Y.resolve(this.mutationQueue.length === 0 ? kl : this.Wr - 1);
	}
	getAllMutationBatches(e) {
		return Y.resolve(this.mutationQueue.slice());
	}
	getAllMutationBatchesAffectingDocumentKey(e, t) {
		let n = new lx(t, 0), r = new lx(t, Infinity), i = [];
		return this.r_.forEachInRange([n, r], ((e) => {
			let t = this.i_(e.n_);
			i.push(t);
		})), Y.resolve(i);
	}
	getAllMutationBatchesAffectingDocumentKeys(e, t) {
		let n = new R(L);
		return t.forEach(((e) => {
			let t = new lx(e, 0), r = new lx(e, Infinity);
			this.r_.forEachInRange([t, r], ((e) => {
				n = n.add(e.n_);
			}));
		})), Y.resolve(this.__(n));
	}
	getAllMutationBatchesAffectingQuery(e, t) {
		let n = t.path, r = n.length + 1, i = n;
		H.isDocumentKey(i) || (i = i.child(""));
		let a = new lx(new H(i), 0), o = new R(L);
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
		F(this.o_(t.batchId, "removed") === 0, 55003), this.mutationQueue.shift();
		let n = this.r_;
		return Y.forEach(t.mutations, ((r) => {
			let i = new lx(r.key, t.batchId);
			return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(e, r.key);
		})).next((() => {
			this.r_ = n;
		}));
	}
	jr(e) {}
	containsKey(e, t) {
		let n = new lx(t, 0), r = this.r_.firstAfterOrEqual(n);
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
}, dx = class {
	constructor(e) {
		this.a_ = e, this.docs = function() {
			return new Vc(H.comparator);
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
		return Y.resolve(n ? n.document.mutableCopy() : xd.newInvalidDocument(t));
	}
	getEntries(e, t) {
		let n = uf();
		return t.forEach(((e) => {
			let t = this.docs.get(e);
			n = n.insert(e, t ? t.document.mutableCopy() : xd.newInvalidDocument(e));
		})), Y.resolve(n);
	}
	getAllEntries(e) {
		let t = uf();
		return this.docs.forEach(((e, n) => {
			t = t.insert(e, n.document);
		})), Y.resolve(t);
	}
	getDocumentsMatchingQuery(e, t, n, r) {
		let i, a;
		Q_(t) ? (i = V.fromString(og(t)), a = (e) => Ub(t, e)) : (i = t.path, a = (e) => ef(t, e));
		let o = uf(), s = new H(i.child("__id-9223372036854775808__")), c = this.docs.getIteratorFrom(s);
		for (; c.hasNext();) {
			let { key: e, value: { document: t } } = c.getNext();
			if (!i.isPrefixOf(e.path)) break;
			e.path.length > i.length + 1 || jd(kd(t), n) <= 0 || (r.has(t.key) || a(t)) && (o = o.insert(t.key, t.mutableCopy()));
		}
		return Y.resolve(o);
	}
	getAllFromCollectionGroup(e, t, n, r) {
		P(9500);
	}
	u_(e, t) {
		return Y.forEach(this.docs, ((e) => t(e)));
	}
	newChangeBuffer(e) {
		return new fx(this);
	}
	getSize(e) {
		return Y.resolve(this.size);
	}
}, fx = class extends Jb {
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
}, px = class {
	constructor(e) {
		this.persistence = e, this.c_ = new cf(((e) => nv(e)), rv), this.lastRemoteSnapshotVersion = K.min(), this.highestTargetId = 0, this.l_ = 0, this.E_ = new cx(), this.targetCount = 0, this.h_ = Fb.ys();
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
		t > this.highestTargetId && (this.h_ = new Fb(t), this.highestTargetId = t), e.sequenceNumber > this.l_ && (this.l_ = e.sequenceNumber);
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
}, mx = class {
	constructor(e, t) {
		this.T_ = {}, this.overlays = {}, this.P_ = new hm(0), this.R_ = !1, this.R_ = !0, this.I_ = new sx(), this.referenceDelegate = e(this), this.A_ = new px(this), this.indexManager = new Tb(), this.remoteDocumentCache = function(e) {
			return new dx(e);
		}(((e) => this.referenceDelegate.V_(e))), this.serializer = new Ay(t), this.d_ = new ax(this.serializer);
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
		return t || (t = new ox(), this.overlays[e.toKey()] = t), t;
	}
	getMutationQueue(e, t) {
		let n = this.T_[e.toKey()];
		return n || (n = new ux(t, this.referenceDelegate), this.T_[e.toKey()] = n), n;
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
		N("MemoryPersistence", "Starting transaction:", e);
		let r = new hx(this.P_.next());
		return this.referenceDelegate.f_(), n(r).next(((e) => this.referenceDelegate.m_(r).next((() => e)))).toPromise().then(((e) => (r.raiseOnCommittedEvent(), e)));
	}
	p_(e, t) {
		return Y.or(Object.values(this.T_).map(((n) => () => n.containsKey(e, t))));
	}
}, hx = class extends _m {
	constructor(e) {
		super(), this.currentSequenceNumber = e;
	}
}, gx = class e {
	constructor(e) {
		this.persistence = e, this.g_ = new cx(), this.y_ = null;
	}
	static w_(t) {
		return new e(t);
	}
	get b_() {
		if (this.y_) return this.y_;
		throw P(60996);
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
			let r = H.fromPath(n);
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
}, _x = class e {
	constructor(e, t) {
		this.persistence = e, this.v_ = new cf(((e) => cv(e.path)), ((e, t) => e.isEqual(t))), this.garbageCollector = Im(this, t);
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
		return e.isFoundDocument() && (t += Xl(e.data.value)), t;
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
}, vx = class {
	constructor(e) {
		this.serializer = e;
	}
	Mn(e, t, n, r) {
		let i = new bm("createOrUpgrade", t);
		n < 1 && r >= 1 && (function(e) {
			e.createObjectStore(pv);
		}(e), function(e) {
			e.createObjectStore(hv, { keyPath: gv }), e.createObjectStore(_v, {
				keyPath: vv,
				autoIncrement: !0
			}).createIndex(yv, bv, { unique: !0 }), e.createObjectStore(wv);
		}(e), yx(e), function(e) {
			e.createObjectStore(fv);
		}(e));
		let a = Y.resolve();
		return n < 3 && r >= 3 && (n !== 0 && (function(e) {
			e.deleteObjectStore(Iv), e.deleteObjectStore(Nv), e.deleteObjectStore(Vv);
		}(e), yx(e)), a = a.next((() => function(e) {
			let t = e.store(Vv), n = {
				highestTargetId: 0,
				highestListenSequenceNumber: 0,
				lastRemoteSnapshotVersion: K.min().toTimestamp(),
				targetCount: 0
			};
			return t.put(Bv, n);
		}(i)))), n < 4 && r >= 4 && (n !== 0 && (a = a.next((() => function(e, t) {
			return t.store(_v).Kn().next(((n) => {
				e.deleteObjectStore(_v), e.createObjectStore(_v, {
					keyPath: vv,
					autoIncrement: !0
				}).createIndex(yv, bv, { unique: !0 });
				let r = t.store(_v), i = n.map(((e) => r.put(e)));
				return Y.waitFor(i);
			}));
		}(e, i)))), a = a.next((() => {
			(function(e) {
				e.createObjectStore(Wv, { keyPath: Gv });
			})(e);
		}))), n < 5 && r >= 5 && (a = a.next((() => this.D_(i)))), n < 6 && r >= 6 && (a = a.next((() => (function(e) {
			e.createObjectStore(jv);
		}(e), this.x_(i))))), n < 7 && r >= 7 && (a = a.next((() => this.C_(i)))), n < 8 && r >= 8 && (a = a.next((() => this.F_(e, i)))), n < 9 && r >= 9 && (a = a.next((() => {
			(function(e) {
				e.objectStoreNames.contains("remoteDocumentChanges") && e.deleteObjectStore("remoteDocumentChanges");
			})(e);
		}))), n < 10 && r >= 10 && (a = a.next((() => this.O_(i)))), n < 11 && r >= 11 && (a = a.next((() => {
			(function(e) {
				e.createObjectStore(Kv, { keyPath: qv });
			})(e), function(e) {
				e.createObjectStore(Jv, { keyPath: Yv });
			}(e);
		}))), n < 12 && r >= 12 && (a = a.next((() => {
			(function(e) {
				let t = e.createObjectStore(cy, { keyPath: ly });
				t.createIndex(uy, dy, { unique: !1 }), t.createIndex(fy, py, { unique: !1 });
			})(e);
		}))), n < 13 && r >= 13 && (a = a.next((() => function(e) {
			let t = e.createObjectStore(Tv, { keyPath: Ev });
			t.createIndex(Dv, Ov), t.createIndex(kv, Av);
		}(e))).next((() => this.M_(e, i))).next((() => e.deleteObjectStore(fv)))), n < 14 && r >= 14 && (a = a.next((() => this.N_(e, i)))), n < 15 && r >= 15 && (a = a.next((() => function(e) {
			e.createObjectStore(Xv, {
				keyPath: Zv,
				autoIncrement: !0
			}).createIndex(Qv, $v, { unique: !1 }), e.createObjectStore(ey, { keyPath: ty }).createIndex(ny, ry, { unique: !1 }), e.createObjectStore(iy, { keyPath: ay }).createIndex(oy, sy, { unique: !1 });
		}(e)))), n < 16 && r >= 16 && (a = a.next((() => {
			t.objectStore(ey).clear();
		})).next((() => {
			t.objectStore(iy).clear();
		}))), n < 17 && r >= 17 && (a = a.next((() => {
			(function(e) {
				e.createObjectStore(my, { keyPath: hy });
			})(e);
		}))), n < 18 && r >= 18 && le() && (a = a.next((() => {
			t.objectStore(ey).clear();
		})).next((() => {
			t.objectStore(iy).clear();
		}))), a;
	}
	x_(e) {
		let t = 0;
		return e.store(fv).jn(((e, n) => {
			t += Ty(n);
		})).next((() => {
			let n = { byteSize: t };
			return e.store(jv).put(Mv, n);
		}));
	}
	D_(e) {
		let t = e.store(hv), n = e.store(_v);
		return t.Kn().next(((t) => Y.forEach(t, ((t) => {
			let r = IDBKeyRange.bound([t.userId, kl], [t.userId, t.lastAcknowledgedBatchId]);
			return n.Kn(yv, r).next(((n) => Y.forEach(n, ((n) => {
				F(n.userId === t.userId, 18650, "Cannot process batch from unexpected user", { batchId: n.batchId });
				let r = Iy(this.serializer, n);
				return wy(e, t.userId, r).next((() => {}));
			}))));
		}))));
	}
	C_(e) {
		let t = e.store(Iv), n = e.store(fv);
		return e.store(Vv).get(Bv).next(((e) => {
			let r = [];
			return n.jn(((n, i) => {
				let a = new V(n), o = function(e) {
					return [0, cv(e)];
				}(a);
				r.push(t.get(o).next(((n) => n ? Y.resolve() : ((n) => t.put({
					targetId: 0,
					path: cv(n),
					sequenceNumber: e.highestListenSequenceNumber
				}))(a))));
			})).next((() => Y.waitFor(r)));
		}));
	}
	F_(e, t) {
		e.createObjectStore(Hv, { keyPath: Uv });
		let n = t.store(Hv), r = new Eb(), i = (e) => {
			if (r.add(e)) {
				let t = e.lastSegment(), r = e.popLast();
				return n.put({
					collectionId: t,
					parent: cv(r)
				});
			}
		};
		return t.store(fv).jn({ zn: !0 }, ((e, t) => {
			let n = new V(e);
			return i(n.popLast());
		})).next((() => t.store(wv).jn({ zn: !0 }, (([e, t, n], r) => {
			let a = dv(t);
			return i(a.popLast());
		}))));
	}
	O_(e) {
		let t = e.store(Nv);
		return t.jn(((e, n) => {
			let r = Ly(this.serializer, n), i = Ry(this.serializer, r);
			return t.put(i);
		}));
	}
	M_(e, t) {
		let n = t.store(fv), r = [];
		return n.jn(((e, n) => {
			let i = t.store(Tv), a = function(e) {
				return e.document ? new H(V.fromString(e.document.name).popFirst(5)) : e.noDocument ? H.fromSegments(e.noDocument.path) : e.unknownDocument ? H.fromSegments(e.unknownDocument.path) : P(36783);
			}(n).path.toArray(), o = {
				prefixPath: a.slice(0, a.length - 2),
				collectionGroup: a[a.length - 2],
				documentId: a[a.length - 1],
				readTime: n.readTime || [0, 0],
				unknownDocument: n.unknownDocument,
				noDocument: n.noDocument,
				document: n.document,
				hasCommittedMutations: !!n.hasCommittedMutations
			};
			r.push(i.put(o));
		})).next((() => Y.waitFor(r)));
	}
	N_(e, t) {
		let n = t.store(_v), r = Xb(this.serializer), i = new mx(gx.w_, this.serializer.qr);
		return n.Kn().next(((e) => {
			let n = /* @__PURE__ */ new Map();
			return e.forEach(((e) => {
				let t = n.get(e.userId) ?? J();
				Iy(this.serializer, e).keys().forEach(((e) => t = t.add(e))), n.set(e.userId, t);
			})), Y.forEach(n, ((e, n) => {
				let a = new Mp(n), o = $y.Kr(this.serializer, a), s = i.getIndexManager(a), c = Gy.Kr(a, this.serializer, s, i.referenceDelegate);
				return new ix(r, c, o, s).recalculateAndSaveOverlaysForDocumentKeys(new Ey(t, hm.yn), e).next();
			}));
		}));
	}
};
function yx(e) {
	e.createObjectStore(Iv, { keyPath: Lv }).createIndex(Rv, zv, { unique: !0 }), e.createObjectStore(Nv, { keyPath: "targetId" }).createIndex(Pv, Fv, { unique: !0 }), e.createObjectStore(Vv);
}
var bx = "IndexedDbPersistence", xx = 18e5, Sx = 5e3, Cx = "Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.", wx = "main", Tx = class e {
	constructor(t, n, r, i, a, o, s, c, l, u, d = 18) {
		if (this.allowTabSynchronization = t, this.persistenceKey = n, this.clientId = r, this.xt = a, this.window = o, this.document = s, this.L_ = l, this.B_ = u, this.U_ = d, this.P_ = null, this.R_ = !1, this.isPrimary = !1, this.networkEnabled = !0, this.k_ = null, this.inForeground = !1, this.q_ = null, this.K_ = null, this.Q_ = -Infinity, this.W_ = (e) => Promise.resolve(), !e.Je()) throw new B(z.UNIMPLEMENTED, "This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");
		this.referenceDelegate = new Bb(this, i), this.G_ = n + wx, this.serializer = new Ay(c), this.z_ = new xm(this.G_, this.U_, new vx(this.serializer)), this.I_ = new tb(), this.A_ = new Ib(this.referenceDelegate, this.serializer), this.remoteDocumentCache = Xb(this.serializer), this.d_ = new Xy(), this.window && this.window.localStorage ? this.j_ = this.window.localStorage : (this.j_ = null, !1 === u && kc(bx, "LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."));
	}
	start() {
		return this.H_().then((() => {
			if (!this.isPrimary && !this.allowTabSynchronization) throw new B(z.FAILED_PRECONDITION, Cx);
			return this.J_(), this.Y_(), this.Z_(), this.runTransaction("getHighestListenSequenceNumber", "readonly", ((e) => this.A_.getHighestSequenceNumber(e)));
		})).then(((e) => {
			this.P_ = new hm(e, this.L_);
		})).then((() => {
			this.R_ = !0;
		})).catch(((e) => (this.z_ && this.z_.close(), Promise.reject(e))));
	}
	X_(e) {
		return this.W_ = async (t) => {
			if (this.started) return e(t);
		}, e(this.isPrimary);
	}
	setDatabaseDeletedListener(e) {
		this.z_.Ln((async (t) => {
			t.newVersion === null && await e();
		}));
	}
	setNetworkEnabled(e) {
		this.networkEnabled !== e && (this.networkEnabled = e, this.xt.enqueueAndForget((async () => {
			this.started && await this.H_();
		})));
	}
	H_() {
		return this.runTransaction("updateClientMetadataAndTryBecomePrimary", "readwrite", ((e) => Dx(e).put({
			clientId: this.clientId,
			updateTimeMs: Date.now(),
			networkEnabled: this.networkEnabled,
			inForeground: this.inForeground
		}).next((() => {
			if (this.isPrimary) return this.eo(e).next(((e) => {
				e || (this.isPrimary = !1, this.xt.enqueueRetryable((() => this.W_(!1))));
			}));
		})).next((() => this.no(e))).next(((t) => this.isPrimary && !t ? this.ro(e).next((() => !1)) : !!t && this.io(e).next((() => !0)))))).catch(((e) => {
			if (Tm(e)) return N(bx, "Failed to extend owner lease: ", e), this.isPrimary;
			if (!this.allowTabSynchronization) throw e;
			return N(bx, "Releasing owner lease after error during lease refresh", e), !1;
		})).then(((e) => {
			this.isPrimary !== e && this.xt.enqueueRetryable((() => this.W_(e))), this.isPrimary = e;
		}));
	}
	eo(e) {
		return Ex(e).get(mv).next(((e) => Y.resolve(this.so(e))));
	}
	_o(e) {
		return Dx(e).delete(this.clientId);
	}
	async oo() {
		if (this.isPrimary && !this.ao(this.Q_, xx)) {
			this.Q_ = Date.now();
			let e = await this.runTransaction("maybeGarbageCollectMultiClientState", "readwrite-primary", ((e) => {
				let t = Dy(e, Wv);
				return t.Kn().next(((e) => {
					let n = this.uo(e, xx), r = e.filter(((e) => n.indexOf(e) === -1));
					return Y.forEach(r, ((e) => t.delete(e.clientId))).next((() => r));
				}));
			})).catch((() => []));
			if (this.j_) for (let t of e) this.j_.removeItem(this.co(t.clientId));
		}
	}
	Z_() {
		this.K_ = this.xt.enqueueAfterDelay("client_metadata_refresh", 4e3, (() => this.H_().then((() => this.oo())).then((() => this.Z_()))));
	}
	so(e) {
		return !!e && e.ownerId === this.clientId;
	}
	no(e) {
		return this.B_ ? Y.resolve(!0) : Ex(e).get(mv).next(((t) => {
			if (t !== null && this.ao(t.leaseTimestampMs, Sx) && !this.lo(t.ownerId)) {
				if (this.so(t) && this.networkEnabled) return !0;
				if (!this.so(t)) {
					if (!t.allowTabSynchronization) throw new B(z.FAILED_PRECONDITION, Cx);
					return !1;
				}
			}
			return !(!this.networkEnabled || !this.inForeground) || Dx(e).Kn().next(((e) => this.uo(e, Sx).find(((e) => {
				if (this.clientId !== e.clientId) {
					let t = !this.networkEnabled && e.networkEnabled, n = !this.inForeground && e.inForeground, r = this.networkEnabled === e.networkEnabled;
					if (t || n && r) return !0;
				}
				return !1;
			})) === void 0));
		})).next(((e) => (this.isPrimary !== e && N(bx, `Client ${e ? "is" : "is not"} eligible for a primary lease.`), e)));
	}
	async shutdown() {
		this.R_ = !1, this.Eo(), this.K_ &&= (this.K_.cancel(), null), this.ho(), this.To(), await this.z_.runTransaction("shutdown", "readwrite", [pv, Wv], ((e) => {
			let t = new Ey(e, hm.yn);
			return this.ro(t).next((() => this._o(t)));
		})), this.z_.close(), this.Po();
	}
	uo(e, t) {
		return e.filter(((e) => this.ao(e.updateTimeMs, t) && !this.lo(e.clientId)));
	}
	Ro() {
		return this.runTransaction("getActiveClients", "readonly", ((e) => Dx(e).Kn().next(((e) => this.uo(e, xx).map(((e) => e.clientId))))));
	}
	get started() {
		return this.R_;
	}
	getGlobalsCache() {
		return this.I_;
	}
	getMutationQueue(e, t) {
		return Gy.Kr(e, this.serializer, t, this.referenceDelegate);
	}
	getTargetCache() {
		return this.A_;
	}
	getRemoteDocumentCache() {
		return this.remoteDocumentCache;
	}
	getIndexManager(e) {
		return new kb(e, this.serializer.qr.databaseId);
	}
	getDocumentOverlayCache(e) {
		return $y.Kr(this.serializer, e);
	}
	getBundleCache() {
		return this.d_;
	}
	runTransaction(e, t, n) {
		N(bx, "Starting transaction:", e);
		let r = t === "readonly" ? "readonly" : "readwrite", i = function(e) {
			return e === 18 ? Cy : e === 17 ? Sy : e === 16 ? xy : e === 15 ? by : e === 14 ? yy : e === 13 ? vy : e === 12 ? _y : e === 11 ? gy : void P(60245);
		}(this.U_), a;
		return this.z_.runTransaction(e, r, i, ((r) => (a = new Ey(r, this.P_ ? this.P_.next() : hm.yn), t === "readwrite-primary" ? this.eo(a).next(((e) => !!e || this.no(a))).next(((t) => {
			if (!t) throw kc(`Failed to obtain primary lease for action '${e}'.`), this.isPrimary = !1, this.xt.enqueueRetryable((() => this.W_(!1))), new B(z.FAILED_PRECONDITION, gm);
			return n(a);
		})).next(((e) => this.io(a).next((() => e)))) : this.Io(a).next((() => n(a)))))).then(((e) => (a.raiseOnCommittedEvent(), e)));
	}
	Io(e) {
		return Ex(e).get(mv).next(((e) => {
			if (e !== null && this.ao(e.leaseTimestampMs, Sx) && !this.lo(e.ownerId) && !this.so(e) && !(this.B_ || this.allowTabSynchronization && e.allowTabSynchronization)) throw new B(z.FAILED_PRECONDITION, Cx);
		}));
	}
	io(e) {
		let t = {
			ownerId: this.clientId,
			allowTabSynchronization: this.allowTabSynchronization,
			leaseTimestampMs: Date.now()
		};
		return Ex(e).put(mv, t);
	}
	static Je() {
		return xm.Je();
	}
	ro(e) {
		let t = Ex(e);
		return t.get(mv).next(((e) => this.so(e) ? (N(bx, "Releasing primary lease."), t.delete(mv)) : Y.resolve()));
	}
	ao(e, t) {
		let n = Date.now();
		return !(e < n - t) && (!(e > n) || (kc(`Detected an update time that is in the future: ${e} > ${n}`), !1));
	}
	J_() {
		this.document !== null && typeof this.document.addEventListener == "function" && (this.q_ = () => {
			this.xt.enqueueAndForget((() => (this.inForeground = this.document.visibilityState === "visible", this.H_())));
		}, this.document.addEventListener("visibilitychange", this.q_), this.inForeground = this.document.visibilityState === "visible");
	}
	ho() {
		this.q_ &&= (this.document.removeEventListener("visibilitychange", this.q_), null);
	}
	Y_() {
		typeof this.window?.addEventListener == "function" && (this.k_ = () => {
			this.Eo();
			let e = /(?:Version|Mobile)\/1[456]/;
			ce() && (navigator.appVersion.match(e) || navigator.userAgent.match(e)) && this.xt.enterRestrictedMode(!0), this.xt.enqueueAndForget((() => this.shutdown()));
		}, this.window.addEventListener("pagehide", this.k_));
	}
	To() {
		this.k_ &&= (this.window.removeEventListener("pagehide", this.k_), null);
	}
	lo(e) {
		try {
			let t = this.j_?.getItem(this.co(e)) !== null;
			return N(bx, `Client '${e}' ${t ? "is" : "is not"} zombied in LocalStorage`), t;
		} catch (e) {
			return kc(bx, "Failed to get zombied client id.", e), !1;
		}
	}
	Eo() {
		if (this.j_) try {
			this.j_.setItem(this.co(this.clientId), String(Date.now()));
		} catch (e) {
			kc("Failed to set zombie client id.", e);
		}
	}
	Po() {
		if (this.j_) try {
			this.j_.removeItem(this.co(this.clientId));
		} catch {}
	}
	co(e) {
		return `firestore_zombie_${this.persistenceKey}_${e}`;
	}
};
function Ex(e) {
	return Dy(e, pv);
}
function Dx(e) {
	return Dy(e, Wv);
}
function Ox(e, t) {
	let n = e.projectId;
	return e.isDefaultDatabase || (n += "." + e.database), "firestore/" + t + "/" + n + "/";
}
var kx = class e {
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
function Ax(e, t) {
	return H.comparator(e.key, t.key);
}
var jx = class {
	constructor() {
		this._documentReadCount = 0;
	}
	get documentReadCount() {
		return this._documentReadCount;
	}
	incrementDocumentReadCount(e) {
		this._documentReadCount += e;
	}
}, Mx = class {
	constructor() {
		this.mo = !1, this.po = !1, this.yo = 100, this.wo = function() {
			return ce() ? 8 : Sm(h()) > 0 ? 6 : 4;
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
			let n = new jx();
			return this.Do(e, t, n).next(((r) => {
				if (i.result = r, this.po) return this.xo(e, t, n, r.size);
			}));
		})).next((() => i.result));
	}
	xo(e, t, n, r) {
		return Q_(t) ? Y.resolve() : n.documentReadCount < this.yo ? (Oc() <= _.DEBUG && N("QueryEngine", "SDK will not create cache indexes for query:", $d(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.yo, "documents"), Y.resolve()) : (Oc() <= _.DEBUG && N("QueryEngine", "Query:", $d(t), "scans", n.documentReadCount, "local documents and returns", r, "documents as results."), n.documentReadCount > this.wo * r ? (Oc() <= _.DEBUG && N("QueryEngine", "The SDK decides to create cache indexes for query:", $d(t), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, Jd(t))) : Y.resolve());
	}
	So(e, t) {
		if (Q_(t)) return Y.resolve(null);
		let n = t;
		if (Wd(n)) return Y.resolve(null);
		let r = Jd(n);
		return this.indexManager.getIndexType(e, r).next(((t) => t === 0 ? null : (n.limit !== null && t === 1 && (n = Zd(n, null, "F"), r = Jd(n)), this.indexManager.getDocumentsMatchingTarget(e, r).next(((t) => {
			let i = J(...t);
			return this.bo.getDocuments(e, i).next(((t) => this.indexManager.getMinOffset(e, r).next(((r) => {
				let a = this.Co(n, t);
				return this.Fo(n, a, i, r.readTime) ? this.So(e, Zd(n, null, "F")) : this.Oo(e, a, n, r);
			}))));
		})))));
	}
	vo(e, t, n, r) {
		return (Q_(t) ? function(e) {
			for (let t of e.stages) {
				if (t instanceof Zh || t instanceof Qh) return !1;
				if (t instanceof Xh) {
					if (t.condition instanceof Ph && t.condition._expr.name === "exists" && t.condition._expr.params[0] instanceof Dh && t.condition._expr.params[0].fieldName === Kc) continue;
					return !1;
				}
			}
			return !0;
		}(t) : Wd(t)) || r.isEqual(K.min()) ? Y.resolve(null) : this.bo.getDocuments(e, n).next(((i) => {
			let a = this.Co(t, i);
			return this.Fo(t, a, n, r) ? Y.resolve(null) : (Oc() <= _.DEBUG && N("QueryEngine", "Re-using previous result from %s to execute query: %s", r.toString(), $_(t)), this.Oo(e, a, t, Od(r, Sd)).next(((e) => e)));
		}));
	}
	Co(e, t) {
		let n, r;
		return Q_(e) ? (n = new R(Ax), r = (t) => Ub(e, t)) : (n = new R(tf(e)), r = (t) => ef(e, t)), t.forEach(((e, t) => {
			r(t) && (n = n.add(t));
		})), n;
	}
	Fo(e, t, n, r) {
		if (Q_(e)) return function(e) {
			return e.stages.some(((e) => e instanceof Zh || e instanceof Qh));
		}(e);
		if (e.limit === null) return !1;
		if (n.size !== t.size) return !0;
		let i = e.limitType === "F" ? t.last() : t.first();
		return !!i && (i.hasPendingWrites || i.version.compareTo(r) > 0);
	}
	Do(e, t, n) {
		return Oc() <= _.DEBUG && N("QueryEngine", "Using full collection scan to execute query:", $_(t)), this.bo.getDocumentsMatchingQuery(e, t, Ad.min(), n);
	}
	Oo(e, t, n, r) {
		return this.bo.getDocumentsMatchingQuery(e, n, r).next(((e) => (t.forEach(((t) => {
			e = e.insert(t.key, t);
		})), e)));
	}
}, Nx = "LocalStore", Px = 3e8, Fx = class {
	constructor(e, t, n, r) {
		this.persistence = e, this.Mo = t, this.serializer = r, this.No = new Vc(L), this.Lo = new cf(((e) => nv(e)), rv), this.Bo = /* @__PURE__ */ new Map(), this.Uo = e.getRemoteDocumentCache(), this.A_ = e.getTargetCache(), this.d_ = e.getBundleCache(), this.ko(n);
	}
	ko(e) {
		this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new ix(this.Uo, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.Uo.setIndexManager(this.indexManager), this.Mo.initialize(this.localDocuments, this.indexManager);
	}
	collectGarbage(e) {
		return this.persistence.runTransaction("Collect garbage", "readwrite-primary", ((t) => e.collect(t, this.No)));
	}
};
function Ix(e, t, n, r) {
	return new Fx(e, t, n, r);
}
async function Lx(e, t) {
	let n = I(e);
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
function Rx(e, t) {
	let n = I(e);
	return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", ((e) => {
		let r = t.batch.keys(), i = n.Uo.newChangeBuffer({ trackRemovals: !0 });
		return function(e, t, n, r) {
			let i = n.batch, a = i.keys(), o = Y.resolve();
			return a.forEach(((e) => {
				o = o.next((() => r.getEntry(t, e))).next(((t) => {
					let a = n.docVersions.get(e);
					F(a !== null, 48541), t.version.compareTo(a) < 0 && (i.applyToRemoteDocument(t, n), t.isValidDocument() && (t.setReadTime(n.commitVersion), r.addEntry(t)));
				}));
			})), o.next((() => e.mutationQueue.removeMutationBatch(t, i)));
		}(n, e, t, i).next((() => i.apply(e))).next((() => n.mutationQueue.performConsistencyCheck(e))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(e, r, t.batch.batchId))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e, function(e) {
			let t = J();
			for (let n = 0; n < e.mutationResults.length; ++n) e.mutationResults[n].transformResults.length > 0 && (t = t.add(e.batch.mutations[n].key));
			return t;
		}(t)))).next((() => n.localDocuments.getDocuments(e, r)));
	}));
}
function zx(e) {
	let t = I(e);
	return t.persistence.runTransaction("Get last remote snapshot version", "readonly", ((e) => t.A_.getLastRemoteSnapshotVersion(e)));
}
function Bx(e, t) {
	let n = I(e), r = t.snapshotVersion, i = n.No;
	return n.persistence.runTransaction("Apply remote event", "readwrite-primary", ((e) => {
		let a = n.Uo.newChangeBuffer({ trackRemovals: !0 });
		i = n.No;
		let o = [];
		t.targetChanges.forEach(((a, s) => {
			let c = i.get(s);
			if (!c) return;
			o.push(n.A_.removeMatchingKeys(e, a.removedDocuments, s).next((() => n.A_.addMatchingKeys(e, a.addedDocuments, s))));
			let l = c.withSequenceNumber(e.currentSequenceNumber);
			t.targetMismatches.get(s) === null ? a.resumeToken.approximateByteSize() > 0 && (l = l.withResumeToken(a.resumeToken, r)) : l = l.withResumeToken(ml.EMPTY_BYTE_STRING, K.min()).withLastLimboFreeSnapshotVersion(K.min()), i = i.insert(s, l), function(e, t, n) {
				return e.resumeToken.approximateByteSize() === 0 || t.snapshotVersion.toMicroseconds() - e.snapshotVersion.toMicroseconds() >= Px || n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0;
			}(c, l, a) && o.push(n.A_.updateTargetData(e, l));
		}));
		let s = uf(), c = J();
		if (t.documentUpdates.forEach(((r) => {
			t.resolvedLimboDocuments.has(r) && o.push(n.persistence.referenceDelegate.updateLimboDocument(e, r));
		})), o.push(Vx(e, a, t.documentUpdates).next(((e) => {
			s = e.$o, c = e.Ko;
		}))), !r.isEqual(K.min())) {
			let t = n.A_.getLastRemoteSnapshotVersion(e).next(((t) => n.A_.setTargetsMetadata(e, e.currentSequenceNumber, r)));
			o.push(t);
		}
		return Y.waitFor(o).next((() => a.apply(e))).next((() => n.localDocuments.getLocalViewOfDocuments(e, s, c))).next((() => s));
	})).then(((e) => (n.No = i, e)));
}
function Vx(e, t, n) {
	let r = J(), i = J();
	return n.forEach(((e) => r = r.add(e))), t.getEntries(e, r).next(((e) => {
		let r = uf();
		return n.forEach(((n, a) => {
			let o = e.get(n);
			a.isFoundDocument() !== o.isFoundDocument() && (i = i.add(n)), a.isNoDocument() && a.version.isEqual(K.min()) ? (t.removeEntry(n, a.readTime), r = r.insert(n, a)) : !o.isValidDocument() || a.version.compareTo(o.version) > 0 || a.version.compareTo(o.version) === 0 && o.hasPendingWrites ? (t.addEntry(a), r = r.insert(n, a)) : N(Nx, "Ignoring outdated watch update for ", n, ". Current version:", o.version, " Watch version:", a.version);
		})), {
			$o: r,
			Ko: i
		};
	}));
}
function Hx(e, t) {
	let n = I(e);
	return n.persistence.runTransaction("Get next mutation batch", "readonly", ((e) => (t === void 0 && (t = kl), n.mutationQueue.getNextMutationBatchAfterBatchId(e, t))));
}
function Ux(e, t) {
	let n = I(e);
	return n.persistence.runTransaction("Allocate target", "readwrite", ((e) => {
		let r;
		return n.A_.getTargetData(e, t).next(((i) => i ? (r = i, Y.resolve(r)) : n.A_.allocateTargetId(e).next(((i) => (r = new ky(t, i, "TargetPurposeListen", e.currentSequenceNumber), n.A_.addTargetData(e, r).next((() => r)))))));
	})).then(((e) => {
		let r = n.No.get(e.targetId);
		return (r === null || e.snapshotVersion.compareTo(r.snapshotVersion) > 0) && (n.No = n.No.insert(e.targetId, e), n.Lo.set(t, e.targetId)), e;
	}));
}
async function Wx(e, t, n) {
	let r = I(e), i = r.No.get(t), a = n ? "readwrite" : "readwrite-primary";
	try {
		n || await r.persistence.runTransaction("Release target", a, ((e) => r.persistence.referenceDelegate.removeTarget(e, i)));
	} catch (e) {
		if (!Tm(e)) throw e;
		N(Nx, `Failed to update sequence numbers for target ${t}: ${e}`);
	}
	r.No = r.No.remove(t), r.Lo.delete(i.target);
}
function Gx(e, t, n) {
	let r = I(e), i = K.min(), a = J();
	return r.persistence.runTransaction("Execute query", "readwrite", ((e) => function(e, t, n) {
		let r = I(e), i = r.Lo.get(n);
		return i === void 0 ? r.A_.getTargetData(t, n) : Y.resolve(r.No.get(i));
	}(r, e, Q_(t) ? t : Jd(t)).next(((t) => {
		if (t) return i = t.lastLimboFreeSnapshotVersion, r.A_.getMatchingKeysForTargetId(e, t.targetId).next(((e) => {
			a = e;
		}));
	})).next((() => r.Mo.getDocumentsMatchingQuery(e, t, n ? i : K.min(), n ? a : J()))).next(((e) => (Jx(r, e), {
		documents: e,
		Qo: a
	})))));
}
function Kx(e, t) {
	let n = I(e), r = I(n.A_), i = n.No.get(t);
	return i ? Promise.resolve(i.target ?? null) : n.persistence.runTransaction("Get target data", "readonly", ((e) => r.ge(e, t).next(((e) => e?.target ?? null))));
}
function qx(e, t) {
	let n = I(e), r = n.Bo.get(t) || K.min();
	return n.persistence.runTransaction("Get new document changes", "readonly", ((e) => n.Uo.getAllFromCollectionGroup(e, t, Od(r, Sd), 2 ** 53 - 1))).then(((e) => (Jx(n, e), e)));
}
function Jx(e, t) {
	t.forEach(((t, n) => {
		let r = n.key.getCollectionGroup(), i = e.Bo.get(r) || K.min();
		n.readTime.compareTo(i) > 0 && e.Bo.set(r, n.readTime);
	}));
}
var Yx = class {
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
		this.Zo ? (kc(t), this.Zo = !1) : N("OnlineStateTracker", t);
	}
	ra() {
		this.Yo !== null && (this.Yo.cancel(), this.Yo = null);
	}
}, Xx = "RemoteStore", Zx = class {
	constructor(e, t, n, r, i) {
		this.localStore = e, this.datastore = t, this.asyncQueue = n, this.remoteSyncer = {}, this.ia = [], this.sa = /* @__PURE__ */ new Map(), this._a = /* @__PURE__ */ new Map(), this.oa = /* @__PURE__ */ new Map(), this.aa = new Fb(1e3), this.ua = new Fb(1001), this.ca = /* @__PURE__ */ new Set(), this.la = [], this.Ea = i, this.Ea.Ke(((e) => {
			n.enqueueAndForget((async () => {
				sS(this) && (N(Xx, "Restarting streams for network reachability change."), await async function(e) {
					let t = I(e);
					t.ca.add(4), await $x(t), t.ha.set("Unknown"), t.ca.delete(4), await Qx(t);
				}(this));
			}));
		})), this.ha = new Yx(n, r);
	}
};
async function Qx(e) {
	if (sS(e)) for (let t of e.la) await t(!0);
}
async function $x(e) {
	for (let t of e.la) await t(!1);
}
function eS(e, t) {
	return e._a.get(t) || void 0;
}
function tS(e, t) {
	let n = I(e), r = eS(n, t.targetId);
	if (r !== void 0 && n.sa.has(r)) return;
	let i = function(e, t) {
		let n = eS(e, t);
		n !== void 0 && e.oa.delete(n);
		let r = function(e, t) {
			return t % 2 == 0 ? e.aa.next() : e.ua.next();
		}(e, t);
		return e._a.set(t, r), e.oa.set(r, t), r;
	}(n, t.targetId);
	N(Xx, "remoteStoreListen mapping SDK target ID to remote", t.targetId, i);
	let a = new ky(t.target, i, t.purpose, t.sequenceNumber, t.snapshotVersion, t.lastLimboFreeSnapshotVersion, t.resumeToken);
	n.sa.set(i, a), oS(n) ? aS(n) : ES(n).Jt() && rS(n, a);
}
function nS(e, t) {
	let n = I(e), r = ES(n), i = eS(n, t);
	N(Xx, "remoteStoreUnlisten removing mapping of SDK target ID to remote", t, i), n.sa.delete(i), n._a.delete(t), n.oa.delete(i), r.Jt() && iS(n, i), n.sa.size === 0 && (r.Jt() ? r.Xt() : sS(n) && n.ha.set("Unknown"));
}
function rS(e, t) {
	if (e.Ta.H(t.targetId), t.resumeToken.approximateByteSize() > 0 || t.snapshotVersion.compareTo(K.min()) > 0) {
		let n = e.oa.get(t.targetId);
		if (n === void 0) return void N(Xx, "SDK target ID not found for remote ID: " + t.targetId);
		let r = e.remoteSyncer.getRemoteKeysForTarget(n).size;
		t = t.withExpectedCount(r);
	}
	ES(e).Tn(t);
}
function iS(e, t) {
	e.Ta.H(t), ES(e).Pn(t);
}
function aS(e) {
	e.Ta = new Ff({
		getRemoteKeysForTarget: (t) => {
			let n = e.oa.get(t);
			return n === void 0 ? J() : e.remoteSyncer.getRemoteKeysForTarget(n);
		},
		ge: (t) => e.sa.get(t) || null,
		Ae: () => e.datastore.serializer.databaseId
	}), ES(e).start(), e.ha.Xo();
}
function oS(e) {
	return sS(e) && !ES(e).Ht() && e.sa.size > 0;
}
function sS(e) {
	return I(e).ca.size === 0;
}
function cS(e) {
	e.Ta = void 0;
}
async function lS(e) {
	e.ha.set("Online");
}
async function uS(e) {
	e.sa.forEach(((t, n) => {
		rS(e, t);
	}));
}
async function dS(e, t) {
	cS(e), oS(e) ? (e.ha.na(t), aS(e)) : e.ha.set("Unknown");
}
async function fS(e, t, n) {
	if (e.ha.set("Online"), t instanceof Mf && t.state === 2 && t.cause) try {
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
		N(Xx, "Failed to remove targets %s: %s ", t.targetIds.join(","), n), await pS(e, n);
	}
	else if (t instanceof Af ? e.Ta.se(t) : t instanceof jf ? e.Ta.Ee(t) : e.Ta.ae(t), !n.isEqual(K.min())) try {
		let t = await zx(e.localStore);
		n.compareTo(t) >= 0 && await function(e, t) {
			let n = e.Ta.de(t);
			n.targetChanges.forEach(((n, r) => {
				if (n.resumeToken.approximateByteSize() > 0) {
					let i = e.sa.get(r);
					i && e.sa.set(r, i.withResumeToken(n.resumeToken, t));
				}
			})), n.targetMismatches.forEach(((t, n) => {
				let r = e.sa.get(t);
				r && (e.sa.set(t, r.withResumeToken(ml.EMPTY_BYTE_STRING, r.snapshotVersion)), iS(e, t), rS(e, new ky(r.target, t, n, r.sequenceNumber)));
			}));
			let r = function(e, t) {
				let n = /* @__PURE__ */ new Map();
				t.targetChanges.forEach(((t, r) => {
					let i = e.oa.get(r);
					i !== void 0 && n.set(i, t);
				}));
				let r = new Vc(L);
				return t.targetMismatches.forEach(((t, n) => {
					let i = e.oa.get(t);
					i !== void 0 && (r = r.insert(i, n));
				})), new Of(t.snapshotVersion, n, r, t.documentUpdates, t.augmentedDocumentUpdates, t.resolvedLimboDocuments);
			}(e, n);
			return e.remoteSyncer.applyRemoteEvent(r);
		}(e, n);
	} catch (t) {
		N(Xx, "Failed to raise snapshot:", t), await pS(e, t);
	}
}
async function pS(e, t, n) {
	if (!Tm(t)) throw t;
	e.ca.add(1), await $x(e), e.ha.set("Offline"), n ||= () => zx(e.localStore), e.asyncQueue.enqueueRetryable((async () => {
		N(Xx, "Retrying IndexedDB access"), await n(), e.ca.delete(1), await Qx(e);
	}));
}
function mS(e, t) {
	return t().catch(((n) => pS(e, n, t)));
}
async function hS(e) {
	let t = I(e), n = DS(t), r = t.ia.length > 0 ? t.ia[t.ia.length - 1].batchId : kl;
	for (; gS(t);) try {
		let e = await Hx(t.localStore, r);
		if (e === null) {
			t.ia.length === 0 && n.Xt();
			break;
		}
		r = e.batchId, _S(t, e);
	} catch (e) {
		await pS(t, e);
	}
	vS(t) && yS(t);
}
function gS(e) {
	return sS(e) && e.ia.length < 10;
}
function _S(e, t) {
	e.ia.push(t);
	let n = DS(e);
	n.Jt() && n.Rn && n.In(t.mutations);
}
function vS(e) {
	return sS(e) && !DS(e).Ht() && e.ia.length > 0;
}
function yS(e) {
	DS(e).start();
}
async function bS(e) {
	DS(e).dn();
}
async function xS(e) {
	let t = DS(e);
	for (let n of e.ia) t.In(n.mutations);
}
async function SS(e, t, n) {
	let r = e.ia.shift(), i = ov.from(r, t, n);
	await mS(e, (() => e.remoteSyncer.applySuccessfulWrite(i))), await hS(e);
}
async function CS(e, t) {
	t && DS(e).Rn && await async function(e, t) {
		if (function(e) {
			return of(e) && e !== z.ABORTED;
		}(t.code)) {
			let n = e.ia.shift();
			DS(e).Zt(), await mS(e, (() => e.remoteSyncer.rejectFailedWrite(n.batchId, t))), await hS(e);
		}
	}(e, t), vS(e) && yS(e);
}
async function wS(e, t) {
	let n = I(e);
	n.asyncQueue.verifyOperationInProgress(), N(Xx, "RemoteStore received new credentials");
	let r = sS(n);
	n.ca.add(3), await $x(n), r && n.ha.set("Unknown"), await n.remoteSyncer.handleCredentialChange(t), n.ca.delete(3), await Qx(n);
}
async function TS(e, t) {
	let n = I(e);
	t ? (n.ca.delete(2), await Qx(n)) : t || (n.ca.add(2), await $x(n), n.ha.set("Unknown"));
}
function ES(e) {
	return e.Pa || (e.Pa = function(e, t, n) {
		let r = I(e);
		return r.mn(), new im(t, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
	}(e.datastore, e.asyncQueue, {
		ut: lS.bind(null, e),
		lt: uS.bind(null, e),
		ht: dS.bind(null, e),
		hn: fS.bind(null, e)
	}), e.la.push((async (t) => {
		t ? (e.Pa.Zt(), oS(e) ? aS(e) : e.ha.set("Unknown")) : (await e.Pa.stop(), cS(e));
	}))), e.Pa;
}
function DS(e) {
	return e.Ra || (e.Ra = function(e, t, n) {
		let r = I(e);
		return r.mn(), new am(t, r.connection, r.authCredentials, r.appCheckCredentials, r.serializer, n);
	}(e.datastore, e.asyncQueue, {
		ut: () => Promise.resolve(),
		lt: bS.bind(null, e),
		ht: CS.bind(null, e),
		An: xS.bind(null, e),
		Vn: SS.bind(null, e)
	}), e.la.push((async (t) => {
		t ? (e.Ra.Zt(), await hS(e)) : (await e.Ra.stop(), e.ia.length > 0 && (N(Xx, `Stopping write stream with ${e.ia.length} pending writes`), e.ia = []));
	}))), e.Ra;
}
var OS = class {
	constructor(e) {
		this.observer = e, this.muted = !1;
	}
	next(e) {
		this.muted || this.observer.next && this.Ia(this.observer.next, e);
	}
	error(e) {
		this.muted || (this.observer.error ? this.Ia(this.observer.error, e) : kc("Uncaught Error in snapshot listener:", e.toString()));
	}
	Aa() {
		this.muted = !0;
	}
	Ia(e, t) {
		setTimeout((() => {
			this.muted || e(t);
		}), 0);
	}
}, kS = class e {
	constructor(e, t, n, r, i) {
		this.asyncQueue = e, this.timerId = t, this.targetTimeMs = n, this.op = r, this.removalCallback = i, this.deferred = new Np(), this.then = this.deferred.promise.then.bind(this.deferred.promise), this.deferred.promise.catch(((e) => {}));
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
		this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new B(z.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
	}
	handleDelayElapsed() {
		this.asyncQueue.enqueueAndForget((() => this.timerHandle === null ? Promise.resolve() : (this.clearTimeout(), this.op().then(((e) => this.deferred.resolve(e))))));
	}
	clearTimeout() {
		this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
	}
};
function AS(e, t) {
	if (kc("AsyncQueue", `${t}: ${e}`), Tm(e)) return new B(z.UNAVAILABLE, `${t}: ${e}`);
	throw e;
}
var jS = "IndexBackfiller", MS = class {
	constructor(e, t) {
		this.asyncQueue = e, this.va = t, this.task = null;
	}
	start() {
		this.Da(15e3);
	}
	stop() {
		this.task &&= (this.task.cancel(), null);
	}
	get started() {
		return this.task !== null;
	}
	Da(e) {
		N(jS, `Scheduled in ${e}ms`), this.task = this.asyncQueue.enqueueAfterDelay("index_backfill", e, (async () => {
			this.task = null;
			try {
				N(jS, `Documents written: ${await this.va.xa()}`);
			} catch (e) {
				Tm(e) ? N(jS, "Ignoring IndexedDB error during index backfill: ", e) : await vm(e);
			}
			await this.Da(6e4);
		}));
	}
}, NS = class {
	constructor(e, t) {
		this.localStore = e, this.persistence = t;
	}
	async xa(e = 50) {
		return this.persistence.runTransaction("Backfill Indexes", "readwrite-primary", ((t) => this.Ca(t, e)));
	}
	Ca(e, t) {
		let n = /* @__PURE__ */ new Set(), r = t, i = !0;
		return Y.doWhile((() => !0 === i && r > 0), (() => this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(((t) => {
			if (t !== null && !n.has(t)) return N(jS, `Processing collection: ${t}`), this.Fa(e, t, r).next(((e) => {
				r -= e, n.add(t);
			}));
			i = !1;
		})))).next((() => t - r));
	}
	Fa(e, t, n) {
		return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e, t).next(((r) => this.localStore.localDocuments.getNextDocuments(e, t, r, n).next(((n) => {
			let i = n.changes;
			return this.localStore.indexManager.updateIndexEntries(e, i).next((() => this.Oa(r, n))).next(((n) => (N(jS, `Updating offset: ${n}`), this.localStore.indexManager.updateCollectionGroup(e, t, n)))).next((() => i.size));
		}))));
	}
	Oa(e, t) {
		let n = e;
		return t.changes.forEach(((e, t) => {
			let r = kd(t);
			jd(r, n) > 0 && (n = r);
		})), new Ad(n.readTime, n.documentKey, Math.max(t.batchId, e.largestBatchId));
	}
}, PS = "firestore_clients";
function FS(e, t) {
	return `${PS}_${e}_${t}`;
}
var IS = "firestore_mutations";
function LS(e, t, n) {
	let r = `${IS}_${e}_${n}`;
	return t.isAuthenticated() && (r += `_${t.uid}`), r;
}
var RS = "firestore_targets";
function zS(e, t) {
	return `${RS}_${e}_${t}`;
}
var BS = "SharedClientState", VS = class e {
	constructor(e, t, n, r) {
		this.user = e, this.batchId = t, this.state = n, this.error = r;
	}
	static Ma(t, n, r) {
		let i = JSON.parse(r), a, o = typeof i == "object" && [
			"pending",
			"acknowledged",
			"rejected"
		].indexOf(i.state) !== -1 && (i.error === void 0 || typeof i.error == "object");
		return o && i.error && (o = typeof i.error.message == "string" && typeof i.error.code == "string", o && (a = new B(i.error.code, i.error.message))), o ? new e(t, n, i.state, a) : (kc(BS, `Failed to parse mutation state for ID '${n}': ${r}`), null);
	}
	Na() {
		let e = {
			state: this.state,
			updateTimeMs: Date.now()
		};
		return this.error && (e.error = {
			code: this.error.code,
			message: this.error.message
		}), JSON.stringify(e);
	}
}, HS = class e {
	constructor(e, t, n) {
		this.targetId = e, this.state = t, this.error = n;
	}
	static Ma(t, n) {
		let r = JSON.parse(n), i, a = typeof r == "object" && [
			"not-current",
			"current",
			"rejected"
		].indexOf(r.state) !== -1 && (r.error === void 0 || typeof r.error == "object");
		return a && r.error && (a = typeof r.error.message == "string" && typeof r.error.code == "string", a && (i = new B(r.error.code, r.error.message))), a ? new e(t, r.state, i) : (kc(BS, `Failed to parse target state for ID '${t}': ${n}`), null);
	}
	Na() {
		let e = {
			state: this.state,
			updateTimeMs: Date.now()
		};
		return this.error && (e.error = {
			code: this.error.code,
			message: this.error.message
		}), JSON.stringify(e);
	}
}, US = class e {
	constructor(e, t) {
		this.clientId = e, this.activeTargetIds = t;
	}
	static Ma(t, n) {
		let r = JSON.parse(n), i = typeof r == "object" && r.activeTargetIds instanceof Array, a = bf();
		for (let e = 0; i && e < r.activeTargetIds.length; ++e) i = Ml(r.activeTargetIds[e]), a = a.add(r.activeTargetIds[e]);
		return i ? new e(t, a) : (kc(BS, `Failed to parse client data for instance '${t}': ${n}`), null);
	}
}, WS = class e {
	constructor(e, t) {
		this.clientId = e, this.onlineState = t;
	}
	static Ma(t) {
		let n = JSON.parse(t);
		return typeof n == "object" && [
			"Unknown",
			"Online",
			"Offline"
		].indexOf(n.onlineState) !== -1 && typeof n.clientId == "string" ? new e(n.clientId, n.onlineState) : (kc(BS, `Failed to parse online state: ${t}`), null);
	}
}, GS = class {
	constructor() {
		this.activeTargetIds = bf();
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
}, KS = class {
	constructor(e, t, n, r, i) {
		this.window = e, this.xt = t, this.persistenceKey = n, this.Ua = r, this.syncEngine = null, this.onlineStateHandler = null, this.sequenceNumberHandler = null, this.ka = this.qa.bind(this), this.$a = new Vc(L), this.started = !1, this.Ka = [];
		let a = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		this.storage = this.window.localStorage, this.currentUser = i, this.Qa = FS(this.persistenceKey, this.Ua), this.Wa = function(e) {
			return `firestore_sequence_number_${e}`;
		}(this.persistenceKey), this.$a = this.$a.insert(this.Ua, new GS()), this.Ga = RegExp(`^${PS}_${a}_([^_]*)$`), this.za = RegExp(`^${IS}_${a}_(\\d+)(?:_(.*))?$`), this.ja = RegExp(`^${RS}_${a}_(\\d+)$`), this.Ha = function(e) {
			return `firestore_online_state_${e}`;
		}(this.persistenceKey), this.Ja = function(e) {
			return `firestore_bundle_loaded_v2_${e}`;
		}(this.persistenceKey), this.window.addEventListener("storage", this.ka);
	}
	static Je(e) {
		return !(!e || !e.localStorage);
	}
	async start() {
		let e = await this.syncEngine.Ro();
		for (let t of e) {
			if (t === this.Ua) continue;
			let e = this.getItem(FS(this.persistenceKey, t));
			if (e) {
				let n = US.Ma(t, e);
				n && (this.$a = this.$a.insert(n.clientId, n));
			}
		}
		this.Ya();
		let t = this.storage.getItem(this.Ha);
		if (t) {
			let e = this.Za(t);
			e && this.Xa(e);
		}
		for (let e of this.Ka) this.qa(e);
		this.Ka = [], this.window.addEventListener("pagehide", (() => this.shutdown())), this.started = !0;
	}
	writeSequenceNumber(e) {
		this.setItem(this.Wa, JSON.stringify(e));
	}
	getAllActiveQueryTargets() {
		return this.eu(this.$a);
	}
	isActiveQueryTarget(e) {
		let t = !1;
		return this.$a.forEach(((n, r) => {
			r.activeTargetIds.has(e) && (t = !0);
		})), t;
	}
	addPendingMutation(e) {
		this.tu(e, "pending");
	}
	updateMutationState(e, t, n) {
		this.tu(e, t, n), this.nu(e);
	}
	addLocalQueryTarget(e, t = !0) {
		let n = "not-current";
		if (this.isActiveQueryTarget(e)) {
			let t = this.storage.getItem(zS(this.persistenceKey, e));
			if (t) {
				let r = HS.Ma(e, t);
				r && (n = r.state);
			}
		}
		return t && this.ru.La(e), this.Ya(), n;
	}
	removeLocalQueryTarget(e) {
		this.ru.Ba(e), this.Ya();
	}
	isLocalQueryTarget(e) {
		return this.ru.activeTargetIds.has(e);
	}
	clearQueryState(e) {
		this.removeItem(zS(this.persistenceKey, e));
	}
	updateQueryState(e, t, n) {
		this.iu(e, t, n);
	}
	handleUserChange(e, t, n) {
		t.forEach(((e) => {
			this.nu(e);
		})), this.currentUser = e, n.forEach(((e) => {
			this.addPendingMutation(e);
		}));
	}
	setOnlineState(e) {
		this.su(e);
	}
	notifyBundleLoaded(e) {
		this._u(e);
	}
	shutdown() {
		this.started &&= (this.window.removeEventListener("storage", this.ka), this.removeItem(this.Qa), !1);
	}
	getItem(e) {
		let t = this.storage.getItem(e);
		return N(BS, "READ", e, t), t;
	}
	setItem(e, t) {
		N(BS, "SET", e, t), this.storage.setItem(e, t);
	}
	removeItem(e) {
		N(BS, "REMOVE", e), this.storage.removeItem(e);
	}
	qa(e) {
		let t = e;
		if (t.storageArea === this.storage) {
			if (N(BS, "EVENT", t.key, t.newValue), t.key === this.Qa) return void kc("Received WebStorage notification for local change. Another client might have garbage-collected our state");
			this.xt.enqueueRetryable((async () => {
				if (this.started) {
					if (t.key !== null) {
						if (this.Ga.test(t.key)) {
							if (t.newValue == null) {
								let e = this.ou(t.key);
								return this.au(e, null);
							}
							{
								let e = this.uu(t.key, t.newValue);
								if (e) return this.au(e.clientId, e);
							}
						} else if (this.za.test(t.key)) {
							if (t.newValue !== null) {
								let e = this.cu(t.key, t.newValue);
								if (e) return this.lu(e);
							}
						} else if (this.ja.test(t.key)) {
							if (t.newValue !== null) {
								let e = this.Eu(t.key, t.newValue);
								if (e) return this.hu(e);
							}
						} else if (t.key === this.Ha) {
							if (t.newValue !== null) {
								let e = this.Za(t.newValue);
								if (e) return this.Xa(e);
							}
						} else if (t.key === this.Wa) {
							let e = function(e) {
								let t = hm.yn;
								if (e != null) try {
									let n = JSON.parse(e);
									F(typeof n == "number", 30636, { Tu: e }), t = n;
								} catch (e) {
									kc(BS, "Failed to read sequence number from WebStorage", e);
								}
								return t;
							}(t.newValue);
							e !== hm.yn && this.sequenceNumberHandler(e);
						} else if (t.key === this.Ja) {
							let e = this.Pu(t.newValue);
							await Promise.all(e.map(((e) => this.syncEngine.Ru(e))));
						}
					}
				} else this.Ka.push(t);
			}));
		}
	}
	get ru() {
		return this.$a.get(this.Ua);
	}
	Ya() {
		this.setItem(this.Qa, this.ru.Na());
	}
	tu(e, t, n) {
		let r = new VS(this.currentUser, e, t, n), i = LS(this.persistenceKey, this.currentUser, e);
		this.setItem(i, r.Na());
	}
	nu(e) {
		let t = LS(this.persistenceKey, this.currentUser, e);
		this.removeItem(t);
	}
	su(e) {
		let t = {
			clientId: this.Ua,
			onlineState: e
		};
		this.storage.setItem(this.Ha, JSON.stringify(t));
	}
	iu(e, t, n) {
		let r = zS(this.persistenceKey, e), i = new HS(e, t, n);
		this.setItem(r, i.Na());
	}
	_u(e) {
		let t = JSON.stringify(Array.from(e));
		this.setItem(this.Ja, t);
	}
	ou(e) {
		let t = this.Ga.exec(e);
		return t ? t[1] : null;
	}
	uu(e, t) {
		let n = this.ou(e);
		return US.Ma(n, t);
	}
	cu(e, t) {
		let n = this.za.exec(e), r = Number(n[1]), i = n[2] === void 0 ? null : n[2];
		return VS.Ma(new Mp(i), r, t);
	}
	Eu(e, t) {
		let n = this.ja.exec(e), r = Number(n[1]);
		return HS.Ma(r, t);
	}
	Za(e) {
		return WS.Ma(e);
	}
	Pu(e) {
		return JSON.parse(e);
	}
	async lu(e) {
		if (e.user.uid === this.currentUser.uid) return this.syncEngine.Iu(e.batchId, e.state, e.error);
		N(BS, `Ignoring mutation for non-active user ${e.user.uid}`);
	}
	hu(e) {
		return this.syncEngine.Au(e.targetId, e.state, e.error);
	}
	au(e, t) {
		let n = t ? this.$a.insert(e, t) : this.$a.remove(e), r = this.eu(this.$a), i = this.eu(n), a = [], o = [];
		return i.forEach(((e) => {
			r.has(e) || a.push(e);
		})), r.forEach(((e) => {
			i.has(e) || o.push(e);
		})), this.syncEngine.Vu(a, o).then((() => {
			this.$a = n;
		}));
	}
	Xa(e) {
		this.$a.get(e.clientId) && this.onlineStateHandler(e.onlineState);
	}
	eu(e) {
		let t = bf();
		return e.forEach(((e, n) => {
			t = t.unionWith(n.activeTargetIds);
		})), t;
	}
}, qS = class {
	constructor() {
		this.du = new GS(), this.fu = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
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
		return this.du = new GS(), Promise.resolve();
	}
	handleUserChange(e, t, n) {}
	setOnlineState(e) {}
	shutdown() {}
	writeSequenceNumber(e) {}
	notifyBundleLoaded(e) {}
};
function JS() {
	return typeof window < "u" ? window : null;
}
function YS() {
	return typeof document < "u" ? document : null;
}
var XS = class e {
	static emptySet(t) {
		return new e(t.comparator);
	}
	constructor(e) {
		this.comparator = e ? (t, n) => e(t, n) || H.comparator(t.key, n.key) : (e, t) => H.comparator(e.key, t.key), this.keyedMap = ff(), this.sortedSet = new Vc(this.comparator);
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
}, ZS = class {
	constructor() {
		this.mu = new Vc(H.comparator);
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
		}) : P(63341, {
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
}, QS = class e {
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
		})), new e(t, n, XS.emptySet(n), o, r, i, !0, !1, a);
	}
	get hasPendingWrites() {
		return !this.mutatedKeys.isEmpty();
	}
	isEqual(e) {
		if (!(this.fromCache === e.fromCache && this.hasCachedResults === e.hasCachedResults && this.syncStateChanged === e.syncStateChanged && this.mutatedKeys.isEqual(e.mutatedKeys) && tv(this.query, e.query) && this.docs.isEqual(e.docs) && this.oldDocs.isEqual(e.oldDocs))) return !1;
		let t = this.docChanges, n = e.docChanges;
		if (t.length !== n.length) return !1;
		for (let e = 0; e < t.length; e++) if (t[e].type !== n[e].type || !t[e].doc.isEqual(n[e].doc)) return !1;
		return !0;
	}
}, $S = class {
	constructor() {
		this.yu = void 0, this.wu = [];
	}
	bu() {
		return this.wu.some(((e) => e.Su()));
	}
}, eC = class {
	constructor() {
		this.queries = tC(), this.onlineState = "Unknown", this.vu = /* @__PURE__ */ new Set();
	}
	terminate() {
		(function(e, t) {
			let n = I(e), r = n.queries;
			n.queries = tC(), r.forEach(((e, n) => {
				for (let e of n.wu) e.onError(t);
			}));
		})(this, new B(z.ABORTED, "Firestore shutting down"));
	}
};
function tC() {
	return new cf(((e) => ev(e)), tv);
}
async function nC(e, t) {
	let n = I(e), r = 3, i = t.query, a = n.queries.get(i);
	a ? !a.bu() && t.Su() && (r = 2) : (a = new $S(), r = +!t.Su());
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
		let n = AS(e, `Initialization of query '${Q_(t.query) ? X_(t.query) : $d(t.query)}' failed`);
		t.onError(n);
		return;
	}
	n.queries.set(i, a), a.wu.push(t), t.Du(n.onlineState), a.yu && t.xu(a.yu) && oC(n);
}
async function rC(e, t) {
	let n = I(e), r = t.query, i = 3, a = n.queries.get(r);
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
function iC(e, t) {
	let n = I(e), r = !1;
	for (let e of t) {
		let t = e.query, i = n.queries.get(t);
		if (i) {
			for (let t of i.wu) t.xu(e) && (r = !0);
			i.yu = e;
		}
	}
	r && oC(n);
}
function aC(e, t, n) {
	let r = I(e), i = r.queries.get(t);
	if (i) for (let e of i.wu) e.onError(n);
	r.queries.delete(t);
}
function oC(e) {
	e.vu.forEach(((e) => {
		e.next();
	}));
}
var sC;
(function(e) {
	e.Default = "default", e.Cache = "cache";
})(sC ||= {});
var cC = class {
	constructor(e, t, n) {
		this.query = e, this.Cu = t, this.Fu = !1, this.Ou = null, this.onlineState = "Unknown", this.options = n || {};
	}
	xu(e) {
		if (!this.options.includeMetadataChanges) {
			let t = [];
			for (let n of e.docChanges) n.type !== 3 && t.push(n);
			e = new QS(e.query, e.docs, e.oldDocs, t, e.mutatedKeys, e.fromCache, e.syncStateChanged, !0, e.hasCachedResults);
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
		e = QS.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults), this.Fu = !0, this.Cu.next(e);
	}
	Su() {
		return this.options.source !== sC.Cache;
	}
}, lC = class {
	constructor(e) {
		this.key = e;
	}
}, uC = class {
	constructor(e) {
		this.key = e;
	}
}, dC = class {
	constructor(e, t) {
		this.query = e, this.Gu = t, this.zu = null, this.hasCachedResults = !1, this.current = !1, this.ju = J(), this.mutatedKeys = J(), this.Hu = Q_(e) ? Kb(e) : tf(e), this.Ju = new XS(this.Hu);
	}
	get Yu() {
		return this.Gu;
	}
	Zu(e, t) {
		let n = t ? t.Xu : new ZS(), r = t ? t.Ju : this.Ju, i = t ? t.mutatedKeys : this.mutatedKeys, a = r, o = !1, [s, c] = this.ec(this.query, r);
		e.inorderTraversal(((e, t) => {
			let l = r.get(e), u = Wb(this.query, t) ? t : null, d = !!l && this.mutatedKeys.has(l.key), f = !!u && (u.hasLocalMutations || this.mutatedKeys.has(u.key) && u.hasCommittedMutations), p = !1;
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
			if (Q_(this.query)) {
				let e = [];
				a.forEach(((t) => e.push(t)));
				let t = Hb(this.query, e), r = new XS(Kb(this.query));
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
		return Q_(e) ? qb(e)?.limit : e.limit || void 0;
	}
	rc(e) {
		if (Q_(e)) {
			let t = qb(e);
			return t && t.limit < 0 ? "L" : "F";
		}
		return e.limitType;
	}
	ec(e, t) {
		if (Q_(e)) {
			let n = qb(e)?.limit;
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
					default: return P(20277, { ye: e });
				}
			};
			return n(e) - n(t);
		}(e.type, t.type) || this.Hu(e.doc, t.doc))), this.sc(n), r ??= !1;
		let o = t && !r ? this._c() : [], s = this.ju.size === 0 && this.current && !r ? 1 : 0, c = s !== this.zu;
		return this.zu = s, a.length !== 0 || c ? {
			snapshot: new QS(this.query, e.Ju, i, a, e.mutatedKeys, s === 0, c, !1, !!n && n.resumeToken.approximateByteSize() > 0),
			oc: o
		} : { oc: o };
	}
	Du(e) {
		return this.current && e === "Offline" ? (this.current = !1, this.applyChanges({
			Ju: this.Ju,
			Xu: new ZS(),
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
			this.ju.has(e) || t.push(new uC(e));
		})), this.ju.forEach(((n) => {
			e.has(n) || t.push(new lC(n));
		})), t;
	}
	uc(e) {
		this.Gu = e.Qo, this.ju = J();
		let t = this.Zu(e.documents);
		return this.applyChanges(t, !0);
	}
	cc() {
		return QS.fromInitialDocuments(this.query, this.Ju, this.mutatedKeys, this.zu === 0, this.hasCachedResults);
	}
}, fC = "SyncEngine", pC = class {
	constructor(e, t, n) {
		this.query = e, this.targetId = t, this.view = n;
	}
}, mC = class {
	constructor(e) {
		this.key = e, this.lc = !1;
	}
}, hC = class {
	constructor(e, t, n, r, i, a) {
		this.localStore = e, this.remoteStore = t, this.eventManager = n, this.sharedClientState = r, this.currentUser = i, this.maxConcurrentLimboResolutions = a, this.Ec = {}, this.hc = new cf(((e) => ev(e)), tv), this.Tc = /* @__PURE__ */ new Map(), this.Pc = /* @__PURE__ */ new Set(), this.Rc = new Vc(H.comparator), this.Ic = /* @__PURE__ */ new Map(), this.Ac = new cx(), this.Vc = {}, this.dc = /* @__PURE__ */ new Map(), this.fc = Fb.ws(), this.onlineState = "Unknown", this.mc = void 0;
	}
	get isPrimaryClient() {
		return !0 === this.mc;
	}
};
async function gC(e, t, n = !0) {
	let r = qC(e), i, a = r.hc.get(t);
	return a ? (r.sharedClientState.addLocalQueryTarget(a.targetId), i = a.view.cc()) : i = await vC(r, t, n, !0), i;
}
async function _C(e, t) {
	await vC(qC(e), t, !0, !1);
}
async function vC(e, t, n, r) {
	let i = await Ux(e.localStore, Q_(t) ? t : Jd(t)), a = i.targetId, o = e.sharedClientState.addLocalQueryTarget(a, n), s;
	return r && (s = await yC(e, t, a, o === "current", i.resumeToken)), e.isPrimaryClient && n && tS(e.remoteStore, i), s;
}
async function yC(e, t, n, r, i) {
	e.gc = (t, n, r) => async function(e, t, n, r) {
		let i = t.view.Zu(n);
		i.Fo && (i = await Gx(e.localStore, t.query, !1).then((({ documents: e }) => t.view.Zu(e, i))));
		let a = r && r.targetChanges.get(t.targetId), o = r && r.targetMismatches.get(t.targetId) != null, s = t.view.applyChanges(i, e.isPrimaryClient, a, o);
		return MC(e, t.targetId, s.oc), s.snapshot;
	}(e, t, n, r);
	let a = await Gx(e.localStore, t, !0), o = new dC(t, a.Qo), s = o.Zu(a.documents), c = kf.createSynthesizedTargetChangeForCurrentChange(n, r && e.onlineState !== "Offline", i), l = o.applyChanges(s, e.isPrimaryClient, c);
	MC(e, n, l.oc);
	let u = new pC(t, n, o);
	return e.hc.set(t, u), e.Tc.has(n) ? e.Tc.get(n).push(t) : e.Tc.set(n, [t]), l.snapshot;
}
async function bC(e, t, n) {
	let r = I(e), i = r.hc.get(t), a = r.Tc.get(i.targetId);
	if (a.length > 1) return r.Tc.set(i.targetId, a.filter(((e) => !tv(e, t)))), void r.hc.delete(t);
	r.isPrimaryClient ? (r.sharedClientState.removeLocalQueryTarget(i.targetId), r.sharedClientState.isActiveQueryTarget(i.targetId) || await Wx(r.localStore, i.targetId, !1).then((() => {
		r.sharedClientState.clearQueryState(i.targetId), n && nS(r.remoteStore, i.targetId), AC(r, i.targetId);
	})).catch(vm)) : (AC(r, i.targetId), await Wx(r.localStore, i.targetId, !0));
}
async function xC(e, t) {
	let n = I(e), r = n.hc.get(t), i = n.Tc.get(r.targetId);
	n.isPrimaryClient && i.length === 1 && (n.sharedClientState.removeLocalQueryTarget(r.targetId), nS(n.remoteStore, r.targetId));
}
async function SC(e, t, n) {
	let r = JC(e);
	try {
		let e = await function(e, t) {
			let n = I(e), r = fl.now(), i = t.reduce(((e, t) => e.add(t.key)), J()), a, o;
			return n.persistence.runTransaction("Locally write mutations", "readwrite", ((e) => {
				let s = uf(), c = J();
				return n.Uo.getEntries(e, i).next(((e) => {
					s = e, s.forEach(((e, t) => {
						t.isValidDocument() || (c = c.add(e));
					}));
				})).next((() => n.localDocuments.getOverlayedDocuments(e, s))).next(((i) => {
					a = i;
					let o = [];
					for (let e of t) {
						let t = Wu(e, a.get(e.key).overlayedDocument);
						t != null && o.push(new qu(e.key, t, hu(t.value.mapValue), Ru.exists(!0)));
					}
					return n.mutationQueue.addMutationBatch(e, r, o, t);
				})).next(((t) => {
					o = t;
					let r = t.applyToLocalDocumentSet(a, c);
					return n.documentOverlayCache.saveOverlays(e, t.batchId, r);
				}));
			})).then((() => ({
				batchId: o.batchId,
				changes: pf(a)
			})));
		}(r.localStore, t);
		r.sharedClientState.addPendingMutation(e.batchId), function(e, t, n) {
			let r = e.Vc[e.currentUser.toKey()];
			r ||= new Vc(L), r = r.insert(t, n), e.Vc[e.currentUser.toKey()] = r;
		}(r, e.batchId, n), await FC(r, e.changes), await hS(r.remoteStore);
	} catch (e) {
		let t = AS(e, "Failed to persist write");
		n.reject(t);
	}
}
async function CC(e, t) {
	let n = I(e);
	try {
		let e = await Bx(n.localStore, t);
		t.targetChanges.forEach(((e, t) => {
			let r = n.Ic.get(t);
			r && (F(e.addedDocuments.size + e.modifiedDocuments.size + e.removedDocuments.size <= 1, 22616), e.addedDocuments.size > 0 ? r.lc = !0 : e.modifiedDocuments.size > 0 ? F(r.lc, 14607) : e.removedDocuments.size > 0 && (F(r.lc, 42227), r.lc = !1));
		})), await FC(n, e, t);
	} catch (e) {
		await vm(e);
	}
}
function wC(e, t, n) {
	let r = I(e);
	if (r.isPrimaryClient && n === 0 || !r.isPrimaryClient && n === 1) {
		let e = [];
		r.hc.forEach(((n, r) => {
			let i = r.view.Du(t);
			i.snapshot && e.push(i.snapshot);
		})), function(e, t) {
			let n = I(e);
			n.onlineState = t;
			let r = !1;
			n.queries.forEach(((e, n) => {
				for (let e of n.wu) e.Du(t) && (r = !0);
			})), r && oC(n);
		}(r.eventManager, t), e.length && r.Ec.hn(e), r.onlineState = t, r.isPrimaryClient && r.sharedClientState.setOnlineState(t);
	}
}
async function TC(e, t, n) {
	let r = I(e);
	r.sharedClientState.updateQueryState(t, "rejected", n);
	let i = r.Ic.get(t), a = i && i.key;
	if (a) {
		let e = new Vc(H.comparator);
		e = e.insert(a, xd.newNoDocument(a, K.min()));
		let n = J().add(a);
		await CC(r, new Of(K.min(), /* @__PURE__ */ new Map(), new Vc(L), e, uf(), n)), r.Rc = r.Rc.remove(a), r.Ic.delete(t), PC(r);
	} else await Wx(r.localStore, t, !1).then((() => AC(r, t, n))).catch(vm);
}
async function EC(e, t) {
	let n = I(e), r = t.batch.batchId;
	try {
		let e = await Rx(n.localStore, t);
		kC(n, r, null), OC(n, r), n.sharedClientState.updateMutationState(r, "acknowledged"), await FC(n, e);
	} catch (e) {
		await vm(e);
	}
}
async function DC(e, t, n) {
	let r = I(e);
	try {
		let e = await function(e, t) {
			let n = I(e);
			return n.persistence.runTransaction("Reject batch", "readwrite-primary", ((e) => {
				let r;
				return n.mutationQueue.lookupMutationBatch(e, t).next(((t) => (F(t !== null, 37113), r = t.keys(), n.mutationQueue.removeMutationBatch(e, t)))).next((() => n.mutationQueue.performConsistencyCheck(e))).next((() => n.documentOverlayCache.removeOverlaysForBatchId(e, r, t))).next((() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e, r))).next((() => n.localDocuments.getDocuments(e, r)));
			}));
		}(r.localStore, t);
		kC(r, t, n), OC(r, t), r.sharedClientState.updateMutationState(t, "rejected", n), await FC(r, e);
	} catch (e) {
		await vm(e);
	}
}
function OC(e, t) {
	(e.dc.get(t) || []).forEach(((e) => {
		e.resolve();
	})), e.dc.delete(t);
}
function kC(e, t, n) {
	let r = I(e), i = r.Vc[r.currentUser.toKey()];
	if (i) {
		let e = i.get(t);
		e && (n ? e.reject(n) : e.resolve(), i = i.remove(t)), r.Vc[r.currentUser.toKey()] = i;
	}
}
function AC(e, t, n = null) {
	e.sharedClientState.removeLocalQueryTarget(t);
	for (let r of e.Tc.get(t)) e.hc.delete(r), n && e.Ec.yc(r, n);
	e.Tc.delete(t), e.isPrimaryClient && e.Ac.Xs(t).forEach(((t) => {
		e.Ac.containsKey(t) || jC(e, t);
	}));
}
function jC(e, t) {
	e.Pc.delete(t.path.canonicalString());
	let n = e.Rc.get(t);
	n !== null && (nS(e.remoteStore, n), e.Rc = e.Rc.remove(t), e.Ic.delete(n), PC(e));
}
function MC(e, t, n) {
	for (let r of n) r instanceof lC ? (e.Ac.addReference(r.key, t), NC(e, r)) : r instanceof uC ? (N(fC, "Document no longer in limbo: " + r.key), e.Ac.removeReference(r.key, t), e.Ac.containsKey(r.key) || jC(e, r.key)) : P(19791, { wc: r });
}
function NC(e, t) {
	let n = t.key, r = n.path.canonicalString();
	e.Rc.get(n) || e.Pc.has(r) || (N(fC, "New document in limbo: " + n), e.Pc.add(r), PC(e));
}
function PC(e) {
	for (; e.Pc.size > 0 && e.Rc.size < e.maxConcurrentLimboResolutions;) {
		let t = e.Pc.values().next().value;
		e.Pc.delete(t);
		let n = new H(V.fromString(t)), r = e.fc.next();
		e.Ic.set(r, new mC(n)), e.Rc = e.Rc.insert(n, r), tS(e.remoteStore, new ky(Jd(Ud(n.path)), r, "TargetPurposeLimboResolution", hm.yn));
	}
}
async function FC(e, t, n) {
	let r = I(e), i = [], a = [], o = [];
	r.hc.isEmpty() || (r.hc.forEach(((e, s) => {
		o.push(r.gc(s, t, n).then(((e) => {
			if ((e || n) && r.isPrimaryClient) {
				let t = e ? !e.fromCache : n?.targetChanges.get(s.targetId)?.current;
				r.sharedClientState.updateQueryState(s.targetId, t ? "current" : "not-current");
			}
			if (e) {
				i.push(e);
				let t = kx.fo(s.targetId, e);
				a.push(t);
			}
		})));
	})), await Promise.all(o), r.Ec.hn(i), await async function(e, t) {
		let n = I(e);
		try {
			await n.persistence.runTransaction("notifyLocalViewChanges", "readwrite", ((e) => Y.forEach(t, ((t) => Y.forEach(t.Ao, ((r) => n.persistence.referenceDelegate.addReference(e, t.targetId, r))).next((() => Y.forEach(t.Vo, ((r) => n.persistence.referenceDelegate.removeReference(e, t.targetId, r)))))))));
		} catch (e) {
			if (!Tm(e)) throw e;
			N(Nx, "Failed to update sequence numbers: " + e);
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
async function IC(e, t) {
	let n = I(e);
	if (!n.currentUser.isEqual(t)) {
		N(fC, "User change. New user:", t.toKey());
		let e = await Lx(n.localStore, t);
		n.currentUser = t, function(e, t) {
			e.dc.forEach(((e) => {
				e.forEach(((e) => {
					e.reject(new B(z.CANCELLED, t));
				}));
			})), e.dc.clear();
		}(n, "'waitForPendingWrites' promise is rejected due to a user change."), n.sharedClientState.handleUserChange(t, e.removedBatchIds, e.addedBatchIds), await FC(n, e.qo);
	}
}
function LC(e, t) {
	let n = I(e), r = n.Ic.get(t);
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
async function RC(e, t) {
	let n = I(e), r = await Gx(n.localStore, t.query, !0), i = t.view.uc(r);
	return n.isPrimaryClient && MC(n, t.targetId, i.oc), i;
}
async function zC(e, t) {
	let n = I(e);
	return qx(n.localStore, t).then(((e) => FC(n, e)));
}
async function BC(e, t, n, r) {
	let i = I(e), a = await function(e, t) {
		let n = I(e), r = I(n.mutationQueue);
		return n.persistence.runTransaction("Lookup mutation documents", "readonly", ((e) => r.Qr(e, t).next(((t) => t ? n.localDocuments.getDocuments(e, t) : Y.resolve(null)))));
	}(i.localStore, t);
	a === null ? N(fC, "Cannot apply mutation batch with id: " + t) : (n === "pending" ? await hS(i.remoteStore) : n === "acknowledged" || n === "rejected" ? (kC(i, t, r || null), OC(i, t), function(e, t) {
		I(I(e).mutationQueue).jr(t);
	}(i.localStore, t)) : P(6720, "Unknown batchState", { bc: n }), await FC(i, a));
}
async function VC(e, t) {
	let n = I(e);
	if (qC(n), JC(n), !0 === t && !0 !== n.mc) {
		let e = await HC(n, n.sharedClientState.getAllActiveQueryTargets().toArray());
		n.mc = !0, await TS(n.remoteStore, !0);
		for (let t of e) tS(n.remoteStore, t);
	} else if (!1 === t && !1 !== n.mc) {
		let e = [], t = Promise.resolve();
		n.Tc.forEach(((r, i) => {
			n.sharedClientState.isLocalQueryTarget(i) ? e.push(i) : t = t.then((() => (AC(n, i), Wx(n.localStore, i, !0)))), nS(n.remoteStore, i);
		})), await t, await HC(n, e), function(e) {
			let t = I(e);
			t.Ic.forEach(((e, n) => {
				nS(t.remoteStore, n);
			})), t.Ac.e_(), t.Ic = /* @__PURE__ */ new Map(), t.Rc = new Vc(H.comparator);
		}(n), n.mc = !1, await TS(n.remoteStore, !1);
	}
}
async function HC(e, t, n) {
	let r = I(e), i = [], a = [];
	for (let e of t) {
		let t, n = r.Tc.get(e);
		if (n && n.length !== 0) {
			t = await Ux(r.localStore, Q_(n[0]) ? n[0] : Jd(n[0]));
			for (let e of n) {
				let t = await RC(r, r.hc.get(e));
				t.snapshot && a.push(t.snapshot);
			}
		} else {
			let n = await Kx(r.localStore, e);
			t = await Ux(r.localStore, n), await yC(r, UC(n), e, !1, t.resumeToken);
		}
		i.push(t);
	}
	return r.Ec.hn(a), i;
}
function UC(e) {
	return Id(e) ? e : Hd(e.path, e.collectionGroup, e.orderBy, e.filters, e.limit, "F", e.startAt, e.endAt);
}
function WC(e) {
	return function(e) {
		return I(I(e).persistence).Ro();
	}(I(e).localStore);
}
async function GC(e, t, n, r) {
	let i = I(e);
	if (i.mc) return void N(fC, "Ignoring unexpected query state notification.");
	let a = i.Tc.get(t);
	if (a && a.length > 0) switch (n) {
		case "current":
		case "not-current": {
			let e;
			if (Q_(a[0])) switch (ag(a[0])) {
				case "collection_group":
				case "collection":
					e = await qx(i.localStore, cg(a[0]));
					break;
				case "documents":
					e = await function(e, t) {
						let n = I(e), r = J(...lg(t).map(((e) => H.fromPath(e))));
						return n.persistence.runTransaction("Get documents for pipeline", "readonly", ((e) => n.Uo.getEntries(e, r))).then(((e) => e));
					}(i.localStore, a[0]);
					break;
				default: Ac(""), e = ff();
			}
			else e = await qx(i.localStore, function(e) {
				return e.collectionGroup || (e.path.length % 2 == 1 ? e.path.lastSegment() : e.path.get(e.path.length - 2));
			}(a[0]));
			let r = Of.createSynthesizedRemoteEventForCurrentChange(t, n === "current", ml.EMPTY_BYTE_STRING);
			await FC(i, e, r);
			break;
		}
		case "rejected":
			await Wx(i.localStore, t, !0), AC(i, t, r);
			break;
		default: P(64155, n);
	}
}
async function KC(e, t, n) {
	let r = qC(e);
	if (r.mc) {
		for (let e of t) {
			if (r.Tc.has(e) && r.sharedClientState.isActiveQueryTarget(e)) {
				N(fC, "Adding an already active target " + e);
				continue;
			}
			let t = await Kx(r.localStore, e), n = await Ux(r.localStore, t);
			await yC(r, UC(t), n.targetId, !1, n.resumeToken), tS(r.remoteStore, n);
		}
		for (let e of n) r.Tc.has(e) && await Wx(r.localStore, e, !1).then((() => {
			nS(r.remoteStore, e), AC(r, e);
		})).catch(vm);
	}
}
function qC(e) {
	let t = I(e);
	return t.remoteStore.remoteSyncer.applyRemoteEvent = CC.bind(null, t), t.remoteStore.remoteSyncer.getRemoteKeysForTarget = LC.bind(null, t), t.remoteStore.remoteSyncer.rejectListen = TC.bind(null, t), t.Ec.hn = iC.bind(null, t.eventManager), t.Ec.yc = aC.bind(null, t.eventManager), t;
}
function JC(e) {
	let t = I(e);
	return t.remoteStore.remoteSyncer.applySuccessfulWrite = EC.bind(null, t), t.remoteStore.remoteSyncer.rejectFailedWrite = DC.bind(null, t), t;
}
var YC = class {
	constructor() {
		this.kind = "memory", this.synchronizeTabs = !1;
	}
	async initialize(e) {
		this.serializer = Ep(e.databaseInfo.databaseId), this.sharedClientState = this.Sc(e), this.persistence = this.vc(e), await this.persistence.start(), this.localStore = this.Dc(e), this.gcScheduler = this.xc(e, this.localStore), this.indexBackfillerScheduler = this.Cc(e, this.localStore);
	}
	xc(e, t) {
		return null;
	}
	Cc(e, t) {
		return null;
	}
	Dc(e) {
		return Ix(this.persistence, new Mx(), e.initialUser, this.serializer);
	}
	vc(e) {
		return new mx(gx.w_, this.serializer);
	}
	Sc(e) {
		return new qS();
	}
	async terminate() {
		this.gcScheduler?.stop(), this.indexBackfillerScheduler?.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
	}
};
YC.provider = { build: () => new YC() };
var XC = class extends YC {
	constructor(e) {
		super(), this.cacheSizeBytes = e;
	}
	xc(e, t) {
		F(this.persistence.referenceDelegate instanceof _x, 46915);
		let n = this.persistence.referenceDelegate.garbageCollector;
		return new Pm(n, e.asyncQueue, t);
	}
	vc(e) {
		let t = this.cacheSizeBytes === void 0 ? mm.DEFAULT : mm.withCacheSize(this.cacheSizeBytes);
		return new mx(((e) => _x.w_(e, t)), this.serializer);
	}
}, ZC = class extends YC {
	constructor(e, t, n) {
		super(), this.Fc = e, this.cacheSizeBytes = t, this.forceOwnership = n, this.kind = "persistent", this.synchronizeTabs = !1;
	}
	async initialize(e) {
		await super.initialize(e), await this.Fc.initialize(this, e), await JC(this.Fc.syncEngine), await hS(this.Fc.remoteStore), await this.persistence.X_((() => (this.gcScheduler && !this.gcScheduler.started && this.gcScheduler.start(), this.indexBackfillerScheduler && !this.indexBackfillerScheduler.started && this.indexBackfillerScheduler.start(), Promise.resolve())));
	}
	Dc(e) {
		return Ix(this.persistence, new Mx(), e.initialUser, this.serializer);
	}
	xc(e, t) {
		let n = this.persistence.referenceDelegate.garbageCollector;
		return new Pm(n, e.asyncQueue, t);
	}
	Cc(e, t) {
		let n = new NS(t, this.persistence);
		return new MS(e.asyncQueue, n);
	}
	vc(e) {
		let t = Ox(e.databaseInfo.databaseId, e.databaseInfo.persistenceKey), n = this.cacheSizeBytes === void 0 ? mm.DEFAULT : mm.withCacheSize(this.cacheSizeBytes);
		return new Tx(this.synchronizeTabs, t, e.clientId, n, e.asyncQueue, JS(), YS(), this.serializer, this.sharedClientState, !!this.forceOwnership);
	}
	Sc(e) {
		return new qS();
	}
}, QC = class extends ZC {
	constructor(e, t) {
		super(e, t, !1), this.Fc = e, this.cacheSizeBytes = t, this.synchronizeTabs = !0;
	}
	async initialize(e) {
		await super.initialize(e);
		let t = this.Fc.syncEngine;
		this.sharedClientState instanceof KS && (this.sharedClientState.syncEngine = {
			Iu: BC.bind(null, t),
			Au: GC.bind(null, t),
			Vu: KC.bind(null, t),
			Ro: WC.bind(null, t),
			Ru: zC.bind(null, t)
		}, await this.sharedClientState.start()), await this.persistence.X_((async (e) => {
			await VC(this.Fc.syncEngine, e), this.gcScheduler && (e && !this.gcScheduler.started ? this.gcScheduler.start() : e || this.gcScheduler.stop()), this.indexBackfillerScheduler && (e && !this.indexBackfillerScheduler.started ? this.indexBackfillerScheduler.start() : e || this.indexBackfillerScheduler.stop());
		}));
	}
	Sc(e) {
		let t = JS();
		if (!KS.Je(t)) throw new B(z.UNIMPLEMENTED, "IndexedDB persistence is only available on platforms that support LocalStorage.");
		let n = Ox(e.databaseInfo.databaseId, e.databaseInfo.persistenceKey);
		return new KS(t, e.asyncQueue, n, e.clientId, e.initialUser);
	}
}, $C = class {
	async initialize(e, t) {
		this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(t, !e.synchronizeTabs), this.sharedClientState.onlineStateHandler = (e) => wC(this.syncEngine, e, 1), this.remoteStore.remoteSyncer.handleCredentialChange = IC.bind(null, this.syncEngine), await TS(this.remoteStore, this.syncEngine.isPrimaryClient));
	}
	createEventManager(e) {
		return function() {
			return new eC();
		}();
	}
	createDatastore(e) {
		let t = Ep(e.databaseInfo.databaseId), n = em(e.databaseInfo);
		return cm(e.authCredentials, e.appCheckCredentials, n, t);
	}
	createRemoteStore(e) {
		return function(e, t, n, r, i) {
			return new Zx(e, t, n, r, i);
		}(this.localStore, this.datastore, e.asyncQueue, ((e) => wC(this.syncEngine, e, 0)), function() {
			return Wp.Je() ? new Wp() : new Hp();
		}());
	}
	createSyncEngine(e, t) {
		return function(e, t, n, r, i, a, o) {
			let s = new hC(e, t, n, r, i, a);
			return o && (s.mc = !0), s;
		}(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
	}
	async terminate() {
		await async function(e) {
			let t = I(e);
			N(Xx, "RemoteStore shutting down."), t.ca.add(5), await $x(t), t.Ea.shutdown(), t.ha.set("Unknown");
		}(this.remoteStore), this.datastore?.terminate(), this.eventManager?.terminate();
	}
};
$C.provider = { build: () => new $C() };
var ew = "FirestoreClient", tw = class {
	constructor(e, t, n, r, i) {
		this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = n, this._databaseInfo = r, this.user = Mp.UNAUTHENTICATED, this.clientId = Pc.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this._uninitializedComponentsProvider = i, this.authCredentials.start(n, (async (e) => {
			N(ew, "Received user=", e.uid), await this.authCredentialListener(e), this.user = e;
		})), this.appCheckCredentials.start(n, ((e) => (N(ew, "Received new app check token=", e), this.appCheckCredentialListener(e, this.user))));
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
		let e = new Np();
		return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
			try {
				this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
			} catch (t) {
				let n = AS(t, "Failed to shutdown persistence");
				e.reject(n);
			}
		})), e.promise;
	}
};
async function nw(e, t) {
	e.asyncQueue.verifyOperationInProgress(), N(ew, "Initializing OfflineComponentProvider");
	let n = e.configuration;
	await t.initialize(n);
	let r = n.initialUser;
	e.setCredentialChangeListener((async (e) => {
		r.isEqual(e) || (await Lx(t.localStore, e), r = e);
	})), t.persistence.setDatabaseDeletedListener((() => e.terminate())), e._offlineComponents = t;
}
async function rw(e, t) {
	e.asyncQueue.verifyOperationInProgress();
	let n = await iw(e);
	N(ew, "Initializing OnlineComponentProvider"), await t.initialize(n, e.configuration), e.setCredentialChangeListener(((e) => wS(t.remoteStore, e))), e.setAppCheckTokenChangeListener(((e, n) => wS(t.remoteStore, n))), e._onlineComponents = t;
}
async function iw(e) {
	if (!e._offlineComponents) {
		if (e._uninitializedComponentsProvider) {
			N(ew, "Using user provided OfflineComponentProvider");
			try {
				await nw(e, e._uninitializedComponentsProvider._offline);
			} catch (t) {
				let n = t;
				if (!function(e) {
					return e.name === "FirebaseError" ? e.code === z.FAILED_PRECONDITION || e.code === z.UNIMPLEMENTED : !(typeof DOMException < "u" && e instanceof DOMException) || e.code === 22 || e.code === 20 || e.code === 11;
				}(n)) throw n;
				Ac("Error using user provided cache. Falling back to memory cache: " + n), await nw(e, new YC());
			}
		} else N(ew, "Using default OfflineComponentProvider"), await nw(e, new XC(void 0));
	}
	return e._offlineComponents;
}
async function aw(e) {
	return e._onlineComponents || (e._uninitializedComponentsProvider ? (N(ew, "Using user provided OnlineComponentProvider"), await rw(e, e._uninitializedComponentsProvider._online)) : (N(ew, "Using default OnlineComponentProvider"), await rw(e, new $C()))), e._onlineComponents;
}
function ow(e) {
	return aw(e).then(((e) => e.syncEngine));
}
async function sw(e) {
	let t = await aw(e), n = t.eventManager;
	return n.onListen = gC.bind(null, t.syncEngine), n.onUnlisten = bC.bind(null, t.syncEngine), n.onFirstRemoteStoreListen = _C.bind(null, t.syncEngine), n.onLastRemoteStoreUnlisten = xC.bind(null, t.syncEngine), n;
}
function cw(e, t, n = {}) {
	let r = new Np();
	return e.asyncQueue.enqueueAndForget((async () => function(e, t, n, r, i) {
		let a = new OS({
			next: (s) => {
				a.Aa(), t.enqueueAndForget((() => rC(e, o)));
				let c = s.docs.has(n);
				!c && s.fromCache ? i.reject(new B(z.UNAVAILABLE, "Failed to get document because the client is offline.")) : c && s.fromCache && r && r.source === "server" ? i.reject(new B(z.UNAVAILABLE, "Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to \"server\" to retrieve the cached document.)")) : i.resolve(s);
			},
			error: (e) => i.reject(e)
		}), o = new cC(Ud(n.path), a, {
			includeMetadataChanges: !0,
			waitForSyncWhenOnline: !0
		});
		return nC(e, o);
	}(await sw(e), e.asyncQueue, t, n, r))), r.promise;
}
function lw(e, t, n = {}) {
	let r = new Np();
	return e.asyncQueue.enqueueAndForget((async () => function(e, t, n, r, i) {
		let a = new OS({
			next: (n) => {
				a.Aa(), t.enqueueAndForget((() => rC(e, o))), n.fromCache && r.source === "server" ? i.reject(new B(z.UNAVAILABLE, "Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to \"server\" to retrieve the cached documents.)")) : i.resolve(n);
			},
			error: (e) => i.reject(e)
		}), o = new cC(n instanceof rg ? iv(n) : n, a, {
			includeMetadataChanges: !0,
			waitForSyncWhenOnline: !0
		});
		return nC(e, o);
	}(await sw(e), e.asyncQueue, t, n, r))), r.promise;
}
function uw(e, t) {
	let n = new Np();
	return e.asyncQueue.enqueueAndForget((async () => SC(await ow(e), t, n))), n.promise;
}
var dw = class {
	constructor(e, t, n, r, i) {
		this._firestore = e, this._userDataWriter = t, this._key = n, this._document = r, this._converter = i;
	}
	get id() {
		return this._key.path.lastSegment();
	}
	get ref() {
		return new Hm(this._firestore, this._converter, this._key);
	}
	exists() {
		return this._document !== null;
	}
	data() {
		if (this._document) {
			if (this._converter) {
				let e = new fw(this._firestore, this._userDataWriter, this._key, this._document, null);
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
			let t = this._document.data.field(uh("DocumentSnapshot.get", e));
			if (t !== null) return this._userDataWriter.convertValue(t);
		}
	}
}, fw = class extends dw {
	data() {
		return super.data();
	}
}, pw = class {
	convertValue(e, t = "none") {
		switch (Hl(e)) {
			case 0: return null;
			case 1: return e.booleanValue;
			case 2: return U(e.integerValue || e.doubleValue);
			case 3: return this.convertTimestamp(e.timestampValue);
			case 4: return this.convertServerTimestamp(e, t);
			case 5: return e.stringValue;
			case 6: return this.convertBytes(_l(e.bytesValue));
			case 7: return this.convertReference(e.referenceValue);
			case 8: return this.convertGeoPoint(e.geoPointValue);
			case 9: return this.convertArray(e.arrayValue, t);
			case 11: return this.convertObject(e.mapValue, t);
			case 10: return this.convertVectorValue(e.mapValue);
			default: throw P(62114, { value: e });
		}
	}
	convertObject(e, t) {
		return this.convertObjectMap(e.fields, t);
	}
	convertObjectMap(e, t = "none") {
		let n = {};
		return Qc(e, ((e, r) => {
			n[e] = this.convertValue(r, t);
		})), n;
	}
	convertVectorValue(e) {
		let t = e.fields?.[Rl].arrayValue?.values?.map(((e) => U(e.doubleValue)));
		return new Km(t);
	}
	convertGeoPoint(e) {
		return new jp(U(e.latitude), U(e.longitude));
	}
	convertArray(e, t) {
		return (e.values || []).map(((e) => this.convertValue(e, t)));
	}
	convertServerTimestamp(e, t) {
		switch (t) {
			case "previous":
				let n = Cl(e);
				return n == null ? null : this.convertValue(n, t);
			case "estimate": return this.convertTimestamp(wl(e));
			default: return null;
		}
	}
	convertTimestamp(e) {
		let t = gl(e);
		return new fl(t.seconds, t.nanos);
	}
	convertDocumentKey(e, t) {
		let n = V.fromString(e);
		F(Sp(n), 9688, { name: e });
		let r = new Dl(n.get(1), n.get(3)), i = new H(n.popFirst(5));
		return r.isEqual(t) || kc(`A document reference to ${i} refers to a different database (${r.projectId}/${r.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), i;
	}
};
function mw(e, t, n) {
	let r;
	return r = e ? n && (n.merge || n.mergeFields) ? e.toFirestore(t, n) : e.toFirestore(t) : t, r;
}
var hw = "AsyncQueue", gw = class {
	constructor(e = Promise.resolve()) {
		this.qc = [], this.$c = !1, this.Kc = [], this.Qc = null, this.Wc = !1, this.Gc = !1, this.zc = [], this.jt = new tm(this, "async_queue_retry"), this.jc = () => {
			let e = YS();
			e && N(hw, "Visibility state changed to " + e.visibilityState), this.jt.qt();
		}, this.Hc = e;
		let t = YS();
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
			let t = YS();
			t && typeof t.removeEventListener == "function" && t.removeEventListener("visibilitychange", this.jc);
		}
	}
	enqueue(e) {
		if (this.Jc(), this.$c) return new Promise((() => {}));
		let t = new Np();
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
				if (!Tm(e)) throw e;
				N(hw, "Operation failed with retryable error: " + e);
			}
			this.qc.length > 0 && this.jt.Ut((() => this.Zc()));
		}
	}
	Yc(e) {
		let t = this.Hc.then((() => (this.Wc = !0, e().catch(((e) => {
			throw this.Qc = e, this.Wc = !1, kc("INTERNAL UNHANDLED ERROR: ", _w(e)), e;
		})).then(((e) => (this.Wc = !1, e))))));
		return this.Hc = t, t;
	}
	enqueueAfterDelay(e, t, n) {
		this.Jc(), this.zc.indexOf(e) > -1 && (t = 0);
		let r = kS.createAndSchedule(this, e, t, n, ((e) => this.Xc(e)));
		return this.Kc.push(r), r;
	}
	Jc() {
		this.Qc && P(47125, { el: _w(this.Qc) });
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
function _w(e) {
	let t = e.message || "";
	return e.stack && (t = e.stack.includes(e.message) ? e.stack : e.message + "\n" + e.stack), t;
}
var vw = class extends Bm {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.type = "firestore", this._queue = new gw(), this._persistenceKey = r?.name || "[DEFAULT]";
	}
	async _terminate() {
		if (this._firestoreClient) {
			let e = this._firestoreClient.terminate();
			this._queue = new gw(e), this._firestoreClient = void 0, await e;
		}
	}
};
function yw(e, t, n) {
	n ||= El;
	let r = Jt(e, "firestore");
	if (r.isInitialized(n)) {
		let e = r.getImmediate({ identifier: n });
		if (_e(r.getOptions(n), t)) return e;
		throw new B(z.FAILED_PRECONDITION, "initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.");
	}
	if (t.cacheSizeBytes !== void 0 && t.localCache !== void 0) throw new B(z.INVALID_ARGUMENT, "cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");
	if (t.cacheSizeBytes !== void 0 && t.cacheSizeBytes !== -1 && t.cacheSizeBytes < jm) throw new B(z.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
	return t.host && Ee(t.host) && De(t.host), r.initialize({
		options: t,
		instanceIdentifier: n
	});
}
function bw(e) {
	if (e._terminated) throw new B(z.FAILED_PRECONDITION, "The client has already been terminated.");
	return e._firestoreClient || xw(e), e._firestoreClient;
}
function xw(e) {
	let t = e._freezeSettings(), n = dm(e._databaseId, e._app?.options.appId || "", e._persistenceKey, e._app?.options.apiKey, t);
	e._componentsProvider || t.localCache?._offlineComponentProvider && t.localCache?._onlineComponentProvider && (e._componentsProvider = {
		_offline: t.localCache._offlineComponentProvider,
		_online: t.localCache._onlineComponentProvider
	}), e._firestoreClient = new tw(e._authCredentials, e._appCheckCredentials, e._queue, n, e._componentsProvider && function(e) {
		let t = e?._online.build();
		return {
			_offline: e?._offline.build(t),
			_online: t
		};
	}(e._componentsProvider));
}
var Sw = class extends pw {
	constructor(e) {
		super(), this.firestore = e;
	}
	convertBytes(e) {
		return new Dp(e);
	}
	convertReference(e) {
		let t = this.convertDocumentKey(e, this.firestore._databaseId);
		return new Hm(this.firestore, null, t);
	}
}, Cw = class {
	constructor(e, t) {
		this.hasPendingWrites = e, this.fromCache = t;
	}
	isEqual(e) {
		return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
	}
}, ww = class e extends dw {
	constructor(e, t, n, r, i, a) {
		super(e, t, n, r, a), this._firestore = e, this._firestoreImpl = e, this.metadata = i;
	}
	exists() {
		return super.exists();
	}
	data(e = {}) {
		if (this._document) {
			if (this._converter) {
				let t = new Tw(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, null);
				return this._converter.fromFirestore(t, e);
			}
			return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
		}
	}
	get(e, t = {}) {
		if (this._document) {
			let n = this._document.data.field(uh("DocumentSnapshot.get", e));
			if (n !== null) return this._userDataWriter.convertValue(n, t.serverTimestamps);
		}
	}
	toJSON() {
		if (this.metadata.hasPendingWrites) throw new B(z.FAILED_PRECONDITION, "DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
		let t = this._document, n = {};
		return n.type = e._jsonSchemaVersion, n.bundle = "", n.bundleSource = "DocumentSnapshot", n.bundleName = this._key.toString(), !t || !t.isValidDocument() || !t.isFoundDocument() ? n : (this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields, "previous"), n.bundle = (this._firestore, this.ref.path, "NOT SUPPORTED"), n);
	}
};
ww._jsonSchemaVersion = "firestore/documentSnapshot/1.0", ww._jsonSchema = {
	type: cl("string", ww._jsonSchemaVersion),
	bundleSource: cl("string", "DocumentSnapshot"),
	bundleName: cl("string"),
	bundle: cl("string")
};
var Tw = class extends ww {
	data(e = {}) {
		return super.data(e);
	}
}, Ew = class e {
	constructor(e, t, n, r) {
		this._firestore = e, this._userDataWriter = t, this._snapshot = r, this.metadata = new Cw(r.hasPendingWrites, r.fromCache), this.query = n;
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
			e.call(t, new Tw(this._firestore, this._userDataWriter, n.key, n, new Cw(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
		}));
	}
	docChanges(e = {}) {
		let t = !!e.includeMetadataChanges;
		if (t && this._snapshot.excludesMetadataChanges) throw new B(z.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
		return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === t || (this._cachedChanges = function(e, t) {
			if (e._snapshot.oldDocs.isEmpty()) {
				let t = 0;
				return e._snapshot.docChanges.map(((n) => {
					Q_(e._snapshot.query) ? Kb(e._snapshot.query) : e.query._query;
					let r = new Tw(e._firestore, e._userDataWriter, n.doc.key, n.doc, new Cw(e._snapshot.mutatedKeys.has(n.doc.key), e._snapshot.fromCache), e.query.converter);
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
					let r = new Tw(e._firestore, e._userDataWriter, t.doc.key, t.doc, new Cw(e._snapshot.mutatedKeys.has(t.doc.key), e._snapshot.fromCache), e.query.converter), i = -1, a = -1;
					return t.type !== 0 && (i = n.indexOf(t.doc.key), n = n.delete(t.doc.key)), t.type !== 1 && (n = n.add(t.doc), a = n.indexOf(t.doc.key)), {
						type: Dw(t.type),
						doc: r,
						oldIndex: i,
						newIndex: a
					};
				}));
			}
		}(this, t), this._cachedChangesIncludeMetadataChanges = t), this._cachedChanges;
	}
	toJSON() {
		if (this.metadata.hasPendingWrites) throw new B(z.FAILED_PRECONDITION, "QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
		let t = {};
		t.type = e._jsonSchemaVersion, t.bundleSource = "QuerySnapshot", t.bundleName = Pc.newId(), this._firestore._databaseId.database, this._firestore._databaseId.projectId;
		let n = [], r = [], i = [];
		return this.docs.forEach(((e) => {
			e._document !== null && (n.push(e._document), r.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields, "previous")), i.push(e.ref.path));
		})), t.bundle = (this._firestore, this.query._query, t.bundleName, "NOT SUPPORTED"), t;
	}
};
function Dw(e) {
	switch (e) {
		case 0: return "added";
		case 2:
		case 3: return "modified";
		case 1: return "removed";
		default: return P(61501, { type: e });
	}
}
Ew._jsonSchemaVersion = "firestore/querySnapshot/1.0", Ew._jsonSchema = {
	type: cl("string", Ew._jsonSchemaVersion),
	bundleSource: cl("string", "QuerySnapshot"),
	bundleName: cl("string"),
	bundle: cl("string")
};
//#endregion
//#region node_modules/@firebase/firestore/dist/index.esm.js
function Ow(e) {
	if (e.limitType === "L" && e.explicitOrderBy.length === 0) throw new B(z.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}
var kw = class {}, Aw = class extends kw {};
function jw(e, t, ...n) {
	let r = [];
	t instanceof kw && r.push(t), r = r.concat(n), function(e) {
		let t = e.filter(((e) => e instanceof Pw)).length, n = e.filter(((e) => e instanceof Mw)).length;
		if (t > 1 || t > 0 && n > 0) throw new B(z.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
	}(r);
	for (let t of r) e = t._apply(e);
	return e;
}
var Mw = class e extends Aw {
	constructor(e, t, n) {
		super(), this._field = e, this._op = t, this._value = n, this.type = "where";
	}
	static _create(t, n, r) {
		return new e(t, n, r);
	}
	_apply(e) {
		let t = this._parse(e);
		return Lw(e._query, t), new Vm(e.firestore, e.converter, Xd(e._query, t));
	}
	_parse(e) {
		let t = $m(e.firestore);
		return function(e, t, n, r, i, a, o) {
			let s;
			if (i.isKeyField()) {
				if (a === "array-contains" || a === "array-contains-any") throw new B(z.INVALID_ARGUMENT, `Invalid Query. You can't perform '${a}' queries on documentId().`);
				if (a === "in" || a === "not-in") {
					Iw(o, a);
					let t = [];
					for (let n of o) t.push(Fw(r, e, n));
					s = { arrayValue: { values: t } };
				} else s = Fw(r, e, o);
			} else a !== "in" && a !== "not-in" && a !== "array-contains-any" || Iw(o, a), s = ah(n, t, o, a === "in" || a === "not-in");
			return W.create(i, a, s);
		}(e._query, "where", t, e.firestore._databaseId, this._field, this._op, this._value);
	}
};
function Nw(e, t, n) {
	let r = t, i = uh("where", e);
	return Mw._create(i, r, n);
}
var Pw = class e extends kw {
	constructor(e, t) {
		super(), this.type = e, this._queryConstraints = t;
	}
	static _create(t, n) {
		return new e(t, n);
	}
	_parse(e) {
		let t = this._queryConstraints.map(((t) => t._parse(e))).filter(((e) => e.getFilters().length > 0));
		return t.length === 1 ? t[0] : G.create(t, this._getOperator());
	}
	_apply(e) {
		let t = this._parse(e);
		return t.getFilters().length === 0 ? e : (function(e, t) {
			let n = e, r = t.getFlattenedFilters();
			for (let e of r) Lw(n, e), n = Xd(n, e);
		}(e._query, t), new Vm(e.firestore, e.converter, Xd(e._query, t)));
	}
	_getQueryConstraints() {
		return this._queryConstraints;
	}
	_getOperator() {
		return this.type === "and" ? "and" : "or";
	}
};
function Fw(e, t, n) {
	if (typeof (n = g(n)) == "string") {
		if (n === "") throw new B(z.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
		if (!Kd(t) && n.indexOf("/") !== -1) throw new B(z.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);
		let r = t.path.child(V.fromString(n));
		if (!H.isDocumentKey(r)) throw new B(z.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);
		return Zl(e, new H(r));
	}
	if (n instanceof Hm) return Zl(e, n._key);
	throw new B(z.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ol(n)}.`);
}
function Iw(e, t) {
	if (!Array.isArray(e) || e.length === 0) throw new B(z.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${t.toString()}' filters.`);
}
function Lw(e, t) {
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
	if (n !== null) throw n === t.op ? new B(z.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${t.op.toString()}' filter.`) : new B(z.INVALID_ARGUMENT, `Invalid query. You cannot use '${t.op.toString()}' filters with '${n.toString()}' filters.`);
}
var Rw = class {
	constructor(e) {
		let t;
		this.kind = "persistent", e?.tabManager ? (e.tabManager._initialize(e), t = e.tabManager) : (t = Hw(void 0), t._initialize(e)), this._onlineComponentProvider = t._onlineComponentProvider, this._offlineComponentProvider = t._offlineComponentProvider;
	}
	toJSON() {
		return { kind: this.kind };
	}
};
function zw(e) {
	return new Rw(e);
}
var Bw = class {
	constructor(e) {
		this.forceOwnership = e, this.kind = "persistentSingleTab";
	}
	toJSON() {
		return { kind: this.kind };
	}
	_initialize(e) {
		this._onlineComponentProvider = $C.provider, this._offlineComponentProvider = { build: (t) => new ZC(t, e?.cacheSizeBytes, this.forceOwnership) };
	}
}, Vw = class {
	constructor() {
		this.kind = "PersistentMultipleTab";
	}
	toJSON() {
		return { kind: this.kind };
	}
	_initialize(e) {
		this._onlineComponentProvider = $C.provider, this._offlineComponentProvider = { build: (t) => new QC(t, e?.cacheSizeBytes) };
	}
};
function Hw(e) {
	return new Bw(e?.forceOwnership);
}
function Uw() {
	return new Vw();
}
var Ww = class {
	constructor(e, t) {
		this._firestore = e, this._commitHandler = t, this._mutations = [], this._committed = !1, this._dataReader = $m(e);
	}
	set(e, t, n) {
		this._verifyNotCommitted();
		let r = Gw(e, this._firestore), i = mw(r.converter, t, n), a = eh(this._dataReader, "WriteBatch.set", r._key, i, r.converter !== null, n);
		return this._mutations.push(a.toMutation(r._key, Ru.none())), this;
	}
	update(e, t, n, ...r) {
		this._verifyNotCommitted();
		let i = Gw(e, this._firestore), a;
		return a = typeof (t = g(t)) == "string" || t instanceof Op ? ih(this._dataReader, "WriteBatch.update", i._key, t, n, r) : rh(this._dataReader, "WriteBatch.update", i._key, t), this._mutations.push(a.toMutation(i._key, Ru.exists(!0))), this;
	}
	delete(e) {
		this._verifyNotCommitted();
		let t = Gw(e, this._firestore);
		return this._mutations = this._mutations.concat(new Zu(t._key, Ru.none())), this;
	}
	commit() {
		return this._verifyNotCommitted(), this._committed = !0, this._mutations.length > 0 ? this._commitHandler(this._mutations) : Promise.resolve();
	}
	_verifyNotCommitted() {
		if (this._committed) throw new B(z.FAILED_PRECONDITION, "A write batch can no longer be used after commit() has been called.");
	}
};
function Gw(e, t) {
	if ((e = g(e)).firestore !== t) throw new B(z.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
	return e;
}
function Kw(e) {
	e = sl(e, Hm);
	let t = sl(e.firestore, vw);
	return cw(bw(t), e._key).then(((n) => $w(t, e, n)));
}
function qw(e) {
	e = sl(e, Vm);
	let t = sl(e.firestore, vw), n = bw(t), r = new Sw(t);
	return Ow(e._query), lw(n, e._query).then(((n) => new Ew(t, r, e, n)));
}
function Jw(e, t, n) {
	e = sl(e, Hm);
	let r = sl(e.firestore, vw), i = mw(e.converter, t, n);
	return Qw(r, [eh($m(r), "setDoc", e._key, i, e.converter !== null, n).toMutation(e._key, Ru.none())]);
}
function Yw(e, t, n, ...r) {
	e = sl(e, Hm);
	let i = sl(e.firestore, vw), a = $m(i), o;
	return o = typeof (t = g(t)) == "string" || t instanceof Op ? ih(a, "updateDoc", e._key, t, n, r) : rh(a, "updateDoc", e._key, t), Qw(i, [o.toMutation(e._key, Ru.exists(!0))]);
}
function Xw(e) {
	return Qw(sl(e.firestore, vw), [new Zu(e._key, Ru.none())]);
}
function Zw(e, t) {
	let n = sl(e.firestore, vw), r = Gm(e), i = mw(e.converter, t);
	return Qw(n, [eh($m(e.firestore), "addDoc", r._key, i, e.converter !== null, {}).toMutation(r._key, Ru.exists(!1))]).then((() => r));
}
function Qw(e, t) {
	return uw(bw(e), t);
}
function $w(e, t, n) {
	let r = n.docs.get(t._key);
	return new ww(e, new Sw(e), t._key, r, new Cw(n.hasPendingWrites, n.fromCache), t.converter);
}
function eT(e) {
	return e = sl(e, vw), bw(e), new Ww(e, ((t) => Qw(e, t)));
}
var tT = "@firebase/firestore", nT = "4.17.1";
(function(e, t = !0) {
	Ec(Zt), qt(new Oe("firestore", ((e, { instanceIdentifier: n, options: r }) => {
		let i = e.getProvider("app").getImmediate(), a = new vw(new Ip(e.getProvider("auth-internal")), new Bp(i, e.getProvider("app-check-internal")), Ol(i, n), i);
		return r = {
			useFetchStreams: t,
			...r
		}, a._setSettings(r), a;
	}), "PUBLIC").setMultipleInstances(!0)), en(tT, nT, e), en(tT, nT, "esm2020");
})();
//#endregion
export { Ti as EmailAuthProvider, ki as GoogleAuthProvider, fl as Timestamp, Zw as addDoc, Wm as collection, Xw as deleteDoc, Wi as deleteUser, Gm as doc, Lo as getAuth, Kw as getDoc, qw as getDocs, Qt as initializeApp, yw as initializeFirestore, Hi as onAuthStateChanged, zw as persistentLocalCache, Uw as persistentMultipleTabManager, jw as query, zi as reauthenticateWithCredential, Ma as reauthenticateWithPopup, vh as serverTimestamp, Jw as setDoc, ja as signInWithPopup, Ha as signInWithRedirect, Ui as signOut, Yw as updateDoc, Nw as where, eT as writeBatch };
