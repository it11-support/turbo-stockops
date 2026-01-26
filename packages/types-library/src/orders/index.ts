export interface OrderListParams {
  master?: boolean;
  search?: string;
  perPage?: number;
  page?: number;
  due_date?: string;
  sortBy?: string;
  sortDesc?: boolean;
  Customer?: string;
  DocNum?: string;
  TrnspCode?: string;
}
