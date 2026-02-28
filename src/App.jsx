import { useState, useEffect } from "react";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import Filters from "./components/Filters";
import Overview from "./components/Overview";
import "./App.css";

import { auth, db } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import Login from "./pages/Login";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
   const [loggingOut, setLoggingOut] = useState(false);
   const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(userTasks);
    });

    return () => unsubscribe();
  }, [user]);


  const addTask = async (text) => {
    if (!text.trim() || !user) return;

    await addDoc(collection(db, "tasks"), {
      text,
      done: false,
      userId: user.uid,
      createdAt: new Date(),
    });
  };

 
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };


  const toggleTask = async (id, currentStatus) => {
    await updateDoc(doc(db, "tasks", id), {
      done: !currentStatus,
    });
  };


  const editTask = async (id, newText) => {
    await updateDoc(doc(db, "tasks", id), {
      text: newText,
    });
  };

  const filteredTasks =
    filter === "active"
      ? tasks.filter((t) => !t.done)
      : filter === "completed"
      ? tasks.filter((t) => t.done)
      : tasks;

  
  if (loading) return <h2>Loading...</h2>;

 
  if (!user) return <Login />;
 

const handleLogout = async () => {
  try {
    setLoggingOut(true);
    await signOut(auth);
  } catch (error) {
    console.error(error);
  } finally {
    setLoggingOut(false);
  }
};

  return (
    <div className="appWrapper">
    <div className="topBar">
      <h2 className="logo">TaskFlow</h2>
      <button
        className="logoutBtn desktopOnly"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
       <div
    className="hamburger mobileOnly"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    {menuOpen ? "✕" : "☰"}
  </div>
      {menuOpen && (
        <div className="mobileMenu">
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>

    {/* ===== Main Content ===== */}
    <div className="container">
      <div className="left">
        <TaskInput addTask={addTask} />
        <Filters filter={filter} setFilter={setFilter} />
        <TaskList
          tasks={filteredTasks}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          editTask={editTask}
        />
      </div>
      <Overview tasks={tasks} />
    </div>
  </div>
  );
}