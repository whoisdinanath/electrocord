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
export const formatSubjects = (input) => {
  const organizedData = {};

  input.forEach(item => {
    const { 
      subject_id, 
      name, 
      description, 
      syllabus, 
      created_at, 
      updated_at, 
      semester, 
      semester_id, 
      resource_id, 
      resource_name, 
      resource_description, 
      resource_category, 
      file_path, 
      resource_created, 
      resource_updated,
      chat_id,
      type,
      category 
    } = item;

    // Initialize the subject if it doesn't exist
    if (!organizedData[subject_id]) {
      organizedData[subject_id] = {
        subject_id,
        name,
        description,
        syllabus,
        created_at,
        updated_at,
        semester,
        semester_id,
        chat: {
          chat_id,
          type,
          category
        },
        resources: []
      };
    }

    // Add resources to the subject
    if (resource_id) {
      organizedData[subject_id].resources.push({
        resource_id,
        resource_name,
        resource_description,
        resource_category,
        file_path,
        resource_created,
        resource_updated
      });
    }
  });

  // Convert the organizedData object into an array
  return Object.values(organizedData);
};

export const formatSemesters = (input) => {
    const organizedData = {};

    input.forEach(item => {
        const semesterId = item.semester_id;

        // Initialize the semester if it doesn't exist
        if (!organizedData[semesterId]) {
            organizedData[semesterId] = {
                semester: item.semester,
                semester_id: item.semester_id,
                created_at: item.created_at,
                updated_at: item.updated_at,
                subjects: []
            };
        }

        // Find or create the subject within the semester
        let subject = organizedData[semesterId].subjects.find(sub => sub.name === item.name);
        if (!subject) {
            subject = {
                subject_id: item.subject_id,
                name: item.name,
                description: item.description,
                syllabus: item.syllabus,
                chat: {
                  chat_id: item.chat_id,
                  type: item.type,
                  category: item.category
                },
                resources: []
            };
            organizedData[semesterId].subjects.push(subject);
        }

        // Add resources to the subject
        if (item.resource_id) {
            subject.resources.push({
                resource_id: item.resource_id,
                resource_name: item.resource_name,
                resource_description: item.resource_description,
                resource_category: item.resource_category,
                file_path: item.file_path,
                resource_created: item.resource_created,
                resource_updated: item.resource_updated
            });
        }
    });

    // Convert the organizedData object into an array
    const result = Object.values(organizedData).map(semester => ({
        semester: semester.semester,
        semester_id: semester.semester_id, // Ensure semester_id is included
        created_at: semester.created_at,
        updated_at: semester.updated_at,
        subjects: semester.subjects
    }));

    return result;
};
