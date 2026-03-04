import { COLOR_POOL_STATUS, COLOR_POOL_PRIORITY, COLOR_POOL_PROJECT } from "./color";

export const getRandomColor = (key: string | number, type: "status" | "priority" | "project") => {
    if (!key) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";

    let hash = 0;
    const str = String(key);

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let pool: string[];
    switch (type) {
        case "status":
            pool = COLOR_POOL_STATUS;
            break;
        case "priority":
            pool = COLOR_POOL_PRIORITY;
            break;
        case "project":
            pool = COLOR_POOL_PROJECT;
            break;
        default:
            pool = COLOR_POOL_STATUS;
    }

    const index = Math.abs(hash) % pool.length;
    return pool[index];
};
