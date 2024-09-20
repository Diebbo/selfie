// database calls for the application
import { mongoose } from "mongoose";

// db Models
import { userSchema } from "./models/user-model.js";
import { timeSchema } from "./models/time-model.js";
import { eventSchema } from "./models/event-model.js";
import { projectSchema } from "./models/project-model.js";

export async function createDataBase() {
  const uri =
    "mongodb+srv://test:test@cluster0.iksyo9p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  // creating a model
  const timeModel = mongoose.model("Times", timeSchema);
  const userModel = mongoose.model("Users", userSchema);
  const eventModel = mongoose.model("Event", eventSchema);
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
  }

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
      return updatedUser.notes[updatedUser.notes.length - 1]; // Return the newly added note
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }

  const getNotes = async (uid) => {
    var user = await userModel.findById(uid);
    if (!user) throw new Error("User not found");
    return user.notes;
  }

  const getEvents = async (uid) => {
    return eventModel.find({ uid: uid });
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
    
    return addedEvent;
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
          if (i > 0 && project.activities[i-1].end > activity.start) {
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

  return { login, register, changeDateTime, createEvent, createNote, getNotes, getEvents, deleteEvent, partecipateEvent, getProjects };
}
