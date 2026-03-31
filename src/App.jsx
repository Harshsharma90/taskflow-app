import { useState, useEffect, useRef } from "react";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import Filters from "./components/Filters";
import Overview from "./components/Overview";
import ReviewSection from "./components/ReviewSection";
import AdminReviewsPanel from "./components/AdminReviewsPanel";
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
  const [appNotifications, setAppNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showAdminReviews, setShowAdminReviews] = useState(false);

  const notifiedTasks = useRef(new Set());

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

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);


  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Browser does not support notifications");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      alert("Notifications enabled 🔔");
    } else {
      alert("Notifications blocked ❌");
    }
  };


  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();

      tasks.forEach((task) => {
        if (!task.reminder || task.done) return;

        const reminderDate = new Date(
          task.reminder?.seconds
            ? task.reminder.seconds * 1000
            : task.reminder
        );

        if (
          now >= reminderDate &&
          !notifiedTasks.current.has(task.id)
        ) {
       
          setAppNotifications((prev) => [
            ...prev,
            {
              id: task.id,
              text: task.text,
              time: new Date().toLocaleTimeString(),
            },
          ]);

       
          if (document.hidden) {
            new Notification("Task Reminder 🔔", {
              body: task.text,
            });
          }

          notifiedTasks.current.add(task.id);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [tasks]);


  const addTask = async (text, dateTime) => {
    if (!text.trim() || !user) return;

    await addDoc(collection(db, "tasks"), {
      text,
      done: false,
      userId: user.uid,
      createdAt: new Date(),
      reminder: dateTime ? new Date(dateTime) : null,
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

  const clearNotifications = () => {
    setAppNotifications([]);
    notifiedTasks.current.clear();
  };

  const filteredTasks = tasks
    .filter((t) =>
      filter === "active"
        ? !t.done
        : filter === "completed"
        ? t.done
        : true
    )
    .sort((a, b) => {
      if (!a.reminder) return 1;
      if (!b.reminder) return -1;

      const dateA = new Date(
        a.reminder?.seconds
          ? a.reminder.seconds * 1000
          : a.reminder
      );
      const dateB = new Date(
        b.reminder?.seconds
          ? b.reminder.seconds * 1000
          : b.reminder
      );

      return dateA - dateB;
    });

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

        {"Notification" in window &&
          Notification.permission !== "granted" && (
            <button onClick={enableNotifications}>
              Enable Notifications 🔔
            </button>
          )}


        <div className="notificationWrapper">
          <div
            className="bell"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
          >
            🔔
            {appNotifications.length > 0 && (
              <span className="notifCount">
                {appNotifications.length}
              </span>
            )}
          </div>

          {showNotifDropdown && (
            <div className="notifDropdown">
              <div className="notifHeader">
                {appNotifications.length > 0 && (
                  <button className="clearBtn" onClick={clearNotifications}>
                    Clear
                  </button>
                )}
              </div>

              {appNotifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                appNotifications.map((n) => (
                  <div key={n.id} className="notifItem">
                    <strong>{n.text}</strong>
                    <small>{n.time}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>


        {/* Admin Reviews button — only visible to your account */}
{user?.email === "jarvis9050@gmail.com" && (
  <button
    className="adminReviewsBtn desktopOnly"
    onClick={() => setShowAdminReviews(true)}
  >
    ⭐ Reviews
  </button>
)}
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

      {/* Admin panel modal */}
{showAdminReviews && (
  <AdminReviewsPanel onClose={() => setShowAdminReviews(false)} />
)}

{/* Public review section — shown to all logged-in users */}
<div className="container">
  <ReviewSection />
</div>
    </div>
  );
}