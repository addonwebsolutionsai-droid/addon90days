/**
 * TableFlow (P04) — shared TypeScript types.
 *
 * Mirrors the Postgres schema in supabase/migrations/012_p04_tableflow.sql.
 * Named exports only. No default exports.
 */

// ---------------------------------------------------------------------------
// Enum string literals
// ---------------------------------------------------------------------------

export type P04TableStatus = "available" | "occupied" | "reserved" | "out_of_service";
export type P04OrderStatus = "open" | "sent_to_kitchen" | "ready" | "served" | "paid" | "cancelled";
export type P04OrderKind   = "dine_in" | "takeaway" | "delivery";
export type P04ItemStatus  = "pending" | "preparing" | "ready" | "served" | "cancelled";

// ---------------------------------------------------------------------------
// Table row shapes
// ---------------------------------------------------------------------------

export interface P04Restaurant {
  id:                     string;
  owner_clerk_user_id:    string;
  name:                   string;
  address:                string | null;
  gstin:                  string | null;
  state_code:             string;
  state_name:             string;
  phone:                  string | null;
  email:                  string | null;
  currency:               string;
  tax_inclusive_pricing:  boolean;
  service_charge_percent: number;
  created_at:             string;
  updated_at:             string;
}

export interface P04Table {
  id:               string;
  restaurant_id:    string;
  table_number:     string;
  seats:            number;
  section:          string | null;
  status:           P04TableStatus;
  current_order_id: string | null;
  created_at:       string;
  updated_at:       string;
}

export interface P04MenuCategory {
  id:            string;
  restaurant_id: string;
  name:          string;
  sort_order:    number;
  is_active:     boolean;
  created_at:    string;
  updated_at:    string;
}

export interface P04MenuItem {
  id:               string;
  restaurant_id:    string;
  category_id:      string;
  name:             string;
  description:      string | null;
  price:            number;
  gst_rate_percent: number;
  tags:             string[];
  photo_url:        string | null;
  is_available:     boolean;
  sort_order:       number;
  created_at:       string;
  updated_at:       string;
}

export interface P04Order {
  id:                    string;
  restaurant_id:         string;
  table_id:              string | null;
  order_number:          string;
  status:                P04OrderStatus;
  order_kind:            P04OrderKind;
  customer_name:         string | null;
  customer_phone:        string | null;
  subtotal:              number;
  gst_amount:            number;
  service_charge_amount: number;
  total_amount:          number;
  paid_amount:           number;
  notes:                 string | null;
  created_at:            string;
  updated_at:            string;
  closed_at:             string | null;
}

export interface P04OrderItem {
  id:           string;
  order_id:     string;
  menu_item_id: string;
  line_number:  number;
  quantity:     number;
  unit_price:   number;
  modifiers:    Record<string, unknown>;
  notes:        string | null;
  status:       P04ItemStatus;
  created_at:   string;
}

// ---------------------------------------------------------------------------
// Insert payload shapes (client-provided fields only)
// ---------------------------------------------------------------------------

export type P04RestaurantInsert = Omit<P04Restaurant,
  "id" | "created_at" | "updated_at"
>;

export type P04TableInsert = Omit<P04Table,
  "id" | "created_at" | "updated_at" | "current_order_id"
>;

export type P04MenuCategoryInsert = Omit<P04MenuCategory,
  "id" | "created_at" | "updated_at"
>;

export type P04MenuItemInsert = Omit<P04MenuItem,
  "id" | "created_at" | "updated_at"
>;

/** One item line in a create-order request. */
export interface P04OrderItemDraft {
  menu_item_id: string;
  quantity:     number;
  modifiers?:   Record<string, unknown>;
  notes?:       string;
}

/** Payload accepted by createOrder(). Tax math is server-computed. */
export interface P04OrderDraft {
  restaurant_id:  string;
  table_id?:      string | null;
  order_kind:     P04OrderKind;
  customer_name?: string | null;
  customer_phone?: string | null;
  notes?:         string | null;
  items:          P04OrderItemDraft[];
}

// ---------------------------------------------------------------------------
// Compound result types
// ---------------------------------------------------------------------------

export interface P04OrderWithItems {
  order: P04Order;
  items: P04OrderItem[];
}

// ---------------------------------------------------------------------------
// Indian state-code helpers — used by the create-restaurant validator.
// Mirrored locally so P04 doesn't import from P03 (P03 lives in its own app
// since the extraction). Keep in sync with products/03-gst-invoicing/app/src/lib/p03/types.ts.
// ---------------------------------------------------------------------------

export const INDIAN_STATES: readonly { code: string; name: string }[] = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman and Diu" },
  { code: "26", name: "Dadra and Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
];

const STATE_CODE_SET = new Set(INDIAN_STATES.map((s) => s.code));
export function isValidStateCode(code: string): boolean {
  return STATE_CODE_SET.has(code);
}
export function stateNameByCode(code: string): string | null {
  return INDIAN_STATES.find((s) => s.code === code)?.name ?? null;
}
