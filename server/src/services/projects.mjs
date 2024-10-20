export default function createProjectService(models, lib) {
  const { projectModel } = models;
  return {
    updateProject(uid, projectId, project) {
      const dbProj = projectModel.findOne({ _id: projectId, creator: uid });
      if (!dbProj) throw new Error("Progetto non trovato");

      // validate activities
      for (let i = 0; i < project.activities.length; i++) {
        const activity = project.activities[i];
        lib.checkActivityFitInProject(project, activity);
      }


      const result = projectModel.findOneAndUpdate({ _id: projectId, creator: uid }, project, { new: true });
      return result;
    },
    delete(uid, projectId) {
      const result = projectModel.deleteOne({ _id: projectId, creator: uid });
      if (!result) throw new Error("Errore nell'eliminazione del progetto");
      return result.lean();
    }
  };
}

