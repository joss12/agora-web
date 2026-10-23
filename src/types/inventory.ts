export type InventoryMovementType = | "STOCK_IN" | "STOCK_OUT";

export interface InventoryMovement {
    id: number;
    productId: number;
    type: InventoryMovementType;
    quantity: number;
    stockBefore: number;
    stockAfter: number;
    created: string;
}
