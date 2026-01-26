import CustomSelectItem, {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/custom/button'
import { useSalesOrder } from '../context/sales-orders-context'
import { ListChecksIcon, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function DataTablePagination() {
  const {
    total,
    pickers,
    dueDate,
    filters,
    area,
    customer,
    createPickList,
    modalOpen,
    setModalOpen,
    pickLists,
    pickListForm,
    setPickListForm,
    isLoadingPickList,
    selectedOrders,
    selectedIds,
    setIsProcessing,
  } = useSalesOrder()

  const areaFitlers: string[] =
    (filters.find((f) => f.id === 'TrnspCode')?.value as unknown as string[]) ??
    []
  const areaNames = area
    .filter((option) => areaFitlers.includes(option.value))
    .map((option) => option.label)

  const salesOrderFilters: string[] =
    (filters.find((f) => f.id === 'DocNum')?.value as unknown as string[]) ?? []
  const customersFitler: string[] =
    (filters.find((f) => f.id === 'Customer')?.value as unknown as string[]) ??
    []
  const customerNames = customer
    .filter((option) => customersFitler.includes(option.value))
    .map((option) => option.label)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const filtersApplied =
    dueDate ||
    areaFitlers.length > 0 ||
    salesOrderFilters.length > 0 ||
    customerNames.length > 0

  const disableCreatePickList = (): boolean => {
    let disabled = false
    if (updateExisting) {
      disabled = pickListForm.pickList === ''
    } else {
      disabled = pickListForm.picker === ''
    }
    return disabled
  }

  const handleCreatePickList = async () => {
    try {
      await createPickList()
      setShowConfirmModal(true)
    } catch (error: any) {
      console.error('Failed to create pick list:', error)
      const message =
        error?.message || 'Failed to create pick list, please try again.'
      setErrorMessage(message)
      setShowErrorModal(true)
    }
  }

  const handleRedirectToPickList = () => {
    window.location.href = '/pick-list'
  }

  const handleUpdateExistingPickList = async (checked: boolean) => {
    {
      const isChecked = checked as boolean
      setUpdateExisting(isChecked)

      if (isChecked) {
        setPickListForm((prev) => ({
          ...prev,
          picker: '',
          notes: '',
        }))
      } else {
        setPickListForm((prev) => ({
          ...prev,
          pickList: '',
        }))
      }
    }
  }

  useEffect(() => {
    if (modalOpen) {
      setPickListForm((prev) => ({
        ...prev,
        picker: '',
        notes: '',
        pickList: '',
        area: areaNames.length > 0 ? areaNames.join(', ') : '',
      }))
    }
  }, [modalOpen])

  return (
    <>
      <div className='sticky bottom-[-5px] flex items-center justify-between overflow-auto bg-background px-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground sm:block'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-1 flex-col items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-4'>
              <div className='flex gap-x-2'>
                <Button
                  disabled={total === 0}
                  variant='outline'
                  className='h-8 px-2 lg:px-3'
                  onClick={() => {
                    setModalOpen(true)
                    setIsProcessing(true)
                  }}
                >
                  Create Pick List
                  <ListChecksIcon className='ml-2 h-4 w-4' />
                </Button>
              </div>
              <div className='flex items-center sm:space-x-6 lg:space-x-8'>
                <div className='flex items-center space-x-2'>
                  <p className='text-sm font-medium sm:block'>
                    {selectedOrders.length} Items Selected from{' '}
                    {selectedIds.length} Sales Orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setIsProcessing(false)
          }
        }}
      >
        <DialogContent className='max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create Pick List</DialogTitle>
            <DialogDescription>
              Create a new pick list to assign items for delivery
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2 pb-4'>
            <div className='flex items-center gap-2 text-sm '>
              <span className='font-medium'>Total Sales Order:</span>
              <span className='inline-block rounded-full bg-gray-900 px-2 py-0.5 text-xs text-gray-200'>
                {selectedIds.length}
              </span>
            </div>
            <div className='flex items-center gap-2 text-sm '>
              <span className='font-medium'>Total Items:</span>
              <span className='inline-block rounded-full bg-gray-900 px-2 py-0.5 text-xs text-gray-200'>
                {selectedOrders.length}
              </span>
            </div>
          </div>
          {filtersApplied && (
            <>
              <h3>Applied Filters</h3>
              <div className='h-40 overflow-y-auto rounded border border-gray-700 p-2'>
                <div className='space-y-2'>
                  {dueDate && (
                    <div className='flex items-center gap-2 text-sm '>
                      <span className='font-medium'>Due Date:</span>
                      <span className='inline-block rounded-full bg-gray-900 px-2 py-0.5 text-xs text-gray-200'>
                        {format(dueDate, 'yyyy-MM-dd')}
                      </span>
                    </div>
                  )}

                  {salesOrderFilters.length > 0 && (
                    <div className='flex flex-wrap items-center gap-1 text-sm '>
                      <span className='font-medium'>Sales Order:</span>
                      {salesOrderFilters.map((salesOrderFilter, index) => (
                        <span
                          key={index}
                          className='inline-block rounded-full bg-gray-900 px-2 py-0.5 text-xs text-gray-200'
                        >
                          {salesOrderFilter}
                        </span>
                      ))}
                    </div>
                  )}
                  {areaNames.length > 0 && (
                    <div className='flex flex-wrap items-center gap-1 text-sm '>
                      <span className='font-medium'>Area:</span>
                      {areaNames.map((areaName, index) => (
                        <span
                          key={index}
                          className='inline-block rounded-full bg-gray-900 px-2 py-0.5 text-xs text-gray-200'
                        >
                          {areaName}
                        </span>
                      ))}
                    </div>
                  )}
                  {customerNames.length > 0 && (
                    <div className='flex flex-wrap items-center gap-1 text-sm '>
                      <span className='font-medium'>Customer:</span>
                      {customerNames.map((customerName, index) => (
                        <span
                          key={index}
                          className='inline-block rounded-full bg-gray-900 px-2 py-0.5 text-xs text-gray-200'
                        >
                          {customerName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='updateExisting'
              checked={updateExisting}
              onCheckedChange={handleUpdateExistingPickList}
            />
            <Label htmlFor='updateExisting' className='dark:text-gray-300'>
              Add to Existing Pick List
            </Label>
          </div>

          {updateExisting ? (
            <Select
              value={pickListForm.pickList}
              onValueChange={(value) => {
                setPickListForm({ ...pickListForm, pickList: value })
              }}
            >
              <SelectTrigger className='h-8 w-full' id={'selectPickList'}>
                <SelectValue
                  placeholder='Select existing picklist'
                  children={
                    pickLists.find((p) => p.value === pickListForm.pickList)
                      ?.label ?? ''
                  }
                />
              </SelectTrigger>
              <SelectContent side='bottom'>
                {pickLists.length === 0 ? (
                  <div className='px-2 py-1 text-sm text-muted-foreground'>
                    No picklists found
                  </div>
                ) : (
                  pickLists.map((list) => (
                    <CustomSelectItem
                      value={list.value}
                      mainText={list.label}
                      subText={list.notes}
                      key={list.value}
                    />
                  ))
                )}
              </SelectContent>
            </Select>
          ) : (
            <>
              <label
                htmlFor='selectPicker'
                className='text-sm font-medium text-gray-500'
              >
                Select Picker
              </label>
              <Select
                value={pickListForm.picker}
                onValueChange={(value) => {
                  setPickListForm({ ...pickListForm, picker: value })
                }}
              >
                <SelectTrigger className='h-8 w-full' id={'selectPicker'}>
                  <SelectValue placeholder='Select picker' />
                </SelectTrigger>
                <SelectContent side='bottom'>
                  {pickers.map((picker) => (
                    <SelectItem key={picker.value} value={`${picker.value}`}>
                      {picker.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label
                htmlFor='pickListNotes'
                className='text-sm font-medium text-gray-500'
              >
                Notes
              </Label>
              <Label htmlFor='description'>Notes</Label>
              <Textarea
                id='description'
                defaultValue={pickListForm.notes}
                onChange={(e) => {
                  setPickListForm({ ...pickListForm, notes: e.target.value })
                }}
                className='min-h-32'
              />
            </>
          )}

          <div className='flex justify-end space-x-2 pt-6'>
            <Button
              type='button'
              disabled={disableCreatePickList()}
              className='mb-2 me-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
              onClick={handleCreatePickList}
            >
              {updateExisting ? 'Update Pick List' : 'Create Pick List'}
              {isLoadingPickList && (
                <Loader2 className='ml-2 animate-spin' size={16} />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pick List Created</DialogTitle>
            <DialogDescription>
              {selectedOrders.length} items from {selectedIds.length} sales
              orders have been added to the pick list.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2 pt-6'>
            <Button
              type='button'
              className='mb-2 me-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700'
              onClick={handleRedirectToPickList}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-red-600'>
              Failed to create pick list
            </DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2 pt-6'>
            <Button
              type='button'
              className='rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300'
              onClick={() => setShowErrorModal(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
