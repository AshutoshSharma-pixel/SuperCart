export interface Store {
    id: number
    shopId: string
    name: string
    location: string
    subscriptionStatus: 'active' | 'grace' | 'expired' | 'none'
    subscriptionPlan: 'starter' | 'growth' | 'enterprise' | null
    subscriptionExpiry: string | null
}

export interface Product {
    id: number
    barcode: string
    name: string
    price: string
    quantity: number
    lowStockThreshold: number
    isOutOfStock: boolean
    discountType: 'percentage' | 'flat' | null
    discountValue: string | null
    discountActive: boolean
    discountExpiry: string | null
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
