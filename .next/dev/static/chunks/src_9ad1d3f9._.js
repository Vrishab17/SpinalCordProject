(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/supabaseClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://hguwpykhghwwigjagqrk.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndXdweWtoZ2h3d2lnamFncXJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY1MTcyOSwiZXhwIjoyMDg4MjI3NzI5fQ.gznbM-EoqHbTm-84yp162N4y_1hfwusr0ZNCsKXvW84");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/Header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabaseClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function Header() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(33);
    if ($[0] !== "5f4e298360c98bb3fd956e73c3bb03e9716bf0321134d17eb562da72b3063b21") {
        for(let $i = 0; $i < 33; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "5f4e298360c98bb3fd956e73c3bb03e9716bf0321134d17eb562da72b3063b21";
    }
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [gpName, setGpName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Loading...");
    const [menuOpen, setMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const menuItemsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(t0);
    let t1;
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "Header[useEffect()]": ()=>{
                const fetchGP = async function fetchGP() {
                    const { data: userData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
                    if (!userData?.user) {
                        setGpName("Unknown User");
                        return;
                    }
                    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Staff").select("title, given_name, family_name").eq("user_id", userData.user.id).single();
                    if (error || !data) {
                        setGpName("Unknown User");
                        return;
                    }
                    const gp = data;
                    const formatted = `${gp.title} ${gp.given_name[0]}. ${gp.family_name}`;
                    setGpName(formatted);
                };
                fetchGP();
            }
        })["Header[useEffect()]"];
        t2 = [];
        $[2] = t1;
        $[3] = t2;
    } else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    let t3;
    let t4;
    if ($[4] !== menuOpen) {
        t3 = ({
            "Header[useEffect()]": ()=>{
                const handleClickOutside = function handleClickOutside(e) {
                    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                        setMenuOpen(false);
                    }
                };
                if (menuOpen) {
                    document.addEventListener("mousedown", handleClickOutside);
                }
                return ()=>document.removeEventListener("mousedown", handleClickOutside);
            }
        })["Header[useEffect()]"];
        t4 = [
            menuOpen
        ];
        $[4] = menuOpen;
        $[5] = t3;
        $[6] = t4;
    } else {
        t3 = $[5];
        t4 = $[6];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t3, t4);
    let t5;
    let t6;
    if ($[7] !== menuOpen) {
        t5 = ({
            "Header[useEffect()]": ()=>{
                if (menuOpen) {
                    menuItemsRef.current[0]?.focus();
                }
            }
        })["Header[useEffect()]"];
        t6 = [
            menuOpen
        ];
        $[7] = menuOpen;
        $[8] = t5;
        $[9] = t6;
    } else {
        t5 = $[8];
        t6 = $[9];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t5, t6);
    let t7;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = function handleMenuKeyDown(e_0) {
            const items = menuItemsRef.current.filter(Boolean);
            const currentIdx = items.indexOf(document.activeElement);
            if (e_0.key === "ArrowDown") {
                e_0.preventDefault();
                const next = currentIdx < items.length - 1 ? currentIdx + 1 : 0;
                items[next]?.focus();
            } else {
                if (e_0.key === "ArrowUp") {
                    e_0.preventDefault();
                    const prev = currentIdx > 0 ? currentIdx - 1 : items.length - 1;
                    items[prev]?.focus();
                } else {
                    if (e_0.key === "Escape") {
                        setMenuOpen(false);
                    }
                }
            }
        };
        $[10] = t7;
    } else {
        t7 = $[10];
    }
    const handleMenuKeyDown = t7;
    let t8;
    if ($[11] !== router) {
        t8 = async function handleSignOut() {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
            router.push("/");
        };
        $[11] = router;
        $[12] = t8;
    } else {
        t8 = $[12];
    }
    const handleSignOut = t8;
    let t10;
    let t9;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = {
            backgroundColor: "#33476D",
            color: "#FFFFFF",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%"
        };
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: "28px",
                        fontWeight: 700,
                        marginBottom: "4px"
                    },
                    children: "Health New Zealand"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 162,
                    columnNumber: 16
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#1FC2D5"
                    },
                    children: "Te Whatu Ora"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 166,
                    columnNumber: 34
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/Header.tsx",
            lineNumber: 162,
            columnNumber: 11
        }, this);
        $[13] = t10;
        $[14] = t9;
    } else {
        t10 = $[13];
        t9 = $[14];
    }
    let t11;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = {
            position: "relative"
        };
        $[15] = t11;
    } else {
        t11 = $[15];
    }
    let t12;
    let t13;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = ({
            "Header[<button>.onClick]": ()=>setMenuOpen(_HeaderButtonOnClickSetMenuOpen)
        })["Header[<button>.onClick]"];
        t13 = {
            fontSize: "18px",
            fontWeight: 400,
            color: "#AEB9D3"
        };
        $[16] = t12;
        $[17] = t13;
    } else {
        t12 = $[16];
        t13 = $[17];
    }
    let t14;
    if ($[18] !== gpName) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: t13,
            children: gpName
        }, void 0, false, {
            fileName: "[project]/src/components/layout/Header.tsx",
            lineNumber: 205,
            columnNumber: 11
        }, this);
        $[18] = gpName;
        $[19] = t14;
    } else {
        t14 = $[19];
    }
    let t15;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                border: "4px solid #7E90BA",
                position: "relative",
                flexShrink: 0
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: "#7E90BA",
                        position: "absolute",
                        top: "10px",
                        left: "50%",
                        transform: "translateX(-50%)"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 220,
                    columnNumber: 8
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: "28px",
                        height: "14px",
                        borderRadius: "14px 14px 10px 10px",
                        backgroundColor: "#7E90BA",
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 229,
                    columnNumber: 12
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/Header.tsx",
            lineNumber: 213,
            columnNumber: 11
        }, this);
        $[20] = t15;
    } else {
        t15 = $[20];
    }
    const t16 = menuOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9";
    let t17;
    if ($[21] !== t16) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "#AEB9D3",
            strokeWidth: "2.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                points: t16
            }, void 0, false, {
                fileName: "[project]/src/components/layout/Header.tsx",
                lineNumber: 246,
                columnNumber: 151
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/layout/Header.tsx",
            lineNumber: 246,
            columnNumber: 11
        }, this);
        $[21] = t16;
        $[22] = t17;
    } else {
        t17 = $[22];
    }
    let t18;
    if ($[23] !== menuOpen || $[24] !== t14 || $[25] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: "profile-trigger",
            "aria-haspopup": "menu",
            "aria-expanded": menuOpen,
            "aria-label": "User menu",
            onClick: t12,
            children: [
                t14,
                t15,
                t17
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/Header.tsx",
            lineNumber: 254,
            columnNumber: 11
        }, this);
        $[23] = menuOpen;
        $[24] = t14;
        $[25] = t17;
        $[26] = t18;
    } else {
        t18 = $[26];
    }
    let t19;
    if ($[27] !== handleSignOut || $[28] !== menuOpen) {
        t19 = menuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "profile-menu",
            role: "menu",
            onKeyDown: handleMenuKeyDown,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "profile-menu-item",
                    role: "menuitem",
                    tabIndex: -1,
                    ref: {
                        "Header[<button>.ref]": (el)=>{
                            menuItemsRef.current[0] = el;
                        }
                    }["Header[<button>.ref]"],
                    children: "Profile"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 264,
                    columnNumber: 95
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "profile-menu-item",
                    role: "menuitem",
                    tabIndex: -1,
                    ref: {
                        "Header[<button>.ref]": (el_0)=>{
                            menuItemsRef.current[1] = el_0;
                        }
                    }["Header[<button>.ref]"],
                    children: "Settings"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 268,
                    columnNumber: 50
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                    className: "profile-menu-divider"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 272,
                    columnNumber: 51
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "profile-menu-item",
                    role: "menuitem",
                    tabIndex: -1,
                    ref: {
                        "Header[<button>.ref]": (el_1)=>{
                            menuItemsRef.current[2] = el_1;
                        }
                    }["Header[<button>.ref]"],
                    onClick: handleSignOut,
                    style: {
                        color: "#B91C1C"
                    },
                    children: "Sign out"
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 272,
                    columnNumber: 90
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/Header.tsx",
            lineNumber: 264,
            columnNumber: 23
        }, this);
        $[27] = handleSignOut;
        $[28] = menuOpen;
        $[29] = t19;
    } else {
        t19 = $[29];
    }
    let t20;
    if ($[30] !== t18 || $[31] !== t19) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            style: t9,
            children: [
                t10,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: dropdownRef,
                    style: t11,
                    children: [
                        t18,
                        t19
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/layout/Header.tsx",
                    lineNumber: 287,
                    columnNumber: 35
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/Header.tsx",
            lineNumber: 287,
            columnNumber: 11
        }, this);
        $[30] = t18;
        $[31] = t19;
        $[32] = t20;
    } else {
        t20 = $[32];
    }
    return t20;
}
_s(Header, "zKTE0zEN9xejl2KTEyEGqpv7erI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Header;
function _HeaderButtonOnClickSetMenuOpen(v) {
    return !v;
}
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/landing/recentAssessments.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecentAssessments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabaseClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
function getStatusColor(status) {
    switch(status.toUpperCase()){
        case "DRAFT":
            return "#C96A2B";
        case "FINALISED":
            return "#3E8E41";
        case "IN PROGRESS":
            return "#2F66C8";
        default:
            return "#15284C";
    }
}
function RecentAssessments() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(59);
    if ($[0] !== "84b720f69668b41783ea697e2f48fea2511763f0f8bb70546c5ca79ca8f4d36e") {
        for(let $i = 0; $i < 59; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "84b720f69668b41783ea697e2f48fea2511763f0f8bb70546c5ca79ca8f4d36e";
    }
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    let t1;
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "RecentAssessments[useEffect()]": ()=>{
                const fetchRecentAssessments = async function fetchRecentAssessments() {
                    setLoading(true);
                    setError(null);
                    const { data: assessmentData, error: assessmentError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Assessment").select("assessment_id, assessment_date, status, current_version, PATIENTpatient_id").order("assessment_date", {
                        ascending: false
                    }).limit(50);
                    if (assessmentError) {
                        setError(`Assessment query failed: ${assessmentError.message}`);
                        setLoading(false);
                        return;
                    }
                    const assessments = assessmentData ?? [];
                    if (assessments.length === 0) {
                        setRows([]);
                        setLoading(false);
                        return;
                    }
                    const patientIds = [
                        ...new Set(assessments.map(_RecentAssessmentsUseEffectFetchRecentAssessmentsAssessmentsMap))
                    ];
                    const { data: patientData, error: patientError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Patient").select("patient_id, nhi_number").in("patient_id", patientIds);
                    if (patientError) {
                        setError(`Patient query failed: ${patientError.message}`);
                        setLoading(false);
                        return;
                    }
                    const { data: patientNameData, error: patientNameError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Patient Name").select("PATIENTpatient_id, given_name, family_name").in("PATIENTpatient_id", patientIds);
                    if (patientNameError) {
                        setError(`Patient Name query failed: ${patientNameError.message}`);
                        setLoading(false);
                        return;
                    }
                    const patients = patientData ?? [];
                    const patientNames = patientNameData ?? [];
                    const patientMap = new Map();
                    patients.forEach({
                        "RecentAssessments[useEffect() > fetchRecentAssessments > patients.forEach()]": (p)=>patientMap.set(p.patient_id, p)
                    }["RecentAssessments[useEffect() > fetchRecentAssessments > patients.forEach()]"]);
                    const nameMap = new Map();
                    patientNames.forEach({
                        "RecentAssessments[useEffect() > fetchRecentAssessments > patientNames.forEach()]": (n)=>nameMap.set(n.PATIENTpatient_id, n)
                    }["RecentAssessments[useEffect() > fetchRecentAssessments > patientNames.forEach()]"]);
                    const mappedRows = assessments.map({
                        "RecentAssessments[useEffect() > fetchRecentAssessments > assessments.map()]": (a_0)=>{
                            const patient = patientMap.get(a_0.PATIENTpatient_id);
                            const name = nameMap.get(a_0.PATIENTpatient_id);
                            return {
                                id: a_0.assessment_id,
                                patientId: a_0.PATIENTpatient_id,
                                nhiNumber: patient?.nhi_number ?? "N/A",
                                patientName: name ? `${name.given_name} ${name.family_name}` : `Patient #${a_0.PATIENTpatient_id}`,
                                date: formatDate(a_0.assessment_date),
                                versionNumber: `v${a_0.current_version}`,
                                status: a_0.status
                            };
                        }
                    }["RecentAssessments[useEffect() > fetchRecentAssessments > assessments.map()]"]);
                    setRows(mappedRows);
                    setLoading(false);
                };
                fetchRecentAssessments();
            }
        })["RecentAssessments[useEffect()]"];
        t2 = [];
        $[2] = t1;
        $[3] = t2;
    } else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    let t3;
    bb0: {
        if (!searchTerm.trim()) {
            t3 = rows;
            break bb0;
        }
        let t4;
        if ($[4] !== rows || $[5] !== searchTerm) {
            const term = searchTerm.toLowerCase();
            t4 = rows.filter({
                "RecentAssessments[rows.filter()]": (r)=>r.nhiNumber.toLowerCase().includes(term) || r.patientName.toLowerCase().includes(term)
            }["RecentAssessments[rows.filter()]"]);
            $[4] = rows;
            $[5] = searchTerm;
            $[6] = t4;
        } else {
            t4 = $[6];
        }
        t3 = t4;
    }
    const filteredRows = t3;
    let t4;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            padding: "14px 12px",
            minHeight: "48px",
            fontWeight: 600,
            position: "sticky",
            top: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 2,
            textAlign: "left",
            borderBottom: "1px solid #D6D6D6"
        };
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    const headerCellStyle = t4;
    let t10;
    let t11;
    let t12;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[8] !== error || $[9] !== filteredRows || $[10] !== loading || $[11] !== router || $[12] !== searchTerm) {
        const bodyCellStyle = {
            padding: "14px 12px",
            minHeight: "48px",
            verticalAlign: "middle"
        };
        let t13;
        if ($[21] !== router) {
            t13 = function handleRowKeyDown(e, patientId) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/history/${patientId}`);
                }
            };
            $[21] = router;
            $[22] = t13;
        } else {
            t13 = $[22];
        }
        const handleRowKeyDown = t13;
        let t14;
        if ($[23] !== router) {
            t14 = function handleActionClick(e_0, row) {
                e_0.stopPropagation();
                if (row.status.toUpperCase() === "DRAFT") {
                    router.push(`/assessment?assessmentId=${row.id}`);
                } else {
                    router.push(`/history/${row.patientId}`);
                }
            };
            $[23] = router;
            $[24] = t14;
        } else {
            t14 = $[24];
        }
        const handleActionClick = t14;
        t9 = "dashboard-card";
        let t15;
        if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
            t10 = {
                backgroundColor: "#FFFFFF",
                border: "1px solid #D6D6D6",
                borderRadius: "8px",
                padding: "18px",
                color: "#15284C",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: 0
            };
            t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    fontSize: "20px",
                    fontWeight: 600,
                    margin: "0 0 14px 0",
                    flexShrink: 0
                },
                children: "Recent Assessments"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 255,
                columnNumber: 13
            }, this);
            t15 = {
                position: "relative",
                marginBottom: "14px",
                flexShrink: 0
            };
            $[25] = t10;
            $[26] = t11;
            $[27] = t15;
        } else {
            t10 = $[25];
            t11 = $[26];
            t15 = $[27];
        }
        let t16;
        if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
            t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "#9CA3AF",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                style: {
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "11",
                        cy: "11",
                        r: "8"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/recentAssessments.tsx",
                        lineNumber: 282,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                        x1: "21",
                        y1: "21",
                        x2: "16.65",
                        y2: "16.65"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/recentAssessments.tsx",
                        lineNumber: 282,
                        columnNumber: 42
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 276,
                columnNumber: 13
            }, this);
            $[28] = t16;
        } else {
            t16 = $[28];
        }
        let t17;
        if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
            t17 = ({
                "RecentAssessments[<input>.onChange]": (e_1)=>setSearchTerm(e_1.target.value)
            })["RecentAssessments[<input>.onChange]"];
            $[29] = t17;
        } else {
            t17 = $[29];
        }
        let t18;
        let t19;
        if ($[30] !== searchTerm) {
            t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                className: "search-input",
                placeholder: "Search by NHI or name...",
                "aria-label": "Search patients",
                value: searchTerm,
                onChange: t17
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 299,
                columnNumber: 13
            }, this);
            t19 = searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: {
                    "RecentAssessments[<button>.onClick]": ()=>setSearchTerm("")
                }["RecentAssessments[<button>.onClick]"],
                "aria-label": "Clear search",
                className: "btn",
                style: {
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: "4px",
                    fontSize: "18px",
                    lineHeight: 1,
                    color: "#6B7280"
                },
                children: "×"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 300,
                columnNumber: 27
            }, this);
            $[30] = searchTerm;
            $[31] = t18;
            $[32] = t19;
        } else {
            t18 = $[31];
            t19 = $[32];
        }
        if ($[33] !== t18 || $[34] !== t19) {
            t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: t15,
                children: [
                    t16,
                    t18,
                    t19
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 322,
                columnNumber: 13
            }, this);
            $[33] = t18;
            $[34] = t19;
            $[35] = t12;
        } else {
            t12 = $[35];
        }
        let t20;
        let t21;
        let t22;
        let t23;
        let t24;
        if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
            t8 = {
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "auto"
            };
            t6 = {
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                fontSize: "14px",
                color: "#15284C"
            };
            t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                scope: "col",
                style: headerCellStyle,
                children: "NHI Number"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 348,
                columnNumber: 13
            }, this);
            t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                scope: "col",
                style: headerCellStyle,
                children: "Patient Name"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 349,
                columnNumber: 13
            }, this);
            t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                scope: "col",
                style: headerCellStyle,
                children: "Date"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 350,
                columnNumber: 13
            }, this);
            t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                scope: "col",
                style: headerCellStyle,
                children: "Version"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 351,
                columnNumber: 13
            }, this);
            t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                scope: "col",
                style: headerCellStyle,
                children: "Status"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 352,
                columnNumber: 13
            }, this);
            $[36] = t20;
            $[37] = t21;
            $[38] = t22;
            $[39] = t23;
            $[40] = t24;
            $[41] = t6;
            $[42] = t8;
        } else {
            t20 = $[36];
            t21 = $[37];
            t22 = $[38];
            t23 = $[39];
            t24 = $[40];
            t6 = $[41];
            t8 = $[42];
        }
        if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                    children: [
                        t20,
                        t21,
                        t22,
                        t23,
                        t24,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                            scope: "col",
                            style: {
                                ...headerCellStyle,
                                textAlign: "right"
                            },
                            children: "Action"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/recentAssessments.tsx",
                            lineNumber: 370,
                            columnNumber: 48
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/recentAssessments.tsx",
                    lineNumber: 370,
                    columnNumber: 19
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 370,
                columnNumber: 12
            }, this);
            $[43] = t7;
        } else {
            t7 = $[43];
        }
        t5 = loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 6,
                style: {
                    padding: "24px",
                    textAlign: "center",
                    color: "#6B7280"
                },
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 378,
                columnNumber: 24
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/recentAssessments.tsx",
            lineNumber: 378,
            columnNumber: 20
        }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 6,
                style: {
                    padding: "24px",
                    textAlign: "center",
                    color: "red"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 382,
                columnNumber: 45
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/recentAssessments.tsx",
            lineNumber: 382,
            columnNumber: 41
        }, this) : filteredRows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 6,
                style: {
                    padding: "24px",
                    textAlign: "center",
                    color: "#6B7280"
                },
                children: searchTerm ? "No patients match your search." : "No recent assessments to display."
            }, void 0, false, {
                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                lineNumber: 386,
                columnNumber: 62
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/recentAssessments.tsx",
            lineNumber: 386,
            columnNumber: 58
        }, this) : filteredRows.map({
            "RecentAssessments[filteredRows.map()]": (row_0)=>{
                const isDraft = row_0.status.toUpperCase() === "DRAFT";
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                    className: "clickable-row",
                    role: "link",
                    tabIndex: 0,
                    "aria-label": `View patient ${row_0.patientName}`,
                    onClick: {
                        "RecentAssessments[filteredRows.map() > <tr>.onClick]": ()=>router.push(`/history/${row_0.patientId}`)
                    }["RecentAssessments[filteredRows.map() > <tr>.onClick]"],
                    onKeyDown: {
                        "RecentAssessments[filteredRows.map() > <tr>.onKeyDown]": (e_2)=>handleRowKeyDown(e_2, row_0.patientId)
                    }["RecentAssessments[filteredRows.map() > <tr>.onKeyDown]"],
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                ...bodyCellStyle,
                                borderBottom: "1px solid #E5E7EB"
                            },
                            children: row_0.nhiNumber
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/recentAssessments.tsx",
                            lineNumber: 397,
                            columnNumber: 70
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                ...bodyCellStyle,
                                borderBottom: "1px solid #E5E7EB"
                            },
                            children: row_0.patientName
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/recentAssessments.tsx",
                            lineNumber: 400,
                            columnNumber: 36
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                ...bodyCellStyle,
                                borderBottom: "1px solid #E5E7EB"
                            },
                            children: row_0.date
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/recentAssessments.tsx",
                            lineNumber: 403,
                            columnNumber: 38
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                ...bodyCellStyle,
                                borderBottom: "1px solid #E5E7EB"
                            },
                            children: row_0.versionNumber
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/recentAssessments.tsx",
                            lineNumber: 406,
                            columnNumber: 31
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                ...bodyCellStyle,
                                borderBottom: "1px solid #E5E7EB",
                                color: getStatusColor(row_0.status)
                            },
                            children: row_0.status
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/recentAssessments.tsx",
                            lineNumber: 409,
                            columnNumber: 40
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                ...bodyCellStyle,
                                borderBottom: "1px solid #E5E7EB",
                                textAlign: "right"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "row-action-btn",
                                onClick: {
                                    "RecentAssessments[filteredRows.map() > <button>.onClick]": (e_3)=>handleActionClick(e_3, row_0)
                                }["RecentAssessments[filteredRows.map() > <button>.onClick]"],
                                "aria-label": isDraft ? `Continue draft for ${row_0.patientName}` : `View ${row_0.patientName}`,
                                children: isDraft ? "Continue Draft" : "View"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/recentAssessments.tsx",
                                lineNumber: 417,
                                columnNumber: 14
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/recentAssessments.tsx",
                            lineNumber: 413,
                            columnNumber: 33
                        }, this)
                    ]
                }, row_0.id, true, {
                    fileName: "[project]/src/components/landing/recentAssessments.tsx",
                    lineNumber: 393,
                    columnNumber: 16
                }, this);
            }
        }["RecentAssessments[filteredRows.map()]"]);
        $[8] = error;
        $[9] = filteredRows;
        $[10] = loading;
        $[11] = router;
        $[12] = searchTerm;
        $[13] = t10;
        $[14] = t11;
        $[15] = t12;
        $[16] = t5;
        $[17] = t6;
        $[18] = t7;
        $[19] = t8;
        $[20] = t9;
    } else {
        t10 = $[13];
        t11 = $[14];
        t12 = $[15];
        t5 = $[16];
        t6 = $[17];
        t7 = $[18];
        t8 = $[19];
        t9 = $[20];
    }
    let t13;
    if ($[44] !== t5) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
            children: t5
        }, void 0, false, {
            fileName: "[project]/src/components/landing/recentAssessments.tsx",
            lineNumber: 447,
            columnNumber: 11
        }, this);
        $[44] = t5;
        $[45] = t13;
    } else {
        t13 = $[45];
    }
    let t14;
    if ($[46] !== t13 || $[47] !== t6 || $[48] !== t7) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            style: t6,
            children: [
                t7,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/recentAssessments.tsx",
            lineNumber: 455,
            columnNumber: 11
        }, this);
        $[46] = t13;
        $[47] = t6;
        $[48] = t7;
        $[49] = t14;
    } else {
        t14 = $[49];
    }
    let t15;
    if ($[50] !== t14 || $[51] !== t8) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t8,
            children: t14
        }, void 0, false, {
            fileName: "[project]/src/components/landing/recentAssessments.tsx",
            lineNumber: 465,
            columnNumber: 11
        }, this);
        $[50] = t14;
        $[51] = t8;
        $[52] = t15;
    } else {
        t15 = $[52];
    }
    let t16;
    if ($[53] !== t10 || $[54] !== t11 || $[55] !== t12 || $[56] !== t15 || $[57] !== t9) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t9,
            style: t10,
            children: [
                t11,
                t12,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/recentAssessments.tsx",
            lineNumber: 474,
            columnNumber: 11
        }, this);
        $[53] = t10;
        $[54] = t11;
        $[55] = t12;
        $[56] = t15;
        $[57] = t9;
        $[58] = t16;
    } else {
        t16 = $[58];
    }
    return t16;
}
_s(RecentAssessments, "vTkOmYGzmo17I74aupskX5kfPwo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = RecentAssessments;
function _RecentAssessmentsUseEffectFetchRecentAssessmentsAssessmentsMap(a) {
    return a.PATIENTpatient_id;
}
var _c;
__turbopack_context__.k.register(_c, "RecentAssessments");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/landing/upcoming.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UpcomingReviews
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabaseClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function formatReviewDate(dateString) {
    const reviewDate = new Date(dateString);
    const today = new Date();
    const reviewOnly = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = reviewOnly.getTime() === todayOnly.getTime();
    if (isToday) {
        return {
            formatted: "Today",
            isToday: true
        };
    }
    const day = String(reviewDate.getDate()).padStart(2, "0");
    const month = String(reviewDate.getMonth() + 1).padStart(2, "0");
    const year = reviewDate.getFullYear();
    return {
        formatted: `${day}/${month}/${year}`,
        isToday: false
    };
}
function UpcomingReviews() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(21);
    if ($[0] !== "94704c7f81ac0c66dbaef9ac70e31a8545b194e833bc158cc079395f6bb4212f") {
        for(let $i = 0; $i < 21; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "94704c7f81ac0c66dbaef9ac70e31a8545b194e833bc158cc079395f6bb4212f";
    }
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t1;
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "UpcomingReviews[useEffect()]": ()=>{
                const fetchUpcomingReviews = async function fetchUpcomingReviews() {
                    setLoading(true);
                    setError(null);
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, "0");
                    const dd = String(today.getDate()).padStart(2, "0");
                    const todayString = `${yyyy}-${mm}-${dd}`;
                    const { data: assessmentData, error: assessmentError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Assessment").select("assessment_id, PATIENTpatient_id, review_date").gte("review_date", todayString).order("review_date", {
                        ascending: true
                    }).limit(50);
                    if (assessmentError) {
                        setError(`Upcoming reviews query failed: ${assessmentError.message}`);
                        setLoading(false);
                        return;
                    }
                    const assessments = assessmentData ?? [];
                    if (assessments.length === 0) {
                        setRows([]);
                        setLoading(false);
                        return;
                    }
                    const patientIds = [
                        ...new Set(assessments.map(_UpcomingReviewsUseEffectFetchUpcomingReviewsAssessmentsMap))
                    ];
                    const { data: patientData, error: patientError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Patient").select("patient_id, nhi_number").in("patient_id", patientIds);
                    if (patientError) {
                        setError(`Patient query failed: ${patientError.message}`);
                        setLoading(false);
                        return;
                    }
                    const { data: patientNameData, error: patientNameError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Patient Name").select("PATIENTpatient_id, given_name, family_name").in("PATIENTpatient_id", patientIds);
                    if (patientNameError) {
                        setError(`Patient Name query failed: ${patientNameError.message}`);
                        setLoading(false);
                        return;
                    }
                    const patients = patientData ?? [];
                    const patientNames = patientNameData ?? [];
                    const patientMap = new Map();
                    patients.forEach({
                        "UpcomingReviews[useEffect() > fetchUpcomingReviews > patients.forEach()]": (p)=>patientMap.set(p.patient_id, p)
                    }["UpcomingReviews[useEffect() > fetchUpcomingReviews > patients.forEach()]"]);
                    const nameMap = new Map();
                    patientNames.forEach({
                        "UpcomingReviews[useEffect() > fetchUpcomingReviews > patientNames.forEach()]": (n)=>nameMap.set(n.PATIENTpatient_id, n)
                    }["UpcomingReviews[useEffect() > fetchUpcomingReviews > patientNames.forEach()]"]);
                    const mappedRows = assessments.map({
                        "UpcomingReviews[useEffect() > fetchUpcomingReviews > assessments.map()]": (assessment)=>{
                            const patient = patientMap.get(assessment.PATIENTpatient_id);
                            const name = nameMap.get(assessment.PATIENTpatient_id);
                            const reviewDate = formatReviewDate(assessment.review_date);
                            return {
                                id: assessment.assessment_id,
                                patientId: assessment.PATIENTpatient_id,
                                nhi: patient?.nhi_number ?? "N/A",
                                patientName: name ? `${name.given_name} ${name.family_name}` : `Patient #${assessment.PATIENTpatient_id}`,
                                date: reviewDate.formatted,
                                isToday: reviewDate.isToday
                            };
                        }
                    }["UpcomingReviews[useEffect() > fetchUpcomingReviews > assessments.map()]"]);
                    setRows(mappedRows);
                    setLoading(false);
                };
                fetchUpcomingReviews();
            }
        })["UpcomingReviews[useEffect()]"];
        t2 = [];
        $[2] = t1;
        $[3] = t2;
    } else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    let t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = {
            padding: "14px 12px",
            minHeight: "48px",
            fontWeight: 600,
            position: "sticky",
            top: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 2,
            textAlign: "left",
            borderBottom: "1px solid #D6D6D6"
        };
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    const headerCellStyle = t3;
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            padding: "14px 12px",
            minHeight: "48px",
            verticalAlign: "middle",
            borderBottom: "1px solid #E5E7EB"
        };
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    const bodyCellStyle = t4;
    let t5;
    if ($[6] !== router) {
        t5 = function handleRowKeyDown(e, patientId) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/history/${patientId}`);
            }
        };
        $[6] = router;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    const handleRowKeyDown = t5;
    let t10;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = {
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: "8px",
            padding: "18px",
            width: "100%",
            color: "#15284C",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0
        };
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            style: {
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "14px",
                flexShrink: 0
            },
            children: "Upcoming Reviews"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/upcoming.tsx",
            lineNumber: 220,
            columnNumber: 10
        }, this);
        t8 = {
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "auto"
        };
        t9 = {
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "14px"
        };
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        scope: "col",
                        style: headerCellStyle,
                        children: "NHI"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/upcoming.tsx",
                        lineNumber: 238,
                        columnNumber: 22
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        scope: "col",
                        style: headerCellStyle,
                        children: "Patient Name"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/upcoming.tsx",
                        lineNumber: 238,
                        columnNumber: 70
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        scope: "col",
                        style: headerCellStyle,
                        children: "Date"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/upcoming.tsx",
                        lineNumber: 238,
                        columnNumber: 127
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/upcoming.tsx",
                lineNumber: 238,
                columnNumber: 18
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/upcoming.tsx",
            lineNumber: 238,
            columnNumber: 11
        }, this);
        $[8] = t10;
        $[9] = t6;
        $[10] = t7;
        $[11] = t8;
        $[12] = t9;
    } else {
        t10 = $[8];
        t6 = $[9];
        t7 = $[10];
        t8 = $[11];
        t9 = $[12];
    }
    let t11;
    if ($[13] !== error || $[14] !== handleRowKeyDown || $[15] !== loading || $[16] !== router || $[17] !== rows) {
        t11 = loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 3,
                style: {
                    padding: "24px",
                    textAlign: "center",
                    color: "#6B7280"
                },
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/src/components/landing/upcoming.tsx",
                lineNumber: 253,
                columnNumber: 25
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/upcoming.tsx",
            lineNumber: 253,
            columnNumber: 21
        }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 3,
                style: {
                    padding: "24px",
                    textAlign: "center",
                    color: "red"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/landing/upcoming.tsx",
                lineNumber: 257,
                columnNumber: 45
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/upcoming.tsx",
            lineNumber: 257,
            columnNumber: 41
        }, this) : rows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 3,
                style: {
                    padding: "24px",
                    textAlign: "center",
                    color: "#6B7280"
                },
                children: "No upcoming reviews"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/upcoming.tsx",
                lineNumber: 261,
                columnNumber: 54
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/upcoming.tsx",
            lineNumber: 261,
            columnNumber: 50
        }, this) : rows.map({
            "UpcomingReviews[rows.map()]": (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                    className: "clickable-row",
                    role: "link",
                    tabIndex: 0,
                    "aria-label": `View patient ${row.patientName}`,
                    onClick: {
                        "UpcomingReviews[rows.map() > <tr>.onClick]": ()=>router.push(`/history/${row.patientId}`)
                    }["UpcomingReviews[rows.map() > <tr>.onClick]"],
                    onKeyDown: {
                        "UpcomingReviews[rows.map() > <tr>.onKeyDown]": (e_0)=>handleRowKeyDown(e_0, row.patientId)
                    }["UpcomingReviews[rows.map() > <tr>.onKeyDown]"],
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: bodyCellStyle,
                            children: row.nhi
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/upcoming.tsx",
                            lineNumber: 270,
                            columnNumber: 58
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: bodyCellStyle,
                            children: row.patientName
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/upcoming.tsx",
                            lineNumber: 270,
                            columnNumber: 98
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: bodyCellStyle,
                            children: row.isToday ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    display: "inline-block",
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    backgroundColor: "#15284C",
                                    color: "#FFFFFF",
                                    fontWeight: 600,
                                    fontSize: "13px"
                                },
                                children: "Today"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/upcoming.tsx",
                                lineNumber: 270,
                                columnNumber: 187
                            }, this) : row.date
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/upcoming.tsx",
                            lineNumber: 270,
                            columnNumber: 146
                        }, this)
                    ]
                }, row.id, true, {
                    fileName: "[project]/src/components/landing/upcoming.tsx",
                    lineNumber: 266,
                    columnNumber: 45
                }, this)
        }["UpcomingReviews[rows.map()]"]);
        $[13] = error;
        $[14] = handleRowKeyDown;
        $[15] = loading;
        $[16] = router;
        $[17] = rows;
        $[18] = t11;
    } else {
        t11 = $[18];
    }
    let t12;
    if ($[19] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "dashboard-card",
            style: t6,
            children: [
                t7,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: t8,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: t9,
                        children: [
                            t10,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: t11
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/upcoming.tsx",
                                lineNumber: 291,
                                columnNumber: 97
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/upcoming.tsx",
                        lineNumber: 291,
                        columnNumber: 74
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/upcoming.tsx",
                    lineNumber: 291,
                    columnNumber: 58
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/upcoming.tsx",
            lineNumber: 291,
            columnNumber: 11
        }, this);
        $[19] = t11;
        $[20] = t12;
    } else {
        t12 = $[20];
    }
    return t12;
}
_s(UpcomingReviews, "4tC+Quxr/AlKD6gLKe2Hl1dIvoI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = UpcomingReviews;
function _UpcomingReviewsUseEffectFetchUpcomingReviewsAssessmentsMap(a) {
    return a.PATIENTpatient_id;
}
var _c;
__turbopack_context__.k.register(_c, "UpcomingReviews");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/landing/drafts.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Drafts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabaseClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function relativeTime(iso) {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    if (diffMs < 0) return "just now";
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Intl.DateTimeFormat("en-NZ").format(new Date(iso));
}
function normalizeStatus(status) {
    const upper = status.toUpperCase();
    if (upper === "OPEN") return "OPEN";
    if (upper === "FINALIZED" || upper === "FINALISED") return "FINALIZED";
    return "DRAFT";
}
function labelStatus(status) {
    switch(status){
        case "OPEN":
            return "Open";
        case "FINALIZED":
            return "Finalized";
        case "DRAFT":
        default:
            return "Draft";
    }
}
function Drafts() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(30);
    if ($[0] !== "ce8e18997d2fdb0a1b76c1369ebf3b3f6117f3f49040984ec39c81b5d41e3b77") {
        for(let $i = 0; $i < 30; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ce8e18997d2fdb0a1b76c1369ebf3b3f6117f3f49040984ec39c81b5d41e3b77";
    }
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [drafts, setDrafts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t1;
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "Drafts[useEffect()]": ()=>{
                const fetchDrafts = async function fetchDrafts() {
                    setLoading(true);
                    setError(null);
                    const { data: draftData, error: draftError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Draft Assessment").select("draft_id, ASSESSMENTassessment_id, last_saved_at, is_current_draft").eq("is_current_draft", "true");
                    if (draftError) {
                        setError(`Draft query failed: ${draftError.message}`);
                        setLoading(false);
                        return;
                    }
                    const draftRows = draftData ?? [];
                    if (draftRows.length === 0) {
                        setDrafts([]);
                        setLoading(false);
                        return;
                    }
                    const assessmentIds = [
                        ...new Set(draftRows.map(_DraftsUseEffectFetchDraftsDraftRowsMap))
                    ];
                    const { data: assessmentData, error: assessmentError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Assessment").select("assessment_id, PATIENTpatient_id, current_version, status").in("assessment_id", assessmentIds);
                    if (assessmentError) {
                        setError(`Assessment query failed: ${assessmentError.message}`);
                        setLoading(false);
                        return;
                    }
                    const assessments = assessmentData ?? [];
                    const patientIds = [
                        ...new Set(assessments.map(_DraftsUseEffectFetchDraftsAssessmentsMap))
                    ];
                    const { data: patientData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Patient").select("patient_id, nhi_number").in("patient_id", patientIds);
                    const { data: patientNameData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("Patient Name").select("PATIENTpatient_id, given_name, family_name").in("PATIENTpatient_id", patientIds);
                    const patientMap = new Map();
                    (patientData ?? []).forEach({
                        "Drafts[useEffect() > fetchDrafts > (anonymous)()]": (p)=>{
                            patientMap.set(p.patient_id, p);
                        }
                    }["Drafts[useEffect() > fetchDrafts > (anonymous)()]"]);
                    const nameMap = new Map();
                    (patientNameData ?? []).forEach({
                        "Drafts[useEffect() > fetchDrafts > (anonymous)()]": (n)=>{
                            nameMap.set(n.PATIENTpatient_id, n);
                        }
                    }["Drafts[useEffect() > fetchDrafts > (anonymous)()]"]);
                    const mappedDrafts = draftRows.map({
                        "Drafts[useEffect() > fetchDrafts > draftRows.map()]": (draft_0)=>{
                            const assessment_0 = assessments.find({
                                "Drafts[useEffect() > fetchDrafts > draftRows.map() > assessments.find()]": (a)=>a.assessment_id === draft_0.ASSESSMENTassessment_id
                            }["Drafts[useEffect() > fetchDrafts > draftRows.map() > assessments.find()]"]);
                            if (!assessment_0) {
                                return null;
                            }
                            const patient = patientMap.get(assessment_0.PATIENTpatient_id);
                            const name = nameMap.get(assessment_0.PATIENTpatient_id);
                            return {
                                id: String(draft_0.draft_id),
                                assessmentId: assessment_0.assessment_id,
                                patientId: assessment_0.PATIENTpatient_id,
                                nhi: patient?.nhi_number ?? "N/A",
                                patientName: name ? `${name.given_name} ${name.family_name}` : `Patient #${assessment_0.PATIENTpatient_id}`,
                                dateLastEditedISO: draft_0.last_saved_at ?? new Date().toISOString(),
                                versionNumber: assessment_0.current_version ?? 1,
                                status: normalizeStatus(assessment_0.status ?? "DRAFT")
                            };
                        }
                    }["Drafts[useEffect() > fetchDrafts > draftRows.map()]"]).filter(_DraftsUseEffectFetchDraftsAnonymous);
                    setDrafts(mappedDrafts);
                    setLoading(false);
                };
                fetchDrafts();
            }
        })["Drafts[useEffect()]"];
        t2 = [];
        $[2] = t1;
        $[3] = t2;
    } else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    let t3;
    if ($[4] !== drafts) {
        t3 = [
            ...drafts
        ].sort(_DraftsAnonymous);
        $[4] = drafts;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    const sortedDrafts = t3;
    let t4;
    if ($[6] !== router) {
        t4 = function handleRowKeyDown(e, patientId) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/history/${patientId}`);
            }
        };
        $[6] = router;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    const handleRowKeyDown = t4;
    let t5;
    if ($[8] !== router) {
        t5 = function handleContinueClick(e_0, assessmentId) {
            e_0.stopPropagation();
            router.push(`/assessment?assessmentId=${assessmentId}`);
        };
        $[8] = router;
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    const handleContinueClick = t5;
    let t6;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = {
            padding: "14px 12px",
            minHeight: "48px",
            textAlign: "left",
            fontWeight: 600,
            position: "sticky",
            top: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 2,
            borderBottom: "1px solid #D6D6D6"
        };
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    const headerCellStyle = t6;
    let t7;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = {
            padding: "14px 12px",
            minHeight: "48px",
            verticalAlign: "middle",
            borderBottom: "1px solid #E5E7EB"
        };
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    const bodyCellStyle = t7;
    let t10;
    let t11;
    let t12;
    let t13;
    let t14;
    let t15;
    let t8;
    let t9;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = {
            backgroundColor: "#FFFFFF",
            border: "1px solid #D6D6D6",
            borderRadius: "8px",
            padding: "18px",
            width: "100%",
            color: "#15284C",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0
        };
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            style: {
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "14px",
                flexShrink: 0
            },
            children: "Pending Drafts"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 266,
            columnNumber: 10
        }, this);
        t10 = {
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "auto"
        };
        t11 = {
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "14px"
        };
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            scope: "col",
            style: headerCellStyle,
            children: "NHI"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 284,
            columnNumber: 11
        }, this);
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            scope: "col",
            style: headerCellStyle,
            children: "Patient Name"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 285,
            columnNumber: 11
        }, this);
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            scope: "col",
            style: headerCellStyle,
            children: "Last Edited"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 286,
            columnNumber: 11
        }, this);
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            scope: "col",
            style: headerCellStyle,
            children: "Status"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 287,
            columnNumber: 11
        }, this);
        $[12] = t10;
        $[13] = t11;
        $[14] = t12;
        $[15] = t13;
        $[16] = t14;
        $[17] = t15;
        $[18] = t8;
        $[19] = t9;
    } else {
        t10 = $[12];
        t11 = $[13];
        t12 = $[14];
        t13 = $[15];
        t14 = $[16];
        t15 = $[17];
        t8 = $[18];
        t9 = $[19];
    }
    let t16;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                children: [
                    t12,
                    t13,
                    t14,
                    t15,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        scope: "col",
                        style: {
                            ...headerCellStyle,
                            textAlign: "right"
                        },
                        children: "Action"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/drafts.tsx",
                        lineNumber: 308,
                        columnNumber: 42
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/drafts.tsx",
                lineNumber: 308,
                columnNumber: 18
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 308,
            columnNumber: 11
        }, this);
        $[20] = t16;
    } else {
        t16 = $[20];
    }
    let t17;
    if ($[21] !== error || $[22] !== handleContinueClick || $[23] !== handleRowKeyDown || $[24] !== loading || $[25] !== router || $[26] !== sortedDrafts) {
        t17 = loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 5,
                style: {
                    padding: "24px",
                    textAlign: "center"
                },
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/src/components/landing/drafts.tsx",
                lineNumber: 318,
                columnNumber: 25
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 318,
            columnNumber: 21
        }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 5,
                style: {
                    padding: "24px",
                    textAlign: "center",
                    color: "red"
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/landing/drafts.tsx",
                lineNumber: 321,
                columnNumber: 45
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 321,
            columnNumber: 41
        }, this) : sortedDrafts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 5,
                style: {
                    padding: "24px",
                    textAlign: "center"
                },
                children: "No drafts yet"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/drafts.tsx",
                lineNumber: 325,
                columnNumber: 62
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 325,
            columnNumber: 58
        }, this) : sortedDrafts.map({
            "Drafts[sortedDrafts.map()]": (draft_2)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                    className: "clickable-row",
                    role: "link",
                    tabIndex: 0,
                    "aria-label": `View patient ${draft_2.patientName}`,
                    onClick: {
                        "Drafts[sortedDrafts.map() > <tr>.onClick]": ()=>router.push(`/history/${draft_2.patientId}`)
                    }["Drafts[sortedDrafts.map() > <tr>.onClick]"],
                    onKeyDown: {
                        "Drafts[sortedDrafts.map() > <tr>.onKeyDown]": (e_1)=>handleRowKeyDown(e_1, draft_2.patientId)
                    }["Drafts[sortedDrafts.map() > <tr>.onKeyDown]"],
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: bodyCellStyle,
                            children: draft_2.nhi
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/drafts.tsx",
                            lineNumber: 333,
                            columnNumber: 57
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: bodyCellStyle,
                            children: draft_2.patientName
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/drafts.tsx",
                            lineNumber: 333,
                            columnNumber: 101
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: bodyCellStyle,
                            children: relativeTime(draft_2.dateLastEditedISO)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/drafts.tsx",
                            lineNumber: 333,
                            columnNumber: 153
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: bodyCellStyle,
                            children: labelStatus(draft_2.status)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/drafts.tsx",
                            lineNumber: 333,
                            columnNumber: 225
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            style: {
                                ...bodyCellStyle,
                                textAlign: "right"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "row-action-btn",
                                onClick: {
                                    "Drafts[sortedDrafts.map() > <button>.onClick]": (e_2)=>handleContinueClick(e_2, draft_2.assessmentId)
                                }["Drafts[sortedDrafts.map() > <button>.onClick]"],
                                "aria-label": `Continue draft for ${draft_2.patientName}`,
                                children: "Continue"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/drafts.tsx",
                                lineNumber: 336,
                                columnNumber: 12
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/drafts.tsx",
                            lineNumber: 333,
                            columnNumber: 285
                        }, this)
                    ]
                }, draft_2.id, true, {
                    fileName: "[project]/src/components/landing/drafts.tsx",
                    lineNumber: 329,
                    columnNumber: 48
                }, this)
        }["Drafts[sortedDrafts.map()]"]);
        $[21] = error;
        $[22] = handleContinueClick;
        $[23] = handleRowKeyDown;
        $[24] = loading;
        $[25] = router;
        $[26] = sortedDrafts;
        $[27] = t17;
    } else {
        t17 = $[27];
    }
    let t18;
    if ($[28] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "dashboard-card",
            style: t8,
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: t10,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: t11,
                        children: [
                            t16,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: t17
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/drafts.tsx",
                                lineNumber: 352,
                                columnNumber: 99
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/drafts.tsx",
                        lineNumber: 352,
                        columnNumber: 75
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/drafts.tsx",
                    lineNumber: 352,
                    columnNumber: 58
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/drafts.tsx",
            lineNumber: 352,
            columnNumber: 11
        }, this);
        $[28] = t17;
        $[29] = t18;
    } else {
        t18 = $[29];
    }
    return t18;
}
_s(Drafts, "0Lt1Ya575xL+9grTaCCiUYKcCCk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Drafts;
function _DraftsAnonymous(a_0, b) {
    return new Date(b.dateLastEditedISO).getTime() - new Date(a_0.dateLastEditedISO).getTime();
}
function _DraftsUseEffectFetchDraftsAnonymous(draft_1) {
    return draft_1 !== null;
}
function _DraftsUseEffectFetchDraftsAssessmentsMap(assessment) {
    return assessment.PATIENTpatient_id;
}
function _DraftsUseEffectFetchDraftsDraftRowsMap(draft) {
    return draft.ASSESSMENTassessment_id;
}
var _c;
__turbopack_context__.k.register(_c, "Drafts");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_9ad1d3f9._.js.map