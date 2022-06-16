class Contenedor {
    constructor(knex, table) {
        this.knex = knex;
        this.table = table;
        this.knex.schema.hasTable(this.table).then((exists) => {
            if (!exists) {
                this.knex.schema
                    .createTable(this.table, (table) => {
                        table.increments("id");
                        table.integer("codigo");
                        if (this.table === "messages") {
                            table.string("author");
                            table.string("fecha");
                            table.string("newMsj");
                        } else if (this.table === "productos") {
                            table.string("timestamp");
                            table.string("nombre");
                            table.string("descripcion");
                            table.float("precio");
                            table.string("foto");
                            table.integer("stock");
                        }
                    })
                    .then(() =>
                        console.log(`Tabla  ${this.table.toUpperCase()} creada`)
                    )
                    .catch((err) => {
                        console.log("Error en constructor: ", err);
                        throw err;
                    });
            } else {
                console.log(`Tabla ${this.table.toUpperCase()} ya existe`);
            }
        });
    }

    async getAll() {
            try {
                return await this.knex.from(this.table).select("*");
            } catch (err) {
                console.log("Error en getAll: ", err);
                throw err;
            }
        }

    async save(new_article) {
        try {
            let element = await this.knex(this.table)
                .insert(new_article)
                .then((element) => element);
            // return element;
        } catch (err) {
            console.log("Error en save: ", err);
            throw err;
        }
    }

    async getById(id) {
            try {
                const ele = await this.knex(this.table).where("id", id).select("*");
            if (ele.length <= 0) return null;
            else return ele;
            } catch (err) {
                console.log("Error en getById: ", err);
                throw err;
            }
        }

    async deleteById(id) {
        try {
            await this.knex(this.table).where("id", id).del();
        } catch (err) {
            console.log("Error en deleteById: ", err);
            throw err;
        }
    }

    async updateById(id, udapte_data) {
        try {
            this.knex(this.table).where("id", id)
            if (this.table === "messages") {
                await this.knex(this.table)
                    .where("id", id)
                    .update({ newMsj: udapte_data });
            } else if (this.table === "productos") {
                await this.knex(this.table).where("id", id).update({
                    nombre: udapte_data.nombre,
                    descripcion: udapte_data.nombre,
                    precio: udapte_data,
                    foto: udapte_data,
                    stock: udapte_data,
                });
            }
        }
        catch (err) {
            console.log("Error en updateById: ", err);
            throw err;
        }
    }
}

module.exports = Contenedor;