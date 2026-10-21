import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`theme-toggle-btn ${className}`}
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="theme-toggle-icon sun-icon" size={18} />
            ) : (
                <Moon className="theme-toggle-icon moon-icon" size={18} />
            )}
        </button>
    );
}
