const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

const initWebRoutes = (app) => {
  // Định nghĩa route
  router.post("/api/create-task", taskController.createTask);
  router.get("/api/board", taskController.getBoardData);
  router.put("/api/update-task/:id", taskController.updateTask);
  router.delete("/api/delete-task/:id", taskController.deleteTask);
  router.put(
    "/api/update-task-position/:idTask",
    taskController.updateTaskPosition
  );
  router.post("/api/create-column", taskController.createColumn);
  return app.use("/", router);
};

module.exports = initWebRoutes;
