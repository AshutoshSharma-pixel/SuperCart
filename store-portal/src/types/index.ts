export interface Store {
    id: number
    shopId: string
    name: string
    location: string
    upiId: string | null
    planTier: string | null
    planExpiresAt: string | null
    gracePeriodEndsAt: string | null
    isLocked: boolean
}
export interface Product {
    id: number
    barcode: string
    name: string
    price: string
    stock: number
    quantity?: number
    lowStockThreshold: number
    isOutOfStock: boolean
    discountType: 'PERCENTAGE' | 'FLAT' | null
    discountValue: number | null
    isDiscountActive: boolean
    discountExpiresAt: string | null
}
export interface StockLog {
    id: number
    productId: number
    productName: string
    type: 'received' | 'sold' | 'adjustment'
    quantity: number
    reason: string | null
    createdAt: string
}
export interface Transaction {
    id: number
    sessionId: string
    amount: number
    status: 'paid' | 'pending' | 'flagged'
    itemCount: number
    createdAt: string
}
