import { useContext } from "react"; 
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../ThemeContext";



export default function ThemeToggle() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}
