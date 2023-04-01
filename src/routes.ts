import express from "express";
import { celebrate, Joi } from "celebrate";
import multer from "multer";
import multerConfig from "./config/multer";
import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";
import RewardsController from "./controllers/RewardsController";

const routes = express();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();
const rewardController = new RewardsController()

/** Items */
routes.get("/items", itemsController.index);

/** Points */
routes.get("/reports", pointsController.index);
routes.get("/report/:id", pointsController.show);
routes.get("/reports/:cpf", pointsController.getByCpf);

routes.put("/report/:id/status/:status", pointsController.updateStatus);

/** Rewards */
routes.get("/rewards/:cpf", rewardController.index);

/** Create Point */
routes.post(
  "/report",
  upload.single("image"),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        cpf: Joi.string().required().min(11),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        items: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  pointsController.create
);

export default routes;
