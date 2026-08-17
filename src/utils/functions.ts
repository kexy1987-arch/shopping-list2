import type { ListItem } from "./types";

export function titleCase(str: string) {
    if (!str) return;
    return str
        .split(" ")
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

export function creatList(prev: ListItem[], myList: ListItem[], productId: number) {
    const exist = myList.find(item => item.id === productId);

    if (exist) {
        return prev.map(item => item.id === productId ? { ...item, amount: item.amount + 1 } : item)
    }

    return [...prev, { id: productId, amount: 1, bought: false }]
}