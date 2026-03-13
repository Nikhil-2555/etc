import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

let socket;

const NotificationManager = () => {
    const { user } = useAuth();

    useEffect(() => {
        // Only initialize socket once when component mounts
        socket = io('http://localhost:5000', {
            withCredentials: true,
        });

        // Whenever the user logs in, join the user room with their ID
        if (user && user._id) {
            socket.emit('join_user_room', user._id);
        }

        const handleNotification = (data) => {
            const { title, message, type } = data;

            // Trigger toast notifications based on type
            const content = (
                <>
                    <strong>{title}</strong>
                    <p className="text-sm mt-1">{message}</p>
                </>
            );

            const toastMessage = data.link ? (
                <a href={data.link} className="block cursor-pointer hover:opacity-80 transition-opacity">
                    {content}
                </a>
            ) : (
                <div>
                    {content}
                </div>
            );

            if (type === 'success') {
                toast.success(toastMessage, { duration: 5000 });
            } else if (type === 'info') {
                toast(toastMessage, {
                    icon: 'ℹ️',
                    duration: 5000,
                });
            } else if (type === 'error') {
                toast.error(toastMessage, { duration: 5000 });
            } else {
                toast(toastMessage, { duration: 5000 });
            }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
            if (!user) {
                // If the user goes away/logs out entirely we can disconnect
                socket.disconnect();
            }
        };
    }, [user]);

    // This component does not render any UI itself
    return null;
};

export default NotificationManager;
