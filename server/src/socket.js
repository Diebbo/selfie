// import { addNotification } from './services/notificationService.js';

let ioInstance = null;

export function createWebSocket(io, database, sendNotification) {
  ioInstance = io;
  const activeUsers = new Map(); // Store socket.id -> { userId, username }
  const userSockets = new Map(); // Store userId -> socket.id
  const activeChats = new Map(); // Store userId -> userId
  const notificationSockets = new Map(); // Store userId -> socket.id

  io.on("connection", (socket) => {
    // Handle user joining
    socket.on("join", async ({ userId, username, receiverUsername }) => {
      try {
        activeUsers.set(socket.id, { userId, username });
        userSockets.set(userId, socket.id);

        // Join a personal room
        socket.join(userId);

        // Update user's online status
        await database.userService.update(userId, {
          isOnline: true,
          lastSeen: await database.getDateTime(),
        });

        // Notify user of online status
        const socketId = userSockets.get(userId);
        const receiverId =
          await database.userService.fromUsernameToId(receiverUsername);
        activeChats.set(userId, receiverId);
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user_online", { username });
          io.to(socketId).emit("user_online", { username: receiverUsername });
        }

        console.log(`User ${username} joined chat`);
      } catch (error) {
        console.error("Error in join handler:", error);
      }
    });

    socket.on("join_notification", async (userId) => {
      try {
        console.log(`User ${userId} joining notification system`);

        // Aggiungi l'utente alla sua room personale per le notifiche
        socket.join(userId);

        // Salva il socket ID dell'utente
        notificationSockets.set(userId, socket.id);

        console.log(`User ${userId} joined notification system< successfully`);
      } catch (error) {
        console.error("Error in notification join handler:", error);
        socket.emit("notification_error", {
          message: "Errore nella connessione al sistema di notifiche",
        });
      }
    });

    socket.on("leave_notifications", (userId) => {
      if (notificationSockets.has(userId)) {
        notificationSockets.delete(userId);
        socket.leave(userId);
        console.log(`User ${userId} left notification system`);
      }
    });

    socket.on("join_notification_socket", async ({ userId }) => {
      notificationSockets.set(userId, socket.id);
      console.log("Notification socket joined");
      console.log("user id", userId);
      socket.emit("new_notification", {
        title: "🔔 Benvenuto su ChatApp!",
        body: "Le tue notifiche appariranno qui",
        link: "/notifications",
      });
    });

    // Handle private messages
    socket.on("private_message", async ({ message, receiverUsername }) => {
      try {
        const sender = activeUsers.get(socket.id);
        if (!sender) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        // Use existing chat service to save message
        const savedMessage = await database.chatService.sendMessage(
          sender.userId,
          receiverUsername,
          message,
        );

        // Format message for sending
        const messageToSend = {
          _id: savedMessage._id,
          message: savedMessage.message,
          sender: sender.username,
          receiver: receiverUsername,
          createdAt: savedMessage.createdAt,
        };

        // Also send to sender for UI update
        socket.emit("message_sent", messageToSend);

        // Send to receiver if online
        const receiverId =
          await database.userService.fromUsernameToId(receiverUsername);
        console.log({ receiverId, receiverUsername });
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          console.log("receiver online:", receiverSocketId);
          io.to(receiverSocketId).emit("receive_message", messageToSend);

          // Emit delivery status to sender
          socket.emit("message_status", {
            messageId: savedMessage._id,
            status: "delivered",
          });
        } else {
          // Receiver is offline
          socket.emit("message_status", {
            messageId: savedMessage._id,
            status: "sent",
          });
          const user = await database.userService.getById(receiverId);
          const payload = {
            title: "📨 New Message from " + sender.username,
            body: messageToSend.message,
            link: "chats/" + sender.username,
          };
          await sendNotification(user, payload);
        }
      } catch (error) {
        console.error("Error in private_message handler:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    let typingTimeout = null;

    socket.on("typing_start", ({ senderUsername, receiverUsername }) => {
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(async () => {
        const receiverId =
          await database.userService.fromUsernameToId(receiverUsername);
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user_typing", {
            username: senderUsername,
          });
        }
      }, 500); // Only emits if no new typing event is triggered within 500ms
    });

    socket.on("typing_end", async ({ senderUsername, receiverUsername }) => {
      try {
        const receiverId =
          await database.userService.fromUsernameToId(receiverUsername);
        if (!receiverId) return;

        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user_stopped_typing", {
            username: senderUsername,
          });
        }
      } catch (error) {
        console.error("Error in typing_end handler:", error);
      }
    });

    // Handle message read status
    socket.on("message_read", async ({ messageId }) => {
      try {
        const message = await database.chatService.readMessage(messageId);

        if (message) {
          const senderSocketId = userSockets.get(message.sender);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_status", {
              messageId: message._id,
              status: "read",
            });
          }
        }
      } catch (error) {
        console.error("Error in message_read handler:", error);
      }
    });

    // Evento per la connessione iniziale alle notifiche
    socket.on("join_notifications", async ({ userId }) => {
      try {
        // Aggiungi l'utente alla stanza delle notifiche
        socket.join(`notifications:${userId}`);
      } catch (error) {
        console.error("Error in join_notifications handler:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      try {
        const user = activeUsers.get(socket.id);
        if (user) {
          // pdate user's status
          await database.userService.update(user.userId, {
            isOnline: false,
            lastSeen: await database.getDateTime(),
          });

          // Notify other users in active chats
          for (const [userId, receiverId] of activeChats.entries()) {
            if (userId === user.userId || receiverId === user.userId) {
              const otherUserId = userId === user.userId ? receiverId : userId;
              const otherSocketId = userSockets.get(otherUserId);
              if (otherSocketId) {
                io.to(otherSocketId).emit("user_offline", {
                  username: user.username,
                });
              }
            }
          }

          // Clean up user mappings and active chats
          activeChats.delete(user.userId);
          userSockets.delete(user.userId);
          activeUsers.delete(socket.id);
        }
      } catch (error) {
        console.error("Error in disconnect handler:", error);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

export async function emitNotification(userId, notification) {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }

  try {
    // Invia la notifica all'utente
    ioInstance.to(userId).emit("new_notification", notification);
    console.log(`Notification emitted to user ${userId}`);
    return true;
  } catch (error) {
    database.addNotificationToInbox(userId, notification);
    console.error(`Error emitting notification to user ${userId}:`, error);
    return false;
  }
}

export function getIO() {
  return ioInstance;
}
