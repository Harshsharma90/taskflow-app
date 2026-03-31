import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";

const REVIEWS_COLLECTION = "reviews";

export const addReview = async ({ name, description, rating }) => {
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    name: name || "Anonymous",
    description,
    rating,
    replies: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const fetchReviews = async () => {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  }));
};

export const addReply = async (reviewId, replyText) => {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await updateDoc(reviewRef, {
    replies: arrayUnion({
      text: replyText,
      repliedAt: new Date().toISOString(),
    }),
  });
};