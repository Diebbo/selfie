// database calls for the application
import { mongoose } from "mongoose";

// db Models
import { userSchema } from "./models/user-model.js";
import { timeSchema } from "./models/time-model.js";
import { eventSchema } from "./models/event-model.js";
import { activitySchema } from "./models/event-model.js";
import { projectSchema } from "./models/project-model.js";
import { songSchema } from "./models/song-model.js";

export async function createDataBase() {
  const uri =
    "mongodb+srv://test:test@cluster0.iksyo9p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  // creating a model
  const timeModel = mongoose.model("Times", timeSchema);
  const userModel = mongoose.model("Users", userSchema);
  const eventModel = mongoose.model("Event", eventSchema);
  const songModel = mongoose.model("Song", songSchema);
  const projectModel = mongoose.model("Projects", projectSchema);
  const activityModel = mongoose.model("Activity", activitySchema);

  mongoose.connect(uri);

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

    const res = await userModel.create({ ...user });
    return res;
  };

  const changeDateTime = async (time) => {
    let filter = { name: "timemachine" };
    let update = { time: time };
    const res = await timeModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });
    return res;
  };

  const getDateTime = async () => {
    const res = await timeModel.findOne({ name: "timemachine" });
    if (!res) throw new Error("Time not found");
    return new Date(res.time);
  };

  const postNote = async (uid, note) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      if (!user.notes) user.notes = [];
      if (!note.title || !note.content) {
        throw new Error("Note must have a title and content");
      }
      if (!note.tags) note.tags = [];
      note.date = new Date(); // update the last modified date with current date

      if (note._id) { // Modify existing note
        const noteId = new mongoose.Types.ObjectId(note._id); // convert _id field from a string to ObjectID to compare with ids in the db
        const noteIndex = user.notes.findIndex((n) => n._id.equals(noteId));
        if (noteIndex !== -1) {
          // Update existing note
          user.notes[noteIndex] = {
            ...user.notes[noteIndex].toObject(),
            ...note,
            _id: noteId // Ensure we keep the original ObjectId
          };
        } else {
          throw new Error("Note with provided ID not found");
        }
      } else { // New note
        user.notes.push(note);
      }

      await user.save();
      return note;
    } catch (error) {
      console.error(`Error posting note for user ${uid}:`, error);
      throw error;
    }
  };


  const getNotes = async (uid, fields = null) => {
    let projection = { 'notes._id': 1 }; // Sempre includi l'ID della nota

    if (Array.isArray(fields) && fields.length > 0) {
      fields.forEach(field => {
        projection[`notes.${field}`] = 1;
      });
    } else {
      projection = { notes: 1 }; // Se fields non è specificato o è vuoto, prendi tutte le note
    }

    const user = await userModel.findById(uid, projection);
    if (!user) throw new Error("User not found");

    return user.notes.map(note => {
      if (Array.isArray(fields) && fields.length > 0) {
        const filteredNote = { _id: note._id };
        fields.forEach(field => {
          if (note[field] !== undefined) {
            filteredNote[field] = note[field];
          }
        });
        return filteredNote;
      } else {
        return note.toObject(); // Ritorna tutti i campi della nota
      }
    });
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

      const noteIndex = user.notes.findIndex(note => note._id.toString() === noteId);
      if (noteIndex === -1) throw new Error("Note not found");

      user.notes.splice(noteIndex, 1);
      await user.save();

      return { message: "Note removed successfully" };
    } catch (error) {
      console.error("Error removing note:", error);
      throw error;
    }
  };


  const getEvents = async (uid) => {
    var user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    var createdEvents = await eventModel.find({ _id: { $in: user.events } });
    var partecipatingEvents = await eventModel.find({ _id: { $in: user.participatingEvents } });

    return { createdEvents: createdEvents, partecipatingEvents: partecipatingEvents };
  }

  const createEvent = async (uid, event) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not foun");

    // Validate event object
    if (!event.title) {
      throw new Error("Event must have a title");
    }

    if (!event.dtstart || !event.dtend) {
      throw new Error("Event must have a date");
    }
    // add event to the user's events
    var addedEvent = await eventModel.create({ ...event, uid: uid });
    user.events.push(addedEvent._id);
    await user.save();

    // invite all users in the event
    var err = "Invited users not found: ";
    if (event.invitedUsers) {
      event.invitedUsers.forEach(async (invitedUser) => {
        const invitedUserDoc = await userModel.findOne({ username: invitedUser });
        if (!invitedUserDoc) err += invitedUser + ", ";
        else {
          invitedUserDoc.invitedEvents.push(addedEvent._id);
          await invitedUserDoc.save();
        }
      });
    }
    if (err !== "Invited users not found: ") throw new Error(err);

    // generate notifications for all the invited users
    generateNotificationsForEvent(addedEvent, [user]);

    return addedEvent;
  }

  function generateNotifications({ eventId, activityId, startDate, notification, title }, users) {
    let notificationTimes = [];

    const eventStartDate = new Date(startDate);  // Start of the event
    let notificationDate = new Date(notification.fromDate);  // First notification date

    const freq = notification.repetition.freq;
    const interval = notification.repetition.interval;

    // Generate notification times until the event start
    while (notificationDate < eventStartDate) {
      notificationTimes.push(new Date(notificationDate));  // Push a copy of the notification date

      // Update notificationDate based on the frequency
      if (freq === 'daily') {
        notificationDate.setDate(notificationDate.getDate() + interval);
      } else if (freq === 'weekly') {
        notificationDate.setDate(notificationDate.getDate() + 7 * interval);
      } else if (freq === 'monthly') {
        notificationDate.setMonth(notificationDate.getMonth() + interval);
      } else if (freq === 'yearly') {
        notificationDate.setFullYear(notificationDate.getFullYear() + interval);
      }
    }

    // Generate a notification for each user about the event
    users.forEach(async (user) => {
      // Ensure there are enough notification times
      notificationTimes.forEach(async (notificationTime) => {
        let addingNotification = {
          fromEvent: eventId,
          fromTask: activityId,
          when: notificationTime,  // The calculated notification time
          title: notification.title || title,  // Fallback to event title if notification title is missing
          method: notification.type || 'email'  // Fallback to 'email' if method is missing
        };
        user.inboxNotifications.push(addingNotification);
      });

      user.inboxNotifications.sort((a, b) => a.when - b.when);

      await user.save();
    });
  }

  function generateNotificationsForEvent(event, users) {
    return generateNotifications({
      eventId: event._id,
      startDate: event.dtstart,
      notification: event.notification,
      title: event.title
    }, users);
  }

  function generateNotificationsForActivity(activity, users) {
    return generateNotifications({
      activityId: activity._id,
      startDate: activity.dueDate,
      notification: activity.notification,
      title: activity.name
    }, users);
  }

  const deleteEvent = async (uid, eventId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const event = await eventModel.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (event.uid.toString() !== uid.toString()) throw new Error("Event does not belong to user");

    // Remove event from user's events
    await userModel.findByIdAndUpdate(uid, { $pull: { events: eventId } });

    // Remove event from invited and participating users
    await userModel.updateMany(
      { $or: [{ invitedEvents: eventId }, { participatingEvents: eventId }] },
      { $pull: { invitedEvents: eventId, participatingEvents: eventId } }
    );

    // Delete the event
    await eventModel.findByIdAndDelete(eventId);

    // Remove any notifications related to this event
    await userModel.updateMany(
      { 'inboxNotifications.fromEvent': eventId },
      { $pull: { inboxNotifications: { fromEvent: eventId } } }
    );
  };

  const modifyEvent = async (uid, event, eventId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const oldEvent = await eventModel.findById(eventId);
    if (!oldEvent) throw new Error("Event not found");

    if (oldEvent.uid.toString() !== uid.toString()) throw new Error("Event does not belong to user");

    try {
      // Sovrascrivo l'intero evento dello user con il nuovo evento modificato
      const replacedEvent = await eventModel.replaceOne({ _id: eventId }, { ...event, uid: uid });
      if (replacedEvent.modifiedCount === 0) {
        throw new Error("Event replace failed");
      }

      // Aggiorno le notifiche di ogni partecipante
      const updatedUsers = await userModel.updateMany(
        { $or: [{ invitedEvents: eventId }, { participatingEvents: eventId }] },
        { $set: { inboxNotifications: { fromEvent: eventId } } }
      );

      return { replacedEvent, updatedUsers };

    } catch (e) {
      throw new Error("Event did not get changed: " + e.message);
    }
  };

  const partecipateEvent = async (uid, eventId) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const event = await eventModel.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check if user is already participating
    if (user.participatingEvents.includes(eventId)) throw new Error("User is already participating in this event");
    user.participatingEvents.push(eventId);
    user.invitedEvents = user.invitedEvents.filter((e) => e.toString() !== eventId.toString());
    await user.save();

    // add notifications for the event
    generateNotificationsForEvent(event, [user]);

    return user.invitedEvents;
  };

  const getProjects = async (uid) => {
    // ritorno tutti i progetti creati dall'utente o a cui partecipa
    return await projectModel.find({ $or: [{ creator: uid }, { members: uid }] });
  };

  const createProject = async (uid, project) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    // Validate project object
    if (!project.title || !project.description) {
      throw new Error("Project must have a title and description");
    }

    // check if all the sub activities are valid:
    // the start date must be before the end date, and the start date must be after the previous end date
    var err = "Invalid sub activities: ";
    if (project.activities) { // TODO: check if this is correct
      for (let i = 0; i < project.activities.length; i++) {
        const activity = project.activities[i];
        if (!activity.title || !activity.description || !activity.start || !activity.end) {
          err += activity.title + ", ";
        } else {
          if (i > 0 && project.activities[i - 1].end > activity.start) {
            err += activity.title + ", ";
          }
        }
      }
    }
    if (err !== "Invalid sub activities: ") throw new Error(err);

    // add project to the user's projects
    var addedProject = await projectModel.create(project);

    user.projects.push(addedProject._id);
    await user.save();

    // add all the members to the project
    err = "Members not found: ";
    if (project.members) {
      project.members.forEach(async (member) => {
        const memberDoc = await userModel.findOne({ username: member });
        if (!memberDoc) err += member + ", ";
        else {
          memberDoc.projects.push(addedProject._id);
          await memberDoc.save();
        }
      });
    }
    if (err !== "Members not found: ") throw new Error("Project created but " + err);

    return addedProject;
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
          "Settings must have studyDuration, shortBreakDuration, and longBreakDuration"
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
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  };

  const get = async () => {
    try {
      const songs = await songModel.find({});
      return songs;
    } catch (error) {
      console.error("Error getting songs:", error);
      throw error;
    }
  };


  const getCurrentSong = async (uid) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");
      if (!user.musicPlayer.songPlaying) {
        // se non c'è salvato nessun ID per la current song, allora inserisci l'id del primo elemento del DB song-model
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

      let currentSongIndex = songs.findIndex(song => song._id.equals(user.musicPlayer.songPlaying));
      if (currentSongIndex === -1) {
        throw new Error("Error song index");
      }
      console.log("currentSongIndex", currentSongIndex);
      let nextSongIndex = (currentSongIndex + 1) % songs.length;
      user.musicPlayer.songPlaying = songs[nextSongIndex]._id;
      await user.save();

      return songs[nextSongIndex];
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

      let currentSongIndex = songs.findIndex(song => song._id.equals(user.musicPlayer.songPlaying));
      if (currentSongIndex === -1) {
        throw new Error("Error song index");
      }
      console.log("currentSongIndex", currentSongIndex);
      let previousSongIndex = 0;
      if (currentSongIndex === 0) {
        previousSongIndex = songs.length - 1;
      }
      else {
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

  // For now only for testing (to add song to the DB)
  const addSong = async (uid, song) => {
    try {
      const result = await songModel.create(song);
    } catch (error) {
      console.error("Error adding song:", error);
      throw error;
    }
  };

  const getNextNotifications = async () => {
    const users = await userModel.find({});
    let notifications = { email: [], pushNotification: [] };
    const currentDateTime = await getDateTime();

    await Promise.all(users.map(async (user) => {
      if (user.inboxNotifications.length > 0) {
        const notification = user.inboxNotifications[0];

        if (new Date(notification.when) - currentDateTime <= 30000) {
          let event, activity, notificationDescription;

          if (notification.fromEvent) {
            event = await eventModel.findById(notification.fromEvent);
            notificationDescription = 'reminder for event taking place on ' + event.dtstart;
          } else {
            activity = await activityModel.findById(notification.fromTask);
            notificationDescription = 'reminder for activity due on ' + activity.dueDate;
          }
          // Override the default notification description if it's provided
          notificationDescription = notification.description || notificationDescription;

          let removedNotification = user.inboxNotifications.shift();

          if (removedNotification.method === 'email') {
            notifications.email.push({
              to: user.email,
              subject: removedNotification.title,
              body: notificationDescription
            });
          } else {
            notifications.pushNotification.push({
              username: user.username,
              title: removedNotification.title,
              body: notificationDescription
            });
          }

          await user.save();
        }
      }
    }));

    return notifications;
  };

  const createActivity = async (uid, activity) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    if (!activity.name) {
      throw new Error("Event must have a name");
    }

    if (!activity.dueDate) {
      throw new Error("Event must have a dueDate");
    }

    var addedActivity = await activityModel.create({ ...activity, uid: uid });
    user.activities.push(addedActivity._id);
    await user.save();

    // add notifications for the activity
    generateNotificationsForActivity(addedActivity, [user]);

    return addedActivity;
  };

  const getActivities = async (uid) => {
    const user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");

    const activity = await activityModel.find({ _id: { $in: user.activities } });

    return { activity: activity };
  }

  return { login, register, changeDateTime, createEvent, modifyEvent, postNote, getNotes, getNoteById, removeNoteById, getEvents, deleteEvent, partecipateEvent, getProjects, getUserById, createProject, setPomodoroSettings, getCurrentSong, getNextSong, getPrevSong, addSong, getNextNotifications, getDateTime, createActivity, getActivities };
}
