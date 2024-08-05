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
export const formatSemesters = (subjects) => {
  const semesters = subjects.reduce((acc, subject) => {
    const { semester, semester_id, created_at, updated_at, chat_id, type, category, ...subjectDetails } = subject;

    if (!acc[semester]) {
      acc[semester] = {
        semester,
        semester_id,
        created_at,
        updated_at,
        subjects: []
      };
    }

    const chatDetails = {
      chat_id,
      type,
      category
    };

    acc[semester].subjects.push({
      ...subjectDetails,
      chat: chatDetails
    });

    return acc;
  }, {});

  return Object.values(semesters);
};

export const formatSubjects = (subjects) => {
  return subjects.map(subject => {
    const { chat_id, type, category, ...subjectDetails } = subject;

    const chatDetails = {
      chat_id,
      type,
      category
    };

    return {
      ...subjectDetails,
      chat: chatDetails
    };
  });
};
