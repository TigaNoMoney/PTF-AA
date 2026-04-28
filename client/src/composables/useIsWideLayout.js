import { ref, onMounted, onUnmounted } from 'vue'

/** 与 a-col 的 lg(≥992) 一致：右侧预览仅在宽屏与表单并排 */
const QUERY = '(min-width: 992px)'

function initialWide() {
  if (typeof window === 'undefined') return true
  return window.matchMedia(QUERY).matches
}

export function useIsWideLayout() {
  const isWide = ref(initialWide())
  let mq = null
  let onChange = null

  onMounted(() => {
    if (typeof window === 'undefined') return
    mq = window.matchMedia(QUERY)
    onChange = () => {
      isWide.value = mq.matches
    }
    onChange()
    mq.addEventListener('change', onChange)
  })

  onUnmounted(() => {
    if (mq && onChange) mq.removeEventListener('change', onChange)
  })

  return { isWide }
}
