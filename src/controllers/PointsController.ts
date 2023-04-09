import { Request, Response } from "express";
import knex from "../database/connection";
import fs from 'fs';
import crypto from 'crypto';

class PointsController {
  async index(request: Request, response: Response) {
    const { items } = request.query;

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((item) => {
      return {
        ...item,
        image_url: `http://187.16.236.89:7200/uploads/${item.image}`,
      };
    });

    return response.json(serializedPoints);
  }

  async getByCpf(request: Request, response: Response) {
    const { cpf } = request.params;

    const points = await knex("points")
    .where("cpf", cpf);

    const pointsWithItems = await Promise.all(points.map(async (item) => {
      const items = await knex("items")
        .join("point_items", "items.id", "=", "point_items.item_id")
        .where("point_items.point_id", item.id)
        .select("items.title");

      return {
        ...item,
        items
      };
    }));

    const serializedPoints = pointsWithItems.map((item) => {
      return {
        ...item,
        image_url: `http://192.168.0.13:3333/uploads/${item.image}`,
      };
    });

    return response.json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return response.status(400).json({ message: "Report not found." });
    }

    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    const serializedPoint = {
      ...point,
      image_url: `http://187.16.236.89:7200/uploads/${point.image}`,
    };

    return response.json({ point: serializedPoint, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      cpf,
      latitude,
      longitude,
      items
    } = request.body;

    const imageName = crypto.randomBytes(10).toString('hex');

    const image = request.body.image.split(';base64,').pop();

    const trx = await knex.transaction();

    const point = {
      image: `${imageName}.jpeg`,
      name,
      cpf,
      latitude,
      longitude,
    };

    fs.writeFile(`uploads/${imageName}.jpeg`, image, 'base64', function(err) {
      console.log(err);
    });

    const insertedIds = await trx("points").insert(point);

    const point_id = insertedIds[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx("point_items").insert(pointItems);

    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }

  async updateStatus(request: Request, response: Response) {
    const { id, status } = request.params;

    const point = await knex("points")
      .where("id", id)
      .where('status', 'pending')
      .first();

    const trx = await knex.transaction();

    if (!point) {
      return response.status(400).json({ message: "Report not found." });
    }

    point.status = status;

    await trx("points")
      .where("id", id)
      .update({status});

    await trx.commit();

    return response.json(point);
  }
}

export default PointsController;
