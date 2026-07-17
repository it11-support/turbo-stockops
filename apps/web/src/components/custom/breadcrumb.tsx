import * as React from 'react'
import { cn } from '@/lib/utils'

interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  children:
    | React.ReactElement<typeof BreadcrumbItem>
    | React.ReactElement<typeof BreadcrumbItem>[]
  separator?: React.ReactNode
}

const BreadcrumbContext = React.createContext<boolean>(false)

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, separator, ...props }, ref) => {
    const validChildren = getValidChildren(children) as React.ReactElement<BreadcrumbItemProps>[]

    const count = validChildren.length

    const clones = validChildren.map((child, index) => {
      const elementChild = child as React.ReactElement<BreadcrumbItemProps>
      return React.createElement(BreadcrumbItem, {
        key: elementChild.key,
        ...elementChild.props,
        separator,
        isLastChild: count === index + 1,
      } as unknown as BreadcrumbItemProps)
    })

    return (
      <BreadcrumbContext.Provider value={true}>
        <nav ref={ref} aria-label='breadcrumb' className={className} {...props}>
          <ol className={cn(`flex`)}>{clones}</ol>
        </nav>
      </BreadcrumbContext.Provider>
    )
  }
)
Breadcrumb.displayName = 'Breadcrumb'

interface BreadcrumbItemProps
  extends React.ComponentPropsWithoutRef<'li'> {
  separator?: React.ReactNode
  isLastChild: boolean
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, separator, isLastChild, ...rest }, ref) => {

    // Check if BreadcrumbItem is used within Breadcrumb
    const isInsideBreadcrumb = React.useContext(BreadcrumbContext)
    if (!isInsideBreadcrumb) {
      throw new Error(
        `${BreadcrumbItem.displayName} must be used within ${Breadcrumb.displayName}.`
      )
    }

    return (
      <li ref={ref} className={cn(`group`, className)} {...rest}>
        {children}
        {!isLastChild && (
          <span className='mx-2 *:!inline-block'>{separator ?? '/'}</span>
        )}
      </li>
    )
  }
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

/* ========== Util Func ========== */

const getValidChildren = (children: React.ReactNode) =>
  React.Children.toArray(children).filter((child) => {
    if (React.isValidElement(child) && child.type === BreadcrumbItem) {
      return React.isValidElement(child)
    }
    throw new Error(
      `${Breadcrumb.displayName} can only have ${BreadcrumbItem.displayName} as children.`
    )
  }) as React.ReactElement<BreadcrumbItemProps>[]

export { Breadcrumb, BreadcrumbItem }
