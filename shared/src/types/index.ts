export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle: string;
  is_giftcard: boolean;
  status: ProductStatus;
  thumbnail?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  hs_code?: string;
  origin_country?: string;
  mid_code?: string;
  material?: string;
  collection_id?: string;
  collection?: ProductCollection;
  type_id?: string;
  type?: ProductType;
  tags?: ProductTag[];
  variants: ProductVariant[];
  options: ProductOption[];
  images: Image[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  product_id: string;
  product?: Product;
  prices: MoneyAmount[];
  sku?: string;
  barcode?: string;
  ean?: string;
  upc?: string;
  variant_rank?: number;
  inventory_quantity: number;
  allow_backorder: boolean;
  manage_inventory: boolean;
  hs_code?: string;
  origin_country?: string;
  mid_code?: string;
  material?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  options: ProductOptionValue[];
  created_at: string;
  updated_at: string;
}

export interface MoneyAmount {
  id: string;
  currency_code: string;
  amount: number;
  min_quantity?: number;
  max_quantity?: number;
  price_list_id?: string;
  variant_id: string;
  region_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCollection {
  id: string;
  title: string;
  handle: string;
  created_at: string;
  updated_at: string;
}

export interface ProductTag {
  id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: string;
  title: string;
  values: ProductOptionValue[];
  product_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductOptionValue {
  id: string;
  value: string;
  option_id: string;
  variant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  customer_id?: string;
  customer?: Customer;
  email?: string;
  billing_address_id?: string;
  billing_address?: Address;
  shipping_address_id?: string;
  shipping_address?: Address;
  items: LineItem[];
  region_id: string;
  region: Region;
  discounts: Discount[];
  gift_cards: GiftCard[];
  payment_sessions: PaymentSession[];
  payment_id?: string;
  payment?: Payment;
  shipping_methods: ShippingMethod[];
  type: CartType;
  completed_at?: string;
  payment_authorized_at?: string;
  idempotency_key?: string;
  context?: Record<string, unknown>;
  sales_channel_id?: string;
  created_at: string;
  updated_at: string;
  subtotal: number;
  discount_total: number;
  item_tax_total: number;
  shipping_total: number;
  shipping_tax_total: number;
  tax_total: number;
  refunded_total: number;
  total: number;
  refundable_amount: number;
  gift_card_total: number;
  gift_card_tax_total: number;
}

export interface LineItem {
  id: string;
  cart_id: string;
  cart?: Cart;
  order_id?: string;
  swap_id?: string;
  claim_order_id?: string;
  tax_lines: LineItemTaxLine[];
  adjustments: LineItemAdjustment[];
  variant_id?: string;
  variant?: ProductVariant;
  product_id?: string;
  product?: Product;
  title: string;
  description?: string;
  thumbnail?: string;
  is_return?: boolean;
  is_giftcard?: boolean;
  should_merge?: boolean;
  allow_discounts?: boolean;
  has_shipping?: boolean;
  unit_price: number;
  quantity: number;
  fulfilled_quantity?: number;
  returned_quantity?: number;
  swap_quantity?: number;
  claim_quantity?: number;
  refundable?: number;
  subtotal?: number;
  tax_total?: number;
  total?: number;
  original_total?: number;
  original_tax_total?: number;
  discount_total?: number;
  original_item_id?: string;
  order_edit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LineItemTaxLine {
  id: string;
  rate: number;
  name: string;
  code?: string;
  created_at: string;
  updated_at: string;
}

export interface LineItemAdjustment {
  id: string;
  item_id: string;
  item: LineItem;
  description: string;
  discount_id?: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  billing_address_id?: string;
  billing_address?: Address;
  shipping_addresses: Address[];
  phone?: string;
  has_account: boolean;
  orders: Order[];
  groups: CustomerGroup[];
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id?: string;
  customer?: Customer;
  company?: string;
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  country_code?: string;
  country?: Country;
  province?: string;
  postal_code?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  iso_2: string;
  iso_3: string;
  num_code: number;
  name: string;
  display_name: string;
  region_id?: string;
  region?: Region;
}

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  currency?: Currency;
  tax_rate: number;
  tax_rates: TaxRate[];
  tax_code?: string;
  gift_cards_taxable?: boolean;
  automatic_taxes?: boolean;
  countries: Country[];
  payment_providers: PaymentProvider[];
  fulfillment_providers: FulfillmentProvider[];
  includes_tax?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  symbol: string;
  symbol_native: string;
  name: string;
  includes_tax?: boolean;
}

export interface TaxRate {
  id: string;
  rate?: number;
  code?: string;
  name: string;
  region_id: string;
  region?: Region;
  products?: Product[];
  product_types?: ProductType[];
  shipping_options?: ShippingOption[];
  product_count?: number;
  product_type_count?: number;
  shipping_option_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  payment_status: PaymentStatus;
  display_id: number;
  cart_id?: string;
  cart?: Cart;
  customer_id: string;
  customer: Customer;
  email: string;
  billing_address_id?: string;
  billing_address?: Address;
  shipping_address_id?: string;
  shipping_address?: Address;
  region_id: string;
  region: Region;
  currency_code: string;
  currency?: Currency;
  tax_rate?: number;
  discounts: Discount[];
  gift_cards: GiftCard[];
  shipping_methods: ShippingMethod[];
  payments: Payment[];
  fulfillments: Fulfillment[];
  returns: Return[];
  claims: ClaimOrder[];
  refunds: Refund[];
  swaps: Swap[];
  draft_order_id?: string;
  draft_order?: DraftOrder;
  items: LineItem[];
  edits: OrderEdit[];
  gift_card_transactions: GiftCardTransaction[];
  canceled_at?: string;
  no_notification?: boolean;
  idempotency_key?: string;
  external_id?: string;
  sales_channel_id?: string;
  sales_channel?: SalesChannel;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  refunded_total: number;
  total: number;
  subtotal: number;
  paid_total: number;
  refundable_amount: number;
  gift_card_total: number;
  gift_card_tax_total: number;
  returnable_items?: LineItem[];
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: string;
  code: string;
  is_dynamic: boolean;
  rule_id?: string;
  rule?: DiscountRule;
  is_disabled: boolean;
  parent_discount_id?: string;
  parent_discount?: Discount;
  starts_at: string;
  ends_at?: string;
  valid_duration?: string;
  regions: Region[];
  usage_limit?: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountRule {
  id: string;
  description?: string;
  type: DiscountRuleType;
  value: number;
  allocation?: AllocationType;
  conditions: DiscountCondition[];
  created_at: string;
  updated_at: string;
}

export interface DiscountCondition {
  id: string;
  type: DiscountConditionType;
  operator: DiscountConditionOperator;
  discount_rule_id: string;
  discount_rule?: DiscountRule;
  products: Product[];
  product_types: ProductType[];
  product_tags: ProductTag[];
  product_collections: ProductCollection[];
  customer_groups: CustomerGroup[];
  created_at: string;
  updated_at: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
  customers: Customer[];
  price_lists: PriceList[];
  created_at: string;
  updated_at: string;
}

export interface PriceList {
  id: string;
  name: string;
  description: string;
  type: PriceListType;
  status: PriceListStatus;
  starts_at?: string;
  ends_at?: string;
  customer_groups: CustomerGroup[];
  prices: MoneyAmount[];
  includes_tax?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  region_id: string;
  region?: Region;
  order_id?: string;
  order?: Order;
  is_disabled: boolean;
  ends_at?: string;
  tax_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  gift_card?: GiftCard;
  order_id: string;
  order?: Order;
  amount: number;
  created_at: string;
}

export interface PaymentProvider {
  id: string;
  is_installed: boolean;
}

export interface FulfillmentProvider {
  id: string;
  is_installed: boolean;
}

export interface PaymentSession {
  id: string;
  cart_id?: string;
  cart?: Cart;
  provider_id: string;
  is_selected?: boolean;
  is_initiated?: boolean;
  status: PaymentSessionStatus;
  data: Record<string, unknown>;
  amount?: number;
  payment_authorized_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  swap_id?: string;
  swap?: Swap;
  cart_id?: string;
  cart?: Cart;
  order_id?: string;
  order?: Order;
  amount: number;
  currency_code: string;
  currency?: Currency;
  amount_refunded: number;
  provider_id: string;
  data: Record<string, unknown>;
  captured_at?: string;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingMethod {
  id: string;
  shipping_option_id: string;
  shipping_option?: ShippingOption;
  order_id?: string;
  order?: Order;
  claim_order_id?: string;
  claim_order?: ClaimOrder;
  cart_id?: string;
  cart?: Cart;
  swap_id?: string;
  swap?: Swap;
  return_id?: string;
  return_order?: Return;
  data: Record<string, unknown>;
  price: number;
  tax_lines: ShippingMethodTaxLine[];
  tax_total: number;
  subtotal: number;
  total: number;
  includes_tax?: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  region_id: string;
  region?: Region;
  profile_id: string;
  profile?: ShippingProfile;
  provider_id: string;
  provider?: FulfillmentProvider;
  price_type: ShippingOptionPriceType;
  amount?: number;
  is_return?: boolean;
  admin_only?: boolean;
  requirements: ShippingOptionRequirement[];
  data: Record<string, unknown>;
  includes_tax?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingProfile {
  id: string;
  name: string;
  type: ShippingProfileType;
  products: Product[];
  shipping_options: ShippingOption[];
  created_at: string;
  updated_at: string;
}

export interface ShippingOptionRequirement {
  id: string;
  shipping_option_id: string;
  shipping_option?: ShippingOption;
  type: ShippingOptionRequirementType;
  amount: number;
  deleted_at?: string;
}

export interface ShippingMethodTaxLine {
  id: string;
  rate: number;
  name: string;
  code?: string;
  created_at: string;
  updated_at: string;
}

export interface Fulfillment {
  id: string;
  claim_order_id?: string;
  claim_order?: ClaimOrder;
  swap_id?: string;
  swap?: Swap;
  order_id?: string;
  order?: Order;
  provider_id: string;
  provider?: FulfillmentProvider;
  location_id?: string;
  shipped_at?: string;
  canceled_at?: string;
  data: Record<string, unknown>;
  tracking_links: TrackingLink[];
  items: FulfillmentItem[];
  created_at: string;
  updated_at: string;
  idempotency_key?: string;
  no_notification?: boolean;
}

export interface FulfillmentItem {
  fulfillment_id: string;
  item_id: string;
  item?: LineItem;
  quantity: number;
}

export interface TrackingLink {
  id: string;
  url?: string;
  tracking_number: string;
  fulfillment_id: string;
  fulfillment?: Fulfillment;
  created_at: string;
  updated_at: string;
  idempotency_key?: string;
}

export interface Return {
  id: string;
  status: ReturnStatus;
  items: ReturnItem[];
  swap_id?: string;
  swap?: Swap;
  claim_order_id?: string;
  claim_order?: ClaimOrder;
  order_id?: string;
  order?: Order;
  shipping_method?: ShippingMethod;
  shipping_data: Record<string, unknown>;
  location_id?: string;
  refund_amount: number;
  no_notification?: boolean;
  idempotency_key?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReturnItem {
  return_id: string;
  item_id: string;
  item?: LineItem;
  quantity: number;
  is_requested?: boolean;
  requested_quantity?: number;
  received_quantity?: number;
  reason_id?: string;
  reason?: ReturnReason;
  note?: string;
}

export interface ReturnReason {
  id: string;
  value: string;
  label: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimOrder {
  id: string;
  payment_status: ClaimPaymentStatus;
  fulfillment_status: ClaimFulfillmentStatus;
  type: ClaimType;
  order_id: string;
  order?: Order;
  return_order?: Return;
  shipping_address_id?: string;
  shipping_address?: Address;
  shipping_methods: ShippingMethod[];
  fulfillments: Fulfillment[];
  claim_items: ClaimItem[];
  additional_items: LineItem[];
  no_notification?: boolean;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
  idempotency_key?: string;
}

export interface ClaimItem {
  id: string;
  images: ClaimImage[];
  claim_order_id: string;
  claim_order?: ClaimOrder;
  item_id: string;
  item?: LineItem;
  variant_id: string;
  variant?: ProductVariant;
  reason: ClaimReason;
  note?: string;
  quantity: number;
  tags: ClaimTag[];
  created_at: string;
  updated_at: string;
}

export interface ClaimImage {
  id: string;
  claim_item_id: string;
  claim_item?: ClaimItem;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimTag {
  id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: string;
  order_id?: string;
  order?: Order;
  amount: number;
  note?: string;
  reason: RefundReason;
  payment_id?: string;
  payment?: Payment;
  created_at: string;
  updated_at: string;
  idempotency_key?: string;
}

export interface Swap {
  id: string;
  fulfillment_status: SwapFulfillmentStatus;
  payment_status: SwapPaymentStatus;
  order_id: string;
  order?: Order;
  additional_items: LineItem[];
  return_order?: Return;
  fulfillments: Fulfillment[];
  payment?: Payment;
  difference_due?: number;
  shipping_address_id?: string;
  shipping_address?: Address;
  shipping_methods: ShippingMethod[];
  cart_id?: string;
  cart?: Cart;
  confirmed_at?: string;
  canceled_at?: string;
  no_notification?: boolean;
  allow_backorder?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  idempotency_key?: string;
}

export interface DraftOrder {
  id: string;
  status: DraftOrderStatus;
  display_id: number;
  cart_id?: string;
  cart?: Cart;
  order_id?: string;
  order?: Order;
  canceled_at?: string;
  completed_at?: string;
  no_notification_order?: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderEdit {
  id: string;
  order_id: string;
  order?: Order;
  changes: OrderItemChange[];
  internal_note?: string;
  created_by: string;
  requested_by?: string;
  requested_at?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  declined_by?: string;
  declined_reason?: string;
  declined_at?: string;
  canceled_by?: string;
  canceled_at?: string;
  subtotal?: number;
  discount_total?: number;
  shipping_total?: number;
  gift_card_total?: number;
  gift_card_tax_total?: number;
  tax_total?: number;
  total?: number;
  difference_due?: number;
  status: OrderEditStatus;
  items: LineItem[];
  payment_collection_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItemChange {
  id: string;
  type: OrderEditItemChangeType;
  order_edit_id: string;
  order_edit?: OrderEdit;
  original_line_item_id?: string;
  original_line_item?: LineItem;
  line_item_id?: string;
  line_item?: LineItem;
  created_at: string;
  updated_at: string;
}

export interface SalesChannel {
  id: string;
  name: string;
  description?: string;
  is_disabled?: boolean;
  locations?: any[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Enums
export enum ProductStatus {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

export enum CartType {
  DEFAULT = 'default',
  SWAP = 'swap',
  DRAFT_ORDER = 'draft_order',
  PAYMENT_LINK = 'payment_link',
  CLAIM = 'claim',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action',
}

export enum FulfillmentStatus {
  NOT_FULFILLED = 'not_fulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  PARTIALLY_RETURNED = 'partially_returned',
  RETURNED = 'returned',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action',
}

export enum PaymentStatus {
  NOT_PAID = 'not_paid',
  AWAITING = 'awaiting',
  CAPTURED = 'captured',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action',
}

export enum PaymentSessionStatus {
  AUTHORIZED = 'authorized',
  PENDING = 'pending',
  REQUIRES_MORE = 'requires_more',
  ERROR = 'error',
  CANCELED = 'canceled',
}

export enum DiscountRuleType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}

export enum AllocationType {
  TOTAL = 'total',
  ITEM = 'item',
}

export enum DiscountConditionType {
  PRODUCTS = 'products',
  PRODUCT_TYPES = 'product_types',
  PRODUCT_COLLECTIONS = 'product_collections',
  PRODUCT_TAGS = 'product_tags',
  CUSTOMER_GROUPS = 'customer_groups',
}

export enum DiscountConditionOperator {
  IN = 'in',
  NOT_IN = 'not_in',
}

export enum PriceListType {
  SALE = 'sale',
  OVERRIDE = 'override',
}

export enum PriceListStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
}

export enum ShippingOptionPriceType {
  FLAT_RATE = 'flat_rate',
  CALCULATED = 'calculated',
}

export enum ShippingProfileType {
  DEFAULT = 'default',
  GIFT_CARD = 'gift_card',
  CUSTOM = 'custom',
}

export enum ShippingOptionRequirementType {
  MIN_SUBTOTAL = 'min_subtotal',
  MAX_SUBTOTAL = 'max_subtotal',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  RECEIVED = 'received',
  REQUIRES_ACTION = 'requires_action',
  CANCELED = 'canceled',
}

export enum ClaimPaymentStatus {
  NA = 'na',
  NOT_REFUNDED = 'not_refunded',
  REFUNDED = 'refunded',
}

export enum ClaimFulfillmentStatus {
  NOT_FULFILLED = 'not_fulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  CANCELED = 'canceled',
}

export enum ClaimType {
  REFUND = 'refund',
  REPLACE = 'replace',
}

export enum ClaimReason {
  MISSING_ITEM = 'missing_item',
  WRONG_ITEM = 'wrong_item',
  PRODUCTION_FAILURE = 'production_failure',
  OTHER = 'other',
}

export enum RefundReason {
  DISCOUNT = 'discount',
  RETURN = 'return',
  SWAP = 'swap',
  CLAIM = 'claim',
  OTHER = 'other',
}

export enum SwapFulfillmentStatus {
  NOT_FULFILLED = 'not_fulfilled',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  PARTIALLY_SHIPPED = 'partially_shipped',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action',
}

export enum SwapPaymentStatus {
  NOT_PAID = 'not_paid',
  AWAITING = 'awaiting',
  CAPTURED = 'captured',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  DIFFERENCE_REFUNDED = 'difference_refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  REQUIRES_ACTION = 'requires_action',
}

export enum DraftOrderStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
}

export enum OrderEditStatus {
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  REQUESTED = 'requested',
  CREATED = 'created',
  CANCELED = 'canceled',
}

export enum OrderEditItemChangeType {
  ITEM_ADD = 'item_add',
  ITEM_REMOVE = 'item_remove',
  ITEM_UPDATE = 'item_update',
}

// API Response interfaces
export interface ProductsResponse {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
}

export interface ProductResponse {
  product: Product;
}

export interface CartResponse {
  cart: Cart;
}

export interface OrderResponse {
  order: Order;
}

export interface CustomerResponse {
  customer: Customer;
}

export interface RegionsResponse {
  regions: Region[];
}

export interface ShippingOptionsResponse {
  shipping_options: ShippingOption[];
}

// Constants
export const API_BASE_URL = 'http://localhost:9000';

export const ENDPOINTS = {
  PRODUCTS: '/store/products',
  PRODUCT_BY_ID: (id: string) => `/store/products/${id}`,
  CART: '/store/carts',
  CART_BY_ID: (id: string) => `/store/carts/${id}`,
  ADD_TO_CART: (id: string) => `/store/carts/${id}/line-items`,
  UPDATE_CART_ITEM: (cartId: string, itemId: string) =>
    `/store/carts/${cartId}/line-items/${itemId}`,
  REMOVE_FROM_CART: (cartId: string, itemId: string) =>
    `/store/carts/${cartId}/line-items/${itemId}`,
  REGIONS: '/store/regions',
  SHIPPING_OPTIONS: (cartId: string) => `/store/shipping-options/${cartId}`,
  PAYMENT_SESSIONS: (cartId: string) => `/store/carts/${cartId}/payment-sessions`,
  COMPLETE_CART: (cartId: string) => `/store/carts/${cartId}/complete`,
  AUTH: {
    LOGIN: '/store/auth',
    LOGOUT: '/store/auth',
    CUSTOMER: '/store/auth/customer',
  },
  CUSTOMERS: '/store/customers',
  ORDERS: '/store/customers/me/orders',
} as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
};

export const DEFAULT_REGION = 'reg_01HQSCJQPH6ANWQSH9G5CF5Q90';
export const DEFAULT_CURRENCY = 'usd';
export const ITEMS_PER_PAGE = 12;
export const SEARCH_DEBOUNCE_TIME = 300;

// Utility types
export type ApiError = {
  message: string;
  type: string;
  code?: string;
};

export type PaginationParams = {
  offset?: number;
  limit?: number;
};

export type ProductFilters = {
  q?: string;
  collection_id?: string[];
  type_id?: string[];
  tag_id?: string[];
  region_id?: string;
  currency_code?: string;
  is_giftcard?: boolean;
};

export type SortOptions = 'created_at' | 'updated_at' | 'title';
export type SortOrder = 'asc' | 'desc';

// Cart utilities
export interface CartItem extends LineItem {
  product?: Product;
  variant?: ProductVariant;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

// Search interfaces
export interface SearchFilters {
  query?: string;
  collection_id?: string;
  type_id?: string;
  tags?: string[];
  price_range?: {
    min: number;
    max: number;
  };
}

export interface SearchResult {
  products: Product[];
  count: number;
  facets: {
    collections: { id: string; title: string; count: number }[];
    types: { id: string; value: string; count: number }[];
    tags: { id: string; value: string; count: number }[];
    price_ranges: { min: number; max: number; count: number }[];
  };
}

// Authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface AuthResponse {
  customer: Customer;
  access_token?: string;
}

// Checkout
export interface CheckoutData {
  email?: string;
  billing_address: Partial<Address>;
  shipping_address: Partial<Address>;
  shipping_method_id: string;
  payment_method: string;
}

export interface PaymentMethodData {
  provider_id: string;
  data: Record<string, any>;
}

// Utility functions for formatting
export const formatPrice = (amount: number, currencyCode: string = DEFAULT_CURRENCY): string => {
  const symbol = CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode.toUpperCase();
  return `${symbol}${(amount / 100).toFixed(2)}`;
};

export const getProductPrice = (product: Product, regionId?: string): MoneyAmount | null => {
  const variant = product.variants?.[0];
  if (!variant || !variant.prices?.length) return null;

  // If regionId provided, try to find price for that region
  if (regionId) {
    const regionPrice = variant.prices.find((p) => p.region_id === regionId);
    if (regionPrice) return regionPrice;
  }

  // Fallback to first available price
  return variant.prices[0];
};

export const calculateCartTotals = (cart: Cart): CartSummary => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shipping = cart.shipping_total || 0;
  const tax = cart.tax_total || 0;
  const discount = cart.discount_total || 0;
  const total = subtotal + shipping + tax - discount;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total,
    itemCount,
  };
};

export const isProductInStock = (product: Product, variantId?: string): boolean => {
  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    return variant ? variant.inventory_quantity > 0 || variant.allow_backorder : false;
  }

  return product.variants.some((v) => v.inventory_quantity > 0 || v.allow_backorder);
};

export const getProductImages = (product: Product): string[] => {
  if (product.images && product.images.length > 0) {
    return product.images.map((img) => img.url);
  }

  if (product.thumbnail) {
    return [product.thumbnail];
  }

  return [];
};

export const generateProductUrl = (product: Product): string => {
  return `/products/${product.handle || product.id}`;
};

export const generateCollectionUrl = (collection: ProductCollection): string => {
  return `/collections/${collection.handle || collection.id}`;
};

// Local storage keys
export const STORAGE_KEYS = {
  CART_ID: 'medusa_cart_id',
  CUSTOMER_TOKEN: 'medusa_customer_token',
  REGION_ID: 'medusa_region_id',
  RECENT_SEARCHES: 'medusa_recent_searches',
  WISHLIST: 'medusa_wishlist',
} as const;
