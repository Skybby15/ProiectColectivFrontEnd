import { api as generatedApi } from '@/services/react-query/api';
import { useAuthStore } from '@/services/stores/useAuthStore';

export async function sendDirectMessageWithRetry(
  receiverId: string,
  senderId: string,
  textContent: string,
  attempts = 3
) {
  for (let i = 0; i < attempts; i++) {
    try {
      // Ensure senderId is present — try to populate from auth store as fallback
      let resolvedSenderId = senderId;
      try {
        if (!resolvedSenderId) {
          const authState = useAuthStore.getState ? useAuthStore.getState() : null;
          const userId = authState?.user?.id;
          if (userId) resolvedSenderId = String(userId);
          else {
            // fallback: try to parse token from localStorage (auth_token)
            try {
              const tok = localStorage.getItem('auth_token') || localStorage.getItem('token') || undefined;
              if (tok) {
                const parts = tok.split('.');
                if (parts.length >= 2) {
                  const payload = JSON.parse(decodeURIComponent(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c){
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                  }).join('')));
                  const sub = payload?.sub || payload?.userId || payload?.id || payload?.user?.id;
                  if (sub) resolvedSenderId = String(sub);
                }
              }
            } catch (e) {
              // ignore parsing errors
            }
          }
        }
      } catch (e) {
        // ignore store access errors
      }

      if (!resolvedSenderId) {
        console.error('[messages] aborting sendDirectMessageWithRetry: missing senderId', { receiverId, textContent });
        throw new Error('sender id is required');
      }

      const payload = {
        direct: {
          receiverId,
          senderId: resolvedSenderId,
          textContent,
        },
      };
      // send payload
      const resp = await generatedApi.messagesPost('direct', payload);
      return (resp && (resp as any).data) || null;
    } catch (e: any) {
      // Log helpful details for transient failures
      try {
        const status = e?.response?.status;
        const data = e?.response?.data;
        console.error(`messagesPost attempt ${i + 1} failed`, status, data || e?.message);
      } catch (_) {
        console.error('messagesPost failed', e?.message || e);
      }

      if (i === attempts - 1) throw e;
      // exponential backoff
      await new Promise((res) => setTimeout(res, 300 * Math.pow(2, i)));
    }
  }
  return null;
}
