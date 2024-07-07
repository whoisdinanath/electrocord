import sql from "../database/db.js";

// Store messages and attachments in batches for each chat room
const messageBatches = {};
const attachmentBatches = {};

export const socketConnection = (socket) => {
  const userRooms = new Set();

  // Function to insert messages and attachments into the database
  const insertMessagesAndAttachmentsToDB = async (chatId) => {
    if (messageBatches[chatId] && messageBatches[chatId].length > 0) {
      const messages = messageBatches[chatId];
      messageBatches[chatId] = [];
      console.log("Messages to insert:", messages);
      try {
        // Insert messages
        const insertedMessages = await sql`
          INSERT INTO messages (chat_id, sender_id, message)
          VALUES ${sql(messages.map(msg => [msg.chatId, msg.senderId, msg.message]))}
          RETURNING message_id, chat_id, sender_id`;

        console.log(`Inserted ${insertedMessages.length} messages for chat ${chatId}`);

        // Handle attachments if any
        console.log("Attachments to insert:", attachmentBatches[chatId]);
        if (attachmentBatches[chatId] && attachmentBatches[chatId].length > 0) {
          const attachments = attachmentBatches[chatId].map(attachment => {
            const msg = insertedMessages.find(m => m.sender_id === attachment.senderId && m.chat_id === attachment.chatId);
            return msg ? { ...attachment, messageId: msg.message_id } : null;
          }).filter(a => a !== null);

          attachmentBatches[chatId] = [];

          if (attachments.length > 0) {
            await sql`
              INSERT INTO message_attachments (message_id, original_name, uploaded_name, file_path, file_type)
              VALUES ${sql(attachments.map(att => [att.messageId, att.originalName, att.uploadedName, att.filePath, att.fileType]))}`;
            console.log(`Inserted ${attachments.length} attachments for messages in chat ${chatId}`);
          }
        }
      } catch (err) {
        console.error(`Error inserting messages and attachments for chat ${chatId}:`, err);
      }
    }
  };

  // Function to handle disconnection or timed batch insertion
  const handleBatchInsert = async () => {
    userRooms.forEach(chatId => insertMessagesAndAttachmentsToDB(chatId));
  };

  // Schedule batch insert every 3 seconds
  const batchInterval = setInterval(handleBatchInsert, 3000);

  socket.on("join", (data) => {
    const { userId, chatId } = data;
    socket.join(chatId);
    socket.joinedRoom = chatId;
    userRooms.add(chatId);
    console.log(`User ${userId} joined chat ${chatId}`);
  });

  socket.on("disconnect", async () => {
    console.log("Socket disconnected: " + socket.id);
    await handleBatchInsert(); // Insert any remaining messages on disconnect
    clearInterval(batchInterval); // Clear the interval when the socket disconnects
  });

  socket.on("leave", async (data) => {
    const { userId, chatId } = data;
    socket.leave(chatId);
    userRooms.delete(chatId);
    await insertMessagesAndAttachmentsToDB(chatId); // Insert remaining messages for the room
    console.log(`User ${userId} left room ${chatId}`);
  });

  socket.on("chatMessage", (data) => {
    const { chatId, senderId, senderName, message, attachments = [] } = data;
    socket.to(chatId).emit("chatMessage", { chatId, senderId, senderName, message, attachments });

    // Add message to the batch
    if (!messageBatches[chatId]) {
      messageBatches[chatId] = [];
    }
    messageBatches[chatId].push({ chatId, senderId, senderName, message });

    // Add attachments to the batch
    if (attachments.length > 0) {
      if (!attachmentBatches[chatId]) {
        attachmentBatches[chatId] = [];
      }
      attachmentBatches[chatId].push(...attachments.map(att => ({
        chatId,
        senderId,
        originalName: att.originalName,
        uploadedName: att.uploadedName,
        filePath: att.filePath,
        fileType: att.fileType
      })));
    }
  });
};
