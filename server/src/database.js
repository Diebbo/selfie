// database calls for the application
import { mongoose } from "mongoose";

// db Models
import { userSchema } from "./models/user-model.js";
import { timeSchema } from "./models/time-model.js";
import { eventSchema } from "./models/event-model.js";
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

  const createNote = async (uid, note) => {
    try {
      const user = await userModel.findById(uid);
      if (!user) throw new Error("User not found");

      // Validate note object
      if (!note.title || !note.content) {
        throw new Error("Note must have a title and content");
      }

      // Add current date if not provided
      if (!note.date) {
        note.date = new Date();
      }

      user.notes.push(note);
      const updatedUser = await user.save();

      let num_notes = updatedUser.notes.length;
      return updatedUser.notes[num_notes - 1]; // Return the newly added note
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  };

  const getNotes = async (uid) => {
    var user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");
    return user.notes;
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
    if (!user) throw new Error("User not found");

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
    generateNotifications(addedEvent, [user]);

    return addedEvent;
  }

  function generateNotifications(event, users) {
    let notificationTimes = [];

    if (event.notification) {
      const eventStartDate = new Date(event.dtstart);  // Start of the event
      let notificationDate = new Date(event.notification.fromDate);  // First notification date

      const freq = event.notification.repetition.freq;
      const interval = event.notification.repetition.interval;

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
    }

    // Generate a notification for each user about the event
    users.forEach(async (user) => {
      // Ensure there are enough notification times
      notificationTimes.forEach(async (notificationTime) => {
        user.inboxNotifications.push({
          fromEvent: event._id,
          when: notificationTime,  // The calculated notification time
          title: event.notification.title || event.title,  // Fallback to event title if notification title is missing
          method: event.notification.type || 'email'  // Fallback to 'email' if method is missing
        });
      });

      user.inboxNotifications.sort((a, b) => a.when - b.when);

      await user.save();
    });
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
    generateNotifications(event, [user]);

    return user.invitedEvents;
  }

  const getProjects = async (uid) => {
    // ritorno tutti i progetti creati dall'utente o a cui partecipa
    return await projectModel.find({ $or: [{ creator: uid }, { members: uid }] });
  }

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
    var err = "Members not found: ";
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
  }

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

  const addSong = async (uid, song) => {
    try {
      const result = await songModel.create(song);
    } catch (error) {
      console.error("Error adding song:", error);
      throw error;
    }
  };

  const getNextNotifications = async () => {
    // get from the inboxNotifications for each user the first notification
    // if less than 30 seconds from the date of the notification, pop it from the array
    const users = await userModel.find({});

    // Prepare notifications array
    let notifications = { email: [], pushNotification: [] };

    // Get current date and time
    const currentDateTime = await getDateTime(); // assuming this gives current DateTime

    users.forEach(async (user) => {
      // Check if user has any inbox notifications
      if (user.inboxNotifications.length > 0) {
        const notification = user.inboxNotifications[0]; // Get the first notification

        // Check if notification is within 30 seconds or less from current time
        if (new Date(notification.when) - currentDateTime <= 30000) {
          // Pop the notification and save the user
          let removedNotification = user.inboxNotifications.shift(); // Remove the first notification

          // Add notification to the appropriate queue (email or push)
          if (removedNotification.method === 'email') {
            notifications.email.push({
              email: user.email,
              title: removedNotification.title
            });
          } else {
            notifications.pushNotification.push({
              username: user.username,
              title: removedNotification.title
            });
          }

          await user.save(); // Await user save to ensure changes are persisted
        }
      }
    });
    return notifications;
  };



  return { login, register, changeDateTime, createEvent, createNote, getNotes, getEvents, deleteEvent, partecipateEvent, getProjects, getUserById, createProject, setPomodoroSettings, getCurrentSong, getNextSong, getPrevSong, addSong, getNextNotifications, getDateTime };
}
