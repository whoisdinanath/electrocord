export const formatMessages = (messages) => {
  return messages.reduce((acc, msg) => {
    const { id, chatid, senderid, sendername, message, created_at, updated_at, original_name, uploaded_name, file_path, file_type } = msg;

    // find if the message already exists in the accumulator
    let existingMessage = acc.find(m => m.id === id);

    if (!existingMessage) {
      // if the message doesn't exist, create a new message object
      existingMessage = {
        id,
        chatId:chatid,
        senderId:senderid,
        senderName:sendername,
        message,
        createdAt: created_at,
        updatedAt: updated_at,
        attachments: []
      };
      acc.push(existingMessage);
    }

    // if there is an attachment, add it to the message's attachments array
    if (original_name && uploaded_name && file_path) {
      existingMessage.attachments.push({
        originalName: original_name,
        uploadedName: uploaded_name,
        filePath: file_path,
        fileType: file_type
      });
    }

    return acc;
  }, []);
};