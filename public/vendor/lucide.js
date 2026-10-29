//#region node_modules/lucide/dist/esm/defaultAttributes.mjs
var e = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
}, t = ([e, n, r]) => {
	let i = document.createElementNS("http://www.w3.org/2000/svg", e);
	return Object.keys(n).forEach((e) => {
		i.setAttribute(e, String(n[e]));
	}), r?.length && r.forEach((e) => {
		let n = t(e);
		i.appendChild(n);
	}), i;
}, n = (n, r = {}) => t([
	"svg",
	{
		...e,
		...r
	},
	n
]), r = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), i = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, a = (e) => {
	let t = "", n = !1;
	for (let r of e) {
		if (r === "-" || r === "_" || r <= " ") {
			n = t.length > 0;
			continue;
		}
		t.length === 0 ? t += r.toLowerCase() : t += n ? r.toUpperCase() : r, n = !1;
	}
	return t;
}, ee = (e) => {
	let t = a(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, te = (e) => Array.from(e.attributes).reduce((e, t) => (e[t.name] = t.value, e), {}), o = (e) => typeof e == "string" ? e : !e || !e.class ? "" : e.class && typeof e.class == "string" ? e.class.split(" ") : e.class && Array.isArray(e.class) ? e.class : "", s = (t, { nameAttr: a, icons: s, attrs: c }) => {
	let l = t.getAttribute(a);
	if (l == null) return;
	let u = s[ee(l)];
	if (!u) return console.warn(`${t.outerHTML} icon name was not found in the provided icons object.`);
	let d = te(t), f = i(d) ? {} : { "aria-hidden": "true" }, p = {
		...e,
		"data-lucide": l,
		...f,
		...c,
		...d
	}, m = o(d), h = o(c), g = r("lucide", `lucide-${l}`, ...m, ...h);
	g && Object.assign(p, { class: g });
	let _ = n(u, p);
	return t.parentNode?.replaceChild(_, t);
}, c = [["path", { d: "M12 6.528V3a1 1 0 0 1 1-1h0" }], ["path", { d: "M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21" }]], l = [
	["rect", {
		width: "20",
		height: "5",
		x: "2",
		y: "3",
		rx: "1"
	}],
	["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" }],
	["path", { d: "M10 12h4" }]
], u = [["path", { d: "m12 19-7-7 7-7" }], ["path", { d: "M19 12H5" }]], d = [
	["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }],
	["path", { d: "M22 8c0-2.3-.8-4.3-2-6" }],
	["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" }],
	["path", { d: "M4 2C2.8 3.7 2 5.7 2 8" }]
], f = [
	["path", { d: "M8 2v3" }],
	["path", { d: "M16 2v3" }],
	["rect", {
		x: "3",
		y: "3",
		width: "18",
		height: "18",
		rx: "2"
	}],
	["path", { d: "M3 9h18" }],
	["path", { d: "m9 15 2 2 4-4" }]
], p = [
	["path", { d: "M8 2v3" }],
	["path", { d: "M16 2v3" }],
	["rect", {
		x: "3",
		y: "3",
		width: "18",
		height: "18",
		rx: "2"
	}],
	["path", { d: "M3 9h18" }],
	["path", { d: "M8 13h.01" }],
	["path", { d: "M12 13h.01" }],
	["path", { d: "M16 13h.01" }],
	["path", { d: "M8 17h.01" }],
	["path", { d: "M12 17h.01" }],
	["path", { d: "M16 17h.01" }]
], m = [
	["path", { d: "M5 21v-6" }],
	["path", { d: "M12 21V9" }],
	["path", { d: "M19 21V3" }]
], h = [
	["path", { d: "M12 16v5" }],
	["path", { d: "M16 14.639V21" }],
	["path", { d: "M20 10.656V21" }],
	["path", { d: "m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" }],
	["path", { d: "M4 18.463V21" }],
	["path", { d: "M8 14.656V21" }]
], g = [["path", { d: "M20 6 9 17l-5-5" }]], _ = [["path", { d: "m6 9 6 6 6-6" }]], v = [["path", { d: "m15 18-6-6 6-6" }]], y = [["path", { d: "m9 18 6-6-6-6" }]], b = [["path", { d: "m18 15-6-6-6 6" }]], x = [["circle", {
	cx: "12",
	cy: "12",
	r: "10"
}], ["path", { d: "m16 9-5.5 5.5L8 12" }]], S = [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}],
	["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
	["path", { d: "M12 17h.01" }]
], C = [["circle", {
	cx: "12",
	cy: "12",
	r: "10"
}], ["path", { d: "M12 6v6h4" }]], w = [["circle", {
	cx: "12",
	cy: "12",
	r: "10"
}], ["path", { d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" }]], T = [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2"
}], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]], E = [
	["path", { d: "M12 15V3" }],
	["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
	["path", { d: "m7 10 5 5 5-5" }]
], D = [
	["path", { d: "M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z" }],
	["path", { d: "m2.5 21.5 1.4-1.4" }],
	["path", { d: "m20.1 3.9 1.4-1.4" }],
	["path", { d: "M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z" }],
	["path", { d: "m9.6 14.4 4.8-4.8" }]
], O = [
	["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" }],
	["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242" }],
	["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" }],
	["path", { d: "m2 2 20 20" }]
], k = [["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" }], ["circle", {
	cx: "12",
	cy: "12",
	r: "3"
}]], A = [
	["path", { d: "M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35" }],
	["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
	["path", { d: "M14 19h6" }],
	["path", { d: "M17 16v6" }]
], j = [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}],
	["path", { d: "M12 16v-4" }],
	["path", { d: "M12 8h.01" }]
], M = [
	["path", { d: "m5 8 6 6" }],
	["path", { d: "m4 14 6-6 2-3" }],
	["path", { d: "M2 5h12" }],
	["path", { d: "M7 2h1" }],
	["path", { d: "m22 22-5-10-5 10" }],
	["path", { d: "M14 18h6" }]
], N = [
	["path", { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" }],
	["path", { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" }],
	["path", { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" }]
], P = [
	["rect", {
		width: "7",
		height: "9",
		x: "3",
		y: "3",
		rx: "1"
	}],
	["rect", {
		width: "7",
		height: "5",
		x: "14",
		y: "3",
		rx: "1"
	}],
	["rect", {
		width: "7",
		height: "9",
		x: "14",
		y: "12",
		rx: "1"
	}],
	["rect", {
		width: "7",
		height: "5",
		x: "3",
		y: "16",
		rx: "1"
	}]
], F = [
	["rect", {
		width: "18",
		height: "7",
		x: "3",
		y: "3",
		rx: "1"
	}],
	["rect", {
		width: "9",
		height: "7",
		x: "3",
		y: "14",
		rx: "1"
	}],
	["rect", {
		width: "5",
		height: "7",
		x: "16",
		y: "14",
		rx: "1"
	}]
], I = [
	["circle", {
		cx: "12",
		cy: "16",
		r: "1"
	}],
	["rect", {
		x: "3",
		y: "10",
		width: "18",
		height: "12",
		rx: "2"
	}],
	["path", { d: "M7 10V7a5 5 0 0 1 10 0v3" }]
], L = [
	["path", { d: "m16 17 5-5-5-5" }],
	["path", { d: "M21 12H9" }],
	["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }]
], ne = [
	["path", { d: "M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" }],
	["path", { d: "M11 12 5.12 2.2" }],
	["path", { d: "m13 12 5.88-9.8" }],
	["path", { d: "M8 7h8" }],
	["circle", {
		cx: "12",
		cy: "17",
		r: "5"
	}],
	["path", { d: "M12 18v-2h-.5" }]
], R = [
	["rect", {
		width: "20",
		height: "14",
		x: "2",
		y: "3",
		rx: "2"
	}],
	["line", {
		x1: "8",
		x2: "16",
		y1: "21",
		y2: "21"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "17",
		y2: "21"
	}]
], z = [["path", { d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" }]], B = [
	["path", { d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" }],
	["circle", {
		cx: "13.5",
		cy: "6.5",
		r: ".5",
		fill: "currentColor"
	}],
	["circle", {
		cx: "17.5",
		cy: "10.5",
		r: ".5",
		fill: "currentColor"
	}],
	["circle", {
		cx: "6.5",
		cy: "12.5",
		r: ".5",
		fill: "currentColor"
	}],
	["circle", {
		cx: "8.5",
		cy: "7.5",
		r: ".5",
		fill: "currentColor"
	}]
], V = [["path", { d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }], ["path", { d: "m15 5 4 4" }]], H = [["path", { d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" }]], U = [["path", { d: "M5 12h14" }], ["path", { d: "M12 5v14" }]], W = [
	["path", { d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" }],
	["path", { d: "m14.5 12.5 2-2" }],
	["path", { d: "m11.5 9.5 2-2" }],
	["path", { d: "m8.5 6.5 2-2" }],
	["path", { d: "m17.5 15.5 2-2" }]
], G = [
	["path", { d: "M12 3v18" }],
	["path", { d: "m19 8 3 8a5 5 0 0 1-6 0zV7" }],
	["path", { d: "M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" }],
	["path", { d: "m5 8 3 8a5 5 0 0 1-6 0zV7" }],
	["path", { d: "M7 21h10" }]
], K = [["path", { d: "m21 21-4.34-4.34" }], ["circle", {
	cx: "11",
	cy: "11",
	r: "8"
}]], q = [["path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" }], ["path", { d: "m21.854 2.147-10.94 10.939" }]], J = [
	["path", { d: "M14 17H5" }],
	["path", { d: "M19 7h-9" }],
	["circle", {
		cx: "17",
		cy: "17",
		r: "3"
	}],
	["circle", {
		cx: "7",
		cy: "7",
		r: "3"
	}]
], Y = [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { d: "m9 12 2 2 4-4" }]], X = [
	["path", { d: "M10 5H3" }],
	["path", { d: "M12 19H3" }],
	["path", { d: "M14 3v4" }],
	["path", { d: "M16 17v4" }],
	["path", { d: "M21 12h-9" }],
	["path", { d: "M21 19h-5" }],
	["path", { d: "M21 5h-7" }],
	["path", { d: "M8 10v4" }],
	["path", { d: "M8 12H3" }]
], Z = [["rect", {
	width: "14",
	height: "20",
	x: "5",
	y: "2",
	rx: "2",
	ry: "2"
}], ["path", { d: "M12 18h.01" }]], re = [["path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" }]], ie = [
	["circle", {
		cx: "12",
		cy: "12",
		r: "4"
	}],
	["path", { d: "M12 2v2" }],
	["path", { d: "M12 20v2" }],
	["path", { d: "m4.93 4.93 1.41 1.41" }],
	["path", { d: "m17.66 17.66 1.41 1.41" }],
	["path", { d: "M2 12h2" }],
	["path", { d: "M20 12h2" }],
	["path", { d: "m6.34 17.66-1.41 1.41" }],
	["path", { d: "m19.07 4.93-1.41 1.41" }]
], ae = [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "6"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "2"
	}]
], oe = [
	["path", { d: "M10 2h4" }],
	["path", { d: "M12 14v-4" }],
	["path", { d: "M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6" }],
	["path", { d: "M9 17H4v5" }]
], se = [
	["path", { d: "M10 11v6" }],
	["path", { d: "M14 11v6" }],
	["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
	["path", { d: "M3 6h18" }],
	["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
], Q = [
	["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
	["path", { d: "M12 9v4" }],
	["path", { d: "M12 17h.01" }]
], ce = [
	["path", { d: "M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2" }],
	["path", { d: "M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2" }],
	["path", { d: "M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3" }],
	["path", { d: "M4 22h16" }],
	["path", { d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" }],
	["path", { d: "M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" }]
], le = [
	["path", { d: "M12 3v12" }],
	["path", { d: "m17 8-5-5-5 5" }],
	["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }]
], ue = [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ["circle", {
	cx: "12",
	cy: "7",
	r: "4"
}]], de = [
	["path", { d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" }],
	["path", { d: "M7 2v20" }],
	["path", { d: "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" }]
], fe = [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]], $ = ({ icons: e = {}, nameAttr: t = "data-lucide", attrs: n = {}, root: r = document, inTemplates: i } = {}) => {
	if (!Object.values(e).length) throw Error("Please provide an icons object.\nIf you want to use all the icons you can import it like:\n `import { createIcons, icons } from 'lucide';\nlucide.createIcons({icons});`");
	if (r === void 0) throw Error("`createIcons()` only works in a browser environment.");
	if (Array.from(r.querySelectorAll(`[${t}]`)).forEach((r) => s(r, {
		nameAttr: t,
		icons: e,
		attrs: n
	})), i && Array.from(r.querySelectorAll("template")).forEach((r) => $({
		icons: e,
		nameAttr: t,
		attrs: n,
		root: r.content,
		inTemplates: i
	})), t === "data-lucide") {
		let t = r.querySelectorAll("[icon-name]");
		t.length > 0 && (console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"), Array.from(t).forEach((t) => s(t, {
			nameAttr: "icon-name",
			icons: e,
			attrs: n
		})));
	}
};
//#endregion
export { c as Apple, l as Archive, u as ArrowLeft, d as BellRing, f as CalendarCheck, p as CalendarDays, m as ChartNoAxesColumnIncreasing, h as ChartNoAxesCombined, g as Check, x as CheckCircle2, _ as ChevronDown, v as ChevronLeft, y as ChevronRight, b as ChevronUp, S as CircleHelp, C as Clock3, w as Compass, T as Copy, E as Download, D as Dumbbell, k as Eye, O as EyeOff, A as FilePlus2, j as Info, M as Languages, N as Layers3, P as LayoutDashboard, F as LayoutTemplate, I as LockKeyhole, L as LogOut, ne as Medal, R as Monitor, z as Moon, B as Palette, V as Pencil, H as Play, U as Plus, W as Ruler, G as Scale, K as Search, q as Send, J as Settings2, Y as ShieldCheck, X as SlidersHorizontal, Z as Smartphone, re as Star, ie as Sun, ae as Target, oe as TimerReset, se as Trash2, Q as TriangleAlert, ce as Trophy, le as Upload, ue as User, de as Utensils, fe as X, $ as createIcons };
