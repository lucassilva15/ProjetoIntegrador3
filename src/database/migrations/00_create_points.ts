import Knex from 'knex';

export async function up(knex: Knex) {
 return knex.schema.createTable('points', table => {
    table.increments('id').primary();
    table.string('image').notNullable();
    table.string('name').notNullable();
    table.string('cpf').notNullable();
    table.string('status').notNullable().defaultTo('pending');
    table.decimal('latitude').notNullable();
    table.decimal('longitude ').notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('points')
}
