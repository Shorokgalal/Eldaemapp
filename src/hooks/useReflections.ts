import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Reflection } from '../types/reflection.types';

export const useReflections = (goalId: string) => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId) return;

    const reflectionsQuery = query(
      collection(db, 'reflections'),
      where('goalId', '==', goalId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      reflectionsQuery,
      (snapshot) => {
        const reflectionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc. data().createdAt?.toDate(),
        })) as Reflection[];
        
        setReflections(reflectionsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [goalId]);

  const addReflection = async (data: Omit<Reflection, 'id' | 'createdAt' | 'likes'>) => {
    await addDoc(collection(db, 'reflections'), {
      ... data,
      createdAt: new Date(),
      likes: [],
    });
  };

  const toggleLike = async (reflectionId: string, userId: string) => {
    const reflection = reflections.find((r) => r.id === reflectionId);
    if (!reflection) return;

    const reflectionRef = doc(db, 'reflections', reflectionId);
    
    if (reflection. likes.includes(userId)) {
      await updateDoc(reflectionRef, {
        likes: arrayRemove(userId),
      });
    } else {
      await updateDoc(reflectionRef, {
        likes: arrayUnion(userId),
      });
    }
  };

  return { reflections, loading, error, addReflection, toggleLike };
};