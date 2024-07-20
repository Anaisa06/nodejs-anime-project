import { Router } from "express";
import { promises as fs } from 'fs';
import { fileURLToPath  } from "url";
import path from 'path';

const routerAnime = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const animesFilePath = path.join(_dirname, "../../data/animes.json");

const getAnimes = async () => {
    try {
        const animes = await fs.readFile(animesFilePath);
        if (!animes.length) {
            return [];
        };        
        return JSON.parse(animes);
    } catch (error) {
        console.log(error);
        throw new Error('Failed to get animes: ', error);
        
    }
}

const createAnime = async (anime) => {
    try {
        await fs.writeFile(animesFilePath, JSON.stringify(anime, null, 2));
    } catch (error) {
        throw new Error('Failed to create anime: ', error);
    }
}

//create new anime
routerAnime.post("/", async (req, res) => {
    const animes = await getAnimes();
    const newAnime = {
        id: animes.length +1,
        title: req.body.title,
        genre: req.body.genre
    };
    animes.push(newAnime);
    await createAnime(animes);
    res.status(201).json({ message: 'Anime creado con éxito', anime: newAnime });
});

//get all animes
routerAnime.get("/", async (req, res) => {
    const animes = await getAnimes();
    res.json(animes);
});

//get one anime by id
routerAnime.get("/:id", async (req, res) => {
    const animes = await getAnimes();
    const anime = animes.find(anime => anime.id === parseInt(req.params.id));
    if (!anime) {
        return res.status(404).json({ message: 'Anime no encontrado' });
    }
    res.json(anime);
});

routerAnime.put("/:id", async (req, res) => {
    const animes = await getAnimes();
    const animeIndex = animes.findIndex(anime => anime.id === parseInt(req.params.id));
    if (animeIndex === -1) {
        return res.status(404).json({ message: "Anime no encontrado" });
    }
    const updatedAnime = {
        id: animes[animeIndex].id,
        title: req.body.title,
        genre: req.body.genre
    }

    animes[animeIndex] = updatedAnime;
    await createAnime(animes);
    res.json({ message: 'Anime actualizado con éxito', anime: updatedAnime });
});

routerAnime.delete('/:id', async (req, res) => {
    const animes = await getAnimes();
    const animeIndex = animes.findIndex(anime => anime.id === parseInt(req.params.id));
    if (animeIndex === -1) {
        return res.status(404).json({ message: 'Anime no encontrado' });
    };
    const deleteAnime = animes.splice(animeIndex, 1);
    await createAnime(animes);
    res.json({ message: 'El anime ha sido eliminado' });
});

export default routerAnime;