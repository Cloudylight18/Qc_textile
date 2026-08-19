// "use client";

// import * as React from "react";
// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "next-themes";

// export function ThemeToggleButton() {
//   const { setTheme, resolvedTheme } = useTheme();
//   const [mounted, setMounted] = React.useState(false);

//   React.useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div className="w-[42px] h-[42px] rounded-xl border border-transparent"></div>;
//   }

//   return (
//     <button
//       onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
//       className="flex items-center justify-center p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
//       title="Toggle Light/Dark Mode"
//     >
//       {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
//     </button>
//   );
// }