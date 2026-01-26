import React, { useRef } from 'react'
import Barcode from 'react-barcode'
import { format, isValid } from 'date-fns'

import { usePickList } from '../context/pick-list-context'

export default function PrintView() {
  const printRef = useRef<HTMLDivElement>(null)
  const { pickListDetail, salesOrders } = usePickList()

  const totalPerOrder = salesOrders.map((order, index) => {
    const totalDemand = order.details.reduce(
      (sum, detail) => sum + Number(detail.demand || 0),
      0
    )

    const totalPrice = order.details.reduce(
      (sum, detail) =>
        sum + Number(detail.demand || 0) * Number(detail.order.Price || 0),
      0
    )

    return {
      index,
      sales_order_id: order.sales_order_id,
      totalDemand: Number.isInteger(totalDemand)
        ? totalDemand
        : parseFloat(totalDemand.toString()),
      totalPrice: totalPrice,
    }
  })

  return (
    <div>
      <div
        ref={printRef}
        className='print-container mx-auto max-w-[794px] bg-white px-8 py-8 font-sans text-black'
      >
        <div className='mb-4 flex items-start justify-between'>
          <div>
            <h2 className='text-[32px] font-bold leading-none'>
              PICKING DETAIL
            </h2>
          </div>
          <div>
            <Barcode
              value={pickListDetail?.code ?? ''}
              width={1}
              height={30}
              fontSize={11}
              font='ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji'
            />
          </div>
        </div>

        <div className='flex items-center justify-between text-lg'>
          <span className='font-semibold'>
            Area: {pickListDetail?.area.join(', ')}
          </span>
        </div>
        <div className='mb-2 flex items-center justify-between text-lg'>
          <span className='font-semibold'>
            Picker: {pickListDetail?.picker}
          </span>
        </div>

        <table className='w-full text-sm'>
          <thead className='bg-gray-200'>
            <tr className='spacer-row' style={{ pageBreakInside: 'avoid' }}>
              <td
                colSpan={7}
                style={{
                  height: '1cm',
                  background: '#fff',
                  border: 'none',
                  padding: 0,
                }}
              ></td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }} className='text-xs'>
              <th className='border px-2 py-1 text-center'>Rack No</th>
              <th className='border px-2 py-1 text-center'>Item Code</th>
              <th className='border px-2 py-1 text-center text-xs'>
                Description
              </th>
              <th className='border px-2 py-1 text-center'>UOM</th>
              <th className='border px-2 py-1 text-center'>Qty Order</th>
              <th className='border px-2 py-1 text-center'>Qty to Pick</th>
              <th className='border px-2 py-1 text-center'>Qty Picked</th>
            </tr>
          </thead>
          <tbody>
            {pickListDetail?.summary.map((item, i) => {
              return (
                <tr
                  key={i}
                  style={{
                    pageBreakInside: 'avoid',
                    fontSize: '12px !important',
                  }}
                >
                  <td className='min-w-[90px] border px-2 py-1 text-center'>
                    {item.rack_no}
                  </td>
                  <td className='border px-2 py-1'>{item.item_code}</td>
                  <td className='border px-2 py-1 text-xs'>{item.item_name}</td>
                  <td className='border px-2 py-1 text-center'>
                    {item.unit.toUpperCase()}
                  </td>
                  <td className='w-[8px] border px-2 py-1 text-center'>
                    {item.demand}
                  </td>
                  <td className='w-[8px] border px-2 py-1 text-center'>
                    {item.open_qty}
                  </td>
                  <td className='w-[8px] border px-2 py-1 text-center'></td>
                </tr>
              )
            })}
            <tr className='bg-gray-200 font-bold'>
              <td className='border px-2 py-1 text-center' colSpan={4}>
                Total
              </td>
              <td className='border px-2 py-1 text-right'>
                {pickListDetail?.summary.reduce((sum, i) => sum + i.demand, 0)}
              </td>
              <td className='border px-2 py-1 text-right'>
                {pickListDetail?.summary.reduce(
                  (sum, i) => sum + i.open_qty,
                  0
                )}
              </td>
              <td className='border px-2 py-1 text-right'></td>
            </tr>
          </tbody>
        </table>

        <div className='signature-section mt-6 flex break-inside-avoid gap-4'>
          {/* Picker */}
          <div className='flex flex-1 flex-col items-center'>
            <p className='text-sm font-semibold'>Picker</p>
            <br />
            <div className='mt-2 flex w-full justify-center pt-6'>
              <div className='mb-1 w-[60%] border-t border-black'></div>
            </div>
          </div>

          {/* Checker */}
          <div className='flex flex-1 flex-col items-center'>
            <p className='text-sm font-semibold'>Checker</p>
            <br />
            <div className='mt-2 flex w-full justify-center pt-6'>
              <div className='mb-1 w-[60%] border-t border-black'></div>
            </div>
          </div>
        </div>

        {salesOrders.map((order, index) => (
          <React.Fragment key={index}>
            {order.details.length > 0 && (
              <div className='print-page-break py-5'>
                <hr className='border-t border-dashed border-gray-400 py-5 print:hidden' />

                {/* Header */}
                <div className='flex items-start justify-between'>
                  <div>
                    <h2 className='text-[28px] font-bold leading-none'>
                      SALES ORDER{' '}
                      <span className='text-[24px] text-gray-500'>
                        #{order.sales_order_id}
                      </span>
                    </h2>
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
                <div className='mb-4 flex items-start justify-between'>
                  {/* Kiri: Customer Info */}
                  <div className='w-1/2 pr-4'>
                    <p className='text-lg font-semibold'>
                      To: {order.customer_id}
                    </p>
                    <p className='text-lg font-semibold'>
                      <span className='font-bold'>{order.customer_name}</span>
                    </p>
                    <p className='text-lg font-semibold'>{order.address}</p>
                    <p className='text-lg font-semibold'>
                      Telp: {order.phone?.replace("'", '') ?? '-'}
                    </p>
                  </div>

                  {/* Kanan: Sales Order Info */}
                  <div className='w-1/2 space-y-1 text-lg font-semibold'>
                    <p>
                      Delivery Date:{' '}
                      {format(
                        new Date(order.details[0].order.DocDueDate),
                        'dd.MM.yy'
                      )}
                    </p>
                    <p>Salesman: {order.sales_person}</p>
                    <p>
                      Created Date:{' '}
                      {isValid(new Date(order.sales_order_date))
                        ? format(
                            new Date(order.sales_order_date),
                            'dd.MM.yy HH:mm'
                          )
                        : ''}
                    </p>
                    <p>Telemarketing: {order.telemarketing}</p>
                  </div>
                </div>
                {/* Table */}
                <table className='sales-order w-full text-sm'>
                  <thead className='bg-gray-200'>
                    <tr>
                      <th className='border px-2 py-1 text-center'>No</th>
                      <th className='border px-2 py-1 text-center'>
                        Item Code
                      </th>
                      <th className='border px-2 py-1 text-center'>
                        Item Name
                      </th>
                      <th className='border px-2 py-1 text-center'>
                        Qty Order
                      </th>
                      <th className='border px-2 py-1 text-center'>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.details.map((detail, detailIndex) => {
                      return (
                        <tr key={detailIndex} className='text-xs'>
                          <td className='border px-2 py-1 text-center'>
                            {detailIndex + 1}
                          </td>
                          <td className='border px-2 py-1 text-center'>
                            {detail.item_code}
                          </td>
                          <td className='border px-2 py-1'>
                            {detail.item_name}
                          </td>

                          <td className='border px-2 py-1 text-center'>
                            {`${parseFloat(detail.order.Quantity.toString())} ${detail.unit.toUpperCase()}`}
                          </td>
                          <td className='border px-2 py-1 text-center'>
                            {parseFloat(detail.order.OnHand.toString())}
                          </td>
                        </tr>
                      )
                    })}

                    {/* Total */}
                    <tr className='bg-gray-200 font-bold'>
                      <td className='border px-2 py-1 text-center' colSpan={3}>
                        Total
                      </td>
                      <td className='border px-2 py-1 text-center'>
                        {totalPerOrder[index].totalDemand}
                      </td>
                      <td className='border px-2 py-1 text-right'></td>
                    </tr>
                  </tbody>
                </table>
                <div className='mt-6 flex break-inside-avoid gap-4 '>
                  <div className='space-y-1 text-lg font-semibold'>
                    <p>Total Item: {order.details.length}</p>
                    <p>Note: {order.remarks}</p>
                  </div>
                </div>
                <div className='signature-section mt-6 flex break-inside-avoid gap-4'>
                  {/* Picker */}
                  <div className='flex flex-1 flex-col items-center'>
                    <p className='text-sm font-semibold'>Checker</p>
                    <br />
                    <div className='mt-2 flex w-full justify-center pt-6'>
                      <div className='mb-1 w-[60%] border-t border-black'></div>
                    </div>
                  </div>
                  <div className='flex flex-1 flex-col items-center'>
                    <p className='text-sm font-semibold'>Driver / Helper </p>
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
