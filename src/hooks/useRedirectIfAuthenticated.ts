import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { clearClientAuthState } from '@/utils/clear-client-auth'

/**
 * If local isLogin is set, confirm the session cookie is still valid before
 * sending the user to the app. Stale local state after cookie expiry must not
 * bounce /login ↔ /dashboard forever.
 */
export function useRedirectIfAuthenticated(redirectTo = '/dashboard') {
  const { isLogin, userId } = useUserPresistStore(
    useShallow((state) => ({
      isLogin: state.isLogin,
      userId: state.userId,
    }))
  )

  useEffect(() => {
    if (!isLogin) return

    if (!userId) {
      clearClientAuthState()
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const response: any = await axios.get(Http.find_user_by_userid, {
          params: { user_id: userId },
        })
        if (cancelled) return
        if (response?.result) {
          window.location.href = redirectTo
          return
        }
        clearClientAuthState()
      } catch {
        if (!cancelled) clearClientAuthState()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLogin, userId, redirectTo])
}
