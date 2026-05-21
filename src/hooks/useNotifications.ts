import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, SiteNotification } from '../types';

export function useNotifications(user: any) {
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastAlert, setLastAlert] = useState<SiteNotification | null>(null);
  const startTime = useRef(new Date().toISOString());
  const seenNotifs = useRef(new Set<string>());

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (user.uid === 'local-guest-123') {
      import('../demoData').then(mod => {
        const notifs = mod.DEMO_NOTIFICATIONS.map(n => ({
          ...n,
          isRead: n.read,
          message: n.message,
          projectId: n.projectId,
          timestamp: n.createdAt
        })) as any[];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      });
      return () => {};
    }

    const unsubscribes: (() => void)[] = [];

    const addNotification = (notif: Omit<SiteNotification, 'id' | 'timestamp' | 'isRead'>) => {
      const key = `${notif.type}-${notif.relatedId}`;
      
      // Debounce or avoid immediate re-alerts for same thing (like multiple material updates)
      if (seenNotifs.current.has(key)) return;
      seenNotifs.current.add(key);
      
      // Clear seen after 1 minute to allow re-alerts if needed (e.g. status changes back and forth)
      setTimeout(() => seenNotifs.current.delete(key), 60000);

      const newNotif: SiteNotification = {
        ...notif,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      setNotifications(prev => [newNotif, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
      setLastAlert(newNotif);
      
      // Auto-clear toast alert
      setTimeout(() => setLastAlert(current => current?.id === newNotif.id ? null : current), 5000);
    };

    // 1. Get projects to watch
    const projectsQ = collection(db, 'projects');
    const unsubProjects = onSnapshot(projectsQ, (snapshot) => {
      // Clean up previous listeners if projects list changes
      unsubscribes.forEach(unsub => unsub());
      unsubscribes.length = 0;

      snapshot.docs.forEach(projectDoc => {
        const project = { id: projectDoc.id, ...projectDoc.data() } as Project;

        // --- ATTENDANCE ---
        const attendanceQ = query(
          collection(db, `projects/${project.id}/attendance`),
          where('timestamp', '>', startTime.current)
        );
        unsubscribes.push(onSnapshot(attendanceQ, (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              if (data.status === 'present') {
                addNotification({
                  type: 'attendance',
                  title: 'Attendance Recorded',
                  message: `${data.workerName} marked present at ${project.name}`,
                  projectId: project.id,
                  projectName: project.name,
                  relatedId: change.doc.id
                });
              }
            }
          });
        }));

        // --- MATERIALS ---
        const materialsQ = collection(db, `projects/${project.id}/materials`);
        unsubscribes.push(onSnapshot(materialsQ, (snap) => {
          snap.docChanges().forEach((change) => {
            const data = change.doc.data();
            // If it becomes Low or Out (wasn't before, or just created)
            if (['Low', 'Out'].includes(data.status)) {
               addNotification({
                type: 'low_material',
                title: 'Low Inventory',
                message: `${data.name} is ${data.status.toLowerCase()} at ${project.name}`,
                projectId: project.id,
                projectName: project.name,
                relatedId: change.doc.id
              });
            }
          });
        }));

        // --- TASKS ---
        const tasksQ = query(
          collection(db, `projects/${project.id}/tasks`),
          where('createdAt', '>', startTime.current)
        );
        unsubscribes.push(onSnapshot(tasksQ, (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              addNotification({
                type: 'new_task',
                title: 'New Task Added',
                message: `"${data.title}" was assigned at ${project.name}`,
                projectId: project.id,
                projectName: project.name,
                relatedId: change.doc.id
              });
            }
          });
        }));

        // Task Completion Detection
        const tasksProgressQ = collection(db, `projects/${project.id}/tasks`);
        unsubscribes.push(onSnapshot(tasksProgressQ, (snap) => {
           snap.docChanges().forEach((change) => {
             if (change.type === 'modified') {
                const data = change.doc.data();
                if (data.status === 'completed') {
                   addNotification({
                    type: 'task_completed',
                    title: 'Task Completed',
                    message: `"${data.title}" finished at ${project.name}`,
                    projectId: project.id,
                    projectName: project.name,
                    relatedId: change.doc.id
                  });
                }
             }
           });
        }));
      });
    });

    return () => {
      unsubProjects();
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, unreadCount, markAllAsRead, lastAlert, removeNotification };
}
