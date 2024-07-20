import { Router } from "express";
import { promises as fs } from 'fs';
import { fileURLToPath  } from "url";
import path from 'path';

const routerDirector = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const directorsFilePath = path.join(_dirname, "../../data/directors.json");

const getDirectors = async () => {
    try {
        const directors = await fs.readFile(directorsFilePath);
        if (!directors.length) {
            return [];
        };        
        return JSON.parse(directors);
    } catch (error) {
        console.log(error);
        throw new Error('Failed to get directors: ', error);
        
    }
}

const writeDirectors = async (director) => {
    try {
        await fs.writeFile(directorsFilePath, JSON.stringify(director, null, 2));
    } catch (error) {
        throw new Error('Failed to create director: ', error);
    }
}

//create new director
routerDirector.post("/", async (req, res) => {
    const directors = await getDirectors();
    const newDirector = {
        id: directors.length +1,
        name: req.body.name,
        genres: req.body.genres,
        famousAnimes: req.body.famousAnimes
    };
    directors.push(newDirector);
    await writeDirectors(directors);
    res.status(201).json({ message: 'director creado con éxito', director: newDirector });
});

//get all directors
routerDirector.get("/", async (req, res) => {
    const directors = await getDirectors();
    res.json(directors);
});

//get one director by id
routerDirector.get("/:id", async (req, res) => {
    const directors = await getDirectors();
    const director = directors.find(director => director.id === parseInt(req.params.id));
    if (!director) {
        return res.status(404).json({ message: 'director no encontrado' });
    }
    res.json(director);
});

routerDirector.put("/:id", async (req, res) => {
    const directors = await getDirectors();
    const directorIndex = directors.findIndex(director => director.id === parseInt(req.params.id));
    if (directorIndex === -1) {
        return res.status(404).json({ message: "director no encontrado" });
    }
    const updatedDirector = {
        id: directors[directorIndex].id,
        name: req.body.name,
        genres: req.body.genres,
        famousAnimes: req.body.famousAnimes
    }

    directors[directorIndex] = updatedDirector;
    await writeDirectors(directors);
    res.json({ message: 'director actualizado con éxito', director: updatedDirector });
});

routerDirector.delete('/:id', async (req, res) => {
    const directors = await getDirectors();
    const directorIndex = directors.findIndex(director => director.id === parseInt(req.params.id));
    if (directorIndex === -1) {
        return res.status(404).json({ message: 'director no encontrado' });
    };
    const deletedDirector = directors.splice(directorIndex, 1);
    await writeDirectors(directors);
    res.json({ message: 'El director ha sido eliminado', director: deletedDirector });
});

export default routerDirector;