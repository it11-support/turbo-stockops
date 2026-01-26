import { SalesOrderItem } from '../order'
import { User } from '../user'

export interface PickListItem {
  id?: string
  code: string
  status: string
  demand: number
  user_id: number
  assigned_to?: User
  order_details?: SalesOrderItem[]
  order: SalesOrderItem
  start_at: Date
  complete_at: Date
  notes?: string
  printed: boolean
  printed_at?: Date
  created_at: Date
  updated_at: Date
}

export interface PickListDetail {
  order_id: string
  demand: number
  item_code: string
  item_name: string
  buy_unit_msr: string
  num_in_buy: number
  sal_unit_msr: string
  num_in_sal: number
  open_qty: number
  order: SalesOrderItem
  picked: number
  rack_no: string
  unit: string
}

export interface Summary {
  area: string[]
  picker: string
  code: string
  summary: PickListDetail[]
}

export interface GroupSalesOrder {
  [key: string]: PickListItem[]
}

export interface SalesOrderSummary {
  sales_order_id: string
  sales_order_date: string
  delivery_date: string
  customer_id: string
  customer_name: string
  address: string
  sales_person?: string
  telemarketing?: string
  phone?: string
  remarks?: string
  details: PickListDetail[]
  area: string
  total_sku: number
}
