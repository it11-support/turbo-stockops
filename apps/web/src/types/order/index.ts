import { Item } from '../item'

export interface SalesOrderItem {
  id?: number
  DocNum: number
  CreateDate: string
  DocDate: string
  DocTime: string
  DocDueDate: string
  UpdateDate: string
  CardCode: string
  CardName: string
  Address: string
  Phone1?: string
  TrnspCode: number
  TrnspName: string
  Comments?: string
  SlpCode: number
  SlpName: string
  USERID?: string
  U_NAME?: string
  Memo: string
  LineNum: number
  ItemCode: string
  Dscription: string
  ShipDate: string
  Quantity: number
  OpenQty: number
  DelivrdQty: number
  unitMsr: string
  NumPerMsr: number
  unitMsr2: string
  NumPerMsr2: number
  BuyUnitMsr: string
  NumInBuy: number
  SalUnitMsr: string
  NumInSal: number
  Price: number
  SuppCatNum: string
  OnHand: number
  InvntryUom: string
  OrdrMulti: number
  item: Item
  created_at?: Date
  updated_at?: Date
}

export interface ConfirmSoItem {
  area: string
  customer: string
  customerCode: string
  demand: number
  dueDate: Date
  id: number
  itemCode: string
  itemName: string
  openQty: number
  rackNo: string
  unit: string
}

export type SoItemMap = Record<string, ConfirmSoItem[]>
