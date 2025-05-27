import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

// Rota GET para buscar todos os usuários
app.get("/usuarios", async (req, res) => {
	try {
		const users = await prisma.user.findMany();
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Rota POST para criar um novo usuário
app.post("/usuarios", async (req, res) => {
	try {
		const { email, age, name } = req.body;

		if (!email || !age || !name) {
			return res
				.status(400)
				.json({ error: "Todos os campos são obrigatórios" });
		}

		if (age < 18) {
			return res.status(400).json({ error: "Apenas maiores de 18 anos" });
		}

		const user = await prisma.user.create({
			data: { email, age, name },
		});

		res.status(201).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Rota PUT para atualizar um usuário
app.put("/usuarios/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { email, age, name } = req.body;

		// Verificar se o email já existe em outro usuário
		if (email) {
			const existingUserWithEmail = await prisma.user.findUnique({
				where: { email },
			});

			// Se o email já existe e não pertence ao usuário que está sendo atualizado
			if (existingUserWithEmail && existingUserWithEmail.id !== id) {
				return res
					.status(409)
					.json({ error: "Este email já está em uso por outro usuário" });
			}
		}

		// Atualizar o usuário
		const user = await prisma.user.update({
			where: { id },
			data: {
				...(email && { email }),
				...(age && { age }),
				...(name && { name }),
			},
		});

		res.status(200).json(user);
	} catch (err) {
		// Tratar erro de ID não encontrado
		if (err.code === "P2025") {
			return res.status(404).json({ error: "Usuário não encontrado" });
		}
		res.status(500).json({ error: err.message });
	}
});

// Rota DELETE para remover um usuário
app.delete("/usuarios/:id", async (req, res) => {
	try {
		const { id } = req.params;

		// Primeiro, busca o usuário para pegar o nome
		const usuarioParaDeletar = await prisma.user.findUnique({
			where: { id },
		});

		// Se o usuário não existir, retorna um erro
		if (!usuarioParaDeletar) {
			return res.status(404).json({ error: "Usuário não encontrado" });
		}

		await prisma.user.delete({
			where: { id }, // Também usa o id diretamente, sem conversão
		});

		res.status(200).json({ message: "Usuário deletado com sucesso" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
	console.log("Servidor rodando em http://localhost:3000");
});
