import { useEffect } from 'react'

/**
 *   useAbortableEffect((signal) => {
 *     if (!router.isReady || !id) return
 *     init(id, signal)
 *   }, [id, router.isReady])
 *
 */
// export function useAbortableEffect(
//   effect: (signal: AbortSignal) => void,
//   deps: React.DependencyList
// ) {
//   useEffect(() => {
//     const controller = new AbortController()
//     effect(controller.signal)
//     return () => controller.abort()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, deps)
// }

export function useAbortableEffect(
  effect: (signal: AbortSignal) => void | (() => void),
  deps: React.DependencyList
) {
  useEffect(() => {
    const controller = new AbortController()
    const cleanup = effect(controller.signal) // 接住回调自己返回的清理函数

    return () => {
      controller.abort()
      cleanup?.() // 之前这里漏掉了：回调返回的 clearInterval/removeEventListener 等清理逻辑，之前从未被执行过
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
