// database calls for the application
import { mongoose } from "mongoose";

// db Models
import { userSchema } from "./models/user-model.js";
import { timeSchema } from "./models/time-model.js";
import { eventSchema } from "./models/event-model.js";
import { activitySchema } from "./models/event-model.js";
import { projectSchema } from "./models/project-model.js";
import { songSchema } from "./models/song-model.js";
import { messageSchema } from "./models/chat-model.js";
import { noteSchema } from "./models/note-model.js";
import { resourceSchema } from "./models/event-model.js";

// services import
import createProjectService from "./services/projects.mjs";

export async function createDataBase(uri) {
  const timeModel = mongoose.model("Times", timeSchema);
  const userModel = mongoose.model("Users", userSchema);
  const eventModel = mongoose.model("Event", eventSchema);
  const resourceModel = mongoose.model("Resource", resourceSchema);
  const songModel = mongoose.model("Song", songSchema);
  const projectModel = mongoose.model("Project", projectSchema);
  const activityModel = mongoose.model("Activity", activitySchema);
  const chatModel = mongoose.model("Chat", messageSchema);
  const noteModel = mongoose.model("Note", noteSchema);

  const models = {
    timeModel,
    userModel,
    eventModel,
    songModel,
    projectModel,
    activityModel,
    chatModel,
    resourceModel,
  };

  await mongoose.connect(uri, { dbName: "test" });

  const login = async (user) => {
    var res;
    if (user.username) {
      res = await userModel.findOne({ username: user.username });
    } else if (user.email) {
      res = await userModel.findOne({ email: user.email });
    }

    if (!res) throw new Error("Invalid credentials");
    return res;
  };

  const register = async (user) => {
    const emailUser = await userModel.findOne({ email: user.email });
    if (emailUser) throw new Error("Email already used");
    const usernameUser = await userModel.findOne({ username: user.username });
    if (usernameUser) throw new Error("Username already used");

    let res = await userModel.create({
      ...user,
      avatar: `https://api.dicebear.com/9.x/open-peeps/svg?seed=${user.username}`,
    });

    const payload = {
      title: "Verify your email",
      body: `Click here to verify your email:`,
      link: `verification?emailToken=${user.emailtoken}`,
    };

    return { dbuser: res, payload };
  };

  // Settings Section

  const updateUsername = async (uid, username) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    // check that the username is not already used by another user
    const usernameUser = await userModel.findOne({ username: username });
    if (usernameUser) throw new Error("Username already used");

    user.username = username;
    await user.save();

    return user;
  };

  const verifyEmail = async (emailtoken) => {
    const user = await userModel.findOne({ emailtoken: emailtoken });
    if (!user) throw new Error("Invalid token");

    user.isVerified = true;
    user.emailtoken = "";
    await user.save();

    return user;
  };

  const lostPassword = async (email, resetToken) => {
    const user = await userModel.findOne({ email: email });
    if (!user) throw new Error("User not found");

    user.resetToken = resetToken;
    await user.save();
    return user;
  };

  const verifyResetToken = async (resetToken) => {
    const user = await userModel.findOne({ resetToken: resetToken });
    if (!user) throw new Error("Invalid token");

    return user;
  };

  const isVerified = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    return user.isVerified;
  };

  const updateEmail = async (uid, email, emailToken) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    // check that the email is not already used by another user
    const emailUser = await userModel.findOne({ email: email });
    if (emailUser) throw new Error("Email already used");

    user.email = email;
    await user.save();

    return user;
  };

  const deleteAccount = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    await userModel.deleteOne({ _id: uid });
  };

  const updatePassword = async (uid, hashedPassword) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    user.password = hashedPassword;
    user.isVerified = true;
    if (user.resetToken) user.resetToken = "";
    await user.save();
    return user;
  };

  // Notification Settings Section

  const saveSubscriptions = async (uid, newSubscription) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!user.notifications) {
      user.notifications = {
        emailOn: true, 
        pushOn: true, 
        subscriptions: [],
      };
    }

    // check if a subscription with the same endpoint already exists
    const existingSubIndex = user.notifications.subscriptions.findIndex(
      (sub) => sub.endpoint === newSubscription.endpoint,
    );

    if (existingSubIndex !== -1) {
      // if a subscription with the same endpoint exists, update device name
      user.notifications.subscriptions[existingSubIndex] = newSubscription;
    } else {
      // if a subscription with the same device name exists, throw an error
      const existingDeviceIndex = user.notifications.subscriptions.findIndex(
        (sub) => sub.device_name === newSubscription.device_name,
      );
      if (existingDeviceIndex !== -1) {
        throw new Error("A subscription with this device name already exists");
      }

      // New device subscription
      user.notifications.subscriptions.push(newSubscription);
    }
    // Set push Notification to ON 
    user.notifications.pushOn = true;

    await user.save();
    if (existingSubIndex !== -1) {
      return false;
    } else {
      return true;
    }
  };

  const deleteSubscription = async (uid, deviceName) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!user.notifications || !user.notifications.subscriptions) {
      throw new Error("User has no subscriptions");
    }

    // find index of subscription with the specified device name
    const subscriptionIndex = user.notifications.subscriptions.findIndex(
      (sub) => sub.device_name === deviceName,
    );
    if (subscriptionIndex === -1) {
      throw new Error("Subscription not found for the specified device");
    }

    user.notifications.subscriptions.splice(subscriptionIndex, 1);

    if (user.notifications.subscriptions.length === 0) {
      user.notifications.pushOn = false;
    }

    await user.save();
    return user;
  };

  const getSubscriptions = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user || !user.notifications.subscriptions) {
      throw new Error("User not found or not subscribed");
    }
    return user.notifications.subscriptions;
  };

  const disableNotifications = async (uid, type) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!user.notifications) {
      user.notifications = {
        emailOn: true,
        pushOn: true,
        subscriptions: [],
      };
    }

    if (type === "email") {
      user.notifications.emailOn = false;
    } else if (type === "push") {
      user.notifications.pushOn = false;
    } else {
      throw new Error("Invalid notification type");
    }

    await user.save();
    return user;
  };

  const getNotificationsStatus = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!user.notifications) {
      user.notifications = {
        emailOn: false,
        pushOn: false,
        subscriptions: [],
      };
    }

    return user.notifications;
  };

  const enableNotifications = async (uid, type) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!user.notifications) {
      user.notifications = {
        emailOn: true,
        pushOn: true,
        subscriptions: [],
      };
    }

    if (type === "email") {
      user.notifications.emailOn = true;
    } else if (type === "push") {
      user.notifications.pushOn = true;
    } else {
      throw new Error("Invalid notification type");
    }

    await user.save();
    return user;
  };

  // Time Machine Section

  const changeDateTime = async (time, isRealTime = false) => {
    let filter = { name: "timemachine" };
    let update = {
      virtualTime: time,
      realTimeRef: new Date(),
      isRealTime: isRealTime,
    };
    const res = await timeModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });
    return res;
  };

  const getDateTime = async () => {
    const res = await timeModel.findOne({ name: "timemachine" });
    if (!res) throw new Error("Time not found");

    if (res.isRealTime) {
      return new Date();
    } else {
      const elapsedTime = new Date() - res.realTimeRef;
      return new Date(res.virtualTime.getTime() + elapsedTime);
    }
  };

  // Note Section

  const postNote = async (uid, note, id) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      if (!user.notes) user.notes = [];
      if (!note.title || !note.content) {
        throw new Error("Note must have a title and content");
      }
      if (!note.tags) note.tags = [];
      note.date = await getDateTime();

      if (id) {
        // Modify existing note
        const noteId = new mongoose.Types.ObjectId(id);
        if (note.isPublic) {
          // Modifica nota pubblica
          const publicNote = await noteModel.findById(noteId);
          if (publicNote) {
            await noteModel.findByIdAndUpdate(noteId, {
              ...note,
              userId: uid,
              _id: noteId,
            });
          } else {
            throw new Error("Public note with provided ID not found");
          }
        } else {
          // Modifica nota privata
          const noteIndex = user.notes.findIndex((n) => n._id.equals(noteId));
          if (noteIndex !== -1) {
            user.notes[noteIndex] = {
              ...user.notes[noteIndex].toObject(),
              ...note,
              _id: noteId,
            };
          } else {
            throw new Error("Note with provided ID not found");
          }
        }
      } else {
        // New note
        if (note.isPublic) {
          // Crea nota pubblica
          await noteModel.create({
            ...note,
            userId: uid,
          });
        } else {
          // Crea nota privata
          user.notes.push(note);
        }
      }

      await user.save();
      return note;
    } catch (error) {
      console.error(`Error posting note for user ${uid}:`, error);
      throw error;
    }
  };

  const getNotes = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");
    const publicNotes = await noteModel.find({});
    const privateNote = user.notes;
    return {
      private: privateNote,
      public: publicNotes,
    };
  };

  const getNoteById = async (uid, noteId) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const note = user.notes.id(noteId);
      if (!note) throw new Error("Note not found");

      return note;
    } catch (error) {
      console.error("Error getting note by ID:", error);
      throw error;
    }
  };

  const removeNoteById = async (uid, noteId) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      let noteIndex = user.notes.findIndex(
        (note) => note._id.toString() === noteId,
      );
      if (noteIndex === -1) {
        // nota pubblica 
        noteIndex = await noteModel.findByIdAndDelete(noteId);
      } else {
        // nota privata
        user.notes.splice(noteIndex, 1);
        await user.save();
      }
      return { message: "Note removed successfully" };
    } catch (error) {
      console.error("Error removing note:", error);
      throw error;
    }
  };

  
  // Resources Section

  const getResource = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");
    try {
      const risorse = await resourceModel.find();
      return risorse;
    } catch (error) {
      throw new Error(error);
    }
  };

  const addResource = async (resource, uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");
    if (user.role === 'user') throw new Error("Not Authorized");

    try {
      const addedResource = resourceModel.create({ ...resource, creator: uid });
      return addedResource;
    } catch (e) {
      throw new Error(e);
    }
  };

  const unBookResource = async (uid, bookId) => {
    if (!uid || !bookId) {
      throw new Error("Missing required parameters");
    }

    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const result = await resourceModel.findOneAndUpdate(
      { "used._id": new mongoose.Types.ObjectId(bookId) },
      { $pull: { used: { _id: new mongoose.Types.ObjectId(bookId) } } },
      { new: true }
    );
    await result.save();

    if (!result) {
      throw new Error("Booking not found in any resource");
    }

    return {
      success: true,
      message: "Resource unbooked successfully",
      resourceId: result._id
    };
  };

  const bookResource = async (uid, id, startDate, endDate) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const resource = await resourceModel.findById(id);
      if (!resource) throw new Error("Resource not found");

      const isOverlapping = resource.used.some((period) => {
        return (
          (startDate >= period.startTime && startDate < period.endTime) ||
          (endDate > period.startTime && endDate <= period.endTime) ||
          (startDate <= period.startTime && endDate >= period.endTime)
        );
      });

      if (isOverlapping) {
        return false;
      }

      resource.used.push({
        startTime: startDate,
        endTime: endDate,
      });

      await resource.save();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };

  const deleteResource = async (uid, resourceName) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    // Verifica che l'utente sia admin
    if (!isAdmin(uid)) throw new Error("User is not authorized to delete resources");

    // Trova la risorsa tramite il nome
    const resource = await resourceModel.findOne({ name: resourceName });
    if (!resource) throw new Error("Resource not found");

    // Trova e aggiorna tutti gli eventi che utilizzano questa risorsa
    await eventModel.updateMany(
      { resource: resourceName },
      { $unset: { resource: "" } }
    );

    // Elimina la risorsa dal modello delle risorse
    await resourceModel.deleteOne({ _id: resource._id });

    return {
      success: true,
      message: `Resource ${resourceName} successfully deleted and removed from all events`,
      deletedResource: resource
    };
  };

  // Events Section

  const getEvents = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    // Combina gli ID degli eventi creati e quelli a cui l'utente partecipa
    const allEventIds = [
      ...new Set([...user.events, ...user.participatingEvents]),
    ];

    // Recupera tutti gli eventi in una sola query
    const events = await eventModel.find({ _id: { $in: allEventIds } });

    if (!events) return [];
    for (const event of events) {
      await event.populate({
        path: "participants",
        select: "username _id",
      });
    }

    return events;
  };

  const getEvent = async (uid, eventid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const event = await eventModel.findById(eventid);
    if (!event) throw new Error("Event not found");

    const owner = await userModel.findById(event.uid, "username _id");
    event.owner = owner;

    return event.populate({
      path: "participants",
      select: "username _id",
    });
  };

  const createEvent = async (uid, event) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!event.title) throw new Error("Event must have a title");
    if (!event.dtstart || !event.dtend)
      throw new Error("Event must have a date");

    try {
      const addedEvent = await eventModel.create({ ...event, uid: uid });
      if (!addedEvent) throw new Error("Failed to create event");

      await userModel.findByIdAndUpdate(
        uid,
        { $push: { events: addedEvent._id } },
        { new: true },
      );

      if (addedEvent.participants && addedEvent.participants.length > 0) {
        var notifications = [];
        for (const participant of addedEvent.participants) {
          try {
            const updated = await userModel.findByIdAndUpdate(
              participant._id,
              { $push: { invitedEvents: addedEvent._id } },
              { new: true },
            );

            //costruzione della notifica per i partecipanti
            var payload = {
              title: "📆 Sei stato invitato a un evento di gruppo",
              body:
                "L'utente " +
                user.username +
                " ti ha invitato all'evento " +
                addedEvent.title +
                "\nClicca qui per accettare l'invito.",
              link: `/calendar/${addedEvent._id}/${participant}`,
            };
            notifications.push({ user: updated, payload });

            if (!updated) {
              console.log(`User not found: ${participant}`);
            } else {
              console.log(`Event added to user: ${participant}`);
              console.log(
                "Updated participating events:",
                updated.participatingEvents,
              );
            }
          } catch (err) {
            console.error(`Error updating participant ${participant}:`, err);
          }
        }
      }

      return { addedEvent, notifications };
    } catch (error) {
      console.error("Error in createEvent:", error);
      throw error;
    }
  };

  const deleteEvent = async (uid, eventId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const event = await eventModel.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (event.uid.toString() !== uid.toString())
      throw new Error("Event does not belong to user");

    // Remove event from user's events
    await userModel.findByIdAndUpdate(uid, { $pull: { events: eventId } });

    // Remove event from invited and participating users
    await userModel.updateMany(
      { $or: [{ invitedEvents: eventId }, { participatingEvents: eventId }] },
      { $pull: { invitedEvents: eventId, participatingEvents: eventId } },
    );

    // Delete the event
    await eventModel.findByIdAndDelete(eventId);

    // Remove any notifications related to this event
    await userModel.updateMany(
      { "inboxNotifications.fromEvent": eventId },
      { $pull: { inboxNotifications: { fromEvent: eventId } } },
    );
  };

  const modifyEvent = async (uid, event, eventId) => {
    const user = await userModel.findById(uid);

    if (!user) throw new Error("User not found");

    const oldEvent = await eventModel.findById(eventId).populate('participants');

    if (!oldEvent) throw new Error("Event not found");

    if (oldEvent.uid.toString() !== uid.toString())
      throw new Error("Event does not belong to user");

    try {
      // Sovrascrivo l'intero evento dello user con il nuovo evento modificato
      const updatedEvent = await eventModel.replaceOne(
        { _id: eventId },
        { ...event, uid: uid }
      );

      if (updatedEvent.modifiedCount === 0) {
        throw new Error("Event replace failed");
      }

      // Trova i nuovi partecipanti confrontando gli ID
      const oldParticipantIds = oldEvent.participants.map(p => p._id);
      const newParticipantIds = event.participants.map(p => p._id);

      // Trova i partecipanti rimossi
      const removedParticipantIds = oldParticipantIds.filter(
        id => !newParticipantIds.includes(id)
      );

      var notifications = [];

      // Rimuove l'evento dagli utenti che non sono più partecipanti
      for (const removedParticipantId of removedParticipantIds) {
        try {
          await userModel.findByIdAndUpdate(
            removedParticipantId,
            {
              $pull: {
                invitedEvents: eventId,
                participatingEvents: eventId
              }
            }
          );
          console.log(`Event removed from user: ${removedParticipantId}`);
        } catch (err) {
          console.error(`Error removing event from participant ${removedParticipantId}:`, err);
        }
      }

      // Invia notifiche solo ai nuovi partecipanti
      for (const newParticipantId of newParticipantIds) {
        try {
          const updated = await userModel.findByIdAndUpdate(
            newParticipantId,
            { $push: { invitedEvents: eventId } },
            { new: true }
          );

          var payload = {
            title: "📆 Sei stato invitato a un evento di gruppo",
            body:
              "L'utente " +
              user.username +
              " ti ha invitato all'evento " +
              event.title +
              "\nClicca qui per accettare l'invito.",
            link: `/calendar/${eventId}/${newParticipantId}`,
          };

          notifications.push({ user: updated, payload });

          if (!updated) {
            console.log(`User not found: ${newParticipantId}`);
          } else {
            console.log(`Event added to user: ${newParticipantId}`);
          }
        } catch (err) {
          console.error(`Error updating participant ${newParticipantId}:`, err);
        }
      }

      return { updatedEvent, notifications };
    } catch (e) {
      throw new Error("Event did not get changed: " + e.message);
    }
  };

  // tolgo l'evento dopo averlo accettato [delete evento per componente ShowEvent]
  const dodgeEvent = async (uid, eventId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const event = await eventModel.findById(eventId);
    if (!event) throw new Error("Event not found");

    const userRes = await userModel.findByIdAndUpdate(uid, {
      $pull: { participatingEvents: eventId },
    });

    const eventRes = await eventModel.findByIdAndUpdate(eventId, {
      $pull: { participants: uid },
    });

    return { userRes, eventRes };
  };

  // accetto la proposta dell'evento [componente participateEvent]
  const participateEvent = async (uid, eventId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const event = await eventModel.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if user is already participating
    if (user.participatingEvents?.includes(eventId))
      throw new Error("User is already participating in this event");

    if (!user.participatingEvents) user.participatingEvents = [];
    user.participatingEvents.push(eventId);
    user.invitedEvents = user.invitedEvents.filter(
      (e) => e.toString() !== eventId.toString(),
    );
    await user.save();

    return user.invitedEvents;
  };

  // rifiuto la proposta dell'evento [componente participateEvent]
  const rejectEvent = async (uid, eventId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const event = await eventModel.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if user is already participating
    if (user.participatingEvents.includes(eventId))
      throw new Error("User is already participating in this event");
    //tolgo l'evento dai pending events
    user.invitedEvents = user.invitedEvents.filter(
      (e) => e.toString() !== eventId.toString(),
    );
    await user.save();

    await eventModel.findByIdAndUpdate(eventId, {
      $pull: { participants: uid },
    });

    return user.invitedEvents;
  };

  const getParticipantsUsernames = async (eventId) => {
    try {
      const event = await eventModel.findById(eventId);
      if (!event) throw new Error("Event not found");

      const users = await userModel.find({
        invitedEvents: eventId,
      }, "username",
      );

      const usernames = users.map((user) => user.username);

      return usernames;
    } catch (error) {
      throw new Error(`Error getting usernames: ${error.message}`);
    }
  };

  const importEvents = async (events, userId) => {
    const importedEvents = [];

    // Validazione iniziale dell'utente
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    for (const event of Object.values(events)) {
      if (event.type !== "VEVENT") continue;

      try {
        // converto l'evento ical nel formato dello schema
        const eventData = {
          title: event.summary || "",
          summary: event.summary || "",
          uid: userId,
          sequence: event.sequence || 0,
          status: mapStatus(event.status),
          transp: event.transparency || "OPAQUE",
          dtstart: event.start,
          dtend: event.end,
          dtstamp: event.dtstamp?.toISOString() || new Date().toISOString(),
          allDay: event.allDay || false,
          categories: event.categories || [],
          location: event.location || "",
          description: event.description || "",
          URL: event.url || "",
          participants: [],
        };

        // aggiungo le coordinate geografiche se presenti
        if (event.geo) {
          eventData.geo = {
            lat: event.geo.lat,
            lon: event.geo.lon,
          };
        }

        // gestisco le regole di ricorrenza se presenti
        if (event.rrule) {
          eventData.rrule = parseRRule(event.rrule);
        }

        // salvo l'evento nel database
        const newEvent = new eventModel(eventData);
        const savedEvent = await newEvent.save();
        if (!savedEvent) throw new Error("Failed to save event");

        importedEvents.push(savedEvent);
      } catch (error) {
        console.error("Error importing event:", error);
        continue;
      }
    }

    try {
      // Aggiorna l'array events dell'utente con tutti gli eventi importati
      if (importedEvents.length > 0) {
        await userModel.findByIdAndUpdate(
          userId,
          {
            $push: {
              events: {
                $each: importedEvents.map((event) => event._id),
              },
            },
          },
          { new: true },
        );
      }

      const importedTitles = importedEvents
        .map((event) => event.title)
        .filter((title) => title !== undefined && title !== null);

      return importedTitles;
    } catch (error) {
      console.error("Error updating user events:", error);
      throw new Error("Failed to update user events");
    }
  };

  // Helper function per mappare lo status dell'evento
  const mapStatus = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "confirmed";
      case "TENTATIVE":
        return "tentative";
      case "CANCELLED":
        return "cancelled";
      default:
        return "confirmed";
    }
  };

  // Helper function per parsare le regole di ricorrenza
  const parseRRule = (rrule) => {
    const ruleObj = {};

    if (rrule.freq) {
      ruleObj.freq = rrule.freq.toLowerCase();
    }

    if (rrule.interval) {
      ruleObj.interval = rrule.interval;
    }

    if (rrule.until) {
      ruleObj.until = new Date(rrule.until);
    }

    if (rrule.count) {
      ruleObj.count = rrule.count;
    }

    if (rrule.bymonth) {
      ruleObj.bymonth = rrule.bymonth;
    }

    if (rrule.bymonthday) {
      ruleObj.bymonthday = rrule.bymonthday;
    }

    if (rrule.byday) {
      ruleObj.byday = rrule.byday.map((day) => {
        if (typeof day === "string") {
          return { day: day };
        }
        return {
          day: day.day,
          position: day.pos || 1,
        };
      });
    }

    if (rrule.bysetpos) {
      ruleObj.bysetpos = Array.isArray(rrule.bysetpos)
        ? rrule.bysetpos
        : [rrule.bysetpos];
    }

    if (rrule.wkst) {
      ruleObj.wkst = rrule.wkst;
    }

    return ruleObj;
  };

  const getUsernameForActivities = async (activities) => {
    if (!activities || activities.length === 0) return activities;

    for (let i = 0; i < activities.length; i++) {
      // Process the participants for the current (father) activity
      activities[i] = await getUsernameForActivity(activities[i]);
    }

    return activities;
  };

  const addDatesToActivity = (activity, lastDate) => {
    if (!activity) return activity;

    // If the activity has a due date, use it as the last date
    if (!activity.startDate) {
      activity.startDate = new Date(activity.dueDate);
    }

    // If the activity has subActivities, recursively process them
    if (activity.subActivities && activity.subActivities.length > 0) {
      for (let i = 0; i < activity.subActivities.length; i++) {
        activity.subActivities[i] = addDatesToActivity(
          activity.subActivities[i],
          lastDate,
        );
        lastDate = new Date(activity.subActivities[i].dueDate);
        lastDate.setDate(lastDate.getDate() + 1);
      }
    }

    return activity;
  };

  const addDatesToProjectActivities = (projects) => {
    if (!projects || projects.length === 0) return projects;

    for (let i = 0; i < projects.length; i++) {
      let lastDate = projects[i].startDate;
      // Add the starting and ending dates to the activities
      for (let j = 0; j < projects[i].activities.length; j++) {
        projects[i].activities[j] = addDatesToActivity(
          projects[i].activities[j],
          lastDate,
        );
        lastDate = new Date(projects[i].activities[j].dueDate);
        lastDate.setDate(lastDate.getDate() + 1);
      }
    }

    return projects;
  };

  const checkActivityFit = ({ startDate, deadline }, activity) => {
    if (!activity) {
      throw new Error("Activity must be provided");
    }

    if (!activity.title || !activity.startDate || !activity.dueDate) {
      throw new Error(
        `Activity must have a title, start date, and due date: ${JSON.stringify(activity)}`,
      );
    }

    // Check if the activity's due date is after the project's start date and before or on the project's deadline
    if (startDate && new Date(activity.dueDate) < new Date(startDate)) {
      throw new Error(
        `Activity due date must be after the project start date: ${startDate}`,
      );
    }

    if (new Date(activity.dueDate) > new Date(deadline)) {
      throw new Error(
        `Activity due date must be on or before the project deadline: ${deadline}`,
      );
    }

    if (new Date(activity.startDate) < new Date(startDate)) {
      throw new Error(
        `Activity start date must be after the project start date: ${startDate}`,
      );
    }

    // Ensure activity's start date is before its due date
    if (new Date(activity.startDate) > new Date(activity.dueDate)) {
      throw new Error(
        `Activity start date must be before its due date: ${activity.dueDate}`,
      );
    }

    // Validate assignees if provided
    if (activity.assignees && !Array.isArray(activity.assignees)) {
      throw new Error("Activity assignees must be an array if provided");
    }

    activity.subActivities?.forEach((subActivity) => {
      checkActivityFit(
        { startDate: activity.startDate, deadline: activity.dueDate },
        subActivity,
      );
    });
  };

  const convertUsernameToId = async (username) => {
    const user = await userModel.findOne({ username: username });
    if (!user) throw new Error("User not found");
    return user._id.toString();
  };

  const processActivityParticipants = async (
    activity,
    fatherActivityParticipants = [],
  ) => {
    if (!activity.participants || activity.participants.length === 0) {
      return activity;
    }

    // Filter out participants that are not in the fatherActivityParticipants array
    activity.participants = activity.participants.filter((participant) =>
      fatherActivityParticipants.includes(participant),
    );

    // if no subactivities, exit
    if (!activity.subActivities) return activity;

    for (let j = 0; j < activity.subActivities.length; j++) {
      activity.subActivities[j] = await processActivityParticipants(
        activity.subActivities[j],
        activity.participants,
      );
    }
    return activity;
  };

  const addActivityToProject = async (project, activity) => {
    checkActivityFit(project, activity);
    activity = await processActivityParticipants(activity, project.members);

    if (!project.activities) project.activities = [];
    project.activities.push(activity);
    return project;
  };

  const setPomodoroSettings = async (uid, settings) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      if (
        !settings.studyDuration ||
        !settings.shortBreakDuration ||
        !settings.longBreakDuration
      ) {
        throw new Error(
          "Settings must have studyDuration, shortBreakDuration, and longBreakDuration",
        );
      }

      user.pomodoro.settings = settings;
      const updatedUser = await user.save();
      return updatedUser.pomodoro.settings;
    } catch (error) {
      console.error("Error setting pomodoro settings:", error);
      throw error;
    }
  };

  const getUserById = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");
    return user;
  };

  // Music Player Section

  const getCurrentSong = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");
      if (!user.musicPlayer.songPlaying) {
        // First time user opens the music player
        const songs = await songModel.find({});
        if (songs.length === 0) {
          throw new Error("No songs in the database");
        }
        user.musicPlayer.songPlaying = songs[0]._id;
        await user.save();
      }

      const song = await songModel.findById(user.musicPlayer.songPlaying);
      if (!song) throw new Error("Song not found");

      return song;
    } catch (error) {
      console.error("Error getting current song:", error);
      throw error;
    }
  };

  const getNextSong = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const songs = await songModel.find({});
      if (songs.length === 0) {
        throw new Error("No songs in the database");
      }

      let currentSongIndex = songs.findIndex((song) =>
        song._id.equals(user.musicPlayer.songPlaying),
      );
      if (currentSongIndex === -1) {
        throw new Error("Error song index");
      }

      let nextSongIndex = (currentSongIndex + 1) % songs.length;
      const nextSong = songs[nextSongIndex];

      user.musicPlayer.songPlaying = nextSong._id;
      await user.save();

      const likedSongs = user.musicPlayer.likedSongs || [];
      const isLiked = likedSongs.includes(nextSong._id);

      return { ...nextSong.toObject(), isLiked };
    } catch (error) {
      console.error("Error getting next song:", error);
      throw error;
    }
  };

  const getPrevSong = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const songs = await songModel.find({});
      if (songs.length === 0) {
        throw new Error("No songs in the database");
      }

      let currentSongIndex = songs.findIndex((song) =>
        song._id.equals(user.musicPlayer.songPlaying),
      );
      if (currentSongIndex === -1) {
        throw new Error("Error song index");
      }
      let previousSongIndex = 0;
      if (currentSongIndex === 0) {
        previousSongIndex = songs.length - 1;
      } else {
        previousSongIndex = (currentSongIndex - 1) % songs.length;
      }
      user.musicPlayer.songPlaying = songs[previousSongIndex]._id;
      await user.save();

      return songs[previousSongIndex];
    } catch (error) {
      console.error("Error getting previous song:", error);
      throw error;
    }
  };

  const getRandomSong = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const songs = await songModel.find({});
      if (songs.length === 0) {
        throw new Error("No songs in the database");
      }

      let currentSongIndex = songs.findIndex((song) =>
        song._id.equals(user.musicPlayer.songPlaying),
      );

      if (currentSongIndex === -1) {
        throw new Error("Error song index");
      }

      let randomIndex = Math.floor(Math.random() * songs.length);
      while (randomIndex === currentSongIndex) {
        randomIndex = Math.floor(Math.random() * songs.length);
      }
      const randomSong = songs[randomIndex];

      user.musicPlayer.songPlaying = randomSong._id;
      await user.save();

      return randomSong;
    } catch (error) {
      console.error("Error getting random song:", error);
      throw error;
    }
  };

  // For now only for testing (to add song to the DB)
  const addSong = async (song) => {
    try {
      await songModel.create(song);
    } catch (error) {
      console.error("Error adding song:", error);
      throw error;
    }
  };

  const addLike = async (uid, songId) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const song = await songModel.findById(songId);
      if (!song) throw new Error("Song not found");

      if (!user.musicPlayer.likedSongs) user.musicPlayer.likedSongs = [];
      if (!user.musicPlayer.likedSongs.includes(song._id)) {
        user.musicPlayer.likedSongs.push(song._id);
      }
      await user.save();
    } catch (error) {
      console.error("Error adding like:", error);
      throw error;
    }
  };

  const removeLike = async (uid, songId) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const song = await songModel.findById(songId);
      if (!song) throw new Error("Song not found");

      if (!user.musicPlayer.likedSongs) user.musicPlayer.likedSongs = [];

      user.musicPlayer.likedSongs = user.musicPlayer.likedSongs.filter(
        (id) => id !== songId,
      );

      await user.save();
      return { success: true };
    } catch (error) {
      console.error("Error deleting like:", error);
      throw error;
    }
  };

  const addNotificationToInbox = async (uid, notification) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      user.inbox.push(notification);
      await user.save();
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  };

  const getInbox = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      return user.inbox;
    } catch (error) {
      console.error("Error getting inbox:", error);
      throw error;
    }
  };

  const deleteInbox = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      user.inbox = [];
      await user.save();
    } catch (error) {
      console.error("Error deleting inbox:", error);
    }
  };

  const deleteInboxById = async (uid, id) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      user.inbox = user.inbox.filter((notification) => notification._id != id);
      await user.save();
    } catch (error) {
      console.error("Error deleting inbox by ID:", error);
    }
  };

  const deleteInboxByLink = async (uid, link) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");
      console.log(user.inbox);
      user.inbox = user.inbox.filter(
        (notification) => notification.link != link,
      );
      console.log("deleted");
      await user.save();
    } catch (error) {
      console.error("Error deleting inbox by link:", error);
    }
  };

  // To be used by the pushNotificationWorker
  const getAllUserEvents = async () => {
    try {
      const users = await userModel.find().populate("events");
      return users;
    } catch (error) {
      console.error("Error getting all user events:", error);
      throw error;
    }
  };

  const createActivity = async (uid, activity, parentId = null) => {
    let user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!activity.name) {
      throw new Error("Activity must have a name");
    }

    if (!activity.dueDate) {
      throw new Error("Activity must have a dueDate");
    }

    if (!parentId) {
      console.log("Creating new activity", activity);
      const addedActivity = await activityModel.create({
        ...activity,
        uid: uid,
      });
      return addedActivity;
    }

    const parentActivity = await activityModel.findById(parentId);

    if (!parentActivity) {
      throw new Error("Parent activity not found");
    }

    if (parentActivity.uid.toString() !== uid.toString()) {
      throw new Error("Parent activity does not belong to user");
    }

    if (!parentActivity.subActivities) parentActivity.subActivities = [];

    parentActivity.subActivities.push({
      ...activity,
      uid: uid,
      parentId: parentId,
    });

    await parentActivity.save();

    return parentActivity;
    //return await getUsernameForActivity(parentActivity);
  };

  const getUsernameForActivity = async (activity) => {
    if (!activity.participants || activity.participants.length === 0) {
      return activity;
    }

    await activity.populate("participants", "username");
    await activity.populate("subActivities.participants", "username");

    activity = activity.toObject();

    activity.participants = activity.participants.map(
      (participant) => participant.username,
    );

    for (let i = 0; i < activity.subActivities?.length; i++) {
      activity.subActivities[i].participants = activity.subActivities[
        i
      ].participants.map((participant) => participant.username);
    }

    return activity;
  };

  const getActivities = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    let activities = await activityModel.find({ uid: uid });
    // for each activiteis, get the participants and subactivities
    // activities = await getUsernameForActivities(activities);

    return activities;
  };

  // delete activity from user or project
  const deleteActivity = async (uid, activityId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const activity = await activityModel.findById(activityId);
    if (!activity) throw new Error("Activity not found");

    await userModel.findByIdAndUpdate(uid, {
      $pull: { activities: { _id: activityId } },
    });

    // Delete the activity related to this Id
    const deletedActivity = await activityModel.findByIdAndDelete(activityId);

    return deletedActivity.lean();
  };

  const modifyActivity = async (uid, activity, activityId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const oldActivity = await activityModel.find({ _id: activityId, uid: uid });
    if (!oldActivity) throw new Error("Old Activity not found");

    activity.participants = undefined;

    await activityModel.updateOne(
      { _id: activityId, uid: uid },
      { ...activity, uid: uid },
    );

    return await activityModel.findById(activityId)?.lean();
  };

  const chatService = {
    async getUserMessages(uid) {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      return await chatModel.find({
        $or: [{ sender: uid }, { receiver: uid }],
      });
    },

    async readMessage(messageId) {
      const message = await chatModel.findByIdAndUpdate(
        messageId,
        {
          status: "read",
        },
        { new: true },
      );
      if (!message) throw new Error("Message not found");
      message.receiver = await userService.fromIdtoUsername(message.receiver);
      message.sender = await userService.fromIdtoUsername(message.sender);
      return message;
    },

    async sendMessage(senderId, receiverUsername, message) {
      const sender = await userModel.findById(senderId);
      if (!sender) throw new Error("Sender not found");

      const receiver = await userModel.findOne({ username: receiverUsername });
      if (!receiver) throw new Error("Receiver not found");

      if (!message) throw new Error("Message cannot be empty");

      const now = await getDateTime();

      // date is automatically set to the current date
      const newMessage = await chatModel.create({
        sender: senderId,
        receiver: receiver._id,
        message: message,
        createdAt: now,
        status: "sent",
      });

      return {
        createdAt: newMessage.createdAt,
        message: newMessage.message,
        sender: sender.username,
        receiver: receiverUsername,
      };
    },

    async addChat(senderId, receiverUsername) {
      const sender = await userModel.findById(senderId);
      if (!sender) throw new Error("Sender not found");

      const receiver = await userModel.findOne({ username: receiverUsername });
      if (!receiver) throw new Error("Receiver not found");

      await this.sendMessage(
        senderId,
        receiverUsername,
        "You started a new chat",
      );

      return this.getChats(senderId);
    },

    async getChat(senderId, receiverUsername) {
      const sender = await userModel.findById(senderId);
      if (!sender) throw new Error("Sender not found");

      const receiver = await userModel.findOne({ username: receiverUsername });
      if (!receiver) throw new Error("Receiver not found");

      let chat = await chatModel
        .find({
          $or: [
            { sender: senderId, receiver: receiver._id },
            { sender: receiver._id, receiver: senderId },
          ],
        })
        .sort({ createdAt: 1 });

      // update the chat to return username instead of id
      return chat.map((message) => {
        return {
          sender:
            message.sender.toString() === senderId
              ? sender.username
              : receiverUsername,
          receiver:
            message.receiver.toString() === senderId
              ? sender.username
              : receiverUsername,
          message: message.message,
          createdAt: message.createdAt,
        };
      });
    },

    // get all users that the current user has chatted with and the last message
    async getChats(uid, limit = 20) {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      const messages = await chatModel.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(uid) },
              { receiver: new mongoose.Types.ObjectId(uid) },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$sender", new mongoose.Types.ObjectId(uid)] },
                "$receiver",
                "$sender",
              ],
            },
            message: { $first: "$message" },
            createdAt: { $first: "$createdAt" },
            sender: { $first: "$sender" },
          },
        },
        {
          $limit: limit,
        },
      ]);

      const otherUserIds = messages.map((m) => m._id);
      const otherUsers = await userModel.find({ _id: { $in: otherUserIds } });

      const chats = messages
        .map((msg) => {
          const otherUser = otherUsers.find((u) => u._id.equals(msg._id));
          const sender = msg.sender.toString() === uid ? user : otherUser;
          return otherUser
            ? {
              uid: otherUser._id,
              username: otherUser.username,
              lastMessage: { ...msg, sender: sender.username },
              avatar: otherUser.avatar,
            }
            : null;
        })
        .filter((chat) => chat !== null);

      return chats;
    },

    /* end Messages */
  };

  const friendService = {
    async get(id) {
      const user = await userModel.findById(id);
      if (!user) throw new Error("User not found");
      return await userModel.find({ _id: { $in: user.friends } });
    },

    async add(uid, friendUsername) {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");
      const friend = await userModel.findOne({ username: friendUsername });
      if (!friend) throw new Error("Friend's user not found");
      if (uid === friend._id)
        throw new Error("Cannot add yourself as a friend");
      if (user.friends.includes(friend._id))
        throw new Error("User is already a friend");
      user.friends.push(friend._id);
      await user.save();
      return friend;
    },

    async delete(uid, friendId) {
      if (uid === friendId)
        throw new Error("Cannot delete yourself as a friend");
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");
      if (!user.friends.includes(friendId))
        throw new Error("User is not a friend");
      const friend = await userModel.findById(friendId);
      if (!friend) throw new Error("Friend's user not found");
      user.friends = user.friends.filter((f) => f.toString() !== friendId);
      await user.save();
      return user.friends;
    },
  };

  const userService = {
    async changeAvatar(uid, avatar) {
      return await userModel.findByIdAndUpdate(
        uid,
        { avatar: avatar },
        { new: true },
      );
    },
    async getAllUsernames() {
      return await userModel.find({}, { username: 1 });
    },
    async fromIdsToUsernames(ids) {
      const users = await userModel.find({ _id: { $in: ids } });
      return users.map((user) => user.username);
    },
    async fromUsernamesToIds(usernames) {
      const users = await userModel.find({ username: { $in: usernames } });
      return users.map((user) => user._id.toString());
    },
    async fromUsernameToId(username) {
      const user = await userModel.findOne({ username: username });
      if (!user) throw new Error("User not found");
      return user._id.toString();
    },
    async fromIdtoUsername(id) {
      const user = await getUserById(id);
      return user.username;
    },
    async getByUsername(username) {
      const user = await userModel.findOne({ username });
      if (!user) throw new Error("User not found");
      return user;
    },
    async getById(id) {
      const user = await userModel
        .findById(id, "-__v -password -createdAt -updatedAt")
        .populate({
          path: "participatingEvents",
          populate: {
            path: "participants",
            select: "username _id",
          },
        })
        .populate({
          path: "events",
          populate: {
            path: "participants",
            select: "username _id",
          },
        })
        .populate("projects")
        .populate({
          path: "projects",
          populate: {
            path: "members",
            select: "username _id",
          },
        })
        .populate({
          path: "projects",
          populate: {
            path: "creator",
            select: "username _id avatar",
          },
        })
        .populate({
          path: "friends",
          model: "Users",
          // select mail e username
          select: "email username avatar",
        })
        .lean(); // return plain js object instead of mongoose object (faster)
      if (!user) throw new Error("User not found");

      return user;
    },
    async updateGps(id, gps) {
      const user = await userModel.findById(id);
      if (!user) throw new Error("User not found");
      if (!gps.latitude || !gps.longitude) {
        throw new Error("Invalid GPS data");
      }

      user.position = {
        latitude: gps.latitude,
        longitude: gps.longitude,
      };
      await user.save();
      return user.position;
    },
    async getGps(id) {
      const user = await userModel.findById(id);
      if (!user) throw new Error("User not found");
      return user.position;
    },
    async update(id, data) {
      const user = await userModel.findByIdAndUpdate(id, data, { new: true });
      if (!user) throw new Error("User not found");
      return user;
    },
    async find(query) {
      return await userModel.find(query);
    },
  };

  const projectService = createProjectService(models, {
    checkActivityFit,
    userService,
    addDatesToProjectActivities,
    addActivityToProject,
    getDateTime,
  });

  const isAdmin = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (user.role === 'admin') return true;
    else return false;
  };

  return {
    login,
    register,
    deleteAccount,
    updateUsername,
    lostPassword,
    verifyResetToken,
    updateEmail,
    updatePassword,
    changeDateTime,
    postNote,
    getNotes,
    getNoteById,
    removeNoteById,
    createEvent,
    getEvent,
    getEvents,
    modifyEvent,
    dodgeEvent,
    participateEvent,
    rejectEvent,
    importEvents,
    deleteEvent,
    getParticipantsUsernames,
    getResource,
    bookResource,
    unBookResource,
    addResource,
    deleteResource,
    getUserById,
    setPomodoroSettings,
    getCurrentSong,
    getNextSong,
    getPrevSong,
    getRandomSong,
    addSong,
    addNotificationToInbox,
    getInbox,
    deleteInbox,
    deleteInboxById,
    deleteInboxByLink,
    getDateTime,
    verifyEmail,
    isVerified,
    createActivity,
    getActivities,
    deleteActivity,
    modifyActivity,
    chatService,
    friendService,
    addLike,
    removeLike,
    userService,
    saveSubscriptions,
    deleteSubscription,
    getSubscriptions,
    getNotificationsStatus,
    disableNotifications,
    enableNotifications,
    getAllUserEvents,
    projectService,
    getUsernameForActivities,
    isAdmin,
  };
}
