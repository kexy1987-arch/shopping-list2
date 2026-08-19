export type product = {
    id: number,
    name: string,
    price: string,
    category: string,
    store: string,
    description: string,
    barcode: string,
    image_url: string,
    created_at: string,
    country: string
}

export type user = {
    id: number,
    first_name: string,
    last_name: string,
    email: string,
    country: string
}

export type ListItem = {
    id: number,
    amount: number,
    bought: boolean
}

export type DbProduct = {
    id: number,
    name: string,
    price: number,
    category: string,
    store: string,
    description: string,
    barcode: string | null,
    image_url: string,
    created_at: string,
    country: string
}

export type Stores = {
    store: string
}