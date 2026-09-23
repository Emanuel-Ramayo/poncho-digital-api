import { z } from "zod";

export const artesanoSchema = z.object({
    nombre: z.string().trim().min(1, {
        message: "El nombre es obligatorio"
    }),

    especialidad: z.string().trim().min(1, {
        message: "La especialidad es obligatoria"
    }),

    provincia: z.string().trim().min(1, {
        message: "La provincia es obligatoria"
    }),

    localidad: z.string().trim().min(1, {
        message: "La localidad es obligatoria"
    })
});

export const consultarArtesanosSchema = z.object({
    nombre: z.string().trim().min(1, {
        message: "El nombre es obligatorio"
    }).optional(),

    especialidad: z.string().trim().min(1, {
        message: "La especialidad es obligatoria"
    }).optional(),

    provincia: z.string().trim().min(1, {
        message: "La provincia es obligatoria"
    }).optional(),

    localidad: z.string().trim().min(1, {
        message: "La localidad es obligatoria"
    }).optional(),

    pagina: z.coerce.number()
        .int()
        .positive()
        .default(1),

    limite: z.coerce.number()
        .int()
        .min(1)
        .max(50)
        .default(10),

    ordenPor: z.enum([
        "id",
        "nombre",
        "especialidad",
        "provincia",
        "localidad",
        "createdAt"
    ]).default("id"),

    direccion: z.enum([
        "asc",
        "desc"
    ]).default("asc")
});
