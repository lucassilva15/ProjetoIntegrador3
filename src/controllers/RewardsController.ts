import { Request, Response } from "express";
import knex from "../database/connection";

class RewardsController {
  async index(request: Request, response: Response) {
    const { cpf } = request.params;

    const points = await knex("points")
    .where("cpf", cpf)
    .where('status', 'accepted');

    const bonuses = points.length * 3;

    return response.json({
      points: bonuses
    });
  }
}

export default RewardsController;
