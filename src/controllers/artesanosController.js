import {
    listarArtesanos as listarArtesanosService,
    obtenerArtesano as obtenerArtesanoService,
    crearArtesano as crearArtesanoService,
    actualizarArtesano as actualizarArtesanoService,
    eliminarArtesano as eliminarArtesanoService
} from "../services/artesanosService.js";

import { crearError } from "../utils/errores.js";

// GET /artesanos
export const listarArtesanos = async (req, res, next) => {
    try {
        const resultado = await listarArtesanosService(
            req.queryValidada
        );

        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

// POST /artesanos
export const crearArtesano = async (req, res, next) => {
    try {
        const artesano = await crearArtesanoService(req.body);

        res.status(201).json(artesano);
    } catch (error) {
        next(error);
    }
};

// GET /artesanos/:id
export const obtenerArtesano = async (req, res, next) => {
    try {
        const id = req.id;

        const artesano = await obtenerArtesanoService(id);

        if (!artesano) {
            return next(
                crearError("Artesano no encontrado", 404)
            );
        }

        res.json(artesano);
    } catch (error) {
        next(error);
    }
};

// PUT /artesanos/:id
export const actualizarArtesano = async (req, res, next) => {
    try {
        const id = req.id;

        const artesano = await actualizarArtesanoService(
            id,
            req.body
        );

        res.json(artesano);
    } catch (error) {
        if (error.code === "P2025") {
            return next(
                crearError("Artesano no encontrado", 404)
            );
        }

        next(error);
    }
};

// DELETE /artesanos/:id
export const eliminarArtesano = async (req, res, next) => {
    try {
        const id = req.id;

        await eliminarArtesanoService(id);

        res.json({
            mensaje: "Artesano eliminado correctamente"
        });
    } catch (error) {
        if (error.code === "P2025") {
            return next(
                crearError("Artesano no encontrado", 404)
            );
        }

        next(error);
    }
};

