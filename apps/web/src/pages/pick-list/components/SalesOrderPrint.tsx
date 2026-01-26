import React, { useRef } from 'react'
import Barcode from 'react-barcode'
import { usePickList } from '../context/pick-list-context'
import { format } from 'date-fns'

export default function SalesOrderPrint() {
  const printRef = useRef<HTMLDivElement>(null)
  const { salesOrders } = usePickList()

  const totalPerOrder = salesOrders.map((order, index) => ({
    index,
    sales_order_id: order.sales_order_id,
    totalDemand: order.details.reduce((sum, detail) => sum + detail.demand, 0),
    totalPrice: order.details.reduce(
      (sum, detail) => sum + detail.demand * detail.order.Price,
      0
    ),
  }))

  const areas = [
    ...new Set(
      salesOrders.flatMap((order) =>
        order.details.map((detail) => detail.order.TrnspName)
      )
    ),
  ].join(', ')

  return (
    <div>
      <div
        ref={printRef}
        className='print-container mx-auto max-w-[794px] bg-white px-8 py-8 font-sans text-black'
      >
        {salesOrders.map((order, index) => (
          <React.Fragment key={index}>
            {order.details.length > 0 && (
              <div className='print-page-break py-5'>
                <hr className='border-t border-dashed border-gray-400 py-5 print:hidden' />
                {/* Header Section */}
                <div className='mb-4 flex items-start justify-between'>
                  <div>
                    <h2 className='text-[32px] font-bold leading-none'>
                      SALES ORDER{' '}
                      <span className='text-[28px] text-gray-500'>
                        #{order.sales_order_id.toString()}
                      </span>{' '}
                    </h2>
                    <p className='mt-2 text-sm font-semibold'>
                      Customer Code: {order.customer_id}
                    </p>
                    <p className='text-sm font-semibold'>
                      Customer Name: {order.customer_name}
                    </p>
                    <p className='text-sm font-semibold'>
                      Due Date:{' '}
                      {format(
                        new Date(order.details[0].order.DocDueDate),
                        'PPP'
                      )}
                    </p>
                    <p className='text-sm font-semibold'>Area: {areas}</p>
                  </div>
                  <div>
                    <Barcode
                      value={order.sales_order_id.toString()}
                      width={1}
                      height={30}
                      fontSize={11}
                      font='ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
                    />
                  </div>
                </div>

                {/* Table Section */}
                <table className='w-full text-sm'>
                  <thead className='bg-gray-200'>
                    <tr>
                      <th className='border px-2 py-1'>Item Code</th>
                      <th className='border px-2 py-1'>Item Name</th>
                      <th className='border px-2 py-1'>UOM</th>
                      <th className='border px-2 py-1'>Qty Order</th>
                      <th className='border px-2 py-1'>Price</th>
                      <th className='border px-2 py-1'>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.details.map((detail, detailIndex) => (
                      <tr key={detailIndex}>
                        <td className='border px-2 py-1 text-center'>
                          {detail.item_code}
                        </td>
                        <td className='border px-2 py-1'>{detail.item_name}</td>
                        <td className='border px-2 py-1 text-center'>
                          {detail.unit}
                        </td>
                        <td className='border px-2 py-1 text-center'>
                          {parseFloat(detail.order.Quantity.toString())}
                        </td>
                        <td className='border px-2 py-1 text-right'>
                          {parseFloat(
                            detail.order.Price.toString()
                          ).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className='border px-2 py-1 text-right'>
                          {(
                            detail.order.Quantity * detail.order.Price
                          ).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}

                    {/* Total Row */}
                    <tr className='bg-gray-200 font-bold'>
                      <td className='border px-2 py-1 text-center' colSpan={3}>
                        Total
                      </td>
                      <td className='border px-2 py-1 text-center'>
                        {totalPerOrder[index].totalDemand}
                      </td>
                      <td className='border px-2 py-1 text-right'></td>
                      <td className='border px-2 py-1 text-right'>
                        {totalPerOrder[index].totalPrice.toLocaleString(
                          'id-ID',
                          {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Signature Section */}
                <div className='signature-section mt-6 flex break-inside-avoid gap-4'>
                  {/* Picker */}
                  <div className='flex flex-1 flex-col items-center'>
                    <p className='text-sm font-semibold'>Checker</p>
                    <br />
                    <div className='mt-2 flex w-full justify-center pt-6'>
                      <div className='mb-1 w-[60%] border-t border-black'></div>
                    </div>
                  </div>

                  {/* Checker */}
                  <div className='flex flex-1 flex-col items-center'>
                    <p className='text-sm font-semibold'>Admin</p>
                    <br />
                    <div className='mt-2 flex w-full justify-center pt-6'>
                      <div className='mb-1 w-[60%] border-t border-black'></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
