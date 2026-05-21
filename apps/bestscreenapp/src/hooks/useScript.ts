import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isDemoMode, DEMO_SCRIPT, demoGuard } from '../lib/demo';
import type { Script } from '../types/screenplay';

export function useScripts(userId: string | undefined) {
  return useQuery({
    queryKey: ['scripts', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Script[]> => {
      if (isDemoMode) return [DEMO_SCRIPT];
      const { db } = await import('../lib/firebase');
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      if (!db) return [];
      const q = query(
        collection(db, 'scripts'),
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Script));
    },
  });
}

export function useScript(scriptId: string | undefined) {
  return useQuery({
    queryKey: ['script', scriptId],
    enabled: !!scriptId,
    queryFn: async (): Promise<Script | null> => {
      if (isDemoMode) return DEMO_SCRIPT;
      const { db } = await import('../lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      if (!db || !scriptId) return null;
      const snap = await getDoc(doc(db, 'scripts', scriptId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Script;
    },
  });
}

export function useCreateScript(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string): Promise<string> => {
      if (demoGuard(toast)) return 'demo';
      const { db } = await import('../lib/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      if (!db || !userId) throw new Error('Not authenticated');
      const ref = await addDoc(collection(db, 'scripts'), {
        title,
        ownerId: userId,
        blocks: [],
        titlePage: { title, author: '' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scripts', userId] }),
  });
}
