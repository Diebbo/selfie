// src/websocket.js
// import { addNotification } from './services/notificationService.js';

export function createWebSocket(io, database) {
  const activeUsers = new Map(); // Store socket.id -> { userId, username }
  const userSockets = new Map(); // Store userId -> socket.id

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining
    socket.on('join', async ({ userId, username }) => {
      try {
        activeUsers.set(socket.id, { userId, username });
        userSockets.set(userId, socket.id);

        // Join a personal room
        socket.join(userId);

        // Update user's online status
        await database.userService.update(userId, {
          isOnline: true,
          lastSeen: await database.getDateTime()
        });

        console.log(`User ${username} joined chat`);
      } catch (error) {
        console.error('Error in join handler:', error);
      }
    });

    // Handle private messages
    socket.on('private_message', async ({ message, receiverUsername }) => {
      try {
        const sender = activeUsers.get(socket.id);
        if (!sender) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Use existing chat service to save message
        const savedMessage = await database.chatService.sendMessage(
          sender.userId,
          receiverUsername,
          message,
        );

        // Create notification TODO:

        // Format message for sending
        const messageToSend = {
          _id: savedMessage._id,
          message: savedMessage.message,
          sender: sender.username,
          receiver: receiverUsername,
          createdAt: savedMessage.createdAt
        };

        // Also send to sender for UI update
        socket.emit('message_sent', messageToSend);

        // Send to receiver if online
        const receiverId = await database.userService.fromUsernameToId(receiverUsername);
        console.log({receiverId, receiverUsername});
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          console.log('receiver online:', receiverSocketId);
          io.to(receiverSocketId).emit('receive_message', messageToSend);

          // Emit delivery status to sender
          socket.emit('message_status', {
            messageId: savedMessage._id,
            status: 'delivered'
          });
        } else {
          // Receiver is offline
          socket.emit('message_status', {
            messageId: savedMessage._id,
            status: 'sent'
          });
        }

      } catch (error) {
        console.error('Error in private_message handler:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    let typingTimeout = null;

    socket.on('typing_start', ({ senderUsername, receiverUsername}) => {
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(async () => {
        const receiverId = await database.userService.fromUsernameToId(receiverUsername);
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_typing', { username: senderUsername });
        }
      }, 500); // Only emits if no new typing event is triggered within 500ms
    });

    socket.on('typing_end', async ({ receiverUsername }) => {
      try {
        const sender = activeUsers.get(socket.id);
        if (!sender) return;

        const receiver = await database.userService.find({ username: receiverUsername });
        if (!receiver) return;

        const receiverSocketId = userSockets.get(receiver._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_stopped_typing', {
            username: sender.username
          });
        }
      } catch (error) {
        console.error('Error in typing_end handler:', error);
      }
    });

    // Handle message read status
    socket.on('message_read', async ({ messageId }) => {
      try {
        const message = await database.chatService.readMessage(messageId);

        if (message) {
          const senderSocketId = userSockets.get(message.sender);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_status', {
              messageId: message._id,
              status: 'read'
            });
          }
        }
      } catch (error) {
        console.error('Error in message_read handler:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const user = activeUsers.get(socket.id);
        if (user) {
          // pdate user's status
          await database.userService.update(user.userId, {
            isOnline: false,
            lastSeen: await database.getDateTime()
          });

          // Clean up user maps
          userSockets.delete(user.userId);
          activeUsers.delete(socket.id);
        }
      } catch (error) {
        console.error('Error in disconnect handler:', error);
      }
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
