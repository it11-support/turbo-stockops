import { useEffect, useRef, useCallback } from 'react'
import { useSalesOrder } from '../context/sales-orders-context'

interface InfiniteScrollTableWrapperProps {
  children: React.ReactNode
}

export function InfiniteScrollTableWrapper({
  children,
}: InfiniteScrollTableWrapperProps) {
  const { pagination, setPagination, total, isLoading } = useSalesOrder()

  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const totalPages = Math.ceil(total / pagination.pageSize)

  const loadNextPage = useCallback(() => {
    if (isFetchingRef.current) return

    if (pagination.pageIndex + 1 < totalPages) {
      isFetchingRef.current = true
      setPagination((prev) => ({
        ...prev,
        pageIndex: prev.pageIndex + 1,
      }))
    }
  }, [pagination.pageIndex, totalPages, setPagination])

  useEffect(() => {
    if (!isLoading) {
      isFetchingRef.current = false
    }
  }, [isLoading])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          loadNextPage()
        }
      },
      {
        root: containerRef.current,
        rootMargin: '0px',
        threshold: 1.0,
      }
    )

    const sentinel = sentinelRef.current
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [loadNextPage, isLoading])

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      containerRef.current.scrollTop -= 100
    }
  }, [isLoading])

  useEffect(() => {
    if (!isLoading) {
      isFetchingRef.current = false

      if (containerRef.current) {
        containerRef.current.scrollTop -= 100
      }
    }
  }, [isLoading])

  return (
    <div ref={containerRef} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      {children}
      <div ref={sentinelRef} style={{ height: '1px' }} />
    </div>
  )
}
