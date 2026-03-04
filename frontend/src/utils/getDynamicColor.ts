import { getRandomColor } from "./getRandomColor";

export const getDynamicColor = (key: string | number, type: "status" | "priority" | "project") => {
    return getRandomColor(key, type);
};
