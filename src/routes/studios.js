import { Router } from "express";
import { promises as fs } from 'fs';
import { fileURLToPath  } from "url";
import path from 'path';

const routerStudios = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const studiosFilePath = path.join(_dirname, "../../data/studios.json");

const getStudios = async () => {
    try {
        const studios = await fs.readFile(studiosFilePath);
        if (!studios.length) {
            return [];
        };        
        return JSON.parse(studios);
    } catch (error) {
        console.log(error);
        throw new Error('Failed to get studios: ', error);
        
    }
}

const writeStudios = async (studio) => {
    try {
        await fs.writeFile(studiosFilePath, JSON.stringify(studio, null, 2));
    } catch (error) {
        throw new Error('Failed to create studio: ', error);
    }
}

//create new studio
routerStudios.post("/", async (req, res) => {
    const studios = await getStudios();
    const newStudio = {
        id: studios.length +1,
        name: req.body.name,
        genres: req.body.genres,
        famousAnimes: req.body.famousAnimes
    };
    studios.push(newStudio);
    await writeStudios(studios);
    res.status(201).json({ message: 'studio creado con éxito', studio: newStudio });
});

//get all studios
routerStudios.get("/", async (req, res) => {
    const studios = await getStudios();
    res.json(studios);
});

//get one studio by id
routerStudios.get("/:id", async (req, res) => {
    const studios = await getStudios();
    const studio = studios.find(studio => studio.id === parseInt(req.params.id));
    if (!studio) {
        return res.status(404).json({ message: 'studio no encontrado' });
    }
    res.json(studio);
});

routerStudios.put("/:id", async (req, res) => {
    const studios = await getStudios();
    const studioIndex = studios.findIndex(studio => studio.id === parseInt(req.params.id));
    if (studioIndex === -1) {
        return res.status(404).json({ message: "studio no encontrado" });
    }
    const updatedStudio = {
        id: studios[studioIndex].id,
        name: req.body.name,
        genres: req.body.genres,
        famousAnimes: req.body.famousAnimes
    }

    studios[studioIndex] = updatedStudio;
    await writeStudios(studios);
    res.json({ message: 'studio actualizado con éxito', studio: updatedStudio });
});

routerStudios.delete('/:id', async (req, res) => {
    const studios = await getStudios();
    const studioIndex = studios.findIndex(studio => studio.id === parseInt(req.params.id));
    if (studioIndex === -1) {
        return res.status(404).json({ message: 'studio no encontrado' });
    };
    const deletedStudio = studios.splice(studioIndex, 1);
    await writeStudios(studios);
    res.json({ message: 'El studio ha sido eliminado', studio: deletedStudio });
});

export default routerStudios;