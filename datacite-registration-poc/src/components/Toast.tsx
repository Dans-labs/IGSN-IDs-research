import { Toast } from '@base-ui/react/toast'
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon'

export default function ToastWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Toast.Provider>
      <Toast.Portal>
        <Toast.Viewport className="fixed top-auto right-4 bottom-4 left-auto z-1 mx-auto w-[calc(100vw-2rem)] min-[500px]:right-8 min-[500px]:bottom-8 min-[500px]:w-90">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
      {children}
    </Toast.Provider>
  )
}

function ToastList() {
  const { toasts } = Toast.useToastManager()
  console.log(toasts)

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={[
        // note: copied from base-ui example, needs some cleaning up
        // layout
        'absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] m-0 mr-0 box-border w-full',
        // custom properties
        '[--gap:0.75rem] [--peek:0.75rem]',
        '[--scale:calc(max(0,1-(var(--toast-index)*0.1)))]',
        '[--shrink:calc(1-var(--scale))]',
        '[--height:var(--toast-frontmost-height,var(--toast-height))]',
        '[--offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]',
        // look
        `border border-gray-300 
        ${
          toast.type === 'error'
            ? 'bg-red-100 text-red-800'
            : toast.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-white text-black'
        } 
        shadow-md rounded-sm`,
        // behavior
        'cursor-default select-none origin-bottom h-(--height)',
        'transition-[transform,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        '[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]',
        // stacked transform
        'transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]',
        // expanded
        'data-expanded:h-(--toast-height)',
        'data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        // enter / exit
        'data-starting-style:translate-y-[150%] data-ending-style:translate-y-[150%]',
        'data-ending-style:opacity-0 data-limited:opacity-0',
        'data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        'data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        // hover gap bridge
        'after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[""]',
      ].join(' ')}
    >
      <Toast.Content className="flex items-center gap-4 p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Toast.Title className="m-0 text-sm leading-5 font-bold" />
          <Toast.Description className="m-0 text-sm leading-5" />
        </div>
        <Toast.Close className="cursor-pointer hover:scale-110 active:scale-100 transition-all duration-100">
          <XCircleIcon className="h-8 w-8" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ))
}
