"use strict";

/**
 * project controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::project.project", ({ strapi }) => ({
  // Override the default delete method
  async delete(ctx) {
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest("Project ID is required");
    }

    try {
      // First, get the project with its tasks
      const project = await strapi.entityService.findOne(
        "api::project.project",
        id,
        {
          populate: ["tasks"],
        }
      );

      if (!project) {
        return ctx.notFound("Project not found");
      }

      // Delete all tasks belonging to this project
      if (project.tasks && project.tasks.length > 0) {
        console.log(`Deleting ${project.tasks.length} tasks for project ${id}`);
        for (const task of project.tasks) {
          await strapi.entityService.delete("api::task.task", task.id);
        }
      }

      // Delete the project itself
      await strapi.entityService.delete("api::project.project", id);

      console.log(`Project ${id} and its tasks deleted successfully`);

      // Return success response
      ctx.send({
        message: "Project and related tasks deleted successfully",
        deletedProject: id,
        deletedTasks: project.tasks?.length || 0,
      });
    } catch (err) {
      console.error("Error deleting project:", err);
      ctx.throw(500, err);
    }
  },
}));
